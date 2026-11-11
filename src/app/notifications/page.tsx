"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  Clock,
  ShieldAlert,
  FileText,
  CheckCircle2,
  Filter,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "submission" | "claim_expiry" | "approval" | "guidelines";
  isRead: boolean;
  link: string;
  severity: "critical" | "warning" | "success" | "info";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    title: "New Submission Ingested — Pre-flight Violations Flagged",
    message: "Riddhi S. submitted 'Q4 Campaign – Clinical Protein Reel Script' with 3 flagged statutory compliance issues.",
    time: "10m ago",
    type: "submission",
    isRead: false,
    link: "/submissions/sub_reel_script",
    severity: "critical",
  },
  {
    id: "notif_2",
    title: "Impending Claims Expiration Watchlist (<30 Days)",
    message: "Approved Claim CLM-APX-002 ('Informed-Sport Certified') expires in 17 days. 1 active draft depends on this record.",
    time: "42m ago",
    type: "claim_expiry",
    isRead: false,
    link: "/knowledge-base/claims",
    severity: "warning",
  },
  {
    id: "notif_3",
    title: "Submission Cleared & Approved by Legal",
    message: "Laksh K. approved 'Product Launch – Recovery Blend Carousel' for publication with ISO-21CFR digital signature.",
    time: "2h ago",
    type: "approval",
    isRead: false,
    link: "/submissions/sub_insta_launch",
    severity: "success",
  },
  {
    id: "notif_4",
    title: "Dynamic Cascade Re-Review Notice",
    message: "Cascade re-audit triggered for CLM-APX-003: 1 dependent draft queued for reviewer sign-off.",
    time: "4h ago",
    type: "claim_expiry",
    isRead: true,
    link: "/knowledge-base/claims",
    severity: "info",
  },
  {
    id: "notif_5",
    title: "Brand Voice Guidelines Updated",
    message: "Mansoor R. updated prohibited vocabulary for Apex Nutrition (added 'cheat code' and 'magic bullet').",
    time: "1d ago",
    type: "guidelines",
    isRead: true,
    link: "/knowledge-base/guidelines",
    severity: "info",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filterType, setFilterType] = useState<string>("all");

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const markSingleRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "all") return true;
    if (filterType === "unread") return !n.isRead;
    return n.type === filterType;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppLayout
      title="Compliance Notifications & Alert Feed"
      subtitle="Operational telemetry alerts for pre-flight findings, expiring claims, cascade re-audits, and reviewer decisions."
    >
      <div className="space-y-6">
        {/* Header & Mark All Read */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="led-indicator led-turquoise" />
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-100">
                Governance Alert Feed
              </h1>
              {unreadCount > 0 && (
                <span className="gold-badge text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase">
                  {unreadCount} UNREAD ALERTS
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Real-time audit triage alerts for regulatory safe-harbor breaches, impending claim expirations, and cascade review triggers.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {unreadCount > 0 && (
              <Button size="sm" variant="secondary" onClick={markAllRead}>
                Mark All as Read
              </Button>
            )}
          </div>
        </div>

        {/* Filter Toolbar Tabs */}
        <div className="tactile-card rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center bg-[#080C16] border border-[#1E2B4A] rounded-lg p-0.5 text-xs font-mono">
            {[
              { id: "all", label: `All (${notifications.length})` },
              { id: "unread", label: `Unread (${unreadCount})` },
              { id: "submission", label: "Submissions" },
              { id: "claim_expiry", label: "Claims & Expiry" },
              { id: "approval", label: "Approvals" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer font-medium ${
                  filterType === tab.id
                    ? "bg-[#162445] text-white border border-[#2E416E] shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono text-slate-500">
            SHOWING {filteredNotifications.length} OF {notifications.length} ALERTS
          </span>
        </div>

        {/* Notification Cards List */}
        <div className="tactile-card rounded-xl overflow-hidden">
          <div className="divide-y divide-[#162038]">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    n.isRead
                      ? "hover:bg-[#111C35]/60 bg-[#0A0F1D]/40"
                      : "bg-[#0D1527] hover:bg-[#111C35] border-l-2 border-l-[#00F2FE]"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Severity Icon */}
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border shadow-inner ${
                        n.severity === "critical"
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          : n.severity === "warning"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : n.severity === "success"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-cyan-500/10 border-cyan-500/30 text-[#00F2FE]"
                      }`}
                    >
                      {n.type === "submission" ? (
                        <FileText className="w-4 h-4" />
                      ) : n.type === "claim_expiry" ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : n.type === "approval" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 text-xs">
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="led-indicator led-turquoise" title="Unread" />
                        )}
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#080C16] border border-[#1E2B4A] text-slate-400">
                          {n.type.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-2xl">
                        {n.message}
                      </p>
                      <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 pt-0.5">
                        <Clock className="w-3 h-3 text-slate-600" />
                        <span>{n.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {!n.isRead && (
                      <button
                        onClick={() => markSingleRead(n.id)}
                        className="text-[10px] font-mono text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-[#111C35] transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                    )}
                    <Link href={n.link}>
                      <Button size="xs" variant={n.isRead ? "secondary" : "turquoise"}>
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-500 font-mono text-xs">
                NO NOTIFICATIONS FOUND IN CURRENT FILTER
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
