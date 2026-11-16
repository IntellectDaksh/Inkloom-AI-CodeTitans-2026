// Report data shape shared by the print route, the share snapshot and the public share page.

export interface ReportIssue {
  severity: string;
  category: string;
  status: string;
  flaggedText: string;
  why: string;
  source: string | null;
  sourceUrl?: string | null;
  suggestedFix: string | null;
  statusNote: string | null;
}

export interface ReportData {
  title: string;
  brand: string;
  channel: string;
  content: string;
  verdict: "safe" | "changes" | "blocked";
  verdictLabel: string;
  score: number | null;
  scoreBreakdown: Array<{ label: string; score: number; weight: number; detail: string }>;
  summary: string | null;
  checkedBy: string;
  modelUsed: string | null;
  version: number | null;
  checkedAt: string | null;
  issues: ReportIssue[];
  decision: { decision: string; by: string; notes: string | null; at: string } | null;
  generatedAt: string;
  reference: string;
}

export const isRulesOnly = (modelUsed?: string | null) => !!modelUsed && /deterministic-fallback/i.test(modelUsed);
export const checkedByLabel = (modelUsed?: string | null) =>
  !modelUsed ? "Not recorded" : isRulesOnly(modelUsed) ? "Rules engine" : /gemini/i.test(modelUsed) ? "Gemini" : modelUsed;
