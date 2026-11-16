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
  /** Named group shown separately on the evaluation page. */
  group?: 'landmark' | 'off_brand' | 'wrong_type' | 'disclosure' | 'subtle';
  /** Real-world case the item is modelled on (landmark group only). */
  caseRef?: string;
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
const O = (span: string): ExpectedIssue => ({ span, category: 'out_of_scope', severity: 'critical' });
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
  { id: 'nexus-c1', brand: 'nexus', channel: 'social_media', kind: 'clean',
    note: 'Approved claim used verbatim on its approved channel.',
    text: 'Nexus is used by 10 million hobbyists worldwide.',
    expected: [] },
  { id: 'nexus-03', brand: 'nexus', channel: 'landing_page', kind: 'violation',
    note: 'Relabelled round 6: this approved claim is cleared for social only, so on a landing page it is out of scope.',
    text: 'Nexus is used by 10 million hobbyists worldwide.',
    expected: [{ span: 'Nexus is used by 10 million hobbyists worldwide.', category: 'out_of_scope', severity: 'high' }] },
  { id: 'nexus-n1', brand: 'nexus', channel: 'blog_post', kind: 'near_miss',
    note: 'Isolation check: another tenant\'s prohibited term must not fire for Nexus.',
    text: 'Our hobby kit is not unhackable, but it is easy to patch and fun to build.',
    expected: [] },

  // ---------------- Landmark cases (modelled on real enforcement / incidents) ----------------
  { id: 'landmark-teami', brand: 'apex', channel: 'social_media', kind: 'violation', group: 'landmark',
    caseRef: 'FTC v. Teami (2020): detox-tea health claims + influencer posts without clear #ad',
    note: 'Health/weight claim, supplement structure/function claim without DSHEA disclaimer, creator post without disclosure.',
    text: 'Obsessed with my Apex Detox Tea! It melts belly fat and cleanses toxins so I feel lighter every morning. Use code SARAH20 for 20% off #teatox',
    expected: [U('melts belly fat'), D('cleanses toxins'), D('Use code SARAH20')] },
  { id: 'landmark-adidas', brand: 'apex', channel: 'email', kind: 'violation', group: 'landmark',
    caseRef: 'Adidas Boston Marathon email (2017): "Congrats, you survived the Boston Marathon!"',
    note: 'Tragedy-adjacent wording next to a real event.',
    text: 'Subject: Congrats, you survived the Boston Marathon!\n\nRefuel after the big day with Apex Recovery Blend.',
    expected: [T('you survived', 'high')] },
  { id: 'landmark-cnet', brand: 'flowscale', channel: 'blog_post', kind: 'violation', group: 'landmark',
    caseRef: 'CNET AI-written finance explainers (2023): wrong compound-interest figures published unchecked',
    note: 'Specific numeric outcome with no verified source (and arithmetically wrong: interest earned is $300).',
    text: 'If you deposit $10,000 into a savings account that pays 3% APY, you will earn $10,300 in interest after the first year.',
    expected: [U('3% APY'), U('earn $10,300')] },

  // ---------------- Off-brand content (must be blocked for the brand it was checked against) ----------------
  { id: 'offbrand-01', brand: 'apex', channel: 'social_media', kind: 'violation', group: 'off_brand',
    note: 'An agency pitch deck checked against a nutrition brand.',
    text: 'Uideas creative studio pitch deck\n\nAbout us\nWe edit videos, design motion graphics and build brand identities.\n\nOur clients\nWe have worked with 50+ brands.\n\nPricing\nPackages start at 20k per month.\n\nContact us\nhello@uideas.example',
    expected: [O('Uideas creative studio pitch deck')] },
  { id: 'offbrand-02', brand: 'apex', channel: 'landing_page', kind: 'violation', group: 'off_brand',
    note: 'Cloud infrastructure copy checked against a nutrition brand.',
    text: 'Route your event streams across regions with automatic failover and per-partition ordering.',
    expected: [O('Route your event streams across regions with automatic failover and per-partition ordering.')] },
  { id: 'offbrand-03', brand: 'flowscale', channel: 'social_media', kind: 'violation', group: 'off_brand',
    note: 'Protein-shake copy checked against a cloud infrastructure brand.',
    text: 'Our new chocolate protein shake tastes like dessert after leg day. #gains',
    expected: [O('Our new chocolate protein shake tastes like dessert after leg day. #gains')] },

  // ---------------- Wrong document type for the channel ----------------
  { id: 'wrongtype-01', brand: 'flowscale', channel: 'social_media', kind: 'violation', group: 'wrong_type',
    note: 'A CV submitted as a social post.',
    text: 'Jane Doe - Curriculum Vitae\n\nExperience\nSenior Platform Engineer, Flowscale (2019-2024). Built the event routing layer.\n\nEducation\nBSc Computer Science\n\nSkills\nKafka, Go, Kubernetes\n\nReferences available on request.',
    expected: [O('Jane Doe - Curriculum Vitae')] },
  { id: 'wrongtype-02', brand: 'apex', channel: 'advertisement', kind: 'violation', group: 'wrong_type',
    note: 'An internal campaign proposal submitted as an ad.',
    text: 'Proposal: Apex Nutrition Q3 influencer campaign\n\nObjectives\nGrow awareness of Apex Whey among gym-goers aged 18-30.\n\nScope of work\nTwelve creator reels, four static posts, one launch event.\n\nBudget\nINR 6,00,000 across three months.\n\nTimeline\nKick-off in July, wrap in September.\n\nNext steps\nSign off on the scope and budget.',
    expected: [O('Proposal: Apex Nutrition Q3 influencer campaign')] },

  // ---------------- Regulatory disclosures (FTC #ad, FDA/DSHEA) ----------------
  { id: 'disc-ad-01', brand: 'apex', channel: 'social_media', kind: 'violation', group: 'disclosure',
    note: 'Creator endorsement with a promo code and no #ad.',
    text: "I've been using Apex Whey every morning and my lifts feel great. Use code MIKE15 for 15% off!",
    expected: [D('Use code MIKE15')] },
  { id: 'disc-ad-c1', brand: 'apex', channel: 'social_media', kind: 'clean', group: 'disclosure',
    note: 'Same endorsement, correctly disclosed.',
    text: "#ad I've been using Apex Whey every morning and my lifts feel great. Use code MIKE15 for 15% off.",
    expected: [] },
  { id: 'disc-fda-01', brand: 'apex', channel: 'landing_page', kind: 'violation', group: 'disclosure',
    note: 'Supplement structure/function claim without the DSHEA disclaimer.',
    text: 'Apex Greens powder supports healthy digestion with 12 whole-food ingredients.',
    expected: [D('supports healthy digestion')] },
  { id: 'disc-fda-c1', brand: 'apex', channel: 'landing_page', kind: 'clean', group: 'disclosure',
    note: 'Same claim with the DSHEA disclaimer.',
    text: 'Apex Greens powder supports healthy digestion with 12 whole-food ingredients.\n\n*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.',
    expected: [] },

  // ---------------- Subtle claims (no banned word, still needs proof) ----------------
  { id: 'subtle-01', brand: 'flowscale', channel: 'landing_page', kind: 'violation', group: 'subtle',
    text: 'Trusted by 500 brands to move their data between clouds.',
    expected: [U('Trusted by 500 brands')] },
  { id: 'subtle-02', brand: 'apex', channel: 'social_media', kind: 'violation', group: 'subtle',
    text: "The dietitians' favourite plant protein. #ApexFuel",
    expected: [U("dietitians' favourite")] },
  { id: 'subtle-03', brand: 'flowscale', channel: 'email', kind: 'violation', group: 'subtle',
    text: 'Hi Priya,\n\nMost teams see results within the first week of switching to Flowscale.',
    expected: [U('Most teams see results within the first week')] },
  { id: 'subtle-04', brand: 'nexus', channel: 'landing_page', kind: 'violation', group: 'subtle',
    text: 'Rated 4.9 stars by makers around the world.',
    expected: [U('Rated 4.9 stars')] },

  // ---------------- More compliant copy ----------------
  { id: 'flow-c3', brand: 'flowscale', channel: 'blog_post', kind: 'clean',
    text: 'This guide walks through setting up a dead-letter queue in Flowscale, step by step.',
    expected: [] },
  { id: 'apex-c3', brand: 'apex', channel: 'email', kind: 'clean',
    text: 'Hi Sam,\n\nYour Apex order has shipped and should arrive on Thursday.',
    expected: [] },
];
