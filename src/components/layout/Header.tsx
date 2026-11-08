"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Plus, ShieldCheck, ChevronDown, Check } from "lucide-react";
import { Button } from "../ui/Button";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  currentBrand?: string;
  onBrandChange?: (brandId: string) => void;
  unreadNotifications?: number;
}

export function Header({
  title,
  subtitle,
  currentBrand = "Apex Nutrition",
  unreadNotifications = 2,
}: HeaderProps) {
  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(currentBrand);

  const brands = [
    { id: "apex", name: "Apex Nutrition", category: "Health & Fitness", active: true },
    { id: "zenith", name: "Zenith Cloud SaaS", category: "Enterprise Software", active: false },
  ];

  return (
    <header className="h-16 border-b border-[#1A1D2E] bg-[#0A0B12]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Optional Title or Breadcrumb */}
      <div>
        {title ? (
          <div>
            <h1 className="text-base font-semibold text-slate-100">{title}</h1>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Active Brand:</span>
            <div className="relative">
              <button
                onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121422] hover:bg-[#181B2E] border border-[#21263D] text-xs font-medium text-slate-200 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{selectedBrand}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isBrandMenuOpen && (
                <div className="absolute left-0 mt-1.5 w-56 rounded-xl bg-[#121424] border border-[#232740] shadow-xl py-1 z-30 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-[#1B1F34]">
                    Select Brand Workspace
                  </div>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBrand(b.name);
                        setIsBrandMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:bg-violet-600/10 hover:text-violet-300 transition-colors text-left"
                    >
                      <div>
                        <div className="font-medium">{b.name}</div>
                        <div className="text-[10px] text-slate-400">{b.category}</div>
                      </div>
                      {selectedBrand === b.name && (
                        <Check className="w-3.5 h-3.5 text-violet-400" />
                      )}
                    </button>
                  ))}
                  <div className="p-1 border-t border-[#1B1F34]">
                    <Link
                      href="/brands"
                      className="block px-3 py-1.5 text-[11px] text-violet-400 hover:text-violet-300 font-medium text-center"
                    >
                      Manage Brands & Guidelines &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Compliance Guard Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Governance Guard Active</span>
        </div>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-lg bg-[#121422] hover:bg-[#191C30] border border-[#21263D] text-slate-300 hover:text-white transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-[#0A0B12]" />
          )}
        </Link>

        {/* Review / Submit Content Button */}
        <Link href="/submissions/new">
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            className="font-medium"
          >
            Review Content
          </Button>
        </Link>
      </div>
    </header>
  );
}
