import { withStore } from "@/lib/db/withStore";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SEED_IDS } from "@/lib/db/seed";

/** Raise one alert per approved claim whose proof lapses within 30 days, from live claim data. */
function syncExpiryAlerts(userId: string) {
  const existing = db.listNotifications(userId);
  for (const c of db.getApprovedClaims(SEED_IDS.ORGANISATION_UIDEAS, undefined, { expiringOnly: true })) {
    const link = `/knowledge-base/claims?claim=${c.claim_code}`;
    if (existing.some((n) => n.notification_type === "claim_expiring" && (n.link_url === link || n.message.includes(c.claim_code)))) continue;
    const days = c.days_until_expiry ?? 0;
    db.createNotification({
      userId: userId === "usr_daksh" ? SEED_IDS.USER_DAKSH : userId,
      type: "claim_expiring",
      title: `Claim expiring in ${days} day${days === 1 ? "" : "s"}`,
      message: `Approved claim ${c.claim_code} expires on ${String(c.expires_at).slice(0, 10)}. Renew its evidence or ads that use it will be flagged.`,
      linkUrl: link,
    });
  }
}

async function GET_handler(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "usr_daksh";

    syncExpiryAlerts(userId);
    const notifications = db.listNotifications(userId);
    return NextResponse.json({ success: true, notifications });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

async function PATCH_handler(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: "notificationId is required" },
        { status: 400 }
      );
    }

    if (!db.markNotificationRead(notificationId)) {
      return NextResponse.json({ success: false, error: "Notification not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export const GET = withStore(GET_handler);
export const PATCH = withStore(PATCH_handler);
