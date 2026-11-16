import { NextResponse } from "next/server";
import { withStore } from "@/lib/db/withStore";
import { db } from "@/lib/db";
import { getMe, supabaseAdmin } from "@/lib/auth/server";

// Hourly budgets per signed-in user; must match the limit option on each route's withStore call.
const LIMITS = { check: 200, analyze: 200, extract: 60, upload: 120 } as const;

/** GET /api/usage — this month's analysis runs for the org, and the caller's use of each hourly budget. Shape is stable for billing. */
async function GET_handler() {
  const me = await getMe();
  if (!me) return NextResponse.json({ success: false, error: "Sign in to do this." }, { status: 401 });
  try {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const checksThisMonth = (db.getState().analysis_runs ?? []).filter((r) => Date.parse(r.created_at) >= monthStart.getTime()).length;

    // Same fixed window as public.rate_limit_hit: floor(epoch / 3600) * 3600.
    const windowStart = new Date(Math.floor(now.getTime() / 3_600_000) * 3_600_000);
    const keys = Object.keys(LIMITS).map((k) => `${k}:u:${me.id}`);
    const { data, error } = await supabaseAdmin().from("rate_limits").select("key, hits").in("key", keys).eq("window_start", windowStart.toISOString());
    if (error) throw new Error(error.message);
    const hits = new Map((data ?? []).map((r) => [r.key as string, Number(r.hits) || 0]));

    return NextResponse.json({
      success: true,
      organizationId: me.organizationId,
      period: { start: monthStart.toISOString(), end: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString() },
      checksThisMonth,
      hourly: {
        windowStart: windowStart.toISOString(),
        resetsAt: new Date(windowStart.getTime() + 3_600_000).toISOString(),
        buckets: Object.entries(LIMITS).map(([name, limit]) => ({ name, used: hits.get(`${name}:u:${me.id}`) ?? 0, limit })),
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

export const GET = withStore(GET_handler);
