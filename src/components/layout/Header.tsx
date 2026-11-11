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
    <header className="h-14 border-b border-[#1E2E50] bg-[#080C16] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Breadcrumbs or Title */}
      <div className="flex items-center gap-3 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-mono">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.label}>
                  {idx > 0 && <span className="text-[#64748B] select-none">/</span>}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={`font-semibold truncate ${
                        isLast ? "text-[#F8FAFC]" : "text-[#94A3B8]"
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
            <h1 className="text-sm font-bold text-[#F8FAFC] tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] text-[#94A3B8] truncate">{subtitle}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#64748B] font-mono text-[10px] uppercase tracking-wider">
              Brand:
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#0D1527] border border-[#1E2E50] text-[#F8FAFC] font-semibold flex items-center gap-2 text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <span className="hardware-led hardware-led-turquoise" />
              {currentBrand}
            </span>
          </div>
        )}
      </div>

      {/* Center: CommandK Quick Switcher Button */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
        <button
          onClick={handleSearchClick}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0D1527] hover:bg-[#152038] border border-[#1E2E50] hover:border-[#2A406E] text-xs text-[#94A3B8] transition-all group cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#00F2FE] group-hover:text-[#38BDF8]" />
            <span className="text-[#94A3B8] group-hover:text-[#F8FAFC]">
              Search or jump to...
            </span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="text-[10px] text-[#CBD5E1] bg-[#152038] px-1.5 py-0.5 rounded border border-[#2A406E] font-mono shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
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
          className="md:hidden p-2 rounded-lg bg-[#0D1527] hover:bg-[#152038] border border-[#1E2E50] text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
          title="Search"
        >
          <Search className="w-3.5 h-3.5 text-[#00F2FE]" />
        </button>

        {/* Governance Guard Live Telemetry Diode */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1527] border border-[#1E2E50] text-[10px] font-mono font-bold text-[#CBD5E1] uppercase tracking-[0.16em] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <span className="hardware-led hardware-led-turquoise" />
          <span>Governance Engine Active</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg bg-[#0D1527] hover:bg-[#152038] border border-[#1E2E50] hover:border-[#2A406E] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E5A93C] ring-2 ring-[#080C16] shadow-[0_0_6px_rgba(229,169,60,0.8)]" />
            )}
          </button>

          {isNotifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotifOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-xl bg-[#0D1527] border border-[#2A406E] shadow-[0_16px_40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2.5 border-b border-[#1E2E50] bg-[#152038] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F8FAFC]">
                      Governance Alerts
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#E5A93C]/15 text-[#FBBF24] border border-[#E5A93C]/35">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleClearNotifs}
                      className="text-[10px] font-mono text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer uppercase tracking-wider"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-[#1E2E50] max-h-72 overflow-y-auto bg-[#0D1527]">
                  {SAMPLE_NOTIFICATIONS.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsNotifOpen(false)}
                      className="block p-3 hover:bg-[#152038] transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-semibold text-[#F8FAFC] group-hover:text-[#00F2FE] transition-colors">
                          {item.title}
                        </div>
                        <span className="text-[10px] text-[#64748B] shrink-0 font-mono">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mt-1 leading-snug line-clamp-2">
                        {item.message}
                      </p>
                    </Link>
                  ))}
                </div>

                <div className="p-2 border-t border-[#1E2E50] bg-[#080C16]">
                  <Link
                    href="/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-1 text-xs text-[#00F2FE] hover:text-[#38BDF8] font-semibold transition-colors"
                  >
                    <span>View all notifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Review / Audit Button (Tactile Brushed Gold) */}
        <Link href="/submissions/new">
          <Button
            size="sm"
            variant="gold"
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
