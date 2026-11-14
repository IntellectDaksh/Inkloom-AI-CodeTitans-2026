"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePrefs, personaOf, focusRing } from "@/components/guide/workspace";

interface Note {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  link_url?: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPES: Record<string, string> = {
  analysis_completed: "Check finished",
  review_assigned: "Review assigned",
  changes_requested: "Changes requested",
  claim_expiring: "Claim expiring",
  approval_granted: "Approved",
  finding_disputed: "Issue disputed",
  finding_overridden: "Issue overridden",
  cascade_re_review: "Needs re-review",
};

// Seeded links use /claims/<code>; the claims library lives under /knowledge-base.
const deepLink = (u?: string | null) => (!u ? null : u.startsWith("/claims") ? "/knowledge-base/claims" : u);

const fmt = (iso: string) => {
  const d = new Date(iso);
  return isNaN(+d) ? "" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

export default function NotificationsPage() {
  const prefs = usePrefs();
  const me = personaOf(prefs);
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setNotes(null);
    setError(null);
    fetch(`/api/notifications?userId=${encodeURIComponent(me.userId)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => alive && setNotes(d.notifications ?? []))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [me.userId, tick]);

  const markRead = async (ids: string[]) => {
    if (!ids.length) return;
    const prev = notes;
    setNotes((n) => n?.map((x) => (ids.includes(x.id) ? { ...x, is_read: true } : x)) ?? n);
    try {
      const res = await Promise.all(
        ids.map((id) => fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notificationId: id }) }))
      );
      if (res.some((r) => !r.ok)) throw new Error();
    } catch {
      setNotes(prev);
      setError("Could not mark as read. Try again.");
    }
  };

  const all = notes ?? [];
  const unread = all.filter((n) => !n.is_read);
  const types = [...new Set(all.map((n) => n.notification_type))];
  const shown = all.filter((n) => (filter === "all" ? true : filter === "unread" ? !n.is_read : n.notification_type === filter));
  const filters = [
    { id: "all", label: `All (${all.length})` },
    { id: "unread", label: `Unread (${unread.length})` },
    ...types.map((t) => ({ id: t, label: TYPES[t] ?? t.replace(/_/g, " ") })),
  ];

  return (
    <AppLayout title="Notifications">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-primary">Notifications</h1>
            <p className="mt-1.5 text-sm text-text-secondary">
              Things that need {me.name.split(" ")[0]}: finished checks, ads to review, decisions and claims running out.
            </p>
          </div>
          <button
            type="button"
            disabled={!unread.length}
            onClick={() => markRead(unread.map((n) => n.id))}
            className={`h-10 rounded-lg border border-border-default bg-panel px-4 text-sm font-medium text-text-primary hover:bg-panel-hover disabled:opacity-50 ${focusRing}`}
          >
            Mark all as read
          </button>
        </header>

        {error && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-status-critical/30 bg-status-critical/5 px-4 py-3 text-sm text-text-primary">
            <span>{error.startsWith("HTTP") ? `Could not load notifications (${error}).` : error}</span>
            <button onClick={() => setTick((t) => t + 1)} className={`rounded-lg border border-border-default bg-panel px-3 py-1.5 text-[13px] font-medium hover:bg-panel-hover ${focusRing}`}>Reload</button>
          </div>
        )}

        <div className="flex gap-1 overflow-x-auto rounded-lg border border-border-default bg-panel p-1" role="group" aria-label="Filter notifications">
          {filters.map((f) => (
            <button
              key={f.id}
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${focusRing} ${
                filter === f.id ? "bg-panel-elevated text-text-primary" : "text-text-muted hover:text-text-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <section aria-label="Notifications" className="glass rounded-2xl p-2 sm:p-3">
          {notes === null && !error ? (
            <ul className="space-y-2 p-2" aria-busy="true">{[0, 1, 2].map((i) => <li key={i} className="h-16 animate-pulse rounded-xl bg-panel-hover" />)}</ul>
          ) : shown.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-text-primary">{filter === "unread" ? "You have read everything" : "Nothing here yet"}</p>
              <p className="mt-1 text-[13px] text-text-muted">New notifications appear when an ad is checked, reviewed or a claim nears expiry.</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {shown.map((n) => {
                const href = deepLink(n.link_url);
                const body = (
                  <>
                    <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.is_read ? "bg-transparent" : "bg-[#1f7fa3]"}`} />
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm ${n.is_read ? "text-text-secondary" : "font-medium text-text-primary"}`}>
                        {n.title}{!n.is_read && <span className="sr-only"> (unread)</span>}
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-relaxed text-text-secondary">{n.message}</span>
                      <span className="mt-1 block text-xs text-text-muted">{[TYPES[n.notification_type], fmt(n.created_at)].filter(Boolean).join(", ")}</span>
                    </span>
                  </>
                );
                return (
                  <li key={n.id} className="flex items-start gap-2 rounded-xl hover:bg-panel-hover">
                    {href ? (
                      <Link href={href} onClick={() => !n.is_read && markRead([n.id])} className={`group flex min-w-0 flex-1 items-start gap-3 rounded-xl px-3 py-3 ${focusRing}`}>
                        {body}
                        <ChevronRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-text-muted" />
                      </Link>
                    ) : (
                      <div className="flex min-w-0 flex-1 items-start gap-3 px-3 py-3">{body}</div>
                    )}
                    {!n.is_read && (
                      <button
                        type="button"
                        onClick={() => markRead([n.id])}
                        className={`my-2 mr-2 shrink-0 rounded-lg px-2.5 py-1.5 text-xs text-text-muted hover:bg-panel hover:text-text-primary ${focusRing}`}
                      >
                        Mark read
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
