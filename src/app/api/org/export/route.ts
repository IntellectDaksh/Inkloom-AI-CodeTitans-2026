import { NextResponse } from "next/server";
import { getMe, supabaseAdmin } from "@/lib/auth/server";
import { rateLimit } from "@/lib/rateLimit";

const fail = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

/** GET /api/org/export — admin only. JSON download: organisation row, full app_state document, member profiles, audit_log rows. */
export async function GET() {
  const me = await getMe();
  if (!me) return fail("Sign in to do this.", 401);
  if (me.role !== "admin") return fail("Only an admin can export the organisation's data.", 403);
  if (!(await rateLimit(`export:u:${me.id}`, 20, 3600))) return fail("Export limit reached. Try again later.", 429);
  const admin = supabaseAdmin();
  const orgId = me.organizationId;

  const [org, doc, profiles] = await Promise.all([
    admin.from("organizations").select("*").eq("id", orgId).maybeSingle(),
    admin.from("app_state").select("data, version, updated_at").eq("id", orgId).maybeSingle(),
    admin.from("profiles").select("id, email, full_name, bio, avatar_url, role, job_title, created_at").eq("organization_id", orgId),
  ]);
  const err = org.error || doc.error || profiles.error;
  if (err) return fail("Could not read the organisation's data. Try again.", 500);

  const audit: unknown[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await admin.from("audit_log").select("*").eq("organization_id", orgId).order("created_at").range(from, from + 999);
    if (error) return fail("Could not read the audit log. Try again.", 500);
    audit.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }

  const body = JSON.stringify({
    exportedAt: new Date().toISOString(),
    exportedBy: me.id,
    organization: org.data,
    document: doc.data?.data ?? null,
    documentVersion: doc.data?.version ?? null,
    profiles: profiles.data ?? [],
    auditLog: audit,
  }, null, 2);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="adsnitch-export-${orgId}-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
