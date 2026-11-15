"use client";

import { useEffect, useState } from "react";

// Shared, client-only workspace state: chosen brand + role (set in onboarding / header),
// plus live counts read from the real API routes. One event keeps every surface in sync.

export const BRANDS = ["Apex Nutrition", "Zenith Cloud"] as const;
export type Role = "creator" | "reviewer" | "brand_manager" | "admin";
export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  brand_manager: "Brand Manager",
  reviewer: "Reviewer",
  creator: "Creator",
};

/** The signed-in user, loaded once from /api/me. */
export interface Persona {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: Role;
  label: string;
  avatarUrl: string | null;
  bio: string;
}
const SIGNED_OUT: Persona = { id: "", userId: "", name: "", email: "", role: "creator", label: ROLE_LABEL.creator, avatarUrl: null, bio: "" };
let current: Persona = SIGNED_OUT;
let loading: Promise<void> | null = null;
const ME_EVT = "adsnitch:me";

/** @deprecated Accounts are real now; kept empty so older callers compile. Use useMe(). */
export const PERSONAS: Persona[] = [];

export function refreshMe(): Promise<void> {
  loading = fetch("/api/me")
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      const m = d?.me;
      current = m
        ? { id: m.id, userId: m.id, name: m.name, email: m.email, role: m.role, label: ROLE_LABEL[m.role as Role] ?? m.role, avatarUrl: m.avatarUrl, bio: m.bio }
        : SIGNED_OUT;
    })
    .catch(() => {})
    .finally(() => {
      window.dispatchEvent(new Event(ME_EVT));
      // usePrefs consumers that read personaOf() re-render too
      window.dispatchEvent(new CustomEvent(EVT, { detail: readPrefs() }));
    });
  return loading;
}

export function useMe(): Persona | null {
  const [me, set] = useState<Persona | null>(current.id ? current : null);
  useEffect(() => {
    const on = () => set(current.id ? current : null);
    window.addEventListener(ME_EVT, on);
    if (!loading) refreshMe();
    else on();
    return () => window.removeEventListener(ME_EVT, on);
  }, []);
  return me;
}

export const ROLE_HELP: Record<Role, string> = {
  creator: "Writes and checks ads. Cannot approve.",
  reviewer: "Signs off ads written by others.",
  brand_manager: "Signs off or rejects ads and can override a single issue with a reason.",
  admin: "Signs off ads and can override a decision with a reason.",
};
/** The signed-in user (prefs arg kept for older callers). */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function personaOf(_p?: Prefs): Persona {
  return current;
}

export interface Prefs {
  brand: string;
  /** @deprecated unused; identity comes from the signed-in account. */
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
  brand: BRANDS[0], persona: "", onboarded: false, checklistDismissed: false,
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
  window.dispatchEvent(new CustomEvent(EVT, { detail: next }));
}

export function usePrefs(): Prefs {
  const [prefs, set] = useState<Prefs>(DEFAULTS);
  useEffect(() => {
    set(readPrefs());
    if (!loading) refreshMe();
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
// Workspaces live on the server (src/lib/workspaces/client.ts); these only drive the picker.
export const PICKER_EVT = "adsnitch:open-picker";
export const PICKED_KEY = "adsnitch:workspace-picked";

export function openWorkspacePicker() {
  window.dispatchEvent(new Event(PICKER_EVT));
}
