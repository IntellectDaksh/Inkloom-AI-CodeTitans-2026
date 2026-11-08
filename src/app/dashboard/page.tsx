"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/submissions?orgId=org_uideas_digital")
      .then((res) => res.json())
      .then((data) => {
        if (data.submissions) {
          setSubmissions(data.submissions);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Top issues matching reference mockup
  const topIssues = [
    { title: "Unverified claim", count: 12, max: 15, color: "bg-rose-500" },
    { title: "Off-brand tone", count: 7, max: 15, color: "bg-amber-500" },
    { title: "Missing disclosure", count: 5, max: 15, color: "bg-amber-500" },
    { title: "Inconsistent terminology", count: 4, max: 15, color: "bg-amber-500" },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Good morning, Daksh <span className="inline-block animate-pulse">👋</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Here&apos;s what&apos;s happening with Uideas Digital.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/submissions/new">
              <Button size="md" variant="primary" icon={<Sparkles className="w-4 h-4" />}>
                + Review Content
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards (Matching Screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Drafts Reviewed */}
          <div className="p-5 rounded-xl bg-[#111320] border border-[#1F2338] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Drafts Reviewed</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-bold text-white">36</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +24%
              </span>
            </div>
            <div className="text-[11px] text-slate-400">vs. last week</div>
          </div>

          {/* Approved */}
          <div className="p-5 rounded-xl bg-[#111320] border border-[#1F2338] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Approved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-bold text-white">28</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +18%
              </span>
            </div>
            <div className="text-[11px] text-slate-400">77% approval rate</div>
          </div>

          {/* Needs Review */}
          <div className="p-5 rounded-xl bg-[#111320] border border-[#1F2338] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Needs Review</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-bold text-white">5</span>
              <span className="text-xs font-medium text-amber-400">Pending queue</span>
            </div>
            <div className="text-[11px] text-slate-400">Avg. turnaround 1.2 hrs</div>
          </div>

          {/* Issues Repeated */}
          <div className="p-5 rounded-xl bg-[#111320] border border-[#1F2338] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Issues Repeated</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-bold text-white">4</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5" /> -33%
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Improving brand compliance</div>
          </div>
        </div>

        {/* Two-Column Layout: Recent Submissions & Top Issues */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Recent Submissions Table */}
          <div className="lg:col-span-8">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Recent Submissions</CardTitle>
                <Link
                  href="/submissions"
                  className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
                >
                  View All &rarr;
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0E101B] border-b border-[#1C2033] text-slate-400 font-medium">
                      <tr>
                        <th className="px-5 py-3">Content</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Result</th>
                        <th className="px-4 py-3">Author</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C2033]">
                      {/* Row 1: Q4 Campaign – Reel Script */}
                      <tr className="hover:bg-[#151728]/50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-slate-100">
                          <Link
                            href="/submissions/sub_reel_script"
                            className="hover:text-violet-300 transition-colors flex items-center gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            Q4 Campaign – Reel Script
                          </Link>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant="tag">Script</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            3 Issues
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">Riddhi S.</td>
                        <td className="px-4 py-3.5">
                          <Badge variant="pending">Needs Review</Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link href="/submissions/sub_reel_script">
                            <Button size="sm" variant="secondary" className="text-xs py-1 px-2.5">
                              Review
                            </Button>
                          </Link>
                        </td>
                      </tr>

                      {/* Row 2: Product Launch - Instagram Post */}
                      <tr className="hover:bg-[#151728]/50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-slate-100">
                          <Link
                            href="/submissions/sub_insta_launch"
                            className="hover:text-violet-300 transition-colors flex items-center gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Product Launch - Instagram Post
                          </Link>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant="tag">Social</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Approved
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">Laksh K.</td>
                        <td className="px-4 py-3.5">
                          <Badge variant="approved">Approved</Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link href="/submissions/sub_insta_launch">
                            <Button size="sm" variant="ghost" className="text-xs py-1 px-2.5">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>

                      {/* Row 3: Website Banner - V2 */}
                      <tr className="hover:bg-[#151728]/50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-slate-100">
                          <Link
                            href="/submissions/sub_banner_v2"
                            className="hover:text-violet-300 transition-colors flex items-center gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Website Banner - V2
                          </Link>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant="tag">Visual</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            1 Issue
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">Mansoor R.</td>
                        <td className="px-4 py-3.5">
                          <Badge variant="changes_requested">Changes Req.</Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link href="/submissions/sub_banner_v2">
                            <Button size="sm" variant="secondary" className="text-xs py-1 px-2.5">
                              Review
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Top Issues (This Week) */}
          <div className="lg:col-span-4">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Top Issues (This Week)</CardTitle>
                <span className="text-[11px] text-slate-400">Total 28</span>
              </CardHeader>
              <CardContent className="space-y-4">
                {topIssues.map((issue) => (
                  <div key={issue.title} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-3.5 rounded bg-violet-400"></span>
                        <span className="text-slate-200 font-medium">{issue.title}</span>
                      </div>
                      <span className="text-slate-300 font-bold">{issue.count}</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#1C2033] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${issue.color} rounded-full`}
                        style={{ width: `${(issue.count / issue.max) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-[#1C2033]">
                  <Link
                    href="/analytics"
                    className="w-full block text-center py-2 px-3 rounded-lg bg-[#141624] hover:bg-[#1A1D30] border border-[#232742] text-xs font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    View Governance Insights &rarr;
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
