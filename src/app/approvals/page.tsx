"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, CornerUpLeft, ChevronRight, Lock, RotateCcw } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/guide/HelpPanel";
import { PERSONAS, ROLE_HELP, personaOf, usePrefs, focusRing } from "@/components/guide/workspace";

type Tab = "pending" | "changes_requested" | "approved";
type Action = "approve" | "changes" | "override";

interface Decision {
  by: string;
  at: string;
  decision: string;
  note?: string | null;
}

interface Item {
  id: string;
  title: string;
  author: string;
  authorId: string;
  channel: string;
  status: Tab;
  score: number | null;
  issues: number;
  highRisk: number;
  copy: string;
  topIssue?: { text: string; why: string };
  decision?: Decision | null;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "pending", label: "To review" },
  { id: "changes_requested", label: "Sent back" },
  { id: "approved", label: "Approved" },
];

const nameOf = (id?: string | null) => PERSONAS.find((p) => p.userId === id)?.name ?? "A reviewer";
const fmt = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromApi(s: any): Item {
  const st: string = s.status;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const findings: any[] = s.findings ?? [];
  const open = findings.filter((f) => !["resolved", "dismissed", "ignored"].includes(f.status));
  const worst = open.find((f) => f.severity === "critical") ?? open.find((f) => f.severity === "high") ?? open[0];
  const d = s.latest_decision;
  return {
    id: s.id,
    title: s.title,
    author: s.creator?.full_name ?? s.authorName ?? "Unknown author",
    authorId: s.creator_id ?? s.authorId ?? "",
    channel: s.metadata?.target_channels?.[0] ?? s.submission_type?.replace(/_/g, " ") ?? "",
    status: st === "approved" ? "approved" : st === "changes_requested" || st === "rejected" ? "changes_requested" : "pending",
    score: s.latest_analysis?.overall_score ?? null,
    issues: open.length,
    highRisk: open.filter((f) => f.severity === "critical" || f.severity === "high").length,
    copy: s.raw_content ?? s.currentContent ?? "",
    topIssue: worst ? { text: worst.highlighted_snippet ?? worst.flaggedText ?? "", why: worst.description ?? worst.title ?? "" } : undefined,
    decision: d ? { by: nameOf(d.decided_by), at: d.decided_at, decision: d.decision, note: d.comments } : null,
  };
}

function verdict(i: Item) {
  if (i.score === null) return { label: "Not checked yet", variant: "neutral" as const };
  if (i.highRisk > 0) return { label: `${i.highRisk} high-risk issue${i.highRisk > 1 ? "s" : ""}`, variant: "critical" as const };
  if (i.issues > 0) return { label: `${i.issues} minor issue${i.issues > 1 ? "s" : ""}`, variant: "warning" as const };
  return { label: "No issues found", variant: "approved" as const };
}

export default function ApprovalsPage() {
  const prefs = usePrefs();
  const me = personaOf(prefs);
  const [items, setItems] = useState<Item[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<Tab>("pending");
  const [cursor, setCursor] = useState(0);
  const [open, setOpen] = useState<{ id: string; action: Action } | null>(null);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [announce, setAnnounce] = useState("");
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(() => {
    setLoadError(false);
    fetch("/api/submissions")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setItems((d.submissions ?? []).filter((s: { status: string }) => s.status !== "draft" && s.status !== "archived").map(fromApi)))
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    load();
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && TABS.some((x) => x.id === t)) setTab(t as Tab);
  }, [load]);

  const switchTab = (t: Tab) => {
    setTab(t);
    setCursor(0);
    setOpen(null);
    const u = new URL(window.location.href);
    u.searchParams.set("tab", t);
    window.history.replaceState(null, "", u);
  };

  const list = (items ?? []).filter((i) => i.status === tab);
  const counts = Object.fromEntries(TABS.map((t) => [t.id, (items ?? []).filter((i) => i.status === t.id).length])) as Record<Tab, number>;

  /** Why an action is blocked for the current persona, or null if allowed. */
  const blocked = (i: Item, a: Action): string | null => {
    if (me.role === "creator") return "Creators cannot approve or send back ads. Switch to a reviewer or admin to decide.";
    if (a === "override") return me.role === "admin" ? null : "Only an admin can override a decision.";
    if (i.authorId === me.userId && a === "approve") return "You wrote this ad, so someone else has to approve it.";
    return null;
  };

  const start = (i: Item, a: Action) => {
    if (blocked(i, a)) return;
    setOpen({ id: i.id, action: a });
    setNote("");
    setNoteError(null);
    setTimeout(() => noteRef.current?.focus(), 0);
  };

  const submit = async (i: Item) => {
    if (!open) return;
    const needsNote = open.action !== "approve";
    const trimmed = note.trim();
    if (needsNote && trimmed.length < 5) {
      setNoteError("Add a short reason so the author knows what to change.");
      noteRef.current?.focus();
      return;
    }
    const decision = open.action === "approve" ? "approved" : open.action === "changes" ? "changes_requested" : i.status === "approved" ? "changes_requested" : "approved";
    const notes = open.action === "override" ? `Override by ${me.label.toLowerCase()}: ${trimmed}` : trimmed || undefined;
    setBusy(true);
    try {
      const r = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: i.id, decision, notes, reviewerId: me.userId, reviewerName: me.name, reviewerRole: me.role }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.success) throw new Error(d.error || "The decision was not saved.");
      const status: Tab = decision === "approved" ? "approved" : "changes_requested";
      setItems((prev) =>
        (prev ?? []).map((x) => (x.id === i.id ? { ...x, status, decision: { by: me.name, at: new Date().toISOString(), decision, note: notes } } : x))
      );
      setAnnounce(`${i.title}: ${decision === "approved" ? "approved" : "sent back for changes"} by ${me.name}.`);
      setOpen(null);
      setCursor((c) => Math.max(0, Math.min(c, list.length - 2)));
    } catch (e) {
      setNoteError(e instanceof Error ? e.message : "The decision was not saved. Try again.");
    } finally {
      setBusy(false);
    }
  };

  // Keyboard: J/K move, A approve, R request changes. Ignored while typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || el.closest("input, textarea, select, [contenteditable]")) return;
      const k = e.key.toLowerCase();
      if (k === "j" || k === "k") {
        e.preventDefault();
        setCursor((c) => {
          const n = Math.max(0, Math.min(list.length - 1, c + (k === "j" ? 1 : -1)));
          cardRefs.current[n]?.focus();
          return n;
        });
      } else if ((k === "a" || k === "r") && list[cursor] && tab === "pending") {
        e.preventDefault();
        start(list[cursor], k === "a" ? "approve" : "changes");
      } else if (e.key === "Escape" && open) {
        setOpen(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <AppLayout title="Approvals">
      <div className="mx-auto max-w-4xl space-y-6 pb-20">
        <header>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-primary">Approvals</h1>
          <p className="mt-1 max-w-[62ch] text-sm text-text-secondary">
            Ads that AdSnitch has checked and a person now needs to sign off. Approve it, or send it back with a reason.
          </p>
        </header>

        <div className="glass flex flex-col gap-1 rounded-xl px-4 py-3 text-[13px] text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <span>
            Signed in as <strong className="font-medium text-text-primary">{me.name}</strong> ({me.label}). {ROLE_HELP[me.role]}
          </span>
          <span className="text-text-muted">Switch person in the header.</span>
        </div>

        <div role="tablist" aria-label="Approval status" className="flex gap-1 overflow-x-auto rounded-lg border border-border-default bg-panel p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => switchTab(t.id)}
              className={`flex-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${focusRing} ${
                tab === t.id ? "bg-panel-elevated text-text-primary" : "text-text-muted hover:text-text-primary"
              }`}
            >
              {t.label} <span className="tabular-nums text-text-muted">({items ? counts[t.id] : "…"})</span>
            </button>
          ))}
        </div>

        <p className="sr-only" aria-live="polite">{announce}</p>

        {loadError ? (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-sm font-medium text-text-primary">Could not load the approval queue.</p>
            <Button size="sm" variant="secondary" className="mt-3" icon={<RotateCcw className="h-4 w-4" />} onClick={load}>Try again</Button>
          </div>
        ) : items === null ? (
          <ul className="space-y-4" aria-busy="true">
            {[0, 1].map((i) => <li key={i} className="glass h-48 animate-pulse rounded-xl" />)}
          </ul>
        ) : list.length === 0 ? (
          <div className="glass rounded-xl p-10 text-center">
            <p className="text-sm font-medium text-text-primary">
              {tab === "pending" ? "Nothing waiting for sign-off" : tab === "approved" ? "No approved ads yet" : "Nothing has been sent back"}
            </p>
            <p className="mt-1 text-[13px] text-text-muted">New ads appear here after someone checks them.</p>
            <Link href="/submissions/new" className={`mt-3 inline-block rounded text-[13px] font-medium text-text-primary underline underline-offset-4 ${focusRing}`}>Check an ad</Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {list.map((i, idx) => {
              const v = verdict(i);
              const isOpen = open?.id === i.id;
              const selected = idx === cursor;
              const actions: Action[] = tab === "pending" ? ["changes", "approve"] : ["override"];
              return (
                <li key={i.id}>
                  <article
                    ref={(el) => { cardRefs.current[idx] = el; }}
                    tabIndex={-1}
                    onFocus={() => setCursor(idx)}
                    onClick={() => setCursor(idx)}
                    aria-labelledby={`t-${i.id}`}
                    className={`glass rounded-xl p-5 outline-none sm:p-6 ${selected ? "ring-2 ring-ink/30" : ""}`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h2 id={`t-${i.id}`} className="text-base font-semibold text-text-primary">
                          <Link href={`/submissions/${i.id}`} className={`rounded hover:underline ${focusRing}`}>{i.title}</Link>
                        </h2>
                        <p className="mt-1 text-[13px] text-text-muted">
                          By {i.author}{i.channel ? `, for ${i.channel}` : ""}
                          {i.authorId === me.userId && <span className="text-text-secondary"> (you)</span>}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {i.score !== null && (
                          <span className="flex items-center text-[13px] tabular-nums text-text-secondary">
                            {Math.round(i.score)}/100
                            <InfoTip label="score">How closely the ad matches approved claims and rules. Under 60 usually needs edits.</InfoTip>
                          </span>
                        )}
                        <Badge variant={v.variant} size="xs">{v.label}</Badge>
                      </div>
                    </div>

                    <blockquote className="mt-4 line-clamp-3 border-l-2 border-border-default pl-4 text-sm leading-relaxed text-text-primary">
                      {i.copy || "No copy text saved."}
                    </blockquote>

                    {i.topIssue?.text && (
                      <div className="mt-4 rounded-lg bg-panel px-4 py-3 text-[13px]">
                        <p className="text-text-muted">Main issue</p>
                        <p className="mt-1 font-medium text-text-primary">&ldquo;{i.topIssue.text}&rdquo;</p>
                        {i.topIssue.why && <p className="mt-1 text-text-secondary line-clamp-2">{i.topIssue.why}</p>}
                      </div>
                    )}

                    {i.decision && (
                      <p className="mt-4 text-[13px] text-text-secondary">
                        {i.decision.decision === "approved" ? "Approved" : "Sent back"} by{" "}
                        <strong className="font-medium text-text-primary">{i.decision.by}</strong> on {fmt(i.decision.at)}
                        {i.decision.note ? <>: &ldquo;{i.decision.note}&rdquo;</> : "."}
                      </p>
                    )}

                    {isOpen && open ? (
                      <form
                        className="mt-4 space-y-2 border-t border-border-subtle pt-4"
                        onSubmit={(e) => { e.preventDefault(); submit(i); }}
                      >
                        <label htmlFor={`note-${i.id}`} className="block text-sm font-medium text-text-primary">
                          {open.action === "approve" ? "Note for the record (optional)" : open.action === "changes" ? "What should change? (required)" : "Reason for override (required)"}
                        </label>
                        <textarea
                          id={`note-${i.id}`}
                          ref={noteRef}
                          rows={3}
                          value={note}
                          onChange={(e) => { setNote(e.target.value); setNoteError(null); }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(i); }
                            if (e.key === "Escape") setOpen(null);
                          }}
                          aria-invalid={!!noteError}
                          aria-describedby={`note-err-${i.id}`}
                          placeholder={open.action === "approve" ? "e.g. Checked against claim CT-8842…" : "e.g. Remove “2x faster”, we have no study for it…"}
                          className={`w-full resize-y rounded-lg border bg-panel p-3 text-base text-text-primary placeholder:text-text-muted sm:text-sm ${noteError ? "border-status-critical" : "border-border-default"} ${focusRing}`}
                        />
                        <p id={`note-err-${i.id}`} className="min-h-5 text-[13px] text-status-critical" aria-live="polite">{noteError}</p>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(null)}>Cancel</Button>
                          <Button type="submit" size="sm" variant={open.action === "approve" ? "primary" : "secondary"} loading={busy}>
                            {open.action === "approve" ? "Approve" : open.action === "changes" ? "Send back" : i.status === "approved" ? "Override to sent back" : "Override to approved"}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-4 flex flex-col gap-2 border-t border-border-subtle pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <Link href={`/submissions/${i.id}`} className={`inline-flex items-center gap-1 rounded text-[13px] font-medium text-text-secondary hover:text-text-primary ${focusRing}`}>
                          See all issues <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <div className="flex flex-col items-stretch gap-2 sm:items-end">
                          <div className="flex flex-wrap gap-2">
                            {actions.map((a) => {
                              const why = blocked(i, a);
                              return (
                                <Button
                                  key={a}
                                  size="sm"
                                  variant={a === "approve" ? "primary" : "secondary"}
                                  disabled={!!why}
                                  aria-describedby={why ? `why-${i.id}` : undefined}
                                  icon={why ? <Lock className="h-4 w-4" /> : a === "approve" ? <Check className="h-4 w-4" /> : <CornerUpLeft className="h-4 w-4" />}
                                  onClick={() => start(i, a)}
                                  className="min-h-11 flex-1 justify-center sm:flex-none"
                                >
                                  {a === "approve" ? "Approve" : a === "changes" ? "Request changes" : "Override…"}
                                </Button>
                              );
                            })}
                          </div>
                          {actions.map((a) => blocked(i, a)).find(Boolean) && (
                            <p id={`why-${i.id}`} className="text-xs text-text-muted sm:text-right">{actions.map((a) => blocked(i, a)).find(Boolean)}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Keyboard hint bar */}
      <div className="glass-strong fixed bottom-4 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-4 rounded-full px-4 py-2 text-xs text-text-secondary md:flex" aria-hidden="true">
        {[["J", "next"], ["K", "previous"], ["A", "approve"], ["R", "request changes"]].map(([k, l]) => (
          <span key={k} className="flex items-center gap-1.5">
            <kbd className="rounded border border-border-default bg-panel px-1.5 py-0.5 font-sans text-xs text-text-primary">{k}</kbd>
            {l}
          </span>
        ))}
      </div>
    </AppLayout>
  );
}
