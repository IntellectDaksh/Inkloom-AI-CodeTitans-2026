import { NextResponse } from "next/server";
import { getMe, supabaseAdmin } from "@/lib/auth/server";

/** The caller's organisations plus any pending invites to their email. */
export async function GET() {
  const me = await getMe();
  if (!me) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
  const admin = supabaseAdmin();
  const [{ data: ms, error }, { data: inv }] = await Promise.all([
    admin.from("memberships").select("organization_id, role, organizations(name)").eq("user_id", me.id).order("created_at"),
    admin.from("invites").select("organization_id, role, organizations(name)").ilike("email", me.email),
  ]);
  if (error) return NextResponse.json({ success: false, error: "Could not load organisations." }, { status: 500 });
  const name = (o: unknown) => ((Array.isArray(o) ? o[0] : o) as { name?: string } | null)?.name ?? "Organisation";
  return NextResponse.json({
    success: true,
    currentId: me.organizationId,
    orgs: (ms ?? []).map((m) => ({ id: m.organization_id, role: m.role, name: name(m.organizations) })),
    invites: (inv ?? []).map((i) => ({ id: i.organization_id, role: i.role, name: name(i.organizations) })),
  });
}
