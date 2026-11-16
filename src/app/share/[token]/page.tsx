import { connection } from "next/server";
import { createHash } from "crypto";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/auth/server";
import { rateLimit } from "@/lib/rateLimit";
import { ReportDocument } from "@/components/submission/ReportDocument";
import type { ReportData } from "@/components/submission/report";

export const metadata: Metadata = { title: "Shared review report - AdSnitch", robots: { index: false, follow: false } };

export default async function SharedReportPage({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  const { token } = await params;
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!(await rateLimit(`share:ip:${ip}`, 60, 3600))) {
    return <p role="alert" style={{ padding: 24, background: "#fff", color: "#b91c1c" }}>Too many requests. Try again later.</p>;
  }
  // base64url of 32 bytes is 43 chars; anything else can't be a real token.
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) notFound();

  const { data } = await supabaseAdmin()
    .from("share_links")
    .select("snapshot, expires_at, revoked_at")
    .eq("token_hash", createHash("sha256").update(token, "utf8").digest("hex"))
    .maybeSingle();
  if (!data || data.revoked_at || new Date(data.expires_at).getTime() <= Date.now()) notFound();

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <ReportDocument
        data={data.snapshot as ReportData}
        banner={
          <p className="no-print" style={{ fontSize: 12, color: "#555", margin: "0 0 12px" }}>
            Read-only snapshot shared from AdSnitch. Link expires {new Date(data.expires_at).toUTCString()}.
          </p>
        }
      />
    </div>
  );
}
