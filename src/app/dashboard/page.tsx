"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Filter,
  Search,
  Plus,
  ShieldCheck,
  Download,
  Database,
  ExternalLink,
  Layers,
  Activity,
  ArrowRight,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface SubmissionItem {
  id: string;
  title: string;
  type: string;
  channel: string;
  issuesCount: number;
  author: { name: string; initials: string };
  status: "pending" | "approved" | "changes_requested";
  score: number;
  submittedAt: string;
}

const INITIAL_SUBMISSIONS: SubmissionItem[] = [
  {
    id: "sub_reel_script",
    title: "Q4 Campaign – Clinical Protein Reel Script",
    type: "Video Script",
    channel: "Instagram Reel",
    issuesCount: 3,
    author: { name: "Riddhi S.", initials: "RS" },
    status: "pending",
    score: 18,
    submittedAt: "14m ago",
  },
  {
    id: "sub_insta_launch",
    title: "Product Launch – Recovery Blend Carousel",
    type: "Social Copy",
    channel: "Instagram Carousel",
    issuesCount: 0,
    author: { name: "Laksh K.", initials: "LK" },
    status: "approved",
    score: 96,
    submittedAt: "1h ago",
  },
  {
    id: "sub_banner_v2",
    title: "Global Website Banner – Winter Immunity V2",
    type: "Web Copy",
    channel: "Homepage Hero",
    issuesCount: 1,
    author: { name: "Mansoor R.", initials: "MR" },
    status: "changes_requested",
    score: 64,
    submittedAt: "2h ago",
  },
  {
    id: "sub_email_promo",
    title: "Enterprise SaaS SLA Email Announcement",
    type: "Email Direct",
    channel: "B2B Newsletter",
    issuesCount: 0,
    author: { name: "Daksh A.", initials: "DA" },
    status: "approved",
    score: 98,
    submittedAt: "4h ago",
  },
  {
    id: "sub_clinical_whitepaper",
    title: "Bio-Peptide Cutaneous Efficacy Study Summary",
    type: "Whitepaper",
    channel: "Healthcare Portal",
    issuesCount: 2,
    author: { name: "Dr. Marcus Lin", initials: "ML" },
    status: "pending",
    score: 42,
    submittedAt: "6h ago",
  },
];

export default function DashboardPage() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(INITIAL_SUBMISSIONS);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetch("/api/submissions?orgId=org_uideas_digital")
      .then((res) => res.json())
      .then((data) => {
        if (data.submissions && data.submissions.length > 0) {
          // Merge or supplement
        }
      })
      .catch(() => {});
  }, []);

  // Top compliance issues with exact statistics & statutory citations
  const topIssues = [
    {
      title: "Unverified Multiplier Metric ('2x faster')",
      category: "Statutory Substantiation",
      code: "FTC § 255.2",
      count: 12,
      percentage: 43,
      trend: "+2 vs last week",
      trendUp: true,
      color: "bg-rose-500",
    },
    {
      title: "Off-Brand Aggressive / Superlative Tone",
      category: "Brand Voice Alignment",
      code: "Voice Guild-04",
      count: 7,
      percentage: 25,
      trend: "-3 vs last week",
      trendUp: false,
      color: "bg-amber-500",
    },
    {
      title: "Missing Statutory FDA DSHEA Disclaimer",
      category: "Mandatory Regulatory Notice",
      code: "21 CFR § 101.93",
      count: 5,
      percentage: 18,
      trend: "0 unchanged",
      trendUp: false,
      color: "bg-amber-500",
    },
    {
      title: "Inconsistent Trademark / Terminology",
      category: "Intellectual Property Standard",
      code: "USPTO Brand Doc",
      count: 4,
      percentage: 14,
      trend: "-1 vs last week",
      trendUp: false,
      color: "bg-cyan-500",
    },
  ];

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesFilter = filterStatus === "all" ? true : sub.status === filterStatus;
    const matchesSearch =
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.channel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AppLayout
      title="Governance Overview"
      subtitle="Operational brand claims, active pre-flight queue, and regulatory telemetry."
    >
      <div className="space-y-6">
        {/* Top Operational Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-100">
                Governance Workspace Overview
              </h1>
              <span className="font-mono text-[10px] uppercase font-medium px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/25">
                APEX NUTRITION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Organization telemetry: 32 verified claims · 0 statutory breaches · Deterministic pre-flight active.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/knowledge-base/claims">
              <Button
                size="sm"
                variant="secondary"
                icon={<Database className="w-3.5 h-3.5" />}
              >
                Claims Library
              </Button>
            </Link>
            <Link href="/submissions/new">
              <Button
                size="sm"
                variant="primary"
                icon={<Plus className="w-3.5 h-3.5" />}
                shortcut="N"
              >
                Audit New Draft
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Precision Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Drafts Reviewed */}
          <div className="p-4 rounded-lg bg-[#131622] border border-[#1E2333] space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Drafts Reviewed
              </span>
              <FileText className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold font-mono tabular-nums text-slate-100">
                36
              </span>
              <span className="text-[11px] font-mono font-medium text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +24%
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 border-t border-[#161925] pt-2 flex items-center justify-between">
              <span>VS. LAST 7 DAYS</span>
              <span className="text-slate-400">29 PREV</span>
            </div>
          </div>

          {/* Approved */}
          <div className="p-4 rounded-lg bg-[#131622] border border-[#1E2333] space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Approved Grounded
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold font-mono tabular-nums text-slate-100">
                28
              </span>
              <span className="text-[11px] font-mono font-medium text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +18%
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 border-t border-[#161925] pt-2 flex items-center justify-between">
              <span>PASS-THROUGH RATE</span>
              <span className="text-emerald-400 font-semibold">77.8%</span>
            </div>
          </div>

          {/* Needs Review */}
          <div className="p-4 rounded-lg bg-[#131622] border border-[#1E2333] space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Pending Approval Gate
              </span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold font-mono tabular-nums text-amber-300">
                5
              </span>
              <span className="text-[11px] font-mono text-amber-400 font-medium">
                Awaiting Sign-off
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 border-t border-[#161925] pt-2 flex items-center justify-between">
              <span>AVG TURNAROUND</span>
              <span className="text-slate-300">1.2 HRS</span>
            </div>
          </div>

          {/* Issues Repeated */}
          <div className="p-4 rounded-lg bg-[#131622] border border-[#1E2333] space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Recurring Violations
              </span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold font-mono tabular-nums text-slate-100">
                4
              </span>
              <span className="text-[11px] font-mono font-medium text-emerald-400 flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" /> -33%
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 border-t border-[#161925] pt-2 flex items-center justify-between">
              <span>RISK VELOCITY</span>
              <span className="text-emerald-400">IMPROVING</span>
            </div>
          </div>
        </div>

        {/* Two-Column Layout: Filterable Recent Submissions Table & Top Issues Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Recent Submissions Data Table */}
          <div className="lg:col-span-8 space-y-3">
            <div className="bg-[#131622] border border-[#1E2333] rounded-lg overflow-hidden shadow-xs">
              {/* Header and Filter Toolbar */}
              <div className="p-3.5 border-b border-[#1E2333] bg-[#0E1017] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    Audit Submissions
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    ({filteredSubmissions.length} ITEMS)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Filter submissions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-[#090A10] border border-[#1E2333] focus:border-violet-500 focus:outline-none rounded pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-600 w-36 sm:w-44 font-mono transition-colors"
                    />
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center bg-[#090A10] border border-[#1E2333] rounded p-0.5 text-[11px] font-medium">
                    {[
                      { id: "all", label: "All" },
                      { id: "pending", label: "Pending" },
                      { id: "approved", label: "Approved" },
                      { id: "changes_requested", label: "Changes" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id)}
                        className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                          filterStatus === tab.id
                            ? "bg-[#181C2D] text-slate-100 font-semibold shadow-xs"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#090A10] border-b border-[#1E2333] text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                    <tr>
                      <th className="px-4 py-2.5">Submission Name</th>
                      <th className="px-3 py-2.5">Channel / Scope</th>
                      <th className="px-3 py-2.5 text-center">Score</th>
                      <th className="px-3 py-2.5">Findings</th>
                      <th className="px-3 py-2.5">Author</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Audit Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1D2B]">
                    {filteredSubmissions.length > 0 ? (
                      filteredSubmissions.map((sub) => (
                        <tr
                          key={sub.id}
                          className="hover:bg-[#171B2B] transition-colors group"
                        >
                          {/* Title */}
                          <td className="px-4 py-3 font-medium text-slate-200">
                            <Link
                              href={`/submissions/${sub.id}`}
                              className="hover:text-violet-300 transition-colors flex items-center gap-2 max-w-xs truncate"
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  sub.status === "approved"
                                    ? "bg-emerald-400"
                                    : sub.status === "pending"
                                    ? "bg-violet-400"
                                    : "bg-amber-400"
                                }`}
                              />
                              <span className="truncate">{sub.title}</span>
                            </Link>
                          </td>

                          {/* Channel */}
                          <td className="px-3 py-3 text-slate-400 font-mono text-[11px]">
                            <span className="px-1.5 py-0.5 rounded bg-[#181C2D] border border-[#2B3248] text-slate-300">
                              {sub.channel}
                            </span>
                          </td>

                          {/* Score */}
                          <td className="px-3 py-3 text-center">
                            <span
                              className={`font-mono font-semibold tabular-nums text-xs px-1.5 py-0.5 rounded ${
                                sub.score >= 80
                                  ? "text-emerald-400 bg-emerald-500/10"
                                  : sub.score >= 50
                                  ? "text-amber-400 bg-amber-500/10"
                                  : "text-rose-400 bg-rose-500/10"
                              }`}
                            >
                              {sub.score}%
                            </span>
                          </td>

                          {/* Findings */}
                          <td className="px-3 py-3">
                            {sub.issuesCount > 0 ? (
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-rose-300 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/25">
                                <span className="w-1 h-1 rounded-full bg-rose-400" />
                                {sub.issuesCount} Flags
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/25">
                                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                Cleared
                              </span>
                            )}
                          </td>

                          {/* Author Avatar & Initials */}
                          <td className="px-3 py-3 text-slate-300 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded bg-[#181C2D] border border-[#2B3248] flex items-center justify-center text-[10px] font-mono text-slate-300 font-semibold">
                                {sub.author.initials}
                              </span>
                              <span className="text-[11px] text-slate-300 truncate max-w-[80px]">
                                {sub.author.name}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-3 py-3">
                            <Badge
                              variant={
                                sub.status === "approved"
                                  ? "verified"
                                  : sub.status === "pending"
                                  ? "pending"
                                  : "warning"
                              }
                              size="xs"
                            >
                              {sub.status === "approved"
                                ? "Approved"
                                : sub.status === "pending"
                                ? "In Review"
                                : "Changes Req."}
                            </Badge>
                          </td>

                          {/* Action Button */}
                          <td className="px-4 py-3 text-right">
                            <Link href={`/submissions/${sub.id}`}>
                              <Button
                                size="xs"
                                variant={sub.status === "pending" ? "primary" : "secondary"}
                              >
                                {sub.status === "pending" ? "Inspect" : "View"}
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-slate-500 font-mono text-xs"
                        >
                          NO SUBMISSIONS FOUND MATCHING ACTIVE FILTER
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="px-4 py-2.5 bg-[#090A10] border-t border-[#1E2333] flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>SHOWING {filteredSubmissions.length} OF {submissions.length} SUBMISSIONS</span>
                <Link
                  href="/submissions"
                  className="text-violet-400 hover:text-violet-300 font-sans flex items-center gap-1"
                >
                  <span>View All In Submissions Desk</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Top Issues Frequency Chart */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#131622] border border-[#1E2333] rounded-lg overflow-hidden shadow-xs">
              <div className="px-4 py-3 border-b border-[#1E2333] bg-[#0E1017] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    Recurring Governance Flags
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                    FREQUENCY DISTRIBUTION (THIS WEEK)
                  </p>
                </div>
                <span className="font-mono text-xs tabular-nums text-slate-400 bg-[#181C2D] px-2 py-0.5 rounded border border-[#2B3248]">
                  28 TOTAL
                </span>
              </div>

              <div className="p-4 space-y-4">
                {topIssues.map((issue) => (
                  <div key={issue.title} className="space-y-1.5">
                    <div className="flex items-start justify-between text-xs gap-2">
                      <div className="space-y-0.5">
                        <div className="text-slate-200 font-medium text-xs leading-tight">
                          {issue.title}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {issue.code} · {issue.category}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-bold tabular-nums text-slate-100">
                          {issue.count}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 ml-1">
                          ({issue.percentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#090A10] rounded-full overflow-hidden border border-[#1E2333]">
                      <div
                        className={`h-full ${issue.color} rounded-full`}
                        style={{ width: `${issue.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t border-[#1E2333] space-y-2">
                  <Link
                    href="/analytics"
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-[#181C2D] hover:bg-[#20253B] border border-[#2B3248] text-xs font-medium text-slate-200 hover:text-white transition-colors"
                  >
                    <Activity className="w-3.5 h-3.5 text-violet-400" />
                    <span>Open Compliance Analytics</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Claims Status Card */}
            <div className="p-4 rounded-lg bg-[#131622] border border-[#1E2333] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Claims Health Ledger
                </span>
                <Badge variant="verified" size="xs">32 ACTIVE</Badge>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                All 32 claims indexed for Apex Nutrition are mapped to verified clinical or USPTO assay records. 2 claims require renewal within 30 days.
              </p>

              <div className="pt-1 flex items-center justify-between text-[11px] font-mono">
                <span className="text-amber-400">2 EXPIRING SOON</span>
                <Link
                  href="/knowledge-base/claims"
                  className="text-violet-400 hover:text-violet-300 font-sans flex items-center gap-1"
                >
                  Manage Library &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
