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
      className={`bg-[#0C0E14] border-r border-[#1C202F] flex flex-col h-screen sticky top-0 select-none z-30 transition-all duration-200 shrink-0 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header & Collapse Toggle */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-[#1C202F]">
        {!collapsed ? (
          <>
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group overflow-hidden"
            >
              <div className="w-7 h-7 rounded-lg bg-violet-600 border border-violet-400/40 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-[#F4F6F9] flex items-center gap-1.5">
                Inkloom
                <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-violet-950/60 text-violet-300 border border-violet-500/30">
                  AI
                </span>
              </span>
            </Link>

            <button
              onClick={handleToggle}
              className="p-1.5 rounded-md text-[#64748B] hover:text-[#F4F6F9] hover:bg-[#141722] transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-center">
            <button
              onClick={handleToggle}
              className="p-1.5 rounded-md text-[#64748B] hover:text-[#F4F6F9] hover:bg-[#141722] transition-colors"
              title="Expand sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Brand Workspace Selector */}
      <div className="p-2 border-b border-[#1C202F] relative">
        {!collapsed ? (
          <div>
            <button
              onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-[#0F1117] hover:bg-[#141722] border border-[#1C202F] hover:border-[#2B3248] transition-colors text-left group"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-5 h-5 rounded bg-violet-950/60 border border-violet-500/40 text-violet-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                  {selectedBrand.charAt(0)}
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium text-[#F4F6F9] truncate">
                    {selectedBrand}
                  </div>
                  <div className="text-[10px] text-[#64748B] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    <span>Workspace Active</span>
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B] shrink-0 group-hover:text-[#94A3B8]" />
            </button>

            {/* Brand Dropdown Menu */}
            {isBrandMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsBrandMenuOpen(false)}
                />
                <div className="absolute left-2 right-2 top-14 rounded-lg bg-[#0F1117] border border-[#1C202F] shadow-2xl py-1 z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#64748B] font-semibold border-b border-[#1C202F]">
                    Switch Brand Workspace
                  </div>
                  {BRANDS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBrand(b.name);
                        setIsBrandMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#94A3B8] hover:text-[#F4F6F9] hover:bg-[#141722] transition-colors text-left"
                    >
                      <div>
                        <div className="font-medium text-[#F4F6F9]">{b.name}</div>
                        <div className="text-[10px] text-[#64748B]">
                          {b.category}
                        </div>
                      </div>
                      {selectedBrand === b.name && (
                        <Check className="w-3.5 h-3.5 text-violet-400" />
                      )}
                    </button>
                  ))}
                  <div className="p-1 border-t border-[#1C202F]">
                    <Link
                      href="/brands"
                      onClick={() => setIsBrandMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] text-violet-400 hover:text-violet-300 font-medium rounded hover:bg-[#141722]"
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
              className="w-8 h-8 rounded-lg bg-[#0F1117] border border-[#1C202F] text-violet-300 font-bold text-xs flex items-center justify-center hover:border-violet-500/40"
              title={selectedBrand}
            >
              {selectedBrand.charAt(0)}
            </button>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={`relative flex items-center rounded-lg text-xs font-medium transition-all duration-120 group ${
                collapsed
                  ? "justify-center p-2.5"
                  : "justify-between px-3 py-2"
              } ${
                item.active
                  ? "bg-[#141722] text-[#F4F6F9] border border-[#2B3248]"
                  : "text-[#94A3B8] hover:text-[#F4F6F9] hover:bg-[#141722]/60 border border-transparent"
              }`}
            >
              {/* Left hairline active indicator */}
              {item.active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-violet-500 rounded-r" />
              )}

              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    item.active
                      ? "text-violet-400"
                      : "text-[#64748B] group-hover:text-[#94A3B8]"
                  }`}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </div>

              {!collapsed && (
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="h-4 min-w-4 px-1 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                  {item.shortcut && (
                    <kbd className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] px-1 py-0.2 rounded bg-[#090A10] border border-[#1C202F] text-[#64748B]">
                      {item.shortcut}
                    </kbd>
                  )}
                </div>
              )}

              {/* Collapsed Badge Pill */}
              {collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-violet-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings & User Profile Footer */}
      <div className="p-2 border-t border-[#1C202F] space-y-1.5 bg-[#0A0B10]">
        <Link
          href="/settings"
          title={collapsed ? "Settings" : undefined}
          className={`flex items-center rounded-lg text-xs font-medium transition-colors ${
            collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2"
          } ${
            pathname.startsWith("/settings")
              ? "bg-[#141722] text-[#F4F6F9] border border-[#2B3248]"
              : "text-[#94A3B8] hover:text-[#F4F6F9] hover:bg-[#141722]/60"
          }`}
        >
          <Settings className="w-4 h-4 text-[#64748B] shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {/* User Profile Card */}
        {!collapsed ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#0F1117] border border-[#1C202F]">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded-md bg-violet-950/80 border border-violet-500/40 text-violet-300 font-semibold text-[11px] flex items-center justify-center shrink-0">
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-[#F4F6F9] truncate">
                  {userName}
                </div>
                <div className="text-[10px] text-[#64748B] truncate">
                  {userRole}
                </div>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Online" />
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <div
              className="w-7 h-7 rounded-md bg-violet-950/80 border border-violet-500/40 text-violet-300 font-semibold text-[11px] flex items-center justify-center"
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
