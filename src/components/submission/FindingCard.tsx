"use client";

import React from "react";
import { AlertTriangle, Check, ChevronDown, Scale, X } from "lucide-react";
import { FindingSource } from "./FindingSource";
import { Button } from "@/components/ui/Button";
import { FindingItem, FindingStatus, SEVERITY, evidenceOf, humanize, sevOf } from "./shared";

const STATUS_LABEL: Partial<Record<FindingStatus, string>> = {
  resolved: "Fixed",
  dismissed: "Dismissed",
  overridden: "Overridden",
  disputed: "Disputed",
  ignored: "Ignored",
};

export function FindingCard({
  finding: f,
  status,
  expanded,
  selected,
  busy,
  onToggle,
  onApply,
  onDismiss,
  onDispute,
  onOverride,
  onEvidence,
}: {
  finding: FindingItem;
  status: FindingStatus;
  expanded: boolean;
  selected: boolean;
  busy: boolean;
  onToggle: () => void;
  onApply: () => void;
  onDismiss: () => void;
  onDispute: () => void;
  onOverride: () => void;
  onEvidence: () => void;
}) {
  const sev = SEVERITY[sevOf(f.severity)];
  const ev = evidenceOf(f);
  const settled = status !== "open" && status !== "disputed";
  const rule = f.ruleId || f.rule_ref;
  const bodyId = `fc-body-${f.id}`;

  return (
    <article
      id={`fc-${f.id}`}
      className={`scroll-mt-24 rounded-xl border bg-panel transition-colors ${
        selected ? "border-ink" : "border-border-default"
      } ${settled ? "opacity-70" : ""}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={bodyId}
        className="flex w-full items-start gap-3 rounded-xl p-4 text-left focus-visible:outline-2 focus-visible:outline-blue cursor-pointer"
      >
        <span className={`mt-0.5 shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${sev.chip}`}>{sev.label}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-text-primary">{humanize(f.category)}</span>
          <span className={`mt-1 block truncate text-[13px] text-text-secondary ${status === "resolved" ? "line-through" : ""}`}>
            “{f.flaggedText}”
          </span>
        </span>
        {STATUS_LABEL[status] && (
          <span className="shrink-0 rounded-md border border-border-default bg-panel-elevated px-2 py-0.5 text-xs text-text-secondary">
            {STATUS_LABEL[status]}
          </span>
        )}
        <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 text-text-muted transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {expanded && (
        <div id={bodyId} className="space-y-4 border-t border-border-subtle px-4 pb-4 pt-4">
          <section>
            <h4 className="text-xs font-medium text-text-muted">Why this was flagged</h4>
            <p className="mt-1 text-sm leading-relaxed text-text-primary">{f.explanation || "This phrase does not match an approved claim for this brand."}</p>
          </section>

          <dl className="grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <dt className="text-xs text-text-muted">Rule</dt>
              <dd className="mt-0.5 break-words text-text-primary">{rule ? humanize(rule) : humanize(f.category)}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Confidence</dt>
              <dd className="mt-0.5 text-text-primary">{f.confidence ? humanize(f.confidence) : "Not given"}</dd>
            </div>
          </dl>

          <FindingSource f={f} />
          {(f.source || ev) && (
            <button type="button" onClick={onEvidence} className="text-[13px] font-medium text-text-primary underline-offset-2 hover:underline cursor-pointer">
              Compare with flagged phrase
            </button>
          )}

          {f.suggestedCorrection && (
            <section>
              <h4 className="text-xs font-medium text-text-muted">Suggested fix</h4>
              <p className="mt-1 rounded-lg border border-status-success/30 bg-status-success/10 p-3 text-sm leading-relaxed text-text-primary">
                {f.suggestedCorrection}
              </p>
            </section>
          )}

          {(f.dispute_reason || f.dismissal_reason || f.override_memo) && (
            <p className="rounded-lg border border-border-default bg-panel-elevated p-3 text-[13px] text-text-secondary">
              {status === "disputed" && <>Disputed: {f.dispute_reason}</>}
              {status === "dismissed" && <>Dismissed: {f.dismissal_reason}</>}
              {status === "overridden" && (
                <>
                  Override: {f.override_memo}
                  {f.overridden_by ? ` (by ${f.overridden_by})` : ""}
                </>
              )}
            </p>
          )}

          {!settled && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border-subtle pt-4">
              {f.suggestedCorrection && (
                <Button size="sm" onClick={onApply} loading={busy} icon={<Check className="h-4 w-4" />}>
                  Apply fix
                </Button>
              )}
              <Button size="sm" variant="secondary" onClick={onDismiss} icon={<X className="h-4 w-4" />}>
                Dismiss
              </Button>
              <Button size="sm" variant="ghost" onClick={onDispute} disabled={status === "disputed"} icon={<AlertTriangle className="h-4 w-4" />}>
                {status === "disputed" ? "Disputed" : "Dispute"}
              </Button>
              <Button size="sm" variant="ghost" onClick={onOverride} icon={<Scale className="h-4 w-4" />}>
                Override
              </Button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
