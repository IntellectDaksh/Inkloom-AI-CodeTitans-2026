"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertTriangle,
  AlertOctagon,
  User,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  Layers,
  FileText,
  Lock,
  Download,
  Sparkles,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ApprovalItem {
  id: string;
  title: string;
  author: string;
  authorInitials: string;
  reviewer: string;
  type: string;
  channel: string;
  status: "pending" | "approved" | "changes_requested";
  severity: "critical" | "high" | "medium";
  score: number;
  criticalIssues: number;
  submittedAt: string;
  timestamp: string;
  summary: string;
  flaggedText?: string;
  suggestedFix?: string;
}

const INITIAL_APPROVAL_ITEMS: ApprovalItem[] = [
  {
    id: "sub_reel_script",
    title: "Q4 Campaign – Clinical Protein Reel Script",
    author: "Riddhi S.",
    authorInitials: "RS",
    reviewer: "Daksh Agrawal (Brand Director)",
    type: "Video Script",
    channel: "Instagram Reel",
    status: "pending",
    severity: "critical",
    score: 18,
    criticalIssues: 3,
    submittedAt: "14m ago",
    timestamp: "2026-11-08 14:18 UTC",
    summary:
      "Our new protein blend gives you 2x faster results and helps build muscle in just 14 days without dietary changes.",
    flaggedText: "2x faster results / in just 14 days",
    suggestedFix: "supports accelerated muscle protein synthesis when paired with resistance training",
  },
  {
    id: "sub_linkedin_update",
    title: "LinkedIn Corporate – Enterprise Wellness Initiative",
    author: "Laksh K.",
    authorInitials: "LK",
    reviewer: "Elena Rostova (Legal Counsel)",
    type: "Social Copy",
    channel: "LinkedIn Feed",
    status: "pending",
    severity: "high",
    score: 58,
    criticalIssues: 1,
    submittedAt: "42m ago",
    timestamp: "2026-11-08 13:50 UTC",
    summary:
      "Unveiling our enterprise wellness initiative guaranteed to completely eradicate workplace burnout.",
    flaggedText: "guaranteed to completely eradicate workplace burnout",
    suggestedFix: "designed to support cognitive resilience and workplace well-being programs",
  },
  {
    id: "sub_ad_creative",
    title: "Paid Social Ad Creative – Hydration Electrolytes V2",
    author: "Mansoor R.",
    authorInitials: "MR",
    reviewer: "Dr. Aris Vance (VP Medical)",
    type: "Ad Copy",
    channel: "Meta Ads",
    status: "pending",
    severity: "medium",
    score: 72,
    criticalIssues: 1,
    submittedAt: "1.2h ago",
    timestamp: "2026-11-08 13:12 UTC",
    summary:
      "Experience sustained energy without midday crashes using our hospital-grade cellular formula.",
    flaggedText: "hospital-grade cellular formula",
    suggestedFix: "isotonic electrolyte hydration formula conforming to USP <785>",
  },
  {
    id: "sub_insta_launch",
    title: "Product Launch – Recovery Blend Carousel",
    author: "Laksh K.",
    authorInitials: "LK",
    reviewer: "Daksh Agrawal (Brand Director)",
    type: "Social Copy",
    channel: "Instagram Carousel",
    status: "approved",
    severity: "medium",
    score: 96,
    criticalIssues: 0,
    submittedAt: "3h ago",
    timestamp: "2026-11-08 11:24 UTC",
    summary:
      "Introducing our Informed-Sport certified recovery formula, backed by double-blind clinical trials.",
  },
  {
    id: "sub_banner_v2",
    title: "Global Website Banner – Winter Immunity V2",
    author: "Mansoor R.",
    authorInitials: "MR",
    reviewer: "Elena Rostova (Compliance)",
    type: "Web Copy",
    channel: "Homepage Hero",
    status: "changes_requested",
    severity: "high",
    score: 34,
    criticalIssues: 2,
    submittedAt: "5h ago",
    timestamp: "2026-11-08 09:30 UTC",
    summary:
      "The ultimate miracle defense against seasonal illness with 100% all-natural organic bio-peptides.",
    flaggedText: "miracle defense against seasonal illness",
  },
];

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "changes_requested">("pending");
  const [items, setItems] = useState<ApprovalItem[]>(INITIAL_APPROVAL_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Modal State for 1-Click Approve / Reject with audit note input
  const [modalItem, setModalItem] = useState<{ item: ApprovalItem; action: "approve" | "reject" } | null>(null);
  const [auditNote, setAuditNote] = useState("");
  const [reviewerSigner, setReviewerSigner] = useState("Daksh Agrawal (Admin / Brand Director)");

  const handleOpenDecisionModal = (item: ApprovalItem, action: "approve" | "reject") => {
    setModalItem({ item, action });
    setAuditNote(
      action === "approve"
        ? "Verified against ISO 22196 clinical records. Formally cleared under 21 CFR Part 11 electronic signature."
        : "Unsubstantiated superlative metrics detected. Changes required before publication approval."
    );
  };

  const handleConfirmDecision = () => {
    if (!modalItem) return;
    const { item, action } = modalItem;
    setActionInProgress(item.id);

    setTimeout(() => {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: action === "approve" ? ("approved" as const) : ("changes_requested" as const),
                score: action === "approve" ? 96 : i.score,
                criticalIssues: action === "approve" ? 0 : i.criticalIssues,
              }
            : i
        )
      );

      setFeedbackBanner(
        action === "approve"
          ? `Submission "${item.title}" successfully approved with audit note: "${auditNote}".`
          : `Changes requested for "${item.title}". Submitter notified with audit note.`
      );
      setActionInProgress(null);
      setModalItem(null);
      setTimeout(() => setFeedbackBanner(null), 4000);
    }, 400);
  };

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const approvedCount = items.filter((i) => i.status === "approved").length;
  const rejectedCount = items.filter((i) => i.status === "changes_requested").length;

  const displayItems = items.filter((item) => {
    const matchesTab = item.status === activeTab;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <AppLayout
      title="Approvals Queue"
      subtitle="Formal human-in-the-loop sign-off desk for high-liability marketing claims."
    >
      <div className="space-y-6">
        {/* Header & Meta Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="led-indicator led-amber" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Human Sign-off &amp; Approvals Triage
              </h1>
              <Badge variant="metadata" size="xs">
                21 CFR PART 11
              </Badge>
              <span className="gold-badge text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase">
                HUMAN-IN-THE-LOOP MANDATE
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Marketing submissions with critical statutory findings require formal reviewer sign-off before publication. AI proposes; authorized officers dispose.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/prototype-notice?feature=veeva_sap_bridge">
              <Button
                size="sm"
                variant="secondary"
                icon={<Lock className="w-3.5 h-3.5 text-[#00F2FE]" />}
              >
                Veeva / SAP Sync
              </Button>
            </Link>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedbackBanner && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedbackBanner}</span>
            </div>
            <button
              onClick={() => setFeedbackBanner(null)}
              className="text-emerald-400 hover:text-white font-mono text-xs cursor-pointer"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* Filter Tabs and Quick Search Bar */}
        <div className="tactile-card rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-[#282828] bg-[#0E0E0E]">
          {/* Segmented Tabs: Pending (3), Approved (12), Rejected (2) */}
          <div className="flex items-center bg-[#080808] border border-[#282828] rounded-lg p-0.5 text-xs font-mono font-medium">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "pending"
                  ? "bg-[#222222] text-[#F3BA54] font-semibold border border-[#333333] shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="led-indicator led-amber" />
              <span>Pending ({pendingCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("approved")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "approved"
                  ? "bg-[#222222] text-emerald-300 font-semibold border border-[#333333] shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="led-indicator led-emerald" />
              <span>Approved ({approvedCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("changes_requested")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "changes_requested"
                  ? "bg-[#222222] text-rose-300 font-semibold border border-[#333333] shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="led-indicator led-rose" />
              <span>Rejected ({rejectedCount})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter queue by copy or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080808] border border-[#282828] focus:border-white focus:outline-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 font-mono placeholder:text-slate-600 transition-colors"
            />
          </div>
        </div>

        {/* Approvals Queue Cards with Monochromatic Tactile Skeuomorphism */}
        <div className="space-y-4">
          {displayItems.length > 0 ? (
            displayItems.map((item) => (
              <div
                key={item.id}
                className="tactile-card rounded-xl p-5 space-y-4 border-[#282828] bg-[#0E0E0E]"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-3.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/submissions/${item.id}`}
                        className="text-sm font-semibold text-white hover:text-[#00F2FE] transition-colors"
                      >
                        {item.title}
                      </Link>
                      <Badge variant="tag" size="xs">
                        {item.type}
                      </Badge>
                      <span className="px-2 py-0.5 rounded bg-[#141414] text-[10px] font-mono text-cyan-300 border border-[#282828]">
                        {item.channel}
                      </span>
                      {/* Severity Badge from SECTION_INVENTORY.md */}
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${
                          item.severity === "critical"
                            ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                            : item.severity === "high"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            : "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
                      <span>AUTHOR: {item.author}</span>
                      <span>•</span>
                      <span>REVIEWER: {item.reviewer}</span>
                      <span>•</span>
                      <span className="text-slate-500">{item.timestamp}</span>
                    </div>
                  </div>

                  {/* Monospace Tabular Score */}
                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <div className="text-right">
                      <div
                        className={`font-mono text-sm font-bold tabular-nums ${
                          item.score >= 80
                            ? "text-emerald-400"
                            : item.score >= 50
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {item.score}% SCORE
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {item.criticalIssues > 0
                          ? `${item.criticalIssues} HIGH RISK FLAGS`
                          : "ZERO STATUTORY FLAGS"}
                      </div>
                    </div>

                    <Badge
                      variant={
                        item.status === "approved"
                          ? "verified"
                          : item.status === "changes_requested"
                          ? "violation"
                          : "warning"
                      }
                      size="sm"
                    >
                      {item.status === "approved"
                        ? "Approved"
                        : item.status === "changes_requested"
                        ? "Rejected"
                        : "Pending"}
                    </Badge>
                  </div>
                </div>

                {/* Content snippet with red-line highlight preview */}
                <div className="p-3.5 rounded-lg bg-[#141414] border border-[#282828] text-xs text-slate-300 font-sans leading-relaxed shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                  <div className="text-[10px] font-mono text-slate-500 mb-1.5 uppercase font-medium">
                    SUBMITTED MARKETING PHRASING:
                  </div>
                  <p className="text-slate-200">&ldquo;{item.summary}&rdquo;</p>

                  {item.flaggedText && item.suggestedFix && (
                    <div className="mt-3 pt-2.5 border-t border-[#222222] font-mono text-[11px] space-y-1.5">
                      <div className="text-rose-400 flex items-center gap-2">
                        <span className="font-bold select-none text-rose-500">-</span>
                        <span className="line-through decoration-rose-500/50">{item.flaggedText}</span>
                      </div>
                      <div className="text-emerald-300 flex items-center gap-2">
                        <span className="font-bold select-none text-emerald-500">+</span>
                        <span className="font-medium">{item.suggestedFix}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action Bar with 1-Click Modal Triggers */}
                <div className="pt-1 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-[11px] font-mono text-slate-500">
                    SUBMISSION ID: {item.id} · TENANT: APEX NUTRITION
                  </div>

                  <div className="flex items-center gap-2.5">
                    {item.status === "pending" && (
                      <>
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => handleOpenDecisionModal(item, "reject")}
                          loading={actionInProgress === item.id}
                        >
                          Reject Draft
                        </Button>
                        <Button
                          size="xs"
                          variant="approve"
                          onClick={() => handleOpenDecisionModal(item, "approve")}
                          loading={actionInProgress === item.id}
                          icon={<Check className="w-3.5 h-3.5" />}
                        >
                          1-Click Approve
                        </Button>
                      </>
                    )}

                    <Link href={`/submissions/${item.id}`}>
                      <Button
                        size="xs"
                        variant="secondary"
                        icon={<ChevronRight className="w-3.5 h-3.5" />}
                      >
                        Inspect Workspace
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="tactile-card rounded-xl p-12 text-center text-slate-500 font-mono text-xs border-[#282828] bg-[#0E0E0E]">
              QUEUE CLEAR: NO SUBMISSIONS IN THIS STATUS
            </div>
          )}
        </div>

        {/* 1-Click Decision Modal with Required Audit Note Input */}
        {modalItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="tactile-card rounded-xl max-w-lg w-full p-6 space-y-5 border-[#282828] bg-[#0E0E0E] shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#222222] pb-3.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00F2FE]" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-white font-mono">
                    {modalItem.action === "approve" ? "Record Formal Human Sign-off" : "Confirm Rejection & Revisions"}
                  </h2>
                </div>
                <button
                  onClick={() => setModalItem(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">SUBMISSION RECORD:</span>
                  <span className="text-white font-semibold block text-sm mt-0.5">{modalItem.item.title}</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 uppercase text-[10px]">
                    REVIEWER ELECTRONIC SIGNATURE (21 CFR PART 11):
                  </label>
                  <input
                    type="text"
                    value={reviewerSigner}
                    onChange={(e) => setReviewerSigner(e.target.value)}
                    className="w-full bg-[#141414] border border-[#282828] focus:border-white focus:outline-none rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 uppercase text-[10px]">
                    AUDIT NOTE / LEGAL JUSTIFICATION *:
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={auditNote}
                    onChange={(e) => setAuditNote(e.target.value)}
                    placeholder="Enter statutory justification, verified citation ID, or required revision notes..."
                    className="w-full bg-[#141414] border border-[#282828] focus:border-white focus:outline-none rounded-lg p-3 text-white resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] font-sans leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setModalItem(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant={modalItem.action === "approve" ? "approve" : "destructive"}
                    onClick={handleConfirmDecision}
                    loading={actionInProgress === modalItem.item.id}
                    icon={modalItem.action === "approve" ? <Check className="w-3.5 h-3.5" /> : undefined}
                  >
                    {modalItem.action === "approve" ? "Commit 21 CFR Sign-off" : "Confirm Rejection"}
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
