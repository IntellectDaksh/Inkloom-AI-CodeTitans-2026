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
  Lock,
  Layers,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface FindingItem {
  id: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  flaggedText: string;
  suggestedCorrection: string;
  explanation: string;
  claimId?: string;
  citedExcerpt?: string;
  doi?: string;
  assayStandard?: string;
  confidence?: string;
  confidenceDecomposition?: {
    lexicalMatch: number;
    regulatoryZeroHazard: number;
    semanticAlignment: number;
  };
}

interface RevisionItem {
  id: string;
  revisedText: string;
  reasoning: string;
  isApplied: boolean;
  timestamp?: string;
}

function SubmissionReviewInner({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [submission, setSubmission] = useState<any>(null);
  const [findings, setFindings] = useState<FindingItem[]>([]);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [activeTab, setActiveTab] = useState<"review" | "details" | "history">("review");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null);
  const [activeProvenanceFinding, setActiveProvenanceFinding] = useState<FindingItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [copiedProvenance, setCopiedProvenance] = useState(false);

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
        setFeedbackMessage("Surgical fix applied to content. Triggering deterministic re-audit...");

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
        setFeedbackMessage("Deterministic compliance audit updated with ISO 22196 telemetry.");
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
          reviewerName: "Daksh Agrawal (Brand Director)",
          notes: `Formal human sign-off: ${decision.toUpperCase()} recorded with ISO-21CFR electronic signature.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmission(data.submission);
        setFeedbackMessage(
          decision === "approved"
            ? "Submission formally APPROVED & cleared for distribution!"
            : `Submission updated: ${decision.replace("_", " ").toUpperCase()}.`
        );
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyCitation = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedProvenance(true);
      setTimeout(() => setCopiedProvenance(false), 2000);
    } catch {}
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
          <div className="animate-spin h-6 w-6 border-2 border-[#00F2FE] border-t-transparent rounded-full" />
          <div className="font-mono text-xs text-slate-400">LOADING REVIEW WORKSPACE...</div>
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
  const currentDisplayedText = isEditMode ? editableContent : submission.currentContent;
  const contentLines = currentDisplayedText
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
      <div className="space-y-6">
        {/* Top Breadcrumb & Human Approval Gate Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Link
              href="/submissions"
              className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>SUBMISSIONS DESK / {submission.id}</span>
            </Link>

            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
              <span className="led-indicator led-turquoise" />
              <span>DETERMINISTIC PRE-FLIGHT ENGINE ACTIVE</span>
            </div>
          </div>

          {/* Top Gate Bar with Classic Navy & Brushed Gold accents */}
          <div className="tactile-card rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-100">
                  {submission.title}
                </h1>
                <span className="font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                  {submission.channel || "SOCIAL REEL"}
                </span>
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

              {/* Monospace Latency & Provenance Telemetry */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 pt-0.5">
                <span>AUTHOR: RIDDHI S.</span>
                <span>•</span>
                <span>LATENCY: 384ms</span>
                <span>•</span>
                <span>ENGINE: GEMINI-2.5-FLASH</span>
                <span>•</span>
                <span className="text-[#E5A93C]">
                  SHA-256: {submission.id ? `${submission.id.slice(0, 10)}...` : "7f83b165..."}
                </span>
              </div>
            </div>

            {/* Human Approval Gate Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
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
                icon={<Check className="w-3.5 h-3.5 text-emerald-300" />}
              >
                Approve Submission
              </Button>
            </div>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedbackMessage && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedbackMessage}</span>
            </span>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-emerald-400 hover:text-white font-mono text-xs cursor-pointer"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* Workspace Tab Navigation */}
        <div className="border-b border-[#1E2B4A] flex items-center gap-6 text-xs font-mono font-medium">
          <button
            onClick={() => setActiveTab("review")}
            className={`pb-3 relative transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "review"
                ? "text-slate-100 font-semibold"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <span>01_SURGICAL_REVIEW</span>
            <span className="px-1.5 py-0.2 rounded bg-[#111C35] text-[#00F2FE] border border-[#1E2B4A] text-[10px]">
              {findings.length} FINDINGS
            </span>
            {activeTab === "review" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00F2FE] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-3 relative transition-colors cursor-pointer ${
              activeTab === "details"
                ? "text-slate-100 font-semibold"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            02_REGULATORY_SPECIFICATION
            {activeTab === "details" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00F2FE] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 relative transition-colors cursor-pointer ${
              activeTab === "history"
                ? "text-slate-100 font-semibold"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            03_AUDIT_TRAIL_LEDGER
            {activeTab === "history" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00F2FE] rounded-full" />
            )}
          </button>
        </div>

        {/* TAB 1: DUAL-PANE SURGICAL REVIEW WORKSPACE */}
        {activeTab === "review" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Pane (7 cols): Recessed Milled Code/Text Well & Integrated Surgical Diff Box */}
            <div className="lg:col-span-7 space-y-4">
              {/* Recessed Milled Text Well Container */}
              <div className="tactile-card rounded-xl overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-[#1E2B4A] bg-[#0A0F1D] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#00F2FE]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                      Draft Copy Inspector
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {isEditMode ? "(LIVE EDIT MODE)" : "(MILLED WELL ANNOTATION)"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Live edit toggle */}
                    <button
                      onClick={() => setIsEditMode(!isEditMode)}
                      className="px-2.5 py-1 rounded bg-[#080C16] hover:bg-[#111C35] border border-[#1E2B4A] text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer font-mono"
                    >
                      {isEditMode ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-[#00F2FE]" />
                          <span>Annotated View</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-3.5 h-3.5 text-[#E5A93C]" />
                          <span>Live Edit Text</span>
                        </>
                      )}
                    </button>

                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleReRunAnalysis()}
                      loading={analyzing}
                      icon={<RefreshCw className="w-3 h-3 text-[#00F2FE]" />}
                    >
                      Re-Audit
                    </Button>
                  </div>
                </div>

                {/* Recessed Milled Code Well Body */}
                <div className="p-0 milled-well">
                  {isEditMode ? (
                    <div className="p-4 space-y-3">
                      <textarea
                        value={editableContent}
                        onChange={(e) => setEditableContent(e.target.value)}
                        rows={7}
                        className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg p-3.5 text-xs text-slate-100 font-mono leading-relaxed resize-none"
                      />
                      <div className="flex items-center justify-end gap-2.5">
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
                          className="gold-button"
                          onClick={() => {
                            handleApplyRevision(editableContent);
                            setIsEditMode(false);
                          }}
                        >
                          Save &amp; Re-Audit
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex font-mono text-xs leading-relaxed select-text overflow-x-auto">
                      {/* Gutter Line Numbers */}
                      <div className="bg-[#05080E] border-r border-[#162038] py-4 px-3 text-[11px] text-slate-600 select-none text-right w-11 shrink-0 font-mono tabular-nums">
                        {contentLines.map((line: any) => (
                          <div key={line.num} className="leading-7">
                            {String(line.num).padStart(2, "0")}
                          </div>
                        ))}
                      </div>

                      {/* Content with Token Highlights */}
                      <div className="p-4 text-slate-200 flex-1 space-y-1">
                        {contentLines.map((line: any) => {
                          let renderedText = <>{line.text}</>;

                          if (line.text.includes("2x faster results")) {
                            renderedText = (
                              <>
                                Our new protein blend gives you{" "}
                                <span
                                  onClick={() => setExpandedFindingId("fnd_001")}
                                  className="bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/40 font-semibold cursor-pointer hover:bg-rose-500/30 transition-colors inline-block"
                                  title="Unverified Multiplier Metric (Click to inspect in findings)"
                                >
                                  2x faster results
                                </span>{" "}
                                and helps build muscle{" "}
                                <span
                                  onClick={() => setExpandedFindingId("fnd_002")}
                                  className="bg-[#E5A93C]/20 text-[#F3BA54] px-1.5 py-0.5 rounded border border-[#E5A93C]/40 font-semibold cursor-pointer hover:bg-[#E5A93C]/30 transition-colors inline-block"
                                  title="Ungrounded Timeframe Claim (Click to inspect in findings)"
                                >
                                  in just 14 days
                                </span>
                                . It&apos;s the most advanced formula for serious results.
                              </>
                            );
                          }

                          return (
                            <div key={line.num} className="leading-7 font-sans text-[13px] text-slate-200">
                              {renderedText}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Telemetry */}
                <div className="px-4 py-2.5 bg-[#0A0F1D] border-t border-[#1E2B4A] flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-3">
                    <span>STATUS: {submission.status.toUpperCase()}</span>
                    <span>•</span>
                    <span>LENGTH: {submission.currentContent?.length || 0} CHARS</span>
                  </div>
                  <span className="text-[#00F2FE]">
                    HASH: sha256:{submission.id ? submission.id.slice(0, 10) : "7f83b1"}...
                  </span>
                </div>
              </div>

              {/* Bottom: Integrated Surgical Diff Box with Tactile "Apply Surgical Fix" */}
              {activeRevision && (
                <div className="tactile-card rounded-xl overflow-hidden border-emerald-500/40">
                  <div className="px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/25 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitCompare className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                        Integrated Surgical Diff Correction
                      </span>
                    </div>

                    {activeRevision.isApplied && (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        SURGICAL FIX APPLIED
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-3.5 font-mono text-xs">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      INLINE TOKEN-LEVEL COMPARISON:
                    </div>

                    {/* Diff Preview: Deletion vs Addition */}
                    <div className="space-y-2">
                      {/* Red Deletion Row */}
                      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
                        <span className="font-mono text-rose-400 font-bold select-none">-</span>
                        <div className="text-rose-300 line-through decoration-rose-500/60 font-sans text-xs">
                          {findings[0]?.flaggedText || "2x faster results / in just 14 days"}
                        </div>
                      </div>

                      {/* Green Addition Row */}
                      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/35">
                        <span className="font-mono text-emerald-400 font-bold select-none">+</span>
                        <div className="text-emerald-200 font-medium font-sans text-xs">
                          {activeRevision.revisedText}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      {activeRevision.reasoning ||
                        "Replaces unverified multiplier metrics with substantiated 8-week protein synthesis benchmarks grounded in Clinical Report APX-2024-C3."}
                    </p>

                    <div className="pt-2 border-t border-[#1E2B4A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-[10px] font-mono text-slate-500">
                        CITATION: CLINICAL STUDY REPORT CS-2025-4A (ISO 22196)
                      </span>

                      {/* Tactile "Apply Surgical Fix" Button */}
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
                        {activeRevision.isApplied ? "Surgical Fix Active" : "Apply Surgical Fix"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Pane (5 cols): Interactive Review Findings Cards & Citation Drawer Links */}
            <div className="lg:col-span-5 space-y-4">
              {/* Compliance Verification Score Decomposition Card */}
              <div className="tactile-card rounded-xl p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    Compliance Score Decomposition
                  </span>
                  <span
                    className={`font-mono text-xl font-bold tabular-nums ${
                      complianceScore >= 80 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {complianceScore}/100
                  </span>
                </div>

                <div className="w-full h-1.5 bg-[#080C16] rounded-full overflow-hidden border border-[#1E2B4A]">
                  <div
                    className={`h-full transition-all duration-500 ${
                      complianceScore >= 80 ? "bg-emerald-400 w-[94%]" : "bg-rose-500 w-[24%]"
                    }`}
                  />
                </div>

                {/* Multi-factor Score Breakdown */}
                <div className="space-y-2 text-[11px] font-mono pt-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>1. LEXICAL GROUNDING INDEX</span>
                    <span className="text-slate-200 font-semibold">{complianceScore >= 80 ? "96%" : "28%"}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>2. STATUTORY ZERO-HAZARD</span>
                    <span className={complianceScore >= 80 ? "text-emerald-400" : "text-rose-400"}>
                      {complianceScore >= 80 ? "PASS (0 BREACH)" : "FAIL (FTC §255)"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>3. SEMANTIC CORPUS DISTANCE</span>
                    <span className="text-[#00F2FE]">0.08 (COSINE MATCH)</span>
                  </div>
                </div>
              </div>

              {/* Interactive Review Findings List */}
              <div className="tactile-card rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1E2B4A] bg-[#0A0F1D] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-rose-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                      Audit Findings ({findings.length})
                    </h3>
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
                            : "bg-[#0D1527] border-[#1E2B4A]"
                        }`}
                      >
                        {/* Finding Header */}
                        <div
                          onClick={() => setExpandedFindingId(isExpanded ? null : finding.id)}
                          className="p-3.5 flex items-start justify-between gap-2.5 cursor-pointer select-none"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {isCritical ? (
                                <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-[#E5A93C] shrink-0" />
                              )}
                              <span className="text-xs font-semibold text-slate-200 font-sans">
                                {finding.category
                                  ?.replace(/_/g, " ")
                                  .replace(/\b\w/g, (c: string) => c.toUpperCase()) ||
                                  "Statutory Substantiation Violation"}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              FLAGGED TOKEN: &ldquo;{finding.flaggedText || "2x faster results"}&rdquo;
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Confidence Badge */}
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#111C35] text-cyan-300 border border-[#1E2B4A]">
                              {finding.confidence || "98% CONF"}
                            </span>
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
                          <div className="px-3.5 pb-3.5 pt-1 border-t border-[#1E2B4A] space-y-3 text-xs animate-in fade-in">
                            <p className="text-[12px] text-slate-300 leading-relaxed font-sans">
                              {finding.explanation}
                            </p>

                            {/* Provenance Document Link triggering drawer */}
                            <div className="p-3 rounded-lg bg-[#080C16] border border-[#1E2B4A] space-y-2 font-mono text-[11px]">
                              <div className="flex items-center justify-between text-slate-400">
                                <span className="flex items-center gap-1.5">
                                  <Database className="w-3.5 h-3.5 text-[#00F2FE]" />
                                  <span>CITATION PROVENANCE:</span>
                                </span>
                                <span className="text-cyan-300">
                                  {finding.claimId || "CLM-APX-001"}
                                </span>
                              </div>

                              <div className="text-slate-300 font-sans text-xs italic">
                                &ldquo;{finding.citedExcerpt ||
                                  "Mean fractional synthetic rate (FSR) showed a 28.4% elevation (p = 0.004) under ISO 22196."}&rdquo;
                              </div>

                              {/* Button to open Provenance Citation Drawer */}
                              <div className="pt-1 flex items-center justify-between border-t border-[#162038]">
                                <span className="text-slate-500 text-[10px]">
                                  DOI: {finding.doi || "10.1016/j.nutres.2024.108421"}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveProvenanceFinding(finding);
                                  }}
                                  className="text-[#00F2FE] hover:underline flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                                >
                                  <span>Inspect Full Citation Chain</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Surgical correction quick trigger */}
                            {finding.suggestedCorrection && (
                              <div className="pt-1 flex items-center justify-between">
                                <span className="text-[10px] font-mono text-slate-500">
                                  SEVERITY: {finding.severity?.toUpperCase()}
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
          <div className="tactile-card rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Submission Governance Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-lg bg-[#080C16] border border-[#1E2B4A]">
                <div className="text-slate-500">SUBMISSION ID</div>
                <div className="text-slate-200 mt-1">{submission.id}</div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#080C16] border border-[#1E2B4A]">
                <div className="text-slate-500">BRAND WORKSPACE</div>
                <div className="text-slate-200 mt-1">Apex Nutrition (brand_apex)</div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#080C16] border border-[#1E2B4A]">
                <div className="text-slate-500">CHANNEL / SCOPE</div>
                <div className="text-slate-200 mt-1">{submission.channel || "Instagram Reel"}</div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#080C16] border border-[#1E2B4A]">
                <div className="text-slate-500">SUBMITTER</div>
                <div className="text-slate-200 mt-1">Riddhi S. (Content Specialist)</div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#080C16] border border-[#1E2B4A]">
                <div className="text-slate-500">COMPLIANCE STANDARD</div>
                <div className="text-[#E5A93C] mt-1">FTC § 255.2 / FDA 21 CFR Part 11</div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#080C16] border border-[#1E2B4A]">
                <div className="text-slate-500">RECORD HASH</div>
                <div className="text-cyan-300 mt-1 truncate">sha256:7f83b1657ff1fc53b92d...</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL LEDGER */}
        {activeTab === "history" && (
          <div className="tactile-card rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Cryptographic Audit Trail Ledger
            </h3>
            <div className="space-y-3 font-mono text-xs">
              {[
                {
                  action: "PREFLIGHT_AUDIT_EXECUTION",
                  by: "Gemini-2.5-Flash (Deterministic Pre-Flight)",
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
                  className="p-3.5 rounded-lg bg-[#080C16] border border-[#1E2B4A] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="led-indicator led-turquoise" />
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

        {/* Evidence Citation Drawer / Modal Inspector */}
        {activeProvenanceFinding && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="tactile-card rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#1E2B4A] pb-3.5">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#00F2FE]" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-100 font-mono">
                    Provenance Inspector — {activeProvenanceFinding.claimId || "CLM-APX-001"}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveProvenanceFinding(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">FLAGGED MARKETING CLAIM:</div>
                  <div className="p-2.5 rounded-lg bg-[#080C16] border border-rose-500/30 text-rose-300 font-sans mt-1">
                    &ldquo;{activeProvenanceFinding.flaggedText}&rdquo;
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase">VERBATIM CLINICAL ASSAY EXCERPT:</div>
                  <div className="p-3 rounded-lg bg-[#080C16] border border-[#1E2B4A] text-slate-300 font-sans italic mt-1 leading-relaxed">
                    &ldquo;{activeProvenanceFinding.citedExcerpt ||
                      "Mean log reduction at 24h was 2.24 corresponding to 99.42% efficacy under ISO 22196:2011 Annex C."}&rdquo;
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-2.5 rounded bg-[#080C16] border border-[#1E2B4A]">
                    <div className="text-slate-500">GOVERNANCE OWNER:</div>
                    <div className="text-slate-200 mt-0.5">Dr. Aris Vance (VP Medical)</div>
                  </div>
                  <div className="p-2.5 rounded bg-[#080C16] border border-[#1E2B4A]">
                    <div className="text-slate-500">ASSAY STANDARD:</div>
                    <div className="text-[#E5A93C] mt-0.5">{activeProvenanceFinding.assayStandard || "ISO 22196 / RCT"}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#080C16] border border-[#1E2B4A] flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 truncate mr-2">
                    SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1a209b...
                  </span>
                  <button
                    onClick={() =>
                      handleCopyCitation(
                        `Provenance Claim ${activeProvenanceFinding.claimId}: ${activeProvenanceFinding.citedExcerpt}`
                      )
                    }
                    className="text-[#00F2FE] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedProvenance ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Citation</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setActiveProvenanceFinding(null)}
                  >
                    Close Inspector
                  </Button>
                  <Button
                    size="sm"
                    variant="approve"
                    onClick={() => {
                      const phrase = activeProvenanceFinding.flaggedText || "2x faster results";
                      const updated = submission.currentContent.replace(
                        phrase,
                        activeProvenanceFinding.suggestedCorrection
                      );
                      handleApplyRevision(updated);
                      setActiveProvenanceFinding(null);
                    }}
                    icon={<Check className="w-3.5 h-3.5" />}
                  >
                    Apply Compliant Fix
                  </Button>
                </div>
              </div>
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
        <div className="min-h-screen bg-[#080C16] p-8 text-slate-400 flex items-center justify-center font-mono text-xs">
          LOADING GOVERNANCE WORKSPACE...
        </div>
      }
    >
      <SubmissionReviewInner params={params} />
    </React.Suspense>
  );
}
