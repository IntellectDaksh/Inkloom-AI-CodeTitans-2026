"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  RefreshCw,
  Check,
  X,
  FileText,
  Clock,
  History,
  Info,
  ShieldCheck,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

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
        setFeedbackMessage("Suggested revision applied successfully!");
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/submissions/${id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editableContent }),
      });
      const data = await res.json();
      if (data.success) {
        setFindings(data.findings || []);
        setRevisions(data.revisions || []);
        setFeedbackMessage("Governance analysis re-run completed!");
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
          notes: `Decision ${decision.toUpperCase()} recorded by Daksh Agrawal`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmission(data.submission);
        setFeedbackMessage(`Submission ${decision.replace("_", " ")} successfully!`);
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  if (!submission) {
    return (
      <AppLayout>
        <div className="text-center py-20 space-y-4">
          <p className="text-slate-400">Submission not found.</p>
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Breadcrumb & Action Header */}
        <div className="space-y-4">
          <Link
            href="/submissions"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Submissions</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {submission.title}
              </h1>
              <Badge variant="tag">
                {submission.submissionType?.replace("_", " ") || "Script"}
              </Badge>
              <Badge
                variant={
                  submission.status === "approved"
                    ? "approved"
                    : submission.status === "changes_requested"
                    ? "changes_requested"
                    : "pending"
                }
              >
                {submission.status?.replace("_", " ")}
              </Badge>
            </div>

            {/* Approval Decision Buttons */}
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                className="text-amber-300 border-amber-500/40 hover:bg-amber-500/10"
                onClick={() => handleApprovalDecision("changes_requested")}
                loading={actionLoading}
              >
                Request Changes
              </Button>
              <Button
                size="sm"
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/30 border-emerald-500/40"
                onClick={() => handleApprovalDecision("approved")}
                loading={actionLoading}
                icon={<Check className="w-4 h-4" />}
              >
                Approve
              </Button>
            </div>
          </div>
        </div>

        {/* Feedback alert banner */}
        {feedbackMessage && (
          <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedbackMessage}</span>
            </span>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-emerald-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tabs: Review | Details | History */}
        <div className="border-b border-[#1C2033] flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => setActiveTab("review")}
            className={`pb-3 relative transition-colors ${
              activeTab === "review"
                ? "text-violet-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Review
            {activeTab === "review" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-3 relative transition-colors ${
              activeTab === "details"
                ? "text-violet-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Details
            {activeTab === "details" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 relative transition-colors ${
              activeTab === "history"
                ? "text-violet-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            History
            {activeTab === "history" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
            )}
          </button>
        </div>

        {/* TAB 1: REVIEW (Two-column layout matching mockup) */}
        {activeTab === "review" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Submitted Content & Suggested Revision */}
            <div className="lg:col-span-7 space-y-6">
              {/* Submitted Content Card */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm">Submitted Content</CardTitle>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#181B2D] text-slate-300 border border-[#272B44]">
                      v1
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      {editMode ? "Cancel Editing" : "Edit Manually"}
                    </button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleReRunAnalysis}
                      loading={analyzing}
                      icon={<RefreshCw className="w-3.5 h-3.5" />}
                      className="text-xs py-1 px-2"
                      title="Re-run AI brand check"
                    >
                      Audit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editMode ? (
                    <div className="space-y-3">
                      <textarea
                        value={editableContent}
                        onChange={(e) => setEditableContent(e.target.value)}
                        rows={5}
                        className="w-full rounded-lg bg-[#0E101B] border border-[#242942] p-3 text-sm text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          handleApplyRevision(editableContent);
                          setEditMode(false);
                        }}
                      >
                        Save Content
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-[#0E101B] border border-[#1E2338] text-sm text-slate-200 leading-relaxed font-sans">
                      {/* Render content with highlight badges matching mockup */}
                      {submission.currentContent.includes("2x faster results") ? (
                        <>
                          Our new protein blend gives you{" "}
                          <span className="bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/40 font-semibold cursor-help inline-block">
                            2x faster results
                          </span>{" "}
                          and helps build muscle{" "}
                          <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40 font-semibold cursor-help inline-block">
                            in just 14 days
                          </span>
                          . It&apos;s the most advanced formula for serious results.
                        </>
                      ) : (
                        submission.currentContent
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Channel: {submission.channel?.replace("_", " ") || "Social Media"}</span>
                    <span>Author: Riddhi S. · Updated 10 min ago</span>
                  </div>
                </CardContent>
              </Card>

              {/* Suggested Revision Box (Matching Mockup exactly) */}
              {activeRevision && (
                <div className="p-5 rounded-xl bg-[#0D1817] border border-emerald-500/30 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Suggested Revision
                      </span>
                    </div>
                    {activeRevision.isApplied && (
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                        Applied
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                    &quot;{activeRevision.revisedText}&quot;
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-emerald-400/80">
                      Eliminates unverified multiplier claims while preserving brand voice.
                    </span>

                    <Button
                      size="sm"
                      variant="primary"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5"
                      onClick={() =>
                        handleApplyRevision(activeRevision.revisedText, activeRevision.id)
                      }
                      loading={actionLoading}
                      disabled={activeRevision.isApplied}
                    >
                      {activeRevision.isApplied ? "Applied" : "Apply"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Review Results (Findings list) */}
            <div className="lg:col-span-5 space-y-4">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    Review Results
                  </CardTitle>
                  <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                    {findings.length} Issues Found
                  </span>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                  {findings.map((f, idx) => (
                    <div
                      key={f.id || idx}
                      className={`p-3.5 rounded-lg border transition-all ${
                        f.severity === "high" || f.severity === "critical"
                          ? "bg-rose-950/20 border-rose-500/30"
                          : f.severity === "medium"
                          ? "bg-amber-950/20 border-amber-500/30"
                          : "bg-[#141626] border-[#222742]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {f.severity === "high" || f.severity === "critical" ? (
                            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          )}
                          <span className="text-xs font-semibold text-slate-100">
                            {f.category?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "Compliance Issue"}
                          </span>
                        </div>
                        <Badge
                          variant={
                            f.severity === "high" || f.severity === "critical"
                              ? "high"
                              : f.severity === "medium"
                              ? "medium"
                              : "low"
                          }
                          size="sm"
                        >
                          {f.severity}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {f.message || f.explanation}
                      </p>

                      {/* Show Source Accordion */}
                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                        <button
                          onClick={() =>
                            setExpandedSource(expandedSource === f.id ? null : f.id)
                          }
                          className="text-[11px] font-medium text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          {expandedSource === f.id ? "Hide Source" : "Show Source"}
                        </button>

                        <span className="text-[10px] text-slate-400">
                          Confidence: {f.confidence || "High"}
                        </span>
                      </div>

                      {expandedSource === f.id && (
                        <div className="mt-2 p-2.5 rounded bg-[#0A0B12] border border-[#21253B] text-[11px] text-slate-300 space-y-1 animate-in fade-in">
                          <div className="font-semibold text-slate-200">
                            Source Record: {f.citedExcerpt ? "Evidence Document" : "Brand Knowledge Base"}
                          </div>
                          <div className="text-slate-400">
                            {f.citedExcerpt ||
                              "No matching record in approved claims library. Statement requires clinical/legal sign-off before publication."}
                          </div>
                          {f.suggestedCorrection && (
                            <div className="pt-1 text-emerald-400">
                              Suggested fix: &quot;{f.suggestedCorrection}&quot;
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILS */}
        {activeTab === "details" && (
          <Card>
            <CardHeader>
              <CardTitle>Submission Specifications & Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-[#0E101B] border border-[#1E2338]">
                  <span className="text-slate-400">Submission ID</span>
                  <div className="font-mono text-slate-200 mt-1">{submission.id}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#0E101B] border border-[#1E2338]">
                  <span className="text-slate-400">Brand Workspace</span>
                  <div className="font-medium text-slate-200 mt-1">Apex Nutrition</div>
                </div>
                <div className="p-3 rounded-lg bg-[#0E101B] border border-[#1E2338]">
                  <span className="text-slate-400">Channel & Format</span>
                  <div className="font-medium text-slate-200 mt-1">Instagram Reels · Video Script</div>
                </div>
                <div className="p-3 rounded-lg bg-[#0E101B] border border-[#1E2338]">
                  <span className="text-slate-400">Author & Submitter</span>
                  <div className="font-medium text-slate-200 mt-1">Riddhi S. (Content Creator)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 3: HISTORY & AUDIT TRAIL */}
        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle>Version History & Governance Audit Trail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-[#0E101B] border border-[#1E2338] flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-200">AI Governance Analysis v1</div>
                    <div className="text-slate-400 text-[11px]">Run by Gemini 2.5 Flash · 3 Issues Identified</div>
                  </div>
                  <span className="text-slate-400">10 min ago</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0E101B] border border-[#1E2338] flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-200">Content Submitted</div>
                    <div className="text-slate-400 text-[11px]">Submitted by Riddhi S. for brand review</div>
                  </div>
                  <span className="text-slate-400">12 min ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
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
        <div className="min-h-screen bg-[#08090E] p-8 text-slate-400 flex items-center justify-center">
          Loading submission review...
        </div>
      }
    >
      <SubmissionReviewInner params={params} />
    </React.Suspense>
  );
}
