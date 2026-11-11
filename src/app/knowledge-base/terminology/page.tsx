"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  Check,
  AlertOctagon,
  Plus,
  Search,
  X,
  CheckCircle2,
  Tag,
  ShieldAlert,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ProhibitedTerm {
  term: string;
  reason: string;
  severity: "critical" | "high" | "medium";
  replacement: string;
}

interface PreferredTerm {
  term: string;
  usage: string;
}

const INITIAL_PROHIBITED: ProhibitedTerm[] = [
  {
    term: "magic bullet",
    reason: "Sensationalist, scientifically invalid under FDA/FTC substantiation doctrine.",
    severity: "critical",
    replacement: "effective, evidence-based formula",
  },
  {
    term: "miracle",
    reason: "Statutory disease claim violation under FD&C Act § 201 and FTC Act § 5.",
    severity: "critical",
    replacement: "clinically evaluated formulation",
  },
  {
    term: "cure",
    reason: "Dietary supplements cannot claim to diagnose, treat, prevent, or cure any medical condition.",
    severity: "critical",
    replacement: "supports natural recovery and vitality",
  },
  {
    term: "cheat code",
    reason: "Off-brand bro-science phrasing; diminishes clinical authority and trust.",
    severity: "high",
    replacement: "scientifically calibrated nutrition",
  },
  {
    term: "instant fix",
    reason: "Unsubstantiated acute timeframe promise lacking pharmacodynamic data.",
    severity: "high",
    replacement: "accelerated bio-availability",
  },
  {
    term: "guaranteed overnight",
    reason: "Statutory breach risk; deceptive marketing practice under FTC 16 CFR § 255.",
    severity: "high",
    replacement: "proven consistent results over 8 weeks",
  },
  {
    term: "effortless",
    reason: "Misrepresents physiological requirements for resistance training and balanced nutrition.",
    severity: "medium",
    replacement: "streamlined, convenient support",
  },
];

const INITIAL_PREFERRED: PreferredTerm[] = [
  {
    term: "bio-available",
    usage: "Refers to amino acid uptake and plasma kinetics verified in ISO-9001-NTR.",
  },
  {
    term: "sustained cellular hydration",
    usage: "Supported by electrolyte osmolality clinical study CPET-2024-B.",
  },
  {
    term: "clean sports certified",
    usage: "Refers to Informed-Sport batch testing against WADA banned substances.",
  },
  {
    term: "accelerated protein synthesis",
    usage: "Backed by Peer-Reviewed RCT Study APX-2024-C3 (DOI 10.1016/j.nutres.2024.108421).",
  },
];

export default function TerminologyPage() {
  const [search, setSearch] = useState("");
  const [prohibitedTerms, setProhibitedTerms] = useState<ProhibitedTerm[]>(INITIAL_PROHIBITED);
  const [preferredTerms, setPreferredTerms] = useState<PreferredTerm[]>(INITIAL_PREFERRED);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ruleType, setRuleType] = useState<"prohibited" | "preferred">("prohibited");
  const [termInput, setTermInput] = useState("");
  const [reasonInput, setReasonInput] = useState("");
  const [replacementInput, setReplacementInput] = useState("");
  const [severityInput, setSeverityInput] = useState<"critical" | "high" | "medium">("critical");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredProhibited = prohibitedTerms.filter(
    (t) =>
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.reason.toLowerCase().includes(search.toLowerCase()) ||
      t.replacement.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPreferred = preferredTerms.filter(
    (p) =>
      p.term.toLowerCase().includes(search.toLowerCase()) ||
      p.usage.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termInput.trim()) return;

    if (ruleType === "prohibited") {
      const newProhibited: ProhibitedTerm = {
        term: termInput.trim().toLowerCase(),
        reason: reasonInput.trim() || "Brand policy violation",
        severity: severityInput,
        replacement: replacementInput.trim() || "compliant phrasing",
      };
      setProhibitedTerms([newProhibited, ...prohibitedTerms]);
      setToastMessage(`Prohibited term "${termInput}" added to deterministic regex filter.`);
    } else {
      const newPreferred: PreferredTerm = {
        term: termInput.trim().toLowerCase(),
        usage: reasonInput.trim() || "Authorized brand terminology",
      };
      setPreferredTerms([newPreferred, ...preferredTerms]);
      setToastMessage(`Preferred term "${termInput}" added to approved brand vocabulary.`);
    }

    setIsModalOpen(false);
    setTermInput("");
    setReasonInput("");
    setReplacementInput("");
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <AppLayout
      title="Brand Terminology & Vocabulary Dictionary"
      subtitle="Deterministic dictionary checked in real-time by the pre-flight regex scanner before content reaches human review."
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
              <span>KNOWLEDGE BASE / TERMINOLOGY</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="led-indicator led-turquoise" />
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-100">
                Brand Terminology &amp; Messaging Rules
              </h1>
              <Badge variant="verified" size="xs">
                {prohibitedTerms.length + preferredTerms.length} DICTIONARY TERMS
              </Badge>
              <span className="gold-badge text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase">
                INSTANT REGEX PRE-FLIGHT
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Deterministic dictionary checked in milliseconds before invoking LLM contextual analysis. Flags banned superlatives and enforces preferred scientific terminology.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              size="sm"
              variant="gold"
              icon={<Plus className="w-3.5 h-3.5 text-[#080C16]" />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Terminology Rule
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

        {/* Search Bar */}
        <div className="tactile-card rounded-xl p-3 max-w-md">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search prohibited or preferred vocabulary..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 font-mono placeholder:text-slate-600 transition-colors"
            />
          </div>
        </div>

        {/* Dual Grid: Prohibited & Preferred */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prohibited Terms */}
          <div className="tactile-card rounded-xl overflow-hidden space-y-0">
            <div className="p-4 border-b border-[#1E2B4A] bg-[#0A0F1D] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Prohibited Terminology ({filteredProhibited.length})
                </h3>
              </div>
              <Badge variant="critical" size="xs">
                Zero Tolerance
              </Badge>
            </div>

            <div className="divide-y divide-[#162038]">
              {filteredProhibited.map((t) => (
                <div key={t.term} className="p-4 space-y-2 hover:bg-[#111C35]/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25">
                      &ldquo;{t.term}&rdquo;
                    </span>
                    <Badge variant={t.severity} size="xs" mono>
                      {t.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{t.reason}</p>
                  <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 pt-0.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Approved alternative: <em className="text-slate-100 font-medium font-sans">&ldquo;{t.replacement}&rdquo;</em></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preferred Terms */}
          <div className="tactile-card rounded-xl overflow-hidden space-y-0">
            <div className="p-4 border-b border-[#1E2B4A] bg-[#0A0F1D] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Preferred Vocabulary ({filteredPreferred.length})
                </h3>
              </div>
              <Badge variant="verified" size="xs">
                Approved
              </Badge>
            </div>

            <div className="divide-y divide-[#162038]">
              {filteredPreferred.map((p) => (
                <div key={p.term} className="p-4 space-y-2 hover:bg-[#111C35]/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                      &ldquo;{p.term}&rdquo;
                    </span>
                    <span className="text-[10px] font-mono text-[#00F2FE]">ENCOURAGED</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{p.usage}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Term Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="tactile-card rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 border-[#303030] bg-[#141414]">
              <div className="flex items-center justify-between border-b border-[#303030] pb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-white" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Add Vocabulary Rule
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#858585] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddTerm} className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">RULE TYPE</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRuleType("prohibited")}
                      className={`py-2 rounded-lg border font-semibold transition-all cursor-pointer ${
                        ruleType === "prohibited"
                          ? "bg-red-500/20 text-red-400 border-red-500/50"
                          : "bg-[#0A0A0A] text-[#858585] border-[#303030]"
                      }`}
                    >
                      Prohibited Term
                    </button>
                    <button
                      type="button"
                      onClick={() => setRuleType("preferred")}
                      className={`py-2 rounded-lg border font-semibold transition-all cursor-pointer ${
                        ruleType === "preferred"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                          : "bg-[#0A0A0A] text-[#858585] border-[#303030]"
                      }`}
                    >
                      Preferred Term
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[#858585] mb-1">WORD OR PHRASE *</label>
                  <input
                    type="text"
                    required
                    placeholder={ruleType === "prohibited" ? "e.g. miracle cure" : "e.g. bio-available"}
                    value={termInput}
                    onChange={(e) => setTermInput(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                {ruleType === "prohibited" && (
                  <>
                    <div>
                      <label className="block text-[#858585] mb-1">SEVERITY LEVEL</label>
                      <select
                        value={severityInput}
                        onChange={(e) => setSeverityInput(e.target.value as any)}
                        className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-2.5 text-[#B5B5B5] cursor-pointer"
                      >
                        <option value="critical">Critical (Statutory Red-Line)</option>
                        <option value="high">High (Substantiation Required)</option>
                        <option value="medium">Medium (Style &amp; Tone Deviation)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#858585] mb-1">APPROVED COMPLIANT ALTERNATIVE *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. clinically tested formulation"
                        value={replacementInput}
                        onChange={(e) => setReplacementInput(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-2.5 text-white font-sans"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-slate-400 mb-1">
                    {ruleType === "prohibited" ? "STATUTORY REASON / JUSTIFICATION *" : "APPROVED USAGE CONTEXT *"}
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder={
                      ruleType === "prohibited"
                        ? "e.g. Medical claim violation under FDA 21 CFR § 101.93"
                        : "e.g. Backed by Clinical Trial CT-2024-B8"
                    }
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
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
                    Add to Dictionary
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
