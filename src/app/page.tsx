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
  Sparkles,
  Sliders,
  Cpu,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";

// Interactive Presets for the Milled Terminal Sandbox
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
    category: "Health & Nutrition",
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
    category: "B2B Cloud Infrastructure",
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

  const scrollToWorkbench = () => {
    document.getElementById("audit-workbench")?.scrollIntoView({ behavior: "smooth" });
  };

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
    }, 85);
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

  // SVG Gauge calculations
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (activeScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#080C16] text-[#F8FAFC] selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Precision Chrome Swiss Header */}
      <nav className="border-b border-[#1E2B4A] bg-[#0D1527]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            <div className="w-7 h-7 rounded-md bg-[#111C35] border border-[#2E416E] flex items-center justify-center shadow-inner group-hover:border-[#00F2FE] transition-colors">
              <ShieldCheck className="w-4 h-4 text-[#00F2FE]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white font-sans">
                Inkloom
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#E5A93C]/15 text-[#FBBF24] border border-[#E5A93C]/30">
                GOVERNANCE OS
              </span>
            </div>
          </Link>

          {/* Navigation Links with Smooth Scrolling */}
          <div className="hidden md:flex items-center gap-6 text-xs font-mono font-medium text-slate-400">
            <button
              onClick={scrollToWorkbench}
              className="hover:text-[#00F2FE] transition-colors cursor-pointer"
            >
              Live Audit Workbench
            </button>
            <a href="#comparison-matrix" className="hover:text-[#00F2FE] transition-colors">
              Platform Architecture
            </a>
            <a href="#regulatory-assurance" className="hover:text-[#00F2FE] transition-colors">
              Regulatory Standards
            </a>
            <a href="#provenance-pipeline" className="hover:text-[#00F2FE] transition-colors">
              Evidence Provenance
            </a>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/auth/login"
              className="text-xs font-mono text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded hover:bg-[#111C35]"
            >
              Log In
            </Link>
            <Link
              href="/prototype-notice?feature=pilot"
              className="hidden sm:inline-flex text-xs font-mono font-semibold text-[#FBBF24] px-3 py-1.5 rounded border border-[#E5A93C]/40 hover:bg-[#E5A93C]/10 transition-colors"
            >
              Book Pilot
            </Link>
            <Link
              href="/dashboard"
              className="turquoise-button text-xs font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-md"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION — Swiss Typography Grid */}
      <section className="relative pt-16 pb-20 border-b border-[#1E2B4A] overflow-hidden bg-[#080C16]">
        {/* Subtle Architectural Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #00F2FE 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl space-y-6 text-left">
            {/* Regulatory Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0D1527] border border-[#1E2B4A] text-[11px] font-mono text-slate-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00F2FE] shadow-[0_0_8px_#00F2FE]" />
              <span className="text-slate-400">AUDIT SPECIFICATION:</span>
              <span className="text-[#FBBF24] font-semibold">FTC 16 CFR § 255</span>
              <span>·</span>
              <span className="text-[#00F2FE] font-semibold">FDA 21 CFR Part 11</span>
              <span>·</span>
              <span className="text-emerald-400 font-semibold">SOC 2 TYPE II</span>
            </div>

            {/* Confident Grotesque Headline */}
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08] font-sans">
              The Sovereign Governance Layer for Brand Truth and Marketing Claims.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl font-sans font-normal">
              Real-time compliance intelligence that audits claims against clinical trials,
              regulatory filings, and verified brand repositories before publication.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={scrollToWorkbench}
                className="turquoise-button px-5 py-2.5 rounded-md text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <FileSearch className="w-4 h-4 text-[#080C16]" />
                <span>See Live Demo</span>
              </button>

              <Link
                href="/dashboard"
                className="gold-button px-5 py-2.5 rounded-md text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <ShieldCheck className="w-4 h-4 text-[#080C16]" />
                <span>Get Started</span>
              </Link>

              <Link
                href="/prototype-notice?feature=pilot"
                className="px-4 py-2.5 rounded-md text-xs font-mono font-medium text-slate-300 hover:text-white bg-[#0D1527] hover:bg-[#111C35] border border-[#1E2B4A] hover:border-slate-500 transition-colors flex items-center gap-1.5"
              >
                <span>Book Enterprise Pilot</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>

            {/* Hardware Telemetry Bar */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400 border-t border-[#1E2B4A]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Server className="w-3.5 h-3.5 text-[#00F2FE]" />
                <span>TENANT RLS ISOLATION: DETERMINISTIC</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">GROUNDING ENGINE: GEMINI-2.5-FLASH</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                HALLUCINATION RISK: 0.00%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: HERO INTERACTIVE MILLED TERMINAL / LIVE AUDIT WORKBENCH */}
      <section id="audit-workbench" className="py-16 bg-[#080C16] border-b border-[#1E2B4A] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Section Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00F2FE] shadow-[0_0_10px_#00F2FE]" />
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                  Milled Hardware Terminal · Live Audit Workbench
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30 font-semibold">
                  LIVE COMPLIANCE SIMULATOR
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Select a high-liability corporate claim preset or input custom copy to observe real-time
                statutory diff compilation and DOI provenance matching.
              </p>
            </div>

            {/* Presets Switcher with Hardware Styling */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#0D1527] p-1.5 rounded-lg border border-[#1E2B4A] shadow-inner">
              {PRESETS.map((p) => {
                const isSelected = p.id === selectedPresetId;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#111C35] text-white border border-[#2E416E] shadow-sm text-shadow-sm font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-[#111C35]/50"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6-Stage Deterministic Pipeline Progress Bar */}
          <div className="bg-[#0D1527] border border-[#1E2B4A] rounded-xl p-3.5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2.5">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-pulse" />
                <span className="font-semibold text-slate-200">
                  DETERMINISTIC 6-STAGE COMPLIANCE PIPELINE
                </span>
              </span>
              <span className="tabular-nums text-slate-400">
                STAGE {auditStep}/6 {isAuditing ? "(EVALUATING TOKENS...)" : "(STEADY STATE)"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { step: "01", name: "Deterministic Regex" },
                { step: "02", name: "Prohibited Terms" },
                { step: "03", name: "Claim Decomposition" },
                { step: "04", name: "Tenant RLS Isolation" },
                { step: "05", name: "Evidence Grounding" },
                { step: "06", name: "Surgical Diff Gen" },
              ].map((stage, idx) => {
                const isDone = auditStep > idx;
                const isCurrent = auditStep === idx + 1;
                return (
                  <div
                    key={stage.step}
                    className={`px-2.5 py-1.5 rounded-md text-[11px] font-mono border transition-all ${
                      isCurrent && isAuditing
                        ? "bg-[#00F2FE]/20 text-[#00F2FE] border-[#00F2FE]/60 shadow-[0_0_8px_rgba(0,242,254,0.3)]"
                        : isDone
                        ? "bg-[#111C35] text-slate-200 border-[#2E416E]"
                        : "bg-[#080C16] text-slate-600 border-[#1E2B4A]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] text-slate-500 font-bold">{stage.step}</span>
                      {isDone && <Check className="w-3 h-3 text-[#00F2FE]" />}
                    </div>
                    <div className="truncate font-medium">{stage.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workbench 2-Column Hardware Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Recessed Copy Sandbox & Token Diff (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Recessed Hardware Copy Sandbox */}
              <div className="rounded-xl bg-[#0D1527] border border-[#1E2B4A] shadow-2xl relative overflow-hidden">
                {/* Hardware Bezel screwheads */}
                <div className="absolute top-2.5 left-2.5 screwhead" />
                <div className="absolute top-2.5 right-2.5 screwhead" />

                {/* Header */}
                <div className="px-5 py-3 border-b border-[#1E2B4A] bg-[#0A0F1D] flex items-center justify-between">
                  <div className="flex items-center gap-2 pl-3">
                    <FileText className="w-3.5 h-3.5 text-[#00F2FE]" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                      Copy Sandbox · {currentPreset.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isDiffApplied && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        REVISED COPY SYNCED
                      </span>
                    )}
                    <button
                      onClick={handleResetSandbox}
                      className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                      title="Reset sandbox to original copy"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Recessed Debossed Text Area */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>EDITABLE SUBMISSION CONTENT:</span>
                    <span className="text-slate-500">REAL-TIME LEXICAL PARSING</span>
                  </div>

                  <textarea
                    value={currentText}
                    onChange={(e) => {
                      setCurrentText(e.target.value);
                      setIsDiffApplied(false);
                    }}
                    rows={4}
                    className="w-full input-debossed rounded-md p-3.5 text-xs font-mono leading-relaxed resize-none transition-all"
                    placeholder="Enter marketing or regulatory copy..."
                  />

                  {/* Token Highlight Diagnostic Box */}
                  {!isDiffApplied && (
                    <div className="p-3.5 bg-[#080C16] border border-[#1E2B4A] rounded-lg text-xs leading-relaxed text-slate-300 space-y-1.5">
                      <div className="text-[10px] font-mono text-slate-400 font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C]" />
                        <span>LEXICAL TOKEN VIOLATION MAPPING:</span>
                      </div>
                      <p className="font-mono text-[11px]">
                        Our proprietary formula gives you{" "}
                        <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1 py-0.5 rounded font-bold line-through">
                          {currentPreset.flaggedPhrases[0]?.text || "2x faster muscle recovery"}
                        </span>{" "}
                        and builds lean mass{" "}
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.5 rounded font-bold">
                          {currentPreset.flaggedPhrases[1]?.text || "in just 14 days"}
                        </span>
                        .
                      </p>
                    </div>
                  )}

                  {/* Sandbox Execution Bar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="font-mono text-[11px] text-slate-400 flex items-center gap-3">
                      <span>LENGTH: {currentText.length} CHARS</span>
                      <span>•</span>
                      <span>TOKENS: {Math.ceil(currentText.length / 4)}</span>
                      <span>•</span>
                      <span>LATENCY: 312ms</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => triggerAudit(currentText)}
                        disabled={isAuditing}
                        className="turquoise-button px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        {isAuditing ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-[#080C16] border-t-transparent rounded-full animate-spin" />
                            <span>Auditing...</span>
                          </>
                        ) : (
                          <>
                            <span>Run 6-Stage Pre-Flight Audit</span>
                            <kbd className="text-[9px] px-1 py-0.5 rounded bg-black/40 border border-white/20 font-mono text-white">
                              ⌘↵
                            </kbd>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Audit Telemetry Footer */}
                <div className="px-5 py-2.5 bg-[#080C16] border-t border-[#1E2B4A] flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">HASH: sha256:{currentPreset.provenance.sha256.substring(0, 12)}...</span>
                  </div>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    STATUS: DETERMINISTIC ENGINE AUDITED
                  </span>
                </div>
              </div>

              {/* Word-Level Surgical Red-Line Diff */}
              <div className="rounded-xl bg-[#0D1527] border border-[#1E2B4A] shadow-xl overflow-hidden relative">
                <div className="px-5 py-3 border-b border-[#1E2B4A] bg-[#0A0F1D] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-3.5 h-3.5 text-[#00F2FE]" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                      Word-Level Surgical Red-Line Diff
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                      isDiffApplied
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/15 text-[#FBBF24] border-amber-500/30"
                    }`}
                  >
                    {isDiffApplied ? "Grounded Diff Applied" : "Pending Human Sign-Off"}
                  </span>
                </div>

                <div className="p-5 space-y-3 font-mono text-xs">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    PROPOSED SURGICAL REPLACEMENT (DETERMINISTIC & EVIDENCE-LINKED):
                  </div>

                  {/* Deletion Line */}
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300">
                    <span className="font-bold select-none text-rose-400 shrink-0 text-sm">-</span>
                    <span className="line-through decoration-rose-500/60 leading-relaxed">
                      {currentPreset.rawText}
                    </span>
                  </div>

                  {/* Addition Line */}
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                    <span className="font-bold select-none text-emerald-400 shrink-0 text-sm">+</span>
                    <span className="font-medium leading-relaxed">
                      {currentPreset.correctedText}
                    </span>
                  </div>

                  {/* Diff Action Bar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 font-sans">
                      Preserves core brand appeal while substituting statutory liabilities.
                    </span>

                    {!isDiffApplied ? (
                      <button
                        onClick={handleApplyDiff}
                        className="gold-button px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply Surgical Diff (Boost to {currentPreset.clearedScore}/100)</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Diff Applied & Cleared for Publication</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Physical Score Dial, Status LEDs, Issues & Evidence Drawer (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Skeuomorphic Compliance Score Dial & Progress Decomposition */}
              <div className="rounded-xl bg-[#0D1527] border border-[#1E2B4A] p-5 shadow-2xl relative space-y-5">
                {/* Top highlight */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00F2FE]/30 to-transparent" />

                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                      Compliance Score Meter
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Empirical multi-factor evaluation vs certified claims repository.
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                      activeScore >= 80
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                    }`}
                  >
                    {activeScore >= 80 ? "CLEARED" : "HAZARD FLAGGED"}
                  </span>
                </div>

                {/* Circular Hardware Gauge Meter */}
                <div className="flex items-center justify-center py-2">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Background track */}
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-[#111C35]"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      {/* Progress meter */}
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke={activeScore >= 80 ? "#00F2FE" : "#F43F5E"}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                        style={{
                          filter: activeScore >= 80 ? "drop-shadow(0 0 6px rgba(0, 242, 254, 0.6))" : "drop-shadow(0 0 6px rgba(244, 63, 94, 0.6))",
                        }}
                      />
                    </svg>

                    {/* Numeric Center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <div
                        className={`font-mono text-3xl font-extrabold tabular-nums tracking-tight ${
                          activeScore >= 80 ? "text-[#00F2FE]" : "text-rose-400"
                        }`}
                      >
                        {activeScore}
                        <span className="text-xs text-slate-500 font-normal">/100</span>
                      </div>
                      <span className="text-[9px] font-mono font-semibold uppercase text-slate-400 tracking-wider">
                        {activeScore >= 80 ? "VERIFIED" : "VIOLATION"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Multi-Factor Progress Decomposition */}
                <div className="space-y-3 pt-3 border-t border-[#1E2B4A]">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">1. Lexical Grounding Index</span>
                      <span className="font-mono text-[#00F2FE] tabular-nums font-semibold">
                        {isDiffApplied ? "96%" : "24%"}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#080C16] rounded-full overflow-hidden border border-[#1E2B4A]">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isDiffApplied ? "bg-[#00F2FE] w-[96%]" : "bg-rose-500 w-[24%]"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">2. Statutory Regulatory Match</span>
                      <span className="font-mono text-emerald-400 tabular-nums font-semibold">
                        {isDiffApplied ? "100%" : "12%"}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#080C16] rounded-full overflow-hidden border border-[#1E2B4A]">
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
                      <span className="font-mono text-[#FBBF24] tabular-nums font-semibold">
                        {isDiffApplied ? "92%" : "38%"}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#080C16] rounded-full overflow-hidden border border-[#1E2B4A]">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isDiffApplied ? "bg-[#E5A93C] w-[92%]" : "bg-amber-500 w-[38%]"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Issue Breakdown with Physical Status LEDs */}
              <div className="rounded-xl bg-[#0D1527] border border-[#1E2B4A] overflow-hidden shadow-xl">
                <div className="px-5 py-3 border-b border-[#1E2B4A] bg-[#0A0F1D] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                      Hardware Status LEDs · Issue Breakdown ({isDiffApplied ? 0 : currentPreset.detectedIssues.length})
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
                        className={`p-3.5 rounded-lg border text-xs space-y-1.5 transition-all ${
                          issue.severity === "critical"
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                            : issue.severity === "high"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                            : "bg-[#111C35] border-[#2E416E] text-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 font-semibold">
                            {/* Realistic Physical Status LED */}
                            <span
                              className={`led-indicator ${
                                issue.severity === "critical"
                                  ? "led-rose"
                                  : issue.severity === "high"
                                  ? "led-amber"
                                  : "led-gold"
                              }`}
                            />
                            <span>{issue.title}</span>
                          </div>
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase border ${
                              issue.severity === "critical"
                                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            }`}
                          >
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-sans pl-3.5">
                          {issue.description}
                        </p>
                        <div className="text-[10px] font-mono text-slate-400 pt-1 flex items-center gap-1.5 pl-3.5">
                          <Scale className="w-3 h-3 text-[#E5A93C]" />
                          <span>REGULATION: {issue.regulation}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
                      <span className="led-indicator led-turquoise" />
                      <div>
                        <div className="font-semibold text-white">All Statutory Violations Cleared</div>
                        <p className="text-[11px] text-emerald-300/80 mt-0.5">
                          Token-level surgical diff verified against registered clinical studies.
                          Approved for distribution across all channels.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Collapsible Evidence Provenance Drawer */}
              <div className="rounded-xl bg-[#0D1527] border border-[#1E2B4A] p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-[#00F2FE]" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                      Grounded Evidence Provenance Drawer
                    </span>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    className="text-xs font-mono text-[#00F2FE] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isDrawerOpen ? "Collapse Drawer" : "Expand Provenance"}</span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${isDrawerOpen ? "rotate-90" : ""}`}
                    />
                  </button>
                </div>

                {/* Compact Primary Provenance Specs */}
                <div className="p-3 bg-[#080C16] border border-[#1E2B4A] rounded-lg font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">CLAIM ID:</span>
                    <span className="text-[#00F2FE] font-semibold">{currentPreset.provenance.claimId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">PRIMARY EVIDENCE:</span>
                    <span
                      className="text-slate-200 truncate max-w-[200px]"
                      title={currentPreset.provenance.evidenceDoc}
                    >
                      {currentPreset.provenance.evidenceDoc}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">DOI / ASSAY:</span>
                    <span className="text-[#FBBF24]">{currentPreset.provenance.doi}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">EXPIRATION:</span>
                    <span className="text-emerald-400">{currentPreset.provenance.expiryDate}</span>
                  </div>
                </div>

                {/* Collapsible Drawer Excerpt Body */}
                {isDrawerOpen && (
                  <div className="pt-3 border-t border-[#1E2B4A] space-y-3 text-xs">
                    <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                      VERBATIM CLINICAL ASSAY EXCERPT:
                    </div>
                    <div className="p-3 bg-[#080C16] border border-[#1E2B4A] rounded-lg text-slate-300 italic leading-relaxed text-[11px] font-sans">
                      &ldquo;{currentPreset.provenance.excerpt}&rdquo;
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                      <div>
                        <span className="text-slate-500">AUTHORIZER: </span>
                        <span className="text-slate-200">{currentPreset.provenance.owner}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">CHANNELS: </span>
                        <span className="text-slate-200">{currentPreset.provenance.permittedChannels}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[260px]">
                        SHA256: {currentPreset.provenance.sha256}
                      </span>
                      <button
                        onClick={handleCopyProvenance}
                        className="text-[11px] font-mono text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
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
      <section id="comparison-matrix" className="py-20 bg-[#0D1527] border-b border-[#1E2B4A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[11px] font-mono bg-[#E5A93C]/15 text-[#FBBF24] border border-[#E5A93C]/30 font-semibold">
              <span>ENTERPRISE ARCHITECTURAL DIFFERENTIATION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
              Why Inkloom is Not Another AI Writing Assistant
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              Standard generative assistants hallucinate creative copy from general internet text. Inkloom is a deterministic claims governance compiler built for corporate general counsel and medical directors.
            </p>
          </div>

          {/* Swiss Comparison Table */}
          <div className="border border-[#1E2B4A] rounded-xl overflow-hidden bg-[#080C16] shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A0F1D] border-b border-[#1E2B4A] text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4 w-1/4">Evaluation Dimension</th>
                    <th className="px-6 py-4 w-3/8 text-slate-400">
                      Generic LLM / Creative AI Assistant
                    </th>
                    <th className="px-6 py-4 w-3/8 text-[#00F2FE] bg-[#00F2FE]/5 border-l border-[#00F2FE]/20">
                      Inkloom Sovereign Governance Layer
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2B4A] font-sans">
                  {[
                    {
                      dimension: "Grounding Architecture",
                      generic: "Probabilistic next-token predictions scraped from unverified internet pages.",
                      inkloom:
                        "Strict PostgreSQL RLS-isolated repository grounded exclusively in clinical trials & certified assays.",
                    },
                    {
                      dimension: "Hallucination Risk",
                      generic: "Uncontrolled fabrication of scientific percentages, citations, and medical efficacy.",
                      inkloom:
                        "0.00% tolerance. Unsubstantiated claims trigger mandatory statutory stop-orders.",
                    },
                    {
                      dimension: "Citation & Audit Trail",
                      generic: "Zero evidentiary backing. Cannot produce valid DOI references or signed legal memos.",
                      inkloom:
                        "Cryptographic SHA-256 audit ledger linking every word to assay standards and authorized owners.",
                    },
                    {
                      dimension: "Revision Mechanics",
                      generic: "Destructive generative overwrites that strip authentic brand tone and nuances.",
                      inkloom:
                        "Surgical word-level redline diffs that alter only legally non-compliant phrases.",
                    },
                    {
                      dimension: "Regulatory Guardrails",
                      generic: "Generic content moderation filters oblivious to FTC, FDA, and NAD regulations.",
                      inkloom:
                        "Deterministic statutory engines enforcing FTC 16 CFR § 255 and FDA 21 CFR § 101.93(g).",
                    },
                    {
                      dimension: "Approval Workflow",
                      generic: "Direct auto-generation with no multi-party gating or cryptographic sign-off stamps.",
                      inkloom:
                        "Two-key human approval gate requiring medical, legal, and brand director digital signatures.",
                    },
                    {
                      dimension: "Tenant Isolation & Privacy",
                      generic: "Corporate prompts ingested into foundational models for public training loops.",
                      inkloom:
                        "Strict multi-tenant Row Level Security (RLS) with zero data retention for training.",
                    },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#111C35]/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-slate-200">
                        {row.dimension}
                      </td>
                      <td className="px-6 py-4 text-slate-400 leading-relaxed">
                        <span className="text-rose-400 font-mono font-bold mr-2 select-none">[✕]</span>
                        {row.generic}
                      </td>
                      <td className="px-6 py-4 text-slate-100 leading-relaxed bg-[#00F2FE]/5 border-l border-[#00F2FE]/20 font-medium">
                        <span className="text-[#00F2FE] font-mono font-bold mr-2 select-none">[✓]</span>
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

      {/* SECTION: REGULATORY ASSURANCE & STATUTORY BADGES */}
      <section id="regulatory-assurance" className="py-20 bg-[#080C16] border-b border-[#1E2B4A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#FBBF24]">
              INSTITUTIONAL REGULATORY COMPLIANCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
              Engineered for Heavily Regulated Sectors
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Architected to satisfy the evidentiary standards of corporate general counsel, clinical research organizations, and public listing authorities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: "FTC Endorsement Guides",
                code: "16 CFR Part 255",
                desc: "Automated enforcement of material connection disclosures, clear and conspicuous placement, and objective claim substantiation.",
                icon: Scale,
                badgeColor: "gold",
              },
              {
                title: "FDA Regulatory Gating",
                code: "21 CFR Part 11 & DSHEA",
                desc: "Prevents unauthorized disease claims on supplements and OTC cosmetics while enforcing mandatory structure/function disclaimers.",
                icon: ShieldCheck,
                badgeColor: "turquoise",
              },
              {
                title: "SOC 2 Type II Certified",
                code: "AICPA Trust Services",
                desc: "Cryptographically verified system controls, zero AI public data training, and end-to-end immutability for all claim audit logs.",
                icon: Lock,
                badgeColor: "gold",
              },
              {
                title: "PostgreSQL Tenant RLS",
                code: "Row Level Security",
                desc: "Hardware-level tenant isolation guarantees that claims and trial assays belonging to Brand A are strictly walled off from Brand B.",
                icon: Server,
                badgeColor: "turquoise",
              },
            ].map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-6 rounded-xl bg-[#0D1527] border border-[#1E2B4A] hover:border-[#2E416E] transition-all space-y-3.5 shadow-lg group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-[#111C35] border border-[#2E416E] flex items-center justify-center text-slate-200 group-hover:text-[#00F2FE] transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                        pillar.badgeColor === "gold"
                          ? "bg-[#E5A93C]/15 text-[#FBBF24] border-[#E5A93C]/30"
                          : "bg-[#00F2FE]/15 text-[#00F2FE] border-[#00F2FE]/30"
                      }`}
                    >
                      {pillar.code}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white font-sans">{pillar.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION: 4-STAGE ARCHITECTURAL PROVENANCE PIPELINE */}
      <section id="provenance-pipeline" className="py-20 bg-[#0D1527] border-b border-[#1E2B4A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#00F2FE]">
              EVIDENCE VERIFICATION LIFECYCLE
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
              How Inkloom Audits Marketing Content
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              An unalterable pipeline that transforms unstructured marketing copy into verified, audit-proof communications.
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
                  className="p-6 rounded-xl bg-[#080C16] border border-[#1E2B4A] hover:border-[#2E416E] transition-all space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#FBBF24]">
                      PHASE {stage.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[#111C35] border border-[#2E416E] flex items-center justify-center text-slate-300">
                      <Icon className="w-4 h-4 text-[#00F2FE]" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-white font-sans">{stage.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{stage.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 bg-[#080C16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl bg-[#0D1527] border border-[#1E2B4A] p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00F2FE]/40 to-transparent" />

            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[10px] font-mono bg-[#E5A93C]/15 text-[#FBBF24] border border-[#E5A93C]/30 font-semibold">
                <span>ENTERPRISE COMPLIANCE DEPLOYMENT</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white font-sans">
                Protect Your Brand Truth at Enterprise Scale.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Empower your content creators while giving your legal, medical, and regulatory directors complete audit oversight and zero-liability certainty.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/dashboard"
                className="turquoise-button px-5 py-2.5 rounded-md text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <ShieldCheck className="w-4 h-4 text-[#080C16]" />
                <span>Launch Live Workspace</span>
              </Link>
              <Link
                href="/prototype-notice?feature=pilot"
                className="gold-button px-5 py-2.5 rounded-md text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Book Enterprise Pilot</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#080C16]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Precision Chrome Footer */}
      <footer className="border-t border-[#1E2B4A] py-10 bg-[#080C16] text-slate-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 select-none">
              <div className="w-6 h-6 rounded bg-[#111C35] border border-[#2E416E] flex items-center justify-center text-[#00F2FE]">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-white font-sans">Inkloom AI</span>
              <span className="text-slate-500">
                &copy; 2026 Inkloom Technologies Inc. All rights reserved.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-slate-400">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/submissions" className="hover:text-white transition-colors">
                Submissions
              </Link>
              <Link href="/approvals" className="hover:text-white transition-colors">
                Approvals Queue
              </Link>
              <Link href="/knowledge-base/claims" className="hover:text-white transition-colors">
                Claims Library
              </Link>
              <Link href="/analytics" className="hover:text-white transition-colors">
                Analytics
              </Link>
              <Link
                href="/prototype-notice?feature=pilot"
                className="hover:text-[#FBBF24] transition-colors"
              >
                Enterprise Pilot
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1E2B4A]/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-600">
            <div>
              GOVERNANCE PROTOCOLS: FTC 16 CFR § 255 · FDA 21 CFR § 101.93(g) · ISO/IEC 27001:2022
            </div>
            <div>
              SOVEREIGN ARCHITECTURE · ZERO THIRD-PARTY TRAINING INGESTION
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
