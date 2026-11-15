import { NextResponse } from "next/server";
import { getMe } from "@/lib/auth/server";

export async function GET() {
  const me = await getMe();
  if (!me) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });
  return NextResponse.json({ success: true, me });
}
