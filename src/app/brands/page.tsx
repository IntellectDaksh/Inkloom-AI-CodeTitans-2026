"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Check,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Building2,
  Database,
  ArrowRight,
  X,
  CheckCircle2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  activeClaims: number;
  submissionsCount: number;
  isActive: boolean;
  description: string;
}

const INITIAL_BRANDS: BrandItem[] = [
  {
    id: "brand_apex",
    name: "Apex Nutrition",
    slug: "apex-nutrition",
    category: "Health, Fitness & Supplements",
    activeClaims: 7,
    submissionsCount: 4,
    isActive: true,
    description: "Clean plant-based athletic recovery and performance nutrition grounded in ISO-22196 double-blind clinical trials.",
  },
  {
    id: "brand_zenith",
    name: "Zenith Cloud SaaS",
    slug: "zenith-cloud",
    category: "Enterprise Cloud Infrastructure",
    activeClaims: 2,
    submissionsCount: 1,
    isActive: false,
    description: "Low-latency distributed database orchestration and four-nines (99.99%) contractual uptime SLAs with SOC 2 Type II attestation.",
  },
  {
    id: "brand_lumina",
    name: "Lumina Clinical Dermatology",
    slug: "lumina-skincare",
    category: "Consumer Cosmetics & OTC",
    activeClaims: 3,
    submissionsCount: 2,
    isActive: false,
    description: "Dermatologist-tested topical bio-peptides for fine surface line reduction complying with FD&C Act and MoCRA guidelines.",
  },
];

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandItem[]>(INITIAL_BRANDS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("Health & Performance");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const newBrand: BrandItem = {
      id: `brand_${Date.now()}`,
      name: nameInput.trim(),
      slug: nameInput.trim().toLowerCase().replace(/\s+/g, "-"),
      category: categoryInput,
      activeClaims: 0,
      submissionsCount: 0,
      isActive: false,
      description: descriptionInput.trim() || "Brand workspace governed by AdSnitch claims repository.",
    };

    setBrands([...brands, newBrand]);
    setIsModalOpen(false);
    setNameInput("");
    setDescriptionInput("");
    setToastMessage(`Brand workspace "${newBrand.name}" deployed with isolated PostgreSQL Row-Level Security.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSetActive = (id: string, name: string) => {
    setBrands(brands.map((b) => ({ ...b, isActive: b.id === id })));
    setToastMessage(`Switched active workspace scope to ${name}.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <AppLayout
      title="Multi-Brand Workspaces & Tenant Partitioning"
      subtitle="Strict Row-Level Security isolation separating claim repositories, voice guidelines, and approval hierarchies between brands."
    >
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="led-indicator led-turquoise" />
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-100">
                Brand Workspaces &amp; Tenancy
              </h1>
              <Badge variant="verified" size="xs">
                {brands.length} WORKSPACES
              </Badge>
              <span className="gold-badge text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase">
                ZERO DATA LEAKAGE GUARANTEED
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Row-Level Security (RLS) guarantees that claims, assay reports, and trial excerpts belonging to Brand A are walled off from Brand B.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              size="sm"
              variant="gold"
              icon={<Plus className="w-3.5 h-3.5 text-[#080C16]" />}
              onClick={() => setIsModalOpen(true)}
            >
              Create Brand Workspace
            </Button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-sans font-medium">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Brand Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {brands.map((b) => (
            <div
              key={b.id}
              className={`tactile-card rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all ${
                b.isActive ? "border-white bg-[#191919]" : "border-[#303030] bg-[#141414]"
              }`}
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#141414] border border-[#303030] text-white font-bold text-sm flex items-center justify-center font-mono shadow-inner">
                      {b.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">{b.name}</h2>
                      <div className="text-[10px] font-mono text-[#858585]">{b.category}</div>
                    </div>
                  </div>
                  {b.isActive ? (
                    <Badge variant="verified" size="xs">
                      Active
                    </Badge>
                  ) : (
                    <button
                      onClick={() => handleSetActive(b.id, b.name)}
                      className="text-[10px] font-mono text-[#858585] hover:text-white transition-colors cursor-pointer"
                    >
                      Set Active
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#B5B5B5] leading-relaxed font-sans">{b.description}</p>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-[#0A0A0A] border border-[#303030] text-xs font-mono">
                  <div>
                    <span className="text-[#858585] block text-[10px]">ACTIVE CLAIMS</span>
                    <span className="text-[#10B981] font-semibold mt-0.5 block font-mono">
                      {b.activeClaims} verified
                    </span>
                  </div>
                  <div>
                    <span className="text-[#858585] block text-[10px]">SUBMISSIONS</span>
                    <span className="text-white font-semibold mt-0.5 block font-mono">
                      {b.submissionsCount} drafts
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#303030] flex items-center justify-between">
                <Link
                  href="/knowledge-base/guidelines"
                  className="text-xs text-white hover:underline font-mono"
                >
                  Voice Rules &rarr;
                </Link>
                <Link href="/submissions">
                  <Button size="xs" variant={b.isActive ? "primary" : "secondary"}>
                    Open Desk
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Create Brand Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="tactile-card rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 border-[#303030] bg-[#141414]">
              <div className="flex items-center justify-between border-b border-[#303030] pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-white" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Deploy Brand Workspace
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#858585] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateBrand} className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="block text-[#858585] mb-1">BRAND NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Performance Labs"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-2.5 text-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[#858585] mb-1">INDUSTRY / SECTOR</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clinical Nutrition & Dietary Supplements"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-2.5 text-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[#858585] mb-1">BRAND DESCRIPTION</label>
                  <textarea
                    rows={3}
                    placeholder="Mission, product line, and regulatory requirements..."
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-2.5 text-[#B5B5B5] font-sans resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#303030]">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" variant="gold">
                    Deploy Tenant Workspace
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
