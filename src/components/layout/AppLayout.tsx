"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header, HeaderBreadcrumb } from "./Header";
import { CommandK } from "../ui/CommandK";

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
  unreadNotifications = 2,
  fullWidth = false,
  className = "",
}: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("inkloom:sidebar-collapsed") === "true";
      } catch {
        return false;
      }
    }
    return false;
  });

  const [isCommandKOpen, setIsCommandKOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("inkloom:sidebar-collapsed", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-[#080808] text-white selection:bg-white/20 selection:text-white">
      {/* Global CommandK Quick Switcher Dialog */}
      <CommandK
        isOpen={isCommandKOpen}
        onClose={() => setIsCommandKOpen(false)}
      />

      {/* Left Collapsible Enterprise Swiss Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        orgName={currentBrand}
      />

      {/* Main Swiss Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#080808]">
        <Header
          title={title}
          subtitle={subtitle}
          breadcrumbs={breadcrumbs}
          currentBrand={currentBrand}
          onBrandChange={onBrandChange}
          unreadNotifications={unreadNotifications}
          onOpenCommandK={() => setIsCommandKOpen(true)}
        />

        <main
          className={`flex-1 p-6 sm:p-8 lg:p-10 w-full ${
            fullWidth ? "max-w-none" : "max-w-7xl mx-auto"
          } ${className}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
