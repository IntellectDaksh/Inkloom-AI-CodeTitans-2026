"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check, ArrowRight, ShieldCheck, BookOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [brandName, setBrandName] = useState("Apex Nutrition");
  const [industry, setIndustry] = useState("Health, Fitness & Performance");
  const [tone, setTone] = useState("Confident, science-backed, and energetic");
  const [firstClaim, setFirstClaim] = useState(
    "Clinically tested for faster muscle recovery with consistent daily use within 45 minutes of training."
  );

  const handleFinish = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#080C16] text-[#F8FAFC] flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Background radial gradient */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #00F2FE 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="w-full max-w-xl space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#0D1527] border border-[#2E416E] mx-auto flex items-center justify-center text-[#00F2FE] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Deploy Governed Brand Workspace
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            STEP {step} OF 3 · TENANT ISOLATION INITIALIZATION
          </p>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center justify-center gap-3">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step
                  ? "w-12 bg-[#00F2FE] shadow-[0_0_8px_#00F2FE]"
                  : s < step
                  ? "w-8 bg-emerald-400"
                  : "w-8 bg-[#1E2B4A]"
              }`}
            />
          ))}
        </div>

        <div className="tactile-card rounded-xl p-8 space-y-6 text-xs font-mono shadow-2xl">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
                  1. Establish Brand Workspace &amp; RLS Scope
                </h2>
                <p className="text-slate-400 text-xs font-sans mt-0.5">
                  Inkloom enforces strict multi-tenant Row-Level Security isolating voice rules and clinical claims per brand.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5 uppercase text-[11px]">
                  BRAND WORKSPACE NAME *
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg px-3 py-2 text-slate-200 font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5 uppercase text-[11px]">
                  INDUSTRY / VERTICAL *
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg px-3 py-2 text-slate-200 font-sans"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button size="sm" variant="gold" onClick={() => setStep(2)}>
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
                  2. Define Brand Voice &amp; Writing Style
                </h2>
                <p className="text-slate-400 text-xs font-sans mt-0.5">
                  The AI pre-flight engine uses this description to calculate tone drift and prevent hyperbolic superlative leakage.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5 uppercase text-[11px]">
                  BRAND VOICE SUMMARY *
                </label>
                <textarea
                  rows={4}
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg p-3 text-slate-200 font-sans resize-none leading-relaxed"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <Button size="sm" variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button size="sm" variant="gold" onClick={() => setStep(3)}>
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
                  3. Seed Grounded Claims Library
                </h2>
                <p className="text-slate-400 text-xs font-sans mt-0.5">
                  Zero hallucination policy: every marketing claim must be backed by an active evidentiary record.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5 uppercase text-[11px]">
                  INITIAL AUTHORIZED CLAIM STATEMENT *
                </label>
                <input
                  type="text"
                  value={firstClaim}
                  onChange={(e) => setFirstClaim(e.target.value)}
                  className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg px-3 py-2 text-slate-200 font-sans"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/25 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Default evidence record: Clinical Trial Assay CT-2024-B8 (Verified)</span>
              </div>

              <div className="pt-4 flex justify-between">
                <Button size="sm" variant="secondary" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button size="sm" variant="turquoise" onClick={handleFinish}>
                  <span>Complete Setup &amp; Enter Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
