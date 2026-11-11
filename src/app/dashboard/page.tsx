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
    router.push("/prototype-notice?feature=certified_pdf_engine");
  };

  return (
    <AppLayout
      title="Governance Cockpit"
      subtitle="Operational brand claims, active pre-flight queue, and regulatory telemetry."
    >
      <div className="space-y-6">
        {/* Workspace Header: Active Brand Switcher, User Badge, Quick Actions */}
        <div className="tactile-card rounded-xl p-5 space-y-4 border-[#282828] bg-[#0E0E0E]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="led-indicator led-turquoise" title="Deterministic Engine Online" />
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Brand Governance Cockpit
                </h1>

                {/* Active Brand Switcher */}
                <div className="flex items-center gap-1.5 bg-[#141414] border border-[#282828] rounded-lg px-2.5 py-1 text-xs font-mono">
                  <Building2 className="w-3.5 h-3.5 text-[#00F2FE]" />
                  <span className="text-slate-400">BRAND:</span>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Apex Nutrition" className="bg-[#141414] text-white">Apex Nutrition</option>
                    <option value="Zenith Cloud" className="bg-[#141414] text-white">Zenith Cloud</option>
                    <option value="All Brands" className="bg-[#141414] text-white">All Brands</option>
                  </select>
                </div>

                {/* User Badge */}
                <div className="flex items-center gap-1.5 bg-[#141414] border border-[#282828] rounded-lg px-2.5 py-1 text-xs font-mono text-slate-300">
                  <User className="w-3.5 h-3.5 text-[#E5A93C]" />
                  <span className="font-semibold text-white">Daksh Agrawal</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-white/10 text-slate-300">ADMIN</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                Multi-tenant telemetry: <span className="font-mono text-white font-medium">32 verified claims</span> · <span className="text-emerald-400 font-mono font-medium">0 statutory breaches</span> · Real-time pre-flight inspection active under FTC § 255 &amp; FDA 21 CFR § 101.93.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative">
              {/* Review Queue Quick Action */}
              <Link href="/approvals">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Clock className="w-3.5 h-3.5 text-[#E5A93C]" />}
                >
                  Review Queue (3)
                </Button>
              </Link>

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
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0E0E0E] border border-[#282828] shadow-2xl p-1.5 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 border-b border-[#222222]">
                      CHOOSE EXPORT FORMAT
                    </div>
                    <button
                      onClick={handleExportJSON}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-[#1A1A1A] hover:text-[#00F2FE] transition-colors cursor-pointer text-left"
                    >
                      <FileCode2 className="w-4 h-4 text-[#00F2FE]" />
                      <div>
                        <div className="font-medium text-white">Direct JSON Export</div>
                        <div className="text-[10px] text-slate-500 font-mono">Full provenance dossier (.json)</div>
                      </div>
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-[#1A1A1A] hover:text-[#E5A93C] transition-colors cursor-pointer text-left"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-[#E5A93C]" />
                      <div>
                        <div className="font-medium text-white">Direct CSV Spreadsheet</div>
                        <div className="text-[10px] text-slate-500 font-mono">Tabular audit rows (.csv)</div>
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
              <Link href="/submissions/new">
                <Button
                  size="sm"
                  className="gold-button"
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
              <p className="text-xs text-slate-300 mt-0.5">
                Claim <span className="font-mono text-cyan-300 font-semibold">CLM-APX-002</span> (&ldquo;Informed-Sport Certified&rdquo;) expires in <span className="text-amber-400 font-bold font-mono">17 days</span>. 2 active drafts depend on this substantiation.
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

        {/* 4 Core KPI Telemetry Cards with Monospace Tabular Numerals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Content Audited */}
          <div className="tactile-card rounded-xl p-5 space-y-3 border-[#282828] bg-[#0E0E0E]">
            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <span className="led-indicator led-turquoise" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  Content Audited
                </span>
              </div>
              <FileText className="w-4 h-4 text-[#00F2FE]" />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-white tracking-tight">
                34
              </span>
              <span className="text-xs font-mono font-medium text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +12% this week
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500 border-t border-[#222222] pt-2.5 flex items-center justify-between">
              <span>ACTIVE PIPELINE</span>
              <span className="text-slate-300 font-medium">ORGANIZATION TOTAL</span>
            </div>
          </div>

          {/* Card 2: Average Compliance Health Score */}
          <div className="tactile-card rounded-xl p-5 space-y-3 border-[#282828] bg-[#0E0E0E]">
            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <span className="led-indicator led-emerald" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  Compliance Score
                </span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-emerald-400 tracking-tight">
                84/100
              </span>
              <span className="text-xs font-mono font-medium text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +6 pts
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500 border-t border-[#222222] pt-2.5 flex items-center justify-between">
              <span>PASS-THROUGH RATE</span>
              <span className="text-emerald-400 font-bold tabular-nums">77.8%</span>
            </div>
          </div>

          {/* Card 3: Pending Human Approvals */}
          <div className="tactile-card rounded-xl p-5 space-y-3 border-[#282828] bg-[#0E0E0E]">
            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <span className="led-indicator led-amber" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  Pending Approvals
                </span>
              </div>
              <Clock className="w-4 h-4 text-[#E5A93C]" />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-[#F3BA54] tracking-tight">
                3 queued
              </span>
              <span className="text-[11px] font-mono text-rose-400 font-semibold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/25">
                1 critical
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500 border-t border-[#222222] pt-2.5 flex items-center justify-between">
              <span>AVG TURNAROUND</span>
              <span className="text-slate-200 font-semibold tabular-nums">1.2 HRS</span>
            </div>
          </div>

          {/* Card 4: Impending Claims Expirations */}
          <div className="tactile-card rounded-xl p-5 space-y-3 border-[#282828] bg-[#0E0E0E]">
            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <span className="led-indicator led-gold" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  Claims Expirations
                </span>
              </div>
              <AlertTriangle className="w-4 h-4 text-[#E5A93C]" />
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-white tracking-tight">
                2 claims
              </span>
              <span className="text-xs font-mono font-medium text-amber-400 flex items-center gap-0.5">
                &lt;30 days
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-500 border-t border-[#222222] pt-2.5 flex items-center justify-between">
              <span>CASCADE RISK</span>
              <span className="text-amber-400 font-semibold tracking-wide">QUARANTINE READY</span>
            </div>
          </div>
        </div>

        {/* Two-Column Swiss Layout: Filterable Submissions Table (8 cols) & High-Risk Watchlist Panel (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Filterable Recent Submissions Table */}
          <div className="lg:col-span-8 space-y-3">
            <div className="tactile-card rounded-xl overflow-hidden border-[#282828] bg-[#0E0E0E]">
              {/* Header and Filter Toolbar */}
              <div className="p-4 border-b border-[#222222] bg-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="led-indicator led-turquoise" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    Recent Submissions
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 bg-[#0E0E0E] px-2 py-0.5 rounded border border-[#282828]">
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
                      className="bg-[#080808] border border-[#282828] focus:border-white focus:outline-none rounded-md pl-8 pr-12 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 w-44 sm:w-52 font-mono transition-colors"
                    />
                    <button
                      onClick={openCommandK}
                      title="Trigger Global Command Bar (⌘K)"
                      className="absolute right-1 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-[#161616] hover:text-white rounded border border-[#282828] cursor-pointer"
                    >
                      ⌘K
                    </button>
                  </div>

                  {/* Filter Tabs matching SECTION_INVENTORY.md: All, Needs Review, Approved, Flagged */}
                  <div className="flex items-center bg-[#080808] border border-[#282828] rounded-lg p-1 text-[11px] font-medium">
                    {[
                      { id: "all", label: "All" },
                      { id: "needs_review", label: "Needs Review" },
                      { id: "approved", label: "Approved" },
                      { id: "flagged", label: "Flagged" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id)}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-sans ${
                          filterStatus === tab.id
                            ? "bg-[#222222] text-white font-semibold shadow-xs border border-[#333333]"
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
                  <thead className="bg-[#080808] border-b border-[#222222] text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-3 py-3">Channel</th>
                      <th className="px-3 py-3">Brand</th>
                      <th className="px-3 py-3">Issues Found</th>
                      <th className="px-3 py-3 text-center">Score</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Timestamp</th>
                      <th className="px-4 py-3 text-right">Action Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C1C1C]">
                    {filteredSubmissions.length > 0 ? (
                      filteredSubmissions.map((sub) => {
                        const isApproved = sub.status === "approved";
                        const isPending = sub.status === "pending";

                        return (
                          <tr
                            key={sub.id}
                            className="hover:bg-[#141414] transition-colors group"
                          >
                            {/* Title with LED Status Indicator */}
                            <td className="px-4 py-3.5 font-medium text-slate-200">
                              <Link
                                href={`/submissions/${sub.id}`}
                                className="hover:text-[#00F2FE] transition-colors flex items-center gap-2 max-w-[200px] truncate"
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
                              <span className="px-1.5 py-0.5 rounded bg-[#141414] border border-[#282828] text-slate-300">
                                {sub.channel}
                              </span>
                            </td>

                            {/* Brand */}
                            <td className="px-3 py-3.5 text-slate-300 text-xs font-mono">
                              {sub.brand}
                            </td>

                            {/* Issues Found */}
                            <td className="px-3 py-3.5">
                              {sub.issuesCount > 0 ? (
                                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                                  {sub.issuesCount} Flags
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                  0 Flags
                                </span>
                              )}
                            </td>

                            {/* Score */}
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
                                  ? "Needs Review"
                                  : "Flagged"}
                              </Badge>
                            </td>

                            {/* Timestamp */}
                            <td className="px-3 py-3.5 text-slate-400 font-mono text-[11px]">
                              {sub.submittedAt}
                            </td>

                            {/* Action Link to /submissions/[id] */}
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
                          colSpan={8}
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
              <div className="px-4 py-3 bg-[#080808] border-t border-[#222222] flex items-center justify-between text-[11px] font-mono text-slate-500">
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

          {/* Right Column (4 cols): High-Risk Issues Panel & Watchlist */}
          <div className="lg:col-span-4 space-y-4">
            {/* High-Risk Issues Panel with Statutory Citation and Frequency Counter */}
            <div className="tactile-card rounded-xl overflow-hidden border-[#282828] bg-[#0E0E0E]">
              <div className="px-4 py-3.5 border-b border-[#222222] bg-[#141414] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    High-Risk Issues &amp; Watchlist
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                    FREQUENCY DISTRIBUTION (STATUTORY FLAGS)
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
                        <span className="font-mono text-xs font-bold tabular-nums text-white">
                          {issue.count}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 ml-1">
                          ({issue.percentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#080808] rounded-full overflow-hidden border border-[#222222]">
                      <div
                        className={`h-full ${issue.color} rounded-full`}
                        style={{ width: `${issue.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t border-[#222222]">
                  <Link
                    href="/analytics"
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] border border-[#282828] text-xs font-medium text-slate-200 hover:text-white transition-colors"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#00F2FE]" />
                    <span>Open Compliance Analytics</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Claims Health Ledger Card */}
            <div className="tactile-card rounded-xl p-4 sm:p-5 space-y-3 border-[#282828] bg-[#0E0E0E]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Claims Truth Ledger
                </span>
                <Badge variant="verified" size="xs">
                  32 ACTIVE
                </Badge>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                All 32 claims indexed for {selectedBrand} are mapped to verified clinical or USPTO assay records. 2 claims require renewal within 30 days.
              </p>

              <div className="pt-2 border-t border-[#222222] flex items-center justify-between text-[11px] font-mono">
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
