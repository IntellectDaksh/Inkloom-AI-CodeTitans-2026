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
const makeAdmin = (key: string) =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false, autoRefreshToken: false } });
let adminClient: ReturnType<typeof makeAdmin> | null = null;
/** One shared service-role client per server instance (it holds no user session, so reuse is safe). */
export function supabaseAdmin() {
  if (adminClient) return adminClient;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  adminClient = makeAdmin(key);
  return adminClient;
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
/** True when the user has two-factor set up but this session hasn't passed it yet (aal1 of aal2). */
export async function needsMfa(sb: Awaited<ReturnType<typeof supabaseServer>>): Promise<boolean> {
  try {
    const { data } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    return data?.nextLevel === "aal2" && data.currentLevel !== "aal2";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Per-instance caches. Every API call used to ask Supabase Auth who the user is and re-read their
// profile; now both are reused for a few seconds. Keyed by the session cookie / user id, cleared
// when a profile changes (forgetProfile), so roles and org switches show up immediately here.
// ponytail: per instance and short-lived; a revoked session is honoured for at most USER_TTL_MS.
// ---------------------------------------------------------------------------
const USER_TTL_MS = 20_000;
const PROFILE_TTL_MS = 10_000;
type AuthUser = { id: string; email?: string | null };
const userCache = new Map<string, { user: AuthUser | null; exp: number }>();
const profileCache = new Map<string, { row: ProfileRow | null; exp: number }>();
export interface ProfileRow {
  full_name: string | null; bio: string | null; avatar_url: string | null; role: string | null;
  organization_id: string | null; job_title: string | null; profile_completed_at: string | null; prefs: Record<string, unknown> | null;
}
const trim = <K, V>(m: Map<K, V>) => { if (m.size > 500) m.delete(m.keys().next().value as K); };

/** The signed-in user for this request's session cookie (cached briefly), or null. */
export async function sessionUser(sb?: Awaited<ReturnType<typeof supabaseServer>>): Promise<AuthUser | null> {
  const store = await cookies();
  const token = store.getAll().filter((c) => /^sb-.*-auth-token/.test(c.name)).map((c) => c.value).join("|");
  if (!token) return null;
  const hit = userCache.get(token);
  if (hit && hit.exp > Date.now()) return hit.user;
  const client = sb ?? (await supabaseServer());
  const { data } = await client.auth.getUser().catch(() => ({ data: { user: null } }));
  const user = data.user ? { id: data.user.id, email: data.user.email } : null;
  userCache.set(token, { user, exp: Date.now() + USER_TTL_MS });
  trim(userCache);
  return user;
}

/** A user's profile row (service role, filtered to that id), cached briefly. */
export async function profileRow(userId: string): Promise<ProfileRow | null> {
  const hit = profileCache.get(userId);
  if (hit && hit.exp > Date.now()) return hit.row;
  const { data } = await supabaseAdmin()
    .from("profiles")
    .select("full_name, bio, avatar_url, role, organization_id, job_title, profile_completed_at, prefs")
    .eq("id", userId)
    .maybeSingle();
  const row = (data as ProfileRow | null) ?? null;
  profileCache.set(userId, { row, exp: Date.now() + PROFILE_TTL_MS });
  trim(profileCache);
  return row;
}

/** Call after any write to a profile so this instance stops serving the old copy. */
export function forgetProfile(userId: string): void {
  profileCache.delete(userId);
}

export async function getMe(): Promise<Me | null> {
  const sb = await supabaseServer();
  const user = await sessionUser(sb);
  if (!user) return null;
  // Two-factor users count as signed out for every API until the code step is done.
  if (await needsMfa(sb)) return null;
  const p = await profileRow(user.id);
  return {
    id: user.id,
    email: user.email ?? "",
    name: p?.full_name || user.email?.split("@")[0] || "You",
    bio: p?.bio ?? "",
    avatarUrl: p?.avatar_url ?? null,
    role: (p?.role as AppRole) ?? "creator",
    organizationId: p?.organization_id ?? "",
    profileComplete: !!p?.profile_completed_at,
    jobTitle: p?.job_title ?? "",
    prefs: p?.prefs ?? {},
    isOwner: (process.env.OWNER_EMAILS ?? "").toLowerCase().split(",").map((x) => x.trim()).includes((user.email ?? "").toLowerCase()),
  };
}

const keyTouched = new Map<string, number>();

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
  if ((keyTouched.get(data.id) ?? 0) < Date.now() - 5 * 60_000) {
    keyTouched.set(data.id, Date.now());
    await admin.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  }
  return { id: data.id as string, organizationId: data.organization_id as string };
}
