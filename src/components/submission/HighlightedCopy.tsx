"use client";

import React from "react";
import { FindingItem, SEVERITY, sevOf, wordDiff } from "./shared";

type Seg = { text: string; finding?: FindingItem };

/** Splits copy into plain + highlighted segments. Overlaps keep the earlier match. */
function segment(content: string, findings: FindingItem[]): Seg[] {
  const lower = content.toLowerCase();
  const ranges = findings
    .map((f) => {
      const i = f.flaggedText ? lower.indexOf(f.flaggedText.toLowerCase()) : -1;
      return { f, s: i, e: i + (f.flaggedText?.length || 0) };
    })
    .filter((r) => r.s >= 0 && r.e > r.s)
    .sort((a, b) => a.s - b.s);
  const out: Seg[] = [];
  let pos = 0;
  for (const r of ranges) {
    if (r.s < pos) continue;
    if (r.s > pos) out.push({ text: content.slice(pos, r.s) });
    out.push({ text: content.slice(r.s, r.e), finding: r.f });
    pos = r.e;
  }
  if (pos < content.length) out.push({ text: content.slice(pos) });
  return out;
}

export function HighlightedCopy({
  content,
  findings,
  selectedId,
  onSelect,
}: {
  content: string;
  /** Only open findings should be passed in. */
  findings: FindingItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="whitespace-pre-wrap break-words font-sans text-[15px] leading-8 text-text-primary">
      {segment(content, findings).map((s, i) =>
        s.finding ? (
          <button
            key={i}
            id={`hl-${s.finding.id}`}
            type="button"
            onClick={() => onSelect(s.finding!.id)}
            aria-label={`${s.text}: ${SEVERITY[sevOf(s.finding.severity)].label} issue. Show details.`}
            className={`rounded border px-1 py-0.5 text-left font-medium transition-shadow focus-visible:outline-2 focus-visible:outline-blue cursor-pointer ${
              SEVERITY[sevOf(s.finding.severity)].mark
            } ${selectedId === s.finding.id ? "ring-2 ring-ink ring-offset-1 ring-offset-canvas" : ""}`}
          >
            {s.text}
          </button>
        ) : (
          <React.Fragment key={i}>{s.text}</React.Fragment>
        )
      )}
    </div>
  );
}

export function DiffView({ before, after }: { before: string; after: string }) {
  if (before === after)
    return <p className="text-sm text-text-muted">No changes yet. Apply a fix or edit the copy to see a before and after.</p>;
  return (
    <div className="whitespace-pre-wrap break-words font-sans text-[15px] leading-8 text-text-primary">
      {wordDiff(before, after).map((p, i) =>
        p.kind === "same" ? (
          <React.Fragment key={i}>{p.text}</React.Fragment>
        ) : p.kind === "del" ? (
          <del key={i} className="rounded bg-status-critical/10 px-0.5 text-status-critical">
            <span className="sr-only">removed: </span>
            {p.text}
          </del>
        ) : (
          <ins key={i} className="rounded bg-status-success/15 px-0.5 text-status-success no-underline">
            <span className="sr-only">added: </span>
            {p.text}
          </ins>
        )
      )}
    </div>
  );
}
