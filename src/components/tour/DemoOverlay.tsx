"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, FileUp, Pause, Play, ShieldAlert, Sparkles } from "lucide-react";
import { focusRing, useMe } from "../guide/workspace";

// First-run product demo. Server (profiles.demo_seen_at) is the source of truth; localStorage is only a cache.
const cacheKey = (id: string) => `adsnitch:demo-seen:${id}`;
const STEP_MS = 24_000; // 5 steps ≈ 2 minutes

type Step = { eyebrow: string; title: string; body: string; scene: "upload" | "findings" | "fix" | "approve" | "done" };

const STEPS: Step[] = [
  { eyebrow: "1 · Upload", title: "Drop in an ad, any format", body: "Paste copy or upload Word, PDF or an image. AdSnitch pulls out every claim and checks it against your brand's evidence library and the platform rules.", scene: "upload" },
  { eyebrow: "2 · Findings", title: "Every risky line gets flagged", body: "Each claim is highlighted with why it was flagged, how severe it is and the source it was checked against. The ad gets a 0–100 compliance score.", scene: "findings" },
  { eyebrow: "3 · Fix", title: "Accept a safer rewrite, or dispute it", body: "Take the suggested rewrite in one click, edit it yourself, or dispute a finding with counter-evidence. Nothing is silently dropped.", scene: "fix" },
  { eyebrow: "4 · Approve", title: "A person signs off", body: "Reviewers approve, request changes or reject from one queue. Every decision lands in an append-only audit log you can export.", scene: "approve" },
  { eyebrow: "You're set", title: "Check your first ad", body: "Start with New check in the sidebar. You can replay the guided tour any time from the dashboard or ⌘K.", scene: "done" },
];

function Scene({ scene }: { scene: Step["scene"] }) {
  const line = "rounded bg-border-default h-2.5";
  if (scene === "upload")
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border-strong p-6 text-center">
        <FileUp className="h-8 w-8 text-text-muted motion-safe:animate-bounce" aria-hidden />
        <p className="text-sm font-medium text-text-primary">summer-promo.pdf</p>
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-border-default">
          <div className="h-full w-2/3 rounded-full bg-ink motion-safe:animate-pulse" />
        </div>
        <p className="text-xs text-text-muted">Extracting claims…</p>
      </div>
    );
  if (scene === "findings")
    return (
      <div className="space-y-3 p-2 text-[13px] leading-relaxed text-text-secondary">
        <p>
          Our formula is <mark className="rounded bg-status-critical/15 px-1 text-status-critical">clinically proven to burn fat</mark> and{" "}
          <mark className="rounded bg-status-warning/15 px-1 text-status-warning">loved by 10,000+ athletes</mark>.
        </p>
        <div className="flex items-center gap-2 rounded-lg border border-border-default p-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 text-status-critical" aria-hidden />
          <span>High: no clinical study on file supports this claim.</span>
        </div>
        <p className="text-xs font-semibold text-text-primary">Score 42 / 100</p>
      </div>
    );
  if (scene === "fix")
    return (
      <div className="space-y-2 p-2 text-[13px]">
        <p className="rounded-lg bg-status-critical/10 p-2.5 text-status-critical line-through">clinically proven to burn fat</p>
        <p className="rounded-lg bg-status-success/10 p-2.5 text-status-success">formulated to support an active lifestyle</p>
        <div className="flex gap-2 pt-1">
          <span className="rounded-md bg-ink px-2.5 py-1 text-xs font-semibold text-canvas">Accept rewrite</span>
          <span className="rounded-md border border-border-default px-2.5 py-1 text-xs font-semibold text-text-primary">Dispute</span>
        </div>
      </div>
    );
  if (scene === "approve")
    return (
      <div className="space-y-2 p-2">
        {["Summer promo · score 91", "Launch email · score 78", "Story ad · score 64"].map((t, i) => (
          <div key={t} className="flex items-center justify-between rounded-lg border border-border-default p-2.5 text-[13px]">
            <span className="text-text-primary">{t}</span>
            <span className={`text-xs font-semibold ${i === 0 ? "text-status-success" : "text-text-muted"}`}>{i === 0 ? "Approved" : "Pending"}</span>
          </div>
        ))}
        <div className={`${line} w-1/2`} />
      </div>
    );
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <CheckCircle2 className="h-10 w-10 text-status-success" aria-hidden />
      <Sparkles className="h-4 w-4 text-text-muted" aria-hidden />
    </div>
  );
}

export function DemoOverlay() {
  const me = useMe();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!me?.id) return;
    try {
      if (localStorage.getItem(cacheKey(me.id)) === "1") return;
    } catch {}
    let live = true;
    fetch("/api/profile/demo")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!live || !d?.success) return;
        if (d.seen) {
          try { localStorage.setItem(cacheKey(me.id), "1"); } catch {}
        } else setOpen(true);
      })
      .catch(() => {});
    return () => { live = false; };
  }, [me?.id]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) setPaused(true); // no auto-advance for reduced motion; user steps manually
  }, []);

  const finish = useCallback(() => {
    setOpen(false);
    if (!me?.id) return;
    try { localStorage.setItem(cacheKey(me.id), "1"); } catch {}
    fetch("/api/profile/demo", { method: "POST" }).catch(() => {});
  }, [me?.id]);

  const last = step === STEPS.length - 1;
  const next = useCallback(() => (last ? finish() : setStep((s) => s + 1)), [last, finish]);

  useEffect(() => {
    if (!open || paused || last) return;
    const t = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [open, paused, step, last]);

  // Focus trap + Esc to skip.
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish();
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;
      const els = Array.from(ref.current.querySelectorAll<HTMLElement>("button:not([disabled])"));
      if (!els.length) return;
      const first = els[0], end = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); end.focus(); }
      else if (!e.shiftKey && document.activeElement === end) { e.preventDefault(); first.focus(); }
      else if (!ref.current.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [open, finish]);

  if (!open) return null;
  const cur = STEPS[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="demo-title" aria-describedby="demo-body" className="glass-strong w-full max-w-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow text-text-muted">Product demo · {cur.eyebrow}</p>
          <button type="button" onClick={finish} className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold text-text-primary hover:bg-panel-hover ${focusRing}`}>
            Skip demo
          </button>
        </div>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div aria-live="polite">
            <h2 id="demo-title" className="text-2xl font-semibold leading-tight text-text-primary">{cur.title}</h2>
            <p id="demo-body" className="mt-3 text-sm leading-relaxed text-text-secondary">{cur.body}</p>
          </div>
          <div key={step} aria-hidden="true" className={`min-h-[200px] rounded-2xl border border-border-default bg-canvas-elevated p-3 ${reduced ? "" : "motion-safe:animate-[fadeIn_.4s_ease-out]"}`}>
            <Scene scene={cur.scene} />
          </div>
        </div>
        <div className="mt-6 flex gap-1" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-border-default">
              <span
                key={`${i}-${step}-${paused}`}
                className="block h-full bg-ink"
                style={
                  i < step || (i === step && last)
                    ? { width: "100%" }
                    : i === step && !paused
                      ? { width: "100%", animation: `demoFill ${STEP_MS}ms linear` }
                      : { width: "0%" }
                }
              />
            </span>
          ))}
        </div>
        <style>{`@keyframes demoFill{from{width:0}to{width:100%}}@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>
        <div className="mt-5 flex items-center justify-between gap-2">
          <button type="button" onClick={() => setPaused((p) => !p)} disabled={last} aria-label={paused ? "Play demo" : "Pause demo"} className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-text-muted hover:text-text-primary disabled:opacity-40 ${focusRing}`}>
            {paused ? <Play className="h-3.5 w-3.5" aria-hidden /> : <Pause className="h-3.5 w-3.5" aria-hidden />} {paused ? "Play" : "Pause"}
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button type="button" onClick={() => setStep((s) => s - 1)} className={`inline-flex items-center gap-1 rounded-lg border border-border-default bg-panel px-3 py-2 text-[13px] font-semibold text-text-primary hover:bg-panel-hover ${focusRing}`}>
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back
              </button>
            )}
            <button type="button" data-autofocus onClick={next} className={`inline-flex items-center gap-1 rounded-lg bg-ink px-4 py-2 text-[13px] font-semibold text-canvas hover:opacity-90 ${focusRing}`}>
              {last ? "Get started" : "Next"} {!last && <ArrowRight className="h-3.5 w-3.5" aria-hidden />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
