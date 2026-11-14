"use client";

import React, { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CheckCircle2, Copy, Download, Edit3, Eye, FileText, GitCompare, RefreshCw, Send, Sparkles, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { VerdictBanner } from "@/components/submission/VerdictBanner";
import { HighlightedCopy, DiffView } from "@/components/submission/HighlightedCopy";
import { FindingCard } from "@/components/submission/FindingCard";
import { EvidenceModal, Modal, ReasonKind, ReasonModal } from "@/components/submission/FindingModals";
import {
  FindingItem,
  RevisionItem,
  SEVERITY,
  dedupeFindings,
  effectiveStatus,
  estimateScore,
  evidenceOf,
  humanize,
  replaceOnce,
  sevOf,
  verdictFor,
  VERDICT,
} from "@/components/submission/shared";
import { PERSONAS, personaOf, setPrefs, usePrefs, Role } from "@/components/guide/workspace";

type Actor = { id: string; name: string; role: Role };
type AuditItem = { action: string; actor: string; role: Role | string; time: string; reason?: string };


const STATUS_TEXT: Record<string, string> = {
  submitted: "Draft",
  under_review: "Waiting for reviewer",
  approved: "Approved",
  changes_requested: "Changes requested",
  rejected: "Rejected",
  needs_re_review: "Needs re-review",
};

const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

async function call(url: string, method: string, body: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.error || `Request failed (error ${res.status}).`);
  return data;
}

function SubmissionReviewInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [submission, setSubmission] = useState<any>(null);
  const [rawFindings, setRawFindings] = useState<FindingItem[]>([]);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [original, setOriginal] = useState("");
  const [serverScore, setServerScore] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [view, setView] = useState<"annotated" | "diff">("annotated");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reasonModal, setReasonModal] = useState<{ kind: ReasonKind; finding: FindingItem } | null>(null);
  const [evidenceFinding, setEvidenceFinding] = useState<FindingItem | null>(null);
  const [approveOpen, setApproveOpen] = useState<null | "approved" | "changes_requested">(null);
  const [toast, setToast] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const prefs = usePrefs();
  const persona = personaOf(prefs);

  const creator: Actor = useMemo(
    () => ({ id: submission?.authorId || submission?.creator_id || "", name: submission?.authorName || "Author", role: "creator" }),
    [submission]
  );
  // Current person comes from shared workspace prefs (header / onboarding).
  const actor: Actor = { id: persona.userId, name: persona.name, role: persona.role };

  const flash = (text: string, tone: "ok" | "err" = "ok") => {
    setToast({ tone, text });
    if (tone === "ok") setTimeout(() => setToast((t) => (t?.text === text ? null : t)), 5000);
  };
  const log = (action: string, reason?: string, who: Actor = actor) =>
    setAudit((a) => [{ action, actor: who.name, role: who.role, time: new Date().toISOString(), reason }, ...a]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/submissions/${id}`);
      const data = await res.json().catch(() => ({}));
      if (res.status === 404) return setSubmission(null);
      if (!res.ok || !data.success) throw new Error(data.error || "Could not load this review.");
      const s = data.submission;
      setSubmission(s);
      setRawFindings(data.findings || []);
      setRevisions(data.revisions || []);
      setContent(s.currentContent || "");
      setOriginal(s.versions?.find((v: any) => v.version_number === 1)?.content || s.currentContent || "");
      setServerScore(s.complianceScore ?? s.latest_analysis?.overall_score ?? null);
      const serverAudit: any[] = data.audit || data.auditEvents || [];
      setAudit(
        serverAudit.length
          ? serverAudit.map((e) => ({
              action: humanize(e.action),
              actor: e.actorName || e.metadata?.actorName || e.user_id || "System",
              role: e.role || e.metadata?.role || "",
              time: e.created_at,
              reason: e.reason || e.metadata?.reason,
            }))
          : [{ action: "Submitted and checked", actor: s.authorName || "Author", role: "creator", time: s.created_at }]
      );
    } catch (e) {
      setLoadError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // ---- derived ----
  const liveText = editing ? draft : content;
  const findings = useMemo(() => {
    const rank = (f: FindingItem) => (effectiveStatus(f, liveText) === "open" ? 0 : 1) * 10 + Object.keys(SEVERITY).indexOf(sevOf(f.severity));
    return dedupeFindings(rawFindings).sort((a, b) => rank(a) - rank(b));
  }, [rawFindings, liveText]);
  const openFindings = findings.filter((f) => effectiveStatus(f, liveText) === "open");
  const estimate = estimateScore(findings, liveText);
  const useServer = serverScore !== null && !editing && content === submission?.currentContent;
  const score = useServer ? serverScore! : estimate;
  const verdict = verdictFor(score, findings, liveText);
  const highRisk = openFindings.filter((f) => f.severity === "critical" || f.severity === "high");
  const safeFixes = openFindings.filter((f) => f.suggestedCorrection && replaceOnce(content, f.flaggedText, f.suggestedCorrection) !== null);
  const pendingRevision = revisions.find((r) => !r.isApplied && r.revisedText && r.revisedText !== content);
  const isOwn = actor.id === creator.id || actor.name === creator.name;
  const canDecide = actor.role !== "creator" && !isOwn;

  // ---- selection sync ----
  const select = (fid: string, from: "copy" | "card") => {
    setSelectedId(fid);
    setExpandedId(fid);
    requestAnimationFrame(() =>
      document
        .getElementById(from === "copy" ? `fc-${fid}` : `hl-${fid}`)
        ?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" })
    );
  };

  // ---- actions (same endpoints as before) ----
  const reRun = async (text: string) => {
    setChecking(true);
    try {
      const data = await call(`/api/submissions/${id}/analyze`, "POST", { content: text, userId: actor.id, role: actor.role });
      setRawFindings(data.findings || []);
      setRevisions(data.revisions || []);
      if (typeof data.report?.complianceScore === "number") setServerScore(data.report.complianceScore);
      log("Re-checked", `Score ${data.report?.complianceScore ?? "updated"}`, { id: "system", name: "AdSnitch", role: "admin" });
    } catch (e) {
      flash(`Re-check failed: ${(e as Error).message}`, "err");
    } finally {
      setChecking(false);
    }
  };

  const saveContent = async (text: string, action: string, revisionId?: string) => {
    setBusy(action);
    try {
      const data = await call(`/api/submissions/${id}`, "PATCH", { currentContent: text, revisionId, appliedBy: actor.id, role: actor.role });
      setSubmission(data.submission);
      setContent(text);
      setServerScore(null);
      log(action);
      flash(`${action}. Re-checking your ad…`);
      await reRun(text);
    } catch (e) {
      flash((e as Error).message, "err");
    } finally {
      setBusy(null);
    }
  };

  const applyFix = (f: FindingItem) => {
    const next = replaceOnce(content, f.flaggedText, f.suggestedCorrection || "");
    if (next === null) return flash("That phrase is no longer in the copy.", "err");
    saveContent(next, `Applied fix for “${f.flaggedText}”`);
  };

  const applyAllSafe = () => {
    let next = content;
    for (const f of safeFixes) next = replaceOnce(next, f.flaggedText, f.suggestedCorrection!) ?? next;
    saveContent(next, `Applied ${safeFixes.length} suggested fix${safeFixes.length === 1 ? "" : "es"}`);
  };

  const findingAction = async (kind: ReasonKind, f: FindingItem, reason: string, evidence: string) => {
    setBusy(kind);
    try {
      await call(`/api/submissions/${id}/findings`, "POST", {
        findingId: f.id,
        action: kind,
        reason,
        memo: reason,
        evidence,
        userId: actor.id,
        reviewerId: actor.id,
        role: actor.role,
      });
      const patch: Partial<FindingItem> =
        kind === "dispute"
          ? { status: "disputed", dispute_reason: reason }
          : kind === "dismiss"
          ? { status: "dismissed", dismissal_reason: reason }
          : { status: "overridden", override_memo: reason, overridden_by: actor.name };
      setRawFindings((all) => all.map((x) => (x.id === f.id ? { ...x, ...patch } : x)));
      setServerScore(null);
      log(kind === "dispute" ? "Disputed an issue" : kind === "dismiss" ? "Dismissed an issue" : "Overrode an issue", reason);
      if (kind === "dispute") {
        // Disputes always go to a reviewer.
        const data = await call(`/api/submissions/${id}`, "PATCH", { status: "under_review", appliedBy: actor.id, role: actor.role }).catch(() => null);
        if (data?.submission) setSubmission(data.submission);
        log("Sent to reviewer queue", "Dispute needs a reviewer decision");
        flash("Dispute sent to the reviewer queue.");
      } else flash(kind === "dismiss" ? "Issue dismissed. Your reason is on record." : "Override recorded.");
      setReasonModal(null);
    } catch (e) {
      flash((e as Error).message, "err");
    } finally {
      setBusy(null);
    }
  };

  const sendForApproval = async () => {
    setBusy("send");
    try {
      const data = await call(`/api/submissions/${id}`, "PATCH", { status: "under_review", appliedBy: actor.id, role: actor.role });
      setSubmission(data.submission);
      log("Sent for approval", highRisk.length ? `${highRisk.length} high-risk issue(s) still open; reviewer sign-off required` : undefined);
      flash("Sent for approval. A reviewer will sign off.");
    } catch (e) {
      flash((e as Error).message, "err");
    } finally {
      setBusy(null);
    }
  };

  const decide = async (decision: "approved" | "changes_requested", notes: string) => {
    if (!canDecide) return flash("You can't approve your own ad. A reviewer has to sign off.", "err");
    setBusy("decide");
    try {
      const data = await call("/api/approvals", "POST", {
        submissionId: id,
        decision,
        reviewerId: actor.id,
        reviewerName: actor.name,
        role: actor.role,
        notes,
      });
      setSubmission(data.submission ?? { ...submission, status: decision });
      log(decision === "approved" ? (highRisk.length ? "Approved with high-risk sign-off" : "Approved") : "Requested changes", notes);
      flash(decision === "approved" ? "Approved. The team can now publish it themselves." : "Changes requested. The author has been told.");
      setApproveOpen(null);
    } catch (e) {
      flash((e as Error).message, "err");
    } finally {
      setBusy(null);
    }
  };

  // ---- export ----
  const markdown = () =>
    [
      `# ${submission.title}`,
      ``,
      `**Result:** ${VERDICT[verdict].title} (score ${score}/100)  `,
      `**Brand:** ${submission.brand?.name || submission.brandId} · **Channel:** ${submission.channel}`,
      ``,
      `## Copy`,
      ``,
      content,
      ``,
      `## Issues (${findings.length})`,
      ...findings.map((f) => {
        const ev = evidenceOf(f);
        return [
          ``,
          `### ${SEVERITY[sevOf(f.severity)].label}: ${humanize(f.category)} (${effectiveStatus(f, content)})`,
          `- Flagged: "${f.flaggedText}"`,
          `- Why: ${f.explanation}`,
          `- Evidence: ${ev ? `"${ev.excerpt}"${ev.citation ? ` (${ev.citation})` : ""}` : "Not found in the approved library. Requires substantiation."}`,
          f.suggestedCorrection ? `- Suggested fix: ${f.suggestedCorrection}` : "",
        ]
          .filter(Boolean)
          .join("\n");
      }),
      ``,
      `## Audit trail`,
      ...audit.map((a) => `- ${fmtTime(a.time)}: ${a.action} by ${a.actor}${a.role ? ` (${a.role})` : ""}${a.reason ? `. Reason: ${a.reason}` : ""}`),
    ].join("\n");

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(`${what} copied.`);
    } catch {
      flash("Your browser blocked the clipboard. Use Download instead.", "err");
    }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([markdown()], { type: "text/markdown" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `${submission.title.replace(/[^\w-]+/g, "-")}-review.md` });
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- states ----
  if (loading)
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3" role="status">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink border-t-transparent motion-reduce:animate-none" />
          <p className="text-sm text-text-muted">Loading your review…</p>
        </div>
      </AppLayout>
    );

  if (loadError || !submission)
    return (
      <AppLayout>
        <div className="mx-auto max-w-md space-y-4 py-20 text-center">
          <h1 className="text-2xl font-semibold text-text-primary">{loadError ? "Couldn't load this review" : "Review not found"}</h1>
          <p className="text-sm text-text-secondary">{loadError || "It may have been deleted, or the link is wrong."}</p>
          <div className="flex justify-center gap-2">
            {loadError && <Button onClick={load}>Try again</Button>}
            <Link href="/submissions">
              <Button variant="secondary">All reviews</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );

  const sourceFile = submission.metadata?.sourceFile;
  const status = submission.status as string;

  return (
    <AppLayout title="Review result" subtitle="What we found in your ad and how to fix it.">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/submissions" className="inline-flex items-center gap-2 rounded text-sm text-text-muted hover:text-text-primary focus-visible:outline-2 focus-visible:outline-blue">
            <ArrowLeft className="h-4 w-4" aria-hidden /> All reviews
          </Link>
          <label className="flex items-center gap-2 text-[13px] text-text-muted">
            Acting as
            <select
              value={persona.id}
              onChange={(e) => setPrefs({ persona: e.target.value })}
              className="h-9 rounded-lg border border-border-default bg-panel px-2 text-[13px] text-text-primary focus-visible:outline-2 focus-visible:outline-blue"
            >
              {PERSONAS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.label})
                </option>
              ))}
            </select>
          </label>
        </div>

        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-[28px]">{submission.title}</h1>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-text-muted">
            <span>{submission.brand?.name || submission.brandId}</span>
            <span aria-hidden>·</span>
            <span>{humanize(submission.channel)}</span>
            <span aria-hidden>·</span>
            <span>{STATUS_TEXT[status] || humanize(status)}</span>
            {sourceFile?.fileName && (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" aria-hidden /> {sourceFile.fileName}
                  {sourceFile.method === "gemini-ocr" && " (read with OCR, check the text)"}
                </span>
              </>
            )}
          </p>
        </header>

        <VerdictBanner verdict={verdict} score={score} openCount={openFindings.length} estimated={!useServer} checking={checking} />

        {/* Primary action bar */}
        <div className="glass flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary">
            {status === "approved"
              ? "Approved. AdSnitch never publishes; your team posts it."
              : actor.role === "creator"
              ? highRisk.length
                ? `${highRisk.length} high-risk issue${highRisk.length === 1 ? "" : "s"} open. A reviewer must sign off on these.`
                : "Fix or dismiss issues, then send for approval."
              : isOwn
              ? "You wrote this ad, so someone else has to approve it."
              : highRisk.length
              ? `Approving signs off on ${highRisk.length} high-risk issue${highRisk.length === 1 ? "" : "s"}.`
              : "Review the issues, then approve or ask for changes."}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {actor.role === "creator" ? (
              <Button onClick={sendForApproval} loading={busy === "send"} disabled={status === "approved" || status === "under_review"} icon={<Send className="h-4 w-4" />}>
                {status === "under_review" ? "Waiting for reviewer" : "Send for approval"}
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setApproveOpen("changes_requested")} disabled={!canDecide}>
                  Request changes
                </Button>
                <Button onClick={() => setApproveOpen("approved")} disabled={!canDecide || status === "approved"} icon={<Check className="h-4 w-4" />}>
                  Approve
                </Button>
              </>
            )}
          </div>
        </div>

        {toast && (
          <div
            role={toast.tone === "err" ? "alert" : "status"}
            className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-sm ${
              toast.tone === "err" ? "border-status-critical/30 bg-status-critical/10 text-status-critical" : "border-border-default bg-panel text-text-primary"
            }`}
          >
            <span className="flex items-start gap-2">
              {toast.tone === "ok" && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-success" aria-hidden />}
              {toast.text}
            </span>
            <button type="button" onClick={() => setToast(null)} aria-label="Dismiss message" className="shrink-0 cursor-pointer text-text-muted hover:text-text-primary">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Copy */}
          <section className="space-y-4 lg:col-span-7" aria-label="Your ad copy">
            <div className="glass overflow-hidden rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-default px-5 py-3">
                <h2 className="text-base font-semibold text-text-primary">Your ad</h2>
                <div className="flex flex-wrap items-center gap-1">
                  {!editing && (
                    <div className="inline-flex rounded-lg border border-border-default bg-panel p-0.5" role="group" aria-label="View">
                      {(
                        [
                          ["annotated", "Issues", Eye],
                          ["diff", "Before / after", GitCompare],
                        ] as const
                      ).map(([v, label, Icon]) => (
                        <button
                          key={v}
                          type="button"
                          aria-pressed={view === v}
                          onClick={() => setView(v)}
                          className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] cursor-pointer ${view === v ? "bg-ink text-ghost" : "text-text-secondary hover:text-text-primary"}`}
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
                        </button>
                      ))}
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={editing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                    onClick={() => {
                      setDraft(content);
                      setEditing(!editing);
                    }}
                  >
                    {editing ? "Cancel" : "Edit"}
                  </Button>
                  <Button size="sm" variant="ghost" loading={checking} onClick={() => reRun(content)} icon={<RefreshCw className="h-4 w-4" />}>
                    Re-check
                  </Button>
                </div>
              </div>

              <div className="p-5">
                {editing ? (
                  <div className="space-y-3">
                    <label htmlFor="edit-copy" className="sr-only">
                      Edit ad copy
                    </label>
                    <textarea
                      id="edit-copy"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={9}
                      className="w-full resize-y rounded-lg glass-inset p-4 font-sans text-[15px] leading-relaxed text-text-primary focus:outline-none focus:ring-2 focus:ring-blue/50"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[13px] text-text-muted" aria-live="polite">
                        Estimated score while you type: <span className="font-medium tabular-nums text-text-primary">{estimate}</span>
                      </span>
                      <Button
                        size="sm"
                        loading={busy === "Edited the copy"}
                        disabled={draft === content || !draft.trim()}
                        onClick={async () => {
                          await saveContent(draft, "Edited the copy");
                          setEditing(false);
                        }}
                      >
                        Save and re-check
                      </Button>
                    </div>
                  </div>
                ) : view === "diff" ? (
                  <DiffView before={original} after={content} />
                ) : (
                  <HighlightedCopy content={content} findings={openFindings} selectedId={selectedId} onSelect={(fid) => select(fid, "copy")} />
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-default px-5 py-3 text-[13px] text-text-muted">
                <span className="tabular-nums">{content.length.toLocaleString()} characters</span>
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="ghost" icon={<Copy className="h-4 w-4" />} onClick={() => copy(content, "Ad copy")}>
                    Copy text
                  </Button>
                  <Button size="sm" variant="ghost" icon={<Copy className="h-4 w-4" />} onClick={() => copy(markdown(), "Report")}>
                    Copy report
                  </Button>
                  <Button size="sm" variant="ghost" icon={<Download className="h-4 w-4" />} onClick={download}>
                    Download .md
                  </Button>
                </div>
              </div>
            </div>

            {pendingRevision && (
              <div className="glass space-y-3 rounded-2xl p-5">
                <h3 className="flex items-center gap-2 text-base font-semibold text-text-primary">
                  <Sparkles className="h-4 w-4" aria-hidden /> Suggested rewrite
                </h3>
                <DiffView before={content} after={pendingRevision.revisedText} />
                {pendingRevision.reasoning && <p className="text-[13px] leading-relaxed text-text-muted">{pendingRevision.reasoning}</p>}
                <Button
                  size="sm"
                  loading={busy === "Used the suggested rewrite"}
                  onClick={() => saveContent(pendingRevision.revisedText, "Used the suggested rewrite", pendingRevision.id)}
                  icon={<Check className="h-4 w-4" />}
                >
                  Use this rewrite
                </Button>
              </div>
            )}
          </section>

          {/* Findings */}
          <section className="space-y-3 lg:col-span-5" aria-label="Issues">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-text-primary">
                Issues <span className="font-normal text-text-muted">({openFindings.length} open of {findings.length})</span>
              </h2>
              {safeFixes.length > 0 && (
                <Button size="sm" variant="secondary" onClick={applyAllSafe} loading={!!busy?.startsWith("Applied ")} icon={<Check className="h-4 w-4" />}>
                  Apply all {safeFixes.length} suggested fixes
                </Button>
              )}
            </div>
            {findings.length === 0 ? (
              <div className="glass rounded-2xl p-6 text-center">
                <CheckCircle2 className="mx-auto h-6 w-6 text-status-success" aria-hidden />
                <p className="mt-2 text-sm font-medium text-text-primary">No issues found</p>
                <p className="mt-1 text-[13px] text-text-muted">Every claim matched the approved library for this brand.</p>
              </div>
            ) : (
              findings.map((f) => (
                <FindingCard
                  key={f.id}
                  finding={f}
                  status={effectiveStatus(f, liveText)}
                  expanded={expandedId === f.id}
                  selected={selectedId === f.id}
                  busy={!!busy?.includes(`“${f.flaggedText}”`)}
                  onToggle={() => {
                    if (expandedId === f.id) setExpandedId(null);
                    else select(f.id, "card");
                  }}
                  onApply={() => applyFix(f)}
                  onDismiss={() => setReasonModal({ kind: "dismiss", finding: f })}
                  onDispute={() => setReasonModal({ kind: "dispute", finding: f })}
                  onOverride={() =>
                    actor.role === "creator" ? flash("Only a reviewer or admin can override an issue. Use Dispute instead.", "err") : setReasonModal({ kind: "override", finding: f })
                  }
                  onEvidence={() => setEvidenceFinding(f)}
                />
              ))
            )}

            <dl className="glass grid grid-cols-2 gap-3 rounded-2xl p-5 text-[13px]">
              {[
                ["Author", creator.name],
                ["Campaign", submission.metadata?.campaign || "None"],
                ["Submitted", fmtTime(submission.created_at)],
                ["Reference", submission.id.slice(0, 8)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-text-muted">{k}</dt>
                  <dd className="mt-0.5 break-words text-text-primary">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {/* Audit timeline */}
        <section className="glass rounded-2xl p-6" aria-labelledby="audit-h">
          <h2 id="audit-h" className="text-base font-semibold text-text-primary">
            Audit trail
          </h2>
          <p className="mt-1 text-[13px] text-text-muted">Every change, decision and reason on this ad, newest first.</p>
          <ol className="mt-4 space-y-0" aria-live="polite">
            {audit.map((a, i) => (
              <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                <span aria-hidden className="relative flex w-3 justify-center">
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-ink" />
                  {i < audit.length - 1 && <span className="absolute top-4 bottom-0 w-px bg-border-default" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{a.action}</span>
                    <span className="text-text-muted">
                      {" "}
                      by {a.actor}
                      {a.role ? ` (${a.role})` : ""}
                    </span>
                  </p>
                  {a.reason && <p className="mt-0.5 text-[13px] text-text-secondary">Reason: {a.reason}</p>}
                  <time dateTime={a.time} className="text-xs text-text-muted">
                    {fmtTime(a.time)}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {reasonModal && (
        <ReasonModal
          kind={reasonModal.kind}
          finding={reasonModal.finding}
          signer={`${actor.name} (${actor.role})`}
          busy={busy === reasonModal.kind}
          onClose={() => setReasonModal(null)}
          onConfirm={(reason, ev) => findingAction(reasonModal.kind, reasonModal.finding, reason, ev)}
        />
      )}
      {evidenceFinding && (
        <EvidenceModal
          finding={evidenceFinding}
          onClose={() => setEvidenceFinding(null)}
          onApply={
            evidenceFinding.suggestedCorrection && effectiveStatus(evidenceFinding, content) === "open"
              ? () => {
                  applyFix(evidenceFinding);
                  setEvidenceFinding(null);
                }
              : undefined
          }
        />
      )}
      {approveOpen && <DecisionModal decision={approveOpen} highRisk={highRisk.length} busy={busy === "decide"} onClose={() => setApproveOpen(null)} onConfirm={decide} />}
    </AppLayout>
  );
}

function DecisionModal({
  decision,
  highRisk,
  busy,
  onClose,
  onConfirm,
}: {
  decision: "approved" | "changes_requested";
  highRisk: number;
  busy: boolean;
  onClose: () => void;
  onConfirm: (d: "approved" | "changes_requested", notes: string) => void;
}) {
  const [notes, setNotes] = useState("");
  const [ack, setAck] = useState(false);
  const approving = decision === "approved";
  const needsAck = approving && highRisk > 0;
  const blocked = (!approving && !notes.trim()) || (needsAck && (!ack || !notes.trim()));
  return (
    <Modal
      title={approving ? "Approve this ad" : "Ask for changes"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" loading={busy} disabled={blocked} onClick={() => onConfirm(decision, notes.trim() || "Approved after review.")}>
            {approving ? "Approve" : "Send back"}
          </Button>
        </>
      }
    >
      {needsAck && (
        <p className="rounded-lg border border-status-critical/30 bg-status-critical/10 p-3 text-sm text-text-primary">
          {highRisk} high-risk issue{highRisk === 1 ? " is" : "s are"} still open. Approving means you sign off on {highRisk === 1 ? "it" : "them"}, and a reason is required.
        </p>
      )}
      <div className="space-y-2">
        <label htmlFor="decision-notes" className="text-sm font-medium">
          {approving ? (needsAck ? "Sign-off reason" : "Note (optional)") : "What needs to change?"}
        </label>
        <textarea
          id="decision-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full resize-none rounded-lg glass-inset p-3 font-sans text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue/50"
        />
      </div>
      {needsAck && (
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 h-4 w-4" />I reviewed the high-risk issues and take responsibility for this sign-off.
        </label>
      )}
    </Modal>
  );
}

export default function SubmissionReviewPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-text-muted">Loading your review…</div>}>
      <SubmissionReviewInner params={params} />
    </React.Suspense>
  );
}
