"use client";

import React, { forwardRef, useMemo, useState } from "react";
import { CheckCircle2, Download, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Extracted, FileDrop, Modal, UNVERIFIED, area, csvCell, download, field, focusRing, labelCls, parseCsv, splitSentences,
} from "./kb";

export interface NewClaimInput {
  text: string;
  brand: string;
  type: string;
  channels: string[];
  expiresAt: string;
  evidence?: { source: string; ref: string; excerpt: string; fileName?: string };
}

type Tab = "form" | "bulk" | "doc";
const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: "form", label: "Type one in", hint: "Write a single claim and its proof." },
  { id: "bulk", label: "Import a spreadsheet", hint: "Many claims at once from CSV or JSON." },
  { id: "doc", label: "Pick from a document", hint: "Upload a study or brief, then tick the sentences to keep." },
];

const COLUMNS = ["claim", "brand", "type", "channels", "expires", "evidence_source", "evidence_reference", "evidence_excerpt"] as const;
const TEMPLATE =
  COLUMNS.join(",") + "\n" +
  [
    "Contains 25 g protein per serving.", "Apex Nutrition", "Ingredient", "Packaging; Website", "2027-12-31",
    "Nutrition panel lab report", "LAB-2026-014", "Protein measured at 25.3 g per 32 g serving.",
  ].map(csvCell).join(",") + "\n";

interface Row { n: number; input: NewClaimInput; errors: string[] }

function pick(o: Record<string, unknown>, ...keys: string[]) {
  for (const k of keys) if (o[k] != null && String(o[k]).trim()) return String(o[k]).trim();
  return "";
}

function toRows(text: string, fileName: string, brands: string[]): Row[] {
  let records: Record<string, unknown>[];
  if (/\.json$/i.test(fileName) || /^\s*[[{]/.test(text)) {
    const parsed = JSON.parse(text);
    records = Array.isArray(parsed) ? parsed : [parsed];
  } else {
    const [head = [], ...body] = parseCsv(text);
    const keys = head.map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
    records = body.map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i] ?? ""])));
  }
  const today = new Date().toISOString().slice(0, 10);
  return records.map((o, i) => {
    const chans = o.channels;
    const input: NewClaimInput = {
      text: pick(o, "claim", "claimText", "claim_text", "text"),
      brand: pick(o, "brand"),
      type: pick(o, "type", "category") || "General",
      channels: Array.isArray(chans) ? chans.map(String) : String(chans ?? "").split(/[;|]/).map((s) => s.trim()).filter(Boolean),
      expiresAt: pick(o, "expires", "expiresAt", "expires_at").slice(0, 10),
      evidence: undefined,
    };
    const src = pick(o, "evidence_source", "evidenceSource");
    const excerpt = pick(o, "evidence_excerpt", "evidenceExcerpt");
    if (src || excerpt) input.evidence = { source: src || "Imported evidence", ref: pick(o, "evidence_reference", "evidenceReference"), excerpt };
    const errors: string[] = [];
    if (input.text.length < 8) errors.push("Claim text is missing or too short");
    if (!input.brand) errors.push("Brand is missing");
    else if (!brands.some((b) => b.toLowerCase() === input.brand.toLowerCase())) errors.push(`Unknown brand "${input.brand}"`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.expiresAt) || isNaN(Date.parse(input.expiresAt))) errors.push("Expiry must be a date like 2027-12-31");
    else if (input.expiresAt < today) errors.push("Expiry date is in the past");
    return { n: i + 1, input, errors };
  });
}

export const AddClaimsDialog = forwardRef<HTMLDialogElement, {
  brands: string[];
  types: string[];
  onCreate: (claims: NewClaimInput[]) => Promise<string>;
  onImported: (msg: string) => void;
}>(function AddClaimsDialog({ brands, types, onCreate, onImported }, ref) {
  const [tab, setTab] = useState<Tab>("form");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // bulk
  const [rows, setRows] = useState<Row[] | null>(null);
  const [parseError, setParseError] = useState("");
  const [result, setResult] = useState<{ imported: number; rejected: { row: number; reason: string }[] } | null>(null);

  // document
  const [doc, setDoc] = useState<Extracted | null>(null);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [docBrand, setDocBrand] = useState(brands[0]);
  const sentences = useMemo(() => (doc ? splitSentences(doc.text) : []), [doc]);

  const reset = () => { setMsg(""); setRows(null); setResult(null); setParseError(""); setDoc(null); setPicked(new Set()); };
  const close = (el: HTMLElement) => (el.closest("dialog") as HTMLDialogElement | null)?.close();

  async function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const f = new FormData(formEl);
    const s = (k: string) => String(f.get(k) ?? "").trim();
    const input: NewClaimInput = {
      text: s("text"), brand: s("brand"), type: s("type") || "General",
      channels: s("channels").split(/[,;]/).map((c) => c.trim()).filter(Boolean),
      expiresAt: s("expires"),
      evidence: s("ev_source") || s("ev_excerpt") ? { source: s("ev_source") || "Supporting document", ref: s("ev_ref"), excerpt: s("ev_excerpt") } : undefined,
    };
    setBusy(true);
    setMsg(await onCreate([input]));
    setBusy(false);
    formEl.reset();
    close(formEl);
  }

  async function runImport(btn: HTMLElement) {
    const valid = rows?.filter((r) => !r.errors.length) ?? [];
    if (!valid.length) return;
    setBusy(true); setMsg("");
    try {
      const res = await fetch("/api/claims/import", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valid.map(({ input: c }) => ({
          claimText: c.text, brand: c.brand, category: c.type, channels: c.channels, expiresAt: c.expiresAt,
          evidenceSource: c.evidence?.source, evidenceReference: c.evidence?.ref, evidenceExcerpt: c.evidence?.excerpt,
        }))),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Import failed (error ${res.status}).`);
      setResult({ imported: data.imported ?? 0, rejected: data.rejected ?? [] });
      onImported(`Imported ${data.imported ?? 0} claim${data.imported === 1 ? "" : "s"}.`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setBusy(false);
      btn.focus();
    }
  }

  async function addPicked(btn: HTMLElement) {
    if (!doc || !picked.size) return;
    setBusy(true);
    const inputs = [...picked].sort((a, b) => a - b).map((i) => ({
      text: sentences[i], brand: docBrand, type: "General", channels: [],
      expiresAt: `${new Date().getFullYear() + 1}-12-31`,
      evidence: { source: doc.fileName, ref: doc.fileName, excerpt: sentences[i], fileName: doc.fileName },
    }));
    const m = await onCreate(inputs);
    setBusy(false);
    setMsg(m);
    close(btn);
  }

  const validCount = rows?.filter((r) => !r.errors.length).length ?? 0;

  return (
    <Modal ref={ref} title="Add claims" wide onClose={reset}>
      <div role="tablist" aria-label="How to add claims" className="grid gap-2 sm:grid-cols-3">
        {TABS.map((t) => (
          <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} aria-controls={`tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`rounded-xl border p-3 text-left transition-colors ${focusRing} ${tab === t.id ? "border-ink bg-panel" : "border-border-default hover:bg-panel-hover"}`}>
            <span className="block text-sm font-semibold text-text-primary">{t.label}</span>
            <span className="mt-1 block text-[13px] text-text-muted">{t.hint}</span>
          </button>
        ))}
      </div>

      {tab === "form" && (
        <form id="tab-form" role="tabpanel" onSubmit={submitForm} className="space-y-4">
          <label className={labelCls}>
            Claim wording
            <textarea name="text" required minLength={8} rows={3} placeholder="e.g. Contains 25 g protein per serving." className={area} />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className={labelCls}>Brand
              <select name="brand" className={field}>{brands.map((b) => <option key={b}>{b}</option>)}</select>
            </label>
            <label className={labelCls}>Claim type
              <input name="type" list="claim-types" placeholder="e.g. Ingredient" className={field} />
              <datalist id="claim-types">{types.map((t) => <option key={t} value={t} />)}</datalist>
            </label>
            <label className={labelCls}>Expires
              <input name="expires" type="date" required defaultValue={`${new Date().getFullYear() + 1}-12-31`} className={field} />
            </label>
          </div>
          <label className={labelCls}>Where it can be used (comma separated)
            <input name="channels" placeholder="Instagram, Website, Packaging" className={field} />
          </label>
          <fieldset className="space-y-3 rounded-xl border border-border-default p-4">
            <legend className="px-1 text-sm font-semibold text-text-primary">Proof (optional)</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className={labelCls}>Source<input name="ev_source" placeholder="e.g. Lab report" className={field} /></label>
              <label className={labelCls}>Reference<input name="ev_ref" placeholder="e.g. DOI or document ID" className={field} /></label>
            </div>
            <label className={labelCls}>Quote from the source
              <textarea name="ev_excerpt" rows={2} placeholder="Paste the exact sentence that backs the claim." className={area} />
            </label>
            <p className="text-[13px] text-text-muted">{UNVERIFIED}.</p>
          </fieldset>
          <div className="flex justify-end gap-2">
            <Button type="button" size="sm" variant="secondary" className="h-10" onClick={(e) => close(e.currentTarget)}>Cancel</Button>
            <Button type="submit" size="sm" className="h-10" loading={busy}>Save as draft</Button>
          </div>
        </form>
      )}

      {tab === "bulk" && (
        <div id="tab-bulk" role="tabpanel" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-text-secondary">Columns: {COLUMNS.join(", ")}. Separate channels with semicolons.</p>
            <button type="button" onClick={() => download("claims-template.csv", TEMPLATE)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-primary hover:bg-panel-hover ${focusRing}`}>
              <Download className="h-4 w-4" aria-hidden="true" /> Download CSV template
            </button>
          </div>
          <FileDrop raw label="Choose CSV or JSON" hint="A spreadsheet saved as .csv, or a .json list." accept=".csv,.json,.txt"
            onText={(r) => {
              setResult(null);
              try { setRows(toRows(r.text, r.fileName, brands)); setParseError(""); }
              catch { setRows(null); setParseError("That file is not valid CSV or JSON. Start from the template."); }
            }} />
          {parseError && <p role="alert" className="text-sm text-status-critical">{parseError}</p>}
          {rows && !result && (
            <>
              <p className="text-sm text-text-secondary" aria-live="polite">
                {validCount} of {rows.length} rows ready. {rows.length - validCount ? "Rows with problems will be skipped." : ""}
              </p>
              <div className="max-h-72 overflow-auto rounded-xl border border-border-default">
                <table className="w-full text-left text-[13px]">
                  <thead className="sticky top-0 bg-panel text-text-muted">
                    <tr><th className="p-2 font-medium">Row</th><th className="p-2 font-medium">Claim</th><th className="p-2 font-medium">Brand</th><th className="p-2 font-medium">Expires</th><th className="p-2 font-medium">Check</th></tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.n} className="border-t border-border-default align-top">
                        <td className="p-2 tabular-nums text-text-muted">{r.n}</td>
                        <td className="p-2 text-text-primary">{r.input.text || <em className="text-text-muted">empty</em>}</td>
                        <td className="p-2">{r.input.brand}</td>
                        <td className="p-2 tabular-nums">{r.input.expiresAt}</td>
                        <td className="p-2">
                          {r.errors.length
                            ? <span className="flex gap-1 text-status-critical"><XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />{r.errors.join(". ")}</span>
                            : <span className="flex gap-1 text-text-secondary"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />Ready</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end">
                <Button size="sm" className="h-10" loading={busy} disabled={!validCount} onClick={(e) => runImport(e.currentTarget)}>
                  Import {validCount} claim{validCount === 1 ? "" : "s"}
                </Button>
              </div>
            </>
          )}
          {result && (
            <div aria-live="polite" className="space-y-2 rounded-xl border border-border-default bg-panel p-4">
              <p className="text-sm font-semibold">{result.imported} imported as drafts, {result.rejected.length} rejected</p>
              {result.rejected.map((r) => <p key={r.row} className="text-[13px] text-status-critical">Row {r.row}: {r.reason}</p>)}
              <p className="text-[13px] text-text-muted">Imported evidence is {UNVERIFIED.toLowerCase()}.</p>
            </div>
          )}
        </div>
      )}

      {tab === "doc" && (
        <div id="tab-doc" role="tabpanel" className="space-y-4">
          <FileDrop label="Choose a document" hint="PDF, Word, image or text, up to 15 MB."
            onText={(r) => { setDoc(r); setPicked(new Set()); }} />
          {doc && (
            <>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <p className="text-sm text-text-secondary">
                  Tick the sentences that are claims. <span className="font-medium text-text-primary">{doc.fileName}</span> is attached as their evidence.
                </p>
                <label className={labelCls}>Brand
                  <select value={docBrand} onChange={(e) => setDocBrand(e.target.value)} className={field}>{brands.map((b) => <option key={b}>{b}</option>)}</select>
                </label>
              </div>
              {sentences.length ? (
                <ul className="max-h-80 space-y-1 overflow-auto rounded-xl border border-border-default p-2">
                  {sentences.map((s, i) => (
                    <li key={i}>
                      <label className={`flex cursor-pointer gap-3 rounded-lg p-2 text-sm leading-relaxed hover:bg-panel-hover ${picked.has(i) ? "bg-panel-hover text-text-primary" : "text-text-secondary"}`}>
                        <input type="checkbox" checked={picked.has(i)} className="mt-1 h-4 w-4 shrink-0 accent-ink"
                          onChange={() => setPicked((p) => { const n = new Set(p); if (n.has(i)) n.delete(i); else n.add(i); return n; })} />
                        {s}
                      </label>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-text-muted">No full sentences found in this file.</p>}
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] text-text-muted" aria-live="polite">{picked.size} selected. Saved as drafts, evidence {UNVERIFIED.toLowerCase()}.</p>
                <Button size="sm" className="h-10" loading={busy} disabled={!picked.size} onClick={(e) => addPicked(e.currentTarget)}>
                  Add {picked.size || ""} claim{picked.size === 1 ? "" : "s"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
      <p aria-live="polite" className="text-[13px] text-text-muted">{msg}</p>
    </Modal>
  );
});
