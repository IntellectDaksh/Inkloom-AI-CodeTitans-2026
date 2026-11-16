import { NextRequest, NextResponse } from "next/server";
import { getMe, supabaseAdmin } from "@/lib/auth/server";

/** Revoke a share link. Scoped to the caller's org so ids from elsewhere do nothing. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getMe().catch(() => null);
  if (!me?.organizationId) return NextResponse.json({ success: false, error: "Sign in to do this." }, { status: 401 });
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ success: false, error: "Link not found." }, { status: 404 });
  const { data, error } = await supabaseAdmin()
    .from("share_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organization_id", me.organizationId)
    .is("revoked_at", null)
    .select("id");
  if (error) return NextResponse.json({ success: false, error: "Could not revoke the link." }, { status: 500 });
  if (!data?.length) return NextResponse.json({ success: false, error: "Link not found or already revoked." }, { status: 404 });
  return NextResponse.json({ success: true });
}
