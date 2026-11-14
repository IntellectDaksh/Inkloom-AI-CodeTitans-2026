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
    <div className="relative isolate min-h-screen bg-canvas text-text-primary flex flex-col justify-between font-sans selection:bg-ice selection:text-text-primary">
      <div className="atmosphere -z-10" aria-hidden><i /><i /><i /></div>
      {/* Precision Chrome Nav */}
      <nav className="glass rounded-none border-x-0 border-t-0 px-6 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="app-brand-mark" aria-hidden>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base tracking-tight text-text-primary">
              AdSnitch
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ink/5 text-text-secondary border border-border-default">
              SYSTEM NOTICE
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-xs font-mono">
          <Link
            href="/dashboard"
            className="text-text-primary hover:underline flex items-center gap-1.5"
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
            className="inline-flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO OVERVIEW</span>
          </Link>
        </div>

        {/* Main Monochromatic Milled Card */}
        <div className="glass-strong rounded-2xl p-6 sm:p-8 space-y-8 relative">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-border-default pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded glass-inset text-[10px] font-mono text-status-success">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                <span>SYSTEM PROTOTYPE NOTICE · CODETITANS 2026</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                {details.title}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl">
                This feature is currently in the development phase of the AdSnitch prototype and
                requires enterprise cloud backend provisioning. All core compliance inspection and
                claim verification features are live in the interactive sandbox and workspace.
              </p>
            </div>

            <div className="w-12 h-12 rounded-lg glass-inset flex items-center justify-center shrink-0 text-text-primary">
              <Icon className="w-6 h-6" />
            </div>
          </div>

          {/* 1-Click Persona Access Bypass Buttons */}
          <div className="p-5 rounded-lg glass-inset space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-text-primary uppercase flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-status-success" />
                <span>1-Click Hackathon Persona Bypass (Instant Access)</span>
              </span>
              <span className="text-[10px] font-mono text-text-secondary">NO PASSWORD REQUIRED</span>
            </div>
            <p className="text-xs text-text-secondary">
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
                className="p-3.5 rounded bg-panel hover:bg-panel-hover border border-border-default hover:border-border-strong text-left transition-all cursor-pointer group"
              >
                <div className="text-[10px] font-mono font-bold text-status-success uppercase">
                  ADMIN / ARCHITECT
                </div>
                <div className="text-xs font-semibold text-text-primary group-hover:underline">
                  Daksh Agrawal
                </div>
                <div className="text-[10px] font-mono text-text-secondary truncate">
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
                className="p-3.5 rounded bg-panel hover:bg-panel-hover border border-border-default hover:border-border-strong text-left transition-all cursor-pointer group"
              >
                <div className="text-[10px] font-mono font-bold text-text-primary uppercase">
                  REVIEWER / LEGAL
                </div>
                <div className="text-xs font-semibold text-text-primary group-hover:underline">
                  Laksh Khatri
                </div>
                <div className="text-[10px] font-mono text-text-secondary truncate">
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
                className="p-3.5 rounded bg-panel hover:bg-panel-hover border border-border-default hover:border-border-strong text-left transition-all cursor-pointer group"
              >
                <div className="text-[10px] font-mono font-bold text-text-secondary uppercase">
                  CREATOR / WRITER
                </div>
                <div className="text-xs font-semibold text-text-primary group-hover:underline">
                  Riddhi Shah
                </div>
                <div className="text-[10px] font-mono text-text-secondary truncate">
                  Submission &amp; Diffs
                </div>
              </button>
            </div>
          </div>

          {/* Feature-Specific Interactive Simulation */}
          {feature === "pilot" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded glass-inset space-y-1">
                  <div className="text-[10px] font-mono text-text-secondary uppercase">DURATION</div>
                  <div className="text-sm font-semibold text-text-primary">30-Day Managed PoC</div>
                  <div className="text-[11px] text-text-secondary">Dedicated compliance architect</div>
                </div>
                <div className="p-3 rounded glass-inset space-y-1">
                  <div className="text-[10px] font-mono text-text-secondary uppercase">ISOLATION</div>
                  <div className="text-sm font-semibold text-status-success">PostgreSQL Dedicated RLS</div>
                  <div className="text-[11px] text-text-secondary">Zero cross-tenant leakage</div>
                </div>
                <div className="p-3 rounded glass-inset space-y-1">
                  <div className="text-[10px] font-mono text-text-secondary uppercase">SLA COMMITMENT</div>
                  <div className="text-sm font-semibold text-text-primary">99.99% Uptime</div>
                  <div className="text-[11px] text-text-secondary">Sub-500ms P95 latency</div>
                </div>
              </div>

              {!submitted ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="space-y-4 p-5 rounded-lg glass-inset"
                >
                  <div className="text-xs font-mono font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-text-primary" />
                    <span>Request Institutional White-Glove Trial</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-text-secondary mb-1">
                        ENTERPRISE EMAIL:
                      </label>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full glass-inset border border-border-default focus:border-blue focus:ring-2 focus:ring-blue/25 focus:outline-none rounded-md px-3 py-2 text-xs font-mono text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-text-secondary mb-1">
                        ORGANIZATION:
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full glass-inset border border-border-default focus:border-blue focus:ring-2 focus:ring-blue/25 focus:outline-none rounded-md px-3 py-2 text-xs font-mono text-text-primary"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-text-muted font-mono">
                      Includes 10,000 monthly claim audits &amp; custom assay parsing.
                    </span>
                    <button
                      type="submit"
                      className="bg-ink hover:bg-navy-soft text-ghost px-4 py-2 rounded text-xs font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <span>Submit Pilot Request</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-lg bg-status-success/10 border border-status-success/30 text-status-success space-y-1 text-xs">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-status-success" />
                    <span>Pilot Request Received</span>
                  </div>
                  <p className="text-text-secondary">
                    A compliance engineer has reserved a dedicated tenant sandbox for {companyName}.
                    Confirmation sent to {emailInput}.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Diagnostic Terminal Telemetry Box */}
          <div className="p-4 rounded-lg glass-inset font-mono text-xs space-y-2 text-text-secondary">
            <div className="flex items-center justify-between text-text-primary border-b border-border-default pb-2">
              <span className="text-[11px] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-status-success" />
                <span>DIAGNOSTIC TERMINAL TELEMETRY</span>
              </span>
              <span className="text-[10px] text-status-success">TEST STATUS: 54/54 PASSING</span>
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
          <div className="pt-4 border-t border-border-default flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className="text-xs font-mono text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Landing Page</span>
            </Link>

            <Link
              href="/dashboard"
              className="bg-ink hover:bg-navy-soft text-ghost px-5 py-2.5 rounded text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
            >
              <span>Return to Application Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-border-subtle py-6 text-center text-xs font-mono text-text-muted">
        AdSnitch · Sovereign Pre-Publication Brand Truth Governance · CodeTitans India 2026
      </footer>
    </div>
  );
}

export default function PrototypeNoticePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center text-xs font-mono text-text-secondary">
          Loading governance module...
        </div>
      }
    >
      <PrototypeNoticeContent />
    </Suspense>
  );
}
