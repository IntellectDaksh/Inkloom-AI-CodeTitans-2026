"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
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
  TrendingUp,
  Award,
} from "lucide-react";
import { Button } from "../components/ui/Button";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"marketing" | "agencies" | "compliance">("marketing");

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F8FAFC] selection:bg-violet-600/30 selection:text-violet-200">
      {/* Top Navigation */}
      <nav className="border-b border-[#1A1D2E]/80 bg-[#090A0F]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-900/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
              Inkloom <span className="text-violet-400 font-semibold text-xs px-2 py-0.5 rounded bg-violet-500/15 border border-violet-500/30">AI</span>
            </span>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              Product
            </a>
            <a href="#capabilities" className="hover:text-white transition-colors">
              Solutions
            </a>
            <a href="#evidence-engine" className="hover:text-white transition-colors">
              Resources
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Security
            </a>
          </div>

          {/* Right CTA */}
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link href="/dashboard">
              <Button
                size="sm"
                variant="primary"
                className="bg-violet-600 hover:bg-violet-500 text-white font-medium px-4 py-2 rounded-lg shadow-lg shadow-violet-900/30"
              >
                Get Started &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Glow behind hero */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-violet-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Proposition */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-xs font-semibold text-violet-300">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Next-Gen Content Governance Layer</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                Keep Your Brand <br />
                <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
                  On Brand.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl">
                An intelligent brand-governance platform that reviews content, checks claims, and ensures every piece of communication stays accurate, compliant, and on brand.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="primary"
                    className="font-semibold px-6 py-3 rounded-lg shadow-xl shadow-violet-900/40 text-sm flex items-center gap-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="font-medium px-6 py-3 rounded-lg bg-[#141624] hover:bg-[#1A1D30] border border-[#232742] text-slate-200 text-sm"
                  >
                    See Live Demo
                  </Button>
                </Link>
              </div>

              {/* Sub-tagline & Core Value Pillars */}
              <div className="pt-8 border-t border-[#1C2036] space-y-3">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                  Built for marketing teams, agencies and growing brands
                </p>
                <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-violet-400" />
                    <span>Evidence-Linked Claims</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-violet-400" />
                    <span>Deterministic Brand Rules</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-violet-400" />
                    <span>Human Approval Gate</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-violet-400" />
                    <span>Audit Trail History</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Preview (Faithful to Reference Mockup) */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg rounded-2xl bg-gradient-to-b from-[#181B2E] to-[#101220] p-1.5 shadow-2xl border border-[#272B45] glow-primary">
                {/* Draft Card preview */}
                <div className="rounded-xl bg-[#0D0F1B] p-6 space-y-5 border border-[#1E2238]">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#1A1E33]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
                      <span className="text-xs font-semibold text-slate-300">Content Inspection</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#1A1D30] text-slate-300 border border-[#292F4D]">
                      Reel Script v1
                    </span>
                  </div>

                  {/* Highlighted text preview */}
                  <div className="p-4 rounded-lg bg-[#121422] border border-[#21253B] text-sm text-slate-200 leading-relaxed font-mono">
                    <span>Our new protein blend gives you </span>
                    <span className="bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/40 font-semibold cursor-help" title="Unsupported Claim: 2x faster results">
                      2x faster results
                    </span>
                    <span> and helps build muscle </span>
                    <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40 font-semibold cursor-help" title="Time-bound Claim: In just 14 days">
                      in just 14 days
                    </span>
                    <span>. It&apos;s the most advanced formula for serious results.</span>
                  </div>

                  {/* Brand Check Floating Inspector */}
                  <div className="rounded-xl bg-[#141628] border border-[#252A46] p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                        Brand Check Results
                      </span>
                      <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        2 Issues Detected
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded bg-[#0E101D] border border-[#1E2238]">
                        <span className="text-slate-400">Tone & Voice</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-[#0E101D] border border-[#1E2238]">
                        <span className="text-slate-400">Brand Guidelines</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-rose-950/20 border border-rose-500/30">
                        <span className="text-rose-300 font-medium">Claims & Facts</span>
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-amber-950/20 border border-amber-500/30">
                        <span className="text-amber-300 font-medium">Compliance</span>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                    </div>

                    {/* Suggested Fix Box */}
                    <div className="mt-3 p-3 rounded-lg bg-emerald-950/25 border border-emerald-500/30 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                          Suggested Approved Fix
                        </div>
                        <div className="text-xs text-slate-200 mt-1 font-medium">
                          &quot;Clinically tested for faster results with consistent daily use.&quot;
                        </div>
                        <div className="text-[10px] text-emerald-400/80 mt-1">
                          Source: Clinical Trial CT-2024-B8 (Approved)
                        </div>
                      </div>
                      <span className="text-[11px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40 shrink-0">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Inkloom Works */}
      <section id="how-it-works" className="py-24 border-t border-[#181B2C] bg-[#0A0B13]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-violet-400">
              The Architecture of Truth
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              How Inkloom AI Governs Content
            </h2>
            <p className="text-sm text-slate-400">
              A version-controlled brand knowledge layer that sits between your content writers and your publication channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Evidence Ingestion",
                desc: "Upload brand guidelines, clinical trials, legal opinions, and approved claims with explicit validity scopes.",
                icon: Database,
              },
              {
                step: "02",
                title: "Content Segmentation",
                desc: "Every submitted draft is segmented into factual statements, numerical claims, and brand terminology.",
                icon: Layers,
              },
              {
                step: "03",
                title: "Deterministic & AI Audit",
                desc: "Deterministic rules catch prohibited words while Gemini 2.5 Flash validates claim evidence with zero hallucination.",
                icon: Sparkles,
              },
              {
                step: "04",
                title: "Human Approval Gate",
                desc: "No auto-publishing. High-risk issues must be reviewed and approved by authorized reviewers with full audit trails.",
                icon: FileCheck2,
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="p-6 rounded-xl bg-[#111322] border border-[#1E233A] hover:border-violet-500/40 transition-colors space-y-4 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-violet-500/40 group-hover:text-violet-400 transition-colors">
                      {s.step}
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-[#17192C] border border-[#242A46] flex items-center justify-center text-violet-300">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-slate-100">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section id="capabilities" className="py-24 border-t border-[#181B2C]">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-violet-400">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Not a Grammar Checker. <br />
              <span className="text-slate-400">An Evidence-Grounded Governance Engine.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-[#111322] border border-[#1E233A] space-y-4">
              <div className="w-10 h-10 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100">Approved Claims Library</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track every marketing claim with its scientific study, legal patent, allowed audience context, responsible owner, and automatic expiration warnings.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#111322] border border-[#1E233A] space-y-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100">Multi-Brand Workspaces</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Manage separate brand guidelines, distinct tones, and custom terminology rules under a single agency or enterprise organisation with strict tenant isolation.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#111322] border border-[#1E233A] space-y-4">
              <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100">Zero-Hallucination Retrieval</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If a statement is not verified in your approved database, Inkloom explicitly marks it as unverified. It will never fabricate supporting evidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Responsible AI */}
      <section id="security" className="py-24 border-t border-[#181B2C] bg-[#0A0B13]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-2xl bg-[#111322] border border-[#1E233A] p-8 md:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enterprise Security & Responsible AI Commitment</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Your Brand IP and Guidelines Remain 100% Private.
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Tenant-Scoped Retrieval:</strong> No cross-tenant data leaks. Organization data is isolated at database level.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Zero Model Training:</strong> Submissions and claims are never used to train public foundational AI models.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Row Level Security:</strong> PostgreSQL RLS policies enforce multi-tenant isolation on every query.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Full Auditability:</strong> Every suggested change, accepted fix, and reviewer approval is permanently logged.</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 text-center lg:text-right">
                <Link href="/dashboard">
                  <Button size="lg" variant="primary" className="px-6 py-3 font-semibold text-sm">
                    Enter Workspace &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#181B2C] py-12 bg-[#08090E] text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-300">Inkloom AI</span>
            <span>&copy; 2026 All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
              App
            </Link>
            <Link href="/knowledge-base" className="hover:text-slate-300 transition-colors">
              Knowledge Base
            </Link>
            <Link href="/submissions" className="hover:text-slate-300 transition-colors">
              Submissions
            </Link>
            <Link href="/approvals" className="hover:text-slate-300 transition-colors">
              Approvals
            </Link>
            <Link href="/analytics" className="hover:text-slate-300 transition-colors">
              Analytics
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
