import { withStore } from "@/lib/db/withStore";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { denyFor, type AppRole } from "@/app/api/approvals/rbac";

async function POST_handler(
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
      memo = "",
      reviewerId = "",
      userId = "",
      evidenceFile = null,
    } = body as Record<string, any>;

    if (!findingId || !action) {
      return NextResponse.json(
        { success: false, error: "findingId and action ('dispute' | 'dismiss' | 'override') are required." },
        { status: 400 }
      );
    }

    // Permission matrix: see src/app/api/approvals/rbac.ts. Role is read from the stored profile.
    const actorId: string = action === "dispute" ? userId || reviewerId : reviewerId || userId;
    const role = db.getUserRole(actorId) as AppRole | undefined;
    const perm = action === "dispute" ? "dispute" : action === "dismiss" ? "dismiss" : action === "override" ? "override_finding" : null;
    if (perm) {
      const denied = denyFor(role, perm);
      const sub = db.getSubmission(submissionId);
      const finding = db.listFindings(submissionId).find((f) => f.id === findingId);
      if (!sub || !finding) {
        return NextResponse.json({ success: false, error: "Finding or submission not found." }, { status: 404 });
      }
      const own = perm !== "dispute" && sub.authorId === actorId ? "You can't clear findings on your own submission." : null;
      const needReason = (perm === "dismiss" && reason.trim().length < 5) || (perm === "override_finding" && String(memo).trim().length < 5)
        ? "Add a short reason (5+ characters)." : null;
      const disputeEmpty = perm === "dispute" && !reason.trim() && !String(evidence).trim() && !evidenceFile
        ? "Add a reason or counter-evidence for the dispute." : null;
      const block = denied || own || needReason || disputeEmpty;
      if (block) {
        db.recordAuditEvent({
          organizationId: sub.organisation_id, brandId: sub.brand_id, userId: actorId || null,
          action: "action_blocked", entityType: "submission", entityId: submissionId,
          metadata: { attempted: action, findingId, role: role ?? null, reason: block },
        });
        return NextResponse.json({ success: false, error: block }, { status: 403 });
      }
    }

    if (action === "dispute") {
      const file =
        evidenceFile && typeof evidenceFile.name === "string" && typeof evidenceFile.text === "string"
          ? { name: evidenceFile.name.slice(0, 200), text: evidenceFile.text }
          : null;
      const dispute = db.raiseDispute(findingId, actorId, reason || "Counter-evidence attached.", evidence || undefined, file);
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
        actorId,
        reason
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
        actorId,
        memo
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

export const POST = withStore(POST_handler);
