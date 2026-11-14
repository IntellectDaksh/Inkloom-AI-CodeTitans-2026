import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: claimId } = await params;
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
