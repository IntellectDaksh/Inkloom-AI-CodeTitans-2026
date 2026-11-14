// Local copy of uploaded originals, so a reviewer can open exactly what was uploaded.
// ponytail: IndexedDB is per-browser. Upgrade path: upload to Supabase Storage on submit and
// store the object path in sourceFile.fileId so every device can open it.

export interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  savedAt: string;
  blob: Blob;
}

const DB = "adsnitch-files";
const STORE = "files";

function open(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === "undefined") return resolve(null);
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null); // private mode / storage blocked
    }
  });
}

/** ok=false when IndexedDB is unavailable or the request failed. */
async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<{ ok: boolean; value?: T }> {
  const db = await open();
  if (!db) return { ok: false };
  return new Promise((resolve) => {
    try {
      const req = fn(db.transaction(STORE, mode).objectStore(STORE));
      req.onsuccess = () => resolve({ ok: true, value: req.result as T });
      req.onerror = () => resolve({ ok: false });
    } catch {
      resolve({ ok: false });
    }
  });
}

export const newFileId = () =>
  `file_${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)}`;

/** Saves the file; returns its id, or null when this browser cannot store files. */
export async function putFile(file: File, id = newFileId()): Promise<string | null> {
  const rec: StoredFile = { id, name: file.name, type: file.type || "application/octet-stream", size: file.size, savedAt: new Date().toISOString(), blob: file };
  return (await run("readwrite", (s) => s.put(rec))).ok ? id : null;
}
export const getFile = async (id: string) => (await run<StoredFile>("readonly", (s) => s.get(id))).value ?? null;
export const listFiles = async () => (await run<StoredFile[]>("readonly", (s) => s.getAll())).value ?? [];
export const deleteFile = async (id: string) => (await run("readwrite", (s) => s.delete(id))).ok;

/** Opens the stored original in a new tab, or downloads it. Returns false if it is not on this device. */
export async function openFile(id: string, download = false): Promise<boolean> {
  const f = await getFile(id);
  if (!f) return false;
  const url = URL.createObjectURL(f.blob);
  if (download) {
    const a = document.createElement("a");
    a.href = url;
    a.download = f.name;
    a.click();
  } else window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}
