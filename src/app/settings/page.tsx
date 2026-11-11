"use client";

import React, { useState } from "react";
import {
  Settings,
  Shield,
  Sliders,
  Database,
  Key,
  CheckCircle2,
  Lock,
  Cpu,
  Check,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const [orgName, setOrgName] = useState("Uideas Digital Workspace");
  const [enforceStrictEvidence, setEnforceStrictEvidence] = useState(true);
  const [requireApprovalOnHighRisk, setRequireApprovalOnHighRisk] = useState(true);
  const [autoFlagProhibitedTerms, setAutoFlagProhibitedTerms] = useState(true);
  const [model, setModel] = useState("gemini-2.5-flash");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppLayout
      title="Governance Policies & Organization Settings"
      subtitle="Configure multi-tenant parameters, AI reasoning provider integration, and deterministic guardrail strictness."
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="led-indicator led-turquoise" />
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-100">
                Organization &amp; Policy Controls
              </h1>
              <Badge variant="verified" size="xs">
                SOC 2 TYPE II
              </Badge>
              <span className="gold-badge text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase">
                ZERO PUBLIC TRAINING
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Configure tenant parameters, strict zero-hallucination policies, and automated reviewer gating rules.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button size="sm" variant="gold" onClick={handleSave}>
              Save Policy Changes
            </Button>
          </div>
        </div>

        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Settings updated successfully. All policies are actively enforced across active tenants.</span>
          </div>
        )}

        {/* Organization Information */}
        <div className="tactile-card rounded-xl p-6 space-y-4 bg-[#141414] border border-[#303030]">
          <div className="flex items-center justify-between border-b border-[#303030] pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-white" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Tenant Organization Specifications
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#858585]">POSTGRESQL RLS ENFORCED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-[#858585] mb-1 uppercase text-[11px]">
                ORGANIZATION NAME
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg px-3 py-2 text-white font-sans"
              />
            </div>

            <div>
              <label className="block text-[#858585] mb-1 uppercase text-[11px]">
                TENANT IDENTIFIER (SLUG)
              </label>
              <input
                type="text"
                readOnly
                value="uideas-digital"
                className="w-full bg-[#0A0A0A]/50 border border-[#303030] rounded-lg px-3 py-2 text-[#858585] font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 uppercase text-[11px]">
                GOVERNANCE TIER
              </label>
              <input
                type="text"
                readOnly
                value="Enterprise Multi-Brand (Unlimited Audits)"
                className="w-full bg-[#080C16]/50 border border-[#1E2B4A] rounded-lg px-3 py-2 text-emerald-400 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 uppercase text-[11px]">
                AUDIT REGULATION STANDARD
              </label>
              <input
                type="text"
                readOnly
                value="FTC 16 CFR § 255 · FDA 21 CFR § 101.93"
                className="w-full bg-[#080C16]/50 border border-[#1E2B4A] rounded-lg px-3 py-2 text-slate-300"
              />
            </div>
          </div>
        </div>

        {/* AI Governance Guardrails Configuration */}
        <div className="tactile-card rounded-xl p-6 space-y-4 bg-[#141414] border border-[#303030]">
          <div className="flex items-center justify-between border-b border-[#303030] pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#F59E0B]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Deterministic AI Guardrail Policies
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#10B981] font-semibold">
              ZERO-HALLUCINATION ENFORCED
            </span>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3.5 rounded-lg bg-[#0A0A0A] border border-[#303030] hover:border-[#404040] transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={enforceStrictEvidence}
                onChange={(e) => setEnforceStrictEvidence(e.target.checked)}
                className="mt-0.5 rounded border-[#303030] text-white focus:ring-white"
              />
              <div>
                <div className="font-semibold text-white text-xs">
                  Enforce Strict Zero-Hallucination Retrieval Policy
                </div>
                <div className="text-[#858585] text-[11px] mt-0.5 leading-relaxed font-sans">
                  Any marketing claim or quantitative metric not substantiated in the approved claims library is automatically flagged as unverified. The AI will never invent citations.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-lg bg-[#0A0A0A] border border-[#303030] hover:border-[#404040] transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={requireApprovalOnHighRisk}
                onChange={(e) => setRequireApprovalOnHighRisk(e.target.checked)}
                className="mt-0.5 rounded border-[#303030] text-white focus:ring-white"
              />
              <div>
                <div className="font-semibold text-white text-xs">
                  Mandatory Human Review Gate for High-Risk Findings
                </div>
                <div className="text-[#858585] text-[11px] mt-0.5 leading-relaxed font-sans">
                  Drafts containing critical or high-severity regulatory violations cannot be approved without authorized human reviewer sign-off under 21 CFR Part 11.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-lg bg-[#0A0A0A] border border-[#303030] hover:border-[#404040] transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={autoFlagProhibitedTerms}
                onChange={(e) => setAutoFlagProhibitedTerms(e.target.checked)}
                className="mt-0.5 rounded border-[#303030] text-white focus:ring-white"
              />
              <div>
                <div className="font-semibold text-white text-xs">
                  Deterministic Vocabulary Regex Scanner (<span className="text-white font-mono">5ms Pre-Flight</span>)
                </div>
                <div className="text-[#858585] text-[11px] mt-0.5 leading-relaxed font-sans">
                  Runs instant regex filtering against brand-prohibited terms before invoking LLM contextual reasoning.
                </div>
              </div>
            </label>
          </div>

          <div className="pt-3 border-t border-[#303030]">
            <label className="block text-[#858585] font-mono text-[11px] font-medium mb-1.5 uppercase">
              ACTIVE FOUNDATIONAL REASONING ENGINE
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full sm:w-96 bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg px-3 py-2 text-xs text-white font-mono cursor-pointer"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Grounded Structured Outputs)</option>
              <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (High-Speed Fallback)</option>
              <option value="deterministic-offline">Deterministic Offline Heuristic Scanner (Zero-Latency)</option>
            </select>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
