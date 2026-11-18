import { supabaseAdmin } from "@/lib/auth/server";

const blockedUntil = new Map<string, number>();

/**
 * Fixed-window counter in Postgres (public.rate_limit_hit), shared by every serverless instance.
 * Returns true if the call is allowed. Fails open only when Supabase isn't configured (local dev);
 * a database error fails closed so an outage can't become an unmetered AI bill.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SECRET_KEY) return true;
  // A key already over its limit stays blocked until the window ends: refuse locally, no database call.
  // (Under abuse this is most calls, so the database isn't hammered by the very traffic being refused.)
  const windowEnd = (Math.floor(Date.now() / 1000 / windowSeconds) + 1) * windowSeconds * 1000;
  const blocked = blockedUntil.get(key);
  if (blocked && blocked > Date.now()) return false;
  const { data, error } = await supabaseAdmin().rpc("rate_limit_hit", { p_key: key, p_limit: limit, p_window_seconds: windowSeconds });
  if (!error && data === false) {
    blockedUntil.set(key, windowEnd);
    if (blockedUntil.size > 5000) blockedUntil.delete(blockedUntil.keys().next().value as string);
  }
  if (error) {
    console.error("rate limit check failed", error.message);
    return false;
  }
  return data === true;
}
