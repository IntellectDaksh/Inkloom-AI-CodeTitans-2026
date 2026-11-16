import { withStore } from "@/lib/db/withStore";
import { NextResponse } from "next/server";
import { runEvaluation, type EvalReport } from "@/lib/eval/run";
import { getMe, supabaseAdmin } from "@/lib/auth/server";

export const maxDuration = 300;

// Last run per organisation lives in its own app_state row ("eval_<orgId>"), not the org document,
// so a 2-minute run can't collide with the org's own saves. Memory fallback for local dev without Supabase.
const memory = new Map<string, EvalReport>();
const rowId = (orgId: string) => `eval_${orgId}`;
const hasDb = () => !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY);

async function loadLast(orgId: string): Promise<EvalReport | null> {
  if (!hasDb()) return memory.get(orgId) ?? null;
  const { data, error } = await supabaseAdmin().from("app_state").select("data").eq("id", rowId(orgId)).maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.data as EvalReport) ?? null;
}

async function saveLast(orgId: string, report: EvalReport) {
  memory.set(orgId, report);
  if (!hasDb()) return;
  const { error } = await supabaseAdmin().from("app_state").upsert({ id: rowId(orgId), organization_id: orgId, data: report, updated_at: new Date().toISOString() });
  if (error) console.error("eval save failed", error.message);
}

/** Last stored run, so the page shows numbers without re-running. Any member can read it. */
async function GET_handler() {
  const me = await getMe();
  if (!me) return NextResponse.json({ success: false, error: "Sign in to do this." }, { status: 401 });
  try {
    return NextResponse.json({ success: true, report: await loadLast(me.organizationId), canRun: me.role === "admin" });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Could not load the last run" }, { status: 500 });
  }
}

/** Runs the labelled set through the live pipeline. Admin only. ?mode=rules forces rule-only. */
async function POST_handler(req: Request) {
  const me = await getMe();
  if (!me) return NextResponse.json({ success: false, error: "Sign in to do this." }, { status: 401 });
  if (me.role !== "admin") return NextResponse.json({ success: false, error: "Only admins can run the evaluation." }, { status: 403 });
  try {
    const rulesOnly = new URL(req.url).searchParams.get("mode") === "rules";
    const report = await runEvaluation({ apiKey: rulesOnly ? "" : process.env.GEMINI_API_KEY });
    await saveLast(me.organizationId, report);
    return NextResponse.json({ success: true, report, canRun: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Evaluation failed" }, { status: 500 });
  }
}

export const GET = withStore(GET_handler);
export const POST = withStore(POST_handler, { name: "eval", limit: [0, 10] });
