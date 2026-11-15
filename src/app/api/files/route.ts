import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SEED_IDS } from "@/lib/db/seed";
import { withStore } from "@/lib/db/withStore";
import { brandFrom, userId } from "@/lib/files/kbRoute";
import { BUCKET, MAX_FILE_BYTES, storage } from "@/lib/files/server";

// POST multipart { file, brand? } -> stores the original in the private 'evidence' bucket.
async function POST_handler(req: NextRequest) {
  const sb = storage();
  if (!sb) return NextResponse.json({ success: false, error: "File storage is not configured on the server." }, { status: 503 });
  const uid = await userId();
  if (!uid) return NextResponse.json({ success: false, error: "Sign in to upload files." }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ success: false, error: "Attach a file." }, { status: 400 });
  if (file.size === 0) return NextResponse.json({ success: false, error: "That file is empty." }, { status: 400 });
  if (file.size > MAX_FILE_BYTES) return NextResponse.json({ success: false, error: "That file is over 15 MB." }, { status: 413 });
  const brand = brandFrom(String(form?.get("brand") ?? ""));
  const org = SEED_IDS.ORGANISATION_UIDEAS;
  const id = crypto.randomUUID();
  const safe = file.name.replace(/[^\w.\- ]+/g, "_").slice(-120) || "file";
  const path = `${org}/${brand?.id ?? "shared"}/${id}/${safe}`;
  const mime = file.type || "application/octet-stream";
  const { error } = await sb.storage.from(BUCKET).upload(path, file, { contentType: mime, upsert: false });
  if (error) return NextResponse.json({ success: false, error: "The file could not be stored. Try again." }, { status: 502 });
  const rec = db.addStoredFile({
    id, organisation_id: org, brand_id: brand?.id ?? null, name: file.name.slice(0, 255), mime, size: file.size,
    path, uploaded_by: uid, created_at: new Date().toISOString(),
  });
  return NextResponse.json({ success: true, file: { id: rec.id, name: rec.name, size: rec.size, mime: rec.mime } }, { status: 201 });
}

export const POST = withStore(POST_handler);
