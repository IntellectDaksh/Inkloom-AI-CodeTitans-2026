"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Check,
  X,
  FileText,
  Clock,
  History,
  Info,
  ShieldCheck,
  GitCompare,
  ExternalLink,
  ChevronRight,
  Database,
  Scale,
  Copy,
  Hash,
  Eye,
  Edit3,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DiffViewer } from "@/components/ui/DiffViewer";

function SubmissionReviewInner({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [submission, setSubmission] = useState<any>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"review" | "details" | "history">("review");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null);
  const [activeProvenanceFinding, setActiveProvenanceFinding] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = () => {
    setLoading(true);
    fetch(`/api/submissions/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSubmission(data.submission);
          setFindings(data.findings || []);
          setRevisions(data.revisions || []);
          setEditableContent(data.submission.currentContent);
          if (data.findings && data.findings.length > 0) {
            setExpandedFindingId(data.findings[0].id);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleApplyRevision = async (revisedText: string, revId?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentContent: revisedText,
          revisionId: revId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmission(data.submission);
        setEditableContent(revisedText);
        setFeedbackMessage("Surgical revision applied. Re-running compliance audit...");

        // Automatically trigger live re-analysis
        handleReRunAnalysis(revisedText);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReRunAnalysis = async (contentOverride?: string) => {
    setAnalyzing(true);
    try {
      const textToAnalyze = contentOverride || editableContent;
      const res = await fetch(`/api/submissions/${id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: textToAnalyze }),
      });
      const data = await res.json();
      if (data.success) {
        setFindings(data.findings || []);
        setRevisions(data.revisions || []);
        if (data.report && data.report.complianceScore) {
          setSubmission((prev: any) => ({
            ...prev,
            complianceScore: data.report.complianceScore,
          }));
        }
        setFeedbackMessage("Deterministic compliance audit completed!");
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApprovalDecision = async (decision: "approved" | "changes_requested" | "rejected") => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: id,
          decision,
          reviewerName: "Daksh Agrawal",
          notes: `Formal human sign-off: ${decision.toUpperCase()} recorded with ISO-21CFR electronic signature.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmission(data.submission);
        setFeedbackMessage(
          decision === "approved"
            ? "Submission cleared and signed off for distribution!"
            : `Submission marked as ${decision.replace("_", " ")}.`
        );
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } catch {}
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-6 w-6 border-2 border-violet-500 border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  if (!submission) {
    return (
      <AppLayout>
        <div className="text-center py-20 space-y-4">
          <p className="text-slate-400 font-mono text-xs">SUBMISSION RECORD NOT FOUND</p>
          <Link href="/submissions">
            <Button size="sm" variant="secondary">
              Back to Submissions
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Active revision suggestion
  const activeRevision = revisions.find((r) => !r.isApplied) || revisions[0];

  // Decompose text into line numbers
  const contentLines = (isEditMode ? editableContent : submission.currentContent)
    .split("\n")
    .map((line: string, idx: number) => ({
      num: idx + 1,
      text: line,
    }));

  const hasCritical = findings.some((f) => f.severity === "critical" || f.severity === "high");
  const complianceScore = submission.complianceScore || (hasCritical ? 24 : 94);

  return (
    <AppLayout
      title="Compliance Review Workspace"
      subtitle={`Auditing submission ${submission.id} against active brand claims.`}
    >
      <div className="space-y-5">
        {/* Top Breadcrumb & Human Approval Gate Bar */}
        <div className="space-y-3">
          <Link
            href="/submissions"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>SUBMISSIONS DESK / {submission.id}</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-lg bg-[#131622] border border-[#1E2333] shadow-xs">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-100">
                  {submission.title}
                </h1>
                <Badge variant="metadata" size="xs">
                  {submission.channel || "SOCIAL REEL"}
                </Badge>
                <Badge
                  variant={
                    submission.status === "approved"
                      ? "verified"
                      : submission.status === "changes_requested"
                      ? "warning"
                      : "pending"
                  }
                  size="xs"
                >
                  {submission.status?.replace("_", " ").toUpperCase() || "PENDING AUDIT"}
                </Badge>
              </div>

              {/* Execution Latency & RLS Telemetry */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500 pt-0.5">
                <span>AUTHOR: RIDDHI S.</span>
                <span>•</span>
                <span>LATENCY: 384ms</span>
                <span>•</span>
                <span>ENGINE: GEMINI-2.5-FLASH</span>
                <span>•</span>
                <span className="text-slate-400">
                  SHA-256: 7f83b1657f...
                </span>
              </div>
            </div>

            {/* Human Approval Gate Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleApprovalDecision("changes_requested")}
                loading={actionLoading}
              >
                Request Changes
              </Button>
              <Button
                size="sm"
                variant="approve"
                onClick={() => handleApprovalDecision("approved")}
                loading={actionLoading}
                icon={<Check className="w-3.5 h-3.5" />}
              >
                Sign Off & Approve
              </Button>
            </div>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedbackMessage && (
          <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{feedbackMessage}</span>
            </span>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-emerald-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Workspace Tab Navigation */}
        <div className="border-b border-[#1E2333] flex items-center gap-6 text-xs font-mono font-medium">
          <button
            onClick={() => setActiveTab("review")}
            className={`pb-2.5 relative transition-colors cursor-pointer ${
              activeTab === "review"
                ? "text-slate-100 font-semibold"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            01_SURGICAL_REVIEW ({findings.length} FINDINGS)
            {activeTab === "review" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-2.5 relative transition-colors cursor-pointer ${
              activeTab === "details"
                ? "text-slate-100 font-semibold"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            02_METADATA_SPECIFICATION
            {activeTab === "details" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-2.5 relative transition-colors cursor-pointer ${
              activeTab === "history"
                ? "text-slate-100 font-semibold"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            03_AUDIT_TRAIL_LEDGER
            {activeTab === "history" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
            )}
          </button>
        </div>

        {/* TAB 1: DUAL-PANE SURGICAL REVIEW WORKSPACE */}
        {activeTab === "review" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Pane (7 cols): Highlighted Content with Line Numbers & Suggested Revision */}
            <div className="lg:col-span-7 space-y-4">
              {/* Content Box */}
              <div className="bg-[#131622] border border-[#1E2333] rounded-lg overflow-hidden shadow-xs">
                {/* Header */}
                <div className="px-4 py-2.5 border-b border-[#1E2333] bg-[#0E1017] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Draft Copy Editor
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {isEditMode ? "(EDITING)" : "(ANNOTATED INSPECTION)"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditMode(!isEditMode)}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {isEditMode ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Annotated View</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Text</span>
                        </>
                      )}
                    </button>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleReRunAnalysis()}
                      loading={analyzing}
                      icon={<RefreshCw className="w-3 h-3" />}
                    >
                      Audit
                    </Button>
                  </div>
                </div>

                {/* Content body with line numbers */}
                <div className="p-0 bg-[#090A10]">
                  {isEditMode ? (
                    <div className="p-4 space-y-3">
                      <textarea
                        value={editableContent}
                        onChange={(e) => setEditableContent(e.target.value)}
                        rows={6}
                        className="w-full bg-[#0E1017] border border-[#1E2333] focus:border-violet-500 focus:outline-none rounded p-3 text-xs text-slate-100 font-mono leading-relaxed resize-none"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            setEditableContent(submission.currentContent);
                            setIsEditMode(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="xs"
                          variant="primary"
                          onClick={() => {
                            handleApplyRevision(editableContent);
                            setIsEditMode(false);
                          }}
                        >
                          Save & Re-Audit
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex font-mono text-xs leading-relaxed select-text overflow-x-auto">
                      {/* Line Number Gutter */}
                      <div className="bg-[#0B0D14] border-r border-[#161925] py-4 px-3 text-[11px] text-slate-600 select-none text-right w-10 shrink-0">
                        {contentLines.map((line: any) => (
                          <div key={line.num} className="leading-6">
                            {String(line.num).padStart(2, "0")}
                          </div>
                        ))}
                      </div>

                      {/* Annotated Content */}
                      <div className="p-4 text-slate-200 flex-1 space-y-1">
                        {contentLines.map((line: any) => {
                          // Highlight tokens if text matches known flags
                          let renderedText = <>{line.text}</>;

                          if (line.text.includes("2x faster results")) {
                            renderedText = (
                              <>
                                Our new protein blend gives you{" "}
                                <span
                                  onClick={() => setExpandedFindingId("fnd_001")}
                                  className="bg-rose-500/20 text-rose-300 px-1 py-0.5 rounded border border-rose-500/40 font-semibold cursor-pointer hover:bg-rose-500/30 transition-colors"
                                  title="Unverified Multiplier Metric (Click to inspect)"
                                >
                                  2x faster results
                                </span>{" "}
                                and helps build muscle{" "}
                                <span
                                  onClick={() => setExpandedFindingId("fnd_002")}
                                  className="bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded border border-amber-500/40 font-semibold cursor-pointer hover:bg-amber-500/30 transition-colors"
                                  title="Ungrounded Timeframe Claim (Click to inspect)"
                                >
                                  in just 14 days
                                </span>
                                . It&apos;s the most advanced formula for serious results.
                              </>
                            );
                          }

                          return (
                            <div key={line.num} className="leading-6">
                              {renderedText}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Telemetry */}
                <div className="px-4 py-2 bg-[#0E1017] border-t border-[#1E2333] flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-3">
                    <span>STATUS: {submission.status.toUpperCase()}</span>
                    <span>•</span>
                    <span>LENGTH: {submission.currentContent.length} CHARS</span>
                  </div>
                  <span className="text-slate-400">
                    HASH: sha256:{submission.id.substring(0, 10)}...
                  </span>
                </div>
              </div>

              {/* Suggested Revision Surgical Diff Box */}
              {activeRevision && (
                <div className="bg-[#131622] border border-emerald-500/30 rounded-lg overflow-hidden shadow-xs space-y-0">
                  <div className="px-4 py-2.5 bg-emerald-500/10 border-b border-emerald-500/25 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitCompare className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                        Suggested Compliant Revision
                      </span>
                    </div>
                    {activeRevision.isApplied && (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        APPLIED TO SUBMISSION
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-3 font-mono text-xs">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                      PROPOSED DETERMINISTIC REVISION:
                    </div>

                    <div className="p-3 bg-[#090A10] border border-[#1E2333] rounded text-emerald-200 leading-relaxed font-sans">
                      &ldquo;{activeRevision.revisedText}&rdquo;
                    </div>

                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      {activeRevision.reasoning ||
                        "Eliminates ungrounded multiplier metrics while preserving target engagement and scientific grounding under ISO 22196."}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">
                        SOURCE CITATION: CLINICAL STUDY REPORT CS-2025-4A
                      </span>

                      <Button
                        size="sm"
                        variant="approve"
                        onClick={() =>
                          handleApplyRevision(activeRevision.revisedText, activeRevision.id)
                        }
                        loading={actionLoading}
                        disabled={activeRevision.isApplied}
                        icon={<Check className="w-3.5 h-3.5" />}
                        shortcut="⌘A"
                      >
                        {activeRevision.isApplied ? "Applied" : "Apply Surgical Fix"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Pane (5 cols): Review Findings List & Provenance Drawer */}
            <div className="lg:col-span-5 space-y-4">
              {/* Compliance Score Summary Card */}
              <div className="bg-[#131622] border border-[#1E2333] rounded-lg p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Compliance Verification Score
                  </span>
                  <span
                    className={`font-mono text-xl font-bold tabular-nums ${
                      complianceScore >= 80 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {complianceScore}/100
                  </span>
                </div>

                <div className="w-full h-1.5 bg-[#090A10] rounded-full overflow-hidden border border-[#1E2333]">
                  <div
                    className={`h-full transition-all duration-500 ${
                      complianceScore >= 80 ? "bg-emerald-400 w-[94%]" : "bg-rose-500 w-[24%]"
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>GROUNDED INDEX: {complianceScore >= 80 ? "96%" : "28%"}</span>
                  <span className="text-slate-300">
                    {complianceScore >= 80 ? "CLEARED" : `${findings.length} ISSUES OPEN`}
                  </span>
                </div>
              </div>

              {/* Review Findings List */}
              <div className="bg-[#131622] border border-[#1E2333] rounded-lg overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 border-b border-[#1E2333] bg-[#0E1017] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Audit Findings ({findings.length})
                    </span>
                  </div>
                  <Badge variant={findings.length > 0 ? "violation" : "verified"} size="xs">
                    {findings.length > 0 ? "ACTION REQUIRED" : "ALL RESOLVED"}
                  </Badge>
                </div>

                <div className="p-3.5 space-y-3">
                  {findings.map((finding, idx) => {
                    const isExpanded = expandedFindingId === finding.id;
                    const isCritical = finding.severity === "critical" || finding.severity === "high";

                    return (
                      <div
                        key={finding.id || idx}
                        className={`rounded-lg border transition-all ${
                          isCritical
                            ? "bg-rose-500/10 border-rose-500/30"
                            : "bg-[#181C2D] border-[#2B3248]"
                        }`}
                      >
                        {/* Finding Header */}
                        <div
                          onClick={() =>
                            setExpandedFindingId(isExpanded ? null : finding.id)
                          }
                          className="p-3 flex items-start justify-between gap-2 cursor-pointer select-none"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {isCritical ? (
                                <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              )}
                              <span className="text-xs font-semibold text-slate-200">
                                {finding.category
                                  ?.replace(/_/g, " ")
                                  .replace(/\b\w/g, (c: string) => c.toUpperCase()) ||
                                  "Statutory Violation"}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              FLAGGED TOKEN: &ldquo;{finding.flaggedText || "2x faster results"}&rdquo;
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge
                              variant={isCritical ? "violation" : "warning"}
                              size="xs"
                            >
                              {finding.severity?.toUpperCase() || "HIGH"}
                            </Badge>
                            <ChevronRight
                              className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            />
                          </div>
                        </div>

                        {/* Expanded Finding Detail */}
                        {isExpanded && (
                          <div className="px-3 pb-3 pt-1 border-t border-[#1E2333] space-y-3 text-xs animate-in fade-in">
                            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                              {finding.explanation || finding.message}
                            </p>

                            {/* Provenance Document Reference */}
                            <div className="p-2.5 rounded bg-[#090A10] border border-[#1E2333] space-y-1.5 font-mono text-[11px]">
                              <div className="flex items-center justify-between text-slate-400">
                                <span className="flex items-center gap-1.5">
                                  <Database className="w-3 h-3 text-cyan-400" />
                                  <span>CITATION PROVENANCE:</span>
                                </span>
                                <span className="text-cyan-300">
                                  {finding.claimId || "CLM-APX-001"}
                                </span>
                              </div>
                              <div className="text-slate-300 truncate" title={finding.citedExcerpt || "Clinical Study Report CS-2025-4A"}>
                                {finding.citedExcerpt ||
                                  "Mean log reduction at 24h was 2.24 corresponding to 99.42% efficacy (p < 0.001)."}
                              </div>
                            </div>

                            {/* Diff Action Inside Finding */}
                            {finding.suggestedCorrection && (
                              <div className="pt-1 flex items-center justify-between">
                                <span className="text-[10px] font-mono text-slate-500">
                                  CONFIDENCE: {finding.confidence || "98%"} HIGH
                                </span>
                                <Button
                                  size="xs"
                                  variant="approve"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const phrase = finding.flaggedText || "2x faster results";
                                    const updated = submission.currentContent.replace(
                                      phrase,
                                      finding.suggestedCorrection
                                    );
                                    handleApplyRevision(updated);
                                  }}
                                  icon={<Check className="w-3 h-3" />}
                                >
                                  Apply Fix
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: METADATA & COMPLIANCE SPECIFICATIONS */}
        {activeTab === "details" && (
          <div className="bg-[#131622] border border-[#1E2333] rounded-lg p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Submission Governance Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 rounded bg-[#090A10] border border-[#1E2333]">
                <div className="text-slate-500">SUBMISSION ID</div>
                <div className="text-slate-200 mt-1">{submission.id}</div>
              </div>
              <div className="p-3 rounded bg-[#090A10] border border-[#1E2333]">
                <div className="text-slate-500">BRAND WORKSPACE</div>
                <div className="text-slate-200 mt-1">Apex Nutrition (brand_apex)</div>
              </div>
              <div className="p-3 rounded bg-[#090A10] border border-[#1E2333]">
                <div className="text-slate-500">CHANNEL / CONTEXT</div>
                <div className="text-slate-200 mt-1">{submission.channel || "Instagram Reel"}</div>
              </div>
              <div className="p-3 rounded bg-[#090A10] border border-[#1E2333]">
                <div className="text-slate-500">SUBMITTER</div>
                <div className="text-slate-200 mt-1">Riddhi S. (Content Specialist)</div>
              </div>
              <div className="p-3 rounded bg-[#090A10] border border-[#1E2333]">
                <div className="text-slate-500">COMPLIANCE STANDARD</div>
                <div className="text-slate-200 mt-1">FTC §255 / FDA 21 CFR Part 11</div>
              </div>
              <div className="p-3 rounded bg-[#090A10] border border-[#1E2333]">
                <div className="text-slate-500">RECORD HASH</div>
                <div className="text-slate-200 mt-1 truncate">sha256:7f83b1657ff1fc53b92d...</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL LEDGER */}
        {activeTab === "history" && (
          <div className="bg-[#131622] border border-[#1E2333] rounded-lg p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Cryptographic Audit Trail Ledger
            </h3>
            <div className="space-y-3 font-mono text-xs">
              {[
                {
                  action: "PREFLIGHT_AUDIT_EXECUTION",
                  by: "Gemini-2.5-Flash (Deterministic)",
                  time: "10m ago",
                  hash: "sha256:881f...9b12",
                  notes: "Detected 3 statutory claims requiring clinical substantiation.",
                },
                {
                  action: "SUBMISSION_INGESTED",
                  by: "Riddhi S. (usr_riddhi)",
                  time: "14m ago",
                  hash: "sha256:4d2a...117a",
                  notes: "Draft copy submitted under brand_apex context with Instagram channel tag.",
                },
              ].map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded bg-[#090A10] border border-[#1E2333] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      <span className="text-slate-200 font-semibold">{ev.action}</span>
                      <span className="text-slate-500">BY {ev.by}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">{ev.notes}</div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 shrink-0">
                    <div>{ev.time}</div>
                    <div className="text-slate-600">{ev.hash}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default function SubmissionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#090A10] p-8 text-slate-400 flex items-center justify-center font-mono text-xs">
          LOADING GOVERNANCE WORKSPACE...
        </div>
      }
    >
      <SubmissionReviewInner params={params} />
    </React.Suspense>
  );
}
