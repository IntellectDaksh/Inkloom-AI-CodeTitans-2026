import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SEED_IDS } from "@/lib/db/seed";

// Fields a user may change on a claim. Anything else in the body is ignored.
const EDITABLE = ["claim_text", "category", "expires_at", "allowed_channels", "status"] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const orgId: string = body.organizationId || SEED_IDS.ORGANISATION_UIDEAS;

    // Accept camelCase from the UI as well as store field names.
    const input: Record<string, unknown> = {
      claim_text: body.claim_text ?? body.claimText,
      category: body.category,
      expires_at: body.expires_at ?? body.expiresAt,
      allowed_channels: body.allowed_channels ?? body.channels,
      status: body.status,
    };
    const updates = Object.fromEntries(
      EDITABLE.filter((k) => input[k] !== undefined).map((k) => [k, input[k]])
    );
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: "Nothing to update" }, { status: 400 });
    }
    if (typeof updates.claim_text === "string" && !updates.claim_text.trim()) {
      return NextResponse.json({ success: false, error: "Claim text can't be empty" }, { status: 400 });
    }

    const claim = db.updateApprovedClaim(orgId, id, updates as any);
    if (!claim) {
      return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 });
    }

    // A changed claim puts every draft that relied on it at risk: report them for cascade re-review.
    const dependentSubmissions = db.getDependentSubmissionsForClaim(id);
    db.recordAuditEvent({
      organizationId: orgId,
      brandId: (claim as any).brand_id,
      userId: body.userId,
      action: "claim_updated",
      entityType: "claim",
      entityId: id,
      metadata: { updates, editedBy: body.userName, dependentCount: dependentSubmissions.length },
    });

    return NextResponse.json({ success: true, claim, dependentSubmissions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
