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
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
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
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Submission History
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Browse, audit, and inspect all draft communications and their version histories.
            </p>
          </div>

          <Link href="/submissions/new">
            <Button size="md" variant="primary" icon={<Plus className="w-4 h-4" />}>
              Submit New Draft
            </Button>
          </Link>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-xl bg-[#111320] border border-[#1F2338]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search submissions by title or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            {["all", "submitted", "under_review", "approved", "changes_requested"].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize shrink-0 transition-colors ${
                    statusFilter === st
                      ? "bg-violet-600 text-white"
                      : "bg-[#181B2D] text-slate-400 hover:text-white"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              )
            )}
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0E101B] border-b border-[#1C2033] text-slate-400 font-medium">
                  <tr>
                    <th className="px-5 py-3">Content Title</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Author</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2033]">
                  {filtered.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-[#151728]/40 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-slate-100">
                        <Link
                          href={`/submissions/${sub.id}`}
                          className="hover:text-violet-300 transition-colors flex items-center gap-2"
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              sub.status === "approved"
                                ? "bg-emerald-500"
                                : sub.status === "changes_requested"
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                          ></span>
                          <span>{sub.title}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="tag">
                          {sub.submission_type?.replace("_", " ") || "Draft"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {((sub.metadata as any)?.channel || sub.channel || "Social").replace("_", " ")}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {sub.creator?.full_name || sub.authorName || "Team Member"}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={
                            sub.status === "approved"
                              ? "approved"
                              : sub.status === "changes_requested"
                              ? "changes_requested"
                              : "pending"
                          }
                        >
                          {sub.status?.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link href={`/submissions/${sub.id}`}>
                          <Button size="sm" variant="secondary" className="text-xs py-1 px-2.5">
                            Review &rarr;
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        No submissions found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
