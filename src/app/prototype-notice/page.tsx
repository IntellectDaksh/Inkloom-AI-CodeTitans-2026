"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface MockRole {
  id: "admin" | "reviewer" | "creator";
  name: string;
  role: string;
  email: string;
  badge: string;
  accent: "gold" | "turquoise" | "secondary";
  userId: string;
  scope: string;
  description: string;
}

const MOCK_ROLES: MockRole[] = [
  {
    id: "admin",
    name: "Daksh Agrawal",
    role: "Admin / Brand Director",
    email: "daksh@uideas.digital",
    badge: "ADMINISTRATIVE PROTOCOL",
    accent: "gold",
    userId: "00000000-0000-4000-a000-000000000010",
    scope: "Full organization governance, claim approvals & brand policy engine",
    description: "Complete control over Apex Nutrition and Zenith Cloud rule configuration, compliance thresholds, and team permissions.",
  },
  {
    id: "reviewer",
    name: "Laksh K.",
    role: "Compliance & Legal Reviewer",
    email: "laksh@uideas.digital",
    badge: "LEGAL REVIEW GATEWAY",
    accent: "turquoise",
    userId: "00000000-0000-4000-a000-000000000012",
    scope: "Multi-tier approval queue, surgical diff sign-off & claim verification",
    description: "Audit incoming drafts against regulatory citations, review flagged violations, and grant deterministic clearance.",
  },
  {
    id: "creator",
    name: "Riddhi S.",
    role: "Content Creator / Copywriter",
    email: "riddhi@uideas.digital",
    badge: "CREATOR SANDBOX",
    accent: "secondary",
    userId: "00000000-0000-4000-a000-000000000011",
    scope: "Pre-flight audit submission, surgical rewrite inspection & instant checks",
    description: "Submit copy across ad, social, and packaging channels with instant grounded feedback and one-click token replacement.",
  },
];

export default function PrototypeNoticePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [isBypassing, setIsBypassing] = useState(false);
  const [bypassSuccess, setBypassSuccess] = useState<string | null>(null);

  const handleRoleBypass = (roleItem: MockRole) => {
    setSelectedRole(roleItem.id);
    setIsBypassing(true);

    try {
      localStorage.setItem(
        "inkloom:session",
        JSON.stringify({
          name: roleItem.name,
          role: roleItem.id === "admin" ? "Admin" : roleItem.id === "reviewer" ? "Reviewer" : "Creator",
          email: roleItem.email,
          userId: roleItem.userId,
        })
      );
    } catch {
      // Ignore
    }

    setBypassSuccess(roleItem.name);

    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#080C16] text-[#F8FAFC] flex flex-col selection:bg-[#00F2FE]/30 selection:text-white">
      {/* Top Swiss Header Bar */}
      <header className="h-16 border-b border-[#1E2E50] bg-[#080C16] px-6 sm:px-10 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-[#FBBF24] to-[#D97706] border border-[#F59E0B] flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_2px_4px_rgba(0,0,0,0.5)]">
              <ShieldCheck className="w-5 h-5 text-[#080C16]" />
            </div>
            <span className="font-bold text-base tracking-tight text-[#F8FAFC]">
              Inkloom
              <span className="text-[10px] ml-1.5 uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/35">
                AI
              </span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5A93C]/10 border border-[#E5A93C]/30 text-[#FBBF24] text-xs font-mono font-bold tracking-wider">
            <span className="hardware-led hardware-led-gold" />
            <span>SYSTEM NOTICE · CODETITANS 2026</span>
          </div>

          <Button
            size="sm"
            variant="secondary"
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={() => router.push("/dashboard")}
          >
            Back to Application
          </Button>
        </div>
      </header>

      {/* Main Console Canvas */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-5 py-8 sm:py-12 space-y-8">
        {/* Notice Hero Banner */}
        <div className="tactile-card p-6 sm:p-8 relative overflow-hidden border-[#2A406E]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-[#00F2FE]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#1C2B4A] to-[#15223C] border border-[#2A406E] flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] text-[#FBBF24]">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="gold" dot mono size="sm">
                  PROTOTYPE SANDBOX
                </Badge>
                <span className="text-xs font-mono text-[#94A3B8]">
                  ENV: CODETITANS-PREVIEW-2026.04
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC]">
                Prototype Environment Notice: Production Backend Authentication & SSO is currently under active integration for CodeTitans 2026.
              </h1>

              <p className="text-sm text-[#CBD5E1] leading-relaxed max-w-3xl">
                This deployment is a deterministic, high-fidelity sandbox. It operates with a fully integrated in-memory and local mock persistence layer, Gemini AI governance engine, vector retrieval claims index, and multi-brand rule matrix. Production external SSO and metered enterprise billing are gated behind this prototype bridge.
              </p>
            </div>
          </div>
        </div>

        {/* System Architecture Telemetry Grid */}
        <div className="space-y-3">
          <div className="swiss-label">Integration Telemetry & Subsystem Diagnostics</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Subsystem 1 */}
            <div className="tactile-card p-4 space-y-2 border-[#1E2E50]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#94A3B8] font-bold tracking-wider">
                  Engine Core
                </span>
                <span className="hardware-led hardware-led-turquoise" />
              </div>
              <div className="text-sm font-bold text-[#F8FAFC]">
                Gemini AI Rules Engine
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-tight">
                Deterministic regex + vector semantic analysis for claims and brand voice.
              </p>
              <div className="pt-1 text-[10px] font-mono text-[#00F2FE] font-bold">
                STATUS: 100% OPERATIONAL
              </div>
            </div>

            {/* Subsystem 2 */}
            <div className="tactile-card p-4 space-y-2 border-[#1E2E50]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#94A3B8] font-bold tracking-wider">
                  Knowledge Base
                </span>
                <span className="hardware-led hardware-led-emerald" />
              </div>
              <div className="text-sm font-bold text-[#F8FAFC]">
                Claims & Provenance Store
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-tight">
                Apex Nutrition and Zenith Cloud substantiated proof claims indexed.
              </p>
              <div className="pt-1 text-[10px] font-mono text-emerald-400 font-bold">
                STATUS: PRE-LOADED VECTORS
              </div>
            </div>

            {/* Subsystem 3 */}
            <div className="tactile-card p-4 space-y-2 border-[#E5A93C]/40">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#FBBF24] font-bold tracking-wider">
                  Enterprise SSO
                </span>
                <span className="hardware-led hardware-led-amber" />
              </div>
              <div className="text-sm font-bold text-[#F8FAFC]">
                SAML / Okta / Azure AD
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-tight">
                Simulated in sandbox. 1-click role bypass enabled for live evaluation.
              </p>
              <div className="pt-1 text-[10px] font-mono text-[#FBBF24] font-bold">
                STATUS: ACTIVE MOCK BYPASS
              </div>
            </div>

            {/* Subsystem 4 */}
            <div className="tactile-card p-4 space-y-2 border-[#1E2E50]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#94A3B8] font-bold tracking-wider">
                  Metered Billing
                </span>
                <span className="hardware-led hardware-led-blue" />
              </div>
              <div className="text-sm font-bold text-[#F8FAFC]">
                Stripe Enterprise Gateway
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-tight">
                Unmetered hackathon judge tier pre-allocated with unlimited scans.
              </p>
              <div className="pt-1 text-[10px] font-mono text-sky-400 font-bold">
                STATUS: UNLIMITED EVAL TIER
              </div>
            </div>
          </div>
        </div>

        {/* 1-Click Role Bypass Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#F8FAFC] tracking-tight">
                Instant 1-Click Persona Bypass
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Switch between pre-authenticated enterprise roles to evaluate role-gated UI and workflows.
              </p>
            </div>

            {bypassSuccess && (
              <Badge variant="turquoise" dot mono size="sm">
                LOGGED IN AS {bypassSuccess.toUpperCase()}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {MOCK_ROLES.map((roleItem) => {
              const isSelected = selectedRole === roleItem.id;

              return (
                <div
                  key={roleItem.id}
                  className={`rounded-xl p-5 flex flex-col justify-between transition-all ${
                    roleItem.accent === "gold"
                      ? "tactile-card-gold"
                      : roleItem.accent === "turquoise"
                      ? "tactile-card-turquoise"
                      : "tactile-card"
                  } ${isSelected ? "ring-1 ring-[#00F2FE]/50" : ""}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-[0.16em] font-bold text-[#94A3B8]">
                        {roleItem.badge}
                      </span>
                      <span
                        className={`hardware-led ${
                          roleItem.accent === "gold"
                            ? "hardware-led-gold"
                            : roleItem.accent === "turquoise"
                            ? "hardware-led-turquoise"
                            : "hardware-led-blue"
                        }`}
                      />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#F8FAFC]">
                        {roleItem.name}
                      </h3>
                      <p className="text-xs font-mono text-[#00F2FE]">
                        {roleItem.role}
                      </p>
                    </div>

                    <p className="text-xs text-[#CBD5E1] leading-relaxed">
                      {roleItem.description}
                    </p>

                    <div className="p-2.5 rounded-lg bg-[#080C16] border border-[#1E2E50] text-[11px] text-[#94A3B8] font-mono leading-tight">
                      <span className="text-[#64748B]">Scope:</span> {roleItem.scope}
                    </div>
                  </div>

                  <div className="pt-5">
                    <Button
                      className="w-full"
                      size="md"
                      variant={
                        roleItem.accent === "gold"
                          ? "gold"
                          : roleItem.accent === "turquoise"
                          ? "turquoise"
                          : "secondary"
                      }
                      loading={isBypassing && selectedRole === roleItem.id}
                      icon={<UserCheck className="w-4 h-4" />}
                      onClick={() => handleRoleBypass(roleItem)}
                    >
                      Enter as {roleItem.id === "admin" ? "Brand Admin" : roleItem.id === "reviewer" ? "Compliance Reviewer" : "Content Creator"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recessed Well Diagnostics Terminal */}
        <div className="recessed-well p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E2E50] pb-2.5">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00F2FE]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F8FAFC]">
                Sandbox Environment Diagnostics
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#64748B]">
              NODE: INKLOOM-MOCK-SANDBOX-01
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-[#94A3B8]">
            <div>
              <span className="text-[#64748B]">Auth Strategy:</span> Mock LocalStorage Session Bridge
            </div>
            <div>
              <span className="text-[#64748B]">Default Brand:</span> Apex Nutrition (ID: apex)
            </div>
            <div>
              <span className="text-[#64748B]">Indexed Claims:</span> 12 Substantiated Claims
            </div>
            <div>
              <span className="text-[#64748B]">Audited Submissions:</span> 6 Live Mock Audit Records
            </div>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#1E2E50]">
          <Button
            size="md"
            variant="secondary"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.push("/dashboard")}
          >
            Back to Application
          </Button>

          <div className="flex items-center gap-3">
            <Link href="/submissions/sub_mock_001">
              <Button size="md" variant="outline">
                Inspect Flagged Audit Diff
              </Button>
            </Link>

            <Link href="/submissions/new">
              <Button size="md" variant="gold" iconRight={<ArrowRight className="w-4 h-4" />}>
                Launch New Audit Scan
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
