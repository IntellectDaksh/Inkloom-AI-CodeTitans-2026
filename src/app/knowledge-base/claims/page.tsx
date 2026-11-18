"use client";

import { fmtDate } from "@/components/settings/format";
import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { openFile, uploadFile } from "@/lib/files/store";
import { AlertTriangle, BadgeCheck, ChevronRight, ExternalLink, Pencil, Plus, Search, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useWorkspaces } from "@/lib/workspaces/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AddClaimsDialog, type NewClaimInput } from "@/components/knowledge/AddClaimsDialog";
import { readPrefs } from "@/components/guide/workspace";
import { BuiltInBadge, FileDrop, Toast, UNVERIFIED, area, field, focusRing, labelCls } from "@/components/knowledge/kb";

type Brand = string;

interface Evidence {
  source: string;
  kind: string;
  ref: string;
  excerpt: string;
  version: string;
  checkedAt: string;
  /** Added through the UI: never shown as verified until a reviewer signs it off. */
  userAdded?: boolean;
  fileName?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  /** Link to the source document, when one is on file. */
  url?: string;
  /** Id of the stored original (/api/files). */
  fileId?: string;
}

interface Usage {
  id: string;
  title: string;
  channel: string;
  date: string;
}

interface Claim {
  id: string;
  code: string;
  brand: Brand;
  type: string;
  text: string;
  draft?: boolean;
  expiresAt: string;
  updatedAt: string;
  channels: string[];
  owner: string;
  prohibited: string[];
  evidence: Evidence[];
  usage: Usage[];
  /** Id in the claims API store, when this claim exists there. */
  apiId?: string;
  /** Wording or expiry changed since drafts were checked against it. */
  edited?: boolean;
  flaggedAt?: string;
  /** Seeded claim that no reviewer has verified yet. */
  unverified?: boolean;
  /** Built-in library claim: read-only. */
  builtIn?: boolean;
  restriction?: string;
  disclosure?: string;
}


type Status = "approved" | "expiring" | "expired" | "draft" | "unverified";

const STATUS: Record<Status, { label: string; variant: "approved" | "warning" | "violation" | "draft" }> = {
  approved: { label: "Approved", variant: "approved" },
  expiring: { label: "Expiring soon", variant: "warning" },
  expired: { label: "Expired", variant: "violation" },
  draft: { label: "Draft", variant: "draft" },
  unverified: { label: "Unverified", variant: "warning" },
};

// Claim edits, attached evidence and sign-offs live in /api/documents/claims (one record per claim).
/** Fields of a claim that the review record owns; the claims API owns the rest. */
type ClaimRecord = Pick<Claim, "text" | "expiresAt" | "updatedAt" | "evidence" | "edited" | "flaggedAt" | "prohibited" | "usage"> & { id: string };
const recordOf = (c: Claim): ClaimRecord => ({
  id: c.apiId ?? c.id, text: c.text, expiresAt: c.expiresAt, updatedAt: c.updatedAt,
  evidence: c.evidence, edited: c.edited, flaggedAt: c.flaggedAt, prohibited: c.prohibited, usage: c.usage,
});
function withRecords(list: Claim[], recs: ClaimRecord[]): Claim[] {
  const byId = new Map(recs.map((r) => [r.id, r]));
  return list.map((c) => {
    const r = byId.get(c.id);
    return r ? { ...c, ...r, id: c.id, apiId: c.apiId, usage: [...r.usage, ...c.usage.filter((u) => !r.usage.some((x) => x.id === u.id))] } : c;
  });
}

const DAY = 86_400_000;

const BRAND_IDS: Record<string, string> = {
  "00000000-0000-4000-b000-000000000001": "Apex Nutrition",
  "00000000-0000-4000-b000-000000000002": "Zenith Cloud",
  "00000000-0000-4000-b000-000000000003": "Lumina Skincare",
};
/** Direct link for an evidence item: stored URL, a DOI in its reference, or a URL reference. */
function sourceHref(ev: Evidence): string | undefined {
  // Only evidence added by a person carries a link; library records without a public source stay unlinked.
  if (!ev.userAdded) return undefined;
  if (ev.url) return ev.url;
  const doi = ev.ref?.match(/10\.\d{4,9}\/[^\s,;]+/)?.[0];
  if (doi) return `https://doi.org/${doi}`;
  return /^https?:\/\//.test(ev.ref ?? "") ? ev.ref : undefined;
}
/** Usage rows with a "sub_" id have no review on file, so they render as plain text. */
const hasReview = (u: Usage) => !u.id.startsWith("sub_");
const today = () => new Date().toISOString().slice(0, 10);
const cap = (s?: string) => (s ? s[0].toUpperCase() + s.slice(1).replace(/_/g, " ") : "General");

/* eslint-disable @typescript-eslint/no-explicit-any -- API returns the loose store shape */
function fromApi(c: any): Claim {
  const day = (v?: string | null) => (v ? String(v).slice(0, 10) : today());
  return {
    id: c.id, apiId: c.id, code: c.claim_code ?? c.id, brand: BRAND_IDS[c.brand_id] ?? c.brand ?? "Apex Nutrition",
    type: cap(c.category), text: c.claim_text ?? c.claimText ?? "", draft: c.status === "draft", unverified: c.status === "under_review",
    expiresAt: day(c.expires_at ?? "2099-12-31"), updatedAt: day(c.updated_at),
    channels: String(c.permitted_context ?? "").split(/[,;]/).map((x: string) => x.trim()).filter(Boolean),
    owner: c.verifier?.full_name ?? c.owner ?? "Unassigned", prohibited: [],
    evidence: (c.evidence ?? []).map((e: any) => ({
      source: e.title, kind: cap(e.evidence_type), ref: e.citation || "No reference on file", excerpt: e.excerpt, url: e.study_url ?? undefined,
      version: "v1", checkedAt: day(e.updated_at),
    })),
    usage: usageFromApi(c.dependent_submissions),
    builtIn: !!c.built_in, restriction: c.restricted_context || undefined, disclosure: c.required_disclosures || undefined,
  };
}
function usageFromApi(subs: any[] = []): Usage[] {
  return subs.map((u) => ({ id: u.id, title: u.title, channel: cap(u.submission_type), date: String(u.created_at ?? today()).slice(0, 10) }));
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const daysLeft = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / DAY);
const fmt = (iso: string) => fmtDate(iso);

function statusOf(c: Claim): Status {
  if (c.draft) return "draft";
  if (c.unverified && !c.evidence.some((e) => e.verifiedBy)) return "unverified";
  const d = daysLeft(c.expiresAt);
  return d < 0 ? "expired" : d <= readPrefs().expiryDays ? "expiring" : "approved";
}

function expiryWords(c: Claim) {
  const d = daysLeft(c.expiresAt);
  if (d < 0) return `Expired ${fmt(c.expiresAt)}`;
  if (d === 0) return "Expires today";
  if (d <= readPrefs().expiryDays) return `Expires in ${d} day${d === 1 ? "" : "s"}`;
  return `Valid until ${fmt(c.expiresAt)}`;
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1 text-[13px] text-text-muted">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={field}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      {children}
    </section>
  );
}

function ClaimsLibrary() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "live" | "offline">("loading");
  const [toast, setToast] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [review, setReview] = useState<{ busy: boolean; msg: string }>({ busy: false, msg: "" });
  const [brand, setBrand] = useState("all");
  const workspaces = useWorkspaces();
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [channel, setChannel] = useState("all");
  const [sort, setSort] = useState<"expiry" | "updated">("expiry");
  useEffect(() => setSort(readPrefs().claimsSort), []);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Claim | null>(null);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const addRef = useRef<HTMLDialogElement>(null);

  const flash = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 4000); };

  const load = useCallback(async () => {
    try {
      const [res, rec] = await Promise.all([
        fetch("/api/claims", { cache: "no-store" }),
        fetch("/api/documents/claims", { cache: "no-store" }),
      ]);
      const [data, recs] = await Promise.all([res.json(), rec.json()]);
      if (!res.ok || !data.success || !rec.ok || !recs.success) throw new Error();
      setClaims(withRecords((data.claims as unknown[]).map(fromApi), recs.records as ClaimRecord[]));
      setLoadState("live");
    } catch {
      setLoadState("offline");
    }
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount; state is set after await
  useEffect(() => { load(); }, [load]);

  // The drawer reads the live claim by id so edits, evidence and flags show immediately.
  const current = open ? claims.find((c) => c.id === open.id) ?? open : null;
  const claimsRef = useRef<Claim[]>([]);
  claimsRef.current = claims;
  /** Applies a change and saves the claim's review record. Rolls back and resolves false if the server refuses. */
  const patch = async (id: string, fn: (c: Claim) => Claim, action = "claim_updated", detail: Record<string, unknown> = {}) => {
    const before = claimsRef.current.find((c) => c.id === id);
    if (!before) return false;
    const after = fn(before);
    setClaims((prev) => prev.map((c) => (c.id === id ? after : c)));
    try {
      const r = await fetch("/api/documents/claims", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId: after.apiId ?? after.id, record: recordOf(after), action, detail }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.success) throw new Error();
      return true;
    } catch {
      setClaims((prev) => prev.map((c) => (c.id === id ? before : c)));
      return false;
    }
  };

  async function createClaims(inputs: NewClaimInput[]): Promise<string> {
    let saved = 0;
    const made: Claim[] = [];
    for (const [i, c] of inputs.entries()) {
      const evidence: Evidence[] = c.evidence
        ? [{ source: c.evidence.source, kind: c.evidence.fileName ? "Uploaded file" : "Owner supplied", ref: c.evidence.ref || "No reference", excerpt: c.evidence.excerpt, version: "v1", checkedAt: today(), userAdded: true, fileName: c.evidence.fileName }]
        : [];
      let saved1: Claim | null = null;
      try {
        const res = await fetch("/api/claims", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            claimText: c.text, category: c.type.toLowerCase(), status: "draft", expiresAt: c.expiresAt,
            permittedContext: c.channels.join(", ") || undefined, evidenceSource: c.evidence?.source, evidenceExcerpt: c.evidence?.excerpt,
            brandId: workspaces.find((w) => w.name === c.brand)?.id ?? Object.keys(BRAND_IDS).find((k) => BRAND_IDS[k] === c.brand) ?? c.brand,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) { saved1 = fromApi(data.claim); saved++; }
      } catch { /* reported below */ }
      if (!saved1) continue;
      const full: Claim = { ...saved1, brand: c.brand, type: c.type, draft: true, channels: c.channels, evidence, owner: "You" };
      // Evidence and channels live in the claim's review record.
      await fetch("/api/documents/claims", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId: full.apiId ?? full.id, record: recordOf(full), action: "evidence_attached", detail: { created: true } }),
      }).catch(() => undefined);
      made.push(full);
    }
    setClaims((prev) => [...made, ...prev]);
    const n = inputs.length;
    const m = saved === n
      ? `Added ${n} draft claim${n === 1 ? "" : "s"}.`
      : `Added ${saved} of ${n}. ${n - saved} could not be saved. Check your connection and try those again.`;
    flash(m);
    return m;
  }

  async function checkUsage(c: Claim) {
    if (!c.apiId) return;
    try {
      const res = await fetch(`/api/claims/${encodeURIComponent(c.apiId)}/cascade`);
      const data = await res.json();
      if (res.ok && data.success && data.dependentSubmissions?.length) {
        const fresh = usageFromApi(data.dependentSubmissions);
        patch(c.id, (x) => ({ ...x, usage: [...x.usage, ...fresh.filter((f) => !x.usage.some((u) => u.id === f.id))] }));
      }
    } catch { /* keep the usage we already know */ }
  }

  async function flagForReview(c: Claim) {
    setReview({ busy: true, msg: "" });
    let msg: string;
    try {
      const res = await fetch(`/api/claims/${encodeURIComponent(c.apiId ?? c.code)}/cascade`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: c.edited ? "Claim wording or expiry was edited" : "Claim expired" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error();
      msg = `${data.count} draft${data.count === 1 ? "" : "s"} sent back for re-review.`;
    } catch {
      msg = "The drafts could not be flagged. Check your connection and try again.";
      setReview({ busy: false, msg });
      return;
    }
    await patch(c.id, (x) => ({ ...x, flaggedAt: today() }), "claim_flagged", { count: c.usage.length });
    setReview({ busy: false, msg });
  }

  function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!current) return;
    const f = new FormData(e.currentTarget);
    const text = String(f.get("text") ?? "").trim();
    const expiresAt = String(f.get("expires") || current.expiresAt);
    if (!text) return;
    const changed = text !== current.text || expiresAt !== current.expiresAt;
    setEditing(false);
    if (!changed) return;
    const c = current;
    patch(c.id, (x) => ({ ...x, text, expiresAt, updatedAt: today(), edited: true, flaggedAt: undefined }), "claim_edited", { text, expiresAt });
    checkUsage(c);
    if (!c.apiId) { flash("Claim updated. Drafts that use it are listed under Re-review."); return; }
    fetch(`/api/claims/${encodeURIComponent(c.apiId)}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimText: text, expiresAt }),
    })
      .then((r) => r.json().then((d) => (r.ok && d.success ? null : Promise.reject(d.error))))
      .then(() => flash("Claim updated on the server. Drafts that use it are listed under Re-review."))
      .catch(() => flash("The claim text could not be updated on the server. Try again."));
  }

  async function attachEvidence(c: Claim, text: string, file: File) {
    const fileName = file.name;
    const excerpt = text.replace(/\s+/g, " ").trim().slice(0, 400);
    const up = await uploadFile(file, c.brand);
    if (!up.id) { flash(up.error ?? "The file could not be uploaded. Try again."); return; }
    const fileId = up.id;
    const ok = await patch(c.id, (x) => ({
      ...x,
      evidence: [...x.evidence, { source: fileName, kind: "Uploaded file", ref: fileName, excerpt, version: "v1", checkedAt: today(), userAdded: true, fileName, fileId }],
    }), "evidence_attached", { fileName });
    flash(ok ? `${fileName} attached as evidence.` : "The file uploaded but could not be linked to the claim. Try again.");
  }

  function verifyEvidence(e: React.FormEvent<HTMLFormElement>, c: Claim, idx: number) {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("reviewer") ?? "").trim();
    if (!name) return;
    patch(c.id, (x) => ({ ...x, evidence: x.evidence.map((ev, i) => (i === idx ? { ...ev, verifiedBy: name, verifiedAt: today() } : ev)) }), "evidence_verified", { reviewer: name })
      .then((ok) => flash(ok ? "Evidence marked as verified." : "Could not save the verification. Try again."));
  }

  const needsReview = claims.filter((c) => !c.flaggedAt && c.usage.length > 0 && (c.edited || statusOf(c) === "expired"));
  const allBrands = [...new Set([...workspaces.map((w) => w.name), ...claims.map((c) => c.brand)])];
  const brandClaims = claims.filter((c) => brand === "all" || c.brand === brand);
  const types = [...new Set(claims.map((c) => c.type))].sort();
  const channels = [...new Set(claims.flatMap((c) => c.channels))].sort();

  const stats = [
    { label: "Approved", value: brandClaims.filter((c) => statusOf(c) === "approved").length },
    { label: `Expiring in ${readPrefs().expiryDays} days`, value: brandClaims.filter((c) => statusOf(c) === "expiring").length },
    { label: "Expired, needs re-review", value: brandClaims.filter((c) => statusOf(c) === "expired").length },
    { label: "Evidence records", value: brandClaims.reduce((n, c) => n + c.evidence.length, 0) },
  ];

  const visible = (() => {
    const q = query.trim().toLowerCase();
    return brandClaims
      .filter(
        (c) =>
          (status === "all" || statusOf(c) === status) &&
          (type === "all" || c.type === type) &&
          (channel === "all" || c.channels.includes(channel)) &&
          [c.text, c.code, c.owner, ...c.evidence.map((e) => e.source)].some((v) => v.toLowerCase().includes(q))
      )
      .sort((a, b) =>
        sort === "expiry" ? a.expiresAt.localeCompare(b.expiresAt) : b.updatedAt.localeCompare(a.updatedAt)
      );
  })();

  const clearFilters = () => { setQuery(""); setStatus("all"); setType("all"); setChannel("all"); };

  // Native modal <dialog>: traps focus, closes on Esc, and returns focus to the opener.
  const openClaim = (c: Claim) => {
    setOpen(c); setEditing(false); setReview({ busy: false, msg: "" });
    drawerRef.current?.showModal();
    if (statusOf(c) === "expired" || c.edited) checkUsage(c);
  };

  // Deep link: /knowledge-base/claims?claim=CLM-APX-001 (code, library id or API id) opens that claim's drawer.
  const wanted = useSearchParams().get("claim");
  const deepLinked = useRef<string | null>(null);
  useEffect(() => {
    if (!wanted || deepLinked.current === wanted) return;
    const w = wanted.toLowerCase();
    const hit = claims.find((c) => [c.id, c.apiId, c.code].some((v) => v?.toLowerCase() === w));
    if (!hit && loadState === "loading") return; // wait for API claims before giving up
    deepLinked.current = wanted;
    if (hit) openClaim(hit);
    else flash(`Claim ${wanted} is not in the approved library.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wanted, claims, loadState]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/knowledge-base" className={`rounded text-[13px] text-text-muted hover:text-text-primary ${focusRing}`}>
              Knowledge base
            </Link>
            <h1 className="mt-1 text-[28px] font-semibold leading-tight tracking-tight text-text-primary">Claims library</h1>
            <p className="mt-1 text-sm text-text-secondary">Approved marketing claims for each brand, with the proof behind them.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="brand">Brand</label>
            <select id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} className={field}>
              <option value="all">All brands</option>
              {allBrands.map((b) => <option key={b}>{b}</option>)}
            </select>
            <Button size="sm" className="h-10" icon={<Plus className="h-4 w-4" />} onClick={() => addRef.current?.showModal()}>
              Add claims
            </Button>
          </div>
        </header>

        <p className="rounded-lg border border-border-default bg-panel px-4 py-3 text-[13px] text-text-secondary">
          <span aria-live="polite">
            {loadState === "loading" && "Loading saved claims…"}
            {loadState === "live" && `${claims.length} claim${claims.length === 1 ? "" : "s"} across your workspaces. Claims stay unverified until a reviewer signs off their evidence.`}
            {loadState === "offline" && (
              <>Claims could not be loaded.{" "}
                <button onClick={() => { setLoadState("loading"); load(); }} className={`rounded underline underline-offset-4 hover:text-text-primary ${focusRing}`}>Try again</button>
              </>
            )}
          </span>
        </p>

        {needsReview.length > 0 && (
          <section aria-labelledby="nr-h" className="rounded-2xl border border-status-warning/40 bg-status-warning/10 p-5">
            <h2 id="nr-h" className="flex items-center gap-2 text-base font-semibold text-text-primary">
              <AlertTriangle className="h-4 w-4 text-status-warning" aria-hidden="true" />
              {needsReview.length} claim{needsReview.length === 1 ? "" : "s"} changed or expired while still used in drafts
            </h2>
            <p className="mt-1 text-sm text-text-secondary">Open one to see which drafts rely on it and send them back for re-review.</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {needsReview.map((c) => (
                <li key={c.id}>
                  <button onClick={() => openClaim(c)}
                    className={`rounded-lg border border-border-default bg-canvas px-3 py-2 text-left text-[13px] hover:bg-panel-hover ${focusRing}`}>
                    <span className="font-medium text-text-primary" translate="no">{c.code}</span>
                    <span className="text-text-muted">, {c.usage.length} draft{c.usage.length === 1 ? "" : "s"}, {c.edited ? "edited" : "expired"}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-label="Summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5">
              <p className="text-[13px] text-text-muted">{s.label}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-text-primary">{s.value}</p>
            </div>
          ))}
        </section>

        <section aria-labelledby="list-h" className="glass rounded-2xl p-5 sm:p-6">
          <h2 id="list-h" className="sr-only">Claims</h2>
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-6">
            <div className="relative col-span-2 flex flex-col gap-1 text-[13px] text-text-muted">
              <label htmlFor="claim-search">Search</label>
              <div className="relative">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="claim-search" type="search" placeholder="Claim text, code or source…" value={query}
                  onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") setQuery(""); }} className={`${field} w-full pl-9 placeholder:text-text-muted`}
                />
              </div>
            </div>
            <Select label="Status" value={status} onChange={setStatus} options={[
              { value: "all", label: "All" },
              ...(Object.keys(STATUS) as Status[]).map((s) => ({ value: s, label: STATUS[s].label })),
            ]} />
            <Select label="Claim type" value={type} onChange={setType} options={[{ value: "all", label: "All" }, ...types.map((t) => ({ value: t, label: t }))]} />
            <Select label="Channel" value={channel} onChange={setChannel} options={[{ value: "all", label: "All" }, ...channels.map((t) => ({ value: t, label: t }))]} />
            <Select label="Sort by" value={sort} onChange={(v) => setSort(v as typeof sort)} options={[
              { value: "expiry", label: "Expiry date" },
              { value: "updated", label: "Recently updated" },
            ]} />
          </div>

          <p className="mb-2 text-[13px] text-text-muted" aria-live="polite">
            {visible.length} of {brandClaims.length} claims
          </p>

          {visible.length ? (
            <ul className="-mx-3 space-y-1">
              {visible.map((c) => {
                const s = STATUS[statusOf(c)];
                return (
                  <li key={c.id}>
                    <button
                      type="button" onClick={() => openClaim(c)}
                      className={`group flex w-full items-start gap-4 rounded-xl px-3 py-4 text-left transition-colors hover:bg-panel-hover ${focusRing}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-medium leading-snug text-text-primary">{c.text}</p>
                        <p className="mt-1.5 text-[13px] text-text-muted">
                          {c.brand}, {c.type}, {expiryWords(c)}, {c.evidence.length} evidence record{c.evidence.length === 1 ? "" : "s"}
                          {c.flaggedAt && ", drafts flagged for re-review"}
                        </p>
                      </div>
                      {c.builtIn && <BuiltInBadge />}
                      <Badge variant={s.variant} size="xs" className="shrink-0">{s.label}</Badge>
                      <ChevronRight aria-hidden="true" className="mt-0.5 hidden h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 sm:block" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-text-primary">No claims match these filters</p>
              <button onClick={clearFilters} className={`mt-2 rounded text-[13px] text-text-muted underline underline-offset-4 hover:text-text-primary ${focusRing}`}>
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Detail drawer */}
      <dialog
        ref={drawerRef} onClose={() => { setOpen(null); setEditing(false); }} aria-labelledby="drawer-h"
        onClick={(e) => e.target === e.currentTarget && drawerRef.current?.close()}
        className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-xl overflow-y-auto overscroll-contain border-l border-border-default bg-canvas p-0 text-text-primary backdrop:bg-ink/30"
      >
        {current && (
          <div className="space-y-8 p-5 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-text-muted">{current.brand}, {current.type}, <span translate="no">{current.code}</span>{" "}
                  <button type="button" title="Copy claim code" className="ml-1 rounded px-1.5 py-0.5 text-[12px] font-medium text-text-secondary hover:bg-panel-hover hover:text-text-primary" onClick={() => navigator.clipboard?.writeText(current.code)}>Copy code</button>
                </p>
                {editing ? (
                  <form onSubmit={saveEdit} className="mt-2 space-y-3">
                    <label className={labelCls}>Claim wording
                      <textarea name="text" required rows={3} defaultValue={current.text} className={area} autoFocus />
                    </label>
                    <label className={labelCls}>Expires
                      <input name="expires" type="date" required defaultValue={current.expiresAt} className={field} />
                    </label>
                    <p className="text-[13px] text-text-muted">Changing wording or expiry sends drafts that use this claim to re-review.</p>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="h-10">Save changes</Button>
                      <Button type="button" size="sm" variant="secondary" className="h-10" onClick={() => setEditing(false)}>Cancel</Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h2 id="drawer-h" className="mt-2 text-lg font-semibold leading-snug">{current.text}</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-text-secondary">
                      <Badge variant={STATUS[statusOf(current)].variant} size="xs">{STATUS[statusOf(current)].label}</Badge>
                      <span>{expiryWords(current)}</span>
                      {current.builtIn && <BuiltInBadge />}
                      {!current.builtIn && <button onClick={() => setEditing(true)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-text-primary hover:bg-panel-hover ${focusRing}`}>
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
                      </button>}
                    </div>
                  </>
                )}
              </div>
              <button
                aria-label="Close" onClick={() => drawerRef.current?.close()}
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-text-muted hover:bg-panel-hover hover:text-text-primary ${focusRing}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {(statusOf(current) === "expired" || current.edited) && (
              <section aria-labelledby="rr-h" className="rounded-xl border border-status-warning/40 bg-status-warning/10 p-4">
                <h3 id="rr-h" className="flex items-center gap-2 text-sm font-semibold">
                  <AlertTriangle className="h-4 w-4 text-status-warning" aria-hidden="true" />
                  Re-review: {current.usage.length} draft{current.usage.length === 1 ? "" : "s"} use this claim
                </h3>
                <p className="mt-1 text-[13px] text-text-secondary">
                  {current.edited ? "The wording or expiry changed" : "This claim has expired"}, so any ad that relies on it should be checked again before it goes out.
                </p>
                {current.usage.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm">
                    {current.usage.map((u) => (
                      <li key={u.id}>{hasReview(u) ? <Link href={`/submissions/${u.id}`} className={`rounded underline-offset-4 hover:underline ${focusRing}`}>{u.title}</Link> : <span>{u.title}</span>} <span className="text-text-muted">({u.channel}{hasReview(u) ? "" : ", no review on file"})</span></li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {current.builtIn ? <span className="text-[13px] text-text-secondary">Built-in claim: re-check the drafts listed above by hand.</span> : current.flaggedAt
                    ? <span className="text-[13px] text-text-secondary">Flagged for re-review on {fmt(current.flaggedAt)}.</span>
                    : <Button size="sm" className="h-10" loading={review.busy} disabled={!current.usage.length} onClick={() => flagForReview(current)}>
                        Flag {current.usage.length} for re-review
                      </Button>}
                  <p aria-live="polite" className="text-[13px] text-text-secondary">{review.msg}</p>
                </div>
              </section>
            )}

            {(current.restriction || current.disclosure) && (
              <Section title="Conditions">
                {current.disclosure && <p className="text-sm text-text-secondary"><span className="font-medium text-text-primary">Required disclosure: </span>{current.disclosure}</p>}
                {current.restriction && <p className="text-sm text-text-secondary"><span className="font-medium text-text-primary">Restrictions: </span>{current.restriction}</p>}
              </Section>
            )}

            <Section title="Allowed channels">
              {current.channels.length ? (
                <ul className="flex flex-wrap gap-2">
                  {current.channels.map((ch) => <li key={ch}><Badge variant="neutral" size="sm">{ch}</Badge></li>)}
                </ul>
              ) : <p className="text-sm text-text-muted">None set yet.</p>}
            </Section>

            <Section title={`Evidence (${current.evidence.length})`}>
              {current.evidence.length ? (
                <ul className="space-y-3">
                  {current.evidence.map((ev, idx) => (
                    <li key={`${ev.ref}-${idx}`} className="rounded-xl border border-border-default bg-panel p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{ev.source}</p>
                        {ev.userAdded && (ev.verifiedBy
                          ? <Badge variant="approved" size="xs">Verified</Badge>
                          : <Badge variant="warning" size="xs">Unverified</Badge>)}
                      </div>
                      <p className="mt-1 text-[13px] text-text-muted">{ev.kind}, <span translate="no">{ev.ref}</span></p>
                      {ev.excerpt && (
                        <blockquote className="mt-3 border-l-2 border-border-strong pl-3 text-sm leading-relaxed text-text-secondary">
                          &ldquo;{ev.excerpt}&rdquo;
                        </blockquote>
                      )}
                      {(sourceHref(ev) || ev.fileId) && (
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
                          {sourceHref(ev) && (
                            <a href={sourceHref(ev)} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 font-medium underline underline-offset-2 ${focusRing}`}>
                              Open source <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            </a>
                          )}
                          {ev.fileId && (
                            <button type="button" className={`font-medium underline underline-offset-2 cursor-pointer ${focusRing}`}
                              onClick={async () => { if (!(await openFile(ev.fileId!))) flash("The file could not be opened. Try again."); }}>
                              Open original file
                            </button>
                          )}
                        </div>
                      )}
                      {current.builtIn ? (
                        <p className="mt-3 text-[13px] text-text-muted">
                          Built-in library record. Last checked {fmt(ev.checkedAt)}.
                        </p>
                      ) : !ev.userAdded ? (
                        <p className="mt-3 text-[13px] text-text-muted">
                          Version {ev.version}. Last checked by owner {fmt(ev.checkedAt)}. Unverified.
                        </p>
                      ) : ev.verifiedBy ? (
                        <p className="mt-3 flex items-center gap-1 text-[13px] text-text-secondary">
                          <BadgeCheck className="h-4 w-4" aria-hidden="true" /> Verified by {ev.verifiedBy} on {fmt(ev.verifiedAt!)}.
                        </p>
                      ) : (
                        <form onSubmit={(e) => verifyEvidence(e, current, idx)} className="mt-3 space-y-2">
                          <p className="text-[13px] text-text-muted">Added {fmt(ev.checkedAt)}. {UNVERIFIED}.</p>
                          <div className="flex flex-wrap gap-2">
                            <label className="sr-only" htmlFor={`rev-${idx}`}>Reviewer name</label>
                            <input id={`rev-${idx}`} name="reviewer" required autoComplete="name" placeholder="Reviewer name" className={`${field} min-w-0 flex-1`} />
                            <Button type="submit" size="sm" variant="secondary" className="h-10">Mark verified</Button>
                          </div>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-text-muted">No evidence attached. Add proof before this claim can be approved.</p>}
              {current.builtIn
                ? <p className="text-[13px] text-text-muted">Built-in claim. It ships with this workspace and can&apos;t be edited or removed.</p>
                : <FileDrop label="Attach a file as evidence" hint="PDF, Word, image or text. We keep the file name and a text excerpt."
                    onText={(r, file) => attachEvidence(current, r.text, file)} />}
            </Section>

            <Section title="Wording that is not allowed">
              {current.prohibited.length ? (
                <ul className="space-y-2">
                  {current.prohibited.map((p) => (
                    <li key={p} className="flex gap-2 text-sm text-text-secondary">
                      <X aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-status-critical" />
                      <span><span className="sr-only">Not allowed: </span>&ldquo;{p}&rdquo;</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-text-muted">No blocked variants recorded.</p>}
            </Section>

            <Section title="Used in">
              {current.usage.length ? (
                <ul className="-mx-3 space-y-1">
                  {current.usage.map((u) => (
                    <li key={u.id}>
                      {hasReview(u) ? (
                        <Link href={`/submissions/${u.id}`} className={`flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-panel-hover ${focusRing}`}>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{u.title}</p>
                            <p className="mt-1 text-[13px] text-text-muted">{u.channel}, {fmt(u.date)}</p>
                          </div>
                          <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-text-muted" />
                        </Link>
                      ) : (
                        <div className="px-3 py-3">
                          <p className="truncate text-sm font-medium">{u.title}</p>
                          <p className="mt-1 text-[13px] text-text-muted">{u.channel}, {fmt(u.date)}. No review on file.</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-text-muted">Not used in any submission yet.</p>}
            </Section>

            <Section title="Owner">
              <p className="text-sm text-text-secondary">{current.owner}</p>
              <p className="text-[13px] text-text-muted">Last updated {fmt(current.updatedAt)}</p>
            </Section>
          </div>
        )}
      </dialog>

      <AddClaimsDialog ref={addRef} brands={allBrands} types={types} onCreate={createClaims}
        onImported={(m) => { flash(m); load(); }} />
      <Toast msg={toast} />
    </AppLayout>
  );
}

// Expiry status depends on today's date, so render per request instead of at build time.
export default function ClaimsLibraryPage() {
  return (
    <Suspense fallback={null}>
      <ClaimsLibrary />
    </Suspense>
  );
}
