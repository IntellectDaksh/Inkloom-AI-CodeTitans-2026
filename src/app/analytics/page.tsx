"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { InfoTip } from "@/components/guide/HelpPanel";
import { focusRing } from "@/components/guide/workspace";

const CATEGORY: Record<string, string> = {
  unsupported_claim: "Claim without proof",
  time_bound_claim: "Claim with expired proof",
  tone_inconsistency: "Off-brand tone",
  prohibited_term: "Banned word",
  missing_disclosure: "Missing disclosure",
  out_of_scope: "Off-brand or wrong context",
  factual_conflict: "Contradicts the facts on file",
  readability: "Readability",
};
const OUT = [
  { k: "pass", label: "Pass", color: "var(--color-status-success)" },
  { k: "review", label: "Needs review", color: "var(--color-status-warning)" },
  { k: "blocked", label: "Blocked", color: "var(--color-status-critical)" },
] as const;

interface Bucket { start: string; checks: number; pass: number; review: number; blocked: number; avgScore: number | null }
interface Group { key: string; label: string; checks: number; avgScore: number | null; blocked: number; pass: number }
interface ClaimRow { id: string; text: string; brand: string | null; count: number }
interface Data {
  range: { from: string; to: string; bucket: "day" | "week" };
  filters: { brands: { id: string; name: string }[]; channels: string[] };
  totals: { checks: number; ads: number; avgScore: number | null; issues: number; split: Record<"pass" | "review" | "blocked", number>; medianHoursToApproval: number | null; approvals: number; everChecked: number };
  series: Bucket[];
  categories: { category: string; count: number }[];
  phrases: { phrase: string; count: number }[];
  claimsUsed: ClaimRow[];
  claimsFailing: ClaimRow[];
  expiring: { id: string; text: string; brand: string | null; days: number }[];
  slowestApprovals: { id: string; title: string; hours: number }[];
  reviewers: { id: string; name: string; approved: number; rejected: number; changes_requested: number; pending: number; total: number }[];
  byBrand: Group[];
  byChannel: Group[];
}

const hrs = (h: number) => (h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : h < 48 ? `${Math.round(h)} h` : `${Math.round(h / 24)} days`);
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const fmtDay = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "-");
const inputCls = `h-9 rounded-lg border border-border-default px-2.5 text-[13px] text-text-primary ${focusRing}`;
const inputStyle = { backgroundColor: "var(--color-canvas-elevated)", color: "var(--color-ink)" };

function Card({ id, title, tip, children, className = "" }: { id: string; title: string; tip: string; children: React.ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={`glass rounded-2xl p-5 sm:p-6 ${className}`}>
      <h2 id={id} className="mb-4 flex items-center gap-1 text-base font-semibold text-text-primary">{title}<InfoTip label={title}>{tip}</InfoTip></h2>
      {children}
    </section>
  );
}
const Empty = ({ children }: { children: React.ReactNode }) => <p className="py-6 text-center text-[13px] text-text-muted">{children}</p>;

function Bars({ rows, label }: { rows: { key: string; label: React.ReactNode; value: number; note?: string }[]; label: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3" aria-label={label}>
      {rows.map((r) => (
        <li key={r.key}>
          <div className="flex justify-between gap-3 text-[13px]">
            <span className="min-w-0 truncate text-text-primary">{r.label}</span>
            <span className="shrink-0 tabular-nums text-text-secondary">{r.value}{r.note ? ` · ${r.note}` : ""}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-panel-hover" aria-hidden="true">
            <div className="h-2 rounded-full bg-text-primary/70" style={{ width: `${Math.max(3, (r.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Legend() {
  return (
    <p className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-text-secondary">
      {OUT.map((o) => <span key={o.k} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: o.color }} aria-hidden="true" />{o.label}</span>)}
    </p>
  );
}

/** Stacked columns of checks per bucket, coloured by outcome. Hover a column for its numbers. */
function ChecksChart({ series, bucket }: { series: Bucket[]; bucket: string }) {
  const W = 600, H = 160, L = 28, B = 20;
  const max = Math.max(1, ...series.map((b) => b.checks));
  const bw = (W - L) / series.length;
  const ticks = [0, Math.ceil(max / 2), max];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full" role="img" aria-label={`Checks per ${bucket}, ${series.reduce((n, b) => n + b.checks, 0)} in total`}>
      {ticks.map((t) => {
        const y = H - B - (t / max) * (H - B - 8);
        return <g key={t}><line x1={L} x2={W} y1={y} y2={y} stroke="var(--color-border-subtle)" /><text x={0} y={y + 3} fontSize="10" fill="var(--color-text-muted)">{t}</text></g>;
      })}
      {series.map((b, i) => {
        let y = H - B;
        const x = L + i * bw + Math.min(2, bw * 0.1);
        const w = Math.max(1, bw - Math.min(4, bw * 0.2));
        return (
          <g key={b.start}>
            <title>{`${bucket === "week" ? "Week of " : ""}${fmtDay(b.start)}: ${b.checks} checks (${b.pass} pass, ${b.review} needs review, ${b.blocked} blocked)`}</title>
            <rect x={L + i * bw} y={0} width={bw} height={H - B} fill="transparent" />
            {OUT.map((o) => {
              const h = (b[o.k] / max) * (H - B - 8);
              if (!h) return null;
              y -= h;
              return <rect key={o.k} x={x} y={y} width={w} height={Math.max(0, h - 1)} rx={Math.min(2, w / 2)} fill={o.color} />;
            })}
          </g>
        );
      })}
      {[0, Math.floor(series.length / 2), series.length - 1].filter((v, i, a) => a.indexOf(v) === i).map((i) => (
        <text key={i} x={L + i * bw + bw / 2} y={H - 4} fontSize="10" textAnchor="middle" fill="var(--color-text-muted)">{fmtDay(series[i].start)}</text>
      ))}
    </svg>
  );
}

function ScoreChart({ series }: { series: Bucket[] }) {
  const pts = series.map((b, i) => ({ b, i })).filter((p) => p.b.avgScore !== null);
  const W = 600, H = 140, L = 28;
  const x = (i: number) => L + (series.length === 1 ? (W - L) / 2 : (i / (series.length - 1)) * (W - L - 6));
  const y = (s: number) => 8 + (1 - s / 100) * (H - 28);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-full" role="img" aria-label={`Average score per period, from ${pts[0].b.avgScore} to ${pts[pts.length - 1].b.avgScore} out of 100`}>
      {[0, 50, 100].map((t) => <g key={t}><line x1={L} x2={W} y1={y(t)} y2={y(t)} stroke="var(--color-border-subtle)" /><text x={0} y={y(t) + 3} fontSize="10" fill="var(--color-text-muted)">{t}</text></g>)}
      <polyline fill="none" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinejoin="round" points={pts.map((p) => `${x(p.i)},${y(p.b.avgScore!)}`).join(" ")} />
      {pts.map((p) => (
        <g key={p.b.start}>
          <circle cx={x(p.i)} cy={y(p.b.avgScore!)} r="4" fill="var(--color-text-primary)" stroke="var(--color-canvas)" strokeWidth="2" />
          <circle cx={x(p.i)} cy={y(p.b.avgScore!)} r="12" fill="transparent"><title>{`${fmtDay(p.b.start)}: average ${p.b.avgScore}/100 over ${p.b.checks} checks`}</title></circle>
        </g>
      ))}
    </svg>
  );
}

function GroupTable({ rows, label }: { rows: Group[]; label: string }) {
  if (!rows.length) return <Empty>No checks in this range.</Empty>;
  return (
    <table className="w-full text-left text-[13px]">
      <thead><tr className="border-b border-border-subtle text-text-muted"><th scope="col" className="py-2 font-normal">{label}</th><th scope="col" className="py-2 text-right font-normal">Checks</th><th scope="col" className="py-2 text-right font-normal">Avg score</th><th scope="col" className="py-2 text-right font-normal">Pass</th><th scope="col" className="py-2 text-right font-normal">Blocked</th></tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.key} className="border-b border-border-subtle last:border-0">
            <th scope="row" className="py-2 pr-2 font-normal capitalize text-text-primary">{r.label}</th>
            <td className="py-2 text-right tabular-nums">{r.checks}</td>
            <td className="py-2 text-right tabular-nums">{r.avgScore ?? "-"}</td>
            <td className="py-2 text-right tabular-nums">{pct(r.pass, r.checks)}</td>
            <td className="py-2 text-right tabular-nums">{pct(r.blocked, r.checks)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const PRESETS = [7, 30, 90, 365];

export default function AnalyticsPage() {
  const [days, setDays] = useState<number | "custom">(30);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [brandId, setBrandId] = useState("");
  const [channel, setChannel] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (days === "custom") { if (from) qs.set("from", from); if (to) qs.set("to", to); }
    else { const t = Date.now(); qs.set("from", iso(t - (days - 1) * 86_400_000)); qs.set("to", iso(t)); }
    if (brandId) qs.set("brandId", brandId);
    if (channel) qs.set("channel", channel);
    let alive = true;
    fetch(`/api/analytics?${qs}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (!alive) return; if (d.success) { setData(d); setError(null); } else setError(d.error || "Could not load analytics"); })
      .catch(() => alive && setError("Could not reach the server"));
    return () => { alive = false; };
  }, [days, from, to, brandId, channel, tick]);

  const t = data?.totals;
  const loading = !data && !error;
  const brandNew = data && t!.everChecked === 0;
  const tiles = t ? [
    { label: "Checks run", value: String(t.checks), tip: "Every time AdSnitch checked an ad in this range, re-checks included." },
    { label: "Ads checked", value: String(t.ads), tip: "Distinct ads checked at least once in this range." },
    { label: "Average score", value: t.avgScore === null ? "-" : `${t.avgScore}/100`, tip: "Mean score of the checks in this range. 100 means nothing was flagged." },
    { label: "Pass rate", value: pct(t.split.pass, t.checks), tip: "Share of checks that passed with no blocking issue." },
    { label: "Median time to approval", value: t.medianHoursToApproval === null ? "-" : hrs(t.medianHoursToApproval), tip: `From an ad's first check to a reviewer approving it. Based on ${t.approvals} approval(s).` },
  ] : [];

  return (
    <AppLayout title="Analytics">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-primary">Analytics</h1>
          <p className="mt-1.5 text-sm text-text-secondary">Computed live from your organisation&rsquo;s checks, findings and approvals. Nothing here is sample data.</p>
        </header>

        <div role="group" aria-label="Filters" className="flex flex-wrap items-end gap-3">
          <label className="text-[13px] text-text-muted">Date range<br />
            <select className={inputCls} style={inputStyle} value={String(days)} onChange={(e) => setDays(e.target.value === "custom" ? "custom" : Number(e.target.value))}>
              {PRESETS.map((d) => <option key={d} value={d}>Last {d} days</option>)}
              <option value="custom">Custom</option>
            </select>
          </label>
          {days === "custom" && <>
            <label className="text-[13px] text-text-muted">From<br /><input type="date" className={inputCls} style={inputStyle} value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} /></label>
            <label className="text-[13px] text-text-muted">To<br /><input type="date" className={inputCls} style={inputStyle} value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} /></label>
          </>}
          <label className="text-[13px] text-text-muted">Brand<br />
            <select className={inputCls} style={inputStyle} value={brandId} onChange={(e) => setBrandId(e.target.value)}>
              <option value="">All brands</option>
              {data?.filters.brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>
          <label className="text-[13px] text-text-muted">Channel<br />
            <select className={inputCls} style={inputStyle} value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option value="">All channels</option>
              {data?.filters.channels.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
            </select>
          </label>
        </div>

        {error && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-status-critical/30 bg-status-critical/5 px-4 py-3 text-sm text-text-primary">
            <span>Could not load analytics ({error}).</span>
            <button onClick={() => setTick((n) => n + 1)} className={`rounded-lg border border-border-default bg-panel px-3 py-1.5 text-[13px] font-medium hover:bg-panel-hover ${focusRing}`}>Try again</button>
          </div>
        )}

        {brandNew ? (
          <section className="glass rounded-2xl p-8 text-center">
            <h2 className="text-lg font-semibold text-text-primary">No checks yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">Analytics fill in from your own work. Check your first ad and this page shows scores, flagged phrases, claim usage and approval times.</p>
            <Link href="/submissions/new" className={`mt-4 inline-block rounded-lg bg-ink px-4 py-2 text-sm font-medium text-canvas ${focusRing}`}>Check an ad</Link>
          </section>
        ) : (
          <>
            <section aria-label="Summary" className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              {(loading ? Array.from({ length: 5 }, (_, i) => ({ label: String(i), value: "", tip: "" })) : tiles).map((s) => (
                <div key={s.label} className="glass relative rounded-2xl p-5">
                  <p className="pr-6 text-[13px] text-text-muted">{loading ? <span className="inline-block h-3 w-16 animate-pulse rounded bg-panel-hover" /> : s.label}</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-text-primary">{loading ? <span className="inline-block h-7 w-12 animate-pulse rounded bg-panel-hover align-middle" /> : s.value}</p>
                  {!loading && <span className="absolute right-3 top-3"><InfoTip label={s.label}>{s.tip}</InfoTip></span>}
                </div>
              ))}
            </section>

            {data && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card id="vol-h" title={`Checks per ${data.range.bucket}`} tip="Each column is one period, split by the outcome of each check." className="lg:col-span-2">
                  {t!.checks === 0 ? <Empty>No checks in this range. Widen the dates or clear the filters.</Empty> : <>
                    <Legend />
                    <ChecksChart series={data.series} bucket={data.range.bucket} />
                    <details className="mt-2 text-[13px] text-text-muted">
                      <summary className={`cursor-pointer rounded ${focusRing}`}>Show as table</summary>
                      <table className="mt-2 w-full text-left">
                        <thead><tr><th scope="col" className="font-normal">Period</th><th scope="col" className="text-right font-normal">Checks</th><th scope="col" className="text-right font-normal">Pass</th><th scope="col" className="text-right font-normal">Review</th><th scope="col" className="text-right font-normal">Blocked</th><th scope="col" className="text-right font-normal">Avg score</th></tr></thead>
                        <tbody>{data.series.filter((b) => b.checks).map((b) => <tr key={b.start}><td>{fmtDay(b.start)}</td><td className="text-right tabular-nums">{b.checks}</td><td className="text-right tabular-nums">{b.pass}</td><td className="text-right tabular-nums">{b.review}</td><td className="text-right tabular-nums">{b.blocked}</td><td className="text-right tabular-nums">{b.avgScore ?? "-"}</td></tr>)}</tbody>
                      </table>
                    </details>
                  </>}
                </Card>

                <Card id="score-h" title="Average score trend" tip="Mean check score per period. Periods with no checks are skipped.">
                  {data.series.filter((b) => b.avgScore !== null).length < 2 ? <Empty>Needs checks in at least two periods to draw a trend.</Empty> : <ScoreChart series={data.series} />}
                </Card>

                <Card id="split-h" title="Outcome split" tip="Pass: no blocking issue. Needs review: a person should look. Blocked: cannot run as written.">
                  {t!.checks === 0 ? <Empty>No checks in this range.</Empty> : <>
                    <div className="flex h-4 w-full gap-0.5 overflow-hidden rounded-full" role="img" aria-label={OUT.map((o) => `${o.label} ${t!.split[o.k]}`).join(", ")}>
                      {OUT.map((o) => t!.split[o.k] ? <div key={o.k} style={{ width: `${(t!.split[o.k] / t!.checks) * 100}%`, background: o.color }} title={`${o.label}: ${t!.split[o.k]}`} /> : null)}
                    </div>
                    <dl className="mt-4 grid grid-cols-3 gap-3">
                      {OUT.map((o) => <div key={o.k}><dt className="inline-flex items-center gap-1.5 text-[13px] text-text-muted"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: o.color }} aria-hidden="true" />{o.label}</dt><dd className="text-xl font-semibold tabular-nums text-text-primary">{t!.split[o.k]} <span className="text-[13px] font-normal text-text-muted">{pct(t!.split[o.k], t!.checks)}</span></dd></div>)}
                    </dl>
                  </>}
                </Card>

                <Card id="cat-h" title="Top violated rule categories" tip="Issues raised in this range, by type. Confirmed approved claims are not counted.">
                  {data.categories.length ? <Bars label="Issues by category" rows={data.categories.map((c) => ({ key: c.category, label: CATEGORY[c.category] ?? c.category, value: c.count }))} /> : <Empty>No issues raised in this range.</Empty>}
                </Card>

                <Card id="phr-h" title="Most-flagged phrases" tip="The exact wording flagged most often. Good candidates for writer guidance or the banned-word list.">
                  {data.phrases.length ? <Bars label="Flagged phrases" rows={data.phrases.map((p) => ({ key: p.phrase, label: <q>{p.phrase}</q>, value: p.count }))} /> : <Empty>No flagged phrases in this range.</Empty>}
                </Card>

                <Card id="cu-h" title="Claims used most" tip="Approved claims that checks matched against, confirmed or not.">
                  {data.claimsUsed.length ? <Bars label="Claims used" rows={data.claimsUsed.map((c) => ({ key: c.id, label: c.text, value: c.count, note: c.brand ?? undefined }))} /> : <Empty>No check has cited a claim from your library yet.</Empty>}
                </Card>

                <Card id="cf-h" title="Claims causing most failures" tip="Claims cited by findings that were not confirmed: used out of context, expired or changed.">
                  {data.claimsFailing.length ? <Bars label="Failing claims" rows={data.claimsFailing.map((c) => ({ key: c.id, label: c.text, value: c.count, note: c.brand ?? undefined }))} /> : <Empty>No claim has caused a failed check in this range.</Empty>}
                </Card>

                <Card id="exp-h" title="Expiring claims" tip="Claims whose proof expires within 60 days, or already has.">
                  {data.expiring.length ? (
                    <ul className="-mx-3 space-y-1">
                      {data.expiring.slice(0, 8).map((c) => (
                        <li key={c.id}><Link href="/knowledge-base/claims" className={`flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-panel-hover ${focusRing}`}>
                          <span className="min-w-0 flex-1 truncate text-sm text-text-primary">{c.text}</span>
                          <span className={`shrink-0 text-[13px] tabular-nums ${c.days < 0 ? "text-status-critical" : c.days <= 14 ? "text-status-warning" : "text-text-secondary"}`}>{c.days < 0 ? `Expired ${-c.days}d ago` : c.days === 0 ? "Today" : `${c.days}d left`}</span>
                        </Link></li>
                      ))}
                    </ul>
                  ) : <Empty>No claim proof expires in the next 60 days.</Empty>}
                </Card>

                <Card id="ttl-h" title="Time from check to approval" tip="From an ad's first check to its approval. Slowest first.">
                  {data.slowestApprovals.length ? <>
                    <p className="mb-3 text-[13px] text-text-secondary">Median <span className="font-semibold tabular-nums text-text-primary">{hrs(t!.medianHoursToApproval!)}</span> across {t!.approvals} approval(s).</p>
                    <Bars label="Slowest approvals" rows={data.slowestApprovals.map((a) => ({ key: a.id, label: <Link className={`rounded hover:underline ${focusRing}`} href={`/submissions/${a.id}`}>{a.title}</Link>, value: Math.round(a.hours * 10) / 10, note: hrs(a.hours) }))} />
                  </> : <Empty>No ad was approved in this range.</Empty>}
                </Card>

                <Card id="rev-h" title="Reviewer workload" tip="Decisions each person made in this range, plus reviews currently assigned to them." className="lg:col-span-2">
                  {data.reviewers.length ? (
                    <div className="overflow-x-auto"><table className="w-full min-w-[480px] text-left text-[13px]">
                      <thead><tr className="border-b border-border-subtle text-text-muted"><th scope="col" className="py-2 font-normal">Reviewer</th><th scope="col" className="py-2 text-right font-normal">Approved</th><th scope="col" className="py-2 text-right font-normal">Changes requested</th><th scope="col" className="py-2 text-right font-normal">Rejected</th><th scope="col" className="py-2 text-right font-normal">Waiting on them</th></tr></thead>
                      <tbody>{data.reviewers.map((r) => <tr key={r.id} className="border-b border-border-subtle last:border-0"><th scope="row" className="py-2 font-normal text-text-primary">{r.name}</th><td className="py-2 text-right tabular-nums">{r.approved}</td><td className="py-2 text-right tabular-nums">{r.changes_requested}</td><td className="py-2 text-right tabular-nums">{r.rejected}</td><td className="py-2 text-right tabular-nums">{r.pending}</td></tr>)}</tbody>
                    </table></div>
                  ) : <Empty>No review decisions or assigned reviews in this range.</Empty>}
                </Card>

                <Card id="brand-h" title="By brand" tip="Checks in this range grouped by brand."><GroupTable rows={data.byBrand} label="Brand" /></Card>
                <Card id="chan-h" title="By channel" tip="Checks in this range grouped by the channel picked when the ad was submitted."><GroupTable rows={data.byChannel} label="Channel" /></Card>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
