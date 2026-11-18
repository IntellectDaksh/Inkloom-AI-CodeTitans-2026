"use client";

import React, { useEffect, useState } from "react";
import { AlertOctagon, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { VERDICT, Verdict } from "./shared";
import { usePrefs } from "../guide/workspace";

const ICON = { safe: CheckCircle2, changes: AlertTriangle, blocked: AlertOctagon };

const LINE: Record<Verdict, (open: number) => string> = {
  safe: () => "No open issues. Send it for approval when you're ready.",
  changes: (n) => `${n} issue${n === 1 ? "" : "s"} to fix or dismiss before this can go out.`,
  blocked: (n) => `${n} issue${n === 1 ? "" : "s"}, including at least one that breaks a hard rule. This can't be published as written.`,
};

/** Counts the score up from 0 when it first appears (skipped with reduced motion). */
export function useCountUp(target: number): number {
  const [v, setV] = useState(target);
  useEffect(() => {
    const reduce = typeof window === "undefined" || matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "off";
    if (reduce) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 700);
      setV(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

export function VerdictBanner({
  verdict,
  score,
  openCount,
  estimated,
  checking,
  notes = [],
}: {
  verdict: Verdict;
  score: number;
  openCount: number;
  /** True when the score reflects local edits that have not been re-checked yet. */
  estimated: boolean;
  checking: boolean;
  /** Workspace checks from Settings that failed (localFlags). */
  notes?: string[];
}) {
  const shown = useCountUp(score);
  const { passScore, blockBelow } = usePrefs();
  const v = VERDICT[verdict];
  const Icon = ICON[verdict];
  return (
    <section aria-live="polite" aria-label="Result" className="glass rounded-2xl p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4 sm:flex-1">
          <Icon className={`h-8 w-8 shrink-0 ${v.tone}`} aria-hidden />
          <div>
            <p className={`text-2xl font-semibold tracking-tight sm:text-[28px] ${v.tone}`}>{v.title}</p>
            <p className="mt-1 text-sm text-text-secondary">{verdict === "changes" && openCount === 0 && notes.length ? "Your workspace rules flagged this." : LINE[verdict](openCount)}</p>
            {notes.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-[13px] text-text-secondary">
                {notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="sm:w-56">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-text-muted">
              {checking ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden /> Re-checking
                </span>
              ) : estimated ? (
                "Estimated score"
              ) : (
                "Score"
              )}
            </span>
            <span className="text-3xl font-semibold tabular-nums text-text-primary">
              {shown}
              <span className="text-sm font-normal text-text-muted">/100</span>
            </span>
          </div>
          <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-panel-elevated" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score} aria-label="Compliance score">
            <div className={`h-full rounded-full transition-[width] duration-500 ${v.bar}`} style={{ width: `${score}%` }} />
            <span className="absolute inset-y-0 w-px bg-text-primary/40" style={{ left: `${blockBelow}%` }} aria-hidden />
            <span className="absolute inset-y-0 w-px bg-text-primary/70" style={{ left: `${passScore}%` }} aria-hidden />
          </div>
          <p className="mt-1.5 text-xs text-text-muted">Passes at {passScore}+, blocked below {blockBelow}</p>
        </div>
      </div>
      <p className="mt-4 border-t border-border-subtle pt-3 text-xs text-text-muted">
        Automated review aid, not legal advice. Checked against your workspace&rsquo;s claims and rules only. <a href="/terms" className="underline">Terms</a>
      </p>
    </section>
  );
}
