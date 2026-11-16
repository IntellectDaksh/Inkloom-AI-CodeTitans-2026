import { supabaseAdmin } from "@/lib/auth/server";
import type { AppRole } from "./rbac";

export const REVIEW_ROLES: AppRole[] = ["reviewer", "brand_manager", "admin"];

export interface Member { id: string; name: string; role: AppRole }

/** Members of one organisation, read with the service role so the caller's org is the only filter. */
export async function orgMembers(orgId: string): Promise<Member[]> {
  if (!orgId) return [];
  const { data, error } = await supabaseAdmin().from("profiles").select("id, full_name, email, role").eq("organization_id", orgId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((p) => ({ id: p.id as string, name: (p.full_name as string) || String(p.email ?? "").split("@")[0] || "Member", role: (p.role as AppRole) ?? "creator" }));
}
