import { supabaseAdmin } from "@/lib/auth/server";

/**
 * Fixed-window counter in Postgres (public.rate_limit_hit), shared by every serverless instance.
 * Returns true if the call is allowed. Fails open only when Supabase isn't configured (local dev);
 * a database error fails closed so an outage can't become an unmetered AI bill.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SECRET_KEY) return true;
  const { data, error } = await supabaseAdmin().rpc("rate_limit_hit", { p_key: key, p_limit: limit, p_window_seconds: windowSeconds });
  if (error) {
    console.error("rate limit check failed", error.message);
    return false;
  }
  return data === true;
}
