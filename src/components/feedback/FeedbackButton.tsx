"use client";

import React, { useEffect, useId, useRef, useState } from "react";

export const SUPPORT_EMAIL = "hello@adsnitch.cv";

const KINDS = [
  { id: "help", label: "I need help" },
  { id: "bug", label: "Report a bug" },
  { id: "suggestion", label: "Suggest something" },
  { id: "other", label: "Something else" },
] as const;

/**
 * Floating "Help & feedback" pill, bottom-right. Opens a small panel that sends straight to the
 * owner's inbox (/api/feedback) or opens an email. Sits above page content without covering it.
 */
export function FeedbackButton({ signedInEmail }: { signedInEmail?: string | null }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("help");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ busy: boolean; done: boolean; error: string | null }>({ busy: false, done: false, error: null });
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("textarea, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ busy: true, done: false, error: null });
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, message, email: signedInEmail ? undefined : email, page: location.pathname }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.success) throw new Error(d.error || "Couldn't send.");
      setState({ busy: false, done: true, error: null });
      setMessage("");
    } catch (err) {
      setState({ busy: false, done: false, error: (err as Error).message });
    }
  };

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`AdSnitch: ${KINDS.find((k) => k.id === kind)?.label}`)}&body=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 print:hidden">
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="w-[min(92vw,360px)] rounded-2xl border border-black/10 bg-white p-4 text-[#0b1620] shadow-[0_24px_60px_-12px_rgba(16,45,64,0.35)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id={titleId} className="text-[15px] font-semibold">Talk to the founder</h2>
              <p className="mt-0.5 text-[13px] text-[#536474]">Help, ideas, bugs, anything. It goes straight to me.</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#536474] hover:bg-black/5">
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          </div>

          {state.done ? (
            <div className="mt-4 rounded-xl bg-[#eef7f1] p-3 text-[13px] text-[#1f6b3d]" role="status">
              Got it. I read every message{signedInEmail || email ? " and reply by email" : ""}. Thank you.
              <button type="button" onClick={() => setState({ busy: false, done: false, error: null })} className="mt-2 block font-medium underline underline-offset-4">Send another</button>
            </div>
          ) : (
            <form onSubmit={send} className="mt-3 space-y-3">
              <fieldset>
                <legend className="sr-only">What is this about?</legend>
                <div className="flex flex-wrap gap-1.5">
                  {KINDS.map((k) => (
                    <label key={k.id} className={`cursor-pointer rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors ${kind === k.id ? "border-[#0b1620] bg-[#0b1620] text-white" : "border-black/15 text-[#23394a] hover:bg-black/5"}`}>
                      <input type="radio" name="fb-kind" value={k.id} checked={kind === k.id} onChange={() => setKind(k.id)} className="sr-only" />
                      {k.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="block text-[13px] font-medium">
                Message
                <textarea
                  required
                  minLength={5}
                  maxLength={5000}
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={kind === "bug" ? "What happened, and what did you expect?" : "Tell me what you need…"}
                  className="mt-1 w-full resize-y rounded-lg border border-black/15 px-3 py-2 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-[#2697bd]"
                />
              </label>
              {!signedInEmail && (
                <label className="block text-[13px] font-medium">
                  Your email <span className="font-normal text-[#536474]">(so I can reply)</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" spellCheck={false} placeholder="you@company.com"
                    className="mt-1 h-10 w-full rounded-lg border border-black/15 px-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-[#2697bd]" />
                </label>
              )}
              {state.error && <p role="alert" className="text-[13px] text-[#c0392b]">{state.error}</p>}
              <div className="flex items-center justify-between gap-3">
                <a href={mailto} className="text-[13px] text-[#536474] underline-offset-4 hover:underline">Or email {SUPPORT_EMAIL}</a>
                <button type="submit" disabled={state.busy} className="h-10 rounded-full bg-[#0b1620] px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
                  {state.busy ? "Sending…" : "Send"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/40 bg-[#0b1620] px-4 text-[13px] font-semibold text-white shadow-[0_10px_30px_-8px_rgba(11,22,32,0.55)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2697bd]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-5 4v-4h-.5A1.5 1.5 0 0 1 4 14.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        Help &amp; feedback
      </button>
    </div>
  );
}
