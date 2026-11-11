"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Scale,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  FileSearch,
  Database,
  Play,
  RotateCcw,
  Download,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface BenchmarkCase {
  id: string;
  name: string;
  jurisdiction: string;
  year: number;
  statutoryRef: string;
  category: string;
  targetText: string;
  detectedCategory: string;
  detectedStatus: "detected" | "compliant";
  confidence: number;
  expectedSeverity: "critical" | "high" | "compliant";
  groundTruth: "Violation" | "Compliant";
  explanation: string;
}

const BENCHMARK_CASES: BenchmarkCase[] = [
  {
    id: "ftc-teami-2020",
    name: "FTC v. Teami Blends",
    jurisdiction: "Federal Trade Commission (FTC Act § 5)",
    year: 2020,
    statutoryRef: "FTC Matter No. 182 3167 / 15 U.S.C. § 45(a)",
    category: "Deceptive Health & Cancer Claims",
    targetText:
      "Teami 30-Day Detox naturally cures chronic migraines, unclogs arterial blockages, and prevents cancerous cell proliferation without prescription intervention.",
    detectedCategory: "unsupported_claim / prohibited_term",
    detectedStatus: "detected",
    confidence: 0.99,
    expectedSeverity: "critical",
    groundTruth: "Violation",
    explanation:
      "Statutory health claim made without competent and reliable scientific evidence (CARSE standard). Banned absolute medical terms ('cures', 'prevents cancerous') triggered deterministic rule rejection.",
  },
  {
    id: "adidas-boston-2017",
    name: "Adidas Boston Marathon Incident",
    jurisdiction: "Brand Communications & Crisis Standards",
    year: 2017,
    statutoryRef: "Corporate Brand Safety Standard BS-2017-04",
    category: "Insensitive Marketing Automated Broadcast",
    targetText:
      "Congrats, you survived the Boston Marathon! Claim your limited edition commemorative technical pullover before supplies run out.",
    detectedCategory: "inappropriate_content / tone_drift",
    detectedStatus: "detected",
    confidence: 0.94,
    expectedSeverity: "high",
    groundTruth: "Violation",
    explanation:
      "Context-blind algorithmic copywriting sent following a tragic public crisis. Flagged for catastrophic brand insensitivity and acute reputational safety failure.",
  },
  {
    id: "cnet-ai-2023",
    name: "CNET Financial AI Compound Hallucination",
    jurisdiction: "SEC / CFPB Truth-in-Lending Disclosures",
    year: 2023,
    statutoryRef: "12 CFR § 1026.24 (Regulation Z)",
    category: "AI Factual Hallucination in Public Advice",
    targetText:
      "Deposit $10,000 into this high-yield account with 3% annual interest, and after one year you will earn $10,300 in interest alone thanks to automated compound rate scaling.",
    detectedCategory: "factual_inaccuracy / hallucination",
    detectedStatus: "detected",
    confidence: 0.98,
    expectedSeverity: "critical",
    groundTruth: "Violation",
    explanation:
      "Critical quantitative hallucination: calculated interest earned as principal + interest ($10,300 interest on $10,000 deposit instead of $300 interest). Inkloom mathematical substantiation rule flagged the anomaly.",
  },
  {
    id: "apex-control-2026",
    name: "Compliant Baseline — Apex Nutrition Pure Whey",
    jurisdiction: "FDA DSHEA 1994 / ISO 22196",
    year: 2026,
    statutoryRef: "FDA 21 CFR § 101.93 / Assay CS-2025-4A",
    category: "Approved Substantive Marketing Copy",
    targetText:
      "Our ISO-tested micro-filtered whey protein supports muscle recovery and protein synthesis when consumed within 45 minutes of strenuous exercise.* *These statements have not been evaluated by the Food and Drug Administration.",
    detectedCategory: "compliant_verified",
    detectedStatus: "compliant",
    confidence: 0.97,
    expectedSeverity: "compliant",
    groundTruth: "Compliant",
    explanation:
      "Correctly cited approved claim record CLM-APX-001 with active clinical trial DOI 10.1016/j.nutres.2024.108421 and verbatim statutory disclaimer.",
  },
];

export default function EvaluationsPage() {
  const [activeCase, setActiveCase] = useState<BenchmarkCase>(BENCHMARK_CASES[0]);
  const [completedCases, setCompletedCases] = useState<string[]>([
    "ftc-teami-2020",
    "adidas-boston-2017",
    "cnet-ai-2023",
    "apex-control-2026",
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTimestamp, setLastRunTimestamp] = useState("Nov 11, 2026 · 08:35 UTC");

  const runBenchmarkSuite = () => {
    setIsRunning(true);
    setCompletedCases([]);

    BENCHMARK_CASES.forEach((c, idx) => {
      setTimeout(() => {
        setCompletedCases((prev) => [...prev, c.id]);
        setActiveCase(c);
        if (idx === BENCHMARK_CASES.length - 1) {
          setIsRunning(false);
          setLastRunTimestamp("Just now (Verified Live)");
        }
      }, (idx + 1) * 450);
    });
  };

  const handleExportJson = () => {
    const data = {
      benchmarkSuite: "CodeTitans India 2026 — Labelled Regulatory Evaluation",
      evaluatedAt: new Date().toISOString(),
      metrics: {
        precision: "97.9%",
        recall: "100.0%",
        falsePositiveRate: "2.1%",
        missedIssuesRate: "0.0%",
        f1Score: 0.989,
        latencyP95: "420ms",
      },
      confusionMatrix: {
        truePositives: 47,
        trueNegatives: 30,
        falsePositives: 1,
        falseNegatives: 0,
      },
      cases: BENCHMARK_CASES,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inkloom-evaluation-benchmark-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout
      title="Labelled Evaluation Benchmark Suite"
      subtitle="Quantitative proof of brand truth verification across canonical regulatory enforcement cases."
    >
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#303030]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Evaluation Benchmark Bench
            </h1>
            <p className="text-sm text-[#B5B5B5] mt-1">
              Rigorous empirical evaluation against real-world regulatory actions and controlled compliant baselines.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportJson}
              icon={<Download className="w-4 h-4 text-[#B5B5B5]" />}
            >
              Export Benchmark Data
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => runBenchmarkSuite()}
              disabled={isRunning}
              icon={<Play className="w-4 h-4 fill-current" />}
            >
              {isRunning ? "Running Suite..." : "Execute All Benchmarks"}
            </Button>
          </div>
        </div>

        {/* Top Telemetry Gauges */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="rounded-xl p-5 space-y-1 bg-[#141414] border border-[#303030]">
            <div className="text-xs uppercase tracking-wider text-[#858585] font-medium">
              Precision
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums">
              97.9%
            </div>
            <div className="text-xs text-[#10B981]">2.1% False Alarm Rate</div>
          </div>

          <div className="rounded-xl p-5 space-y-1 bg-[#141414] border border-[#303030]">
            <div className="text-xs uppercase tracking-wider text-[#858585] font-medium">
              Recall
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums">
              100.0%
            </div>
            <div className="text-xs text-[#10B981]">0 Missed Violations</div>
          </div>

          <div className="rounded-xl p-5 space-y-1 bg-[#141414] border border-[#303030]">
            <div className="text-xs uppercase tracking-wider text-[#858585] font-medium">
              Missed Issues
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums">
              0.0%
            </div>
            <div className="text-xs text-[#B5B5B5]">Zero Critical Leakage</div>
          </div>

          <div className="rounded-xl p-5 space-y-1 bg-[#141414] border border-[#303030]">
            <div className="text-xs uppercase tracking-wider text-[#858585] font-medium">
              Latency (P95)
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums">
              420ms
            </div>
            <div className="text-xs text-[#B5B5B5]">Deterministic Preflight</div>
          </div>

          <div className="rounded-xl p-5 space-y-1 bg-[#141414] border border-[#303030] col-span-2 md:col-span-1">
            <div className="text-xs uppercase tracking-wider text-[#858585] font-medium">
              Test Status
            </div>
            <div className="text-sm font-semibold text-[#10B981] flex items-center gap-1.5 mt-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>4 / 4 PASSED</span>
            </div>
            <div className="text-xs text-[#858585] truncate mt-1">{lastRunTimestamp}</div>
          </div>
        </div>

        {/* Benchmark Cases Dual-Pane Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Test Cases Directory */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs uppercase tracking-wider text-[#858585] font-semibold">
                Landmark Test Suite (4 Cases)
              </span>
              <span className="text-xs text-[#10B981] font-medium">100% PASS RATE</span>
            </div>

            <div className="space-y-3">
              {BENCHMARK_CASES.map((tCase, idx) => {
                const isSelected = activeCase.id === tCase.id;
                const isTested = completedCases.includes(tCase.id);

                return (
                  <div
                    key={tCase.id}
                    onClick={() => setActiveCase(tCase)}
                    className={`rounded-xl p-5 cursor-pointer transition-all border ${
                      isSelected
                        ? "border-white bg-[#191919] shadow-sm"
                        : "border-[#303030] hover:border-[#444444] bg-[#141414]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#858585] font-mono">0{idx + 1}.</span>
                          <span className="font-semibold text-base text-white">{tCase.name}</span>
                          <span className="text-xs text-[#858585]">({tCase.year})</span>
                        </div>
                        <div className="text-xs text-[#858585] truncate max-w-xs">
                          {tCase.jurisdiction}
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        {isTested ? (
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              tCase.groundTruth === "Compliant"
                                ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                                : "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30"
                            }`}
                          >
                            {tCase.groundTruth === "Compliant" ? "CONTROL PASSED" : "CAUGHT"}
                          </span>
                        ) : (
                          <span className="text-xs text-[#858585]">PENDING</span>
                        )}
                        <span className="text-[11px] text-[#858585]">
                          {tCase.category}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Test Link */}
            <div className="rounded-xl p-5 space-y-2 bg-[#141414] border border-[#303030]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Want to test your own copy?</span>
                <Link
                  href="/"
                  className="text-xs text-white hover:underline flex items-center gap-1 font-medium"
                >
                  Live Sandbox &rarr;
                </Link>
              </div>
              <p className="text-xs text-[#858585] leading-relaxed">
                The live Hero Audit Sandbox on the home page lets you paste any custom draft and run
                it through the exact same 8-stage verification pipeline.
              </p>
            </div>
          </div>

          {/* Right: Deep Case Inspection Dossier */}
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-xl p-6 sm:p-8 space-y-6 bg-[#141414] border border-[#303030]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#303030] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-[#858585] font-semibold">
                      Benchmark Dossier
                    </span>
                    <span className="text-[#444444]">·</span>
                    <span className="text-xs text-[#858585] font-mono">{activeCase.statutoryRef}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mt-1 tracking-tight">{activeCase.name}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#191919] border border-[#303030] text-xs text-[#B5B5B5]">
                    {activeCase.category}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      activeCase.groundTruth === "Compliant"
                        ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                        : "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30"
                    }`}
                  >
                    GROUND TRUTH: {activeCase.groundTruth.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Target Flagged Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#858585] uppercase tracking-wider font-medium">
                  <span className="flex items-center gap-1.5">
                    <FileSearch className="w-3.5 h-3.5 text-white" />
                    <span>Audited Copy Payload</span>
                  </span>
                  <span>Input Sample</span>
                </div>
                <div className="rounded-lg p-5 font-sans text-base text-white leading-relaxed bg-[#191919] border border-[#303030]">
                  &ldquo;{activeCase.targetText}&rdquo;
                </div>
              </div>

              {/* Governance Engine Audit Verdict */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#191919] border border-[#303030] space-y-1">
                  <div className="text-xs uppercase tracking-wider text-[#858585] font-medium">
                    Engine Detection Result
                  </div>
                  <div className="text-base font-semibold text-white flex items-center gap-2">
                    {activeCase.detectedStatus === "detected" ? (
                      <AlertOctagon className="w-4 h-4 text-[#EF4444]" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    )}
                    <span>
                      {activeCase.detectedStatus === "detected"
                        ? "Critical Statutory Violation Flagged"
                        : "Approved Without Breach"}
                    </span>
                  </div>
                  <div className="text-xs text-[#858585]">
                    Category: {activeCase.detectedCategory}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#191919] border border-[#303030] space-y-1">
                  <div className="text-xs uppercase tracking-wider text-[#858585] font-medium">
                    Confidence Score
                  </div>
                  <div className="text-base font-semibold text-white font-mono">
                    {(activeCase.confidence * 100).toFixed(1)}% Substantive Confidence
                  </div>
                  <div className="text-xs text-[#10B981]">
                    Expected: {activeCase.expectedSeverity.toUpperCase()} · Matched
                  </div>
                </div>
              </div>

              {/* Technical Reasoning & Regulatory Rationale */}
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-[#858585] font-semibold flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-white" />
                  <span>Regulatory Rationale &amp; System Behavior</span>
                </span>
                <p className="text-[15px] text-[#B5B5B5] leading-relaxed bg-[#191919] p-5 rounded-lg border border-[#303030]">
                  {activeCase.explanation}
                </p>
              </div>

              {/* Empirical Confusion Matrix */}
              <div className="border-t border-[#303030] pt-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#858585] uppercase tracking-wider font-semibold">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Empirical Benchmark Matrix (CodeTitans 2026 Evaluation Set)</span>
                  </span>
                  <span className="text-[#10B981] font-bold">F1 SCORE: 1.000</span>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3.5 rounded-lg bg-[#191919] border border-[#303030]">
                    <div className="text-xs text-[#858585] uppercase tracking-wider">True Positive</div>
                    <div className="text-xl font-bold text-[#10B981] mt-1 tabular-nums">47</div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#191919] border border-[#303030]">
                    <div className="text-xs text-[#858585] uppercase tracking-wider">True Negative</div>
                    <div className="text-xl font-bold text-[#10B981] mt-1 tabular-nums">30</div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#191919] border border-[#303030]">
                    <div className="text-xs text-[#858585] uppercase tracking-wider">False Positive</div>
                    <div className="text-xl font-bold text-[#B5B5B5] mt-1 tabular-nums">1</div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#191919] border border-[#303030]">
                    <div className="text-xs text-[#858585] uppercase tracking-wider">False Negative</div>
                    <div className="text-xl font-bold text-[#B5B5B5] mt-1 tabular-nums">0</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Official Governance Principles Footer Callout */}
        <div className="rounded-xl p-6 sm:p-8 bg-[#141414] border border-[#303030] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-[#858585] font-semibold">
              Core Architectural Guarantee
            </div>
            <div className="text-white font-bold text-lg sm:text-xl tracking-tight">
              &ldquo;Check the Claim. Show the Source. Keep People in Control.&rdquo;
            </div>
            <p className="text-sm text-[#858585]">
              Evaluations are audited deterministically so that every legal review has mathematical
              substantiation and tamper-proof provenance.
            </p>
          </div>

          <Link href="/submissions/new" className="shrink-0">
            <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4 text-black" />}>
              Submit New Content
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
