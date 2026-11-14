"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, PanelLeftClose, PanelLeft, Info, X } from "lucide-react";
import { NAV, isActive } from "../guide/nav";
import { usePrefs, useWorkspaceCounts, focusRing, personaOf } from "../guide/workspace";

export interface SidebarProps {
  pendingApprovalsCount?: number;
  userName?: string;
  userRole?: string;
  orgName?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2);
}

function NavList({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";
  const counts = useWorkspaceCounts();
  const badgeFor = (b?: "approvals" | "reviews") =>
    b === "approvals" ? counts.pendingApprovals : b === "reviews" ? counts.inReview : 0;

  return (
    <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-3">
      {NAV.map((group) => (
        <div key={group.label} className="mb-4 last:mb-0">
          {collapsed ? (
            <div className="mx-auto mb-2 h-px w-6 bg-border-subtle" aria-hidden="true" />
          ) : (
            <p className="mb-1 px-3 text-xs font-medium text-text-muted">{group.label}</p>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, pathname);
              const count = badgeFor(item.badge);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? (count ? `${item.name} (${count})` : item.name) : undefined}
                    className={`relative flex min-h-10 items-center rounded-lg text-sm font-medium transition-colors ${focusRing} ${
                      collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2"
                    } ${
                      active
                        ? "bg-panel-hover text-text-primary shadow-[inset_2px_0_0_var(--color-ink,#111)]"
                        : "text-text-secondary hover:bg-panel hover:text-text-primary"
                    }`}
                  >
                    <Icon aria-hidden="true" className={`h-4 w-4 shrink-0 ${active ? "text-text-primary" : "text-text-muted"}`} />
                    {!collapsed && <span className="flex-1 truncate">{item.name}</span>}
                    {count > 0 &&
                      (collapsed ? (
                        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-ink" aria-hidden="true" />
                      ) : (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-xs font-semibold tabular-nums text-canvas">
                          {count}
                          <span className="sr-only"> waiting</span>
                        </span>
                      ))}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/dashboard" onClick={onClick} className={`flex min-h-10 items-center gap-2.5 rounded-lg ${focusRing}`}>
      <span className="app-brand-mark h-7 w-7">
        <ShieldCheck className="h-4 w-4 text-ice" aria-hidden="true" />
      </span>
      <span className="text-base font-semibold tracking-tight text-text-primary" translate="no">AdSnitch</span>
    </Link>
  );
}

export function Sidebar({
  userName: userNameProp,
  userRole,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const prefs = usePrefs();
  const persona = personaOf(prefs);
  const role = userRole ?? persona.label;
  const userName = userNameProp ?? persona.name;
  const pathname = usePathname();

  // Close the drawer on route change and on Escape.
  useEffect(() => {
    onCloseMobile?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  useEffect(() => {
    if (!isMobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseMobile?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobileOpen, onCloseMobile]);

  const footer = (collapsed: boolean, onNavigate?: () => void) => (
    <div className="space-y-2 border-t border-border-subtle p-3">
      <Link
        href="/prototype-notice"
        onClick={onNavigate}
        title={collapsed ? "About this prototype" : undefined}
        className={`flex min-h-10 items-center rounded-lg text-[13px] text-text-secondary hover:bg-panel hover:text-text-primary ${focusRing} ${
          collapsed ? "justify-center p-2" : "gap-2.5 px-3 py-2"
        }`}
      >
        <Info className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
        {!collapsed && <span>About this prototype</span>}
      </Link>
      <div className={`flex items-center gap-2.5 rounded-lg ${collapsed ? "justify-center py-1" : "border border-border-subtle bg-panel p-2.5"}`}>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border-default bg-panel-elevated text-xs font-semibold text-text-primary"
          title={collapsed ? `${userName}, ${role}` : undefined}
        >
          {initials(userName)}
        </span>
        {!collapsed && (
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-medium text-text-primary">{userName}</span>
            <span className="block truncate text-xs text-text-muted">{role} at {prefs.brand}</span>
          </span>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-sm md:hidden" onClick={onCloseMobile} aria-hidden="true" />
      )}
      <aside
        aria-label="Navigation"
        aria-hidden={!isMobileOpen}
        inert={!isMobileOpen}
        className={`glass-strong fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overscroll-contain rounded-none border-r border-border-subtle shadow-2xl transition-transform duration-200 md:hidden motion-reduce:transition-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border-subtle px-4">
          <Logo onClick={onCloseMobile} />
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close menu"
            className={`flex h-11 w-11 items-center justify-center rounded-lg text-text-muted hover:bg-panel-hover hover:text-text-primary ${focusRing}`}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <NavList collapsed={false} onNavigate={onCloseMobile} />
        {footer(false, onCloseMobile)}
      </aside>

      {/* Desktop sidebar */}
      <aside
        aria-label="Navigation"
        className={`glass sticky top-0 z-30 hidden h-screen shrink-0 flex-col rounded-none border-y-0 border-l-0 border-r border-border-subtle transition-[width] duration-150 md:flex motion-reduce:transition-none ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className={`flex h-16 items-center border-b border-border-subtle px-3 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && <Logo />}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-panel-hover hover:text-text-primary ${focusRing}`}
          >
            {isCollapsed ? <PanelLeft className="h-4 w-4" aria-hidden="true" /> : <PanelLeftClose className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
        <NavList collapsed={isCollapsed} />
        {footer(isCollapsed)}
      </aside>
    </>
  );
}
