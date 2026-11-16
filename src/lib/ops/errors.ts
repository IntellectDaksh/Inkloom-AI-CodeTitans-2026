import { supabaseAdmin } from "@/lib/auth/server";

export interface ErrorReport {
  source: "server" | "client";
  message: string;
  route?: string | null;
  digest?: string | null;
  stack?: string | null;
  userId?: string | null;
  organizationId?: string | null;
  userAgent?: string | null;
}

const cut = (s: string | null | undefined, n: number) => (s ? String(s).slice(0, n) : null);

/** Writes one row to public.error_events. Never throws: logging must not take a request down with it. */
export async function reportError(e: ErrorReport): Promise<void> {
  console.error(`[${e.source}] ${e.route ?? ""} ${e.message}`);
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SECRET_KEY) return;
  try {
    await supabaseAdmin().from("error_events").insert({
      source: e.source,
      message: cut(e.message, 1000) ?? "Unknown error",
      route: cut(e.route, 300),
      digest: cut(e.digest, 100),
      stack: cut(e.stack, 4000),
      user_id: e.userId ?? null,
      organization_id: e.organizationId ?? null,
      user_agent: cut(e.userAgent, 300),
    });
  } catch {
    // swallow: the console line above is the fallback
  }
}
