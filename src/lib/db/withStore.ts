import { NextRequest, NextResponse } from "next/server";
import { flushToRemote, runWithStore, StoreConflictError, syncFromRemote } from "./store";
import { apiKeyFromRequest, needsMfa, supabaseAdmin, supabaseServer } from "@/lib/auth/server";
import { rateLimit } from "@/lib/rateLimit";
import { reportError } from "@/lib/ops/errors";

type Handler<A extends unknown[]> = (...args: A) => Promise<Response> | Response;

interface Opts {
  /** Allow signed-out callers (they get seed data, never persisted). */
  public?: boolean;
  /** Per-hour request budget for this route: [signed-out, signed-in]. */
  limit?: [number, number];
  name?: string;
  /** Authenticate with `Authorization: Bearer ask_live_...` instead of the session; org comes from the key. 60/h per key. */
  apiKey?: boolean;
}

const MAX_ATTEMPTS = 3;

/** Organisation id of the signed-in user, from public.profiles (service role, so RLS can't hide it). */
async function orgOf(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin().from("profiles").select("organization_id").eq("id", userId).maybeSingle();
  return (data?.organization_id as string) ?? null;
}

/**
 * Wraps an API route: authenticates, loads the caller's organisation document, runs the handler in an
 * isolated per-request context, and saves with compare-and-swap. On a concurrent write the handler is
 * re-run against fresh data (with a fresh copy of the request body) instead of overwriting the other save.
 */
export function withStore<A extends unknown[]>(handler: Handler<A>, opts: Opts = {}): Handler<A> {
  return async (...args: A) => {
    if (opts.apiKey) return withApiKey(handler, args);
    const sb = await supabaseServer();
    // No Supabase auth cookie means no session: skip the auth server round trip for anonymous calls.
    const hasSession = /(?:^|;\s*)sb-[^=]*-auth-token/.test((args[0] as Request)?.headers?.get?.("cookie") ?? "");
    const { data: { user: sessionUser } } = hasSession
      ? await sb.auth.getUser().catch(() => ({ data: { user: null } }))
      : { data: { user: null } };
    // A session that still owes its two-factor code gets no data access.
    const mfaPending = !!sessionUser && (await needsMfa(sb));
    if (mfaPending && !opts.public) return NextResponse.json({ success: false, error: "Enter your two-factor code to continue.", mfa: true }, { status: 401 });
    const user = mfaPending ? null : sessionUser;
    if (!user && !opts.public) return NextResponse.json({ success: false, error: "Sign in to do this." }, { status: 401 });

    // Rate limit and organisation lookup are independent: run them together to save a round trip.
    const req = args[0] as Request;
    const ip = req?.headers?.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const [allowed, org] = await Promise.all([
      opts.limit ? rateLimit(`${opts.name ?? "api"}:${user ? `u:${user.id}` : `ip:${ip}`}`, user ? opts.limit[1] : opts.limit[0], 3600) : Promise.resolve(true),
      user ? orgOf(user.id).then((o) => ({ ok: true as const, o }), () => ({ ok: false as const, o: null })) : Promise.resolve({ ok: true as const, o: null }),
    ]);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: user ? "Hourly limit reached. Try again later." : "Free check limit reached. Create a free account for more checks." },
        { status: 429 },
      );
    }
    if (!org.ok) return NextResponse.json({ success: false, error: "The database is unreachable right now. Try again in a moment." }, { status: 503 });
    const orgId: string | null = org.o;
    if (user && !orgId) return NextResponse.json({ success: false, error: "Your account has no workspace yet. Sign out and in again." }, { status: 403 });

    return runLoop(handler, args, orgId, user?.id ?? null);
  };
}

async function withApiKey<A extends unknown[]>(handler: Handler<A>, args: A): Promise<Response> {
  let key: Awaited<ReturnType<typeof apiKeyFromRequest>>;
  try {
    key = await apiKeyFromRequest(args[0] as Request);
  } catch {
    return NextResponse.json({ success: false, error: "The database is unreachable right now. Try again in a moment." }, { status: 503 });
  }
  if (!key) return NextResponse.json({ success: false, error: "Missing, invalid or revoked API key." }, { status: 401 });
  if (!(await rateLimit(`apikey:${key.id}`, 60, 3600))) {
    return NextResponse.json({ success: false, error: "Hourly limit for this API key reached (60/h)." }, { status: 429 });
  }
  return runLoop(handler, args, key.organizationId, null);
}

async function runLoop<A extends unknown[]>(handler: Handler<A>, args: A, orgId: string | null, userId: string | null): Promise<Response> {
    // Buffer the body once so a retry after a write conflict can replay the request.
    // (NextRequest.clone() throws inside Next's request proxy, so rebuild instead.)
    const original = args[0] instanceof Request ? (args[0] as NextRequest) : null;
    const body = original && original.method !== "GET" && original.method !== "HEAD" ? await original.arrayBuffer() : null;
    const rebuild = () => new NextRequest(original!.url, { method: original!.method, headers: original!.headers, body });
    for (let attempt = 1; ; attempt++) {
      const callArgs = (original ? [rebuild(), ...args.slice(1)] : args) as A;
      const out = await runWithStore(async () => {
        try {
          await syncFromRemote(orgId);
        } catch {
          return NextResponse.json({ success: false, error: "The database is unreachable right now. Try again in a moment." }, { status: 503 });
        }
        const res = await handler(...callArgs);
        // Handlers catch their own errors and answer 500; record those so failures aren't silent.
        if (res.status >= 500) {
          const msg = await res.clone().json().then((j: { error?: string }) => j?.error).catch(() => null);
          await reportError({ source: "server", message: msg || `HTTP ${res.status}`, route: original ? `${original.method} ${new URL(original.url).pathname}` : null, userId, organizationId: orgId });
        }
        try {
          await flushToRemote();
        } catch (err) {
          if (err instanceof StoreConflictError) return "conflict" as const;
          return NextResponse.json({ success: false, error: "Your change could not be saved. Try again." }, { status: 503 });
        }
        return res;
      });
      if (out !== "conflict") return out;
      if (attempt >= MAX_ATTEMPTS) {
        return NextResponse.json({ success: false, error: "Someone else saved at the same moment. Try again." }, { status: 409 });
      }
    }
}
