"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  Clock,
  ArrowLeft,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function ApprovedClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New claim form state
  const [newClaimText, setNewClaimText] = useState("");
  const [newCategory, setNewCategory] = useState("performance");
  const [newEvidenceSource, setNewEvidenceSource] = useState("");
  const [newEvidenceExcerpt, setNewEvidenceExcerpt] = useState("");
  const [newPermittedContext, setNewPermittedContext] = useState("");
  const [newExpiresAt, setNewExpiresAt] = useState("2027-12-31");

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = () => {
    setLoading(true);
    fetch("/api/claims?brandId=brand_apex")
      .then((res) => res.json())
      .then((data) => {
        if (data.claims) {
          setClaims(data.claims);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaimText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimText: newClaimText,
          category: newCategory,
          evidenceSource: newEvidenceSource,
          evidenceExcerpt: newEvidenceExcerpt,
          permittedContext: newPermittedContext || "All digital and social channels",
          expiresAt: `${newExpiresAt}T23:59:59Z`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setNewClaimText("");
        setNewEvidenceSource("");
        setNewEvidenceExcerpt("");
        fetchClaims();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClaims = claims.filter((c) => {
    const matchesSearch =
      c.claimText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.evidenceSource?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ? true : c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="space-y-4">
          <Link
            href="/knowledge-base"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Knowledge Base</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                Approved Claims & Facts Library
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Every marketing claim backed by verifiable scientific, clinical, or legal evidence.
              </p>
            </div>

            <Button
              size="md"
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Approved Claim
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-xl bg-[#111320] border border-[#1F2338]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search claims or evidence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {["all", "approved", "expired", "under_review"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filterStatus === st
                    ? "bg-violet-600 text-white"
                    : "bg-[#181B2D] text-slate-400 hover:text-white"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Claims List */}
        <div className="space-y-3">
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="p-5 rounded-xl bg-[#111320] border border-[#1F2338] hover:border-violet-500/30 transition-colors space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold text-white">
                    &quot;{claim.claimText}&quot;
                  </span>
                  <Badge
                    variant={
                      claim.status === "approved"
                        ? "approved"
                        : claim.status === "expired"
                        ? "critical"
                        : "pending"
                    }
                  >
                    {claim.status}
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Expires: {new Date(claim.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Supporting Evidence Excerpt */}
              <div className="p-3 rounded-lg bg-[#0E101D] border border-[#1E233A] text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Supporting Evidence: {claim.evidenceSource}</span>
                </div>
                <div className="text-slate-400 italic">
                  &quot;{claim.evidenceExcerpt}&quot;
                </div>
              </div>

              {/* Context and Scope */}
              <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400 pt-1">
                <div className="flex items-center gap-4">
                  <span>
                    <strong>Permitted:</strong> {claim.permittedContext || "All channels"}
                  </span>
                  {claim.restrictedContext && (
                    <span className="text-rose-400">
                      <strong>Restricted:</strong> {claim.restrictedContext}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span>Owner: {claim.owner || "Brand Manager"}</span>
                  <span>Version: v{claim.version || 1}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredClaims.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-xs bg-[#111320] rounded-xl border border-[#1F2338]">
              No claims match your search.
            </div>
          )}
        </div>

        {/* Modal: Add New Approved Claim */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-[#111322] border border-[#272B45] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-[#1C2033]">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  Add Approved Marketing Claim
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateClaim} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Exact Claim Text *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder='e.g., "Clinically proven to accelerate recovery by 34%."'
                    value={newClaimText}
                    onChange={(e) => setNewClaimText(e.target.value)}
                    className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    >
                      <option value="performance">Performance</option>
                      <option value="efficacy">Efficacy</option>
                      <option value="safety">Safety</option>
                      <option value="sourcing">Sourcing</option>
                      <option value="certifications">Certifications</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Expiry / Review Date
                    </label>
                    <input
                      type="date"
                      value={newExpiresAt}
                      onChange={(e) => setNewExpiresAt(e.target.value)}
                      className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    >
                    </input>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Evidence Source Document / URL *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Clinical Trial CT-2024-B8 or ISO-9001 Certificate"
                    value={newEvidenceSource}
                    onChange={(e) => setNewEvidenceSource(e.target.value)}
                    className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Supporting Evidence Excerpt *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Exact excerpt or statistical finding supporting the claim..."
                    value={newEvidenceExcerpt}
                    onChange={(e) => setNewEvidenceExcerpt(e.target.value)}
                    className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Permitted Context and Scope
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Organic social media, website, blog posts"
                    value={newPermittedContext}
                    onChange={(e) => setNewPermittedContext(e.target.value)}
                    className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={submitting}>
                    Save Approved Claim
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
