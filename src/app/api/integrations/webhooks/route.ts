import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getMe, supabaseAdmin } from "@/lib/auth/server";
import { rateLimit } from "@/lib/rateLimit";
import { WEBHOOK_EVENTS, validateWebhookUrl, fireWebhooks, type WebhookEvent } from "@/lib/notify/webhooks";

const COLS = "id, url, events, created_at";
const MAX_PER_ORG = 10;

async function admin() {
  const me = await getMe();
  if (!me) return { err: NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 }) };
  if (me.role !== "admin") return { err: NextResponse.json({ success: false, error: "Only admins can manage integrations." }, { status: 403 }) };
  return { me };
}

export async function GET() {
  const { me, err } = await admin();
  if (err) return err;
  const { data, error } = await supabaseAdmin().from("webhooks").select(COLS).eq("organization_id", me.organizationId).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ success: false, error: "Could not load webhooks." }, { status: 500 });
  return NextResponse.json({ success: true, webhooks: data, events: WEBHOOK_EVENTS });
}

/** Add a webhook ({url, events}) or send a test ({test: true}). The signing secret is returned once, on create. */
export async function POST(req: NextRequest) {
  const { me, err } = await admin();
  if (err) return err;
  const body = (await req.json().catch(() => ({}))) as { url?: unknown; events?: unknown; test?: unknown };
  if (!(await rateLimit(`webhooks:${me.id}`, 30, 3600))) return NextResponse.json({ success: false, error: "Too many changes. Try again later." }, { status: 429 });

  if (body.test === true) {
    await fireWebhooks(me.organizationId, "approval_requested", { title: "Test message from AdSnitch", actor: me.name, note: "If you can read this, the webhook works." });
    return NextResponse.json({ success: true });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  const bad = validateWebhookUrl(url);
  if (bad) return NextResponse.json({ success: false, error: bad }, { status: 400 });
  const events = Array.isArray(body.events) ? [...new Set(body.events.filter((e): e is WebhookEvent => WEBHOOK_EVENTS.includes(e as WebhookEvent)))] : [];
  if (!events.length) return NextResponse.json({ success: false, error: "Pick at least one event." }, { status: 400 });

  const sb = supabaseAdmin();
  const { count } = await sb.from("webhooks").select("id", { count: "exact", head: true }).eq("organization_id", me.organizationId);
  if ((count ?? 0) >= MAX_PER_ORG) return NextResponse.json({ success: false, error: `Up to ${MAX_PER_ORG} webhooks per workspace.` }, { status: 400 });

  const secret = `whsec_${randomBytes(24).toString("base64url")}`;
  const { data, error } = await sb.from("webhooks").insert({ organization_id: me.organizationId, url, events, secret }).select(COLS).single();
  if (error) return NextResponse.json({ success: false, error: "Could not save the webhook." }, { status: 500 });
  return NextResponse.json({ success: true, webhook: data, secret });
}

export async function DELETE(req: NextRequest) {
  const { me, err } = await admin();
  if (err) return err;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
  const { error } = await supabaseAdmin().from("webhooks").delete().eq("id", id).eq("organization_id", me.organizationId);
  if (error) return NextResponse.json({ success: false, error: "Could not remove the webhook." }, { status: 500 });
  return NextResponse.json({ success: true });
}
