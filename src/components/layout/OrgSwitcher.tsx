"use client";

import React, { useEffect, useRef, useState } from "react";
import { Building, Check, ChevronsUpDown } from "lucide-react";
import { focusRing } from "../guide/workspace";

interface Org { id: string; name: string; role: string }

/** Lists the user's organisations; hidden when there is only one and no pending invite. */
export function OrgSwitcher() {
  const [data, setData] = useState<{ currentId: string; orgs: Org[]; invites: Org[] } | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/orgs").then((r) => (r.ok ? r.json() : null)).then((d) => d?.success && setData(d)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  if (!data || (data.orgs.length < 2 && !data.invites.length)) return null;
  const current = data.orgs.find((o) => o.id === data.currentId);

  const post = async (url: string, id: string) => {
    setBusy(id);
    setError(null);
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ organizationId: id }) });
      const j = await r.json();
      if (!j.success) throw new Error(j.error);
      if (url.endsWith("/accept")) {
        const s = await fetch("/api/orgs/switch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ organizationId: id }) }).then((x) => x.json());
        if (!s.success) throw new Error(s.error);
      }
      window.location.assign("/dashboard");
    } catch (e) {
      setError((e as Error).message || "Something went wrong.");
      setBusy(null);
    }
  };

  const item = `flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-text-primary hover:bg-panel-hover disabled:opacity-60 ${focusRing}`;
  return (
    <div className="relative hidden sm:block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Switch organisation"
        className={`inline-flex h-10 max-w-44 items-center gap-2 rounded-lg border border-border-default bg-panel px-3 text-sm text-text-primary hover:bg-panel-hover ${focusRing}`}
      >
        <Building className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden="true" />
        <span className="truncate font-medium">{current?.name ?? "Organisation"}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden="true" />
        <span className="sr-only">, switch organisation</span>
      </button>
      {open && (
        <div role="menu" className="glass-strong absolute right-0 z-50 mt-2 w-64 rounded-xl p-1">
          <p className="px-3 py-2 text-xs font-medium text-text-muted">Organisations</p>
          {data.orgs.map((o) => (
            <button key={o.id} role="menuitem" type="button" disabled={!!busy} onClick={() => o.id !== data.currentId && post("/api/orgs/switch", o.id)} className={item}>
              <span className="min-w-0 flex-1 truncate">{o.name}</span>
              <span className="text-xs text-text-muted">{busy === o.id ? "Switching…" : o.role.replace("_", " ")}</span>
              {o.id === data.currentId && <Check className="h-4 w-4" aria-label="Current" />}
            </button>
          ))}
          {data.invites.length > 0 && <p className="px-3 pb-1 pt-2 text-xs font-medium text-text-muted">Invites</p>}
          {data.invites.map((o) => (
            <button key={o.id} role="menuitem" type="button" disabled={!!busy} onClick={() => post("/api/orgs/accept", o.id)} className={item}>
              <span className="min-w-0 flex-1 truncate">Join {o.name}</span>
              <span className="text-xs text-text-muted">{busy === o.id ? "Joining…" : o.role.replace("_", " ")}</span>
            </button>
          ))}
          {error && <p role="alert" className="px-3 py-2 text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
