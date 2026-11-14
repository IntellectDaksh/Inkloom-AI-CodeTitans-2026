"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { InfoTip } from "@/components/guide/HelpPanel";
import { usePrefs, focusRing } from "@/components/guide/workspace";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Sub = any;
type Claim = any;

const CATEGORY: Record<string, string> = {
  unsupported_claim: "Claim without proof",
  time_bound_claim: "Claim with expired proof",
  tone_inconsistency: "Off-brand tone",
  prohibited_term: "Banned word",
  missing_disclosure: "Missing disclosure",
  out_of_scope: "Claim used outside its approved context",
};

const DAY = 86_400_000;
const get = (u: string) => fetch(u, { cache: "no-store" }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))));

function median(xs: number[]) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
const hrs = (h: number) => (h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : h < 48 ? `${Math.round(h)} h` : `${Math.round(h / 24)} days`);

function Section({ id, title, tip, href, linkLabel, children }: { id: string; title: string; tip: string; href: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="glass rounded-2xl p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={id} className="flex items-center gap-1 text-base font-semibold text-text-primary">
          {title}
          <InfoTip label={title}>{tip}</InfoTip>
        </h2>
        <Link href={href} className={`rounded text-[13px] text-text-muted underline-offset-4 hover:text-text-primary hover:underline ${focusRing}`}>{linkLabel}</Link>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-[13px] text-text-muted">{children}</p>;
}

export default function AnalyticsPage() {
  const prefs = usePrefs();
  const [subs, setSubs] = useState<Sub[] | null>(null);
  const [claims, setClaims] = useState<Claim[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let alive = true;
    setError(null);
    setSubs(null);
    Promise.all([get("/api/submissions"), get("/api/claims")])
      .then(([s, c]) => {
        if (!alive) return;
        setNow(Date.now());
        setSubs(s.submissions ?? []);
        setClaims(c.claims ?? []);
      })
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [tick]);

  const word = prefs.brand.split(" ")[0].toLowerCase();
  const mine = (subs ?? []).filter((s) => !s.brand?.name || s.brand.name.toLowerCase().startsWith(word));
  const brandIds = new Set(mine.map((s) => s.brand_id));
  const myClaims = (claims ?? []).filter((c) => !c.brand_id || brandIds.size === 0 || brandIds.has(c.brand_id));

  // Flags by category
  const flagCounts: Record<string, number> = {};
  for (const s of mine) for (const f of s.findings ?? []) flagCounts[f.category] = (flagCounts[f.category] ?? 0) + 1;
  const flags = Object.entries(flagCounts).sort((a, b) => b[1] - a[1]);
  const maxFlag = flags[0]?.[1] ?? 1;
  const sevCounts: Record<string, number> = {};
  for (const s of mine) for (const f of s.findings ?? []) sevCounts[f.severity ?? "unrated"] = (sevCounts[f.severity ?? "unrated"] ?? 0) + 1;
  const severities = ["critical", "high", "medium", "low", "unrated"].filter((k) => sevCounts[k]);

  // Claims expiring in 30 days (or already expired)
  const expiring = myClaims
    .filter((c) => c.expires_at)
    .map((c) => ({ c, days: Math.ceil((Date.parse(c.expires_at) - now) / DAY) }))
    .filter((x) => x.days <= 30)
    .sort((a, b) => a.days - b.days);

  // Time from submission to the latest decision
  const signoffs = mine
    .filter((s) => s.latest_decision?.decided_at)
    .map((s) => ({ s, h: (Date.parse(s.latest_decision.decided_at) - Date.parse(s.created_at)) / 3_600_000 }))
    .filter((x) => x.h >= 0)
    .sort((a, b) => b.h - a.h);
  const med = median(signoffs.map((x) => x.h));
  const maxH = signoffs[0]?.h || 1;

  // Score trend, oldest first
  const scored = mine
    .filter((s) => typeof s.latest_analysis?.overall_score === "number")
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));

  const approved = mine.filter((s) => s.status === "approved").length;
  const decided = mine.filter((s) => ["approved", "changes_requested", "rejected"].includes(s.status)).length;
  const avg = scored.length ? Math.round(scored.reduce((n, s) => n + s.latest_analysis.overall_score, 0) / scored.length) : null;

  const stats = [
    { label: "Ads checked", value: String(mine.length), href: "/submissions", tip: `Every ad submitted for ${prefs.brand}, in any status.` },
    { label: "First-time pass rate", value: decided ? `${Math.round((approved / decided) * 100)}%` : "-", href: "/submissions?status=approved", tip: "Approved ads divided by all ads that got a decision (approved, sent back or rejected)." },
    { label: "Average score", value: avg === null ? "-" : `${avg}/100`, href: "/submissions", tip: "Mean of the latest check score on each ad. 100 means nothing was flagged." },
    { label: "Median sign-off time", value: med === null ? "-" : hrs(med), href: "/approvals", tip: "Middle value of the time between an ad being submitted and its latest approval decision." },
  ];

  const loading = subs === null && !error;

  return (
    <AppLayout title="Analytics">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-primary">Analytics</h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            What your writers keep getting flagged for, which proof runs out soon and how long sign-off takes, for {prefs.brand}.
          </p>
        </header>

        {error && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-status-critical/30 bg-status-critical/5 px-4 py-3 text-sm text-text-primary">
            <span>Could not load analytics ({error}). Nothing below is made up, so it stays empty until this works.</span>
            <button onClick={() => setTick((t) => t + 1)} className={`rounded-lg border border-border-default bg-panel px-3 py-1.5 text-[13px] font-medium hover:bg-panel-hover ${focusRing}`}>Try again</button>
          </div>
        )}

        <section aria-label="Summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass relative rounded-2xl transition-colors hover:bg-panel-hover">
              <Link href={s.href} className={`block rounded-2xl p-5 ${focusRing}`}>
                <p className="pr-6 text-[13px] text-text-muted">{s.label}</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-text-primary">
                  {loading ? <span className="inline-block h-7 w-12 animate-pulse rounded bg-panel-hover align-middle" /> : error ? "-" : s.value}
                </p>
                <p className="mt-1 text-xs text-text-muted">View list</p>
              </Link>
              <span className="absolute right-3 top-3"><InfoTip label={s.label}>{s.tip}</InfoTip></span>
            </div>
          ))}
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <Section id="flags-h" title="What gets flagged most?" href="/submissions" linkLabel="See flagged ads"
            tip="Every issue AdSnitch raised on this brand's ads, grouped by type. One ad can have several.">
            {loading ? <div className="h-40 animate-pulse rounded-xl bg-panel-hover" /> : flags.length === 0 ? (
              <Empty>No issues flagged yet. Check an ad to start seeing patterns.</Empty>
            ) : (
              <>
              <p className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-text-secondary" aria-label="Issues by severity">
                {severities.map((k) => (
                  <span key={k}><span className={k === "critical" ? "text-status-critical" : k === "high" ? "text-status-warning" : "text-text-primary"}>{k[0].toUpperCase() + k.slice(1)}</span> <span className="tabular-nums">{sevCounts[k]}</span></span>
                ))}
              </p>
              <ul className="space-y-3">
                {flags.map(([cat, n]) => (
                  <li key={cat}>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-text-primary">{CATEGORY[cat] ?? cat.replace(/_/g, " ")}</span>
                      <span className="tabular-nums text-text-secondary">{n}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-panel-hover" aria-hidden="true">
                      <div className="h-2 rounded-full bg-text-primary/70" style={{ width: `${(n / maxFlag) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
              </>
            )}
          </Section>

          <Section id="expiry-h" title="Which claims expire soon?" href="/knowledge-base/claims" linkLabel="Open claims"
            tip="Approved claims whose proof expires within 30 days, or already has. An expired claim gets flagged in every ad that uses it.">
            {loading ? <div className="h-40 animate-pulse rounded-xl bg-panel-hover" /> : expiring.length === 0 ? (
              <Empty>No claim proof expires in the next 30 days.</Empty>
            ) : (
              <ul className="-mx-3 space-y-1">
                {expiring.slice(0, 6).map(({ c, days }) => (
                  <li key={c.id}>
                    <Link href="/knowledge-base/claims" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-panel-hover ${focusRing}`}>
                      <span className="min-w-0 flex-1 truncate text-sm text-text-primary">{c.claim_text}</span>
                      <span className={`shrink-0 text-[13px] tabular-nums ${days < 0 ? "text-status-critical" : days <= 30 ? "text-status-warning" : "text-text-secondary"}`}>
                        {days < 0 ? `Expired ${-days} days ago` : days === 0 ? "Expires today" : `${days} days left`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section id="speed-h" title="How fast are reviews signed off?" href="/approvals" linkLabel="Open approvals"
            tip="Time from an ad being submitted to its latest decision by a reviewer. Longest first, so slow ones stand out.">
            {loading ? <div className="h-40 animate-pulse rounded-xl bg-panel-hover" /> : signoffs.length === 0 ? (
              <Empty>No ad has been signed off yet.</Empty>
            ) : (
              <ul className="space-y-3">
                {signoffs.slice(0, 6).map(({ s, h }) => (
                  <li key={s.id}>
                    <Link href={`/submissions/${s.id}`} className={`block rounded ${focusRing}`}>
                      <div className="flex justify-between gap-3 text-[13px]">
                        <span className="truncate text-text-primary">{s.title}</span>
                        <span className="shrink-0 tabular-nums text-text-secondary">{hrs(h)}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-panel-hover" aria-hidden="true">
                        <div className="h-2 rounded-full bg-[#1f7fa3]/70" style={{ width: `${Math.max(4, (h / maxH) * 100)}%` }} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section id="trend-h" title="Are ads getting safer over time?" href="/submissions" linkLabel="See all ads"
            tip="Latest check score of each ad, in the order they were submitted. Higher is safer.">
            {loading ? <div className="h-40 animate-pulse rounded-xl bg-panel-hover" /> : scored.length < 2 ? (
              <Empty>Need at least two scored ads to draw a trend.</Empty>
            ) : (
              <figure>
                <svg viewBox="0 0 300 120" className="h-40 w-full" role="img" aria-label={`Scores from ${scored[0].latest_analysis.overall_score} to ${scored[scored.length - 1].latest_analysis.overall_score}`}>
                  {[0, 50, 100].map((y) => (
                    <g key={y}>
                      <line x1="24" x2="296" y1={110 - y} y2={110 - y} stroke="currentColor" className="text-border-default" strokeWidth="1" />
                      <text x="0" y={114 - y} className="fill-current text-text-muted" fontSize="10">{y}</text>
                    </g>
                  ))}
                  <polyline
                    fill="none" stroke="currentColor" strokeWidth="2" className="text-text-primary"
                    points={scored.map((s, i) => `${24 + (i / (scored.length - 1)) * 272},${110 - s.latest_analysis.overall_score}`).join(" ")}
                  />
                  {scored.map((s, i) => (
                    <circle key={s.id} cx={24 + (i / (scored.length - 1)) * 272} cy={110 - s.latest_analysis.overall_score} r="3" className="fill-current text-text-primary">
                      <title>{`${s.title}: ${Math.round(s.latest_analysis.overall_score)}/100`}</title>
                    </circle>
                  ))}
                </svg>
                <figcaption className="mt-2 text-xs text-text-muted">Oldest on the left. Hover a dot for the ad.</figcaption>
              </figure>
            )}
          </Section>
        </div>
      </div>
    </AppLayout>
  );
}
