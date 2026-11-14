import { withStore } from "@/lib/db/withStore";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SEED_IDS } from "@/lib/db/seed";

async function GET_handler(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orgId = searchParams.get("orgId") || SEED_IDS.ORGANISATION_UIDEAS;
    const brandId = searchParams.get("brandId") || undefined;

    const stats = db.getAnalytics(orgId, brandId);
    return NextResponse.json({ success: true, stats });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export const GET = withStore(GET_handler);
