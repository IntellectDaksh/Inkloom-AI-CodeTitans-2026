import { BUCKET, storage } from "./server";

/**
 * Large uploads (over Vercel's 4.5 MB request limit) go browser → Supabase Storage through a
 * one-time signed URL under staged/, then an API route reads them from there. Paths are server-made,
 * so a client can only point at its own staged file.
 */
export const STAGED_RE = /^staged\/[0-9a-f-]{36}\/[\w.\- ]{1,120}$/;

export async function readStaged(path: unknown): Promise<{ buf: Buffer; fileName: string } | { error: string; status: number }> {
  if (typeof path !== "string" || !STAGED_RE.test(path)) return { error: "Invalid upload reference.", status: 400 };
  const sb = storage();
  if (!sb) return { error: "File storage is not configured on the server.", status: 503 };
  const { data, error } = await sb.storage.from(BUCKET).download(path);
  if (error || !data) return { error: "The uploaded file has expired. Upload it again.", status: 410 };
  return { buf: Buffer.from(await data.arrayBuffer()), fileName: path.split("/").pop() || "upload" };
}

export async function deleteStaged(path: string): Promise<void> {
  await storage()?.storage.from(BUCKET).remove([path]).catch(() => {});
}

/**
 * The uploaded file from either a multipart body ("file" + other fields) or a JSON body
 * { staged, fileName, ...fields } for files that went to Storage first. Call cleanup() when done.
 */
export async function fileFromRequest(req: Request): Promise<
  | { file: File; fields: Record<string, string>; cleanup: () => Promise<void> }
  | { error: string; status: number }
> {
  if ((req.headers.get("content-type") || "").includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const got = await readStaged(body.staged);
    if ("error" in got) return got;
    const name = typeof body.fileName === "string" && body.fileName ? body.fileName : got.fileName;
    const fields = Object.fromEntries(Object.entries(body).filter(([k, v]) => k !== "staged" && typeof v === "string")) as Record<string, string>;
    return { file: new File([new Uint8Array(got.buf)], name), fields, cleanup: () => deleteStaged(body.staged as string) };
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return { error: "Attach a file.", status: 400 };
  const fields: Record<string, string> = {};
  form!.forEach((v, k) => { if (typeof v === "string") fields[k] = v; });
  return { file, fields, cleanup: async () => {} };
}
