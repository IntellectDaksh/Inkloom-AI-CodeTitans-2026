import { NextRequest, NextResponse } from "next/server";
import { getMe, supabaseAdmin } from "@/lib/auth/server";
import { BUCKET } from "@/lib/files/server";
import { rateLimit } from "@/lib/rateLimit";

const fail = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

/**
 * DELETE /api/org { confirmName } — admin only. Permanently deletes the caller's organisation:
 * its app_state document, invites, uploaded evidence files and the organizations row (api_keys and
 * memberships cascade). Every member is first moved to another organisation they already belong to,
 * or to a fresh empty personal one as its admin, so no login breaks.
 * audit_log rows are kept: the table is append-only (a trigger refuses deletes even for the service
 * role) and has no foreign key, so the org's audit trail outlives the org by design.
 */
export async function DELETE(req: NextRequest) {
  const me = await getMe();
  if (!me) return fail("Sign in to do this.", 401);
  if (me.role !== "admin") return fail("Only an admin can delete the organisation.", 403);
  if (!(await rateLimit(`orgdelete:u:${me.id}`, 5, 3600))) return fail("Too many attempts. Try again later.", 429);
  const body = (await req.json().catch(() => ({}))) as { confirmName?: unknown };
  const admin = supabaseAdmin();
  const orgId = me.organizationId;

  const { data: org, error: orgErr } = await admin.from("organizations").select("id, name").eq("id", orgId).maybeSingle();
  if (orgErr) return fail("The database is unreachable right now. Try again in a moment.", 503);
  if (!org) return fail("Organisation not found.", 404);
  if (typeof body.confirmName !== "string" || body.confirmName.trim() !== String(org.name).trim()) {
    return fail("Type the organisation name exactly to confirm.", 400);
  }

  try {
    // 1. Re-home every member before the org row goes (profiles.organization_id cascades on delete).
    const { data: members, error: mErr } = await admin.from("profiles").select("id, full_name, email").eq("organization_id", orgId);
    if (mErr) throw new Error(mErr.message);
    for (const m of members ?? []) {
      const { data: other } = await admin.from("memberships").select("organization_id, role").eq("user_id", m.id).neq("organization_id", orgId).order("created_at").limit(1).maybeSingle();
      if (other) {
        const { error } = await admin.from("profiles").update({ organization_id: other.organization_id, role: other.role }).eq("id", m.id);
        if (error) throw new Error(error.message);
        continue;
      }
      const id = "org_" + crypto.randomUUID().replace(/-/g, "");
      const name = m.full_name || String(m.email ?? "").split("@")[0] || "My";
      const { error: oErr } = await admin.from("organizations").insert({ id, name: `${name}'s company`, created_by: m.id });
      if (oErr) throw new Error(oErr.message);
      const { error: pErr } = await admin.from("profiles").update({ organization_id: id, role: "admin" }).eq("id", m.id);
      if (pErr) {
        await admin.from("organizations").delete().eq("id", id);
        throw new Error(pErr.message);
      }
      await admin.from("memberships").upsert({ user_id: m.id, organization_id: id, role: "admin" }, { onConflict: "user_id,organization_id" });
    }

    // 2. Uploaded originals referenced by the document (Storage has no FK to clean up after us).
    const { data: doc } = await admin.from("app_state").select("data").eq("id", orgId).maybeSingle();
    const paths = (((doc?.data as { stored_files?: { path?: string }[] } | null)?.stored_files) ?? []).map((f) => f.path).filter((p): p is string => !!p);
    for (let i = 0; i < paths.length; i += 100) {
      const { error } = await admin.storage.from(BUCKET).remove(paths.slice(i, i + 100));
      if (error) console.error("org delete: evidence cleanup failed", error.message);
    }

    // 3. Org data, then the org itself.
    for (const t of ["app_state", "invites"] as const) {
      const { error } = await admin.from(t).delete().eq(t === "app_state" ? "id" : "organization_id", orgId);
      if (error) throw new Error(error.message);
    }
    const { error: dErr } = await admin.from("organizations").delete().eq("id", orgId);
    if (dErr) throw new Error(dErr.message);
    return NextResponse.json({ success: true, membersMoved: members?.length ?? 0 });
  } catch (err) {
    console.error("org delete failed", (err as Error).message);
    return fail("Could not finish deleting the organisation. Members already moved keep their new workspace; try again to finish.", 500);
  }
}
