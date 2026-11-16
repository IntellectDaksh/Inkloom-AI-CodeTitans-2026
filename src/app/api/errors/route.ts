import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/auth/server";
import { reportError } from "@/lib/ops/errors";
import { rateLimit } from "@/lib/rateLimit";

// Browser crash reports from error boundaries. Rate-limited so it can't be used to flood the table.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!(await rateLimit(`errors:${ip}`, 30, 3600))) return new NextResponse(null, { status: 204 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof b.message !== "string" || !b.message) return NextResponse.json({ success: false }, { status: 400 });
  const { data: { user } } = await (await supabaseServer()).auth.getUser().catch(() => ({ data: { user: null } }));
  await reportError({
    source: "client",
    message: b.message,
    stack: typeof b.stack === "string" ? b.stack : null,
    digest: typeof b.digest === "string" ? b.digest : null,
    route: typeof b.route === "string" ? b.route : null,
    userId: user?.id ?? null,
    userAgent: req.headers.get("user-agent"),
  });
  return new NextResponse(null, { status: 204 });
}
