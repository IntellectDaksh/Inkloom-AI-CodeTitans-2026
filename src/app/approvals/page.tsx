"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
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

  // Filter items matching screenshot
  const pendingItems = [
    {
      id: "sub_reel_script",
      title: "Q4 Campaign – Reel Script",
      author: "Riddhi S.",
      type: "Script",
      status: "pending",
      summary: "Our new protein blend gives you 2x faster results...",
    },
    {
      id: "sub_linkedin_update",
      title: "LinkedIn – Product Update",
      author: "Laksh K.",
      type: "Social",
      status: "pending",
      summary: "We are thrilled to unveil our new enterprise wellness initiative...",
    },
    {
      id: "sub_ad_creative",
      title: "Ad Creative – V2",
      author: "Mansoor R.",
      type: "Visual",
      status: "pending",
      summary: "Experience sustained energy without midday crashes...",
    },
  ];

  const approvedItems = [
    {
      id: "sub_insta_launch",
      title: "Product Launch - Instagram Post",
      author: "Laksh K.",
      type: "Social",
      status: "approved",
      summary: "Introducing our new plant-powered recovery formula...",
    },
  ];

  const rejectedItems = [
    {
      id: "sub_banner_v2",
      title: "Website Banner - V2",
      author: "Mansoor R.",
      type: "Visual",
      status: "changes_requested",
      summary: "The ultimate miracle cure for post-workout fatigue...",
    },
  ];

  const displayItems =
    activeTab === "pending"
      ? pendingItems
      : activeTab === "approved"
      ? approvedItems
      : rejectedItems;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Approvals
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review and take action on pending content.
          </p>
        </div>

        {/* Filter Pills matching mockup */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "pending"
                ? "bg-[#1C1F33] text-violet-300 border border-violet-500/40 shadow-sm"
                : "bg-[#111320] text-slate-400 hover:text-white border border-[#1F2338]"
            }`}
          >
            Pending ({pendingItems.length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "approved"
                ? "bg-[#1C1F33] text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "bg-[#111320] text-slate-400 hover:text-white border border-[#1F2338]"
            }`}
          >
            Approved ({approvedItems.length})
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "rejected"
                ? "bg-[#1C1F33] text-rose-300 border border-rose-500/40 shadow-sm"
                : "bg-[#111320] text-slate-400 hover:text-white border border-[#1F2338]"
            }`}
          >
            Rejected ({rejectedItems.length})
          </button>
        </div>

        {/* Approvals List */}
        <div className="space-y-3">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#111320] border border-[#1F2338] hover:border-violet-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-900/30 to-indigo-900/30 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-violet-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-semibold text-slate-100">
                      {item.title}
                    </h3>
                    <Badge variant="tag">{item.type}</Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Submitted by {item.author}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <Link href={`/submissions/${item.id}`}>
                  <Button
                    size="sm"
                    variant="primary"
                    className="text-xs px-4 py-1.5"
                  >
                    Review
                  </Button>
                </Link>
              </div>
            </div>
          ))}

          {displayItems.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-xs bg-[#111320] rounded-xl border border-[#1F2338]">
              No submissions in this queue.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
