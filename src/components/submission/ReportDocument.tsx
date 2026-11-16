import React from "react";
import { ReportData } from "./report";

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC" : "Not recorded");

const VERDICT_COLOR: Record<ReportData["verdict"], string> = { safe: "#15803d", changes: "#b45309", blocked: "#b91c1c" };

// Self-contained styles: the report is a light, A4 print document regardless of the app theme.
const CSS = `
.rpt{--ink:#111;--muted:#555;--line:#ddd;background:#fff;color:var(--ink);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;max-width:210mm;margin:0 auto;padding:24px}
.rpt h1{font-size:22px;margin:0 0 4px;line-height:1.25}
.rpt h2{font-size:15px;margin:24px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--line)}
.rpt .muted{color:var(--muted)}
.rpt .head{display:flex;justify-content:space-between;align-items:center;gap:16px;border-bottom:2px solid var(--ink);padding-bottom:12px;margin-bottom:16px}
.rpt .meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px 16px;margin:12px 0}
.rpt .meta dt{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
.rpt .meta dd{margin:0;font-weight:500}
.rpt .verdict{display:flex;align-items:baseline;gap:12px;border:1px solid var(--line);border-left-width:6px;padding:12px 16px;border-radius:6px}
.rpt table{width:100%;border-collapse:collapse;font-size:13px}
.rpt th,.rpt td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);vertical-align:top}
.rpt .copy{white-space:pre-wrap;border:1px solid var(--line);border-radius:6px;padding:12px;font-size:13px}
.rpt .issue{border:1px solid var(--line);border-radius:6px;padding:10px 12px;margin-bottom:10px;break-inside:avoid}
.rpt .issue dl{display:grid;grid-template-columns:110px 1fr;gap:4px 12px;margin:8px 0 0;font-size:13px}
.rpt .issue dt{color:var(--muted)}
.rpt .issue dd{margin:0;overflow-wrap:anywhere}
.rpt .flag{background:#fef2f2;color:#991b1b;padding:0 3px;border-radius:3px}
.rpt .foot{margin-top:28px;padding-top:10px;border-top:1px solid var(--line);font-size:12px;color:var(--muted)}
.rpt .warn{border:1px solid #f59e0b;background:#fffbeb;padding:8px 12px;border-radius:6px;margin-top:10px;font-size:13px}
@page{size:A4;margin:14mm}
@media print{.rpt{padding:0;max-width:none}.no-print{display:none!important}a{color:inherit}}
`;

export function ReportDocument({ data, banner }: { data: ReportData; banner?: React.ReactNode }) {
  const color = VERDICT_COLOR[data.verdict];
  return (
    <article className="rpt">
      <style>{CSS}</style>
      {banner}
      <header className="head">
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, print needs a plain img */}
        <img src="/adsnitch-logo.svg" alt="AdSnitch" height={28} style={{ height: 28, width: "auto" }} />
        <span className="muted" style={{ fontSize: 12 }}>Compliance review report · Ref {data.reference}</span>
      </header>

      <h1>{data.title}</h1>
      <dl className="meta">
        <div><dt>Brand</dt><dd>{data.brand}</dd></div>
        <div><dt>Channel</dt><dd>{data.channel}</dd></div>
        <div><dt>Version</dt><dd>{data.version ? `v${data.version}` : "Not recorded"}</dd></div>
        <div><dt>Checked</dt><dd>{fmt(data.checkedAt)}</dd></div>
        <div><dt>Checked by</dt><dd>{data.checkedBy}</dd></div>
      </dl>

      <div className="verdict" style={{ borderLeftColor: color }}>
        <strong style={{ fontSize: 18, color }}>{data.verdictLabel}</strong>
        <span>Score <strong>{data.score ?? "n/a"}</strong>/100</span>
        <span className="muted">{data.issues.filter((i) => i.status === "open").length} open of {data.issues.length} issues</span>
      </div>
      {data.checkedBy === "Rules engine" && (
        <p className="warn">AI review was unavailable for this check. This is a rules-only result.</p>
      )}
      {data.summary && <p>{data.summary}</p>}

      {data.scoreBreakdown.length > 0 && (
        <>
          <h2>Score breakdown</h2>
          <table>
            <thead><tr><th>Factor</th><th>Score</th><th>Weight</th><th>Detail</th></tr></thead>
            <tbody>
              {data.scoreBreakdown.map((f) => (
                <tr key={f.label}><td>{f.label}</td><td>{Math.round(f.score)}</td><td>{Math.round(f.weight * 100)}%</td><td>{f.detail}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h2>Ad copy</h2>
      <div className="copy">{data.content}</div>

      <h2>Issues ({data.issues.length})</h2>
      {data.issues.length === 0 && <p className="muted">No issues found.</p>}
      {data.issues.map((i, n) => (
        <section className="issue" key={n}>
          <strong>{i.severity}: {i.category}</strong> <span className="muted">· {i.status}</span>
          <dl>
            <dt>Flagged text</dt><dd><span className="flag">{i.flaggedText || "n/a"}</span></dd>
            <dt>Why</dt><dd>{i.why || "n/a"}</dd>
            <dt>Source</dt><dd>{i.source ? <>{i.source}{i.sourceUrl && <> · <a href={i.sourceUrl}>{i.sourceUrl}</a></>}</> : "Not found in the approved library. Requires substantiation."}</dd>
            <dt>Suggested fix</dt><dd>{i.suggestedFix || "None"}</dd>
            {i.statusNote && (<><dt>Decision</dt><dd>{i.statusNote}</dd></>)}
          </dl>
        </section>
      ))}

      <h2>Reviewer decision</h2>
      {data.decision ? (
        <p>
          <strong>{data.decision.decision}</strong> by {data.decision.by} on {fmt(data.decision.at)}
          {data.decision.notes && <><br /><span className="muted">Notes: </span>{data.decision.notes}</>}
        </p>
      ) : (
        <p className="muted">No reviewer decision yet.</p>
      )}

      <footer className="foot">
        Generated {fmt(data.generatedAt)}. Automated review aid, not legal advice.
      </footer>
    </article>
  );
}
