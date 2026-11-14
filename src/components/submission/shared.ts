// Shared types + pure helpers for the submission flow (new / list / result).

export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type FindingStatus = "open" | "resolved" | "disputed" | "ignored" | "dismissed" | "overridden";

export interface FindingItem {
  id: string;
  category: string;
  severity: Severity;
  flaggedText: string;
  suggestedCorrection?: string;
  explanation: string;
  claimId?: string;
  ruleId?: string;
  rule_ref?: string | null;
  citedExcerpt?: string;
  doi?: string;
  assayStandard?: string;
  confidence?: string;
  isVerified?: boolean;
  evidence?: { citation?: string; excerpt?: string }[];
  status?: FindingStatus;
  override_memo?: string;
  overridden_by?: string;
  dismissal_reason?: string;
  dismissed_by?: string;
  dispute_reason?: string;
  counter_evidence?: { text: string | null; file: { name: string; text: string } | null; sha256: string; at: string } | null;
  /** Approved-library record this finding was checked against (added by GET /api/submissions/[id]). */
  source?: EvidenceSource;
}

/** Where a finding's proof lives in the approved library. */
export interface EvidenceSource {
  claimCode: string;
  title: string;
  type: string;
  date?: string;
  url?: string;
  excerpt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  demo: boolean;
  citation?: string;
  doi?: string;
  /** Assay / test standards named in the citation or excerpt (e.g. ISO 17025). */
  standards?: string[];
  /** SHA-256 of the excerpt text, computed server-side. */
  excerptSha256?: string;
  /** Finding -> claim -> evidence -> citation, as recorded in the library. */
  chain?: { label: string; value: string }[];
}

// Only official texts we are sure of. Anything else is named without a link.
const REGULATIONS: { test: RegExp; label: string; href: string }[] = [
  { test: /16[\s-]*CFR|\b255\b|endorsement/i, label: "FTC 16 CFR Part 255 (Endorsement Guides)", href: "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255" },
  { test: /DSHEA/i, label: "DSHEA 1994 (Dietary Supplement Health and Education Act)", href: "https://ods.od.nih.gov/About/DSHEA_Wording.aspx" },
  { test: /FTC Act|Section 5|§\s*5\b|\bFTC\b/i, label: "FTC Act, Section 5", href: "https://www.ftc.gov/legal-library/browse/statutes/federal-trade-commission-act" },
];

export type RuleSource = { label: string; href: string; external: boolean };

/** The regulation or brand rule a rule-based finding cites, or null when nothing is on file. */
export function ruleSourceOf(f: FindingItem): RuleSource | null {
  const hay = `${f.rule_ref || ""} ${f.ruleId || ""} ${f.explanation || ""}`;
  const reg = REGULATIONS.find((r) => r.test.test(hay));
  if (reg) return { label: reg.label, href: reg.href, external: true };
  const rule = f.ruleId || f.rule_ref || "";
  if (/^pt_|PROHIB|TERM/i.test(rule)) return { label: "Brand wording rules", href: "/knowledge-base/terminology", external: false };
  if (/^(rp_|bg_)|GUIDE|REG-DISC/i.test(rule) || f.category === "missing_disclosure")
    return { label: "Brand guidelines", href: "/knowledge-base/guidelines", external: false };
  return null;
}

export const claimHref = (code: string) => `/knowledge-base/claims?claim=${encodeURIComponent(code)}`;

export interface RevisionItem {
  id: string;
  revisedText: string;
  reasoning: string;
  isApplied: boolean;
  timestamp?: string;
}

export const SEVERITY: Record<Severity, { label: string; weight: number; mark: string; chip: string }> = {
  critical: {
    label: "Critical",
    weight: 30,
    mark: "bg-status-critical/15 border-status-critical/40 text-status-critical",
    chip: "bg-status-critical/10 text-status-critical border-status-critical/30",
  },
  high: {
    label: "High",
    weight: 18,
    mark: "bg-status-critical/10 border-status-critical/30 text-status-critical",
    chip: "bg-status-critical/10 text-status-critical border-status-critical/30",
  },
  medium: {
    label: "Medium",
    weight: 8,
    mark: "bg-status-warning/15 border-status-warning/40 text-text-primary",
    chip: "bg-status-warning/10 text-status-warning border-status-warning/30",
  },
  low: {
    label: "Low",
    weight: 3,
    mark: "bg-blue/15 border-blue/40 text-text-primary",
    chip: "bg-panel text-text-secondary border-border-default",
  },
  info: {
    label: "Info",
    weight: 0,
    mark: "bg-blue/10 border-blue/30 text-text-primary",
    chip: "bg-panel text-text-secondary border-border-default",
  },
};

export const sevOf = (s?: string): Severity => (s && s in SEVERITY ? (s as Severity) : "medium");

export const humanize = (s?: string) =>
  (s || "Compliance issue").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

/** A finding is "settled" once a human handled it or the flagged phrase is gone from the copy. */
export function effectiveStatus(f: FindingItem, content: string): FindingStatus {
  if (f.status && f.status !== "open") return f.status;
  if (f.flaggedText && !content.toLowerCase().includes(f.flaggedText.toLowerCase())) return "resolved";
  return "open";
}

/**
 * Re-check runs append findings, so the same phrase can appear several times.
 * Keep the latest per (category, phrase).
 */
export function dedupeFindings(list: FindingItem[]): FindingItem[] {
  const map = new Map<string, FindingItem>();
  for (const f of list) map.set(`${f.category}|${(f.flaggedText || f.id).toLowerCase()}`, f);
  return [...map.values()];
}

/** Mirrors the rule-side deduction in lib/ai/pipeline.ts (without the LLM blend) for instant feedback. */
export function estimateScore(findings: FindingItem[], content: string): number {
  const open = findings.filter((f) => effectiveStatus(f, content) === "open" || f.status === "disputed");
  return Math.max(0, 100 - open.reduce((n, f) => n + SEVERITY[sevOf(f.severity)].weight, 0));
}

export type Verdict = "safe" | "changes" | "blocked";

export interface VerdictOpts {
  passScore?: number;
  blockBelow?: number;
  requireDisclosure?: boolean;
  flagSuperlatives?: boolean;
  flagTimeBound?: boolean;
}

/** Workspace checks run on this device (Settings > Review strictness). Empty when all are off. */
export function localFlags(content: string, o: VerdictOpts = {}): string[] {
  const out: string[] = [];
  if (o.requireDisclosure && content.trim() && !/#(ad|sponsored|paidpartnership)\b/i.test(content))
    out.push("No disclosure tag (#ad or #sponsored).");
  if (o.flagSuperlatives && /\b(best|number one|strongest|fastest|guaranteed|unbeatable)\b|#1\b/i.test(content))
    out.push("Uses a superlative like \"best\" or \"guaranteed\".");
  if (o.flagTimeBound && /\b(today only|limited time|ends (today|tonight|soon)|last chance|hurry|only \d+ left)\b/i.test(content))
    out.push("Has a time-bound claim like \"limited time\".");
  return out;
}

export function verdictFor(score: number, findings: FindingItem[], content: string, o: VerdictOpts = {}): Verdict {
  const pass = o.passScore ?? 80;
  const block = o.blockBelow ?? 50;
  const open = findings.filter((f) => effectiveStatus(f, content) === "open");
  if (open.some((f) => f.severity === "critical") || score < block) return "blocked";
  if (open.some((f) => f.severity === "high") || score < pass || open.length > 0 || localFlags(content, o).length) return "changes";
  return "safe";
}

export const VERDICT: Record<Verdict, { title: string; tone: string; bar: string }> = {
  safe: { title: "Safe to publish", tone: "text-status-success", bar: "bg-status-success" },
  changes: { title: "Needs changes", tone: "text-status-warning", bar: "bg-status-warning" },
  blocked: { title: "Blocked", tone: "text-status-critical", bar: "bg-status-critical" },
};

export function evidenceOf(f: FindingItem): { excerpt: string; citation?: string } | null {
  const ev = f.citedExcerpt || f.evidence?.find((e) => e.excerpt)?.excerpt;
  if (!ev) return null;
  return { excerpt: ev, citation: f.claimId || f.evidence?.[0]?.citation };
}

/** Case-insensitive, first occurrence replace. Returns null when the phrase is not in the copy. */
export function replaceOnce(content: string, phrase: string, replacement: string): string | null {
  const i = content.toLowerCase().indexOf(phrase.toLowerCase());
  if (!phrase || i < 0) return null;
  return content.slice(0, i) + replacement + content.slice(i + phrase.length);
}

export type DiffPart = { kind: "same" | "add" | "del"; text: string };

// ponytail: word-level LCS, O(n*m) memory. Fine for ad copy (< ~3k words); swap for Myers diff if long docs land here.
export function wordDiff(a: string, b: string): DiffPart[] {
  const A = a.split(/(\s+)/);
  const B = b.split(/(\s+)/);
  const n = A.length;
  const m = B.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: DiffPart[] = [];
  const push = (kind: DiffPart["kind"], text: string) => {
    const last = out[out.length - 1];
    if (last && last.kind === kind) last.text += text;
    else out.push({ kind, text });
  };
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) push("same", A[i++]), j++;
    else if (dp[i + 1][j] >= dp[i][j + 1]) push("del", A[i++]);
    else push("add", B[j++]);
  }
  while (i < n) push("del", A[i++]);
  while (j < m) push("add", B[j++]);
  return out;
}

// ---- Brands + channels shown as cards in the new-review flow ----

export const BRANDS = [
  {
    id: "brand_apex",
    name: "Apex Nutrition",
    industry: "Sports nutrition",
    rules: "Health and performance claims must match an approved clinical claim. Bans cure, miracle and guarantee wording.",
  },
  {
    id: "brand_zenith",
    name: "Zenith Cloud SaaS",
    industry: "B2B cloud",
    rules: "Uptime, security and SLA promises must match the published SLA. Absolute words like unhackable are blocked.",
  },
  {
    id: "brand_lumina",
    name: "Lumina Skincare",
    industry: "Cosmetics",
    rules: "Cosmetic claims must say \"visibly reduces the look of\", not \"removes\". 2 approved claims, a guideline and 2 terms on file; anything else shows as unverified.",
  },
] as const;

export const CHANNELS = [
  { id: "Instagram Reel", type: "reel_script", rules: "Short video script. Spoken claims and on-screen text are both checked; #ad disclosure required." },
  { id: "LinkedIn", type: "social_post", rules: "Professional post. Comparative and statistical claims need a source." },
  { id: "Web DTC", type: "landing_page", rules: "Landing page copy. Strictest check: every product claim needs evidence." },
  { id: "Display Ad", type: "banner_copy", rules: "Short banner. Superlatives and price promises are checked closely." },
  { id: "Press Release", type: "newsletter", rules: "Long-form. Quotes, figures and study references are checked against evidence." },
] as const;

export const brandName = (id?: string) => BRANDS.find((b) => b.id === id)?.name;

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export const ACCEPTED_EXT = [".txt", ".md", ".markdown", ".json", ".csv", ".html", ".rtf", ".docx", ".pdf", ".png", ".jpg", ".jpeg", ".webp"];
export const MAX_FILE_BYTES = 15 * 1024 * 1024;
export const isOcrFile = (name: string) => /\.(pdf|png|jpe?g|webp)$/i.test(name);
