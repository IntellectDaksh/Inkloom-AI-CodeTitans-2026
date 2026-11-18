"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Plus, Search, Menu, ChevronRight, ChevronsUpDown, User, Settings, LogOut, Lock } from "lucide-react";
import { openCommandK } from "../ui/CommandK";
import { HelpButton } from "../guide/HelpPanel";
import { findPage } from "../guide/nav";
import { openWorkspacePicker, usePrefs, useMe, focusRing } from "../guide/workspace";
import { supabaseBrowser } from "@/lib/auth/client";
import { OrgSwitcher } from "./OrgSwitcher";
import { useLivePoll } from "../ops/useLivePoll";

export interface HeaderBreadcrumb {
  label: string;
  href?: string;
}

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: HeaderBreadcrumb[];
  currentBrand?: string;
  onBrandChange?: (brandId: string) => void;
  unreadNotifications?: number;
  onOpenCommandK?: () => void;
  onToggleMobileMenu?: () => void;
}

interface Notif {
  id: string;
  title: string;
  message?: string;
  linkUrl?: string;
  link_url?: string | null;
  isRead?: boolean;
  is_read?: boolean;
  notification_type?: string;
  created_at?: string;
}

export function Header({ title, breadcrumbs, onBrandChange, onOpenCommandK, onToggleMobileMenu }: HeaderProps) {
  const path = usePathname() ?? "";
  const page = findPage(path);
  const prefs = usePrefs();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [allNotifs, setNotifs] = useState<Notif[] | null>(null);
  // Muted types (Settings > Notifications) never reach the bell, its dot, sound or desktop alerts.
  const visible = allNotifs?.filter((n) => !prefs.mutedTypes.includes(n.notification_type ?? "")) ?? null;
  const notifs = visible?.slice(0, 5) ?? null;
  const [notifError, setNotifError] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => setIsMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setNotifs(d.notifications ?? []))
      .catch(() => setNotifError(true));
  }, []);
  // Live bell: background polls bypass the device cache and keep the last good list on failure.
  useLivePoll(() => {
    fetch("/api/notifications?fresh=1")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setNotifs(d.notifications ?? []); setNotifError(false); })
      .catch(() => {});
  });

  useEffect(() => {
    if (!isNotifOpen) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !notifRef.current?.contains(e.target as Node)) setIsNotifOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [isNotifOpen]);

  const crumbs: HeaderBreadcrumb[] =
    breadcrumbs && breadcrumbs.length
      ? breadcrumbs
      : page
        ? [{ label: page.group, href: undefined }, { label: title ?? page.name }]
        : [{ label: title ?? "AdSnitch" }];
  const heading = crumbs[crumbs.length - 1].label;
  const unread = (visible ?? []).filter((n) => !(n.isRead ?? n.is_read)).length;

  // Sound / desktop alerts for unread notifications newer than the last ones this browser has seen.
  useEffect(() => {
    if (!visible) return;
    const SEEN = "adsnitch:notif-seen";
    const ts = (n: Notif) => Date.parse(n.created_at ?? "") || 0;
    let seen: number | null = null;
    try {
      const v = localStorage.getItem(SEEN);
      seen = v === null ? null : Number(v);
    } catch {}
    const latest = Math.max(seen ?? 0, ...visible.map(ts));
    try {
      localStorage.setItem(SEEN, String(latest));
    } catch {}
    if (seen === null) return; // first visit on this browser: set the baseline, don't alert on history
    const fresh = visible.filter((n) => !(n.isRead ?? n.is_read) && ts(n) > seen!);
    if (!fresh.length) return;
    if (prefs.notifySound) {
      try {
        const ctx = new AudioContext();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.08, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
        o.connect(g).connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.25);
      } catch {}
    }
    if (prefs.notifyDesktop && typeof Notification !== "undefined" && Notification.permission === "granted") {
      for (const n of fresh.slice(0, 3)) new Notification(n.title, { body: n.message, tag: n.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allNotifs]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border-subtle bg-glass px-3 backdrop-blur-xl backdrop-saturate-150 sm:gap-3 sm:px-6">
      <button
        type="button"
        onClick={onToggleMobileMenu}
        aria-label="Open menu"
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-panel text-text-primary hover:bg-panel-hover md:hidden ${focusRing}`}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Title + breadcrumb */}
      <div className="min-w-0 flex-1">
        {crumbs.length > 1 && (
          <nav aria-label="Breadcrumb" className="hidden items-center gap-1 text-xs text-text-muted sm:flex">
            {crumbs.slice(0, -1).map((c) => (
              <React.Fragment key={c.label}>
                {c.href ? (
                  <Link href={c.href} className={`rounded hover:text-text-primary ${focusRing}`}>{c.label}</Link>
                ) : (
                  <span>{c.label}</span>
                )}
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </React.Fragment>
            ))}
          </nav>
        )}
        <p className="truncate text-base font-semibold tracking-tight text-text-primary">{heading}</p>
      </div>

      <OrgSwitcher />

      {/* Brand switcher */}
      <button
        type="button"
        onClick={openWorkspacePicker}
        title="Switch workspace"
        className={`hidden h-10 max-w-52 items-center gap-2 rounded-lg border border-border-default bg-panel px-3 text-sm text-text-primary transition-colors hover:bg-panel-hover sm:inline-flex ${focusRing}`}
      >
        <span className="truncate font-medium">{prefs.brand}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden="true" />
        <span className="sr-only">, switch workspace</span>
      </button>

      {/* Search */}
      <button
        type="button"
        onClick={() => (onOpenCommandK ? onOpenCommandK() : openCommandK())}
        aria-label="Search or run an action"
        className={`flex h-10 items-center gap-2 rounded-lg border border-border-default bg-panel px-3 text-sm text-text-secondary hover:bg-panel-hover hover:text-text-primary lg:w-64 ${focusRing}`}
      >
        <Search className="h-4 w-4 text-text-muted" aria-hidden="true" />
        <span className="hidden flex-1 text-left lg:inline">Search or jump to…</span>
        <kbd className="hidden rounded border border-border-default bg-panel-hover px-1.5 py-0.5 font-sans text-xs lg:inline">
          {isMac ? "⌘" : "Ctrl"}&nbsp;K
        </kbd>
        <kbd className="hidden rounded border border-border-default bg-panel-hover px-1.5 py-0.5 font-sans text-xs xl:inline" title="Press / to search">/</kbd>
      </button>

      <HelpButton />

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          type="button"
          onClick={() => setIsNotifOpen((v) => !v)}
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          aria-expanded={isNotifOpen}
          className={`relative flex h-10 w-10 items-center justify-center rounded-lg border border-border-default bg-panel text-text-secondary hover:bg-panel-hover hover:text-text-primary ${focusRing}`}
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-ink ring-2 ring-canvas" aria-hidden="true" />}
        </button>
        {isNotifOpen && (
          <div className="glass-strong absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] rounded-xl p-1">
            <p className="px-3 py-2 text-sm font-semibold text-text-primary">Notifications</p>
            {notifError ? (
              <p className="px-3 py-4 text-[13px] text-text-muted">Could not load notifications. Try again later.</p>
            ) : notifs === null ? (
              <p className="px-3 py-4 text-[13px] text-text-muted">Loading…</p>
            ) : notifs.length === 0 ? (
              <p className="px-3 py-4 text-[13px] text-text-muted">Nothing new. You will be told here when an ad is approved or needs changes.</p>
            ) : (
              <ul>
                {notifs.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.linkUrl || n.link_url || "/notifications"}
                      onClick={() => {
                        setIsNotifOpen(false);
                        if (n.isRead ?? n.is_read) return;
                        setNotifs((cur) => cur?.map((x) => (x.id === n.id ? { ...x, isRead: true, is_read: true } : x)) ?? null);
                        fetch("/api/notifications", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ notificationId: n.id }),
                        }).catch(() => {});
                      }}
                      className={`block rounded-lg px-3 py-2.5 hover:bg-panel-hover ${focusRing}`}
                    >
                      <span className="block text-[13px] font-medium text-text-primary line-clamp-1">{n.title}</span>
                      {n.message && <span className="mt-0.5 block text-xs text-text-muted line-clamp-2">{n.message}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/notifications"
              onClick={() => setIsNotifOpen(false)}
              className={`block rounded-lg px-3 py-2 text-center text-[13px] font-medium text-text-primary hover:bg-panel-hover ${focusRing}`}
            >
              See all
            </Link>
          </div>
        )}
      </div>

      {path !== "/submissions/new" && (
        <Link
          href="/submissions/new"
          className={`hidden h-10 items-center gap-1.5 rounded-lg bg-ink px-4 text-sm font-medium text-canvas hover:opacity-90 sm:flex ${focusRing}`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Check an ad
        </Link>
      )}

      <AccountMenu />
    </header>
  );
}

export function Avatar({ name, url, size = 40 }: { name: string; url?: string | null; size?: number }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase()).join("") || "?";
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" width={size} height={size} className="shrink-0 rounded-full border border-border-default object-cover" style={{ width: size, height: size }} />
  ) : (
    <span aria-hidden="true" className="flex shrink-0 items-center justify-center rounded-full border border-border-default bg-panel text-sm font-semibold text-text-primary" style={{ width: size, height: size }}>
      {initials}
    </span>
  );
}

function AccountMenu() {
  const me = useMe();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const signOut = async () => {
    await supabaseBrowser().auth.signOut();
    router.replace("/auth/login");
    router.refresh();
  };

  const item = `flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-text-primary hover:bg-panel-hover ${focusRing}`;
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={me ? `Account menu for ${me.name}` : "Account menu"}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex h-10 w-10 items-center justify-center rounded-full ${focusRing}`}
      >
        <Avatar name={me?.name ?? ""} url={me?.avatarUrl} size={36} />
      </button>
      {open && (
        <div role="menu" className="glass-strong absolute right-0 z-50 mt-2 w-60 rounded-xl p-1">
          {me && (
            <div className="px-3 py-2">
              <p className="truncate text-sm font-semibold text-text-primary">{me.name}</p>
              <p className="truncate text-xs text-text-muted">{me.email} · {me.label}</p>
            </div>
          )}
          <Link role="menuitem" href="/profile" onClick={() => setOpen(false)} className={item}><User className="h-4 w-4" aria-hidden="true" />Profile</Link>
          <Link role="menuitem" href="/settings" onClick={() => setOpen(false)} className={item}><Settings className="h-4 w-4" aria-hidden="true" />Settings</Link>
          <Link role="menuitem" href="/settings?tab=security" onClick={() => setOpen(false)} className={item}><Lock className="h-4 w-4" aria-hidden="true" />Security</Link>
          <button role="menuitem" type="button" onClick={signOut} className={item}><LogOut className="h-4 w-4" aria-hidden="true" />Sign out</button>
        </div>
      )}
    </div>
  );
}
