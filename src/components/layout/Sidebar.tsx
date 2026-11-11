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
  X,
} from "lucide-react";

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
  isMobileOpen = false,
  onCloseMobile,
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
    },
    {
      name: "Submissions",
      href: "/submissions",
      icon: FileText,
      active: pathname.startsWith("/submissions"),
    },
    {
      name: "Knowledge Base",
      href: "/knowledge-base",
      icon: BookOpen,
      active: pathname.startsWith("/knowledge-base"),
    },
    {
      name: "Approvals",
      href: "/approvals",
      icon: CheckCircle2,
      active: pathname.startsWith("/approvals"),
      badge: pendingApprovalsCount,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      active: pathname.startsWith("/analytics"),
    },
    {
      name: "Brand Workspaces",
      href: "/brands",
      icon: ShieldCheck,
      active: pathname.startsWith("/brands"),
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden transition-opacity duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer (Slide-Over, Full Touch Friendly) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0A0A] border-r border-[#282828] flex flex-col md:hidden transition-transform duration-200 ease-in-out shadow-2xl ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile Navigation"
      >
        {/* Mobile Header with Brand & Close Button */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#282828] bg-[#0A0A0A]">
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 min-h-[44px]"
          >
            <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#0A0A0A]" />
            </div>
            <span className="font-semibold text-base tracking-tight text-white flex items-center gap-2">
              Inkloom
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[#1C1C1C] text-[#E0E0E0] border border-[#303030]">
                AI
              </span>
            </span>
          </Link>

          <button
            onClick={onCloseMobile}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#737373] hover:text-white hover:bg-[#191919] transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Brand Workspace */}
        <div className="p-3 border-b border-[#282828] bg-[#0A0A0A]">
          <div className="px-3 py-2.5 rounded-md bg-[#141414] border border-[#282828] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#1F1F1F] border border-[#333333] text-white font-semibold text-xs flex items-center justify-center shrink-0">
              {selectedBrand.charAt(0)}
            </div>
            <div className="truncate">
              <div className="text-sm font-medium text-white truncate">
                {selectedBrand}
              </div>
              <div className="text-xs text-[#888888] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Active Workspace</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Nav items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-3 rounded-md text-sm font-medium min-h-[44px] transition-colors ${
                  item.active
                    ? "bg-[#181818] text-white border border-[#2E2E2E]"
                    : "text-[#A0A0A0] hover:text-white hover:bg-[#141414]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      item.active ? "text-white" : "text-[#737373]"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="h-5 min-w-5 px-1.5 rounded-full bg-[#222222] text-[#FFFFFF] text-xs font-semibold flex items-center justify-center border border-[#333333]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Settings & User Footer */}
        <div className="p-3 border-t border-[#282828] space-y-2 bg-[#0A0A0A]">
          <Link
            href="/settings"
            onClick={onCloseMobile}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium min-h-[44px] transition-colors ${
              pathname.startsWith("/settings")
                ? "bg-[#181818] text-white border border-[#2E2E2E]"
                : "text-[#A0A0A0] hover:text-white hover:bg-[#141414]"
            }`}
          >
            <Settings className="w-5 h-5 text-[#737373] shrink-0" />
            <span>Settings</span>
          </Link>

          <div className="flex items-center justify-between p-2.5 rounded-md bg-[#141414] border border-[#282828]">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-md bg-[#1F1F1F] border border-[#333333] text-white font-semibold text-xs flex items-center justify-center shrink-0">
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-white truncate">
                  {userName}
                </div>
                <div className="text-[11px] text-[#888888] truncate">
                  {userRole}
                </div>
              </div>
            </div>
            <span
              className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"
              title="Online"
            />
          </div>
        </div>
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex bg-[#0A0A0A] border-r border-[#282828] flex-col h-screen sticky top-0 select-none z-30 transition-all duration-150 shrink-0 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
      {/* Brand Header & Collapse Toggle */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#282828] bg-[#0A0A0A]">
        {!collapsed ? (
          <>
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group overflow-hidden"
            >
              <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#0A0A0A]" />
              </div>
              <span className="font-semibold text-base tracking-tight text-white flex items-center gap-2">
                Inkloom
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[#1C1C1C] text-[#E0E0E0] border border-[#303030]">
                  AI
                </span>
              </span>
            </Link>

            <button
              onClick={handleToggle}
              className="p-1.5 rounded-md text-[#737373] hover:text-white hover:bg-[#191919] transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-center">
            <button
              onClick={handleToggle}
              className="p-1.5 rounded-md text-[#737373] hover:text-white hover:bg-[#191919] transition-colors cursor-pointer"
              title="Expand sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Brand Workspace Selector */}
      <div className="p-3 border-b border-[#282828] relative bg-[#0A0A0A]">
        {!collapsed ? (
          <div>
            <button
              onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#141414] hover:bg-[#1A1A1A] border border-[#2E2E2E] hover:border-[#383838] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-6 h-6 rounded bg-[#222222] border border-[#333333] text-white font-semibold text-xs flex items-center justify-center shrink-0">
                  {selectedBrand.charAt(0)}
                </div>
                <div className="truncate">
                  <div className="text-sm font-medium text-white truncate">
                    {selectedBrand}
                  </div>
                  <div className="text-xs text-[#888888] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Active</span>
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-[#737373] shrink-0" />
            </button>

            {/* Brand Dropdown Menu */}
            {isBrandMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsBrandMenuOpen(false)}
                />
                <div className="absolute left-3 right-3 top-16 rounded-xl bg-[#141414] border border-[#303030] shadow-xl py-1 z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-2 text-xs font-semibold text-[#888888] border-b border-[#262626]">
                    Select Brand Workspace
                  </div>
                  {BRANDS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBrand(b.name);
                        setIsBrandMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-[#E0E0E0] hover:text-white hover:bg-[#1E1E1E] transition-colors text-left cursor-pointer"
                    >
                      <div>
                        <div className="font-medium text-white">{b.name}</div>
                        <div className="text-xs text-[#888888]">
                          {b.category}
                        </div>
                      </div>
                      {selectedBrand === b.name && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                  ))}
                  <div className="p-2 border-t border-[#262626]">
                    <Link
                      href="/brands"
                      onClick={() => setIsBrandMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-white hover:text-neutral-300 font-medium rounded-md hover:bg-[#1E1E1E] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
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
              className="w-8 h-8 rounded-md bg-[#141414] border border-[#2E2E2E] text-white font-medium text-xs flex items-center justify-center hover:border-[#3E3E3E] cursor-pointer"
              title={selectedBrand}
            >
              {selectedBrand.charAt(0)}
            </button>
          </div>
        )}
      </div>

      {/* Clean 14-15px Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={`flex items-center rounded-lg text-sm font-medium transition-colors ${
                collapsed
                  ? "justify-center p-2.5"
                  : "justify-between px-3 py-2.5"
              } ${
                item.active
                  ? "bg-[#191919] text-white border border-[#303030]"
                  : "text-[#A0A0A0] hover:text-white hover:bg-[#141414] border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    item.active ? "text-white" : "text-[#888888]"
                  }`}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </div>

              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="h-5 min-w-5 px-1.5 rounded-full bg-[#262626] text-white text-xs font-semibold flex items-center justify-center border border-[#333333]">
                  {item.badge}
                </span>
              )}

              {/* Collapsed Badge Pill */}
              {collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Prototype Notice Callout */}
      <div className="p-3 border-t border-[#282828] bg-[#0A0A0A]">
        <Link
          href="/prototype-notice"
          title={collapsed ? "Prototype Notice: CodeTitans 2026" : undefined}
          className={`flex items-center rounded-lg text-xs transition-colors ${
            collapsed
              ? "justify-center p-2 bg-[#141414] hover:bg-[#1A1A1A]"
              : "gap-2.5 px-3 py-2 bg-[#141414] hover:bg-[#1A1A1A] border border-[#262626]"
          } text-[#D4D4D4] hover:text-white`}
        >
          <Info className="w-4 h-4 text-[#888888] shrink-0" />
          {!collapsed && (
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">
                Prototype Sandbox
              </div>
              <div className="text-[11px] text-[#737373] truncate">
                CodeTitans 2026
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Settings & User Profile Footer */}
      <div className="p-3 border-t border-[#282828] space-y-2 bg-[#0A0A0A]">
        <Link
          href="/settings"
          title={collapsed ? "Settings" : undefined}
          className={`flex items-center rounded-lg text-sm font-medium transition-colors ${
            collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2"
          } ${
            pathname.startsWith("/settings")
              ? "bg-[#191919] text-white border border-[#303030]"
              : "text-[#A0A0A0] hover:text-white hover:bg-[#141414]"
          }`}
        >
          <Settings className="w-4 h-4 text-[#888888] shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {/* User Profile Card */}
        {!collapsed ? (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#141414] border border-[#2E2E2E]">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-md bg-[#222222] border border-[#333333] text-white font-semibold text-xs flex items-center justify-center shrink-0">
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
                <div className="text-[11px] text-[#888888] truncate">
                  {userRole}
                </div>
              </div>
            </div>
            <span
              className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"
              title="Online"
            />
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <div
              className="w-7 h-7 rounded-md bg-[#141414] border border-[#2E2E2E] text-white font-semibold text-xs flex items-center justify-center"
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
    </>
  );
}
