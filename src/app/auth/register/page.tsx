"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  User,
  Mail,
  Lock,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Scale,
  Layers,
  UserCheck,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);

  const DEMO_PRESETS = [
    {
      name: "Daksh Agrawal",
      role: "admin",
      roleLabel: "Admin / Architect",
      email: "daksh@uideas.digital",
      org: "Uideas Digital Workspace",
      userId: "00000000-0000-4000-a000-000000000010",
    },
    {
      name: "Laksh Khatri",
      role: "reviewer",
      roleLabel: "Reviewer / Legal",
      email: "laksh@uideas.digital",
      org: "Apex Nutrition Legal Ops",
      userId: "00000000-0000-4000-a000-000000000012",
    },
    {
      name: "Riddhi Shah",
      role: "creator",
      roleLabel: "Creator / Copywriter",
      email: "riddhi@uideas.digital",
      org: "Zenith Creative Studio",
      userId: "00000000-0000-4000-a000-000000000011",
    },
  ];

  const handleApplyPreset = (preset: typeof DEMO_PRESETS[0]) => {
    try {
      localStorage.setItem(
        "inkloom:session",
        JSON.stringify({
          name: preset.name,
          role: preset.role === "admin" ? "Admin" : preset.role === "reviewer" ? "Reviewer" : "Creator",
          email: preset.email,
          userId: preset.userId,
        })
      );
    } catch {}

    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      localStorage.setItem(
        "inkloom:session",
        JSON.stringify({
          name: fullName || "Daksh Agrawal",
          role: role === "admin" ? "Admin" : role === "reviewer" ? "Reviewer" : "Creator",
          email: email || "daksh@uideas.digital",
          userId: "00000000-0000-4000-a000-000000000010",
        })
      );
    } catch {}

    setTimeout(() => {
      router.push("/onboarding");
    }, 450);
  };

  return (
    <div className="relative isolate min-h-screen bg-canvas text-text-primary flex flex-col justify-between font-sans selection:bg-ice selection:text-text-primary">
      <div className="atmosphere -z-10" aria-hidden><i /><i /><i /></div>
      {/* Precision Swiss Header */}
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
              TENANT SETUP
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-xs font-mono">
          <Link
            href="/auth/login"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            Existing Workspace Sign In &rarr;
          </Link>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-lg space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-panel border border-border-default text-[10px] font-mono text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
              <span>POSTGRESQL RLS TENANT ALLOCATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Create Governed Brand Workspace
            </h1>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Deploy an isolated compliance repository with automated clinical claim grounding.
            </p>
          </div>

          {/* Milled Card */}
          <div className="glass-strong rounded-2xl p-6 sm:p-7 space-y-5">
            <svg viewBox="0 0 240 64" className="w-full h-14 text-blue" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M0 48 C40 40 70 54 110 44 S190 30 240 38" className="text-border-strong" stroke="currentColor" />
              <path d="M0 56 C50 50 80 60 120 52 S200 42 240 48" className="text-border-default" stroke="currentColor" />
              <path d="M120 8 l18 6 v12 c0 11 -8 19 -18 23 c-10 -4 -18 -12 -18 -23 v-12 z" className="text-ink" stroke="currentColor" />
              <path d="M112 28 l6 6 l11 -12" />
              <circle cx="56" cy="22" r="3" /><circle cx="186" cy="18" r="2.5" />
              <path d="M59 22 H96 M140 20 H183" strokeDasharray="2 4" className="text-text-dim" stroke="currentColor" />
            </svg>
            {/* Quick 1-Click Demo Provisioning Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-status-success" />
                  <span>Instant Demo Provisioning (1-Click Run)</span>
                </span>
                <span className="text-[10px] font-mono text-text-secondary">BYPASS SETUP</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {DEMO_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-3 rounded-lg bg-panel hover:bg-panel-hover border border-border-default hover:border-border-strong text-left transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="text-[9px] font-mono font-bold text-text-primary uppercase mb-1">
                      {preset.role}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-text-primary group-hover:underline truncate">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-text-secondary font-mono truncate">
                        {preset.org}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-border-default" />
              <span className="absolute bg-panel px-3 text-[10px] font-mono text-text-secondary uppercase tracking-widest">
                OR REGISTER NEW ENTERPRISE TENANT
              </span>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-text-secondary font-medium mb-1">
                    FULL NAME:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Daksh Agrawal"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full glass-inset border border-border-default focus:border-blue focus:ring-2 focus:ring-blue/25 focus:outline-none rounded-md pl-9 pr-3 py-2 text-xs font-mono text-text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-text-secondary font-medium mb-1">
                    ORGANIZATION NAME:
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Global Health"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full glass-inset border border-border-default focus:border-blue focus:ring-2 focus:ring-blue/25 focus:outline-none rounded-md pl-9 pr-3 py-2 text-xs font-mono text-text-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-text-secondary font-medium mb-1">
                    WORK EMAIL:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full glass-inset border border-border-default focus:border-blue focus:ring-2 focus:ring-blue/25 focus:outline-none rounded-md pl-9 pr-3 py-2 text-xs font-mono text-text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-text-secondary font-medium mb-1">
                    GOVERNANCE ROLE:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full glass-inset border border-border-default focus:border-blue focus:ring-2 focus:ring-blue/25 focus:outline-none rounded-md px-3 py-2 text-xs font-mono text-text-primary"
                  >
                    <option value="admin">Admin (Full Control)</option>
                    <option value="brand_manager">Brand Manager (Claims &amp; Guidelines)</option>
                    <option value="reviewer">Reviewer (Legal Sign-Off)</option>
                    <option value="creator">Creator (Draft Submissions)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-text-secondary font-medium mb-1">
                  PASSWORD:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-inset border border-border-default focus:border-blue focus:ring-2 focus:ring-blue/25 focus:outline-none rounded-md pl-9 pr-3 py-2 text-xs font-mono text-text-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ink hover:bg-navy-soft text-ghost py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Allocating PostgreSQL Schema...</span>
                  </>
                ) : (
                  <>
                    <span>Deploy Governance Workspace &rarr;</span>
                  </>
                )}
              </button>
            </form>

            {/* SSO / Identity registration options */}
            <div className="pt-2 border-t border-border-default space-y-2">
              <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider block text-center">
                ENTERPRISE FEDERATED ONBOARDING
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/prototype-notice?feature=sso"
                  className="p-2 rounded bg-panel hover:bg-panel-hover border border-border-default hover:border-border-strong text-center transition-colors flex items-center justify-center gap-1.5 text-xs text-text-secondary hover:text-text-primary"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Okta SAML</span>
                </Link>

                <Link
                  href="/prototype-notice?feature=sso"
                  className="p-2 rounded bg-panel hover:bg-panel-hover border border-border-default hover:border-border-strong text-center transition-colors flex items-center justify-center gap-1.5 text-xs text-text-secondary hover:text-text-primary"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Google Workspace</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-text-secondary">
            Already established your organization?{" "}
            <Link
              href="/auth/login"
              className="text-text-primary hover:underline font-medium"
            >
              Sign In to Existing Workspace &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-4 text-center text-xs font-mono text-text-muted">
        AdSnitch Sovereign Governance · FTC 16 CFR § 255 · FDA 21 CFR Part 11
      </footer>
    </div>
  );
}
