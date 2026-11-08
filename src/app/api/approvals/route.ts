import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orgId = searchParams.get("orgId") || "org_uideas_digital";
    const status = searchParams.get("status") || undefined;

    const approvals = db.listApprovals(orgId, status as any);
    return NextResponse.json({ success: true, approvals });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      submissionId,
      decision, // 'approved' | 'rejected' | 'changes_requested'
      notes,
      reviewerId = "usr_daksh",
      reviewerName = "Daksh Agrawal",
      organizationId = "org_uideas_digital",
    } = body;

    if (!submissionId || !decision) {
      return NextResponse.json(
        { success: false, error: "submissionId and decision are required" },
        { status: 400 }
      );
    }

    const submission = db.getSubmission(submissionId);
    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    // 1. Record decision in DB
    const recordedDecision = db.recordApprovalDecision({
      submissionId,
      organizationId,
      reviewerId,
      reviewerName,
      decision,
      notes: notes || `Submission ${decision} by ${reviewerName}`,
      decidedAt: new Date().toISOString(),
    });

    // 2. Update submission status
    db.updateSubmission(submissionId, {
      status: decision === "approved" ? "approved" : decision === "rejected" ? "rejected" : "changes_requested",
    });

    // 3. Record audit event
    db.recordAuditEvent({
      organizationId,
      brandId: submission.brandId,
      userId: reviewerId,
      action: decision === "approved" ? "approve_submission" : decision === "rejected" ? "reject_submission" : "request_changes",
      entityType: "submission",
      entityId: submissionId,
      metadata: { notes, reviewerName },
    });

    // 4. Send notification to submission author
    db.createNotification({
      organizationId,
      userId: submission.authorId,
      type: "approval_decision",
      title: `Submission ${decision.toUpperCase().replace("_", " ")}: ${submission.title}`,
      message: notes || `Your submission "${submission.title}" was reviewed by ${reviewerName}.`,
      linkUrl: `/submissions/${submissionId}`,
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      decision: recordedDecision,
      submission: db.getSubmission(submissionId),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
