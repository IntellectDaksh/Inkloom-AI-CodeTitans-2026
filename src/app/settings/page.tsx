"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bell, Bot, Check, Database, Gauge, Palette, Pencil, Upload, Users, Briefcase, Download, RotateCcw, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Slider, Toggle, Segmented } from "@/components/settings/controls";
import {
  DEFAULTS,
  KEY,
  PERSONAS,
  PICKED_KEY,
  ROLE_HELP,
  STRICTNESS_PRESETS,
  WS_EVT,
  WS_KEY,
  focusRing,
  openWorkspacePicker,
  personaOf,
  readPrefs,
  setPrefs,
  updateWorkspace,
  usePrefs,
  useWorkspaces,
  type Prefs,
  type Strictness,
} from "@/components/guide/workspace";
import { VERDICT, localFlags, verdictFor, type FindingItem } from "@/components/submission/shared";

const SECTIONS = [
  { id: "workspace", label: "Workspace", icon: Briefcase },
  { id: "review", label: "Review strictness", icon: Gauge },
  { id: "ai", label: "AI", icon: Bot },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "team", label: "Team & roles", icon: Users },
  { id: "data", label: "Data", icon: Database },
];

const INDUSTRIES = ["Health & nutrition", "Beauty & skincare", "Software", "Finance", "Food & drink", "Other"];
const CHANNELS = ["Instagram", "TikTok", "LinkedIn", "Landing page", "Product page", "Email", "Ads"];
const SAMPLE_TEXT = "The best protein you'll ever try. Limited time offer!";
const SAMPLE_FINDINGS: FindingItem[] = [
  { id: "s1", category: "unsupported_claim", severity: "medium", flaggedText: "x", explanation: "", status: "resolved" },
];
const btn = `inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border-default bg-panel px-4 text-sm font-medium text-text-primary hover:bg-panel-hover ${focusRing}`;

function Panel({ id, title, desc, children }: { id: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="glass scroll-mt-24 rounded-2xl p-6">
      <h2 id={`${id}-t`} className="font-display text-xl font-semibold tracking-tight text-text-primary">
        {title}
      </h2>
      <p className="mt-1 text-sm text-text-secondary">{desc}</p>
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}

const Divided = ({ children }: { children: React.ReactNode }) => <div className="divide-y divide-border-default">{children}</div>;

export default function SettingsPage() {
  const prefs = usePrefs();
  const workspaces = useWorkspaces();
  const [toast, setToast] = useState(0);
  const [active, setActive] = useState("workspace");
  const [sampleScore, setSampleScore] = useState(76);
  const [ioMsg, setIoMsg] = useState<string | null>(null);
  const confirmRef = useRef<HTMLDialogElement>(null);
  const [confirm, setConfirm] = useState<"reset" | "clear">("reset");
  const fileRef = useRef<HTMLInputElement>(null);

  const save = (patch: Partial<Prefs>) => {
    setPrefs(patch);
    setToast((n) => n + 1);
  };
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(0), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  // Highlight the section nearest the top while scrolling.
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const current = workspaces.find((w) => w.name === prefs.brand) ?? workspaces[0];
  const [edit, setEdit] = useState(false);
  const [wsName, setWsName] = useState("");
  const [wsIndustry, setWsIndustry] = useState(INDUSTRIES[0]);
  const [wsChannels, setWsChannels] = useState<string[]>([]);
  const [wsErr, setWsErr] = useState<string | null>(null);
  const startEdit = () => {
    setWsName(current.name);
    setWsIndustry(current.industry);
    setWsChannels(current.channels);
    setWsErr(null);
    setEdit(true);
  };
  const saveWs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsChannels.length) return setWsErr("Pick at least one channel.");
    const err = updateWorkspace(current.name, { name: wsName, industry: wsIndustry, channels: wsChannels });
    if (err) return setWsErr(err);
    const clean = wsName.trim().replace(/\s+/g, " ");
    if (clean !== prefs.brand) setPrefs({ brand: clean });
    setEdit(false);
    setToast((n) => n + 1);
  };

  const setStrictness = (s: Strictness) => save({ strictness: s, ...STRICTNESS_PRESETS[s] });
  const preview = verdictFor(sampleScore, SAMPLE_FINDINGS, SAMPLE_TEXT, prefs);
  const previewFlags = localFlags(SAMPLE_TEXT, prefs);
  const persona = personaOf(prefs);

  const exportAll = () => {
    let workspacesRaw: unknown = [];
    try {
      workspacesRaw = JSON.parse(localStorage.getItem(WS_KEY) || "[]");
    } catch {}
    const blob = new Blob([JSON.stringify({ app: "adsnitch", version: 1, prefs: readPrefs(), workspaces: workspacesRaw }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "adsnitch-settings.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setIoMsg("Settings downloaded.");
  };

  const importAll = async (f: File) => {
    try {
      const data = JSON.parse(await f.text());
      if (!data || typeof data !== "object" || typeof data.prefs !== "object") throw new Error();
      // Only accept known keys with the right type, so a bad file can't break the app.
      const patch: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(data.prefs)) if (k in DEFAULTS && typeof v === typeof DEFAULTS[k as keyof Prefs]) patch[k] = v;
      if (Array.isArray(data.workspaces)) {
        const ok = data.workspaces.filter((w: unknown) => w && typeof (w as { name?: unknown }).name === "string" && Array.isArray((w as { channels?: unknown }).channels));
        localStorage.setItem(WS_KEY, JSON.stringify(ok));
        window.dispatchEvent(new Event(WS_EVT));
      }
      save(patch as Partial<Prefs>);
      setIoMsg(`Imported ${Object.keys(patch).length} settings.`);
    } catch {
      setIoMsg("That file isn't an AdSnitch settings export. Nothing was changed.");
    }
  };

  const askConfirm = (k: "reset" | "clear") => {
    setConfirm(k);
    confirmRef.current?.showModal();
  };
  const doConfirm = () => {
    confirmRef.current?.close();
    if (confirm === "reset") {
      const { brand, persona: who, onboarded, checklistDismissed } = readPrefs();
      save({ ...DEFAULTS, brand, persona: who, onboarded, checklistDismissed });
      setIoMsg("Settings reset to defaults.");
    } else {
      try {
        [KEY, WS_KEY, "adsnitch:pending-upload", "inkloom:session", "inkloom:sidebar-collapsed"].forEach((k) => localStorage.removeItem(k));
        sessionStorage.removeItem(PICKED_KEY);
      } catch {}
      window.location.reload();
    }
  };

  return (
    <AppLayout title="Settings" subtitle="Change how AdSnitch reviews ads and how the app looks on this device.">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-[28px]">Settings</h1>
          <p className="mt-1 max-w-2xl text-sm text-text-secondary">
            Changes save as soon as you make them. They're kept in this browser until accounts are connected.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
          <nav aria-label="Settings sections" className="hidden lg:block">
            <ul className="sticky top-24 space-y-1">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={active === id ? "true" : undefined}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active === id ? "bg-ink font-medium text-white" : "text-text-secondary hover:bg-panel-hover hover:text-text-primary"
                    } ${focusRing}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden /> {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 space-y-6">
            <Panel id="workspace" title="Workspace" desc="The brand you're reviewing ads for. Each workspace has its own claims and guidelines.">
              {!edit ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <dl className="grid gap-3 text-sm sm:grid-cols-3 sm:gap-8">
                    <div>
                      <dt className="text-text-muted">Name</dt>
                      <dd className="mt-0.5 font-medium text-text-primary">{current.name}</dd>
                    </div>
                    <div>
                      <dt className="text-text-muted">Industry</dt>
                      <dd className="mt-0.5 font-medium text-text-primary">{current.industry}</dd>
                    </div>
                    <div>
                      <dt className="text-text-muted">Channels</dt>
                      <dd className="mt-0.5 font-medium text-text-primary">{current.channels.join(", ")}</dd>
                    </div>
                  </dl>
                  <div className="flex shrink-0 gap-2">
                    {current.custom ? (
                      <button type="button" className={btn} onClick={startEdit}>
                        <Pencil className="h-4 w-4" aria-hidden /> Edit
                      </button>
                    ) : null}
                    <button type="button" className={`${btn} border-ink bg-ink text-white hover:bg-ink/90`} onClick={openWorkspacePicker}>
                      Switch workspace
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={saveWs} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1.5 text-sm font-medium text-text-primary">
                      Name
                      <input value={wsName} onChange={(e) => setWsName(e.target.value)} maxLength={60} className="block h-10 w-full rounded-lg glass-inset px-3 font-normal focus:outline-none focus:ring-2 focus:ring-blue/50" />
                    </label>
                    <label className="space-y-1.5 text-sm font-medium text-text-primary">
                      Industry
                      <select value={wsIndustry} onChange={(e) => setWsIndustry(e.target.value)} className="block h-10 w-full rounded-lg glass-inset px-3 font-normal focus:outline-none focus:ring-2 focus:ring-blue/50">
                        {INDUSTRIES.map((i) => (
                          <option key={i}>{i}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <fieldset>
                    <legend className="text-sm font-medium text-text-primary">Channels</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {CHANNELS.map((c) => {
                        const on = wsChannels.includes(c);
                        return (
                          <button key={c} type="button" aria-pressed={on} onClick={() => setWsChannels(on ? wsChannels.filter((x) => x !== c) : [...wsChannels, c])} className={`h-9 cursor-pointer rounded-full border px-3 text-sm transition-colors ${on ? "border-ink bg-ink text-white" : "border-border-default bg-panel text-text-secondary"} ${focusRing}`}>
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                  {wsErr && <p role="alert" className="text-sm text-status-critical">{wsErr}</p>}
                  <div className="flex gap-2">
                    <button type="submit" className={`${btn} border-ink bg-ink text-white hover:bg-ink/90`}>Save workspace</button>
                    <button type="button" className={btn} onClick={() => setEdit(false)}>Cancel</button>
                  </div>
                </form>
              )}
              {!current.custom && <p className="text-[13px] text-text-muted">Built-in demo workspaces can't be edited. Create your own from Switch workspace.</p>}
            </Panel>

            <Panel id="review" title="Review strictness" desc="Decides when an ad counts as safe, needs changes, or is blocked. Applied on every result page.">
              <div className="grid gap-8 xl:grid-cols-[1fr_280px]">
                <div className="space-y-6">
                  <Segmented<Strictness>
                    label="Strictness"
                    value={prefs.strictness}
                    onChange={setStrictness}
                    options={[
                      { value: "relaxed", label: "Relaxed" },
                      { value: "balanced", label: "Balanced" },
                      { value: "strict", label: "Strict" },
                    ]}
                  />
                  <Slider label="Pass score" min={50} max={95} value={prefs.passScore} hint="Ads scoring at or above this, with no open issues, are safe to publish." onChange={(v) => save({ passScore: Math.max(v, prefs.blockBelow + 1) })} />
                  <Slider label="Block below" min={20} max={60} value={prefs.blockBelow} hint="Ads scoring under this are blocked outright." onChange={(v) => save({ blockBelow: Math.min(v, prefs.passScore - 1) })} />
                  <Divided>
                    <Toggle label="Require a disclosure tag" hint="Ads without #ad or #sponsored need changes." checked={prefs.requireDisclosure} onChange={(v) => save({ requireDisclosure: v })} />
                    <Toggle label="Flag superlatives" hint={'Words like "best" or "guaranteed" need changes.'} checked={prefs.flagSuperlatives} onChange={(v) => save({ flagSuperlatives: v })} />
                    <Toggle label="Flag time-bound claims" hint={'Phrases like "limited time" or "today only" need changes.'} checked={prefs.flagTimeBound} onChange={(v) => save({ flagTimeBound: v })} />
                    <Toggle label="Require a reviewer for high-risk ads" hint="Saved for your workspace. Approvals already require a reviewer for high-risk findings; this switch takes over once the server reads workspace settings." checked={prefs.requireReviewerHighRisk} onChange={(v) => save({ requireReviewerHighRisk: v })} />
                  </Divided>
                </div>
                <aside aria-live="polite" className="glass-inset h-fit space-y-4 rounded-xl p-4 xl:sticky xl:top-24">
                  <p className="text-sm font-semibold text-text-primary">Live preview</p>
                  <p className="text-[13px] italic text-text-secondary">&ldquo;{SAMPLE_TEXT}&rdquo;</p>
                  <Slider label="Sample score" min={0} max={100} value={sampleScore} onChange={setSampleScore} />
                  <div>
                    <p className={`text-lg font-semibold ${VERDICT[preview].tone}`}>{VERDICT[preview].title}</p>
                    <ul className="mt-1 space-y-0.5 text-[13px] text-text-muted">
                      {previewFlags.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                      {!previewFlags.length && <li>Passes at {prefs.passScore}+, blocked below {prefs.blockBelow}.</li>}
                    </ul>
                  </div>
                </aside>
              </div>
            </Panel>

            <Panel id="ai" title="AI" desc="How the assistant reads your ads and files.">
              <Divided>
                <Toggle label="Read PDFs and images (OCR)" hint="When off, PDF and image uploads are skipped with a message. Text and Word files still work." checked={prefs.ocr} onChange={(v) => save({ ocr: v })} />
                <Toggle label="Use Gemini for context checks" hint="Saved only for now: the server still decides based on its API key. Rule checks always run." checked={prefs.useGemini} onChange={(v) => save({ useGemini: v })} />
              </Divided>
              <Slider label="Confidence threshold" min={30} max={95} unit="%" value={prefs.aiConfidence} hint="Saved only for now. Will hide AI findings below this confidence once the pipeline returns numeric scores." onChange={(v) => save({ aiConfidence: v })} />
            </Panel>

            <Panel id="appearance" title="Appearance" desc="Applies across the whole app on this device.">
              <Segmented label="Motion" value={prefs.motion} onChange={(v) => save({ motion: v })} options={[{ value: "full", label: "Full" }, { value: "reduced", label: "Reduced" }, { value: "off", label: "Off" }]} />
              <Segmented label="Density" value={prefs.density} onChange={(v) => save({ density: v })} options={[{ value: "comfortable", label: "Comfortable" }, { value: "compact", label: "Compact" }]} />
              <Slider label="Text size" min={14} max={17} unit="px" value={prefs.textSize} onChange={(v) => save({ textSize: v })} />
              <Divided>
                <Toggle label="Breathing background" hint="The soft moving glow behind every page." checked={prefs.breathing} disabled={prefs.motion !== "full"} onChange={(v) => save({ breathing: v })} />
              </Divided>
            </Panel>

            <Panel id="notifications" title="Notifications" desc="Where you hear about approvals and requested changes.">
              <Divided>
                <Toggle label="In-app" hint="Shows the unread dot on the bell in the header." checked={prefs.notifyInApp} onChange={(v) => save({ notifyInApp: v })} />
                <Toggle label="Email" hint="Coming with Supabase. Nothing is emailed yet." checked={false} disabled onChange={() => {}} />
              </Divided>
              <div className="glass-inset rounded-xl p-4 text-[13px] text-text-secondary">
                <p className="font-medium text-text-primary">Email preview</p>
                <p className="mt-1">Subject: Your ad &ldquo;Q4 Protein Reel&rdquo; needs changes</p>
                <p>{persona.name.split(" ")[0]}, a reviewer left 2 notes. Open AdSnitch to see them.</p>
              </div>
            </Panel>

            <Panel id="team" title="Team & roles" desc="Pick who you're acting as. This changes what you can approve.">
              <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Current person">
                {PERSONAS.map((p) => {
                  const on = p.id === persona.id;
                  return (
                    <button key={p.id} type="button" role="radio" aria-checked={on} onClick={() => save({ persona: p.id })} className={`cursor-pointer rounded-xl border p-4 text-left transition-colors ${on ? "border-ink bg-ink text-white" : "border-border-default bg-panel hover:bg-panel-hover"} ${focusRing}`}>
                      <span className="flex items-center justify-between text-sm font-semibold">
                        {p.name} {on && <Check className="h-4 w-4" aria-hidden />}
                      </span>
                      <span className={`mt-0.5 block text-xs ${on ? "text-white/80" : "text-text-muted"}`}>{p.label}</span>
                      <span className={`mt-2 block text-[13px] ${on ? "text-white/90" : "text-text-secondary"}`}>{ROLE_HELP[p.role]}</span>
                    </button>
                  );
                })}
              </div>
            </Panel>

            <Panel id="data" title="Data" desc="Everything here lives in this browser. Move it, back it up, or start over.">
              <div className="flex flex-wrap gap-2">
                <button type="button" className={btn} onClick={exportAll}>
                  <Download className="h-4 w-4" aria-hidden /> Export settings
                </button>
                <button type="button" className={btn} onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4" aria-hidden /> Import settings
                </button>
                <button type="button" className={btn} onClick={() => askConfirm("reset")}>
                  <RotateCcw className="h-4 w-4" aria-hidden /> Reset to defaults
                </button>
                <button type="button" className={`${btn} text-status-critical`} onClick={() => askConfirm("clear")}>
                  <Trash2 className="h-4 w-4" aria-hidden /> Clear demo data on this device
                </button>
                <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-label="Settings file" onChange={(e) => { const f = e.target.files?.[0]; if (f) importAll(f); e.target.value = ""; }} />
              </div>
              <p aria-live="polite" className="text-sm text-text-secondary">{ioMsg}</p>
            </Panel>
          </div>
        </div>
      </div>

      <dialog ref={confirmRef} aria-labelledby="cf-t" className="glass-strong m-auto w-[min(26rem,calc(100vw-2rem))] rounded-2xl p-6 backdrop:bg-ink/30 backdrop:backdrop-blur-sm">
        <h2 id="cf-t" className="font-display text-lg font-semibold text-text-primary">
          {confirm === "reset" ? "Reset all settings?" : "Clear demo data?"}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          {confirm === "reset"
            ? "Strictness, AI, appearance and notification settings go back to defaults. Your workspace and person stay."
            : "Removes your custom workspaces, settings and saved session from this browser, then reloads. Ads on the server are not touched."}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={btn} onClick={() => confirmRef.current?.close()} autoFocus>Cancel</button>
          <button type="button" className={`${btn} border-status-critical bg-status-critical text-white hover:bg-status-critical/90`} onClick={doConfirm}>
            {confirm === "reset" ? "Reset" : "Clear and reload"}
          </button>
        </div>
      </dialog>

      <div role="status" aria-live="polite" className={`set-anim fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-200 ${toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}>
        {toast ? (
          <span className="glass-strong inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-text-primary">
            <Check className="h-4 w-4 text-status-success" aria-hidden /> Saved
          </span>
        ) : null}
      </div>
    </AppLayout>
  );
}
