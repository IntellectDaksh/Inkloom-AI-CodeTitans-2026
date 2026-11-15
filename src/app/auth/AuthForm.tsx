"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/auth/client";
import { safeNext } from "@/lib/auth/next";
import { focusRing } from "@/components/guide/workspace";

type Mode = "login" | "register" | "forgot" | "reset";

const COPY: Record<Mode, { title: string; cta: string }> = {
  login: { title: "Sign in", cta: "Sign in" },
  register: { title: "Create your account", cta: "Create account" },
  forgot: { title: "Reset your password", cta: "Send code" },
  reset: { title: "Choose a new password", cta: "Save password" },
};

const PURPOSE =
  "AdSnitch checks marketing copy before it goes live: every claim is matched to approved proof, risky lines are explained with a fix, and a person signs off.";

const input = `h-11 w-full rounded-lg border border-border-default bg-panel px-3 text-sm text-text-primary placeholder:text-text-muted ${focusRing}`;

export function AuthForm({ mode, next: rawNext, error: initialError }: { mode: Mode; next?: string; error?: string }) {
  const router = useRouter();
  const next = safeNext(rawNext, mode === "register" ? "/onboarding" : "/dashboard");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError === "link" ? "That link has expired or was already used. Try again." : null);
  const [info, setInfo] = useState<string | null>(null);

  const callback = (to: string) => `${window.location.origin}/auth/callback?next=${encodeURIComponent(to)}`;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    setBusy(true);
    setError(null);
    setInfo(null);
    const sb = supabaseBrowser();
    try {
      if (mode === "login") {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(next);
        router.refresh();
      } else if (mode === "register") {
        const name = String(f.get("name") ?? "").trim();
        if (password.length < 8) throw new Error("Use at least 8 characters for your password.");
        const { data, error } = await sb.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: callback(next) } });
        if (error) throw error;
        if (data.session) {
          router.replace(next);
          router.refresh();
        } else setInfo(`Check ${email} for a confirmation link to finish signing up.`);
      } else {
        if (password.length < 8) throw new Error("Use at least 8 characters for your password.");
        if (password !== String(f.get("confirm") ?? "")) throw new Error("The two passwords don’t match.");
        const { error } = await sb.auth.updateUser({ password });
        if (error) throw error;
        router.replace("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError((err as Error).message || "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    const { error } = await supabaseBrowser().auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback(next) } });
    if (error) setError(error.message);
  }

  const c = COPY[mode];
  const social = mode === "login" || mode === "register";
  return (
    <main className="min-h-dvh bg-canvas px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-md space-y-8">
        <Link href="/" className={`inline-block rounded text-lg font-semibold tracking-tight text-text-primary ${focusRing}`}>AdSnitch</Link>
        <header>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-primary">{c.title}</h1>
          {social && <p className="mt-2 text-sm leading-relaxed text-text-secondary">{PURPOSE}</p>}
        </header>

        <section className="glass space-y-4 rounded-2xl p-5 sm:p-6">
          {social && (
            <>
              <button type="button" onClick={google} className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border-default bg-panel text-sm font-medium text-text-primary hover:bg-panel-hover ${focusRing}`}>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z" /></svg>
                Continue with Google
              </button>
              <p className="text-center text-xs text-text-muted">or with email</p>
            </>
          )}
          {mode === "forgot" ? <ForgotFlow /> : (
          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <label className="block text-sm text-text-primary">Full name
                <input name="name" autoComplete="name" required maxLength={80} className={`mt-1 ${input}`} />
              </label>
            )}
            {mode !== "reset" && (
              <label className="block text-sm text-text-primary">Email
                <input name="email" type="email" autoComplete="email" required spellCheck={false} className={`mt-1 ${input}`} />
              </label>
            )}
            <label className="block text-sm text-text-primary">{mode === "reset" ? "New password" : "Password"}
              <input name="password" type="password" required minLength={mode === "login" ? undefined : 8} autoComplete={mode === "login" ? "current-password" : "new-password"} className={`mt-1 ${input}`} />
            </label>
            {mode === "reset" && (
              <label className="block text-sm text-text-primary">Confirm password
                <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={`mt-1 ${input}`} />
              </label>
            )}
            {error && <p role="alert" className="text-[13px] text-status-red">{error}</p>}
            {info && <p role="status" className="text-[13px] text-text-secondary">{info}</p>}
            <button type="submit" disabled={busy} className={`h-11 w-full rounded-lg bg-ink text-sm font-medium text-canvas hover:opacity-90 disabled:opacity-60 ${focusRing}`}>
              {busy ? "Working…" : c.cta}
            </button>
          </form>
          )}
        </section>

        <p className="text-[13px] text-text-muted">
          {mode === "login" && <>New here? <A href={`/auth/register${rawNext ? `?next=${encodeURIComponent(rawNext)}` : ""}`}>Create an account</A> · <A href="/auth/forgot">Forgot password?</A></>}
          {mode === "register" && <>Already have an account? <A href="/auth/login">Sign in</A></>}
          {(mode === "forgot" || mode === "reset") && <A href="/auth/login">Back to sign in</A>}
        </p>
      </div>
    </main>
  );
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className={`rounded text-text-primary underline underline-offset-4 ${focusRing}`}>{children}</Link>;
}

const primaryBtn = `h-11 w-full rounded-lg bg-ink text-sm font-medium text-canvas hover:opacity-90 disabled:opacity-60 ${focusRing}`;
const RESEND_SECONDS = 60;

/** Email -> 6-digit recovery code -> new password. The emailed link still works via /auth/callback -> /auth/reset. */
function ForgotFlow() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function send(addr: string) {
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(addr, {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth/reset")}`,
    });
    // Only rate limits are surfaced; other errors stay silent so unknown emails look identical (no enumeration).
    if (error && (error.status === 429 || /rate|seconds/i.test(error.message))) throw new Error("Too many requests. Wait a minute and try again.");
    setCooldown(RESEND_SECONDS);
  }

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await fn();
    } catch (err) {
      setError((err as Error).message || "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const addr = email.trim();
    run(async () => {
      await send(addr);
      setEmail(addr);
      setStep("code");
    });
  };

  const resend = () =>
    run(async () => {
      await send(email);
      setInfo("A new code is on its way.");
    });

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return setError("Enter the 6-digit code from the email.");
    run(async () => {
      const { error } = await supabaseBrowser().auth.verifyOtp({ email, token: code, type: "recovery" });
      if (error) throw new Error("That code is wrong or has expired. Check the latest email or resend.");
      setStep("password");
    });
  };

  const submitPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password") ?? "");
    if (password.length < 8) return setError("Use at least 8 characters for your password.");
    if (password !== String(f.get("confirm") ?? "")) return setError("The two passwords don’t match.");
    run(async () => {
      const { error } = await supabaseBrowser().auth.updateUser({ password });
      if (error) throw error;
      router.replace("/dashboard");
      router.refresh();
    });
  };

  const feedback = (
    <>
      {error && <p role="alert" className="text-[13px] text-status-red">{error}</p>}
      {info && <p role="status" className="text-[13px] text-text-secondary">{info}</p>}
    </>
  );

  if (step === "email")
    return (
      <form onSubmit={submitEmail} className="space-y-3">
        <p className="text-sm text-text-secondary">Enter your account email. We’ll send a 6-digit code.</p>
        <label className="block text-sm text-text-primary">Email
          <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required spellCheck={false} autoFocus className={`mt-1 ${input}`} />
        </label>
        {feedback}
        <button type="submit" disabled={busy} className={primaryBtn}>{busy ? "Sending…" : "Send code"}</button>
      </form>
    );

  if (step === "code")
    return (
      <form onSubmit={submitCode} className="space-y-3">
        <p className="text-sm text-text-secondary">
          If an account exists for <strong className="font-medium text-text-primary">{email}</strong>, a 6-digit code is on its way. The email also has a link you can use instead.
        </p>
        <label className="block text-sm text-text-primary">Code
          <input
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            autoFocus
            className={`mt-1 ${input} tracking-[0.4em]`}
          />
        </label>
        {feedback}
        <button type="submit" disabled={busy || code.length !== 6} className={primaryBtn}>{busy ? "Checking…" : "Verify code"}</button>
        <div className="flex items-center justify-between text-[13px]">
          <button type="button" onClick={() => { setStep("email"); setCode(""); setError(null); setInfo(null); }} className={`rounded text-text-secondary underline underline-offset-4 ${focusRing}`}>
            Use a different email
          </button>
          <button type="button" onClick={resend} disabled={busy || cooldown > 0} className={`rounded text-text-primary underline underline-offset-4 disabled:text-text-muted disabled:no-underline ${focusRing}`}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </div>
      </form>
    );

  return (
    <form onSubmit={submitPassword} className="space-y-3">
      <p className="text-sm text-text-secondary">Code accepted. Choose a new password.</p>
      <label className="block text-sm text-text-primary">New password
        <input name="password" type="password" required minLength={8} autoComplete="new-password" autoFocus className={`mt-1 ${input}`} />
      </label>
      <label className="block text-sm text-text-primary">Confirm password
        <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={`mt-1 ${input}`} />
      </label>
      {feedback}
      <button type="submit" disabled={busy} className={primaryBtn}>{busy ? "Saving…" : "Save password"}</button>
    </form>
  );
}
