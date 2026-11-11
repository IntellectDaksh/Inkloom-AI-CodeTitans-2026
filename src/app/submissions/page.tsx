"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Sliders,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface SubmissionRow {
  id: string;
  title: string;
  type?: string;
  channel?: string;
  status: "submitted" | "under_review" | "approved" | "changes_requested" | "rejected" | "needs_re_review";
  score?: number;
  complianceScore?: number;
  issuesCount?: number;
  authorName?: string;
  creator?: { full_name: string };
  submittedAt?: string;
  created_at?: string;
  metadata?: any;
}

const DEFAULT_SUBMISSIONS: SubmissionRow[] = [
  {
    id: "sub_reel_script",
    title: "Q4 Campaign – Clinical Protein Reel Script",
    type: "Video Script",
    channel: "Instagram Reel",
    issuesCount: 3,
    authorName: "Riddhi S.",
    status: "submitted",
    score: 18,
    submittedAt: "14m ago",
  },
  {
    id: "sub_insta_launch",
    title: "Product Launch – Recovery Blend Carousel",
    type: "Social Copy",
    channel: "Instagram Carousel",
    issuesCount: 0,
    authorName: "Laksh K.",
    status: "approved",
    score: 96,
    submittedAt: "1h ago",
  },
  {
    id: "sub_banner_v2",
    title: "Global Website Banner – Winter Immunity V2",
    type: "Web Copy",
    channel: "Homepage Hero",
    issuesCount: 1,
    authorName: "Mansoor R.",
    status: "changes_requested",
    score: 64,
    submittedAt: "2h ago",
  },
  {
    id: "sub_email_promo",
    title: "Enterprise SaaS SLA Email Announcement",
    type: "Email Direct",
    channel: "B2B Newsletter",
    issuesCount: 0,
    authorName: "Daksh A.",
    status: "approved",
    score: 98,
    submittedAt: "4h ago",
  },
  {
    id: "sub_clinical_whitepaper",
    title: "Bio-Peptide Cutaneous Efficacy Study Summary",
    type: "Whitepaper",
    channel: "Healthcare Portal",
    issuesCount: 2,
    authorName: "Dr. Marcus Lin",
    status: "under_review",
    score: 42,
    submittedAt: "6h ago",
  },
];

export default function SubmissionsHistoryPage() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>(DEFAULT_SUBMISSIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/submissions?orgId=org_uideas_digital")
      .then((res) => res.json())
      .then((data) => {
        if (data.submissions && data.submissions.length > 0) {
          // Merge API submissions
          setSubmissions(data.submissions);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = submissions.filter((s) => {
    const titleMatch = s.title?.toLowerCase().includes(search.toLowerCase());
    const channelVal = ((s.metadata as any)?.channel || s.channel || "").toLowerCase();
    const channelMatch = channelVal.includes(search.toLowerCase());
    const authorVal = (s.creator?.full_name || s.authorName || "").toLowerCase();
    const authorMatch = authorVal.includes(search.toLowerCase());

    const matchesSearch = titleMatch || channelMatch || authorMatch;
    const matchesStatus = statusFilter === "all" ? true : s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout
      title="Submissions Audit Desk"
      subtitle="Complete chronological archive of all evaluated marketing communications, token surgical diffs, and cryptographic approval stamps."
    >
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="led-indicator led-turquoise" />
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-100">
                Content Submissions Archive
              </h1>
              <Badge variant="verified" size="xs">
                {submissions.length} AUDITED RECORDS
              </Badge>
              <span className="gold-badge text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase">
                RLS TENANT SCOPED
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Every marketing draft submitted across Instagram, LinkedIn, Paid Social, or packaging is cryptographically archived with its deterministic findings ledger.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/submissions/new">
              <Button
                size="sm"
                variant="gold"
                icon={<Plus className="w-3.5 h-3.5 text-[#080C16]" />}
                shortcut="N"
              >
                Audit New Draft
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="tactile-card rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title, channel, or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 font-mono placeholder:text-slate-600 transition-colors"
            />
          </div>

          <div className="flex items-center bg-[#080C16] border border-[#1E2B4A] rounded-lg p-0.5 text-xs font-mono font-medium overflow-x-auto">
            {["all", "submitted", "under_review", "approved", "changes_requested"].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer capitalize shrink-0 ${
                    statusFilter === st
                      ? "bg-[#162445] text-white font-semibold border border-[#2E416E] shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              )
            )}
          </div>
        </div>

        {/* Table */}
        <div className="tactile-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080C16] border-b border-[#1E2B4A] text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                <tr>
                  <th className="px-4 py-3">Content Title</th>
                  <th className="px-3 py-3">Format / Channel</th>
                  <th className="px-3 py-3 text-center">Score</th>
                  <th className="px-3 py-3">Author</th>
                  <th className="px-3 py-3">Governance Gate</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162038]">
                {filtered.map((sub) => {
                  const isApproved = sub.status === "approved";
                  const isPending = sub.status === "submitted" || sub.status === "under_review";
                  const scoreVal = sub.complianceScore || sub.score || (isApproved ? 96 : 32);

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-[#111C35]/60 transition-colors group"
                    >
                      <td className="px-4 py-3.5 font-medium text-slate-200">
                        <Link
                          href={`/submissions/${sub.id}`}
                          className="hover:text-[#00F2FE] transition-colors flex items-center gap-2.5 max-w-sm truncate"
                        >
                          <span
                            className={`led-indicator ${
                              isApproved
                                ? "led-emerald"
                                : isPending
                                ? "led-turquoise"
                                : "led-amber"
                            }`}
                          />
                          <span className="truncate font-sans font-medium">{sub.title}</span>
                        </Link>
                      </td>

                      <td className="px-3 py-3.5 text-slate-400 font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-[#080C16] border border-[#1E2B4A] text-slate-300">
                          {((sub.metadata as any)?.channel || sub.channel || "Social Reel").replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-3 py-3.5 text-center">
                        <span
                          className={`font-mono font-semibold tabular-nums text-xs px-2 py-0.5 rounded ${
                            scoreVal >= 80
                              ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25"
                              : scoreVal >= 50
                              ? "text-amber-400 bg-amber-500/10 border border-amber-500/25"
                              : "text-rose-400 bg-rose-500/10 border border-rose-500/25"
                          }`}
                        >
                          {scoreVal}%
                        </span>
                      </td>

                      <td className="px-3 py-3.5 text-slate-300 text-xs">
                        {sub.creator?.full_name || sub.authorName || "Riddhi S."}
                      </td>

                      <td className="px-3 py-3.5">
                        <Badge
                          variant={
                            sub.status === "approved"
                              ? "verified"
                              : sub.status === "changes_requested"
                              ? "warning"
                              : "pending"
                          }
                          size="xs"
                        >
                          {sub.status?.replace("_", " ").toUpperCase() || "PENDING"}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <Link href={`/submissions/${sub.id}`}>
                          <Button size="xs" variant={isPending ? "primary" : "secondary"}>
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500 font-mono text-xs">
                      NO SUBMISSIONS FOUND MATCHING ACTIVE FILTER
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-[#080C16] border-t border-[#1E2B4A] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>TOTAL: {filtered.length} OF {submissions.length} SUBMISSIONS</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="led-indicator led-emerald" />
              ORGANIZATION: APEX NUTRITION (STRICT TENANT ISOLATION)
            </span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
