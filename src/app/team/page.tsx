"use client";

import React, { useEffect, useState } from "react";
import { Check, Minus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar } from "@/components/layout/Header";
import { refreshMe, ROLE_HELP, ROLE_LABEL, focusRing, type Role } from "@/components/guide/workspace";

interface Member { id: string; email: string | null; full_name: string; bio: string; avatar_url: string | null; role: Role; job_title: string; created_at: string; lastSignInAt: string | null; checksRun: number; approvalsGiven: number }
interface Invite { email: string; role: Role; created_at: string; invitedByName: string | null }
interface AuditRow { id: string; action: string; metadata: Record<string, unknown>; created_at: string; actorName: string; targetName: string }
interface TeamData { me: { id: string; role: Role }; organization: { id: string; name: string }; members: Member[]; invites: Invite[]; audit: AuditRow[] }

const ROLES: Role[] = ["admin", "brand_manager", "reviewer", "creator"];
const TABLE_ROLES: Role[] = ["creator", "reviewer", "brand_manager", "admin"];
const ABILITIES: { label: string; roles: Role[] }[] = [
  { label: "Check an ad and see every flagged line", roles: ["creator", "reviewer", "brand_manager", "admin"] },
  { label: "Send an ad for approval", roles: ["creator", "reviewer", "brand_manager", "admin"] },
  { label: "Approve an ad written by someone else", roles: ["reviewer", "brand_manager", "admin"] },
  { label: "Request changes with a note to the author", roles: ["reviewer", "brand_manager", "admin"] },
  { label: "Override a single flagged issue, with a reason", roles: ["brand_manager", "admin"] },
  { label: "Override a decision, with a written reason", roles: ["admin"] },
  { label: "Approve their own ad", roles: [] },
];
const inputCls = `h-10 rounded-lg border border-border-default px-3 text-sm text-text-primary ${focusRing}`;
const inputStyle = { backgroundColor: "var(--color-canvas-elevated)", color: "var(--color-ink)" };
const btn = `h-9 rounded-lg border border-border-default bg-panel px-3 text-[13px] font-medium text-text-primary hover:bg-panel-hover disabled:opacity-60 ${focusRing}`;

function ago(iso: string | null) {
  if (!iso) return "Never signed in";
  const m = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (m < 2) return "Active just now";
  if (m < 60) return `Active ${m} min ago`;
  if (m < 48 * 60) return `Active ${Math.round(m / 60)} h ago`;
  return `Active ${Math.round(m / 1440)} days ago`;
}
const AUDIT_TEXT: Record<string, (a: AuditRow) => string> = {
  role_changed: (a) => `changed ${a.targetName} from ${ROLE_LABEL[a.metadata.from as Role] ?? a.metadata.from} to ${ROLE_LABEL[a.metadata.to as Role] ?? a.metadata.to}`,
  member_removed: (a) => `removed ${a.targetName}`,
  member_left: () => "left the organisation",
  member_invited: (a) => `invited ${a.targetName} as ${ROLE_LABEL[a.metadata.role as Role] ?? a.metadata.role}`,
  invite_revoked: (a) => `revoked the invite for ${a.targetName}`,
  invite_resent: (a) => `resent the invite to ${a.targetName}`,
  org_renamed: (a) => `renamed the organisation to ${String(a.metadata.name)}`,
};

export default function TeamPage() {
  const [data, setData] = useState<TeamData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [roleF, setRoleF] = useState<"" | Role>("");
  const [pendingRole, setPendingRole] = useState<{ m: Member; role: Role } | null>(null);
  const [orgName, setOrgName] = useState("");

  const load = () =>
    fetch("/api/team", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (d.success) { setData(d); setOrgName(d.organization.name); } else setError(d.error); })
      .catch(() => setError("Could not load the team. Try again."));
  useEffect(() => { load(); }, []);

  const call = async (key: string, url: string, body: object, ok: string, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return false;
    setBusy(key); setError(null); setNotice(null);
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!d.success) { setError(d.error); return false; }
      setNotice(ok);
      await load();
      return true;
    } catch {
      setError("Something went wrong. Try again.");
      return false;
    } finally {
      setBusy(null);
    }
  };

  const isAdmin = data?.me.role === "admin";
  const members = data?.members ?? [];
  const admins = members.filter((m) => m.role === "admin").length;
  const shown = members.filter((m) => (!roleF || m.role === roleF) && (!q || `${m.full_name} ${m.email ?? ""} ${m.job_title}`.toLowerCase().includes(q.toLowerCase())));

  const [invEmail, setInvEmail] = useState("");
  const [invRole, setInvRole] = useState<Role>("creator");
  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await call("invite", "/api/team/invite", { email: invEmail, role: invRole }, `Invite sent to ${invEmail}.`)) setInvEmail("");
  };

  return (
    <AppLayout title="Team">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-primary">Team{data ? ` · ${data.organization.name}` : ""}</h1>
            <p className="mt-1.5 text-sm text-text-secondary">Who writes ads and who signs them off. Splitting the two means no ad goes live on one person&rsquo;s say-so.</p>
          </div>
          {data && <p className="text-[13px] text-text-muted"><span className="font-semibold tabular-nums text-text-primary">{members.length}</span> seat{members.length === 1 ? "" : "s"} used{data.invites.length ? `, ${data.invites.length} invite${data.invites.length === 1 ? "" : "s"} pending` : ""} · {admins} admin{admins === 1 ? "" : "s"}</p>}
        </header>

        <div aria-live="polite">
          {error && <p role="alert" className="text-[13px] text-status-red">{error}</p>}
          {notice && <p role="status" className="text-[13px] text-status-success">{notice}</p>}
        </div>

        <section aria-labelledby="people-h">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <h2 id="people-h" className="text-base font-semibold text-text-primary">People</h2>
            <div className="flex flex-wrap gap-2">
              <label className="sr-only" htmlFor="m-q">Search members</label>
              <input id="m-q" type="search" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} className={`${inputCls} h-9 w-56`} style={inputStyle} />
              <label className="sr-only" htmlFor="m-role">Filter by role</label>
              <select id="m-role" value={roleF} onChange={(e) => setRoleF(e.target.value as Role | "")} className={`${inputCls} h-9`} style={inputStyle}>
                <option value="">All roles</option>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
            </div>
          </div>
          {!data ? (
            <p className="text-[13px] text-text-muted">{error ? "" : "Loading…"}</p>
          ) : shown.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-text-muted">No one matches that search.</p>
          ) : (
            <ul className="grid gap-4 md:grid-cols-3">
              {shown.map((p) => {
                const you = p.id === data.me.id;
                return (
                  <li key={p.id} className={`glass flex flex-col rounded-2xl p-5 ${you ? "ring-1 ring-ink/30" : ""}`}>
                    <div className="flex items-center gap-3">
                      <Avatar name={p.full_name || p.email || "?"} url={p.avatar_url} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">{p.full_name || p.email}{you && <span className="font-normal text-text-muted"> (you)</span>}</p>
                        <p className="truncate text-[13px] text-text-muted">{ROLE_LABEL[p.role]}{p.job_title ? ` · ${p.job_title}` : ""}</p>
                        {p.email && <p className="truncate text-[12px] text-text-muted">{p.email}</p>}
                      </div>
                    </div>
                    <p className="mt-3 flex-1 text-[13px] leading-relaxed text-text-secondary">{p.bio || ROLE_HELP[p.role]}</p>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
                      <div><dt className="text-text-muted">Checks run</dt><dd className="font-semibold tabular-nums text-text-primary">{p.checksRun}</dd></div>
                      <div><dt className="text-text-muted">Approvals given</dt><dd className="font-semibold tabular-nums text-text-primary">{p.approvalsGiven}</dd></div>
                    </dl>
                    <p className="mt-2 text-[12px] text-text-muted">{ago(p.lastSignInAt)}</p>
                    {isAdmin && (
                      <div className="mt-4 space-y-2">
                        <label className="block text-[13px] text-text-muted">Role
                          <select value={p.role} disabled={busy === p.id || (you && admins <= 1)}
                            onChange={(e) => setPendingRole({ m: p, role: e.target.value as Role })}
                            className={`mt-1 w-full ${inputCls} disabled:opacity-60`} style={inputStyle}>
                            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                          </select>
                        </label>
                        {pendingRole?.m.id === p.id && (
                          <div role="group" aria-label="Confirm role change" className="rounded-lg border border-border-default p-3 text-[13px]">
                            <p className="text-text-primary">Change {p.full_name || p.email} from {ROLE_LABEL[p.role]} to {ROLE_LABEL[pendingRole.role]}?</p>
                            <p className="mt-1 text-text-muted">{ROLE_HELP[pendingRole.role]}</p>
                            <div className="mt-2 flex gap-2">
                              <button className={btn} disabled={busy === p.id} onClick={async () => {
                                const ok = await call(p.id, "/api/profile/role", { userId: p.id, role: pendingRole.role }, `${p.full_name || p.email} is now ${ROLE_LABEL[pendingRole.role]}.`);
                                setPendingRole(null);
                                if (ok && you) await refreshMe();
                              }}>Confirm</button>
                              <button className={btn} onClick={() => setPendingRole(null)}>Cancel</button>
                            </div>
                          </div>
                        )}
                        {!you && (
                          <button className={`${btn} w-full text-status-red`} disabled={busy === `rm-${p.id}` || (p.role === "admin" && admins <= 1)}
                            onClick={() => call(`rm-${p.id}`, "/api/team", { action: "remove", userId: p.id }, `${p.full_name || p.email} was removed.`,
                              `Remove ${p.full_name || p.email} from ${data.organization.name}? They keep their login but move to their own empty workspace. Their past checks stay here.`)}>
                            Remove from organisation
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {data && !isAdmin && <p className="mt-3 text-[13px] text-text-muted">Only admins can change roles. Admins invite people and pick their role.</p>}
        </section>

        {isAdmin && data && (
          <section aria-labelledby="inv-list-h" className="glass rounded-2xl p-5 sm:p-6">
            <h2 id="inv-list-h" className="text-base font-semibold text-text-primary">Invite a teammate</h2>
            <p className="mt-1 text-[13px] text-text-muted">They get an email, set a password, and land in this workspace with the role you pick.</p>
            <form onSubmit={invite} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="inv-email">Email</label>
              <input id="inv-email" type="email" required autoComplete="off" spellCheck={false} placeholder="name@company.com" value={invEmail} onChange={(e) => setInvEmail(e.target.value)} className={`${inputCls} flex-1`} style={inputStyle} />
              <label className="sr-only" htmlFor="inv-role">Role</label>
              <select id="inv-role" value={invRole} onChange={(e) => setInvRole(e.target.value as Role)} className={inputCls} style={inputStyle}>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
              <button type="submit" disabled={busy === "invite"} className={`h-10 rounded-lg bg-ink px-4 text-sm font-medium text-canvas disabled:opacity-60 ${focusRing}`}>{busy === "invite" ? "Sending…" : "Send invite"}</button>
            </form>
            <h3 className="mt-6 text-sm font-semibold text-text-primary">Pending invites</h3>
            {data.invites.length === 0 ? <p className="mt-2 text-[13px] text-text-muted">No pending invites.</p> : (
              <ul className="mt-2 divide-y divide-border-subtle">
                {data.invites.map((v) => (
                  <li key={v.email} className="flex flex-wrap items-center gap-3 py-2.5 text-[13px]">
                    <span className="min-w-0 flex-1 truncate text-text-primary">{v.email}</span>
                    <span className="text-text-muted">{ROLE_LABEL[v.role]} · sent {new Date(v.created_at).toLocaleDateString()}{v.invitedByName ? ` by ${v.invitedByName}` : ""}</span>
                    <button className={btn} disabled={busy === `rs-${v.email}`} onClick={() => call(`rs-${v.email}`, "/api/team", { action: "resend", email: v.email }, `Invite resent to ${v.email}.`)}>Resend</button>
                    <button className={`${btn} text-status-red`} disabled={busy === `rv-${v.email}`} onClick={() => call(`rv-${v.email}`, "/api/team", { action: "revoke", email: v.email }, `Invite for ${v.email} revoked.`, `Revoke the invite for ${v.email}? The link in their email will no longer add them here.`)}>Revoke</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        {data && !isAdmin && <p className="text-[13px] text-text-muted">To add a teammate, ask an admin to invite them from this page.</p>}

        <section aria-labelledby="roles-h" className="glass overflow-x-auto rounded-2xl p-5 sm:p-6">
          <h2 id="roles-h" className="text-base font-semibold text-text-primary">What each role can do</h2>
          <p className="mt-1 text-[13px] text-text-muted">Approvals checks these rules: if your role cannot take an action, it tells you why.</p>
          <table className="mt-4 w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-[13px] text-text-muted">
                <th scope="col" className="py-2 pr-4 font-normal">Action</th>
                {TABLE_ROLES.map((r) => <th key={r} scope="col" className="px-2 py-2 text-center font-normal">{ROLE_LABEL[r]}</th>)}
              </tr>
            </thead>
            <tbody>
              {ABILITIES.map((a) => (
                <tr key={a.label} className="border-b border-border-subtle last:border-0">
                  <th scope="row" className="py-3 pr-4 font-normal text-text-primary">{a.label}</th>
                  {TABLE_ROLES.map((r) => (
                    <td key={r} className="px-2 py-3 text-center">
                      {a.roles.includes(r) ? <Check className="mx-auto h-4 w-4 text-status-success" aria-label="Yes" /> : <Minus className="mx-auto h-4 w-4 text-text-muted" aria-label="No" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {data && data.audit.length > 0 && (
          <section aria-labelledby="audit-h" className="glass rounded-2xl p-5 sm:p-6">
            <h2 id="audit-h" className="text-base font-semibold text-text-primary">Team changes</h2>
            <ul className="mt-3 space-y-1.5 text-[13px]">
              {data.audit.map((a) => (
                <li key={a.id} className="flex flex-wrap justify-between gap-2">
                  <span className="text-text-primary">{a.actorName} {(AUDIT_TEXT[a.action] ?? (() => a.action.replace(/_/g, " ")))(a)}</span>
                  <time dateTime={a.created_at} className="text-text-muted">{new Date(a.created_at).toLocaleString()}</time>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data && (
          <section aria-labelledby="org-h" className="glass rounded-2xl p-5 sm:p-6">
            <h2 id="org-h" className="text-base font-semibold text-text-primary">Organisation</h2>
            {isAdmin ? (
              <form className="mt-3 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => { e.preventDefault(); call("rename", "/api/team", { action: "rename", name: orgName }, "Organisation renamed."); }}>
                <label className="sr-only" htmlFor="org-name">Organisation name</label>
                <input id="org-name" required maxLength={80} value={orgName} onChange={(e) => setOrgName(e.target.value)} className={`${inputCls} flex-1`} style={inputStyle} />
                <button type="submit" className={btn} disabled={busy === "rename" || orgName.trim() === data.organization.name}>Save name</button>
              </form>
            ) : <p className="mt-2 text-[13px] text-text-secondary">{data.organization.name}</p>}
            {members.length > 1 && <div className="mt-5 border-t border-border-subtle pt-4">
              <button className={`${btn} text-status-red`} disabled={busy === "leave" || (isAdmin && admins <= 1)}
                onClick={async () => {
                  if (await call("leave", "/api/team", { action: "leave" }, "You left the organisation.", `Leave ${data.organization.name}? You'll move to your own empty workspace and lose access to this team's ads.`)) {
                    await refreshMe();
                    window.location.href = "/dashboard";
                  }
                }}>Leave organisation</button>
              {isAdmin && admins <= 1 && <p className="mt-2 text-[12px] text-text-muted">You&rsquo;re the only admin. Make someone else an admin before leaving.</p>}
            </div>}
          </section>
        )}
      </div>
    </AppLayout>
  );
}
