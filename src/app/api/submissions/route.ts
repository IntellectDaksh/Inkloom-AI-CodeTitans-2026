import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runGovernancePipeline } from "@/lib/ai";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const brandId = searchParams.get("brandId") || undefined;
    const orgId = searchParams.get("orgId") || "org_uideas_digital";
    const status = searchParams.get("status") || undefined;

    const submissions = db.listSubmissions(brandId, orgId, status as any);
    return NextResponse.json({ success: true, submissions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      content,
      brandId = "brand_apex",
      organizationId = "org_uideas_digital",
      authorId = "usr_daksh",
      authorName = "Daksh Agrawal",
      channel = "social_media",
      submissionType = "reel_script",
      runAnalysis = true,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "Title and content are required" },
        { status: 400 }
      );
    }

    // 1. Create submission record in DB
    const newSubmission = db.createSubmission({
      title,
      brandId,
      organizationId,
      authorId,
      channel,
      submissionType,
      currentContent: content,
      status: "under_review",
    });

    let reviewReport = null;

    // 2. Optionally run multi-stage AI Governance Pipeline
    if (runAnalysis) {
      reviewReport = await runGovernancePipeline(
        newSubmission.id,
        content,
        brandId,
        organizationId,
        channel as any
      );

      // Record findings in DB
      for (const finding of reviewReport.findings) {
        const citedClaimId = (finding as any).citedEvidenceIds?.[0] || finding.evidenceRecords?.[0]?.claimId || undefined;
        const citedExcerpt = (finding as any).citedExcerpt || finding.evidenceRecords?.[0]?.excerpt || undefined;
        const isVerified = (finding as any).isVerified !== undefined ? (finding as any).isVerified : !finding.unverified;

        db.createFinding({
          submissionId: newSubmission.id,
          organizationId,
          brandId,
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

      // Record suggested revision if available
      const revisedText = reviewReport.suggestedRevisedContent || (reviewReport as any).suggestedRevision;
      if (revisedText) {
        db.createSuggestedRevision({
          submissionId: newSubmission.id,
          organizationId,
          originalText: content,
          revisedText,
          reasoning: reviewReport.executiveSummary,
          isApplied: false,
        });
      }

      // Record audit event
      db.recordAuditEvent({
        organizationId,
        brandId,
        userId: authorId,
        action: "run_analysis",
        entityType: "submission",
        entityId: newSubmission.id,
        metadata: {
          score: reviewReport.complianceScore,
          issuesCount: reviewReport.findings.length,
          status: reviewReport.status,
        },
      });
    }

    return NextResponse.json({
      success: true,
      submission: newSubmission,
      report: reviewReport,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
