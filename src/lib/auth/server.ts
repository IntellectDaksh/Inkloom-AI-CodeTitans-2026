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
}

/** The signed-in user with their stored profile, or null. Role always comes from public.profiles. */
export async function getMe(): Promise<Me | null> {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: p } = await sb.from("profiles").select("full_name, bio, avatar_url, role").eq("id", user.id).maybeSingle();
  return {
    id: user.id,
    email: user.email ?? "",
    name: p?.full_name || user.email?.split("@")[0] || "You",
    bio: p?.bio ?? "",
    avatarUrl: p?.avatar_url ?? null,
    role: (p?.role as AppRole) ?? "creator",
  };
}
