"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Link2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

type ShareLink = { id: string; created_at: string; expires_at: string };

export function SharePanel({ submissionId, onMessage }: { submissionId: string; onMessage: (text: string, tone?: "ok" | "err") => void }) {
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [ttl, setTtl] = useState("7d");
  const [busy, setBusy] = useState<string | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch(`/api/share?submissionId=${encodeURIComponent(submissionId)}`).catch(() => null);
    const j = await r?.json().catch(() => null);
    if (j?.success) setLinks(j.links);
  }, [submissionId]);
  useEffect(() => { load(); }, [load]);

  const create = async () => {
    setBusy("create");
    try {
      const r = await fetch("/api/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ submissionId, expiresIn: ttl }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.success) throw new Error(j.error || `Could not create the link (error ${r.status}).`);
      setFresh(j.url);
      await navigator.clipboard.writeText(j.url).then(() => onMessage("Share link created and copied."), () => onMessage("Share link created. Copy it below."));
      await load();
    } catch (e) {
      onMessage((e as Error).message, "err");
    } finally {
      setBusy(null);
    }
  };

  const revoke = async (id: string) => {
    setBusy(id);
    try {
      const r = await fetch(`/api/share/${id}`, { method: "DELETE" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.success) throw new Error(j.error || "Could not revoke the link.");
      setLinks((l) => l.filter((x) => x.id !== id));
      onMessage("Link revoked. It no longer opens.");
    } catch (e) {
      onMessage((e as Error).message, "err");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="glass space-y-3 rounded-2xl p-5" aria-labelledby="share-h">
      <h2 id="share-h" className="flex items-center gap-2 text-base font-semibold text-text-primary"><Link2 className="h-4 w-4" aria-hidden /> Share read-only link</h2>
      <p className="text-[13px] text-text-muted">Anyone with the link sees a frozen copy of this report. No sign-in needed.</p>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="share-ttl" className="text-[13px] text-text-secondary">Expires in</label>
        <select id="share-ttl" value={ttl} onChange={(e) => setTtl(e.target.value)} className="h-9 rounded-lg border border-border-default bg-panel px-2 text-sm text-text-primary">
          <option value="24h">24 hours</option>
          <option value="7d">7 days</option>
          <option value="30d">30 days</option>
        </select>
        <Button size="sm" onClick={create} loading={busy === "create"}>Create link</Button>
      </div>
      {fresh && (
        <input readOnly value={fresh} aria-label="New share link" onFocus={(e) => e.currentTarget.select()} className="w-full rounded-lg glass-inset px-3 py-2 font-mono text-xs text-text-primary" />
      )}
      {links.length > 0 && (
        <ul className="space-y-1 text-[13px]">
          {links.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-2 border-t border-border-default pt-2">
              <span className="text-text-secondary">Created {new Date(l.created_at).toLocaleString()} · expires {new Date(l.expires_at).toLocaleString()}</span>
              <Button size="sm" variant="ghost" loading={busy === l.id} onClick={() => revoke(l.id)} icon={<Trash2 className="h-4 w-4" />}>Revoke</Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
