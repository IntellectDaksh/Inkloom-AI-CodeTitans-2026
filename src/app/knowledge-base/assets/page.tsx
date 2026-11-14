"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { FileText, FileUp } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FileDrop, KbHeader, Modal, Toast, UNVERIFIED, focusRing, useStored } from "@/components/knowledge/kb";

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
}

// Demo documents: fictional, not independently verified.
const INITIAL: Asset[] = [
  { id: "doc_ct_2024", name: "Clinical trial report APX-2024-C3.pdf", size: "2.4 MB", type: "PDF", date: "2026-10-12", reference: "DOI 10.1016/j.nutres.2024.108421" },
  { id: "doc_iso", name: "Bioavailability assay ISO-NTR.pdf", size: "1.1 MB", type: "PDF", date: "2026-09-18", reference: "ISO 22196 Annex C" },
  { id: "doc_brand", name: "Apex Nutrition brand voice v2.4.docx", size: "840 KB", type: "DOCX", date: "2026-11-01" },
  { id: "doc_wada", name: "Banned substance batch test 2025.pdf", size: "1.8 MB", type: "PDF", date: "2026-08-30", reference: "LGC-IS-2026-Q1" },
];

const sizeOf = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function DocumentAssetsPage() {
  const [docs, setDocs] = useStored<Asset[]>("adsnitch:kb-docs", INITIAL);
  const [open, setOpen] = useState<Asset | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const uploadRef = useRef<HTMLDialogElement>(null);
  const viewRef = useRef<HTMLDialogElement>(null);

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <KbHeader title="Evidence documents" intro="Studies, lab reports and legal memos that back your claims. Upload a file and we read its text so reviewers can quote it.">
          <Button size="sm" className="h-10" icon={<FileUp className="h-4 w-4" />} onClick={() => uploadRef.current?.showModal()}>Upload document</Button>
        </KbHeader>

        <section aria-labelledby="docs-h" className="glass rounded-2xl p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="docs-h" className="text-lg font-semibold text-text-primary">{docs.length} documents</h2>
            <p className="text-[13px] text-text-muted">
              To turn sentences into claims, use <Link href="/knowledge-base/claims" className={`rounded underline underline-offset-4 hover:text-text-primary ${focusRing}`}>Add claims, Pick from a document</Link>.
            </p>
          </div>
          <ul className="-mx-3 mt-4 space-y-1">
            {docs.map((d) => (
              <li key={d.id}>
                <button onClick={() => { setOpen(d); viewRef.current?.showModal(); }}
                  className={`flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left hover:bg-panel-hover ${focusRing}`}>
                  <FileText className="h-5 w-5 shrink-0 text-text-muted" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{d.name}</p>
                    <p className="mt-1 text-[13px] text-text-muted">{d.type}, {d.size}, added {dateFmt.format(new Date(d.date))}{d.reference ? `, ${d.reference}` : ""}</p>
                  </div>
                  <Badge variant={d.uploaded ? "warning" : "draft"} size="xs">{d.uploaded ? "Unverified" : "Demo"}</Badge>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Modal ref={uploadRef} title="Upload a document">
        <FileDrop label="Choose a file" hint="PDF, Word, image or text, up to 15 MB."
          onText={(r, file) => {
            const d: Asset = {
              id: `doc-${Date.now()}`, name: r.fileName, size: sizeOf(file.size), uploaded: true,
              type: (r.fileName.split(".").pop() ?? "file").toUpperCase(), date: new Date().toISOString().slice(0, 10),
              excerpt: r.text.slice(0, 1200), chars: r.chars,
            };
            setDocs((p) => [d, ...p]);
            uploadRef.current?.close();
            setToast(`${r.fileName} added. ${r.chars.toLocaleString()} characters read. Saved on this device.`);
            window.setTimeout(() => setToast(null), 4000);
          }} />
        <p className="text-[13px] text-text-muted">Uploaded documents are {UNVERIFIED.toLowerCase()}.</p>
      </Modal>

      <Modal ref={viewRef} title={open?.name ?? "Document"} wide onClose={() => setOpen(null)}>
        {open && (open.excerpt ? (
          <>
            <p className="text-[13px] text-text-muted">{open.chars?.toLocaleString()} characters read. Showing the start. {UNVERIFIED}.</p>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl border border-border-default bg-panel p-4 font-sans text-sm leading-relaxed text-text-secondary">{open.excerpt}</pre>
          </>
        ) : (
          <p className="text-sm text-text-secondary">Demo document. Its contents are fictional and not stored here. Upload a real file to read its text.</p>
        ))}
      </Modal>
      <Toast msg={toast} />
    </AppLayout>
  );
}
