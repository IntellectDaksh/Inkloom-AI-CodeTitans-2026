"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ACCEPTED_EXT, FindingItem, evidenceOf, humanize } from "./shared";
import { FindingSource } from "./FindingSource";
import { extractFile } from "./FileUpload";

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
  onConfirm: (reason: string, evidence: string, file: { name: string; text: string } | null) => void;
}) {
  const c = CFG[kind];
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [file, setFile] = useState<{ name: string; text: string } | null>(null);
  const [fileState, setFileState] = useState<{ reading: boolean; error?: string }>({ reading: false });
  const pick = async (f: File | undefined) => {
    if (!f) return;
    setFileState({ reading: true });
    try {
      const r = await extractFile(f);
      if (!r.text.trim()) throw new Error("No text could be read from this file.");
      setFile({ name: f.name, text: r.text });
      setFileState({ reading: false });
    } catch (e) {
      setFile(null);
      setFileState({ reading: false, error: (e as Error).message });
    }
  };
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
          <Button size="sm" loading={busy} disabled={empty || fileState.reading} onClick={() => onConfirm(reason.trim(), evidence.trim(), file)}>
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
            Counter-evidence <span className="font-normal text-text-muted">(optional)</span>
          </label>
          <textarea
            id="dispute-ev"
            rows={3}
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="Study ID, DOI, memo link or the passage that supports the claim"
            className="w-full resize-none rounded-lg glass-inset p-3 font-sans text-sm leading-relaxed text-text-primary focus:outline-none focus:ring-2 focus:ring-blue/50"
          />
          <label htmlFor="dispute-file" className="block text-[13px] text-text-secondary">
            Or attach a file (PDF, Word, image or text). Its text is read and stored with the dispute.
          </label>
          <input
            id="dispute-file"
            type="file"
            accept={ACCEPTED_EXT.join(",")}
            onChange={(e) => pick(e.target.files?.[0])}
            className="block w-full text-[13px] text-text-secondary file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-border-default file:bg-panel file:px-3 file:py-1.5 file:text-[13px] file:text-text-primary"
          />
          <p className="text-[13px] text-text-muted" aria-live="polite">
            {fileState.reading
              ? "Reading file…"
              : fileState.error
              ? <span className="text-status-critical">{fileState.error}</span>
              : file
              ? `${file.name}: ${file.text.length.toLocaleString()} characters read.`
              : null}
          </p>
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
      {(() => {
        const src = finding.source;
        const doi = src?.doi || finding.doi;
        const standards = src?.standards?.length ? src.standards.join(", ") : finding.assayStandard;
        return (
          <>
            {src?.chain && src.chain.length > 1 && (
              <div className="space-y-1">
                <p className="text-xs text-text-muted">Citation chain</p>
                <ol className="space-y-1.5 rounded-lg border border-border-default bg-panel p-3 text-[13px]">
                  {src.chain.map((c, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="w-4 shrink-0 tabular-nums text-text-muted">{i + 1}.</span>
                      <span className="min-w-0 break-words">
                        <span className="text-text-muted">{c.label}: </span>
                        {c.value}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <dl className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <dt className="text-xs text-text-muted">DOI</dt>
                <dd className="mt-0.5 break-words">
                  {doi ? (
                    src?.url ? (
                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:no-underline">{doi}</a>
                    ) : (
                      <>{doi} <span className="text-text-muted">(demo reference, not linked)</span></>
                    )
                  ) : (
                    <span className="text-text-muted">None on file</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Assay standard</dt>
                <dd className="mt-0.5 break-words">{standards || <span className="text-text-muted">None named in the record</span>}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-text-muted">SHA-256 of excerpt</dt>
                <dd className="mt-0.5 break-all font-mono text-[12px]">
                  {src?.excerptSha256 || <span className="font-sans text-text-muted">No library excerpt to hash</span>}
                </dd>
              </div>
            </dl>
            {finding.counter_evidence && (
              <div className="space-y-1">
                <p className="text-xs text-text-muted">Creator counter-evidence</p>
                <div className="space-y-1 rounded-lg border border-border-default bg-panel p-3 text-[13px]">
                  {finding.counter_evidence.text && <p className="break-words">{finding.counter_evidence.text}</p>}
                  {finding.counter_evidence.file && (
                    <p className="text-text-secondary">
                      File: {finding.counter_evidence.file.name} ({finding.counter_evidence.file.text.length.toLocaleString()} characters extracted)
                    </p>
                  )}
                  <p className="break-all font-mono text-[12px] text-text-muted">sha256 {finding.counter_evidence.sha256}</p>
                </div>
              </div>
            )}
          </>
        );
      })()}
      {ev && (
        <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 text-sm font-medium text-text-primary hover:underline cursor-pointer">
          {copied ? <Check className="h-4 w-4 text-status-success" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          <span aria-live="polite">{copied ? "Copied" : "Copy citation"}</span>
        </button>
      )}
    </Modal>
  );
}
