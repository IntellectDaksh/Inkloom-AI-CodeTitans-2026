"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Plus,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
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
    <header className="h-14 border-b border-[#1C202F] bg-[#090A10] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Breadcrumbs or Title */}
      <div className="flex items-center gap-3 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.label}>
                  {idx > 0 && <span className="text-[#64748B] select-none">/</span>}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="text-[#94A3B8] hover:text-[#F4F6F9] transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={`font-medium truncate ${
                        isLast ? "text-[#F4F6F9]" : "text-[#94A3B8]"
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
            <h1 className="text-sm font-semibold text-[#F4F6F9] tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] text-[#64748B] truncate">{subtitle}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#64748B]">Brand:</span>
            <span className="px-2 py-0.5 rounded bg-[#141722] border border-[#1C202F] text-[#F4F6F9] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {currentBrand}
            </span>
          </div>
        )}
      </div>

      {/* Center: CommandK Quick Switcher Button */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
        <button
          onClick={handleSearchClick}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0F1117] hover:bg-[#141722] border border-[#1C202F] hover:border-[#2B3248] text-xs text-[#64748B] transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#94A3B8]" />
            <span className="text-[#94A3B8] group-hover:text-[#F4F6F9]">
              Search or jump to...
            </span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="text-[10px] text-[#94A3B8] bg-[#141722] px-1.5 py-0.5 rounded border border-[#2B3248]">
              Ctrl+K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Mobile Search trigger */}
        <button
          onClick={handleSearchClick}
          className="md:hidden p-2 rounded-lg bg-[#0F1117] hover:bg-[#141722] border border-[#1C202F] text-[#94A3B8] hover:text-[#F4F6F9]"
          title="Search"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Governance Guard Live Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/30 border border-emerald-500/25 text-[11px] font-medium text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Governance Guard Active</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg bg-[#0F1117] hover:bg-[#141722] border border-[#1C202F] hover:border-[#2B3248] text-[#94A3B8] hover:text-[#F4F6F9] transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-[#090A10]" />
            )}
          </button>

          {isNotifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotifOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-xl bg-[#0F1117] border border-[#1C202F] shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2.5 border-b border-[#1C202F] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#F4F6F9]">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-violet-950/60 text-violet-300 border border-violet-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleClearNotifs}
                      className="text-[11px] text-[#64748B] hover:text-[#F4F6F9] transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-[#1C202F] max-h-72 overflow-y-auto">
                  {SAMPLE_NOTIFICATIONS.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsNotifOpen(false)}
                      className="block p-3 hover:bg-[#141722] transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-medium text-[#F4F6F9] group-hover:text-violet-300 transition-colors">
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

                <div className="p-2 border-t border-[#1C202F] bg-[#0A0B10]">
                  <Link
                    href="/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-1 text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
                  >
                    <span>View all notifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Review / Audit Button */}
        <Link href="/submissions/new">
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-3.5 h-3.5" />}
            shortcut="N"
          >
            Review Content
          </Button>
        </Link>
      </div>
    </header>
  );
}
