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
      className={`bg-[#080808] border-r border-[#222222] flex flex-col h-screen sticky top-0 select-none z-30 transition-all duration-150 shrink-0 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header & Collapse Toggle */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-[#222222] bg-[#080808]">
        {!collapsed ? (
          <>
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group overflow-hidden"
            >
              <div className="w-7 h-7 rounded bg-white flex items-center justify-center shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                <ShieldCheck className="w-4 h-4 text-[#080808]" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5 font-sans">
                Inkloom
                <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-[#141414] text-[#EFEFEF] border border-[#282828]">
                  AI
                </span>
              </span>
            </Link>

            <button
              onClick={handleToggle}
              className="p-1.5 rounded text-[#737373] hover:text-white hover:bg-[#141414] transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-center">
            <button
              onClick={handleToggle}
              className="p-1.5 rounded text-[#737373] hover:text-white hover:bg-[#141414] transition-colors cursor-pointer"
              title="Expand sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Brand Workspace Selector */}
      <div className="p-2 border-b border-[#222222] relative bg-[#080808]">
        {!collapsed ? (
          <div>
            <button
              onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded bg-[#0C0C0C] hover:bg-[#141414] border border-[#222222] hover:border-[#333333] transition-all text-left group cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-6 h-6 rounded bg-[#181818] border border-[#282828] text-white font-bold text-[11px] flex items-center justify-center shrink-0 font-mono shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  {selectedBrand.charAt(0)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-white truncate">
                    {selectedBrand}
                  </div>
                  <div className="text-[10px] text-[#A0A0A0] flex items-center gap-1.5 font-mono">
                    <span className="status-diode status-diode-emerald" />
                    <span className="tracking-tight uppercase">Active</span>
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#737373] shrink-0 group-hover:text-white" />
            </button>

            {/* Brand Dropdown Menu */}
            {isBrandMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsBrandMenuOpen(false)}
                />
                <div className="absolute left-2 right-2 top-14 rounded-lg bg-[#0C0C0C] border border-[#282828] shadow-[0_8px_24px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] py-1 z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[#737373] font-mono font-bold border-b border-[#222222]">
                    Select Brand Workspace
                  </div>
                  {BRANDS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBrand(b.name);
                        setIsBrandMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#EFEFEF] hover:text-white hover:bg-[#141414] transition-colors text-left cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-white">{b.name}</div>
                        <div className="text-[10px] text-[#737373] font-mono">
                          {b.category}
                        </div>
                      </div>
                      {selectedBrand === b.name && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </button>
                  ))}
                  <div className="p-1.5 border-t border-[#222222]">
                    <Link
                      href="/brands"
                      onClick={() => setIsBrandMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] text-white hover:text-white/80 font-medium rounded hover:bg-[#141414] transition-colors"
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
              className="w-8 h-8 rounded bg-[#0C0C0C] border border-[#222222] text-white font-bold text-xs flex items-center justify-center hover:border-[#383838] cursor-pointer font-mono"
              title={selectedBrand}
            >
              {selectedBrand.charAt(0)}
            </button>
          </div>
        )}
      </div>

      {/* Main Swiss High-Density Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={`relative flex items-center rounded text-xs font-medium transition-all duration-100 group ${
                collapsed
                  ? "justify-center p-2.5"
                  : "justify-between px-3 py-2"
              } ${
                item.active
                  ? "bg-[#141414] text-white border border-[#282828] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  : "text-[#A0A0A0] hover:text-white hover:bg-[#111111] border border-transparent"
              }`}
            >
              {/* Monochromatic Active Indicator Edge */}
              {item.active && (
                <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-white rounded-r" />
              )}

              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    item.active
                      ? "text-white"
                      : "text-[#737373] group-hover:text-white"
                  }`}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </div>

              {!collapsed && (
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="h-4 min-w-4 px-1 rounded bg-[#222222] text-[#FFFFFF] text-[10px] font-bold font-mono flex items-center justify-center border border-[#333333]">
                      {item.badge}
                    </span>
                  )}
                  {item.shortcut && (
                    <kbd className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] px-1 py-0.2 rounded bg-[#080808] border border-[#222222] text-[#737373] font-mono">
                      {item.shortcut}
                    </kbd>
                  )}
                </div>
              )}

              {/* Collapsed Badge Pill */}
              {collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Prototype Environment Notice Callout Banner */}
      <div className="p-2 border-t border-[#222222] bg-[#080808]">
        <Link
          href="/prototype-notice"
          title={collapsed ? "Prototype Notice: CodeTitans 2026" : undefined}
          className={`flex items-center rounded text-xs transition-all ${
            collapsed
              ? "justify-center p-2.5 bg-[#0C0C0C] hover:bg-[#141414]"
              : "gap-2.5 px-3 py-2 bg-[#0C0C0C] hover:bg-[#141414] border border-[#222222] hover:border-[#383838]"
          } text-[#EFEFEF] hover:text-white`}
        >
          <Info className="w-4 h-4 text-[#A0A0A0] shrink-0" />
          {!collapsed && (
            <div className="truncate">
              <div className="text-[11px] font-bold text-white tracking-tight truncate">
                Prototype Sandbox
              </div>
              <div className="text-[10px] text-[#737373] font-mono truncate">
                CodeTitans 2026
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Settings & User Profile Footer */}
      <div className="p-2 border-t border-[#222222] space-y-1 bg-[#080808]">
        <Link
          href="/settings"
          title={collapsed ? "Settings" : undefined}
          className={`flex items-center rounded text-xs font-medium transition-colors ${
            collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2"
          } ${
            pathname.startsWith("/settings")
              ? "bg-[#141414] text-white border border-[#282828]"
              : "text-[#A0A0A0] hover:text-white hover:bg-[#111111]"
          }`}
        >
          <Settings className="w-4 h-4 text-[#737373] shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {/* User Profile Card */}
        {!collapsed ? (
          <div className="flex items-center justify-between p-2 rounded bg-[#0C0C0C] border border-[#222222] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded bg-[#181818] border border-[#282828] text-white font-bold text-[11px] flex items-center justify-center shrink-0 font-mono">
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">
                  {userName}
                </div>
                <div className="text-[10px] text-[#737373] truncate font-mono">
                  {userRole}
                </div>
              </div>
            </div>
            <span
              className="status-diode status-diode-emerald"
              title="Online"
            />
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <div
              className="w-7 h-7 rounded bg-[#0C0C0C] border border-[#222222] text-white font-bold text-[11px] flex items-center justify-center font-mono"
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
