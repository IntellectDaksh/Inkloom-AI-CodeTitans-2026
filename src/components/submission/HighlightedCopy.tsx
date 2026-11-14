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
  // Split segments on newlines so each source line gets its own numbered row.
  const lines: Seg[][] = [[]];
  for (const seg of segment(content, findings)) {
    seg.text.split(/\r?\n/).forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, finding: seg.finding });
    });
  }
  const seen = new Set<string>();
  return (
    <ol className="font-sans text-[15px] leading-8 text-text-primary" aria-label="Ad copy with line numbers">
      {lines.map((line, n) => (
        <li key={n} className="flex gap-3">
          <span aria-hidden className="w-6 shrink-0 select-none text-right text-[12px] tabular-nums text-text-muted">{n + 1}</span>
          <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">
            {line.length === 0 ? " " : line.map((s, i) =>
              s.finding ? (
                <button
                  key={i}
                  id={seen.has(s.finding.id) ? undefined : (seen.add(s.finding.id), `hl-${s.finding.id}`)}
                  type="button"
                  onClick={() => onSelect(s.finding!.id)}
                  aria-label={`Line ${n + 1}, ${s.text}: ${SEVERITY[sevOf(s.finding.severity)].label} issue. Show details.`}
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
          </span>
        </li>
      ))}
    </ol>
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
