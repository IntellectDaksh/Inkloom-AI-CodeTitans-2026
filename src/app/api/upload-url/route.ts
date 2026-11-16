import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/auth/server";
import { rateLimit } from "@/lib/rateLimit";
import { BUCKET, MAX_FILE_BYTES, storage } from "@/lib/files/server";
import { ALLOWED_UPLOAD_EXT } from "@/lib/files/validate";

// POST { fileName, size } -> { path, token }: a one-time signed URL to upload straight to Storage.
export async function POST(req: NextRequest) {
  const { data: { user } } = await (await supabaseServer()).auth.getUser().catch(() => ({ data: { user: null } }));
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!(await rateLimit(`upload-url:${user ? `u:${user.id}` : `ip:${ip}`}`, user ? 120 : 10, 3600))) {
    return NextResponse.json({ success: false, error: "Too many uploads. Try again later." }, { status: 429 });
  }
  const b = (await req.json().catch(() => ({}))) as { fileName?: unknown; size?: unknown };
  const name = typeof b.fileName === "string" ? b.fileName : "";
  const size = typeof b.size === "number" ? b.size : 0;
  const ext = (name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_UPLOAD_EXT.includes(ext)) return NextResponse.json({ success: false, error: `".${ext}" files aren't supported.` }, { status: 415 });
  if (size <= 0 || size > MAX_FILE_BYTES) return NextResponse.json({ success: false, error: "Files must be under 15 MB." }, { status: 413 });
  const sb = storage();
  if (!sb) return NextResponse.json({ success: false, error: "File storage is not configured on the server." }, { status: 503 });
  const safe = name.replace(/[^\w.\- ]+/g, "_").slice(-120) || `file.${ext}`;
  const path = `staged/${crypto.randomUUID()}/${safe}`;
  const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return NextResponse.json({ success: false, error: "Could not prepare the upload. Try again." }, { status: 502 });
  return NextResponse.json({ success: true, path, token: data.token });
}
