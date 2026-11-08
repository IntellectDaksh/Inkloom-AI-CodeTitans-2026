"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, CheckCircle2, Clock, Trash2, Eye } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function DocumentAssetsPage() {
  const [documents, setDocuments] = useState([
    {
      id: "doc_ct_2024",
      name: "Clinical_Trial_CT_2024_B8_Absorption_Report.pdf",
      size: "2.4 MB",
      type: "PDF",
      status: "indexed",
      claimsExtracted: 3,
      date: "2026-10-12",
    },
    {
      id: "doc_iso_cert",
      name: "ISO_9001_NTR_Bioavailability_Assay.pdf",
      size: "1.1 MB",
      type: "PDF",
      status: "indexed",
      claimsExtracted: 2,
      date: "2026-09-18",
    },
    {
      id: "doc_brand_guide",
      name: "Apex_Nutrition_Brand_Voice_v2.4.docx",
      size: "840 KB",
      type: "DOCX",
      status: "indexed",
      claimsExtracted: 5,
      date: "2026-11-01",
    },
    {
      id: "doc_wada_cert",
      name: "WADA_Banned_Substances_Assay_2025.pdf",
      size: "1.8 MB",
      type: "PDF",
      status: "indexed",
      claimsExtracted: 1,
      date: "2026-08-30",
    },
  ]);

  const [uploading, setUploading] = useState(false);

  const handleSimulateUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setDocuments([
        {
          id: `doc_${Date.now()}`,
          name: "Q4_Recovery_Pilot_Trial_2026.pdf",
          size: "1.6 MB",
          type: "PDF",
          status: "indexed",
          claimsExtracted: 2,
          date: new Date().toISOString().split("T")[0],
        },
        ...documents,
      ]);
      setUploading(false);
    }, 1500);
  };

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
                Document &amp; Evidence Asset Management
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Upload clinical trials, lab reports, and style guides. The system parses and indexes statements.
              </p>
            </div>

            <Button
              size="md"
              variant="primary"
              icon={<Upload className="w-4 h-4" />}
              onClick={handleSimulateUpload}
              loading={uploading}
            >
              Upload Document (PDF/DOCX)
            </Button>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div
          onClick={handleSimulateUpload}
          className="border-2 border-dashed border-[#242940] hover:border-violet-500/50 rounded-2xl p-8 text-center cursor-pointer bg-[#0D0F1B]/60 transition-colors space-y-3"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 mx-auto flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200">
              Click to upload or drag and drop supporting documents
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Supports PDF, DOCX, TXT up to 25MB. Text extraction and claim indexing run automatically.
            </div>
          </div>
        </div>

        {/* Stored Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Indexed Source Documents ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0E101B] border-b border-[#1C2033] text-slate-400 font-medium">
                  <tr>
                    <th className="px-5 py-3">Document Name</th>
                    <th className="px-4 py-3">Format</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Extracted Claims</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Uploaded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2033]">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#151728]/40 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-200 flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-violet-400 shrink-0" />
                        <span className="truncate max-w-xs">{doc.name}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="tag">{doc.type}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">{doc.size}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-emerald-400 font-medium">
                          {doc.claimsExtracted} verified claims
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="approved">Indexed</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-400">{doc.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
