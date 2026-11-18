"use client";

import React, { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

export function Stepper({
  steps,
  current,
  onGo,
}: {
  steps: string[];
  current: number;
  /** Only completed steps are clickable. */
  onGo: (i: number) => void;
}) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center gap-2">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => done && onGo(i)}
                disabled={!done}
                aria-current={active ? "step" : undefined}
                className="flex min-w-0 items-center gap-2 rounded-lg py-1 pr-2 text-left focus-visible:outline-2 focus-visible:outline-blue disabled:cursor-default enabled:cursor-pointer"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold tabular-nums transition-colors ${
                    done
                      ? "border-ink bg-ink text-ghost"
                      : active
                      ? "border-ink bg-panel text-text-primary"
                      : "border-border-default bg-panel text-text-muted"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
                </span>
                <span
                  className={`truncate text-sm ${active ? "font-semibold text-text-primary" : done ? "text-text-secondary" : "text-text-muted"} ${
                    active ? "" : "hidden sm:inline"
                  }`}
                >
                  {label}
                  {done && <span className="sr-only"> (done, go back)</span>}
                </span>
              </button>
              {i < steps.length - 1 && (
                <span aria-hidden className={`h-px flex-1 ${done ? "bg-ink" : "bg-border-default"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export const PIPELINE_STAGES = [
  "Reading your copy",
  "Checking brand rules",
  "Looking up approved claims and evidence",
  "AI review of tone and context",
  "Scoring and writing fixes",
];

/**
 * Honest progress for a check. The server runs every stage in one request, so the browser can't see
 * individual stages: it shows what is really known (sent, waiting, elapsed time) instead of a fake
 * timer that walks through steps. `stage === PIPELINE_STAGES.length` means finished.
 */
export function PipelineProgress({ stage, label, startedAt }: { stage: number; label?: string; startedAt?: number }) {
  const [now, setNow] = useState(() => Date.now());
  const done = stage >= PIPELINE_STAGES.length;
  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [done]);
  const secs = startedAt ? Math.max(0, Math.round((now - startedAt) / 1000)) : 0;
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      {label && <p className="text-sm font-medium text-text-primary">{label}</p>}
      <div className="flex items-center gap-3 text-sm">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center">
          {done ? <Check className="h-4 w-4 text-status-success" aria-hidden /> : <Loader2 className="h-4 w-4 animate-spin text-text-primary motion-reduce:animate-none" aria-hidden />}
        </span>
        <span className="font-medium text-text-primary">
          {done ? "Done. Opening your result…" : "Checking: brand rules, approved claims and AI review"}
        </span>
        {!done && startedAt && <span className="ml-auto tabular-nums text-text-muted">{secs}s</span>}
      </div>
      {!done && (
        <p className="pl-9 text-[13px] text-text-muted">
          {secs < 20
            ? "Usually 3–15 seconds. Long documents take a little longer."
            : "Still working. If the AI doesn't answer in time, the check finishes with the rules engine and says so."}
        </p>
      )}
    </div>
  );
}
