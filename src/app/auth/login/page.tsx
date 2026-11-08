"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("daksh@uideas.digital");
  const [password, setPassword] = useState("••••••••••••");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F8FAFC] flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Brand Header */}
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
            Sign in to your brand workspace
          </h2>
          <p className="text-xs text-slate-400">
            Enter your credentials to access brand governance queues.
          </p>
        </div>

        {/* Login Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111322] border border-[#232742] shadow-xl space-y-6">
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-medium">Password</label>
                <a href="#" className="text-violet-400 hover:text-violet-300 text-[11px]">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
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
              Sign In to Workspace &rarr;
            </Button>
          </form>

          {/* Quick Demo Login Preset */}
          <div className="pt-4 border-t border-[#1C2033] text-center space-y-2">
            <span className="text-[11px] text-slate-400">Pre-authenticated as:</span>
            <div className="p-2.5 rounded-lg bg-[#0C0E1A] border border-[#1E2238] flex items-center justify-between text-xs text-left">
              <div>
                <div className="font-semibold text-slate-200">Daksh Agrawal</div>
                <div className="text-[10px] text-slate-400">daksh@uideas.digital · Admin</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold border border-violet-500/30">
                Default
              </span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Need an account?{" "}
          <Link href="/auth/register" className="text-violet-400 hover:text-violet-300 font-medium">
            Create an organisation
          </Link>
        </div>
      </div>
    </div>
  );
}
