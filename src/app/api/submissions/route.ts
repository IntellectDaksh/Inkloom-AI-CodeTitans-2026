import { withStore } from "@/lib/db/withStore";
import { NextRequest, NextResponse, after } from "next/server";
import { fireWebhooks } from "@/lib/notify/webhooks";
import { db } from "@/lib/db";
import { getMe } from "@/lib/auth/server";
import { SEED_IDS } from "@/lib/db/seed";
import { runGovernancePipeline } from "@/lib/ai";
import { styleFrom } from "@/lib/ai/pipeline";
import type { ContentChannel } from "@/lib/ai/types";
import type { SubmissionStatus } from "@/lib/db/types";

type FindingInput = Parameters<typeof db.createFinding>[0];

async function GET_handler(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const brandId = searchParams.get("brandId") || undefined;
    const orgId = searchParams.get("orgId") || SEED_IDS.ORGANISATION_UIDEAS;
    const status = searchParams.get("status") || undefined;

    const submissions = db.listSubmissions(brandId, orgId, status as SubmissionStatus | undefined);
    return NextResponse.json({ success: true, submissions });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

async function POST_handler(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      content: rawContent,
      text,
      sourceFile,
      brandId = SEED_IDS.BRAND_APEX,
      organizationId = SEED_IDS.ORGANISATION_UIDEAS,
      authorId = body?.userId ?? "usr_daksh",
      authorName = "Daksh Agrawal",
      channel = "social_media",
      submissionType = "reel_script",
      runAnalysis = true,
    } = body;

    // `text` is accepted as an alias so /api/extract output can be posted straight through.
    const content = typeof rawContent === "string" && rawContent.trim() ? rawContent : text;
    if (sourceFile !== undefined && (typeof sourceFile !== "object" || sourceFile === null || typeof sourceFile.fileName !== "string")) {
      return NextResponse.json(
        { success: false, error: "sourceFile must be an object with fileName, mime and method" },
        { status: 400 }
      );
    }

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
      metadata: sourceFile
        ? {
            sourceFile: {
              fileName: String(sourceFile.fileName).slice(0, 255),
              mime: typeof sourceFile.mime === "string" ? sourceFile.mime.slice(0, 120) : undefined,
              method: ["plain", "docx", "gemini-ocr", "paste"].includes(sourceFile.method) ? sourceFile.method : undefined,
              ocrUnverified: sourceFile.method === "gemini-ocr" || undefined,
              // Original bytes live in the uploader's IndexedDB under this id (src/lib/files/store.ts).
              fileId: typeof sourceFile.fileId === "string" ? sourceFile.fileId.slice(0, 80) : undefined,
              size: Number.isFinite(sourceFile.size) ? Number(sourceFile.size) : undefined,
              pages: Number.isFinite(sourceFile.pages) ? Number(sourceFile.pages) : undefined,
            },
          }
        : undefined,
    });

    let reviewReport = null;

    // 2. Optionally run multi-stage AI Governance Pipeline
    if (runAnalysis) {
      reviewReport = await runGovernancePipeline(
        newSubmission.id,
        content,
        brandId,
        organizationId,
        channel as ContentChannel,
        { style: styleFrom(body) }
      );

      // Record findings in DB
      for (const finding of reviewReport.findings) {
        const citedClaimId = finding.citedEvidenceIds?.[0] || finding.evidenceRecords?.[0]?.claimId || undefined;
        const citedExcerpt = finding.citedExcerpt || finding.evidenceRecords?.[0]?.excerpt || undefined;
        const isVerified = finding.isVerified !== undefined ? finding.isVerified : !finding.unverified;

        db.createFinding({
          submissionId: newSubmission.id,
          organizationId,
          brandId,
          ruleId: finding.ruleId || undefined,
          claimId: citedClaimId,
          category: finding.category as FindingInput["category"],
          severity: finding.severity as FindingInput["severity"],
          confidence: finding.confidence,
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
      const revisedText = reviewReport.suggestedRevisedContent || reviewReport.suggestedRevision;
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

      // Version history: first check of v1 (see /submissions/[id] version timeline).
      db.recordAnalysisRun(newSubmission.id, {
        content,
        score: reviewReport.complianceScore,
        status: reviewReport.status,
        summary: reviewReport.executiveSummary,
        modelUsed: reviewReport.modelUsed,
        durationMs: reviewReport.stageExecutionTimes?.totalMs ?? 0,
        findings: reviewReport.findings.map((f) => ({ category: f.category, severity: f.severity, flaggedText: f.flaggedText, explanation: f.explanation, suggestedCorrection: f.suggestedCorrection })),
        scoreBreakdown: reviewReport.scoreBreakdown ?? null,
        userId: authorId ?? null,
      });

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

    if (reviewReport?.status === "rejected") {
      const me = await getMe();
      if (me) after(() => fireWebhooks(me.organizationId, "ad_blocked", { title: title, submissionId: newSubmission.id, actor: me.name, note: reviewReport!.executiveSummary }));
    }

    return NextResponse.json({
      success: true,
      submission: newSubmission,
      report: reviewReport,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

export const GET = withStore(GET_handler);
export const POST = withStore(POST_handler);
