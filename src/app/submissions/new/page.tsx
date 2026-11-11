"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Upload,
  FileText,
  Send,
  ShieldCheck,
  AlertCircle,
  Play,
  ArrowRight,
  Database,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function NewSubmissionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [brandId, setBrandId] = useState("brand_apex");
  const [channel, setChannel] = useState("social_media");
  const [submissionType, setSubmissionType] = useState("reel_script");
  const [campaign, setCampaign] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Please provide both a title and content for review.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          brandId,
          channel,
          submissionType,
          campaign,
          runAnalysis: true,
        }),
      });

      const data = await res.json();
      if (data.success && data.submission?.id) {
        router.push(`/submissions/${data.submission.id}`);
      } else {
        setError(data.error || "Failed to submit content.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = (type: "reel" | "compliant") => {
    if (type === "reel") {
      setTitle("Q4 Campaign – Clinical Protein Reel Script");
      setContent(
        "Our proprietary formula gives you 2x faster results and helps build muscle in just 14 days without dietary changes. Guaranteed 100% recovery with all-natural miracle bio-peptides."
      );
      setSubmissionType("reel_script");
      setChannel("social_media");
      setCampaign("Q4 Peak Athletic Season");
    } else {
      setTitle("Product Launch – Clean Recovery Blend Post");
      setContent(
        "Introducing our ISO-tested plant protein recovery blend. Clinically demonstrated to support muscle protein synthesis when consumed within 45 minutes of resistance training. Formulated with zero added sugars."
      );
      setSubmissionType("social_post");
      setChannel("social_media");
      setCampaign("Spring 2026 Launch");
    }
  };

  return (
    <AppLayout
      title="Draft Ingestion & Pre-Flight Studio"
      subtitle="Submit marketing, advertising, or packaging copy for instant deterministic pre-flight checks and clinical proof grounding."
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Breadcrumb & Sample Presets */}
        <div className="space-y-4">
          <Link
            href="/submissions"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>SUBMISSIONS / NEW DRAFT AUDIT</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="led-indicator led-turquoise" />
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-100">
                  Pre-Flight Content Ingestion
                </h1>
                <Badge variant="verified" size="xs">
                  STAGE 1 INGESTION
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Your draft will undergo deterministic brand rule checks, regex filtering, and evidence verification.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample("reel")}
                className="px-3 py-1.5 rounded-lg bg-[#111C35] hover:bg-[#162547] text-amber-300 text-xs font-mono border border-amber-500/30 transition-colors cursor-pointer"
              >
                Load Sample (With Flags)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample("compliant")}
                className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 text-xs font-mono border border-emerald-500/30 transition-colors cursor-pointer"
              >
                Load Compliant Draft
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="tactile-card rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#1E2B4A] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00F2FE]" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Submission Configuration &amp; Metadata
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500">MANDATORY SPECIFICATION</span>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5 uppercase text-[11px]">
                  CONTENT TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Campaign – Clinical Protein Reel Script"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg px-3.5 py-2.5 text-xs text-slate-100 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 uppercase text-[11px]">
                    BRAND WORKSPACE *
                  </label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg px-3 py-2 text-slate-200 cursor-pointer"
                  >
                    <option value="brand_apex">Apex Nutrition (Active)</option>
                    <option value="brand_zenith">Zenith Cloud SaaS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 uppercase text-[11px]">
                    CONTENT FORMAT *
                  </label>
                  <select
                    value={submissionType}
                    onChange={(e) => setSubmissionType(e.target.value)}
                    className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg px-3 py-2 text-slate-200 cursor-pointer"
                  >
                    <option value="reel_script">Reel / Video Script</option>
                    <option value="social_post">Social Media Post</option>
                    <option value="banner_copy">Ad / Visual Banner Copy</option>
                    <option value="newsletter">Email Direct Newsletter</option>
                    <option value="landing_page">Website / Landing Page</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 uppercase text-[11px]">
                    PUBLICATION CHANNEL *
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg px-3 py-2 text-slate-200 cursor-pointer"
                  >
                    <option value="social_media">Instagram / TikTok / X</option>
                    <option value="advertisement">Paid Ads / Meta / Google</option>
                    <option value="email">Email Campaign</option>
                    <option value="landing_page">Official Website (DTC)</option>
                    <option value="press_release">Press Release &amp; Wire</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5 uppercase text-[11px]">
                  CAMPAIGN / INITIATIVE (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q4 Black Friday / Global Athletic Launch"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg px-3 py-2 text-slate-200 font-sans"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-medium uppercase text-[11px]">
                    CONTENT DRAFT TEXT *
                  </label>
                  <span className="text-slate-500 text-[10px]">REAL-TIME PRE-FLIGHT PARSING</span>
                </div>
                <textarea
                  required
                  rows={6}
                  placeholder="Type or paste marketing copy, script lines, or packaging statements here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#080C16] border border-[#1E2B4A] focus:border-[#00F2FE] focus:outline-none rounded-lg p-3 text-xs text-slate-100 font-mono leading-relaxed resize-none"
                />
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1.5">
                  <span>LENGTH: {content.length} CHARACTERS · {Math.ceil(content.length / 4)} TOKENS</span>
                  <span className="text-[#00F2FE] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE]" />
                    <span>Validated vs Active Claims &amp; ISO 22196</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Grounded in approved clinical/legal evidence</span>
            </div>

            <Button
              type="submit"
              size="md"
              variant="gold"
              loading={loading}
              icon={<Play className="w-3.5 h-3.5 fill-current" />}
            >
              <span>{loading ? "Auditing Tokens..." : "Execute Pre-Flight Audit"}</span>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
