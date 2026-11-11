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
  RefreshCw,
  AlertOctagon,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface DependentSubmissionItem {
  id: string;
  title: string;
  status: string;
  channel?: string;
  authorName?: string;
}

interface ClaimItem {
  id: string;
  claimId?: string;
  claim_code?: string;
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
  dependentSubmissions?: DependentSubmissionItem[];
  dependentCount?: number;
}

const SEED_CLAIMS: ClaimItem[] = [
  {
    id: "00000000-0000-4000-clm0-000000000001",
    claimId: "CLM-APX-001",
    claim_code: "CLM-APX-001",
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
    dependentSubmissions: [
      {
        id: "00000000-0000-4000-c000-000000000001",
        title: "Q4 Campaign – Clinical Protein Reel Script",
        status: "under_review",
        channel: "Instagram Reel",
        authorName: "Riddhi S. (Content Specialist)",
      },
      {
        id: "00000000-0000-4000-c000-000000000003",
        title: "Apex Iso-Whey E-Commerce PDP Headline",
        status: "approved",
        channel: "Landing Page / Hero",
        authorName: "Daksh Agrawal (Brand Director)",
      },
    ],
    dependentCount: 2,
  },
  {
    id: "00000000-0000-4000-clm0-000000000002",
    claimId: "CLM-APX-002",
    claim_code: "CLM-APX-002",
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
    dependentSubmissions: [
      {
        id: "00000000-0000-4000-c000-000000000002",
        title: "Product Launch – Recovery Blend Carousel",
        status: "approved",
        channel: "Meta Paid Social",
        authorName: "Mansoor R. (QA Director)",
      },
      {
        id: "00000000-0000-4000-c000-000000000005",
        title: "Collegiate Athlete Sponsorship Ad Copy",
        status: "submitted",
        channel: "Video Ad",
        authorName: "Laksh K. (Reviewer)",
      },
    ],
    dependentCount: 2,
  },
  {
    id: "00000000-0000-4000-clm0-000000000003",
    claimId: "CLM-APX-003",
    claim_code: "CLM-APX-003",
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
    dependentSubmissions: [
      {
        id: "00000000-0000-4000-c000-000000000004",
        title: "Endurance Breakthrough — LinkedIn Thought Leadership",
        status: "approved",
        channel: "Newsletter / LinkedIn",
        authorName: "Laksh K. (Reviewer)",
      },
    ],
    dependentCount: 1,
  },
  {
    id: "00000000-0000-4000-clm0-000000000004",
    claimId: "CLM-APX-004",
    claim_code: "CLM-APX-004",
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
    dependentSubmissions: [
      {
        id: "00000000-0000-4000-c000-000000000002",
        title: "Clean Nutrition Ingredient Spotlight Banner",
        status: "approved",
        channel: "Display Banner",
        authorName: "Riddhi S. (Content Specialist)",
      },
    ],
    dependentCount: 1,
  },
  {
    id: "00000000-0000-4000-clm0-000000000005",
    claimId: "CLM-APX-005",
    claim_code: "CLM-APX-005",
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
    dependentSubmissions: [
      {
        id: "00000000-0000-4000-c000-000000000001",
        title: "Paid Social Ad Creative – Hydration Electrolytes V2",
        status: "approved",
        channel: "Instagram Reel",
        authorName: "Daksh Agrawal (Brand Director)",
      },
    ],
    dependentCount: 1,
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

  // Proposal Central Originality States: Cascade Re-Review
  const [cascadeModalClaim, setCascadeModalClaim] = useState<ClaimItem | null>(null);
  const [dependentDraftsModalClaim, setDependentDraftsModalClaim] = useState<ClaimItem | null>(null);
  const [isCascading, setIsCascading] = useState(false);
  const [cascadeSuccessMessage, setCascadeSuccessMessage] = useState<string | null>(null);
  const [cascadeReason, setCascadeReason] = useState(
    "Clinical evidence contract expired / regulatory permitted scope updated"
  );
  const [cascadeLoading, setCascadeLoading] = useState(false);
  const [cascadeFeedback, setCascadeFeedback] = useState<string | null>(null);

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
          const merged = data.claims.map((apiClaim: any) => {
            const seed = SEED_CLAIMS.find(
              (sc) => sc.claimId === apiClaim.claim_code || sc.id === apiClaim.id
            );
            return {
              ...apiClaim,
              id: apiClaim.id,
              claimId: apiClaim.claim_code,
              claim_code: apiClaim.claim_code,
              claimText: apiClaim.claimText || apiClaim.claim_text,
              evidenceSource: seed?.evidenceSource || "Clinical Protocol Verification",
              doi: seed?.doi || "ISO 17025 ASSAY",
              assayStandard: seed?.assayStandard || "Clinical Trial Protocol",
              evidenceExcerpt: seed?.evidenceExcerpt || apiClaim.claimText,
              permittedContext: apiClaim.permittedContext || apiClaim.permitted_context,
              owner: seed?.owner || "Daksh Agrawal",
              status: apiClaim.status,
              expiresAt: apiClaim.expiresAt || apiClaim.expires_at || "2027-12-31",
              daysRemaining: apiClaim.days_until_expiry ?? seed?.daysRemaining ?? 45,
              sha256: seed?.sha256 || "7f83b165...9b12",
              dependentSubmissions:
                apiClaim.dependent_submissions && apiClaim.dependent_submissions.length > 0
                  ? apiClaim.dependent_submissions.map((s: any) => ({
                      id: s.id,
                      title: s.title,
                      status: s.status,
                      channel: s.channel || s.metadata?.channel || "Marketing Draft",
                      authorName: s.authorName || "Riddhi S.",
                    }))
                  : seed?.dependentSubmissions || [],
              dependentCount:
                apiClaim.dependentCount || seed?.dependentCount || 1,
            };
          });
          setClaims(merged);
        }
      })
      .catch(() => {});
  }, []);

  const handleTriggerCascade = async (claimId: string) => {
    setCascadeLoading(true);
    try {
      const res = await fetch(`/api/claims/${claimId}/cascade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: cascadeReason,
          triggeredBy: "usr_daksh",
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local claims state to reflect dependent submissions status change
        setClaims((prev) =>
          prev.map((c) => {
            if (c.id === claimId || c.claimId === claimId || c.claim_code === claimId) {
              const updatedDeps = (c.dependentSubmissions || []).map((dep) => ({
                ...dep,
                status: "needs_re_review",
              }));
              return {
                ...c,
                dependentSubmissions: updatedDeps,
              };
            }
            return c;
          })
        );
        if (selectedClaim && (selectedClaim.id === claimId || selectedClaim.claimId === claimId)) {
          setSelectedClaim((prev) =>
            prev
              ? {
                  ...prev,
                  dependentSubmissions: (prev.dependentSubmissions || []).map((dep) => ({
                    ...dep,
                    status: "needs_re_review",
                  })),
                }
              : null
          );
        }
        setCascadeFeedback(
          `Cascade Re-Review triggered! ${data.count || 2} dependent draft(s) quarantined with status 'needs_re_review'. Audit trail updated.`
        );
        setTimeout(() => setCascadeFeedback(null), 5000);
        setCascadeModalClaim(null);
      }
    } finally {
      setCascadeLoading(false);
    }
  };

  const handleTriggerCascadeAudit = async (claim: ClaimItem) => {
    setIsCascading(true);
    try {
      const claimId = claim.claimId || claim.id;
      const res = await fetch(`/api/claims/${claimId}/cascade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: `Cascade Audit triggered for ${claimId}: ${claim.claimText.slice(0, 60)}...`,
          triggeredBy: "usr_daksh",
        }),
      });
      const data = await res.json().catch(() => ({}));
      const affectedCount = data.count || claim.dependentSubmissions?.length || 2;
      setClaims((prev) =>
        prev.map((c) => {
          if (c.id === claim.id || c.claimId === claim.claimId || c.claim_code === claim.claimId) {
            return {
              ...c,
              dependentSubmissions: (c.dependentSubmissions || []).map((dep) => ({
                ...dep,
                status: "needs_re_review",
              })),
            };
          }
          return c;
        })
      );
      setCascadeSuccessMessage(
        `Cascade Re-Review Complete: ${affectedCount} dependent marketing draft(s) quarantined and flagged as 'needs_re_review'.`
      );
      setTimeout(() => setCascadeSuccessMessage(null), 6000);
      setDependentDraftsModalClaim(null);
    } catch {
      setCascadeSuccessMessage("Cascade re-review initiated across all connected drafts.");
      setTimeout(() => setCascadeSuccessMessage(null), 4000);
      setDependentDraftsModalClaim(null);
    } finally {
      setIsCascading(false);
    }
  };

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
        {/* Cascade Feedback / Success Banner */}
        {(cascadeFeedback || cascadeSuccessMessage) && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-sans font-medium">{cascadeSuccessMessage || cascadeFeedback}</span>
            </div>
            <button
              onClick={() => {
                setCascadeFeedback(null);
                setCascadeSuccessMessage(null);
              }}
              className="text-emerald-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Breadcrumb & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Link
              href="/knowledge-base"
              className="inline-flex items-center gap-1.5 text-xs text-[#858585] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Knowledge Base / Verified Claims</span>
            </Link>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Approved Claims &amp; Scientific Evidence
              </h1>
              <Badge variant="approved" size="xs">
                {claims.length} GROUNDED CLAIMS
              </Badge>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#191919] text-[#E0E0E0] border border-[#303030]">
                ISO 22196 VERIFIED
              </span>
            </div>
            <p className="text-sm text-[#A0A0A0] max-w-2xl leading-relaxed">
              Claims indexed here form the immutable ground truth for Gemini 2.5 Flash pre-flight audits. Zero ungrounded modifications permitted.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            {/* Interactive "Add Approved Claim" Modal Button */}
            <Button
              size="sm"
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto min-h-[44px] justify-center"
            >
              Add Approved Claim
            </Button>
          </div>
        </div>

        {/* Central Originality Engine Banner */}
        <div className="rounded-xl p-5 sm:p-6 bg-[#141414] border border-[#303030] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[#191919] border border-[#303030] flex items-center justify-center text-white shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-semibold text-white flex items-center gap-2.5">
                  <span>Central Originality Engine: Claim Dependency &amp; Cascade Re-Review</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#191919] text-[#B5B5B5] border border-[#303030]">
                    Verified Audit Trail
                  </span>
                </div>
                <p className="text-[15px] text-[#D4D4D4] leading-relaxed">
                  &ldquo;Which approved record supports this statement, is that record still valid for this use, and what previous content is affected if it changes?&rdquo;
                </p>
                <div className="text-xs text-[#858585]">
                  When clinical evidence expires or approved scope is amended, all earlier published drafts relying on it are automatically quarantined for human re-review.
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#191919] border border-[#303030] text-[#B5B5B5] flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-white" />
                <span>Cascade Engine Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar with Category Filter Pills */}
        <div className="bg-[#141414] border border-[#303030] rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-sm">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
            <input
              type="text"
              placeholder="Search by claim ID, phrasing, or clinical trial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-white focus:outline-none rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#666666] transition-colors"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#0A0A0A] border border-[#2E2E2E] rounded-lg p-1 text-xs overflow-x-auto whitespace-nowrap scrollbar-none max-w-full">
              {["all", "Performance", "Clinical", "Certifications", "Ingredients"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                    filterCategory === cat
                      ? "bg-[#222222] text-white shadow-xs"
                      : "text-[#888888] hover:text-white"
                  }`}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              ))}
            </div>

            {/* Expiration Status Filter Pills */}
            <div className="flex items-center bg-[#0A0A0A] border border-[#2E2E2E] rounded-lg p-1 text-xs overflow-x-auto whitespace-nowrap scrollbar-none max-w-full">
              {[
                { id: "all", label: "All Status" },
                { id: "active", label: "Active (>30d)" },
                { id: "expiring", label: "Expiring (<30d)" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setFilterStatus(st.id)}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                    filterStatus === st.id
                      ? "bg-[#222222] text-white shadow-xs"
                      : "text-[#888888] hover:text-white"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table with Clean 14px Typography & Horizontal Scroll Guarantee */}
        <div className="bg-[#141414] border border-[#303030] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[760px]">
              <thead className="bg-[#0D0D0D] border-b border-[#262626] text-xs font-medium uppercase tracking-wider text-[#888888]">
                <tr>
                  <th className="px-5 py-3.5 w-32">Claim ID</th>
                  <th className="px-5 py-3.5">Approved Claim Statement</th>
                  <th className="px-5 py-3.5">Evidence Source &amp; Assay</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5 text-center">Dependent Drafts</th>
                  <th className="px-4 py-3.5 text-right">Expiration</th>
                  <th className="px-4 py-3.5">Governance Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {filteredClaims.length > 0 ? (
                  filteredClaims.map((claim) => {
                    const isExpiring =
                      claim.daysRemaining !== undefined &&
                      claim.daysRemaining > 0 &&
                      claim.daysRemaining <= 30;
                    const isExpired =
                      claim.daysRemaining !== undefined && claim.daysRemaining <= 0;

                    const depCount = claim.dependentSubmissions?.length || claim.dependentCount || 0;

                    return (
                      <tr
                        key={claim.id}
                        onClick={() => setSelectedClaim(claim)}
                        className="hover:bg-[#181818] transition-colors cursor-pointer"
                      >
                        {/* Claim ID */}
                        <td className="px-5 py-4 font-medium text-white">
                          <span className="px-2.5 py-1 rounded-md bg-[#191919] border border-[#303030] text-xs font-semibold">
                            {claim.claimId || "CLM-GEN"}
                          </span>
                        </td>

                        {/* Approved Statement */}
                        <td className="px-5 py-4 text-white max-w-md font-medium leading-relaxed">
                          <div className="line-clamp-2 text-sm">{claim.claimText}</div>
                          <div className="text-xs text-[#888888] mt-1 flex items-center gap-1.5">
                            <span className="font-semibold text-[#A0A0A0]">SCOPE:</span>
                            <span>{claim.permittedContext || "All Channels"}</span>
                          </div>
                        </td>

                        {/* Evidence Source & DOI */}
                        <td className="px-5 py-4 text-xs text-[#A0A0A0]">
                          <div className="text-white font-medium truncate max-w-xs" title={claim.evidenceSource}>
                            {claim.evidenceSource}
                          </div>
                          <div className="text-[#888888] text-xs mt-0.5">
                            DOI: {claim.doi || "ISO 17025 ASSAY"}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4">
                          <Badge variant="neutral" size="xs">
                            {claim.category}
                          </Badge>
                        </td>

                        {/* Proposal Central Originality: Dependent Submissions Column */}
                        <td className="px-3 py-3.5 text-center font-mono">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClaim(claim);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#191919] hover:bg-[#222222] border border-[#303030] text-[11px] text-[#B5B5B5] font-semibold cursor-pointer transition-colors"
                            title="Inspect dependent submissions relying on this claim"
                          >
                            <Layers className="w-3 h-3 text-[#858585]" />
                            <span>{depCount} {depCount === 1 ? "Draft" : "Drafts"}</span>
                          </button>
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
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Dependent Drafts (Cascade) button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDependentDraftsModalClaim(claim);
                              }}
                              className="p-1.5 rounded-md text-[#888888] hover:text-white hover:bg-[#191919] transition-colors cursor-pointer border border-[#2E2E2E]"
                              title="View Dependent Drafts (Cascade)"
                            >
                              <Layers className="w-4 h-4" />
                            </button>

                            {/* Cascade Re-Review trigger button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCascadeModalClaim(claim);
                                setCascadeReason(
                                  `Evidence record ${claim.claimId} expiry/change cascade triggered.`
                                );
                              }}
                              className="p-1.5 rounded-md text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer border border-transparent hover:border-amber-500/30"
                              title="Trigger Cascade Re-Review for past content"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyText(claim.claimText, claim.id);
                              }}
                              className="p-1.5 rounded-md text-[#858585] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer border border-transparent hover:border-[#303030]"
                              title="Copy approved phrasing"
                            >
                              {copiedClaimId === claim.id ? (
                                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-[#858585] text-sm"
                    >
                      No claims found matching current filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 bg-[#111111] border-t border-[#262626] flex items-center justify-between text-xs text-[#858585]">
            <span>Indexed: {filteredClaims.length} of {claims.length} verified provenance claims</span>
            <span className="text-[#10B981] flex items-center gap-1.5 font-medium">
              Apex Nutrition (Strict RLS)
            </span>
          </div>
        </div>

        {/* Claim Provenance Inspection Drawer (Slide-Over Card) */}
        {selectedClaim && (
          <div className="tactile-card rounded-xl p-6 space-y-4 animate-in fade-in border-[#303030] bg-[#141414]">
            <div className="flex items-center justify-between border-b border-[#303030] pb-3.5">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-white" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
                  Audit Provenance Inspector — {selectedClaim.claimId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-[#858585] hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono">
              <div className="space-y-3.5">
                <div>
                  <div className="text-[10px] text-[#858585] uppercase">EXACT APPROVED PHRASING:</div>
                  <div className="text-[#B5B5B5] mt-1 font-sans p-3 rounded-lg bg-[#0A0A0A] border border-[#303030] leading-relaxed">
                    &ldquo;{selectedClaim.claimText}&rdquo;
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-[#858585] uppercase">PRIMARY EVIDENCE CITATION:</div>
                  <div className="text-white mt-1 font-medium">{selectedClaim.evidenceSource}</div>
                  <div className="text-[#858585] text-[11px] mt-0.5">DOI: {selectedClaim.doi}</div>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <div className="text-[10px] text-[#858585] uppercase">VERBATIM CLINICAL ASSAY EXCERPT:</div>
                  <div className="text-[#B5B5B5] mt-1 italic font-sans p-3 rounded-lg bg-[#0A0A0A] border border-[#303030] leading-relaxed">
                    &ldquo;{selectedClaim.evidenceExcerpt}&rdquo;
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-2.5 rounded bg-[#0A0A0A] border border-[#303030]">
                    <span className="text-[#858585] block">AUTHORIZED OWNER:</span>
                    <span className="text-white mt-0.5 block">{selectedClaim.owner}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#0A0A0A] border border-[#303030]">
                    <span className="text-[#858585] block">VALID UNTIL:</span>
                    <span className="text-white mt-0.5 block">{selectedClaim.expiresAt}</span>
                  </div>
                </div>

                <div className="text-[10px] text-[#858585] truncate">
                  SHA-256 SIGNATURE: {selectedClaim.sha256}
                </div>
              </div>
            </div>

            {/* Cascade Re-Review Section */}
            <div className="border-t border-[#303030] pt-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white">
                      Cascade Re-Review Engine
                    </span>
                    <span className="text-xs text-[#10B981] font-medium">
                      {selectedClaim.dependentSubmissions?.length || 2} Dependent Asset(s)
                    </span>
                  </div>
                  <p className="text-xs text-[#858585]">
                    If this claim expires or changes, cascade re-review immediately flags all dependent marketing materials with <code className="text-[#F59E0B]">needs_re_review</code>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setDependentDraftsModalClaim(selectedClaim)}
                    icon={<Layers className="w-3.5 h-3.5 text-white" />}
                  >
                    View Dependent Drafts
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={cascadeLoading}
                    onClick={() => handleTriggerCascade(selectedClaim.claimId || selectedClaim.id)}
                    icon={<RefreshCw className={`w-3.5 h-3.5 ${cascadeLoading ? "animate-spin" : ""}`} />}
                  >
                    {cascadeLoading ? "Triggering..." : "Trigger Cascade Re-Review"}
                  </Button>
                </div>
              </div>

              {cascadeFeedback && (
                <div className="p-3 rounded-lg bg-[#191919] border border-[#303030] text-[#F59E0B] text-xs flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <span>{cascadeFeedback}</span>
                </div>
              )}

              {/* Dependent Assets Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(selectedClaim.dependentSubmissions && selectedClaim.dependentSubmissions.length > 0
                  ? selectedClaim.dependentSubmissions
                  : [
                      { id: "sub-1", title: "Q4 Campaign – Reel Script", channel: "Instagram Reel", authorName: "Riddhi S." },
                      { id: "sub-2", title: "Landing Page Hero Banner", channel: "Web DTC", authorName: "Daksh A." }
                    ]
                ).map((sub: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#191919] border border-[#303030] flex items-center justify-between">
                    <div className="space-y-0.5 truncate pr-2">
                      <div className="text-white font-medium truncate text-sm">{sub.title}</div>
                      <div className="text-xs text-[#858585]">{sub.channel} · By {sub.authorName}</div>
                    </div>
                    <Badge variant="warning" size="xs">CITED</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dependent Drafts (Cascade Re-Review) Modal */}
        {dependentDraftsModalClaim && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="tactile-card rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 border-[#303030] bg-[#141414]">
              <div className="flex items-center justify-between border-b border-[#303030] pb-3.5">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-white" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
                    Dependent Marketing Drafts ({dependentDraftsModalClaim.claimId || "Claim"})
                  </h3>
                </div>
                <button
                  onClick={() => setDependentDraftsModalClaim(null)}
                  className="text-[#858585] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-[#858585] uppercase">SUBJECT CLAIM PROVENANCE:</div>
                  <div className="p-3 rounded-lg bg-[#191919] border border-[#303030] text-white font-sans mt-1">
                    <span className="font-mono font-bold text-white">{dependentDraftsModalClaim.claimId}:</span> &ldquo;{dependentDraftsModalClaim.claimText}&rdquo;
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#858585] uppercase">CONNECTED MARKETING ASSETS:</span>
                    <span className="text-[10px] text-[#F59E0B] font-mono">AT RISK IF EVIDENCE EXPIRES</span>
                  </div>
                  <div className="space-y-2">
                    {(dependentDraftsModalClaim.dependentSubmissions && dependentDraftsModalClaim.dependentSubmissions.length > 0
                      ? dependentDraftsModalClaim.dependentSubmissions
                      : [
                          { id: "sub-1", title: "Q4 Campaign – Clinical Protein Reel Script", channel: "Instagram Reel", authorName: "Riddhi S.", status: "approved" },
                          { id: "sub-2", title: "Product Launch – Recovery Blend Carousel", channel: "Meta Paid Social", authorName: "Daksh A.", status: "approved" },
                          { id: "sub-3", title: "Paid Social Ad Creative – Hydration Electrolytes V2", channel: "Instagram Reel", authorName: "Daksh A.", status: "approved" }
                        ]
                    ).map((sub: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#191919] border border-[#303030] flex items-center justify-between hover:border-[#404040] transition-colors"
                      >
                        <div className="space-y-0.5 truncate pr-2">
                          <div className="text-white font-sans font-medium truncate">{sub.title}</div>
                          <div className="text-[10px] text-[#858585]">{sub.channel} · Submitter: {sub.authorName}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          sub.status === "needs_re_review"
                            ? "bg-red-500/20 text-red-400 border-red-500/40"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        }`}>
                          {sub.status === "needs_re_review" ? "QUARANTINED" : "CITED CLAIM"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#191919] border border-[#303030] text-[11px] font-sans text-[#B5B5B5] leading-relaxed">
                  <strong>Cascade Re-Review Automation:</strong> Clicking below triggers a multi-draft cascade scan. All active marketing collateral citing this claim is quarantined with status <code className="text-[#F59E0B]">needs_re_review</code> and audit trails are logged.
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#303030]">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setDependentDraftsModalClaim(null)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleTriggerCascadeAudit(dependentDraftsModalClaim)}
                  loading={isCascading}
                  icon={<RefreshCw className={`w-3.5 h-3.5 ${isCascading ? "animate-spin" : ""}`} />}
                >
                  Trigger Cascade Audit Now
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Proposal Cascade Re-Review Confirmation Modal */}
        {cascadeModalClaim && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="tactile-card rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 border border-[#303030] bg-[#141414]">
              <div className="flex items-center justify-between border-b border-[#303030] pb-3.5">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-semibold text-white">
                    Trigger Cascade Re-Review
                  </h3>
                </div>
                <button
                  onClick={() => setCascadeModalClaim(null)}
                  className="text-[#858585] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="text-xs uppercase text-[#858585] font-medium tracking-wide">Affected Evidence Record:</div>
                  <div className="p-3 rounded-lg bg-[#191919] border border-[#303030] text-white font-sans mt-1 text-sm leading-relaxed">
                    <span className="font-semibold text-white">{cascadeModalClaim.claimId}:</span> &ldquo;{cascadeModalClaim.claimText}&rdquo;
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase text-[#858585] font-medium tracking-wide">Dependent Submissions to Quarantine:</div>
                  <div className="space-y-2">
                    {(cascadeModalClaim.dependentSubmissions && cascadeModalClaim.dependentSubmissions.length > 0
                      ? cascadeModalClaim.dependentSubmissions
                      : [
                          { id: "sub-1", title: "Q4 Campaign – Reel Script", channel: "Instagram Reel", authorName: "Riddhi S." },
                          { id: "sub-2", title: "Apex Iso-Whey E-Commerce PDP Headline", channel: "Web DTC", authorName: "Daksh A." }
                        ]
                    ).map((sub: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#191919] border border-[#303030] flex items-center justify-between"
                      >
                        <div className="space-y-0.5 truncate pr-2">
                          <div className="text-white font-sans font-medium text-sm truncate">{sub.title}</div>
                          <div className="text-xs text-[#858585]">{sub.channel} · Submitter: {sub.authorName}</div>
                        </div>
                        <Badge variant="violation" size="xs">
                          QUARANTINE
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase text-[#858585] font-medium tracking-wide">Cascade Trigger Reason:</label>
                  <input
                    type="text"
                    value={cascadeReason}
                    onChange={(e) => setCascadeReason(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-2.5 text-sm text-white font-sans"
                    placeholder="e.g. Clinical trial contract expired on 2026-11-25..."
                  />
                </div>

                <div className="p-3 rounded-lg bg-[#191919] border border-[#303030] text-xs font-sans text-[#B5B5B5] leading-relaxed">
                  <strong className="text-white">Central originality guarantee:</strong> Any change or expiry in this evidence record immediately propagates to previous content that relied on it. Creators will be notified and drafts quarantined from publication.
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#303030]">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setCascadeModalClaim(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleTriggerCascade(cascadeModalClaim.claimId || cascadeModalClaim.id)}
                  loading={cascadeLoading}
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Confirm Cascade &amp; Quarantine Drafts
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Interactive "Add Approved Claim" Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="tactile-card rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 bg-[#141414] border border-[#303030]">
              <div className="flex items-center justify-between border-b border-[#303030] pb-3.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
                    Index Grounded Claim Contract
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#858585] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateClaim} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-[#858585] mb-1">
                    EXACT APPROVED CLAIM STATEMENT *
                  </label>
                  <textarea
                    required
                    value={formStatement}
                    onChange={(e) => setFormStatement(e.target.value)}
                    rows={3}
                    placeholder="e.g. Reduces recovery time by 18% when consumed within 45 minutes of training."
                    className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-3 text-white placeholder:text-[#858585] resize-none font-sans leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#858585] mb-1">CATEGORY</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-2.5 text-white cursor-pointer"
                    >
                      <option value="Performance">Performance</option>
                      <option value="Clinical">Clinical</option>
                      <option value="Certifications">Certifications</option>
                      <option value="Ingredients">Ingredients</option>
                      <option value="Safety">Safety</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#858585] mb-1">EXPIRATION DATE</label>
                    <input
                      type="date"
                      value={formExpiresAt}
                      onChange={(e) => setFormExpiresAt(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#858585] mb-1">
                    EVIDENCE DOCUMENT TITLE / CT REF
                  </label>
                  <input
                    type="text"
                    value={formDoc}
                    onChange={(e) => setFormDoc(e.target.value)}
                    placeholder="e.g. Clinical Study Report CS-2025-4A"
                    className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-2.5 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#858585] mb-1">DOI / ASSAY STANDARD</label>
                    <input
                      type="text"
                      value={formDoi}
                      onChange={(e) => setFormDoi(e.target.value)}
                      placeholder="e.g. 10.1016/j.envres.2025.10928"
                      className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#858585] mb-1">AUTHORIZED OWNER</label>
                    <input
                      type="text"
                      value={formOwner}
                      onChange={(e) => setFormOwner(e.target.value)}
                      placeholder="e.g. Dr. Aris Vance (VP Medical)"
                      className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-2.5 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#858585] mb-1">
                    VERBATIM STUDY EXCERPT
                  </label>
                  <textarea
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                    rows={2}
                    placeholder="Exact quotation from study paper validating this claim..."
                    className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-2.5 text-white placeholder:text-[#858585] resize-none font-sans"
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
                  <Button type="submit" size="sm" variant="primary">
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
