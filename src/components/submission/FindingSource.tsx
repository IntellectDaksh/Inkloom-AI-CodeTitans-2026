import React from "react";
import Link from "next/link";
import { BadgeCheck, Database, ExternalLink } from "lucide-react";
import { FindingItem, claimHref, evidenceOf, ruleSourceOf } from "./shared";

const a = "inline-flex items-center gap-1 font-medium text-text-primary underline underline-offset-2 hover:no-underline";

/** Proof a finding was checked against: library record, regulation, brand rule, or an explicit "none". */
export function FindingSource({ f }: { f: FindingItem }) {
  const s = f.source;
  const ev = evidenceOf(f);
  const rule = ruleSourceOf(f);
  const excerpt = s?.excerpt || ev?.excerpt;

  return (
    <section className="space-y-2 rounded-lg border border-border-default bg-panel-elevated p-3 text-[13px]">
      <h4 className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
        <Database className="h-3.5 w-3.5" aria-hidden /> Source
      </h4>

      {s ? (
        <>
          <p className="text-sm font-medium text-text-primary">
            {s.title}
            {s.demo && <span className="ml-2 rounded border border-border-default px-1.5 py-0.5 text-[11px] font-normal text-text-muted">Demo record</span>}
          </p>
          <p className="text-text-muted">
            {s.type} · {s.claimCode}
            {s.date ? ` · updated ${s.date}` : ""}
          </p>
          {excerpt && <blockquote className="border-l-2 border-border-strong pl-3 italic leading-relaxed text-text-primary">“{excerpt}”</blockquote>}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {s.url && (
              <a href={s.url} target="_blank" rel="noopener noreferrer" className={a}>
                Open source <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            )}
            <Link href={claimHref(s.claimCode)} className={a}>
              View approved claim
            </Link>
          </div>
          <Verified by={s.verifiedBy} at={s.verifiedAt} href={claimHref(s.claimCode)} />
        </>
      ) : ev ? (
        <>
          <blockquote className="border-l-2 border-border-strong pl-3 italic leading-relaxed text-text-primary">“{ev.excerpt}”</blockquote>
          {ev.citation && (
            <Link href={claimHref(ev.citation)} className={a}>
              {ev.citation}
            </Link>
          )}
          <Verified />
        </>
      ) : null}

      {rule ? (
        <p className="text-text-secondary">
          Rule:{" "}
          {rule.external ? (
            <a href={rule.href} target="_blank" rel="noopener noreferrer" className={a}>
              {rule.label} <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          ) : (
            <Link href={rule.href} className={a}>
              {rule.label}
            </Link>
          )}
        </p>
      ) : (
        !s && !ev && <p className="text-text-secondary">No source on file — not found in the approved library.</p>
      )}
    </section>
  );
}

/** "Verified" only with a name, a date and a link to the evidence; anything less reads as Unverified. */
export function Verified({ by, at, href }: { by?: string; at?: string; href?: string }) {
  if (!by || !at || !href) return <p className="text-text-muted">Unverified</p>;
  return (
    <p className="flex flex-wrap items-center gap-1 text-text-secondary">
      <BadgeCheck className="h-3.5 w-3.5 text-status-success" aria-hidden /> Verified by {by} on {at} ·{" "}
      <Link href={href} className={a}>
        see evidence
      </Link>
    </p>
  );
}
