import { NextResponse } from "next/server";
import { getMe } from "@/lib/auth/server";

export async function GET() {
  const me = await getMe();
  // Signed-out is a normal state on public pages; answer 200 so the root layout probe never logs a console error.
  if (!me) return NextResponse.json({ success: true, me: null });
  return NextResponse.json({ success: true, me });
}
