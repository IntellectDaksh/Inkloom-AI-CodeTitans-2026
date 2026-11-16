"use client";

import React, { useState } from "react";
import { focusRing } from "@/components/guide/workspace";
import { supabaseBrowser } from "@/lib/auth/client";

/** Step-up to aal2 after password sign-in. proxy.ts sends users here when they have a verified factor. */
export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const sb = supabaseBrowser();
    const { data } = await sb.auth.mfa.listFactors();
    const factor = data?.totp.find((f) => f.status === "verified");
    if (!factor) return window.location.assign("/dashboard");
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: factor.id, code: code.trim() });
    if (error) {
      setBusy(false);
      return setError("That code did not match. Try the newest one in your app.");
    }
    const next = new URLSearchParams(window.location.search).get("next") ?? "";
    window.location.assign(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
  };

  const signOut = async () => {
    await supabaseBrowser().auth.signOut();
    window.location.assign("/auth/login");
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-border-subtle bg-panel p-6">
        <h1 className="text-xl font-semibold text-text-primary">Enter your code</h1>
        <p className="mt-1 text-sm text-text-secondary">Open your authenticator app and type the 6-digit code for AdSnitch.</p>
        <label className="mt-4 block text-sm text-text-primary">
          Code
          <input
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            className={`mt-1 h-11 w-full rounded-lg border border-border-default bg-canvas px-3 text-lg tracking-widest text-text-primary ${focusRing}`}
          />
        </label>
        {error && <p role="alert" className="mt-3 text-[13px] text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className={`mt-4 h-10 w-full rounded-lg bg-ink text-sm font-medium text-canvas hover:opacity-90 disabled:opacity-50 ${focusRing}`}>
          {busy ? "Checking…" : "Verify"}
        </button>
        <button type="button" onClick={signOut} className={`mt-2 h-10 w-full rounded-lg text-sm text-text-secondary hover:text-text-primary ${focusRing}`}>
          Sign out
        </button>
      </form>
    </main>
  );
}
