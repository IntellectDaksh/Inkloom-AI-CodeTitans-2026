"use client";

import React, { useEffect, useState } from "react";
import { focusRing } from "@/components/guide/workspace";
import { fmtDateTime } from "@/components/settings/format";

interface Hook { id: string; url: string; events: string[]; created_at: string }

const EVENTS: { id: string; label: string }[] = [
  { id: "ad_blocked", label: "Ad blocked" },
  { id: "approval_requested", label: "Approval requested" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];
const label = (id: string) => EVENTS.find((e) => e.id === id)?.label ?? id;

const card = "rounded-xl border border-border-subtle bg-panel p-5 sm:p-6";
const primary = `inline-flex h-10 items-center rounded-lg bg-ink px-4 text-sm font-medium text-canvas hover:opacity-90 disabled:opacity-50 ${focusRing}`;
const ghost = `rounded-lg border border-border-default px-3 py-1.5 text-[13px] text-text-primary hover:bg-panel-hover disabled:opacity-50 ${focusRing}`;
const pre = "overflow-x-auto rounded-lg bg-panel-hover p-4 text-xs leading-relaxed text-text-primary";

/** Shows a webhook URL without its secret path (Slack URLs embed the token). */
const shortUrl = (u: string) => {
  try {
    const x = new URL(u);
    return `${x.host}${x.pathname.length > 12 ? x.pathname.slice(0, 12) + "…" : x.pathname}`;
  } catch {
    return u;
  }
};

export function IntegrationsPanel() {
  const [hooks, setHooks] = useState<Hook[] | null>(null);
  const [denied, setDenied] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(EVENTS.map((e) => e.id));
  const [secret, setSecret] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/integrations/webhooks", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => (d.success ? setHooks(d.webhooks) : setDenied(d.error ?? "Could not load webhooks.")))
      .catch(() => setDenied("Could not load webhooks."));
  }, []);

  const post = (body: unknown) =>
    fetch("/api/integrations/webhooks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const d = await post({ url, events });
      if (!d.success) throw new Error(d.error);
      setSecret(d.secret);
      setUrl("");
      setHooks((h) => [d.webhook, ...(h ?? [])]);
    } catch (err) {
      setError((err as Error).message || "Could not save the webhook.");
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    setStatus("");
    const d = await post({ test: true }).catch(() => ({ success: false }));
    setStatus(d.success ? "Test sent to webhooks subscribed to Approval requested. Failures appear in the error log." : d.error ?? "Could not send the test.");
  };

  const remove = async (h: Hook) => {
    if (!window.confirm(`Remove the webhook to ${shortUrl(h.url)}?`)) return;
    const d = await fetch(`/api/integrations/webhooks?id=${encodeURIComponent(h.id)}`, { method: "DELETE" }).then((r) => r.json()).catch(() => ({ success: false }));
    if (!d.success) return setError(d.error ?? "Could not remove the webhook.");
    setHooks((hs) => hs?.filter((x) => x.id !== h.id) ?? null);
  };

  const toggle = (id: string) => setEvents((ev) => (ev.includes(id) ? ev.filter((x) => x !== id) : [...ev, id]));

  return (
    <>
      <div className="space-y-5">

        <section className={card} aria-labelledby="wh">
          <h2 id="wh" className="text-base font-semibold text-text-primary">Webhooks</h2>
          {denied ? (
            <p className="mt-2 text-sm text-text-secondary">{denied}</p>
          ) : (
            <>
              <form onSubmit={add} className="mt-4 space-y-3">
                <label htmlFor="whurl" className="block text-sm font-medium text-text-primary">Webhook URL</label>
                <input
                  id="whurl"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/…"
                  className={`h-10 w-full rounded-lg border border-border-default bg-canvas px-3 text-sm text-text-primary ${focusRing}`}
                />
                <fieldset>
                  <legend className="text-sm font-medium text-text-primary">Events</legend>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                    {EVENTS.map((ev) => (
                      <label key={ev.id} className="inline-flex items-center gap-2 text-sm text-text-secondary">
                        <input type="checkbox" checked={events.includes(ev.id)} onChange={() => toggle(ev.id)} className={`h-4 w-4 ${focusRing}`} />
                        {ev.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <button type="submit" disabled={busy || !events.length} className={primary}>{busy ? "Saving…" : "Add webhook"}</button>
              </form>
              {error && <p role="alert" className="mt-3 text-[13px] text-red-600">{error}</p>}
              {secret && (
                <div role="status" className="mt-4 rounded-lg border border-border-default p-4">
                  <p className="text-sm font-medium text-text-primary">Signing secret. Copy it now; it will not be shown again.</p>
                  <div className="mt-2 flex gap-2">
                    <code className="min-w-0 flex-1 break-all rounded-lg bg-panel-hover px-3 py-2 text-xs text-text-primary">{secret}</code>
                    <button type="button" onClick={() => navigator.clipboard.writeText(secret).catch(() => {})} className={ghost}>Copy</button>
                  </div>
                </div>
              )}
              {hooks === null ? (
                <p className="mt-4 text-sm text-text-muted">Loading…</p>
              ) : hooks.length === 0 ? (
                <p className="mt-4 text-sm text-text-muted">No webhooks yet.</p>
              ) : (
                <>
                  <ul className="mt-4 divide-y divide-border-subtle">
                    {hooks.map((h) => (
                      <li key={h.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-text-primary">{shortUrl(h.url)}</p>
                          <p className="text-xs text-text-muted">{h.events.map(label).join(", ")} · added {fmtDateTime(h.created_at)}</p>
                        </div>
                        <button type="button" onClick={() => remove(h)} className={`rounded-lg px-3 py-1.5 text-[13px] text-red-600 hover:bg-panel-hover ${focusRing}`}>Remove</button>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={test} className={`${ghost} mt-3`}>Send test</button>
                  <p className="mt-2 min-h-5 text-[13px] text-text-secondary" aria-live="polite">{status}</p>
                </>
              )}
            </>
          )}
        </section>

        <section className={card} aria-labelledby="fmt">
          <h2 id="fmt" className="text-base font-semibold text-text-primary">What we send</h2>
          <p className="mt-1 text-sm text-text-secondary">
            A JSON POST with a Slack-ready <code>text</code> plus structured fields. Verify <code>X-AdSnitch-Signature</code>: <code>sha256=</code> followed by the HMAC-SHA256 of the raw body using your signing secret. Requests time out after 5 seconds.
          </p>
          <pre className={`${pre} mt-4`}>{`{
  "text": "*Approved*: Summer launch reel (by Priya)",
  "event": "approved",          // ad_blocked | approval_requested | approved | rejected
  "organization_id": "...",
  "submission_id": "...",
  "title": "Summer launch reel",
  "actor": "Priya",
  "note": null,
  "url": "https://adsnitch.cv/submissions/...",
  "sent_at": "2026-11-16T10:00:00.000Z"
}`}</pre>
        </section>
      </div>
    </>
  );
}
