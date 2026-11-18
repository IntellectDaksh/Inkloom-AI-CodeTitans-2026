import { NextRequest, NextResponse } from "next/server";
import { getMe, supabaseServer, forgetProfile } from "@/lib/auth/server";

// GET: every profile (team list). PATCH: edit your own name / bio / avatar.
export async function GET() {
  const me = await getMe();
  if (!me) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
  const sb = await supabaseServer();
  const { data, error } = await sb.from("profiles").select("id, email, full_name, bio, avatar_url, role, created_at").order("created_at");
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, me, profiles: data });
}

export async function PATCH(req: NextRequest) {
  const me = await getMe();
  if (!me) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const patch: Record<string, string | null> = {};
  if (typeof body.full_name === "string") {
    const n = body.full_name.trim().replace(/\s+/g, " ");
    if (n.length < 1 || n.length > 80) return NextResponse.json({ success: false, error: "Use a name between 1 and 80 characters." }, { status: 400 });
    patch.full_name = n;
  }
  if (typeof body.bio === "string") {
    if (body.bio.length > 500) return NextResponse.json({ success: false, error: "Keep your bio under 500 characters." }, { status: 400 });
    patch.bio = body.bio.trim();
  }
  if (body.avatar_url === null || typeof body.avatar_url === "string") {
    const u = body.avatar_url as string | null;
    const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${me.id}/`;
    if (u !== null && !u.startsWith(base)) return NextResponse.json({ success: false, error: "Invalid avatar." }, { status: 400 });
    patch.avatar_url = u;
  }
  if (!Object.keys(patch).length) return NextResponse.json({ success: false, error: "Nothing to update." }, { status: 400 });
  const sb = await supabaseServer();
  const { error } = await sb.from("profiles").update(patch).eq("id", me.id);
  forgetProfile(me.id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, me: await getMe() });
}
