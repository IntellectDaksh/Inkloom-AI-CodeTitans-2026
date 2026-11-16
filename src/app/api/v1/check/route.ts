import { NextRequest, NextResponse } from "next/server";
import { withStore } from "@/lib/db/withStore";
import { runGovernancePipeline } from "@/lib/ai";
import { db } from "@/lib/db";
import { SEED_IDS } from "@/lib/db/seed";
import type { ContentChannel } from "@/lib/ai/types";

const MAX_CHARS = 8000;
const CHANNELS: ContentChannel[] = ["general", "social_media", "email", "landing_page", "press_release", "advertisement", "blog_post", "product_documentation"];

/** Public API: check ad copy against the key's organisation rules. Nothing is saved. */
async function POST_handler(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as { text?: unknown; brandId?: unknown; channel?: unknown } | null;
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text) return NextResponse.json({ success: false, error: "`text` is required." }, { status: 400 });
    if (text.length > MAX_CHARS) return NextResponse.json({ success: false, error: `\`text\` must be under ${MAX_CHARS} characters.` }, { status: 400 });
    const orgId = SEED_IDS.ORGANISATION_UIDEAS; // each organisation's document uses the seed org id internally
    const brand = typeof body?.brandId === "string" ? db.getBrandById(orgId, body.brandId) : db.getActiveBrand(orgId);
    if (!brand) return NextResponse.json({ success: false, error: "Unknown `brandId`." }, { status: 400 });
    const channel = typeof body?.channel === "string" && CHANNELS.includes(body.channel as ContentChannel) ? (body.channel as ContentChannel) : "general";
    const r = await runGovernancePipeline(`api-${crypto.randomUUID()}`, text, brand.id, orgId, channel);
    return NextResponse.json({
      success: true,
      verdict: r.status,
      score: r.complianceScore,
      brandId: brand.id,
      channel,
      summary: r.executiveSummary,
      findings: r.findings.map((f) => ({
        severity: f.severity,
        category: f.category,
        flaggedText: f.flaggedText,
        explanation: f.explanation,
        suggestedCorrection: f.suggestedCorrection ?? null,
        unverified: f.unverified,
      })),
      suggestedRevision: r.suggestedRevisedContent || null,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message || "The check failed. Try again." }, { status: 500 });
  }
}

export const POST = withStore(POST_handler, { apiKey: true, name: "v1-check" });
