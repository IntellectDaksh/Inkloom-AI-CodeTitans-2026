import { lookup } from "node:dns/promises";
import { createHmac } from "crypto";
import { isIP } from "net";
import { supabaseAdmin } from "@/lib/auth/server";
import { reportError } from "@/lib/ops/errors";

export const WEBHOOK_EVENTS = ["ad_blocked", "approval_requested", "approved", "rejected"] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export const EVENT_LABEL: Record<WebhookEvent, string> = {
  ad_blocked: "Ad blocked",
  approval_requested: "Approval requested",
  approved: "Approved",
  rejected: "Rejected",
};

function privateIp(h: string): boolean {
  const v = isIP(h);
  if (v === 4) {
    const [a, b] = h.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  if (v === 6) {
    const x = h.toLowerCase();
    return x === "::1" || x === "::" || x.startsWith("fc") || x.startsWith("fd") || x.startsWith("fe80") || x.startsWith("::ffff:");
  }
  return false;
}

/** Error message, or null if the URL is an acceptable public https endpoint. */
export function validateWebhookUrl(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return "Enter a full URL starting with https://";
  }
  if (u.protocol !== "https:") return "The URL must use https.";
  if (u.username || u.password) return "Remove credentials from the URL.";
  const host = u.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal") || !host.includes(".") && !isIP(host)) return "Local addresses are not allowed.";
  if (privateIp(host)) return "Private network addresses are not allowed.";
  if (raw.length > 500) return "That URL is too long.";
  return null;
}
/** Resolves the host right before sending and refuses if any address is private (SSRF via DNS). */
export async function resolvesToPublic(rawUrl: string): Promise<boolean> {
  try {
    const host = new URL(rawUrl).hostname.replace(/^\[|\]$/g, "");
    if (isIP(host)) return !privateIp(host);
    const addrs = await lookup(host, { all: true, verbatim: true });
    return addrs.length > 0 && addrs.every((a) => !privateIp(a.address));
  } catch {
    return false;
  }
}
// ponytail: resolve-then-fetch leaves a tiny DNS-rebinding window; pin the IP with a custom agent if that matters.

export interface WebhookPayload {
  title: string;
  submissionId?: string;
  actor?: string;
  note?: string;
}

/** Posts the event to every org webhook subscribed to it. 5s timeout each; failures go to error_events. Never throws. */
export async function fireWebhooks(orgId: string, event: WebhookEvent, p: WebhookPayload): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SECRET_KEY) return;
  let hooks: { id: string; url: string; secret: string }[] = [];
  try {
    const { data, error } = await supabaseAdmin().from("webhooks").select("id, url, secret").eq("organization_id", orgId).contains("events", [event]);
    if (error) throw new Error(error.message);
    hooks = data ?? [];
  } catch (e) {
    await reportError({ source: "server", message: `webhook lookup failed: ${e instanceof Error ? e.message : e}`, route: "webhooks", organizationId: orgId });
    return;
  }
  if (!hooks.length) return;
  const base = (process.env.NEXT_PUBLIC_APP_URL || "https://adsnitch.cv").replace(/\/$/, "");
  const link = p.submissionId ? `${base}/submissions/${p.submissionId}` : base;
  const body = JSON.stringify({
    text: `*${EVENT_LABEL[event]}*: ${p.title}${p.actor ? ` (by ${p.actor})` : ""}${p.note ? `\n> ${p.note}` : ""}\n<${link}|Open in AdSnitch>`,
    event,
    organization_id: orgId,
    submission_id: p.submissionId ?? null,
    title: p.title,
    actor: p.actor ?? null,
    note: p.note ?? null,
    url: link,
    sent_at: new Date().toISOString(),
  });
  await Promise.all(
    hooks.map(async (h) => {
      if (validateWebhookUrl(h.url)) return;
      if (!(await resolvesToPublic(h.url))) {
        await reportError({ source: "server", message: `webhook ${h.id} skipped: resolves to a private address`, route: "webhooks", organizationId: orgId });
        return;
      }
      try {
        const sig = createHmac("sha256", h.secret).update(body).digest("hex");
        const res = await fetch(h.url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-AdSnitch-Signature": `sha256=${sig}`, "X-AdSnitch-Event": event },
          body,
          redirect: "manual",
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch (e) {
        await reportError({ source: "server", message: `webhook ${h.id} (${event}) failed: ${e instanceof Error ? e.message : e}`, route: "webhooks", organizationId: orgId });
      }
    }),
  );
}
