"use client";

import React, { forwardRef, useId, useRef, useState } from "react";
import Link from "next/link";
import { FileUp, Loader2, X } from "lucide-react";

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";
export const field = `h-10 rounded-lg border border-border-default bg-panel px-3 text-base text-text-primary sm:text-sm ${focusRing}`;
export const area = `rounded-lg border border-border-default bg-panel p-3 text-base text-text-primary placeholder:text-text-muted sm:text-sm ${focusRing}`;
export const labelCls = "flex flex-col gap-1 text-[13px] text-text-muted";

export const UNVERIFIED = "Unverified until a reviewer confirms";

// ---------- /api/extract (owned by another agent; contract in docs/REVAMP-BRIEF.md) ----------
export interface Extracted {
  text: string;
  fileName: string;
  mime: string;
  method: string;
  pages?: number;
  chars: number;
  warnings?: string[];
}

export const EXTRACT_ACCEPT = ".txt,.md,.markdown,.json,.csv,.html,.rtf,.docx,.pdf,.png,.jpg,.jpeg,.webp";
const MAX_BYTES = 15 * 1024 * 1024;

export async function extractFile(file: File): Promise<Extracted> {
  if (file.size > MAX_BYTES) throw new Error("That file is over 15 MB. Try a smaller file.");
  const body = new FormData();
  body.append("file", file);
  let res: Response;
  try {
    res = await fetch("/api/extract", { method: "POST", body });
  } catch {
    throw new Error("Could not reach the server. Check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 502) throw new Error("We could not read that file this time. Please try again, or upload a text or Word version.");
  if (!res.ok) throw new Error(data.error ||`Could not read that file (error ${res.status}).`);
  return data as Extracted;
}

// ---------- CSV ----------
/** RFC 4180-ish: quoted fields, escaped quotes, CRLF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  return rows;
}

export const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export function download(name: string, text: string, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

/** Split extracted text into candidate sentences (keeps lines that look like bullet points). */
export function splitSentences(text: string): string[] {
  return text
    .replace(/\r/g, "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.replace(/^[\s\-*•\d.)]+/, "").trim())
    .filter((s) => s.length >= 12 && s.length <= 400);
}

// ---------- UI ----------
export function KbHeader({ title, intro, children }: { title: string; intro: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Link href="/knowledge-base" className={`rounded text-[13px] text-text-muted hover:text-text-primary ${focusRing}`}>
          Knowledge base
        </Link>
        <h1 className="mt-1 text-[28px] font-semibold leading-tight tracking-tight text-text-primary">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary">{intro}</p>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

/** Centered native modal <dialog>: focus trap, Esc, backdrop click. */
export const Modal = forwardRef<HTMLDialogElement, {
  title: string; onClose?: () => void; wide?: boolean; children: React.ReactNode;
}>(function Modal({ title, onClose, wide, children }, ref) {
  const id = useId();
  const close = (e: React.MouseEvent) => (e.currentTarget.closest("dialog") as HTMLDialogElement | null)?.close();
  return (
    <dialog
      ref={ref} aria-labelledby={id} onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && (e.currentTarget as HTMLDialogElement).close()}
      className={`max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] ${wide ? "max-w-3xl" : "max-w-lg"} overflow-y-auto overscroll-contain rounded-2xl border border-border-default bg-canvas p-0 text-text-primary backdrop:bg-ink/30`}
    >
      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 id={id} className="text-lg font-semibold">{title}</h2>
          <button type="button" aria-label="Close" onClick={close}
            className={`grid h-10 w-10 place-items-center rounded-lg text-text-muted hover:bg-panel-hover hover:text-text-primary ${focusRing}`}>
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
});

/** Drop zone + file picker. Either reads raw text locally (`raw`) or sends to /api/extract. */
export function FileDrop({ label, hint, accept = EXTRACT_ACCEPT, raw, onText }: {
  label: string; hint: string; accept?: string; raw?: boolean;
  onText: (r: Extracted, file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<{ busy: boolean; msg: string; error: boolean }>({ busy: false, msg: "", error: false });
  const [over, setOver] = useState(false);

  async function handle(file?: File) {
    if (!file) return;
    setState({ busy: true, msg: `Reading ${file.name}…`, error: false });
    try {
      const r: Extracted = raw
        ? { text: await file.text(), fileName: file.name, mime: file.type, method: "plain", chars: file.size }
        : await extractFile(file);
      if (!r.text.trim()) throw new Error("No text found in that file.");
      setState({ busy: false, msg: `Read ${r.fileName}${r.warnings?.length ? `. ${r.warnings.join(" ")}` : ""}`, error: false });
      onText(r, file);
    } catch (e) {
      setState({ busy: false, msg: e instanceof Error ? e.message : "Could not read that file.", error: true });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files[0]); }}
        className={`flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${over ? "border-ink/50 bg-panel-hover" : "border-border-default bg-panel"}`}
      >
        {state.busy
          ? <Loader2 className="h-5 w-5 animate-spin text-text-muted" aria-hidden="true" />
          : <FileUp className="h-5 w-5 text-text-muted" aria-hidden="true" />}
        <p className="text-sm font-medium text-text-primary">Drop a file here, or</p>
        <button type="button" disabled={state.busy} onClick={() => inputRef.current?.click()}
          className={`rounded-lg border border-border-default bg-canvas px-4 py-2 text-sm font-medium hover:bg-panel-hover disabled:opacity-50 ${focusRing}`}>
          {label}
        </button>
        <p className="text-[13px] text-text-muted">{hint}</p>
        <input ref={inputRef} type="file" accept={accept} className="sr-only" tabIndex={-1} aria-hidden="true"
          onChange={(e) => handle(e.target.files?.[0])} />
      </div>
      <p aria-live="polite" className={`mt-2 min-h-5 text-[13px] ${state.error ? "text-status-critical" : "text-text-muted"}`}>
        {state.msg}
      </p>
    </div>
  );
}

export function Toast({ msg }: { msg: string | null }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-6 z-50 flex justify-center">
      {msg && <p className="rounded-xl bg-ink px-4 py-3 text-sm text-canvas shadow-lg">{msg}</p>}
    </div>
  );
}
