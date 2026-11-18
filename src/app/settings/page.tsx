"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bell, Bot, Check, Database, Gauge, Palette, Pencil, Upload, Users, Briefcase, Download, RotateCcw, Trash2, Lock, Search, X } from "lucide-react";
import { SecurityPanel } from "@/components/settings/SecurityPanel";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Slider, Toggle, Segmented, Select, Group } from "@/components/settings/controls";
import { ACCENTS } from "@/components/settings/PrefsApplier";
import { LANDING, NOTIF_TYPES } from "@/components/settings/options";
import { fmtDateTime } from "@/components/settings/format";
import {
  DEFAULTS,
  KEY,
  PICKED_KEY,
  ROLE_HELP,
  STRICTNESS_PRESETS,
  focusRing,
  openWorkspacePicker,
  useMe,
  ROLE_LABEL,
  type Accent,
  readPrefs,
  setPrefs,
  usePrefs,
  type Prefs,
  type Strictness,
} from "@/components/guide/workspace";
import { updateWorkspace, useWorkspaces } from "@/lib/workspaces/client";
import { VERDICT, localFlags, verdictFor, BRANDS as CHECK_BRANDS, CHANNELS as CHECK_CHANNELS, type FindingItem } from "@/components/submission/shared";

// keywords feed the settings search, so people find a setting without knowing which tab it's in.
const ALL_SECTIONS = [
  { id: "workspace", label: "Workspace", icon: Briefcase, keywords: "brand start page dashboard sections landing claims sort needs attention", admin: false },
  { id: "review", label: "Review strictness", icon: Gauge, keywords: "score pass block strict disclosure superlative default channel results view issues order low severity", admin: false },
  { id: "ai", label: "AI", icon: Bot, keywords: "language hindi english tone formal confidence ocr pdf image reading", admin: false },
  { id: "appearance", label: "Appearance", icon: Palette, keywords: "accent colour color corners motion density text size font width sidebar background date time clock theme", admin: false },
  { id: "notifications", label: "Notifications", icon: Bell, keywords: "alerts mute sound desktop expiry email", admin: false },
  { id: "security", label: "Security", icon: Lock, keywords: "two-factor 2fa authenticator devices sign out account email", admin: false },
  { id: "team", label: "Team & roles", icon: Users, keywords: "role members permissions", admin: false },
  { id: "data", label: "Data", icon: Database, keywords: "export import backup reset", admin: false },
];


// Prefs each "Reset this section" button restores. Identity/onboarding keys are never reset here.
const SECTION_KEYS: Record<string, (keyof Prefs)[]> = {
  workspace: ["landing", "dashCheck", "dashExpiry", "dashStats", "dashAttention", "dashRecent", "attentionCount", "claimsSort"],
  review: ["strictness", "passScore", "blockBelow", "requireDisclosure", "flagSuperlatives", "flagTimeBound", "defaultBrandId", "defaultChannel", "defaultInput", "resultsView", "issueOrder", "hideLowSeverity", "expandFirstIssue"],
  ai: ["ocr", "showConfidence", "aiLanguage", "aiTone"],
  appearance: ["motion", "density", "textSize", "breathing", "accent", "corners", "backgroundFx", "sidebarCollapsed", "dateFormat", "clock", "font", "pageWidth"],
  notifications: ["notifyInApp", "mutedTypes", "expiryDays", "notifySound", "notifyDesktop"],
};
const pick = (keys: (keyof Prefs)[]) => Object.fromEntries(keys.map((k) => [k, DEFAULTS[k]])) as Partial<Prefs>;

const INDUSTRIES = ["Health & nutrition", "Beauty & skincare", "Software", "Finance", "Food & drink", "Other"];
const CHANNELS = ["Instagram", "TikTok", "LinkedIn", "Landing page", "Product page", "Email", "Ads"];
const EXAMPLE_TEXT = "The best protein you'll ever try. Limited time offer!";
const EXAMPLE_FINDINGS: FindingItem[] = [
  { id: "s1", category: "unsupported_claim", severity: "medium", flaggedText: "x", explanation: "", status: "resolved" },
];
const btn = `inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border-default bg-panel px-4 text-sm font-medium text-text-primary hover:bg-panel-hover ${focusRing}`;
const btnPrimary = `inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-ink bg-ink px-4 text-sm font-medium text-canvas hover:opacity-90 ${focusRing}`;

function Panel({ id, title, desc, onReset, children }: { id: string; title: string; desc: string; onReset?: () => void; children: React.ReactNode }) {
  return (
    <section id={`panel-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} tabIndex={0} className={`glass rounded-2xl p-4 sm:p-6 ${focusRing}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={`${id}-t`} className="font-display text-xl font-semibold tracking-tight text-text-primary">
            {title}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">{desc}</p>
        </div>
        {onReset && (
          <button type="button" onClick={onReset} className={`inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-text-secondary hover:bg-panel-hover hover:text-text-primary ${focusRing}`}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset this section
          </button>
        )}
      </div>
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
  const [query, setQuery] = useState("");
  const [exampleScore, setExampleScore] = useState(76);
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

  // Selected tab lives in ?tab= so refresh and back/forward restore it.
  useEffect(() => {
    const sync = () => {
      // No ?tab= → reopen the section you were last in on this device.
      let t = new URLSearchParams(window.location.search).get("tab");
      if (!t) { try { t = localStorage.getItem("adsnitch:settings-tab"); } catch {} }
      setActive(ALL_SECTIONS.some((s) => s.id === t) ? t! : "workspace");
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const selectTab = (id: string, focus = false) => {
    if (focus) tabRefs.current[id]?.focus();
    if (id === active) return;
    setActive(id);
    try { localStorage.setItem("adsnitch:settings-tab", id); } catch {}
    const url = new URL(window.location.href);
    url.searchParams.set("tab", id);
    window.history.pushState(null, "", url);
  };
  const onTabKey = (e: React.KeyboardEvent) => {
    const i = shown.findIndex((s) => s.id === active);
    const n = shown.length;
    const to = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: n - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    selectTab(shown[(to + n) % n].id, true);
  };

  const current = workspaces.find((w) => w.name === prefs.brand) ?? workspaces[0];
  const [edit, setEdit] = useState(false);
  const [wsName, setWsName] = useState("");
  const [wsIndustry, setWsIndustry] = useState(INDUSTRIES[0]);
  const [wsChannels, setWsChannels] = useState<string[]>([]);
  const [wsErr, setWsErr] = useState<string | null>(null);
  const [wsSaving, setWsSaving] = useState(false);
  const startEdit = () => {
    if (!current) return;
    setWsName(current.name);
    setWsIndustry(current.industry);
    setWsChannels(current.channels);
    setWsErr(null);
    setEdit(true);
  };
  const saveWs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || wsSaving) return;
    if (!wsChannels.length) return setWsErr("Pick at least one channel.");
    setWsSaving(true);
    const res = await updateWorkspace(current.id, { name: wsName, industry: wsIndustry, channels: wsChannels });
    setWsSaving(false);
    if (!res.ok) return setWsErr(res.error);
    if (res.workspace.name !== prefs.brand) setPrefs({ brand: res.workspace.name });
    setEdit(false);
    setToast((n) => n + 1);
  };

  const setStrictness = (s: Strictness) => save({ strictness: s, ...STRICTNESS_PRESETS[s] });
  const exampleVerdict = verdictFor(exampleScore, EXAMPLE_FINDINGS, EXAMPLE_TEXT, prefs);
  const exampleFlags = localFlags(EXAMPLE_TEXT, prefs);
  const me = useMe();
  const SECTIONS = ALL_SECTIONS.filter((x) => !x.admin || me?.role === "admin");
  const q = query.trim().toLowerCase();
  const shown = q ? SECTIONS.filter((x) => `${x.label} ${x.keywords}`.toLowerCase().includes(q)) : SECTIONS;
  const resetSection = (id: string) => save(pick(SECTION_KEYS[id]));
  const [deskMsg, setDeskMsg] = useState<string | null>(null);
  const setDesktop = async (on: boolean) => {
    if (!on) return save({ notifyDesktop: false });
    if (typeof Notification === "undefined") return setDeskMsg("This browser doesn't support desktop notifications.");
    const perm = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    if (perm !== "granted") return setDeskMsg("Notifications are blocked for this site. Allow them in your browser's site settings, then try again.");
    setDeskMsg(null);
    save({ notifyDesktop: true });
  };
  const toggleMuted = (t: string, show: boolean) =>
    save({ mutedTypes: show ? prefs.mutedTypes.filter((x) => x !== t) : [...new Set([...prefs.mutedTypes, t])] });

  const exportAll = () => {
    const blob = new Blob([JSON.stringify({ app: "adsnitch", version: 1, prefs: readPrefs() }, null, 2)], { type: "application/json" });
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
      for (const [k, v] of Object.entries(data.prefs)) {
        if (!(k in DEFAULTS)) continue;
        const d = DEFAULTS[k as keyof Prefs];
        if (Array.isArray(d) ? Array.isArray(v) && v.every((x) => typeof x === "string") : typeof v === typeof d && !Array.isArray(v)) patch[k] = v;
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
        [KEY, "adsnitch:pending-upload", "inkloom:session", "inkloom:sidebar-collapsed"].forEach((k) => localStorage.removeItem(k));
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
            Changes save as soon as you make them. They follow your account to any device.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[200px_1fr] lg:gap-8">
          <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && shown[0]) { selectTab(shown[0].id); setQuery(""); } if (e.key === "Escape") setQuery(""); }}
                placeholder="Search settings…"
                aria-label="Search settings"
                className={`h-10 w-full rounded-lg border border-border-default bg-panel pl-9 pr-8 text-sm text-text-primary placeholder:text-text-muted ${focusRing}`}
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className={`absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-text-muted hover:bg-panel-hover ${focusRing}`}>
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              )}
            </div>
            {q && <p className="px-1 pb-2 text-[13px] text-text-muted" aria-live="polite">{shown.length === 0 ? "No setting matches that." : `${shown.length} section${shown.length === 1 ? "" : "s"} match`}</p>}
            <div role="tablist" aria-label="Settings sections" aria-orientation="vertical" onKeyDown={onTabKey} className="flex gap-1 lg:sticky lg:top-24 lg:flex-col">
              {shown.map(({ id, label, icon: Icon }) => {
                const on = active === id;
                return (
                  <button
                    key={id}
                    ref={(el) => { tabRefs.current[id] = el; }}
                    id={`tab-${id}`}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls={`panel-${id}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => selectTab(id)}
                    className={`flex shrink-0 cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      on ? "bg-ink font-medium text-white" : "text-text-secondary hover:bg-panel-hover hover:text-text-primary"
                    } ${focusRing}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden /> {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div key={active} className="settings-anim min-w-0 space-y-6">
            {active === "workspace" && (
            <Panel id="workspace" title="Workspace" desc="The brand you're reviewing ads for, and how your start page is laid out." onReset={() => resetSection("workspace")}>
              {!current ? (
                <p className="text-sm text-text-muted">Loading workspace…</p>
              ) : !edit ? (
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
                    <button type="button" className={btnPrimary} onClick={openWorkspacePicker}>
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
                    <button type="submit" disabled={wsSaving} className={`${btnPrimary} disabled:opacity-60`}>{wsSaving ? "Saving…" : "Save workspace"}</button>
                    <button type="button" className={btn} onClick={() => setEdit(false)}>Cancel</button>
                  </div>
                </form>
              )}
              {current && !current.custom && <p className="text-[13px] text-text-muted">Built-in workspaces can&apos;t be edited. Create your own from Switch workspace.</p>}
              <Group title="Start page">
                <Divided>
                  <Select label="After signing in, open" hint="Used when you sign in with email and password." value={prefs.landing} options={LANDING} onChange={(v) => save({ landing: v })} />
                </Divided>
              </Group>
              <Group title="Dashboard sections">
                <Divided>
                  <Toggle label="Check an ad" hint="The quick paste-or-drop box at the top." checked={prefs.dashCheck} onChange={(v) => save({ dashCheck: v })} />
                  <Toggle label="Claim expiry banner" hint="Warns when approved claims are about to expire." checked={prefs.dashExpiry} onChange={(v) => save({ dashExpiry: v })} />
                  <Toggle label="Summary numbers" checked={prefs.dashStats} onChange={(v) => save({ dashStats: v })} />
                  <Toggle label="Needs attention" checked={prefs.dashAttention} onChange={(v) => save({ dashAttention: v })} />
                  <Toggle label="Recent activity" checked={prefs.dashRecent} onChange={(v) => save({ dashRecent: v })} />
                </Divided>
                <Segmented label="Items in Needs attention" value={String(prefs.attentionCount)} onChange={(v) => save({ attentionCount: Number(v) })} options={[{ value: "3", label: "3" }, { value: "5", label: "5" }, { value: "10", label: "10" }]} />
              </Group>
              <Group title="Lists">
                <Divided>
                  <Select label="Sort claims by" value={prefs.claimsSort} options={[{ value: "expiry", label: "Expiry date" }, { value: "updated", label: "Last updated" }]} onChange={(v) => save({ claimsSort: v })} />
                </Divided>
              </Group>
            </Panel>
            )}

            {active === "review" && (
            <Panel id="review" title="Review strictness" desc="Decides when an ad counts as safe, needs changes, or is blocked, plus defaults for new checks and result pages." onReset={() => resetSection("review")}>
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
                  <Slider label="Pass score" min={50} max={95} value={prefs.passScore} hint="Ads scoring at or above this, with no open issues, pass the automated check." onChange={(v) => save({ passScore: Math.max(v, prefs.blockBelow + 1) })} />
                  <Slider label="Block below" min={20} max={60} value={prefs.blockBelow} hint="Ads scoring under this are blocked outright." onChange={(v) => save({ blockBelow: Math.min(v, prefs.passScore - 1) })} />
                  <Divided>
                    <Toggle label="Require a disclosure tag" hint="Ads without #ad or #sponsored need changes." checked={prefs.requireDisclosure} onChange={(v) => save({ requireDisclosure: v })} />
                    <Toggle label="Flag superlatives" hint={'Words like "best" or "guaranteed" need changes.'} checked={prefs.flagSuperlatives} onChange={(v) => save({ flagSuperlatives: v })} />
                    <Toggle label="Flag time-bound claims" hint={'Phrases like "limited time" or "today only" need changes.'} checked={prefs.flagTimeBound} onChange={(v) => save({ flagTimeBound: v })} />
                  </Divided>
                </div>
                <aside aria-live="polite" className="glass-inset h-fit space-y-4 rounded-xl p-4 xl:sticky xl:top-24">
                  <p className="text-sm font-semibold text-text-primary">Example result</p>
                  <p className="text-[13px] italic text-text-secondary">&ldquo;{EXAMPLE_TEXT}&rdquo;</p>
                  <Slider label="Example score" min={0} max={100} value={exampleScore} onChange={setExampleScore} />
                  <div>
                    <p className={`text-lg font-semibold ${VERDICT[exampleVerdict].tone}`}>{VERDICT[exampleVerdict].title}</p>
                    <ul className="mt-1 space-y-0.5 text-[13px] text-text-muted">
                      {exampleFlags.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                      {!exampleFlags.length && <li>Passes at {prefs.passScore}+, blocked below {prefs.blockBelow}.</li>}
                    </ul>
                  </div>
                </aside>
              </div>
              <Group title="New checks start with">
                <Divided>
                  <Select label="Brand" value={prefs.defaultBrandId} options={CHECK_BRANDS.map((b) => ({ value: b.id as string, label: b.name as string }))} onChange={(v) => save({ defaultBrandId: v })} />
                  <Select label="Channel" value={prefs.defaultChannel} options={CHECK_CHANNELS.map((c) => ({ value: c.id as string, label: c.id as string }))} onChange={(v) => save({ defaultChannel: v })} />
                </Divided>
                <Segmented label="Add the ad by" value={prefs.defaultInput} onChange={(v) => save({ defaultInput: v })} options={[{ value: "paste", label: "Pasting text" }, { value: "upload", label: "Uploading files" }]} />
              </Group>
              <Group title="Result page">
                <div className="space-y-6 pt-1">
                  <Segmented label="Open the copy as" value={prefs.resultsView} onChange={(v) => save({ resultsView: v })} options={[{ value: "annotated", label: "Highlighted issues" }, { value: "diff", label: "Before / after" }]} />
                  <Segmented label="Order issues by" value={prefs.issueOrder} onChange={(v) => save({ issueOrder: v })} options={[{ value: "severity", label: "Severity" }, { value: "text", label: "Position in text" }]} />
                </div>
                <Divided>
                  <Toggle label="Hide low-severity issues" hint="Hides low and info issues from the list. They still count toward the score and verdict." checked={prefs.hideLowSeverity} onChange={(v) => save({ hideLowSeverity: v })} />
                  <Toggle label="Open the first issue automatically" checked={prefs.expandFirstIssue} onChange={(v) => save({ expandFirstIssue: v })} />
                </Divided>
              </Group>
            </Panel>
            )}

            {active === "ai" && (
            <Panel id="ai" title="AI" desc="How the assistant reads your ads and files." onReset={() => resetSection("ai")}>
              <Divided>
                <Toggle label="Show AI confidence on issues" hint="Shows how sure the model was in each issue's details. Doesn't change what gets flagged." checked={prefs.showConfidence} onChange={(v) => save({ showConfidence: v })} />
                <Select label="Explanation language" hint="Language for issue explanations and suggested fixes. Your ad is always checked in its own language, and the rules are the same." value={prefs.aiLanguage} options={[{ value: "en", label: "English" }, { value: "hi", label: "Hindi" }]} onChange={(v) => save({ aiLanguage: v })} />
                <Select label="Explanation style" hint="Plain is short and direct. Formal reads like a compliance memo. Strictness doesn't change." value={prefs.aiTone} options={[{ value: "plain", label: "Plain" }, { value: "formal", label: "Formal" }]} onChange={(v) => save({ aiTone: v })} />
                <Toggle label="Read PDFs and images (OCR)" hint="When off, PDF and image uploads are skipped with a message. Text and Word files still work." checked={prefs.ocr} onChange={(v) => save({ ocr: v })} />
              </Divided>
            </Panel>
            )}

            {active === "appearance" && (
            <Panel id="appearance" title="Appearance" desc="Applies across the whole app, on every device you sign in on." onReset={() => resetSection("appearance")}>
              <div aria-label="Live preview" className="rounded-2xl border border-border-subtle bg-canvas p-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">Live preview</p>
                <div className="mt-3 rounded-xl border border-border-subtle bg-panel p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-[15px] font-semibold text-text-primary">Q4 protein reel</p>
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white" style={{ background: "var(--color-blue)" }}>Needs review</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    Our formula gives you <mark className="rounded px-1" style={{ background: "color-mix(in srgb, var(--color-blue) 18%, transparent)", color: "inherit" }}>2x faster results</mark> after every workout.
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[12px] text-text-muted">
                    <span>Checked {fmtDateTime(new Date())}</span>
                    <span className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-white" style={{ background: "var(--color-blue)" }}>Apply fix</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-primary" id="accent-l">Accent colour</p>
                <div role="radiogroup" aria-labelledby="accent-l" className="flex flex-wrap gap-2">
                  {(Object.keys(ACCENTS) as Accent[]).map((a) => {
                    const on = prefs.accent === a;
                    return (
                      <button key={a} type="button" role="radio" aria-checked={on} onClick={() => save({ accent: a })} className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm transition-colors ${on ? "border-ink bg-panel-elevated font-medium text-text-primary" : "border-border-default bg-panel text-text-secondary hover:text-text-primary"} ${focusRing}`}>
                        <span className="h-4 w-4 rounded-full" style={{ background: ACCENTS[a].color }} aria-hidden /> {ACCENTS[a].label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Segmented label="Corners" value={prefs.corners} onChange={(v) => save({ corners: v })} options={[{ value: "rounded", label: "Rounded" }, { value: "sharp", label: "Sharp" }]} />
              <Segmented label="Motion" value={prefs.motion} onChange={(v) => save({ motion: v })} options={[{ value: "full", label: "Full" }, { value: "reduced", label: "Reduced" }, { value: "off", label: "Off" }]} />
              <Segmented label="Density" value={prefs.density} onChange={(v) => save({ density: v })} options={[{ value: "comfortable", label: "Comfortable" }, { value: "compact", label: "Compact" }]} />
              <Slider label="Text size" min={14} max={17} unit="px" value={prefs.textSize} onChange={(v) => save({ textSize: v })} />
              <Segmented label="Font" value={prefs.font} onChange={(v) => save({ font: v })} options={[{ value: "inter", label: "Inter" }, { value: "grotesk", label: "Grotesk" }, { value: "system", label: "System" }]} />
              <Segmented label="Page width" value={prefs.pageWidth} onChange={(v) => save({ pageWidth: v })} options={[{ value: "standard", label: "Standard" }, { value: "wide", label: "Wide" }]} />
              <Divided>
                <Toggle label="Background effects" hint="The glow and floating shapes behind every page. Off is calmer and lighter on battery." checked={prefs.backgroundFx} onChange={(v) => save({ backgroundFx: v })} />
                <Toggle label="Breathing background" hint={!prefs.backgroundFx ? "Turn Background effects on to use this." : prefs.motion === "full" ? "Lets the background glow slowly move." : "Turn Motion back to Full to use this."} checked={prefs.breathing} disabled={prefs.motion !== "full" || !prefs.backgroundFx} onChange={(v) => save({ breathing: v })} />
                <Toggle label="Collapse the sidebar" hint="Icons only, on wider screens. The sidebar's own toggle changes this too." checked={prefs.sidebarCollapsed} onChange={(v) => save({ sidebarCollapsed: v })} />
              </Divided>
              <Group title="Dates and times">
                <Divided>
                  <Select label="Date format" value={prefs.dateFormat} options={[{ value: "auto", label: "Browser default" }, { value: "dmy", label: "31/12/2026" }, { value: "mdy", label: "12/31/2026" }, { value: "iso", label: "2026-12-31" }]} onChange={(v) => save({ dateFormat: v })} />
                </Divided>
                <Segmented label="Clock" value={prefs.clock} onChange={(v) => save({ clock: v })} options={[{ value: "12", label: "12-hour" }, { value: "24", label: "24-hour" }]} />
                <p className="text-[13px] text-text-muted">Example: {fmtDateTime(new Date())}</p>
              </Group>
            </Panel>
            )}

            {active === "notifications" && (
            <Panel id="notifications" title="Notifications" desc="How you hear about approvals and requested changes." onReset={() => resetSection("notifications")}>
              <Divided>
                <Toggle label="Unread dot" hint="Shows the unread dot on the bell in the header." checked={prefs.notifyInApp} onChange={(v) => save({ notifyInApp: v })} />
                <Toggle label="Sound" hint="A short chime when new notifications arrive while you use the app." checked={prefs.notifySound} onChange={(v) => save({ notifySound: v })} />
                <Toggle label="Desktop notifications" hint="Shows new notifications from this browser while AdSnitch is open. Your browser asks for permission first." checked={prefs.notifyDesktop} onChange={setDesktop} />
              </Divided>
              {deskMsg && <p role="alert" className="text-[13px] text-status-critical">{deskMsg}</p>}
              <Group title="Show these types">
                <Divided>
                  {NOTIF_TYPES.map((t) => (
                    <Toggle key={t.value} label={t.label} checked={!prefs.mutedTypes.includes(t.value)} onChange={(v) => toggleMuted(t.value, v)} />
                  ))}
                </Divided>
              </Group>
              <Segmented label="Warn about claims expiring within" value={String(prefs.expiryDays)} onChange={(v) => save({ expiryDays: Number(v) })} options={[{ value: "7", label: "7 days" }, { value: "14", label: "14 days" }, { value: "30", label: "30 days" }, { value: "60", label: "60 days" }]} />
            </Panel>
            )}

            {active === "team" && (
            <Panel id="team" title="Team & roles" desc="Your role decides what you can approve.">
              {me ? (
                <div className="rounded-xl border border-border-default bg-panel p-4">
                  <span className="flex items-center justify-between gap-3 text-sm font-semibold text-text-primary">
                    {me.name} <span className="text-xs font-medium text-text-muted">{ROLE_LABEL[me.role]}</span>
                  </span>
                  <span className="mt-2 block text-[13px] text-text-secondary">{ROLE_HELP[me.role]}</span>
                </div>
              ) : (
                <p className="text-sm text-text-muted">Loading your account…</p>
              )}
              <p className="text-[13px] text-text-muted">
                Roles are set by an admin on <Link href="/team" className={`rounded underline underline-offset-4 ${focusRing}`}>Team</Link>.
              </p>
            </Panel>
            )}

            {active === "security" && (
            <Panel id="security" title="Security" desc="Two-factor sign-in and the devices you're signed in on. Forgot your password? Use Forgot password on the sign-in page.">
              <SecurityPanel />
            </Panel>
            )}

            {active === "data" && (
            <Panel id="data" title="Data" desc="Settings are saved to your account. Back them up, move them, or start over.">
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
                  <Trash2 className="h-4 w-4" aria-hidden /> Clear local data on this device
                </button>
                <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-label="Settings file" onChange={(e) => { const f = e.target.files?.[0]; if (f) importAll(f); e.target.value = ""; }} />
              </div>
              <p aria-live="polite" className="text-sm text-text-secondary">{ioMsg}</p>
            </Panel>
            )}
          </div>
        </div>
      </div>

      <dialog ref={confirmRef} aria-labelledby="cf-t" className="glass-strong m-auto w-[min(26rem,calc(100vw-2rem))] rounded-2xl p-6 backdrop:bg-ink/30 backdrop:backdrop-blur-sm">
        <h2 id="cf-t" className="font-display text-lg font-semibold text-text-primary">
          {confirm === "reset" ? "Reset all settings?" : "Clear local data?"}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          {confirm === "reset"
            ? "Every section goes back to defaults. Your workspace and onboarding progress stay."
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
