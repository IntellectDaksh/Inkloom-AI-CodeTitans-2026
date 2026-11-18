import { NextResponse } from "next/server";
import { supabaseServer, forgetProfile } from "@/lib/auth/server";

// GET: has this account seen the first-run demo? POST: mark it seen (idempotent).
export async function GET() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
  const { data, error } = await sb.from("profiles").select("demo_seen_at").eq("id", user.id).maybeSingle();
  // Column missing (migration not applied) or read failure: report seen so nobody gets trapped in a loop.
  if (error) return NextResponse.json({ success: true, seen: true });
  return NextResponse.json({ success: true, seen: !!data?.demo_seen_at });
}

export async function POST() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
  const { error } = await sb.from("profiles").update({ demo_seen_at: new Date().toISOString() }).eq("id", user.id).is("demo_seen_at", null);
  forgetProfile(user.id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
