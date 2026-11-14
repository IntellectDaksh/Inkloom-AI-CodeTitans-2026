import { withStore } from "@/lib/db/withStore";
import { NextResponse } from "next/server";
import { runEvaluation } from "@/lib/eval/run";

export const maxDuration = 300;

/** Runs the labelled eval set through the live pipeline. ?mode=rules forces rule-only even if a key is set. */
async function GET_handler(req: Request) {
  try {
    const rulesOnly = new URL(req.url).searchParams.get("mode") === "rules";
    const report = await runEvaluation({ apiKey: rulesOnly ? "" : process.env.GEMINI_API_KEY });
    return NextResponse.json({ success: true, report });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Evaluation failed" }, { status: 500 });
  }
}

export const GET = withStore(GET_handler);
