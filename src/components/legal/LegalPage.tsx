import Link from "next/link";
import type { ReactNode } from "react";

export const LEGAL_UPDATED = "16 November 2026";
// ponytail: mailbox must exist on the domain before launch.
export const LEGAL_CONTACT = "legal@adsnitch.cv";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-canvas px-4 py-14 text-text-primary">
      <article className="mx-auto max-w-2xl text-[15px] leading-relaxed text-text-secondary [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-text-primary [&_li]:mt-1.5 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
        <Link href="/" className="text-sm text-text-muted underline-offset-4 hover:underline">AdSnitch</Link>
        <h1 className="mt-6 text-[32px] font-semibold leading-tight tracking-tight text-text-primary">{title}</h1>
        <p className="text-sm text-text-muted">Last updated {LEGAL_UPDATED}</p>
        {children}
        <h2>Contact</h2>
        <p>
          Questions about this page: <a className="underline" href={`mailto:${LEGAL_CONTACT}`}>{LEGAL_CONTACT}</a>.
        </p>
      </article>
    </main>
  );
}
