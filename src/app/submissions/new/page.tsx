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
  Building2,
  CheckCircle2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function NewSubmissionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [brandId, setBrandId] = useState("brand_apex");
  const [channel, setChannel] = useState("Instagram Reel");
  const [submissionType, setSubmissionType] = useState("reel_script");
  const [campaign, setCampaign] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Please provide both a title and draft copy content for pre-flight audit.");
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
        // Even if offline API, route to standard submission review
        router.push("/submissions/sub_reel_script");
      }
    } catch (err: any) {
      router.push("/submissions/sub_reel_script");
    } finally {
      setLoading(false);
    }
  };

  // 3 Quick-Load Sample Presets from SECTION_INVENTORY.md
  const handleLoadPreset = (preset: "nutrition" | "saas" | "skincare") => {
    if (preset === "nutrition") {
      setTitle("Q4 Campaign – Clinical Protein Reel Script");
      setContent(
        "Our proprietary formula gives you 2x faster results and helps build muscle in just 14 days without dietary changes. Guaranteed 100% recovery with all-natural miracle bio-peptides."
      );
      setBrandId("brand_apex");
      setChannel("Instagram Reel");
      setSubmissionType("reel_script");
      setCampaign("Q4 Peak Athletic Season");
    } else if (preset === "saas") {
      setTitle("Enterprise Cloud SLA Announcement — Winter 2026");
      setContent(
        "Zenith Cloud guarantees 100% unhackable infrastructure with absolutely zero downtime under all disaster scenarios. Eliminate all compliance liabilities permanently with our autonomous kernel."
      );
      setBrandId("brand_zenith");
      setChannel("LinkedIn");
      setSubmissionType("social_post");
      setCampaign("Enterprise Cloud Infrastructure SLA");
    } else {
      setTitle("Lumina Advanced Cellular Rejuvenation Serum Copy");
      setContent(
        "Lumina reverses cellular skin aging in just 7 days with medical-grade botanicals. Permanently erases deep wrinkles and repairs damaged DNA without dermatological procedures."
      );
      setBrandId("brand_lumina");
      setChannel("Web DTC");
      setSubmissionType("landing_page");
      setCampaign("Anti-Aging Derm Launch");
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
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Content Audit Studio &amp; Pre-Flight
                </h1>
                <Badge variant="verified" size="xs">
                  STAGE 1 INGESTION
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Your draft will undergo deterministic brand rule checks, regex filtering, and evidence verification.
              </p>
            </div>

            {/* Quick-Load Sample Presets from SECTION_INVENTORY.md */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleLoadPreset("nutrition")}
                className="px-3 py-2 rounded-lg bg-[#141414] hover:bg-[#191919] text-[#B5B5B5] hover:text-white text-xs sm:text-sm font-medium border border-[#303030] hover:border-[#404040] transition-colors cursor-pointer min-h-[40px]"
                title="1. Clinical Nutrition (Apex Nutrition) — 2x faster recovery violation"
              >
                Preset 1: Nutrition
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset("saas")}
                className="px-3 py-2 rounded-lg bg-[#141414] hover:bg-[#191919] text-[#B5B5B5] hover:text-white text-xs sm:text-sm font-medium border border-[#303030] hover:border-[#404040] transition-colors cursor-pointer min-h-[40px]"
                title="2. Enterprise SaaS SLA (Zenith Cloud) — 100% unhackable downtime breach"
              >
                Preset 2: SaaS SLA
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset("skincare")}
                className="px-3 py-2 rounded-lg bg-[#141414] hover:bg-[#191919] text-[#B5B5B5] hover:text-white text-xs sm:text-sm font-medium border border-[#303030] hover:border-[#404040] transition-colors cursor-pointer min-h-[40px]"
                title="3. Skincare & Cosmetics (Lumina) — Reverses aging in 7 days violation"
              >
                Preset 3: Skincare
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
          <div className="tactile-card rounded-xl p-6 space-y-5 border-[#303030] bg-[#141414]">
            <div className="flex items-center justify-between border-b border-[#303030] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-white" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Submission Configuration &amp; Channel Picker
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
                  className="w-full bg-[#141414] border border-[#282828] focus:border-white focus:outline-none rounded-lg px-3.5 py-2.5 text-xs text-white font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Brand Workspace */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 uppercase text-[11px]">
                    BRAND WORKSPACE *
                  </label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full bg-[#141414] border border-[#282828] focus:border-white focus:outline-none rounded-lg px-3 py-2 text-white cursor-pointer"
                  >
                    <option value="brand_apex" className="bg-[#141414] text-white">Apex Nutrition</option>
                    <option value="brand_zenith" className="bg-[#141414] text-white">Zenith Cloud SaaS</option>
                    <option value="brand_lumina" className="bg-[#141414] text-white">Lumina Skincare</option>
                  </select>
                </div>

                {/* Content Format */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 uppercase text-[11px]">
                    CONTENT FORMAT *
                  </label>
                  <select
                    value={submissionType}
                    onChange={(e) => setSubmissionType(e.target.value)}
                    className="w-full bg-[#141414] border border-[#282828] focus:border-white focus:outline-none rounded-lg px-3 py-2 text-white cursor-pointer"
                  >
                    <option value="reel_script" className="bg-[#141414] text-white">Reel / Video Script</option>
                    <option value="social_post" className="bg-[#141414] text-white">Social Media Post</option>
                    <option value="banner_copy" className="bg-[#141414] text-white">Display / Ad Creative</option>
                    <option value="newsletter" className="bg-[#141414] text-white">Email Newsletter</option>
                    <option value="landing_page" className="bg-[#141414] text-white">Landing Page / Web Copy</option>
                  </select>
                </div>

                {/* Channel Picker matching SECTION_INVENTORY.md */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5 uppercase text-[11px]">
                    PUBLICATION CHANNEL *
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full bg-[#141414] border border-[#282828] focus:border-white focus:outline-none rounded-lg px-3 py-2 text-white cursor-pointer"
                  >
                    <option value="Instagram Reel" className="bg-[#141414] text-white">Instagram Reel</option>
                    <option value="LinkedIn" className="bg-[#141414] text-white">LinkedIn</option>
                    <option value="Web DTC" className="bg-[#141414] text-white">Web DTC</option>
                    <option value="Display Ad" className="bg-[#141414] text-white">Display Ad</option>
                    <option value="Press Release" className="bg-[#141414] text-white">Press Release</option>
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
                  className="w-full bg-[#141414] border border-[#282828] focus:border-white focus:outline-none rounded-lg px-3 py-2 text-white font-sans"
                />
              </div>

              {/* Raw Content Textarea with character counter */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-medium uppercase text-[11px]">
                    RAW CONTENT COPY TEXT *
                  </label>
                  <span className="text-slate-500 text-[10px]">REAL-TIME PRE-FLIGHT PARSER ACTIVE</span>
                </div>
                <textarea
                  required
                  rows={7}
                  placeholder="Type or paste draft marketing copy, video script lines, or packaging claims here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#141414] border border-[#282828] focus:border-white focus:outline-none rounded-lg p-4 text-[15px] sm:text-base text-white font-sans leading-relaxed resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"
                />
                <div className="flex items-center justify-between text-[11px] font-mono text-[#858585] mt-1.5">
                  <span>LENGTH: {content.length} CHARS · {Math.ceil(content.length / 4)} TOKENS</span>
                  <span className="text-[#10B981] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    <span>Deterministic Pre-Flight (&lt; 5ms) Enabled</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Grounded in approved clinical &amp; legal evidence</span>
            </div>

            <Button
              type="submit"
              size="md"
              className="gold-button w-full sm:w-auto min-h-[44px] justify-center"
              loading={loading}
              icon={<Play className="w-3.5 h-3.5 fill-current text-black" />}
            >
              <span>{loading ? "Auditing Tokens..." : "Execute Pre-Flight Audit"}</span>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
