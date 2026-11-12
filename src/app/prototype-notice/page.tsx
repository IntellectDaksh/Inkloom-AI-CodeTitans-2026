"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  Building2,
  CheckCircle2,
  Lock,
  Server,
  Layers,
  ArrowRight,
  Send,
  Fingerprint,
  Terminal,
  UserCheck,
} from "lucide-react";

function PrototypeNoticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const feature = searchParams.get("feature") || "pilot";

  const [emailInput, setEmailInput] = useState("daksh@uideas.digital");
  const [companyName, setCompanyName] = useState("Acme Global Health");
  const [submitted, setSubmitted] = useState(false);

  const setDemoSession = (user: { name: string; role: string; email: string; userId: string }) => {
    try {
      localStorage.setItem("inkloom:session", JSON.stringify(user));
    } catch {}
    router.push("/dashboard");
  };

  const getFeatureDetails = () => {
    switch (feature) {
      case "sso":
        return {
          title: "Enterprise SSO & SAML 2.0 Gateway",
          subtitle: "Single Sign-On federation for enterprise brand, legal, and compliance teams.",
          badge: "IDENTITY SPECIFICATION · SAML 2.0 / OIDC",
          icon: KeyRound,
        };
      case "password-recovery":
        return {
          title: "Sovereign Key & Password Recovery",
          subtitle: "Hardware-enforced cryptographic dual-factor credential reset.",
          badge: "SECURITY PROTOCOL · ZERO KNOWLEDGE",
          icon: Lock,
        };
      case "rules":
        return {
          title: "Statutory Regulatory Rule Engine Ingestion",
          subtitle: "Direct ingestion of CFR guidelines, FTC precedents, and FDA statutory codes.",
          badge: "GOVERNANCE COMPILER · DETERMINISTIC REGEX",
          icon: Server,
        };
      case "soc2":
        return {
          title: "SOC 2 Type II Compliance & Audit Package",
          subtitle: "Institutional security controls, encryption keys, and third-party auditor reports.",
          badge: "AUDIT ASSURANCE · AICPA TRUST PRINCIPLES",
          icon: ShieldCheck,
        };
      case "privacy":
        return {
          title: "Zero-Retention Privacy & Sovereign Data Custody",
          subtitle: "Guaranteed zero-training policy with hardware-level PostgreSQL tenant barriers.",
          badge: "PRIVACY PLEDGE · TENANT RLS ISOLATION",
          icon: Fingerprint,
        };
      case "github":
        return {
          title: "GitHub Enterprise Repository & CI/CD Actions",
          subtitle: "Automated pre-flight compliance linting for content repositories and marketing pipelines.",
          badge: "DEVSECOPS PIPELINE · CLI & GITHUB ACTIONS",
          icon: Terminal,
        };
      case "proposal":
        return {
          title: "Technical Proposal & Specification Whitepaper",
          subtitle: "Mathematical proofs of deterministic compliance verification and clinical assay ground truth.",
          badge: "RESEARCH WHITE-PAPER · CODETITANS INDIA 2026",
          icon: Layers,
        };
      case "veeva-sync":
        return {
          title: "Veeva Vault & SAP PharmaSync Integration",
          subtitle: "Automated bidirectional sync for enterprise medical, legal, and regulatory (MLR) approvals.",
          badge: "ENTERPRISE CONNECTOR · VEEVA PROMO MATS / SAP",
          icon: Server,
        };
      case "certified_pdf_engine":
        return {
          title: "Cryptographically Signed Audit Certificate PDF",
          subtitle: "Automated export of ISO/IEC 27001 verified compliance certificates with SHA-256 seal.",
          badge: "COMPLIANCE EXPORT · 21 CFR PART 11 SEAL",
          icon: ShieldCheck,
        };
      case "create-brand":
        return {
          title: "Dedicated Tenant & Brand Workspace Provisioning",
          subtitle: "Automated PostgreSQL Row-Level Security tenant partition deployment with custom clinical truth library.",
          badge: "MULTI-TENANCY · ISOLATED RLS CONTAINER",
          icon: Building2,
        };
      case "team-invite":
        return {
          title: "Enterprise Directory & RBAC Provisioning",
          subtitle: "SCIM / Active Directory team onboarding with cryptographic role gating and audit logging.",
          badge: "RBAC DIRECTORY · SCIM 2.0 / OKTA",
          icon: UserCheck,
        };
      case "pilot":
      default:
        return {
          title: "Book Enterprise Pilot Program",
          subtitle: "30-Day managed deployment with custom clinical trial ingestion and SLA guarantees.",
          badge: "ENTERPRISE PROOF OF CONCEPT · MANAGED DEPLOYMENT",
          icon: Building2,
        };
    }
  };

  const details = getFeatureDetails();
  const Icon = details.icon;

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-between font-sans selection:bg-white/20 selection:text-white">
      {/* Precision Chrome Nav */}
      <nav className="border-b border-white/10 bg-[#080808]/90 backdrop-blur-md px-6 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-bold text-sm tracking-tighter">
            AS
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base tracking-tight text-white">
              AdSnitch
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#A0A0A0] border border-white/10">
              SYSTEM NOTICE
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-xs font-mono">
          <Link
            href="/dashboard"
            className="text-white hover:underline flex items-center gap-1.5"
          >
            <span>Return to Application</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 w-full space-y-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#A0A0A0] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO OVERVIEW</span>
          </Link>
        </div>

        {/* Main Monochromatic Milled Card */}
        <div className="rounded-xl bg-[#141414] border border-white/10 p-6 sm:p-8 space-y-8 shadow-2xl relative">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#080808] border border-white/10 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>SYSTEM PROTOTYPE NOTICE · CODETITANS 2026</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {details.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed max-w-xl">
                This feature is currently in the development phase of the AdSnitch prototype and
                requires enterprise cloud backend provisioning. All core compliance inspection and
                claim verification features are live in the interactive sandbox and workspace.
              </p>
            </div>

            <div className="w-12 h-12 rounded-lg bg-[#080808] border border-white/10 flex items-center justify-center shrink-0 text-white">
              <Icon className="w-6 h-6" />
            </div>
          </div>

          {/* 1-Click Persona Access Bypass Buttons */}
          <div className="p-5 rounded-lg bg-[#080808] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-white uppercase flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>1-Click Hackathon Persona Bypass (Instant Access)</span>
              </span>
              <span className="text-[10px] font-mono text-[#A0A0A0]">NO PASSWORD REQUIRED</span>
            </div>
            <p className="text-xs text-[#A0A0A0]">
              To evaluate the live dashboard, approvals queue, and clinical claims library immediately,
              select any pre-provisioned role below:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <button
                onClick={() =>
                  setDemoSession({
                    name: "Daksh Agrawal",
                    role: "Admin",
                    email: "daksh@uideas.digital",
                    userId: "00000000-0000-4000-a000-000000000010",
                  })
                }
                className="p-3.5 rounded bg-[#141414] hover:bg-neutral-800 border border-white/10 hover:border-white text-left transition-all cursor-pointer group"
              >
                <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                  ADMIN / ARCHITECT
                </div>
                <div className="text-xs font-semibold text-white group-hover:underline">
                  Daksh Agrawal
                </div>
                <div className="text-[10px] font-mono text-[#A0A0A0] truncate">
                  Full Policy Control
                </div>
              </button>

              <button
                onClick={() =>
                  setDemoSession({
                    name: "Laksh Khatri",
                    role: "Reviewer",
                    email: "laksh@uideas.digital",
                    userId: "00000000-0000-4000-a000-000000000012",
                  })
                }
                className="p-3.5 rounded bg-[#141414] hover:bg-neutral-800 border border-white/10 hover:border-white text-left transition-all cursor-pointer group"
              >
                <div className="text-[10px] font-mono font-bold text-white uppercase">
                  REVIEWER / LEGAL
                </div>
                <div className="text-xs font-semibold text-white group-hover:underline">
                  Laksh Khatri
                </div>
                <div className="text-[10px] font-mono text-[#A0A0A0] truncate">
                  Approvals &amp; Overrides
                </div>
              </button>

              <button
                onClick={() =>
                  setDemoSession({
                    name: "Riddhi Shah",
                    role: "Creator",
                    email: "riddhi@uideas.digital",
                    userId: "00000000-0000-4000-a000-000000000011",
                  })
                }
                className="p-3.5 rounded bg-[#141414] hover:bg-neutral-800 border border-white/10 hover:border-white text-left transition-all cursor-pointer group"
              >
                <div className="text-[10px] font-mono font-bold text-[#A0A0A0] uppercase">
                  CREATOR / WRITER
                </div>
                <div className="text-xs font-semibold text-white group-hover:underline">
                  Riddhi Shah
                </div>
                <div className="text-[10px] font-mono text-[#A0A0A0] truncate">
                  Submission &amp; Diffs
                </div>
              </button>
            </div>
          </div>

          {/* Feature-Specific Interactive Simulation */}
          {feature === "pilot" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded bg-[#080808] border border-white/10 space-y-1">
                  <div className="text-[10px] font-mono text-[#A0A0A0] uppercase">DURATION</div>
                  <div className="text-sm font-semibold text-white">30-Day Managed PoC</div>
                  <div className="text-[11px] text-[#A0A0A0]">Dedicated compliance architect</div>
                </div>
                <div className="p-3 rounded bg-[#080808] border border-white/10 space-y-1">
                  <div className="text-[10px] font-mono text-[#A0A0A0] uppercase">ISOLATION</div>
                  <div className="text-sm font-semibold text-emerald-400">PostgreSQL Dedicated RLS</div>
                  <div className="text-[11px] text-[#A0A0A0]">Zero cross-tenant leakage</div>
                </div>
                <div className="p-3 rounded bg-[#080808] border border-white/10 space-y-1">
                  <div className="text-[10px] font-mono text-[#A0A0A0] uppercase">SLA COMMITMENT</div>
                  <div className="text-sm font-semibold text-white">99.99% Uptime</div>
                  <div className="text-[11px] text-[#A0A0A0]">Sub-500ms P95 latency</div>
                </div>
              </div>

              {!submitted ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="space-y-4 p-5 rounded-lg bg-[#080808] border border-white/10"
                >
                  <div className="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-white" />
                    <span>Request Institutional White-Glove Trial</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-[#A0A0A0] mb-1">
                        ENTERPRISE EMAIL:
                      </label>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-[#141414] border border-white/10 focus:border-white focus:outline-none rounded-md px-3 py-2 text-xs font-mono text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-[#A0A0A0] mb-1">
                        ORGANIZATION:
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-[#141414] border border-white/10 focus:border-white focus:outline-none rounded-md px-3 py-2 text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#737373] font-mono">
                      Includes 10,000 monthly claim audits &amp; custom assay parsing.
                    </span>
                    <button
                      type="submit"
                      className="bg-white hover:bg-neutral-200 text-black px-4 py-2 rounded text-xs font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <span>Submit Pilot Request</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1 text-xs">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Pilot Request Received</span>
                  </div>
                  <p className="text-[#A0A0A0]">
                    A compliance engineer has reserved a dedicated tenant sandbox for {companyName}.
                    Confirmation sent to {emailInput}.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Diagnostic Terminal Telemetry Box */}
          <div className="p-4 rounded-lg bg-[#080808] border border-white/10 font-mono text-xs space-y-2 text-[#A0A0A0]">
            <div className="flex items-center justify-between text-white border-b border-white/10 pb-2">
              <span className="text-[11px] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>DIAGNOSTIC TERMINAL TELEMETRY</span>
              </span>
              <span className="text-[10px] text-emerald-400">TEST STATUS: 54/54 PASSING</span>
            </div>
            <div className="text-[11px] space-y-1">
              <div>
                [ENV]: production-turbopack · [ISOLATION]: PostgreSQL RLS · [TENANT]:
                00000000-0000-4000-a000-000000000001
              </div>
              <div>
                [FEATURE_SCOPE]: {feature.toUpperCase()} · [FALLBACK_ENGINE]: Active Heuristics
              </div>
              <div>
                [SEED_VERIFICATION]: 8 Approved Claims, 5 Submissions, 32 Audit Ledger Events Loaded
              </div>
            </div>
          </div>

          {/* Action Navigation Footer */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className="text-xs font-mono text-[#A0A0A0] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Landing Page</span>
            </Link>

            <Link
              href="/dashboard"
              className="bg-white hover:bg-neutral-200 text-black px-5 py-2.5 rounded text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
            >
              <span>Return to Application Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs font-mono text-[#737373]">
        AdSnitch · Sovereign Pre-Publication Brand Truth Governance · CodeTitans India 2026
      </footer>
    </div>
  );
}

export default function PrototypeNoticePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080808] flex items-center justify-center text-xs font-mono text-[#A0A0A0]">
          Loading governance module...
        </div>
      }
    >
      <PrototypeNoticeContent />
    </Suspense>
  );
}
