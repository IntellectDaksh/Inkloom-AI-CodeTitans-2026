import { NextRequest, NextResponse } from "next/server";
import { getMe, hashApiKey, supabaseAdmin } from "@/lib/auth/server";
import { rateLimit } from "@/lib/rateLimit";

async function admin() {
  const me = await getMe();
  if (!me) return { err: NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 }) };
  if (me.role !== "admin") return { err: NextResponse.json({ success: false, error: "Only admins can manage API keys." }, { status: 403 }) };
  return { me };
}

export async function GET() {
  const { me, err } = await admin();
  if (err) return err;
  const { data, error } = await supabaseAdmin()
    .from("api_keys")
    .select("id, name, prefix, created_at, last_used_at, revoked_at")
    .eq("organization_id", me.organizationId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ success: false, error: "Could not load keys." }, { status: 500 });
  return NextResponse.json({ success: true, keys: data });
}

export async function POST(req: NextRequest) {
  const { me, err } = await admin();
  if (err) return err;
  const { name } = (await req.json().catch(() => ({}))) as { name?: string };
  const label = name?.trim().slice(0, 60);
  if (!label) return NextResponse.json({ success: false, error: "Give the key a name." }, { status: 400 });
  if (!(await rateLimit(`keys:${me.id}`, 20, 86400))) return NextResponse.json({ success: false, error: "Daily key limit reached." }, { status: 429 });
  const key = `ask_live_${Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString("base64url")}`; // 24 bytes = 32 chars
  const { data, error } = await supabaseAdmin()
    .from("api_keys")
    .insert({ organization_id: me.organizationId, name: label, prefix: key.slice(0, 8), key_hash: await hashApiKey(key), created_by: me.id })
    .select("id, name, prefix, created_at, last_used_at, revoked_at")
    .single();
  if (error) return NextResponse.json({ success: false, error: "Could not create the key." }, { status: 500 });
  return NextResponse.json({ success: true, key, record: data });
}

export async function DELETE(req: NextRequest) {
  const { me, err } = await admin();
  if (err) return err;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "Missing key id." }, { status: 400 });
  const { data, error } = await supabaseAdmin()
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organization_id", me.organizationId)
    .is("revoked_at", null)
    .select("id");
  if (error) return NextResponse.json({ success: false, error: "Could not revoke the key." }, { status: 500 });
  if (!data?.length) return NextResponse.json({ success: false, error: "Key not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
