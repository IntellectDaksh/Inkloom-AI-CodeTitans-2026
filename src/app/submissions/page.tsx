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
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function SubmissionsHistoryPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const filtered = submissions.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.currentContent || s.raw_content || "")
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout
      title="Submissions Desk"
      subtitle="Complete ledger of all draft marketing communications and their deterministic audit histories."
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-100">
                Submissions Audit Desk
              </h1>
              <Badge variant="verified" size="xs">
                {submissions.length} RECORDS
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Every piece of content evaluated against clinical trial evidence and brand compliance guardrails.
            </p>
          </div>

          <Link href="/submissions/new">
            <Button size="sm" variant="primary" icon={<Plus className="w-3.5 h-3.5" />} shortcut="N">
              Audit New Draft
            </Button>
          </Link>
        </div>

        {/* Filter bar */}
        <div className="p-3 bg-[#131622] border border-[#1E2333] rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title, phrasing, or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#090A10] border border-[#1E2333] focus:border-violet-500 focus:outline-none rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 font-mono placeholder:text-slate-600 transition-colors"
            />
          </div>

          <div className="flex items-center bg-[#090A10] border border-[#1E2333] rounded p-0.5 text-xs font-mono font-medium overflow-x-auto">
            {["all", "submitted", "under_review", "approved", "changes_requested"].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer capitalize shrink-0 ${
                    statusFilter === st
                      ? "bg-[#181C2D] text-slate-100 font-semibold shadow-xs"
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
        <div className="bg-[#131622] border border-[#1E2333] rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090A10] border-b border-[#1E2333] text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                <tr>
                  <th className="px-4 py-3">Content Title</th>
                  <th className="px-3 py-3">Format</th>
                  <th className="px-3 py-3">Channel Context</th>
                  <th className="px-3 py-3">Author</th>
                  <th className="px-3 py-3">Governance Status</th>
                  <th className="px-4 py-3 text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1D2B]">
                {filtered.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-[#171B2B] transition-colors group"
                  >
                    <td className="px-4 py-3.5 font-medium text-slate-100">
                      <Link
                        href={`/submissions/${sub.id}`}
                        className="hover:text-violet-300 transition-colors flex items-center gap-2 max-w-sm truncate"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            sub.status === "approved"
                              ? "bg-emerald-400"
                              : sub.status === "changes_requested"
                              ? "bg-amber-400"
                              : "bg-rose-400"
                          }`}
                        />
                        <span className="truncate">{sub.title}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-3.5">
                      <Badge variant="tag" size="xs">
                        {sub.submission_type?.replace("_", " ") || "Draft"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3.5 text-slate-300 font-mono text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-[#090A10] border border-[#1E2333] text-slate-300">
                        {((sub.metadata as any)?.channel || sub.channel || "Social").replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-slate-300">
                      {sub.creator?.full_name || sub.authorName || "Riddhi S."}
                    </td>
                    <td className="px-3 py-3.5">
                      <Badge
                        variant={
                          sub.status === "approved"
                            ? "verified"
                            : sub.status === "changes_requested"
                            ? "warning"
                            : "violation"
                        }
                        size="xs"
                      >
                        {sub.status?.replace("_", " ").toUpperCase() || "PENDING"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/submissions/${sub.id}`}>
                        <Button size="xs" variant="secondary">
                          Inspect &rarr;
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500 font-mono text-xs">
                      NO SUBMISSIONS FOUND MATCHING ACTIVE FILTER
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2.5 bg-[#090A10] border-t border-[#1E2333] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>TOTAL: {filtered.length} OF {submissions.length} SUBMISSIONS</span>
            <span className="text-emerald-400">ORGANIZATION: UIDEAS DIGITAL / APEX NUTRITION</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
