"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { setPrefs, usePrefs, useWorkspaceCounts, focusRing, personaOf } from "./workspace";

/** First-run checklist. Each step ticks from real API data, not from clicks. */
export function StartHere() {
  const prefs = usePrefs();
  const c = useWorkspaceCounts();
  const role = personaOf(prefs).role;
  if (prefs.checklistDismissed) return null;

  const steps = [
    { done: c.claims > 0, title: "Add your brand rules and claims", body: "Tell AdSnitch what your brand may say, and the proof behind it.", href: "/knowledge-base/claims", cta: "Add a claim" },
    { done: c.submissions > 0, title: "Check an ad", body: "Paste copy or drop a file. Risky lines get flagged with a reason and a fix.", href: "/submissions/new", cta: "Check an ad" },
    { done: c.approved > 0, title: "Get it approved by a reviewer", body: role === "creator"
      ? "Send it for sign-off. A reviewer or admin approves it; you cannot approve your own ad."
      : "Sign off ads written by others. Requesting changes or overriding needs a short reason.", href: "/approvals", cta: role === "creator" ? "See approval status" : "Open approvals" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const next = steps.findIndex((s) => !s.done);

  return (
    <section aria-labelledby="start-h" className="glass rounded-2xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="start-h" className="text-base font-semibold text-text-primary">Start here</h2>
          <p className="mt-1 text-[13px] text-text-muted" aria-live="polite">
            {c.loading ? "Checking your workspace…" : c.error ? "Could not read progress. Steps below still work." : `${doneCount} of 3 done`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPrefs({ checklistDismissed: true })}
          className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-text-muted hover:bg-panel-hover hover:text-text-primary ${focusRing}`}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Hide
        </button>
      </div>
      <ol className="mt-4 grid gap-3 md:grid-cols-3">
        {steps.map((s, i) => {
          const current = i === next;
          return (
            <li
              key={s.title}
              className={`flex flex-col rounded-xl border p-4 ${current ? "border-ink/30 bg-panel" : "border-border-subtle"}`}
            >
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
                <Link
                  href={s.href}
                  className={`mt-3 self-start rounded text-[13px] font-medium text-text-primary underline underline-offset-4 hover:no-underline ${focusRing}`}
                >
                  {s.cta}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
