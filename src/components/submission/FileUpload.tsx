"use client";

import React, { useRef, useState } from "react";
import { AlertCircle, FileImage, FileText, FileType2, Loader2, RotateCcw, Upload, X } from "lucide-react";
import { ACCEPTED_EXT, MAX_FILE_BYTES, formatBytes, isOcrFile } from "./shared";

export interface UploadItem {
  key: string;
  file: File;
  status: "reading" | "done" | "error";
  text: string;
  warnings: string[];
  error?: string;
  method?: string;
  pages?: number;
}

/** Calls POST /api/extract (contract in docs/REVAMP-BRIEF.md). Throws a plain-language Error. */
export async function extractFile(file: File): Promise<Pick<UploadItem, "text" | "warnings" | "method" | "pages">> {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!ACCEPTED_EXT.includes(ext)) throw new Error(`${ext || "This file type"} is not supported. Try PDF, Word, an image or plain text.`);
  if (file.size > MAX_FILE_BYTES) throw new Error(`File is ${formatBytes(file.size)}. The limit is 15 MB.`);
  const fd = new FormData();
  fd.append("file", file);
  let res: Response;
  try {
    res = await fetch("/api/extract", { method: "POST", body: fd });
  } catch {
    throw new Error("Could not reach the server. Check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 502)
    throw new Error("The reader couldn't make sense of this file. Try again, or upload a clearer scan or a different format.");
  if (!res.ok) throw new Error(data.error || `Could not read this file (error ${res.status}).`);
  return { text: data.text || "", warnings: data.warnings || [], method: data.method, pages: data.pages };
}

const iconFor = (name: string) =>
  /\.(png|jpe?g|webp)$/i.test(name) ? FileImage : /\.(pdf|docx)$/i.test(name) ? FileType2 : FileText;

export function FileDropZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) onFiles([...e.dataTransfer.files]);
      }}
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
        dragging ? "border-ink bg-panel-elevated" : "border-border-strong bg-panel"
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-panel-elevated">
        <Upload className="h-5 w-5 text-text-primary" aria-hidden />
      </span>
      <div>
        <p className="text-base font-semibold text-text-primary">Drop your ad files here</p>
        <p className="mt-1 text-sm text-text-muted">PDF, Word, images (PNG, JPG, WebP) or text files. Up to 15 MB each.</p>
      </div>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="inline-flex h-11 items-center gap-2 rounded-lg border border-border-strong bg-panel-elevated px-5 text-sm font-semibold text-text-primary hover:bg-panel-hover focus-visible:outline-2 focus-visible:outline-blue cursor-pointer"
      >
        Browse files
      </button>
      <input
        ref={input}
        type="file"
        multiple
        accept={ACCEPTED_EXT.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-label="Choose ad files"
        onChange={(e) => {
          if (e.target.files?.length) onFiles([...e.target.files]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function UploadCard({
  item,
  onText,
  onRemove,
  onRetry,
}: {
  item: UploadItem;
  onText: (t: string) => void;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const Icon = iconFor(item.file.name);
  const id = `upl-${item.key}`;
  return (
    <div className="glass space-y-3 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-panel-elevated">
          <Icon className="h-5 w-5 text-text-primary" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text-primary">{item.file.name}</p>
          <p className="text-xs text-text-muted">
            {formatBytes(item.file.size)}
            {item.pages ? ` · ${item.pages} page${item.pages > 1 ? "s" : ""}` : ""}
            {item.method === "gemini-ocr" ? " · Read with OCR" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.file.name}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-panel-hover hover:text-text-primary focus-visible:outline-2 focus-visible:outline-blue cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div aria-live="polite">
        {item.status === "reading" && (
          <p className="flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />
            {isOcrFile(item.file.name) ? "Scanning with OCR…" : "Reading your file…"}
          </p>
        )}
        {item.status === "error" && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-status-critical/30 bg-status-critical/10 p-3">
            <p className="flex items-start gap-2 text-sm text-status-critical">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {item.error}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border-default bg-panel px-3 text-sm font-medium text-text-primary hover:bg-panel-hover focus-visible:outline-2 focus-visible:outline-blue cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Try again
            </button>
          </div>
        )}
      </div>

      {item.status === "done" && (
        <div className="space-y-2">
          {item.warnings.length > 0 && (
            <ul className="space-y-1 rounded-lg border border-status-warning/30 bg-status-warning/10 p-3 text-[13px] text-text-primary">
              {item.warnings.map((w) => (
                <li key={w} className="flex gap-2">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-warning" aria-hidden />
                  {w}
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between">
            <label htmlFor={id} className="text-[13px] font-medium text-text-secondary">
              Text we found. Fix anything that was read wrong.
            </label>
            <span className="text-xs tabular-nums text-text-muted">{item.text.length.toLocaleString()} characters</span>
          </div>
          <textarea
            id={id}
            value={item.text}
            onChange={(e) => onText(e.target.value)}
            rows={6}
            className="w-full resize-y rounded-lg glass-inset p-3 font-sans text-sm leading-relaxed text-text-primary focus:outline-none focus:ring-2 focus:ring-blue/50"
          />
        </div>
      )}
    </div>
  );
}
