import { NextRequest, NextResponse } from "next/server";
import { getMe, supabaseAdmin } from "@/lib/auth/server";

/** An existing user accepts an invite addressed to their email: adds a membership and consumes the invite. */
export async function POST(req: NextRequest) {
  const me = await getMe();
  if (!me) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
  const { organizationId } = (await req.json().catch(() => ({}))) as { organizationId?: string };
  const admin = supabaseAdmin();
  const { data: inv } = await admin.from("invites").select("email, organization_id, role").ilike("email", me.email).maybeSingle();
  if (!inv || (organizationId && inv.organization_id !== organizationId)) {
    return NextResponse.json({ success: false, error: "No pending invite for your email." }, { status: 404 });
  }
  const { error } = await admin.from("memberships").upsert({ user_id: me.id, organization_id: inv.organization_id, role: inv.role }, { onConflict: "user_id,organization_id" });
  if (error) return NextResponse.json({ success: false, error: "Could not join. Try again." }, { status: 500 });
  await admin.from("invites").delete().eq("email", inv.email);
  return NextResponse.json({ success: true, organizationId: inv.organization_id });
}
