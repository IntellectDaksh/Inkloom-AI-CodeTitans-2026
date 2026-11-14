"use client";

import React, { useRef, useState } from "react";
import { Check, FileUp, Plus, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Extracted, FileDrop, KbHeader, Modal, Toast, area, field, labelCls, useStored } from "@/components/knowledge/kb";

interface GuidelineRule {
  id: string;
  category: string;
  title: string;
  description: string;
  dos: string[];
  donts: string[];
  source?: string;
}

const CATEGORIES = ["Voice and tone", "Messaging standards", "Legal and disclosures", "Visual identity"];

const INITIAL: GuidelineRule[] = [
  {
    id: "g1", category: "Voice and tone", title: "Confident, science-backed, never hyped",
    description: "Speak with grounded confidence. Educate rather than pressure. No buzzwords or sensational promises.",
    dos: [
      "Use active, encouraging language, e.g. \"Fuel your training\"",
      "Point speed or absorption claims to the approved study in the claims library",
      "Write for everyday gym-goers as well as competitive athletes",
    ],
    donts: [
      "\"Miracle\", \"magic bullet\", \"cheat code\" or any cure-style phrasing",
      "Promising results in a fixed time without approved proof, e.g. \"build muscle in 14 days\"",
      "Fear-based or bro-science messaging",
    ],
  },
  {
    id: "g2", category: "Messaging standards", title: "Clear sourcing and ingredient transparency",
    description: "Ingredient claims must match a lab-tested, approved claim. Mention sustainability only when it is documented.",
    dos: ["Name the protein source and amino acid profile", "Mention non-GMO or recyclable packaging where documented"],
    donts: ["\"100% absorption\" without the approved lab report", "Knocking competitor categories without independent data"],
  },
];

/** Turn uploaded guideline text into a rule: lines starting with do/avoid/don't become lists. */
function ruleFromText(r: Extracted): GuidelineRule {
  const lines = r.text.split(/\r?\n/).map((l) => l.replace(/^[\s\-*•]+/, "").trim()).filter(Boolean);
  const dos = lines.filter((l) => /^do\b(?!n)/i.test(l)).map((l) => l.replace(/^do[:\s]+/i, ""));
  const donts = lines.filter((l) => /^(don'?t|do not|avoid|never)\b/i.test(l));
  return {
    id: `g-${Date.now()}`, category: "Messaging standards",
    title: r.fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "),
    description: lines.filter((l) => !dos.includes(l.replace(/^do[:\s]+/i, "")) && !donts.includes(l)).slice(0, 6).join(" ").slice(0, 600),
    dos, donts, source: r.fileName,
  };
}

export default function BrandGuidelinesPage() {
  const [rules, setRules] = useStored<GuidelineRule[]>("adsnitch:kb-guidelines", INITIAL);
  const [cat, setCat] = useState("all");
  const [draft, setDraft] = useState<GuidelineRule | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const addRef = useRef<HTMLDialogElement>(null);
  const uploadRef = useRef<HTMLDialogElement>(null);

  const flash = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 4000); };
  const lines = (v: FormDataEntryValue | null) => String(v ?? "").split("\n").map((s) => s.trim()).filter(Boolean);

  function save(e: React.FormEvent<HTMLFormElement>, dialog: HTMLDialogElement | null, base?: GuidelineRule) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const title = String(f.get("title") ?? "").trim();
    if (!title) return;
    setRules((p) => [{
      id: base?.id ?? `g-${Date.now()}`, source: base?.source, title,
      category: String(f.get("category")), description: String(f.get("description") ?? "").trim(),
      dos: lines(f.get("dos")), donts: lines(f.get("donts")),
    }, ...p]);
    e.currentTarget.reset();
    setDraft(null);
    dialog?.close();
    flash(`Saved "${title}". Saved on this device.`);
  }

  const visible = rules.filter((r) => cat === "all" || r.category === cat);

  const ruleFields = (r?: GuidelineRule) => (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className={`${labelCls} sm:col-span-2`}>Rule title
          <input name="title" required defaultValue={r?.title} placeholder="e.g. No medical promises" className={field} />
        </label>
        <label className={labelCls}>Category
          <select name="category" defaultValue={r?.category} className={field}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
      </div>
      <label className={labelCls}>What this rule means
        <textarea name="description" rows={4} defaultValue={r?.description} className={area} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelCls}>Do (one per line)
          <textarea name="dos" rows={4} defaultValue={r?.dos.join("\n")} className={area} />
        </label>
        <label className={labelCls}>Don&apos;t (one per line)
          <textarea name="donts" rows={4} defaultValue={r?.donts.join("\n")} className={area} />
        </label>
      </div>
    </>
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <KbHeader title="Brand guidelines" intro="The voice, tone and wording rules every ad is checked against. Add a rule by hand or upload your brand book.">
          <Button size="sm" variant="secondary" className="h-10" icon={<FileUp className="h-4 w-4" />} onClick={() => uploadRef.current?.showModal()}>
            Upload brand book
          </Button>
          <Button size="sm" className="h-10" icon={<Plus className="h-4 w-4" />} onClick={() => addRef.current?.showModal()}>Add rule</Button>
        </KbHeader>

        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {["all", ...CATEGORIES].map((c) => (
            <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)}
              className={`h-9 rounded-full border px-4 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 ${cat === c ? "border-ink bg-ink text-canvas" : "border-border-default text-text-secondary hover:bg-panel-hover"}`}>
              {c === "all" ? `All (${rules.length})` : c}
            </button>
          ))}
        </div>

        {visible.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {visible.map((r) => (
              <article key={r.id} className="glass space-y-5 rounded-2xl p-5 sm:p-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="neutral" size="xs">{r.category}</Badge>
                    {r.source && <span className="text-[13px] text-text-muted">From {r.source}</span>}
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-text-primary">{r.title}</h2>
                  {r.description && <p className="mt-1 text-sm leading-relaxed text-text-secondary">{r.description}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {([["Do", r.dos, Check, "text-status-success"], ["Don't", r.donts, X, "text-status-critical"]] as const).map(([h, list, Icon, color]) => (
                    <div key={h}>
                      <h3 className="text-sm font-semibold text-text-primary">{h}</h3>
                      {list.length ? (
                        <ul className="mt-2 space-y-2">
                          {list.map((t) => (
                            <li key={t} className="flex gap-2 text-sm text-text-secondary">
                              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} aria-hidden="true" />{t}
                            </li>
                          ))}
                        </ul>
                      ) : <p className="mt-2 text-sm text-text-muted">None yet.</p>}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl py-12 text-center">
            <p className="text-sm font-medium text-text-primary">No rules in this category yet</p>
            <button onClick={() => addRef.current?.showModal()} className="mt-2 text-[13px] text-text-muted underline underline-offset-4 hover:text-text-primary">Add the first one</button>
          </div>
        )}
      </div>

      <Modal ref={addRef} title="Add a guideline rule" wide>
        <form onSubmit={(e) => save(e, addRef.current)} className="space-y-4">
          {ruleFields()}
          <div className="flex justify-end"><Button type="submit" size="sm" className="h-10">Save rule</Button></div>
        </form>
      </Modal>

      <Modal ref={uploadRef} title="Upload a brand book" wide onClose={() => setDraft(null)}>
        {!draft ? (
          <FileDrop label="Choose your brand book" hint="PDF, Word, image or text, up to 15 MB. We read the text so you can review it before saving."
            onText={(r) => setDraft(ruleFromText(r))} />
        ) : (
          <form key={draft.id} onSubmit={(e) => save(e, uploadRef.current, draft)} className="space-y-4">
            <p className="text-sm text-text-secondary">We pulled this from <span className="font-medium text-text-primary">{draft.source}</span>. Tidy it up, then save.</p>
            {ruleFields(draft)}
            <div className="flex justify-end gap-2">
              <Button type="button" size="sm" variant="secondary" className="h-10" onClick={() => setDraft(null)}>Choose another file</Button>
              <Button type="submit" size="sm" className="h-10">Save as guideline</Button>
            </div>
          </form>
        )}
      </Modal>
      <Toast msg={toast} />
    </AppLayout>
  );
}
