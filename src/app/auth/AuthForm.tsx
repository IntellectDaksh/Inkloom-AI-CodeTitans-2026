"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/auth/client";
import { safeNext } from "@/lib/auth/next";
import { focusRing, readPrefs, refreshMe } from "@/components/guide/workspace";
import { LANDING_PAGES } from "@/components/settings/options";
import { AuthBackdrop } from "@/components/auth/AuthBackdrop";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { LogoMark } from "@/components/landing/LogoMark";

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
  const next = safeNext(rawNext, mode === "register" ? "/welcome?next=/dashboard" : "/dashboard");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError === "link" ? "That link has expired or was already used. Try again." : null);
  const [info, setInfo] = useState<string | null>(null);

  const callback = (to: string) => `${window.location.origin}/auth/callback?next=${encodeURIComponent(to)}`;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim().toLowerCase();
    const password = String(f.get("password") ?? "");
    setBusy(true);
    setError(null);
    setInfo(null);
    const sb = supabaseBrowser();
    try {
      if (mode === "login") {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (!error) { try { localStorage.setItem("adsnitch:last-email", email); } catch {} }
        if (error) throw error;
        // No explicit ?next: go to the account's chosen start page (Settings > Workspace).
        let to = next;
        if (!rawNext) {
          await refreshMe();
          const l = readPrefs().landing;
          if (LANDING_PAGES.includes(l)) to = l;
        }
        router.replace(to);
        router.refresh();
      } else if (mode === "register") {
        const name = String(f.get("name") ?? "").trim();
        const company = String(f.get("company") ?? "").trim();
        if (!f.get("terms")) throw new Error("Agree to the Terms to create an account.");
        if (password.length < 8) throw new Error("Use at least 8 characters for your password.");
        const { data, error } = await sb.auth.signUp({ email, password, options: { data: { full_name: name, company, terms_accepted_at: new Date().toISOString() }, emailRedirectTo: callback(next) } });
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
      setError(friendlyAuthError((err as Error).message));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    const { error } = await supabaseBrowser().auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback(next) } });
    if (error) setError(error.message);
  }

  // Prefill the last email used on this device (after hydration, so server and client HTML match).
  useEffect(() => {
    if (mode !== "login") return;
    const el = document.querySelector<HTMLInputElement>('form input[name="email"]');
    const last = lastEmail();
    if (el && !el.value && last) el.value = last;
  }, [mode]);

  const c = COPY[mode];
  const social = mode === "login" || mode === "register";
  return (
    <main className="relative min-h-dvh overflow-hidden px-4 py-10 sm:py-16">
      <AuthBackdrop />
      <FeedbackButton />
      <div className="relative z-10 mx-auto max-w-md space-y-6">
        <Link href="/" className={`inline-flex items-center gap-2 rounded text-lg font-semibold tracking-tight text-white drop-shadow-sm ${focusRing}`}>
          <LogoMark size={26} className="text-white" /> AdSnitch
        </Link>
        <div className="space-y-6 rounded-3xl border border-white/60 bg-white/75 p-6 shadow-[0_30px_80px_-20px_rgba(16,45,64,0.45)] backdrop-blur-2xl sm:p-8">
        <header>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-primary">{c.title}</h1>
          {social && <p className="mt-2 text-sm leading-relaxed text-text-secondary">{PURPOSE}</p>}
        </header>

        <section className="space-y-4">
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
            {mode === "register" && (
              <label className="block text-sm text-text-primary">Company or brand
                <input name="company" autoComplete="organization" required maxLength={80} className={`mt-1 ${input}`} />
              </label>
            )}
            {mode !== "reset" && (
              <label className="block text-sm text-text-primary">Email
                <input name="email" type="email" inputMode="email" autoComplete="email" required spellCheck={false} autoCapitalize="none" autoFocus={mode === "login"} className={`mt-1 ${input}`} />
              </label>
            )}
            <label className="block text-sm text-text-primary">{mode === "reset" ? "New password" : "Password"}
              <PasswordField name="password" minLength={mode === "login" ? undefined : 8} autoComplete={mode === "login" ? "current-password" : "new-password"} className={`mt-1 ${input}`} />
            </label>
            {mode === "reset" && (
              <label className="block text-sm text-text-primary">Confirm password
                <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={`mt-1 ${input}`} />
              </label>
            )}
            {mode === "register" && (
              <label className="flex items-start gap-2 text-[13px] leading-snug text-text-secondary">
                <input name="terms" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-ink)]" />
                <span>I agree to the <a href="/terms" target="_blank" className="underline">Terms</a> and <a href="/privacy" target="_blank" className="underline">Privacy Policy</a>, and understand AdSnitch is a review aid, not legal advice.</span>
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
        <p className="text-center text-xs text-white/85 drop-shadow-sm">
          <a href="/terms" className="underline-offset-4 hover:underline">Terms</a> · <a href="/privacy" className="underline-offset-4 hover:underline">Privacy</a>
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
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(v);
              // A full code (typed or pasted) submits on its own.
              const form = e.currentTarget.form;
              if (v.length === 6 && !busy) setTimeout(() => form?.requestSubmit(), 0);
            }}
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

/** Password input with show/hide and a Caps Lock warning. */
function PasswordField({ name, minLength, autoComplete, className }: { name: string; minLength?: number; autoComplete: string; className: string }) {
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => setCaps(e.getModifierState?.("CapsLock") ?? false);
  return (
    <>
      <span className="relative block">
        <input
          name={name}
          type={show ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          onKeyUp={onKey}
          onKeyDown={onKey}
          onBlur={() => setCaps(false)}
          className={`${className} pr-16`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-pressed={show}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 mt-0.5 -translate-y-1/2 rounded-md px-2 py-1 text-[12px] font-medium text-text-secondary hover:bg-panel-hover hover:text-text-primary"
        >
          {show ? "Hide" : "Show"}
        </button>
      </span>
      {caps && <span role="status" className="mt-1 block text-[12px] text-status-red">Caps Lock is on.</span>}
    </>
  );
}

/** Supabase's raw auth messages, rewritten as something a person can act on. */
function friendlyAuthError(msg = ""): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password don't match. Check both, or use Forgot password.";
  if (m.includes("email not confirmed")) return "Confirm your email first. Check your inbox for the link we sent.";
  if (m.includes("already registered") || m.includes("already been registered")) return "An account with this email already exists. Sign in instead.";
  if (m.includes("password should be") || m.includes("weak")) return "Choose a stronger password: at least 8 characters, not a common one.";
  if (m.includes("rate") || m.includes("seconds") || m.includes("too many")) return "Too many attempts. Wait a minute and try again.";
  if (m.includes("network") || m.includes("fetch")) return "Couldn't reach the server. Check your connection and try again.";
  return msg || "Something went wrong. Try again.";
}

/** Email used for the last successful sign-in on this device, to save retyping it. */
function lastEmail(): string | undefined {
  try { return localStorage.getItem("adsnitch:last-email") ?? undefined; } catch { return undefined; }
}
