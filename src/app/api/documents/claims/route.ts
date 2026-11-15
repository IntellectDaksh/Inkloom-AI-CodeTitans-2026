import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SEED_IDS } from "@/lib/db/seed";
import { withStore } from "@/lib/db/withStore";
import { userId } from "@/lib/files/kbRoute";

// Per-claim review records the claims table has no columns for: edited flags,
// attached evidence (with uploaded file ids), reviewer sign-offs, re-review flags.
const ORG = SEED_IDS.ORGANISATION_UIDEAS;
const ACTIONS = ["claim_edited", "evidence_attached", "evidence_verified", "claim_flagged", "claim_updated"];

async function GET_handler() {
  const records: Record<string, unknown>[] = [];
  for (const b of db.getBrands(ORG)) records.push(...db.listKbItems(ORG, b.id, "claim").items);
  return NextResponse.json({ success: true, records });
}

async function PUT_handler(req: NextRequest) {
  let body: { claimId?: string; record?: Record<string, unknown>; action?: string; detail?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 });
  }
  const claim = body.claimId ? db.getClaimById(ORG, body.claimId) : undefined;
  if (!claim) return NextResponse.json({ success: false, error: "Claim not found." }, { status: 404 });
  const rec = body.record;
  if (!rec || typeof rec !== "object" || Array.isArray(rec) || JSON.stringify(rec).length > 500_000)
    return NextResponse.json({ success: false, error: "record must be an object." }, { status: 400 });
  const action = ACTIONS.includes(String(body.action)) ? String(body.action) : "claim_updated";
  const detail = body.detail && typeof body.detail === "object" ? body.detail : {};
  const saved = db.putKbItem(ORG, claim.brand_id, "claim", claim.id, { ...rec, id: claim.id }, action,
    { claim_code: claim.claim_code, ...detail }, await userId());
  return NextResponse.json({ success: true, record: saved });
}

export const GET = withStore(GET_handler);
export const PUT = withStore(PUT_handler);
