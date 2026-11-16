import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SEED_IDS } from "@/lib/db/seed";
import { withStore } from "@/lib/db/withStore";
import { brandFrom, userId } from "@/lib/files/kbRoute";
import { BUCKET, MAX_FILE_BYTES, storage } from "@/lib/files/server";
import { validateUpload } from "@/lib/files/validate";
import { fileFromRequest } from "@/lib/files/staged";
import { currentOrgId } from "@/lib/db/store";

// POST multipart { file, brand? } -> stores the original in the private 'evidence' bucket.
async function POST_handler(req: NextRequest) {
  const sb = storage();
  if (!sb) return NextResponse.json({ success: false, error: "File storage is not configured on the server." }, { status: 503 });
  const uid = await userId();
  if (!uid) return NextResponse.json({ success: false, error: "Sign in to upload files." }, { status: 401 });
  const got = await fileFromRequest(req);
  if ("error" in got) return NextResponse.json({ success: false, error: got.error }, { status: got.status });
  const { file } = got;
  await got.cleanup();
  const form = { get: (k: string) => got.fields[k] ?? null };
  const check = await validateUpload(file, MAX_FILE_BYTES);
  if (!check.ok) return NextResponse.json({ success: false, error: check.error }, { status: check.status });
  const brand = brandFrom(String(form?.get("brand") ?? ""));
  // Storage paths are namespaced by the real organisation so one company's files never share a prefix with another's.
  const org = SEED_IDS.ORGANISATION_UIDEAS; // in-document tenant id (each org has its own document)
  const pathOrg = currentOrgId() ?? org;
  const id = crypto.randomUUID();
  const safe = file.name.replace(/[^\w.\- ]+/g, "_").slice(-120) || "file";
  const path = `${pathOrg}/${brand?.id ?? "shared"}/${id}/${safe}`;
  const mime = check.mime;
  const { error } = await sb.storage.from(BUCKET).upload(path, file, { contentType: mime, upsert: false });
  if (error) return NextResponse.json({ success: false, error: "The file could not be stored. Try again." }, { status: 502 });
  const rec = db.addStoredFile({
    id, organisation_id: org, brand_id: brand?.id ?? null, name: file.name.slice(0, 255), mime, size: file.size,
    path, uploaded_by: uid, created_at: new Date().toISOString(),
  });
  return NextResponse.json({ success: true, file: { id: rec.id, name: rec.name, size: rec.size, mime: rec.mime } }, { status: 201 });
}

export const POST = withStore(POST_handler, { name: "upload", limit: [0, 120] });
