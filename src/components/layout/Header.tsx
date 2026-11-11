"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Plus,
  Search,
  ArrowRight,
  Menu,
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
  onToggleMobileMenu?: () => void;
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
  onToggleMobileMenu,
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
    <header className="h-14 sm:h-16 border-b border-[#282828] bg-[#0A0A0A] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Menu Toggle + Breadcrumbs or Title Hierarchy */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] border border-[#282828] text-white hover:text-white cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 transition-colors"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.label}>
                  {idx > 0 && <span className="text-[#555555] select-none">/</span>}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="text-[#A0A0A0] hover:text-white transition-colors font-medium"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={`truncate font-medium ${
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
            <h1 className="text-base font-semibold text-white tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-[#999999] truncate mt-0.5">{subtitle}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-sm">
            <span className="text-[#888888] font-medium">Brand:</span>
            <span className="px-2.5 py-1 rounded-md bg-[#161616] border border-[#2E2E2E] text-white font-medium flex items-center gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {currentBrand}
            </span>
          </div>
        )}
      </div>

      {/* Center: Search / Command Trigger */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
        <button
          onClick={handleSearchClick}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-md bg-[#141414] hover:bg-[#1A1A1A] border border-[#2E2E2E] hover:border-[#3E3E3E] text-sm text-[#A0A0A0] hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#888888]" />
            <span className="text-sm">Search or jump to...</span>
          </div>
          <kbd className="text-xs text-[#A0A0A0] bg-[#1F1F1F] px-1.5 py-0.5 rounded border border-[#333333] font-sans">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Mobile Search trigger */}
        <button
          onClick={handleSearchClick}
          className="md:hidden p-2 rounded-md bg-[#141414] hover:bg-[#1A1A1A] border border-[#2E2E2E] text-[#A0A0A0] hover:text-white cursor-pointer"
          title="Search"
        >
          <Search className="w-4 h-4 text-white" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 rounded-md bg-[#141414] hover:bg-[#1A1A1A] border border-[#2E2E2E] hover:border-[#383838] text-[#A0A0A0] hover:text-white transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white ring-2 ring-[#0A0A0A]" />
            )}
          </button>

          {isNotifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotifOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-xl bg-[#141414] border border-[#303030] shadow-xl py-1 z-50 animate-in fade-in duration-100">
                <div className="px-4 py-3 border-b border-[#262626] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#222222] text-white border border-[#333333]">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleClearNotifs}
                      className="text-xs text-[#999999] hover:text-white transition-colors cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-[#242424] max-h-72 overflow-y-auto">
                  {SAMPLE_NOTIFICATIONS.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsNotifOpen(false)}
                      className="block p-3.5 hover:bg-[#1A1A1A] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium text-white">
                          {item.title}
                        </div>
                        <span className="text-xs text-[#737373] shrink-0">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-xs text-[#A0A0A0] mt-1 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>
                    </Link>
                  ))}
                </div>

                <div className="p-2.5 border-t border-[#262626]">
                  <Link
                    href="/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-1 text-xs text-white hover:text-neutral-300 font-medium transition-colors"
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
            icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            className="min-h-[44px] px-3 sm:px-4 text-xs sm:text-sm"
          >
            <span className="hidden xs:inline sm:inline">Review Content</span>
            <span className="xs:hidden sm:hidden">Review</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
