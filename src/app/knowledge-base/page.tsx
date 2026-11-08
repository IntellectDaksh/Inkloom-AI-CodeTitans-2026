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
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function KnowledgeBaseHubPage() {
  const cards = [
    {
      title: "Brand Guidelines",
      description: "Voice, tone, messaging, do's & don'ts.",
      footer: "Updated 2 days ago",
      icon: FileText,
      href: "/knowledge-base/guidelines",
      color: "text-violet-400",
      bgColor: "bg-violet-600/15 border-violet-500/30",
    },
    {
      title: "Approved Claims",
      description: "Verified and permitted marketing claims.",
      footer: "32 claims · 2 expiring",
      icon: ShieldCheck,
      href: "/knowledge-base/claims",
      color: "text-emerald-400",
      bgColor: "bg-emerald-600/15 border-emerald-500/30",
    },
    {
      title: "Product Information",
      description: "Specifications, features and usage.",
      footer: "Updated 5 days ago",
      icon: Package,
      href: "/knowledge-base/terminology",
      color: "text-indigo-400",
      bgColor: "bg-indigo-600/15 border-indigo-500/30",
    },
    {
      title: "Brand Assets",
      description: "Logos, fonts, colours and templates.",
      footer: "142 files",
      icon: FolderArchive,
      href: "/knowledge-base/assets",
      color: "text-amber-400",
      bgColor: "bg-amber-600/15 border-amber-500/30",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Knowledge Base
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage your brand guidelines, approved claims and assets.
            </p>
          </div>

          <Link href="/knowledge-base/claims">
            <Button size="md" variant="primary" icon={<Plus className="w-4 h-4" />}>
              Add Resource
            </Button>
          </Link>
        </div>

        {/* 4 Primary Grid Cards (Matching Mockup exactly) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.title} href={c.href} className="group">
                <div className="p-6 rounded-xl bg-[#111320] border border-[#1F2338] hover:border-violet-500/40 hover:bg-[#141626] transition-all duration-200 h-full flex flex-col justify-between group-hover:scale-[1.01] shadow-sm">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-11 h-11 rounded-lg flex items-center justify-center border ${c.bgColor}`}
                      >
                        <Icon className={`w-5 h-5 ${c.color}`} />
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-slate-100 group-hover:text-white transition-colors">
                        {c.title}
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {c.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#1C2033] mt-6 text-xs text-slate-500 font-medium">
                    {c.footer}
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
