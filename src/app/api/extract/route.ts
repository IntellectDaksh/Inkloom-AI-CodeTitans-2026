import { NextRequest, NextResponse } from "next/server";
import { extractText, ExtractError, MAX_EXTRACT_BYTES } from "@/lib/ai/extract";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
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
  if (file.size > MAX_EXTRACT_BYTES) {
    return NextResponse.json({ error: "This file is larger than 15 MB." }, { status: 400 });
  }
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    return NextResponse.json(await extractText(buf, file.name || "upload"));
  } catch (err) {
    if (err instanceof ExtractError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("extract failed", err);
    return NextResponse.json({ error: "Could not read this file. Try another format or paste the text." }, { status: 422 });
  }
}
