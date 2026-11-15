import { NextRequest, NextResponse } from "next/server";
import { getMe, supabaseAdmin } from "@/lib/auth/server";

const ROLES = ["admin", "brand_manager", "reviewer", "creator"];

// Admin-only role change. Uses the service role because users can't write profiles.role themselves.
export async function POST(req: NextRequest) {
  const me = await getMe();
  if (!me) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
  if (me.role !== "admin") return NextResponse.json({ success: false, error: "Only admins can change roles." }, { status: 403 });
  const { userId, role } = (await req.json().catch(() => ({}))) as { userId?: string; role?: string };
  if (!userId || !role || !ROLES.includes(role)) return NextResponse.json({ success: false, error: "userId and a valid role are required." }, { status: 400 });
  if (userId === me.id && role !== "admin") return NextResponse.json({ success: false, error: "You can't remove your own admin role. Ask another admin." }, { status: 400 });
  const { data, error } = await supabaseAdmin().from("profiles").update({ role }).eq("id", userId).eq("organization_id", me.organizationId).select("id, role").maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
  return NextResponse.json({ success: true, profile: data });
}
