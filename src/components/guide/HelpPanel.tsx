"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CircleHelp, X } from "lucide-react";
import { findPage } from "./nav";
import { focusRing } from "./workspace";

const FALLBACK: [string, string, string] = [
  "AdSnitch checks ad copy against your brand's approved claims and rules before it goes live.",
  "Every flagged issue says why, cites your own evidence and suggests a fix.",
  "A person always makes the final call in Approvals.",
];

/** "?" button + slide-over explaining the current page in three bullets. */
export function HelpButton() {
  const path = usePathname() ?? "/";
  const page = findPage(path);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

  useEffect(() => setOpen(false), [path]);

  const bullets = page?.help ?? FALLBACK;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Help for this page"
        aria-expanded={open}
        className={`flex h-10 w-10 items-center justify-center rounded-lg border border-border-default bg-panel text-text-secondary transition-colors hover:bg-panel-hover hover:text-text-primary ${focusRing}`}
      >
        <CircleHelp className="h-4 w-4" aria-hidden="true" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50" role="presentation">
          <div className="absolute inset-0 bg-ink/20 backdrop-blur-[2px]" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            className="glass-strong absolute inset-y-0 right-0 flex w-full max-w-sm flex-col rounded-none border-l border-border-subtle p-6 shadow-2xl overscroll-contain"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] text-text-muted">How this page works</p>
                <h2 id="help-title" className="mt-1 text-xl font-semibold text-text-primary">
                  {page?.name ?? "AdSnitch"}
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close help"
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-text-muted hover:bg-panel-hover hover:text-text-primary ${focusRing}`}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <ol className="mt-6 space-y-4">
              {bullets.map((b, i) => (
                <li key={b} className="flex gap-3 text-sm leading-relaxed text-text-secondary">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border-default bg-panel text-xs font-semibold text-text-primary">
                    {i + 1}
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ol>
            <p className="mt-auto border-t border-border-subtle pt-4 text-[13px] text-text-muted">
              Press Ctrl+K (or Cmd+K) anywhere to search or jump to an action.
            </p>
          </aside>
        </div>
      )}
    </>
  );
}

/** Small inline explainer. Shows on hover and keyboard focus. */
export function InfoTip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={`What is ${label}?`}
        className={`flex h-6 w-6 items-center justify-center rounded-full text-text-muted hover:text-text-primary ${focusRing}`}
        onClick={(e) => e.preventDefault()}
      >
        <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-40 mb-2 w-60 -translate-x-1/2 rounded-lg border border-border-default bg-panel-elevated p-3 text-xs font-normal leading-relaxed text-text-secondary opacity-0 shadow-lg transition-opacity delay-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        {children}
      </span>
    </span>
  );
}
