"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Check, ArrowRight, BookOpen, Layers, Terminal, Lock } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [brandName, setBrandName] = useState("Apex Nutrition");
  const [industry, setIndustry] = useState("Health, Fitness & Performance");
  const [tone, setTone] = useState("Confident, science-backed, and authoritative");
  const [firstClaim, setFirstClaim] = useState(
    "Supports post-workout protein synthesis when consumed within 45 minutes of resistance training."
  );

  const handleFinish = () => {
    try {
      localStorage.setItem(
        "inkloom:session",
        JSON.stringify({
          name: "Daksh Agrawal",
          role: "Admin",
          email: "daksh@uideas.digital",
          userId: "00000000-0000-4000-a000-000000000010",
        })
      );
    } catch {}
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-between font-sans selection:bg-white/20 selection:text-white">
      {/* Precision Chrome Nav */}
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
              TENANT PROVISIONING
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4 text-xs font-mono text-[#A0A0A0]">
          <span>STEP {step} OF 3</span>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-xl space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-white/10 text-[10px] font-mono text-[#A0A0A0]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>POSTGRESQL RLS ISOLATED TENANT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Initialize Brand Knowledge Repository
            </h1>
            <p className="text-xs text-[#A0A0A0] max-w-md mx-auto">
              Configure your first brand partition with isolated voice guidelines and approved claim contracts.
            </p>
          </div>

          {/* Step Progress Indicators */}
          <div className="flex items-center justify-center gap-2.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 rounded-full transition-all ${
                  s === step
                    ? "w-12 bg-white"
                    : s < step
                    ? "w-8 bg-emerald-400"
                    : "w-8 bg-white/10"
                }`}
              />
            ))}
          </div>

          {/* Milled Setup Card */}
          <div className="p-6 sm:p-8 rounded-xl bg-[#141414] border border-white/10 shadow-2xl space-y-6 text-xs">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-white">
                    1. Establish Brand Workspace Partition
                  </h2>
                  <p className="text-slate-400 text-xs">
                    AdSnitch strictly walls off brand voice, prohibited terms, and approved claims per brand partition.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[#A0A0A0] font-mono font-medium mb-1.5">
                      BRAND WORKSPACE NAME *
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full bg-[#080808] border border-white/10 focus:border-white focus:outline-none rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[#A0A0A0] font-mono font-medium mb-1.5">
                      REGULATORY SECTOR / CATEGORY *
                    </label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-[#080808] border border-white/10 focus:border-white focus:outline-none rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="bg-white hover:bg-neutral-200 text-black px-4 py-2 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Continue to Voice Rules</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-white">
                    2. Define Brand Voice &amp; Tone Guardrails
                  </h2>
                  <p className="text-slate-400 text-xs">
                    The governance compiler evaluates submitted promotional copy against this core voice charter.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[#A0A0A0] font-mono font-medium mb-1.5">
                      BRAND VOICE SUMMARY &amp; TONE SPECIFICATION *
                    </label>
                    <textarea
                      rows={4}
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full bg-[#080808] border border-white/10 focus:border-white focus:outline-none rounded-lg p-3 text-white font-mono leading-relaxed resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="text-[#A0A0A0] hover:text-white px-3 py-1.5 text-xs font-mono"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="bg-white hover:bg-neutral-200 text-black px-4 py-2 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Continue to Claims Seed</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-white">
                    3. Seed Approved Claims &amp; Clinical Assay Contract
                  </h2>
                  <p className="text-slate-400 text-xs">
                    Every marketing statement must be anchored to clinical trials, SEC disclosures, or laboratory assays.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[#A0A0A0] font-mono font-medium mb-1.5">
                      APPROVED CLAIM STATEMENT *
                    </label>
                    <input
                      type="text"
                      value={firstClaim}
                      onChange={(e) => setFirstClaim(e.target.value)}
                      className="w-full bg-[#080808] border border-white/10 focus:border-white focus:outline-none rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-[#080808] border border-white/10 text-emerald-400 text-[11px] font-mono flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Default Evidence: Clinical Study Report APX-2024-C3 (ISO 22196 Annex C)</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="text-[#A0A0A0] hover:text-white px-3 py-1.5 text-xs font-mono"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={handleFinish}
                    className="bg-white hover:bg-neutral-200 text-black px-5 py-2.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Complete Setup &amp; Enter Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
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
