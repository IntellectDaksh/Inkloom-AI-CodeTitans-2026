"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { focusRing } from "@/components/guide/workspace";

interface G { category: string; title: string; description: string; dos: string[]; donts: string[] }
interface T { term: string; kind: "blocked" | "preferred"; replacement: string; note: string; severity: "critical" | "high" | "medium" }
interface C { claim: string; category: string; evidenceNeeded: string }
type Row<X> = X & { on: boolean };
interface Drafts { fileName: string; truncated: boolean; guidelines: Row<G>[]; terms: Row<T>[]; claims: Row<C>[] }

const field = `w-full rounded-lg border border-border-default bg-panel px-2.5 py-1.5 text-base text-text-primary sm:text-sm ${focusRing}`;
const btn = `inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium disabled:opacity-60 ${focusRing}`;

async function json(r: Response) {
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.success === false) throw new Error(d.error || `Request failed (error ${r.status}).`);
  return d;
}

/**
 * Upload a brand book, review the AI drafts, save only what was ticked.
 * Guidelines and terms go through the existing knowledge-base lists; claims are saved as under review.
 */
export function BrandBookImport({ brandId, brandName, onDone }: { brandId: string; brandName: string; onDone?: (saved: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"read" | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Drafts | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError(null);
    setResult(null);
    if (file.size > 15 * 1024 * 1024) return setError("This file is larger than 15 MB.");
    setBusy("read");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const d = await json(await fetch("/api/brandbook", { method: "POST", body: fd }));
      const on = <X,>(xs: X[]) => xs.map((x) => ({ ...x, on: true }));
      setDrafts({ fileName: d.fileName, truncated: d.truncated, guidelines: on(d.guidelines), terms: on(d.terms), claims: on(d.claims) });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
      if (input.current) input.current.value = "";
    }
  };

  const save = async () => {
    if (!drafts) return;
    const g = drafts.guidelines.filter((x) => x.on && x.title.trim());
    const t = drafts.terms.filter((x) => x.on && x.term.trim());
    const c = drafts.claims.filter((x) => x.on && x.claim.trim());
    if (!g.length && !t.length && !c.length) return setError("Tick at least one item to save.");
    setBusy("save");
    setError(null);
    const done: string[] = [];
    try {
      const q = encodeURIComponent(brandId);
      if (g.length) {
        const cur = await json(await fetch(`/api/guidelines?brand=${q}`, { cache: "no-store" }));
        const mine = (cur.items as Record<string, unknown>[]).filter((i) => !i.builtIn);
        const stamp = Date.now();
        const add = g.map(({ on: _on, ...x }, i) => ({ ...x, id: `g-${stamp}-${i}`, source: "Brand book" }));
        await json(await fetch("/api/guidelines", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brand: brandId, items: [...add, ...mine] }) }));
        done.push(`${g.length} guideline${g.length === 1 ? "" : "s"}`);
      }
      if (t.length) {
        const cur = await json(await fetch(`/api/terms?brand=${q}`, { cache: "no-store" }));
        const mine = (cur.items as Record<string, unknown>[]).filter((i) => !i.builtIn);
        const have = new Set(mine.map((i) => String(i.term ?? "").trim().toLowerCase()));
        const add = t.map(({ on: _on, ...x }) => x).filter((x) => !have.has(x.term.trim().toLowerCase()) && have.add(x.term.trim().toLowerCase()));
        await json(await fetch("/api/terms", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brand: brandId, items: [...add, ...mine] }) }));
        done.push(`${add.length} term${add.length === 1 ? "" : "s"}`);
      }
      if (c.length) {
        const d = await json(await fetch("/api/brandbook/claims", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brand: brandId, claims: c }) }));
        done.push(`${d.saved} claim${d.saved === 1 ? "" : "s"} (under review)`);
      }
      const msg = `Saved ${done.join(", ")} to ${brandName}.`;
      setDrafts(null);
      setResult(msg);
      onDone?.(msg);
    } catch (e) {
      setError(`${(e as Error).message}${done.length ? ` Already saved: ${done.join(", ")}.` : ""}`);
    } finally {
      setBusy(null);
    }
  };

  function patch<K extends "guidelines" | "terms" | "claims">(k: K, i: number, p: Partial<Drafts[K][number]>) {
    setDrafts((d) => (d ? { ...d, [k]: d[k].map((x, j) => (j === i ? { ...x, ...p } : x)) } : d));
  }
  const all = (k: "guidelines" | "terms" | "claims", on: boolean) =>
    setDrafts((d) => (d ? { ...d, [k]: d[k].map((x) => ({ ...x, on })) } : d));

  const Head = ({ k, label, n }: { k: "guidelines" | "terms" | "claims"; label: string; n: number }) => (
    <div className="mt-6 flex items-center justify-between gap-3">
      <h3 className="text-sm font-semibold text-text-primary">{label} <span className="font-normal text-text-muted">({n})</span></h3>
      {n > 0 && (
        <span className="flex gap-2 text-[13px]">
          <button type="button" onClick={() => all(k, true)} className={`rounded text-text-muted hover:text-text-primary ${focusRing}`}>All</button>
          <button type="button" onClick={() => all(k, false)} className={`rounded text-text-muted hover:text-text-primary ${focusRing}`}>None</button>
        </span>
      )}
    </div>
  );

  return (
    <div>
      {!drafts && (
        <>
          <input ref={input} type="file" accept=".pdf,.docx,.txt,.md" className="sr-only" id={`bb-${brandId}`} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <label htmlFor={`bb-${brandId}`} className={`${btn} cursor-pointer border border-border-default bg-panel text-text-primary hover:bg-panel-hover ${busy ? "pointer-events-none opacity-60" : ""}`}>
            {busy === "read" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileUp className="h-4 w-4" aria-hidden="true" />}
            {busy === "read" ? "Reading your brand book…" : "Upload brand book (PDF, DOCX, TXT)"}
          </label>
          <p className="mt-2 text-[12px] text-text-muted">Up to 15 MB. AI drafts rules, terms and claims for you to review. Nothing is saved until you confirm.</p>
        </>
      )}

      {drafts && (
        <div>
          <p className="text-[13px] text-text-secondary">
            Drafted from <strong className="font-medium text-text-primary">{drafts.fileName}</strong>. Untick anything wrong, edit the wording, then save.
            {drafts.truncated && " The file was long, so only the first part was read."}
          </p>

          <Head k="guidelines" label="Guidelines" n={drafts.guidelines.length} />
          <ul className="mt-2 space-y-2">
            {drafts.guidelines.map((g, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-border-subtle p-3">
                <input type="checkbox" checked={g.on} onChange={(e) => patch("guidelines", i, { on: e.target.checked })} aria-label={`Include guideline ${g.title}`} className="mt-2" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <input value={g.title} onChange={(e) => patch("guidelines", i, { title: e.target.value })} aria-label="Guideline title" className={field} />
                  <p className="text-[12px] text-text-muted">{g.category}</p>
                  <textarea value={g.description} onChange={(e) => patch("guidelines", i, { description: e.target.value })} aria-label="Guideline description" rows={2} className={field} />
                  {g.dos.length > 0 && <p className="text-[12px] text-text-secondary"><strong className="font-medium">Do:</strong> {g.dos.join(" · ")}</p>}
                  {g.donts.length > 0 && <p className="text-[12px] text-text-secondary"><strong className="font-medium">Don&rsquo;t:</strong> {g.donts.join(" · ")}</p>}
                </div>
              </li>
            ))}
          </ul>

          <Head k="terms" label="Terminology" n={drafts.terms.length} />
          <ul className="mt-2 space-y-2">
            {drafts.terms.map((t, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-border-subtle p-3">
                <input type="checkbox" checked={t.on} onChange={(e) => patch("terms", i, { on: e.target.checked })} aria-label={`Include term ${t.term}`} className="mt-2" />
                <div className="grid min-w-0 flex-1 gap-1.5 sm:grid-cols-[1fr_auto_1fr]">
                  <input value={t.term} onChange={(e) => patch("terms", i, { term: e.target.value })} aria-label="Term" className={field} />
                  <select value={t.kind} onChange={(e) => patch("terms", i, { kind: e.target.value as T["kind"] })} aria-label="Kind" className={field}>
                    <option value="blocked">Blocked</option>
                    <option value="preferred">Preferred</option>
                  </select>
                  <input value={t.replacement} onChange={(e) => patch("terms", i, { replacement: e.target.value })} aria-label="Replacement" placeholder="Replacement" className={field} />
                  {t.note && <p className="text-[12px] text-text-muted sm:col-span-3">{t.note} · {t.severity}</p>}
                </div>
              </li>
            ))}
          </ul>

          <Head k="claims" label="Candidate claims" n={drafts.claims.length} />
          <p className="mt-1 text-[12px] text-text-muted">Saved as under review. A claim can&rsquo;t be used to pass an ad until proof is attached and it&rsquo;s approved.</p>
          <ul className="mt-2 space-y-2">
            {drafts.claims.map((c, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-border-subtle p-3">
                <input type="checkbox" checked={c.on} onChange={(e) => patch("claims", i, { on: e.target.checked })} aria-label={`Include claim ${c.claim}`} className="mt-2" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <textarea value={c.claim} onChange={(e) => patch("claims", i, { claim: e.target.value })} aria-label="Claim text" rows={2} className={field} />
                  <p className="text-[12px] text-text-muted">{c.category}{c.evidenceNeeded && ` · Proof needed: ${c.evidenceNeeded}`}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => setDrafts(null)} disabled={busy === "save"} className={`${btn} text-text-secondary hover:text-text-primary`}>Discard</button>
            <button type="button" onClick={save} disabled={busy === "save"} className={`${btn} bg-ink text-canvas hover:opacity-90`}>
              {busy === "save" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Save selected
            </button>
          </div>
        </div>
      )}

      <p aria-live="polite" className="mt-3 text-[13px]">
        {error && <span className="text-status-critical">{error}</span>}
        {result && <span className="text-status-success">{result}</span>}
      </p>
    </div>
  );
}
