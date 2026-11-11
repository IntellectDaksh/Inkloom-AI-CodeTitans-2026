"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Shield,
  Check,
  Mail,
  UserCheck,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface TeamMember {
  name: string;
  email: string;
  role: "admin" | "brand_manager" | "reviewer" | "creator";
  roleTitle: string;
  avatar: string;
  status: "active" | "invited";
  joined: string;
  scope: string;
}

const INITIAL_MEMBERS: TeamMember[] = [
  {
    name: "Daksh Agrawal",
    email: "daksh@uideas.digital",
    role: "admin",
    roleTitle: "Admin / Brand Director",
    avatar: "DA",
    status: "active",
    joined: "Jan 2026",
    scope: "Full organization authority, claims management, and policy overrides",
  },
  {
    name: "Laksh K.",
    email: "laksh@uideas.digital",
    role: "reviewer",
    roleTitle: "Lead Regulatory Reviewer",
    avatar: "LK",
    status: "active",
    joined: "Feb 2026",
    scope: "Multi-tier approval queue, evidence verification, and sign-offs",
  },
  {
    name: "Riddhi S.",
    email: "riddhi@uideas.digital",
    role: "creator",
    roleTitle: "Senior Content Creator",
    avatar: "RS",
    status: "active",
    joined: "Mar 2026",
    scope: "Draft submission, surgical diff application, and finding disputes",
  },
  {
    name: "Mansoor R.",
    email: "mansoor@uideas.digital",
    role: "brand_manager",
    roleTitle: "QA & Brand Manager",
    avatar: "MR",
    status: "active",
    joined: "Feb 2026",
    scope: "Brand voice guidelines, prohibited dictionary, and asset audits",
  },
];

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [activeRole, setActiveRole] = useState<string>("admin");
  const [activeUser, setActiveUser] = useState<string>("Daksh Agrawal");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "brand_manager" | "reviewer" | "creator">("reviewer");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("inkloom:session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.role) {
          const r = parsed.role.toLowerCase();
          setActiveRole(r === "admin" ? "admin" : r === "reviewer" ? "reviewer" : "creator");
          setActiveUser(parsed.name || "Daksh Agrawal");
        }
      }
    } catch {}
  }, []);

  const handleSwitchRole = (roleKey: "admin" | "reviewer" | "creator", userName: string, email: string) => {
    setActiveRole(roleKey);
    setActiveUser(userName);

    try {
      localStorage.setItem(
        "inkloom:session",
        JSON.stringify({
          name: userName,
          role: roleKey === "admin" ? "Admin" : roleKey === "reviewer" ? "Reviewer" : "Creator",
          email: email,
          userId:
            roleKey === "admin"
              ? "00000000-0000-4000-a000-000000000010"
              : roleKey === "reviewer"
              ? "00000000-0000-4000-a000-000000000012"
              : "00000000-0000-4000-a000-000000000011",
        })
      );
    } catch {}

    setToastMessage(`Switched active persona to ${userName} (${roleKey.toUpperCase()}).`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newMember: TeamMember = {
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      roleTitle:
        inviteRole === "admin"
          ? "Admin"
          : inviteRole === "reviewer"
          ? "Compliance Reviewer"
          : inviteRole === "brand_manager"
          ? "Brand Manager"
          : "Content Creator",
      avatar: inviteName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      status: "invited",
      joined: "Just now",
      scope: "Assigned via Organization Administrator Console",
    };

    setMembers([newMember, ...members]);
    setIsInviteModalOpen(false);
    setInviteName("");
    setInviteEmail("");
    setToastMessage(`Invitation sent to ${inviteEmail} with ${inviteRole.toUpperCase()} permissions.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <AppLayout
      title="Team & Role-Based Access Control"
      subtitle="Strict cryptographic segregation of duties between content creators, brand stewards, and final approval authorities."
    >
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="led-indicator led-turquoise" />
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-100">
                Team Governance &amp; Permissions Matrix
              </h1>
              <Badge variant="verified" size="xs">
                RBAC ENFORCED
              </Badge>
              <span className="gold-badge text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase">
                21 CFR PART 11 GATED
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Separation of duties guarantees that creators cannot self-approve content, while authorized regulatory reviewers sign off with tamper-proof electronic audit trails.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              size="sm"
              variant="gold"
              icon={<UserPlus className="w-3.5 h-3.5 text-[#080C16]" />}
              onClick={() => setIsInviteModalOpen(true)}
            >
              Invite Member
            </Button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-sans font-medium">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Interactive 1-Click Role Switcher Bar */}
        <div className="tactile-card rounded-xl p-4 sm:p-5 space-y-3 bg-[#141414] border border-[#303030]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-white" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Active Session Persona Switcher
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#858585]">
              CURRENT SESSION: <span className="text-white font-bold">{activeUser}</span> ({activeRole.toUpperCase()})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "admin",
                name: "Daksh Agrawal",
                role: "Admin / Director",
                email: "daksh@uideas.digital",
                desc: "Full organization governance & policy overrides",
                accent: "gold",
              },
              {
                id: "reviewer",
                name: "Laksh K.",
                role: "Compliance Reviewer",
                email: "laksh@uideas.digital",
                desc: "Formal human sign-off & dispute triage",
                accent: "neutral",
              },
              {
                id: "creator",
                name: "Riddhi S.",
                role: "Content Creator",
                email: "riddhi@uideas.digital",
                desc: "Draft submission & surgical diff application",
                accent: "slate",
              },
            ].map((p) => {
              const isSelected = activeRole === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSwitchRole(p.id as any, p.name, p.email)}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#191919] border-white shadow-xs"
                      : "bg-[#141414] hover:bg-[#191919] border-[#303030] hover:border-[#404040]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        p.accent === "gold"
                          ? "bg-[#1C1608] text-[#F59E0B] border-[#F59E0B]/30"
                          : "bg-[#191919] text-[#B5B5B5] border-[#303030]"
                      }`}
                    >
                      {p.role.toUpperCase()}
                    </span>
                    {isSelected && <span className="led-indicator led-emerald" title="Active Persona" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{p.name}</div>
                    <div className="text-[10px] text-[#858585] mt-0.5">{p.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Members Directory Card */}
        <div className="tactile-card rounded-xl overflow-hidden bg-[#141414] border border-[#303030]">
          <div className="p-4 border-b border-[#303030] bg-[#191919] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Organization Member Registry ({members.length} Authorized Users)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#858585]">TENANT: UIDEAS DIGITAL</span>
          </div>

          <div className="divide-y divide-[#303030]">
            {members.map((m) => (
              <div
                key={m.email}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#191919] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#191919] border border-[#303030] text-white font-bold text-xs flex items-center justify-center shrink-0 font-mono shadow-inner">
                    {m.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100 text-xs flex items-center gap-2">
                      <span>{m.name}</span>
                      {m.status === "invited" && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/25">
                          INVITE PENDING
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>{m.email}</span>
                      <span>·</span>
                      <span className="text-slate-500">{m.scope}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant={
                      m.role === "admin"
                        ? "gold"
                        : m.role === "reviewer"
                        ? "verified"
                        : m.role === "brand_manager"
                        ? "pending"
                        : "tag"
                    }
                    size="xs"
                  >
                    {m.roleTitle}
                  </Badge>
                  <span className="text-[10px] font-mono text-slate-500">Joined {m.joined}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Permissions Matrix */}
        <div className="tactile-card rounded-xl overflow-hidden bg-[#141414] border border-[#303030]">
          <div className="p-4 border-b border-[#303030] bg-[#191919] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Statutory RBAC Capability Matrix
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#858585]">SOVEREIGN GOVERNANCE SPECIFICATION</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#191919] border-b border-[#303030] text-[11px] uppercase tracking-wider text-[#858585]">
                <tr>
                  <th className="px-5 py-3">Governance Capability</th>
                  <th className="px-4 py-3 text-center text-[#F59E0B]">Admin</th>
                  <th className="px-4 py-3 text-center text-white">Reviewer</th>
                  <th className="px-4 py-3 text-center text-[#B5B5B5]">Brand Manager</th>
                  <th className="px-4 py-3 text-center text-[#858585]">Creator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#303030] text-[#B5B5B5]">
                <tr>
                  <td className="px-5 py-3 font-sans font-medium text-slate-200">
                    Draft Ingestion &amp; Pre-Flight Scans
                  </td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-sans font-medium text-slate-200">
                    Surgical Word-Level Diff Application
                  </td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-sans font-medium text-slate-200">
                    Challenge &amp; Dispute Findings
                  </td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="px-4 py-3 text-center text-slate-600">—</td>
                  <td className="px-4 py-3 text-center text-slate-600">—</td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-sans font-medium text-slate-200">
                    Formal Human Approval &amp; Release Gate
                  </td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="px-4 py-3 text-center text-slate-600">—</td>
                  <td className="px-4 py-3 text-center text-slate-600">—</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-sans font-medium text-slate-200">
                    Legal Override Authorization (Page 4/5)
                  </td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="px-4 py-3 text-center text-slate-600">—</td>
                  <td className="px-4 py-3 text-center text-slate-600">—</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-sans font-medium text-slate-200">
                    Trigger Dynamic Cascade Re-Review
                  </td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="px-4 py-3 text-center text-slate-600">—</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 font-sans font-medium text-slate-200">
                    Claims Library &amp; Assays Repository Management
                  </td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="px-4 py-3 text-center text-slate-600">—</td>
                  <td className="px-4 py-3 text-center text-emerald-400 font-bold">✓</td>
                  <td className="px-4 py-3 text-center text-slate-600">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Invite Member Modal */}
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="tactile-card rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 border-[#303030] bg-[#141414]">
              <div className="flex items-center justify-between border-b border-[#303030] pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-white" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Invite Member to Workspace
                  </h3>
                </div>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="text-[#858585] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleInviteSubmit} className="space-y-3.5 text-xs font-mono">
                <div>
                  <label className="block text-[#858585] mb-1">FULL NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Aris Vance"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-2.5 text-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[#858585] mb-1">WORK EMAIL *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. aris@uideas.digital"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#858585] mb-1">GOVERNANCE ROLE *</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full bg-[#0A0A0A] border border-[#303030] focus:border-white focus:outline-none rounded-lg p-2.5 text-[#B5B5B5] cursor-pointer"
                  >
                    <option value="reviewer">Reviewer (Legal &amp; Regulatory Sign-off)</option>
                    <option value="creator">Creator (Copywriter / Content Producer)</option>
                    <option value="brand_manager">Brand Manager (Voice &amp; Rules)</option>
                    <option value="admin">Administrator (Full Access)</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#303030]">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsInviteModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" variant="gold">
                    Send Invitation
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
