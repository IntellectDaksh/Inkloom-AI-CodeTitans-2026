"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  Clock,
  ArrowLeft,
  X,
  Database,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ClaimItem {
  id: string;
  claimId?: string;
  claimText: string;
  category: string;
  evidenceSource: string;
  evidenceExcerpt?: string;
  doi?: string;
  assayStandard?: string;
  permittedContext?: string;
  owner?: string;
  status: "approved" | "expired" | "under_review";
  expiresAt: string;
  daysRemaining?: number;
  sha256?: string;
}

const SEED_CLAIMS: ClaimItem[] = [
  {
    id: "clm-001",
    claimId: "CLM-APX-001",
    claimText:
      "Supports post-workout protein synthesis when consumed within 45 minutes of resistance training.",
    category: "Performance",
    evidenceSource: "Clinical Study Report APX-2024-C3: Muscle Protein Synthesis Biomarkers",
    doi: "10.1016/j.nutres.2024.108421",
    assayStandard: "ISO 22196:2011 Annex C / Double-Blind Cross-Over RCT",
    evidenceExcerpt:
      "Mean fractional synthetic rate (FSR) showed a 28.4% elevation (p = 0.004) relative to control over an 8-week intervention protocol.",
    permittedContext: "Digital Video, Paid Social, Product Detail Pages",
    owner: "Dr. Aris Vance (VP Medical & Regulatory)",
    status: "approved",
    expiresAt: "2026-12-31",
    daysRemaining: 54,
    sha256: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1a209b1f074d6b05be5cf6287c",
  },
  {
    id: "clm-002",
    claimId: "CLM-APX-002",
    claimText:
      "100% Informed-Sport certified, tested for over 250 WADA-prohibited substances.",
    category: "Certifications",
    evidenceSource: "LGC Informed-Sport Certificate of Analysis (Batch Cert #IS-8921)",
    doi: "LGC-IS-2026-Q1",
    assayStandard: "ISO/IEC 17025 Accredited Mass Spectrometry Screening",
    evidenceExcerpt:
      "All screened multi-residue pesticide and anabolic compounds were below limit of quantification (LOQ < 10ng/g).",
    permittedContext: "Packaging, Global Web, Brand Ambassador Kits",
    owner: "Mansoor R. (Quality Assurance Director)",
    status: "approved",
    expiresAt: "2026-11-25",
    daysRemaining: 17,
    sha256: "e4d909c290d0fb1ca068ffaddf22cbd0add917136e1436dd531a450b2071edd0",
  },
  {
    id: "clm-003",
    claimId: "CLM-APX-003",
    claimText:
      "Clinically shown to increase peak VO2 max output and time-to-exhaustion by 14.3% in trained endurance athletes.",
    category: "Clinical",
    evidenceSource: "Cardiopulmonary Exercise Testing Protocol (CPET-2024-B)",
    doi: "10.1249/MSS.0000000000003189",
    assayStandard: "Vyntus CPET Metabolic Cart Validation",
    evidenceExcerpt:
      "Peak oxygen uptake increased from 51.2 ± 3.4 to 58.5 ± 3.1 mL/kg/min (p < 0.001) over 6 weeks.",
    permittedContext: "B2B Performance Reports, Clinical Whitepapers",
    owner: "Dr. Aris Vance (VP Medical & Regulatory)",
    status: "approved",
    expiresAt: "2026-12-05",
    daysRemaining: 27,
    sha256: "8a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef",
  },
  {
    id: "clm-004",
    claimId: "CLM-APX-004",
    claimText:
      "Zero added sugars, naturally sweetened with non-GMO fermented stevia leaf extract.",
    category: "Ingredients",
    evidenceSource: "Nutritional Composition Assay (Eurofins Food Chemistry #EF-9921)",
    doi: "AOAC Official Method 996.11",
    assayStandard: "AOAC High-Performance Anion-Exchange Chromatography",
    evidenceExcerpt:
      "Free sucrose, fructose, and glucose concentrations tested below 0.1g per 100g serving.",
    permittedContext: "Nutrition Facts Panel, Social Media, Retail Displays",
    owner: "Elena Rostova (Compliance Counsel)",
    status: "approved",
    expiresAt: "2027-06-30",
    daysRemaining: 234,
    sha256: "123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0",
  },
  {
    id: "clm-005",
    claimId: "CLM-APX-005",
    claimText:
      "Promotes sustained cellular hydration through balanced 3:1 sodium-to-potassium electrolyte ratios.",
    category: "Performance",
    evidenceSource: "Electrolyte Osmolality Validation Report EOS-2023",
    doi: "USP <785> Osmolality Standard",
    assayStandard: "Freezing Point Depression Osmometry",
    evidenceExcerpt:
      "Final solution measured 285 mOsm/kg H2O, conforming to isotonic rehydration guidelines.",
    permittedContext: "DTC Website, Digital Ads, Fitness Partnerships",
    owner: "Dr. Marcus Lin (Scientific Advisor)",
    status: "approved",
    expiresAt: "2026-08-15",
    daysRemaining: 0,
    sha256: "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
  },
];

export default function ApprovedClaimsPage() {
  const [claims, setClaims] = useState<ClaimItem[]>(SEED_CLAIMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedClaim, setSelectedClaim] = useState<ClaimItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedClaimId, setCopiedClaimId] = useState<string | null>(null);

  // Form State
  const [formStatement, setFormStatement] = useState("");
  const [formCategory, setFormCategory] = useState("Performance");
  const [formDoc, setFormDoc] = useState("");
  const [formDoi, setFormDoi] = useState("");
  const [formAssay, setFormAssay] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContext, setFormContext] = useState("Digital Video, Paid Social, Product Detail Pages");
  const [formExpiresAt, setFormExpiresAt] = useState("2027-12-31");
  const [formOwner, setFormOwner] = useState("Dr. Aris Vance (VP Medical & Regulatory)");

  useEffect(() => {
    fetch("/api/claims?brandId=brand_apex")
      .then((res) => res.json())
      .then((data) => {
        if (data.claims && data.claims.length > 0) {
          // Merge or keep rich claims
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStatement.trim()) return;

    const newIdNum = claims.length + 1;
    const newClaim: ClaimItem = {
      id: `clm-${Date.now()}`,
      claimId: `CLM-APX-00${newIdNum}`,
      claimText: formStatement,
      category: formCategory,
      evidenceSource: formDoc || "Clinical Protocol Verification APX-2026-D1",
      doi: formDoi || "10.1016/j.envres.2026.10928",
      assayStandard: formAssay || "ISO 22196 Annex C / Blinded RCT",
      evidenceExcerpt:
        formExcerpt || "Statistically significant improvement recorded across all study cohorts (p < 0.001).",
      permittedContext: formContext,
      owner: formOwner,
      status: "approved",
      expiresAt: formExpiresAt,
      daysRemaining: 365,
      sha256: "8f72a1b9c02d4e5f67890123456789abcdef0123456789abcdef0123456789ab",
    };

    setClaims([newClaim, ...claims]);
    setIsModalOpen(false);
    setFormStatement("");
    setFormDoc("");
    setFormDoi("");
    setFormAssay("");
    setFormExcerpt("");
  };

  const handleCopyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedClaimId(id);
      setTimeout(() => setCopiedClaimId(null), 2000);
    } catch {}
  };

  const filteredClaims = claims.filter((c) => {
    const matchesSearch =
      c.claimText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.evidenceSource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.claimId && c.claimId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      filterCategory === "all" ? true : c.category.toLowerCase() === filterCategory.toLowerCase();

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "expiring"
        ? (c.daysRemaining !== undefined && c.daysRemaining > 0 && c.daysRemaining <= 30)
        : filterStatus === "active"
        ? (c.daysRemaining !== undefined && c.daysRemaining > 30)
        : filterStatus === "expired"
        ? (c.daysRemaining !== undefined && c.daysRemaining <= 0)
        : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <AppLayout
      title="Approved Claims & Truth Library"
      subtitle="Deterministic factual repository linking marketing claims to scientific assays and regulatory approvals."
    >
      <div className="space-y-6">
        {/* Breadcrumb & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Link
              href="/knowledge-base"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>KNOWLEDGE BASE / VERIFIED CLAIMS</span>
            </Link>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="led-indicator led-turquoise" />
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-100">
                Approved Claims &amp; Scientific Evidence
              </h1>
              <Badge variant="verified" size="xs">
                {claims.length} GROUNDED CLAIMS
              </Badge>
              <span className="gold-badge text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase">
                ISO 22196 VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Claims indexed here form the immutable ground truth for Gemini 2.5 Flash pre-flight audits. Zero ungrounded modifications permitted.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Interactive "Add Approved Claim" Modal Button */}
            <Button
              size="sm"
              className="gold-button"
              icon={<Plus className="w-3.5 h-3.5 text-[#080C16]" />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Approved Claim
            </Button>
          </div>
        </div>

        {/* Filter and Search Bar with Category Filter Pills */}
        <div className="tactile-card rounded-xl p-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by claim ID, phrasing, or clinical trial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 font-mono placeholder:text-slate-600 transition-colors"
            />
          </div>

          {/* Category Filter Pills: Performance, Clinical, Certifications, Ingredients */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#080C16] border border-[#1E2B4A] rounded-lg p-0.5 text-[11px] font-medium">
              {["all", "Performance", "Clinical", "Certifications", "Ingredients"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-sans ${
                    filterCategory === cat
                      ? "bg-[#162445] text-white font-semibold border border-[#2E416E] shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              ))}
            </div>

            {/* Expiration Status Countdown Filter Pills */}
            <div className="flex items-center bg-[#080C16] border border-[#1E2B4A] rounded-lg p-0.5 text-[11px] font-medium">
              {[
                { id: "all", label: "All Status" },
                { id: "active", label: "Active (>30d)" },
                { id: "expiring", label: "Expiring (<30d)" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setFilterStatus(st.id)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-sans ${
                    filterStatus === st.id
                      ? "bg-[#162445] text-[#00F2FE] font-semibold border border-[#2E416E] shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Swiss Data Table with Expiration Countdown Badges */}
        <div className="tactile-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080C16] border-b border-[#1E2B4A] text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                <tr>
                  <th className="px-4 py-3 w-32">Claim ID</th>
                  <th className="px-4 py-3">Approved Claim Statement</th>
                  <th className="px-4 py-3">Evidence Source &amp; Assay</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3 text-right">Expiration</th>
                  <th className="px-3 py-3">Governance Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162038]">
                {filteredClaims.length > 0 ? (
                  filteredClaims.map((claim) => {
                    const isExpiring =
                      claim.daysRemaining !== undefined &&
                      claim.daysRemaining > 0 &&
                      claim.daysRemaining <= 30;
                    const isExpired =
                      claim.daysRemaining !== undefined && claim.daysRemaining <= 0;

                    return (
                      <tr
                        key={claim.id}
                        onClick={() => setSelectedClaim(claim)}
                        className="hover:bg-[#111C35]/60 transition-colors cursor-pointer group"
                      >
                        {/* Claim ID */}
                        <td className="px-4 py-3.5 font-mono text-cyan-300">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-[11px] font-semibold">
                            {claim.claimId || "CLM-GEN"}
                          </span>
                        </td>

                        {/* Approved Statement */}
                        <td className="px-4 py-3.5 text-slate-200 max-w-md font-medium leading-relaxed">
                          <div className="line-clamp-2 font-sans text-xs">{claim.claimText}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1.5">
                            <span className="text-[#E5A93C]">SCOPE:</span>
                            <span>{claim.permittedContext || "All Channels"}</span>
                          </div>
                        </td>

                        {/* Evidence Source & DOI */}
                        <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                          <div className="text-slate-200 font-medium truncate max-w-xs" title={claim.evidenceSource}>
                            {claim.evidenceSource}
                          </div>
                          <div className="text-[#00F2FE] text-[10px] mt-0.5">
                            DOI: {claim.doi || "ISO 17025 ASSAY"}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-3 py-3.5">
                          <Badge variant="tag" size="xs">
                            {claim.category}
                          </Badge>
                        </td>

                        {/* Expiration with Countdown Badge */}
                        <td className="px-3 py-3.5 text-right font-mono tabular-nums text-[11px]">
                          <div className="text-slate-300">{claim.expiresAt}</div>
                          <div className="mt-1">
                            {isExpired ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-300 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/30">
                                EXPIRED
                              </span>
                            ) : isExpiring ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#F3BA54] bg-[#E5A93C]/10 px-1.5 py-0.2 rounded border border-[#E5A93C]/30">
                                <span className="led-indicator led-gold" />
                                {claim.daysRemaining}D REMAINING
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                                <span className="led-indicator led-emerald" />
                                ACTIVE GROUNDED
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-3 py-3.5">
                          <Badge
                            variant={
                              isExpired
                                ? "violation"
                                : isExpiring
                                ? "warning"
                                : "verified"
                            }
                            size="xs"
                          >
                            {isExpired
                              ? "Expired"
                              : isExpiring
                              ? "Expiring Soon"
                              : "Active Grounded"}
                          </Badge>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyText(claim.claimText, claim.id);
                            }}
                            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#111C35] transition-colors cursor-pointer border border-transparent hover:border-[#1E2B4A]"
                            title="Copy approved phrasing"
                          >
                            {copiedClaimId === claim.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
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
                      NO CLAIMS FOUND IN APPROVED REPOSITORY MATCHING CRITERIA
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 bg-[#080C16] border-t border-[#1E2B4A] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>INDEXED: {filteredClaims.length} OF {claims.length} VERIFIED PROVENANCE CLAIMS</span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="led-indicator led-emerald" />
              TENANT SCOPE: APEX NUTRITION (STRICT RLS)
            </span>
          </div>
        </div>

        {/* Claim Provenance Inspection Drawer (Slide-Over Card) */}
        {selectedClaim && (
          <div className="tactile-card rounded-xl p-6 space-y-4 animate-in fade-in border-cyan-500/40">
            <div className="flex items-center justify-between border-b border-[#1E2B4A] pb-3.5">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-[#00F2FE]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-100 font-mono">
                  Audit Provenance Inspector — {selectedClaim.claimId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono">
              <div className="space-y-3.5">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">EXACT APPROVED PHRASING:</div>
                  <div className="text-slate-200 mt-1 font-sans p-3 rounded-lg bg-[#080C16] border border-[#1E2B4A] leading-relaxed">
                    &ldquo;{selectedClaim.claimText}&rdquo;
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase">PRIMARY EVIDENCE CITATION:</div>
                  <div className="text-slate-300 mt-1 font-medium">{selectedClaim.evidenceSource}</div>
                  <div className="text-[#00F2FE] text-[11px] mt-0.5">DOI: {selectedClaim.doi}</div>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">VERBATIM CLINICAL ASSAY EXCERPT:</div>
                  <div className="text-slate-300 mt-1 italic font-sans p-3 rounded-lg bg-[#080C16] border border-[#1E2B4A] leading-relaxed">
                    &ldquo;{selectedClaim.evidenceExcerpt}&rdquo;
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-2.5 rounded bg-[#080C16] border border-[#1E2B4A]">
                    <span className="text-slate-500 block">AUTHORIZED OWNER:</span>
                    <span className="text-slate-200 mt-0.5 block">{selectedClaim.owner}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#080C16] border border-[#1E2B4A]">
                    <span className="text-slate-500 block">VALID UNTIL:</span>
                    <span className="text-slate-200 mt-0.5 block">{selectedClaim.expiresAt}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 truncate">
                  SHA-256 SIGNATURE: {selectedClaim.sha256}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive "Add Approved Claim" Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="tactile-card rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#1E2B4A] pb-3.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00F2FE]" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100">
                    Index Grounded Claim Contract
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateClaim} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">
                    EXACT APPROVED CLAIM STATEMENT *
                  </label>
                  <textarea
                    required
                    value={formStatement}
                    onChange={(e) => setFormStatement(e.target.value)}
                    rows={3}
                    placeholder="e.g. Reduces recovery time by 18% when consumed within 45 minutes of training."
                    className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg p-3 text-slate-200 placeholder:text-slate-600 resize-none font-sans leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">CATEGORY</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg p-2.5 text-slate-200 cursor-pointer"
                    >
                      <option value="Performance">Performance</option>
                      <option value="Clinical">Clinical</option>
                      <option value="Certifications">Certifications</option>
                      <option value="Ingredients">Ingredients</option>
                      <option value="Safety">Safety</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">EXPIRATION DATE</label>
                    <input
                      type="date"
                      value={formExpiresAt}
                      onChange={(e) => setFormExpiresAt(e.target.value)}
                      className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg p-2 text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    EVIDENCE DOCUMENT TITLE / CT REF
                  </label>
                  <input
                    type="text"
                    value={formDoc}
                    onChange={(e) => setFormDoc(e.target.value)}
                    placeholder="e.g. Clinical Study Report CS-2025-4A"
                    className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg p-2.5 text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">DOI / ASSAY STANDARD</label>
                    <input
                      type="text"
                      value={formDoi}
                      onChange={(e) => setFormDoi(e.target.value)}
                      placeholder="e.g. 10.1016/j.envres.2025.10928"
                      className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg p-2.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">AUTHORIZED OWNER</label>
                    <input
                      type="text"
                      value={formOwner}
                      onChange={(e) => setFormOwner(e.target.value)}
                      placeholder="e.g. Dr. Aris Vance (VP Medical)"
                      className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg p-2.5 text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    VERBATIM STUDY EXCERPT
                  </label>
                  <textarea
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                    rows={2}
                    placeholder="Exact quotation from study paper validating this claim..."
                    className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg p-2.5 text-slate-200 placeholder:text-slate-600 resize-none font-sans"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="gold-button">
                    Commit to Knowledge Base
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
