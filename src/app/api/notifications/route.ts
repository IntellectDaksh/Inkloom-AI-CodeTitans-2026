import { withStore } from "@/lib/db/withStore";
import { NextRequest, NextResponse, after } from "next/server";
import { emailAdmins } from "@/lib/notify/email";
import { db } from "@/lib/db";
import { SEED_IDS } from "@/lib/db/seed";
import { getMe, supabaseServer } from "@/lib/auth/server";

/** Always the signed-in user; the client never chooses whose alerts it reads. */
async function sessionUserId(): Promise<string | null> {
  const { data: { user } } = await (await supabaseServer()).auth.getUser();
  return user?.id ?? null;
}

/** Raise one alert per approved claim whose proof lapses within 30 days, from live claim data. */
function syncExpiryAlerts(userId: string, tenant: string | null) {
  const existing = db.listNotifications(userId);
  const everyone = db.listNotifications();
  for (const c of db.getApprovedClaims(SEED_IDS.ORGANISATION_UIDEAS, undefined, { expiringOnly: true })) {
    const link = `/knowledge-base/claims?claim=${c.claim_code}`;
    if (existing.some((n) => n.notification_type === "claim_expiring" && (n.link_url === link || n.message.includes(c.claim_code)))) continue;
    const days = c.days_until_expiry ?? 0;
    // First alert for this claim anywhere in the workspace: email admins once for this expiry window.
    if (tenant && !everyone.some((n) => n.notification_type === "claim_expiring" && n.link_url === link)) {
      const when = String(c.expires_at).slice(0, 10);
      after(() => emailAdmins(tenant, {
        subject: `Claim ${c.claim_code} expires in ${days} day${days === 1 ? "" : "s"}`,
        heading: "An approved claim is about to expire",
        body: `Claim ${c.claim_code} expires on ${when}. Renew its evidence or ads that use it will be flagged.`,
        link, cta: "Renew the claim",
      }));
    }
    db.createNotification({
      userId,
      type: "claim_expiring",
      title: `Claim expiring in ${days} day${days === 1 ? "" : "s"}`,
      message: `Approved claim ${c.claim_code} expires on ${String(c.expires_at).slice(0, 10)}. Renew its evidence or ads that use it will be flagged.`,
      linkUrl: link,
    });
  }
}

async function GET_handler(req: NextRequest) {
  try {
    const userId = await sessionUserId();
    if (!userId) return NextResponse.json({ success: false, error: "Sign in to do this." }, { status: 401 });

    const me = await getMe();
    syncExpiryAlerts(userId, me?.organizationId ?? null);
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

    const userId = await sessionUserId();
    const mine = userId && db.listNotifications(userId).some((n: { id: string }) => n.id === notificationId);
    if (!mine || !db.markNotificationRead(notificationId)) {
      return NextResponse.json({ success: false, error: "Notification not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export const GET = withStore(GET_handler);
export const PATCH = withStore(PATCH_handler);
