"use client";

import { supabaseBrowser } from "@/lib/auth/client";

/** Vercel rejects request bodies over 4.5 MB; anything above this goes straight to Storage first. */
export const DIRECT_LIMIT = 4 * 1024 * 1024;

const MIME: Record<string, string> = {
  pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  mp4: "video/mp4", txt: "text/plain", md: "text/markdown", markdown: "text/markdown", csv: "text/csv",
  json: "application/json", html: "text/html", htm: "text/html", rtf: "application/rtf",
};

/** Uploads the file to a server-issued staged path and returns that path. */
export async function stageUpload(file: File): Promise<string> {
  const r = await fetch("/api/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, size: file.size }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.success) throw new Error(d.error || `Could not prepare the upload (error ${r.status}).`);
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const { error } = await supabaseBrowser().storage.from("evidence").uploadToSignedUrl(d.path, d.token, file, {
    contentType: MIME[ext] || file.type || "application/octet-stream",
  });
  if (error) throw new Error("The upload failed. Check your connection and try again.");
  return d.path as string;
}

/**
 * Sends a file to an API route: small files as multipart (field "file"), large ones staged first
 * and sent as JSON { staged, fileName } plus any extra fields.
 */
export async function postFile(url: string, file: File, extra: Record<string, string> = {}): Promise<Response> {
  if (file.size <= DIRECT_LIMIT) {
    const fd = new FormData();
    fd.append("file", file);
    for (const [k, v] of Object.entries(extra)) fd.append(k, v);
    return fetch(url, { method: "POST", body: fd });
  }
  const staged = await stageUpload(file);
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ staged, fileName: file.name, ...extra }),
  });
}
