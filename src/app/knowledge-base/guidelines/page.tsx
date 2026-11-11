"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  XCircle,
  Sparkles,
  Plus,
  X,
  ShieldCheck,
  Check,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface GuidelineRule {
  category: string;
  title: string;
  description: string;
  dos: string[];
  donts: string[];
}

const INITIAL_GUIDELINES: GuidelineRule[] = [
  {
    category: "Voice & Tone",
    title: "Authoritative, Science-Backed, and Energetic",
    description:
      "Speak with grounded confidence. Avoid hyperbole, buzzwords, or sensationalism. Educate rather than pressure.",
    dos: [
      "Use active, empowering language ('Fuel your peak athletic performance')",
      "Attribute speed and absorption claims to documented clinical trials and published DOIs",
      "Keep language approachable for both competitive athletes and everyday fitness enthusiasts",
    ],
    donts: [
      "Never use miraculous or cure-oriented phrases ('magic bullet', 'miracle cure', 'cheat code')",
      "Never guarantee specific timeframes without verified clinical backup ('build muscle in 14 days')",
      "Avoid aggressive bro-science or fear-based marketing",
    ],
  },
  {
    category: "Messaging Standards",
    title: "Clean Sourcing & Ingredient Transparency",
    description:
      "Every raw ingredient claim must reflect third-party laboratory verification and sustainable supply chains.",
    dos: [
      "Highlight 100% bio-available plant proteins and complete amino acid profile",
      "Mention non-GMO and eco-certified packaging where relevant",
    ],
    donts: [
      "Do not claim 100% absorption without citing Lab Certificate ISO-9001-NTR",
      "Do not disparage entire categories of competitors without independent audit data",
    ],
  },
];

export default function BrandGuidelinesPage() {
  const [guidelines, setGuidelines] = useState<GuidelineRule[]>(INITIAL_GUIDELINES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCategory, setFormCategory] = useState("Voice & Tone");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDos, setFormDos] = useState("");
  const [formDonts, setFormDonts] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newRule: GuidelineRule = {
      category: formCategory,
      title: formTitle,
      description: formDescription,
      dos: formDos
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      donts: formDonts
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    setGuidelines([newRule, ...guidelines]);
    setIsModalOpen(false);
    setFormTitle("");
    setFormDescription("");
    setFormDos("");
    setFormDonts("");
    setToastMessage(`Brand guideline "${formTitle}" added and actively enforced by deterministic pre-flight engine.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <AppLayout
      title="Brand Voice & Regulatory Guidelines"
      subtitle="Deterministic rules and voice parameters enforced across copy generation and human review triage."
    >
      <div className="space-y-6">
        {/* Breadcrumb & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Link
              href="/knowledge-base"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>KNOWLEDGE BASE / BRAND GUIDELINES</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="led-indicator led-turquoise" />
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-100">
                Brand Voice Guidelines &amp; Rules
              </h1>
              <Badge variant="verified" size="xs">
                {guidelines.length} ACTIVE RULES
              </Badge>
              <span className="gold-badge text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase">
                PRE-FLIGHT REGEX SYNCED
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Authoritative brand rules used by the deterministic governance engine to evaluate tone, superlative leakage, and regulatory consistency.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              size="sm"
              variant="gold"
              icon={<Plus className="w-3.5 h-3.5 text-[#080C16]" />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Guideline Rule
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

        {/* Guidelines List */}
        <div className="space-y-6">
          {guidelines.map((g, idx) => (
            <div key={idx} className="tactile-card rounded-xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2B4A] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00F2FE] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25">
                      {g.category}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">RULE #{idx + 1}</span>
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight">{g.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="led-indicator led-emerald" />
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold uppercase">
                    ACTIVE &amp; ENFORCED
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">{g.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                {/* Do's */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                  <div className="font-semibold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approved Language &amp; Practices (Do&apos;s)</span>
                  </div>
                  <ul className="space-y-2 text-slate-200">
                    {g.dos.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">&bull;</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Don'ts */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                  <div className="font-semibold text-rose-400 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    <span>Prohibited Violations (Don&apos;ts)</span>
                  </div>
                  <ul className="space-y-2 text-slate-200">
                    {g.donts.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">&bull;</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Guideline Rule Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="tactile-card rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 border-cyan-500/40">
              <div className="flex items-center justify-between border-b border-[#1E2B4A] pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#00F2FE]" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100">
                    Add Brand Guideline Rule
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddRule} className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">CATEGORY</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg p-2.5 text-slate-200 cursor-pointer"
                  >
                    <option value="Voice & Tone">Voice &amp; Tone</option>
                    <option value="Messaging Standards">Messaging Standards</option>
                    <option value="Regulatory Safety">Regulatory Safety</option>
                    <option value="Channel Format">Channel Format</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">RULE TITLE *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clinical Efficacy & Substantiation Standards"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg p-2.5 text-slate-200 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">RULE DESCRIPTION *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Summary of brand policy and legal rationale..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg p-2.5 text-slate-200 font-sans resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">APPROVED LANGUAGE (DO'S) — 1 PER LINE</label>
                  <textarea
                    rows={2}
                    placeholder="Fuel your peak performance&#10;Backed by double-blind clinical trials"
                    value={formDos}
                    onChange={(e) => setFormDos(e.target.value)}
                    className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg p-2.5 text-slate-200 font-sans resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">PROHIBITED PHRASES (DON'TS) — 1 PER LINE</label>
                  <textarea
                    rows={2}
                    placeholder="Never guarantee overnight results&#10;Never claim to cure chronic disease"
                    value={formDonts}
                    onChange={(e) => setFormDonts(e.target.value)}
                    className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg p-2.5 text-slate-200 font-sans resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#1E2B4A]">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" variant="gold">
                    Enforce Rule
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
