import { connection } from "next/server";
import { NextResponse } from "next/server";
import { getHealth } from "./health";


/** GET /api/health — 200 when the database answers, 503 otherwise. Gemini missing degrades to the offline analyzer, so it doesn't fail health. */
export async function GET() {
  await connection();
  const h = await getHealth();
  return NextResponse.json(h, { status: h.status === "ok" ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
