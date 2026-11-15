import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/auth/server";
import { safeNext } from "@/lib/auth/next";

// OAuth, email-confirm and password-recovery links all land here with ?code=.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const next = safeNext(req.nextUrl.searchParams.get("next"));
  if (code) {
    const sb = await supabaseServer();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await sb.auth.getUser();
      const { data: p } = user ? await sb.from("profiles").select("profile_completed_at").eq("id", user.id).maybeSingle() : { data: null };
      const dest = p && !p.profile_completed_at && !next.startsWith("/auth/reset") ? `/welcome?next=${encodeURIComponent(next)}` : next;
      return NextResponse.redirect(new URL(dest, req.url));
    }
  }
  return NextResponse.redirect(new URL("/auth/login?error=link", req.url));
}
