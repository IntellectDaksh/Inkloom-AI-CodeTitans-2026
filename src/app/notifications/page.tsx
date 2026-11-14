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
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-text-primary">
                Governance Alert Feed
              </h1>
              {unreadCount > 0 && (
                <span className="gold-badge text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase">
                  {unreadCount} UNREAD ALERTS
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
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
        <div className="glass rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center bg-panel border border-border-subtle rounded-lg p-0.5 text-xs font-mono">
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
                    ? "bg-panel-elevated text-text-primary border border-border-default shadow-xs"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono text-text-primary0">
            SHOWING {filteredNotifications.length} OF {notifications.length} ALERTS
          </span>
        </div>

        {/* Notification Cards List */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="divide-y divide-border-subtle">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    n.isRead
                      ? "hover:bg-panel-hover bg-panel"
                      : "bg-panel-hover hover:bg-panel-elevated border-l-2 border-l-blue"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Severity Icon */}
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border shadow-inner ${
                        n.severity === "critical"
                          ? "bg-status-critical/10 border-status-critical/30 text-status-critical"
                          : n.severity === "warning"
                          ? "bg-status-warning/10 border-status-warning/30 text-status-warning"
                          : n.severity === "success"
                          ? "bg-status-success/10 border-status-success/30 text-status-success"
                          : "bg-panel-hover border-border-default text-text-secondary"
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
                        <span className="font-semibold text-text-primary text-xs">
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="led-indicator led-turquoise" title="Unread" />
                        )}
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-panel border border-border-subtle text-text-muted">
                          {n.type.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed font-sans max-w-2xl">
                        {n.message}
                      </p>
                      <div className="text-[10px] font-mono text-text-primary0 flex items-center gap-1.5 pt-0.5">
                        <Clock className="w-3 h-3 text-text-muted" />
                        <span>{n.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {!n.isRead && (
                      <button
                        onClick={() => markSingleRead(n.id)}
                        className="text-[10px] font-mono text-text-muted hover:text-text-primary px-2 py-1 rounded hover:bg-panel-hover transition-colors cursor-pointer"
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
              <div className="p-12 text-center text-text-primary0 font-mono text-xs">
                NO NOTIFICATIONS FOUND IN CURRENT FILTER
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
