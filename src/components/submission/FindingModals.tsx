"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FindingItem, evidenceOf, humanize } from "./shared";
import { FindingSource } from "./FindingSource";

/** Native <dialog>: focus trap, Esc to close and inert background for free. */
export function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="modal-title"
      className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-2xl p-0 glass-strong text-text-primary backdrop:bg-ink/30 backdrop:backdrop-blur-xs"
    >
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 id="modal-title" className="text-lg font-semibold text-text-primary">
            {title}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-panel-hover hover:text-text-primary cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
        <div className="flex flex-col-reverse gap-2 border-t border-border-default pt-4 sm:flex-row sm:justify-end">{footer}</div>
      </div>
    </dialog>
  );
}

export type ReasonKind = "dispute" | "dismiss" | "override";

const CFG: Record<ReasonKind, { title: string; label: string; confirm: string; presets: string[]; note: string }> = {
  dismiss: {
    title: "Dismiss this issue",
    label: "Why is it OK to leave as is?",
    confirm: "Dismiss issue",
    presets: [
      "Brand guideline tolerance exception (BE-2026-1)",
      "Artistic stylistic license approved for video",
      "Non-substantive grammatical variation",
      "Pre-cleared with account manager",
    ],
    note: "Your reason is saved to the audit trail and shown to the approver.",
  },
  dispute: {
    title: "Dispute this issue",
    label: "Why do you think this flag is wrong?",
    confirm: "Send dispute",
    presets: [
      "FDA 21 CFR § 101.93 Safe Harbor Exemption",
      "Substantiated by Q3 Clinical Cohort Study",
      "Client Approved Creative Brief Exception",
      "Context restricted to internal ambassador kit",
    ],
    note: "A reviewer will look at your dispute. You can't approve your own ad.",
  },
  override: {
    title: "Record a reviewer override",
    label: "Authorisation memo",
    confirm: "Record override",
    presets: [
      "Override authorized under Legal Memo LM-2026-44",
      "Authorized exception per Regulatory Counsel Review RC-882",
      "Fair-use comparative marketing exemption validated under Lanham Act",
      "Pre-market clearance validated by VP Medical & Regulatory Affairs",
    ],
    note: "Overrides clear the issue from the score and are logged permanently.",
  },
};

export function ReasonModal({
  kind,
  finding,
  signer,
  busy,
  onClose,
  onConfirm,
}: {
  kind: ReasonKind;
  finding: FindingItem;
  signer?: string;
  busy: boolean;
  onClose: () => void;
  onConfirm: (reason: string, evidence: string) => void;
}) {
  const c = CFG[kind];
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const empty = !reason.trim();
  return (
    <Modal
      title={c.title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" loading={busy} disabled={empty} onClick={() => onConfirm(reason.trim(), evidence.trim())}>
            {c.confirm}
          </Button>
        </>
      }
    >
      <p className="rounded-lg border border-border-default bg-panel p-3 text-sm">
        “{finding.flaggedText}” <span className="text-text-muted">· {humanize(finding.category)}</span>
      </p>
      <div className="space-y-2">
        <p className="text-xs text-text-muted">Common reasons</p>
        <div className="flex flex-wrap gap-2">
          {c.presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setReason(p)}
              aria-pressed={reason === p}
              className={`rounded-lg border px-3 py-1.5 text-left text-[13px] transition-colors cursor-pointer ${
                reason === p ? "border-ink bg-panel-elevated text-text-primary" : "border-border-default bg-panel text-text-secondary hover:text-text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="reason" className="text-sm font-medium">
          {c.label}
        </label>
        <textarea
          id="reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full resize-none rounded-lg glass-inset p-3 font-sans text-sm leading-relaxed text-text-primary focus:outline-none focus:ring-2 focus:ring-blue/50"
        />
      </div>
      {kind === "dispute" && (
        <div className="space-y-2">
          <label htmlFor="dispute-ev" className="text-sm font-medium">
            Supporting source <span className="font-normal text-text-muted">(optional)</span>
          </label>
          <input
            id="dispute-ev"
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="Study ID, DOI or memo link"
            className="h-11 w-full rounded-lg glass-inset px-3 font-sans text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue/50"
          />
        </div>
      )}
      {kind === "override" && signer && (
        <p className="text-[13px] text-text-secondary">
          Signed as <span className="font-medium text-text-primary">{signer}</span>
        </p>
      )}
      <p className="text-[13px] text-text-muted">{c.note}</p>
      {empty && <p className="text-[13px] text-text-muted">Pick a reason above or write one to continue.</p>}
    </Modal>
  );
}

export function EvidenceModal({ finding, onClose, onApply }: { finding: FindingItem; onClose: () => void; onApply?: () => void }) {
  const ev = evidenceOf(finding);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!ev) return;
    try {
      await navigator.clipboard.writeText(`${ev.citation ? ev.citation + ": " : ""}${ev.excerpt}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <Modal
      title="Evidence source"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          {onApply && (
            <Button size="sm" onClick={onApply} icon={<Check className="h-4 w-4" />}>
              Apply suggested fix
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-1">
        <p className="text-xs text-text-muted">Flagged phrase</p>
        <p className="rounded-lg border border-border-default bg-panel p-3 text-sm">“{finding.flaggedText}”</p>
      </div>
      <FindingSource f={finding} />
      {(finding.doi || finding.assayStandard) && (
        <dl className="grid grid-cols-2 gap-3 text-[13px]">
          {finding.doi && (
            <div>
              <dt className="text-xs text-text-muted">DOI</dt>
              <dd className="mt-0.5 break-words">
                {finding.doi} <span className="text-text-muted">(demo reference, not linked)</span>
              </dd>
            </div>
          )}
          {finding.assayStandard && (
            <div>
              <dt className="text-xs text-text-muted">Standard</dt>
              <dd className="mt-0.5">{finding.assayStandard}</dd>
            </div>
          )}
        </dl>
      )}
      {ev && (
        <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 text-sm font-medium text-text-primary hover:underline cursor-pointer">
          {copied ? <Check className="h-4 w-4 text-status-success" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          <span aria-live="polite">{copied ? "Copied" : "Copy citation"}</span>
        </button>
      )}
    </Modal>
  );
}
