"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { focusRing } from "../guide/workspace";

const EVENT = "adsnitch:tour";
// Pure UI pref (which step you stopped on), not business data.
const KEY = "adsnitch:tour-step";

type Step = { eyebrow: string; title: string; body: string; target?: string; path?: string };

const STEPS: Step[] = [
  { eyebrow: "Welcome", title: "A two-minute tour of AdSnitch", body: "We'll walk through one ad, from first draft to signed-off record. Use the arrow keys, or Esc to leave. You can pick up where you stopped." },
  { eyebrow: "Workspace", title: "Every brand gets its own workspace", body: "Claims, rules and reviews are kept apart per brand. Switch here before you check anything.", target: 'button[title="Switch workspace"]' },
  { eyebrow: "Check an ad", title: "Paste copy or drop a file", body: "Text, Word, PDF or an image. AdSnitch reads it and checks every claim against this workspace's library.", target: '[data-tour="nav-/submissions/new"]' },
  { eyebrow: "Findings", title: "Each risky line, explained", body: "Your reviews land here. Open one to see highlighted phrases, why each was flagged, the source it was checked against and a safer rewrite.", target: '[data-tour="recent"]', path: "/dashboard" },
  { eyebrow: "Dispute", title: "Disagree with a finding? Say why", body: "Inside a review, dispute a finding with counter-evidence or dismiss it with a reason. Both are recorded, nothing is silently dropped.", target: '[data-tour="nav-/submissions"]' },
  { eyebrow: "Approval", title: "A person signs off", body: "Reviewers approve, request changes or reject from one queue. AdSnitch never publishes anything itself.", target: '[data-tour="nav-/approvals"]' },
  { eyebrow: "Audit ledger", title: "Every decision, on the record", body: "Checks, edits, disputes and signatures are written to an append-only log you can search and export.", target: '[data-tour="nav-/audit"]' },
];

export function startTour() {
  window.dispatchEvent(new Event(EVENT));
}

function visible(sel?: string): HTMLElement | null {
  if (!sel) return null;
  for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

const PAD = 8;
const CARD_W = 360;

export function ProductTour() {
  const [step, setStep] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const save = (i: number | null) => {
    try {
      if (i === null) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, String(i));
    } catch {}
  };

  useEffect(() => {
    const open = () => {
      let i = 0;
      try {
        const v = Number(localStorage.getItem(KEY));
        if (Number.isInteger(v) && v > 0 && v < STEPS.length) i = v;
      } catch {}
      setStep(i);
    };
    window.addEventListener(EVENT, open);
    return () => window.removeEventListener(EVENT, open);
  }, []);

  const go = useCallback((i: number) => {
    if (i >= STEPS.length) {
      save(null);
      setStep(null);
      return;
    }
    const n = Math.max(0, i);
    save(n);
    setStep(n);
  }, []);

  const close = useCallback(() => setStep(null), []); // keeps saved step so the tour resumes

  // Route to the step's page if needed, then track its target (it may mount late or move).
  const cur = step === null ? null : STEPS[step];
  useEffect(() => {
    if (!cur) return;
    if (cur.path && pathname !== cur.path) router.push(cur.path);
  }, [cur, pathname, router]);

  useLayoutEffect(() => {
    if (!cur) return;
    let raf = 0;
    let scrolled = false;
    const tick = () => {
      const el = visible(cur.target);
      if (el && !scrolled) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
        scrolled = true;
      }
      const r = el?.getBoundingClientRect() ?? null;
      setRect((p) => (p && r && p.x === r.x && p.y === r.y && p.width === r.width && p.height === r.height ? p : r));
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [cur]);

  useEffect(() => {
    if (step === null) return;
    cardRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(step + 1);
      else if (e.key === "ArrowLeft") go(step - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, go, close]);

  if (step === null || !cur) return null;

  const last = step === STEPS.length - 1;
  const vw = typeof window === "undefined" ? 1280 : window.innerWidth;
  const vh = typeof window === "undefined" ? 800 : window.innerHeight;
  const w = Math.min(CARD_W, vw - 32);

  let pos: CSSProperties = { left: (vw - w) / 2, top: Math.max(16, vh / 2 - 130) };
  if (rect) {
    const right = rect.right + PAD + 16;
    const below = rect.bottom + PAD + 16;
    if (right + w < vw - 16) pos = { left: right, top: Math.min(Math.max(16, rect.top - 8), vh - 300) };
    else if (below + 260 < vh) pos = { left: Math.min(Math.max(16, rect.left), vw - w - 16), top: below };
    else pos = { left: Math.min(Math.max(16, rect.left), vw - w - 16), top: Math.max(16, rect.top - PAD - 16 - 260) };
  }

  return (
    <div className="fixed inset-0 z-[90]">
      {/* Click-catcher; the dim comes from the spotlight's shadow so the target stays crisp. */}
      <div className="absolute inset-0" onClick={close} />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed rounded-2xl ring-2 ring-white/90 motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out"
        style={
          rect
            ? { left: rect.left - PAD, top: rect.top - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2, boxShadow: "0 0 0 9999px rgba(12, 28, 42, 0.42), 0 0 0 6px rgba(255,255,255,0.25), 0 18px 50px rgba(12,28,42,0.25)" }
            : { left: vw / 2, top: vh / 2, width: 0, height: 0, boxShadow: "0 0 0 9999px rgba(12, 28, 42, 0.42)" }
        }
      />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        tabIndex={-1}
        className="glass-strong fixed p-5 outline-none motion-safe:transition-[left,top] motion-safe:duration-300 motion-safe:ease-out"
        style={{ ...pos, width: w }}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="eyebrow text-text-muted">
            {cur.eyebrow} · {step + 1} of {STEPS.length}
          </p>
          <button type="button" onClick={close} aria-label="Close tour" className={`-m-1.5 rounded-lg p-1.5 text-text-muted hover:bg-panel-hover hover:text-text-primary ${focusRing}`}>
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <h2 id="tour-title" className="mt-2 text-lg font-semibold leading-snug text-text-primary">
          {cur.title}
        </h2>
        <p id="tour-body" className="mt-1.5 text-[13px] leading-relaxed text-text-secondary">
          {cur.body}
        </p>
        <div className="mt-4 flex gap-1" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full motion-safe:transition-colors ${i <= step ? "bg-ink" : "bg-border-default"}`} />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button type="button" onClick={() => go(STEPS.length)} className={`rounded-lg px-2 py-1.5 text-[13px] font-medium text-text-muted hover:text-text-primary ${focusRing}`}>
            Skip tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button type="button" onClick={() => go(step - 1)} className={`inline-flex items-center gap-1 rounded-lg border border-border-default bg-panel px-3 py-1.5 text-[13px] font-semibold text-text-primary hover:bg-panel-hover ${focusRing}`}>
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back
              </button>
            )}
            <button type="button" onClick={() => go(step + 1)} className={`inline-flex items-center gap-1 rounded-lg bg-ink px-3.5 py-1.5 text-[13px] font-semibold text-canvas hover:opacity-90 ${focusRing}`}>
              {last ? "Finish" : step === 0 ? "Start" : "Next"} {!last && <ArrowRight className="h-3.5 w-3.5" aria-hidden />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
