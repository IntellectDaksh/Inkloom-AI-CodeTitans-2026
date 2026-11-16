import { NextRequest, NextResponse } from "next/server";
import { getMe, supabaseAdmin } from "@/lib/auth/server";
import { rateLimit } from "@/lib/rateLimit";

const KINDS = ["help", "suggestion", "bug", "other"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Owner inbox access comes from config, not code: comma-separated emails in OWNER_EMAILS.
const owners = () => (process.env.OWNER_EMAILS ?? "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);

// POST: anyone (signed in or not) sends help / suggestion / bug. Rate-limited per IP.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!(await rateLimit(`feedback:${ip}`, 10, 3600))) {
    return NextResponse.json({ success: false, error: "Too many messages from here. Try again in an hour." }, { status: 429 });
  }
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const kind = typeof b.kind === "string" && KINDS.includes(b.kind) ? b.kind : "other";
  const message = typeof b.message === "string" ? b.message.trim() : "";
  if (message.length < 5) return NextResponse.json({ success: false, error: "Write a little more so we can help." }, { status: 400 });
  if (message.length > 5000) return NextResponse.json({ success: false, error: "Keep it under 5,000 characters." }, { status: 400 });
  const me = await getMe().catch(() => null);
  const email = me?.email || (typeof b.email === "string" ? b.email.trim() : "");
  if (email && !EMAIL.test(email)) return NextResponse.json({ success: false, error: "That email doesn't look right." }, { status: 400 });

  const { error } = await supabaseAdmin().from("feedback").insert({
    kind,
    message,
    email: email || null,
    page: typeof b.page === "string" ? b.page.slice(0, 300) : null,
    user_id: me?.id ?? null,
    organization_id: me?.organizationId ?? null,
    user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
  });
  if (error) return NextResponse.json({ success: false, error: "Couldn't send. Email us instead." }, { status: 500 });
  return NextResponse.json({ success: true });
}

// GET / PATCH: the site owner's inbox.
async function owner() {
  const me = await getMe().catch(() => null);
  return me && owners().includes(me.email.toLowerCase()) ? me : null;
}

export async function GET() {
  if (!(await owner())) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  const { data, error } = await supabaseAdmin().from("feedback").select("*").order("created_at", { ascending: false }).limit(300);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, items: data });
}

export async function PATCH(req: NextRequest) {
  if (!(await owner())) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  const { id, status } = (await req.json().catch(() => ({}))) as { id?: number; status?: string };
  if (!id || !["new", "read", "done"].includes(status ?? "")) return NextResponse.json({ success: false, error: "id and status required" }, { status: 400 });
  const { error } = await supabaseAdmin().from("feedback").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
