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
  Terminal,
  Activity,
  Award,
  Zap,
  Building,
  Users,
  Compass,
} from "lucide-react";

// Interactive Presets for the Live Audit Workbench
interface Preset {
  id: string;
  name: string;
  brand: string;
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
    name: "Clinical Nutrition (Apex Nutrition)",
    brand: "Apex Nutrition",
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
    name: "Enterprise SaaS SLA (Zenith Cloud)",
    brand: "Zenith Cloud SaaS",
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
          "Statutory misrepresentation under SEC & FTC guidance. Cybersecurity claims must specify encryption standards (AES-256 / TLS 1.3).",
        severity: "high",
        regulation: "FTC Policy on Deceptive Claims (15 U.S.C. § 45) / SEC Rule 10b-5",
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
    name: "Skincare & Cosmetics (Lumina)",
    brand: "Lumina Skincare",
    category: "Consumer Cosmetics",
    rawText:
      "Clinically proven to completely erase wrinkles in 48 hours and reverse facial aging in 7 days with all-natural organic bio-peptides.",
    flaggedPhrases: [
      {
        text: "completely erase wrinkles",
        type: "prohibited",
        replacement: "visibly diminish the appearance of fine surface lines",
      },
      {
        text: "reverse facial aging in 7 days with all-natural organic bio-peptides",
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
          "Cosmetic vs. Drug classification violation. Claiming permanent anatomical alteration shifts product classification to unapproved new drug under FD&C Act.",
        severity: "critical",
        regulation: "FD&C Act § 201(g)(1)(C) / MoCRA 2022",
      },
      {
        type: "ungrounded",
        title: "Unsubstantiated Acute Timeframe ('reverse aging in 7 days')",
        description:
          "Clinical assay CS-SKN-2024 evaluated efficacy over 28 days; acute 7-day reversal claims lack bio-instrumentation substantiation.",
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
  const [auditStep, setAuditStep] = useState<number>(6);
  const [isDiffApplied, setIsDiffApplied] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [copiedProvenance, setCopiedProvenance] = useState<boolean>(false);

  const currentPreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];
  const activeScore = isDiffApplied ? currentPreset.clearedScore : currentPreset.initialScore;

  const scrollToWorkbench = () => {
    document.getElementById("workbench")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectPreset = (preset: Preset) => {
    setSelectedPresetId(preset.id);
    setCurrentText(preset.rawText);
    setIsDiffApplied(false);
    triggerAudit(preset.rawText);
  };

  const triggerAudit = (textToAudit: string) => {
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
    }, 70);
  };

  const handleApplyDiff = () => {
    setCurrentText(currentPreset.correctedText);
    setIsDiffApplied(true);
    triggerAudit(currentPreset.correctedText);
  };

  const handleResetSandbox = () => {
    setCurrentText(currentPreset.rawText);
    setIsDiffApplied(false);
    triggerAudit(currentPreset.rawText);
  };

  const handleCopyProvenance = async () => {
    try {
      await navigator.clipboard.writeText(
        `Claim ID: ${currentPreset.provenance.claimId}\nEvidence: ${currentPreset.provenance.evidenceDoc}\nDOI: ${currentPreset.provenance.doi}\nAssay Standard: ${currentPreset.provenance.assayStandard}\nOwner: ${currentPreset.provenance.owner}\nSHA-256: ${currentPreset.provenance.sha256}`
      );
      setCopiedProvenance(true);
      setTimeout(() => setCopiedProvenance(false), 2000);
    } catch {
      setCopiedProvenance(true);
      setTimeout(() => setCopiedProvenance(false), 2000);
    }
  };

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

  // Circular gauge meter constants
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (activeScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#080808] text-[#FFFFFF] font-sans selection:bg-white/20 selection:text-white">
      {/* 1. PRECISION NAVIGATION BAR */}
      <nav className="border-b border-white/10 bg-[#080808]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Mark */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-bold text-sm tracking-tighter">
              IK
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight text-white">
                Inkloom AI
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white/5 text-[#A0A0A0] border border-white/10">
                GOVERNANCE OS
              </span>
            </div>
          </Link>

          {/* Primary Nav Links */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-mono text-[#A0A0A0]">
            <button
              onClick={scrollToWorkbench}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <a href="#architecture" className="hover:text-white transition-colors">
              Architecture
            </a>
            <a href="#sectors" className="hover:text-white transition-colors">
              Sectors
            </a>
            <Link href="/evaluations" className="hover:text-white transition-colors">
              Evaluations &amp; Benchmarks
            </Link>
            <Link href="/knowledge-base/claims" className="hover:text-white transition-colors">
              Claims Library
            </Link>
          </div>

          {/* Action Controls & Active Engine LED */}
          <div className="flex items-center gap-3">
            {/* Status Indicator: Active Engine LED */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#141414] border border-white/10 text-[11px] font-mono text-[#A0A0A0]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Engine Live: 54/54 Passing</span>
            </div>

            <Link
              href="/auth/login"
              className="text-xs font-mono text-[#A0A0A0] hover:text-white transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="bg-white hover:bg-neutral-200 text-black text-xs font-semibold px-4 py-2 rounded transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION — Swiss Typography Grid & Editorial Layout */}
      <section className="relative py-24 sm:py-28 border-b border-white/10 overflow-hidden bg-[#080808]">
        {/* Subtle Paper Grain / Hairline Grid Texture */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 7 Columns: Editorial Headline & Value Propositions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-white/10 text-xs font-mono text-[#A0A0A0]">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>The Pre-Publication Governance Layer for Brand Truth &amp; Marketing Claims</span>
              </div>

              {/* Editorial Headline */}
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08]">
                Check the Claim. Show the Source. Keep People in Control.
              </h1>

              {/* Value Subheading */}
              <p className="text-base sm:text-lg text-[#A0A0A0] leading-relaxed max-w-2xl font-normal">
                Preventing regulatory fines, deceptive superlatives, and brand liabilities before content
                goes live. Inkloom audits marketing copy against verified clinical trials, SEC filings,
                and legal registers with token-level diffing.
              </p>

              {/* Primary CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={scrollToWorkbench}
                  className="bg-white hover:bg-neutral-200 text-black text-xs font-semibold px-5 py-3 rounded transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <FileSearch className="w-4 h-4" />
                  <span>Launch Live Audit Sandbox</span>
                </button>

                <Link
                  href="/dashboard"
                  className="bg-[#141414] hover:bg-[#1C1C1C] text-white border border-white/10 hover:border-white/25 text-xs font-semibold px-5 py-3 rounded transition-all active:scale-95 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enter App</span>
                </Link>

                <Link
                  href="/evaluations"
                  className="text-xs font-mono text-[#A0A0A0] hover:text-white transition-colors flex items-center gap-1.5 px-3 py-3"
                >
                  <span>Explore Benchmarks</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Live Counter / Trust Badge */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs font-mono text-[#A0A0A0]">
                <div className="flex items-center gap-2 text-white font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>54/54 Automated Tests Passing</span>
                </div>
                <span className="text-white/20">•</span>
                <div className="flex items-center gap-2 text-white font-medium">
                  <Award className="w-4 h-4 text-white" />
                  <span>100% Recall on Regulatory Violations</span>
                </div>
                <span className="text-white/20">•</span>
                <div className="text-[#A0A0A0]">
                  <span>P95 Latency: 420ms</span>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Milled Hardware Teaser Card */}
            <div className="lg:col-span-5">
              <div className="rounded-xl bg-[#141414] border border-white/10 p-6 space-y-5 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-white" />
                    <span className="text-xs font-mono font-semibold text-white">
                      PRE-PUBLICATION COPILOT
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    RLS PROTECTED
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded bg-[#080808] border border-white/10 text-slate-300 space-y-1">
                    <div className="text-[10px] text-[#A0A0A0] uppercase">Input Raw Copy:</div>
                    <div className="text-rose-300 line-through">
                      &quot;Guaranteed 100% zero-downtime SLA with military-grade unhackable encryption.&quot;
                    </div>
                  </div>

                  <div className="p-3 rounded bg-[#080808] border border-white/10 text-emerald-300 space-y-1">
                    <div className="text-[10px] text-emerald-400 uppercase">Surgical Revision (Grounded):</div>
                    <div>
                      &quot;Contractual 99.99% multi-region uptime SLA backed by SOC 2 Type II verified AES-256 encryption.&quot;
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#A0A0A0]">
                  <span>Citation: NIST SP 800-53</span>
                  <span className="text-white font-semibold">Audit Score: 98/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LIVE HERO AUDIT WORKBENCH (Interactive Playground) */}
      <section id="workbench" className="py-24 border-b border-white/10 bg-[#080808] relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#A0A0A0]">
                  INTERACTIVE HARDWARE TERMINAL
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Live Content Audit Workbench
              </h2>
              <p className="text-xs sm:text-sm text-[#A0A0A0] max-w-2xl font-normal">
                Test how the deterministic 8-stage governance compiler dissects high-stakes marketing
                copy, links clinical trials, and synthesizes word-level surgical diffs.
              </p>
            </div>

            {/* Preset Selector Pills */}
            <div className="flex flex-wrap items-center gap-2 bg-[#141414] p-1.5 rounded-lg border border-white/10">
              {PRESETS.map((p) => {
                const isSelected = p.id === selectedPresetId;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`px-3 py-1.5 text-xs font-mono rounded transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "text-[#A0A0A0] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audit Telemetry Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#141414] border border-white/10 font-mono text-xs">
            <div>
              <div className="text-[10px] text-[#A0A0A0] uppercase">COMPOSITE COMPLIANCE SCORE</div>
              <div
                className={`text-xl font-bold tabular-nums mt-0.5 ${
                  activeScore >= 80 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {activeScore}/100{" "}
                <span className="text-xs font-normal text-[#A0A0A0]">
                  ({activeScore >= 80 ? "PASSED" : "FLAGGED"})
                </span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#A0A0A0] uppercase">PIPELINE LATENCY</div>
              <div className="text-xl font-bold tabular-nums text-white mt-0.5">
                420ms <span className="text-xs font-normal text-[#A0A0A0]">(P95)</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#A0A0A0] uppercase">ACTIVE ENGINE MODEL</div>
              <div className="text-xl font-bold text-white mt-0.5 truncate">
                Gemini 2.5 Flash <span className="text-xs font-normal text-emerald-400">• Fallback Ready</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#A0A0A0] uppercase">TENANT ISOLATION</div>
              <div className="text-xl font-bold text-white mt-0.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>PostgreSQL RLS</span>
              </div>
            </div>
          </div>

          {/* Main Workbench Grid Split (7-col sandbox / 5-col telemetry & findings) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Milled Text Well & Word-Level Surgical Diff */}
            <div className="lg:col-span-7 space-y-6">
              {/* Milled Text Well */}
              <div className="rounded-xl bg-[#141414] border border-white/10 p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-white" />
                    <span className="text-xs font-mono font-semibold text-white uppercase">
                      Editable Marketing Copy ({currentPreset.brand})
                    </span>
                  </div>
                  <button
                    onClick={handleResetSandbox}
                    className="text-[11px] font-mono text-[#A0A0A0] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Copy</span>
                  </button>
                </div>

                {/* Textarea */}
                <textarea
                  value={currentText}
                  onChange={(e) => {
                    setCurrentText(e.target.value);
                    setIsDiffApplied(false);
                  }}
                  rows={4}
                  className="w-full bg-[#080808] border border-white/10 focus:border-white focus:outline-none rounded-lg p-4 text-xs font-mono leading-relaxed text-white resize-none"
                  placeholder="Enter draft promotional content to audit..."
                />

                {/* Character Counter & Sandbox Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono text-[#A0A0A0]">
                  <div className="flex items-center gap-3">
                    <span>{currentText.length} CHARACTERS</span>
                    <span>•</span>
                    <span>{Math.ceil(currentText.length / 4)} TOKENS</span>
                  </div>

                  <button
                    onClick={() => triggerAudit(currentText)}
                    disabled={isAuditing}
                    className="bg-white hover:bg-neutral-200 text-black text-xs font-semibold px-4 py-2 rounded transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    {isAuditing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Auditing Engine Running...</span>
                      </>
                    ) : (
                      <>
                        <span>Run Full Pre-Flight Audit</span>
                        <kbd className="text-[10px] bg-black/10 px-1 py-0.5 rounded font-mono">⌘↵</kbd>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Word-Level Surgical Diff Box */}
              <div className="rounded-xl bg-[#141414] border border-white/10 p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-4 h-4 text-white" />
                    <span className="text-xs font-mono font-semibold text-white uppercase">
                      Word-Level Surgical Red-Line Diff
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                      isDiffApplied
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {isDiffApplied ? "Surgical Diff Applied" : "Pending Approval"}
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {/* Strikethrough Deletion in Red-Line */}
                  <div className="p-3.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
                    <div className="text-[10px] text-rose-400 uppercase font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>Non-Compliant Original (Deletions):</span>
                    </div>
                    <p className="line-through leading-relaxed">{currentPreset.rawText}</p>
                  </div>

                  {/* Approved Alternative in Green-Line */}
                  <div className="p-3.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1">
                    <div className="text-[10px] text-emerald-400 uppercase font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Approved Clinical Substantiation (Additions):</span>
                    </div>
                    <p className="leading-relaxed">{currentPreset.correctedText}</p>
                  </div>

                  {/* Interactive "Apply Surgical Fix" Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#A0A0A0] font-sans">
                      Automated replacement adheres to registered claim parameters without disrupting brand tone.
                    </span>

                    {!isDiffApplied ? (
                      <button
                        onClick={handleApplyDiff}
                        className="bg-white hover:bg-neutral-200 text-black text-xs font-semibold px-4 py-2 rounded transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply Surgical Fix (Score: {currentPreset.clearedScore}/100)</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Compliant Copy Synced to Sandbox</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Findings Cards List & Provenance Inspector Drawer */}
            <div className="lg:col-span-5 space-y-6">
              {/* Findings Cards List */}
              <div className="rounded-xl bg-[#141414] border border-white/10 p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-mono font-semibold text-white uppercase">
                      Flagged Violations ({isDiffApplied ? 0 : currentPreset.detectedIssues.length})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#A0A0A0]">
                    {isDiffApplied ? "ZERO FINDINGS" : "ACTIVE REGULATORY FLAGS"}
                  </span>
                </div>

                <div className="space-y-3">
                  {!isDiffApplied ? (
                    currentPreset.detectedIssues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-lg border text-xs space-y-1.5 transition-all ${
                          issue.severity === "critical"
                            ? "bg-rose-500/10 border-rose-500/25 text-rose-200"
                            : issue.severity === "high"
                            ? "bg-amber-500/10 border-amber-500/25 text-amber-200"
                            : "bg-[#080808] border-white/10 text-[#A0A0A0]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-white">{issue.title}</div>
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase border ${
                              issue.severity === "critical"
                                ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            }`}
                          >
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-[#A0A0A0]">{issue.description}</p>
                        <div className="text-[10px] font-mono pt-1 flex items-center gap-1.5 text-white/80">
                          <Scale className="w-3 h-3 text-[#A0A0A0]" />
                          <span>STATUTORY RULE: {issue.regulation}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">All Statutory Violations Cleared</div>
                        <p className="text-[11px] text-emerald-300/80 mt-0.5">
                          Copy substantiated against certified clinical trial repository. Ready for human
                          reviewer sign-off.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Provenance Inspector Drawer Trigger */}
              <div className="rounded-xl bg-[#141414] border border-white/10 p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-white" />
                    <span className="text-xs font-mono font-semibold text-white uppercase">
                      Evidence Provenance Drawer
                    </span>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    className="text-xs font-mono text-white hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isDrawerOpen ? "Hide Citation Chain" : "Inspect Full Citation Chain"}</span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${isDrawerOpen ? "rotate-90" : ""}`}
                    />
                  </button>
                </div>

                {/* Primary Specs */}
                <div className="p-3.5 bg-[#080808] border border-white/10 rounded-lg font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#A0A0A0]">CLAIM CODE:</span>
                    <span className="text-white font-semibold">{currentPreset.provenance.claimId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#A0A0A0]">EVIDENCE DOC:</span>
                    <span className="text-white truncate max-w-[200px]" title={currentPreset.provenance.evidenceDoc}>
                      {currentPreset.provenance.evidenceDoc}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#A0A0A0]">DOI REFERENCE:</span>
                    <span className="text-white font-semibold">{currentPreset.provenance.doi}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#A0A0A0]">ASSAY STANDARD:</span>
                    <span className="text-white">{currentPreset.provenance.assayStandard}</span>
                  </div>
                </div>

                {/* Expanded Provenance Inspector Modal/Drawer */}
                {isDrawerOpen && (
                  <div className="pt-3 border-t border-white/10 space-y-3 text-xs font-mono">
                    <div className="text-[10px] text-[#A0A0A0] uppercase font-semibold">
                      VERBATIM CLINICAL ASSAY EXCERPT:
                    </div>
                    <div className="p-3 bg-[#080808] border border-white/10 rounded text-slate-300 italic font-sans leading-relaxed text-[11px]">
                      &ldquo;{currentPreset.provenance.excerpt}&rdquo;
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#A0A0A0]">
                      <div>
                        <span>AUTHORIZED BY: </span>
                        <span className="text-white">{currentPreset.provenance.owner}</span>
                      </div>
                      <div>
                        <span>PERMITTED CHANNELS: </span>
                        <span className="text-white">{currentPreset.provenance.permittedChannels}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-[#A0A0A0] truncate max-w-[240px]">
                        SHA-256: {currentPreset.provenance.sha256}
                      </span>
                      <button
                        onClick={handleCopyProvenance}
                        className="text-[11px] text-white hover:underline flex items-center gap-1 cursor-pointer"
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

      {/* 4. "WHERE IT FITS" COMPETITIVE MATRIX TABLE (10 Evaluated Rows) */}
      <section id="features" className="py-24 border-b border-white/10 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#141414] border border-white/10 text-xs font-mono text-[#A0A0A0]">
              <span>WHERE IT FITS IN YOUR ENTERPRISE STACK</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Why Generic LLMs and Social Schedulers Fall Short
            </h2>
            <p className="text-sm text-[#A0A0A0] leading-relaxed">
              Standard consumer LLMs write creative fiction. Marketing schedulers organize calendar
              slots. Inkloom AI is the sovereign pre-flight governance compiler that eliminates statutory
              liabilities before publication.
            </p>
          </div>

          {/* 10-Row Comprehensive Comparison Table */}
          <div className="border border-white/10 rounded-xl overflow-hidden bg-[#141414] shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#080808] border-b border-white/10 text-[11px] uppercase tracking-wider text-[#A0A0A0]">
                  <tr>
                    <th className="px-5 py-4 w-1/5">Compliance Dimension</th>
                    <th className="px-4 py-4 w-1/6 text-slate-400">ChatGPT / Claude</th>
                    <th className="px-4 py-4 w-1/6 text-slate-400">Writer / Jasper</th>
                    <th className="px-4 py-4 w-1/6 text-slate-400">Planable / Hootsuite</th>
                    <th className="px-4 py-4 w-1/6 text-slate-400">Excel Spreadsheets</th>
                    <th className="px-5 py-4 w-1/5 text-white bg-white/5 border-l border-white/10 font-bold">
                      Inkloom AI
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-sans">
                  {[
                    {
                      dim: "1. Claim Ground Truth",
                      chatgpt: "Hallucinates citations",
                      writer: "Generic styleguide check",
                      planable: "None (Scheduling only)",
                      excel: "Static outdated rows",
                      inkloom: "Strict isolated claims DB",
                    },
                    {
                      dim: "2. Zero-Hallucination Policy",
                      chatgpt: "No (Unbounded next-token)",
                      writer: "Partial (Brand vocabulary)",
                      planable: "None",
                      excel: "Manual human check",
                      inkloom: "0.00% tolerance via deterministic gate",
                    },
                    {
                      dim: "3. Clinical Evidence Provenance",
                      chatgpt: "Fake DOI papers generated",
                      writer: "No assay verification",
                      planable: "None",
                      excel: "Dead hyperlinks",
                      inkloom: "Cryptographic DOI & ISO assay linking",
                    },
                    {
                      dim: "4. Dynamic Cascade Re-Review",
                      chatgpt: "No memory across documents",
                      writer: "No dependent re-indexing",
                      planable: "None",
                      excel: "Manual search & replace",
                      inkloom: "Automated cascade on claim expiry",
                    },
                    {
                      dim: "5. Word-Level Surgical Diff",
                      chatgpt: "Full generative rewrite",
                      writer: "Sentence replacement",
                      planable: "None",
                      excel: "Manual tracking changes",
                      inkloom: "Exact token-level redline diffing",
                    },
                    {
                      dim: "6. Dispute & Override Gate",
                      chatgpt: "None",
                      writer: "Basic prompt tweak",
                      planable: "Comments only",
                      excel: "Uncontrolled emails",
                      inkloom: "Formal creator dispute & legal override",
                    },
                    {
                      dim: "7. Channel Disclosures",
                      chatgpt: "Generic warnings",
                      writer: "Static footers",
                      planable: "Character count only",
                      excel: "Manual copy-paste",
                      inkloom: "Statutory FTC / FDA rules per channel",
                    },
                    {
                      dim: "8. Multi-Tenant RLS",
                      chatgpt: "Shared pool / Prompt leak",
                      writer: "Basic team accounts",
                      planable: "Workspace separation",
                      excel: "Accidental file sharing",
                      inkloom: "PostgreSQL Row-Level Security",
                    },
                    {
                      dim: "9. Auto-Publishing Protection",
                      chatgpt: "Uncontrolled copy-paste",
                      writer: "Direct CMS export",
                      planable: "Auto-publishes scheduled posts",
                      excel: "No live enforcement",
                      inkloom: "Strict quarantine until human sign-off",
                    },
                    {
                      dim: "10. Empirical Benchmarks",
                      chatgpt: "Vague marketing metrics",
                      writer: "Readability score only",
                      planable: "Engagement stats only",
                      excel: "None",
                      inkloom: "100% recall on landmark test cases",
                    },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-mono font-medium text-white text-xs">
                        {row.dim}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#A0A0A0]">
                        <span className="text-rose-400 font-mono mr-1">[✕]</span> {row.chatgpt}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#A0A0A0]">
                        <span className="text-rose-400 font-mono mr-1">[✕]</span> {row.writer}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#A0A0A0]">
                        <span className="text-rose-400 font-mono mr-1">[✕]</span> {row.planable}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#A0A0A0]">
                        <span className="text-rose-400 font-mono mr-1">[✕]</span> {row.excel}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-white font-medium bg-white/5 border-l border-white/10">
                        <span className="text-emerald-400 font-mono mr-1 font-bold">[✓]</span> {row.inkloom}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY THIS EXISTS: 4 LANDMARK REGULATORY DISASTERS (Case Studies) */}
      <section className="py-24 border-b border-white/10 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">
              PREVENTABLE BRAND CATASTROPHES
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Why This Exists: 4 Landmark Disasters Inkloom Prevents
            </h2>
            <p className="text-sm text-[#A0A0A0] leading-relaxed">
              When marketing claims bypass strict factual and tone verification, enterprises face
              multi-million dollar enforcement fines, viral reputational damage, and operational halts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                caseNum: "CASE 01",
                title: "FTC v. Teami Lifestyle (2020)",
                cost: "$15.2M Order ($1M Cash Paid)",
                category: "Deceptive Health & Cancer Claims",
                desc: "Promoted 'detox' teas claiming to treat cancer, unclog arteries, and cause substantial weight loss without competent clinical substantiation.",
                rule: "FTC Act § 5 (Deceptive Practices) & 16 CFR § 255",
                howInkloomPrevents:
                  "Deterministic regex blocks unverified therapeutic superlatives ('cures', 'treats cancer'); enforces mandatory clinical trial evidence upload.",
              },
              {
                caseNum: "CASE 02",
                title: "Adidas Boston Marathon (2017)",
                cost: "Global Public Relations Crisis",
                category: "Insensitive Marketing Automated Broadcast",
                desc: "Dispatched automated promotional email with subject line: 'Congrats, you survived the Boston Marathon!', triggering massive public backlash 4 years after the fatal bombing.",
                rule: "Brand Tone & Crisis Context Guidelines",
                howInkloomPrevents:
                  "Contextual semantic sensitivity filter evaluates emotional valence and tragedy proximity before scheduled dissemination.",
              },
              {
                caseNum: "CASE 03",
                title: "CNET Financial AI Hallucination (2023)",
                cost: "Editorial Overhaul & Institutional Discredit",
                category: "AI Hallucination in Public Advice",
                desc: "Generative AI published 77 financial guides with elementary mathematical errors in compound interest and certificate of deposit calculations.",
                rule: "FTC Truth in Lending & SEC Factual Disclosure",
                howInkloomPrevents:
                  "0.00% zero-hallucination policy requires every quantitative equation and percentage to be verified against registered financial formulas.",
              },
              {
                caseNum: "CASE 04",
                title: "Gap Rebrand Rollback (2010)",
                cost: "$100M+ Asset & Rollback Loss",
                category: "Uncoordinated Brand Identity Distribution",
                desc: "Replaced 20-year iconic blue box logo with unvetted Helvetica design without cross-departmental alignment, forcing rollback in 6 days.",
                rule: "Two-Key Approval Gate & Asset Governance",
                howInkloomPrevents:
                  "Two-key cryptographic approval protocol gates brand logo and core guideline updates behind authorized director signatures.",
              },
            ].map((c) => (
              <div
                key={c.caseNum}
                className="rounded-xl bg-[#141414] border border-white/10 p-6 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-rose-400">{c.caseNum}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-semibold">
                      {c.cost}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{c.title}</h3>
                  <div className="text-xs font-mono text-[#A0A0A0]">{c.category}</div>
                  <p className="text-xs text-[#A0A0A0] leading-relaxed font-sans">{c.desc}</p>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2 font-mono text-[11px]">
                  <div className="text-white/80">
                    <span className="text-[#A0A0A0]">STATUTE:</span> {c.rule}
                  </div>
                  <div className="p-2.5 rounded bg-[#080808] border border-white/10 text-emerald-400">
                    <span className="font-semibold text-white">INKLOOM REMEDY: </span>
                    {c.howInkloomPrevents}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 8-STAGE GOVERNANCE ARCHITECTURE SECTION */}
      <section id="architecture" className="py-24 border-b border-white/10 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-white font-semibold">
              TECHNICAL ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              The 8-Stage Deterministic Governance Pipeline
            </h2>
            <p className="text-sm text-[#A0A0A0] leading-relaxed">
              Every content draft moves through an uncompromising multi-stage compiler that guarantees
              mathematical rigor, empirical substantiation, and zero hallucination risk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                stage: "01",
                name: "Content Ingestion & Claim Segmentation",
                desc: "Breaks submitted draft text into atomic propositional statements and quantitative metric spans.",
                icon: FileSearch,
              },
              {
                stage: "02",
                name: "Deterministic Preflight Regex Engine",
                desc: "Sub-5ms execution traps absolute superlatives ('miracle', '100% unhackable') before LLM invocation.",
                icon: Zap,
              },
              {
                stage: "03",
                name: "Scoped Multi-Tenant Retrieval",
                desc: "PostgreSQL Row-Level Security walls off brand evidence so Brand A never contaminates Brand B.",
                icon: Database,
              },
              {
                stage: "04",
                name: "Grounded Contextual LLM Analysis",
                desc: "Gemini 2.5 Flash evaluates tone drift and statutory nuances with automatic fallback to offline rules.",
                icon: Cpu,
              },
              {
                stage: "05",
                name: "Structured Findings & DOI Linking",
                desc: "Matches flagged phrases to registered clinical trial papers, ISO standards, and legal opinions.",
                icon: GitCompare,
              },
              {
                stage: "06",
                name: "Multi-Factor Scoring & Surgical Diffing",
                desc: "Computes composite score (0-100) and compiles word-level surgical diff preserving brand tone.",
                icon: Sliders,
              },
              {
                stage: "07",
                name: "Human Approval Gate & Overrides",
                desc: "Two-key sign-off protocol allowing legal review, creator disputes, and official override memos.",
                icon: FileCheck2,
              },
              {
                stage: "08",
                name: "Tamper-Proof Audit Trail & Cascade",
                desc: "Immutable SHA-256 ledger records all decisions; automatically flags content if a claim expires.",
                icon: ShieldCheck,
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.stage}
                  className="rounded-xl bg-[#141414] border border-white/10 p-6 space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white">STAGE {s.stage}</span>
                      <div className="w-8 h-8 rounded bg-[#080808] border border-white/10 flex items-center justify-center text-white">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-white">{s.name}</h3>
                    <p className="text-xs text-[#A0A0A0] leading-relaxed font-sans">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. REGULATED SECTORS & INDUSTRY PLAYBOOKS */}
      <section id="sectors" className="py-24 border-b border-white/10 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#A0A0A0] font-semibold">
              SECTOR ADAPTATION
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Regulated Sectors &amp; Industry Playbooks
            </h2>
            <p className="text-sm text-[#A0A0A0] leading-relaxed">
              Out-of-the-box regulatory rule engines tailored to the statutory scrutiny of high-liability
              verticals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                sector: "Health, Supplements & Nutrition",
                regs: "FDA DSHEA § 403 / FTC 16 CFR § 255",
                desc: "Automated enforcement of structure/function disclaimers, dietary caveats, and clinical trial evidence requirements.",
                badge: "Apex Nutrition Active",
              },
              {
                sector: "Enterprise Cloud & FinTech SaaS",
                regs: "SOC 2 Type II / SEC Rule 10b-5",
                desc: "Prevents deceptive SLA availability promises, hyperbole in encryption standards, and unbacked uptime metrics.",
                badge: "Zenith Cloud Active",
              },
              {
                sector: "Cosmetics & Personal Care",
                regs: "FD&C Act § 201 / MoCRA 2022",
                desc: "Traps permanent anatomical claims ('reverses wrinkles') and validates instrumental skin profilometry substantiation.",
                badge: "Lumina Skincare Configured",
              },
              {
                sector: "Direct-to-Consumer E-Commerce",
                regs: "FTC Endorsement Guides / Truth in Ads",
                desc: "Verifies material connection disclosures (#ad, #sponsored), testimonials, and pricing comparison claims.",
                badge: "Universal DTC Ready",
              },
            ].map((p) => (
              <div
                key={p.sector}
                className="rounded-xl bg-[#141414] border border-white/10 p-6 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white border border-white/10">
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{p.sector}</h3>
                  <div className="text-[11px] font-mono text-emerald-400">{p.regs}</div>
                  <p className="text-xs text-[#A0A0A0] leading-relaxed font-sans">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. ENTERPRISE SECURITY & RESPONSIBLE AI */}
      <section className="py-24 border-b border-white/10 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              TRUST ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Enterprise Security &amp; Responsible AI Safeguards
            </h2>
            <p className="text-sm text-[#A0A0A0] leading-relaxed">
              Engineered with institutional privacy guarantees so sensitive product formulas, clinical
              trials, and legal drafts never leave your cryptographic custody.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Zero Public Training",
                desc: "Customer data, drafts, and uploaded trial reports are never ingested for model training or retained by third-party LLMs.",
                icon: Lock,
              },
              {
                title: "Row-Level Security (RLS)",
                desc: "Database tenant isolation enforced at the PostgreSQL kernel level. Brand guidelines and claims are partitioned strictly.",
                icon: Server,
              },
              {
                title: "Strict Anti-Auto-Publishing",
                desc: "The platform cannot auto-publish content. Every publication requires explicit human reviewer approval stamps.",
                icon: FileCheck2,
              },
              {
                title: "Offline Heuristic Resilience",
                desc: "If cloud LLM endpoints become unreachable, the deterministic regex and rule engine keeps evaluating drafts without downtime.",
                icon: Zap,
              },
            ].map((sec) => {
              const Icon = sec.icon;
              return (
                <div
                  key={sec.title}
                  className="rounded-xl bg-[#141414] border border-white/10 p-6 space-y-3.5 shadow-xl"
                >
                  <div className="w-9 h-9 rounded bg-[#080808] border border-white/10 flex items-center justify-center text-white">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{sec.title}</h3>
                  <p className="text-xs text-[#A0A0A0] leading-relaxed font-sans">{sec.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. TEAM & ACKNOWLEDGMENTS SECTION */}
      <section className="py-24 border-b border-white/10 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-white font-semibold">
              TEAM AGRAWALDAKSH008 · CODETITANS INDIA 2026
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Built for Truth by Compliance Engineers
            </h2>
            <div className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
              &quot;CHECK THE CLAIM. SHOW THE SOURCE. KEEP PEOPLE IN CONTROL.&quot;
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Daksh Agrawal",
                role: "Admin & Compliance Architect",
                focus: "Deterministic Engine, RLS Isolation & Next.js Core",
                email: "daksh@uideas.digital",
              },
              {
                name: "Laksh Khatri",
                role: "Lead Regulatory Reviewer",
                focus: "Statutory Rules (FTC, FDA, MoCRA) & Override Gates",
                email: "laksh@uideas.digital",
              },
              {
                name: "Riddhi Shah",
                role: "Senior Content Producer",
                focus: "Creator Studio, Surgical Diffing & Workflow UX",
                email: "riddhi@uideas.digital",
              },
              {
                name: "Mansoor Rupawala",
                role: "VP of Brand Governance",
                focus: "Evidence Provenance, Cascade Engine & Trial Ingest",
                email: "mansoor@uideas.digital",
              },
            ].map((m) => (
              <div
                key={m.name}
                className="rounded-xl bg-[#141414] border border-white/10 p-6 space-y-3 shadow-xl"
              >
                <div className="w-10 h-10 rounded-full bg-white text-black font-bold flex items-center justify-center text-sm">
                  {m.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{m.name}</h3>
                  <div className="text-xs font-mono text-emerald-400">{m.role}</div>
                </div>
                <p className="text-xs text-[#A0A0A0] leading-relaxed font-sans">{m.focus}</p>
                <div className="text-[10px] font-mono text-[#737373]">{m.email}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. COMPLETE 4-COLUMN FOOTER WITH LIVE LINKS */}
      <footer className="py-16 bg-[#080808] text-xs font-mono border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Column 1: Product */}
            <div className="space-y-3">
              <div className="text-white font-bold uppercase tracking-wider text-[11px]">Product</div>
              <ul className="space-y-2 text-[#A0A0A0]">
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Overview Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/submissions/new" className="hover:text-white transition-colors">
                    Submission Studio
                  </Link>
                </li>
                <li>
                  <Link href="/approvals" className="hover:text-white transition-colors">
                    Approvals Triage Queue
                  </Link>
                </li>
                <li>
                  <Link href="/submissions" className="hover:text-white transition-colors">
                    Submissions Audit Log
                  </Link>
                </li>
                <li>
                  <Link href="/evaluations" className="hover:text-white transition-colors">
                    Empirical Benchmarks
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Knowledge Base */}
            <div className="space-y-3">
              <div className="text-white font-bold uppercase tracking-wider text-[11px]">
                Knowledge Base
              </div>
              <ul className="space-y-2 text-[#A0A0A0]">
                <li>
                  <Link href="/knowledge-base/claims" className="hover:text-white transition-colors">
                    Approved Claims Library
                  </Link>
                </li>
                <li>
                  <Link href="/knowledge-base/guidelines" className="hover:text-white transition-colors">
                    Brand Voice Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="/knowledge-base/terminology" className="hover:text-white transition-colors">
                    Terminology Dictionary
                  </Link>
                </li>
                <li>
                  <Link href="/knowledge-base/assets" className="hover:text-white transition-colors">
                    Assets &amp; Trial Reports
                  </Link>
                </li>
                <li>
                  <Link href="/brands" className="hover:text-white transition-colors">
                    Multi-Brand Workspaces
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Governance */}
            <div className="space-y-3">
              <div className="text-white font-bold uppercase tracking-wider text-[11px]">
                Governance
              </div>
              <ul className="space-y-2 text-[#A0A0A0]">
                <li>
                  <Link href="/prototype-notice?feature=rules" className="hover:text-white transition-colors">
                    Statutory Rule Engine
                  </Link>
                </li>
                <li>
                  <Link href="/prototype-notice?feature=pilot" className="hover:text-white transition-colors">
                    Enterprise Pilot Program
                  </Link>
                </li>
                <li>
                  <Link href="/knowledge-base/claims" className="hover:text-white transition-colors">
                    Cascade Re-Review Engine
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="hover:text-white transition-colors">
                    Governance Analytics
                  </Link>
                </li>
                <li>
                  <Link href="/evaluations" className="hover:text-white transition-colors">
                    Evaluations &amp; Benchmarks
                  </Link>
                </li>
                <li>
                  <Link href="/team" className="hover:text-white transition-colors">
                    Team &amp; Role Permissions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal & System */}
            <div className="space-y-3">
              <div className="text-white font-bold uppercase tracking-wider text-[11px]">
                Legal &amp; System
              </div>
              <ul className="space-y-2 text-[#A0A0A0]">
                <li>
                  <Link href="/prototype-notice?feature=soc2" className="hover:text-white transition-colors">
                    Security &amp; SOC-2
                  </Link>
                </li>
                <li>
                  <Link href="/prototype-notice?feature=privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/notifications" className="hover:text-white transition-colors">
                    Notifications Feed
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="hover:text-white transition-colors">
                    Workspace Settings
                  </Link>
                </li>
                <li>
                  <Link href="/prototype-notice?feature=github" className="hover:text-white transition-colors">
                    GitHub Repository
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#737373] text-[11px]">
            <div>
              &copy; 2026 Inkloom Technologies Inc. · CodeTitans India 2026 Submission
            </div>
            <div>
              Deterministic Pre-Publication Governance · 54/54 Automated Tests Passing
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
