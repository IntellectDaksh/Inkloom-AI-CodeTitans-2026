"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  ShieldAlert,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>({
    total_submissions: 36,
    pending_review: 5,
    approved: 28,
    changes_requested: 3,
    total_claims: 32,
    claims_expiring_soon: 2,
    average_score: 84,
  });

  const severityBreakdown = [
    { label: "Critical Violations", count: 2, percentage: 7, color: "bg-red-500" },
    { label: "High Severity", count: 8, percentage: 29, color: "bg-rose-500" },
    { label: "Medium Warnings", count: 12, percentage: 43, color: "bg-amber-500" },
    { label: "Low / Tone Adjustments", count: 6, percentage: 21, color: "bg-blue-500" },
  ];

  const recurringIssues = [
    { name: "Unverified Multiplier Claim", count: 12, trend: "+2" },
    { name: "Aggressive / Over-Promising Tone", count: 7, trend: "-3" },
    { name: "Missing FDA / Disclaimer Citation", count: 5, trend: "0" },
    { name: "Out-of-Scope Geographic Context", count: 4, trend: "-1" },
    { name: "Prohibited 'Miracle' Terminology", count: 2, trend: "-5" },
  ];

  const expiringClaims = [
    {
      code: "CLM-APX-003",
      text: "100% Informed-Sport certified, tested for over 250 WADA-prohibited substances.",
      daysLeft: 17,
      owner: "Mansoor R.",
    },
    {
      code: "CLM-APX-004",
      text: "Increases peak VO2 max output and time-to-exhaustion by 14.3% in trained endurance athletes.",
      daysLeft: 27,
      owner: "Mansoor R.",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Governance &amp; Compliance Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated audit intelligence across your brands, claims, and reviewer workflows.
          </p>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#111320] border border-[#1F2338]">
            <div className="text-xs text-slate-400 font-medium">Compliance Health Score</div>
            <div className="text-3xl font-bold text-emerald-400 mt-1">84%</div>
            <div className="text-[11px] text-slate-400 mt-1">Grounded across 32 claims</div>
          </div>

          <div className="p-5 rounded-xl bg-[#111320] border border-[#1F2338]">
            <div className="text-xs text-slate-400 font-medium">Approval Rate</div>
            <div className="text-3xl font-bold text-white mt-1">77.7%</div>
            <div className="text-[11px] text-emerald-400 mt-1">+18% increase this month</div>
          </div>

          <div className="p-5 rounded-xl bg-[#111320] border border-[#1F2338]">
            <div className="text-xs text-slate-400 font-medium">Turnaround Time</div>
            <div className="text-3xl font-bold text-white mt-1">1.2 hrs</div>
            <div className="text-[11px] text-slate-400 mt-1">Average reviewer response</div>
          </div>

          <div className="p-5 rounded-xl bg-[#111320] border border-[#1F2338]">
            <div className="text-xs text-slate-400 font-medium">Claims Expiring &lt;30d</div>
            <div className="text-3xl font-bold text-amber-400 mt-1">2</div>
            <div className="text-[11px] text-amber-400/80 mt-1">Action required before renewal</div>
          </div>
        </div>

        {/* Severity Breakdown & Recurring Issues */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Severity Chart */}
          <div className="lg:col-span-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-sm">Findings by Severity Level</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {severityBreakdown.map((s) => (
                  <div key={s.label} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-200">
                      <span>{s.label}</span>
                      <span className="font-semibold">{s.count} ({s.percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-[#1C2033] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${s.color} rounded-full`}
                        style={{ width: `${s.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recurring Violations */}
          <div className="lg:col-span-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-sm">Most Common Governance Flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {recurringIssues.map((item, idx) => (
                  <div
                    key={item.name}
                    className="p-3 rounded-lg bg-[#0E101B] border border-[#1E2338] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-500">{idx + 1}</span>
                      <span className="font-medium text-slate-200">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">{item.count}</span>
                      <span
                        className={`text-[10px] font-semibold ${
                          item.trend.startsWith("-")
                            ? "text-emerald-400"
                            : item.trend.startsWith("+")
                            ? "text-rose-400"
                            : "text-slate-500"
                        }`}
                      >
                        {item.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Claims Approaching Expiry */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <CardTitle className="text-sm">Claims Approaching Expiry (&lt; 30 Days)</CardTitle>
            </div>
            <span className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 font-medium">
              2 Claims Need Clinical Renewal
            </span>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {expiringClaims.map((c) => (
              <div
                key={c.code}
                className="p-4 rounded-lg bg-amber-950/15 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-400 font-bold">{c.code}</span>
                    <span className="text-slate-200 font-medium">&quot;{c.text}&quot;</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Responsible Owner: {c.owner}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-block px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-bold">
                    Expires in {c.daysLeft} days
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
