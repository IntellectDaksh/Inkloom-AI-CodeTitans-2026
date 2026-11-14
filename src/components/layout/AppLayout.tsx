"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header, HeaderBreadcrumb } from "./Header";
import { CommandK } from "../ui/CommandK";
import { PageMotion } from "./Motion";
import { FloatingLayer } from "./FloatingLayer";
import { WorkspacePicker } from "../guide/WorkspacePicker";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="relative isolate flex min-h-screen bg-canvas text-text-primary overflow-x-hidden">
      <div className="atmosphere" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      <FloatingLayer density="app" />
      <WorkspacePicker />

      {/* Global CommandK Quick Switcher Dialog */}
      <CommandK
        isOpen={isCommandKOpen}
        onClose={() => setIsCommandKOpen(false)}
      />

      {/* Left Collapsible Enterprise Swiss Sidebar & Mobile Drawer */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        orgName={currentBrand}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Swiss Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          breadcrumbs={breadcrumbs}
          currentBrand={currentBrand}
          onBrandChange={onBrandChange}
          unreadNotifications={unreadNotifications}
          onOpenCommandK={() => setIsCommandKOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        <main
          className={`flex-1 p-4 sm:p-6 lg:p-10 w-full min-w-0 ${
            fullWidth ? "max-w-none" : "max-w-7xl mx-auto"
          } ${className}`}
        >
          <PageMotion>{children}</PageMotion>
        </main>
      </div>
    </div>
  );
}
