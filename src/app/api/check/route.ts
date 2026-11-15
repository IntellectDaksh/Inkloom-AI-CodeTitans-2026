import { withStore } from "@/lib/db/withStore";
import { NextRequest, NextResponse } from "next/server";
import { runGovernancePipeline } from "@/lib/ai";
import { SEED_IDS } from "@/lib/db/seed";

const MAX_CHARS = 8000;

/** Runs the review pipeline on text without saving anything. Used by the public live check. */
async function POST_handler(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text) return NextResponse.json({ success: false, error: "Paste some ad copy first." }, { status: 400 });
    if (text.length > MAX_CHARS)
      return NextResponse.json({ success: false, error: `Keep it under ${MAX_CHARS} characters for a quick check.` }, { status: 400 });
    const report = await runGovernancePipeline(
      `check-${crypto.randomUUID()}`,
      text,
      SEED_IDS.BRAND_APEX,
      SEED_IDS.ORGANISATION_UIDEAS,
      "general",
    );
    return NextResponse.json({ success: true, report });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message || "The check failed. Try again." }, { status: 500 });
  }
}

export const POST = withStore(POST_handler, { public: true });
