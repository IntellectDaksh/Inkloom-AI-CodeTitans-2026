"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, BookOpen, Tag, FileText, ChevronRight, type LucideIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { InfoTip } from "@/components/guide/HelpPanel";
import { usePrefs, focusRing } from "@/components/guide/workspace";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Tile {
  title: string;
  body: string;
  href: string;
  icon: LucideIcon;
  count: string | null; // null while loading
  countLabel: string;
  tip: string;
  sample?: boolean;
}

export default function KnowledgeBasePage() {
  const prefs = usePrefs();
  const [claims, setClaims] = useState<any[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/claims", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => alive && setClaims(d.claims ?? []))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  const live = (n: (c: any[]) => number) => (error ? "-" : claims === null ? null : String(n(claims)));

  const tiles: Tile[] = [
    {
      title: "Claims", icon: ShieldCheck, href: "/knowledge-base/claims",
      body: "Statements your brand is allowed to make, each tied to its proof and an expiry date.",
      count: live((c) => c.length), countLabel: "approved claims",
      tip: "Number of claims in the library right now, read from the claims database.",
    },
    {
      title: "Evidence documents", icon: FileText, href: "/knowledge-base/claims",
      body: "The studies, lab reports and certificates behind each claim. Open a claim to see its source.",
      count: live((c) => c.reduce((n, x) => n + (x.evidence?.length ?? 0), 0)), countLabel: "documents attached",
      tip: "Sum of evidence records attached to every claim in the library.",
    },
    {
      title: "Guidelines", icon: BookOpen, href: "/knowledge-base/guidelines",
      body: "Tone, wording and legal rules written in plain sentences. The checker reads them as written.",
      count: "Sample", countLabel: "rules saved on this device",
      tip: "The guidelines page starts with example rules. Your edits are saved on this device until the database move.", sample: true,
    },
    {
      title: "Terminology", icon: Tag, href: "/knowledge-base/terminology",
      body: "Words to avoid and what to say instead, with the reason so writers understand the swap.",
      count: "Sample", countLabel: "terms saved on this device",
      tip: "The terminology page starts with example terms. Your edits are saved on this device until the database move.", sample: true,
    },
  ];

  return (
    <AppLayout title="Library">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-primary">Library</h1>
          <p className="mt-1.5 max-w-[70ch] text-sm text-text-secondary">
            What {prefs.brand} is allowed to say and the proof behind it. Every ad is checked against this library, so a flag always points back to a line here.
          </p>
        </header>

        {error && (
          <p role="alert" className="rounded-lg border border-status-warning/30 bg-status-warning/5 px-4 py-3 text-[13px] text-text-secondary">
            Could not load counts from the server. The sections below still open.
          </p>
        )}

        <ul className="grid gap-4 sm:grid-cols-2">
          {tiles.map((t) => (
            <li key={t.title} className="glass relative rounded-2xl transition-colors hover:bg-panel-hover">
              <Link href={t.href} className={`group flex h-full flex-col rounded-2xl p-5 sm:p-6 ${focusRing}`}>
                <t.icon className="h-5 w-5 text-text-secondary" aria-hidden="true" />
                <h2 className="mt-3 pr-8 text-base font-semibold text-text-primary">{t.title}</h2>
                <p className="mt-1 flex-1 text-[13px] leading-relaxed text-text-secondary">{t.body}</p>
                <p className="mt-4 flex items-baseline gap-2">
                  {t.count === null ? (
                    <span className="inline-block h-7 w-10 animate-pulse rounded bg-panel-hover" />
                  ) : t.sample ? (
                    <span className="rounded-full border border-status-warning/40 px-2 py-0.5 text-xs text-text-secondary">Sample</span>
                  ) : (
                    <span className="text-2xl font-semibold tabular-nums text-text-primary">{t.count}</span>
                  )}
                  <span className="text-[13px] text-text-muted">{t.countLabel}</span>
                  <ChevronRight aria-hidden="true" className="ml-auto h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
                </p>
              </Link>
              <span className="absolute right-3 top-3"><InfoTip label={t.title}>{t.tip}</InfoTip></span>
            </li>
          ))}
        </ul>
      </div>
    </AppLayout>
  );
}
