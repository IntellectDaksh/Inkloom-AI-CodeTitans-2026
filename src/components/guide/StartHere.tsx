"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { setPrefs, usePrefs, focusRing } from "./workspace";

interface Progress { ownBrands: number; guidelines: number; brandBook: boolean; claims: number; checks: number; decisions: number }

/** First-run checklist. Every step ticks from real data on the account's own brands; sample brands never count. */
export function StartHere() {
  const prefs = usePrefs();
  const [p, setP] = useState<Progress | null>(null);
  const [team, setTeam] = useState<boolean | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/workspaces/progress", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => alive && setP(d.progress))
      .catch(() => alive && setError(true));
    // Invites are only listed for admins; a non-admin with 2+ members still ticks.
    fetch("/api/team", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => alive && setTeam((d.members ?? []).length >= 2 || (d.invites ?? []).length > 0))
      .catch(() => alive && setTeam(false));
    return () => {
      alive = false;
    };
  }, []);

  if (prefs.checklistDismissed) return null;

  const steps = [
    { done: !!p && p.ownBrands > 0, title: "Create your brand", body: "Your own workspace, separate from the sample brands.", href: "/onboarding", cta: "Create brand" },
    { done: !!p && (p.brandBook || p.guidelines >= 3), title: "Add your brand rules", body: "Import a brand book, or add at least 3 guidelines.", href: "/brands", cta: "Import brand book" },
    { done: !!p && p.claims >= 5, title: "Add 5 claims", body: "Statements your brand may make, with the proof behind them.", href: "/knowledge-base/claims", cta: "Add claims" },
    { done: !!p && p.checks > 0, title: "Check an ad", body: "Paste copy or drop a file. Risky lines get a reason and a fix.", href: "/submissions/new", cta: "Check an ad" },
    { done: team === true, title: "Invite a teammate", body: "Someone else signs off; you can't approve your own ad.", href: "/team", cta: "Invite" },
    { done: !!p && p.decisions > 0, title: "Make an approval decision", body: "Approve, reject or request changes on a checked ad.", href: "/approvals", cta: "Open approvals" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;
  const next = steps.findIndex((s) => !s.done);
  const loading = !p && !error;

  return (
    <section aria-labelledby="start-h" className="glass rounded-2xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="start-h" className="text-base font-semibold text-text-primary">{allDone ? "You're all set up" : "Getting started"}</h2>
          <p className="mt-1 text-[13px] text-text-muted" aria-live="polite">
            {loading ? "Checking your workspace…" : error ? "Could not read progress. Steps below still work." : `${doneCount} of ${steps.length} done`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPrefs({ checklistDismissed: true })}
          className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-text-muted hover:bg-panel-hover hover:text-text-primary ${focusRing}`}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          {allDone ? "Dismiss" : "Hide"}
        </button>
      </div>
      <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className={`flex flex-col rounded-xl border p-4 ${i === next ? "border-ink/30 bg-panel" : "border-border-subtle"}`}>
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  s.done ? "border-status-success bg-status-success text-white" : "border-border-default text-text-primary"
                }`}
                aria-hidden="true"
              >
                {s.done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <h3 className={`text-sm font-medium ${s.done ? "text-text-muted line-through decoration-text-muted/50" : "text-text-primary"}`}>
                {s.title}
                <span className="sr-only">{s.done ? " (done)" : " (to do)"}</span>
              </h3>
            </div>
            <p className="mt-2 flex-1 text-[13px] leading-relaxed text-text-secondary">{s.body}</p>
            {!s.done && (
              <Link href={s.href} className={`mt-3 self-start rounded text-[13px] font-medium text-text-primary underline underline-offset-4 hover:no-underline ${focusRing}`}>
                {s.cta}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
