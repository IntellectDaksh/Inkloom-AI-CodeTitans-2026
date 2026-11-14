/**
 * Runs EVAL_DATASET through the real governance pipeline and scores it.
 * CLI: npx tsx src/lib/eval/run.ts   (prints a table; uses Gemini only if GEMINI_API_KEY is set)
 *
 * Scoring rules (kept deliberately strict and explainable):
 * - A finding is "an issue raised" unless it is informational/verified (those confirm an approved claim).
 * - Hit: an issue raised whose span overlaps a labelled span AND has the same category.
 * - Wrong category: overlaps a label but category differs. Not a hit, not counted as a false alarm.
 * - False alarm: an issue raised that overlaps no labelled span at all.
 * - Missed: a labelled issue with no hit.
 * - Exception: missing_disclosure is document-level (the phrase is absent), so it matches by category alone.
 */
import { runGovernancePipeline } from '../ai/pipeline';
import { runDeterministicRuleChecks } from '../ai/rules';
import { retrieveScopedBrandKnowledge } from '../ai/retrieval';
import type { ComplianceScoreBreakdown, FindingCategory, GovernanceFinding, GovernanceReviewSummary } from '../ai/types';
import { BRAND_SCOPE, EVAL_DATASET, type EvalItem, type ExpectedIssue } from './dataset';

export interface FoundIssue { span: string; category: FindingCategory; severity: string; explanation: string }
export interface ItemResult {
  id: string; brand: string; channel: string; kind: EvalItem['kind']; note?: string; text: string;
  group?: EvalItem['group']; caseRef?: string;
  stages?: GovernanceReviewSummary['stages']; score?: ComplianceScoreBreakdown;
  expected: ExpectedIssue[]; found: FoundIssue[];
  hits: ExpectedIssue[]; missed: ExpectedIssue[]; falseAlarms: FoundIssue[]; wrongCategory: FoundIssue[];
  latencyMs: number; error?: string;
}
export interface CategoryStats { category: string; labelled: number; caught: number; raised: number; falseAlarms: number; precision: number | null; recall: number | null }
export interface EvalReport {
  mode: 'gemini' | 'rule_only'; modelUsed: string; ranAt: string; durationMs: number;
  items: number; cleanItems: number; cleanItemsPassed: number;
  labelled: number; caught: number; raised: number; falseAlarms: number; wrongCategory: number; missed: number;
  precision: number | null; recall: number | null;
  latency: { p50: number; p95: number };
  /** Stage 2 deterministic scanner timing, measured with performance.now(). Target < 5 ms. */
  scanner: { evalSetP50Ms: number; evalSetP95Ms: number; longDraftWords: number; longDraftP50Ms: number; longDraftP95Ms: number; runs: number; targetMs: number };
  byCategory: CategoryStats[]; results: ItemResult[];
}

function locate(text: string, f: GovernanceFinding): [number, number] | null {
  if (typeof f.startIndex === 'number' && typeof f.endIndex === 'number' && f.endIndex > f.startIndex) return [f.startIndex, f.endIndex];
  const needle = f.flaggedText.replace(/\.\.\.$/, '');
  const i = text.toLowerCase().indexOf(needle.toLowerCase());
  return i < 0 ? null : [i, i + needle.length];
}

const overlaps = (a: [number, number], b: [number, number]) => a[0] < b[1] && b[0] < a[1];

export function percentile(xs: number[], p: number): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)];
}

/** Pure scoring for one item; exported for the self-check below. */
export function scoreItem(item: EvalItem, findings: GovernanceFinding[]) {
  const raised = findings.filter(f => f.severity !== 'informational' && f.isVerified !== true);
  const labels = item.expected.map(e => {
    const i = item.text.indexOf(e.span);
    if (i < 0) throw new Error(`${item.id}: span "${e.span}" not found in text`);
    return { e, r: [i, i + e.span.length] as [number, number] };
  });
  const hitSet = new Set<ExpectedIssue>();
  const falseAlarms: GovernanceFinding[] = [];
  const wrongCategory: GovernanceFinding[] = [];
  for (const f of raised) {
    const r = locate(item.text, f);
    // A missing disclosure has no span in the draft (the phrase is absent), so it matches at document level.
    const touching = f.category === 'missing_disclosure'
      ? labels.filter(l => l.e.category === 'missing_disclosure')
      : r ? labels.filter(l => overlaps(l.r, r)) : [];
    if (!touching.length) { falseAlarms.push(f); continue; }
    const same = touching.filter(l => l.e.category === f.category);
    if (same.length) same.forEach(l => hitSet.add(l.e)); else wrongCategory.push(f);
  }
  return {
    raised,
    hits: item.expected.filter(e => hitSet.has(e)),
    missed: item.expected.filter(e => !hitSet.has(e)),
    falseAlarms,
    wrongCategory,
  };
}

const toFound = (f: GovernanceFinding): FoundIssue => ({ span: f.flaggedText, category: f.category, severity: f.severity, explanation: f.explanation });
const ratio = (n: number, d: number) => (d === 0 ? null : n / d);

export async function runEvaluation(opts: { apiKey?: string; onProgress?: (done: number, total: number) => void } = {}): Promise<EvalReport> {
  const started = Date.now();
  const results: ItemResult[] = [];
  const raisedPerItem: GovernanceFinding[][] = [];
  let modelUsed = 'unknown';

  for (const item of EVAL_DATASET) {
    const scope = BRAND_SCOPE[item.brand];
    const t0 = performance.now();
    try {
      const summary = await runGovernancePipeline(`eval_${item.id}`, item.text, scope.brandId, scope.orgId, item.channel, { apiKey: opts.apiKey });
      const latencyMs = Math.round(performance.now() - t0);
      modelUsed = summary.modelUsed;
      const s = scoreItem(item, summary.findings);
      raisedPerItem.push(s.raised);
      const found = s.raised.map(toFound);
      const same = (f: GovernanceFinding) => found[s.raised.indexOf(f)]; // keep identity so per-category counts can use includes()
      results.push({
        id: item.id, brand: scope.name, channel: item.channel, kind: item.kind, note: item.note, text: item.text,
        group: item.group, caseRef: item.caseRef, stages: summary.stages, score: summary.scoreBreakdown,
        expected: item.expected, found, hits: s.hits, missed: s.missed,
        falseAlarms: s.falseAlarms.map(same), wrongCategory: s.wrongCategory.map(same), latencyMs,
      });
    } catch (err) {
      // A crash counts every label on the item as missed; we never drop the item from the denominator.
      raisedPerItem.push([]);
      results.push({
        id: item.id, brand: scope.name, channel: item.channel, kind: item.kind, note: item.note, text: item.text,
        group: item.group, caseRef: item.caseRef,
        expected: item.expected, found: [], hits: [], missed: item.expected, falseAlarms: [], wrongCategory: [],
        latencyMs: Math.round(performance.now() - t0), error: err instanceof Error ? err.message : String(err),
      });
    }
    opts.onProgress?.(results.length, EVAL_DATASET.length);
  }

  const cats = new Set<string>();
  results.forEach(r => { r.expected.forEach(e => cats.add(e.category)); r.found.forEach(f => cats.add(f.category)); });
  const byCategory: CategoryStats[] = [...cats].sort().map(category => {
    const labelled = results.reduce((n, r) => n + r.expected.filter(e => e.category === category).length, 0);
    const caught = results.reduce((n, r) => n + r.hits.filter(e => e.category === category).length, 0);
    const raised = results.reduce((n, r) => n + r.found.filter(f => f.category === category).length, 0);
    const falseAlarms = results.reduce((n, r) => n + r.falseAlarms.filter(f => f.category === category).length, 0);
    const correct = results.reduce((n, r) => n + r.found.filter(f => f.category === category && !r.falseAlarms.includes(f) && !r.wrongCategory.includes(f)).length, 0);
    return { category, labelled, caught, raised, falseAlarms, precision: ratio(correct, raised), recall: ratio(caught, labelled) };
  });

  const sum = (fn: (r: ItemResult) => number) => results.reduce((n, r) => n + fn(r), 0);
  const raised = sum(r => r.found.length);
  const falseAlarms = sum(r => r.falseAlarms.length);
  const wrongCategory = sum(r => r.wrongCategory.length);
  const labelled = sum(r => r.expected.length);
  const caught = sum(r => r.hits.length);
  const clean = results.filter(r => r.expected.length === 0);
  const lat = results.map(r => r.latencyMs);

  const scanner = await benchmarkScanner(results);

  return {
    mode: /gemini/i.test(modelUsed) && !/fallback/i.test(modelUsed) ? 'gemini' : 'rule_only',
    modelUsed, ranAt: new Date().toISOString(), durationMs: Date.now() - started,
    items: results.length, cleanItems: clean.length, cleanItemsPassed: clean.filter(r => r.found.length === 0).length,
    labelled, caught, raised, falseAlarms, wrongCategory, missed: labelled - caught,
    precision: ratio(raised - falseAlarms - wrongCategory, raised), recall: ratio(caught, labelled),
    latency: { p50: percentile(lat, 50), p95: percentile(lat, 95) },
    scanner,
    byCategory, results,
  };
}

const r3 = (x: number) => Math.round(x * 1000) / 1000;

/**
 * Times Stage 2 on its own: the per-item value from the pipeline runs above, plus repeated runs on a
 * ~2,000-word draft built from the eval texts (worst realistic case: every rule family fires).
 */
async function benchmarkScanner(results: ItemResult[]): Promise<EvalReport['scanner']> {
  const perItem = results.map(r => r.stages?.[1]?.ms).filter((x): x is number => typeof x === 'number');
  const words: string[] = [];
  for (let i = 0; words.length < 2000; i++) words.push(...EVAL_DATASET[i % EVAL_DATASET.length].text.split(/\s+/));
  const draft = words.slice(0, 2000).join(' ');
  const scope = BRAND_SCOPE.flowscale;
  const k = await retrieveScopedBrandKnowledge({ organizationId: scope.orgId, brandId: scope.brandId, content: draft, channel: 'social_media', detectedClaims: [] });
  const rules = { prohibitedTerms: k.activeProhibitedTerms, requiredPhrases: k.activeRequiredPhrases, allClaims: [...k.matchedApprovedClaims, ...k.matchedExpiredClaims] };
  const runs = 200;
  for (let i = 0; i < 20; i++) runDeterministicRuleChecks(draft, 'social_media', rules); // JIT warm-up
  const times: number[] = [];
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    runDeterministicRuleChecks(draft, 'social_media', rules);
    times.push(performance.now() - t0);
  }
  return {
    evalSetP50Ms: r3(percentile(perItem, 50)), evalSetP95Ms: r3(percentile(perItem, 95)),
    longDraftWords: 2000, longDraftP50Ms: r3(percentile(times, 50)), longDraftP95Ms: r3(percentile(times, 95)), runs, targetMs: 5,
  };
}

// ---------------- CLI ----------------
const pct = (x: number | null) => (x === null ? '  n/a' : `${(x * 100).toFixed(0).padStart(4)}%`);

if (process.argv[1] && /eval[\\/]run\.ts$/.test(process.argv[1])) {
  // Self-check of the matcher before trusting any numbers.
  const probe: EvalItem = { id: 'probe', brand: 'apex', channel: 'general', kind: 'violation', text: 'a miracle b', expected: [{ span: 'miracle', category: 'prohibited_term', severity: 'high' }] };
  const mk = (flaggedText: string, category: FindingCategory) => ({ flaggedText, category, severity: 'high', isVerified: false } as GovernanceFinding);
  const s = scoreItem(probe, [mk('miracle', 'prohibited_term'), mk('miracle', 'tone_inconsistency'), mk('b', 'readability')]);
  if (s.hits.length !== 1 || s.wrongCategory.length !== 1 || s.falseAlarms.length !== 1) throw new Error('scoreItem self-check failed');
  if (percentile([1, 2, 3, 4, 100], 50) !== 3 || percentile([1, 2, 3, 4, 100], 95) !== 100) throw new Error('percentile self-check failed');

  runEvaluation({ apiKey: process.env.GEMINI_API_KEY }).then(r => {
    console.log(`\nMode: ${r.mode === 'gemini' ? 'Gemini' : 'Rule-only (no GEMINI_API_KEY)'}  [${r.modelUsed}]`);
    console.log(`Items: ${r.items}  Clean items passed: ${r.cleanItemsPassed}/${r.cleanItems}`);
    console.log(`Caught ${r.caught} of ${r.labelled} labelled issues  |  ${r.falseAlarms} false alarms  |  ${r.wrongCategory} wrong-category  |  ${r.missed} missed`);
    console.log(`Precision ${pct(r.precision)}  Recall ${pct(r.recall)}  Latency p50 ${r.latency.p50}ms p95 ${r.latency.p95}ms\n`);
    console.log(`Deterministic scanner (Stage 2): eval set p50 ${r.scanner.evalSetP50Ms}ms p95 ${r.scanner.evalSetP95Ms}ms | ${r.scanner.longDraftWords}-word draft p50 ${r.scanner.longDraftP50Ms}ms p95 ${r.scanner.longDraftP95Ms}ms (${r.scanner.runs} runs, target < ${r.scanner.targetMs}ms)`);
    const lm = r.results.filter(x => x.group === 'landmark');
    console.log(`Landmark cases: ${lm.map(x => `${x.id} ${x.hits.length}/${x.expected.length}`).join('  ')}
`);
    console.table(r.byCategory.map(c => ({ category: c.category, labelled: c.labelled, caught: c.caught, raised: c.raised, falseAlarms: c.falseAlarms, precision: pct(c.precision), recall: pct(c.recall) })));
    const bad = r.results.filter(x => x.missed.length || x.falseAlarms.length || x.wrongCategory.length || x.error);
    for (const x of bad) {
      console.log(`- ${x.id}${x.error ? ` ERROR ${x.error}` : ''}`);
      x.missed.forEach(m => console.log(`    missed      [${m.category}] "${m.span}"`));
      x.falseAlarms.forEach(f => console.log(`    false alarm [${f.category}] "${f.span}"`));
      x.wrongCategory.forEach(f => console.log(`    wrong cat   [${f.category}] "${f.span}"`));
    }
    process.exit(0); // something in the imported store keeps the event loop alive
  }).catch(e => { console.error(e); process.exit(1); });
}
