import { supabaseAdmin } from "@/lib/auth/server";

/** Events that respect profiles.prefs.notifyEmail (default on). */
export type EmailKind = "review_assigned" | "changes_requested" | "approved" | "rejected" | "claim_expiring" | "mention";

interface Mail {
  subject: string;
  heading: string;
  body: string;
  /** App-relative link, e.g. /submissions/abc. */
  link?: string;
  cta?: string;
}

let warned = false;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const appUrl = () => (process.env.NEXT_PUBLIC_APP_URL || "https://adsnitch.cv").replace(/\/$/, "");

function render(m: Mail) {
  const url = m.link ? appUrl() + m.link : appUrl();
  const html = `<!doctype html><html><body style="margin:0;background:#f4f5f7;font-family:Helvetica,Arial,sans-serif;color:#0b1620">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#0b1620;padding:18px 24px;color:#fff;font-size:16px;font-weight:bold">Ad<span style="color:#e5535d">Snitch</span></td></tr>
<tr><td style="padding:28px 24px">
<h1 style="margin:0 0 12px;font-size:20px;line-height:1.3">${esc(m.heading)}</h1>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#334155;white-space:pre-line">${esc(m.body)}</p>
<a href="${esc(url)}" style="display:inline-block;background:#e5535d;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-size:14px;font-weight:bold">${esc(m.cta ?? "Open in AdSnitch")}</a>
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b">You get this because email alerts are on in your AdSnitch settings.</td></tr>
</table></td></tr></table></body></html>`;
  const text = `${m.heading}\n\n${m.body}\n\n${m.cta ?? "Open in AdSnitch"}: ${url}\n\n-- AdSnitch. Turn email alerts off in your settings.`;
  return { html, text };
}

/** Sends one email through Resend. No-ops (logged once) when RESEND_API_KEY/EMAIL_FROM are unset. Never throws. */
export async function sendEmail(to: string, m: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    if (!warned) console.warn("[email] RESEND_API_KEY or EMAIL_FROM not set; email notifications are off");
    warned = true;
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: m.subject, ...render(m) }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error(`[email] Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return res.ok;
  } catch (e) {
    console.error("[email] send failed", e instanceof Error ? e.message : e);
    return false;
  }
}

/**
 * Emails users by id. Addresses come from public.profiles (service role), never from client input.
 * Skips anyone with prefs.notifyEmail === false and anyone outside orgId.
 */
export async function emailUsers(orgId: string, userIds: (string | null | undefined)[], m: Mail): Promise<void> {
  const ids = [...new Set(userIds.filter((x): x is string => !!x))];
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return void sendEmail("", m); // logs the "off" warning once
  if (!ids.length) return;
  try {
    const { data } = await supabaseAdmin().from("profiles").select("email, prefs, organization_id").in("id", ids);
    await Promise.all(
      (data ?? [])
        .filter((p) => p.email && p.organization_id === orgId && (p.prefs as Record<string, unknown> | null)?.notifyEmail !== false)
        .map((p) => sendEmail(p.email as string, m)),
    );
  } catch (e) {
    console.error("[email] recipient lookup failed", e instanceof Error ? e.message : e);
  }
}

/** Emails every admin in the organisation. */
export async function emailAdmins(orgId: string, m: Mail): Promise<void> {
  try {
    const { data } = await supabaseAdmin().from("profiles").select("id").eq("organization_id", orgId).eq("role", "admin");
    await emailUsers(orgId, (data ?? []).map((p) => p.id as string), m);
  } catch (e) {
    console.error("[email] admin lookup failed", e instanceof Error ? e.message : e);
  }
}
