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
      accent: "gold",
    },
    {
      name: "Laksh K.",
      role: "reviewer",
      roleLabel: "Reviewer / Legal",
      email: "laksh@uideas.digital",
      org: "Apex Nutrition Legal Ops",
      accent: "turquoise",
    },
    {
      name: "Riddhi S.",
      role: "creator",
      roleLabel: "Creator / Copywriter",
      email: "riddhi@uideas.digital",
      org: "Zenith Creative Studio",
      accent: "slate",
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
          userId:
            preset.role === "admin"
              ? "00000000-0000-4000-a000-000000000010"
              : preset.role === "reviewer"
              ? "00000000-0000-4000-a000-000000000012"
              : "00000000-0000-4000-a000-000000000011",
        })
      );
    } catch {}

    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 450);
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
      router.push("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#080C16] text-[#F8FAFC] flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Precision Swiss Header */}
      <nav className="border-b border-[#1E2B4A] bg-[#0D1527]/90 px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#111C35] border border-[#2E416E] flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-4 h-4 text-[#00F2FE]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-white font-sans">
              Inkloom AI
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E5A93C]/15 text-[#FBBF24] border border-[#E5A93C]/30">
              TENANT PROVISIONING
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-xs font-mono">
          <Link
            href="/auth/login"
            className="text-slate-300 hover:text-[#00F2FE] transition-colors"
          >
            Existing Workspace Sign In &rarr;
          </Link>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 relative">
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #00F2FE 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="w-full max-w-lg space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#111C35] border border-[#1E2B4A] text-[10px] font-mono text-[#00F2FE]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] animate-pulse" />
              <span>ISOLATED TENANT RLS ALLOCATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Create Governed Brand Workspace
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Deploy an isolated compliance repository with automated clinical claim grounding.
            </p>
          </div>

          {/* Milled Skeuomorphic Card */}
          <div className="rounded-xl bg-[#0D1527] border border-[#1E2B4A] shadow-2xl relative p-6 sm:p-7 space-y-5 overflow-hidden">
            {/* Corner screwheads */}
            <div className="absolute top-2.5 left-2.5 screwhead" />
            <div className="absolute top-2.5 right-2.5 screwhead" />
            <div className="absolute bottom-2.5 left-2.5 screwhead" />
            <div className="absolute bottom-2.5 right-2.5 screwhead" />

            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#E5A93C]/40 to-transparent" />

            {/* QUICK 1-CLICK DEMO ONBOARDING PRESETS */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FBBF24] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C]" />
                  Instant Demo Provisioning
                </span>
                <span className="text-[10px] font-mono text-slate-500">1-CLICK INSTANT RUN</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DEMO_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-2.5 rounded-lg bg-[#111C35] hover:bg-[#162547] border border-[#1E2B4A] hover:border-[#00F2FE] text-left transition-all cursor-pointer group"
                  >
                    <div className="text-[9px] font-mono font-bold text-[#FBBF24] uppercase">
                      {preset.role}
                    </div>
                    <div className="text-xs font-semibold text-white group-hover:text-[#00F2FE] truncate">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {preset.org}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-[#1E2B4A]" />
              <span className="absolute bg-[#0D1527] px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                OR REGISTER NEW ENTERPRISE TENANT
              </span>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-medium mb-1">
                    FULL NAME:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Daksh Agrawal"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full input-debossed rounded-md pl-9 pr-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-medium mb-1">
                    ORGANIZATION NAME:
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Global Health"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full input-debossed rounded-md pl-9 pr-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-medium mb-1">
                    WORK EMAIL:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full input-debossed rounded-md pl-9 pr-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 font-medium mb-1">
                    GOVERNANCE ROLE:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full input-debossed rounded-md px-3 py-2 text-xs font-mono"
                  >
                    <option value="admin">Admin (Full Policy & System Control)</option>
                    <option value="brand_manager">Brand Manager (Claim Repositories)</option>
                    <option value="reviewer">Reviewer (Legal & Regulatory Sign-off)</option>
                    <option value="creator">Creator (Draft Submission)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 font-medium mb-1">
                  MASTER SECURITY PASSWORD:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full input-debossed rounded-md pl-9 pr-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gold-button py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#080C16] border-t-transparent rounded-full animate-spin" />
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
            <div className="pt-2 border-t border-[#1E2B4A] space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block text-center">
                ENTERPRISE FEDERATED ONBOARDING
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/prototype-notice?feature=sso"
                  className="p-2 rounded bg-[#080C16] hover:bg-[#111C35] border border-[#1E2B4A] hover:border-[#00F2FE]/50 text-center transition-colors flex items-center justify-center gap-1.5 group cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#00F2FE]" />
                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-white">
                    Sign up with Okta SAML
                  </span>
                </Link>

                <Link
                  href="/prototype-notice?feature=sso"
                  className="p-2 rounded bg-[#080C16] hover:bg-[#111C35] border border-[#1E2B4A] hover:border-[#00F2FE]/50 text-center transition-colors flex items-center justify-center gap-1.5 group cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z"
                    />
                  </svg>
                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-white">
                    Sign up with Google
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400">
            Already established your organization?{" "}
            <Link
              href="/auth/login"
              className="text-[#00F2FE] hover:text-white font-medium transition-colors"
            >
              Sign In to Existing Workspace &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1E2B4A] py-3 bg-[#080C16] text-center text-xs font-mono text-slate-600">
        Inkloom AI Sovereign Brand Governance · FTC 16 CFR § 255 · FDA 21 CFR Part 11
      </footer>
    </div>
  );
}
