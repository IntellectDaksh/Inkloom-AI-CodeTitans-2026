"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Shows the first part of long content with a soft fade and a "Show all" toggle. The toggle only
 * appears when the content is actually taller than `collapsedHeight`, so short text looks normal.
 */
export function Expandable({
  children,
  collapsedHeight = 224,
  moreLabel = "Show all",
  lessLabel = "Show less",
  className = "",
}: {
  children: React.ReactNode;
  collapsedHeight?: number;
  moreLabel?: string;
  lessLabel?: string;
  className?: string;
}) {
  const inner = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const [full, setFull] = useState(0);

  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const measure = () => {
      setFull(el.scrollHeight);
      setOverflows(el.scrollHeight > collapsedHeight + 24);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [collapsedHeight]);

  const clipped = overflows && !open;
  return (
    <div className={className}>
      <div
        className="relative overflow-hidden transition-[max-height] duration-300 ease-out motion-reduce:transition-none"
        style={{ maxHeight: clipped ? collapsedHeight : overflows ? full : undefined }}
      >
        <div ref={inner}>{children}</div>
        {clipped && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--color-panel,#fff)] to-transparent" />
        )}
      </div>
      {overflows && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-2 inline-flex items-center gap-1 rounded-md px-1 py-1 text-[13px] font-medium text-text-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-blue"
        >
          {open ? lessLabel : moreLabel}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
      )}
    </div>
  );
}
