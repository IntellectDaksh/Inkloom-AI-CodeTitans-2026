"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar } from "@/components/layout/Header";
import { useMe, refreshMe, ROLE_HELP, focusRing } from "@/components/guide/workspace";
import { supabaseBrowser } from "@/lib/auth/client";

const MAX_BYTES = 2 * 1024 * 1024;
const input = `h-11 w-full rounded-lg border border-border-default bg-panel px-3 text-sm text-text-primary ${focusRing}`;
const btn = `inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium disabled:opacity-60 ${focusRing}`;
const primary = `${btn} bg-ink text-canvas hover:opacity-90`;
const secondary = `${btn} border border-border-default bg-panel text-text-primary hover:bg-panel-hover`;

/** Centre-crops an image to a 512px square JPEG. */
async function cropSquare(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  const out = Math.min(512, side);
  const c = document.createElement("canvas");
  c.width = c.height = out;
  c.getContext("2d")!.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, out, out);
  bmp.close();
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("Could not process that image."))), "image/jpeg", 0.9));
}

function Msg({ m }: { m: { ok: boolean; text: string } | null }) {
  if (!m) return null;
  return <p role={m.ok ? "status" : "alert"} className={`text-[13px] ${m.ok ? "text-status-success" : "text-status-red"}`}>{m.text}</p>;
}

export default function ProfilePage() {
  const me = useMe();
  const router = useRouter();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<Record<string, { ok: boolean; text: string } | null>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (me) {
      setName(me.name);
      setBio(me.bio);
    }
  }, [me]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (confirmDelete && !d.open) d.showModal();
    if (!confirmDelete && d.open) d.close();
  }, [confirmDelete]);

  const say = (k: string, ok: boolean, text: string) => setMsg((m) => ({ ...m, [k]: { ok, text } }));

  async function patch(body: object) {
    const r = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!d.success) throw new Error(d.error || "Could not save.");
    await refreshMe();
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy("profile");
    try {
      await patch({ full_name: name, bio });
      say("profile", true, "Saved.");
    } catch (err) {
      say("profile", false, (err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function uploadAvatar(file: File | undefined) {
    if (!file || !me) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return say("avatar", false, "Use a PNG, JPG or WebP image.");
    if (file.size > MAX_BYTES) return say("avatar", false, "That image is over 2 MB. Pick a smaller one.");
    setBusy("avatar");
    try {
      const blob = await cropSquare(file);
      const path = `${me.id}/avatar-${Date.now()}.jpg`;
      const sb = supabaseBrowser();
      const { error } = await sb.storage.from("avatars").upload(path, blob, { contentType: "image/jpeg", upsert: true });
      if (error) throw error;
      const url = sb.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      const old = me.avatarUrl?.split("/avatars/")[1];
      await patch({ avatar_url: url });
      if (old) await sb.storage.from("avatars").remove([old]);
      say("avatar", true, "Photo updated.");
    } catch (err) {
      say("avatar", false, (err as Error).message || "Upload failed.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeAvatar() {
    if (!me?.avatarUrl) return;
    setBusy("avatar");
    try {
      const old = me.avatarUrl.split("/avatars/")[1];
      await patch({ avatar_url: null });
      if (old) await supabaseBrowser().storage.from("avatars").remove([old]);
      say("avatar", true, "Photo removed.");
    } catch (err) {
      say("avatar", false, (err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function changeEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setBusy("email");
    const { error } = await supabaseBrowser().auth.updateUser({ email }, { emailRedirectTo: `${location.origin}/auth/callback?next=/profile` });
    setBusy(null);
    if (error) say("email", false, error.message);
    else say("email", true, `Confirm the change from the link sent to ${email}.`);
  }

  async function signOutEverywhere() {
    setBusy("signout");
    await supabaseBrowser().auth.signOut({ scope: "global" });
    router.replace("/auth/login");
    router.refresh();
  }

  async function deleteAccount() {
    setBusy("delete");
    try {
      const r = await fetch("/api/profile/account", { method: "DELETE" });
      const d = await r.json();
      if (!d.success) throw new Error(d.error || "Could not delete your account.");
      await supabaseBrowser().auth.signOut().catch(() => {});
      router.replace("/");
      router.refresh();
    } catch (err) {
      setConfirmDelete(false);
      say("delete", false, (err as Error).message);
      setBusy(null);
    }
  }

  return (
    <AppLayout title="Profile">
      <div className="mx-auto max-w-3xl space-y-8">
        <header>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-text-primary">Profile</h1>
          <p className="mt-1.5 text-sm text-text-secondary">How teammates see you, and your sign-in details.</p>
        </header>

        {!me ? (
          <p className="text-[13px] text-text-muted">Loading…</p>
        ) : (
          <>
            <section aria-labelledby="about-h" className="glass space-y-5 rounded-2xl p-5 sm:p-6">
              <h2 id="about-h" className="text-base font-semibold text-text-primary">About you</h2>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar name={me.name} url={me.avatarUrl} size={72} />
                <div className="flex flex-wrap gap-2">
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" id="avatar-file" onChange={(e) => uploadAvatar(e.target.files?.[0])} />
                  <label htmlFor="avatar-file" className={`${secondary} cursor-pointer has-[:focus-visible]:ring-2`} aria-disabled={busy === "avatar"}>
                    {busy === "avatar" ? "Uploading…" : me.avatarUrl ? "Change photo" : "Upload photo"}
                  </label>
                  {me.avatarUrl && <button type="button" onClick={removeAvatar} disabled={busy === "avatar"} className={secondary}>Remove</button>}
                </div>
                <p className="w-full text-xs text-text-muted">PNG, JPG or WebP up to 2 MB. Cropped to a square.</p>
                <Msg m={msg.avatar ?? null} />
              </div>
              <form onSubmit={saveProfile} className="space-y-3">
                <label className="block text-sm text-text-primary">Full name
                  <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} autoComplete="name" className={`mt-1 ${input}`} />
                </label>
                <label className="block text-sm text-text-primary">Bio
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} rows={3} className={`mt-1 w-full rounded-lg border border-border-default bg-panel px-3 py-2 text-sm text-text-primary ${focusRing}`} />
                  <span className={`mt-1 block text-right text-[12px] tabular-nums ${bio.length > 450 ? "text-status-red" : "text-text-muted"}`}>{bio.length}/500</span>
                </label>
                <p className="text-[13px] text-text-secondary">
                  Role: <strong className="font-medium text-text-primary">{me.label}</strong>. {ROLE_HELP[me.role]} Only an admin can change it.
                </p>
                <Msg m={msg.profile ?? null} />
                <button type="submit" disabled={busy === "profile"} className={primary}>{busy === "profile" ? "Saving…" : "Save profile"}</button>
                {(name !== me.name || bio !== (me.bio ?? "")) && busy !== "profile" && (
                  <span className="ml-3 inline-flex items-center gap-1.5 text-[12px] text-text-muted" role="status">
                    <span className="h-1.5 w-1.5 rounded-full bg-status-amber" aria-hidden="true" /> Unsaved changes
                  </span>
                )}
              </form>
            </section>

            <section aria-labelledby="account-h" className="glass space-y-6 rounded-2xl p-5 sm:p-6">
              <h2 id="account-h" className="text-base font-semibold text-text-primary">Account</h2>
              <form onSubmit={changeEmail} className="space-y-3">
                <label className="block text-sm text-text-primary">Email
                  <input name="email" type="email" defaultValue={me.email} required autoComplete="email" spellCheck={false} className={`mt-1 ${input}`} />
                </label>
                <Msg m={msg.email ?? null} />
                <button type="submit" disabled={busy === "email"} className={secondary}>Change email</button>
              </form>
              <div className="flex flex-wrap gap-2 border-t border-border-subtle pt-5">
                <button type="button" onClick={signOutEverywhere} disabled={busy === "signout"} className={secondary}>Sign out on all devices</button>
                <button type="button" onClick={() => setConfirmDelete(true)} className={`${btn} border border-status-red/40 text-status-red hover:bg-status-red/10`}>Delete account</button>
              </div>
              <Msg m={msg.delete ?? null} />
            </section>

            <DataAccount isAdmin={me.role === "admin"} />
          </>
        )}

        <dialog ref={dialogRef} onClose={() => setConfirmDelete(false)} aria-labelledby="del-h" className="glass-strong m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl p-6 text-text-primary backdrop:bg-black/40">
          <h2 id="del-h" className="text-lg font-semibold">Delete your account?</h2>
          <p className="mt-2 text-sm text-text-secondary">This removes your sign-in, profile and photo for good. Reviews you took part in stay in the audit trail.</p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setConfirmDelete(false)} className={secondary} autoFocus>Cancel</button>
            <button type="button" onClick={deleteAccount} disabled={busy === "delete"} className={`${btn} bg-status-red text-white hover:opacity-90`}>
              {busy === "delete" ? "Deleting…" : "Delete account"}
            </button>
          </div>
        </dialog>
      </div>
    </AppLayout>
  );
}

interface Usage { checksThisMonth: number; hourly: { resetsAt: string; buckets: { name: string; used: number; limit: number }[] } }
const BUCKET_LABEL: Record<string, string> = { check: "Quick checks", analyze: "Full analyses", extract: "File extractions", upload: "Uploads" };

/** Usage card, org export and org deletion. Delete is two steps: open the dialog, then type the org name. */
function DataAccount({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [usageErr, setUsageErr] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [typed, setTyped] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    fetch("/api/usage").then((r) => (r.ok ? r.json() : Promise.reject())).then(setUsage).catch(() => setUsageErr(true));
    if (isAdmin) fetch("/api/profile/setup").then((r) => r.json()).then((d) => setOrgName(d.company ?? "")).catch(() => {});
  }, [isAdmin]);
  useEffect(() => {
    const d = ref.current;
    if (open && d && !d.open) d.showModal();
    if (!open && d?.open) d.close();
  }, [open]);

  async function deleteOrg() {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/org", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmName: typed }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.success) throw new Error(d.error || "Could not delete the organisation.");
      await refreshMe();
      router.replace("/dashboard");
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="data-h" className="glass space-y-5 rounded-2xl p-5 sm:p-6">
      <h2 id="data-h" className="text-base font-semibold text-text-primary">Data &amp; account</h2>
      <div className="rounded-xl border border-border-subtle p-4">
        <h3 className="text-sm font-medium text-text-primary">Usage</h3>
        {usageErr ? (
          <p className="mt-2 text-[13px] text-text-muted">Usage is unavailable right now.</p>
        ) : !usage ? (
          <p className="mt-2 text-[13px] text-text-muted">Loading…</p>
        ) : (
          <>
            <p className="mt-2 text-[13px] text-text-secondary"><strong className="text-lg font-semibold tabular-nums text-text-primary">{usage.checksThisMonth}</strong> checks run by your organisation this month</p>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {usage.hourly.buckets.map((b) => (
                <li key={b.name} className="text-[13px] text-text-secondary">
                  <div className="flex justify-between"><span>{BUCKET_LABEL[b.name] ?? b.name}</span><span className="tabular-nums">{b.used} / {b.limit}</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-panel" role="meter" aria-label={`${BUCKET_LABEL[b.name] ?? b.name} this hour`} aria-valuemin={0} aria-valuemax={b.limit} aria-valuenow={b.used}>
                    <div className={`h-full rounded-full ${b.used >= b.limit ? "bg-status-red" : "bg-ink"}`} style={{ width: `${Math.min(100, (b.used / b.limit) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-text-muted">Your hourly limits reset at {new Date(usage.hourly.resetsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.</p>
          </>
        )}
      </div>
      {isAdmin ? (
        <div className="flex flex-wrap gap-2">
          <a href="/api/org/export" download className={secondary}>Export organisation data</a>
          <button type="button" onClick={() => { setTyped(""); setErr(null); setOpen(true); }} className={`${btn} border border-status-red/40 text-status-red hover:bg-status-red/10`}>Delete organisation</button>
        </div>
      ) : (
        <p className="text-[13px] text-text-secondary">Only an admin can export or delete the organisation.</p>
      )}
      <dialog ref={ref} onClose={() => setOpen(false)} aria-labelledby="delorg-h" className="glass-strong m-auto w-[min(30rem,calc(100vw-2rem))] rounded-2xl p-6 text-text-primary backdrop:bg-black/40">
        <h2 id="delorg-h" className="text-lg font-semibold">Delete {orgName || "this organisation"}?</h2>
        <p className="mt-2 text-sm text-text-secondary">Reviews, library, settings, invites and uploaded files are deleted for good. Every member moves to their own empty workspace. The audit log is append-only and is kept.</p>
        <label className="mt-4 block text-sm">Type <strong className="font-semibold">{orgName}</strong> to confirm
          <input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} className={`mt-1 ${input}`} />
        </label>
        <Msg m={err ? { ok: false, text: err } : null} />
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => setOpen(false)} className={secondary} autoFocus>Cancel</button>
          <button type="button" onClick={deleteOrg} disabled={busy || !orgName || typed.trim() !== orgName.trim()} className={`${btn} bg-status-red text-white hover:opacity-90`}>
            {busy ? "Deleting…" : "Delete organisation"}
          </button>
        </div>
      </dialog>
    </section>
  );
}
