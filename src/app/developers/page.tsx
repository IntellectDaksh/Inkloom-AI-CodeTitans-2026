"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { focusRing } from "@/components/guide/workspace";
import { fmtDateTime } from "@/components/settings/format";

interface Key { id: string; name: string; prefix: string; created_at: string; last_used_at: string | null; revoked_at: string | null }

const card = "rounded-xl border border-border-subtle bg-panel p-5 sm:p-6";
const primary = `inline-flex h-10 items-center rounded-lg bg-ink px-4 text-sm font-medium text-canvas hover:opacity-90 disabled:opacity-50 ${focusRing}`;
const pre = "overflow-x-auto rounded-lg bg-panel-hover p-4 text-xs leading-relaxed text-text-primary";

export default function DevelopersPage() {
  const [origin, setOrigin] = useState("https://your-adsnitch-url");
  const [keys, setKeys] = useState<Key[] | null>(null);
  const [denied, setDenied] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [fresh, setFresh] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/keys")
      .then((r) => r.json())
      .then((d) => (d.success ? setKeys(d.keys) : setDenied(d.error ?? "Could not load keys.")))
      .catch(() => setDenied("Could not load keys."));
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const d = await fetch("/api/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) }).then((r) => r.json());
      if (!d.success) throw new Error(d.error);
      setFresh(d.key);
      setName("");
      setKeys((k) => [d.record, ...(k ?? [])]);
    } catch (err) {
      setError((err as Error).message || "Could not create the key.");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (k: Key) => {
    if (!window.confirm(`Revoke "${k.name}"? Anything using it stops working immediately.`)) return;
    const d = await fetch(`/api/keys?id=${encodeURIComponent(k.id)}`, { method: "DELETE" }).then((r) => r.json()).catch(() => ({ success: false }));
    if (!d.success) return setError(d.error ?? "Could not revoke the key.");
    setKeys((ks) => ks?.map((x) => (x.id === k.id ? { ...x, revoked_at: new Date().toISOString() } : x)) ?? null);
  };

  const curl = `curl -X POST ${origin}/api/v1/check \\
  -H "Authorization: Bearer ask_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Clinically proven to double your energy.", "channel": "social_media"}'`;

  return (
    <AppLayout title="Developers">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-primary">Developers</h1>
          <p className="mt-1 text-sm text-text-secondary">Check ad copy from your own tools. Checks use this organisation&apos;s claims, guidelines and terminology. Nothing is saved.</p>
        </header>

        <section className={card} aria-labelledby="keys">
          <h2 id="keys" className="text-base font-semibold text-text-primary">API keys</h2>
          {denied ? (
            <p className="mt-2 text-sm text-text-secondary">{denied}</p>
          ) : (
            <>
              <form onSubmit={create} className="mt-4 flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="kname">Key name</label>
                <input id="kname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name, e.g. CMS plugin" maxLength={60} required className={`h-10 flex-1 rounded-lg border border-border-default bg-canvas px-3 text-sm text-text-primary ${focusRing}`} />
                <button type="submit" disabled={busy} className={primary}>{busy ? "Creating…" : "Create key"}</button>
              </form>
              {error && <p role="alert" className="mt-3 text-[13px] text-red-600">{error}</p>}
              {fresh && (
                <div role="status" className="mt-4 rounded-lg border border-border-default p-4">
                  <p className="text-sm font-medium text-text-primary">Copy this key now. It will not be shown again.</p>
                  <div className="mt-2 flex gap-2">
                    <code className="min-w-0 flex-1 break-all rounded-lg bg-panel-hover px-3 py-2 text-xs text-text-primary">{fresh}</code>
                    <button type="button" onClick={() => navigator.clipboard.writeText(fresh).catch(() => {})} className={`rounded-lg border border-border-default px-3 text-sm text-text-primary hover:bg-panel-hover ${focusRing}`}>Copy</button>
                  </div>
                </div>
              )}
              {keys === null ? (
                <p className="mt-4 text-sm text-text-muted">Loading…</p>
              ) : keys.length === 0 ? (
                <p className="mt-4 text-sm text-text-muted">No keys yet.</p>
              ) : (
                <ul className="mt-4 divide-y divide-border-subtle">
                  {keys.map((k) => (
                    <li key={k.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-text-primary">{k.name}</p>
                        <p className="text-xs text-text-muted">
                          <code>{k.prefix}…</code> · created {fmtDateTime(k.created_at)} · {k.last_used_at ? `last used ${fmtDateTime(k.last_used_at)}` : "never used"}
                        </p>
                      </div>
                      {k.revoked_at ? (
                        <span className="text-xs text-text-muted">Revoked</span>
                      ) : (
                        <button type="button" onClick={() => revoke(k)} className={`rounded-lg px-3 py-1.5 text-[13px] text-red-600 hover:bg-panel-hover ${focusRing}`}>Revoke</button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>

        <section className={card} aria-labelledby="docs">
          <h2 id="docs" className="text-base font-semibold text-text-primary">POST /api/v1/check</h2>
          <p className="mt-1 text-sm text-text-secondary">Send the key as a bearer token. Each key allows 60 checks an hour.</p>
          <pre className={`${pre} mt-4`}>{curl}</pre>
          <h3 className="mt-5 text-sm font-semibold text-text-primary">Body</h3>
          <ul className="mt-2 space-y-1 text-sm text-text-secondary">
            <li><code>text</code> (required): the ad copy, up to 8,000 characters.</li>
            <li><code>brandId</code> (optional): a brand in this organisation. Defaults to the active brand.</li>
            <li><code>channel</code> (optional): general, social_media, email, landing_page, press_release, advertisement, blog_post or product_documentation.</li>
          </ul>
          <h3 className="mt-5 text-sm font-semibold text-text-primary">Response</h3>
          <pre className={`${pre} mt-2`}>{`{
  "success": true,
  "verdict": "needs_review",      // approved | needs_review | rejected
  "score": 62,                    // 0-100
  "brandId": "...",
  "channel": "social_media",
  "summary": "...",
  "findings": [{ "severity": "high", "category": "...", "flaggedText": "...",
                 "explanation": "...", "suggestedCorrection": "...", "unverified": true }],
  "suggestedRevision": "..."
}`}</pre>
          <p className="mt-3 text-sm text-text-secondary">Errors return <code>success: false</code> and <code>error</code>: 400 bad input, 401 bad or revoked key, 429 hourly limit.</p>
        </section>
      </div>
    </AppLayout>
  );
}
