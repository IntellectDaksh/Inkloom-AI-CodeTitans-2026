"use client";

import { useEffect, useState } from "react";

// Shared, client-only workspace state: chosen brand + role (set in onboarding / header),
// plus live counts read from the real API routes. One event keeps every surface in sync.

export const BRANDS = ["Apex Nutrition", "Zenith Cloud"] as const;
export type Role = "creator" | "reviewer" | "admin";
// Demo personas, matching the seeded users on the login page.
export const PERSONAS = [
  { id: "daksh", name: "Daksh Agrawal", role: "admin" as Role, userId: "00000000-0000-4000-a000-000000000010", label: "Admin" },
  { id: "laksh", name: "Laksh Khatri", role: "reviewer" as Role, userId: "00000000-0000-4000-a000-000000000012", label: "Reviewer" },
  { id: "riddhi", name: "Riddhi Shah", role: "creator" as Role, userId: "00000000-0000-4000-a000-000000000011", label: "Creator" },
];
export type Persona = (typeof PERSONAS)[number];
export const ROLE_HELP: Record<Role, string> = {
  creator: "Writes and checks ads. Cannot approve.",
  reviewer: "Signs off ads written by others.",
  admin: "Signs off ads and can override a decision with a reason.",
};
export function personaOf(p: Prefs): Persona {
  return PERSONAS.find((x) => x.id === p.persona) ?? PERSONAS[0];
}

export interface Prefs {
  brand: string;
  persona: string;
  onboarded: boolean;
  checklistDismissed: boolean;
  // Review strictness (read by verdictFor in submission/shared.ts)
  passScore: number;
  blockBelow: number;
  strictness: Strictness;
  requireDisclosure: boolean;
  flagSuperlatives: boolean;
  flagTimeBound: boolean;
  requireReviewerHighRisk: boolean;
  // AI
  useGemini: boolean;
  aiConfidence: number;
  ocr: boolean;
  // Appearance (applied to <html> by PrefsApplier)
  motion: "full" | "reduced" | "off";
  density: "comfortable" | "compact";
  breathing: boolean;
  textSize: number;
  // Notifications
  notifyInApp: boolean;
  notifyEmail: boolean;
}

export type Strictness = "relaxed" | "balanced" | "strict";
export const STRICTNESS_PRESETS: Record<Strictness, { passScore: number; blockBelow: number }> = {
  relaxed: { passScore: 70, blockBelow: 40 },
  balanced: { passScore: 80, blockBelow: 50 },
  strict: { passScore: 90, blockBelow: 60 },
};

export const KEY = "adsnitch:prefs";
const EVT = "adsnitch:prefs";
export const DEFAULTS: Prefs = {
  brand: BRANDS[0], persona: PERSONAS[0].id, onboarded: false, checklistDismissed: false,
  passScore: 80, blockBelow: 50, strictness: "balanced",
  requireDisclosure: false, flagSuperlatives: false, flagTimeBound: false, requireReviewerHighRisk: true,
  useGemini: true, aiConfidence: 60, ocr: true,
  motion: "full", density: "comfortable", breathing: true, textSize: 16,
  notifyInApp: true, notifyEmail: false,
};

export function readPrefs(): Prefs {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return DEFAULTS;
  }
}

export function setPrefs(patch: Partial<Prefs>) {
  const next = { ...readPrefs(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // private mode: prefs live for this tab only via the event
  }
  try {
    // Mirror into the session key the login page and other screens already read.
    const p = personaOf(next);
    localStorage.setItem("inkloom:session", JSON.stringify({ name: p.name, role: p.label, userId: p.userId }));
  } catch {}
  window.dispatchEvent(new CustomEvent(EVT, { detail: next }));
}

export function usePrefs(): Prefs {
  const [prefs, set] = useState<Prefs>(DEFAULTS);
  useEffect(() => {
    set(readPrefs());
    const on = (e: Event) => set((e as CustomEvent<Prefs>).detail);
    window.addEventListener(EVT, on);
    return () => window.removeEventListener(EVT, on);
  }, []);
  return prefs;
}

export interface WorkspaceCounts {
  loading: boolean;
  error: boolean;
  claims: number;
  submissions: number;
  approved: number;
  inReview: number;
  pendingApprovals: number;
}

const REVIEW_STATES = ["submitted", "under_review", "resubmitted", "needs_re_review"];

// ponytail: one fetch per mount, no cache. Add SWR if the shell starts refetching too often.
export function useWorkspaceCounts(): WorkspaceCounts {
  const [c, set] = useState<WorkspaceCounts>({
    loading: true, error: false, claims: 0, submissions: 0, approved: 0, inReview: 0, pendingApprovals: 0,
  });
  useEffect(() => {
    let alive = true;
    const get = (u: string) => fetch(u).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));
    Promise.all([get("/api/claims"), get("/api/submissions"), get("/api/approvals?status=pending")])
      .then(([cl, sub, ap]) => {
        if (!alive) return;
        const subs: { status: string }[] = sub.submissions ?? [];
        set({
          loading: false,
          error: false,
          claims: (cl.claims ?? []).length,
          submissions: subs.length,
          approved: subs.filter((s) => s.status === "approved").length,
          inReview: subs.filter((s) => REVIEW_STATES.includes(s.status)).length,
          pendingApprovals: (ap.approvals ?? []).length,
        });
      })
      .catch(() => alive && set((p) => ({ ...p, loading: false, error: true })));
    return () => {
      alive = false;
    };
  }, []);
  return c;
}

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

// ---------------------------------------------------------------------------
// Workspaces: one per brand. Seeded ones mirror the demo data; new ones are
// kept in localStorage until Supabase is connected.
// ponytail: client-only store, move to a brands table when Supabase lands.
export interface Workspace {
  name: string;
  industry: string;
  channels: string[];
  description?: string;
  custom?: boolean;
  createdAt?: string;
}

export const SEED_WORKSPACES: Workspace[] = [
  { name: "Apex Nutrition", industry: "Health & nutrition", channels: ["Instagram", "Landing page", "Email"], description: "Sports supplements and recovery products." },
  { name: "Zenith Cloud", industry: "Software", channels: ["LinkedIn", "Landing page", "Ads"], description: "Enterprise cloud hosting and security." },
  { name: "Lumina Labs", industry: "Beauty & skincare", channels: ["Instagram", "TikTok", "Product page"], description: "Clinical skincare and serums." },
];

export const WS_KEY = "adsnitch:workspaces";
export const WS_EVT = "adsnitch:workspaces";
export const PICKER_EVT = "adsnitch:open-picker";
export const PICKED_KEY = "adsnitch:workspace-picked";

function readCustom(): Workspace[] {
  try {
    const v = JSON.parse(localStorage.getItem(WS_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function useWorkspaces(): Workspace[] {
  const [custom, set] = useState<Workspace[]>([]);
  useEffect(() => {
    set(readCustom());
    const on = () => set(readCustom());
    window.addEventListener(WS_EVT, on);
    return () => window.removeEventListener(WS_EVT, on);
  }, []);
  return [...SEED_WORKSPACES, ...custom];
}

/** Edits a custom workspace in place. Seeded ones are read-only. Returns an error message or null. */
export function updateWorkspace(name: string, patch: Partial<Workspace>): string | null {
  const list = readCustom();
  const i = list.findIndex((w) => w.name === name);
  if (i < 0) return "Built-in workspaces can't be edited.";
  if (patch.name !== undefined) {
    const n = patch.name.trim().replace(/\s+/g, " ");
    if (n.length < 2 || n.length > 60) return "Use a name between 2 and 60 characters.";
    if (n.toLowerCase() !== name.toLowerCase() && [...SEED_WORKSPACES, ...list].some((w) => w.name.toLowerCase() === n.toLowerCase()))
      return `A workspace called "${n}" already exists.`;
    patch = { ...patch, name: n };
  }
  list[i] = { ...list[i], ...patch };
  try {
    localStorage.setItem(WS_KEY, JSON.stringify(list));
  } catch {
    return "Your browser blocked saving.";
  }
  window.dispatchEvent(new Event(WS_EVT));
  return null;
}

/** Adds a workspace and returns its name, or an error message. */
export function addWorkspace(ws: Workspace): { ok: true; name: string } | { ok: false; error: string } {
  const name = ws.name.trim().replace(/\s+/g, " ");
  if (name.length < 2) return { ok: false, error: "Give the workspace a name of at least 2 characters." };
  if (name.length > 60) return { ok: false, error: "Keep the name under 60 characters." };
  const all = [...SEED_WORKSPACES, ...readCustom()];
  if (all.some((w) => w.name.toLowerCase() === name.toLowerCase()))
    return { ok: false, error: `A workspace called "${name}" already exists. Pick it from the list instead.` };
  const next = [...readCustom(), { ...ws, name, custom: true, createdAt: new Date().toISOString() }];
  try {
    localStorage.setItem(WS_KEY, JSON.stringify(next));
  } catch {
    return { ok: false, error: "Your browser blocked saving. Turn off private mode and try again." };
  }
  window.dispatchEvent(new Event(WS_EVT));
  return { ok: true, name };
}

export function openWorkspacePicker() {
  window.dispatchEvent(new Event(PICKER_EVT));
}
