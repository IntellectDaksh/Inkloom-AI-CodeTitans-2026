"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { BRANDS, PERSONAS, ROLE_HELP, readPrefs, setPrefs, focusRing } from "@/components/guide/workspace";

const STEPS = ["What it does", "Your setup", "Ready"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [brand, setBrand] = useState<string>(BRANDS[0]);
  const [persona, setPersona] = useState(PERSONAS[0].id);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const p = readPrefs();
    setBrand(p.brand);
    setPersona(p.persona);
  }, []);
  useEffect(() => headingRef.current?.focus(), [step]);

  const finish = (to: string) => {
    setPrefs({ brand, persona, onboarded: true });
    router.push(to);
  };

  const btn = `inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-medium ${focusRing}`;

  return (
    <div className="relative isolate flex min-h-[100dvh] flex-col bg-canvas text-text-primary">
      <div className="atmosphere -z-10" aria-hidden="true"><i /><i /><i /></div>
      <nav className="glass flex h-16 items-center justify-between rounded-none border-x-0 border-t-0 px-4 sm:px-8">
        <Link href="/" className={`flex items-center gap-2.5 rounded-lg ${focusRing}`}>
          <span className="app-brand-mark" aria-hidden="true"><ShieldCheck className="h-4 w-4" /></span>
          <span className="text-base font-semibold tracking-tight" translate="no">AdSnitch</span>
        </Link>
        <button type="button" onClick={() => finish("/dashboard")} className={`rounded-lg px-3 py-2 text-[13px] text-text-muted hover:text-text-primary ${focusRing}`}>
          Skip for now
        </button>
      </nav>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <ol className="mb-6 flex items-center gap-2" aria-label="Progress">
            {STEPS.map((s, i) => (
              <li key={s} className="flex flex-1 flex-col gap-1.5">
                <span className={`h-1 rounded-full ${i <= step ? "bg-ink" : "bg-border-default"}`} aria-hidden="true" />
                <span className={`text-xs ${i === step ? "text-text-primary" : "text-text-muted"}`}>
                  {s}
                  {i === step && <span className="sr-only"> (current step {i + 1} of 3)</span>}
                </span>
              </li>
            ))}
          </ol>

          <section className="glass-strong rounded-2xl p-6 sm:p-8">
            {step === 0 && (
              <>
                <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight outline-none">Catch risky ad claims before they go live</h1>
                <ul className="mt-5 space-y-3 text-sm leading-relaxed text-text-secondary">
                  {[
                    "You paste an ad or drop a file.",
                    "AdSnitch compares it with your brand's approved claims and rules, and explains every risky line with a safer wording.",
                    "A reviewer signs off. Nothing is published by AdSnitch.",
                  ].map((t) => (
                    <li key={t} className="flex gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-text-primary" aria-hidden="true" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {step === 1 && (
              <>
                <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight outline-none">Pick your brand and role</h1>
                <p className="mt-2 text-sm text-text-secondary">You can change both later from the top bar.</p>
                <fieldset className="mt-6">
                  <legend className="text-sm font-medium">Brand</legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {BRANDS.map((b) => (
                      <label key={b} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm has-[:checked]:border-ink/50 has-[:checked]:bg-panel has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink/40 ${"border-border-default"}`}>
                        <input type="radio" name="brand" value={b} checked={brand === b} onChange={() => setBrand(b)} className="accent-current" />
                        {b}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="mt-6">
                  <legend className="text-sm font-medium">Your role in this demo</legend>
                  <div className="mt-2 space-y-2">
                    {PERSONAS.map((p) => (
                      <label key={p.id} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border-default px-3 py-2.5 text-sm has-[:checked]:border-ink/50 has-[:checked]:bg-panel has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink/40">
                        <input type="radio" name="persona" value={p.id} checked={persona === p.id} onChange={() => setPersona(p.id)} className="mt-1 accent-current" />
                        <span>
                          <span className="font-medium">{p.label}</span> <span className="text-text-muted">as {p.name}</span>
                          <span className="block text-[13px] text-text-secondary">{ROLE_HELP[p.role]}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            {step === 2 && (
              <>
                <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight outline-none">You&rsquo;re set up</h1>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Working on <strong className="text-text-primary">{brand}</strong> as{" "}
                  <strong className="text-text-primary">{PERSONAS.find((p) => p.id === persona)?.label}</strong>. The best way to see how it works is to check a real ad.
                </p>
              </>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              {step > 0 ? (
                <button type="button" onClick={() => setStep(step - 1)} className={`${btn} px-3 text-text-secondary hover:text-text-primary`}>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                </button>
              ) : <span />}
              {step < 2 ? (
                <button type="button" onClick={() => setStep(step + 1)} className={`${btn} bg-ink text-canvas hover:opacity-90`}>
                  Next <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <button type="button" onClick={() => finish("/submissions/new")} className={`${btn} bg-ink text-canvas hover:opacity-90`}>
                  Check your first ad <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
            {step === 2 && (
              <button type="button" onClick={() => finish("/dashboard")} className={`mt-3 w-full rounded-lg py-2 text-center text-[13px] text-text-muted hover:text-text-primary ${focusRing}`}>
                Go to the dashboard instead
              </button>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
