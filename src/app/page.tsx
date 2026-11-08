"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  Database,
  FileCheck2,
  Lock,
  GitBranch,
  Layers,
  ChevronRight,
  Scale,
  GitCompare,
  Fingerprint,
  FileSearch,
  ExternalLink,
  RotateCcw,
  Check,
  Copy,
  Info,
  Server,
  FileText,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// Presets for the Interactive Copy Sandbox
interface Preset {
  id: string;
  name: string;
  category: string;
  rawText: string;
  flaggedPhrases: { text: string; type: "prohibited" | "ungrounded" | "disclosure"; replacement: string }[];
  correctedText: string;
  initialScore: number;
  clearedScore: number;
  detectedIssues: {
    type: "prohibited" | "ungrounded" | "disclosure";
    title: string;
    description: string;
    severity: "critical" | "high" | "medium";
    regulation: string;
  }[];
  provenance: {
    claimId: string;
    approvedPhrasing: string;
    evidenceDoc: string;
    doi: string;
    assayStandard: string;
    excerpt: string;
    owner: string;
    expiryDate: string;
    permittedChannels: string;
    sha256: string;
  };
}

const PRESETS: Preset[] = [
  {
    id: "clinical-nutrition",
    name: "Clinical Nutrition Reel Script",
    category: "Health & Supplements",
    rawText:
      "Our proprietary formula gives you 2x faster muscle recovery and builds lean mass in just 14 days without dietary changes.",
    flaggedPhrases: [
      {
        text: "2x faster muscle recovery",
        type: "prohibited",
        replacement: "accelerated muscle protein synthesis",
      },
      {
        text: "in just 14 days without dietary changes",
        type: "ungrounded",
        replacement: "when paired with consistent resistance training over 8 weeks",
      },
    ],
    correctedText:
      "Our ISO-tested formula supports accelerated muscle protein synthesis and supports lean mass development when paired with consistent resistance training over 8 weeks.",
    initialScore: 18,
    clearedScore: 94,
    detectedIssues: [
      {
        type: "prohibited",
        title: "Unverified Multiplier Metric ('2x faster')",
        description:
          "Quantitative multiplier claims require randomized double-blind placebo testing with published statistical significance (p < 0.01).",
        severity: "critical",
        regulation: "FTC Act Section 5 / 16 CFR § 255.2",
      },
      {
        type: "ungrounded",
        title: "Ungrounded Time-Bound & Effortless Claim",
        description:
          "'In just 14 days without dietary changes' constitutes statutory over-promising under FDA DSHEA guidance for dietary supplements.",
        severity: "high",
        regulation: "FDA 21 CFR § 101.93(g)",
      },
      {
        type: "disclosure",
        title: "Missing Statutory Dietary Disclaimer",
        description:
          "Mandatory statement required: 'These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.'",
        severity: "medium",
        regulation: "FDA DSHEA § 403(r)(6)",
      },
    ],
    provenance: {
      claimId: "CLM-APX-001 (Active Grounded)",
      approvedPhrasing:
        "Supports post-workout protein synthesis when consumed within 45 minutes of resistance training.",
      evidenceDoc: "Clinical Study Report APX-2024-C3: Muscle Protein Synthesis Biomarkers",
      doi: "10.1016/j.nutres.2024.108421",
      assayStandard: "ISO 22196:2011 Annex C / Double-Blind Cross-Over RCT",
      excerpt:
        "Mean fractional synthetic rate (FSR) showed a 28.4% elevation (p = 0.004) relative to control over an 8-week intervention protocol.",
      owner: "Dr. Aris Vance, MD (VP Medical & Regulatory Affairs)",
      expiryDate: "2026-12-31",
      permittedChannels: "Digital Video, Organic Social, Product Detail Pages",
      sha256: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1a209b1f074d6b05be5cf6287c",
    },
  },
  {
    id: "enterprise-cloud",
    name: "Enterprise Cloud SLA Landing Page",
    category: "B2B SaaS Infrastructure",
    rawText:
      "Guaranteed 100% zero-downtime SLA with military-grade unhackable encryption verified by ISO-27001.",
    flaggedPhrases: [
      {
        text: "100% zero-downtime SLA",
        type: "prohibited",
        replacement: "contractual 99.99% multi-region uptime SLA",
      },
      {
        text: "military-grade unhackable encryption",
        type: "prohibited",
        replacement: "SOC 2 Type II verified AES-256 encryption at rest and in transit",
      },
    ],
    correctedText:
      "Contractual 99.99% multi-region uptime SLA backed by SOC 2 Type II verified AES-256 encryption at rest and in transit, audited under ISO/IEC 27001:2022.",
    initialScore: 22,
    clearedScore: 98,
    detectedIssues: [
      {
        type: "prohibited",
        title: "Absolute Uptime Guarantee ('100% zero-downtime')",
        description:
          "Legal breach risk. Master Services Agreement (MSA) limits contractual commitment to four-nines (99.99%) with scheduled maintenance carve-outs.",
        severity: "critical",
        regulation: "Corporate Legal MSA Standard § 4.1",
      },
      {
        type: "prohibited",
        title: "Prohibited Hyperbole ('military-grade unhackable')",
        description:
          "Statutory misrepresentation. Cybersecurity claims must specify encryption standards (AES-256 / TLS 1.3) rather than marketing superlatives.",
        severity: "high",
        regulation: "FTC Policy on Deceptive Claims (15 U.S.C. § 45)",
      },
    ],
    provenance: {
      claimId: "CLM-ZNT-881 (Enterprise Validated)",
      approvedPhrasing:
        "High-availability architecture engineered to deliver 99.99% service availability with financial SLA backing.",
      evidenceDoc: "SOC 2 Type II System and Organization Controls Attestation Report (Ernst & Young LLP)",
      doi: "NIST SP 800-53 Rev. 5 / ISO 27001:2022",
      assayStandard: "AICPA Trust Services Criteria (Security, Availability, Confidentiality)",
      excerpt:
        "Tested multi-tenant failover latency across 3 AWS Availability Zones achieved 99.993% cumulative uptime across the 12-month evaluation window.",
      owner: "Elena Rostova (Chief Information Security Officer)",
      expiryDate: "2027-04-30",
      permittedChannels: "Enterprise Sales Collateral, RFP Responses, Website",
      sha256: "3c988ef11b058c42de31fa1947b0a7c413b8e7629dc88701d51a946e8c71ef82",
    },
  },
  {
    id: "skincare-ad",
    name: "Skincare Ad Copy",
    category: "Consumer Cosmetics",
    rawText:
      "Clinically proven to completely erase wrinkles in 48 hours with all-natural organic bio-peptides.",
    flaggedPhrases: [
      {
        text: "completely erase wrinkles",
        type: "prohibited",
        replacement: "visibly diminish the appearance of fine surface lines",
      },
      {
        text: "in 48 hours with all-natural organic bio-peptides",
        type: "ungrounded",
        replacement: "over 4 weeks of consistent twice-daily application",
      },
    ],
    correctedText:
      "Dermatologist-tested to visibly diminish the appearance of fine surface lines over 4 weeks of consistent twice-daily application.",
    initialScore: 14,
    clearedScore: 92,
    detectedIssues: [
      {
        type: "prohibited",
        title: "Permanent Therapeutic Claim ('completely erase wrinkles')",
        description:
          "Cosmetic vs. Drug classification violation. Claiming permanent anatomical alteration shifts product classification to unapproved new drug.",
        severity: "critical",
        regulation: "FD&C Act § 201(g)(1)(C)",
      },
      {
        type: "ungrounded",
        title: "Unsubstantiated Acute Timeframe ('48 hours')",
        description:
          "Clinical assay CS-SKN-2024 evaluated efficacy over 28 days; acute 48-hour claims lack bio-instrumentation substantiation.",
        severity: "high",
        regulation: "NAD Precedent / FTC Substantiation Doctrine",
      },
      {
        type: "disclosure",
        title: "Ungrounded Statutory 'All-Natural' Descriptor",
        description:
          "Synthetic peptide stabilization requires USDA organic / ISO 16128 natural index documentation before public dissemination.",
        severity: "medium",
        regulation: "ISO 16128 Natural & Organic Cosmetics",
      },
    ],
    provenance: {
      claimId: "CLM-LUM-204 (Dermatology Cleared)",
      approvedPhrasing:
        "Clinically observed to reduce depth of periorbital fine lines by up to 23% after 28 days of regular use.",
      evidenceDoc: "Clinical Cutaneous Assay: 60-Subject Double-Blind Profilometry Study",
      doi: "10.1111/jocd.15289",
      assayStandard: "Primos 3D Optical In Vivo Skin Profilometry (ISO 17025)",
      excerpt:
        "Statistically significant reduction in mean surface roughness (Ra) of 23.4% (p < 0.001) observed at day 28 vs baseline.",
      owner: "Dr. Marcus Lin, MD, FAAD (Director of Clinical Dermatology)",
      expiryDate: "2026-09-30",
      permittedChannels: "Paid Social, DTC Webstore, Retail Packaging",
      sha256: "91b45f4ca7d3a0e365022dc7f8c057e93081c7e923838271a257bbdf690a2a4b",
    },
  },
];

export default function LandingPage() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("clinical-nutrition");
  const [currentText, setCurrentText] = useState<string>(PRESETS[0].rawText);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditStep, setAuditStep] = useState<number>(6); // 1-6
  const [isDiffApplied, setIsDiffApplied] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [copiedProvenance, setCopiedProvenance] = useState<boolean>(false);

  const currentPreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];
  const activeScore = isDiffApplied ? currentPreset.clearedScore : currentPreset.initialScore;

  // Change preset
  const handleSelectPreset = (preset: Preset) => {
    setSelectedPresetId(preset.id);
    setCurrentText(preset.rawText);
    setIsDiffApplied(false);
    triggerAudit(preset.rawText, false);
  };

  const triggerAudit = (textToAudit: string, isAppliedState = isDiffApplied) => {
    setIsAuditing(true);
    setAuditStep(1);

    const stepInterval = setInterval(() => {
      setAuditStep((prev) => {
        if (prev >= 6) {
          clearInterval(stepInterval);
          setIsAuditing(false);
          return 6;
        }
        return prev + 1;
      });
    }, 90);
  };

  const handleApplyDiff = () => {
    setCurrentText(currentPreset.correctedText);
    setIsDiffApplied(true);
    triggerAudit(currentPreset.correctedText, true);
  };

  const handleResetSandbox = () => {
    setCurrentText(currentPreset.rawText);
    setIsDiffApplied(false);
    triggerAudit(currentPreset.rawText, false);
  };

  const handleCopyProvenance = async () => {
    try {
      await navigator.clipboard.writeText(
        `Claim: ${currentPreset.provenance.claimId}\nDOI: ${currentPreset.provenance.doi}\nAssay: ${currentPreset.provenance.assayStandard}\nOwner: ${currentPreset.provenance.owner}\nSHA256: ${currentPreset.provenance.sha256}`
      );
      setCopiedProvenance(true);
      setTimeout(() => setCopiedProvenance(false), 2000);
    } catch {
      setCopiedProvenance(true);
      setTimeout(() => setCopiedProvenance(false), 2000);
    }
  };

  // Keyboard shortcut for Cmd+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        triggerAudit(currentText);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentText]);

  return (
    <div className="min-h-screen bg-[#090A10] text-[#F1F5F9] selection:bg-violet-600/30 selection:text-violet-200">
      {/* Precision Chrome Header */}
      <nav className="border-b border-[#1E2333] bg-[#0E1017]/95 backdrop-blur-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            <div className="w-7 h-7 rounded-md bg-violet-600 border border-violet-400/30 flex items-center justify-center linear-bevel-violet">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-slate-100">
                Inkloom
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30">
                GOVERNANCE OS
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
            <a href="#audit-playground" className="hover:text-slate-100 transition-colors">
              Live Audit Playground
            </a>
            <a href="#comparison" className="hover:text-slate-100 transition-colors">
              Platform Architecture
            </a>
            <a href="#compliance-assurance" className="hover:text-slate-100 transition-colors">
              Regulatory Standards
            </a>
            <a href="#provenance" className="hover:text-slate-100 transition-colors">
              Audit Provenance
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors px-2 py-1"
            >
              Sign In
            </Link>
            <Link href="/dashboard">
              <Button
                variant="primary"
                size="sm"
                icon={<ShieldCheck className="w-3.5 h-3.5" />}
              >
                Access Workspace
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 border-b border-[#1E2333] overflow-hidden">
        {/* Subtle grid pattern background - NO blurry purple halos */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #94A3B8 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl space-y-5 text-left">
            {/* Regulatory badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#131622] border border-[#1E2333] text-[11px] font-mono text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>FTC 16 CFR §255 · FDA 21 CFR Part 11 · SOC 2 Type II Compliant</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-semibold tracking-tight text-slate-100 leading-[1.15]">
              The Governance Layer for Brand Truth and Marketing Claims.
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
              Real-time compliance intelligence that audits claims against clinical trials, regulatory
              filings, and verified brand repositories before publication.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a href="#audit-playground">
                <Button
                  variant="primary"
                  size="md"
                  icon={<FileSearch className="w-4 h-4" />}
                  shortcut="↵"
                >
                  Test Interactive Audit Inspector
                </Button>
              </a>
              <Link href="/dashboard">
                <Button
                  variant="secondary"
                  size="md"
                  icon={<Layers className="w-4 h-4" />}
                >
                  View Enterprise Dashboard
                </Button>
              </Link>
            </div>

            {/* Micro execution telemetry bar */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-500 border-t border-[#161925]">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-slate-400" />
                <span>TENANT RLS ISOLATION: ACTIVE</span>
              </span>
              <span>•</span>
              <span>ENGINE: GEMINI-2.5-FLASH</span>
              <span>•</span>
              <span className="text-emerald-400">HALLUCINATION RISK: 0.00%</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: LIVE HERO AUDIT PLAYGROUND */}
      <section id="audit-playground" className="py-12 bg-[#090A10] border-b border-[#1E2333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Interactive Live Audit Inspector
                </h2>
                <Badge variant="metadata" size="xs">CLIENT-SIDE BENCHMARK</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Select a high-liability corporate claim or edit copy below to observe the deterministic 6-stage compliance pre-flight engine.
              </p>
            </div>

            {/* Presets selector buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#0E1017] p-1 rounded-lg border border-[#1E2333]">
              {PRESETS.map((p) => {
                const isSelected = p.id === selectedPresetId;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`px-2.5 py-1 text-xs rounded transition-all cursor-pointer font-medium ${
                      isSelected
                        ? "bg-[#181C2D] text-slate-100 border border-[#2B3248] shadow-xs"
                        : "text-slate-400 hover:text-slate-200 hover:bg-[#131622]"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6-Stage Execution Pipeline Indicator */}
          <div className="bg-[#0E1017] border border-[#1E2333] rounded-lg p-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span>6-STAGE DETERMINISTIC & GROUNDED AUDIT PIPELINE</span>
              </span>
              <span className="tabular-nums text-slate-400">
                STAGE {auditStep}/6 {isAuditing ? "(PROCESSING)" : "(IDLE)"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { step: "01", name: "Deterministic Regex" },
                { step: "02", name: "Prohibited Terms" },
                { step: "03", name: "Claim Segmentation" },
                { step: "04", name: "Multi-Tenant RLS" },
                { step: "05", name: "Evidence Grounding" },
                { step: "06", name: "Surgical Diff Gen" },
              ].map((stage, idx) => {
                const isDone = auditStep > idx;
                const isCurrent = auditStep === idx + 1;
                return (
                  <div
                    key={stage.step}
                    className={`px-2.5 py-1.5 rounded text-[11px] font-mono border transition-all ${
                      isCurrent && isAuditing
                        ? "bg-violet-600/20 text-violet-300 border-violet-500/50"
                        : isDone
                        ? "bg-[#131622] text-slate-300 border-[#1E2333]"
                        : "bg-[#090A10] text-slate-600 border-[#161925]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">{stage.step}</span>
                      {isDone && <Check className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <div className="truncate font-medium">{stage.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Playground Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Pane: Interactive Copy Sandbox */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-[#131622] border border-[#1E2333] rounded-lg overflow-hidden shadow-xs">
                {/* Header */}
                <div className="px-4 py-2.5 border-b border-[#1E2333] bg-[#0E1017] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Copy Sandbox ({currentPreset.category})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isDiffApplied && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                        REVISED COPY APPLIED
                      </span>
                    )}
                    <button
                      onClick={handleResetSandbox}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Reset to default raw copy"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Text Area / Highlighted visual */}
                <div className="p-4 space-y-3">
                  <label className="block text-[11px] font-mono text-slate-400">
                    EDITABLE SUBMISSION CONTENT:
                  </label>
                  <textarea
                    value={currentText}
                    onChange={(e) => {
                      setCurrentText(e.target.value);
                      setIsDiffApplied(false);
                    }}
                    rows={4}
                    className="w-full bg-[#090A10] border border-[#1E2333] focus:border-violet-500 focus:outline-none rounded-md p-3 text-xs text-slate-200 font-mono leading-relaxed resize-none transition-colors"
                    placeholder="Enter marketing claims to audit..."
                  />

                  {/* Token highlight overlay preview */}
                  {!isDiffApplied && (
                    <div className="p-3 bg-[#0E1017] border border-[#1E2333] rounded-md text-xs leading-relaxed text-slate-300">
                      <div className="text-[10px] font-mono text-slate-500 mb-1.5">
                        LEXICAL TOKEN VIOLATION MAPPING:
                      </div>
                      <p>
                        Our proprietary formula gives you{" "}
                        <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.5 rounded font-mono font-medium">
                          {currentPreset.flaggedPhrases[0]?.text || "unverified multiplier"}
                        </span>{" "}
                        and builds lean mass{" "}
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.5 rounded font-mono font-medium">
                          {currentPreset.flaggedPhrases[1]?.text || "in just 14 days"}
                        </span>
                        .
                      </p>
                    </div>
                  )}

                  {/* Sandbox Action Bar */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <div className="font-mono text-[11px] text-slate-500">
                      <span>LENGTH: {currentText.length} CHARS</span>
                      <span className="mx-2">•</span>
                      <span>TOKENS: {Math.ceil(currentText.length / 4)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => triggerAudit(currentText)}
                        loading={isAuditing}
                        shortcut="⌘↵"
                      >
                        Run Governance Audit
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Audit Telemetry Footer */}
                <div className="px-4 py-2 bg-[#090A10] border-t border-[#1E2333] flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">LATENCY: 312ms</span>
                    <span>•</span>
                    <span>HASH: sha256:{currentPreset.provenance.sha256.substring(0, 10)}...</span>
                  </div>
                  <span className="text-emerald-400">STATUS: AUDITED</span>
                </div>
              </div>

              {/* Inline Surgical Diff Viewer */}
              <div className="bg-[#131622] border border-[#1E2333] rounded-lg overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 border-b border-[#1E2333] bg-[#0E1017] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Word-Level Surgical Red-Line Diff
                    </span>
                  </div>
                  <Badge variant={isDiffApplied ? "verified" : "warning"} size="xs">
                    {isDiffApplied ? "Verified Replacement Active" : "Pending Human Sign-off"}
                  </Badge>
                </div>

                <div className="p-4 space-y-3 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                    PROPOSED SURGICAL REPLACEMENT (DETERMINISTIC + GROUNDED):
                  </div>

                  {/* Deletions line */}
                  <div className="flex items-start gap-2 p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300">
                    <span className="font-bold select-none text-rose-400 shrink-0">-</span>
                    <span className="line-through decoration-rose-500/60 leading-relaxed">
                      {currentPreset.rawText}
                    </span>
                  </div>

                  {/* Additions line */}
                  <div className="flex items-start gap-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    <span className="font-bold select-none text-emerald-400 shrink-0">+</span>
                    <span className="font-medium leading-relaxed">
                      {currentPreset.correctedText}
                    </span>
                  </div>

                  {/* Diff Action Bar */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-sans">
                      Eliminates absolute statutory liabilities while preserving core marketing appeal.
                    </span>

                    {!isDiffApplied ? (
                      <Button
                        variant="approve"
                        size="xs"
                        onClick={handleApplyDiff}
                        icon={<Check className="w-3 h-3" />}
                        shortcut="⌘A"
                      >
                        Apply Surgical Diff
                      </Button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Applied to Sandbox
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Pane: Live Audit Findings, Multi-Factor Scoring, Citation Drawer */}
            <div className="lg:col-span-6 space-y-4">
              {/* Overall Score & Multi-Factor Decomposition */}
              <div className="bg-[#131622] border border-[#1E2333] rounded-lg p-4 space-y-4 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Compliance Verification Score
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Multi-factor empirical evaluation against registered brand truth library.
                    </p>
                  </div>

                  {/* Score pill */}
                  <div className="text-right">
                    <div
                      className={`font-mono text-2xl font-bold tabular-nums ${
                        activeScore >= 80
                          ? "text-emerald-400"
                          : activeScore >= 50
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {activeScore}
                      <span className="text-xs text-slate-500 font-normal">/100</span>
                    </div>
                    <Badge
                      variant={activeScore >= 80 ? "verified" : "violation"}
                      size="xs"
                    >
                      {activeScore >= 80 ? "CLEARED FOR PUBLICATION" : "REJECTED (STRICT HAZARD)"}
                    </Badge>
                  </div>
                </div>

                {/* Score Multi-Factor Progress Decomposition */}
                <div className="space-y-3 pt-2 border-t border-[#1E2333]">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">1. Lexical Grounding Index</span>
                      <span className="font-mono text-slate-200 tabular-nums">
                        {isDiffApplied ? "96%" : "24%"}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#090A10] rounded-full overflow-hidden border border-[#1E2333]">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isDiffApplied ? "bg-emerald-400 w-[96%]" : "bg-rose-500 w-[24%]"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">2. Statutory Regulatory Match</span>
                      <span className="font-mono text-slate-200 tabular-nums">
                        {isDiffApplied ? "100%" : "12%"}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#090A10] rounded-full overflow-hidden border border-[#1E2333]">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isDiffApplied ? "bg-emerald-400 w-[100%]" : "bg-rose-500 w-[12%]"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">3. Brand Voice & Tone Cosine Distance</span>
                      <span className="font-mono text-slate-200 tabular-nums">
                        {isDiffApplied ? "91%" : "38%"}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#090A10] rounded-full overflow-hidden border border-[#1E2333]">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isDiffApplied ? "bg-emerald-400 w-[91%]" : "bg-amber-500 w-[38%]"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Detected Issues List */}
              <div className="bg-[#131622] border border-[#1E2333] rounded-lg overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 border-b border-[#1E2333] bg-[#0E1017] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Detected Findings ({isDiffApplied ? 0 : currentPreset.detectedIssues.length})
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {isDiffApplied ? "0 VIOLATIONS" : "STATUTORY AUDIT ACTIVE"}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  {!isDiffApplied ? (
                    currentPreset.detectedIssues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-md border text-xs space-y-1.5 transition-all ${
                          issue.severity === "critical"
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                            : issue.severity === "high"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                            : "bg-[#181C2D] border-[#2B3248] text-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-semibold">
                            {issue.severity === "critical" ? (
                              <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                            <span>{issue.title}</span>
                          </div>
                          <Badge
                            variant={issue.severity === "critical" ? "violation" : "warning"}
                            size="xs"
                          >
                            {issue.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                          {issue.description}
                        </p>
                        <div className="text-[10px] font-mono text-slate-400 pt-1 flex items-center gap-1.5">
                          <Scale className="w-3 h-3 text-slate-500" />
                          <span>REGULATORY CODE: {issue.regulation}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-semibold">All Statutory Violations Resolved</div>
                        <p className="text-[11px] text-emerald-300/80 mt-0.5">
                          The draft copy conforms with verified clinical citations and brand guidelines. Ready for sign-off.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Evidence Provenance Citation Box (Drawer Trigger) */}
              <div className="bg-[#131622] border border-[#1E2333] rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Grounded Evidence Provenance
                    </span>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{isDrawerOpen ? "Hide Inspector" : "Inspect Full Chain"}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isDrawerOpen ? "rotate-90" : ""}`} />
                  </button>
                </div>

                <div className="p-3 bg-[#090A10] border border-[#1E2333] rounded-md font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">CLAIM IDENTIFIER:</span>
                    <span className="text-cyan-300">{currentPreset.provenance.claimId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">PRIMARY EVIDENCE:</span>
                    <span className="text-slate-200 truncate max-w-[220px]" title={currentPreset.provenance.evidenceDoc}>
                      {currentPreset.provenance.evidenceDoc}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">DOI / ASSAY:</span>
                    <span className="text-slate-300">{currentPreset.provenance.doi}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">EXPIRATION:</span>
                    <span className="text-emerald-400">{currentPreset.provenance.expiryDate}</span>
                  </div>
                </div>

                {/* Collapsible Provenance Inspector Drawer */}
                {isDrawerOpen && (
                  <div className="pt-3 border-t border-[#1E2333] space-y-3 text-xs animate-in fade-in">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      VERBATIM CLINICAL ASSAY EXCERPT:
                    </div>
                    <div className="p-3 bg-[#090A10] border border-[#1E2333] rounded text-slate-300 italic leading-relaxed text-[11px] font-sans">
                      &ldquo;{currentPreset.provenance.excerpt}&rdquo;
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                      <div>
                        <span className="text-slate-500">OWNER: </span>
                        <span className="text-slate-200">{currentPreset.provenance.owner}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">CHANNELS: </span>
                        <span className="text-slate-200">{currentPreset.provenance.permittedChannels}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[280px]">
                        SHA-256: {currentPreset.provenance.sha256}
                      </span>
                      <button
                        onClick={handleCopyProvenance}
                        className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 font-mono transition-colors cursor-pointer"
                      >
                        {copiedProvenance ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Citation</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: WHY INKLOOM IS NOT ANOTHER AI WRITING ASSISTANT (Enterprise Matrix) */}
      <section id="comparison" className="py-20 bg-[#0E1017] border-b border-[#1E2333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[11px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/25">
              <span>ENTERPRISE ARCHITECTURE COMPARISON</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-100">
              Why Inkloom is Not Another AI Writing Assistant
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Standard consumer LLMs write creative fiction. Inkloom is a deterministic brand governance and claims intelligence compiler that prevents regulatory enforcement actions.
            </p>
          </div>

          {/* Precision Comparison Table */}
          <div className="border border-[#1E2333] rounded-lg overflow-hidden bg-[#131622] shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090A10] border-b border-[#1E2333] text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                  <tr>
                    <th className="px-5 py-3.5 w-1/4">Evaluation Dimension</th>
                    <th className="px-5 py-3.5 w-3/8 text-slate-400">
                      Generic LLM / Grammar Checker
                    </th>
                    <th className="px-5 py-3.5 w-3/8 text-emerald-400 bg-emerald-500/5 border-l border-emerald-500/20">
                      Inkloom Governed Truth Engine
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2333]">
                  {[
                    {
                      dimension: "Grounding Architecture",
                      generic: "Probabilistic next-token prediction across unverified public internet crawl.",
                      inkloom:
                        "Strict RLS-isolated corporate truth repository with verified clinical trials and legal filings.",
                    },
                    {
                      dimension: "Hallucination Risk",
                      generic: "Uncontrolled fabrication of scientific statistics, percentages, and endorsements.",
                      inkloom:
                        "0.00% tolerance. Missing evidence immediately triggers an explicit statutory violation flag.",
                    },
                    {
                      dimension: "Citation & Audit Trail",
                      generic: "Zero legal provenance. Cannot cite DOI paper numbers or regulatory assays.",
                      inkloom:
                        "Full cryptographic audit trail linking every approved phrase to assay standard & authorizer.",
                    },
                    {
                      dimension: "Revision Mechanics",
                      generic: "Wholesale generative rewrites that overwrite nuanced brand voice and style.",
                      inkloom:
                        "Surgical word-level redline diffs that substitute only non-compliant tokens.",
                    },
                    {
                      dimension: "Regulatory Guardrails",
                      generic: "Generic toxicity filters; completely blind to FTC, FDA, and NAD statutory standards.",
                      inkloom:
                        "Pre-flight regex blacklists + deep regulatory compliance models (FTC §255, FDA 21 CFR).",
                    },
                    {
                      dimension: "Approval Workflow",
                      generic: "Direct auto-publish with zero role-based gating or reviewer sign-offs.",
                      inkloom:
                        "Two-key human approval gate with immutable audit history and reviewer sign-off stamps.",
                    },
                    {
                      dimension: "Data Privacy & Tenant Isolation",
                      generic: "Prompts shared across multi-tenant pools and ingested for foundational model retraining.",
                      inkloom:
                        "PostgreSQL Row Level Security (RLS) + zero retention training policy. Complete brand isolation.",
                    },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#181C2D]/60 transition-colors">
                      <td className="px-5 py-4 font-mono font-medium text-slate-200">
                        {row.dimension}
                      </td>
                      <td className="px-5 py-4 text-slate-400 leading-relaxed">
                        <span className="text-rose-400 font-mono mr-1.5 select-none">[✕]</span>
                        {row.generic}
                      </td>
                      <td className="px-5 py-4 text-slate-200 leading-relaxed bg-emerald-500/5 border-l border-emerald-500/20 font-medium">
                        <span className="text-emerald-400 font-mono mr-1.5 select-none">[✓]</span>
                        {row.inkloom}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: REGULATORY COMPLIANCE & GOVERNANCE ASSURANCE BADGES */}
      <section id="compliance-assurance" className="py-20 bg-[#090A10] border-b border-[#1E2333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs uppercase font-mono font-semibold tracking-wider text-slate-400">
              INSTITUTIONAL ASSURANCE
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-100">
              Built for Heavily Regulated Enterprise Sectors
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Designed from first principles to meet the evidentiary standards of corporate general counsel, clinical research organizations, and public listing bodies.
            </p>
          </div>

          {/* 4 Regulatory Pillar Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "FTC Endorsement Guides",
                code: "16 CFR Part 255",
                desc: "Automated enforcement of material connection disclosures, clear and conspicuous placement, and objective claim substantiation.",
                icon: Scale,
              },
              {
                title: "FDA Regulatory Gating",
                code: "21 CFR Part 11 & DSHEA",
                desc: "Prevents impermissible disease claims on dietary supplements while enforcing statutory structure/function disclaimers.",
                icon: ShieldCheck,
              },
              {
                title: "SOC 2 Type II Certified",
                code: "AICPA Trust Principles",
                desc: "Enterprise data architecture with end-to-end audit logging, cryptographic immutability, and zero public AI model training.",
                icon: Lock,
              },
              {
                title: "PostgreSQL Tenant RLS",
                code: "Row Level Security",
                desc: "Hardware-level tenant isolation ensures guidelines and clinical claims of Brand A can never contaminate Brand B's audit scope.",
                icon: Server,
              },
            ].map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-5 rounded-lg bg-[#131622] border border-[#1E2333] hover:border-[#2B3248] transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded bg-[#181C2D] border border-[#2B3248] flex items-center justify-center text-slate-200">
                      <Icon className="w-4 h-4" />
                    </div>
                    <Badge variant="metadata" size="xs">
                      {pillar.code}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100">{pillar.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION: 4-STAGE ARCHITECTURAL PIPELINE */}
      <section id="provenance" className="py-20 bg-[#0E1017] border-b border-[#1E2333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-violet-400">
              AUDIT PROVENANCE ENGINE
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-100">
              How Inkloom Audits Marketing Content
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              An immutable brand truth pipeline that evaluates draft copy against certified evidence before public distribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Evidence Ingestion",
                desc: "Upload certified clinical study reports, assay standard certificates, and registered legal opinions with strict expiration scopes.",
                icon: Database,
              },
              {
                step: "02",
                title: "Claim Segmentation",
                desc: "Deconstructs submitted marketing copy into discrete factual claims, quantitative metrics, and promotional terminology.",
                icon: Layers,
              },
              {
                step: "03",
                title: "Grounded Retrieval & Audit",
                desc: "Deterministic regex halts statutory redlines; Gemini 2.5 Flash validates claim evidence with zero hallucination tolerance.",
                icon: GitCompare,
              },
              {
                step: "04",
                title: "Two-Key Approval Gate",
                desc: "High-liability drafts require formal reviewer sign-off. Every decision is cryptographically logged in an immutable audit ledger.",
                icon: FileCheck2,
              },
            ].map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.step}
                  className="p-5 rounded-lg bg-[#131622] border border-[#1E2333] hover:border-[#2B3248] transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-violet-400">
                      PHASE {stage.step}
                    </span>
                    <div className="w-7 h-7 rounded bg-[#181C2D] border border-[#2B3248] flex items-center justify-center text-slate-300">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100">{stage.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{stage.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="py-16 bg-[#090A10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-xl bg-[#131622] border border-[#1E2333] p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/25">
                <span>ENTERPRISE GOVERNANCE WORKSPACE</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-100">
                Protect Your Brand Truth at Enterprise Scale.
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Empower your content creators while giving your legal, medical, and regulatory directors complete audit oversight.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href="/dashboard">
                <Button
                  variant="primary"
                  size="md"
                  icon={<ShieldCheck className="w-4 h-4" />}
                >
                  Launch Live Workspace
                </Button>
              </Link>
              <Link href="/knowledge-base/claims">
                <Button
                  variant="secondary"
                  size="md"
                  icon={<Database className="w-4 h-4" />}
                >
                  Inspect Claims Library
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Precision Chrome Footer */}
      <footer className="border-t border-[#1E2333] py-8 bg-[#090A10] text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 select-none">
            <div className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-3 h-3" />
            </div>
            <span className="font-semibold text-slate-300">Inkloom AI</span>
            <span>&copy; 2026 Inkloom Technologies Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-5 text-slate-400">
            <Link href="/dashboard" className="hover:text-slate-200 transition-colors">
              Dashboard
            </Link>
            <Link href="/submissions" className="hover:text-slate-200 transition-colors">
              Submissions
            </Link>
            <Link href="/approvals" className="hover:text-slate-200 transition-colors">
              Approvals Queue
            </Link>
            <Link href="/knowledge-base/claims" className="hover:text-slate-200 transition-colors">
              Claims Library
            </Link>
            <Link href="/analytics" className="hover:text-slate-200 transition-colors">
              Analytics
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
