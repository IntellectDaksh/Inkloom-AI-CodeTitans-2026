"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header, HeaderBreadcrumb } from "./Header";
import dynamic from "next/dynamic";
import { PageMotion } from "./Motion";
import { FloatingLayer } from "./FloatingLayer";
// Overlays that aren't needed for first paint load in their own chunks, after the page is interactive.
const CommandK = dynamic(() => import("../ui/CommandK").then((m) => m.CommandK), { ssr: false });
const WorkspacePicker = dynamic(() => import("../guide/WorkspacePicker").then((m) => m.WorkspacePicker), { ssr: false });
const DemoOverlay = dynamic(() => import("../tour/DemoOverlay").then((m) => m.DemoOverlay), { ssr: false });
import { useMe, usePrefs, setPrefs, readPrefs } from "../guide/workspace";
import { FeedbackButton } from "../feedback/FeedbackButton";

export interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: HeaderBreadcrumb[];
  currentBrand?: string;
  onBrandChange?: (brandId: string) => void;
  unreadNotifications?: number;
  fullWidth?: boolean;
  className?: string;
}

export function AppLayout({
  children,
  title,
  subtitle,
  breadcrumbs,
  currentBrand = "Apex Nutrition",
  onBrandChange,
  unreadNotifications = 0,
  fullWidth = false,
  className = "",
}: AppLayoutProps) {
  // New accounts (email or Google) set up their profile before anything else.
  const me = useMe();
  React.useEffect(() => {
    if (me && !me.profileComplete) window.location.replace(`/welcome?next=${encodeURIComponent(location.pathname + location.search)}`);
  }, [me]);
  // Sidebar state is an account pref (Settings > Appearance), so it follows the user across devices.
  const { sidebarCollapsed: isSidebarCollapsed } = usePrefs();

  const [isCommandKOpen, setIsCommandKOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggleSidebar = () => setPrefs({ sidebarCollapsed: !readPrefs().sidebarCollapsed });

  // Browser tab shows where you are ("Settings · AdSnitch").
  React.useEffect(() => {
    if (title) document.title = `${title} · AdSnitch`;
  }, [title]);

  // "/" opens search from anywhere, unless you're typing in a field.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      setIsCommandKOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Connection and session problems get a clear bar instead of failing silently.
  const [offline, setOffline] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  React.useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    const out = () => setSignedOut(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    window.addEventListener("adsnitch:signed-out", out);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      window.removeEventListener("adsnitch:signed-out", out);
    };
  }, []);

  // "g" then a letter jumps between main pages: d dashboard, c check an ad, r reviews, a approvals, l claims, s settings.
  React.useEffect(() => {
    const go: Record<string, string> = { d: "/dashboard", c: "/submissions/new", r: "/submissions", a: "/approvals", l: "/knowledge-base/claims", s: "/settings" };
    let armed = 0;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey || (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))) return;
      if (e.key === "[") { setPrefs({ sidebarCollapsed: !readPrefs().sidebarCollapsed }); return; }
      if (e.key === "g") { armed = Date.now(); return; }
      if (armed && Date.now() - armed < 1200 && go[e.key]) {
        armed = 0;
        window.location.assign(go[e.key]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Back-to-top appears once you've scrolled a screen down.
  const [showTop, setShowTop] = useState(false);
  React.useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > window.innerHeight);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative isolate flex min-h-screen bg-canvas text-text-primary overflow-x-clip">
      <a href="#main-content" className="sr-only z-[80] rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <div className="atmosphere" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      <FloatingLayer density="app" />
      <FeedbackButton signedInEmail={me?.email} />
      {(offline || signedOut) && (
        <div role="alert" className="fixed inset-x-0 top-0 z-[70] flex items-center justify-center gap-3 bg-ink px-4 py-2 text-center text-[13px] text-white print:hidden">
          {offline ? (
            <span>You&rsquo;re offline. Changes won&rsquo;t save until you&rsquo;re back online.</span>
          ) : (
            <>
              <span>Your session ended.</span>
              <a className="font-semibold underline underline-offset-4" href={`/auth/login?next=${encodeURIComponent(typeof location !== "undefined" ? location.pathname : "/dashboard")}`}>Sign in again</a>
            </>
          )}
        </div>
      )}
      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0 })}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-20 right-4 z-[55] grid h-11 w-11 place-items-center rounded-full border border-border-default bg-panel text-text-primary shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-blue print:hidden sm:bottom-20"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      )}
      <WorkspacePicker />
      {me?.profileComplete !== false && <DemoOverlay />}

      {/* Global CommandK Quick Switcher Dialog */}
      <CommandK
        isOpen={isCommandKOpen}
        onClose={() => setIsCommandKOpen(false)}
      />

      {/* Left Collapsible Enterprise Swiss Sidebar & Mobile Drawer */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        orgName={currentBrand}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Swiss Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          breadcrumbs={breadcrumbs}
          currentBrand={currentBrand}
          onBrandChange={onBrandChange}
          unreadNotifications={unreadNotifications}
          onOpenCommandK={() => setIsCommandKOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        <main id="main-content" tabIndex={-1}
          className={`flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-10 w-full min-w-0 ${
            fullWidth ? "max-w-none" : "app-width max-w-7xl mx-auto"
          } ${className}`}
        >
          <PageMotion>{children}</PageMotion>
        </main>
      </div>
    </div>
  );
}
