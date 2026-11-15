import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SEED_IDS } from "@/lib/db/seed";
import { withStore } from "@/lib/db/withStore";
import { userId } from "@/lib/files/kbRoute";
import { BUCKET, storage } from "@/lib/files/server";

const TTL_SECONDS = 60;

// GET [?download=1] -> { url }: a short-lived signed URL for the stored original.
async function GET_handler(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sb = storage();
  if (!sb) return NextResponse.json({ success: false, error: "File storage is not configured on the server." }, { status: 503 });
  if (!(await userId())) return NextResponse.json({ success: false, error: "Sign in to open files." }, { status: 401 });
  const { id } = await params;
  const rec = db.getStoredFile(SEED_IDS.ORGANISATION_UIDEAS, id);
  if (!rec) return NextResponse.json({ success: false, error: "File not found." }, { status: 404 });
  const download = req.nextUrl.searchParams.get("download") === "1" ? rec.name : undefined;
  const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(rec.path, TTL_SECONDS, download ? { download } : undefined);
  if (error || !data) return NextResponse.json({ success: false, error: "Could not open that file right now." }, { status: 502 });
  return NextResponse.json(
    { success: true, url: data.signedUrl, name: rec.name, mime: rec.mime, size: rec.size, expiresIn: TTL_SECONDS },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export const GET = withStore(GET_handler);
