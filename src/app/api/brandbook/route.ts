import { NextRequest, NextResponse } from "next/server";
import { withStore } from "@/lib/db/withStore";
import { extractText, ExtractError, MAX_EXTRACT_BYTES } from "@/lib/ai/extract";
import { fileFromRequest } from "@/lib/files/staged";
import { callGemini } from "@/lib/ai/gemini";

export const maxDuration = 120;

const MAX_CHARS = 60000;
const ALLOWED = ["pdf", "docx", "txt", "md"];
const GUIDE_CATS = ["Voice and tone", "Messaging standards", "Prohibited language", "Legal and disclosures", "Visual identity", "Channel rules"] as const;
const CLAIM_CATS = ["efficacy", "safety", "sourcing", "performance", "certifications"] as const;
const S = { type: "STRING" } as const;
const LIST = { type: "ARRAY", items: S } as const;

const SCHEMA = {
  type: "OBJECT",
  properties: {
    guidelines: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { category: { type: "STRING", enum: GUIDE_CATS }, title: S, description: S, dos: LIST, donts: LIST },
        required: ["category", "title", "description", "dos", "donts"],
      },
    },
    terms: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          term: S, kind: { type: "STRING", enum: ["blocked", "preferred"] }, replacement: S, note: S,
          severity: { type: "STRING", enum: ["critical", "high", "medium"] },
        },
        required: ["term", "kind", "replacement", "note", "severity"],
      },
    },
    claims: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { claim: S, category: { type: "STRING", enum: CLAIM_CATS }, evidenceNeeded: S },
        required: ["claim", "category", "evidenceNeeded"],
      },
    },
  },
  required: ["guidelines", "terms", "claims"],
};

const PROMPT = `You read a brand book or style guide and draft review material for a marketing compliance tool.
Only use what the document actually says. Never invent rules, terms or claims.
- guidelines: one per distinct rule area, with concrete dos and don'ts quoted or closely paraphrased.
- terms: words the brand bans (kind "blocked", with the preferred replacement if the document gives one) or insists on (kind "preferred").
- claims: factual or marketing claims the brand makes about its products (numbers, benefits, certifications). For each, say what proof a reviewer should ask for.
Keep each text field under 300 characters. Return at most 30 guidelines, 60 terms and 40 claims.`;

const bad = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });
const str = (v: unknown, n = 300) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const strs = (v: unknown) => (Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean).slice(0, 20) : []);
const pick = <T extends string>(v: unknown, allowed: readonly T[], d: T): T => (allowed.includes(v as T) ? (v as T) : d);

/** Drafts guidelines, terms and candidate claims from an uploaded brand book. Saves nothing. */
async function POST_handler(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return bad("Brand book import needs AI, which isn't set up on this server (GEMINI_API_KEY is missing). Add rules by hand for now.", 503);
  const got = await fileFromRequest(req);
  if ("error" in got) return bad(got.error, got.status);
  const { file } = got;
  await got.cleanup();
  if (file.size > MAX_EXTRACT_BYTES) return bad("This file is larger than 15 MB.", 400);
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED.includes(ext)) return bad("Upload a PDF, DOCX or TXT file.", 400);

  let text: string;
  try {
    text = (await extractText(Buffer.from(await file.arrayBuffer()), file.name, apiKey)).text.trim();
  } catch (err) {
    if (err instanceof ExtractError) return bad(err.message, err.status);
    console.error("brandbook extract failed", err);
    return bad("Could not read this file. Try another format.", 422);
  }
  if (text.length < 40) return bad("Couldn't find enough text in this file to draft anything.", 422);

  const body = {
    contents: [{ role: "user", parts: [{ text: `${PROMPT}\n\n=== BRAND BOOK ===\n${text.slice(0, MAX_CHARS)}` }] }],
    generationConfig: { temperature: 0, maxOutputTokens: 8192, responseMimeType: "application/json", responseSchema: SCHEMA },
  };
  const resp = await callGemini(apiKey, body, 60000);
  if (!resp.ok) {
    console.error("brandbook gemini failed", resp.status, resp.text.slice(0, 300));
    return bad("The AI service didn't respond. Try again in a minute.", 502);
  }
  let out: Record<string, unknown>;
  try {
    out = JSON.parse(JSON.parse(resp.text)?.candidates?.[0]?.content?.parts?.[0]?.text ?? "");
  } catch {
    return bad("The AI returned something unreadable. Try again.", 502);
  }
  const arr = (k: string) => (Array.isArray(out?.[k]) ? (out[k] as Record<string, unknown>[]) : []);

  return NextResponse.json({
    success: true,
    fileName: file.name,
    truncated: text.length > MAX_CHARS,
    guidelines: arr("guidelines").slice(0, 30).map((g) => ({
      category: pick(g.category, GUIDE_CATS, "Messaging standards"), title: str(g.title, 120), description: str(g.description), dos: strs(g.dos), donts: strs(g.donts),
    })).filter((g) => g.title),
    terms: arr("terms").slice(0, 60).map((t) => ({
      term: str(t.term, 80), kind: pick(t.kind, ["blocked", "preferred"] as const, "blocked"), replacement: str(t.replacement, 80), note: str(t.note),
      severity: pick(t.severity, ["critical", "high", "medium"] as const, "medium"),
    })).filter((t) => t.term),
    claims: arr("claims").slice(0, 40).map((c) => ({
      claim: str(c.claim, 400), category: pick(c.category, CLAIM_CATS, "performance"), evidenceNeeded: str(c.evidenceNeeded),
    })).filter((c) => c.claim),
  });
}

export const POST = withStore(POST_handler, { name: "brandbook", limit: [0, 10] });
