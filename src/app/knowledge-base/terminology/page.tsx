"use client";

import React, { useRef, useState } from "react";
import { ArrowRight, Download, FileUp, Plus, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FileDrop, KbHeader, Modal, Toast, area, csvCell, download, field, focusRing, labelCls, parseCsv, useStored } from "@/components/knowledge/kb";

type Severity = "critical" | "high" | "medium";
interface Term { term: string; kind: "blocked" | "preferred"; note: string; replacement: string; severity: Severity }

const SEV: Record<Severity, { label: string; variant: "violation" | "warning" | "draft" }> = {
  critical: { label: "Must fix", variant: "violation" },
  high: { label: "Should fix", variant: "warning" },
  medium: { label: "Consider", variant: "draft" },
};

const INITIAL: Term[] = [
  { term: "magic bullet", kind: "blocked", severity: "critical", replacement: "effective, evidence-based formula", note: "Sensational and cannot be substantiated." },
  { term: "miracle", kind: "blocked", severity: "critical", replacement: "clinically evaluated formula", note: "Reads as a disease or cure claim." },
  { term: "cure", kind: "blocked", severity: "critical", replacement: "supports natural recovery", note: "Supplements cannot claim to treat or cure any condition." },
  { term: "cheat code", kind: "blocked", severity: "high", replacement: "carefully calibrated nutrition", note: "Off-brand slang that undermines trust." },
  { term: "instant fix", kind: "blocked", severity: "high", replacement: "fast-absorbing", note: "Promises a timeframe we have no data for." },
  { term: "guaranteed overnight", kind: "blocked", severity: "high", replacement: "consistent results over 8 weeks", note: "Guarantee language is high risk with regulators." },
  { term: "effortless", kind: "blocked", severity: "medium", replacement: "convenient", note: "Ignores the training and diet the result depends on." },
  { term: "bio-available", kind: "preferred", severity: "medium", replacement: "", note: "Use when citing the approved amino acid uptake study." },
  { term: "clean sport certified", kind: "preferred", severity: "medium", replacement: "", note: "Use only with the current batch-testing certificate." },
  { term: "supports protein synthesis", kind: "preferred", severity: "medium", replacement: "", note: "Matches approved claim CLM-APX-001 wording." },
];

const TEMPLATE = "term,kind,replacement,reason,severity\n" +
  ["clinically proven", "blocked", "clinically studied", "Needs a published trial", "high"].map(csvCell).join(",") + "\n";

export default function TerminologyPage() {
  const [terms, setTerms] = useStored<Term[]>("adsnitch:kb-terms", INITIAL);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ ok: Term[]; bad: number } | null>(null);
  const addRef = useRef<HTMLDialogElement>(null);
  const importRef = useRef<HTMLDialogElement>(null);
  const flash = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 4000); };

  const match = (t: Term) => [t.term, t.note, t.replacement].some((v) => v.toLowerCase().includes(q.trim().toLowerCase()));
  const blocked = terms.filter((t) => t.kind === "blocked" && match(t));
  const preferred = terms.filter((t) => t.kind === "preferred" && match(t));

  function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s = (k: string) => String(f.get(k) ?? "").trim();
    if (!s("term")) return;
    if (terms.some((t) => t.term.toLowerCase() === s("term").toLowerCase())) { flash(`"${s("term")}" is already in the list.`); return; }
    setTerms((p) => [{ term: s("term"), kind: s("kind") as Term["kind"], replacement: s("replacement"), note: s("note"), severity: s("severity") as Severity }, ...p]);
    e.currentTarget.reset();
    addRef.current?.close();
    flash(`Added "${s("term")}". Saved on this device.`);
  }

  function parse(text: string) {
    const [head = [], ...rows] = parseCsv(text);
    const keys = head.map((h) => h.trim().toLowerCase());
    const get = (r: string[], k: string) => (r[keys.indexOf(k)] ?? "").trim();
    const ok: Term[] = [];
    let bad = 0;
    for (const r of rows) {
      const term = get(r, "term");
      const kind = get(r, "kind").toLowerCase() === "preferred" ? "preferred" : "blocked";
      const sev = get(r, "severity").toLowerCase();
      if (!term || terms.some((t) => t.term.toLowerCase() === term.toLowerCase())) { bad++; continue; }
      ok.push({ term, kind, replacement: get(r, "replacement"), note: get(r, "reason"), severity: (sev in SEV ? sev : "high") as Severity });
    }
    setPreview({ ok, bad });
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <KbHeader title="Terminology" intro="Words to avoid and the words to use instead. Every ad check flags blocked terms and suggests the replacement.">
          <Button size="sm" variant="secondary" className="h-10" icon={<FileUp className="h-4 w-4" />} onClick={() => importRef.current?.showModal()}>Import CSV</Button>
          <Button size="sm" className="h-10" icon={<Plus className="h-4 w-4" />} onClick={() => addRef.current?.showModal()}>Add term</Button>
        </KbHeader>

        <div className="relative max-w-md">
          <label htmlFor="term-q" className="sr-only">Search terms</label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input id="term-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search terms or reasons…"
            className={`${field} w-full pl-9 placeholder:text-text-muted`} />
        </div>

        <section aria-labelledby="blocked-h" className="glass rounded-2xl p-5 sm:p-6">
          <h2 id="blocked-h" className="text-lg font-semibold text-text-primary">Blocked words ({blocked.length})</h2>
          <p className="mt-1 text-sm text-text-secondary">If an ad uses one of these, the check flags it and offers the safer wording.</p>
          {blocked.length ? (
            <ul className="mt-4 divide-y divide-border-default">
              {blocked.map((t) => (
                <li key={t.term} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-start">
                  <div>
                    <p className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-text-primary">
                      <span className="line-through decoration-status-critical/60">{t.term}</span>
                      {t.replacement && <><ArrowRight className="h-4 w-4 text-text-muted" aria-label="use instead" />{t.replacement}</>}
                    </p>
                    {t.note && <p className="mt-1 text-[13px] text-text-muted">{t.note}</p>}
                  </div>
                  <Badge variant={SEV[t.severity].variant} size="xs">{SEV[t.severity].label}</Badge>
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 text-sm text-text-muted">No blocked words match your search.</p>}
        </section>

        <section aria-labelledby="pref-h" className="glass rounded-2xl p-5 sm:p-6">
          <h2 id="pref-h" className="text-lg font-semibold text-text-primary">Preferred wording ({preferred.length})</h2>
          <p className="mt-1 text-sm text-text-secondary">Approved phrases and when they can be used.</p>
          {preferred.length ? (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {preferred.map((t) => (
                <li key={t.term} className="rounded-xl border border-border-default bg-panel p-4">
                  <p className="text-sm font-medium text-text-primary">{t.term}</p>
                  {t.note && <p className="mt-1 text-[13px] text-text-muted">{t.note}</p>}
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 text-sm text-text-muted">No preferred wording matches your search.</p>}
        </section>
      </div>

      <Modal ref={addRef} title="Add a term">
        <form onSubmit={add} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelCls}>Word or phrase<input name="term" required className={field} /></label>
            <label className={labelCls}>Type
              <select name="kind" className={field}><option value="blocked">Blocked</option><option value="preferred">Preferred</option></select>
            </label>
            <label className={labelCls}>Use instead<input name="replacement" placeholder="Optional" className={field} /></label>
            <label className={labelCls}>How serious
              <select name="severity" defaultValue="high" className={field}>
                {(Object.keys(SEV) as Severity[]).map((s) => <option key={s} value={s}>{SEV[s].label}</option>)}
              </select>
            </label>
          </div>
          <label className={labelCls}>Why<textarea name="note" rows={2} className={area} /></label>
          <div className="flex justify-end"><Button type="submit" size="sm" className="h-10">Save term</Button></div>
        </form>
      </Modal>

      <Modal ref={importRef} title="Import terms from a spreadsheet" onClose={() => setPreview(null)}>
        <button type="button" onClick={() => download("terms-template.csv", TEMPLATE)}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-panel-hover ${focusRing}`}>
          <Download className="h-4 w-4" aria-hidden="true" /> Download CSV template
        </button>
        <FileDrop raw accept=".csv,.txt" label="Choose a CSV file" hint="Columns: term, kind, replacement, reason, severity." onText={(r) => parse(r.text)} />
        {preview && (
          <div aria-live="polite" className="space-y-3">
            <p className="text-sm text-text-secondary">{preview.ok.length} new terms ready. {preview.bad ? `${preview.bad} rows skipped (empty or already listed).` : ""}</p>
            <div className="flex justify-end">
              <Button size="sm" className="h-10" disabled={!preview.ok.length} onClick={() => {
                setTerms((p) => [...preview.ok, ...p]);
                flash(`Imported ${preview.ok.length} terms. Saved on this device.`);
                importRef.current?.close();
              }}>Import {preview.ok.length} terms</Button>
            </div>
          </div>
        )}
      </Modal>
      <Toast msg={toast} />
    </AppLayout>
  );
}
