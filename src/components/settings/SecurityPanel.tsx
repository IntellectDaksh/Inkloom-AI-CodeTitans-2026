"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { Factor, User } from "@supabase/supabase-js";
import { focusRing } from "@/components/guide/workspace";
import { fmtDateTime } from "@/components/settings/format";
import { supabaseBrowser } from "@/lib/auth/client";

const card = "rounded-xl border border-border-subtle bg-panel p-5 sm:p-6";
const input = `h-10 w-full rounded-lg border border-border-default bg-canvas px-3 text-sm text-text-primary ${focusRing}`;
const primary = `inline-flex h-10 items-center rounded-lg bg-ink px-4 text-sm font-medium text-canvas hover:opacity-90 disabled:opacity-50 ${focusRing}`;
const secondary = `inline-flex h-10 items-center rounded-lg border border-border-default px-4 text-sm font-medium text-text-primary hover:bg-panel-hover disabled:opacity-50 ${focusRing}`;

type Note = { ok: boolean; text: string } | null;

function Msg({ m }: { m: Note }) {
  if (!m) return null;
  return (
    <p role={m.ok ? "status" : "alert"} className={`mt-3 text-[13px] ${m.ok ? "text-text-secondary" : "text-red-600"}`}>
      {m.text}
    </p>
  );
}

function CodeInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <label className="block text-sm text-text-primary">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        required
        className={`${input} mt-1 max-w-40`}
      />
    </label>
  );
}

export function SecurityPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [factors, setFactors] = useState<Factor[]>([]);

  const load = useCallback(async () => {
    const sb = supabaseBrowser();
    const [{ data: u }, { data: f }] = await Promise.all([sb.auth.getUser(), sb.auth.mfa.listFactors()]);
    setUser(u.user);
    setFactors(f?.all.filter((x) => x.factor_type === "totp") ?? []);
  }, []);
  useEffect(() => {
    let alive = true;
    const sb = supabaseBrowser();
    Promise.all([sb.auth.getUser(), sb.auth.mfa.listFactors()]).then(([{ data: u }, { data: f }]) => {
      if (!alive) return;
      setUser(u.user);
      setFactors(f?.all.filter((x) => x.factor_type === "totp") ?? []);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <div className="space-y-5">

        <section className={card} aria-labelledby="acct">
          <h2 id="acct" className="text-base font-semibold text-text-primary">Account</h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
            <div className="min-w-0">
              <dt className="text-text-muted">Email</dt>
              <dd className="truncate text-text-primary">{user?.email ?? "…"}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Email confirmed</dt>
              <dd className="text-text-primary">{user ? (user.email_confirmed_at ? `Yes, ${fmtDateTime(user.email_confirmed_at)}` : "Not yet") : "…"}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Last sign-in</dt>
              <dd className="text-text-primary">{user?.last_sign_in_at ? fmtDateTime(user.last_sign_in_at) : "…"}</dd>
            </div>
          </dl>
        </section>

        <TwoFactor factors={factors} reload={load} />
        <OtherDevices />
      </div>
    </>
  );
}

function TwoFactor({ factors, reload }: { factors: Factor[]; reload: () => Promise<void> }) {
  const verified = factors.find((f) => f.status === "verified");
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Note>(null);

  const start = async () => {
    const sb = supabaseBrowser();
    setBusy(true);
    setMsg(null);
    // Drop abandoned unverified factors first so they don't pile up.
    for (const f of factors.filter((f) => f.status !== "verified")) await sb.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: `Authenticator ${Date.now()}` });
    setBusy(false);
    if (error || !data) return setMsg({ ok: false, text: error?.message ?? "Could not start setup." });
    setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enroll) return;
    setBusy(true);
    const { error } = await supabaseBrowser().auth.mfa.challengeAndVerify({ factorId: enroll.id, code: code.trim() });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: "That code did not match. Check the time on your phone and try again." });
    setEnroll(null);
    setCode("");
    setMsg({ ok: true, text: "Two-factor sign-in is on." });
    await reload();
  };

  const cancel = async () => {
    if (enroll) await supabaseBrowser().auth.mfa.unenroll({ factorId: enroll.id });
    setEnroll(null);
    setCode("");
    await reload();
  };

  const remove = async () => {
    if (!verified || !window.confirm("Turn off two-factor sign-in? Your password alone will be enough to sign in.")) return;
    const sb = supabaseBrowser();
    setBusy(true);
    const { error } = await sb.auth.mfa.unenroll({ factorId: verified.id });
    if (!error) await sb.auth.refreshSession();
    setBusy(false);
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Two-factor sign-in is off." });
    await reload();
  };

  return (
    <section className={card} aria-labelledby="mfa">
      <h2 id="mfa" className="text-base font-semibold text-text-primary">Two-factor sign-in</h2>
      <p className="mt-1 text-sm text-text-secondary">
        {verified
          ? `On since ${fmtDateTime(verified.created_at)}. You will be asked for a code from your authenticator app when you sign in.`
          : "Off. Add an authenticator app (1Password, Google Authenticator, Authy) so a password alone cannot get into your account."}
      </p>
      {!enroll && (
        <div className="mt-4">
          {verified ? (
            <button type="button" onClick={remove} disabled={busy} className={secondary}>Turn off</button>
          ) : (
            <button type="button" onClick={start} disabled={busy} className={primary}>{busy ? "Starting…" : "Set up authenticator"}</button>
          )}
        </div>
      )}
      {enroll && (
        <form onSubmit={verify} className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enroll.qr} alt="QR code to scan with your authenticator app" width={176} height={176} className="shrink-0 rounded-lg bg-white p-2" />
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-sm text-text-secondary">Scan the code, or type this key into the app:</p>
            <code className="block break-all rounded-lg bg-panel-hover px-3 py-2 text-xs text-text-primary">{enroll.secret}</code>
            <CodeInput label="6-digit code" value={code} onChange={setCode} />
            <div className="flex gap-2">
              <button type="submit" disabled={busy} className={primary}>{busy ? "Checking…" : "Turn on"}</button>
              <button type="button" onClick={cancel} className={secondary}>Cancel</button>
            </div>
          </div>
        </form>
      )}
      <Msg m={msg} />
    </section>
  );
}

function OtherDevices() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Note>(null);
  const run = async () => {
    setBusy(true);
    const { error } = await supabaseBrowser().auth.signOut({ scope: "others" });
    setBusy(false);
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Signed out everywhere else. This device stays signed in." });
  };
  return (
    <section className={card} aria-labelledby="dev">
      <h2 id="dev" className="text-base font-semibold text-text-primary">Other devices</h2>
      <p className="mt-1 text-sm text-text-secondary">Ends every session except this one. Use it after signing in on a shared computer or if you lost a device.</p>
      <button type="button" onClick={run} disabled={busy} className={`${secondary} mt-4`}>{busy ? "Signing out…" : "Sign out of all other devices"}</button>
      <Msg m={msg} />
    </section>
  );
}
