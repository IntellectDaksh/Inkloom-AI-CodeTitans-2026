"use client";

import { useEffect, useState } from "react";
import { focusRing } from "./workspace";

const KEY = "adsnitch:tutorial-open";

const STEPS: [string, string][] = [
  ["Pick your workspace", "Each brand has its own workspace with its own approved claims and rules. Switch it from the top bar any time."],
  ["Add what you can prove", "Open Claims and add the claims your brand is allowed to make, with the study, page or document that backs each one."],
  ["Check an ad", "Paste your copy or upload a file (text, Word, PDF or an image). AdSnitch reads it and checks every claim against your library."],
  ["Read the findings", "Risky words are highlighted. Each one explains why, shows the source it was checked against, and suggests a safer line."],
  ["Fix or explain", "Apply a fix with one click, or dismiss a finding with a reason. The score updates as you edit."],
  ["Send for sign-off", "A reviewer approves or sends it back. Every step is logged, and AdSnitch never publishes anything itself."],
];

/** Text-only walkthrough on the dashboard; open or closed state is remembered on this device. */
export function QuickTutorial() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v !== null) setOpen(v === "1");
    } catch {}
  }, []);

  const toggle = () =>
    setOpen((o) => {
      try {
        localStorage.setItem(KEY, o ? "0" : "1");
      } catch {}
      return !o;
    });

  return (
    <section aria-labelledby="tut-h" className="glass rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 id="tut-h" className="text-base font-bold text-text-primary">
            Quick tutorial
          </h2>
          <p className="mt-0.5 text-[13px] text-text-muted">How AdSnitch works, in six steps.</p>
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="tut-steps"
          className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold text-text-secondary hover:bg-panel-hover hover:text-text-primary ${focusRing}`}
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>
      {open && (
        <ol id="tut-steps" className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-text-primary text-[12px] font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-bold text-text-primary">{title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-text-secondary">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
