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
  Building2,
  User,
  ShieldAlert,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { openCommandK } from "@/components/ui/CommandK";

interface SubmissionItem {
  id: string;
  title: string;
  brand: string;
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
    brand: "Apex Nutrition",
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
    brand: "Apex Nutrition",
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
    brand: "Apex Nutrition",
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
    brand: "Zenith Cloud",
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
    brand: "Apex Nutrition",
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
  const [selectedBrand, setSelectedBrand] = useState<string>("Apex Nutrition");
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
          // Merge or supplement
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
      color: "bg-white",
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
    let matchesFilter = true;
    if (filterStatus === "needs_review") {
      matchesFilter = sub.status === "pending";
    } else if (filterStatus === "approved") {
      matchesFilter = sub.status === "approved";
    } else if (filterStatus === "flagged") {
      matchesFilter = sub.status === "changes_requested" || sub.issuesCount > 0;
    }

    const matchesBrand = selectedBrand === "All Brands" ? true : sub.brand === selectedBrand;

    const matchesSearch =
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.brand.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesBrand && matchesSearch;
  });

  // Client-side direct JSON export
  const handleExportJSON = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      organization: `${selectedBrand} Workspace`,
      totalAudited: 34,
      healthScore: "84/100",
      submissions: submissions.map((s) => ({
        id: s.id,
        title: s.title,
        brand: s.brand,
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
    a.download = `adsnitch-audit-log-${new Date().toISOString().slice(0, 10)}.json`;
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
    const headers = ["ID", "Title", "Brand", "Channel", "Compliance Score", "Status", "Flags Count", "Author", "Submitted"];
    const rows = submissions.map((s) => [
      s.id,
      `"${s.title.replace(/"/g, '""')}"`,
      `"${s.brand}"`,
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
    a.download = `adsnitch-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
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
    router.push("/prototype-notice?feature=certified_pdf_engine");
  };

  return (
    <AppLayout
      title="Governance Cockpit"
      subtitle="Operational brand claims, active pre-flight queue, and regulatory telemetry."
    >
      <div className="space-y-6">
        {/* Workspace Header: Active Brand Switcher, User Badge, Quick Actions */}
        <div className="bg-[#141414] border border-[#303030] rounded-xl p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="Engine Online" />
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Brand Governance Cockpit
                </h1>

                {/* Active Brand Switcher */}
                <div className="flex items-center gap-2 bg-[#191919] border border-[#303030] rounded-lg px-3 py-1.5 text-xs">
                  <Building2 className="w-4 h-4 text-white" />
                  <span className="text-[#888888] font-medium">BRAND:</span>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Apex Nutrition" className="bg-[#191919] text-white">Apex Nutrition</option>
                    <option value="Zenith Cloud" className="bg-[#191919] text-white">Zenith Cloud</option>
                    <option value="All Brands" className="bg-[#191919] text-white">All Brands</option>
                  </select>
                </div>

                {/* User Badge */}
                <div className="flex items-center gap-2 bg-[#191919] border border-[#303030] rounded-lg px-3 py-1.5 text-xs text-[#D4D4D4]">
                  <User className="w-4 h-4 text-[#A0A0A0]" />
                  <span className="font-semibold text-white">Daksh Agrawal</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white font-medium">ADMIN</span>
                </div>
              </div>

              <p className="text-sm sm:text-[15px] text-[#A0A0A0] leading-relaxed max-w-3xl">
                Multi-tenant telemetry: <span className="text-white font-medium">32 verified claims</span> · <span className="text-emerald-400 font-medium">0 statutory breaches</span> · Real-time pre-flight inspection active under FTC § 255 &amp; FDA 21 CFR § 101.93.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0 relative">
              {/* Review Queue Quick Action */}
              <Link href="/approvals" className="w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Clock className="w-4 h-4 text-white" />}
                  className="w-full sm:w-auto min-h-[44px] justify-center"
                >
                  Review Queue (3)
                </Button>
              </Link>

              {/* Export Audit Log Dropdown */}
              <div className="relative w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Download className="w-4 h-4 text-white" />}
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="w-full sm:w-auto min-h-[44px] justify-center"
                >
                  Export Audit Log
                </Button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#141414] border border-[#303030] shadow-2xl p-1.5 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#888888] border-b border-[#282828]">
                      CHOOSE EXPORT FORMAT
                    </div>
                    <button
                      onClick={handleExportJSON}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#E0E0E0] hover:bg-[#1E1E1E] hover:text-white transition-colors cursor-pointer text-left"
                    >
                      <FileCode2 className="w-4 h-4 text-white" />
                      <div>
                        <div className="font-medium text-white">Direct JSON Export</div>
                        <div className="text-xs text-[#888888]">Full provenance dossier (.json)</div>
                      </div>
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#E0E0E0] hover:bg-[#1E1E1E] hover:text-white transition-colors cursor-pointer text-left"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-white" />
                      <div>
                        <div className="font-medium text-white">Direct CSV Spreadsheet</div>
                        <div className="text-xs text-[#888888]">Tabular audit rows (.csv)</div>
                      </div>
                    </button>
                    <button
                      onClick={handleExportAdvancedPDF}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-[#1A1A1A] hover:text-emerald-400 transition-colors cursor-pointer text-left border-t border-[#222222] pt-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-medium text-white flex items-center gap-1.5">
                          <span>Certified PDF Dossier</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-white font-mono">PKI</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">RFC-3161 Timestamped PDF</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* New Audit Action */}
              <Link href="/submissions/new" className="w-full sm:w-auto">
                <Button
                  size="sm"
                  className="gold-button w-full sm:w-auto min-h-[44px] justify-center"
                  icon={<Plus className="w-3.5 h-3.5 text-black" />}
                  shortcut="N"
                >
                  New Audit
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

        {/* Impending Claims Expiry Alert Banner with 1-Click Jump */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#141414] to-[#141414] border border-amber-500/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                  IMPENDING CLAIMS EXPIRATION WATCHLIST (&lt;30 DAYS)
                </span>
                <span className="led-indicator led-amber" />
              </div>
              <p className="text-xs text-[#B5B5B5] mt-0.5">
                Claim <span className="font-mono text-white font-semibold">CLM-APX-002</span> (&ldquo;Informed-Sport Certified&rdquo;) expires in <span className="text-[#F59E0B] font-bold font-mono">17 days</span>. 2 active drafts depend on this substantiation.
              </p>
            </div>
          </div>

          <Link href="/knowledge-base/claims" className="shrink-0">
            <Button
              size="xs"
              variant="secondary"
              className="border-amber-500/40 text-amber-300 hover:text-white hover:bg-amber-500/20"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Jump to Claims Library
            </Button>
          </Link>
        </div>

        {/* 4 Core KPI Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Content Audited */}
          <div className="bg-[#141414] border border-[#303030] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-[#888888]">
              <span className="text-xs uppercase tracking-wider text-[#858585] font-medium">
                Content Audited
              </span>
              <FileText className="w-4 h-4 text-white" />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold text-white tracking-tight">
                34
              </span>
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +12% this week
              </span>
            </div>

            <div className="text-xs text-[#858585] border-t border-[#262626] pt-2.5 flex items-center justify-between">
              <span>Active Pipeline</span>
              <span className="text-[#D4D4D4] font-medium">Organization Total</span>
            </div>
          </div>

          {/* Card 2: Average Compliance Health Score */}
          <div className="bg-[#141414] border border-[#303030] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-[#888888]">
              <span className="text-xs uppercase tracking-wider text-[#858585] font-medium">
                Compliance Score
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold text-emerald-400 tracking-tight">
                84/100
              </span>
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +6 pts
              </span>
            </div>

            <div className="text-xs text-[#858585] border-t border-[#262626] pt-2.5 flex items-center justify-between">
              <span>Pass-Through Rate</span>
              <span className="text-emerald-400 font-semibold">77.8%</span>
            </div>
          </div>

          {/* Card 3: Pending Human Approvals */}
          <div className="bg-[#141414] border border-[#303030] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-[#888888]">
              <span className="text-xs uppercase tracking-wider text-[#858585] font-medium">
                Pending Approvals
              </span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold text-amber-400 tracking-tight">
                3 queued
              </span>
              <span className="text-xs text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/25">
                1 critical
              </span>
            </div>

            <div className="text-xs text-[#858585] border-t border-[#262626] pt-2.5 flex items-center justify-between">
              <span>Avg Turnaround</span>
              <span className="text-[#D4D4D4] font-medium">1.2 hrs</span>
            </div>
          </div>

          {/* Card 4: Impending Claims Expirations */}
          <div className="bg-[#141414] border border-[#303030] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-[#888888]">
              <span className="text-xs uppercase tracking-wider text-[#858585] font-medium">
                Claims Expirations
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold text-white tracking-tight">
                2 claims
              </span>
              <span className="text-xs font-medium text-amber-400 flex items-center gap-0.5">
                &lt;30 days
              </span>
            </div>

            <div className="text-xs text-[#858585] border-t border-[#262626] pt-2.5 flex items-center justify-between">
              <span>Cascade Risk</span>
              <span className="text-amber-400 font-medium">Quarantine Ready</span>
            </div>
          </div>
        </div>

        {/* Two-Column Swiss Layout: Filterable Submissions Table (8 cols) & High-Risk Watchlist Panel (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Filterable Recent Submissions Table */}
          <div className="lg:col-span-8 space-y-3">
            <div className="bg-[#141414] border border-[#303030] rounded-xl overflow-hidden shadow-sm">
              {/* Header and Filter Toolbar */}
              <div className="p-4 sm:p-5 border-b border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">
                    Recent Submissions
                  </span>
                  <span className="text-xs text-[#888888] bg-[#1E1E1E] px-2.5 py-0.5 rounded-full border border-[#2E2E2E]">
                    {filteredSubmissions.length} of {submissions.length} items
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Search Bar */}
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 absolute left-3 text-[#737373] pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Filter submissions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-[#0A0A0A] border border-[#2E2E2E] focus:border-white focus:outline-none rounded-lg pl-9 pr-10 py-1.5 text-xs text-white placeholder:text-[#666666] w-48 sm:w-56 transition-colors"
                    />
                    <button
                      onClick={openCommandK}
                      title="Trigger Global Command Bar (Ctrl+K)"
                      className="absolute right-1.5 px-1.5 py-0.5 text-xs text-[#888888] bg-[#161616] hover:text-white rounded border border-[#2E2E2E] cursor-pointer"
                    >
                      ⌘K
                    </button>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center bg-[#0A0A0A] border border-[#2E2E2E] rounded-lg p-1 text-xs overflow-x-auto whitespace-nowrap scrollbar-none max-w-full">
                    {[
                      { id: "all", label: "All" },
                      { id: "needs_review", label: "Needs Review" },
                      { id: "approved", label: "Approved" },
                      { id: "flagged", label: "Flagged" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id)}
                        className={`px-3 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                          filterStatus === tab.id
                            ? "bg-[#222222] text-white shadow-xs"
                            : "text-[#888888] hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Table with Clean 14px Typography & Horizontal Scroll Guarantee */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[720px]">
                  <thead className="bg-[#0D0D0D] border-b border-[#262626] text-xs font-medium uppercase tracking-wider text-[#888888]">
                    <tr>
                      <th className="px-5 py-3.5">Title</th>
                      <th className="px-3.5 py-3.5">Channel</th>
                      <th className="px-3.5 py-3.5">Brand</th>
                      <th className="px-3.5 py-3.5">Issues Found</th>
                      <th className="px-3.5 py-3.5 text-center">Score</th>
                      <th className="px-3.5 py-3.5">Status</th>
                      <th className="px-3.5 py-3.5">Timestamp</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222222]">
                    {filteredSubmissions.length > 0 ? (
                      filteredSubmissions.map((sub) => {
                        const isApproved = sub.status === "approved";
                        const isPending = sub.status === "pending";

                        return (
                          <tr
                            key={sub.id}
                            className="hover:bg-[#181818] transition-colors"
                          >
                            {/* Title with Clean Status Indicator */}
                            <td className="px-5 py-4 font-medium text-white">
                              <Link
                                href={`/submissions/${sub.id}`}
                                className="hover:text-neutral-300 transition-colors flex items-center gap-2.5 max-w-[220px] truncate"
                              >
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    isApproved
                                      ? "bg-emerald-400"
                                      : isPending
                                      ? "bg-amber-400"
                                      : "bg-rose-400"
                                  }`}
                                />
                                <span className="truncate">{sub.title}</span>
                              </Link>
                            </td>

                            {/* Channel */}
                            <td className="px-3.5 py-4 text-xs text-[#A0A0A0]">
                              <span className="px-2 py-0.5 rounded bg-[#191919] border border-[#2E2E2E] text-[#D4D4D4]">
                                {sub.channel}
                              </span>
                            </td>

                            {/* Brand */}
                            <td className="px-3.5 py-4 text-xs text-[#D4D4D4]">
                              {sub.brand}
                            </td>

                            {/* Issues Found */}
                            <td className="px-3.5 py-4">
                              {sub.issuesCount > 0 ? (
                                <span className="inline-flex items-center gap-1.5 text-xs text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                                  {sub.issuesCount} Flags
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                  0 Flags
                                </span>
                              )}
                            </td>

                            {/* Score */}
                            <td className="px-3.5 py-4 text-center">
                              <span
                                className={`font-semibold text-xs px-2 py-0.5 rounded ${
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

                            {/* Status */}
                            <td className="px-3.5 py-4">
                              <Badge
                                variant={
                                  sub.status === "approved"
                                    ? "approved"
                                    : sub.status === "pending"
                                    ? "pending"
                                    : "warning"
                                }
                                size="xs"
                              >
                                {sub.status === "approved"
                                  ? "Approved"
                                  : sub.status === "pending"
                                  ? "Needs Review"
                                  : "Flagged"}
                              </Badge>
                            </td>

                            {/* Timestamp */}
                            <td className="px-3.5 py-4 text-xs text-[#888888]">
                              {sub.submittedAt}
                            </td>

                            {/* Action Link to /submissions/[id] */}
                            <td className="px-5 py-4 text-right">
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
                          colSpan={8}
                          className="px-4 py-12 text-center text-[#888888] text-sm"
                        >
                          No submissions found matching active filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="px-5 py-3.5 bg-[#0D0D0D] border-t border-[#262626] flex items-center justify-between text-xs text-[#888888]">
                <span>Showing {filteredSubmissions.length} of {submissions.length} submissions</span>
                <Link
                  href="/submissions"
                  className="text-white hover:underline font-medium flex items-center gap-1.5"
                >
                  <span>Open Full Submissions Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): High-Risk Issues Panel & Watchlist */}
          <div className="lg:col-span-4 space-y-4">
            {/* High-Risk Issues Panel */}
            <div className="bg-[#141414] border border-[#303030] rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-[#262626] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    High-Risk Issues Watchlist
                  </h3>
                  <p className="text-xs text-[#888888] mt-0.5">
                    Statutory frequency distribution
                  </p>
                </div>
                <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-md font-semibold">
                  28 Total
                </span>
              </div>

              <div className="p-5 space-y-4">
                {topIssues.map((issue) => (
                  <div key={issue.title} className="space-y-1.5">
                    <div className="flex items-start justify-between text-xs gap-2">
                      <div className="space-y-0.5">
                        <div className="text-white font-medium text-xs leading-snug">
                          {issue.title}
                        </div>
                        <div className="text-xs text-[#888888]">
                          {issue.code} · {issue.category}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-semibold text-white">
                          {issue.count}
                        </span>
                        <span className="text-xs text-[#888888] ml-1">
                          ({issue.percentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#0A0A0A] rounded-full overflow-hidden border border-[#262626]">
                      <div
                        className={`h-full ${issue.color} rounded-full`}
                        style={{ width: `${issue.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t border-[#262626]">
                  <Link
                    href="/analytics"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#191919] hover:bg-[#222222] border border-[#303030] text-xs font-medium text-white transition-colors"
                  >
                    <Activity className="w-3.5 h-3.5 text-white" />
                    <span>Open Compliance Analytics</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Claims Health Ledger Card */}
            <div className="bg-[#141414] border border-[#303030] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Claims Truth Ledger
                </span>
                <Badge variant="approved" size="xs">
                  32 ACTIVE
                </Badge>
              </div>

              <p className="text-[14px] text-[#A0A0A0] leading-relaxed">
                All 32 claims indexed for {selectedBrand} are mapped to verified clinical or USPTO assay records. 2 claims require renewal within 30 days.
              </p>

              <div className="pt-3 border-t border-[#262626] flex items-center justify-between text-xs">
                <span className="text-amber-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  2 expiring soon
                </span>
                <Link
                  href="/knowledge-base/claims"
                  className="text-white hover:underline font-medium flex items-center gap-1"
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
