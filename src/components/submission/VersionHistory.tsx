"use client";

import React, { useMemo, useState } from "react";
import { DiffView } from "./HighlightedCopy";
import { humanize } from "./shared";
import { checkedByLabel } from "./report";

type Snap = { category: string; severity: string; flaggedText: string };
export interface VersionRow { id: string; version_number: number; content: string; created_at: string; created_by?: string | null }
export interface RunRow {
  id: string; submission_version_id: string; overall_score: number; compliance_rating: string; model_used: string;
  created_at: string; triggered_by?: string | null; triggered_by_name?: string | null; findings_snapshot?: Snap[];
}

const RATING: Record<string, { label: string; cls: string }> = {
  compliant: { label: "Safe to publish", cls: "text-status-success" },
  warning: { label: "Needs changes", cls: "text-status-warning" },
  non_compliant: { label: "Blocked", cls: "text-status-critical" },
};
const key = (f: Snap) => `${f.category}|${f.flaggedText.toLowerCase()}`;
const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function VersionHistory({ versions, runs, authorName }: { versions: VersionRow[]; runs: RunRow[]; authorName: string }) {
  // One row per version, carrying its latest check.
  const rows = useMemo(
    () =>
      [...versions]
        .sort((a, b) => a.version_number - b.version_number)
        .map((v) => ({ v, run: runs.filter((r) => r.submission_version_id === v.id).at(-1) ?? null })),
    [versions, runs]
  );
  const [a, setA] = useState<string | null>(rows.at(-2)?.v.id ?? null);
  const [b, setB] = useState<string | null>(rows.at(-1)?.v.id ?? null);
  if (rows.length === 0) return null;

  const A = rows.find((r) => r.v.id === a);
  const B = rows.find((r) => r.v.id === b);
  const [from, to] = A && B && A.v.version_number > B.v.version_number ? [B, A] : [A, B];
  const fromIssues = from?.run?.findings_snapshot ?? [];
  const toIssues = to?.run?.findings_snapshot ?? [];
  const toKeys = new Set(toIssues.map(key));
  const fromKeys = new Set(fromIssues.map(key));
  const fixed = fromIssues.filter((f) => !toKeys.has(key(f)));
  const added = toIssues.filter((f) => !fromKeys.has(key(f)));
  const delta = from?.run && to?.run ? to.run.overall_score - from.run.overall_score : null;
  const who = (r: (typeof rows)[number]) => r.run?.triggered_by_name || (r.v.created_by && r.v.created_by === r.run?.triggered_by ? authorName : null) || authorName;

  return (
    <section className="glass rounded-2xl p-6" aria-labelledby="versions-h">
      <h2 id="versions-h" className="text-base font-semibold text-text-primary">Version history</h2>
      <p className="mt-1 text-[13px] text-text-muted">Every edit and re-check is kept. Pick two versions to compare.</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-[13px]">
          <thead className="text-xs text-text-muted">
            <tr>
              <th className="py-2 pr-3 font-medium">Version</th><th className="py-2 pr-3 font-medium">Score</th><th className="py-2 pr-3 font-medium">Verdict</th>
              <th className="py-2 pr-3 font-medium">Date</th><th className="py-2 pr-3 font-medium">By</th>
              <th className="py-2 pr-3 font-medium">From</th><th className="py-2 font-medium">To</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.v.id} className="border-t border-border-default">
                <td className="py-2 pr-3 font-medium text-text-primary">v{r.v.version_number}</td>
                <td className="py-2 pr-3 tabular-nums">{r.run ? r.run.overall_score : "Not checked"}</td>
                <td className={`py-2 pr-3 ${r.run ? RATING[r.run.compliance_rating]?.cls ?? "" : "text-text-muted"}`}>
                  {r.run ? RATING[r.run.compliance_rating]?.label ?? humanize(r.run.compliance_rating) : "n/a"}
                  {r.run && checkedByLabel(r.run.model_used) === "Rules engine" && <span className="ml-1 text-text-muted">(rules only)</span>}
                </td>
                <td className="py-2 pr-3 text-text-secondary"><time dateTime={r.run?.created_at || r.v.created_at}>{fmt(r.run?.created_at || r.v.created_at)}</time></td>
                <td className="py-2 pr-3 text-text-secondary">{who(r)}</td>
                <td className="py-2 pr-3"><input type="radio" name="ver-from" aria-label={`Compare from v${r.v.version_number}`} checked={a === r.v.id} onChange={() => setA(r.v.id)} className="h-4 w-4 cursor-pointer" /></td>
                <td className="py-2"><input type="radio" name="ver-to" aria-label={`Compare to v${r.v.version_number}`} checked={b === r.v.id} onChange={() => setB(r.v.id)} className="h-4 w-4 cursor-pointer" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {from && to && from.v.id !== to.v.id ? (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="font-medium text-text-primary">v{from.v.version_number} → v{to.v.version_number}</span>
            {delta !== null && (
              <span className={`tabular-nums ${delta > 0 ? "text-status-success" : delta < 0 ? "text-status-critical" : "text-text-muted"}`}>
                Score {from.run!.overall_score} → {to.run!.overall_score} ({delta > 0 ? "+" : ""}{delta})
              </span>
            )}
            <span className="text-text-muted">{fixed.length} fixed · {added.length} new</span>
          </div>
          <div className="rounded-lg glass-inset p-4"><DiffView before={from.v.content} after={to.v.content} /></div>
          {(fixed.length > 0 || added.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {([["Fixed", fixed, "text-status-success"], ["New", added, "text-status-critical"]] as const).map(([label, list, cls]) => (
                <div key={label}>
                  <h3 className={`text-[13px] font-semibold ${cls}`}>{label} issues ({list.length})</h3>
                  <ul className="mt-1 space-y-1 text-[13px] text-text-secondary">
                    {list.length === 0 && <li className="text-text-muted">None</li>}
                    {list.map((f) => <li key={key(f)}>{humanize(f.severity)}: “{f.flaggedText}” <span className="text-text-muted">({humanize(f.category)})</span></li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-[13px] text-text-muted">{rows.length < 2 ? "Only one version so far. Edit or apply a fix to create the next one." : "Pick two different versions to compare."}</p>
      )}
    </section>
  );
}
