import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: submissionId } = await params;
    const body = await req.json();
    const {
      findingId,
      action,
      reason = "",
      evidence = "",
      memo = "Override authorized under Legal Memo LM-2026-44",
      reviewerId = "usr_daksh",
      userId = "usr_riddhi",
    } = body;

    if (!findingId || !action) {
      return NextResponse.json(
        { success: false, error: "findingId and action ('dispute' | 'dismiss' | 'override') are required." },
        { status: 400 }
      );
    }

    if (action === "dispute") {
      const dispute = db.raiseDispute(
        findingId,
        userId,
        reason || "Creator asserts compliance with statutory safe harbor provisions.",
        evidence || undefined
      );
      const submission = db.getSubmission(submissionId);
      const findings = db.listFindings(submissionId);
      return NextResponse.json({
        success: true,
        action: "dispute",
        dispute,
        submission,
        findings,
        message: "Finding flagged as disputed and escalated to brand reviewer queue.",
      });
    }

    if (action === "dismiss") {
      const result = db.dismissFinding(
        findingId,
        reviewerId || userId,
        reason || "Permitted exception per brand guideline tolerance policy."
      );
      if (!result) {
        return NextResponse.json(
          { success: false, error: "Finding or submission not found." },
          { status: 404 }
        );
      }
      const findings = db.listFindings(submissionId);
      return NextResponse.json({
        success: true,
        action: "dismiss",
        finding: result.finding,
        submission: result.submission,
        findings,
        message: "Finding successfully dismissed with recorded justification.",
      });
    }

    if (action === "override") {
      const result = db.recordFindingOverride(
        findingId,
        reviewerId,
        memo || "Override authorized under Legal Memo LM-2026-44"
      );
      if (!result) {
        return NextResponse.json(
          { success: false, error: "Finding or submission not found." },
          { status: 404 }
        );
      }
      const findings = db.listFindings(submissionId);
      return NextResponse.json({
        success: true,
        action: "override",
        finding: result.finding,
        submission: result.submission,
        findings,
        message: `Authorized override logged in immutable audit trail: "${memo}"`,
      });
    }

    return NextResponse.json(
      { success: false, error: `Invalid action: ${action}` },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process finding action" },
      { status: 500 }
    );
  }
}
