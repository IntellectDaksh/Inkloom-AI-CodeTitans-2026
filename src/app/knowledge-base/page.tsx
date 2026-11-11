"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  Package,
  FolderArchive,
  Plus,
  ArrowRight,
  Sparkles,
  BookOpen,
  Tag,
  Database,
  Layers,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function KnowledgeBaseHubPage() {
  const cards = [
    {
      title: "Approved Marketing Claims",
      description: "Substantiated clinical and regulatory claims with expiration countdowns and cascade re-review triggers.",
      footer: "32 verified claims · 2 expiring soon",
      icon: ShieldCheck,
      href: "/knowledge-base/claims",
      color: "text-[#10B981]",
      bgColor: "bg-[#0C1A14] border-[#10B981]/30",
    },
    {
      title: "Brand Voice Guidelines",
      description: "Authoritative voice & tone rules, required medical disclaimers, and clear do's & don'ts.",
      footer: "Active & enforced by pre-flight engine",
      icon: BookOpen,
      href: "/knowledge-base/guidelines",
      color: "text-white",
      bgColor: "bg-[#191919] border-[#303030]",
    },
    {
      title: "Brand Terminology & Glossary",
      description: "Deterministic vocabulary dictionary checking banned superlatives and preferred scientific keywords.",
      footer: "Real-time regex scanner (5ms latency)",
      icon: Tag,
      href: "/knowledge-base/terminology",
      color: "text-[#F59E0B]",
      bgColor: "bg-[#1C1608] border-[#F59E0B]/30",
    },
    {
      title: "Trial Documents & Evidence Assets",
      description: "Uploaded clinical trial PDFs, ISO assay certificates, and third-party laboratory documentation.",
      footer: "4 source documents · 11 extracted claims",
      icon: FolderArchive,
      href: "/knowledge-base/assets",
      color: "text-white",
      bgColor: "bg-[#191919] border-[#303030]",
    },
  ];

  return (
    <AppLayout
      title="Knowledge Base & Ground Truth Repository"
      subtitle="Single source of truth linking marketing communications to certified clinical trials and regulatory filings."
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="led-indicator led-emerald" />
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                Knowledge Base &amp; Truth Directory
              </h1>
              <Badge variant="verified" size="xs">
                IMMUTABLE EVIDENCE
              </Badge>
              <span className="gold-badge text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase">
                ISO 22196 GROUNDED
              </span>
            </div>
            <p className="text-xs text-[#858585] max-w-2xl leading-relaxed">
              Every factual assertion in Inkloom must map to an active record in this library. Zero ungrounded modifications permitted by the AI governance pipeline.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/knowledge-base/claims">
              <Button size="sm" variant="gold" icon={<Plus className="w-3.5 h-3.5 text-black" />}>
                Add Approved Claim
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Primary Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.title} href={c.href} className="group">
                <div className="tactile-card rounded-xl p-6 h-full flex flex-col justify-between group-hover:border-[#404040] transition-all shadow-lg space-y-5 bg-[#141414] border border-[#303030]">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-11 h-11 rounded-lg flex items-center justify-center border shadow-inner ${c.bgColor}`}
                      >
                        <Icon className={`w-5 h-5 ${c.color}`} />
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#858585] group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-white group-hover:text-white transition-colors">
                        {c.title}
                      </h2>
                      <p className="text-xs text-[#B5B5B5] mt-1 leading-relaxed font-sans">
                        {c.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#303030] text-[11px] text-[#858585] font-mono font-medium flex items-center justify-between">
                    <span>{c.footer}</span>
                    <span className="text-white font-sans">Manage &rarr;</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
