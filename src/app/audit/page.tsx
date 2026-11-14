"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RotateCcw, ShieldCheck, ShieldAlert } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { focusRing } from "@/components/guide/workspace";

interface AuditRow {
  id: string;
  action: string;
  actor: string;
  role: string | null;
  entityType: string;
  entityId: string;
  href: string | null;
  reason: string | null;
  time: string;
  hash: string | null;
}

interface Verification {
  intact: boolean;
  checked: number;
  unsealed: number;
  brokenAt?: { id: string; action: string; created_at: string; reason: string };
}

const humanize = (s: string) => s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
const fmt = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};
const input = `h-9 rounded-lg border border-border-default bg-panel px-2 text-[13px] text-text-primary ${focusRing}`;

export default function AuditPage() {
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [q, setQ] = useState("");
  const [action, setAction] = useState("");
  const [role, setRole] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<Verification | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoadError(false);
    fetch("/api/audit")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setRows(d.events ?? []))
      .catch(() => setLoadError(true));
  }, []);
  useEffect(() => load(), [load]);

  const verify = async () => {
    setVerifying(true);
    setVerifyError(null);
    try {
      const r = await fetch("/api/audit?verify=1");
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.success) throw new Error(d.error || "Verification failed.");
      setResult(d.verification);
    } catch (e) {
      setVerifyError((e as Error).message);
    } finally {
      setVerifying(false);
    }
  };

  const actions = useMemo(() => [...new Set((rows ?? []).map((r) => r.action))].sort(), [rows]);
  const roles = useMemo(() => [...new Set((rows ?? []).map((r) => r.role).filter(Boolean) as string[])].sort(), [rows]);
  const list = (rows ?? []).filter((r) => {
    if (action && r.action !== action) return false;
    if (role && r.role !== role) return false;
    if (q) {
      const hay = `${r.actor} ${r.action} ${r.entityType} ${r.entityId} ${r.reason ?? ""} ${r.hash ?? ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <AppLayout title="Audit log">
      <div className="mx-auto max-w-5xl space-y-6 pb-20">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-primary">Audit log</h1>
            <p className="mt-1 max-w-[62ch] text-sm text-text-secondary">
              Every check, edit, decision and override. Each event is sealed with a SHA-256 hash of the event before it, so editing history breaks the chain.
            </p>
          </div>
          <Button onClick={verify} loading={verifying} icon={<ShieldCheck className="h-4 w-4" />}>
            Verify chain
          </Button>
        </header>

        {(result || verifyError) && (
          <div
            role={verifyError || !result?.intact ? "alert" : "status"}
            className={`flex items-start gap-2 rounded-xl border p-4 text-sm ${
              verifyError || !result?.intact ? "border-status-critical/30 bg-status-critical/10 text-status-critical" : "border-border-default bg-panel text-text-primary"
            }`}
          >
            {verifyError ? (
              <span>{verifyError}</span>
            ) : result!.intact ? (
              <>
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-status-success" aria-hidden />
                <span>
                  Chain intact. {result!.checked} sealed event{result!.checked === 1 ? "" : "s"} recomputed on the server and matched.
                  {result!.unsealed > 0 && ` ${result!.unsealed} older seed event${result!.unsealed === 1 ? " was" : "s were"} written before hashing and ${result!.unsealed === 1 ? "is" : "are"} not sealed.`}
                </span>
              </>
            ) : (
              <>
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  Chain broken at {humanize(result!.brokenAt!.action)} on {fmt(result!.brokenAt!.created_at)} (event {result!.brokenAt!.id.slice(0, 8)}): {result!.brokenAt!.reason}.
                  {" "}{result!.checked} event{result!.checked === 1 ? "" : "s"} before it verified.
                </span>
              </>
            )}
          </div>
        )}

        <div className="glass flex flex-col gap-2 rounded-xl p-3 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="audit-q">Search</label>
          <input id="audit-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search actor, entity, reason or hash" className={`${input} flex-1`} />
          <label className="sr-only" htmlFor="audit-action">Action</label>
          <select id="audit-action" value={action} onChange={(e) => setAction(e.target.value)} className={input}>
            <option value="">All actions</option>
            {actions.map((a) => <option key={a} value={a}>{humanize(a)}</option>)}
          </select>
          <label className="sr-only" htmlFor="audit-role">Role</label>
          <select id="audit-role" value={role} onChange={(e) => setRole(e.target.value)} className={input}>
            <option value="">All roles</option>
            {roles.map((r) => <option key={r} value={r}>{humanize(r)}</option>)}
          </select>
        </div>

        {loadError ? (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-sm font-medium text-text-primary">Could not load the audit log.</p>
            <Button size="sm" variant="secondary" className="mt-3" icon={<RotateCcw className="h-4 w-4" />} onClick={load}>Try again</Button>
          </div>
        ) : rows === null ? (
          <div className="glass h-64 animate-pulse rounded-xl" aria-busy="true" />
        ) : list.length === 0 ? (
          <div className="glass rounded-xl p-10 text-center text-sm text-text-secondary">No events match these filters.</div>
        ) : (
          <div className="glass overflow-x-auto rounded-xl">
            <table className="w-full min-w-[760px] text-left text-[13px]">
              <caption className="sr-only">Audit events, newest first</caption>
              <thead className="border-b border-border-default text-xs text-text-muted">
                <tr>
                  {["Time", "Actor", "Action", "Entity", "Hash"].map((h) => (
                    <th key={h} scope="col" className="px-4 py-2.5 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id} className={`border-b border-border-default last:border-0 ${result?.brokenAt?.id === r.id ? "bg-status-critical/10" : ""}`}>
                    <td className="whitespace-nowrap px-4 py-2.5 align-top text-text-secondary">
                      <time dateTime={r.time}>{fmt(r.time)}</time>
                    </td>
                    <td className="px-4 py-2.5 align-top">
                      <span className="text-text-primary">{r.actor}</span>
                      {r.role && <span className="block text-xs text-text-muted">{humanize(r.role)}</span>}
                    </td>
                    <td className="px-4 py-2.5 align-top">
                      <span className="font-medium text-text-primary">{humanize(r.action)}</span>
                      {r.reason && <span className="block max-w-[34ch] text-xs text-text-secondary">{r.reason}</span>}
                    </td>
                    <td className="px-4 py-2.5 align-top">
                      {r.href ? (
                        <Link href={r.href} className={`rounded text-text-primary underline underline-offset-2 hover:no-underline ${focusRing}`}>
                          {humanize(r.entityType)} {r.entityId.slice(0, 8)}
                        </Link>
                      ) : (
                        <span className="text-text-secondary">{humanize(r.entityType)} {r.entityId.slice(0, 8)}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 align-top font-mono text-[12px] text-text-muted" title={r.hash ?? undefined}>
                      {r.hash ? `${r.hash.slice(0, 12)}…` : <span className="font-sans">Not sealed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
