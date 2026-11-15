"use client";

import { useEffect, useState } from "react";

// Workspaces are brands on the server (/api/workspaces). One shared cache + event
// keeps the picker, header, brands page and settings in sync after a create/update.

export interface Workspace {
  id: string;
  name: string;
  industry: string;
  channels: string[];
  description?: string;
  /** Created by a user (editable). Built-in workspaces are read-only. */
  custom: boolean;
  createdAt?: string;
}

type Result = { ok: true; workspace: Workspace } | { ok: false; error: string };

const EVT = "adsnitch:workspaces";
let cache: Workspace[] | null = null;
let inflight: Promise<Workspace[]> | null = null;

async function fetchAll(): Promise<Workspace[]> {
  const r = await fetch("/api/workspaces", { cache: "no-store" });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.success) throw new Error(d.error || `Could not load workspaces (error ${r.status}).`);
  cache = d.workspaces as Workspace[];
  window.dispatchEvent(new Event(EVT));
  return cache;
}

export function refreshWorkspaces(): Promise<Workspace[]> {
  inflight ??= fetchAll().finally(() => (inflight = null));
  return inflight;
}

/** All workspaces; empty until the first load finishes. */
export function useWorkspaces(): Workspace[] {
  const [list, set] = useState<Workspace[]>(cache ?? []);
  useEffect(() => {
    const on = () => set(cache ?? []);
    window.addEventListener(EVT, on);
    if (cache) set(cache);
    else refreshWorkspaces().catch(() => {});
    return () => window.removeEventListener(EVT, on);
  }, []);
  return list;
}

async function send(url: string, method: string, body: unknown): Promise<Result> {
  try {
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.success) return { ok: false, error: d.error || `Could not save (error ${r.status}).` };
    await refreshWorkspaces().catch(() => {});
    return { ok: true, workspace: d.workspace };
  } catch {
    return { ok: false, error: "Could not reach the server. Nothing was saved." };
  }
}

export function createWorkspace(ws: Pick<Workspace, "name" | "industry" | "channels"> & { description?: string }): Promise<Result> {
  return send("/api/workspaces", "POST", ws);
}

export function updateWorkspace(id: string, patch: Partial<Pick<Workspace, "name" | "industry" | "channels" | "description">>): Promise<Result> {
  return send(`/api/workspaces/${encodeURIComponent(id)}`, "PATCH", patch);
}
