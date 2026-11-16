"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";

interface Item {
  id: number;
  created_at: string;
  kind: "help" | "suggestion" | "bug" | "other";
  message: string;
  email: string | null;
  page: string | null;
  status: "new" | "read" | "done";
}

const KIND: Record<Item["kind"], string> = { help: "Help", suggestion: "Suggestion", bug: "Bug", other: "Other" };
const TONE: Record<Item["kind"], string> = {
  help: "bg-sky-100 text-sky-900",
  suggestion: "bg-violet-100 text-violet-900",
  bug: "bg-red-100 text-red-900",
  other: "bg-slate-100 text-slate-800",
};

// Site owner's feedback inbox. The API returns 404 for everyone not listed in OWNER_EMAILS.
export default function InboxPage() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"open" | "all">("open");

  const load = () =>
    fetch("/api/feedback", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => (d.success ? setItems(d.items) : setError("This page isn't available.")))
      .catch(() => setError("Could not load the inbox."));
  useEffect(() => {
    load();
  }, []);

  const mark = async (id: number, status: Item["status"]) => {
    setItems((xs) => xs?.map((x) => (x.id === id ? { ...x, status } : x)) ?? null);
    await fetch("/api/feedback", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) }).catch(() => load());
  };

  const shown = (items ?? []).filter((i) => filter === "all" || i.status !== "done");

  return (
    <AppLayout title="Inbox">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Inbox</h1>
            <p className="mt-1 text-sm text-text-secondary">Help requests, ideas and bug reports from the Help &amp; feedback button.</p>
          </div>
          <div className="flex gap-1 rounded-lg border border-border-default p-1 text-sm" role="group" aria-label="Filter">
            {(["open", "all"] as const).map((f) => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}
                className={`h-8 rounded-md px-3 ${filter === f ? "bg-ink text-canvas" : "text-text-secondary"}`}>
                {f === "open" ? "Open" : "All"}
              </button>
            ))}
          </div>
        </header>
        {error && <p role="alert" className="text-sm text-status-red">{error}</p>}
        {!items && !error && <p className="text-sm text-text-muted">Loading…</p>}
        {items && shown.length === 0 && <p className="text-sm text-text-muted">Nothing open. Nice.</p>}
        <ul className="space-y-3">
          {shown.map((i) => (
            <li key={i.id} className={`glass rounded-2xl p-5 ${i.status === "new" ? "ring-1 ring-ink/25" : ""}`}>
              <div className="flex flex-wrap items-center gap-2 text-[13px] text-text-muted">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE[i.kind]}`}>{KIND[i.kind]}</span>
                <span>{new Date(i.created_at).toLocaleString()}</span>
                {i.page && <span>· on {i.page}</span>}
                {i.status === "new" && <span className="font-medium text-text-primary">· New</span>}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text-primary">{i.message}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {i.email && (
                  <a href={`mailto:${i.email}?subject=${encodeURIComponent("Re: your AdSnitch message")}`} className="inline-flex h-9 items-center rounded-lg bg-ink px-3 text-sm font-medium text-canvas">
                    Reply to {i.email}
                  </a>
                )}
                {i.status !== "done" ? (
                  <button type="button" onClick={() => mark(i.id, "done")} className="h-9 rounded-lg border border-border-default px-3 text-sm text-text-primary">Mark done</button>
                ) : (
                  <button type="button" onClick={() => mark(i.id, "new")} className="h-9 rounded-lg border border-border-default px-3 text-sm text-text-primary">Reopen</button>
                )}
                {i.status === "new" && (
                  <button type="button" onClick={() => mark(i.id, "read")} className="h-9 rounded-lg px-3 text-sm text-text-secondary">Mark read</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AppLayout>
  );
}
