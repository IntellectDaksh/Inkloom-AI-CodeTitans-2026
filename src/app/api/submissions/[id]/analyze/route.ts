import { withStore } from "@/lib/db/withStore";
import { NextRequest, NextResponse, after } from "next/server";
import { fireWebhooks } from "@/lib/notify/webhooks";
import { db } from "@/lib/db";
import { runGovernancePipeline } from "@/lib/ai";
import { styleFrom } from "@/lib/ai/pipeline";
import { withSources } from "../../sources";
import { getMe } from "@/lib/auth/server";

async function POST_handler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const submission = db.getSubmission(id);

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    const contentToAnalyze = body.content || submission.currentContent;

    const report = await runGovernancePipeline(
      id,
      contentToAnalyze,
      submission.brandId,
      submission.organizationId,
      (submission.channel as any) || "social_media",
      { style: styleFrom(body) }
    );

    // Re-check replaces open findings instead of stacking duplicates.
    db.clearOpenFindings(id);

    // Save findings
    for (const finding of report.findings) {
      const citedClaimId = (finding as any).citedEvidenceIds?.[0] || finding.evidenceRecords?.[0]?.claimId || undefined;
      const citedExcerpt = (finding as any).citedExcerpt || finding.evidenceRecords?.[0]?.excerpt || undefined;
      const isVerified = (finding as any).isVerified !== undefined ? (finding as any).isVerified : !finding.unverified;

      db.createFinding({
        submissionId: id,
        organizationId: submission.organizationId,
        brandId: submission.brandId,
        ruleId: finding.ruleId || undefined,
        claimId: citedClaimId,
        category: finding.category as any,
        severity: finding.severity as any,
        confidence: finding.confidence as any,
        flaggedText: finding.flaggedText,
        message: finding.explanation,
        explanation: finding.explanation,
        suggestedCorrection: finding.suggestedCorrection,
        citedExcerpt,
        isVerified,
        status: "open",
      });
    }

    // Save suggested revision if returned
    const revisedText = report.suggestedRevisedContent || (report as any).suggestedRevision;
    if (revisedText) {
      db.createSuggestedRevision({
        submissionId: id,
        organizationId: submission.organizationId,
        originalText: contentToAnalyze,
        revisedText,
        reasoning: report.executiveSummary,
        isApplied: false,
      });
    }

    const me = await getMe().catch(() => null);
    db.recordAnalysisRun(id, {
      content: contentToAnalyze,
      score: report.complianceScore,
      status: report.status,
      summary: report.executiveSummary,
      modelUsed: report.modelUsed,
      durationMs: report.stageExecutionTimes?.totalMs ?? 0,
      findings: report.findings.map((f) => ({
        category: f.category,
        severity: f.severity,
        flaggedText: f.flaggedText,
        explanation: f.explanation,
        suggestedCorrection: f.suggestedCorrection,
      })),
      scoreBreakdown: report.scoreBreakdown ?? null,
      userId: me?.id ?? body.userId ?? null,
      userName: me?.name ?? null,
    });
    if (contentToAnalyze !== submission.currentContent) db.updateSubmission(id, { currentContent: contentToAnalyze });

    // Update submission status based on findings
    const newStatus = report.findings.some(
      (f) => f.severity === "critical" || f.severity === "high"
    )
      ? "under_review"
      : "submitted";

    db.updateSubmission(id, {
      status: newStatus,
    });

    // Record audit event
    db.recordAuditEvent({
      organizationId: submission.organizationId,
      brandId: submission.brandId,
      userId: body.userId || "usr_daksh",
      action: "run_analysis",
      entityType: "submission",
      entityId: id,
      metadata: {
        score: report.complianceScore,
        issuesCount: report.findings.length,
        status: report.status,
      },
    });

    if (report?.status === "rejected") {
      const me = await getMe();
      if (me) after(() => fireWebhooks(me.organizationId, "ad_blocked", { title: submission.title, submissionId: id, actor: me.name, note: report!.executiveSummary }));
    }

    return NextResponse.json({
      success: true,
      report,
      findings: withSources(db.listFindings(id)),
      revisions: db.listSuggestedRevisions(id),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export const POST = withStore(POST_handler, { name: "analyze", limit: [0, 200] });
