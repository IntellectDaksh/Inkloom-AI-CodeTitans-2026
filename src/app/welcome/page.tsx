"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { focusRing, refreshMe } from "@/components/guide/workspace";
import { safeNext } from "@/lib/auth/next";
import { LogoMark } from "@/components/landing/LogoMark";
import { AuthBackdrop } from "@/components/auth/AuthBackdrop";

const input = `mt-1 h-11 w-full rounded-lg border border-border-default bg-panel px-3 text-sm text-text-primary placeholder:text-text-muted ${focusRing}`;

interface Prefill { name: string; email: string; jobTitle: string; company: string; canNameCompany: boolean; complete: boolean }

function Welcome() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"), "/dashboard");
  const [pre, setPre] = useState<Prefill | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/profile/setup", { cache: "no-store" })
      .then((r) => (r.status === 401 ? (location.replace("/auth/login"), null) : r.json()))
      .then((d) => {
        if (!d) return;
        if (!d.success) return setError(d.error);
        if (d.complete) return location.replace(next);
        setPre(d);
      })
      .catch(() => setError("Could not load your account. Refresh to try again."));
  }, [next]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/profile/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: f.get("name"), jobTitle: f.get("jobTitle"), company: f.get("company"), terms: f.get("terms") === "on" }),
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.error);
      await refreshMe();
      location.replace(next);
    } catch (err) {
      setError((err as Error).message || "Could not save. Try again.");
      setBusy(false);
    }
  };

  return (
    <main className="relative min-h-dvh overflow-hidden px-4 py-10 sm:py-16">
      <AuthBackdrop />
      <div className="relative z-10 mx-auto max-w-md space-y-6 rounded-3xl border border-white/60 bg-white/75 p-6 shadow-[0_30px_80px_-20px_rgba(16,45,64,0.45)] backdrop-blur-2xl sm:p-8">
        <LogoMark size={32} className="text-text-primary" />
        <header>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Step 1 of 2 · Your profile</p>
          <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-tight text-text-primary">Set up your profile</h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Reviewers see this next to every ad you send for approval. Takes 20 seconds.
          </p>
        </header>

        <section>
          {!pre ? (
            error ? <p role="alert" className="text-[13px] text-status-red">{error}</p> : <p className="text-[13px] text-text-muted">Loading…</p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <p className="text-[13px] text-text-muted">Signed in as {pre.email}</p>
              <label className="block text-sm text-text-primary">Full name
                <input name="name" required maxLength={80} autoComplete="name" defaultValue={pre.name} className={input} />
              </label>
              <label className="block text-sm text-text-primary">Job title <span className="text-text-muted">(optional)</span>
                <input name="jobTitle" maxLength={80} autoComplete="organization-title" placeholder="e.g. Content lead" defaultValue={pre.jobTitle} className={input} />
              </label>
              {pre.canNameCompany && (
                <label className="block text-sm text-text-primary">Company or brand
                  <input name="company" required maxLength={80} autoComplete="organization" defaultValue={/'s company$/.test(pre.company) ? "" : pre.company} className={input} />
                </label>
              )}
              <label className="flex items-start gap-2 text-[13px] leading-snug text-text-secondary">
                <input name="terms" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-ink)]" />
                <span>I agree to the <a href="/terms" target="_blank" className="underline">Terms</a> and <a href="/privacy" target="_blank" className="underline">Privacy Policy</a>, and understand AdSnitch is a review aid, not legal advice.</span>
              </label>
              {error && <p role="alert" className="text-[13px] text-status-red">{error}</p>}
              <button type="submit" disabled={busy} className={`h-11 w-full rounded-lg bg-ink text-sm font-medium text-canvas hover:opacity-90 disabled:opacity-60 ${focusRing}`}>
                {busy ? "Saving…" : "Continue"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

export default function WelcomePage() {
  return (
    <Suspense>
      <Welcome />
    </Suspense>
  );
}
