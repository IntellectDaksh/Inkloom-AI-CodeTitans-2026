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
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-between font-sans selection:bg-white/20 selection:text-white">
      {/* Precision Swiss Header */}
      <nav className="border-b border-white/10 bg-[#080808]/90 px-6 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-bold text-sm tracking-tighter">
            AS
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base tracking-tight text-white">
              AdSnitch
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#A0A0A0] border border-white/10">
              TENANT SETUP
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-xs font-mono">
          <Link
            href="/auth/login"
            className="text-[#A0A0A0] hover:text-white transition-colors"
          >
            Existing Workspace Sign In &rarr;
          </Link>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-lg space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-white/10 text-[10px] font-mono text-[#A0A0A0]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>POSTGRESQL RLS TENANT ALLOCATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Create Governed Brand Workspace
            </h1>
            <p className="text-xs text-[#A0A0A0] max-w-sm mx-auto">
              Deploy an isolated compliance repository with automated clinical claim grounding.
            </p>
          </div>

          {/* Milled Card */}
          <div className="rounded-xl bg-[#141414] border border-white/10 shadow-2xl p-6 sm:p-7 space-y-5">
            {/* Quick 1-Click Demo Provisioning Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Instant Demo Provisioning (1-Click Run)</span>
                </span>
                <span className="text-[10px] font-mono text-[#A0A0A0]">BYPASS SETUP</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {DEMO_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-3 rounded-lg bg-[#080808] hover:bg-neutral-800 border border-white/10 hover:border-white text-left transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="text-[9px] font-mono font-bold text-white uppercase mb-1">
                      {preset.role}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:underline truncate">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-[#A0A0A0] font-mono truncate">
                        {preset.org}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-white/10" />
              <span className="absolute bg-[#141414] px-3 text-[10px] font-mono text-[#A0A0A0] uppercase tracking-widest">
                OR REGISTER NEW ENTERPRISE TENANT
              </span>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#A0A0A0] font-medium mb-1">
                    FULL NAME:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Daksh Agrawal"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#080808] border border-white/10 focus:border-white focus:outline-none rounded-md pl-9 pr-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#A0A0A0] font-medium mb-1">
                    ORGANIZATION NAME:
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Global Health"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full bg-[#080808] border border-white/10 focus:border-white focus:outline-none rounded-md pl-9 pr-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#A0A0A0] font-medium mb-1">
                    WORK EMAIL:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#080808] border border-white/10 focus:border-white focus:outline-none rounded-md pl-9 pr-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#A0A0A0] font-medium mb-1">
                    GOVERNANCE ROLE:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#080808] border border-white/10 focus:border-white focus:outline-none rounded-md px-3 py-2 text-xs font-mono text-white"
                  >
                    <option value="admin">Admin (Full Control)</option>
                    <option value="brand_manager">Brand Manager (Claims &amp; Guidelines)</option>
                    <option value="reviewer">Reviewer (Legal Sign-Off)</option>
                    <option value="creator">Creator (Draft Submissions)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#A0A0A0] font-medium mb-1">
                  PASSWORD:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#080808] border border-white/10 focus:border-white focus:outline-none rounded-md pl-9 pr-3 py-2 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white hover:bg-neutral-200 text-black py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm mt-2"
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
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-[#A0A0A0] uppercase tracking-wider block text-center">
                ENTERPRISE FEDERATED ONBOARDING
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/prototype-notice?feature=sso"
                  className="p-2 rounded bg-[#080808] hover:bg-neutral-800 border border-white/10 hover:border-white text-center transition-colors flex items-center justify-center gap-1.5 text-xs text-[#A0A0A0] hover:text-white"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Okta SAML</span>
                </Link>

                <Link
                  href="/prototype-notice?feature=sso"
                  className="p-2 rounded bg-[#080808] hover:bg-neutral-800 border border-white/10 hover:border-white text-center transition-colors flex items-center justify-center gap-1.5 text-xs text-[#A0A0A0] hover:text-white"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Google Workspace</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-[#A0A0A0]">
            Already established your organization?{" "}
            <Link
              href="/auth/login"
              className="text-white hover:underline font-medium"
            >
              Sign In to Existing Workspace &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-4 text-center text-xs font-mono text-[#737373]">
        AdSnitch Sovereign Governance · FTC 16 CFR § 255 · FDA 21 CFR Part 11
      </footer>
    </div>
  );
}
