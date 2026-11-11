"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  FileSpreadsheet,
  FileCode2,
  Sparkles,
  Command,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { openCommandK } from "@/components/ui/CommandK";

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
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(INITIAL_SUBMISSIONS);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/submissions?orgId=org_uideas_digital")
      .then((res) => res.json())
      .then((data) => {
        if (data.submissions && data.submissions.length > 0) {
          // Merge or supplement if available
        }
      })
      .catch(() => {});
  }, []);

  // Top recurring issues with exact statistics & statutory citations
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
      color: "bg-[#E5A93C]",
    },
    {
      title: "Missing Statutory FDA DSHEA Disclaimer",
      category: "Mandatory Regulatory Notice",
      code: "21 CFR § 101.93",
      count: 5,
      percentage: 18,
      trend: "0 unchanged",
      trendUp: false,
      color: "bg-[#00F2FE]",
    },
    {
      title: "Inconsistent Trademark / Terminology",
      category: "Intellectual Property Standard",
      code: "USPTO Brand Doc",
      count: 4,
      percentage: 14,
      trend: "-1 vs last week",
      trendUp: false,
      color: "bg-emerald-400",
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

  // Client-side direct JSON export
  const handleExportJSON = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      organization: "Apex Nutrition (brand_apex)",
      totalAudited: 36,
      approvedRate: "77.8%",
      submissions: submissions.map((s) => ({
        id: s.id,
        title: s.title,
        channel: s.channel,
        score: `${s.score}%`,
        status: s.status,
        issuesCount: s.issuesCount,
        author: s.author.name,
        submittedAt: s.submittedAt,
      })),
      regulatoryCitationStandards: [
        "FTC § 255.2 Substantiation",
        "FDA 21 CFR § 101.93 DSHEA",
        "ISO 22196 Antimicrobial Assay Standard",
      ],
      auditStamp: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1a209b1f074d6b05be5cf6287c",
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inkloom-audit-log-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    setExportNotice("Audit log exported as JSON successfully.");
    setTimeout(() => setExportNotice(null), 3500);
  };

  // Client-side direct CSV export
  const handleExportCSV = () => {
    const headers = ["ID", "Title", "Channel", "Compliance Score", "Status", "Flags Count", "Author", "Submitted"];
    const rows = submissions.map((s) => [
      s.id,
      `"${s.title.replace(/"/g, '""')}"`,
      `"${s.channel}"`,
      `${s.score}%`,
      s.status,
      s.issuesCount,
      `"${s.author.name}"`,
      `"${s.submittedAt}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inkloom-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    setExportNotice("Audit log exported as CSV successfully.");
    setTimeout(() => setExportNotice(null), 3500);
  };

  // Route to Prototype notice for RFC-3161 PDF certification
  const handleExportAdvancedPDF = () => {
    setShowExportMenu(false);
    router.push("/prototype-notice");
  };

  return (
    <AppLayout
      title="Governance Overview"
      subtitle="Operational brand claims, active pre-flight queue, and regulatory telemetry."
    >
      <div className="space-y-7">
        {/* Top Operational Status Bar with Swiss Grid and Classic Navy Depth */}
        <div className="tactile-card rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="led-indicator led-turquoise" title="Pre-flight active" />
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-100">
                  Governance Workspace Overview
                </h1>
                <span className="gold-badge text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded tracking-wider uppercase">
                  APEX NUTRITION
                </span>
                <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
                  RLS SCOPE: TENANT-VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                Organization telemetry: <span className="font-mono text-slate-300 font-medium">32 verified claims</span> · <span className="text-emerald-400 font-mono font-medium">0 statutory breaches</span> · Deterministic pre-flight active with ISO 22196 &amp; FTC § 255.2 guardrails.
              </p>
            </div>

            {/* Action Buttons: Export Audit Log + Review Content */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative">
              {/* Export Audit Log Dropdown */}
              <div className="relative">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Download className="w-3.5 h-3.5 text-[#00F2FE]" />}
                  onClick={() => setShowExportMenu(!showExportMenu)}
                >
                  Export Audit Log
                </Button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#080C16] border border-[#1E2B4A] shadow-2xl p-1.5 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 border-b border-[#162038]">
                      CHOOSE EXPORT FORMAT
                    </div>
                    <button
                      onClick={handleExportJSON}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-[#111C35] hover:text-[#00F2FE] transition-colors cursor-pointer text-left"
                    >
                      <FileCode2 className="w-4 h-4 text-[#00F2FE]" />
                      <div>
                        <div className="font-medium">Direct JSON Export</div>
                        <div className="text-[10px] text-slate-500 font-mono">Full provenance dossier (.json)</div>
                      </div>
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-[#111C35] hover:text-[#E5A93C] transition-colors cursor-pointer text-left"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-[#E5A93C]" />
                      <div>
                        <div className="font-medium">Direct CSV Spreadsheet</div>
                        <div className="text-[10px] text-slate-500 font-mono">Tabular audit rows (.csv)</div>
                      </div>
                    </button>
                    <button
                      onClick={handleExportAdvancedPDF}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-[#111C35] hover:text-emerald-400 transition-colors cursor-pointer text-left border-t border-[#162038] pt-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-medium flex items-center gap-1.5">
                          <span>Certified PDF Dossier</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-violet-500/20 text-violet-300 font-mono">PKI</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">RFC-3161 Timestamped PDF</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Review Content button linking to /submissions/new */}
              <Link href="/submissions/new">
                <Button
                  size="sm"
                  className="gold-button"
                  icon={<Plus className="w-3.5 h-3.5 text-[#080C16]" />}
                  shortcut="N"
                >
                  Review Content
                </Button>
              </Link>
            </div>
          </div>

          {/* Export notice alert */}
          {exportNotice && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{exportNotice}</span>
              </span>
              <button
                onClick={() => setExportNotice(null)}
                className="text-emerald-400 hover:text-white text-xs font-mono"
              >
                DISMISS
              </button>
            </div>
          )}
        </div>

        {/* 4 Tactile Skeuomorphic Metric Cards with Monospace Tabular Numerals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: 36 Reviewed */}
          <div className="tactile-card rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <span className="led-indicator led-turquoise" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  Drafts Reviewed
                </span>
              </div>
              <FileText className="w-4 h-4 text-[#00F2FE]" />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-slate-100 tracking-tight">
                36
              </span>
              <span className="text-xs font-mono font-medium text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +24%
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500 border-t border-[#1E2B4A] pt-2.5 flex items-center justify-between">
              <span>VS. LAST 7 DAYS</span>
              <span className="text-slate-300 font-medium">29 PREV</span>
            </div>
          </div>

          {/* Card 2: 28 Approved */}
          <div className="tactile-card rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <span className="led-indicator led-emerald" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  Approved Grounded
                </span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-slate-100 tracking-tight">
                28
              </span>
              <span className="text-xs font-mono font-medium text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +18%
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500 border-t border-[#1E2B4A] pt-2.5 flex items-center justify-between">
              <span>PASS-THROUGH RATE</span>
              <span className="text-emerald-400 font-bold tabular-nums">77.8%</span>
            </div>
          </div>

          {/* Card 3: 5 Pending */}
          <div className="tactile-card rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <span className="led-indicator led-amber" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  Pending Sign-off
                </span>
              </div>
              <Clock className="w-4 h-4 text-[#E5A93C]" />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-[#F3BA54] tracking-tight">
                5
              </span>
              <span className="text-[11px] font-mono text-[#E5A93C] font-medium bg-[#E5A93C]/10 px-1.5 py-0.5 rounded border border-[#E5A93C]/20">
                Awaiting Gate
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500 border-t border-[#1E2B4A] pt-2.5 flex items-center justify-between">
              <span>AVG TURNAROUND</span>
              <span className="text-slate-200 font-semibold tabular-nums">1.2 HRS</span>
            </div>
          </div>

          {/* Card 4: 4 Recurring Issues */}
          <div className="tactile-card rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <span className="led-indicator led-gold" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  Recurring Issues
                </span>
              </div>
              <AlertTriangle className="w-4 h-4 text-[#E5A93C]" />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-slate-100 tracking-tight">
                4
              </span>
              <span className="text-xs font-mono font-medium text-emerald-400 flex items-center gap-0.5">
                <ArrowDownRight className="w-3.5 h-3.5" /> -33%
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500 border-t border-[#1E2B4A] pt-2.5 flex items-center justify-between">
              <span>RISK VELOCITY</span>
              <span className="text-emerald-400 font-semibold tracking-wide">IMPROVING</span>
            </div>
          </div>
        </div>

        {/* Two-Column Swiss Layout: Filterable Submissions Table (8 cols) & Governance Telemetry (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Filterable Recent Submissions Table */}
          <div className="lg:col-span-8 space-y-3">
            <div className="tactile-card rounded-xl overflow-hidden">
              {/* Header and Filter Toolbar */}
              <div className="p-4 border-b border-[#1E2B4A] bg-[#0A0F1D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="led-indicator led-turquoise" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    Recent Submissions
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 bg-[#111C35] px-2 py-0.5 rounded border border-[#1E2B4A]">
                    {filteredSubmissions.length} OF {submissions.length} ROWS
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Search Bar triggering CommandK or filtering rows */}
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Filter submissions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-md pl-8 pr-12 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 w-44 sm:w-52 font-mono transition-colors"
                    />
                    <button
                      onClick={openCommandK}
                      title="Trigger Global Command Bar (⌘K)"
                      className="absolute right-1 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-[#111C35] hover:text-white rounded border border-[#1E2B4A] cursor-pointer"
                    >
                      ⌘K
                    </button>
                  </div>

                  {/* Filter Tabs: All, Pending, Approved, Changes Req. */}
                  <div className="flex items-center bg-[#080C16] border border-[#1E2B4A] rounded-lg p-1 text-[11px] font-medium">
                    {[
                      { id: "all", label: "All" },
                      { id: "pending", label: "Pending" },
                      { id: "approved", label: "Approved" },
                      { id: "changes_requested", label: "Changes Req." },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id)}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-sans ${
                          filterStatus === tab.id
                            ? "bg-[#162445] text-white font-semibold shadow-xs border border-[#2E416E]"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Table with Swiss Density and Status LEDs */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#080C16] border-b border-[#1E2B4A] text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                    <tr>
                      <th className="px-4 py-3">Submission Record</th>
                      <th className="px-3 py-3">Channel / Context</th>
                      <th className="px-3 py-3 text-center">Score</th>
                      <th className="px-3 py-3">Audit Findings</th>
                      <th className="px-3 py-3">Author</th>
                      <th className="px-3 py-3">Status Gate</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#162038]">
                    {filteredSubmissions.length > 0 ? (
                      filteredSubmissions.map((sub) => {
                        const isApproved = sub.status === "approved";
                        const isPending = sub.status === "pending";

                        return (
                          <tr
                            key={sub.id}
                            className="hover:bg-[#111C35]/60 transition-colors group"
                          >
                            {/* Title with LED Status Indicator */}
                            <td className="px-4 py-3.5 font-medium text-slate-200">
                              <Link
                                href={`/submissions/${sub.id}`}
                                className="hover:text-[#00F2FE] transition-colors flex items-center gap-2.5 max-w-xs truncate"
                              >
                                <span
                                  className={`led-indicator ${
                                    isApproved
                                      ? "led-emerald"
                                      : isPending
                                      ? "led-turquoise"
                                      : "led-amber"
                                  }`}
                                />
                                <span className="truncate font-sans">{sub.title}</span>
                              </Link>
                            </td>

                            {/* Channel */}
                            <td className="px-3 py-3.5 text-slate-400 font-mono text-[11px]">
                              <span className="px-2 py-0.5 rounded bg-[#080C16] border border-[#1E2B4A] text-slate-300">
                                {sub.channel}
                              </span>
                            </td>

                            {/* Monospace Tabular Score */}
                            <td className="px-3 py-3.5 text-center">
                              <span
                                className={`font-mono font-semibold tabular-nums text-xs px-2 py-0.5 rounded ${
                                  sub.score >= 80
                                    ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25"
                                    : sub.score >= 50
                                    ? "text-amber-400 bg-amber-500/10 border border-amber-500/25"
                                    : "text-rose-400 bg-rose-500/10 border border-rose-500/25"
                                }`}
                              >
                                {sub.score}%
                              </span>
                            </td>

                            {/* Findings */}
                            <td className="px-3 py-3.5">
                              {sub.issuesCount > 0 ? (
                                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                                  {sub.issuesCount} Flags
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                  Cleared
                                </span>
                              )}
                            </td>

                            {/* Author */}
                            <td className="px-3 py-3.5 text-slate-300 text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded bg-[#111C35] border border-[#1E2B4A] flex items-center justify-center text-[10px] font-mono text-[#E5A93C] font-semibold">
                                  {sub.author.initials}
                                </span>
                                <span className="text-[11px] text-slate-300 truncate max-w-[85px]">
                                  {sub.author.name}
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-3 py-3.5">
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

                            {/* Action Button linking to /submissions/[id] */}
                            <td className="px-4 py-3.5 text-right">
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
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-slate-500 font-mono text-xs"
                        >
                          NO SUBMISSIONS FOUND MATCHING ACTIVE FILTER
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="px-4 py-3 bg-[#080C16] border-t border-[#1E2B4A] flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>SHOWING {filteredSubmissions.length} OF {submissions.length} SUBMISSIONS</span>
                <Link
                  href="/submissions"
                  className="text-[#00F2FE] hover:underline font-sans flex items-center gap-1"
                >
                  <span>Open Full Submissions Desk</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Recurring Flags & Truth Library Ledger */}
          <div className="lg:col-span-4 space-y-4">
            {/* Recurring Flags Frequency Chart */}
            <div className="tactile-card rounded-xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-[#1E2B4A] bg-[#0A0F1D] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    Recurring Governance Flags
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                    FREQUENCY DISTRIBUTION (THIS WEEK)
                  </p>
                </div>
                <span className="font-mono text-xs tabular-nums text-[#E5A93C] bg-[#E5A93C]/10 border border-[#E5A93C]/25 px-2 py-0.5 rounded font-semibold">
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
                    <div className="w-full h-1.5 bg-[#080C16] rounded-full overflow-hidden border border-[#1E2B4A]">
                      <div
                        className={`h-full ${issue.color} rounded-full`}
                        style={{ width: `${issue.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t border-[#1E2B4A]">
                  <Link
                    href="/analytics"
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#080C16] hover:bg-[#111C35] border border-[#1E2B4A] text-xs font-medium text-slate-200 hover:text-white transition-colors"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#00F2FE]" />
                    <span>Open Compliance Analytics</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Claims Health Ledger Card */}
            <div className="tactile-card rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Claims Health Ledger
                </span>
                <Badge variant="verified" size="xs">
                  32 ACTIVE
                </Badge>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                All 32 claims indexed for Apex Nutrition are mapped to verified clinical or USPTO assay records. 2 claims require renewal within 30 days.
              </p>

              <div className="pt-2 border-t border-[#1E2B4A] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#E5A93C] font-semibold flex items-center gap-1.5">
                  <span className="led-indicator led-gold" />
                  2 EXPIRING SOON
                </span>
                <Link
                  href="/knowledge-base/claims"
                  className="text-[#00F2FE] hover:underline font-sans flex items-center gap-1"
                >
                  Manage Truth Library &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
