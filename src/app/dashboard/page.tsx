"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Download, Search, UploadCloud, FilePlus2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StartHere } from "@/components/guide/StartHere";
import { InfoTip } from "@/components/guide/HelpPanel";
import { QuickTutorial } from "@/components/guide/QuickTutorial";
import { usePrefs, personaOf, focusRing, openWorkspacePicker } from "@/components/guide/workspace";

type Status = "pending" | "approved" | "changes_requested";

interface SubmissionItem {
  id: string;
  title: string;
  brand: string;
  channel: string;
  author: string;
  status: Status;
  score: number | null;
  submittedAt: string;
}

// Shown only if the API is unreachable, and labelled as sample data in the UI.
const SAMPLE: SubmissionItem[] = [
  { id: "sub_reel_script", title: "Q4 Campaign - Clinical Protein Reel Script", brand: "Apex Nutrition", channel: "Instagram Reel", author: "Creator S.", status: "pending", score: 18, submittedAt: "14m ago" },
  { id: "sub_insta_launch", title: "Product Launch - Recovery Blend Carousel", brand: "Apex Nutrition", channel: "Instagram Carousel", author: "Demo Reviewer", status: "approved", score: 96, submittedAt: "1h ago" },
  { id: "sub_banner_v2", title: "Global Website Banner - Winter Immunity V2", brand: "Apex Nutrition", channel: "Homepage Hero", author: "Analyst R.", status: "changes_requested", score: 64, submittedAt: "2h ago" },
];

const STATUS: Record<Status, { label: string; variant: "pending" | "warning" | "approved" }> = {
  pending: { label: "In review", variant: "pending" },
  changes_requested: { label: "Needs changes", variant: "warning" },
  approved: { label: "Approved", variant: "approved" },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "In review" },
  { id: "changes_requested", label: "Needs changes" },
  { id: "approved", label: "Approved" },
] as const;

const PENDING_UPLOAD_KEY = "adsnitch:pending-upload";
const MAX_HANDOFF_BYTES = 4 * 1024 * 1024;

const rtf = typeof Intl !== "undefined" ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }) : null;
function ago(iso?: string) {
  if (!iso || !rtf) return "";
  const mins = Math.round((Date.parse(iso) - Date.now()) / 60000);
  if (Math.abs(mins) < 60) return rtf.format(mins, "minute");
  if (Math.abs(mins) < 1440) return rtf.format(Math.round(mins / 60), "hour");
  return rtf.format(Math.round(mins / 1440), "day");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromApi(s: any): SubmissionItem {
  const st: string = s.status;
  return {
    id: s.id,
    title: s.title,
    brand: s.brand?.name ?? "",
    channel: s.metadata?.target_channels?.[0] ?? s.channel ?? s.submission_type?.replace(/_/g, " ") ?? "",
    author: s.creator?.full_name ?? s.creator?.name ?? s.authorName ?? "",
    status: st === "approved" ? "approved" : st === "changes_requested" || st === "rejected" ? "changes_requested" : "pending",
    score: s.latest_analysis?.overall_score ?? null,
    submittedAt: ago(s.created_at),
  };
}

function download(content: string, type: string, ext: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `adsnitch-reviews-${new Date().toISOString().slice(0, 10)}.${ext}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function SubmissionRow({ sub }: { sub: SubmissionItem }) {
  const s = STATUS[sub.status];
  return (
    <li>
      <Link
        href={`/submissions/${sub.id}`}
        className={`group flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-panel-hover ${focusRing}`}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text-primary">{sub.title}</p>
          <p className="mt-1 truncate text-[13px] text-text-muted">
            {[sub.channel, sub.author, sub.submittedAt].filter(Boolean).join(", ")}
          </p>
        </div>
        {sub.score !== null && (
          <span className="hidden text-[13px] tabular-nums text-text-secondary sm:inline">{Math.round(sub.score)}/100</span>
        )}
        <Badge variant={s.variant} size="xs">{s.label}</Badge>
        <ChevronRight aria-hidden="true" className="hidden h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 sm:block" />
      </Link>
    </li>
  );
}

function CheckAnAd() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Hand the file to /submissions/new via sessionStorage; extraction happens there.
  const handoff = (file: File) => {
    if (file.size > MAX_HANDOFF_BYTES) {
      setMsg(`${file.name} is over 4 MB. Opening the checker; add it there.`);
      router.push("/submissions/new");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        sessionStorage.setItem(PENDING_UPLOAD_KEY, JSON.stringify({ name: file.name, type: file.type, size: file.size, dataUrl: reader.result }));
      } catch {
        // storage full or blocked: the checker still opens, user re-adds the file
      }
      router.push("/submissions/new?from=dashboard");
    };
    reader.onerror = () => setMsg("Could not read that file. Try another, or paste the text instead.");
    setMsg(`Opening ${file.name}…`);
    reader.readAsDataURL(file);
  };

  return (
    <section aria-labelledby="check-h" className="glass grid gap-5 rounded-2xl p-5 sm:p-6 lg:grid-cols-[1fr_1.2fr] lg:items-center">
      <div>
        <h2 id="check-h" className="text-xl font-semibold text-text-primary">Check an ad</h2>
        <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-text-secondary">
          Paste the copy or drop the file. You get every risky line, why it is risky, the rule it breaks and a safer wording.
        </p>
        <Link
          href="/submissions/new"
          className={`mt-4 inline-flex h-11 items-center gap-2 rounded-lg bg-ink px-5 text-sm font-medium text-canvas hover:opacity-90 active:scale-[0.98] ${focusRing}`}
        >
          <FilePlus2 className="h-4 w-4" aria-hidden="true" />
          Check my ad
        </Link>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const f = e.dataTransfer.files[0];
          if (f) handoff(f);
        }}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
          over ? "border-ink/50 bg-panel-hover" : "border-border-default"
        }`}
      >
        <UploadCloud className="h-6 w-6 text-text-muted" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium text-text-primary">Drop a file here</p>
        <p className="mt-1 text-xs text-text-muted">PDF, Word, image or text. Up to 15 MB.</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`mt-3 rounded-lg border border-border-default bg-panel px-3 py-2 text-[13px] font-medium text-text-primary hover:bg-panel-hover ${focusRing}`}
        >
          Choose a file…
        </button>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          accept=".txt,.md,.markdown,.json,.csv,.html,.rtf,.docx,.pdf,.png,.jpg,.jpeg,.webp"
          onChange={(e) => e.target.files?.[0] && handoff(e.target.files[0])}
        />
        <p className="mt-2 min-h-5 text-xs text-text-muted" aria-live="polite">{msg}</p>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const prefs = usePrefs();
  const persona = personaOf(prefs);
  const [submissions, setSubmissions] = useState<SubmissionItem[] | null>(null);
  const [isSample, setIsSample] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [listTab, setListTab] = useState<"attention" | "recent">("attention");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [hour, setHour] = useState<number | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => setHour(new Date().getHours()), []);

  useEffect(() => {
    fetch("/api/submissions")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setSubmissions((d.submissions ?? []).map(fromApi)))
      .catch(() => {
        setSubmissions(SAMPLE);
        setIsSample(true);
      });
  }, []);

  useEffect(() => {
    if (!showExportMenu) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !exportRef.current?.contains(e.target as Node)) setShowExportMenu(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [showExportMenu]);

  const brandWord = prefs.brand.split(" ")[0].toLowerCase();
  const brandSubs = (submissions ?? []).filter((s) => !s.brand || s.brand.toLowerCase().startsWith(brandWord));
  const count = (st: Status) => brandSubs.filter((s) => s.status === st).length;
  const scored = brandSubs.filter((s) => s.score !== null);
  const avgScore = scored.length ? Math.round(scored.reduce((n, s) => n + (s.score ?? 0), 0) / scored.length) : null;

  const attention = brandSubs.filter((s) => s.status !== "approved").slice(0, 5);
  const q = searchQuery.trim().toLowerCase();
  const recent = brandSubs.filter(
    (s) => (filterStatus === "all" || s.status === filterStatus) && [s.title, s.author, s.channel].some((v) => v.toLowerCase().includes(q))
  );

  const notify = (m: string) => {
    setShowExportMenu(false);
    setExportNotice(m);
    setTimeout(() => setExportNotice(null), 3500);
  };

  const exportRows = brandSubs.map((s) => ({ id: s.id, title: s.title, brand: s.brand, channel: s.channel, score: s.score, status: STATUS[s.status].label, author: s.author }));
  // Opens a print-ready report; the browser's "Save as PDF" produces the file.
  const handleExportPDF = () => {
    const esc = (v: unknown) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
    const rows = exportRows
      .map((r) => `<tr><td>${esc(r.title)}</td><td>${esc(r.channel)}</td><td>${r.score ?? "-"}</td><td>${esc(r.status)}</td><td>${esc(r.author)}</td></tr>`)
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>AdSnitch report - ${esc(prefs.brand)}</title>
<style>body{font:14px/1.5 Inter,system-ui,sans-serif;color:#091520;margin:40px}h1{font-size:24px;margin:0 0 4px}p{color:#536474;margin:0 0 24px}
table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #dfe6ec}th{font-size:12px;color:#536474}
footer{margin-top:24px;font-size:12px;color:#8a99a6}</style></head><body>
<h1>Review report: ${esc(prefs.brand)}</h1><p>Generated ${new Date().toLocaleString()} by ${esc(persona.name)} · ${exportRows.length} reviews</p>
<table><thead><tr><th>Title</th><th>Channel</th><th>Score</th><th>Status</th><th>Author</th></tr></thead><tbody>${rows || '<tr><td colspan="5">No reviews yet.</td></tr>'}</tbody></table>
<footer>AdSnitch · Scores are out of 100. Approved means a reviewer signed off.</footer></body></html>`;
    const w = window.open("", "_blank");
    if (!w) {
      notify("Your browser blocked the report window. Allow pop-ups for this site and try again.");
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
    notify("Report opened. Choose \"Save as PDF\" in the print dialog.");
  };
  const handleExportJSON = () => {
    download(JSON.stringify({ exportedAt: new Date().toISOString(), brand: prefs.brand, reviews: exportRows }, null, 2), "application/json", "json");
    notify("Downloaded as JSON.");
  };
  const handleExportCSV = () => {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const head = ["ID", "Title", "Brand", "Channel", "Score", "Status", "Author"];
    download([head.join(","), ...exportRows.map((r) => Object.values(r).map(esc).join(","))].join("\n"), "text/csv;charset=utf-8;", "csv");
    notify("Downloaded as CSV.");
  };

  const stats = [
    { label: "In review", value: count("pending"), href: "/submissions?status=under_review", tip: "Checked by AdSnitch and waiting for a person to approve or send back." },
    { label: "Needs changes", value: count("changes_requested"), href: "/submissions?status=changes_requested", tip: "A reviewer sent these back. The author fixes them and checks again." },
    { label: "Approved", value: count("approved"), href: "/submissions?status=approved", tip: "Signed off by a reviewer. Safe to publish as written." },
    { label: "Average score", value: avgScore === null ? "-" : `${avgScore}/100`, href: "/analytics", tip: "How closely ads match your approved claims and rules. 100 means nothing flagged; under 60 usually needs edits." },
  ];

  const greeting = hour === null ? "Hello" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <AppLayout title="Dashboard">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-primary">
              {greeting}, {persona.name.split(" ")[0]}
            </h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary">
              <span>
                Workspace: <span className="font-medium text-text-primary">{prefs.brand}</span>
              </span>
              <span aria-hidden="true" className="text-text-muted">·</span>
              <button
                type="button"
                onClick={openWorkspacePicker}
                className={`rounded text-sm font-medium text-[#1f7fa3] underline-offset-4 hover:underline ${focusRing}`}
              >
                Switch
              </button>
            </p>
          </div>
          <div className="relative" ref={exportRef}>
            <Button
              size="sm"
              variant="secondary"
              icon={<Download className="h-4 w-4" />}
              onClick={() => setShowExportMenu((v) => !v)}
              aria-expanded={showExportMenu}
              aria-haspopup="menu"
              className="h-10"
            >
              Export
            </Button>
            {showExportMenu && (
              <div role="menu" className="glass-strong absolute right-0 z-30 mt-2 w-56 rounded-xl p-1">
                {[
                  { label: "CSV spreadsheet", onClick: handleExportCSV },
                  { label: "JSON file", onClick: handleExportJSON },
                  { label: "PDF report", onClick: handleExportPDF },
                ].map((o) => (
                  <button key={o.label} role="menuitem" onClick={o.onClick} className={`w-full rounded-lg px-3 py-2 text-left text-sm text-text-primary hover:bg-panel-hover ${focusRing}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <div aria-live="polite">
          {exportNotice && (
            <p className="rounded-lg border border-status-success/25 bg-status-success/10 px-4 py-3 text-sm text-text-primary">{exportNotice}</p>
          )}
        </div>

        <QuickTutorial />
        <CheckAnAd />

        {isSample && (
          <p role="status" className="rounded-lg border border-status-warning/30 bg-status-warning/5 px-4 py-3 text-[13px] text-text-secondary">
            Could not reach the server, so sample reviews are shown below. They are examples, not your data.
          </p>
        )}

        <section aria-label="Summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass relative rounded-2xl transition-colors hover:bg-panel-hover">
              <Link href={s.href} className={`block rounded-2xl p-5 ${focusRing}`}>
                <p className="pr-6 text-[13px] text-text-muted">{s.label}</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-text-primary">
                  {submissions === null ? <span className="inline-block h-7 w-12 animate-pulse rounded bg-panel-hover align-middle" /> : s.value}
                </p>
                <p className="mt-1 text-xs text-text-muted">View list</p>
              </Link>
              <span className="absolute right-3 top-3">
                <InfoTip label={s.label}>{s.tip}</InfoTip>
              </span>
            </div>
          ))}
        </section>

        <StartHere />

        <div className="glass rounded-2xl p-1.5 sm:inline-flex" role="tablist" aria-label="Reviews">
          {([
            ["attention", `Needs attention${attention.length ? ` (${attention.length})` : ""}`],
            ["recent", "All recent"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={listTab === id}
              onClick={() => setListTab(id)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${focusRing} ${
                listTab === id ? "bg-text-primary text-white" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {listTab === "attention" ? (
        <section aria-labelledby="attention-h" className="glass rounded-2xl p-5 sm:p-6">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 id="attention-h" className="flex items-center gap-1 text-base font-semibold text-text-primary">
              Needs attention
              <InfoTip label="needs attention">Ads that are in review or were sent back for changes. Approved ads drop off this list.</InfoTip>
            </h2>
            <Link href="/approvals" className={`rounded text-[13px] text-text-muted hover:text-text-primary ${focusRing}`}>Open approvals</Link>
          </div>
          {submissions === null ? (
            <ul className="space-y-2" aria-busy="true">
              {[0, 1, 2].map((i) => <li key={i} className="h-14 animate-pulse rounded-xl bg-panel-hover" />)}
            </ul>
          ) : attention.length ? (
            <ul className="-mx-3 space-y-1">{attention.map((s) => <SubmissionRow key={s.id} sub={s} />)}</ul>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-text-primary">You&rsquo;re all caught up</p>
              <p className="mt-1 text-[13px] text-text-muted">Nothing is waiting for {prefs.brand}. Check a new ad when you have one.</p>
            </div>
          )}
        </section>

        ) : (
        <section aria-labelledby="recent-h" className="glass rounded-2xl p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 id="recent-h" className="text-base font-semibold text-text-primary">Recent activity</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <label htmlFor="recent-search" className="sr-only">Search reviews</label>
                <input
                  id="recent-search"
                  type="search"
                  placeholder="Search by title or author…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`h-10 w-full rounded-lg border border-border-default bg-panel pl-9 pr-3 text-base text-text-primary placeholder:text-text-muted sm:w-60 sm:text-sm ${focusRing}`}
                />
              </div>
              <div className="flex gap-1 overflow-x-auto rounded-lg border border-border-default bg-panel p-1" role="group" aria-label="Filter by status">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    aria-pressed={filterStatus === f.id}
                    onClick={() => setFilterStatus(f.id)}
                    className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${focusRing} ${
                      filterStatus === f.id ? "bg-panel-elevated text-text-primary" : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {submissions === null ? (
            <p className="py-6 text-center text-[13px] text-text-muted">Loading…</p>
          ) : recent.length ? (
            <ul className="-mx-3 space-y-1">{recent.map((s) => <SubmissionRow key={s.id} sub={s} />)}</ul>
          ) : brandSubs.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-text-primary">No ads checked yet for {prefs.brand}</p>
              <Link href="/submissions/new" className={`mt-2 inline-block rounded text-[13px] text-text-primary underline underline-offset-4 ${focusRing}`}>Check your first ad</Link>
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-text-primary">No reviews match</p>
              <button
                onClick={() => { setSearchQuery(""); setFilterStatus("all"); }}
                className={`mt-2 rounded text-[13px] text-text-muted underline underline-offset-4 hover:text-text-primary ${focusRing}`}
              >
                Clear filters
              </button>
            </div>
          )}
          <div className="mt-4 border-t border-border-subtle pt-4">
            <Link href="/submissions" className={`rounded text-[13px] font-medium text-text-primary underline-offset-4 hover:underline ${focusRing}`}>View all reviews</Link>
          </div>
        </section>
        )}
      </div>
    </AppLayout>
  );
}
