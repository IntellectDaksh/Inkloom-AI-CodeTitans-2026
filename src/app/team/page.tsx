"use client";

import React, { useEffect, useState } from "react";
import { Check, Minus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar } from "@/components/layout/Header";
import { useMe, refreshMe, ROLE_HELP, ROLE_LABEL, focusRing, type Role } from "@/components/guide/workspace";

interface Profile { id: string; email: string | null; full_name: string; bio: string; avatar_url: string | null; role: Role }
const ROLES: Role[] = ["admin", "brand_manager", "reviewer", "creator"];

const ABILITIES: { label: string; roles: Role[] }[] = [
  { label: "Check an ad and see every flagged line", roles: ["creator", "reviewer", "admin"] },
  { label: "Send an ad for approval", roles: ["creator", "reviewer", "admin"] },
  { label: "Approve an ad written by someone else", roles: ["reviewer", "admin"] },
  { label: "Request changes with a note to the author", roles: ["reviewer", "admin"] },
  { label: "Override a decision, with a written reason", roles: ["admin"] },
  { label: "Approve their own ad", roles: [] },
];

export default function TeamPage() {
  const me = useMe();
  const [people, setPeople] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const load = () =>
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => (d.success ? setPeople(d.profiles) : setError(d.error)))
      .catch(() => setError("Could not load the team. Try again."));
  useEffect(() => {
    load();
  }, []);

  const changeRole = async (userId: string, role: Role) => {
    setSaving(userId);
    setError(null);
    try {
      const r = await fetch("/api/profile/role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, role }) });
      const d = await r.json();
      if (!d.success) setError(d.error);
      await load();
      if (userId === me?.id) await refreshMe();
    } catch {
      setError("Could not change the role. Try again.");
    } finally {
      setSaving(null);
    }
  };

  const isAdmin = me?.role === "admin";

  return (
    <AppLayout title="Team">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-primary">Team</h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            Who writes ads and who signs them off. Splitting the two means no ad goes live on one person&rsquo;s say-so.
          </p>
        </header>

        <section aria-labelledby="people-h">
          <h2 id="people-h" className="mb-3 text-base font-semibold text-text-primary">People</h2>
          {error && <p role="alert" className="mb-3 text-[13px] text-status-red">{error}</p>}
          {people === null ? (
            <p className="text-[13px] text-text-muted">{error ? "" : "Loading…"}</p>
          ) : (
            <ul className="grid gap-4 md:grid-cols-3">
              {people.map((p) => {
                const you = p.id === me?.id;
                return (
                  <li key={p.id} className={`glass flex flex-col rounded-2xl p-5 ${you ? "ring-1 ring-ink/30" : ""}`}>
                    <div className="flex items-center gap-3">
                      <Avatar name={p.full_name || p.email || "?"} url={p.avatar_url} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">{p.full_name || p.email}{you && <span className="font-normal text-text-muted"> (you)</span>}</p>
                        <p className="truncate text-[13px] text-text-muted">{ROLE_LABEL[p.role]}{isAdmin && p.email ? ` · ${p.email}` : ""}</p>
                      </div>
                    </div>
                    <p className="mt-3 flex-1 text-[13px] leading-relaxed text-text-secondary">{p.bio || ROLE_HELP[p.role]}</p>
                    {isAdmin && (
                      <label className="mt-4 block text-[13px] text-text-muted">Role
                        <select
                          value={p.role}
                          disabled={saving === p.id}
                          onChange={(e) => changeRole(p.id, e.target.value as Role)}
                          className={`mt-1 h-10 w-full rounded-lg border border-border-default bg-panel px-3 text-sm text-text-primary disabled:opacity-60 ${focusRing}`}
                          style={{ backgroundColor: "var(--color-canvas-elevated)", color: "var(--color-ink)" }}
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                        </select>
                      </label>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {!isAdmin && people && <p className="mt-3 text-[13px] text-text-muted">Only admins can change roles. New people join as Creators when they sign up.</p>}
        </section>

        <section aria-labelledby="roles-h" className="glass overflow-x-auto rounded-2xl p-5 sm:p-6">
          <h2 id="roles-h" className="text-base font-semibold text-text-primary">What each role can do</h2>
          <p className="mt-1 text-[13px] text-text-muted">Approvals checks these rules: if your role cannot take an action, it tells you why.</p>
          <table className="mt-4 w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-[13px] text-text-muted">
                <th scope="col" className="py-2 pr-4 font-normal">Action</th>
                {(["creator", "reviewer", "admin"] as Role[]).map((r) => (
                  <th key={r} scope="col" className="px-2 py-2 text-center font-normal capitalize">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ABILITIES.map((a) => (
                <tr key={a.label} className="border-b border-border-subtle last:border-0">
                  <th scope="row" className="py-3 pr-4 font-normal text-text-primary">{a.label}</th>
                  {(["creator", "reviewer", "admin"] as Role[]).map((r) => (
                    <td key={r} className="px-2 py-3 text-center">
                      {a.roles.includes(r)
                        ? <Check className="mx-auto h-4 w-4 text-status-success" aria-label="Yes" />
                        : <Minus className="mx-auto h-4 w-4 text-text-muted" aria-label="No" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <p className="text-[13px] text-text-muted">To add a teammate, ask them to create an account. An admin can then set their role here.</p>
      </div>
    </AppLayout>
  );
}
