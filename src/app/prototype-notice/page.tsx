"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Clock } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { focusRing } from "@/components/guide/workspace";

const FEATURE: Record<string, string> = {
  certified_pdf_engine: "Signed PDF export",
  password: "Password reset",
  "password-recovery": "Password reset",
  sso: "Okta single sign-on (SSO)",
  stripe: "Stripe billing",
};

const REAL = [
  ["Checking an ad", "Paste copy or upload a file. Each risky line is flagged with the reason, the rule and a safer wording."],
  ["Claims library", "Approved claims with their proof and expiry dates. Ads are matched against these."],
  ["Approvals", "A reviewer or admin signs off. Creators cannot approve their own ads; overrides need a reason."],
  ["Audit trail", "Every check, decision and override is recorded with who did it and when."],
  ["Reading text from images and PDFs", "Uploaded screenshots and scans are read with Gemini OCR (/api/extract), then checked like pasted copy."],
  ["Brand isolation", "Apex Nutrition, Zenith Cloud and Lumina Skincare each have their own claims, rules and terms. One brand's proof never clears another brand's ad."],
  ["Checker accuracy tests", "The checker is scored on known test ads. Results are on the Evaluations page."],
];

const NEXT = [
  ["Accounts and a permanent database (Supabase)", "Today each deployment keeps its own demo data store, which can reset on redeploy. Supabase adds real sign-in, saved data and per-brand access rules."],
  ["Okta SSO (sandbox)", "The Okta button on the login page is a sandbox placeholder. SAML sign-in via Okta is wired once real accounts exist."],
  ["Stripe billing (sandbox)", "Plans and billing are shown in sandbox mode only. No card is ever charged or stored."],
  ["Inviting teammates", "Depends on accounts. Until then the four demo people (admin, brand manager, reviewer, creator) stand in for a team."],
  ["Email notifications", "Notifications show inside the app only. Email for review requests and expiring claims comes next."],
  ["Custom domain", "The app runs on a Vercel preview address. A proper domain follows the database move."],
  ["Signed PDF export, password reset", "Need accounts first. CSV and JSON export already work from the dashboard."],
  ["No auto-publishing, by design", "AdSnitch never posts to Instagram, TikTok or any platform. A person publishes after sign-off, so nothing goes live unreviewed."],
];

function Notice() {
  const feature = useSearchParams().get("feature");
  const name = feature ? FEATURE[feature] ?? feature.replace(/[_-]/g, " ") : null;
  return name ? (
    <p role="status" className="rounded-lg border border-status-warning/30 bg-status-warning/5 px-4 py-3 text-sm text-text-primary">
      <span className="font-medium">{name}</span> is not built yet. It is listed below under &ldquo;Coming next&rdquo;.
    </p>
  ) : null;
}

function List({ items, done }: { items: string[][]; done: boolean }) {
  return (
    <ul className="space-y-4">
      {items.map(([t, b]) => (
        <li key={t} className="flex gap-3">
          {done
            ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-status-success" aria-hidden="true" />
            : <Clock className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />}
          <div>
            <p className="text-sm font-medium text-text-primary">{t}</p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-text-secondary">{b}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function PrototypeNoticePage() {
  return (
    <AppLayout title="What is real">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-primary">What works today, and what is next</h1>
          <p className="mt-1.5 max-w-[70ch] text-sm text-text-secondary">
            AdSnitch is a working prototype. This page says plainly which parts are real and which are still being built.
          </p>
        </header>

        <Suspense fallback={null}>
          <Notice />
        </Suspense>

        <div className="grid gap-4 md:grid-cols-2">
          <section aria-labelledby="real-h" className="glass rounded-2xl p-5 sm:p-6">
            <h2 id="real-h" className="mb-4 text-base font-semibold text-text-primary">Works today</h2>
            <List items={REAL} done />
          </section>
          <section aria-labelledby="next-h" className="glass rounded-2xl p-5 sm:p-6">
            <h2 id="next-h" className="mb-4 text-base font-semibold text-text-primary">Coming next</h2>
            <List items={NEXT} done={false} />
          </section>
        </div>

        <p className="text-[13px] text-text-muted">
          Demo evidence in the library is labelled as demo and is not real study data.{" "}
          <a
            href="https://github.com/IntellectDaksh/Inkloom-AI-CodeTitans-2026"
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded text-text-primary underline underline-offset-4 ${focusRing}`}
          >
            Source code on GitHub
          </a>
          {" · "}
          <Link href="/dashboard" className={`rounded text-text-primary underline underline-offset-4 ${focusRing}`}>Back to dashboard</Link>
        </p>
      </div>
    </AppLayout>
  );
}
