import { NextRequest, NextResponse } from "next/server";
import { getMe, supabaseAdmin, forgetProfile } from "@/lib/auth/server";

/** Make another organisation the caller's current one. Membership is checked here, never trusted from the client. */
export async function POST(req: NextRequest) {
  const me = await getMe();
  if (!me) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
  const { organizationId } = (await req.json().catch(() => ({}))) as { organizationId?: string };
  if (typeof organizationId !== "string" || !organizationId) return NextResponse.json({ success: false, error: "Pick an organisation." }, { status: 400 });
  const admin = supabaseAdmin();
  const { data: m } = await admin.from("memberships").select("role").eq("user_id", me.id).eq("organization_id", organizationId).maybeSingle();
  if (!m) return NextResponse.json({ success: false, error: "You are not a member of that organisation." }, { status: 403 });
  const { error } = await admin.from("profiles").update({ organization_id: organizationId, role: m.role }).eq("id", me.id);
  forgetProfile(me.id);
  if (error) return NextResponse.json({ success: false, error: "Could not switch. Try again." }, { status: 500 });
  return NextResponse.json({ success: true });
}
