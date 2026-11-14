"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, FileText, Plus, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { FindingItem, dedupeFindings, estimateScore, humanize } from "@/components/submission/shared";

interface Row {
  id: string;
  title: string;
  status: string;
  channel?: string;
  currentContent?: string;
  authorName?: string;
  created_at?: string;
  brand?: { name?: string };
  metadata?: { sourceFile?: { fileName?: string; method?: string }; campaign?: string };
  latest_analysis?: { overall_score?: number } | null;
  complianceScore?: number;
  findings?: FindingItem[];
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "under_review", label: "Waiting for reviewer" },
  { id: "changes_requested", label: "Changes requested" },
  { id: "approved", label: "Approved" },
  { id: "submitted", label: "Draft" },
] as const;

const STATUS: Record<string, { label: string; dot: string }> = {
  submitted: { label: "Draft", dot: "bg-text-muted" },
  under_review: { label: "Waiting for reviewer", dot: "bg-status-warning" },
  needs_re_review: { label: "Needs re-review", dot: "bg-status-warning" },
  changes_requested: { label: "Changes requested", dot: "bg-status-critical" },
  rejected: { label: "Rejected", dot: "bg-status-critical" },
  approved: { label: "Approved", dot: "bg-status-success" },
};

const scoreOf = (r: Row) =>
  r.complianceScore ?? r.latest_analysis?.overall_score ?? (r.findings ? estimateScore(dedupeFindings(r.findings), r.currentContent || "") : null);

const ago = (iso?: string) => {
  if (!iso) return "";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (isNaN(m)) return "";
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return new Date(iso).toLocaleDateString();
};

export default function SubmissionsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [created, setCreated] = useState(0);

  const load = () => {
    setState("loading");
    fetch("/api/submissions?orgId=org_uideas_digital")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setRows(d.submissions || []);
        setState("ready");
      })
      .catch(() => setState("error"));
  };

  useEffect(() => {
    load();
    const qs = new URLSearchParams(window.location.search);
    setCreated(Number(qs.get("created")) || 0);
    const st = qs.get("status");
    if (st && FILTERS.some((f) => f.id === st)) setFilter(st);
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.status] = (c[r.status] || 0) + 1;
    return c;
  }, [rows]);

  const q = search.trim().toLowerCase();
  const shown = rows.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      (!q ||
        [r.title, r.channel, r.authorName, r.brand?.name, r.metadata?.sourceFile?.fileName, r.metadata?.campaign].some((v) => v?.toLowerCase().includes(q)))
  );

  return (
    <AppLayout title="Reviews" subtitle="Every ad you've checked, and where it is in approval.">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-[28px]">Reviews</h1>
            <p className="mt-1 text-sm text-text-secondary">Open one to see issues and fixes, or start a new check.</p>
          </div>
          <Link href="/submissions/new">
            <Button icon={<Plus className="h-4 w-4" />}>New review</Button>
          </Link>
        </div>

        {created > 1 && (
          <p role="status" className="rounded-xl border border-border-default bg-panel p-4 text-sm text-text-primary">
            {created} ads were checked. They're at the top of the list.
          </p>
        )}

        <div className="space-y-3">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden />
            <label htmlFor="search" className="sr-only">
              Search reviews
            </label>
            <input
              id="search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, brand, file or author"
              autoComplete="off"
              className="h-11 w-full rounded-lg glass-inset pl-9 pr-3 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-blue/50"
            />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue cursor-pointer ${
                  filter === f.id ? "border-ink bg-ink text-ghost" : "border-border-default bg-panel text-text-secondary hover:text-text-primary"
                }`}
              >
                {f.label}
                <span className="tabular-nums opacity-70">{counts[f.id] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass overflow-hidden rounded-2xl" aria-live="polite" aria-busy={state === "loading"}>
          {state === "loading" ? (
            <ul className="divide-y divide-border-subtle">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-center gap-4 p-4">
                  <div className="h-4 flex-1 animate-pulse rounded bg-panel-elevated motion-reduce:animate-none" />
                  <div className="h-4 w-16 animate-pulse rounded bg-panel-elevated motion-reduce:animate-none" />
                </li>
              ))}
            </ul>
          ) : state === "error" ? (
            <div className="space-y-3 p-10 text-center">
              <p className="text-sm font-medium text-text-primary">Couldn't load your reviews</p>
              <Button variant="secondary" size="sm" onClick={load}>
                Try again
              </Button>
            </div>
          ) : rows.length === 0 ? (
            <div className="space-y-3 p-10 text-center">
              <FileText className="mx-auto h-8 w-8 text-text-muted" aria-hidden />
              <p className="text-base font-semibold text-text-primary">No reviews yet</p>
              <p className="mx-auto max-w-sm text-sm text-text-secondary">Paste or upload an ad and we'll check it against your brand's rules in seconds.</p>
              <Link href="/submissions/new" className="inline-block">
                <Button icon={<Plus className="h-4 w-4" />}>Check your first ad</Button>
              </Link>
            </div>
          ) : shown.length === 0 ? (
            <div className="space-y-3 p-10 text-center">
              <p className="text-sm font-medium text-text-primary">Nothing matches</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
              >
                Clear search and filters
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {shown.map((r) => {
                const s = STATUS[r.status] || { label: humanize(r.status), dot: "bg-text-muted" };
                const score = scoreOf(r);
                const file = r.metadata?.sourceFile?.fileName;
                return (
                  <li key={r.id}>
                    <Link
                      href={`/submissions/${r.id}`}
                      className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-panel-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue sm:px-5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text-primary">{r.title}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-text-muted">
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden />
                            {s.label}
                          </span>
                          <span aria-hidden>·</span>
                          <span>{r.brand?.name || humanize(r.channel)}</span>
                          {r.created_at && (
                            <>
                              <span aria-hidden>·</span>
                              <span>{ago(r.created_at)}</span>
                            </>
                          )}
                          {file && (
                            <span className="inline-flex max-w-[12rem] items-center gap-1 truncate rounded-md border border-border-default bg-panel px-1.5 py-0.5 text-xs text-text-secondary">
                              <FileText className="h-3 w-3 shrink-0" aria-hidden />
                              <span className="truncate">{file}</span>
                            </span>
                          )}
                        </p>
                      </div>
                      {score !== null && (
                        <span
                          className={`shrink-0 text-base font-semibold tabular-nums ${
                            score >= 80 ? "text-status-success" : score >= 50 ? "text-status-warning" : "text-status-critical"
                          }`}
                          aria-label={`Score ${score} out of 100`}
                        >
                          {score}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {state === "ready" && rows.length > 0 && (
          <p className="text-[13px] text-text-muted">
            Showing {shown.length} of {rows.length}
          </p>
        )}
      </div>
    </AppLayout>
  );
}
