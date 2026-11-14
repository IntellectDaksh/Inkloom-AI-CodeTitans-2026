"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PERSONAS, ROLE_HELP, setPrefs, focusRing } from "@/components/guide/workspace";

const PURPOSE =
  "AdSnitch checks marketing copy before it goes live: every claim is matched to approved proof, risky lines are explained with a fix, and a person signs off.";

/** Shared shell for login/register: demo has no passwords, you pick a seeded person. */
export function PersonaLogin({ title, intro, next = "/dashboard" }: { title: string; intro: React.ReactNode; next?: string }) {
  const router = useRouter();
  const pick = (id: string) => {
    setPrefs({ persona: id });
    router.push(next);
  };

  return (
    <main className="min-h-dvh bg-canvas px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-xl space-y-8">
        <Link href="/" className={`inline-block rounded text-lg font-semibold tracking-tight text-text-primary ${focusRing}`}>AdSnitch</Link>
        <header>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-primary">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{PURPOSE}</p>
        </header>

        <section aria-labelledby="pick-h" className="glass rounded-2xl p-5 sm:p-6">
          <h2 id="pick-h" className="text-base font-semibold text-text-primary">Pick who you want to be</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-text-muted">{intro}</p>
          <ul className="mt-4 space-y-2">
            {PERSONAS.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => pick(p.id)}
                  className={`group flex w-full items-center gap-3 rounded-xl border border-border-subtle px-4 py-3 text-left transition-colors hover:bg-panel-hover ${focusRing}`}
                >
                  <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-default bg-panel text-sm font-semibold text-text-primary">
                    {p.name.split(" ").map((x) => x[0]).join("")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-text-primary">Continue as {p.name} <span className="font-normal text-text-muted">({p.label})</span></span>
                    <span className="block text-[13px] text-text-secondary">{ROLE_HELP[p.role]}</span>
                  </span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-[13px] text-text-muted">
          Real accounts, passwords and SSO arrive with the database move.{" "}
          <Link href="/prototype-notice" className={`rounded text-text-primary underline underline-offset-4 ${focusRing}`}>What works today</Link>
        </p>
      </div>
    </main>
  );
}
