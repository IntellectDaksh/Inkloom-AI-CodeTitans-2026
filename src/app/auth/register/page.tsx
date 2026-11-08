"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, User, Mail, Lock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/onboarding");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F8FAFC] flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-900/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white flex items-center gap-1.5">
              Inkloom <span className="text-violet-400 font-semibold text-xs px-2 py-0.5 rounded bg-violet-500/15 border border-violet-500/30">AI</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-white pt-2">
            Create your Inkloom account
          </h2>
          <p className="text-xs text-slate-400">
            Set up your organization and central brand governance workspace.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-[#111322] border border-[#232742] shadow-xl space-y-5">
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Daksh Agrawal"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Organisation Name</label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Uideas Digital Workspace"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Your Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="admin">Admin (Full Control)</option>
                <option value="brand_manager">Brand Manager (Guidelines & Claims)</option>
                <option value="reviewer">Reviewer (Approvals & Audits)</option>
                <option value="creator">Creator (Submit Drafts)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              className="w-full py-2.5 text-sm font-semibold"
              loading={loading}
            >
              Get Started with Inkloom &rarr;
            </Button>
          </form>
        </div>

        <div className="text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
