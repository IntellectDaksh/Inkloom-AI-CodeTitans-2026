"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Ban, Check, AlertOctagon, Plus, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function TerminologyPage() {
  const [search, setSearch] = useState("");

  const prohibitedTerms = [
    { term: "magic bullet", reason: "Sensationalist, scientifically invalid", severity: "critical", replacement: "effective formula" },
    { term: "miracle", reason: "Medical claim violation under FDA/FTC regulations", severity: "critical", replacement: "clinically evaluated" },
    { term: "cure", reason: "Supplements cannot claim to diagnose, treat, or cure disease", severity: "critical", replacement: "supports natural recovery" },
    { term: "instant fix", reason: "Unsubstantiated speed promise", severity: "high", replacement: "accelerated absorption" },
    { term: "guaranteed overnight", reason: "Misleading time-bound guarantee", severity: "high", replacement: "consistent results" },
    { term: "effortless", reason: "Misrepresents active training & balanced nutrition requirements", severity: "medium", replacement: "streamlined" },
  ];

  const preferredTerms = [
    { term: "bio-available", usage: "Refers to amino acid uptake verified in ISO-9001-NTR" },
    { term: "sustained energy", usage: "Supported by consumer study CS-104" },
    { term: "clean nutrition", usage: "Refers to zero banned stimulants and non-GMO certification" },
    { term: "clinically tested", usage: "Backed by Clinical Trial CT-2024-B8" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
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
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Brand Terminology & Messaging Rules
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Deterministic dictionary checked in real-time before content reaches human reviewers.
              </p>
            </div>

            <Button size="md" variant="primary" icon={<Plus className="w-4 h-4" />}>
              Add Rule
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prohibited Terms */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-400" />
                <CardTitle className="text-sm">Prohibited Terms ({prohibitedTerms.length})</CardTitle>
              </div>
              <Badge variant="critical">Enforced</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#1C2033]">
                {prohibitedTerms.map((t) => (
                  <div key={t.term} className="p-4 space-y-1.5 hover:bg-[#151728]/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        &quot;{t.term}&quot;
                      </span>
                      <Badge variant={t.severity as any} size="sm">
                        {t.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">{t.reason}</p>
                    <div className="text-[11px] text-emerald-400">
                      Approved alternative: <em>{t.replacement}</em>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preferred Terms */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <CardTitle className="text-sm">Preferred Vocabulary ({preferredTerms.length})</CardTitle>
              </div>
              <Badge variant="approved">Approved</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#1C2033]">
                {preferredTerms.map((p) => (
                  <div key={p.term} className="p-4 space-y-1.5 hover:bg-[#151728]/40 transition-colors">
                    <div className="font-mono text-xs font-bold text-emerald-300">
                      &quot;{p.term}&quot;
                    </div>
                    <p className="text-xs text-slate-400">{p.usage}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
