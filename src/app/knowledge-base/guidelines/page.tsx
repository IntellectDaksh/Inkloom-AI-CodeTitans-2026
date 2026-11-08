"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, XCircle, Sparkles, Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function BrandGuidelinesPage() {
  const guidelines = [
    {
      category: "Voice & Tone",
      title: "Authoritative, Science-Backed, and Energetic",
      description:
        "Speak with grounded confidence. Avoid hyperbole, buzzwords, or sensationalism. Educate rather than pressure.",
      dos: [
        "Use active, empowering language ('Fuel your peak performance')",
        "Attribute speed and absorption claims to documented clinical trials",
        "Keep language approachable for both competitive athletes and casual fitness enthusiasts",
      ],
      donts: [
        "Never use miraculous or cure-oriented phrases ('magic bullet', 'cure', 'instant fix')",
        "Never guarantee specific timeframes without verified clinical backup ('build muscle in 14 days')",
        "Avoid aggressive bro-science or fear-based marketing",
      ],
    },
    {
      category: "Messaging Standards",
      title: "Clean Sourcing & Transparency",
      description:
        "Every raw ingredient claim must reflect third-party laboratory verification and sustainable supply chains.",
      dos: [
        "Highlight 100% bio-available plant proteins and complete amino acid profile",
        "Mention non-GMO and eco-certified packaging where relevant",
      ],
      donts: [
        "Do not claim 100% absorption without citing Lab Certificate ISO-9001-NTR",
        "Do not disparage entire categories of competitors without independent audit data",
      ],
    },
  ];

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
                Brand Guidelines & Voice Rules
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Authoritative brand rules used by the AI governance engine to evaluate tone and consistency.
              </p>
            </div>

            <Button size="md" variant="primary" icon={<Plus className="w-4 h-4" />}>
              Add Guideline Rule
            </Button>
          </div>
        </div>

        {/* Guidelines List */}
        <div className="space-y-6">
          {guidelines.map((g, idx) => (
            <Card key={idx}>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <Badge variant="tag" className="mb-2">
                    {g.category}
                  </Badge>
                  <CardTitle className="text-lg">{g.title}</CardTitle>
                </div>
                <span className="text-[11px] text-slate-400">Status: Active & Enforced</span>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-xs text-slate-300 leading-relaxed">{g.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Do's */}
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                    <div className="font-semibold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approved Language &amp; Practices (Do&apos;s)</span>
                    </div>
                    <ul className="space-y-2 text-slate-200">
                      {g.dos.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">&bull;</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Don'ts */}
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                    <div className="font-semibold text-rose-400 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      <span>Prohibited Violations (Don&apos;ts)</span>
                    </div>
                    <ul className="space-y-2 text-slate-200">
                      {g.donts.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">&bull;</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
