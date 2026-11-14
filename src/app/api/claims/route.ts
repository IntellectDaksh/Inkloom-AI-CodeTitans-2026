import { withStore } from "@/lib/db/withStore";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SEED_IDS } from "@/lib/db/seed";

async function GET_handler(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const brandId = searchParams.get("brandId") || undefined;
    const orgId = searchParams.get("orgId") || SEED_IDS.ORGANISATION_UIDEAS;
    const status = searchParams.get("status") || undefined;

    const claims = db.listClaims(brandId, orgId, status as any);
    return NextResponse.json({ success: true, claims });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

async function POST_handler(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      claimText,
      category = "performance",
      evidenceSource,
      evidenceExcerpt,
      permittedContext = "All digital & print channels",
      restrictedContext,
      expiresAt,
      owner = "Daksh Agrawal",
      brandId = SEED_IDS.BRAND_APEX,
      organizationId = SEED_IDS.ORGANISATION_UIDEAS,
      userId = "usr_daksh",
    } = body;

    if (!claimText) {
      return NextResponse.json(
        { success: false, error: "Claim text is required" },
        { status: 400 }
      );
    }

    const newClaim = db.createClaim({
      organizationId,
      brandId,
      claimText,
      category,
      evidenceSource: evidenceSource || "Internal Documentation",
      evidenceExcerpt: evidenceExcerpt || claimText,
      permittedContext,
      restrictedContext,
      status: "approved",
      owner,
      version: 1,
      effectiveAt: new Date().toISOString(),
      expiresAt: expiresAt || "2027-12-31T23:59:59Z",
    });

    db.recordAuditEvent({
      organizationId,
      brandId,
      userId,
      action: "create_claim",
      entityType: "claim",
      entityId: newClaim.id,
      metadata: { claimText, category },
    });

    return NextResponse.json({ success: true, claim: newClaim });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export const GET = withStore(GET_handler);
export const POST = withStore(POST_handler);
