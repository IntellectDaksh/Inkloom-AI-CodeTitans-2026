"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus } from "lucide-react";
import {
  PICKED_KEY,
  PICKER_EVT,
  addWorkspace,
  focusRing,
  setPrefs,
  usePrefs,
  useWorkspaces,
  useWorkspaceCounts,
  type Workspace,
} from "./workspace";

const INDUSTRIES = ["Health & nutrition", "Beauty & skincare", "Software", "Finance", "Food & drink", "Other"];
const CHANNELS = ["Instagram", "TikTok", "LinkedIn", "Landing page", "Product page", "Email", "Ads"];
const TINTS = ["#4bc7f4", "#7c8cff", "#2fb487", "#f0a24a", "#e5737d", "#8e9cab"];

function tintFor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TINTS[h % TINTS.length];
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Frosted workspace chooser shown over the blurred app when someone enters the
 * dashboard, and on demand from the header. The app keeps loading behind it.
 */
export function WorkspacePicker() {
  const ref = useRef<HTMLDialogElement>(null);
  const prefs = usePrefs();
  const workspaces = useWorkspaces();
  const counts = useWorkspaceCounts();
  const [mode, setMode] = useState<"pick" | "create">("pick");
  const [canClose, setCanClose] = useState(false);

  // Create form state
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [channels, setChannels] = useState<string[]>(["Instagram"]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const open = (closable: boolean) => {
    setMode("pick");
    setError(null);
    setCanClose(closable);
    const d = ref.current;
    if (d && !d.open) d.showModal();
  };

  useEffect(() => {
    const onOpen = () => open(true);
    window.addEventListener(PICKER_EVT, onOpen);
    // First visit to the dashboard in this browser session: ask which workspace.
    let picked = false;
    try {
      picked = sessionStorage.getItem(PICKED_KEY) === "1";
    } catch {}
    const params = new URLSearchParams(window.location.search);
    if ((window.location.pathname === "/dashboard" && !picked) || params.get("workspace") === "pick") {
      const t = window.setTimeout(() => open(false), 250);
      return () => {
        window.clearTimeout(t);
        window.removeEventListener(PICKER_EVT, onOpen);
      };
    }
    return () => window.removeEventListener(PICKER_EVT, onOpen);
  }, []);

  const choose = (ws: string) => {
    setPrefs({ brand: ws });
    try {
      sessionStorage.setItem(PICKED_KEY, "1");
    } catch {}
    // Drop ?workspace=pick so a reload doesn't reopen the chooser.
    const url = new URL(window.location.href);
    if (url.searchParams.get("workspace") === "pick") {
      url.searchParams.delete("workspace");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
    const d = ref.current;
    if (!d) return;
    d.classList.add("ws-leaving");
    window.setTimeout(() => {
      d.classList.remove("ws-leaving");
      d.close();
    }, 220);
  };

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    if (channels.length === 0) {
      setError("Pick at least one channel you publish on.");
      return;
    }
    const res = addWorkspace({ name, industry, channels, description: description.trim() || undefined } as Workspace);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setName("");
    setDescription("");
    choose(res.name);
  };

  const toggleChannel = (c: string) =>
    setChannels((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));

  return (
    <dialog
      ref={ref}
      className="ws-dialog"
      aria-labelledby="ws-title"
      onCancel={(e) => {
        if (!canClose) e.preventDefault();
      }}
      onClick={(e) => {
        if (canClose && e.target === ref.current) ref.current?.close();
      }}
    >
      <div className="ws-panel">
        {mode === "pick" ? (
          <>
            <header className="mb-6">
              <p className="text-[13px] font-medium text-text-muted">AdSnitch</p>
              <h2 id="ws-title" className="mt-1 text-2xl font-semibold tracking-tight text-text-primary">
                Choose a workspace
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Each workspace holds one brand&rsquo;s approved claims, rules and reviews.
              </p>
            </header>

            <ul className="grid gap-3 sm:grid-cols-2" role="list">
              {workspaces.map((w, i) => {
                const active = w.name === prefs.brand;
                return (
                  <li key={w.name} className="ws-item" style={{ animationDelay: `${80 + i * 60}ms` }}>
                    <button
                      onClick={() => choose(w.name)}
                      className={`ws-card group ${active ? "ws-card-active" : ""} ${focusRing}`}
                      aria-current={active ? "true" : undefined}
                    >
                      <span className="ws-avatar" style={{ background: tintFor(w.name) }} aria-hidden="true">
                        {initials(w.name)}
                      </span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[15px] font-semibold text-text-primary">{w.name}</span>
                          {active && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-status-success/15 px-2 py-0.5 text-[11px] font-medium text-status-success">
                              <Check className="h-3 w-3" aria-hidden="true" /> Last used
                            </span>
                          )}
                          {w.custom && !active && (
                            <span className="rounded-full bg-panel-hover px-2 py-0.5 text-[11px] text-text-muted">New</span>
                          )}
                        </span>
                        <span className="mt-0.5 block truncate text-[13px] text-text-muted">
                          {w.industry} · {w.channels.slice(0, 3).join(", ")}
                        </span>
                      </span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                );
              })}
              <li className="ws-item" style={{ animationDelay: `${80 + workspaces.length * 60}ms` }}>
                <button onClick={() => setMode("create")} className={`ws-card ws-card-new group ${focusRing}`}>
                  <span className="ws-avatar ws-avatar-new" aria-hidden="true">
                    <Plus className="h-5 w-5" />
                  </span>
                  <span className="flex-1 text-left">
                    <span className="block text-[15px] font-semibold text-text-primary">Create a new workspace</span>
                    <span className="block text-[13px] text-text-muted">Set up a brand in under a minute</span>
                  </span>
                </button>
              </li>
            </ul>

            {!counts.loading && !counts.error && (
              <p className="mt-5 text-[13px] text-text-muted">
                {counts.submissions} review{counts.submissions === 1 ? "" : "s"} across all workspaces
                {counts.pendingApprovals ? `, ${counts.pendingApprovals} waiting for sign-off` : ""}.
              </p>
            )}
            {canClose && (
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => ref.current?.close()}
                  className={`rounded-lg px-3 py-2 text-sm text-text-muted hover:text-text-primary ${focusRing}`}
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={create} noValidate>
            <button
              type="button"
              onClick={() => {
                setMode("pick");
                setError(null);
              }}
              className={`mb-4 inline-flex items-center gap-1 rounded text-[13px] text-text-muted hover:text-text-primary ${focusRing}`}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to workspaces
            </button>
            <h2 id="ws-title" className="text-2xl font-semibold tracking-tight text-text-primary">
              New workspace
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              You can add claims and brand rules once it&rsquo;s created.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="ws-name" className="text-sm font-medium text-text-primary">
                  Brand name
                </label>
                <input
                  id="ws-name"
                  autoFocus
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. Northwind Foods"
                  autoComplete="organization"
                  className={`mt-1.5 h-11 w-full rounded-xl border border-border-default bg-panel px-3 text-base text-text-primary placeholder:text-text-muted sm:text-sm ${focusRing}`}
                />
              </div>

              <div>
                <label htmlFor="ws-industry" className="text-sm font-medium text-text-primary">
                  Industry
                </label>
                <select
                  id="ws-industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className={`mt-1.5 h-11 w-full rounded-xl border border-border-default bg-panel px-3 text-base text-text-primary sm:text-sm ${focusRing}`}
                >
                  {INDUSTRIES.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
                <p className="mt-1 text-[12px] text-text-muted">Sets which disclosure rules apply by default.</p>
              </div>

              <fieldset>
                <legend className="text-sm font-medium text-text-primary">Where do you publish?</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CHANNELS.map((c) => {
                    const on = channels.includes(c);
                    return (
                      <button
                        type="button"
                        key={c}
                        aria-pressed={on}
                        onClick={() => {
                          toggleChannel(c);
                          setError(null);
                        }}
                        className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${focusRing} ${
                          on
                            ? "border-transparent bg-text-primary text-canvas"
                            : "border-border-default bg-panel text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <label htmlFor="ws-desc" className="text-sm font-medium text-text-primary">
                  What does the brand sell? <span className="font-normal text-text-muted">(optional)</span>
                </label>
                <input
                  id="ws-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Plant-based snacks for kids"
                  className={`mt-1.5 h-11 w-full rounded-xl border border-border-default bg-panel px-3 text-base text-text-primary placeholder:text-text-muted sm:text-sm ${focusRing}`}
                />
              </div>
            </div>

            <p aria-live="polite" className="mt-4 min-h-5 text-[13px] text-status-critical">
              {error}
            </p>

            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="submit"
                className={`inline-flex h-11 items-center gap-2 rounded-xl bg-text-primary px-5 text-sm font-semibold text-canvas transition-transform hover:-translate-y-px ${focusRing}`}
              >
                Create and open <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
