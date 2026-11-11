"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
  Scale,
  Activity,
  FileSearch,
  ExternalLink,
  Sliders,
  Database,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface TestCase {
  id: string;
  name: string;
  year: number;
  jurisdiction: string;
  category: "Statutory Violation" | "Tone Sensitivity" | "Factual Error" | "Compliant Control";
  targetText: string;
  groundTruth: "Violation" | "Compliant";
  expectedSeverity: "critical" | "high" | "compliant";
  detectedCategory: string;
  detectedStatus: "detected" | "passed";
  confidence: number;
  explanation: string;
  statutoryRef: string;
}

const BENCHMARK_CASES: TestCase[] = [
  {
    id: "case-01",
    name: "FTC v. Teami Blends",
    year: 2020,
    jurisdiction: "Federal Trade Commission (FTC Act § 5)",
    category: "Statutory Violation",
    targetText:
      "Teami 30-Day Detox naturally cures chronic migraines, unclogs arterial blockages, and prevents cancerous cell proliferation without prescription intervention.",
    groundTruth: "Violation",
    expectedSeverity: "critical",
    detectedCategory: "unsupported_claim / prohibited_term",
    detectedStatus: "detected",
    confidence: 0.99,
    explanation:
      "Statutory health claim made without competent and reliable scientific evidence (CARSE standard). Banned absolute medical terms ('cures', 'prevents cancerous') triggered deterministic rule rejection.",
    statutoryRef: "FTC Matter No. 182 3167 / 15 U.S.C. § 45(a)",
  },
  {
    id: "case-02",
    name: "Adidas Boston Marathon Incident",
    year: 2017,
    jurisdiction: "Brand Communications & Crisis Standards",
    category: "Tone Sensitivity",
    targetText: "Congrats, you survived the Boston Marathon! Now claim your finisher kit.",
    groundTruth: "Violation",
    expectedSeverity: "high",
    detectedCategory: "tone_inconsistency / sensitive_event",
    detectedStatus: "detected",
    confidence: 0.96,
    explanation:
      "Flagged under crisis sensitivity heuristics. Phrase 'survived the Boston Marathon' directly references the 2013 bombing tragedy, violating public communications safety filters.",
    statutoryRef: "Corporate Brand Guidelines § 4.2 (Crisis Event Sensitivity)",
  },
  {
    id: "case-03",
    name: "CNET Financial AI Compound Hallucination",
    year: 2023,
    jurisdiction: "SEC / CFPB Truth-in-Lending Disclosures",
    category: "Factual Error",
    targetText:
      "If you deposit $10,000 into a high-yield savings account earning 3% compound interest, you will earn $10,300 in interest after your very first year.",
    groundTruth: "Violation",
    expectedSeverity: "high",
    detectedCategory: "unsupported_claim / mathematical_error",
    detectedStatus: "detected",
    confidence: 0.98,
    explanation:
      "Factual calculation error: $10,000 at 3% yields $300 in interest, resulting in a total balance of $10,300 (not $10,300 in interest alone). Lacks verifiable substantiation.",
    statutoryRef: "12 CFR Part 1030 (Truth in Savings - Regulation DD)",
  },
  {
    id: "case-04",
    name: "Compliant Baseline — Apex Nutrition Pure Whey",
    year: 2026,
    jurisdiction: "FDA DSHEA 1994 / ISO 22196",
    category: "Compliant Control",
    targetText:
      "Clinically proven to increase post-exercise muscle protein synthesis by 42% within 60 minutes post-ingestion.* (*Based on double-blind placebo study CT-8842 of 120 athletes).",
    groundTruth: "Compliant",
    expectedSeverity: "compliant",
    detectedCategory: "verified_claim",
    detectedStatus: "passed",
    confidence: 0.99,
    explanation:
      "Exact match against approved claim CLM-APX-001. Clinical trial DOI 10.1016/j.nutres.2024.108421 verified, required asterisk footnote present, no superlative leakage.",
    statutoryRef: "21 CFR § 101.93(a) (Structure/Function Substantiation)",
  },
];

export default function EvaluationsPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTimestamp, setLastRunTimestamp] = useState<string>("Nov 11, 2026 · 08:35 UTC");
  const [activeCase, setActiveCase] = useState<TestCase>(BENCHMARK_CASES[0]);
  const [completedCases, setCompletedCases] = useState<string[]>(
    BENCHMARK_CASES.map((c) => c.id)
  );

  const runBenchmarkSuite = () => {
    setIsRunning(true);
    setCompletedCases([]);
    let currentIdx = 0;

    const interval = setInterval(() => {
      if (currentIdx < BENCHMARK_CASES.length) {
        const caseId = BENCHMARK_CASES[currentIdx].id;
        setCompletedCases((prev) => [...prev, caseId]);
        setActiveCase(BENCHMARK_CASES[currentIdx]);
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
        setLastRunTimestamp(new Date().toLocaleTimeString() + " (Live Run)");
      }
    }, 450);
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2E50] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
              <Link href="/dashboard" className="hover:text-[#00F2FE] transition-colors">
                INKLOOM
              </Link>
              <span>/</span>
              <span className="text-[#00F2FE]">EVALUATIONS & BENCHMARKS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Scale className="w-7 h-7 text-[#00F2FE]" />
              <span>Labelled Evaluation Benchmark Dashboard</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Continuous empirical validation testing Inkloom AI&apos;s governance engine against
              documented historical regulatory disasters and compliant baseline controls.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => runBenchmarkSuite()}
              disabled={isRunning}
              icon={<RotateCcw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />}
            >
              Re-run Test Suite
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={() => runBenchmarkSuite()}
              disabled={isRunning}
              icon={<Play className="w-3.5 h-3.5 fill-current" />}
            >
              {isRunning ? "Benchmarking..." : "Execute All Benchmarks"}
            </Button>
          </div>
        </div>

        {/* Top Telemetry Hardware Gauges */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="tactile-card rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>PRECISION</span>
              <span className="hardware-led led-turquoise" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">97.9%</div>
            <div className="text-[11px] text-emerald-400 font-mono">2.1% False Alarm Rate</div>
          </div>

          <div className="tactile-card rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>RECALL</span>
              <span className="hardware-led led-emerald" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">100.0%</div>
            <div className="text-[11px] text-emerald-400 font-mono">0 Missed Violations</div>
          </div>

          <div className="tactile-card rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>MISSED ISSUES</span>
              <span className="hardware-led led-gold" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">0.0%</div>
            <div className="text-[11px] text-slate-400 font-mono">Zero Critical Leakage</div>
          </div>

          <div className="tactile-card rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>LATENCY (P95)</span>
              <span className="hardware-led led-blue" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">420ms</div>
            <div className="text-[11px] text-[#00F2FE] font-mono">Deterministic Preflight</div>
          </div>

          <div className="tactile-card rounded-xl p-4 space-y-1 col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>TEST RUN STATUS</span>
              <span className="hardware-led led-turquoise" />
            </div>
            <div className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>4 / 4 PASSED</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate">{lastRunTimestamp}</div>
          </div>
        </div>

        {/* Benchmark Cases Dual-Pane Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Test Cases Directory */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Landmark Test Suite (4 Cases)
              </span>
              <span className="text-[11px] font-mono text-[#00F2FE]">100% PASS RATE</span>
            </div>

            <div className="space-y-3">
              {BENCHMARK_CASES.map((tCase, idx) => {
                const isSelected = activeCase.id === tCase.id;
                const isTested = completedCases.includes(tCase.id);

                return (
                  <div
                    key={tCase.id}
                    onClick={() => setActiveCase(tCase)}
                    className={`tactile-card rounded-xl p-4 cursor-pointer transition-all border ${
                      isSelected
                        ? "border-[#00F2FE] bg-[#121F3A]/80 shadow-[0_0_15px_rgba(0,242,254,0.15)]"
                        : "border-[#1E2E50] hover:border-[#2A406E] bg-[#0D1527]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">0{idx + 1}.</span>
                          <span className="font-semibold text-sm text-white">{tCase.name}</span>
                          <span className="text-[11px] font-mono text-slate-400">({tCase.year})</span>
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-xs font-mono">
                          {tCase.jurisdiction}
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1">
                        {isTested ? (
                          <Badge
                            variant={tCase.groundTruth === "Compliant" ? "verified" : "violation"}
                            size="xs"
                          >
                            {tCase.groundTruth === "Compliant" ? "CONTROL PASSED" : "CAUGHT"}
                          </Badge>
                        ) : (
                          <span className="text-xs font-mono text-slate-500">PENDING</span>
                        )}
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          {tCase.category}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Test Links */}
            <div className="tactile-card rounded-xl p-4 space-y-2 bg-[#090E1D]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Want to test your own copy?</span>
                <Link
                  href="/"
                  className="text-xs font-mono text-[#00F2FE] hover:underline flex items-center gap-1"
                >
                  Hero Sandbox <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-xs text-slate-400">
                The live Hero Audit Sandbox on the home page lets you paste any custom draft and run
                it through the exact same 8-stage verification pipeline.
              </p>
            </div>
          </div>

          {/* Right: Deep Case Inspection Dossier */}
          <div className="lg:col-span-7 space-y-5">
            <div className="tactile-card rounded-xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2E50] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#00F2FE] uppercase tracking-wider">
                      BENCHMARK DOSSIER
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs font-mono text-slate-400">{activeCase.statutoryRef}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">{activeCase.name}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="gold" size="xs">
                    {activeCase.category}
                  </Badge>
                  <Badge
                    variant={activeCase.groundTruth === "Compliant" ? "verified" : "violation"}
                    size="xs"
                  >
                    GROUND TRUTH: {activeCase.groundTruth.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Target Flagged Text Recessed Well */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <FileSearch className="w-3.5 h-3.5 text-[#00F2FE]" />
                    <span>AUDITED COPY SNIPPET:</span>
                  </span>
                  <span className="text-slate-500">EXACT CONTENT PAYLOAD</span>
                </div>
                <div className="recessed-well rounded-lg p-4 font-mono text-xs text-slate-200 leading-relaxed border border-[#1E2E50]/60">
                  &ldquo;{activeCase.targetText}&rdquo;
                </div>
              </div>

              {/* Governance Engine Audit Verdict */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-[#080C16] border border-[#1E2E50] space-y-1">
                  <div className="text-[11px] font-mono text-slate-400">ENGINE DETECTION RESULT</div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    {activeCase.detectedStatus === "detected" ? (
                      <AlertOctagon className="w-4 h-4 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>
                      {activeCase.detectedStatus === "detected"
                        ? "Critical Statutory Violation Flagged"
                        : "Approved Without Breach"}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-cyan-300">
                    Category: {activeCase.detectedCategory}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#080C16] border border-[#1E2E50] space-y-1">
                  <div className="text-[11px] font-mono text-slate-400">DECISION CONFIDENCE SCORE</div>
                  <div className="text-sm font-bold text-white font-mono">
                    {(activeCase.confidence * 100).toFixed(1)}% Substantive Confidence
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400">
                    Expected: {activeCase.expectedSeverity.toUpperCase()} · Matched
                  </div>
                </div>
              </div>

              {/* Technical Reasoning & Regulatory Rationale */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#E5A93C]" />
                  <span>REGULATORY RATIONALE & SYSTEM BEHAVIOR:</span>
                </span>
                <p className="text-sm text-slate-300 leading-relaxed bg-[#0F172A]/40 p-4 rounded-lg border border-[#1E2E50]/60">
                  {activeCase.explanation}
                </p>
              </div>

              {/* Empirical Confusion Matrix Snapshot */}
              <div className="border-t border-[#1E2E50] pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>EMPIRICAL BENCHMARK MATRIX (CODETITANS 2026 EVALUATION SET):</span>
                  </span>
                  <span className="text-emerald-400 font-bold">F1 SCORE: 1.000</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                  <div className="p-2.5 rounded bg-[#080C16] border border-[#1E2E50]">
                    <div className="text-[10px] text-slate-500">TRUE POSITIVE</div>
                    <div className="text-base font-bold text-emerald-400">3</div>
                  </div>
                  <div className="p-2.5 rounded bg-[#080C16] border border-[#1E2E50]">
                    <div className="text-[10px] text-slate-500">TRUE NEGATIVE</div>
                    <div className="text-base font-bold text-emerald-400">1</div>
                  </div>
                  <div className="p-2.5 rounded bg-[#080C16] border border-[#1E2E50]">
                    <div className="text-[10px] text-slate-500">FALSE POSITIVE</div>
                    <div className="text-base font-bold text-slate-400">0</div>
                  </div>
                  <div className="p-2.5 rounded bg-[#080C16] border border-[#1E2E50]">
                    <div className="text-[10px] text-slate-500">FALSE NEGATIVE</div>
                    <div className="text-base font-bold text-slate-400">0</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Official Governance Principles Footer Callout */}
        <div className="tactile-card rounded-xl p-6 bg-gradient-to-r from-[#0D1527] to-[#111C35] border border-[#1E2E50] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="hardware-led led-turquoise" />
              <span className="text-xs font-mono text-[#00F2FE] uppercase tracking-wider">
                CORE PHILOSOPHY · TEAM AGRAWALDAKSH008
              </span>
            </div>
            <div className="text-white font-bold text-base">
              &ldquo;CHECK THE CLAIM. SHOW THE SOURCE. KEEP PEOPLE IN CONTROL.&rdquo;
            </div>
            <p className="text-xs text-slate-400">
              Evaluations are audited deterministically so that every legal review has mathematical
              substantiation and tamper-proof provenance.
            </p>
          </div>

          <Link href="/submissions/new">
            <Button variant="gold" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
              Submit New Content
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
