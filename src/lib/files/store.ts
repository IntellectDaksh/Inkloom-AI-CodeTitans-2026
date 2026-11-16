import { postFile } from "./stage";

// Uploaded originals live in Supabase Storage (private bucket 'evidence'), uploaded through
// /api/files. Opening one asks /api/files/[id] for a signed URL that expires after a minute.

export interface StoredFileInfo {
  id: string;
  name: string;
  size: number;
  mime: string;
}

/** Uploads the original; returns its id, or null when the server refused or is unreachable. */
export async function putFile(file: File, brand?: string): Promise<string | null> {
  return (await uploadFile(file, brand)).id;
}

/** Same as putFile, with the server's reason when it fails. */
export async function uploadFile(file: File, brand?: string): Promise<{ id: string | null; error?: string }> {
  try {
    const r = await postFile("/api/files", file, brand ? { brand } : {});
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.success) return { id: null, error: d.error || `Upload failed (error ${r.status}).` };
    return { id: (d.file as StoredFileInfo).id };
  } catch {
    return { id: null, error: "Could not reach the server. The original was not stored." };
  }
}

/** Signed URL + metadata for a stored original, or null. */
export async function getFile(id: string, download = false): Promise<(StoredFileInfo & { url: string }) | null> {
  try {
    const r = await fetch(`/api/files/${encodeURIComponent(id)}${download ? "?download=1" : ""}`, { cache: "no-store" });
    const d = await r.json().catch(() => ({}));
    return r.ok && d.success ? { id, name: d.name, size: d.size, mime: d.mime, url: d.url } : null;
  } catch {
    return null;
  }
}

/** Opens the stored original in a new tab, or downloads it. Returns false if it can't be fetched. */
export async function openFile(id: string, download = false): Promise<boolean> {
  // Open the tab synchronously so popup blockers allow it, then point it at the signed URL.
  const tab = download ? null : window.open("", "_blank");
  const f = await getFile(id, download);
  if (!f) {
    tab?.close();
    return false;
  }
  if (download) {
    const a = Object.assign(document.createElement("a"), { href: f.url, download: f.name, rel: "noopener" });
    a.click();
  } else if (tab) {
    tab.opener = null;
    tab.location.href = f.url;
  } else window.open(f.url, "_blank", "noopener");
  return true;
}
