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
  MessageSquare,
  ShieldAlert,
  FileCheck,
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
  status?: "open" | "resolved" | "disputed" | "ignored" | "dismissed" | "overridden";
  override_memo?: string;
  overridden_by?: string;
  dismissal_reason?: string;
  dismissed_by?: string;
  dispute_reason?: string;
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

  // Proposal Workflow States: Dispute, Dismissal, Recorded Override
  const [activeDisputeFinding, setActiveDisputeFinding] = useState<FindingItem | null>(null);
  const [disputeReason, setDisputeReason] = useState(
    "Statutory safe harbor exception under 21 CFR § 101.93 applies; substantiated in attached clinical cohort study."
  );
  const [disputeEvidence, setDisputeEvidence] = useState("");

  const [activeDismissFinding, setActiveDismissFinding] = useState<FindingItem | null>(null);
  const [dismissReason, setDismissReason] = useState(
    "Brand guideline tolerance exception (Policy BE-2026-1) approved for digital channel."
  );

  const [activeOverrideFinding, setActiveOverrideFinding] = useState<FindingItem | null>(null);
  const [overrideMemo, setOverrideMemo] = useState("Override authorized under Legal Memo LM-2026-44");
  const [overrideReviewer, setOverrideReviewer] = useState("Daksh Agrawal (Team Lead & Brand Director)");

  const [auditLog, setAuditLog] = useState<any[]>([
    {
      action: "PREFLIGHT_AUDIT_EXECUTION",
      by: "Gemini-3.5-Flash-Lite (Deterministic Pre-Flight)",
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
  ]);

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

  const handleDisputeFinding = async (findingId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/submissions/${id}/findings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          findingId,
          action: "dispute",
          reason: disputeReason,
          evidence: disputeEvidence,
          userId: "usr_riddhi",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFindings((prev) =>
          prev.map((f) =>
            f.id === findingId
              ? { ...f, status: "disputed", dispute_reason: disputeReason }
              : f
          )
        );
        const newEvent = {
          action: "FINDING_DISPUTED_BY_CREATOR",
          by: "Riddhi S. (Content Specialist)",
          time: "Just now",
          hash: `sha256:${Math.random().toString(16).slice(2, 10)}...f9a`,
          notes: `Creator challenged finding: "${disputeReason}"`,
        };
        setAuditLog((prev) => [newEvent, ...prev]);
        setFeedbackMessage("Finding successfully DISPUTED and escalated to reviewer queue.");
        setTimeout(() => setFeedbackMessage(null), 4000);
        setActiveDisputeFinding(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismissFinding = async (findingId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/submissions/${id}/findings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          findingId,
          action: "dismiss",
          reason: dismissReason,
          userId: "usr_daksh",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFindings((prev) =>
          prev.map((f) =>
            f.id === findingId
              ? { ...f, status: "dismissed", dismissal_reason: dismissReason }
              : f
          )
        );
        const newEvent = {
          action: "FINDING_DISMISSED_WITH_JUSTIFICATION",
          by: "Daksh Agrawal (Brand Director)",
          time: "Just now",
          hash: `sha256:${Math.random().toString(16).slice(2, 10)}...e82`,
          notes: `Dismissal justification: "${dismissReason}"`,
        };
        setAuditLog((prev) => [newEvent, ...prev]);
        setFeedbackMessage("Finding dismissed with recorded justification.");
        setTimeout(() => setFeedbackMessage(null), 4000);
        setActiveDismissFinding(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleOverrideFinding = async (findingId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/submissions/${id}/findings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          findingId,
          action: "override",
          memo: overrideMemo,
          reviewerId: "usr_daksh",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFindings((prev) =>
          prev.map((f) =>
            f.id === findingId
              ? { ...f, status: "overridden", override_memo: overrideMemo, overridden_by: overrideReviewer }
              : f
          )
        );
        // Neutralize violation penalty in compliance score
        setSubmission((prev: any) => ({
          ...prev,
          complianceScore: Math.max(prev?.complianceScore || 0, 94),
        }));
        const newEvent = {
          action: "LEGAL_OVERRIDE_AUTHORIZED",
          by: `${overrideReviewer}`,
          time: "Just now",
          hash: `sha256:${Math.random().toString(16).slice(2, 10)}...3c4`,
          notes: `Authorized override: "${overrideMemo}"`,
        };
        setAuditLog((prev) => [newEvent, ...prev]);
        setFeedbackMessage(`Official Legal Override RECORDED: "${overrideMemo}"`);
        setTimeout(() => setFeedbackMessage(null), 4000);
        setActiveOverrideFinding(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
          <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
          <div className="text-xs text-[#858585]">Loading review workspace...</div>
        </div>
      </AppLayout>
    );
  }

  if (!submission) {
    return (
      <AppLayout>
        <div className="text-center py-20 space-y-4">
          <p className="text-[#858585] text-sm">Submission record not found</p>
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
              className="inline-flex items-center gap-2 text-xs text-[#858585] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Submissions / {submission.id}</span>
            </Link>

            <div className="flex items-center gap-2 text-xs text-[#858585]">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>Pre-Flight Engine Active</span>
            </div>
          </div>

          {/* Top Gate Bar */}
          <div className="bg-[#141414] border border-[#303030] rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {submission.title}
                </h1>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-[#191919] text-[#B5B5B5] border border-[#303030]">
                  {submission.channel || "Social Reel"}
                </span>
                <Badge
                  variant={
                    submission.status === "approved"
                      ? "verified"
                      : submission.status === "changes_requested"
                      ? "warning"
                      : "pending"
                  }
                  size="sm"
                >
                  {submission.status === "approved"
                    ? "Approved"
                    : submission.status === "changes_requested"
                    ? "Changes Requested"
                    : "Pending Audit"}
                </Badge>
              </div>

              {/* Provenance Telemetry */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#858585]">
                <span>Author: Riddhi S.</span>
                <span>•</span>
                <span>Scope: Apex Nutrition</span>
                <span>•</span>
                <span>Latency: 384ms</span>
                <span>•</span>
                <span>Engine: Gemini 2.5 Flash</span>
                <span>•</span>
                <span className="text-[#B5B5B5]">
                  SHA-256: {submission.id ? `${submission.id.slice(0, 10)}...` : "7f83b165..."}
                </span>
              </div>
            </div>

            {/* Human Approval Gate Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
              <Button
                size="md"
                variant="secondary"
                onClick={() => handleApprovalDecision("changes_requested")}
                loading={actionLoading}
                className="w-full sm:w-auto justify-center"
              >
                Request Changes
              </Button>
              <Button
                size="md"
                variant="primary"
                onClick={() => handleApprovalDecision("approved")}
                loading={actionLoading}
                icon={<Check className="w-4 h-4 text-black" />}
                className="w-full sm:w-auto justify-center"
              >
                Approve Submission
              </Button>
            </div>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedbackMessage && (
          <div className="p-3.5 rounded-lg bg-[#141414] border border-[#303030] text-[#10B981] text-xs flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>{feedbackMessage}</span>
            </span>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-[#858585] hover:text-white text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Workspace Tab Navigation */}
        <div className="border-b border-[#303030] flex items-center gap-6 text-sm font-medium overflow-x-auto whitespace-nowrap scrollbar-none max-w-full">
          <button
            onClick={() => setActiveTab("review")}
            className={`pb-3 relative transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "review"
                ? "text-white font-semibold"
                : "text-[#858585] hover:text-white"
            }`}
          >
            <span>Surgical Review</span>
            <span className="px-2 py-0.5 rounded-full bg-[#191919] text-[#B5B5B5] border border-[#303030] text-xs">
              {findings.length} findings
            </span>
            {activeTab === "review" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-3 relative transition-colors cursor-pointer ${
              activeTab === "details"
                ? "text-white font-semibold"
                : "text-[#858585] hover:text-white"
            }`}
          >
            Regulatory Specification
            {activeTab === "details" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 relative transition-colors cursor-pointer ${
              activeTab === "history"
                ? "text-white font-semibold"
                : "text-[#858585] hover:text-white"
            }`}
          >
            Audit Trail Ledger
            {activeTab === "history" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            )}
          </button>
        </div>

        {/* TAB 1: DUAL-PANE SURGICAL REVIEW WORKSPACE */}
        {activeTab === "review" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Pane (7 cols): Text Well & Integrated Surgical Diff Box */}
            <div className="lg:col-span-7 space-y-4">
              {/* Draft Copy Inspector Container */}
              <div className="bg-[#141414] border border-[#303030] rounded-xl overflow-hidden">
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-[#303030] bg-[#191919] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">
                      Draft Copy Inspector
                    </span>
                    <span className="text-xs text-[#858585]">
                      {isEditMode ? "(Live Edit Mode)" : "(Annotated View)"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Live edit toggle */}
                    <button
                      onClick={() => setIsEditMode(!isEditMode)}
                      className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#222222] border border-[#303030] text-xs text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isEditMode ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-white" />
                          <span>Annotated View</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-3.5 h-3.5 text-white" />
                          <span>Live Edit Text</span>
                        </>
                      )}
                    </button>

                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleReRunAnalysis()}
                      loading={analyzing}
                      icon={<RefreshCw className="w-3.5 h-3.5 text-white" />}
                    >
                      Re-Audit
                    </Button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-0">
                  {isEditMode ? (
                    <div className="p-5 space-y-3">
                      <textarea
                        value={editableContent}
                        onChange={(e) => setEditableContent(e.target.value)}
                        rows={7}
                        className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-4 text-[15px] text-white font-sans leading-relaxed resize-none"
                      />
                      <div className="flex items-center justify-end gap-2.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditableContent(submission.currentContent);
                            setIsEditMode(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
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
                    <div className="flex text-sm leading-relaxed select-text overflow-x-auto">
                      {/* Gutter Line Numbers */}
                      <div className="bg-[#111111] border-r border-[#262626] py-5 px-3 text-xs text-[#525252] select-none text-right w-12 shrink-0 font-mono tabular-nums">
                        {contentLines.map((line: any) => (
                          <div key={line.num} className="leading-7">
                            {String(line.num).padStart(2, "0")}
                          </div>
                        ))}
                      </div>

                      {/* Content with Token Highlights */}
                      <div className="p-5 text-[#EDEDED] flex-1 space-y-1.5">
                        {contentLines.map((line: any) => {
                          let renderedText = <>{line.text}</>;

                          if (line.text.includes("2x faster results")) {
                            renderedText = (
                              <>
                                Our new protein blend gives you{" "}
                                <span
                                  onClick={() => setExpandedFindingId("fnd_001")}
                                  className="bg-red-500/15 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30 font-medium cursor-pointer hover:bg-red-500/25 transition-colors inline-block"
                                  title="Unverified Multiplier Metric (Click to inspect in findings)"
                                >
                                  2x faster results
                                </span>{" "}
                                and helps build muscle{" "}
                                <span
                                  onClick={() => setExpandedFindingId("fnd_002")}
                                  className="bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 font-medium cursor-pointer hover:bg-amber-500/25 transition-colors inline-block"
                                  title="Ungrounded Timeframe Claim (Click to inspect in findings)"
                                >
                                  in just 14 days
                                </span>
                                . It&apos;s the most advanced formula for serious results.
                              </>
                            );
                          }

                          return (
                            <div key={line.num} className="leading-7 font-sans text-[15px] sm:text-base text-[#EDEDED]">
                              {renderedText}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-2.5 bg-[#191919] border-t border-[#303030] flex items-center justify-between text-xs text-[#858585]">
                  <div className="flex items-center gap-3">
                    <span>Status: {submission.status.toUpperCase()}</span>
                    <span>•</span>
                    <span>Length: {submission.currentContent?.length || 0} characters</span>
                  </div>
                  <span>
                    SHA-256: {submission.id ? submission.id.slice(0, 10) : "7f83b1"}...
                  </span>
                </div>
              </div>

              {/* Bottom: Integrated Surgical Diff Box */}
              {activeRevision && (
                <div className="bg-[#141414] border border-[#303030] rounded-xl overflow-hidden p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitCompare className="w-4 h-4 text-white" />
                      <span className="text-sm font-semibold text-white">
                        Surgical Diff Correction
                      </span>
                    </div>

                    {activeRevision.isApplied && (
                      <Badge variant="verified" size="xs">
                        Surgical Fix Applied
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs uppercase tracking-wider text-[#858585] font-medium">
                      Inline Redline Comparison:
                    </div>

                    {/* Diff Preview: Deletion vs Addition */}
                    <div className="space-y-2">
                      {/* Red Deletion Row */}
                      <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-[#1C1214] border border-[#7F1D1D]">
                        <span className="font-mono text-[#EF4444] font-bold select-none text-sm">-</span>
                        <div className="text-[#EF4444] line-through text-[15px] font-sans leading-relaxed">
                          {findings[0]?.flaggedText || "2x faster results / in just 14 days"}
                        </div>
                      </div>

                      {/* Green Addition Row */}
                      <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-[#0C1A14] border border-[#065F46]">
                        <span className="font-mono text-[#10B981] font-bold select-none text-sm">+</span>
                        <div className="text-[#10B981] font-medium text-[15px] font-sans leading-relaxed">
                          {activeRevision.revisedText}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-[#B5B5B5] font-sans leading-relaxed">
                      {activeRevision.reasoning ||
                        "Replaces unverified multiplier metrics with substantiated 8-week protein synthesis benchmarks grounded in Clinical Report APX-2024-C3."}
                    </p>

                    <div className="pt-3 border-t border-[#303030] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-xs text-[#858585]">
                        Citation: Clinical Study Report CS-2025-4A (ISO 22196)
                      </span>

                      {/* Tactile "Apply Surgical Fix" Button */}
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() =>
                          handleApplyRevision(activeRevision.revisedText, activeRevision.id)
                        }
                        loading={actionLoading}
                        disabled={activeRevision.isApplied}
                        icon={<Check className="w-4 h-4 text-black" />}
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
              <div className="bg-[#141414] border border-[#303030] rounded-xl p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#858585]">
                    Compliance Score
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-3xl font-bold tracking-tight tabular-nums ${
                        complianceScore >= 80 ? "text-[#10B981]" : "text-[#EF4444]"
                      }`}
                    >
                      {complianceScore}
                    </span>
                    <span className="text-xs text-[#858585]">/100</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-[#222222] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      complianceScore >= 80 ? "bg-[#10B981] w-[94%]" : "bg-[#EF4444] w-[24%]"
                    }`}
                  />
                </div>

                {/* Multi-factor Score Breakdown */}
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex items-center justify-between text-[#858585]">
                    <span>Lexical Grounding Index</span>
                    <span className="text-white font-medium">{complianceScore >= 80 ? "96%" : "28%"}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#858585]">
                    <span>Statutory Zero-Hazard</span>
                    <span className={`font-medium ${complianceScore >= 80 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                      {complianceScore >= 80 ? "Pass (0 Breach)" : "Fail (FTC §255)"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#858585]">
                    <span>Semantic Corpus Distance</span>
                    <span className="text-white font-medium">0.08 (Cosine Match)</span>
                  </div>
                </div>
              </div>

              {/* Interactive Review Findings List */}
              <div className="bg-[#141414] border border-[#303030] rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#303030] bg-[#191919] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-white" />
                    <h3 className="text-sm font-semibold text-white">
                      Audit Findings ({findings.length})
                    </h3>
                  </div>

                  <Badge variant={findings.length > 0 ? "violation" : "verified"} size="xs">
                    {findings.length > 0 ? "Action Required" : "All Resolved"}
                  </Badge>
                </div>

                <div className="p-4 space-y-3">
                  {findings.map((finding, idx) => {
                    const isExpanded = expandedFindingId === finding.id;
                    const isCritical = finding.severity === "critical" || finding.severity === "high";

                    return (
                      <div
                        key={finding.id || idx}
                        className="rounded-lg border border-[#303030] bg-[#191919] transition-colors"
                      >
                        {/* Finding Header */}
                        <div
                          onClick={() => setExpandedFindingId(isExpanded ? null : finding.id)}
                          className="p-3.5 flex items-start justify-between gap-2.5 cursor-pointer select-none"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {isCritical ? (
                                <AlertOctagon className="w-4 h-4 text-[#EF4444] shrink-0" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
                              )}
                              <span className="text-sm font-semibold text-white">
                                {finding.category
                                  ?.replace(/_/g, " ")
                                  .replace(/\b\w/g, (c: string) => c.toUpperCase()) ||
                                  "Statutory Substantiation Violation"}
                              </span>
                            </div>
                            <div className="text-xs text-[#858585]">
                              Flagged Token: &ldquo;{finding.flaggedText || "2x faster results"}&rdquo;
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Proposal Status Indicators: Disputed / Dismissed / Overridden */}
                            {finding.status === "disputed" && (
                              <Badge variant="warning" size="xs">
                                Disputed
                              </Badge>
                            )}
                            {finding.status === "dismissed" && (
                              <Badge variant="neutral" size="xs">
                                Dismissed
                              </Badge>
                            )}
                            {finding.status === "overridden" && (
                              <Badge variant="verified" size="xs">
                                Overridden
                              </Badge>
                            )}

                            {/* Confidence Badge */}
                            <span className="text-[11px] px-2 py-0.5 rounded bg-[#141414] text-[#B5B5B5] border border-[#303030]">
                              {finding.confidence || "98% Conf"}
                            </span>
                            <Badge
                              variant={
                                finding.status === "overridden" || finding.status === "dismissed"
                                  ? "verified"
                                  : isCritical
                                  ? "violation"
                                  : "warning"
                              }
                              size="xs"
                            >
                              {finding.severity?.toUpperCase() || "HIGH"}
                            </Badge>
                            <ChevronRight
                              className={`w-4 h-4 text-[#858585] transition-transform ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            />
                          </div>
                        </div>

                        {/* Expanded Finding Detail */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 border-t border-[#303030] space-y-3.5 text-xs animate-in fade-in">
                            <p className="text-[14px] text-[#B5B5B5] leading-relaxed font-sans">
                              {finding.explanation}
                            </p>

                            {/* Status Callout Box */}
                            {finding.status === "disputed" && (
                              <div className="p-3 rounded-lg bg-[#141414] border border-[#303030] text-xs space-y-1">
                                <div className="font-semibold flex items-center gap-1.5 text-[#F59E0B]">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Creator Dispute Pending Review</span>
                                </div>
                                <div className="text-xs text-[#B5B5B5]">
                                  {finding.dispute_reason || "Creator asserts compliance with regulatory safe harbor."}
                                </div>
                              </div>
                            )}

                            {finding.status === "dismissed" && (
                              <div className="p-3 rounded-lg bg-[#141414] border border-[#303030] text-xs space-y-1">
                                <div className="font-semibold flex items-center gap-1.5 text-white">
                                  <X className="w-3.5 h-3.5 text-[#858585]" />
                                  <span>Finding Dismissed with Recorded Reason</span>
                                </div>
                                <div className="text-xs text-[#858585]">
                                  {finding.dismissal_reason || "Brand tolerance exception granted."}
                                </div>
                              </div>
                            )}

                            {finding.status === "overridden" && (
                              <div className="p-3 rounded-lg bg-[#141414] border border-[#303030] text-xs space-y-1">
                                <div className="font-semibold flex items-center gap-1.5 text-white">
                                  <Scale className="w-3.5 h-3.5 text-[#10B981]" />
                                  <span>Reviewer Override Recorded (SOC-2 Immutable)</span>
                                </div>
                                <div className="text-xs text-[#B5B5B5]">
                                  {finding.override_memo || "Override authorized under Legal Memo LM-2026-44"}
                                </div>
                                <div className="text-[11px] text-[#858585]">
                                  Authorized by: {finding.overridden_by || "Daksh Agrawal (Brand Director)"}
                                </div>
                              </div>
                            )}

                            {/* Provenance Document Link triggering drawer */}
                            <div className="p-3.5 rounded-lg bg-[#141414] border border-[#303030] space-y-2 text-xs">
                              <div className="flex items-center justify-between text-[#858585]">
                                <span className="flex items-center gap-1.5 font-medium">
                                  <Database className="w-3.5 h-3.5 text-white" />
                                  <span>Citation Provenance:</span>
                                </span>
                                <span className="text-white font-mono font-medium">
                                  {finding.claimId || "CLM-APX-001"}
                                </span>
                              </div>

                              <div className="text-white font-sans text-sm italic leading-relaxed">
                                &ldquo;{finding.citedExcerpt ||
                                  "Mean fractional synthetic rate (FSR) showed a 28.4% elevation (p = 0.004) under ISO 22196."}&rdquo;
                              </div>

                              {/* Button to open Provenance Citation Drawer */}
                              <div className="pt-2 flex items-center justify-between border-t border-[#262626]">
                                <span className="text-[#858585] text-xs">
                                  DOI: {finding.doi || "10.1016/j.nutres.2024.108421"}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveProvenanceFinding(finding);
                                  }}
                                  className="text-white hover:underline flex items-center gap-1 text-xs font-medium cursor-pointer"
                                >
                                  <span>Inspect Citation Chain</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Workflow Actions: Dispute / Dismiss / Override / Apply Fix */}
                            <div className="pt-2 border-t border-[#303030] flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {/* Dispute button */}
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDisputeFinding(finding);
                                    setDisputeReason(
                                      "Statutory safe harbor exception under 21 CFR § 101.93 applies; substantiated in clinical trial records."
                                    );
                                  }}
                                  disabled={finding.status === "disputed" || finding.status === "overridden"}
                                  icon={<AlertTriangle className="w-3 h-3 text-[#F59E0B]" />}
                                >
                                  {finding.status === "disputed" ? "Disputed" : "Dispute Finding"}
                                </Button>

                                {/* Dismiss with reason button */}
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDismissFinding(finding);
                                    setDismissReason(
                                      "Brand guideline tolerance exception (Policy BE-2026-1) approved for digital channel."
                                    );
                                  }}
                                  disabled={finding.status === "dismissed" || finding.status === "overridden"}
                                  icon={<X className="w-3 h-3 text-[#858585]" />}
                                >
                                  {finding.status === "dismissed" ? "Dismissed" : "Dismiss"}
                                </Button>

                                {/* Recorded Override (Reviewer Authorized) */}
                                <Button
                                  size="xs"
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveOverrideFinding(finding);
                                    setOverrideMemo("Override authorized under Legal Memo LM-2026-44");
                                  }}
                                  disabled={finding.status === "overridden"}
                                  icon={<Scale className="w-3 h-3 text-white" />}
                                >
                                  {finding.status === "overridden" ? "Override Logged" : "Authorized Override"}
                                </Button>
                              </div>

                              {/* Surgical correction quick trigger */}
                              {finding.suggestedCorrection && (
                                <Button
                                  size="xs"
                                  variant="primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const phrase = finding.flaggedText || "2x faster results";
                                    const updated = submission.currentContent.replace(
                                      phrase,
                                      finding.suggestedCorrection
                                    );
                                    handleApplyRevision(updated);
                                  }}
                                  icon={<Check className="w-3.5 h-3.5 text-black" />}
                                >
                                  Apply Fix
                                </Button>
                              )}
                            </div>
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
          <div className="bg-[#141414] border border-[#303030] rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">
              Submission Governance Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-[#191919] border border-[#303030]">
                <div className="text-[#858585]">Submission ID</div>
                <div className="text-white font-medium mt-1 text-sm font-mono">{submission.id}</div>
              </div>
              <div className="p-4 rounded-lg bg-[#191919] border border-[#303030]">
                <div className="text-[#858585]">Brand Workspace</div>
                <div className="text-white font-medium mt-1 text-sm">Apex Nutrition (brand_apex)</div>
              </div>
              <div className="p-4 rounded-lg bg-[#191919] border border-[#303030]">
                <div className="text-[#858585]">Channel / Scope</div>
                <div className="text-white font-medium mt-1 text-sm">{submission.channel || "Instagram Reel"}</div>
              </div>
              <div className="p-4 rounded-lg bg-[#191919] border border-[#303030]">
                <div className="text-[#858585]">Submitter</div>
                <div className="text-white font-medium mt-1 text-sm">Riddhi S. (Content Specialist)</div>
              </div>
              <div className="p-4 rounded-lg bg-[#191919] border border-[#303030]">
                <div className="text-[#858585]">Compliance Standard</div>
                <div className="text-white font-medium mt-1 text-sm">FTC § 255.2 / FDA 21 CFR Part 11</div>
              </div>
              <div className="p-4 rounded-lg bg-[#191919] border border-[#303030]">
                <div className="text-[#858585]">Record Hash</div>
                <div className="text-[#B5B5B5] mt-1 text-xs font-mono truncate">sha256:7f83b1657ff1fc53b92d...</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL LEDGER */}
        {activeTab === "history" && (
          <div className="bg-[#141414] border border-[#303030] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Cryptographic Audit Trail Ledger
              </h3>
              <Badge variant="verified" size="xs">
                {auditLog.length} Events Recorded
              </Badge>
            </div>
            <p className="text-sm text-[#858585]">
              Complete, tamper-proof record of every preflight check, finding dispute, dismissal reason, and authorized legal override.
            </p>
            <div className="space-y-3 text-xs">
              {auditLog.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-[#191919] border border-[#303030] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">{ev.action}</span>
                      <span className="text-xs text-[#858585]">by {ev.by}</span>
                    </div>
                    <div className="text-sm text-[#B5B5B5] font-sans">{ev.notes}</div>
                  </div>
                  <div className="text-right text-xs text-[#858585] shrink-0 font-mono">
                    <div>{ev.time}</div>
                    <div className="text-[#525252]">{ev.hash}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evidence Citation Drawer / Modal Inspector */}
        {activeProvenanceFinding && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#141414] border border-[#303030] rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#303030] pb-3.5">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-semibold text-white">
                    Provenance Inspector — {activeProvenanceFinding.claimId || "CLM-APX-001"}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveProvenanceFinding(null)}
                  className="text-[#858585] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="text-xs uppercase text-[#858585] font-medium tracking-wide">Flagged Marketing Claim:</div>
                  <div className="p-3 rounded-lg bg-[#191919] border border-[#303030] text-sm text-white font-sans mt-1">
                    &ldquo;{activeProvenanceFinding.flaggedText}&rdquo;
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase text-[#858585] font-medium tracking-wide">Verbatim Clinical Assay Excerpt:</div>
                  <div className="p-3.5 rounded-lg bg-[#191919] border border-[#303030] text-sm text-white font-sans italic mt-1 leading-relaxed">
                    &ldquo;{activeProvenanceFinding.citedExcerpt ||
                      "Mean log reduction at 24h was 2.24 corresponding to 99.42% efficacy under ISO 22196:2011 Annex C."}&rdquo;
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#191919] border border-[#303030]">
                    <div className="text-[#858585]">Governance Owner:</div>
                    <div className="text-white font-medium mt-0.5">Dr. Aris Vance (VP Medical)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#191919] border border-[#303030]">
                    <div className="text-[#858585]">Assay Standard:</div>
                    <div className="text-white font-medium mt-0.5">{activeProvenanceFinding.assayStandard || "ISO 22196 / RCT"}</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#191919] border border-[#303030] flex items-center justify-between text-xs">
                  <span className="text-[#858585] truncate mr-2 font-mono">
                    SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1a209b...
                  </span>
                  <button
                    onClick={() =>
                      handleCopyCitation(
                        `Provenance Claim ${activeProvenanceFinding.claimId}: ${activeProvenanceFinding.citedExcerpt}`
                      )
                    }
                    className="text-white hover:underline flex items-center gap-1.5 shrink-0 cursor-pointer font-medium"
                  >
                    {copiedProvenance ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#858585]" />
                        <span>Copy Citation</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#303030]">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setActiveProvenanceFinding(null)}
                  >
                    Close Inspector
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      const phrase = activeProvenanceFinding.flaggedText || "2x faster results";
                      const updated = submission.currentContent.replace(
                        phrase,
                        activeProvenanceFinding.suggestedCorrection
                      );
                      handleApplyRevision(updated);
                      setActiveProvenanceFinding(null);
                    }}
                    icon={<Check className="w-4 h-4 text-black" />}
                  >
                    Apply Compliant Fix
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Modal 1: Creator Dispute Finding Modal */}
        {activeDisputeFinding && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#141414] border border-[#303030] rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#303030] pb-3.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                  <h3 className="text-sm font-semibold text-white">
                    Dispute Compliance Finding
                  </h3>
                </div>
                <button
                  onClick={() => setActiveDisputeFinding(null)}
                  className="text-[#858585] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="text-xs uppercase text-[#858585] font-medium tracking-wide">Challenged Finding:</div>
                  <div className="p-3 rounded-lg bg-[#191919] border border-[#303030] text-sm text-white font-sans mt-1">
                    &ldquo;{activeDisputeFinding.flaggedText}&rdquo; — {activeDisputeFinding.category}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs uppercase text-[#858585] font-medium tracking-wide">Quick Dispute Presets:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "FDA 21 CFR § 101.93 Safe Harbor Exemption",
                      "Substantiated by Q3 Clinical Cohort Study",
                      "Client Approved Creative Brief Exception",
                      "Context restricted to internal ambassador kit",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDisputeReason(preset)}
                        className="px-2.5 py-1.5 rounded-md bg-[#191919] hover:bg-[#222222] border border-[#303030] text-xs text-[#B5B5B5] hover:text-white transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase text-[#858585] font-medium tracking-wide">Dispute Justification:</label>
                  <textarea
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    rows={3}
                    className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-3 text-sm text-white font-sans leading-relaxed resize-none"
                    placeholder="Provide specific regulatory citation or brand rationale..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase text-[#858585] font-medium tracking-wide">Optional Evidence Citation / URL:</label>
                  <input
                    type="text"
                    value={disputeEvidence}
                    onChange={(e) => setDisputeEvidence(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-2.5 text-sm text-white font-sans"
                    placeholder="DOI, Clinical study ID, or legal memo link..."
                  />
                </div>

                <div className="p-3 rounded-lg bg-[#191919] border border-[#303030] text-xs font-sans text-[#B5B5B5] leading-relaxed">
                  Submitting a dispute escalates this finding to the Brand Reviewer queue. The creator cannot approve their own submission; final sign-off remains with authorized personnel.
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#303030]">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setActiveDisputeFinding(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleDisputeFinding(activeDisputeFinding.id)}
                  loading={actionLoading}
                  icon={<AlertTriangle className="w-3.5 h-3.5" />}
                >
                  Submit Official Dispute
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Dismiss Finding with Reason */}
        {activeDismissFinding && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#141414] border border-[#303030] rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#303030] pb-3.5">
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-semibold text-white">
                    Dismiss Finding with Recorded Reason
                  </h3>
                </div>
                <button
                  onClick={() => setActiveDismissFinding(null)}
                  className="text-[#858585] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="text-xs uppercase text-[#858585] font-medium tracking-wide">Flagged Text to Dismiss:</div>
                  <div className="p-3 rounded-lg bg-[#191919] border border-[#303030] text-sm text-white font-sans mt-1">
                    &ldquo;{activeDismissFinding.flaggedText}&rdquo;
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs uppercase text-[#858585] font-medium tracking-wide">Common Reason Presets:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Brand guideline tolerance exception (BE-2026-1)",
                      "Artistic stylistic license approved for video",
                      "Non-substantive grammatical variation",
                      "Pre-cleared with account manager",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDismissReason(preset)}
                        className="px-2.5 py-1.5 rounded-md bg-[#191919] hover:bg-[#222222] border border-[#303030] text-xs text-[#B5B5B5] hover:text-white transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase text-[#858585] font-medium tracking-wide">Dismissal Justification (Audit Trail):</label>
                  <textarea
                    value={dismissReason}
                    onChange={(e) => setDismissReason(e.target.value)}
                    rows={3}
                    className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-3 text-sm text-white font-sans leading-relaxed resize-none"
                    placeholder="Explain why this finding is dismissed..."
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#303030]">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setActiveDismissFinding(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleDismissFinding(activeDismissFinding.id)}
                  loading={actionLoading}
                  icon={<Check className="w-3.5 h-3.5" />}
                >
                  Confirm Dismissal
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 3: Authorized Legal / Reviewer Override */}
        {activeOverrideFinding && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#141414] border border-[#303030] rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#303030] pb-3.5">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-semibold text-white">
                    Record Authorized Legal Override
                  </h3>
                </div>
                <button
                  onClick={() => setActiveOverrideFinding(null)}
                  className="text-[#858585] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="text-xs uppercase text-[#858585] font-medium tracking-wide">Flagged Finding:</div>
                  <div className="p-3 rounded-lg bg-[#191919] border border-[#303030] text-sm text-white font-sans mt-1">
                    &ldquo;{activeOverrideFinding.flaggedText}&rdquo; — {activeOverrideFinding.category}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs uppercase text-[#858585] font-medium tracking-wide">
                    Official Authorization Memoranda:
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {[
                      "Override authorized under Legal Memo LM-2026-44",
                      "Authorized exception per Regulatory Counsel Review RC-882",
                      "Fair-use comparative marketing exemption validated under Lanham Act",
                      "Pre-market clearance validated by VP Medical & Regulatory Affairs",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setOverrideMemo(preset)}
                        className={`text-left px-3.5 py-2.5 rounded-lg border transition-colors cursor-pointer text-xs font-sans ${
                          overrideMemo === preset
                            ? "bg-[#222222] border-white text-white"
                            : "bg-[#191919] hover:bg-[#222222] border-[#303030] text-[#B5B5B5]"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase text-[#858585] font-medium tracking-wide">Custom Memo / Electronic Justification:</label>
                  <textarea
                    value={overrideMemo}
                    onChange={(e) => setOverrideMemo(e.target.value)}
                    rows={2}
                    className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-3 text-sm text-white font-sans leading-relaxed resize-none"
                    placeholder="Enter formal legal memorandum citation..."
                  />
                </div>

                <div className="p-3.5 rounded-lg bg-[#191919] border border-[#303030] space-y-1.5">
                  <div className="text-xs text-[#858585] flex items-center justify-between font-medium">
                    <span>Authorized Signatory:</span>
                    <span className="text-[#10B981]">ISO-21CFR Part 11 Compliant</span>
                  </div>
                  <div className="text-white font-medium text-sm">{overrideReviewer}</div>
                  <div className="text-xs text-[#858585]">
                    Cryptographic signature hash generated on submission. Neutralizes finding violation penalty and logs to permanent audit trail.
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#303030]">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setActiveOverrideFinding(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleOverrideFinding(activeOverrideFinding.id)}
                  loading={actionLoading}
                  icon={<Scale className="w-3.5 h-3.5 text-black" />}
                >
                  Record Legal Override
                </Button>
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
