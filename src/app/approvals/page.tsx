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

  // Optimistic Quick Approve action
  const handleQuickApprove = (id: string, title: string) => {
    setActionInProgress(id);
    setTimeout(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "approved" as const, score: 96, criticalIssues: 0 } : item
        )
      );
      setActionInProgress(null);
      setFeedbackBanner(`Submission "${title}" approved and cleared for release under 21 CFR Part 11.`);
      setTimeout(() => setFeedbackBanner(null), 3500);
    }, 350);
  };

  // Optimistic Quick Request Changes action
  const handleQuickReject = (id: string, title: string) => {
    setActionInProgress(id);
    setTimeout(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "changes_requested" as const } : item
        )
      );
      setActionInProgress(null);
      setFeedbackBanner(`Changes requested for "${title}". Submitter notified with required revisions.`);
      setTimeout(() => setFeedbackBanner(null), 3500);
    }, 350);
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
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-100">
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
            <Link href="/prototype-notice">
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
        <div className="tactile-card rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Workflow Tabs: Pending, Approved, Changes Req. */}
          <div className="flex items-center bg-[#080C16] border border-[#1E2B4A] rounded-lg p-0.5 text-xs font-mono font-medium">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "pending"
                  ? "bg-[#162445] text-[#F3BA54] font-semibold border border-[#2E416E] shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="led-indicator led-amber" />
              <span>Pending Action ({pendingCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("approved")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "approved"
                  ? "bg-[#162445] text-emerald-300 font-semibold border border-[#2E416E] shadow-xs"
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
                  ? "bg-[#162445] text-rose-300 font-semibold border border-[#2E416E] shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="led-indicator led-rose" />
              <span>Changes Req. ({rejectedCount})</span>
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
              className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 font-mono placeholder:text-slate-600 transition-colors"
            />
          </div>
        </div>

        {/* Approvals Queue Cards with Tactile Skeuomorphism */}
        <div className="space-y-4">
          {displayItems.length > 0 ? (
            displayItems.map((item) => (
              <div
                key={item.id}
                className="tactile-card rounded-xl p-5 space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2B4A] pb-3.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/submissions/${item.id}`}
                        className="text-sm font-semibold text-slate-100 hover:text-[#00F2FE] transition-colors"
                      >
                        {item.title}
                      </Link>
                      <Badge variant="tag" size="xs">
                        {item.type}
                      </Badge>
                      <span className="px-2 py-0.5 rounded bg-[#080C16] text-[10px] font-mono text-cyan-300 border border-[#1E2B4A]">
                        {item.channel}
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
                        ? "Changes Req."
                        : "Needs Review"}
                    </Badge>
                  </div>
                </div>

                {/* Content snippet with red-line highlight preview */}
                <div className="p-3.5 rounded-lg bg-[#080C16] border border-[#1E2B4A] text-xs text-slate-300 font-sans leading-relaxed">
                  <div className="text-[10px] font-mono text-slate-500 mb-1.5 uppercase font-medium">
                    SUBMITTED MARKETING PHRASING:
                  </div>
                  <p className="text-slate-200">&ldquo;{item.summary}&rdquo;</p>

                  {item.flaggedText && item.suggestedFix && (
                    <div className="mt-3 pt-2.5 border-t border-[#162038] font-mono text-[11px] space-y-1.5">
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

                {/* Footer action bar */}
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
                          onClick={() => handleQuickReject(item.id, item.title)}
                          loading={actionInProgress === item.id}
                        >
                          Request Changes
                        </Button>
                        <Button
                          size="xs"
                          variant="approve"
                          onClick={() => handleQuickApprove(item.id, item.title)}
                          loading={actionInProgress === item.id}
                          icon={<Check className="w-3.5 h-3.5" />}
                        >
                          Quick Approve
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
            <div className="tactile-card rounded-xl p-12 text-center text-slate-500 font-mono text-xs">
              QUEUE CLEAR: NO SUBMISSIONS IN THIS STATUS
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
