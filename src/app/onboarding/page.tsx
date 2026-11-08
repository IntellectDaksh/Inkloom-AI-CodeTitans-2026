"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check, ArrowRight, ShieldCheck, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [brandName, setBrandName] = useState("Apex Nutrition");
  const [industry, setIndustry] = useState("Health, Fitness & Performance");
  const [tone, setTone] = useState("Confident, science-backed, and energetic");
  const [firstClaim, setFirstClaim] = useState(
    "Clinically tested for faster results with consistent daily use."
  );

  const handleFinish = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F8FAFC] flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      <div className="w-full max-w-xl space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-violet-900/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome to Inkloom AI Governance
          </h1>
          <p className="text-xs text-slate-400">
            Step {step} of 3 — Let&apos;s configure your first brand knowledge base.
          </p>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center justify-center gap-3">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step
                  ? "w-12 bg-violet-500"
                  : s < step
                  ? "w-8 bg-emerald-400"
                  : "w-8 bg-[#1F2338]"
              }`}
            />
          ))}
        </div>

        <div className="p-8 rounded-2xl bg-[#111322] border border-[#232742] shadow-2xl space-y-6 text-xs">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-white">
                1. Establish Your First Brand Workspace
              </h2>
              <p className="text-slate-400">
                Inkloom isolates tone rules, prohibited terms, and approved claims per brand.
              </p>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Industry / Category *
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button size="md" variant="primary" onClick={() => setStep(2)}>
                  Continue &rarr;
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-white">
                2. Define Brand Voice &amp; Writing Style
              </h2>
              <p className="text-slate-400">
                The AI governance engine uses this core description to flag tone drift and hyperbole.
              </p>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Brand Voice Summary *
                </label>
                <textarea
                  rows={4}
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg p-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <Button size="md" variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button size="md" variant="primary" onClick={() => setStep(3)}>
                  Continue &rarr;
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-white">
                3. Seed Your Approved Claims Library
              </h2>
              <p className="text-slate-400">
                Every marketing claim must be backed by evidence. Enter a factual statement your marketing team is authorized to use.
              </p>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Initial Approved Claim *
                </label>
                <input
                  type="text"
                  value={firstClaim}
                  onChange={(e) => setFirstClaim(e.target.value)}
                  className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/25 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Default evidence source: Clinical Trial CT-2024-B8 (Verified)</span>
              </div>

              <div className="pt-4 flex justify-between">
                <Button size="md" variant="ghost" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button size="md" variant="primary" onClick={handleFinish}>
                  Complete Setup &amp; Enter Dashboard &rarr;
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
