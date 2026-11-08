"use client";

import React, { useState } from "react";
import { Settings, Shield, Sliders, Database, Key, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
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
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Organisation &amp; Governance Settings
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Configure tenant parameters, AI provider integration, and brand compliance strictness.
            </p>
          </div>

          <Button size="md" variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </div>

        {saved && (
          <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Settings updated successfully. All changes are actively enforced.</span>
          </div>
        )}

        {/* Organisation Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Organisation Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Organisation Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Tenant Identifier (Slug)
                </label>
                <input
                  type="text"
                  readOnly
                  value="uideas-digital"
                  className="w-full bg-[#0B0C14]/50 border border-[#232840] rounded-lg px-3 py-2 text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Plan Tier
                </label>
                <input
                  type="text"
                  readOnly
                  value="Enterprise (Multi-Brand Unlimited)"
                  className="w-full bg-[#0B0C14]/50 border border-[#232840] rounded-lg px-3 py-2 text-emerald-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Default Timezone
                </label>
                <input
                  type="text"
                  readOnly
                  value="UTC / Global Standard"
                  className="w-full bg-[#0B0C14]/50 border border-[#232840] rounded-lg px-3 py-2 text-slate-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Engine & Guardrails Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">AI Governance Guardrails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-lg bg-[#0E101B] border border-[#1E2338] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enforceStrictEvidence}
                  onChange={(e) => setEnforceStrictEvidence(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-violet-600 focus:ring-violet-500"
                />
                <div>
                  <div className="font-semibold text-slate-200">
                    Enforce Strict Zero-Hallucination Retrieval
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Any marketing claim not found in the approved claims library is automatically flagged as unverified. The AI will never invent supporting sources.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg bg-[#0E101B] border border-[#1E2338] cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireApprovalOnHighRisk}
                  onChange={(e) => setRequireApprovalOnHighRisk(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-violet-600 focus:ring-violet-500"
                />
                <div>
                  <div className="font-semibold text-slate-200">
                    Mandatory Human Review Gate for High-Risk Findings
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Drafts containing critical or high-severity issues cannot be marked approved without authorized reviewer sign-off.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg bg-[#0E101B] border border-[#1E2338] cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoFlagProhibitedTerms}
                  onChange={(e) => setAutoFlagProhibitedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-violet-600 focus:ring-violet-500"
                />
                <div>
                  <div className="font-semibold text-slate-200">
                    Deterministic Vocabulary Scanner
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Runs instant regex checks against brand-prohibited terminology before invoking LLM contextual reasoning.
                  </div>
                </div>
              </label>
            </div>

            <div className="pt-2">
              <label className="block text-slate-300 font-medium mb-1">
                Active Reasoning Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full sm:w-80 bg-[#0B0C14] border border-[#232840] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Grounded & Fast)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
