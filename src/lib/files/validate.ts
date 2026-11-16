/**
 * Server-side upload check: the browser's `accept=` and MIME type are hints only.
 * Type comes from the extension, then the first bytes must match it, so a renamed
 * executable or HTML page can't be stored as "evidence.pdf".
 */
const TYPES: Record<string, { mime: string; magic?: (b: Uint8Array) => boolean }> = {
  pdf: { mime: "application/pdf", magic: (b) => ascii(b, 0, "%PDF-") },
  png: { mime: "image/png", magic: (b) => b[0] === 0x89 && ascii(b, 1, "PNG") },
  jpg: { mime: "image/jpeg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 },
  jpeg: { mime: "image/jpeg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 },
  webp: { mime: "image/webp", magic: (b) => ascii(b, 0, "RIFF") && ascii(b, 8, "WEBP") },
  docx: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", magic: zip },
  pptx: { mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", magic: zip },
  mp4: { mime: "video/mp4", magic: (b) => ascii(b, 4, "ftyp") },
  txt: { mime: "text/plain", magic: text },
  md: { mime: "text/markdown", magic: text },
  markdown: { mime: "text/markdown", magic: text },
  htm: { mime: "text/html", magic: text },
  csv: { mime: "text/csv", magic: text },
  json: { mime: "application/json", magic: text },
  html: { mime: "text/html", magic: text },
  rtf: { mime: "application/rtf", magic: (b) => ascii(b, 0, "{\rtf") },
};

function ascii(b: Uint8Array, at: number, s: string) {
  for (let i = 0; i < s.length; i++) if (b[at + i] !== s.charCodeAt(i)) return false;
  return true;
}
function zip(b: Uint8Array) {
  return b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04;
}
/** No NUL bytes in the first 4 KB: binary files pretending to be text get refused. */
function text(b: Uint8Array) {
  return !b.subarray(0, 4096).includes(0);
}

export const ALLOWED_UPLOAD_EXT = Object.keys(TYPES);

export async function validateUpload(file: File, maxBytes: number): Promise<{ ok: true; mime: string } | { ok: false; error: string; status: number }> {
  if (file.size === 0) return { ok: false, error: "That file is empty.", status: 400 };
  if (file.size > maxBytes) return { ok: false, error: `That file is over ${Math.round(maxBytes / 1048576)} MB.`, status: 413 };
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const t = TYPES[ext];
  if (!t) return { ok: false, error: `".${ext}" files can't be stored. Use PDF, Word, PowerPoint, an image, MP4 or a text file.`, status: 415 };
  const head = new Uint8Array(await file.slice(0, 4096).arrayBuffer());
  if (t.magic && !t.magic(head)) return { ok: false, error: `This file doesn't look like a real .${ext} file.`, status: 415 };
  return { ok: true, mime: t.mime };
}
