import { NextRequest, NextResponse } from "next/server";
import { withStore } from "@/lib/db/withStore";
import { db } from "@/lib/db";
import { getMe, supabaseAdmin, forgetProfile } from "@/lib/auth/server";
import { rateLimit } from "@/lib/rateLimit";
import { teamAudit } from "./audit";

const fail = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

/** Members (with last sign-in and per-member stats), pending invites, org name, recent team audit. Org always comes from getMe(). */
async function GET_handler() {
  const me = await getMe();
  if (!me) return fail("Not signed in", 401);
  const admin = supabaseAdmin();
  const isAdmin = me.role === "admin";
  const [{ data: org }, { data: profiles, error }, invites, audit] = await Promise.all([
    admin.from("organizations").select("id, name, created_at").eq("id", me.organizationId).maybeSingle(),
    admin.from("profiles").select("id, email, full_name, bio, avatar_url, role, job_title, created_at").eq("organization_id", me.organizationId).order("created_at"),
    isAdmin ? admin.from("invites").select("email, role, invited_by, created_at").eq("organization_id", me.organizationId).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
    admin.from("audit_log").select("id, user_id, entity_id, action, metadata, created_at").eq("organization_id", me.organizationId).eq("entity_type", "member").order("created_at", { ascending: false }).limit(20),
  ]);
  if (error) return fail(error.message, 500);

  // Per-member stats from the organisation's own document.
  const st = db.getState();
  const checks = new Map<string, number>(), approvals = new Map<string, number>();
  st.audit_events.forEach((e) => { if (e.action === ("run_analysis" as typeof e.action) && e.user_id) checks.set(e.user_id, (checks.get(e.user_id) ?? 0) + 1); });
  st.approval_decisions.forEach((d) => { if (d.decision === "approved") approvals.set(d.decided_by, (approvals.get(d.decided_by) ?? 0) + 1); });

  // ponytail: one getUserById per member; fine for small teams, switch to listUsers paging past ~50 seats.
  const lastActive = await Promise.all((profiles ?? []).map((p) =>
    admin.auth.admin.getUserById(p.id).then((r) => r.data.user?.last_sign_in_at ?? null).catch(() => null)));

  const names = new Map((profiles ?? []).map((p) => [p.id, p.full_name || p.email || "Someone"]));
  return NextResponse.json({
    success: true,
    me: { id: me.id, role: me.role },
    organization: { id: me.organizationId, name: org?.name ?? "My company", createdAt: org?.created_at ?? null },
    members: (profiles ?? []).map((p, i) => ({
      ...p, email: isAdmin || p.id === me.id ? p.email : null,
      lastSignInAt: lastActive[i], checksRun: checks.get(p.id) ?? 0, approvalsGiven: approvals.get(p.id) ?? 0,
    })),
    invites: (invites.data ?? []).map((v) => ({ ...v, invitedByName: v.invited_by ? names.get(v.invited_by) ?? "Former member" : null })),
    audit: (audit.data ?? []).map((a) => ({ ...a, actorName: names.get(a.user_id) ?? "Former member", targetName: names.get(a.entity_id) ?? (a.metadata as { name?: string })?.name ?? a.entity_id })),
  });
}

/** Moves a user into a brand-new personal organisation as its admin, so their login keeps working. */
async function moveToPersonalOrg(userId: string, name: string) {
  const admin = supabaseAdmin();
  const id = "org_" + crypto.randomUUID().replace(/-/g, "");
  const { error: oErr } = await admin.from("organizations").insert({ id, name: `${name}'s company`, created_by: userId });
  if (oErr) throw new Error(oErr.message);
  const { error } = await admin.from("profiles").update({ organization_id: id, role: "admin" }).eq("id", userId);
  forgetProfile(userId);
  if (error) {
    await admin.from("organizations").delete().eq("id", id);
    throw new Error(error.message);
  }
  return id;
}

async function adminCount(orgId: string) {
  const { count } = await supabaseAdmin().from("profiles").select("id", { count: "exact", head: true }).eq("organization_id", orgId).eq("role", "admin");
  return count ?? 0;
}

async function POST_handler(req: NextRequest) {
  const me = await getMe();
  if (!me) return fail("Not signed in", 401);
  const body = (await req.json().catch(() => ({}))) as { action?: string; userId?: string; email?: string; name?: string };
  const admin = supabaseAdmin();
  const isAdmin = me.role === "admin";
  try {
    switch (body.action) {
      case "rename": {
        if (!isAdmin) return fail("Only admins can rename the organisation.", 403);
        const name = body.name?.trim();
        if (!name || name.length > 80) return fail("Name must be 1 to 80 characters.", 400);
        const { error } = await admin.from("organizations").update({ name }).eq("id", me.organizationId);
        if (error) return fail(error.message, 500);
        await teamAudit(me.organizationId, me.id, "org_renamed", me.organizationId, { name });
        return NextResponse.json({ success: true });
      }
      case "remove": {
        if (!isAdmin) return fail("Only admins can remove people.", 403);
        if (!body.userId) return fail("userId is required.", 400);
        if (body.userId === me.id) return fail("You can't remove yourself. Use Leave organisation instead.", 400);
        const { data: target } = await admin.from("profiles").select("id, role, full_name, email").eq("id", body.userId).eq("organization_id", me.organizationId).maybeSingle();
        if (!target) return fail("That person isn't in this organisation.", 404);
        if (target.role === "admin" && (await adminCount(me.organizationId)) <= 1) return fail("You can't remove the last admin.", 400);
        const name = target.full_name || target.email?.split("@")[0] || "Former member";
        await moveToPersonalOrg(target.id, name);
        await teamAudit(me.organizationId, me.id, "member_removed", target.id, { name, role: target.role });
        return NextResponse.json({ success: true });
      }
      case "leave": {
        const { count } = await admin.from("profiles").select("id", { count: "exact", head: true }).eq("organization_id", me.organizationId);
        if ((count ?? 0) <= 1) return fail("You're the only member. There's no one to leave the organisation to.", 400);
        if (isAdmin && (await adminCount(me.organizationId)) <= 1) return fail("You're the last admin. Make someone else an admin first.", 400);
        await teamAudit(me.organizationId, me.id, "member_left", me.id, { name: me.name, role: me.role });
        await moveToPersonalOrg(me.id, me.name);
        return NextResponse.json({ success: true });
      }
      case "revoke": {
        if (!isAdmin) return fail("Only admins can revoke invites.", 403);
        const email = body.email?.trim().toLowerCase();
        if (!email) return fail("email is required.", 400);
        const { data, error } = await admin.from("invites").delete().eq("email", email).eq("organization_id", me.organizationId).select("email");
        if (error) return fail(error.message, 500);
        if (!data?.length) return fail("No pending invite for that email.", 404);
        await teamAudit(me.organizationId, me.id, "invite_revoked", email, { name: email });
        return NextResponse.json({ success: true });
      }
      case "resend": {
        if (!isAdmin) return fail("Only admins can resend invites.", 403);
        const email = body.email?.trim().toLowerCase();
        if (!email) return fail("email is required.", 400);
        const { data: inv } = await admin.from("invites").select("email").eq("email", email).eq("organization_id", me.organizationId).maybeSingle();
        if (!inv) return fail("No pending invite for that email.", 404);
        if (!(await rateLimit(`invite:${me.id}`, 30, 86400))) return fail("Daily invite limit reached.", 429);
        const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
        const { error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: `${origin}/auth/callback?next=/dashboard` });
        if (error) return fail(/already/i.test(error.message) ? "The invite email was already sent and is still valid. Ask them to check spam." : "The invite email could not be sent. Try again.", 502);
        await admin.from("invites").update({ created_at: new Date().toISOString() }).eq("email", email).eq("organization_id", me.organizationId);
        await teamAudit(me.organizationId, me.id, "invite_resent", email, { name: email });
        return NextResponse.json({ success: true });
      }
      default:
        return fail("Unknown action.", 400);
    }
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Something went wrong", 500);
  }
}

export const GET = withStore(GET_handler);
export const POST = POST_handler;
