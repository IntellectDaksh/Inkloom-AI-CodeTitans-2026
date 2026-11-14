"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { openFile, putFile } from "@/lib/files/store";
import { AlertTriangle, BadgeCheck, ChevronRight, ExternalLink, Pencil, Plus, Search, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AddClaimsDialog, type NewClaimInput } from "@/components/knowledge/AddClaimsDialog";
import { FileDrop, Toast, UNVERIFIED, area, field, focusRing, labelCls } from "@/components/knowledge/kb";

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
  /** IndexedDB key of an uploaded original (src/lib/files/store.ts). */
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
  /** Not saved to the server (API unavailable). */
  localOnly?: boolean;
}

// Demo data. Every source below is fictional and has not been independently verified.
const SEED_CLAIMS: Claim[] = [
  {
    id: "clm-apx-001", code: "CLM-APX-001", brand: "Apex Nutrition", type: "Performance",
    text: "Supports post-workout protein synthesis when taken within 45 minutes of resistance training.",
    expiresAt: "2026-12-31", updatedAt: "2026-11-02",
    channels: ["Instagram", "Paid social", "Product page"], owner: "Dr. Aris Vance, Medical & Regulatory",
    prohibited: ["Builds muscle faster than any other protein", "Doubles muscle growth", "Clinically proven to build muscle"],
    evidence: [
      { source: "Clinical study report APX-2024-C3", kind: "Clinical study", ref: "DOI 10.1016/j.nutres.2024.108421", excerpt: "Mean fractional synthetic rate was 28.4% higher than control (p = 0.004) over 8 weeks.", version: "v2", checkedAt: "2026-10-18" },
      { source: "Internal formulation sheet", kind: "Internal document", ref: "FORM-APX-ISO-12", excerpt: "Each serving provides 25 g whey isolate with 2.8 g leucine.", version: "v5", checkedAt: "2026-09-30" },
    ],
    usage: [
      { id: "sub_reel_script", title: "Q4 campaign, clinical protein reel script", channel: "Instagram Reel", date: "2026-11-12" },
      { id: "sub_pdp_headline", title: "Iso-Whey product page headline", channel: "Product page", date: "2026-10-20" },
    ],
  },
  {
    id: "clm-apx-002", code: "CLM-APX-002", brand: "Apex Nutrition", type: "Certification",
    text: "Informed-Sport certified. Every batch is tested for substances on the WADA prohibited list.",
    expiresAt: "2026-12-01", updatedAt: "2026-10-28",
    channels: ["Packaging", "Website", "Ambassador kits"], owner: "Mansoor R., Quality Assurance",
    prohibited: ["100% drug free", "Guaranteed safe for all athletes", "Banned-substance proof"],
    evidence: [
      { source: "Certificate of analysis, batch IS-8921", kind: "Certificate", ref: "LGC-IS-2026-Q1", excerpt: "All screened compounds were below the limit of quantification (LOQ < 10 ng/g).", version: "Q1 2026", checkedAt: "2026-10-28" },
    ],
    usage: [
      { id: "sub_insta_launch", title: "Recovery blend carousel", channel: "Instagram Carousel", date: "2026-11-13" },
      { id: "sub_athlete_ad", title: "College athlete sponsorship ad", channel: "Video ad", date: "2026-10-04" },
    ],
  },
  {
    id: "clm-apx-003", code: "CLM-APX-003", brand: "Apex Nutrition", type: "Clinical",
    text: "Raised peak VO2 max by 14.3% in trained endurance athletes over six weeks.",
    expiresAt: "2026-12-05", updatedAt: "2026-09-14",
    channels: ["B2B reports", "Whitepapers"], owner: "Dr. Aris Vance, Medical & Regulatory",
    prohibited: ["Boosts stamina for everyone", "Makes you run 14% faster"],
    evidence: [
      { source: "CPET protocol report CPET-2024-B", kind: "Clinical study", ref: "DOI 10.1249/MSS.0000000000003189", excerpt: "Peak oxygen uptake rose from 51.2 to 58.5 mL/kg/min (p < 0.001).", version: "v1", checkedAt: "2026-09-14" },
    ],
    usage: [{ id: "sub_linkedin_endurance", title: "Endurance results LinkedIn post", channel: "LinkedIn", date: "2026-09-22" }],
  },
  {
    id: "clm-apx-004", code: "CLM-APX-004", brand: "Apex Nutrition", type: "Ingredient",
    text: "No added sugar. Sweetened with stevia leaf extract.",
    expiresAt: "2027-06-30", updatedAt: "2026-08-03",
    channels: ["Nutrition panel", "Social", "Retail displays"], owner: "Elena Rostova, Compliance Counsel",
    prohibited: ["Sugar free", "Zero calories", "Diabetic friendly"],
    evidence: [
      { source: "Nutritional composition assay EF-9921", kind: "Lab test", ref: "AOAC 996.11", excerpt: "Sucrose, fructose and glucose each measured below 0.1 g per 100 g.", version: "v1", checkedAt: "2026-08-03" },
    ],
    usage: [{ id: "sub_banner_ingredients", title: "Ingredient spotlight banner", channel: "Display", date: "2026-08-19" }],
  },
  {
    id: "clm-apx-005", code: "CLM-APX-005", brand: "Apex Nutrition", type: "Performance",
    text: "Helps maintain hydration with a 3:1 sodium to potassium electrolyte ratio.",
    expiresAt: "2026-08-15", updatedAt: "2026-05-11",
    channels: ["Website", "Digital ads"], owner: "Dr. Marcus Lin, Scientific Advisor",
    prohibited: ["Hydrates 3x better than water", "Prevents cramps"],
    evidence: [
      { source: "Electrolyte osmolality report EOS-2023", kind: "Lab test", ref: "USP <785>", excerpt: "Solution measured 285 mOsm/kg, within isotonic range.", version: "v1", checkedAt: "2025-08-15" },
    ],
    usage: [{ id: "sub_hydration_v2", title: "Hydration electrolytes ad, version 2", channel: "Instagram Reel", date: "2026-07-30" }],
  },
  {
    id: "clm-apx-006", code: "CLM-APX-006", brand: "Apex Nutrition", type: "Ingredient",
    text: "Contains 5 g creatine monohydrate per serving.",
    draft: true, expiresAt: "2027-11-01", updatedAt: "2026-11-10",
    channels: ["Packaging"], owner: "Elena Rostova, Compliance Counsel",
    prohibited: ["Pharmaceutical-grade creatine"],
    evidence: [
      { source: "Supplier certificate of analysis", kind: "Certificate", ref: "SUP-CR-0412", excerpt: "Creatine monohydrate purity 99.6% by HPLC.", version: "draft", checkedAt: "2026-11-10" },
    ],
    usage: [],
  },
  {
    id: "clm-zen-001", code: "CLM-ZEN-001", brand: "Zenith Cloud", type: "Service level",
    text: "99.95% monthly uptime on Enterprise plans, backed by service credits.",
    expiresAt: "2027-03-31", updatedAt: "2026-10-01",
    channels: ["Website", "Sales decks", "Email"], owner: "Priya Natarajan, Legal",
    prohibited: ["Never goes down", "100% uptime", "Guaranteed zero downtime"],
    evidence: [
      { source: "Enterprise SLA", kind: "Contract", ref: "SLA-ENT-2026", excerpt: "Monthly uptime of at least 99.95%, otherwise credits apply per section 4.", version: "2026.2", checkedAt: "2026-10-01" },
      { source: "Status history export", kind: "Internal document", ref: "STATUS-Q3-2026", excerpt: "Q3 measured uptime 99.97% across all regions.", version: "Q3", checkedAt: "2026-10-03" },
    ],
    usage: [{ id: "sub_email_promo", title: "Enterprise SLA email announcement", channel: "Newsletter", date: "2026-11-14" }],
  },
  {
    id: "clm-zen-002", code: "CLM-ZEN-002", brand: "Zenith Cloud", type: "Security",
    text: "SOC 2 Type II report available to customers under NDA.",
    expiresAt: "2026-11-30", updatedAt: "2026-06-12",
    channels: ["Website", "Sales decks"], owner: "Tomás Herrera, Security",
    prohibited: ["SOC 2 certified", "Unhackable", "Bank-grade security"],
    evidence: [
      { source: "SOC 2 Type II attestation report", kind: "Audit report", ref: "AUD-ZEN-2025", excerpt: "Report period 1 Dec 2024 to 30 Nov 2025, no exceptions noted.", version: "2025", checkedAt: "2026-06-12" },
    ],
    usage: [{ id: "sub_security_page", title: "Trust page refresh", channel: "Website", date: "2026-06-20" }],
  },
  {
    id: "clm-zen-003", code: "CLM-ZEN-003", brand: "Zenith Cloud", type: "Performance",
    text: "Median API response time under 120 ms in EU and US regions.",
    expiresAt: "2026-10-31", updatedAt: "2026-04-30",
    channels: ["Developer docs", "Website"], owner: "Wen Li, Platform",
    prohibited: ["Fastest cloud on the market", "Instant responses"],
    evidence: [
      { source: "Internal latency benchmark", kind: "Internal document", ref: "BENCH-API-0426", excerpt: "p50 latency 104 ms (EU), 111 ms (US) across 30 days.", version: "v1", checkedAt: "2026-04-30" },
    ],
    usage: [{ id: "sub_dev_landing", title: "Developer landing page", channel: "Website", date: "2026-05-14" }],
  },
  {
    id: "clm-zen-004", code: "CLM-ZEN-004", brand: "Zenith Cloud", type: "Comparison",
    text: "Up to 30% lower compute cost than our 2024 pricing for the same workload.",
    draft: true, expiresAt: "2027-05-01", updatedAt: "2026-11-08",
    channels: ["Paid search"], owner: "Priya Natarajan, Legal",
    prohibited: ["30% cheaper than AWS", "Cheapest cloud provider"],
    evidence: [
      { source: "Pricing comparison worksheet", kind: "Internal document", ref: "PRICE-CMP-1108", excerpt: "Reference workload cost fell from $4,210 to $2,960 per month.", version: "draft", checkedAt: "2026-11-08" },
    ],
    usage: [],
  },
  {
    id: "clm-lum-001", code: "CLM-LUM-001", brand: "Lumina Labs", type: "Cosmetic",
    text: "Visibly reduces the look of fine lines after 8 weeks of twice-daily use.",
    expiresAt: "2027-02-28", updatedAt: "2026-09-21",
    channels: ["Instagram", "Product page", "Retail"], owner: "Dr. Hana Sato, Dermatology",
    prohibited: ["Reverses aging", "Repairs cells", "Removes wrinkles permanently", "Works like Botox"],
    evidence: [
      { source: "Consumer perception and instrumental study LUM-CS-07", kind: "Clinical study", ref: "LUM-CS-07", excerpt: "Profilometry showed an 11% reduction in fine line depth at week 8 (n = 42).", version: "v3", checkedAt: "2026-09-21" },
      { source: "Panel self-assessment", kind: "Consumer survey", ref: "LUM-SA-07", excerpt: "71% of participants agreed fine lines looked less visible.", version: "v1", checkedAt: "2026-09-21" },
    ],
    usage: [
      { id: "sub_clinical_whitepaper", title: "Peptide serum study summary", channel: "Healthcare portal", date: "2026-11-14" },
      { id: "sub_lumina_reel", title: "Night serum launch reel", channel: "Instagram Reel", date: "2026-10-09" },
    ],
  },
  {
    id: "clm-lum-002", code: "CLM-LUM-002", brand: "Lumina Labs", type: "Safety",
    text: "Dermatologist tested on sensitive skin.",
    expiresAt: "2026-12-10", updatedAt: "2026-07-07",
    channels: ["Packaging", "Website"], owner: "Dr. Hana Sato, Dermatology",
    prohibited: ["Hypoallergenic", "Safe for all skin", "Dermatologist recommended"],
    evidence: [
      { source: "Repeat insult patch test report", kind: "Lab test", ref: "HRIPT-LUM-22", excerpt: "No irritation or sensitization observed in 55 subjects with self-declared sensitive skin.", version: "v1", checkedAt: "2026-07-07" },
    ],
    usage: [{ id: "sub_lumina_pack", title: "Gentle cleanser pack copy", channel: "Packaging", date: "2026-07-15" }],
  },
  {
    id: "clm-lum-003", code: "CLM-LUM-003", brand: "Lumina Labs", type: "Ingredient",
    text: "Fragrance free and formulated without parabens.",
    expiresAt: "2027-09-30", updatedAt: "2026-10-14",
    channels: ["Packaging", "Website", "Instagram"], owner: "Grace Oduya, Regulatory",
    prohibited: ["Chemical free", "Non-toxic", "Clean beauty certified"],
    evidence: [
      { source: "Full ingredient declaration", kind: "Internal document", ref: "INCI-LUM-NS-04", excerpt: "No fragrance, parfum or paraben compounds listed in INCI.", version: "v4", checkedAt: "2026-10-14" },
    ],
    usage: [],
  },
];

type Status = "approved" | "expiring" | "expired" | "draft";

const STATUS: Record<Status, { label: string; variant: "approved" | "warning" | "violation" | "draft" }> = {
  approved: { label: "Approved", variant: "approved" },
  expiring: { label: "Expiring soon", variant: "warning" },
  expired: { label: "Expired", variant: "violation" },
  draft: { label: "Draft", variant: "draft" },
};

const BRANDS: Brand[] = ["Apex Nutrition", "Zenith Cloud", "Lumina Labs"];
const DAY = 86_400_000;
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

const BRAND_IDS: Record<string, string> = {
  "00000000-0000-4000-b000-000000000001": "Apex Nutrition",
  "00000000-0000-4000-b000-000000000002": "Zenith Cloud",
};
/** Direct link for an evidence item: stored URL, a DOI in its reference, or a URL reference. */
function sourceHref(ev: Evidence): string | undefined {
  // Demo records carry illustrative references only; linking them would lead to dead pages.
  if (!ev.userAdded) return undefined;
  if (ev.url) return ev.url;
  const doi = ev.ref?.match(/10\.\d{4,9}\/[^\s,;]+/)?.[0];
  if (doi) return `https://doi.org/${doi}`;
  return /^https?:\/\//.test(ev.ref ?? "") ? ev.ref : undefined;
}
const today = () => new Date().toISOString().slice(0, 10);
const cap = (s?: string) => (s ? s[0].toUpperCase() + s.slice(1).replace(/_/g, " ") : "General");

/* eslint-disable @typescript-eslint/no-explicit-any -- API returns the loose store shape */
function fromApi(c: any): Claim {
  const day = (v?: string | null) => (v ? String(v).slice(0, 10) : today());
  return {
    id: c.id, apiId: c.id, code: c.claim_code ?? c.id, brand: BRAND_IDS[c.brand_id] ?? c.brand ?? "Apex Nutrition",
    type: cap(c.category), text: c.claim_text ?? c.claimText ?? "", draft: c.status === "draft",
    expiresAt: day(c.expires_at ?? "2099-12-31"), updatedAt: day(c.updated_at),
    channels: String(c.permitted_context ?? "").split(/[,;]/).map((x: string) => x.trim()).filter(Boolean),
    owner: c.verifier?.full_name ?? c.owner ?? "Unassigned", prohibited: [],
    evidence: (c.evidence ?? []).map((e: any) => ({
      source: e.title, kind: cap(e.evidence_type), ref: e.citation, excerpt: e.excerpt, url: e.study_url ?? undefined,
      version: "v1", checkedAt: day(e.updated_at),
    })),
    usage: usageFromApi(c.dependent_submissions),
  };
}
function usageFromApi(subs: any[] = []): Usage[] {
  return subs.map((u) => ({ id: u.id, title: u.title, channel: cap(u.submission_type), date: String(u.created_at ?? today()).slice(0, 10) }));
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Demo seed plus API claims; an API claim with a seed's code lends it its id (for cascade) instead of duplicating it. */
function merge(seed: Claim[], api: Claim[]): Claim[] {
  const byCode = new Map(api.map((c) => [c.code, c]));
  const out = seed.map((s) => {
    const a = byCode.get(s.code);
    if (!a) return s;
    byCode.delete(s.code);
    return { ...s, apiId: a.apiId, usage: s.usage.length ? s.usage : a.usage };
  });
  return [...byCode.values(), ...out];
}

const daysLeft = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / DAY);
const fmt = (iso: string) => dateFmt.format(new Date(iso));

function statusOf(c: Claim): Status {
  if (c.draft) return "draft";
  const d = daysLeft(c.expiresAt);
  return d < 0 ? "expired" : d <= 30 ? "expiring" : "approved";
}

function expiryWords(c: Claim) {
  const d = daysLeft(c.expiresAt);
  if (d < 0) return `Expired ${fmt(c.expiresAt)}`;
  if (d === 0) return "Expires today";
  if (d <= 30) return `Expires in ${d} day${d === 1 ? "" : "s"}`;
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
  const [claims, setClaims] = useState<Claim[]>(SEED_CLAIMS);
  const [loadState, setLoadState] = useState<"loading" | "live" | "offline">("loading");
  const [toast, setToast] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [review, setReview] = useState<{ busy: boolean; msg: string }>({ busy: false, msg: "" });
  const [brand, setBrand] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [channel, setChannel] = useState("all");
  const [sort, setSort] = useState<"expiry" | "updated">("expiry");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Claim | null>(null);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const addRef = useRef<HTMLDialogElement>(null);

  const flash = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 4000); };

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/claims", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      const api = (data.claims as unknown[]).map(fromApi);
      // Keep claims created on this device that the server never saw.
      setClaims((prev) => [...prev.filter((c) => c.localOnly), ...merge(SEED_CLAIMS, api)]);
      setLoadState("live");
    } catch {
      setLoadState("offline");
    }
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount; state is set after await
  useEffect(() => { load(); }, [load]);

  // The drawer reads the live claim by id so edits, evidence and flags show immediately.
  const current = open ? claims.find((c) => c.id === open.id) ?? open : null;
  const patch = (id: string, fn: (c: Claim) => Claim) => setClaims((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));

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
            brandId: Object.keys(BRAND_IDS).find((k) => BRAND_IDS[k] === c.brand) ?? c.brand,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) { saved1 = fromApi(data.claim); saved++; }
      } catch { /* fall through to a local draft */ }
      const base: Claim = saved1 ?? {
        id: `local-${Date.now()}-${i}`, code: `CLM-NEW-${claims.length + i + 1}`, brand: c.brand, type: c.type, text: c.text,
        expiresAt: c.expiresAt, updatedAt: today(), channels: [], owner: "You", prohibited: [], evidence: [], usage: [], localOnly: true,
      };
      made.push({ ...base, brand: c.brand, type: c.type, draft: true, channels: c.channels, evidence, owner: "You" });
    }
    setClaims((prev) => [...made, ...prev]);
    const n = inputs.length;
    const m = `Added ${n} draft claim${n === 1 ? "" : "s"}.` +
      (saved < n ? ` ${n - saved} could not reach the server and are kept on this device only.` : "");
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
      msg = `${c.usage.length} draft${c.usage.length === 1 ? "" : "s"} marked for re-review on this device. The server could not be updated.`;
    }
    patch(c.id, (x) => ({ ...x, flaggedAt: today() }));
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
    // ponytail: edits are client-side only; add PATCH /api/claims/[id] to persist them.
    patch(current.id, (x) => ({ ...x, text, expiresAt, updatedAt: today(), edited: x.edited || changed, flaggedAt: changed ? undefined : x.flaggedAt }));
    setEditing(false);
    if (changed) { checkUsage(current); flash("Claim updated. Drafts that use it are listed under Re-review."); }
  }

  async function attachEvidence(c: Claim, text: string, file: File) {
    const fileName = file.name;
    const excerpt = text.replace(/\s+/g, " ").trim().slice(0, 400);
    const fileId = (await putFile(file)) ?? undefined;
    patch(c.id, (x) => ({
      ...x,
      evidence: [...x.evidence, { source: fileName, kind: "Uploaded file", ref: fileName, excerpt, version: "v1", checkedAt: today(), userAdded: true, fileName, fileId }],
    }));
    flash(`${fileName} attached as evidence.`);
  }

  function verifyEvidence(e: React.FormEvent<HTMLFormElement>, c: Claim, idx: number) {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("reviewer") ?? "").trim();
    if (!name) return;
    patch(c.id, (x) => ({ ...x, evidence: x.evidence.map((ev, i) => (i === idx ? { ...ev, verifiedBy: name, verifiedAt: today() } : ev)) }));
    flash("Evidence marked as verified.");
  }

  const needsReview = claims.filter((c) => !c.flaggedAt && c.usage.length > 0 && (c.edited || statusOf(c) === "expired"));
  const allBrands = [...new Set([...BRANDS, ...claims.map((c) => c.brand)])];
  const brandClaims = claims.filter((c) => brand === "all" || c.brand === brand);
  const types = [...new Set(claims.map((c) => c.type))].sort();
  const channels = [...new Set(claims.flatMap((c) => c.channels))].sort();

  const stats = [
    { label: "Approved", value: brandClaims.filter((c) => statusOf(c) === "approved").length },
    { label: "Expiring in 30 days", value: brandClaims.filter((c) => statusOf(c) === "expiring").length },
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
          Demo data. Brands, studies and references on this page are fictional and have not been independently verified.{" "}
          <span aria-live="polite">
            {loadState === "loading" && "Loading saved claims…"}
            {loadState === "live" && "Saved claims are loaded from the server."}
            {loadState === "offline" && (
              <>Saved claims could not be loaded, showing demo claims only.{" "}
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
                  onChange={(e) => setQuery(e.target.value)} className={`${field} w-full pl-9 placeholder:text-text-muted`}
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
                          {c.localOnly && ", saved on this device only"}
                        </p>
                      </div>
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
                <p className="text-[13px] text-text-muted">{current.brand}, {current.type}, <span translate="no">{current.code}</span></p>
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
                      <button onClick={() => setEditing(true)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-text-primary hover:bg-panel-hover ${focusRing}`}>
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
                      </button>
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
                      <li key={u.id}><Link href={`/submissions/${u.id}`} className={`rounded underline-offset-4 hover:underline ${focusRing}`}>{u.title}</Link> <span className="text-text-muted">({u.channel})</span></li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {current.flaggedAt
                    ? <span className="text-[13px] text-text-secondary">Flagged for re-review on {fmt(current.flaggedAt)}.</span>
                    : <Button size="sm" className="h-10" loading={review.busy} disabled={!current.usage.length} onClick={() => flagForReview(current)}>
                        Flag {current.usage.length} for re-review
                      </Button>}
                  <p aria-live="polite" className="text-[13px] text-text-secondary">{review.msg}</p>
                </div>
              </section>
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
                              onClick={async () => { if (!(await openFile(ev.fileId!))) flash("The original file is stored on the device it was uploaded from."); }}>
                              Open original file
                            </button>
                          )}
                        </div>
                      )}
                      {!ev.userAdded ? (
                        <p className="mt-3 text-[13px] text-text-muted">
                          <Badge variant="neutral" size="xs">Demo record</Badge>{" "}
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
              <FileDrop label="Attach a file as evidence" hint="PDF, Word, image or text. We keep the file name and a text excerpt."
                onText={(r, file) => attachEvidence(current, r.text, file)} />
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
                      <Link href={`/submissions/${u.id}`} className={`flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-panel-hover ${focusRing}`}>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{u.title}</p>
                          <p className="mt-1 text-[13px] text-text-muted">{u.channel}, {fmt(u.date)}</p>
                        </div>
                        <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-text-muted" />
                      </Link>
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
