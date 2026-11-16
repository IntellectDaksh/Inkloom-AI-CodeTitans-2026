import { db } from "@/lib/db";
import { withSources } from "../../sources";
import { FindingItem, SEVERITY, VERDICT, dedupeFindings, effectiveStatus, estimateScore, evidenceOf, humanize, sevOf, verdictFor } from "@/components/submission/shared";
import { ReportData, checkedByLabel } from "@/components/submission/report";

/** Builds the printable / shareable report for a submission in the current org store. Null when missing. */
export function buildReportData(id: string): ReportData | null {
  const s = db.getSubmission(id);
  if (!s) return null;
  const content = s.currentContent || s.raw_content || "";
  const findings = dedupeFindings(withSources(db.listFindings(id)) as unknown as FindingItem[]).sort(
    (a, b) => Object.keys(SEVERITY).indexOf(sevOf(a.severity)) - Object.keys(SEVERITY).indexOf(sevOf(b.severity))
  );
  const runs = db.listAnalysisRuns(id);
  const run = runs[runs.length - 1] ?? s.latest_analysis ?? null;
  const version = run ? s.versions?.find((v) => v.id === run.submission_version_id)?.version_number ?? null : s.current_version_number ?? null;
  const score = run?.overall_score ?? estimateScore(findings, content);
  const verdict = verdictFor(score, findings, content);
  const d = s.latest_decision;
  const nameOf = (uid?: string | null) => (uid ? s.reviewer?.id === uid ? s.reviewer.full_name : s.creator?.id === uid ? s.creator.full_name : uid : "Unknown");

  return {
    title: s.title,
    brand: s.brand?.name || s.brand_id,
    channel: humanize(s.channel),
    content,
    verdict,
    verdictLabel: VERDICT[verdict].title,
    score,
    scoreBreakdown: run?.score_breakdown?.factors.map(({ label, score, weight, detail }) => ({ label, score, weight, detail })) ?? [],
    summary: run?.summary || null,
    checkedBy: checkedByLabel(run?.model_used),
    modelUsed: run?.model_used ?? null,
    version,
    checkedAt: run?.completed_at || run?.created_at || null,
    issues: findings.map((f) => {
      const status = effectiveStatus(f, content);
      const ev = evidenceOf(f);
      return {
        severity: SEVERITY[sevOf(f.severity)].label,
        category: humanize(f.category),
        status,
        flaggedText: f.flaggedText || "",
        why: f.explanation || "",
        source: f.source ? `${f.source.claimCode}: ${f.source.title}${f.source.citation ? ` (${f.source.citation})` : ""}` : ev ? `"${ev.excerpt}"${ev.citation ? ` (${ev.citation})` : ""}` : null,
        sourceUrl: f.source?.url ?? null,
        suggestedFix: f.suggestedCorrection || null,
        statusNote:
          status === "dismissed" ? `Dismissed: ${f.dismissal_reason || "no reason given"}`
          : status === "overridden" ? `Overridden${f.overridden_by ? ` by ${f.overridden_by}` : ""}: ${f.override_memo || "no memo"}`
          : status === "disputed" ? `Disputed: ${f.dispute_reason || "no reason given"}`
          : status === "resolved" ? "Fixed in the current copy"
          : null,
      };
    }),
    decision: d ? { decision: humanize(d.decision), by: nameOf(d.decided_by), notes: d.comments ?? null, at: d.decided_at } : null,
    generatedAt: new Date().toISOString(),
    reference: s.id.slice(0, 8),
  };
}
