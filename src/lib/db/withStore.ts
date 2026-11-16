import { NextRequest, NextResponse } from "next/server";
import { flushToRemote, runWithStore, StoreConflictError, syncFromRemote } from "./store";
import { supabaseAdmin, supabaseServer } from "@/lib/auth/server";
import { rateLimit } from "@/lib/rateLimit";
import { reportError } from "@/lib/ops/errors";

type Handler<A extends unknown[]> = (...args: A) => Promise<Response> | Response;

interface Opts {
  /** Allow signed-out callers (they get seed data, never persisted). */
  public?: boolean;
  /** Per-hour request budget for this route: [signed-out, signed-in]. */
  limit?: [number, number];
  name?: string;
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
    const { data: { user } } = await (await supabaseServer()).auth.getUser().catch(() => ({ data: { user: null } }));
    if (!user && !opts.public) return NextResponse.json({ success: false, error: "Sign in to do this." }, { status: 401 });

    if (opts.limit) {
      const req = args[0] as Request;
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
      const key = `${opts.name ?? "api"}:${user ? `u:${user.id}` : `ip:${ip}`}`;
      if (!(await rateLimit(key, user ? opts.limit[1] : opts.limit[0], 3600))) {
        return NextResponse.json(
          { success: false, error: user ? "Hourly limit reached. Try again later." : "Free check limit reached. Create a free account for more checks." },
          { status: 429 },
        );
      }
    }

    let orgId: string | null = null;
    if (user) {
      try {
        orgId = await orgOf(user.id);
      } catch {
        return NextResponse.json({ success: false, error: "The database is unreachable right now. Try again in a moment." }, { status: 503 });
      }
      if (!orgId) return NextResponse.json({ success: false, error: "Your account has no workspace yet. Sign out and in again." }, { status: 403 });
    }

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
          await reportError({ source: "server", message: msg || `HTTP ${res.status}`, route: original ? `${original.method} ${new URL(original.url).pathname}` : null, userId: user?.id, organizationId: orgId });
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
  };
}
