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
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
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
      setTitle("Q4 Campaign – Reel Script");
      setContent(
        "Our new protein blend gives you 2x faster results and helps build muscle in just 14 days. It's the most advanced formula for serious results."
      );
      setSubmissionType("reel_script");
      setChannel("social_media");
      setCampaign("Q4 Peak Athletic Season");
    } else {
      setTitle("Product Launch - Clean Recovery Post");
      setContent(
        "Introducing our new plant-powered recovery formula. Clinically tested for faster results and crafted with 100% bio-available ingredients. Fuel your passion the clean way."
      );
      setSubmissionType("social_post");
      setChannel("social_media");
      setCampaign("Spring 2026 Launch");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-4">
          <Link
            href="/submissions"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Submissions</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                Submit Content for Review
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Your draft will undergo deterministic brand rule checks and AI evidence verification.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample("reel")}
                className="px-3 py-1.5 rounded-lg bg-[#181B2D] hover:bg-[#20243C] text-slate-300 text-xs font-medium border border-[#2B304C] transition-colors"
              >
                Load Sample (With Flags)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample("compliant")}
                className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition-colors"
              >
                Load Compliant Draft
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Content Details & Target Channel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Content Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Q4 Campaign – Reel Script or Summer Ad Headline"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    Brand Workspace
                  </label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="brand_apex">Apex Nutrition</option>
                    <option value="brand_zenith">Zenith Cloud SaaS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    Content Format
                  </label>
                  <select
                    value={submissionType}
                    onChange={(e) => setSubmissionType(e.target.value)}
                    className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="reel_script">Reel / Video Script</option>
                    <option value="social_post">Social Media Post</option>
                    <option value="banner_copy">Ad / Visual Banner Copy</option>
                    <option value="newsletter">Email Newsletter</option>
                    <option value="landing_page">Website / Landing Page</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    Publication Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="social_media">Instagram / TikTok / X</option>
                    <option value="advertisement">Paid Ads / Meta / Google</option>
                    <option value="email">Email Campaign</option>
                    <option value="landing_page">Official Website</option>
                    <option value="press_release">Press Release</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Campaign / Initiative (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Q4 Black Friday / Global Product Launch"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Content Draft Text *
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Type or paste your copy here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#0B0C14] border border-[#232840] rounded-lg p-3 text-sm text-slate-100 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Character count: {content.length}</span>
                  <span className="text-violet-400">
                    Governance rules will be validated against active brand guidelines.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Grounded in approved clinical/legal evidence</span>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              loading={loading}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Submit &amp; Run Brand Audit
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
