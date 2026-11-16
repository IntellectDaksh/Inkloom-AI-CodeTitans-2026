"use client";

import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { focusRing } from "@/components/guide/workspace";
import { fmtDateTime } from "@/components/settings/format";

export interface Member { id: string; name: string; role: string }
export interface ThreadComment { id: string; author_id: string; author_name: string; text: string; mentions: string[]; created_at: string }

export const REVIEW_ROLES = ["reviewer", "brand_manager", "admin"];

/** Local YYYY-MM-DD for today, so "overdue" matches the viewer's calendar. */
export const todayIso = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);

async function send(url: string, method: string, body: unknown) {
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.success) throw new Error(d.error || "That did not save. Try again.");
  return d;
}

/** Reviewer + due date picker. Server re-validates org membership and role. */
export function AssignControls({ submissionId, authorId, assigneeId, dueDate, members, canAssign, onSaved }: {
  submissionId: string; authorId: string; assigneeId: string | null; dueDate: string | null;
  members: Member[]; canAssign: boolean; onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const eligible = members.filter((m) => REVIEW_ROLES.includes(m.role) && m.id !== authorId);
  const save = async (next: { assigneeId: string | null; dueDate: string | null }) => {
    setBusy(true);
    setErr(null);
    try {
      await send("/api/approvals", "PATCH", { submissionId, ...next });
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "That did not save.");
    } finally {
      setBusy(false);
    }
  };
  const field = `h-9 rounded-lg border border-border-default bg-panel px-2 text-[13px] text-text-primary disabled:opacity-60 ${focusRing}`;
  return (
    <div className="mt-4 flex flex-wrap items-end gap-3 text-[13px]">
      <label className="flex flex-col gap-1 text-text-muted">
        Reviewer
        <select
          className={field}
          value={assigneeId ?? ""}
          disabled={!canAssign || busy}
          onChange={(e) => save({ assigneeId: e.target.value || null, dueDate })}
        >
          <option value="">Unassigned</option>
          {eligible.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          {assigneeId && !eligible.some((m) => m.id === assigneeId) && <option value={assigneeId}>Former member</option>}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-text-muted">
        Due
        <input
          type="date"
          className={field}
          value={dueDate ?? ""}
          disabled={!canAssign || busy}
          onChange={(e) => save({ assigneeId, dueDate: e.target.value || null })}
        />
      </label>
      <p className="min-h-5 text-status-critical" aria-live="polite">{err}</p>
    </div>
  );
}

/** Turns "@Name" tokens into member ids (longest names first so "Sam Lee" beats "Sam"). */
export function mentionIds(text: string, members: Member[]): string[] {
  const lower = text.toLowerCase();
  const ids = new Set<string>();
  for (const m of [...members].sort((a, b) => b.name.length - a.name.length)) {
    if (lower.includes("@" + m.name.toLowerCase())) ids.add(m.id);
  }
  return [...ids];
}

export function Thread({ submissionId, comments, members, onSaved }: {
  submissionId: string; comments: ThreadComment[]; members: Member[]; onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const names = new Map(members.map((m) => [m.id, m.name]));

  const post = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setBusy(true);
    setErr(null);
    try {
      await send("/api/approvals/comments", "POST", { submissionId, text: t, mentions: mentionIds(t, members) });
      setText("");
      onSaved();
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Comment not saved.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 border-t border-border-subtle pt-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 rounded text-[13px] font-medium text-text-secondary hover:text-text-primary ${focusRing}`}
      >
        <MessageSquare className="h-4 w-4" aria-hidden="true" />
        {comments.length ? `${comments.length} comment${comments.length > 1 ? "s" : ""}` : "Comment"}
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {comments.length > 0 && (
            <ul className="space-y-2">
              {comments.map((c) => (
                <li key={c.id} className="rounded-lg bg-panel px-3 py-2 text-[13px]">
                  <p className="text-text-muted">
                    <strong className="font-medium text-text-primary">{c.author_name}</strong> · {fmtDateTime(c.created_at)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-text-primary">{c.text}</p>
                  {c.mentions.length > 0 && (
                    <p className="mt-1 text-xs text-text-muted">Notified: {c.mentions.map((id) => names.get(id) ?? "a member").join(", ")}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={post} className="space-y-2">
            <label htmlFor={`c-${submissionId}`} className="sr-only">Add a comment</label>
            <textarea
              id={`c-${submissionId}`}
              rows={2}
              maxLength={2000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) post(e); }}
              placeholder="Add a comment. Type @ and a teammate's name to notify them."
              className={`w-full resize-y rounded-lg border border-border-default bg-panel p-3 text-base text-text-primary placeholder:text-text-muted sm:text-sm ${focusRing}`}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <select
                aria-label="Mention a teammate"
                className={`h-9 rounded-lg border border-border-default bg-panel px-2 text-[13px] text-text-secondary ${focusRing}`}
                value=""
                onChange={(e) => { const n = names.get(e.target.value); if (n) setText((t) => `${t}${t && !t.endsWith(" ") ? " " : ""}@${n} `); }}
              >
                <option value="">Mention…</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <Button type="submit" size="sm" variant="secondary" loading={busy} disabled={!text.trim()}>Post comment</Button>
            </div>
            <p className="min-h-5 text-[13px] text-status-critical" aria-live="polite">{err}</p>
          </form>
        </div>
      )}
    </div>
  );
}
