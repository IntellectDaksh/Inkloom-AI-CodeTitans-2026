"use client";

import React from "react";
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
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  pendingApprovalsCount?: number;
  userName?: string;
  userRole?: string;
  orgName?: string;
}

export function Sidebar({
  pendingApprovalsCount = 3,
  userName = "Daksh Agrawal",
  userRole = "Admin",
  orgName = "Uideas Digital Workspace",
}: SidebarProps) {
  const pathname = usePathname();

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
  ];

  return (
    <aside className="w-64 bg-[#0C0D15] border-r border-[#1B1E2E] flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#181B2A]">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-900/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
            Inkloom <span className="text-violet-400 font-semibold text-xs px-1.5 py-0.5 rounded bg-violet-500/15 border border-violet-500/30">AI</span>
          </span>
        </Link>
      </div>

      {/* Workspace Selector */}
      <div className="px-3 py-3 border-b border-[#181B2A]/60">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#121422] hover:bg-[#181B2D] border border-[#21253B] transition-colors text-left group">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-6 h-6 rounded bg-violet-600/30 border border-violet-500/40 text-violet-300 font-bold text-xs flex items-center justify-center shrink-0">
              {orgName.charAt(0)}
            </div>
            <div className="truncate">
              <div className="text-xs font-medium text-slate-200 truncate group-hover:text-white">
                {orgName}
              </div>
              <div className="text-[10px] text-slate-400">Default Workspace</div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                item.active
                  ? "bg-violet-600/15 text-violet-300 border border-violet-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#131525]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    item.active ? "text-violet-400" : "text-slate-400"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[11px] font-bold flex items-center justify-center shadow-sm shadow-violet-900/40">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Area: Settings & User Profile */}
      <div className="p-3 border-t border-[#181B2A] space-y-2">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname.startsWith("/settings")
              ? "bg-violet-600/15 text-violet-300 border border-violet-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#131525]"
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </Link>

        {/* User Card */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#111320] border border-[#1F2338]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-purple-400 text-white font-semibold text-xs flex items-center justify-center shrink-0 border border-violet-400/40">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="truncate">
              <div className="text-xs font-medium text-slate-200 truncate">
                {userName}
              </div>
              <div className="text-[10px] text-slate-400">{userRole}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
