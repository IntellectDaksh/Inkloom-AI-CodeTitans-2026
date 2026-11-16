import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/auth/server";
import { getHealth } from "@/app/api/health/health";

export const metadata: Metadata = { title: "Status · AdSnitch", description: "Current service status." };

/** Errors in the last 24h: a count only, nothing about what they were. Null when the database can't be read. */
async function errorCount24h(): Promise<number | null> {
  try {
    const { count, error } = await supabaseAdmin().from("error_events").select("id", { count: "exact", head: true }).gte("occurred_at", new Date(Date.now() - 86_400_000).toISOString());
    return error ? null : count ?? 0;
  } catch {
    return null;
  }
}

export default async function StatusPage() {
  await connection();
  const [h, errors] = await Promise.all([getHealth(), errorCount24h()]);
  const ok = h.status === "ok";
  const rows: [string, string, boolean][] = [
    ["Database", h.checks.database ? "Reachable" : "Unreachable", h.checks.database],
    ["AI analysis", h.checks.gemini ? "Configured" : "Running on the offline analyzer", h.checks.gemini],
    ["Errors in the last 24 hours", errors === null ? "Unknown" : String(errors), errors !== null && errors < 50],
  ];
  return (
    <main className="mx-auto min-h-screen max-w-xl bg-canvas px-4 py-16 text-text-primary">
      <h1 className="text-[28px] font-semibold tracking-tight">Status</h1>
      <p role="status" className={`mt-4 flex items-center gap-2 rounded-xl border p-4 text-sm font-medium ${ok ? "border-status-success/30 bg-status-success/10" : "border-status-critical/30 bg-status-critical/10 text-status-critical"}`}>
        <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${ok ? "bg-status-success" : "bg-status-critical"}`} />
        {ok ? "All systems operational" : "Service degraded"}
      </p>
      <dl className="mt-6 divide-y divide-border-subtle rounded-xl border border-border-default">
        {rows.map(([k, v, good]) => (
          <div key={k} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <dt className="text-text-secondary">{k}</dt>
            <dd className={good ? "text-text-primary" : "text-status-critical"}>{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs text-text-muted">
        Version {h.version} · checked <time dateTime={h.time}>{new Date(h.time).toUTCString()}</time> · <Link href="/" className="underline underline-offset-2">Home</Link>
      </p>
    </main>
  );
}
