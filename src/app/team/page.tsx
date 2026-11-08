"use client";

import React, { useState } from "react";
import { Users, UserPlus, Shield, Check, Mail } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function TeamPage() {
  const members = [
    {
      name: "Daksh Agrawal",
      email: "daksh@uideas.digital",
      role: "admin",
      roleTitle: "Admin",
      avatar: "DA",
      status: "active",
      joined: "Jan 2026",
    },
    {
      name: "Mansoor R.",
      email: "mansoor@uideas.digital",
      role: "brand_manager",
      roleTitle: "Brand Manager",
      avatar: "MR",
      status: "active",
      joined: "Feb 2026",
    },
    {
      name: "Laksh K.",
      email: "laksh@uideas.digital",
      role: "reviewer",
      roleTitle: "Reviewer",
      avatar: "LK",
      status: "active",
      joined: "Feb 2026",
    },
    {
      name: "Riddhi S.",
      email: "riddhi@uideas.digital",
      role: "creator",
      roleTitle: "Creator",
      avatar: "RS",
      status: "active",
      joined: "Mar 2026",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Team &amp; Permissions
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Role-based access control separating content creation, brand governance, and final approval sign-offs.
            </p>
          </div>

          <Button size="md" variant="primary" icon={<UserPlus className="w-4 h-4" />}>
            Invite Member
          </Button>
        </div>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Members ({members.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#1C2033]">
              {members.map((m) => (
                <div
                  key={m.email}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#151728]/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-semibold text-xs flex items-center justify-center shrink-0 border border-violet-400/30">
                      {m.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100 text-sm">{m.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{m.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        m.role === "admin"
                          ? "critical"
                          : m.role === "brand_manager"
                          ? "pending"
                          : m.role === "reviewer"
                          ? "approved"
                          : "tag"
                      }
                    >
                      {m.roleTitle}
                    </Badge>
                    <span className="text-xs text-slate-500">Joined {m.joined}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Permissions Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Role Permissions &amp; Guardrails</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0E101B] border-b border-[#1C2033] text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Permission Capability</th>
                    <th className="px-4 py-3">Admin</th>
                    <th className="px-4 py-3">Brand Manager</th>
                    <th className="px-4 py-3">Reviewer</th>
                    <th className="px-4 py-3">Creator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2033] text-slate-300">
                  <tr>
                    <td className="px-5 py-3 font-medium">Submit Drafts for Review</td>
                    <td className="px-4 py-3 text-emerald-400">✓</td>
                    <td className="px-4 py-3 text-emerald-400">✓</td>
                    <td className="px-4 py-3 text-emerald-400">✓</td>
                    <td className="px-4 py-3 text-emerald-400">✓</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium">Approve / Reject Submissions</td>
                    <td className="px-4 py-3 text-emerald-400">✓</td>
                    <td className="px-4 py-3 text-emerald-400">✓</td>
                    <td className="px-4 py-3 text-emerald-400">✓</td>
                    <td className="px-4 py-3 text-slate-600">—</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium">Add / Expire Approved Claims</td>
                    <td className="px-4 py-3 text-emerald-400">✓</td>
                    <td className="px-4 py-3 text-emerald-400">✓</td>
                    <td className="px-4 py-3 text-slate-600">—</td>
                    <td className="px-4 py-3 text-slate-600">—</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium">Modify Brand Voice &amp; Tone Rules</td>
                    <td className="px-4 py-3 text-emerald-400">✓</td>
                    <td className="px-4 py-3 text-emerald-400">✓</td>
                    <td className="px-4 py-3 text-slate-600">—</td>
                    <td className="px-4 py-3 text-slate-600">—</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-medium">Manage Team &amp; Billing</td>
                    <td className="px-4 py-3 text-emerald-400">✓</td>
                    <td className="px-4 py-3 text-slate-600">—</td>
                    <td className="px-4 py-3 text-slate-600">—</td>
                    <td className="px-4 py-3 text-slate-600">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
