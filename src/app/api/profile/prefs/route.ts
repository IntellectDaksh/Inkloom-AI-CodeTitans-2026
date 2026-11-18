import { NextRequest, NextResponse } from "next/server";
import { getMe, supabaseServer, forgetProfile } from "@/lib/auth/server";

const MAX = 8000;

// PUT: replace the signed-in user's saved preferences (brand, strictness, onboarding, appearance).
export async function PUT(req: NextRequest) {
  const me = await getMe();
  if (!me) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
  const raw = await req.text();
  if (raw.length > MAX) return NextResponse.json({ success: false, error: "Preferences are too large." }, { status: 413 });
  let prefs: unknown;
  try {
    prefs = JSON.parse(raw);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 });
  }
  if (!prefs || typeof prefs !== "object" || Array.isArray(prefs)) return NextResponse.json({ success: false, error: "Send an object." }, { status: 400 });
  const { error } = await (await supabaseServer()).from("profiles").update({ prefs }).eq("id", me.id);
  forgetProfile(me.id);
  if (error) return NextResponse.json({ success: false, error: "Could not save preferences." }, { status: 500 });
  return NextResponse.json({ success: true });
}
