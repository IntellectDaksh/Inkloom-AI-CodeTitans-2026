import { withStore } from "@/lib/db/withStore";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isBuiltInId } from "@/lib/db/seed";

async function GET_handler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: claimId } = await params;
    const dependentSubmissions = db.getDependentSubmissionsForClaim(claimId);
    return NextResponse.json({
      success: true,
      claimId,
      dependentSubmissions,
      count: dependentSubmissions.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to inspect claim dependencies" },
      { status: 500 }
    );
  }
}

async function POST_handler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: claimId } = await params;
    if (isBuiltInId(claimId)) {
      return NextResponse.json({ success: false, error: "Built-in claims are read-only and can't be changed." }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const {
      reason = "Claim validity period expired / evidence scope amended",
      triggeredBy = "usr_daksh",
    } = body;

    const result = db.triggerCascadeReReview(claimId, reason, triggeredBy);

    return NextResponse.json({
      success: true,
      claim: result.claim,
      affectedSubmissions: result.affectedSubmissions,
      replacements: result.replacements,
      count: result.count,
      message: `Cascade re-review initiated: ${result.count} past publication(s) quarantined with status 'needs_re_review'.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to trigger cascade re-review" },
      { status: 500 }
    );
  }
}

export const GET = withStore(GET_handler);
export const POST = withStore(POST_handler);
