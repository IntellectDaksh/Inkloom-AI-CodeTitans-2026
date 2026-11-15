import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server only: uses the service role key.
export const BUCKET = "evidence";
export const MAX_FILE_BYTES = 15 * 1024 * 1024;

let client: SupabaseClient | null = null;
/** Service-role client for Storage. Null when the server has no Supabase credentials. */
export function storage(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return (client ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }));
}
