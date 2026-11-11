"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Plus,
  Search,
  ArrowRight,
} from "lucide-react";
import { Button } from "../ui/Button";
import { openCommandK } from "../ui/CommandK";

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
}

const SAMPLE_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Unverified Multiplier Flagged",
    message: "2x faster results flagged in Apex Summer Launch campaign.",
    time: "8m ago",
    type: "critical",
    href: "/submissions/sub_mock_001",
  },
  {
    id: "notif-2",
    title: "Revision Approved by Legal",
    message: "Zenith Cloud SOC2 Compliance post cleared all checks.",
    time: "24m ago",
    type: "approved",
    href: "/submissions",
  },
  {
    id: "notif-3",
    title: "New Claim Indexed",
    message: "Clinically proven 99.8% uptime claim added to library.",
    time: "1h ago",
    type: "info",
    href: "/knowledge-base/claims",
  },
];

export function Header({
  title,
  subtitle,
  breadcrumbs,
  currentBrand = "Apex Nutrition",
  unreadNotifications = 2,
  onOpenCommandK,
}: HeaderProps) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(unreadNotifications);

  const handleSearchClick = () => {
    if (onOpenCommandK) {
      onOpenCommandK();
    } else {
      openCommandK();
    }
  };

  const handleClearNotifs = () => {
    setUnreadCount(0);
  };

  return (
    <header className="h-14 border-b border-[#222222] bg-[#080808] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Breadcrumbs or Title */}
      <div className="flex items-center gap-3 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-mono">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.label}>
                  {idx > 0 && <span className="text-[#444444] select-none">/</span>}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="text-[#A0A0A0] hover:text-white transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={`font-semibold truncate ${
                        isLast ? "text-white" : "text-[#A0A0A0]"
                      }`}
                    >
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        ) : title ? (
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] text-[#A0A0A0] truncate">{subtitle}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#737373] font-mono text-[10px] uppercase tracking-wider">
              Brand:
            </span>
            <span className="px-2 py-0.5 rounded bg-[#0C0C0C] border border-[#222222] text-white font-medium flex items-center gap-2 text-xs">
              <span className="status-diode status-diode-emerald" />
              {currentBrand}
            </span>
          </div>
        )}
      </div>

      {/* Center: CommandK Quick Switcher Button */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
        <button
          onClick={handleSearchClick}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded bg-[#0C0C0C] hover:bg-[#141414] border border-[#222222] hover:border-[#333333] text-xs text-[#A0A0A0] transition-all group cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#737373] group-hover:text-white" />
            <span className="text-[#A0A0A0] group-hover:text-white">
              Search or jump to...
            </span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="text-[10px] text-[#EFEFEF] bg-[#141414] px-1.5 py-0.5 rounded border border-[#282828] font-mono">
              Ctrl+K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Mobile Search trigger */}
        <button
          onClick={handleSearchClick}
          className="md:hidden p-2 rounded bg-[#0C0C0C] hover:bg-[#141414] border border-[#222222] text-[#A0A0A0] hover:text-white cursor-pointer"
          title="Search"
        >
          <Search className="w-3.5 h-3.5 text-white" />
        </button>

        {/* Governance Guard Live Telemetry Diode */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C0C0C] border border-[#222222] text-[10px] font-mono font-bold text-[#EFEFEF] uppercase tracking-[0.2em]">
          <span className="status-diode status-diode-emerald" />
          <span>Governance Engine Active</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded bg-[#0C0C0C] hover:bg-[#141414] border border-[#222222] hover:border-[#333333] text-[#A0A0A0] hover:text-white transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white ring-2 ring-[#080808]" />
            )}
          </button>

          {isNotifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotifOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-lg bg-[#0C0C0C] border border-[#282828] shadow-[0_12px_32px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2.5 border-b border-[#222222] bg-[#111111] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      Alerts
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#1C1C1C] text-white border border-[#333333]">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleClearNotifs}
                      className="text-[10px] font-mono text-[#A0A0A0] hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="divide-y divide-[#222222] max-h-72 overflow-y-auto bg-[#0C0C0C]">
                  {SAMPLE_NOTIFICATIONS.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsNotifOpen(false)}
                      className="block p-3 hover:bg-[#141414] transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-semibold text-white group-hover:text-white transition-colors">
                          {item.title}
                        </div>
                        <span className="text-[10px] text-[#737373] shrink-0 font-mono">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A0A0A0] mt-1 leading-snug line-clamp-2">
                        {item.message}
                      </p>
                    </Link>
                  ))}
                </div>

                <div className="p-2 border-t border-[#222222] bg-[#080808]">
                  <Link
                    href="/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-1 text-xs text-white hover:text-white/80 font-medium transition-colors"
                  >
                    <span>View all notifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Review / Audit Button (Monochromatic High-Contrast White) */}
        <Link href="/submissions/new">
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
            shortcut="N"
          >
            Review Content
          </Button>
        </Link>
      </div>
    </header>
  );
}
