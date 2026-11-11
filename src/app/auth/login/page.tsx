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
  UserCheck,
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
      role: "Admin & Architect",
      email: "daksh@uideas.digital",
      badge: "ADMIN",
      desc: "Full organization policy & system configuration",
      userId: "00000000-0000-4000-a000-000000000010",
    },
    {
      id: "reviewer",
      name: "Laksh Khatri",
      role: "Lead Regulatory Reviewer",
      email: "laksh@uideas.digital",
      badge: "REVIEWER",
      desc: "Legal sign-off, claim dispute triage & override gate",
      userId: "00000000-0000-4000-a000-000000000012",
    },
    {
      id: "creator",
      name: "Riddhi Shah",
      role: "Senior Content Producer",
      email: "riddhi@uideas.digital",
      badge: "CREATOR",
      desc: "Campaign draft submission & surgical diff preview",
      userId: "00000000-0000-4000-a000-000000000011",
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
          userId: user.userId,
        })
      );
    } catch {}

    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
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
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-between font-sans selection:bg-white/20 selection:text-white">
      {/* Top Swiss Architectural Header */}
      <nav className="border-b border-white/10 bg-[#080808]/90 px-6 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-bold text-sm tracking-tighter">
            IK
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base tracking-tight text-white">
              Inkloom AI
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#A0A0A0] border border-white/10">
              AUTHENTICATION
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-[#737373] hidden sm:inline">SECURITY: SOC 2 TYPE II</span>
          <Link
            href="/auth/register"
            className="text-[#A0A0A0] hover:text-white transition-colors"
          >
            Create Organization &rarr;
          </Link>
        </div>
      </nav>

      {/* Main Form Center */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-lg space-y-6 relative z-10">
          {/* Header Typography */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-white/10 text-[10px] font-mono text-[#A0A0A0]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>DETERMINISTIC COMPLIANCE WORKSPACE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Sign In to Sovereign Workspace
            </h1>
            <p className="text-xs text-[#A0A0A0] max-w-sm mx-auto">
              Access real-time claims audit queues and clinical trial evidence registers.
            </p>
          </div>

          {/* Milled Monochromatic Card */}
          <div className="rounded-xl bg-[#141414] border border-white/10 shadow-2xl p-6 sm:p-7 space-y-6">
            {/* 1-CLICK RAPID DEMO LOGINS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>1-Click Hackathon Persona Logins</span>
                </span>
                <span className="text-[10px] font-mono text-[#A0A0A0]">NO PASSWORD</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {DEMO_USERS.map((user) => {
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handle1ClickLogin(user)}
                      className="p-3 rounded-lg border border-white/10 bg-[#080808] hover:bg-neutral-800 hover:border-white text-left transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/10">
                          {user.badge}
                        </span>
                        <ArrowRight className="w-3 h-3 text-[#A0A0A0] group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white leading-tight">
                          {user.name}
                        </div>
                        <div className="text-[10px] font-mono text-[#A0A0A0] truncate mt-0.5">
                          {user.role}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Separator */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-white/10" />
              <span className="absolute bg-[#141414] px-3 text-[10px] font-mono text-[#A0A0A0] uppercase tracking-widest">
                OR SIGN IN WITH CREDENTIALS
              </span>
            </div>

            {/* Standard Credential Form */}
            <form onSubmit={handleStandardLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-[#A0A0A0] font-medium mb-1">
                  WORK EMAIL ADDRESS:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#080808] border border-white/10 focus:border-white focus:outline-none rounded-md pl-9 pr-3 py-2 text-xs font-mono text-white"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-[#A0A0A0] font-medium">
                    PASSWORD:
                  </label>
                  <Link
                    href="/prototype-notice?feature=password-recovery"
                    className="text-[10px] font-mono text-white hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#080808] border border-white/10 focus:border-white focus:outline-none rounded-md pl-9 pr-3 py-2 text-xs font-mono text-white"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white hover:bg-neutral-200 text-black py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Session...</span>
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
            <div className="pt-2 border-t border-white/10 space-y-2.5">
              <span className="text-[10px] font-mono text-[#A0A0A0] uppercase tracking-wider block text-center">
                ENTERPRISE IDENTITY FEDERATION
              </span>

              <div className="grid grid-cols-3 gap-2">
                <Link
                  href="/prototype-notice?feature=sso"
                  className="p-2 rounded bg-[#080808] hover:bg-neutral-800 border border-white/10 hover:border-white text-center transition-colors flex items-center justify-center gap-1.5 text-xs text-[#A0A0A0] hover:text-white"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Google</span>
                </Link>

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
                  <span>GitHub</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-[#A0A0A0]">
            Need to register a corporate brand?{" "}
            <Link
              href="/auth/register"
              className="text-white hover:underline font-medium"
            >
              Deploy New Organization &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-4 text-center text-xs font-mono text-[#737373]">
        Inkloom AI Sovereign Governance · FTC 16 CFR § 255 · FDA 21 CFR Part 11
      </footer>
    </div>
  );
}
