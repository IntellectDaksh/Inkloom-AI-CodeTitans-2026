"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  ExternalLink,
  Shield,
  Layers,
  Fingerprint,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("daksh@uideas.digital");
  const [password, setPassword] = useState("••••••••••••");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("admin");

  const DEMO_USERS = [
    {
      id: "admin",
      name: "Daksh Agrawal",
      role: "Admin / Compliance Architect",
      email: "daksh@uideas.digital",
      badge: "ADMIN",
      accent: "gold",
      desc: "Full organization authority & policy configuration",
    },
    {
      id: "reviewer",
      name: "Laksh K.",
      role: "Lead Regulatory Reviewer",
      email: "laksh@uideas.digital",
      badge: "REVIEWER",
      accent: "turquoise",
      desc: "Legal sign-off, claim dispute triage & audit approval",
    },
    {
      id: "creator",
      name: "Riddhi S.",
      role: "Senior Content Producer",
      email: "riddhi@uideas.digital",
      badge: "CREATOR",
      accent: "slate",
      desc: "Campaign draft submission & surgical diff preview",
    },
  ];

  const handle1ClickLogin = (user: typeof DEMO_USERS[0]) => {
    setSelectedRole(user.id);
    setEmail(user.email);
    try {
      localStorage.setItem(
        "inkloom:session",
        JSON.stringify({
          name: user.name,
          role: user.badge === "ADMIN" ? "Admin" : user.badge === "REVIEWER" ? "Reviewer" : "Creator",
          email: user.email,
          userId:
            user.id === "admin"
              ? "00000000-0000-4000-a000-000000000010"
              : user.id === "reviewer"
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

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      localStorage.setItem(
        "inkloom:session",
        JSON.stringify({
          name: "Daksh Agrawal",
          role: "Admin",
          email: email,
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
      {/* Top Swiss Architectural Header */}
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
              SOVEREIGN GOVERNANCE
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-slate-500 hidden sm:inline">SECURITY LEVEL: SOC 2 TYPE II</span>
          <Link
            href="/auth/register"
            className="text-slate-300 hover:text-[#00F2FE] transition-colors"
          >
            Create Organization &rarr;
          </Link>
        </div>
      </nav>

      {/* Main Form Center */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 relative">
        {/* Subtle grid watermark */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #00F2FE 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="w-full max-w-lg space-y-6 relative z-10">
          {/* Header Typography */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#111C35] border border-[#1E2B4A] text-[10px] font-mono text-[#00F2FE]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] animate-pulse" />
              <span>CRYPTOGRAPHIC AUTHENTICATION GATEWAY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Sign In to Sovereign Workspace
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Access deterministic claim verification queues and clinical evidence archives.
            </p>
          </div>

          {/* Milled Metallic Skeuomorphic Card */}
          <div className="rounded-xl bg-[#0D1527] border border-[#1E2B4A] shadow-2xl relative p-6 sm:p-7 space-y-6 overflow-hidden">
            {/* Skeuomorphic corner screwheads */}
            <div className="absolute top-2.5 left-2.5 screwhead" />
            <div className="absolute top-2.5 right-2.5 screwhead" />
            <div className="absolute bottom-2.5 left-2.5 screwhead" />
            <div className="absolute bottom-2.5 right-2.5 screwhead" />

            {/* Subtle top metallic hairline highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00F2FE]/40 to-transparent" />

            {/* 1-CLICK RAPID DEMO LOGINS */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FBBF24] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C]" />
                  Quick 1-Click Demo Profiles
                </span>
                <span className="text-[10px] font-mono text-slate-500">NO PASSWORD REQUIRED</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DEMO_USERS.map((user) => {
                  const isSelected = selectedRole === user.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handle1ClickLogin(user)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                        user.accent === "gold"
                          ? "bg-[#111C35] hover:bg-[#162547] border-[#E5A93C]/40 hover:border-[#E5A93C]"
                          : user.accent === "turquoise"
                          ? "bg-[#111C35] hover:bg-[#162547] border-[#00F2FE]/40 hover:border-[#00F2FE]"
                          : "bg-[#111C35] hover:bg-[#162547] border-[#1E2B4A] hover:border-slate-500"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                            user.accent === "gold"
                              ? "bg-[#E5A93C]/15 text-[#FBBF24] border-[#E5A93C]/30"
                              : user.accent === "turquoise"
                              ? "bg-[#00F2FE]/15 text-[#00F2FE] border-[#00F2FE]/30"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          {user.badge}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white leading-tight">
                          {user.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                          {user.email.split("@")[0]}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Debossed Separator with 'OR' */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-[#1E2B4A]" />
              <span className="absolute bg-[#0D1527] px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                OR SIGN IN WITH CREDENTIALS
              </span>
            </div>

            {/* Standard Credential Form with Debossed Inputs */}
            <form onSubmit={handleStandardLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 font-medium mb-1">
                  WORK EMAIL ADDRESS:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full input-debossed rounded-md pl-9 pr-3 py-2 text-xs font-mono"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-slate-300 font-medium">
                    PASSWORD / AUDIT TOKEN:
                  </label>
                  <Link
                    href="/prototype-notice?feature=password-recovery"
                    className="text-[10px] font-mono text-[#00F2FE] hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full input-debossed rounded-md pl-9 pr-3 py-2 text-xs font-mono"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full turquoise-button py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#080C16] border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Cryptographic Session...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Governance Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Enterprise Single Sign-On (SSO) Section */}
            <div className="pt-2 border-t border-[#1E2B4A] space-y-2.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block text-center">
                ENTERPRISE IDENTITY FEDERATION
              </span>

              <div className="grid grid-cols-3 gap-2">
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
                    Google
                  </span>
                </Link>

                <Link
                  href="/prototype-notice?feature=sso"
                  className="p-2 rounded bg-[#080C16] hover:bg-[#111C35] border border-[#1E2B4A] hover:border-[#00F2FE]/50 text-center transition-colors flex items-center justify-center gap-1.5 group cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#00F2FE]" />
                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-white">
                    Okta SAML
                  </span>
                </Link>

                <Link
                  href="/prototype-notice?feature=sso"
                  className="p-2 rounded bg-[#080C16] hover:bg-[#111C35] border border-[#1E2B4A] hover:border-[#00F2FE]/50 text-center transition-colors flex items-center justify-center gap-1.5 group cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-slate-300" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-white">
                    GitHub
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom link to Register */}
          <div className="text-center text-xs text-slate-400">
            Need to register a corporate brand?{" "}
            <Link
              href="/auth/register"
              className="text-[#00F2FE] hover:text-white font-medium transition-colors"
            >
              Deploy New Organization &rarr;
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
