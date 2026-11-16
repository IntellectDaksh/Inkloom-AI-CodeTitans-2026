import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SEED_IDS } from "@/lib/db/seed";
import { withStore } from "@/lib/db/withStore";
import { userId } from "@/lib/files/kbRoute";

const ORG = SEED_IDS.ORGANISATION_UIDEAS;
const CATS = ["efficacy", "safety", "sourcing", "performance", "certifications"];

/** Saves reviewed brand-book claims as under_review. Never approved: proof is attached and signed off later. */
async function POST_handler(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const brand = db.resolveBrand(ORG, body?.brand);
  if (!brand) return NextResponse.json({ success: false, error: "Unknown workspace." }, { status: 404 });
  if (!db.listWorkspaces(ORG).find((w) => w.id === brand.id)?.custom)
    return NextResponse.json({ success: false, error: "Sample brands are read-only." }, { status: 403 });
  const claims: unknown = body?.claims;
  if (!Array.isArray(claims) || !claims.length || claims.length > 40)
    return NextResponse.json({ success: false, error: "Send 1 to 40 claims." }, { status: 400 });
  const uid = await userId();
  let saved = 0;
  for (const c of claims as Record<string, unknown>[]) {
    const text = typeof c?.claim === "string" ? c.claim.trim().slice(0, 400) : "";
    if (text.length < 3) continue;
    const need = typeof c.evidenceNeeded === "string" ? c.evidenceNeeded.trim().slice(0, 300) : "";
    const claim = db.createClaim({
      organizationId: ORG, brandId: brand.id, claimText: text,
      category: CATS.includes(c.category as string) ? c.category : "performance",
      status: "under_review",
      restrictedContext: need ? `Proof needed: ${need}` : "Proof needed before use",
      userId: uid,
    });
    db.recordAuditEvent({ organizationId: ORG, brandId: brand.id, userId: uid, action: "create_claim", entityType: "claim", entityId: claim.id, metadata: { claimText: text, source: "brand_book" } });
    saved++;
  }
  return NextResponse.json({ success: true, saved });
}

export const POST = withStore(POST_handler);
