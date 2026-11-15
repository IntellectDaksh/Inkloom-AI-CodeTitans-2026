import { NextRequest, NextResponse } from "next/server";
import { getMe, supabaseAdmin } from "@/lib/auth/server";
import { rateLimit } from "@/lib/rateLimit";

const ROLES = ["admin", "brand_manager", "reviewer", "creator"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Admin-only: invite someone into your organisation. The signup trigger reads public.invites
// and puts them in this organisation with this role instead of creating a new one.
export async function POST(req: NextRequest) {
  const me = await getMe();
  if (!me) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
  if (me.role !== "admin") return NextResponse.json({ success: false, error: "Only admins can invite people." }, { status: 403 });
  const { email, role } = (await req.json().catch(() => ({}))) as { email?: string; role?: string };
  const addr = email?.trim().toLowerCase();
  if (!addr || !EMAIL.test(addr)) return NextResponse.json({ success: false, error: "Enter a valid email address." }, { status: 400 });
  if (!role || !ROLES.includes(role)) return NextResponse.json({ success: false, error: "Pick a role." }, { status: 400 });
  if (!(await rateLimit(`invite:${me.id}`, 30, 86400))) {
    return NextResponse.json({ success: false, error: "Daily invite limit reached." }, { status: 429 });
  }

  const admin = supabaseAdmin();
  const { data: existing } = await admin.from("profiles").select("id").ilike("email", addr).maybeSingle();
  if (existing) return NextResponse.json({ success: false, error: "That person already has an AdSnitch account." }, { status: 409 });

  const { error: invErr } = await admin.from("invites").upsert({ email: addr, organization_id: me.organizationId, role, invited_by: me.id });
  if (invErr) return NextResponse.json({ success: false, error: "Could not save the invite. Try again." }, { status: 500 });

  const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const { error } = await admin.auth.admin.inviteUserByEmail(addr, { redirectTo: `${origin}/auth/callback?next=/dashboard` });
  if (error) {
    await admin.from("invites").delete().eq("email", addr);
    return NextResponse.json({ success: false, error: "The invite email could not be sent. Try again." }, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
