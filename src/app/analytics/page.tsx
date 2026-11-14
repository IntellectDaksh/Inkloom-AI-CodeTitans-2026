"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Scale,
  ShieldCheck,
  ChevronRight,
  Database,
  Activity,
  FileText,
  Download,
  Lock,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const severityBreakdown = [
    { label: "Critical Statutory Violations", count: 2, percentage: 7, color: "bg-status-critical", standard: "FTC § 255 / FDA" },
    { label: "High Risk Claims (Ungrounded)", count: 8, percentage: 29, color: "bg-status-warning", standard: "NAD Substantiation" },
    { label: "Medium Warnings (Disclaimers)", count: 12, percentage: 43, color: "bg-status-warning/60", standard: "DSHEA § 403(r)" },
    { label: "Low (Tone & Style Deviations)", count: 6, percentage: 21, color: "bg-text-dim", standard: "Brand Voice Guide" },
  ];

  const recurringIssues = [
    { name: "Unverified Multiplier Metric ('2x faster')", category: "FTC § 255.2", count: 12, trend: "+2", isUp: true },
    { name: "Aggressive / Over-Promising Tone", category: "Brand Voice Guild-04", count: 7, trend: "-3", isUp: false },
    { name: "Missing Statutory FDA Disclaimer Notice", category: "FDA 21 CFR § 101.93", count: 5, trend: "0", isUp: false },
    { name: "Out-of-Scope Geographic / Channel Context", category: "Legal Distribution", count: 4, trend: "-1", isUp: false },
    { name: "Prohibited 'Miracle / Cure' Terminology", category: "FD&C Act § 201", count: 2, trend: "-5", isUp: false },
  ];

  const weeklyTrendData = [
    { week: "W41", reviewed: 22, score: 71, violations: 9 },
    { week: "W42", reviewed: 28, score: 76, violations: 7 },
    { week: "W43", reviewed: 31, score: 81, violations: 5 },
    { week: "W44", reviewed: 36, score: 84, violations: 4 },
  ];

  const expiringClaims = [
    {
      code: "CLM-APX-002",
      text: "100% Informed-Sport certified, tested for over 250 WADA-prohibited substances.",
      evidence: "LGC Informed-Sport Certificate #IS-8921",
      daysLeft: 17,
      owner: "Mansoor R. (QA Director)",
      expiresAt: "2026-11-25",
    },
    {
      code: "CLM-APX-003",
      text: "Clinically shown to increase peak VO2 max output and time-to-exhaustion by 14.3% in trained endurance athletes.",
      evidence: "CPET Protocol CPET-2024-B",
      daysLeft: 27,
      owner: "Dr. Aris Vance (VP Medical)",
      expiresAt: "2026-12-05",
    },
  ];

  const handleExportTelemetry = () => {
    const data = {
      report: "AdSnitch Governance Telemetry",
      period: timeRange,
      generatedAt: new Date().toISOString(),
      organization: "Apex Nutrition (brand_apex)",
      metrics: {
        complianceHealthScore: 84.2,
        firstPassRate: 77.8,
        turnaroundLatencyHours: 1.2,
        expiringCount: 2,
      },
      weeklyProgression: weeklyTrendData,
      severityBreakdown,
      topViolations: recurringIssues,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `adsnitch-telemetry-${timeRange}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportNotice("Compliance telemetry dataset exported as JSON.");
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <AppLayout
      title="Compliance & Risk Analytics"
      subtitle="Aggregated governance intelligence across brands, claims repositories, and reviewer sign-off velocity."
    >
      <div className="space-y-6">
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="led-indicator led-turquoise" />
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                Governance &amp; Risk Analytics
              </h1>
              <Badge variant="verified" size="xs">
                TELEMETRY ACTIVE
              </Badge>
              <span className="gold-badge text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase">
                ORGANIZATION: APEX NUTRITION
              </span>
            </div>
            <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
              Empirical multi-factor breakdown and compliance risk velocity across marketing, packaging, and regulatory assets.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Time range selector */}
            <div className="flex items-center bg-panel border border-border-subtle rounded-lg p-0.5 text-xs font-mono">
              {(["7d", "30d", "90d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer font-medium ${
                    timeRange === r
                      ? "bg-panel-elevated text-text-primary border border-border-default shadow-xs"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {r === "7d" ? "Past 7 Days" : r === "30d" ? "Past 30 Days" : "Past Quarter"}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              variant="secondary"
              icon={<Download className="w-3.5 h-3.5 text-text-primary" />}
              onClick={handleExportTelemetry}
            >
              Export Dataset
            </Button>

            <Link href="/evaluations">
              <Button
                size="sm"
                variant="gold"
                icon={<Scale className="w-3.5 h-3.5" />}
              >
                Benchmark Suite
              </Button>
            </Link>
          </div>
        </div>

        {/* Feedback Alert */}
        {exportNotice && (
          <div className="p-3.5 rounded-lg bg-status-success/10 border border-status-success/30 text-status-success text-xs flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
              <span>{exportNotice}</span>
            </span>
            <button
              onClick={() => setExportNotice(null)}
              className="text-status-success hover:text-text-primary font-mono text-xs"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* 4 Tactile Skeuomorphic Stat Cards with Monospace Tabular Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="glass rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between text-text-muted">
              <div className="flex items-center gap-2">
                <span className="led-indicator led-emerald" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-semibold">
                  Compliance Health Score
                </span>
              </div>
              <ShieldCheck className="w-4 h-4 text-status-success" />
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-status-success tracking-tight">
                84.2%
              </span>
              <span className="text-xs font-mono font-medium text-status-success flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +6.4%
              </span>
            </div>
            <div className="text-[11px] font-mono text-text-primary0 border-t border-border-subtle pt-2.5 flex items-center justify-between">
              <span>GROUNDED CLAIMS</span>
              <span className="text-text-primary font-semibold">32 TOTAL</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between text-text-muted">
              <div className="flex items-center gap-2">
                <span className="led-indicator led-emerald" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-semibold">
                  First-Pass Approval Rate
                </span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-status-success" />
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-text-primary tracking-tight">
                77.8%
              </span>
              <span className="text-xs font-mono font-medium text-status-success flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +18.2%
              </span>
            </div>
            <div className="text-[11px] font-mono text-text-primary0 border-t border-border-subtle pt-2.5 flex items-center justify-between">
              <span>VS PREVIOUS PERIOD</span>
              <span className="text-text-muted font-mono">59.6% PREV</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between text-text-muted">
              <div className="flex items-center gap-2">
                <span className="led-indicator led-gold" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-semibold">
                  Turnaround Latency
                </span>
              </div>
              <Clock className="w-4 h-4 text-status-warning" />
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-text-primary tracking-tight">
                1.2 hrs
              </span>
              <span className="text-xs font-mono font-medium text-status-success flex items-center gap-0.5">
                <ArrowDownRight className="w-3.5 h-3.5" /> -42m
              </span>
            </div>
            <div className="text-[11px] font-mono text-text-primary0 border-t border-border-subtle pt-2.5 flex items-center justify-between">
              <span>SLA TARGET</span>
              <span className="text-text-primary font-semibold">&lt; 4.0 HRS</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between text-text-muted">
              <div className="flex items-center gap-2">
                <span className="led-indicator led-amber" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-semibold">
                  Claims Expiring &lt;30d
                </span>
              </div>
              <AlertTriangle className="w-4 h-4 text-status-warning" />
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold font-mono tabular-nums text-status-warning tracking-tight">
                2
              </span>
              <span className="text-[11px] font-mono text-status-warning font-semibold bg-status-warning/10 px-2 py-0.5 rounded border border-status-warning/25">
                Action Required
              </span>
            </div>
            <div className="text-[11px] font-mono text-text-primary0 border-t border-border-subtle pt-2.5 flex items-center justify-between">
              <span>NEXT EXPIRATION</span>
              <span className="text-status-warning font-semibold">17 DAYS</span>
            </div>
          </div>
        </div>

        {/* Weekly Trend Chart & Severity Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): 4-Week Compliance Velocity */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass rounded-xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-border-subtle bg-panel flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                    Compliance Velocity &amp; Score Progression
                  </h3>
                  <p className="text-[10px] font-mono text-text-primary0 mt-0.5">
                    4-WEEK TRAJECTORY (WEEK 41 TO WEEK 44)
                  </p>
                </div>
                <Badge variant="verified" size="xs">
                  VELOCITY: +13% GAIN
                </Badge>
              </div>

              <div className="p-5 space-y-5">
                <div className="grid grid-cols-4 gap-3 text-center">
                  {weeklyTrendData.map((d) => (
                    <div
                      key={d.week}
                      className="p-3.5 rounded-lg bg-panel border border-border-subtle space-y-2.5"
                    >
                      <div className="text-[11px] font-mono text-text-muted font-semibold">
                        {d.week}
                      </div>

                      {/* Bar Visualization Monochromatic & Functional Accents */}
                      <div className="h-28 flex items-end justify-center gap-2 px-1">
                        <div
                          className="w-5 bg-ink rounded-t transition-all duration-300"
                          style={{ height: `${(d.score / 100) * 90}px` }}
                          title={`Compliance Score: ${d.score}%`}
                        />
                        <div
                          className="w-3 bg-status-critical rounded-t transition-all duration-300"
                          style={{ height: `${d.violations * 9}px` }}
                          title={`Statutory Violations: ${d.violations}`}
                        />
                      </div>

                      <div className="text-xs font-mono font-bold tabular-nums text-text-primary">
                        {d.score}%
                      </div>
                      <div className="text-[10px] font-mono text-text-muted">
                        {d.violations} Flags
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-text-muted pt-2 border-t border-border-default">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-ink inline-block" />
                      <span>Compliance Score (%)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-status-critical inline-block" />
                      <span>Statutory Flags</span>
                    </span>
                  </div>
                  <span className="text-status-success font-semibold">+13% Score Gain over 30d</span>
                </div>
              </div>
            </div>

            {/* Recurring Violations Frequency Table */}
            <div className="glass rounded-xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-border-subtle bg-panel flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                  Most Common Statutory Flags
                </h3>
                <span className="text-[10px] font-mono text-text-primary0">
                  ACTIVE RULE ENFORCEMENT
                </span>
              </div>

              <div className="p-4 space-y-3">
                {recurringIssues.map((item, idx) => (
                  <div
                    key={item.name}
                    className="p-3 rounded-lg bg-panel border border-border-subtle flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-status-warning w-4 text-center">
                        {idx + 1}
                      </span>
                      <div className="space-y-0.5">
                        <div className="font-medium text-text-primary">{item.name}</div>
                        <div className="text-[10px] font-mono text-text-primary0">{item.category}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span className="font-bold tabular-nums text-text-primary">{item.count}</span>
                      <span
                        className={`text-[10px] font-semibold ${
                          item.isUp ? "text-status-critical" : "text-status-success"
                        }`}
                      >
                        {item.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Severity Distribution & Expiring Watchlist */}
          <div className="lg:col-span-5 space-y-4">
            {/* Severity Breakdown Card */}
            <div className="glass rounded-xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-border-subtle bg-panel flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                  Findings by Severity Level
                </h3>
                <span className="text-[10px] font-mono text-status-warning">
                  28 TOTAL FLAGS
                </span>
              </div>

              <div className="p-4 space-y-4">
                {severityBreakdown.map((s) => (
                  <div key={s.label} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-text-primary">
                      <div>
                        <span className="font-medium">{s.label}</span>
                        <div className="text-[10px] font-mono text-text-primary0">{s.standard}</div>
                      </div>
                      <span className="font-mono font-semibold tabular-nums">
                        {s.count} ({s.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-panel rounded-full overflow-hidden border border-border-subtle">
                      <div
                        className={`h-full ${s.color} rounded-full`}
                        style={{ width: `${s.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Claims Approaching Expiry Watchlist */}
            <div className="glass rounded-xl overflow-hidden border-status-warning/40">
              <div className="px-4 py-3.5 border-b border-status-warning/25 bg-status-warning/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-status-warning" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-status-warning">
                    Claims Expiry Watchlist (&lt; 30d)
                  </h3>
                </div>
                <Badge variant="warning" size="xs">
                  2 CLAIMS
                </Badge>
              </div>

              <div className="p-4 space-y-3.5 text-xs">
                {expiringClaims.map((claim) => (
                  <div
                    key={claim.code}
                    className="p-3.5 rounded-lg bg-panel-hover border border-border-default space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-text-primary text-[11px] font-semibold">
                        {claim.code}
                      </span>
                      <span className="font-mono text-status-warning font-semibold text-[11px] flex items-center gap-1">
                        <span className="led-indicator led-amber" />
                        {claim.daysLeft} DAYS LEFT
                      </span>
                    </div>

                    <p className="text-text-secondary text-xs font-sans leading-relaxed">
                      &ldquo;{claim.text}&rdquo;
                    </p>

                    <div className="pt-1.5 flex items-center justify-between text-[10px] font-mono text-text-muted border-t border-border-default">
                      <span>{claim.evidence}</span>
                      <span className="text-text-secondary">{claim.owner}</span>
                    </div>
                  </div>
                ))}

                <div className="pt-2">
                  <Link
                    href="/knowledge-base/claims"
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-panel-hover hover:bg-panel-elevated border border-border-default text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <span>Manage All Claims in Truth Library</span>
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Labelled Evaluation Benchmark Card linking to /evaluations */}
            <div className="glass rounded-xl p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-panel-hover border border-border-default flex items-center justify-center text-text-primary">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                      Evaluation Benchmark Bench
                    </h3>
                    <div className="text-[10px] font-mono text-text-muted">ROUND 3 DELIVERABLE #3</div>
                  </div>
                </div>
                <Badge variant="verified" size="xs">
                  97.9% PRECISION
                </Badge>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed font-sans">
                Continuous empirical validation suite running the 4 canonical proposal case studies: FTC/Teami (2020), Adidas (2017), CNET AI (2023), and Clinical Baseline Control.
              </p>

              <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs">
                <div className="p-2 rounded bg-panel-hover border border-border-default">
                  <div className="text-[10px] text-text-muted">FALSE-POSITIVE</div>
                  <div className="text-sm font-bold text-text-primary">2.1%</div>
                </div>
                <div className="p-2 rounded bg-panel-hover border border-border-default">
                  <div className="text-[10px] text-text-muted">MISSED-ISSUE</div>
                  <div className="text-sm font-bold text-status-success">0.0%</div>
                </div>
              </div>

              <Link
                href="/evaluations"
                className="btn-secondary w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold"
              >
                <span>Launch Interactive Benchmark Suite</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
