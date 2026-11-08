"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Check, ShieldCheck, ChevronRight, ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function BrandsPage() {
  const [brands, setBrands] = useState([
    {
      id: "brand_apex",
      name: "Apex Nutrition",
      slug: "apex-nutrition",
      category: "Health, Fitness & Supplements",
      activeClaims: 7,
      submissionsCount: 4,
      isActive: true,
      description: "Clean plant-based athletic recovery and performance nutrition.",
    },
    {
      id: "brand_zenith",
      name: "Zenith Cloud SaaS",
      slug: "zenith-cloud",
      category: "Enterprise Cloud Infrastructure",
      activeClaims: 2,
      submissionsCount: 1,
      isActive: false,
      description: "Low-latency distributed database and microservice orchestration.",
    },
  ]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Brand Workspaces
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage multiple independent brand guidelines, distinct tones, and claim libraries.
            </p>
          </div>

          <Button size="md" variant="primary" icon={<Plus className="w-4 h-4" />}>
            Create Brand
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {brands.map((b) => (
            <Card key={b.id} className={b.isActive ? "border-violet-500/40" : ""}>
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center">
                    {b.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-base">{b.name}</CardTitle>
                    <div className="text-[11px] text-slate-400">{b.category}</div>
                  </div>
                </div>
                {b.isActive && <Badge variant="approved">Active Brand</Badge>}
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">{b.description}</p>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#0E101B] border border-[#1E2338] text-xs">
                  <div>
                    <span className="text-slate-400">Active Claims</span>
                    <div className="text-white font-semibold mt-0.5">{b.activeClaims} verified</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Submissions</span>
                    <div className="text-white font-semibold mt-0.5">{b.submissionsCount} drafts</div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Link
                    href="/knowledge-base/guidelines"
                    className="text-xs text-violet-400 hover:text-violet-300 font-medium"
                  >
                    View Guidelines &rarr;
                  </Link>
                  <Link href="/submissions">
                    <Button size="sm" variant="secondary" className="text-xs">
                      Open Workspace
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
