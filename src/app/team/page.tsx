"use client";

import React from "react";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePrefs, setPrefs, PERSONAS, ROLE_HELP, focusRing, type Role } from "@/components/guide/workspace";

const ABILITIES: { label: string; roles: Role[] }[] = [
  { label: "Check an ad and see every flagged line", roles: ["creator", "reviewer", "admin"] },
  { label: "Send an ad for approval", roles: ["creator", "reviewer", "admin"] },
  { label: "Approve an ad written by someone else", roles: ["reviewer", "admin"] },
  { label: "Request changes with a note to the author", roles: ["reviewer", "admin"] },
  { label: "Override a decision, with a written reason", roles: ["admin"] },
  { label: "Approve their own ad", roles: [] },
];

export default function TeamPage() {
  const prefs = usePrefs();

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
          <h2 id="people-h" className="mb-3 text-base font-semibold text-text-primary">People in this demo</h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {PERSONAS.map((p) => {
              const active = p.id === prefs.persona;
              return (
                <li key={p.id} className={`glass flex flex-col rounded-2xl p-5 ${active ? "ring-1 ring-ink/30" : ""}`}>
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full border border-border-default bg-panel text-sm font-semibold text-text-primary">
                      {p.name.split(" ").map((x) => x[0]).join("")}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{p.name}</p>
                      <p className="text-[13px] text-text-muted">{p.label}</p>
                    </div>
                  </div>
                  <p className="mt-3 flex-1 text-[13px] leading-relaxed text-text-secondary">{ROLE_HELP[p.role]}</p>
                  <button
                    type="button"
                    disabled={active}
                    onClick={() => setPrefs({ persona: p.id })}
                    className={`mt-4 h-10 rounded-lg border border-border-default bg-panel text-sm font-medium text-text-primary hover:bg-panel-hover disabled:cursor-default disabled:opacity-60 ${focusRing}`}
                  >
                    {active ? "You are using this person" : `Switch to ${p.name.split(" ")[0]}`}
                  </button>
                </li>
              );
            })}
          </ul>
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

        <p className="text-[13px] text-text-muted">
          Inviting real teammates needs accounts, which arrive with the database move.{" "}
          <Link href="/prototype-notice" className={`rounded text-text-primary underline underline-offset-4 ${focusRing}`}>See what is coming next</Link>
        </p>
      </div>
    </AppLayout>
  );
}
