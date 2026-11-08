"use client";

import React, { useState, useEffect } from "react";
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandKOpen, setIsCommandKOpen] = useState(false);

  // Load sidebar preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("inkloom:sidebar-collapsed");
      if (saved !== null) {
        setIsSidebarCollapsed(saved === "true");
      }
    } catch {
      // Ignore
    }
  }, []);

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
    <div className="flex min-h-screen bg-[#090A10] text-[#F4F6F9] selection:bg-violet-900/60 selection:text-white">
      {/* Global CommandK Quick Switcher Dialog */}
      <CommandK
        isOpen={isCommandKOpen}
        onClose={() => setIsCommandKOpen(false)}
      />

      {/* Left Collapsible Enterprise Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        orgName={currentBrand}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
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
          className={`flex-1 p-5 sm:p-6 lg:p-8 w-full ${
            fullWidth ? "max-w-none" : "max-w-7xl mx-auto"
          } ${className}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
