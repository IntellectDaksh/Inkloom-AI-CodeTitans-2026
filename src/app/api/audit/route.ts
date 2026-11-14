import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SEED_IDS } from "@/lib/db/seed";

const ENTITY_HREF: Record<string, (id: string) => string> = {
  submission: (id) => `/submissions/${id}`,
  claim: () => `/knowledge-base/claims`,
};

/** GET /api/audit — ledger of every audit event. ?verify=1 recomputes the SHA-256 chain server-side. */
export async function GET(req: NextRequest) {
  try {
    if (req.nextUrl.searchParams.get("verify") === "1") {
      return NextResponse.json({ success: true, verification: db.verifyAuditChain(), verifiedAt: new Date().toISOString() });
    }
    const orgId = req.nextUrl.searchParams.get("orgId") || SEED_IDS.ORGANISATION_UIDEAS;
    const users = new Map(db.getUserProfiles(orgId).map((u) => [u.id, u]));
    const events = db.getAuditEvents(orgId).map((e) => {
      const u = e.user_id ? users.get(e.user_id) : undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = (e.metadata ?? {}) as Record<string, any>;
      const subId = e.entity_type === "submission" ? e.entity_id : m.submissionId || m.submission_id;
      return {
        id: e.id,
        action: e.action,
        actor: u?.full_name || m.reviewerName || m.actorName || (e.user_id ? "Unknown user" : "System"),
        role: u?.role || m.reviewerRole || m.role || null,
        entityType: e.entity_type,
        entityId: e.entity_id,
        href: subId ? `/submissions/${subId}` : ENTITY_HREF[e.entity_type]?.(e.entity_id) ?? null,
        reason: m.reason || m.notes || m.dismissalReason || m.overrideMemo || null,
        time: e.created_at,
        hash: e.hash ?? null,
        prevHash: e.prev_hash ?? null,
      };
    });
    return NextResponse.json({ success: true, events });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
