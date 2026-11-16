"use client";

import React, { use, useEffect, useState } from "react";
import { ReportDocument } from "@/components/submission/ReportDocument";
import type { ReportData } from "@/components/submission/report";

export default function ReportPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/submissions/${id}/report`)
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j.success) throw new Error(j.error || `Could not load the report (error ${r.status}).`);
        setData(j.report);
        document.title = `${j.report.title} - AdSnitch report`;
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  // Print once the logo and layout have painted.
  useEffect(() => {
    if (!data) return;
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, [data]);

  if (error) return <p role="alert" style={{ padding: 24, background: "#fff", color: "#b91c1c" }}>{error}</p>;
  if (!data) return <p role="status" style={{ padding: 24, background: "#fff", color: "#555" }}>Preparing report…</p>;
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <ReportDocument
        data={data}
        banner={
          <div className="no-print" style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 16 }}>
            <button type="button" onClick={() => window.print()} style={{ padding: "6px 12px", border: "1px solid #111", borderRadius: 6, background: "#111", color: "#fff", cursor: "pointer" }}>
              Print / save as PDF
            </button>
            <button type="button" onClick={() => window.close()} style={{ padding: "6px 12px", border: "1px solid #ccc", borderRadius: 6, background: "#fff", color: "#111", cursor: "pointer" }}>
              Close
            </button>
          </div>
        }
      />
    </div>
  );
}
