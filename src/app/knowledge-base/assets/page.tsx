"use client";

import { fmtDate } from "@/components/settings/format";
import React, { useRef, useState } from "react";
import Link from "next/link";
import { FileText, FileUp } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BuiltInBadge, FileDrop, KbError, KbHeader, Modal, Toast, UNVERIFIED, focusRing, useKb } from "@/components/knowledge/kb";
import { openFile, uploadFile } from "@/lib/files/store";

interface Asset {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
  reference?: string;
  excerpt?: string;
  chars?: number;
  uploaded?: boolean;
  /** Stored original in /api/files, when the upload succeeded. */
  fileId?: string;
  /** Built-in library record: read-only, metadata only. */
  builtIn?: boolean;
  meta?: [string, string][];
}

const sizeOf = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

export default function DocumentAssetsPage() {
  const [docs, setDocs, kb] = useKb<Asset>("/api/documents");
  const [open, setOpen] = useState<Asset | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const uploadRef = useRef<HTMLDialogElement>(null);
  const viewRef = useRef<HTMLDialogElement>(null);

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <KbHeader title="Assets and documents" intro="Brand books, logo rules, approved product imagery and the evidence documents that back your claims. Upload a file and we read its text so reviewers can quote it.">
          <Button size="sm" className="h-10" icon={<FileUp className="h-4 w-4" />} onClick={() => uploadRef.current?.showModal()}>Upload document</Button>
        </KbHeader>

        <KbError status={kb} />
        <section aria-labelledby="docs-h" className="glass rounded-2xl p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="docs-h" className="text-lg font-semibold text-text-primary">{kb.loading ? "Documents" : `${docs.length} document${docs.length === 1 ? "" : "s"}`}</h2>
            <p className="text-[13px] text-text-muted">
              To turn sentences into claims, use <Link href="/knowledge-base/claims" className={`rounded underline underline-offset-4 hover:text-text-primary ${focusRing}`}>Add claims, Pick from a document</Link>.
            </p>
          </div>
          {!kb.loading && !docs.length && <p className="mt-4 text-sm text-text-muted">No documents yet. Upload a study, lab report or legal memo to start.</p>}
          <ul className="-mx-3 mt-4 space-y-1">
            {docs.map((d) => (
              <li key={d.id}>
                <button onClick={() => { setOpen(d); viewRef.current?.showModal(); }}
                  className={`flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left hover:bg-panel-hover ${focusRing}`}>
                  <FileText className="h-5 w-5 shrink-0 text-text-muted" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{d.name}</p>
                    <p className="mt-1 text-[13px] text-text-muted">{d.type}, {d.size}, added {fmtDate(d.date)}{d.reference ? `, ${d.reference}` : ""}</p>
                  </div>
                  {d.builtIn ? <BuiltInBadge /> : <Badge variant="warning" size="xs">Unverified</Badge>}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Modal ref={uploadRef} title="Upload a document">
        <FileDrop label="Choose a file" hint="PDF, Word, image or text, up to 15 MB."
          onText={async (r, file) => {
            const up = await uploadFile(file, kb.brand);
            const d: Asset = {
              id: `doc-${Date.now()}`, name: r.fileName, size: sizeOf(file.size), uploaded: true,
              type: (r.fileName.split(".").pop() ?? "file").toUpperCase(), date: new Date().toISOString().slice(0, 10),
              excerpt: r.text.slice(0, 1200), chars: r.chars, fileId: up.id ?? undefined,
            };
            if (!(await setDocs((p) => [d, ...p]))) return;
            uploadRef.current?.close();
            setToast(`${r.fileName} added. ${r.chars.toLocaleString()} characters read.${up.id ? "" : ` The original file was not stored: ${up.error}`}`);
            window.setTimeout(() => setToast(null), 4000);
          }} />
        <p className="text-[13px] text-text-muted">Uploaded documents are {UNVERIFIED.toLowerCase()}.</p>
      </Modal>

      <Modal ref={viewRef} title={open?.name ?? "Document"} wide onClose={() => setOpen(null)}>
        {open && (open.builtIn ? (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center gap-2"><BuiltInBadge /><span className="text-[13px] text-text-muted">{open.reference}, {open.type}, {open.size}, added {fmtDate(open.date)}</span></div>
            {open.excerpt && <p className="leading-relaxed text-text-secondary">{open.excerpt}</p>}
            {!!open.meta?.length && (
              <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-[auto_1fr]">
                {open.meta.map(([k, v]) => <React.Fragment key={k}><dt className="text-[13px] text-text-muted">{k}</dt><dd className="text-text-primary">{v}</dd></React.Fragment>)}
              </dl>
            )}
            <p className="text-[13px] text-text-muted">Built-in library record. The file itself is not stored here, and this record can&apos;t be edited or removed.</p>
          </div>
        ) : open.excerpt ? (
          <>
            <p className="text-[13px] text-text-muted">{open.chars?.toLocaleString()} characters read. Showing the start. {UNVERIFIED}.</p>
            {open.fileId && (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={async () => { if (!(await openFile(open.fileId!))) setToast("Could not open the original. Try again."); }}
                  className={`rounded-lg border border-border-default bg-canvas px-4 py-2 text-sm font-medium hover:bg-panel-hover ${focusRing}`}>Open original</button>
                <button type="button" onClick={async () => { if (!(await openFile(open.fileId!, true))) setToast("Could not download the original. Try again."); }}
                  className={`rounded-lg border border-border-default bg-canvas px-4 py-2 text-sm font-medium hover:bg-panel-hover ${focusRing}`}>Download</button>
              </div>
            )}
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl border border-border-default bg-panel p-4 font-sans text-sm leading-relaxed text-text-secondary">{open.excerpt}</pre>
          </>
        ) : (
          <p className="text-sm text-text-secondary">No text was read from this document.</p>
        ))}
      </Modal>
      <Toast msg={toast} />
    </AppLayout>
  );
}
