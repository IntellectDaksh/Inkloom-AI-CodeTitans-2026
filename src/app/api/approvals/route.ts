import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { denyFor, type AppRole } from "./rbac";

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

const DECISIONS = ["approved", "rejected", "changes_requested", "override"] as const;
type Decision = (typeof DECISIONS)[number];

// Matrix lives in ./rbac. Role comes from the stored user profile, not the request body.
function denyReason(role: AppRole | undefined, decision: Decision, reviewerId: string, authorId?: string, notes?: string, override = false) {
  const perm = decision === "override" || override ? "override_decision" : decision === "rejected" ? "reject" : "decide";
  const d = denyFor(role, perm);
  if (d) return d;
  if (authorId && authorId === reviewerId) return "You can't decide on your own submission.";
  if ((decision !== "approved") && (!notes || notes.trim().length < 5))
    return "Add a short reason (5+ characters) for this decision.";
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let {
      reviewerName = "Unknown user",
    } = body as { reviewerName?: string };
    const {
      submissionId,
      decision,
      notes,
      reviewerId = "",
      reviewerRole: roleField,
      role,
      organizationId = "org_uideas_digital",
    } = body as {
      submissionId?: string;
      decision?: Decision;
      notes?: string;
      reviewerId?: string;
      reviewerRole?: string;
      role?: string;
      organizationId?: string;
    };

    // Server-side identity: whatever role the client claims, the stored profile wins.
    const reviewerRole = db.getUserRole(reviewerId) as AppRole | undefined;
    const claimedRole = roleField ?? role;
    reviewerName = db.getUserName(reviewerId) ?? reviewerName;
    if (!submissionId || !decision || !DECISIONS.includes(decision)) {
      return NextResponse.json(
        { success: false, error: "submissionId and a valid decision are required" },
        { status: 400 }
      );
    }

    const submission = db.getSubmission(submissionId);
    if (!submission) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
    }

    const orgId = submission.organisation_id || organizationId;
    const isOverride = decision === "override" || body.override === true;
    const denied = denyReason(reviewerRole, decision, reviewerId, submission.authorId, notes, isOverride);
    if (denied) {
      db.recordAuditEvent({
        organizationId: orgId,
        brandId: submission.brandId,
        userId: reviewerId,
        action: "decision_blocked",
        entityType: "submission",
        entityId: submissionId,
        metadata: { attempted: decision, reviewerName, reviewerRole, reason: denied, claimedRole },
      });
      return NextResponse.json({ success: false, error: denied }, { status: 403 });
    }

    const effective = decision === "override" ? "approved" : decision;
    // recordApprovalDecision updates status and writes its own audit event.
    const recordedDecision = db.recordApprovalDecision({
      submissionId,
      organizationId: orgId,
      reviewerId,
      reviewerName,
      decision: effective,
      notes: notes || `Submission ${effective} by ${reviewerName}`,
      decidedAt: new Date().toISOString(),
    });

    db.recordAuditEvent({
      organizationId: orgId,
      brandId: submission.brandId,
      userId: reviewerId,
      action: isOverride ? "override_recorded" : "decision_signed",
      entityType: "submission",
      entityId: submissionId,
      metadata: { decision, notes, reviewerName, reviewerRole },
    });

    db.createNotification({
      organizationId: orgId,
      userId: submission.authorId,
      type: "approval_decision",
      title: `${decision === "override" ? "Override" : effective.replace("_", " ")}: ${submission.title}`,
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
