"use client";

import React, { useState, useEffect } from "react";
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

  const handleQuickApprove = (id: string) => {
    setActionInProgress(id);
    setTimeout(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "approved" as const, score: 95, criticalIssues: 0 } : item
        )
      );
      setActionInProgress(null);
    }, 400);
  };

  const handleQuickReject = (id: string) => {
    setActionInProgress(id);
    setTimeout(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "changes_requested" as const } : item
        )
      );
      setActionInProgress(null);
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
        {/* Header & Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-100">
                Human Sign-off &amp; Approvals Gate
              </h1>
              <Badge variant="metadata" size="xs">
                21 CFR PART 11
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Marketing submissions with critical statutory findings require reviewer verification before distribution.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 bg-[#131622] px-3 py-1.5 rounded-lg border border-[#1E2333]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>PENDING SIGN-OFF: {pendingCount}</span>
            <span>•</span>
            <span className="text-slate-400">ORG: APEX NUTRITION</span>
          </div>
        </div>

        {/* Filter Tabs and Search Bar */}
        <div className="p-3 bg-[#131622] border border-[#1E2333] rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
          {/* Workflow Tabs */}
          <div className="flex items-center bg-[#090A10] border border-[#1E2333] rounded p-0.5 text-xs font-mono font-medium">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "pending"
                  ? "bg-[#181C2D] text-amber-300 font-semibold border border-[#2B3248] shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Pending Action ({pendingCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("approved")}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "approved"
                  ? "bg-[#181C2D] text-emerald-300 font-semibold border border-[#2B3248] shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Approved ({approvedCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("changes_requested")}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "changes_requested"
                  ? "bg-[#181C2D] text-rose-300 font-semibold border border-[#2B3248] shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Changes Req. ({rejectedCount})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter queue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090A10] border border-[#1E2333] focus:border-violet-500 focus:outline-none rounded pl-8 pr-3 py-1 text-xs text-slate-200 font-mono placeholder:text-slate-600 transition-colors"
            />
          </div>
        </div>

        {/* Approvals Queue Cards */}
        <div className="space-y-3">
          {displayItems.length > 0 ? (
            displayItems.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-lg bg-[#131622] border border-[#1E2333] hover:border-[#2B3248] transition-all space-y-3.5 shadow-xs"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/submissions/${item.id}`}
                        className="text-sm font-semibold text-slate-100 hover:text-violet-300 transition-colors"
                      >
                        {item.title}
                      </Link>
                      <Badge variant="tag" size="xs">
                        {item.type}
                      </Badge>
                      <Badge variant="metadata" size="xs">
                        {item.channel}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
                      <span>AUTHOR: {item.author}</span>
                      <span>•</span>
                      <span>ASSIGNED: {item.reviewer}</span>
                      <span>•</span>
                      <span className="text-slate-500">{item.timestamp}</span>
                    </div>
                  </div>

                  {/* Score pill */}
                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <div className="text-right">
                      <div
                        className={`font-mono text-sm font-semibold tabular-nums ${
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
                        ? "Cleared"
                        : item.status === "changes_requested"
                        ? "Changes Req."
                        : "Needs Review"}
                    </Badge>
                  </div>
                </div>

                {/* Content snippet with red-line highlight preview */}
                <div className="p-3 rounded bg-[#090A10] border border-[#1E2333] text-xs text-slate-300 font-sans leading-relaxed">
                  <div className="text-[10px] font-mono text-slate-500 mb-1">
                    SUBMITTED MARKETING PHRASING:
                  </div>
                  <p>&ldquo;{item.summary}&rdquo;</p>

                  {item.flaggedText && item.suggestedFix && (
                    <div className="mt-2.5 pt-2 border-t border-[#161925] font-mono text-[11px] flex flex-col gap-1">
                      <div className="text-rose-400 flex items-center gap-1.5">
                        <span className="font-bold select-none">-</span>
                        <span className="line-through decoration-rose-500/50">{item.flaggedText}</span>
                      </div>
                      <div className="text-emerald-300 flex items-center gap-1.5">
                        <span className="font-bold select-none">+</span>
                        <span>{item.suggestedFix}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer action bar */}
                <div className="pt-1 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-[11px] font-mono text-slate-500">
                    SUBMISSION ID: {item.id}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === "pending" && (
                      <>
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => handleQuickReject(item.id)}
                          loading={actionInProgress === item.id}
                        >
                          Request Changes
                        </Button>
                        <Button
                          size="xs"
                          variant="approve"
                          onClick={() => handleQuickApprove(item.id)}
                          loading={actionInProgress === item.id}
                          icon={<Check className="w-3 h-3" />}
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
            <div className="p-12 text-center text-slate-500 font-mono text-xs bg-[#131622] rounded-lg border border-[#1E2333]">
              QUEUE EMPTY: NO SUBMISSIONS IN THIS STATUS
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
