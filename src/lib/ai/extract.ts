/**
 * File -> plain text extraction for /api/extract, plus CSV/JSON claim-row parsing for /api/claims/import.
 * Text formats are read locally; DOCX is unzipped with Node built-ins; PDF and images go to Gemini OCR.
 */

import { inflateRawSync } from 'zlib';
import { GEMINI_25_FLASH_URL, GEMINI_FALLBACK_LIVE_URL, callGeminiEndpoint } from './gemini';

export const MAX_EXTRACT_BYTES = 15 * 1024 * 1024;

export type ExtractMethod = 'plain' | 'docx' | 'gemini-ocr';

export interface ExtractResult {
  text: string;
  fileName: string;
  mime: string;
  method: ExtractMethod;
  pages: number;
  chars: number;
  warnings: string[];
}

export class ExtractError extends Error {
  constructor(message: string, public status: 400 | 422 | 502 | 503) {
    super(message);
  }
}

type Kind = 'text' | 'markdown' | 'json' | 'csv' | 'html' | 'rtf' | 'docx' | 'pdf' | 'image';

const EXT_KIND: Record<string, { kind: Kind; mime: string }> = {
  txt: { kind: 'text', mime: 'text/plain' },
  md: { kind: 'markdown', mime: 'text/markdown' },
  markdown: { kind: 'markdown', mime: 'text/markdown' },
  json: { kind: 'json', mime: 'application/json' },
  csv: { kind: 'csv', mime: 'text/csv' },
  html: { kind: 'html', mime: 'text/html' },
  htm: { kind: 'html', mime: 'text/html' },
  rtf: { kind: 'rtf', mime: 'application/rtf' },
  docx: { kind: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  pdf: { kind: 'pdf', mime: 'application/pdf' },
  png: { kind: 'image', mime: 'image/png' },
  jpg: { kind: 'image', mime: 'image/jpeg' },
  jpeg: { kind: 'image', mime: 'image/jpeg' },
  webp: { kind: 'image', mime: 'image/webp' },
};

export const SUPPORTED_EXTENSIONS = Object.keys(EXT_KIND);

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function tidy(s: string): string {
  return s
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function htmlToText(html: string): string {
  const body = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|noscript|template|svg)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(/<\/(p|div|section|article|h[1-6]|li|tr|blockquote|header|footer|ul|ol|table)>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  return tidy(decodeEntities(body).replace(/[ \t]{2,}/g, ' '));
}

/** Collects every string value (depth-first) on its own line; keys are skipped as they are rarely ad copy. */
export function jsonToText(raw: string): string {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === 'string') {
      if (v.trim()) out.push(v.trim());
    } else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(JSON.parse(raw));
  return tidy(out.join('\n'));
}

// ponytail: drops RTF control words/groups naively; embedded fonts/pictures leave no text but odd destinations may leak.
export function rtfToText(rtf: string): string {
  return tidy(
    rtf
      .replace(/\{\\\*[^{}]*\}/g, '')
      .replace(/\{\\(fonttbl|colortbl|stylesheet|info|pict)[\s\S]*?\}\s*\}/g, '')
      .replace(/\\par[d]?\b ?/g, '\n')
      .replace(/\\line\b ?/g, '\n')
      .replace(/\\tab\b ?/g, '\t')
      .replace(/\\'([0-9a-f]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/\\u(-?\d+)\??/g, (_, n) => String.fromCharCode((Number(n) + 65536) % 65536))
      .replace(/\\([{}\\])/g, '$1')
      .replace(/\\[a-z]+-?\d* ?/gi, '')
      .replace(/[{}]/g, '')
  );
}

/** Reads one entry from a ZIP buffer via its central directory (handles stored + deflate). */
export function readZipEntry(buf: Buffer, entryName: string): Buffer | null {
  // End-of-central-directory record sits in the last 22..65557 bytes.
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return null;
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  for (let n = 0; n < count && p + 46 <= buf.length; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) return null;
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOff = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    if (name === entryName) {
      if (buf.readUInt32LE(localOff) !== 0x04034b50) return null;
      const start = localOff + 30 + buf.readUInt16LE(localOff + 26) + buf.readUInt16LE(localOff + 28);
      const data = buf.subarray(start, start + compSize);
      if (method === 0) return Buffer.from(data);
      if (method === 8) return inflateRawSync(data);
      return null;
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  return null;
}

export function docxToText(buf: Buffer): string {
  const xml = readZipEntry(buf, 'word/document.xml');
  if (!xml) throw new ExtractError('This .docx file looks damaged or is not a Word document.', 422);
  let out = '';
  const re = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:(?:br|cr)\b[^>]*\/>|<\/w:p>/g;
  for (const m of xml.toString('utf8').matchAll(re)) {
    out += m[1] !== undefined ? m[1] : m[0] === '<w:tab/>' ? '\t' : '\n';
  }
  return tidy(decodeEntities(out));
}

function countPdfPages(buf: Buffer): number {
  const m = buf.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g);
  return m ? m.length : 1;
}

const OCR_PROMPT = `Transcribe all readable text in this file verbatim.
Preserve the original line breaks and reading order. Keep headings, bullets and numbers as written.
Do not summarise, translate, correct, or add any commentary, labels or markdown fences.
If there is no readable text, reply with exactly: NO_TEXT_FOUND`;

async function geminiOcr(buf: Buffer, mime: string, apiKey: string): Promise<string> {
  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ inline_data: { mime_type: mime, data: buf.toString('base64') } }, { text: OCR_PROMPT }],
      },
    ],
    generationConfig: { temperature: 0 },
  };
  let resp = await callGeminiEndpoint(GEMINI_25_FLASH_URL, apiKey, body, 90000);
  if (!resp.ok && (resp.status === 404 || resp.status === 503 || resp.status === 429)) {
    resp = await callGeminiEndpoint(GEMINI_FALLBACK_LIVE_URL, apiKey, body, 90000);
  }
  if (!resp.ok) {
    if (resp.status === 400 || resp.status === 403) {
      throw new ExtractError('The text reader rejected this file. Check the API key or try a smaller file.', 502);
    }
    throw new ExtractError('The text reader is unavailable right now. Try again in a minute.', 503);
  }
  let parts: Array<{ text?: string }> = [];
  try {
    parts = JSON.parse(resp.text)?.candidates?.[0]?.content?.parts ?? [];
  } catch {
    throw new ExtractError('The text reader returned an unreadable response. Try again.', 502);
  }
  const text = parts.map(p => p.text ?? '').join('');
  return text.trim() === 'NO_TEXT_FOUND' ? '' : text.replace(/^```\w*\n?|```\s*$/g, '');
}

export async function extractText(
  buf: Buffer,
  fileName: string,
  apiKey: string | undefined = process.env.GEMINI_API_KEY
): Promise<ExtractResult> {
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  const entry = EXT_KIND[ext];
  if (!entry) {
    throw new ExtractError(
      `".${ext || '?'}" files are not supported. Use one of: ${SUPPORTED_EXTENSIONS.map(e => '.' + e).join(' ')}.`,
      400
    );
  }
  if (buf.length === 0) throw new ExtractError('This file is empty.', 422);
  if (buf.length > MAX_EXTRACT_BYTES) throw new ExtractError('This file is larger than 15 MB.', 400);

  const warnings: string[] = [];
  let method: ExtractMethod = 'plain';
  let pages = 1;
  let text: string;
  const utf8 = () => buf.toString('utf8').replace(/^﻿/, '');

  switch (entry.kind) {
    case 'html':
      text = htmlToText(utf8());
      break;
    case 'json':
      try {
        text = jsonToText(utf8());
      } catch {
        warnings.push('The JSON could not be parsed, so it was read as plain text.');
        text = tidy(utf8());
      }
      break;
    case 'rtf':
      text = rtfToText(utf8());
      warnings.push('Formatting from the .rtf file was removed. Check the text before checking your ad.');
      break;
    case 'docx':
      method = 'docx';
      if (buf.readUInt32LE(0) !== 0x04034b50) throw new ExtractError('This .docx file is not a valid Word document.', 400);
      text = docxToText(buf);
      break;
    case 'pdf':
    case 'image':
      if (entry.kind === 'pdf') {
        if (buf.subarray(0, 5).toString('latin1') !== '%PDF-') throw new ExtractError('This file is not a valid PDF.', 400);
        pages = countPdfPages(buf);
      }
      if (!apiKey) {
        throw new ExtractError('Reading PDFs and images needs a GEMINI_API_KEY on the server. Paste the text instead.', 503);
      }
      method = 'gemini-ocr';
      text = tidy(await geminiOcr(buf, entry.mime, apiKey));
      warnings.push('Text was read by AI from a scan or image. Check it matches the original before checking your ad.');
      break;
    default:
      text = tidy(utf8());
  }

  if (text.includes('�')) warnings.push('Some characters could not be read and may show as symbols.');
  if (!text) throw new ExtractError('No readable text was found in this file.', 422);

  return { text, fileName, mime: entry.mime, method, pages, chars: text.length, warnings };
}

// ============================================================================
// Claim import parsing (CSV or JSON rows)
// ============================================================================

/** RFC 4180 CSV parser: quoted fields, escaped quotes, embedded newlines. */
export function parseCsv(src: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const s = src.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter(r => r.some(f => f.trim()));
}

export const CLAIM_CATEGORIES = ['efficacy', 'safety', 'sourcing', 'performance', 'certifications'] as const;

export interface ClaimImportRow {
  claimText: string;
  brand?: string;
  category: (typeof CLAIM_CATEGORIES)[number];
  channels: string[];
  sourceName?: string;
  reference?: string;
  excerpt?: string;
  expiresAt?: string;
}

const HEADER_ALIASES: Record<string, keyof ClaimImportRow> = {
  claim: 'claimText', claimtext: 'claimText', text: 'claimText',
  brand: 'brand', brandid: 'brand', brandname: 'brand',
  type: 'category', category: 'category', claimtype: 'category',
  channels: 'channels', channel: 'channels',
  source: 'sourceName', sourcename: 'sourceName', evidencesource: 'sourceName',
  reference: 'reference', evidencereference: 'reference', doi: 'reference', referencedoi: 'reference', url: 'reference', citation: 'reference',
  excerpt: 'excerpt', evidenceexcerpt: 'excerpt', quote: 'excerpt',
  expiry: 'expiresAt', expires: 'expiresAt', expiresat: 'expiresAt', expirydate: 'expiresAt',
};

const norm = (k: string) => k.toLowerCase().replace(/[^a-z]/g, '');

/** Normalises CSV text or a JSON array into raw key/value records. Row numbers are 1-based data rows. */
export function toClaimRecords(input: unknown): Record<string, unknown>[] {
  if (Array.isArray(input)) return input.map(r => (r && typeof r === 'object' ? (r as Record<string, unknown>) : {}));
  if (typeof input !== 'string') throw new Error('Send a JSON array of claims or CSV text.');
  const rows = parseCsv(input);
  if (rows.length < 2) throw new Error('The CSV needs a header row and at least one claim.');
  const [header, ...data] = rows;
  return data.map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

export function validateClaimRecord(rec: Record<string, unknown>): { ok: true; row: ClaimImportRow } | { ok: false; reason: string } {
  const v: Partial<Record<keyof ClaimImportRow, unknown>> = {};
  for (const [k, val] of Object.entries(rec)) {
    const key = HEADER_ALIASES[norm(k)];
    if (key && v[key] === undefined) v[key] = val;
  }
  const str = (x: unknown) => (typeof x === 'string' ? x.trim() : typeof x === 'number' ? String(x) : '');

  const claimText = str(v.claimText);
  if (!claimText) return { ok: false, reason: 'Missing claim text.' };
  if (claimText.length > 1000) return { ok: false, reason: 'Claim text is longer than 1000 characters.' };

  const cat = str(v.category).toLowerCase() || 'performance';
  const category = CLAIM_CATEGORIES.find(c => c === cat || c.replace(/s$/, '') === cat);
  if (!category) return { ok: false, reason: `Unknown type "${cat}". Use one of: ${CLAIM_CATEGORIES.join(', ')}.` };

  const channels = Array.isArray(v.channels)
    ? v.channels.map(str).filter(Boolean)
    : str(v.channels).split(/[;|,]/).map(s => s.trim()).filter(Boolean);

  let expiresAt: string | undefined;
  const exp = str(v.expiresAt);
  if (exp) {
    const d = new Date(exp);
    if (isNaN(d.getTime())) return { ok: false, reason: `Expiry "${exp}" is not a valid date (use YYYY-MM-DD).` };
    expiresAt = d.toISOString();
  }

  return {
    ok: true,
    row: {
      claimText,
      brand: str(v.brand) || undefined,
      category,
      channels,
      sourceName: str(v.sourceName) || undefined,
      reference: str(v.reference) || undefined,
      excerpt: str(v.excerpt) || undefined,
      expiresAt,
    },
  };
}
