"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  CheckCircle2,
  BarChart3,
  Settings,
  ChevronDown,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
  Check,
  Plus,
  Info,
} from "lucide-react";

interface SidebarProps {
  pendingApprovalsCount?: number;
  userName?: string;
  userRole?: string;
  orgName?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const BRANDS = [
  { id: "apex", name: "Apex Nutrition", category: "Health & Fitness", active: true },
  { id: "zenith", name: "Zenith Cloud SaaS", category: "Enterprise Software", active: false },
];

export function Sidebar({
  pendingApprovalsCount = 3,
  userName = "Daksh Agrawal",
  userRole = "Brand Director",
  orgName = "Apex Nutrition",
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(orgName);

  const collapsed =
    controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const navItems = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard" || pathname === "/dashboard/",
      shortcut: "1",
    },
    {
      name: "Submissions",
      href: "/submissions",
      icon: FileText,
      active: pathname.startsWith("/submissions"),
      shortcut: "2",
    },
    {
      name: "Knowledge Base",
      href: "/knowledge-base",
      icon: BookOpen,
      active: pathname.startsWith("/knowledge-base"),
      shortcut: "3",
    },
    {
      name: "Approvals",
      href: "/approvals",
      icon: CheckCircle2,
      active: pathname.startsWith("/approvals"),
      badge: pendingApprovalsCount,
      shortcut: "4",
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      active: pathname.startsWith("/analytics"),
      shortcut: "5",
    },
    {
      name: "Brand Workspaces",
      href: "/brands",
      icon: ShieldCheck,
      active: pathname.startsWith("/brands"),
      shortcut: "6",
    },
  ];

  return (
    <aside
      className={`bg-[#0A1020] border-r border-[#1E2E50] flex flex-col h-screen sticky top-0 select-none z-30 transition-all duration-200 shrink-0 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header & Collapse Toggle */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-[#1E2E50] bg-[#080C16]">
        {!collapsed ? (
          <>
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group overflow-hidden"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#FBBF24] to-[#D97706] border border-[#F59E0B] flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_2px_4px_rgba(0,0,0,0.4)]">
                <ShieldCheck className="w-4 h-4 text-[#080C16]" />
              </div>
              <span className="font-bold text-sm tracking-tight text-[#F8FAFC] flex items-center gap-1.5 font-sans">
                Inkloom
                <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/35 shadow-[0_0_6px_rgba(0,242,254,0.3)]">
                  AI
                </span>
              </span>
            </Link>

            <button
              onClick={handleToggle}
              className="p-1.5 rounded-md text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#152038] border border-transparent hover:border-[#1E2E50] transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-center">
            <button
              onClick={handleToggle}
              className="p-1.5 rounded-md text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#152038] transition-colors cursor-pointer"
              title="Expand sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Brand Workspace Selector */}
      <div className="p-2 border-b border-[#1E2E50] relative bg-[#090E1D]">
        {!collapsed ? (
          <div>
            <button
              onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-[#0D1527] hover:bg-[#152038] border border-[#1E2E50] hover:border-[#2A406E] transition-all text-left group shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] cursor-pointer"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-6 h-6 rounded bg-gradient-to-b from-[#1C2B4A] to-[#15223C] border border-[#2A406E] text-[#FBBF24] font-bold text-[11px] flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] font-mono">
                  {selectedBrand.charAt(0)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-[#F8FAFC] truncate">
                    {selectedBrand}
                  </div>
                  <div className="text-[10px] text-[#94A3B8] flex items-center gap-1.5 font-mono">
                    <span className="hardware-led hardware-led-turquoise" />
                    <span className="tracking-tight uppercase">Workspace Live</span>
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B] shrink-0 group-hover:text-[#CBD5E1]" />
            </button>

            {/* Brand Dropdown Menu */}
            {isBrandMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsBrandMenuOpen(false)}
                />
                <div className="absolute left-2 right-2 top-14 rounded-xl bg-[#0D1527] border border-[#2A406E] shadow-[0_12px_32px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)] py-1.5 z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[#94A3B8] font-mono font-bold border-b border-[#1E2E50]">
                    Select Brand Workspace
                  </div>
                  {BRANDS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBrand(b.name);
                        setIsBrandMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#152038] transition-colors text-left cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-[#F8FAFC]">{b.name}</div>
                        <div className="text-[10px] text-[#64748B] font-mono">
                          {b.category}
                        </div>
                      </div>
                      {selectedBrand === b.name && (
                        <Check className="w-3.5 h-3.5 text-[#00F2FE]" />
                      )}
                    </button>
                  ))}
                  <div className="p-1.5 border-t border-[#1E2E50]">
                    <Link
                      href="/brands"
                      onClick={() => setIsBrandMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] text-[#00F2FE] hover:text-[#38BDF8] font-semibold rounded hover:bg-[#152038] transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Manage All Brands</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={handleToggle}
              className="w-8 h-8 rounded-lg bg-[#0D1527] border border-[#1E2E50] text-[#FBBF24] font-bold text-xs flex items-center justify-center hover:border-[#2A406E] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] cursor-pointer font-mono"
              title={selectedBrand}
            >
              {selectedBrand.charAt(0)}
            </button>
          </div>
        )}
      </div>

      {/* Main Swiss High-Density Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={`relative flex items-center rounded-lg text-xs font-semibold transition-all duration-120 group ${
                collapsed
                  ? "justify-center p-2.5"
                  : "justify-between px-3 py-2.5"
              } ${
                item.active
                  ? "bg-[#152038] text-[#F8FAFC] border border-[#2A406E] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.4)]"
                  : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#152038]/60 border border-transparent"
              }`}
            >
              {/* Metallic Active Indicator Edge */}
              {item.active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-[#00F2FE] to-[#0891B2] rounded-r shadow-[0_0_8px_#00F2FE]" />
              )}

              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    item.active
                      ? "text-[#00F2FE]"
                      : "text-[#64748B] group-hover:text-[#CBD5E1]"
                  }`}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </div>

              {!collapsed && (
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="h-4 min-w-4 px-1.5 rounded-full bg-[#E5A93C] text-[#080C16] text-[10px] font-bold font-mono flex items-center justify-center shadow-[0_0_6px_rgba(229,169,60,0.5)]">
                      {item.badge}
                    </span>
                  )}
                  {item.shortcut && (
                    <kbd className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] px-1 py-0.2 rounded bg-[#080C16] border border-[#1E2E50] text-[#64748B] font-mono">
                      {item.shortcut}
                    </kbd>
                  )}
                </div>
              )}

              {/* Collapsed Badge Pill */}
              {collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E5A93C] shadow-[0_0_6px_rgba(229,169,60,0.6)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Prototype Environment Notice Callout Banner */}
      <div className="p-2 border-t border-[#1E2E50] bg-[#080C16]">
        <Link
          href="/prototype-notice"
          title={collapsed ? "Prototype Notice: CodeTitans 2026" : undefined}
          className={`flex items-center rounded-lg text-xs transition-all ${
            collapsed
              ? "justify-center p-2.5 bg-[#0D1527] hover:bg-[#152038]"
              : "gap-2.5 px-3 py-2 bg-[#0D1527] hover:bg-[#152038] border border-[#1E2E50] hover:border-[#E5A93C]/40"
          } text-[#CBD5E1] hover:text-[#F8FAFC]`}
        >
          <Info className="w-4 h-4 text-[#FBBF24] shrink-0" />
          {!collapsed && (
            <div className="truncate">
              <div className="text-[11px] font-bold text-[#FBBF24] tracking-tight truncate">
                Prototype Sandbox
              </div>
              <div className="text-[10px] text-[#64748B] font-mono truncate">
                CodeTitans 2026
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Settings & User Profile Footer */}
      <div className="p-2 border-t border-[#1E2E50] space-y-1.5 bg-[#080C16]">
        <Link
          href="/settings"
          title={collapsed ? "Settings" : undefined}
          className={`flex items-center rounded-lg text-xs font-semibold transition-colors ${
            collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2"
          } ${
            pathname.startsWith("/settings")
              ? "bg-[#152038] text-[#F8FAFC] border border-[#2A406E]"
              : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#152038]/60"
          }`}
        >
          <Settings className="w-4 h-4 text-[#64748B] shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {/* User Profile Card */}
        {!collapsed ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#0D1527] border border-[#1E2E50] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded-md bg-gradient-to-b from-[#1C2B4A] to-[#15223C] border border-[#2A406E] text-[#00F2FE] font-bold text-[11px] flex items-center justify-center shrink-0 font-mono">
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-[#F8FAFC] truncate">
                  {userName}
                </div>
                <div className="text-[10px] text-[#64748B] truncate font-mono">
                  {userRole}
                </div>
              </div>
            </div>
            <span
              className="hardware-led hardware-led-turquoise"
              title="Online • Verified Node"
            />
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <div
              className="w-7 h-7 rounded-md bg-[#0D1527] border border-[#1E2E50] text-[#00F2FE] font-bold text-[11px] flex items-center justify-center font-mono"
              title={`${userName} (${userRole})`}
            >
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
