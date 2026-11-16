"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { createWorkspace, type Workspace } from "@/lib/workspaces/client";
import { uploadFile } from "@/lib/files/store";
import { ROLE_HELP, PICKED_KEY, setPrefs, useMe, focusRing } from "@/components/guide/workspace";
import { BrandBookImport } from "@/app/brands/BrandBookImport";

const STEPS = ["Your brand", "Brand book", "Ready"];
const INDUSTRIES = ["Health & nutrition", "Beauty & skincare", "Software", "Finance", "Food & drink", "Fashion & apparel", "Education", "Other"];
const CHANNELS = ["Instagram", "TikTok", "YouTube", "LinkedIn", "Landing page", "Product page", "Email", "Ads"];
const MAX_LOGO = 2 * 1024 * 1024;

const input = `mt-1.5 h-11 w-full rounded-xl border border-border-default bg-panel px-3 text-base text-text-primary placeholder:text-text-muted sm:text-sm ${focusRing}`;
const label = "text-sm font-medium text-text-primary";

/** Saves the optional logo as a brand asset (stored file + asset record). Failure is reported, never blocks. */
async function saveLogo(file: File, ws: Workspace): Promise<string | null> {
  const up = await uploadFile(file, ws.id);
  if (!up.id) return up.error ?? "The logo wasn't saved.";
  try {
    const item = {
      id: `logo-${Date.now()}`, name: file.name, size: `${Math.max(1, Math.round(file.size / 1e3))} KB`, type: "Logo",
      date: new Date().toISOString().slice(0, 10), reference: "Brand asset", fileId: up.id, uploaded: true,
    };
    const r = await fetch("/api/documents", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brand: ws.id, items: [item] }) });
    return r.ok ? null : "The logo was uploaded but not listed under brand assets.";
  } catch {
    return "The logo wasn't saved.";
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const me = useMe();
  const [step, setStep] = useState(0);
  const [ws, setWs] = useState<Workspace | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [otherIndustry, setOtherIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [channels, setChannels] = useState<string[]>(["Instagram"]);
  const [logo, setLogo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => headingRef.current?.focus(), [step]);

  const finish = (to: string) => {
    setPrefs({ onboarded: true, ...(ws ? { brand: ws.name, defaultBrandId: ws.id } : {}) });
    try {
      sessionStorage.setItem(PICKED_KEY, "1");
    } catch {}
    router.push(to);
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const n = name.trim();
    const ind = industry === "Other" ? otherIndustry.trim() : industry;
    let site = website.trim();
    if (n.length < 2) return setError("Give your brand a name of at least 2 characters.");
    if (!ind) return setError("Tell us your industry.");
    if (!channels.length) return setError("Pick at least one channel you publish on.");
    if (site) {
      if (!/^https?:\/\//i.test(site)) site = `https://${site}`;
      try {
        new URL(site);
      } catch {
        return setError("That website doesn't look like a valid address.");
      }
    }
    if (logo && (logo.size > MAX_LOGO || !logo.type.startsWith("image/"))) return setError("The logo must be an image under 2 MB.");
    setSaving(true);
    setError(null);
    const desc = [description.trim(), site && `Website: ${site}`].filter(Boolean).join(" · ").slice(0, 400);
    const res = await createWorkspace({ name: n, industry: ind, channels, description: desc || undefined });
    if (!res.ok) {
      setSaving(false);
      return setError(res.error);
    }
    setWs(res.workspace);
    // Own brand exists now: select it; samples fall back to hidden unless the user turns them on.
    setPrefs({ brand: res.workspace.name, defaultBrandId: res.workspace.id });
    if (logo) setNote(await saveLogo(logo, res.workspace));
    setSaving(false);
    setStep(1);
  };

  const btn = `inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-medium disabled:opacity-60 ${focusRing}`;
  const heading = "text-2xl font-semibold tracking-tight outline-none";

  return (
    <div className="relative isolate flex min-h-[100dvh] flex-col bg-canvas text-text-primary">
      <div className="atmosphere -z-10" aria-hidden="true"><i /><i /><i /></div>
      <nav className="glass flex h-16 items-center justify-between rounded-none border-x-0 border-t-0 px-4 sm:px-8">
        <Link href="/" className={`flex items-center gap-2.5 rounded-lg ${focusRing}`}>
          <span className="app-brand-mark" aria-hidden="true"><ShieldCheck className="h-4 w-4" /></span>
          <span className="text-base font-semibold tracking-tight" translate="no">AdSnitch</span>
        </Link>
        <button type="button" onClick={() => finish("/dashboard")} className={`rounded-lg px-3 py-2 text-[13px] text-text-muted hover:text-text-primary ${focusRing}`}>
          {ws ? "Go to the dashboard" : "Explore sample brands first"}
        </button>
      </nav>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          <ol className="mb-6 flex items-center gap-2" aria-label="Progress">
            {STEPS.map((s, i) => (
              <li key={s} className="flex flex-1 flex-col gap-1.5">
                <span className={`h-1 rounded-full ${i <= step ? "bg-ink" : "bg-border-default"}`} aria-hidden="true" />
                <span className={`text-xs ${i === step ? "text-text-primary" : "text-text-muted"}`}>
                  {s}
                  {i === step && <span className="sr-only"> (current step {i + 1} of 3)</span>}
                </span>
              </li>
            ))}
          </ol>

          <section className="glass-strong rounded-2xl p-6 sm:p-8">
            {step === 0 && (
              <form onSubmit={create} noValidate>
                <h1 ref={headingRef} tabIndex={-1} className={heading}>Create your brand</h1>
                <p className="mt-2 text-sm text-text-secondary">
                  AdSnitch checks ads against this brand&rsquo;s own claims and rules. The sample brands stay available as read-only demos.
                </p>
                <div className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="ob-name" className={label}>Brand name</label>
                    <input id="ob-name" autoFocus value={name} maxLength={60} onChange={(e) => { setName(e.target.value); setError(null); }} placeholder="e.g. Northwind Foods" autoComplete="organization" className={input} />
                  </div>
                  <div>
                    <label htmlFor="ob-industry" className={label}>Industry</label>
                    <select id="ob-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={input}>
                      {INDUSTRIES.map((x) => <option key={x}>{x}</option>)}
                    </select>
                    {industry === "Other" && (
                      <input aria-label="Your industry" value={otherIndustry} maxLength={60} onChange={(e) => setOtherIndustry(e.target.value)} placeholder="e.g. Pet care" className={input} />
                    )}
                  </div>
                  <div>
                    <label htmlFor="ob-site" className={label}>Website <span className="font-normal text-text-muted">(optional)</span></label>
                    <input id="ob-site" type="url" inputMode="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="northwind.com" autoComplete="url" spellCheck={false} className={input} />
                  </div>
                  <div>
                    <label htmlFor="ob-desc" className={label}>What does the brand sell? <span className="font-normal text-text-muted">(optional)</span></label>
                    <textarea id="ob-desc" value={description} maxLength={300} rows={2} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Plant-based snacks for kids" className={`${input} h-auto py-2`} />
                  </div>
                  <fieldset>
                    <legend className={label}>Where do you publish?</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {CHANNELS.map((c) => {
                        const on = channels.includes(c);
                        return (
                          <button type="button" key={c} aria-pressed={on} onClick={() => { setChannels((cur) => (on ? cur.filter((x) => x !== c) : [...cur, c])); setError(null); }}
                            className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${focusRing} ${on ? "border-transparent bg-text-primary text-canvas" : "border-border-default bg-panel text-text-secondary hover:text-text-primary"}`}>
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                  <div>
                    <label htmlFor="ob-logo" className={label}>Logo <span className="font-normal text-text-muted">(optional, image under 2 MB)</span></label>
                    <input id="ob-logo" type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] ?? null)} className={`mt-1.5 block w-full text-sm text-text-secondary ${focusRing}`} />
                  </div>
                </div>
                <p aria-live="polite" className="mt-4 min-h-5 text-[13px] text-status-critical">{error}</p>
                {me && (
                  <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                    You joined as <strong className="font-medium text-text-primary">{me.label}</strong>. {ROLE_HELP[me.role]}
                  </p>
                )}
                <div className="mt-6 flex justify-end">
                  <button type="submit" disabled={saving} className={`${btn} bg-ink text-canvas hover:opacity-90`}>
                    {saving ? "Creating…" : "Create brand"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </form>
            )}

            {step === 1 && ws && (
              <>
                <h1 ref={headingRef} tabIndex={-1} className={heading}>Import your brand book</h1>
                <p className="mt-2 text-sm text-text-secondary">
                  Have a style guide? Upload it and AdSnitch drafts <strong className="text-text-primary">{ws.name}</strong>&rsquo;s rules, terms and claims for you to review. You can also do this later from Brands.
                </p>
                {note && <p className="mt-3 text-[13px] text-status-warning">{note}</p>}
                <div className="mt-6">
                  <BrandBookImport brandId={ws.id} brandName={ws.name} onDone={() => setStep(2)} />
                </div>
                <div className="mt-6 flex justify-end">
                  <button type="button" onClick={() => setStep(2)} className={`${btn} text-text-secondary hover:text-text-primary`}>
                    Skip for now <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </>
            )}

            {step === 2 && ws && (
              <>
                <h1 ref={headingRef} tabIndex={-1} className={heading}>{ws.name} is ready</h1>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Add a few approved claims with proof, then check your first ad. The dashboard checklist tracks what&rsquo;s left.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-end gap-2">
                  <button type="button" onClick={() => finish("/dashboard")} className={`${btn} text-text-secondary hover:text-text-primary`}>Go to the dashboard</button>
                  <button type="button" onClick={() => finish("/submissions/new")} className={`${btn} bg-ink text-canvas hover:opacity-90`}>
                    Check your first ad <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
