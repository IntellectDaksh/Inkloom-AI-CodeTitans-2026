import { supabaseAdmin } from "@/lib/auth/server";

/** Append a team-management event to the append-only audit_log. Logged, never thrown: the change itself already happened. */
export async function teamAudit(orgId: string, actorId: string, action: string, entityId: string, metadata: Record<string, unknown>) {
  const { error } = await supabaseAdmin().from("audit_log").insert({
    id: crypto.randomUUID(), organization_id: orgId, user_id: actorId, entity_type: "member", entity_id: entityId,
    action, metadata, created_at: new Date().toISOString(),
  });
  if (error) console.error("team audit failed", error.message);
}
