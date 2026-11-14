"use client";

import React, { useEffect, useState } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import { getFile, openFile } from "@/lib/files/store";
import { formatBytes } from "./shared";

export interface SourceMeta {
  fileName: string;
  mime?: string;
  size?: number;
  pages?: number;
  method?: string;
  fileId?: string;
}

const READ_AS: Record<string, string> = {
  plain: "Read directly",
  docx: "Read from Word",
  "gemini-ocr": "Scanned with AI OCR",
  paste: "Pasted text",
};

const link =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-border-default bg-panel px-3 text-[13px] font-medium text-text-primary hover:bg-panel-hover focus-visible:outline-2 focus-visible:outline-blue cursor-pointer";

/** Shows what file the text came from and links the original when this device still has it. */
export function SourcePanel({ src }: { src: SourceMeta }) {
  const [here, setHere] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    if (!src.fileId) setHere(false);
    else getFile(src.fileId).then((f) => live && setHere(!!f));
    return () => {
      live = false;
    };
  }, [src.fileId]);

  const rows: [string, string][] = [
    ["File", src.fileName],
    ["Type", src.mime || "Unknown"],
    ...(src.size ? [["Size", formatBytes(src.size)] as [string, string]] : []),
    ...(src.pages ? [["Pages", String(src.pages)] as [string, string]] : []),
    ["How it was read", READ_AS[src.method || ""] || "Read directly"],
  ];

  return (
    <section aria-label="Source file" className="rounded-xl border border-border-default bg-panel-elevated p-4">
      <h3 className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
        <FileText className="h-3.5 w-3.5" aria-hidden /> Source
      </h3>
      <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1.5 text-[13px] sm:grid-cols-[auto_1fr]">
        {rows.map(([k, v]) => (
          <React.Fragment key={k}>
            <dt className="text-text-muted">{k}</dt>
            <dd className="min-w-0 break-words text-text-primary">{v}</dd>
          </React.Fragment>
        ))}
      </dl>
      {src.method === "gemini-ocr" && <p className="mt-2 text-[13px] text-status-warning">OCR can misread words. Compare the text with the original.</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {here ? (
          <>
            <button type="button" className={link} onClick={() => openFile(src.fileId!)}>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Open original file
            </button>
            <button type="button" className={link} onClick={() => openFile(src.fileId!, true)}>
              <Download className="h-3.5 w-3.5" aria-hidden /> Download
            </button>
          </>
        ) : here === false ? (
          <p className="text-[13px] text-text-secondary">
            Original file is stored on the device it was uploaded from (cloud storage arrives with Supabase).
          </p>
        ) : null}
      </div>
    </section>
  );
}
