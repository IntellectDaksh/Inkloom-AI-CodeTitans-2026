"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Check, Clock, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: "notif_1",
      title: "New Submission Needs Review",
      message: "Riddhi S. submitted 'Q4 Campaign – Reel Script' with 3 flagged compliance issues.",
      time: "10 min ago",
      type: "submission",
      isRead: false,
      link: "/submissions/sub_reel_script",
    },
    {
      id: "notif_2",
      title: "Claim Approaching Expiry",
      message: "Approved Claim CLM-APX-003 ('Informed-Sport Certified') expires in 17 days.",
      time: "2 hours ago",
      type: "claim_expiry",
      isRead: false,
      link: "/knowledge-base/claims",
    },
    {
      id: "notif_3",
      title: "Content Approved",
      message: "Laksh K. approved 'Product Launch - Instagram Post' for publication.",
      time: "1 day ago",
      type: "approval",
      isRead: true,
      link: "/submissions/sub_insta_launch",
    },
    {
      id: "notif_4",
      title: "Brand Guidelines Updated",
      message: "Mansoor R. updated prohibited vocabulary for Apex Nutrition.",
      time: "2 days ago",
      type: "guidelines",
      isRead: true,
      link: "/knowledge-base/guidelines",
    },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Notifications
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Real-time alerts for submissions, approvals, expiring claims, and brand guidelines updates.
            </p>
          </div>

          <Button size="sm" variant="secondary" onClick={markAllRead}>
            Mark All as Read
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-[#1C2033]">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                    n.isRead ? "hover:bg-[#151728]/30" : "bg-[#141628]/60 hover:bg-[#181B30]"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        n.type === "submission"
                          ? "bg-violet-600/20 text-violet-400"
                          : n.type === "claim_expiry"
                          ? "bg-amber-600/20 text-amber-400"
                          : "bg-emerald-600/20 text-emerald-400"
                      }`}
                    >
                      {n.type === "submission" ? (
                        <FileText className="w-4 h-4" />
                      ) : n.type === "claim_expiry" ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 text-xs">{n.title}</span>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{n.message}</p>
                      <div className="text-[10px] text-slate-500 mt-1.5">{n.time}</div>
                    </div>
                  </div>

                  <Link href={n.link}>
                    <Button size="sm" variant="ghost" className="text-xs shrink-0">
                      View &rarr;
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
