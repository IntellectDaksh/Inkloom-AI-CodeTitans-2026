"use client";

import { useEffect, useRef, useState } from "react";
import { Play, ChevronDown } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { EvalReport, ItemResult } from "@/lib/eval/run";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

const CATEGORY: Record<string, string> = {
  prohibited_term: "Banned words",
  unsupported_claim: "Claims not in the approved library",
  tone_inconsistency: "Off-brand tone",
  missing_disclosure: "Missing required disclosure",
  time_bound_claim: "Expired or retired claims",
  out_of_scope: "Claim used outside allowed context",
  readability: "Readability",
  factual_conflict: "Conflicts with approved facts",
};
const label = (c: string) => CATEGORY[c] ?? c;
const pct = (x: number | null) => (x === null ? "n/a" : `${Math.round(x * 100)}%`);

function Stat({ value, label, hint }: { value: string; label: string; hint: string }) {
  return (
    <div className="rounded-xl border border-border-default bg-panel p-5">
      <p className="text-[28px] font-semibold leading-tight tabular-nums text-text-primary">{value}</p>
      <p className="mt-1 text-sm font-medium text-text-primary">{label}</p>
      <p className="mt-1 text-[13px] text-text-muted">{hint}</p>
    </div>
  );
}

function ProblemRow({ r }: { r: ItemResult }) {
  return (
    <li>
      <details className="group rounded-xl border border-border-default bg-panel">
        <summary className={`flex cursor-pointer list-none items-center gap-3 rounded-xl px-4 py-3 hover:bg-panel-hover ${focusRing}`}>
          <span className="font-mono text-xs text-text-muted">{r.id}</span>
          <span className="min-w-0 flex-1 truncate text-sm text-text-primary">{r.caseRef ?? r.text}</span>
          {r.group === "landmark" && (
            <Badge variant={r.missed.length ? "warning" : "approved"} size="xs">{r.hits.length} of {r.expected.length} caught</Badge>
          )}
          {r.missed.length > 0 && <Badge variant="warning" size="xs">{r.missed.length} missed</Badge>}
          {r.falseAlarms.length > 0 && <Badge variant="neutral" size="xs">{r.falseAlarms.length} false alarm{r.falseAlarms.length > 1 ? "s" : ""}</Badge>}
          {r.wrongCategory.length > 0 && <Badge variant="neutral" size="xs">{r.wrongCategory.length} wrong label</Badge>}
          <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-text-muted transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-4 border-t border-border-default px-4 py-4 text-sm">
          <p className="text-[13px] text-text-muted">{r.brand}, {r.channel.replace(/_/g, " ")}{r.note ? `. ${r.note}` : ""}</p>
          <blockquote className="whitespace-pre-wrap rounded-lg bg-canvas px-3 py-2 text-text-primary">{r.text}</blockquote>
          {r.error && <p className="text-status-danger">Pipeline error: {r.error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wide text-text-muted">Reviewer expected</h4>
              <ul className="mt-2 space-y-1">
                {r.expected.length === 0 && <li className="text-text-secondary">Nothing. This draft should pass.</li>}
                {r.expected.map((e, i) => (
                  <li key={i} className={r.missed.includes(e) ? "text-status-warning" : "text-text-secondary"}>
                    &ldquo;{e.span}&rdquo; as {label(e.category).toLowerCase()} {r.missed.includes(e) ? "(missed)" : "(caught)"}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wide text-text-muted">AdSnitch flagged</h4>
              <ul className="mt-2 space-y-1">
                {r.found.length === 0 && <li className="text-text-secondary">Nothing.</li>}
                {r.found.map((f, i) => (
                  <li key={i} className="text-text-secondary">
                    &ldquo;{f.span}&rdquo; as {label(f.category).toLowerCase()}
                    {r.falseAlarms.includes(f) ? " (false alarm)" : r.wrongCategory.includes(f) ? " (right text, wrong label)" : ""}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </details>
    </li>
  );
}

export default function EvaluationsPage() {
  const [report, setReport] = useState<EvalReport | null>(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const run = async () => {
    setRunning(true);
    setError(null);
    setElapsed(0);
    const t0 = Date.now();
    timer.current = setInterval(() => setElapsed(Math.round((Date.now() - t0) / 1000)), 500);
    try {
      const res = await fetch("/api/evaluations", { cache: "no-store" });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.error ?? `Request failed (${res.status})`);
      setReport(d.report);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Evaluation failed");
    } finally {
      if (timer.current) clearInterval(timer.current);
      setRunning(false);
    }
  };

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const landmarks = report?.results.filter((r) => r.group === "landmark") ?? [];
  const problems = report?.results.filter((r) => r.missed.length || r.falseAlarms.length || r.wrongCategory.length || r.error) ?? [];

  return (
    <AppLayout title="Evaluations">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-primary">How accurate is AdSnitch?</h1>
            <p className="mt-1 max-w-[62ch] text-sm text-text-secondary">
              We run a set of drafts, each already marked up by a person, through the same checking pipeline your ads go through, then count what it caught, what it missed, and where it raised a false alarm.
            </p>
          </div>
          <Button onClick={run} loading={running} icon={<Play className="h-4 w-4" />} className="h-10">
            {report ? "Run again" : "Run evaluation"}
          </Button>
        </header>

        <div aria-live="polite">
          {running && (
            <div role="status" className="rounded-xl border border-border-default bg-panel px-4 py-3 text-sm text-text-secondary">
              Checking every labelled draft against the live pipeline&hellip; {elapsed}s elapsed. This can take a couple of minutes.
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-canvas">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-ink/40 motion-reduce:animate-none" />
              </div>
            </div>
          )}
          {error && <p role="alert" className="rounded-lg border border-status-danger/30 bg-status-danger/5 px-4 py-3 text-sm text-text-primary">{error}</p>}
        </div>

        {!report && !running && !error && (
          <p className="rounded-xl border border-dashed border-border-default px-4 py-10 text-center text-sm text-text-secondary">
            No results yet. Press &ldquo;Run evaluation&rdquo; to score the current pipeline. Nothing is cached, so the numbers always reflect the code running now.
          </p>
        )}

        {report && (
          <>
            <section aria-labelledby="headline" className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="headline" className="text-lg font-semibold text-text-primary">Latest run</h2>
                <Badge variant={report.mode === "gemini" ? "approved" : "pending"} size="xs">
                  {report.mode === "gemini" ? "Gemini + rules" : "Rule-only (no Gemini key)"}
                </Badge>
                <span className="text-[13px] text-text-muted">
                  {report.items} drafts, {new Date(report.ranAt).toLocaleString()}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat value={`${report.caught} of ${report.labelled}`} label="Labelled issues caught" hint={`Recall ${pct(report.recall)}. ${report.missed} missed.`} />
                <Stat value={String(report.falseAlarms)} label={report.falseAlarms === 1 ? "False alarm" : "False alarms"} hint="Flags on text a reviewer marked as fine." />
                <Stat value={`${report.cleanItemsPassed} of ${report.cleanItems}`} label="Clean drafts passed untouched" hint="Drafts that should get zero flags." />
                <Stat value={pct(report.precision)} label="Flags that were right" hint={`${report.wrongCategory} flagged the right text under the wrong label.`} />
              </div>
              <p className="text-[13px] text-text-muted">
                Pipeline time per draft: median {report.latency.p50} ms, slowest 5% {report.latency.p95} ms. Model: {report.modelUsed}.
              </p>
              {report.scanner && (
                <p className="text-[13px] text-text-muted">
                  Deterministic scanner (banned words, absolute promises, disclosures), measured this run: median {report.scanner.evalSetP50Ms} ms per draft, slowest 5% {report.scanner.evalSetP95Ms} ms. On a {report.scanner.longDraftWords.toLocaleString()}-word draft: median {report.scanner.longDraftP50Ms} ms, slowest 5% {report.scanner.longDraftP95Ms} ms over {report.scanner.runs} runs (target under {report.scanner.targetMs} ms).
                </p>
              )}
            </section>

            <section aria-labelledby="bycat">
              <h2 id="bycat" className="text-lg font-semibold text-text-primary">By type of issue</h2>
              <div className="mt-3 overflow-x-auto rounded-xl border border-border-default bg-panel">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-text-muted">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">Issue type</th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">Labelled</th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">Caught</th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">Flags raised</th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">False alarms</th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">Right</th>
                      <th scope="col" className="px-4 py-3 text-right font-medium">Caught %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default tabular-nums">
                    {report.byCategory.map((c) => (
                      <tr key={c.category}>
                        <th scope="row" className="px-4 py-3 font-normal text-text-primary">{label(c.category)}</th>
                        <td className="px-4 py-3 text-right text-text-secondary">{c.labelled}</td>
                        <td className="px-4 py-3 text-right text-text-secondary">{c.caught}</td>
                        <td className="px-4 py-3 text-right text-text-secondary">{c.raised}</td>
                        <td className="px-4 py-3 text-right text-text-secondary">{c.falseAlarms}</td>
                        <td className="px-4 py-3 text-right text-text-secondary">{pct(c.precision)}</td>
                        <td className="px-4 py-3 text-right text-text-secondary">{pct(c.recall)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {landmarks.length > 0 && (
              <section aria-labelledby="landmarks">
                <h2 id="landmarks" className="text-lg font-semibold text-text-primary">Landmark cases</h2>
                <p className="mt-1 text-sm text-text-secondary">Drafts modelled on real enforcement actions and public incidents. Rewritten for the demo brands, labelled the same way as the rest of the set.</p>
                <ul className="mt-3 space-y-2">
                  {landmarks.map((r) => <ProblemRow key={r.id} r={r} />)}
                </ul>
              </section>
            )}

            <section aria-labelledby="problems">
              <h2 id="problems" className="text-lg font-semibold text-text-primary">Every miss and false alarm ({problems.length} drafts)</h2>
              <p className="mt-1 text-sm text-text-secondary">Open a row to see the draft, what the reviewer expected, and what AdSnitch flagged.</p>
              <ul className="mt-3 space-y-2">
                {problems.map((r) => <ProblemRow key={r.id} r={r} />)}
              </ul>
            </section>
          </>
        )}

        <section aria-labelledby="limits" className="rounded-xl border border-border-default bg-panel p-5 text-sm text-text-secondary">
          <h2 id="limits" className="text-base font-semibold text-text-primary">Limitations</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>The drafts are synthetic and were labelled by our own team, not an independent reviewer.</li>
            <li>The set is small ({report?.items ?? 39} drafts across three demo brands), so one draft can swing a percentage by several points.</li>
            <li>Rule-only gaps found by earlier runs (negations, proper nouns, verbatim approved claims, medical wording) were fixed against this same set, so these numbers flatter performance on copy it has never seen.</li>
            <li>A flag counts as caught only when it lands on the labelled text with the same issue type. Right text under the wrong label is shown separately and counts against &ldquo;flags that were right&rdquo;.</li>
            <li>Missing disclosures have no text to point at, so they are matched on issue type alone.</li>
            <li>Without a Gemini key the run is rule-only. Gemini results vary between runs.</li>
          </ul>
        </section>
      </div>
    </AppLayout>
  );
}
