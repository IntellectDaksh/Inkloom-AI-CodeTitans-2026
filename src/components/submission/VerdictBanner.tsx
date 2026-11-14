import React from "react";
import { AlertOctagon, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { VERDICT, Verdict } from "./shared";

const ICON = { safe: CheckCircle2, changes: AlertTriangle, blocked: AlertOctagon };

const LINE: Record<Verdict, (open: number) => string> = {
  safe: () => "No open issues. Send it for approval when you're ready.",
  changes: (n) => `${n} issue${n === 1 ? "" : "s"} to fix or dismiss before this can go out.`,
  blocked: (n) => `${n} issue${n === 1 ? "" : "s"}, including at least one that breaks a hard rule. This can't be published as written.`,
};

export function VerdictBanner({
  verdict,
  score,
  openCount,
  estimated,
  checking,
}: {
  verdict: Verdict;
  score: number;
  openCount: number;
  /** True when the score reflects local edits that have not been re-checked yet. */
  estimated: boolean;
  checking: boolean;
}) {
  const v = VERDICT[verdict];
  const Icon = ICON[verdict];
  return (
    <section aria-live="polite" aria-label="Result" className="glass rounded-2xl p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4 sm:flex-1">
          <Icon className={`h-8 w-8 shrink-0 ${v.tone}`} aria-hidden />
          <div>
            <p className={`text-2xl font-semibold tracking-tight sm:text-[28px] ${v.tone}`}>{v.title}</p>
            <p className="mt-1 text-sm text-text-secondary">{LINE[verdict](openCount)}</p>
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
              {score}
              <span className="text-sm font-normal text-text-muted">/100</span>
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-panel-elevated" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score} aria-label="Compliance score">
            <div className={`h-full rounded-full transition-[width] duration-500 ${v.bar}`} style={{ width: `${score}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
