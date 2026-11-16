import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { AppRole } from "@/app/api/approvals/rbac";

export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // called from a Server Component: proxy.ts refreshes the session instead
        }
      },
    },
  });
}

/** Service-role client. Server only, bypasses RLS: callers must authorise first. */
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export interface Me {
  id: string;
  email: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
  role: AppRole;
  organizationId: string;
  profileComplete: boolean;
  jobTitle: string;
  prefs: Record<string, unknown>;
  /** Site owner (OWNER_EMAILS env): sees the feedback inbox. */
  isOwner: boolean;
}

/** The signed-in user with their stored profile, or null. Role always comes from public.profiles. */
export async function getMe(): Promise<Me | null> {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: p } = await sb.from("profiles").select("full_name, bio, avatar_url, role, organization_id, job_title, profile_completed_at, prefs").eq("id", user.id).maybeSingle();
  return {
    id: user.id,
    email: user.email ?? "",
    name: p?.full_name || user.email?.split("@")[0] || "You",
    bio: p?.bio ?? "",
    avatarUrl: p?.avatar_url ?? null,
    role: (p?.role as AppRole) ?? "creator",
    organizationId: (p?.organization_id as string) ?? "",
    profileComplete: !!p?.profile_completed_at,
    jobTitle: (p?.job_title as string) ?? "",
    prefs: (p?.prefs as Record<string, unknown>) ?? {},
    isOwner: (process.env.OWNER_EMAILS ?? "").toLowerCase().split(",").map((x) => x.trim()).includes((user.email ?? "").toLowerCase()),
  };
}

export const API_KEY_RE = /^ask_live_[A-Za-z0-9_-]{32}$/;

export async function hashApiKey(key: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Resolves an `Authorization: Bearer ask_live_...` header to its key row, or null if missing/invalid/revoked. */
export async function apiKeyFromRequest(req: Request): Promise<{ id: string; organizationId: string } | null> {
  const key = req.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!key || !API_KEY_RE.test(key)) return null;
  const admin = supabaseAdmin();
  const { data } = await admin.from("api_keys").select("id, organization_id").eq("key_hash", await hashApiKey(key)).is("revoked_at", null).maybeSingle();
  if (!data) return null;
  await admin.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return { id: data.id as string, organizationId: data.organization_id as string };
}
