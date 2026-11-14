import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runGovernancePipeline } from "@/lib/ai";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submission = db.getSubmission(id);

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    const findings = db.listFindings(id);
    const revisions = db.listSuggestedRevisions(id);
    const brand = db.getBrand(submission.brandId);
    const auditEvents = db.listAuditForEntity(id);

    return NextResponse.json({
      success: true,
      submission,
      findings,
      revisions,
      brand,
      auditEvents,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { currentContent, status, revisionId, appliedBy = "usr_daksh" } = body;

    const submission = db.getSubmission(id);
    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    const updates: any = {};
    if (currentContent !== undefined) {
      updates.currentContent = currentContent;
    }
    if (status !== undefined) {
      updates.status = status;
    }

    const updated = db.updateSubmission(id, updates);

    // If a revision was applied, update revision status
    if (revisionId) {
      db.updateSuggestedRevision(revisionId, {
        isApplied: true,
        appliedBy,
        appliedAt: new Date().toISOString(),
      });
    }

    // Record audit event
    db.recordAuditEvent({
      organizationId: submission.organizationId,
      brandId: submission.brandId,
      userId: appliedBy,
      action: revisionId ? "apply_suggestion" : "edit_submission",
      entityType: "submission",
      entityId: id,
      previousValue: { content: submission.currentContent, status: submission.status },
      updatedValue: updates,
    });

    return NextResponse.json({
      success: true,
      submission: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
