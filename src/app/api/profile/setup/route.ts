import { NextRequest, NextResponse } from "next/server";
import { getMe, supabaseAdmin } from "@/lib/auth/server";

// GET: what the setup form should prefill. POST: save the first-run profile and mark it complete.
export async function GET() {
  const me = await getMe();
  if (!me) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
  const { data: org } = await supabaseAdmin().from("organizations").select("name, created_by").eq("id", me.organizationId).maybeSingle();
  return NextResponse.json({
    success: true,
    name: me.name,
    email: me.email,
    jobTitle: me.jobTitle,
    company: org?.name ?? "",
    canNameCompany: me.role === "admin" && org?.created_by === me.id,
    complete: me.profileComplete,
  });
}

export async function POST(req: NextRequest) {
  const me = await getMe();
  if (!me) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const s = (x: unknown) => (typeof x === "string" ? x.trim().replace(/\s+/g, " ") : "");
  const name = s(b.name), jobTitle = s(b.jobTitle), company = s(b.company);
  if (name.length < 1 || name.length > 80) return NextResponse.json({ success: false, error: "Enter your name (up to 80 characters)." }, { status: 400 });
  if (jobTitle.length > 80) return NextResponse.json({ success: false, error: "Keep your job title under 80 characters." }, { status: 400 });
  if (b.terms !== true) return NextResponse.json({ success: false, error: "Agree to the Terms to continue." }, { status: 400 });

  const admin = supabaseAdmin();
  const { data: org } = await admin.from("organizations").select("created_by").eq("id", me.organizationId).maybeSingle();
  if (me.role === "admin" && org?.created_by === me.id) {
    if (company.length < 1 || company.length > 80) return NextResponse.json({ success: false, error: "Enter your company or brand name." }, { status: 400 });
    const { error } = await admin.from("organizations").update({ name: company }).eq("id", me.organizationId);
    if (error) return NextResponse.json({ success: false, error: "Could not save your company. Try again." }, { status: 500 });
  }
  const now = new Date().toISOString();
  const { error } = await admin
    .from("profiles")
    .update({ full_name: name, job_title: jobTitle, terms_accepted_at: now, profile_completed_at: now })
    .eq("id", me.id);
  if (error) return NextResponse.json({ success: false, error: "Could not save your profile. Try again." }, { status: 500 });
  return NextResponse.json({ success: true });
}
