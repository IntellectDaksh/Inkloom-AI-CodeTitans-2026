"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  Plus,
  ShieldCheck,
  FileCode2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface DocumentAsset {
  id: string;
  name: string;
  size: string;
  type: string;
  status: "indexed" | "parsing" | "verified";
  claimsExtracted: number;
  date: string;
  doi?: string;
}

const INITIAL_DOCUMENTS: DocumentAsset[] = [
  {
    id: "doc_ct_2024",
    name: "Clinical_Trial_CT_2024_B8_Absorption_Report.pdf",
    size: "2.4 MB",
    type: "PDF",
    status: "indexed",
    claimsExtracted: 3,
    date: "2026-10-12",
    doi: "10.1016/j.nutres.2024.108421",
  },
  {
    id: "doc_iso_cert",
    name: "ISO_9001_NTR_Bioavailability_Assay.pdf",
    size: "1.1 MB",
    type: "PDF",
    status: "indexed",
    claimsExtracted: 2,
    date: "2026-09-18",
    doi: "ISO 22196 Annex C",
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
    doi: "LGC-IS-2026-Q1",
  },
];

export default function DocumentAssetsPage() {
  const [documents, setDocuments] = useState<DocumentAsset[]>(INITIAL_DOCUMENTS);
  const [uploading, setUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSimulateUpload = () => {
    setUploading(true);
    setTimeout(() => {
      const newDoc: DocumentAsset = {
        id: `doc_${Date.now()}`,
        name: "Q4_Recovery_Pilot_Trial_2026.pdf",
        size: "1.6 MB",
        type: "PDF",
        status: "indexed",
        claimsExtracted: 2,
        date: new Date().toISOString().split("T")[0],
        doi: "10.1249/MSS.0000000000003189",
      };
      setDocuments([newDoc, ...documents]);
      setUploading(false);
      setToastMessage("Document uploaded: 2 new claims extracted and indexed in Truth Library.");
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

  return (
    <AppLayout
      title="Trial Assays & Evidence Assets Manager"
      subtitle="Upload clinical trials, ISO laboratory assay reports, and legal memorandums for automated vector decomposition and claim extraction."
    >
      <div className="space-y-6">
        {/* Top Header */}
        <div className="space-y-4">
          <Link
            href="/knowledge-base"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>KNOWLEDGE BASE / EVIDENCE ASSETS</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="led-indicator led-turquoise" />
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-100">
                  Document &amp; Evidence Assets
                </h1>
                <Badge variant="verified" size="xs">
                  {documents.length} SOURCE FILES
                </Badge>
                <span className="gold-badge text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase">
                  SHA-256 SIGNED
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Source clinical papers and certified assay documents are parsed by the text-extraction pipeline and stored with permanent SHA-256 signatures.
              </p>
            </div>

            <Button
              size="sm"
              variant="gold"
              icon={<Upload className="w-3.5 h-3.5 text-[#080C16]" />}
              onClick={handleSimulateUpload}
              loading={uploading}
            >
              Upload Evidence PDF
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
              ×
            </button>
          </div>
        )}

        {/* Upload Dropzone */}
        <div
          onClick={handleSimulateUpload}
          className="tactile-card rounded-xl p-8 text-center cursor-pointer hover:border-[#00F2FE]/60 transition-all space-y-3 group bg-gradient-to-b from-[#0D1527] to-[#080C16]"
        >
          <div className="w-12 h-12 rounded-xl bg-[#080C16] border border-[#2E416E] group-hover:border-[#00F2FE] text-[#00F2FE] mx-auto flex items-center justify-center shadow-inner transition-colors">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100 group-hover:text-white">
              Click to upload or drag and drop certified clinical trials
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono">
              Supports PDF, DOCX, TXT up to 25MB · Text extraction and claim indexing run automatically
            </div>
          </div>
        </div>

        {/* Stored Documents Table */}
        <div className="tactile-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#1E2B4A] bg-[#0A0F1D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-[#00F2FE]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Indexed Evidence Repository ({documents.length} Files)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">ISO 17025 ACCREDITED</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#080C16] border-b border-[#1E2B4A] text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3">Document File</th>
                  <th className="px-4 py-3">Format</th>
                  <th className="px-4 py-3">Payload Size</th>
                  <th className="px-4 py-3">Extracted Claims</th>
                  <th className="px-4 py-3">Indexing Gate</th>
                  <th className="px-4 py-3 text-right">Date Ingested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162038]">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#111C35]/60 transition-colors">
                    <td className="px-5 py-3.5 font-sans font-medium text-slate-200 flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-[#00F2FE] shrink-0" />
                      <div className="truncate max-w-sm">
                        <div className="truncate font-mono text-xs">{doc.name}</div>
                        {doc.doi && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            DOI: {doc.doi}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="tag" size="xs">
                        {doc.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">{doc.size}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-emerald-400 font-semibold font-mono">
                        {doc.claimsExtracted} verified claims
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="verified" size="xs">
                        Indexed
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-400">{doc.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
