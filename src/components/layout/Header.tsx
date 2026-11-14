"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Plus, Search, Menu, ChevronRight, ChevronsUpDown } from "lucide-react";
import { openCommandK } from "../ui/CommandK";
import { HelpButton } from "../guide/HelpPanel";
import { findPage } from "../guide/nav";
import { PERSONAS, openWorkspacePicker, ROLE_HELP, personaOf, setPrefs, usePrefs, focusRing } from "../guide/workspace";

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
}

export function Header({ title, breadcrumbs, onBrandChange, onOpenCommandK, onToggleMobileMenu }: HeaderProps) {
  const path = usePathname() ?? "";
  const page = findPage(path);
  const prefs = usePrefs();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[] | null>(null);
  const [notifError, setNotifError] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => setIsMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setNotifs((d.notifications ?? []).slice(0, 5)))
      .catch(() => setNotifError(true));
  }, []);

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
  const unread = (notifs ?? []).filter((n) => !(n.isRead ?? n.is_read)).length;

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

      {/* Demo persona / role switcher */}
      <label className="sr-only" htmlFor="persona-switch">Signed in as</label>
      <select
        id="persona-switch"
        value={prefs.persona}
        onChange={(e) => setPrefs({ persona: e.target.value })}
        title={ROLE_HELP[personaOf(prefs).role]}
        className={`hidden h-10 max-w-48 rounded-lg border border-border-default bg-panel px-3 text-sm text-text-primary md:block ${focusRing}`}
        style={{ backgroundColor: "var(--color-canvas-elevated)", color: "var(--color-ink)" }}
      >
        {PERSONAS.map((p) => (
          <option key={p.id} value={p.id}>{p.name.split(" ")[0]} ({p.label})</option>
        ))}
      </select>

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
    </header>
  );
}
