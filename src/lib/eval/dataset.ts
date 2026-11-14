/**
 * Labelled evaluation set for the governance pipeline (round 3 commitment #3).
 *
 * Labels are what a human brand reviewer on the team would flag, written BEFORE
 * looking at pipeline output. `span` must be an exact substring of `text`.
 * Synthetic, team-labelled, small: treat the numbers as a smoke signal, not a benchmark.
 */
import type { ContentChannel, FindingCategory, FindingSeverity } from '../ai/types';

export type EvalBrand = 'apex' | 'flowscale' | 'nexus';

export interface ExpectedIssue {
  span: string;
  category: FindingCategory;
  severity: FindingSeverity;
}

export interface EvalItem {
  id: string;
  brand: EvalBrand;
  channel: ContentChannel;
  kind: 'violation' | 'clean' | 'near_miss';
  note?: string;
  text: string;
  expected: ExpectedIssue[];
}

export const BRAND_SCOPE: Record<EvalBrand, { name: string; orgId: string; brandId: string }> = {
  apex: { name: 'Apex Nutrition', orgId: 'org_uideas_digital', brandId: 'brand_apex' },
  flowscale: { name: 'Flowscale', orgId: 'org_inkloom_demo', brandId: 'brand_flowscale' },
  nexus: { name: 'Nexus', orgId: 'org_competitor_sandbox', brandId: 'brand_nexus' },
};

const P = (span: string, severity: FindingSeverity = 'high'): ExpectedIssue => ({ span, category: 'prohibited_term', severity });
const U = (span: string, severity: FindingSeverity = 'high'): ExpectedIssue => ({ span, category: 'unsupported_claim', severity });
const T = (span: string, severity: FindingSeverity = 'medium'): ExpectedIssue => ({ span, category: 'tone_inconsistency', severity });
const D = (span: string, severity: FindingSeverity = 'high'): ExpectedIssue => ({ span, category: 'missing_disclosure', severity });
const X = (span: string, severity: FindingSeverity = 'high'): ExpectedIssue => ({ span, category: 'time_bound_claim', severity });

export const EVAL_DATASET: EvalItem[] = [
  // ---------------- Apex Nutrition: violations ----------------
  { id: 'apex-01', brand: 'apex', channel: 'social_media', kind: 'violation',
    text: 'This protein is a miracle for your morning routine. #ApexFuel',
    expected: [P('miracle', 'critical')] },
  { id: 'apex-02', brand: 'apex', channel: 'social_media', kind: 'violation',
    text: 'Leg day cheat code unlocked. Two scoops and go. #gymtok',
    expected: [P('cheat code')] },
  { id: 'apex-03', brand: 'apex', channel: 'landing_page', kind: 'violation',
    text: 'Apex Recovery Blend is the magic bullet for sore muscles after training.',
    expected: [P('magic bullet', 'critical')] },
  { id: 'apex-04', brand: 'apex', channel: 'advertisement', kind: 'violation',
    text: 'Get 50% faster recovery with Apex Whey, guaranteed or your money back.',
    expected: [U('50% faster'), U('guaranteed')] },
  { id: 'apex-05', brand: 'apex', channel: 'email', kind: 'violation',
    text: 'Hi Sam,\n\nOur new formula gives you instant results from the very first scoop.',
    expected: [U('instant results')] },
  { id: 'apex-06', brand: 'apex', channel: 'landing_page', kind: 'violation',
    text: 'The industry-leading plant protein, trusted by athletes who refuse to settle.',
    expected: [U('industry-leading')] },
  { id: 'apex-07', brand: 'apex', channel: 'social_media', kind: 'violation',
    text: 'Revolutionary energy blend. Insane results in a week. #ApexFuel',
    expected: [T('Revolutionary'), T('Insane results'), U('Insane results in a week')] },
  { id: 'apex-08', brand: 'apex', channel: 'advertisement', kind: 'violation',
    text: 'Join 2,000,000 customers who switched to Apex this year.',
    expected: [U('2,000,000 customers')] },
  { id: 'apex-09', brand: 'apex', channel: 'blog_post', kind: 'violation',
    note: 'Two prohibited terms in one draft.',
    text: 'Forget the miracle powders. Our blend is no magic bullet, just honest nutrition.',
    expected: [P('miracle', 'critical'), P('magic bullet', 'critical')] },
  { id: 'apex-10', brand: 'apex', channel: 'landing_page', kind: 'violation',
    note: 'Medical claim not in the approved library; no keyword the rules know about.',
    text: 'Apex Greens cures bloating and reverses gut damage in days.',
    expected: [U('cures bloating'), U('reverses gut damage')] },

  // ---------------- Apex Nutrition: clean / near-miss ----------------
  { id: 'apex-c1', brand: 'apex', channel: 'landing_page', kind: 'clean',
    text: 'Clinically tested for faster results. Formulated with 100% bio-available plant proteins.',
    expected: [] },
  { id: 'apex-c2', brand: 'apex', channel: 'social_media', kind: 'clean',
    text: 'Sustained energy without the midday crash. Real food, real ingredients. #ApexFuel',
    expected: [] },
  { id: 'apex-n1', brand: 'apex', channel: 'landing_page', kind: 'near_miss',
    note: 'Approved claim reworded slightly.',
    text: 'Our formula has been clinically tested to deliver faster results.',
    expected: [] },
  { id: 'apex-n2', brand: 'apex', channel: 'blog_post', kind: 'near_miss',
    note: 'British spelling of the approved claim.',
    text: 'Formulated with 100% bio-available plant proteins and flavoured naturally.',
    expected: [] },
  { id: 'apex-n3', brand: 'apex', channel: 'social_media', kind: 'near_miss',
    note: 'Proper noun "Miracle Mile" is a place, not a claim.',
    text: 'Shoutout to the Miracle Mile run club for fuelling up with Apex. #community',
    expected: [] },

  // ---------------- Flowscale: violations ----------------
  { id: 'flow-01', brand: 'flowscale', channel: 'landing_page', kind: 'violation',
    text: 'Flowscale gives you a bulletproof event pipeline for every workload.',
    expected: [P('bulletproof')] },
  { id: 'flow-02', brand: 'flowscale', channel: 'landing_page', kind: 'violation',
    text: 'Our platform is unhackable by design, so your data stays yours.',
    expected: [P('unhackable', 'critical')] },
  { id: 'flow-03', brand: 'flowscale', channel: 'email', kind: 'violation',
    text: 'Hi team,\n\nFlowscale now offers 100% uptime on every plan.',
    expected: [P('100% uptime', 'critical')] },
  { id: 'flow-04', brand: 'flowscale', channel: 'blog_post', kind: 'violation',
    text: 'The secret sauce behind Flowscale is a log-structured routing layer.',
    expected: [T('secret sauce', 'low')] },
  { id: 'flow-05', brand: 'flowscale', channel: 'landing_page', kind: 'violation',
    text: 'Flowscale is the cheapest in the world for streaming workloads.',
    expected: [U('cheapest in the world')] },
  { id: 'flow-06', brand: 'flowscale', channel: 'advertisement', kind: 'violation',
    note: 'Ad without the required "Terms and conditions apply" footer.',
    text: 'Limited time offer: three months of Flowscale Pro at half price. Sign up today.',
    expected: [D('Limited time offer')] },
  { id: 'flow-07', brand: 'flowscale', channel: 'social_media', kind: 'violation',
    note: 'Social post missing the disclosures link.',
    text: 'Cut your cloud bill by up to 35% with Flowscale. #devops',
    expected: [D('Cut your cloud bill')] },
  { id: 'flow-08', brand: 'flowscale', channel: 'landing_page', kind: 'violation',
    text: 'Voted #1 Cloud Event Platform in 2023 by engineers everywhere.',
    expected: [X('Voted #1 Cloud Event Platform in 2023')] },
  { id: 'flow-09', brand: 'flowscale', channel: 'landing_page', kind: 'violation',
    text: 'Enjoy unlimited free data egress forever on all tiers.',
    expected: [X('unlimited free data egress forever on all tiers')] },
  { id: 'flow-10', brand: 'flowscale', channel: 'landing_page', kind: 'violation',
    text: 'Flowscale is 10x faster than Kafka with zero downtime migrations.',
    expected: [U('10x faster'), U('zero downtime')] },
  { id: 'flow-11', brand: 'flowscale', channel: 'press_release', kind: 'violation',
    text: 'FOR IMMEDIATE RELEASE\n\nFlowscale delivers 99.999% uptime and best-in-class latency for fintech.',
    expected: [U('99.999% uptime'), U('best-in-class')] },

  // ---------------- Flowscale: clean / near-miss ----------------
  { id: 'flow-c1', brand: 'flowscale', channel: 'landing_page', kind: 'clean',
    text: 'Flowscale processes 50,000 transactions per second with sub-millisecond p99 latency.',
    expected: [] },
  { id: 'flow-c2', brand: 'flowscale', channel: 'advertisement', kind: 'clean',
    text: 'Reduce cloud infrastructure spend by up to 35%. Terms and conditions apply.',
    expected: [] },
  { id: 'flow-n1', brand: 'flowscale', channel: 'landing_page', kind: 'near_miss',
    note: 'Approved throughput claim with different number formatting.',
    text: 'Process 50k transactions per second at sub-millisecond p99 latency.',
    expected: [] },
  { id: 'flow-n2', brand: 'flowscale', channel: 'landing_page', kind: 'near_miss',
    note: 'Approved security claim, reworded.',
    text: 'Enterprise security you can audit: SOC 2 Type II certified and ISO 27001 compliant.',
    expected: [] },
  { id: 'flow-n3', brand: 'flowscale', channel: 'blog_post', kind: 'near_miss',
    note: 'Negated prohibited term in an honest engineering post.',
    text: 'No system is bulletproof, so we design Flowscale to fail safely and recover fast.',
    expected: [] },

  // ---------------- Nexus ----------------
  { id: 'nexus-01', brand: 'nexus', channel: 'landing_page', kind: 'violation',
    text: 'Nexus brings enterprise-grade tooling to your weekend projects.',
    expected: [P('enterprise-grade', 'medium')] },
  { id: 'nexus-02', brand: 'nexus', channel: 'social_media', kind: 'violation',
    text: 'Nexus is used by 50 million users worldwide. #makers',
    expected: [U('50 million users')] },
  { id: 'nexus-c1', brand: 'nexus', channel: 'landing_page', kind: 'clean',
    text: 'Nexus is used by 10 million hobbyists worldwide.',
    expected: [] },
  { id: 'nexus-n1', brand: 'nexus', channel: 'blog_post', kind: 'near_miss',
    note: 'Isolation check: another tenant\'s prohibited term must not fire for Nexus.',
    text: 'Our hobby kit is not unhackable, but it is easy to patch and fun to build.',
    expected: [] },
];
