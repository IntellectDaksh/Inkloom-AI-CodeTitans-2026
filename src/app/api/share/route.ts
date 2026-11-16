import { randomBytes, createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { withStore } from "@/lib/db/withStore";
import { getMe, supabaseAdmin } from "@/lib/auth/server";
import { buildReportData } from "@/app/api/submissions/[id]/report/data";

const TTL: Record<string, number> = { "24h": 86400, "7d": 7 * 86400, "30d": 30 * 86400 };
const hashToken = (t: string) => createHash("sha256").update(t, "utf8").digest("hex");

/** Active (unexpired, unrevoked) links for one submission in the caller's org. Tokens are never returned again. */
async function GET_handler(req: NextRequest) {
  const me = await getMe();
  if (!me?.organizationId) return NextResponse.json({ success: false, error: "Sign in to do this." }, { status: 401 });
  const submissionId = req.nextUrl.searchParams.get("submissionId");
  if (!submissionId) return NextResponse.json({ success: false, error: "submissionId is required" }, { status: 400 });
  const { data, error } = await supabaseAdmin()
    .from("share_links")
    .select("id, created_at, expires_at")
    .eq("organization_id", me.organizationId)
    .eq("submission_id", submissionId)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ success: false, error: "Could not load share links." }, { status: 500 });
  return NextResponse.json({ success: true, links: data });
}

async function POST_handler(req: NextRequest) {
  const me = await getMe();
  if (!me?.organizationId) return NextResponse.json({ success: false, error: "Sign in to do this." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const ttl = TTL[body.expiresIn as string];
  if (!ttl || typeof body.submissionId !== "string") return NextResponse.json({ success: false, error: "Pick an expiry: 24h, 7d or 30d." }, { status: 400 });
  const snapshot = buildReportData(body.submissionId);
  if (!snapshot) return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
  const { data, error } = await supabaseAdmin()
    .from("share_links")
    .insert({ token_hash: hashToken(token), organization_id: me.organizationId, submission_id: body.submissionId, created_by: me.id, expires_at: expiresAt, snapshot })
    .select("id, created_at, expires_at")
    .single();
  if (error) return NextResponse.json({ success: false, error: "Could not create the link." }, { status: 500 });
  return NextResponse.json({ success: true, link: data, url: `${req.nextUrl.origin}/share/${token}` });
}

export const GET = withStore(GET_handler);
export const POST = withStore(POST_handler, { name: "share", limit: [0, 60] });
