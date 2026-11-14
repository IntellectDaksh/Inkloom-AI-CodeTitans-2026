"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Check } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { InfoTip } from "@/components/guide/HelpPanel";
import { usePrefs, setPrefs, useWorkspaces, openWorkspacePicker, focusRing } from "@/components/guide/workspace";

/* eslint-disable @typescript-eslint/no-explicit-any */
const get = (u: string) => fetch(u, { cache: "no-store" }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))));
const REVIEW = ["submitted", "under_review", "resubmitted", "needs_re_review"];

export default function BrandsPage() {
  const router = useRouter();
  const prefs = usePrefs();
  const workspaces = useWorkspaces();
  const [data, setData] = useState<{ subs: any[]; claims: any[] } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([get("/api/submissions"), get("/api/claims")])
      .then(([s, c]) => alive && setData({ subs: s.submissions ?? [], claims: c.claims ?? [] }))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  // Claims only carry brand_id; learn id -> name from the submissions.
  const idToName = new Map<string, string>();
  for (const s of data?.subs ?? []) if (s.brand?.id) idToName.set(s.brand.id, s.brand.name);

  const counts = (name: string) => {
    const subs = (data?.subs ?? []).filter((s) => s.brand?.name === name);
    return {
      ads: subs.length,
      review: subs.filter((s) => REVIEW.includes(s.status)).length,
      approved: subs.filter((s) => s.status === "approved").length,
      claims: (data?.claims ?? []).filter((c) => idToName.get(c.brand_id) === name).length,
    };
  };

  const open = (name: string) => {
    setPrefs({ brand: name });
    router.push("/dashboard");
  };

  return (
    <AppLayout title="Brands">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-primary">Brands</h1>
            <p className="mt-1.5 text-sm text-text-secondary">
              Each brand is a separate workspace with its own claims, rules and reviews. Open one to work in it.
            </p>
          </div>
          <button
            type="button"
            onClick={openWorkspacePicker}
            className={`inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-canvas hover:opacity-90 ${focusRing}`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create workspace
          </button>
        </header>

        {error && (
          <p role="alert" className="rounded-lg border border-status-warning/30 bg-status-warning/5 px-4 py-3 text-[13px] text-text-secondary">
            Could not load counts from the server. You can still open any workspace.
          </p>
        )}

        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((w) => {
            const active = w.name === prefs.brand;
            const c = counts(w.name);
            const rows = [
              { label: "Ads checked", value: c.ads, href: "/submissions", tip: "All ads submitted for this brand." },
              { label: "In review", value: c.review, href: "/submissions?status=under_review", tip: "Checked and waiting for a person to sign off." },
              { label: "Approved", value: c.approved, href: "/submissions?status=approved", tip: "Signed off and safe to publish." },
              { label: "Claims", value: c.claims, href: "/knowledge-base/claims", tip: "Approved statements with proof, used to check this brand's ads." },
            ];
            return (
              <li key={w.name} className={`glass flex flex-col rounded-2xl p-5 ${active ? "ring-1 ring-ink/30" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-text-primary">{w.name}</h2>
                    <p className="mt-0.5 text-[13px] text-text-muted">{w.industry}</p>
                  </div>
                  {active && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border-default px-2 py-0.5 text-xs text-text-secondary">
                      <Check className="h-3 w-3" aria-hidden="true" /> Current
                    </span>
                  )}
                </div>
                {w.description && <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">{w.description}</p>}
                {w.channels.length > 0 && <p className="mt-2 text-xs text-text-muted">Channels: {w.channels.join(", ")}</p>}

                <dl className="mt-4 grid grid-cols-2 gap-2">
                  {rows.map((r) => (
                    <div key={r.label} className="relative rounded-xl border border-border-subtle">
                      <Link href={r.href} onClick={() => setPrefs({ brand: w.name })} className={`block rounded-xl p-3 hover:bg-panel-hover ${focusRing}`}>
                        <dt className="pr-5 text-xs text-text-muted">{r.label}</dt>
                        <dd className="mt-1 text-lg font-semibold tabular-nums text-text-primary">
                          {data === null && !error ? <span className="inline-block h-5 w-6 animate-pulse rounded bg-panel-hover align-middle" /> : error ? "-" : r.value}
                        </dd>
                      </Link>
                      <span className="absolute right-1 top-1"><InfoTip label={r.label}>{r.tip}</InfoTip></span>
                    </div>
                  ))}
                </dl>
                {w.custom && <p className="mt-3 text-xs text-text-muted">Saved in this browser only until accounts are connected.</p>}

                <button
                  type="button"
                  onClick={() => open(w.name)}
                  className={`mt-4 h-10 rounded-lg border border-border-default bg-panel text-sm font-medium text-text-primary hover:bg-panel-hover ${focusRing}`}
                >
                  {active ? "Go to dashboard" : `Open ${w.name}`}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </AppLayout>
  );
}
