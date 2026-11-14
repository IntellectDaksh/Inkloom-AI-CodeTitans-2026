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

type Role = "creator" | "reviewer" | "admin";
const ROLES: Role[] = ["creator", "reviewer", "admin"];
const DECISIONS = ["approved", "rejected", "changes_requested", "override"] as const;
type Decision = (typeof DECISIONS)[number];

// Role rules enforced server-side (round 3 commitment), not only in the UI.
function denyReason(role: Role, decision: Decision, reviewerId: string, authorId?: string, notes?: string) {
  if (role === "creator") return "Creators can't approve or reject. Ask a reviewer.";
  if (authorId && authorId === reviewerId) return "You can't decide on your own submission.";
  if (decision === "override" && role !== "admin") return "Only an admin can record an override.";
  if ((decision !== "approved") && (!notes || notes.trim().length < 5))
    return "Add a short reason (5+ characters) for this decision.";
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      submissionId,
      decision,
      notes,
      reviewerId = "usr_daksh",
      reviewerName = "Daksh Agrawal",
      reviewerRole: roleField,
      role,
      organizationId = "org_uideas_digital",
    } = body as {
      submissionId?: string;
      decision?: Decision;
      notes?: string;
      reviewerId?: string;
      reviewerName?: string;
      reviewerRole?: Role;
      role?: Role;
      organizationId?: string;
    };

    // Approvals page sends reviewerRole; submission page sends role.
    const reviewerRole: Role = roleField ?? role ?? "admin";
    if (!submissionId || !decision || !DECISIONS.includes(decision)) {
      return NextResponse.json(
        { success: false, error: "submissionId and a valid decision are required" },
        { status: 400 }
      );
    }
    if (!ROLES.includes(reviewerRole)) {
      return NextResponse.json({ success: false, error: "Unknown role" }, { status: 400 });
    }

    const submission = db.getSubmission(submissionId);
    if (!submission) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
    }

    const denied = denyReason(reviewerRole, decision, reviewerId, submission.authorId, notes);
    if (denied) {
      db.recordAuditEvent({
        organizationId,
        brandId: submission.brandId,
        userId: reviewerId,
        action: "decision_blocked",
        entityType: "submission",
        entityId: submissionId,
        metadata: { attempted: decision, reviewerName, reviewerRole, reason: denied },
      });
      return NextResponse.json({ success: false, error: denied }, { status: 403 });
    }

    const effective = decision === "override" ? "approved" : decision;
    // recordApprovalDecision updates status and writes its own audit event.
    const recordedDecision = db.recordApprovalDecision({
      submissionId,
      organizationId,
      reviewerId,
      reviewerName,
      decision: effective,
      notes: notes || `Submission ${effective} by ${reviewerName}`,
      decidedAt: new Date().toISOString(),
    });

    db.recordAuditEvent({
      organizationId,
      brandId: submission.brandId,
      userId: reviewerId,
      action: decision === "override" ? "override_recorded" : "decision_signed",
      entityType: "submission",
      entityId: submissionId,
      metadata: { decision, notes, reviewerName, reviewerRole },
    });

    db.createNotification({
      organizationId,
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
