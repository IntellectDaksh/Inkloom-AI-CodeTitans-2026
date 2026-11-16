import { withStore } from "@/lib/db/withStore";
import { NextRequest, NextResponse } from "next/server";
import { extractText, ExtractError, MAX_EXTRACT_BYTES } from "@/lib/ai/extract";
import { deleteStaged, readStaged } from "@/lib/files/staged";

export const maxDuration = 120;

/**
 * Small files arrive as multipart ("file"). Files over Vercel's 4.5 MB body limit are uploaded to
 * Storage first and arrive as JSON { staged, fileName }; they are read from there and then deleted.
 */
async function POST_handler(req: NextRequest) {
  let buf: Buffer;
  let name: string;
  let staged: string | null = null;

  if ((req.headers.get("content-type") || "").includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as { staged?: unknown; fileName?: unknown };
    const got = await readStaged(body.staged);
    if ("error" in got) return NextResponse.json({ error: got.error }, { status: got.status });
    staged = body.staged as string;
    buf = got.buf;
    name = typeof body.fileName === "string" && body.fileName ? body.fileName : got.fileName;
  } else {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ error: "Send the file as multipart/form-data in a field named \"file\"." }, { status: 400 });
    }
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file was attached. Choose a file and try again." }, { status: 400 });
    }
    buf = Buffer.from(await file.arrayBuffer());
    name = file.name || "upload";
  }

  try {
    if (buf.length > MAX_EXTRACT_BYTES) return NextResponse.json({ error: "This file is larger than 15 MB." }, { status: 400 });
    return NextResponse.json(await extractText(buf, name));
  } catch (err) {
    if (err instanceof ExtractError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("extract failed", err);
    return NextResponse.json({ error: "Could not read this file. Try another format or paste the text." }, { status: 422 });
  } finally {
    if (staged) await deleteStaged(staged);
  }
}

export const POST = withStore(POST_handler, { public: true, name: "extract", limit: [5, 60] });
