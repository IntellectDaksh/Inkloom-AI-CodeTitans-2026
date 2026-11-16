/**
 * Built-in knowledge library for the seed brands: claims + evidence, guidelines, terminology,
 * assets and documents. Read-only in the app (see BUILT_IN_IDS in seed.ts). Evidence is plainly
 * internal: no external citations, DOIs, trial IDs or certificate numbers.
 * Brand/org ids are literals because seed.ts imports this module (no circular import).
 */
import type { ApprovedClaim, ClaimEvidence, BrandGuideline, BrandTerm, BrandAsset, Document, ClaimCategory, ClaimStatus, EvidenceType, GuidelineCategory, FindingSeverity, TermType, AssetType, FileType } from './types';

const ORG = '00000000-0000-4000-a000-000000000001';
const REVIEWER = '00000000-0000-4000-a000-000000000012';
const ANALYST = '00000000-0000-4000-a000-000000000013';
export const LIB_BRAND = {
  A: '00000000-0000-4000-b000-000000000001',
  Z: '00000000-0000-4000-b000-000000000002',
  L: '00000000-0000-4000-b000-000000000003',
} as const;
type B = keyof typeof LIB_BRAND;

const DAY = 86_400_000;
/** Midnight-UTC anchored so built-in expiry dates change at most once a day. */
export const daysFromToday = (n: number) => new Date(Math.floor(Date.now() / DAY) * DAY + n * DAY).toISOString();
const CREATED = '2026-03-01T00:00:00.000Z';
const STATUS: Record<string, ClaimStatus> = { a: 'approved', r: 'under_review', x: 'expired' };

// ---------------------------------------------------------------------------
// Claims. Tuple: [id suffix, code, text, category, status, days to expiry, channels,
//   restriction, disclosure, evidence type, evidence title, source name, excerpt, internal note]
// ---------------------------------------------------------------------------
type C = [string, string, string, ClaimCategory, 'a' | 'r' | 'x', number, string, string, string | null, EvidenceType, string, string, string, string];

const CLAIMS: Record<B, C[]> = {
  A: [
    ['208', 'CLM-APX-008', 'Each 30g serving of Apex ProWhey™ delivers 25g of protein from whey protein isolate.', 'sourcing', 'a', 300, 'Instagram, Email, Landing page, Packaging', 'Do not round up to "30g protein". Always state the serving size.', 'Per 30g serving.', 'lab_report', 'Protein content verification, three batches', 'Internal lab test report, Q3 2026', 'Mean protein content measured at 25.3g per 30g serving across three consecutive production batches.', 'Retest whenever the whey supplier changes.'],
    ['209', 'CLM-APX-009', 'Contains 3g of leucine per serving.', 'sourcing', 'a', 280, 'Instagram, Email, Landing page, Packaging', 'Do not claim leucine alone builds muscle.', null, 'lab_report', 'Amino acid profile, ProWhey vanilla and chocolate', 'Internal lab test report, Q3 2026', 'Leucine measured at 3.0g to 3.2g per serving in both flavours tested.', 'Strawberry flavour not yet profiled; keep claim off strawberry packs.'],
    ['210', 'CLM-APX-010', 'Mixes smoothly in 250ml of water or milk with a shaker in under 20 seconds.', 'performance', 'a', 200, 'Instagram, Landing page', 'Shaker bottle only; not tested with a spoon.', null, 'lab_report', 'Mixability bench test', 'Internal product development log, Aug 2026', 'All 20 shaker trials produced a lump-free drink in 12 to 18 seconds.', 'Bench test by the product team, not an external lab.'],
    ['211', 'CLM-APX-011', 'Zero added sugar per serving.', 'safety', 'a', 340, 'Instagram, Email, Landing page, Packaging', 'Never say "sugar free"; naturally occurring lactose remains.', 'Contains naturally occurring sugars from milk.', 'lab_report', 'Formula sheet and sugar analysis', 'Internal formulation record, Jan 2026', 'No sucrose, glucose syrup or other sugars are added; 1.1g naturally occurring sugars per serving.', 'Formula sheet signed off by the product lead.'],
    ['212', 'CLM-APX-012', '9 out of 10 customers surveyed said Apex ProWhey™ tastes better than the protein they used before.', 'performance', 'a', 14, 'Instagram, Email', 'Must say "customers surveyed". Never "athletes prefer" or "best-tasting protein".', '*Survey of 412 Apex subscribers, Aug 2026.', 'clinical_trial', 'Taste preference survey', 'Customer survey n=412, Aug 2026', '371 of 412 respondents rated the taste better or much better than their previous protein.', 'Self-selected subscribers. Re-run the survey before the Q1 campaign.'],
    ['213', 'CLM-APX-013', 'Apex Electrolyte Mix provides 500mg of sodium and 200mg of potassium per stick.', 'sourcing', 'a', 260, 'Instagram, Email, Landing page, Packaging', 'Do not claim it prevents cramps or dehydration.', 'Per 6g stick.', 'lab_report', 'Mineral content analysis', 'Internal lab test report, Jul 2026', 'Sodium 497mg and potassium 204mg per stick, mean of three batches.', 'Within 5% of label values.'],
    ['214', 'CLM-APX-014', 'Apex Creatine provides 5g of creatine monohydrate per scoop.', 'sourcing', 'a', 320, 'Instagram, Email, Landing page, Packaging', 'Do not name or cite outside studies in copy.', null, 'lab_report', 'Fill weight and purity check', 'Internal lab test report, Q2 2026', 'Scoop fill averaged 5.04g; creatine monohydrate content above 99%.', 'Scoop size changed in May 2026; claim covers the new scoop only.'],
    ['215', 'CLM-APX-015', 'Creatine monohydrate supports performance in repeated bursts of short, high-intensity exercise.', 'efficacy', 'a', 9, 'Instagram, Email, Landing page', 'Never "builds muscle fast" or any timeframe.', 'Benefit is obtained with a daily intake of 3g of creatine.', 'legal_opinion', 'Regulatory wording review, creatine benefit', 'Internal regulatory memo, Jun 2026', 'Wording approved as written, with the 3g daily intake condition shown next to it.', 'Memo review is annual; renewal is due this month.'],
    ['216', 'CLM-APX-016', 'Every batch is tested for heavy metals before release.', 'safety', 'a', 180, 'Instagram, Email, Landing page, Packaging', 'Do not say "free from heavy metals"; results are below limits, not zero.', null, 'lab_report', 'Batch release testing procedure', 'Internal QA procedure, rev. 4', 'Release is blocked until lead, cadmium, mercury and arsenic results are logged below internal limits.', 'Procedure audited internally in Jul 2026.'],
    ['217', 'CLM-APX-017', 'Apex Recovery Blend contains 300mg of tart cherry extract per serving.', 'sourcing', 'a', 210, 'Instagram, Email, Landing page, Packaging', 'Do not claim it reduces soreness or inflammation.', null, 'lab_report', 'Ingredient dosing record', 'Internal batch manufacturing record, Aug 2026', 'Tart cherry extract dosed at 300mg per 20g serving in each batch record reviewed.', 'Ingredient quantity claim only.'],
    ['218', 'CLM-APX-018', 'Our 1kg and 2kg tubs are made from 50% post-consumer recycled plastic.', 'sourcing', 'a', 25, 'Email, Landing page, Packaging', 'Never "fully recyclable", "plastic neutral" or "eco-friendly".', 'Applies to 1kg and 2kg tubs only.', 'legal_opinion', 'Packaging supplier declaration', 'Supplier material declaration, May 2026', 'Supplier declares 50% post-consumer resin content in tub bodies; lids are virgin plastic.', 'Declaration renews every six months.'],
    ['219', 'CLM-APX-019', 'Apex Pre-Workout contains 200mg of caffeine per scoop.', 'safety', 'a', 150, 'Instagram, Email, Landing page, Packaging', 'Do not call it "safe for everyone" or suggest taking more than one scoop.', 'Not suitable for children, or pregnant or breastfeeding women. Do not exceed one scoop per day.', 'lab_report', 'Caffeine assay', 'Internal lab test report, Sep 2026', 'Caffeine measured at 196mg to 204mg per scoop across three batches.', 'Warning text is mandatory wherever caffeine content is mentioned.'],
    ['220', 'CLM-APX-020', 'Free from artificial colours and flavours.', 'safety', 'x', -12, 'Instagram, Packaging', 'Lapsed after the flavour system change. Do not use until re-verified.', null, 'lab_report', 'Flavour system ingredient review', 'Internal formulation record, Oct 2025', 'Previous flavour system used natural flavourings only.', 'New supplier flavours not yet reviewed. Claim expired.'],
    ['221', 'CLM-APX-021', 'Apex Plant Protein, made from pea and brown rice, provides 22g of protein per serving.', 'sourcing', 'a', 240, 'Instagram, Email, Landing page, Packaging', 'Do not say "complete protein" without the amino acid profile.', 'Per 32g serving.', 'lab_report', 'Plant protein content verification', 'Internal lab test report, Q3 2026', 'Protein content measured at 22.4g per 32g serving.', 'Single batch so far; second batch test booked.'],
    ['222', 'CLM-APX-022', 'Rated 4.7 out of 5 by verified buyers on our website.', 'performance', 'x', -40, 'Instagram, Email, Landing page', 'Rating must be refreshed monthly. Expired: do not use.', null, 'clinical_trial', 'Customer review export', 'Website review export, Jun 2026', 'Average rating 4.71 across 2,318 verified-purchase reviews.', 'Export is older than 30 days, so the claim has lapsed.'],
    ['223', 'CLM-APX-023', 'Supports muscle recovery after training as part of a balanced diet.', 'efficacy', 'a', 270, 'Instagram, Email, Landing page, Packaging', 'Never "repairs muscle damage" or "eliminates soreness".', 'As part of a varied, balanced diet and healthy lifestyle.', 'legal_opinion', 'Recovery wording review', 'Internal regulatory memo, Apr 2026', 'General recovery wording is acceptable when tied to protein content and the balanced diet qualifier.', 'Qualifier must sit in the same sentence or directly beneath.'],
    ['224', 'CLM-APX-024', 'Protein contributes to the growth and maintenance of muscle mass.', 'efficacy', 'a', 365, 'Instagram, Email, Landing page, Packaging', 'Use this wording exactly. Do not add percentages or timeframes.', null, 'legal_opinion', 'Protein function wording review', 'Internal regulatory memo, Apr 2026', 'Approved as standard protein function wording for products that are a source of protein.', 'Exact wording only.'],
    ['225', 'CLM-APX-025', 'Gluten-free: tested below 20 ppm gluten.', 'safety', 'r', 120, 'Email, Landing page, Packaging', 'Do not use until all flavours are tested.', null, 'lab_report', 'Gluten screening, flavour range', 'Internal lab test report, Oct 2026', 'Four of six flavours tested below 20 ppm.', 'Two flavours still pending. Reviewer sign-off required.'],
  ],
  Z: [
    ['303', 'CLM-ZEN-003', 'Customer data is encrypted at rest with AES-256 and in transit with TLS 1.2 or higher.', 'certifications', 'a', 300, 'LinkedIn, Landing page, Ads, Email', 'Never "unbreakable" or "military-grade".', null, 'iso_cert', 'Encryption controls review', 'Internal security architecture review, Q3 2026', 'All managed storage volumes and databases use AES-256 at rest; public endpoints reject TLS below 1.2.', 'Reviewed by the security team in Sep 2026.'],
    ['304', 'CLM-ZEN-004', 'Median API response time under 120ms across all regions in Q3 2026.', 'performance', 'a', 20, 'LinkedIn, Landing page, Email', 'Always name the quarter. Never "fastest cloud".', '*Measured July to September 2026, p50 across all public regions.', 'lab_report', 'Q3 latency report', 'Internal observability export, Oct 2026', 'p50 API latency was 104ms across 12 regions for the quarter.', 'Quarterly figure; replace with the Q4 number in January.'],
    ['305', 'CLM-ZEN-005', 'Deploy to 12 regions across North America, Europe and Asia Pacific.', 'performance', 'a', 200, 'LinkedIn, Landing page, Ads, Email', 'Update the count whenever a region launches or closes.', null, 'legal_opinion', 'Region inventory', 'Internal infrastructure register, Oct 2026', '12 public regions are generally available: 4 North America, 5 Europe, 3 Asia Pacific.', 'Preview regions are excluded from the count.'],
    ['306', 'CLM-ZEN-006', 'Teams moving from self-managed clusters cut infrastructure spend by an average of 31% in their first year.', 'performance', 'a', 160, 'LinkedIn, Landing page, Email', 'Always say "average" and show the footnote. Never "cut costs by a third".', '*Based on 18 customer migrations completed in 2025. Individual results vary.', 'lab_report', 'Customer migration cost analysis', 'Internal finance analysis of 18 migrations, Mar 2026', 'Average first-year infrastructure spend fell 31%; range 9% to 52%.', 'Customer names stay confidential.'],
    ['307', 'CLM-ZEN-007', 'Automated daily backups retained for 35 days on all paid plans.', 'performance', 'a', 260, 'LinkedIn, Landing page, Ads, Email', 'Free tier is excluded.', null, 'legal_opinion', 'Backup policy', 'Internal platform policy, rev. 3', 'Daily snapshots are retained for 35 days on Team, Business and Enterprise plans.', 'Matches the public plan comparison table.'],
    ['308', 'CLM-ZEN-008', 'Point-in-time database recovery to any second in the last 7 days.', 'performance', 'a', 240, 'LinkedIn, Landing page, Email', 'Business and Enterprise plans only.', null, 'lab_report', 'Restore drill results', 'Internal reliability drill log, Aug 2026', '40 restore drills recovered to the requested second within the 7-day window.', 'Drills run monthly.'],
    ['309', 'CLM-ZEN-009', '24/7 support with a 15-minute first response target for Severity 1 incidents on Enterprise plans.', 'performance', 'a', 180, 'LinkedIn, Landing page, Email', 'It is a target. Never "guaranteed 15-minute response".', 'Enterprise plans only. Target, not a contractual guarantee.', 'lab_report', 'Support response report', 'Internal support desk report, Q3 2026', 'Median first response for Severity 1 tickets was 6 minutes; 97% within 15 minutes.', 'Report refreshed quarterly.'],
    ['310', 'CLM-ZEN-010', 'Single sign-on with SAML 2.0 and OIDC on Business and Enterprise plans.', 'certifications', 'a', 300, 'LinkedIn, Landing page, Ads, Email', 'Name the plans every time.', null, 'legal_opinion', 'Feature availability matrix', 'Internal product matrix, Oct 2026', 'SAML 2.0 and OIDC are generally available on Business and Enterprise.', 'Product team owns this matrix.'],
    ['311', 'CLM-ZEN-011', 'Role-based access control with audit logs retained for 400 days.', 'certifications', 'a', 280, 'LinkedIn, Landing page, Email', 'Audit log retention applies to Enterprise plans.', 'Audit log retention of 400 days applies to Enterprise plans.', 'iso_cert', 'Access control review', 'Internal security review, Q3 2026', 'RBAC is enforced on every console and API action; logs are stored for 400 days.', 'Retention verified against storage lifecycle settings.'],
    ['312', 'CLM-ZEN-012', 'Data residency options keep customer data within the EU.', 'certifications', 'a', 26, 'LinkedIn, Landing page, Email', 'Applies to EU regions only. Do not imply support staff access is EU-only.', 'Customer data stays in the selected EU region. Support access is described in the data processing terms.', 'legal_opinion', 'Data residency legal review', 'Internal legal memo, May 2026', 'Data at rest and backups stay in the selected EU region.', 'Legal review renews every six months; renewal due soon.'],
    ['313', 'CLM-ZEN-013', 'Autoscaling adds capacity in under 60 seconds during traffic spikes.', 'performance', 'a', 150, 'LinkedIn, Landing page, Ads', 'Applies to stateless workloads with autoscaling enabled.', null, 'lab_report', 'Load test summary', 'Internal load test report, Aug 2026', 'New nodes served traffic in 38 to 54 seconds across 30 synthetic spike tests.', 'Stateful workloads were not tested.'],
    ['314', 'CLM-ZEN-014', 'Rated 4.6 out of 5 in our 2026 customer satisfaction survey.', 'performance', 'a', 90, 'LinkedIn, Landing page, Email', 'Always name it as our own survey.', '*Zenith customer survey, 286 responses, April 2026.', 'clinical_trial', 'Customer satisfaction survey', 'Customer survey n=286, Apr 2026', 'Average overall satisfaction score 4.6 out of 5.', 'Annual survey.'],
    ['315', 'CLM-ZEN-015', 'Zero-downtime rolling upgrades for managed Kubernetes clusters.', 'performance', 'a', 210, 'LinkedIn, Landing page, Email', 'Applies when workloads run at least two replicas.', 'Requires at least two replicas per workload.', 'lab_report', 'Upgrade rollout review', 'Internal reliability report, Jul 2026', '1,140 cluster upgrades completed with no failed health checks on multi-replica workloads.', 'Single-replica workloads restart during upgrade.'],
    ['316', 'CLM-ZEN-016', 'Penetration tested by an independent security firm every six months.', 'certifications', 'a', 7, 'LinkedIn, Landing page, Email', 'Do not name the firm. Do not say "zero vulnerabilities".', null, 'iso_cert', 'Penetration test summary letter', 'Third-party test summary on file, H1 2026', 'The H1 2026 test was completed and all high findings were fixed before sign-off.', 'H2 test report expected this month; claim lapses without it.'],
    ['317', 'CLM-ZEN-017', 'Free tier includes 2 vCPU, 4 GB RAM and 20 GB storage, no credit card required.', 'performance', 'a', 120, 'LinkedIn, Landing page, Ads, Email', 'Never "free forever".', 'Free tier limits may change with 30 days notice.', 'legal_opinion', 'Pricing page sign-off', 'Internal pricing committee notes, Sep 2026', 'Free tier limits confirmed as 2 vCPU, 4 GB RAM, 20 GB storage.', 'Pricing committee approves all free tier changes.'],
    ['318', 'CLM-ZEN-018', 'Most teams finish a PostgreSQL migration with our guided tool in under a day.', 'performance', 'r', 100, 'LinkedIn, Landing page', 'Do not use until a reviewer confirms the wording.', null, 'lab_report', 'Migration duration sample', 'Internal onboarding data, n=64 migrations, Sep 2026', '41 of 64 migrations finished in under 24 hours.', 'Sample may be too small for "most teams". Reviewer to confirm.'],
    ['319', 'CLM-ZEN-019', 'Carbon-aware scheduling shifts batch jobs to lower-carbon hours in supported regions.', 'performance', 'a', 170, 'LinkedIn, Landing page, Email', 'Never "carbon neutral", "net zero" or "green cloud".', 'Available in supported regions only.', 'legal_opinion', 'Feature and wording review', 'Internal legal memo, Jun 2026', 'Feature description approved; outcome or offset claims are not.', 'Supported region list lives in the docs.'],
    ['320', 'CLM-ZEN-020', 'Customer workloads are isolated in dedicated virtual networks by default.', 'certifications', 'a', 230, 'LinkedIn, Landing page, Email', 'Do not imply physical hardware isolation.', null, 'iso_cert', 'Network isolation review', 'Internal security architecture review, Q3 2026', 'Every new project is created in its own virtual network with deny-by-default rules.', 'Logical isolation, not dedicated hardware.'],
    ['321', 'CLM-ZEN-021', '30-day money-back guarantee on annual Business plans.', 'performance', 'a', 300, 'Landing page, Ads, Email', 'Annual Business plans only. Not monthly plans.', 'Refund terms apply. See the billing policy.', 'legal_opinion', 'Refund terms review', 'Internal legal memo, Feb 2026', 'Full refund within 30 days of purchase for annual Business plans.', 'Billing policy is the source of truth.'],
    ['322', 'CLM-ZEN-022', 'Over 1,200 engineering teams run production workloads on Zenith.', 'performance', 'x', -20, 'LinkedIn, Landing page, Ads', 'Count must be refreshed quarterly. Expired: do not use.', null, 'lab_report', 'Customer count export', 'Internal billing export, Jun 2026', '1,236 accounts with production-tagged workloads at the end of Q2.', 'Q3 export not yet reviewed.'],
    ['323', 'CLM-ZEN-023', '99.95% uptime SLA on Business plans.', 'performance', 'a', 250, 'LinkedIn, Landing page, Ads, Email', 'Business plans only. Never "guaranteed uptime".', 'Subject to the Zenith Business SLA terms. Service credits are the sole remedy.', 'legal_opinion', 'Business SLA review', 'Internal legal memo, Jan 2026', 'Business SLA commits to 99.95% monthly uptime with service credits.', 'Enterprise SLA is a separate claim.'],
    ['324', 'CLM-ZEN-024', 'Status page incidents are posted within 10 minutes of detection.', 'performance', 'x', -5, 'Landing page, Email', 'Expired: last two incidents missed the target.', null, 'lab_report', 'Incident communication report', 'Internal incident review log, Q2 2026', 'Q2 incidents were posted in a median of 7 minutes.', 'Two Q3 incidents exceeded 10 minutes; claim withdrawn pending review.'],
    ['325', 'CLM-ZEN-025', 'Built-in DDoS protection on every public endpoint at no extra cost.', 'safety', 'r', 140, 'LinkedIn, Landing page, Ads', 'Do not use until legacy endpoint coverage is confirmed.', null, 'iso_cert', 'Network protection controls review', 'Internal security review, Oct 2026', 'Protection is active on all endpoints created after March 2025.', 'Pending confirmation that legacy endpoints are covered.'],
  ],
  L: [
    ['103', 'CLM-LUM-003', 'Skin feels hydrated for up to 24 hours after one application.', 'efficacy', 'a', 200, 'Instagram, TikTok, Product page', 'Say "feels hydrated". Never "repairs dryness".', '*Instrumental hydration test, 30 participants.', 'clinical_trial', 'Hydration panel study', 'Internal consumer use test, n=30, Jul 2026', 'Skin moisture readings stayed above baseline at 24 hours for 27 of 30 participants.', 'Hydra Serum only.'],
    ['104', 'CLM-LUM-004', '92% said their skin looked brighter after 4 weeks.', 'efficacy', 'a', 15, 'Instagram, TikTok, Product page', 'Always show the panel size. Never "92% brighter skin".', '*Consumer perception study, 104 women aged 25 to 55, 4 weeks.', 'clinical_trial', 'Brightness perception study', 'Consumer perception study n=104, Jun 2026', '96 of 104 participants agreed their skin looked brighter at week 4.', 'Perception data, not instrumental. Renewal due this month.'],
    ['105', 'CLM-LUM-005', 'Fragrance-free formula.', 'safety', 'a', 330, 'Instagram, TikTok, Product page, Packaging', 'Do not say "scent-free" for products with masking agents.', null, 'lab_report', 'Formula ingredient review', 'Internal formulation record, Feb 2026', 'No fragrance or essential oils in the formula.', 'Covers the serum and cleanser ranges.'],
    ['106', 'CLM-LUM-006', 'Formulated with 10% niacinamide.', 'sourcing', 'a', 300, 'Instagram, TikTok, Product page, Packaging', 'Ingredient amount only. No outcome claims tied to the percentage.', null, 'lab_report', 'Active ingredient assay', 'Internal lab test report, Q2 2026', 'Niacinamide measured at 10.1% w/w.', 'Clarity Serum only.'],
    ['107', 'CLM-LUM-007', 'Contains a 2% hyaluronic acid complex in multiple molecular weights.', 'sourcing', 'a', 280, 'Instagram, Product page, Packaging', 'Do not say it "fills" or "plumps wrinkles".', null, 'lab_report', 'Ingredient dosing record', 'Internal formulation record, Mar 2026', 'Three hyaluronic acid weights dosed to 2% combined.', 'Hydra Serum only.'],
    ['108', 'CLM-LUM-008', 'Non-comedogenic: formulated not to clog pores.', 'safety', 'a', 22, 'Instagram, TikTok, Product page', 'Never "will never cause breakouts".', null, 'lab_report', 'Comedogenicity assessment', 'Internal lab test report, Q2 2026', 'Formula assessed as non-comedogenic over a 4-week use test.', 'Assessment renews yearly; renewal due soon.'],
    ['109', 'CLM-LUM-009', 'Visibly smoother skin texture in 2 weeks.', 'efficacy', 'a', 160, 'Instagram, TikTok, Product page', 'Keep "visibly". Never "resurfaces skin".', '*Expert grading, 40 participants, 2 weeks.', 'clinical_trial', 'Texture grading study', 'Internal consumer use test, n=40, May 2026', 'Expert graders scored improved smoothness for 33 of 40 participants at day 14.', 'Grading done by the in-house panel.'],
    ['110', 'CLM-LUM-010', 'Suitable for sensitive skin.', 'safety', 'a', 190, 'Instagram, TikTok, Product page, Packaging', 'Never "safe for all skin types" or "will not cause irritation".', null, 'clinical_trial', 'Sensitive skin use test', 'Internal consumer use test, n=50, Apr 2026', 'No participant with self-declared sensitive skin stopped use due to irritation over 3 weeks.', 'Pairs with CLM-LUM-002.'],
    ['111', 'CLM-LUM-011', 'Vegan formula with no animal-derived ingredients.', 'sourcing', 'a', 260, 'Instagram, TikTok, Product page, Packaging', 'Do not say "cruelty-free"; use the separate animal testing claim.', null, 'legal_opinion', 'Ingredient supplier declarations', 'Supplier declarations file, Apr 2026', 'Every raw material supplier declares no animal-derived content.', 'Re-collect declarations on any supplier change.'],
    ['112', 'CLM-LUM-012', 'Not tested on animals, at any stage of development.', 'sourcing', 'a', 240, 'Instagram, TikTok, Product page, Packaging', 'Do not use third-party logos without a licence.', null, 'legal_opinion', 'Supplier and manufacturer declarations', 'Supplier declarations file, Apr 2026', 'Manufacturer and all suppliers declare no animal testing on ingredients or finished products.', 'Logo use needs separate approval.'],
    ['113', 'CLM-LUM-013', 'Mineral SPF 30 broad spectrum sunscreen with zinc oxide.', 'safety', 'r', 90, 'Instagram, Product page, Packaging', 'Do not run until the drug facts panel review is approved.', 'Reapply at least every 2 hours. Use with other sun protection measures.', 'lab_report', 'SPF test summary', 'Internal lab test report, Sep 2026', 'Test summary reports SPF 31 mean value.', 'Sunscreen is a regulated product; label review still pending.'],
    ['114', 'CLM-LUM-014', 'Gentle cleanser that removes makeup without stripping skin.', 'efficacy', 'a', 210, 'Instagram, TikTok, Product page', 'Do not say "removes waterproof makeup".', null, 'clinical_trial', 'Cleanser use test', 'Internal consumer use test, n=45, Mar 2026', '41 of 45 participants said skin did not feel tight after cleansing.', 'Waterproof mascara not tested.'],
    ['115', 'CLM-LUM-015', 'Bottles made with 30% post-consumer recycled plastic.', 'sourcing', 'a', 180, 'Instagram, Product page, Packaging', 'Never "eco-friendly" or "sustainable packaging".', 'Pumps and caps are not included.', 'legal_opinion', 'Packaging supplier declaration', 'Supplier material declaration, Jun 2026', 'Supplier declares 30% post-consumer resin in bottle bodies.', 'Declaration renews every six months.'],
    ['116', 'CLM-LUM-016', 'pH balanced at 5.5.', 'safety', 'a', 230, 'Instagram, Product page, Packaging', 'Do not say it "restores" the skin barrier.', null, 'lab_report', 'pH measurement', 'Internal lab test report, Q2 2026', 'Finished product pH measured between 5.4 and 5.6 across three batches.', 'Cleanser only.'],
    ['117', 'CLM-LUM-017', 'Refill pouches use 70% less plastic than a full bottle.', 'sourcing', 'x', -8, 'Instagram, Product page', 'Expired: pouch supplier changed.', null, 'lab_report', 'Packaging weight calculation', 'Internal packaging calculation, Jan 2026', 'Previous pouch weighed 7.2g against a 24g bottle.', 'New pouch not yet weighed. Recalculate before use.'],
    ['118', 'CLM-LUM-018', 'Reduces the look of dark spots in 8 weeks.', 'efficacy', 'a', 140, 'Instagram, TikTok, Product page', 'Keep "the look of". Never "removes" or "erases" dark spots.', '*Expert grading, 40 participants, 8 weeks.', 'clinical_trial', 'Dark spot appearance study', 'Internal consumer use test, n=40, Jun 2026', 'Graders scored a visible reduction in spot appearance for 29 of 40 participants at week 8.', 'Clarity Serum only.'],
    ['119', 'CLM-LUM-019', 'Dermatologist recommended.', 'certifications', 'x', -30, 'Instagram, Product page', 'Expired: survey older than 12 months.', null, 'clinical_trial', 'Dermatologist panel survey', 'Internal survey of 40 dermatologists, Sep 2025', '31 of 40 surveyed dermatologists said they would recommend the cleanser.', 'Re-run the panel before use.'],
    ['120', 'CLM-LUM-020', 'Lightweight gel texture that absorbs in under 30 seconds.', 'performance', 'a', 170, 'Instagram, TikTok, Product page', 'Texture claim only.', null, 'clinical_trial', 'Sensory panel', 'Internal sensory panel, n=20, Apr 2026', 'Median time to "absorbed" rating was 22 seconds.', 'Hydra Serum only.'],
    ['121', 'CLM-LUM-021', 'Ophthalmologist tested and suitable for use around the eyes.', 'safety', 'a', 130, 'Instagram, Product page, Packaging', 'Eye cream only.', null, 'clinical_trial', 'Eye area use test', 'Internal use test under eye specialist supervision, n=30, May 2026', 'No participant reported eye irritation over 3 weeks of use.', 'Applies to the eye cream only.'],
    ['122', 'CLM-LUM-022', '96% said skin felt softer immediately after use.', 'efficacy', 'a', 110, 'Instagram, TikTok, Product page', 'Always show the panel size.', '*Consumer perception study, 104 women aged 25 to 55.', 'clinical_trial', 'Immediate feel perception study', 'Consumer perception study n=104, Jun 2026', '100 of 104 participants agreed skin felt softer right after application.', 'Same panel as CLM-LUM-004.'],
    ['123', 'CLM-LUM-023', 'Free from parabens, sulfates and mineral oil.', 'safety', 'a', 300, 'Instagram, TikTok, Product page, Packaging', 'Do not imply these ingredients are harmful.', null, 'lab_report', 'Formula ingredient review', 'Internal formulation record, Feb 2026', 'None of the listed ingredients appear in any current formula.', 'Free-from statement only.'],
    ['124', 'CLM-LUM-024', 'Tested to be gentle enough for daily use.', 'safety', 'a', 28, 'Instagram, TikTok, Product page', 'Never "clinically proven gentle".', null, 'clinical_trial', 'Daily use tolerance test', 'Internal consumer use test, n=50, Nov 2025', 'Daily use over 4 weeks with no discontinuations for irritation.', 'Test is close to 12 months old; renewal due soon.'],
    ['125', 'CLM-LUM-025', 'Made in small batches in our UK facility.', 'sourcing', 'r', 200, 'Instagram, Product page', 'Do not use until the night serum line is confirmed.', null, 'legal_opinion', 'Manufacturing location confirmation', 'Internal operations note, Oct 2026', 'Serum and cleanser lines are filled in the UK facility.', 'Awaiting confirmation for the night serum line.'],
  ],
};

const claimId = (s: string) => `00000000-0000-4000-clm0-000000000${s}`;
const evId = (s: string) => `00000000-0000-4000-ev00-000000000${s}`;
const evidence = (id: string, cid: string, type: EvidenceType, title: string, source: string, excerpt: string, note: string, score = 0.85): ClaimEvidence => ({
  id, claim_id: cid, title, citation: source, excerpt: `${excerpt} Internal note: ${note}`, study_url: null,
  evidence_type: type, confidence_score: score, created_at: CREATED, updated_at: '2026-10-15T00:00:00.000Z',
});

export const LIB_CLAIMS: ApprovedClaim[] = [];
export const LIB_EVIDENCE: ClaimEvidence[] = [];
for (const b of Object.keys(CLAIMS) as B[]) {
  for (const [s, code, text, category, st, days, channels, restricted, disclosure, et, title, source, excerpt, note] of CLAIMS[b]) {
    const status = STATUS[st];
    LIB_CLAIMS.push({
      id: claimId(s), organisation_id: ORG, brand_id: LIB_BRAND[b], claim_code: code, claim_text: text, category, status,
      permitted_context: channels, restricted_context: restricted, required_disclosures: disclosure,
      expires_at: daysFromToday(days), verified_by: status === 'approved' ? REVIEWER : null,
      created_at: CREATED, updated_at: '2026-10-15T00:00:00.000Z',
    });
    LIB_EVIDENCE.push(evidence(evId(s), claimId(s), et, title, source, excerpt, note, status === 'under_review' ? 0.6 : 0.85));
  }
}

/** Updates for the claims that shipped in older seeds (ids and codes kept). */
export const CLAIM_PATCHES: Record<string, Partial<ApprovedClaim>> = {
  [claimId('001')]: { status: 'under_review', permitted_context: 'Instagram, Landing page, Packaging', required_disclosures: '*Based on an internal study summary of 24 participants. Full report pending review.' },
  [claimId('002')]: { status: 'approved', verified_by: REVIEWER, permitted_context: 'Instagram, Email, Landing page, Packaging', required_disclosures: 'Per 25g scoop.' },
  [claimId('003')]: { status: 'approved', verified_by: REVIEWER, permitted_context: 'Instagram, Email, Landing page, Packaging', required_disclosures: 'Batch testing details available on request.', expires_at: daysFromToday(17) },
  [claimId('004')]: { status: 'approved', verified_by: REVIEWER, permitted_context: 'Instagram, Landing page, Email', required_disclosures: '*Internal pilot study of 18 trained endurance athletes.', expires_at: daysFromToday(27) },
  [claimId('005')]: { status: 'approved', verified_by: REVIEWER, permitted_context: 'Instagram, Email, Landing page, Packaging' },
  [claimId('006')]: { status: 'approved', verified_by: REVIEWER, permitted_context: 'Email, Landing page, Packaging', required_disclosures: 'FDA registration does not mean FDA approval of the product.' },
  [claimId('009')]: { status: 'approved', verified_by: REVIEWER, permitted_context: 'Email, Landing page, Packaging', required_disclosures: 'Compared with heat-treated isolate in an internal side-by-side test.' },
  [claimId('007')]: { status: 'approved', verified_by: REVIEWER, permitted_context: 'LinkedIn, Landing page, Ads, Email' },
  [claimId('008')]: { status: 'approved', verified_by: REVIEWER, permitted_context: 'LinkedIn, Landing page, Email', required_disclosures: 'Redacted audit report available under NDA.', expires_at: daysFromToday(22) },
  [claimId('101')]: { status: 'approved', verified_by: REVIEWER, permitted_context: 'Instagram, TikTok, Product page', required_disclosures: '*Consumer use test, 60 participants, 8 weeks.', expires_at: daysFromToday(98) },
  [claimId('102')]: { status: 'approved', verified_by: REVIEWER, permitted_context: 'Instagram, TikTok, Product page, Packaging', required_disclosures: null, expires_at: daysFromToday(12) },
};

/** Evidence for the older claims: existing evidence ids are replaced, missing ones added. */
export const EVIDENCE_FOR_OLD_CLAIMS: ClaimEvidence[] = [
  evidence(evId('001'), claimId('001'), 'clinical_trial', 'Post-exercise protein study summary', 'Internal study summary, n=24, Feb 2026', 'Muscle protein synthesis rate measured 42% higher than placebo at 60 minutes.', 'Small sample. Legal wants the full study report before approval.', 0.6),
  evidence(evId('002'), claimId('003'), 'iso_cert', 'Third-party banned substance batch testing', 'Internal QA file: batch testing records, Q3 2026', 'Every batch released in Q3 passed third-party banned substance screening.', 'Programme renewal is due within the month.'),
  evidence(evId('003'), claimId('004'), 'clinical_trial', 'Endurance performance pilot study summary', 'Internal study summary, n=18, Mar 2026', 'Time to exhaustion improved 14.3% against placebo in trained endurance athletes.', 'Pilot size only; renew or retire before expiry.'),
  evidence(evId('004'), claimId('008'), 'iso_cert', 'Annual security audit report', 'Audit report on file under NDA, 2026', 'Auditor opinion was unqualified with no critical exceptions.', 'Next audit period closes this month.'),
  evidence(evId('101'), claimId('101'), 'clinical_trial', 'Fine lines appearance study', 'Internal consumer use test, n=60, May 2026', 'Expert graders saw a visible reduction in the look of fine lines for 44 of 60 participants at week 8.', 'Twice-daily use as directed.'),
  evidence(evId('102'), claimId('102'), 'clinical_trial', 'Patch test on sensitive skin panel', 'Internal patch test report, n=50, Apr 2026', 'No participant showed a reaction over a 48-hour patch test.', 'Patch test renews yearly.'),
  evidence(evId('901'), claimId('002'), 'lab_report', 'Amino acid profile analysis', 'Internal lab test report, Q3 2026', 'BCAA content measured at 5.8g per 25g scoop with a 2:1:1 ratio.', 'Vanilla and chocolate tested.'),
  evidence(evId('902'), claimId('005'), 'lab_report', 'Creatine purity and mesh analysis', 'Internal lab test report, Q2 2026', 'Purity 99.8%; particle size passes 200 mesh; dissolved fully in 250ml at 20°C.', 'Gastric comfort is customer feedback only; keep "zero gastric distress" under watch.'),
  evidence(evId('903'), claimId('006'), 'iso_cert', 'Facility audit summary', 'Internal QA audit report, Jul 2026', 'Contract manufacturer audit found GMP systems in place; no sweeteners, dyes or gums in the formula.', 'Audit repeats annually.'),
  evidence(evId('904'), claimId('009'), 'lab_report', 'Native protein fraction comparison', 'Internal lab test report, Q1 2026', 'Cold-filtered isolate retained 98.4% of the measured protein fractions against the heat-treated sample.', 'Single comparison; do not generalise to other brands.'),
  evidence(evId('905'), claimId('007'), 'legal_opinion', 'Enterprise SLA terms review', 'Internal legal memo, Jan 2026', 'Enterprise SLA wording supports 99.999% with multi-region failover enabled.', 'Enterprise tier only.'),
];

// ---------------------------------------------------------------------------
// Guidelines. rule_content uses "Do:" / "Don't:" lines so the UI can split them.
// ---------------------------------------------------------------------------
type G = [string, GuidelineCategory, string, string, string[], string[], FindingSeverity];
const GUIDES: Record<B, G[]> = {
  A: [
    ['006', 'messaging_rules', 'Claims policy: approved claims only', 'Every factual or performance statement must match an approved claim in the library, word for word or with no added meaning.', ['Copy the approved wording from the claims library', 'Check the claim is approved and not expired before publishing', 'Carry the claim disclosure in the same asset'], ['Paraphrase a claim into something stronger', 'Use a claim marked under review or expired', 'Combine two claims into a new promise'], 'critical'],
    ['007', 'regulatory_standards', 'Required disclosures by channel', 'Where each mandatory disclosure must appear.', ['Instagram: put the claim footnote in the first three lines of the caption and on screen in Reels', 'Email: footnotes sit above the footer, at least 11px', 'Landing page: the supplement disclaimer sits in the footer and next to any benefit claim', 'Caffeine products: the warning appears wherever caffeine content is mentioned'], ['Hide disclosures behind "more" on Instagram', 'Put disclosures only in an image without alt text'], 'critical'],
    ['008', 'visual_identity', 'Visual and naming rules', 'How products and the brand are named and shown.', ['Write Apex ProWhey™ with the ™ on first mention', 'Use "Apex Nutrition" in full on first mention, "Apex" after', 'Use the approved product photography set only', 'Keep the logo clear space equal to the height of the A'], ['Show before and after body photos', 'Stretch, recolour or outline the logo', 'Use stock photos of syringes, pills or medical settings'], 'high'],
    ['009', 'dos_and_donts', 'Instagram rules', 'Captions, Reels and Stories.', ['Lead with the training moment, not the product', 'Use at most three hashtags, all brand or sport related', 'Tag paid partnerships with the platform paid partnership label'], ['Use transformation timelines like "in 30 days"', 'Use hashtags such as #fatburn or #steroids', 'Repost customer claims that are not in the library'], 'high'],
    ['010', 'dos_and_donts', 'Email rules', 'Newsletters and lifecycle email.', ['Keep subject lines factual: product, offer or training tip', 'Include unsubscribe and the company address in every send', 'Link every claim to the product page that carries its disclosure'], ['Use fake urgency like "last chance" when the offer is not ending', 'Use "RE:" or "FWD:" in subject lines', 'Put health claims in the subject line'], 'medium'],
    ['011', 'dos_and_donts', 'Landing page rules', 'Product and campaign pages.', ['Show the nutrition panel above the fold or one tap away', 'Place disclaimers next to the claim they qualify', 'Use customer reviews only with the verified buyer label'], ['Use countdown timers that reset', 'Show a rating that is more than 30 days old', 'Compare against named competitors'], 'high'],
  ],
  Z: [
    ['201', 'voice_and_tone', 'Voice and tone: precise, calm, engineer to engineer', 'Zenith sounds like a senior engineer explaining a trade-off. Specific numbers, plain words, no drama.', ['Lead with the concrete outcome, then the mechanism', 'Use numbers with their scope, e.g. "p50 latency in Q3 2026"', 'Prefer short sentences and active voice'], ['Fear-based security messaging ("you will be hacked")', 'Hype words like "revolutionary", "game-changing", "magic"', 'Exclamation marks in product copy'], 'high'],
    ['202', 'messaging_rules', 'Claims policy: approved claims only', 'Performance, uptime, security and cost statements must match an approved claim, including its plan and region limits.', ['Name the plan an SLA or feature applies to', 'Keep footnotes for averages and survey numbers', 'Check expiry before reusing a quarterly figure'], ['Round 99.95% up to "99.99%" or "five nines"', 'Turn a target into a guarantee', 'Quote customer results without the approved footnote'], 'critical'],
    ['203', 'prohibited_words', 'Prohibited language', 'Words that overstate security, availability or scale.', ['Use "encrypted with AES-256" instead of "military-grade"', 'Use "supports GDPR compliance" instead of "GDPR certified"'], ['"Unhackable", "bulletproof", "100% secure"', '"Never goes down", "100% uptime", "infinite scale"', '"Certified" for any standard we are not certified against'], 'critical'],
    ['204', 'regulatory_standards', 'Required disclosures by channel', 'Where SLA, pricing and survey disclosures must appear.', ['Landing page: link SLA terms next to any uptime figure', 'Email: pricing changes carry "may change with 30 days notice"', 'Instagram and LinkedIn: survey or average figures carry the footnote in the post text, not only the image', 'Ads: any price shows the billing period'], ['Show an uptime number with no plan named', 'Show a price without "per month" or "per year"'], 'critical'],
    ['205', 'visual_identity', 'Visual and naming rules', 'Product names, diagrams and screenshots.', ['Write "Zenith Cloud" on first mention, "Zenith" after', 'Use real console screenshots from the current release', 'Use the indigo palette and the approved architecture diagram style'], ['Use fake dashboards with invented numbers', 'Show third-party logos without written permission', 'Write "ZenithCloud" or "Zenith cloud"'], 'medium'],
    ['206', 'dos_and_donts', 'Instagram rules', 'Instagram is for engineering culture and launches, not hard selling.', ['Show the team, launch moments and short how-to clips', 'Keep claims to the approved list with footnotes in the caption'], ['Post uptime or security claims as memes', 'Use customer logos without permission'], 'medium'],
    ['207', 'dos_and_donts', 'Email rules', 'Product updates and nurture email.', ['Lead with what changed and who it affects', 'Link to the changelog or docs for details', 'Include unsubscribe and company address'], ['Use "urgent" or "action required" unless an account action is truly needed', 'Mention security incidents in marketing email'], 'high'],
    ['208', 'dos_and_donts', 'Landing page rules', 'Product, pricing and comparison pages.', ['Name plan limits next to each feature', 'Put SLA and refund terms one click from the claim', 'Date every benchmark or survey figure'], ['Compare against named competitors without a dated, reproducible benchmark', 'Hide the free tier limits'], 'high'],
  ],
  L: [
    ['102', 'voice_and_tone', 'Voice and tone: warm, honest, skin-first', 'Lumina talks like a knowledgeable friend: calm, kind and specific about what a product does and does not do.', ['Describe how skin looks and feels', 'Use plain ingredient names alongside the INCI name when helpful', 'Celebrate real skin, including texture'], ['Shame-based language about ageing or skin conditions', 'Medical language like "treats", "heals" or "cures"', 'Promise results for everyone'], 'high'],
    ['103', 'prohibited_words', 'Prohibited language', 'Words that make drug claims or unsupported safety claims.', ['Use "visibly reduces the look of" for appearance changes', 'Use "dermatologist tested" only with the patch test on file'], ['"Anti-aging", "reverses", "repairs", "heals", "cures"', '"Hypoallergenic", "non-toxic", "chemical-free"', '"Botox in a bottle" or any comparison to medical procedures'], 'critical'],
    ['104', 'regulatory_standards', 'Required disclosures by channel', 'Where study footnotes and product warnings must appear.', ['Instagram and TikTok: perception study footnote in the caption and on screen while the number shows', 'Product page: footnote directly under the claim, with panel size and duration', 'Email: footnote above the footer for any percentage', 'Sunscreen: full directions and warnings wherever SPF is mentioned'], ['Show a percentage without the panel size', 'Use SPF claims before the label review is approved'], 'critical'],
    ['105', 'visual_identity', 'Visual and naming rules', 'Photography, retouching and product names.', ['Write product names with the ™ on first mention, e.g. Lumina Glow Serum™', 'Show real skin texture; light colour correction only', 'Use the approved product photography set'], ['Retouch skin in before and after images', 'Use filters on results content', 'Show products next to medical tools'], 'critical'],
    ['106', 'dos_and_donts', 'Instagram and TikTok rules', 'Feed, Reels, Stories and creator content.', ['Creators disclose paid partnerships with the platform label', 'Show the product in real routines', 'Pin a comment with the study footnote on results posts'], ['Let creators make claims outside the approved list', 'Use "my acne is gone" style testimonials', 'Use trending audio that implies medical results'], 'high'],
    ['107', 'dos_and_donts', 'Email rules', 'Launches, routines and offers.', ['Keep subject lines about routines and products', 'Include unsubscribe and company address', 'Link claims to the product page with the full footnote'], ['Put percentages in subject lines', 'Use fake scarcity'], 'medium'],
    ['108', 'dos_and_donts', 'Product page rules', 'Product detail and landing pages.', ['List the full ingredient list one tap away', 'Show how to use, frequency and a patch test reminder', 'Show reviews with the verified buyer label'], ['Show review photos that have been edited', 'Claim results for skin conditions such as eczema or rosacea'], 'high'],
  ],
};
const gId = (s: string) => `00000000-0000-4000-g000-000000000${s}`;
export const LIB_GUIDELINES: BrandGuideline[] = (Object.keys(GUIDES) as B[]).flatMap((b) =>
  GUIDES[b].map(([s, category, title, description, dos, donts, sev]) => ({
    id: gId(s), organisation_id: ORG, brand_id: LIB_BRAND[b], category, title, description,
    rule_content: [...dos.map((d) => `Do: ${d}`), ...donts.map((d) => `Don't: ${d}`)].join('\n'),
    severity_level: sev, is_active: true, created_at: CREATED, updated_at: '2026-10-15T00:00:00.000Z',
  })));

// ---------------------------------------------------------------------------
// Terminology. Tuple: [id suffix, term, type, replacement, reason, where, severity]
// ---------------------------------------------------------------------------
type T = [string, string, TermType, string | null, string, string, 'critical' | 'high' | 'medium'];
const TERMS: Record<B, T[]> = {
  A: [
    ['205', 'magic bullet', 'prohibited', 'evidence-based formula', 'Sensational and cannot be substantiated.', 'All channels.', 'critical'],
    ['206', 'miracle', 'prohibited', 'carefully formulated', 'Reads as a cure claim.', 'All channels.', 'critical'],
    ['207', 'cure', 'prohibited', 'supports recovery', 'Supplements cannot claim to treat or cure any condition.', 'All channels.', 'critical'],
    ['208', 'detox', 'prohibited', 'part of a balanced diet', 'Implies a medical effect we cannot support.', 'All channels.', 'high'],
    ['209', 'fat burner', 'prohibited', 'supports your training', 'Weight loss claim with no approved evidence.', 'All channels.', 'critical'],
    ['210', 'anabolic', 'prohibited', 'supports muscle growth as part of training', 'Associated with steroids and banned substances.', 'All channels, including hashtags.', 'critical'],
    ['211', 'steroid alternative', 'prohibited', 'third-party tested sports nutrition', 'Drug comparison; high regulatory risk.', 'All channels.', 'critical'],
    ['212', 'guaranteed results', 'prohibited', 'results depend on training and diet', 'Guarantee language invites regulatory action.', 'All channels.', 'high'],
    ['213', 'clinically proven', 'restricted', 'studied', 'Only allowed with an approved clinical claim; CLM-APX-001 is still under review.', 'Use only alongside an approved clinical claim.', 'high'],
    ['214', 'doctor recommended', 'prohibited', 'trusted by athletes', 'No survey of doctors on file.', 'All channels.', 'high'],
    ['215', 'instant results', 'prohibited', 'fast-mixing', 'Timeframe we have no data for.', 'All channels.', 'high'],
    ['216', 'shred', 'prohibited', 'train with purpose', 'Implies rapid fat loss.', 'Instagram, TikTok, ads.', 'medium'],
    ['217', 'sugar free', 'prohibited', 'zero added sugar', 'Products contain naturally occurring lactose.', 'All channels.', 'high'],
    ['218', 'all natural', 'prohibited', 'no artificial sweeteners', 'Not defined and not true for every ingredient.', 'All channels.', 'medium'],
    ['219', 'boosts immunity', 'prohibited', null, 'Immune claims need authorised wording we do not hold.', 'All channels.', 'critical'],
    ['220', 'supports muscle recovery', 'preferred', null, 'Matches approved claim CLM-APX-023 with the balanced diet qualifier.', 'All channels.', 'medium'],
    ['221', 'zero added sugar', 'preferred', null, 'Matches approved claim CLM-APX-011.', 'All channels.', 'medium'],
    ['222', 'third-party tested', 'preferred', null, 'Accurate description of batch testing.', 'All channels.', 'medium'],
    ['223', 'per serving', 'preferred', null, 'Always state the serving with any nutrient amount.', 'All channels.', 'medium'],
  ],
  Z: [
    ['301', 'unhackable', 'prohibited', 'encrypted at rest and in transit', 'No system is unhackable; invites liability.', 'All channels.', 'critical'],
    ['302', 'military-grade encryption', 'prohibited', 'AES-256 encryption', 'Vague and overused; name the standard instead.', 'All channels.', 'high'],
    ['303', '100% uptime', 'prohibited', '99.95% uptime SLA on Business plans', 'Contradicts our SLA terms.', 'All channels.', 'critical'],
    ['304', 'guaranteed uptime', 'prohibited', 'uptime SLA with service credits', 'The SLA offers credits, not a guarantee.', 'All channels.', 'critical'],
    ['305', 'never goes down', 'prohibited', 'multi-region failover', 'Absolute availability claim we cannot support.', 'All channels.', 'critical'],
    ['306', 'bank-level security', 'prohibited', 'independently audited security controls', 'Undefined comparison.', 'All channels.', 'high'],
    ['307', 'GDPR certified', 'prohibited', 'supports GDPR compliance', 'There is no general GDPR certification we hold.', 'All channels.', 'critical'],
    ['308', 'HIPAA certified', 'prohibited', 'HIPAA-eligible services', 'There is no HIPAA certification; use eligibility wording.', 'All channels.', 'critical'],
    ['309', 'infinite scale', 'prohibited', 'autoscaling', 'Every plan has limits.', 'All channels.', 'high'],
    ['310', 'zero latency', 'prohibited', 'low latency', 'Physically impossible.', 'All channels.', 'high'],
    ['311', 'best-in-class', 'prohibited', null, 'Unsupported superiority claim; state the specific number.', 'All channels.', 'medium'],
    ['312', 'free forever', 'prohibited', 'free tier', 'Free tier limits can change with notice.', 'All channels.', 'high'],
    ['313', 'carbon neutral', 'prohibited', 'carbon-aware scheduling', 'No offset programme or audit on file.', 'All channels.', 'critical'],
    ['314', 'set and forget', 'prohibited', 'managed', 'Customers still own their workloads and configuration.', 'All channels.', 'medium'],
    ['315', 'enterprise-grade', 'restricted', null, 'Use only next to a named Enterprise plan feature.', 'Landing page and sales collateral.', 'medium'],
    ['316', 'cheapest cloud', 'prohibited', 'predictable pricing', 'Price comparisons need a dated benchmark.', 'All channels.', 'high'],
    ['317', 'managed Kubernetes', 'preferred', null, 'Accurate product category name.', 'All channels.', 'medium'],
    ['318', 'Zenith Cloud', 'trademark', 'Zenith Cloud', 'Brand name: two words, both capitalised. "Zenith" alone after first mention.', 'All channels.', 'medium'],
    ['319', 'service level agreement (SLA)', 'preferred', null, 'Spell out on first mention, then SLA.', 'All channels.', 'medium'],
    ['320', 'p50 latency', 'preferred', null, 'Say which percentile a latency figure is.', 'Landing page, email, LinkedIn.', 'medium'],
    ['321', 'supports compliance with', 'preferred', null, 'Correct framing: customers stay responsible for their own compliance.', 'All channels.', 'medium'],
  ],
  L: [
    ['103', 'anti-aging', 'prohibited', 'visibly reduces the look of fine lines', 'Implies changing how skin ages: a drug-style claim.', 'All channels.', 'critical'],
    ['104', 'cures acne', 'prohibited', 'helps skin look clearer', 'Treating acne is a drug claim.', 'All channels.', 'critical'],
    ['105', 'heals', 'prohibited', 'soothes the feel of', 'Healing is a medical claim.', 'All channels.', 'critical'],
    ['106', 'repairs skin', 'prohibited', 'helps skin feel smoother', 'Structural change to skin is a drug claim.', 'All channels.', 'critical'],
    ['107', 'removes wrinkles', 'prohibited', 'reduces the look of wrinkles', 'Overstates a cosmetic effect.', 'All channels.', 'critical'],
    ['108', 'botox in a bottle', 'prohibited', null, 'Comparison to a medical procedure.', 'All channels.', 'critical'],
    ['109', 'chemical-free', 'prohibited', 'free from parabens, sulfates and mineral oil', 'Everything is made of chemicals; misleading.', 'All channels.', 'high'],
    ['110', 'non-toxic', 'prohibited', 'gentle enough for daily use', 'Implies other products are toxic; no standard.', 'All channels.', 'high'],
    ['111', 'clean beauty', 'restricted', null, 'Undefined; use only with the specific free-from list.', 'Instagram and product page.', 'medium'],
    ['112', 'safe for all skin types', 'prohibited', 'suitable for sensitive skin', 'Cannot be proven for every person.', 'All channels.', 'high'],
    ['113', 'collagen boosting', 'prohibited', 'skin looks firmer', 'Biological claim we have no data for.', 'All channels.', 'critical'],
    ['114', 'detoxifies', 'prohibited', 'cleanses', 'Skin detox is not a supported cosmetic effect.', 'All channels.', 'high'],
    ['115', 'medical-grade', 'prohibited', null, 'Lumina sells cosmetics, not medical products.', 'All channels.', 'critical'],
    ['116', 'cruelty free', 'restricted', 'not tested on animals', 'Use the approved wording unless a licensed logo is approved.', 'All channels.', 'medium'],
    ['117', 'clinically proven', 'restricted', 'tested', 'Only with an approved study claim and its footnote.', 'All channels.', 'high'],
    ['118', 'visibly', 'preferred', null, 'Keeps appearance claims cosmetic.', 'All channels.', 'medium'],
    ['119', 'dermatologist tested', 'preferred', null, 'Matches approved claim CLM-LUM-002.', 'All channels.', 'medium'],
    ['120', 'fragrance-free', 'preferred', null, 'Matches approved claim CLM-LUM-005.', 'All channels.', 'medium'],
    ['121', 'skin feels', 'preferred', null, 'Sensory wording is safe and honest.', 'All channels.', 'medium'],
    ['122', 'Lumina Glow Serum™', 'trademark', 'Lumina Glow Serum™', 'Product trademark: include ™ on first mention.', 'All channels.', 'medium'],
  ],
};
/** Severity for every built-in term (BrandTerm has no severity column). */
export const TERM_SEVERITY: Record<string, 'critical' | 'high' | 'medium'> = {};
const tId = (s: string) => `00000000-0000-4000-t000-000000000${s}`;
export const LIB_TERMS: BrandTerm[] = (Object.keys(TERMS) as B[]).flatMap((b) =>
  TERMS[b].map(([s, term, term_type, replacement, rationale, context_rules, sev]) => {
    TERM_SEVERITY[tId(s)] = sev;
    return { id: tId(s), organisation_id: ORG, brand_id: LIB_BRAND[b], term, term_type, replacement, rationale, context_rules, created_at: CREATED, updated_at: CREATED };
  }));

// ---------------------------------------------------------------------------
// Assets (records only, no binaries) and documents.
// ---------------------------------------------------------------------------
type A = [string, string, AssetType, string, number, string, Record<string, unknown>];
const ASSETS: Record<B, A[]> = {
  A: [
    ['204', 'ProWhey™ approved product photography set', 'packaging', 'image/jpeg', 18_400_000, 'apex-prowhey-photo-set.zip', { description: '12 approved shots of the 1kg and 2kg tubs: front, three-quarter, scoop pour and gym bench scenes. Natural light, no people.', usage: 'Instagram, email headers, landing page hero.', restrictions: 'No body or transformation imagery may be composited in.' }],
    ['205', 'Pre-Workout and Electrolyte pack shots', 'packaging', 'image/png', 9_200_000, 'apex-preworkout-electrolyte-packs.zip', { description: 'Transparent-background pack shots for the Pre-Workout tub and Electrolyte stick box.', usage: 'All channels.', restrictions: 'Caffeine warning must accompany any Pre-Workout image with benefit copy.' }],
    ['206', 'Apex colour palette', 'color_palette', 'application/json', 2_400, 'apex-palette.json', { description: 'Primary blue #0284c7, graphite #1f2937, chalk #f8fafc, accent lime #a3e635 for highlights only.', usage: 'All channels.', contrast: 'Body text must meet 4.5:1.' }],
    ['207', 'Logo usage rules', 'logo', 'application/pdf', 1_100_000, 'apex-logo-usage.pdf', { description: 'Clear space, minimum size (24px digital, 15mm print), approved backgrounds and misuse examples.', usage: 'All channels.' }],
  ],
  Z: [
    ['301', 'Zenith logo and wordmark usage', 'logo', 'application/pdf', 980_000, 'zenith-logo-usage.pdf', { description: 'Mark, wordmark and lockups with clear space and minimum sizes. Indigo, white and black versions only.', usage: 'All channels.' }],
    ['302', 'Console screenshot library, release 26.10', 'banner', 'image/png', 24_600_000, 'zenith-console-26-10.zip', { description: '30 approved screenshots of the current console with demo data only. No real customer names.', usage: 'Landing pages, docs, LinkedIn.', restrictions: 'Replace when the console release changes.' }],
    ['303', 'Zenith colour palette', 'color_palette', 'application/json', 2_100, 'zenith-palette.json', { description: 'Indigo #6366f1, midnight #0f172a, slate #64748b, white. Status colours reserved for product UI.', usage: 'All channels.' }],
    ['304', 'Architecture diagram kit', 'banner', 'image/svg+xml', 640_000, 'zenith-diagram-kit.svg', { description: 'Approved icons and line styles for region, cluster and network diagrams.', usage: 'Landing pages, sales decks, docs.' }],
  ],
  L: [
    ['101', 'Lumina logo usage rules', 'logo', 'application/pdf', 1_050_000, 'lumina-logo-usage.pdf', { description: 'Wordmark clear space, minimum size and approved backgrounds (blush, white, charcoal).', usage: 'All channels.' }],
    ['102', 'Glow Serum™ and Hydra Serum product photography', 'packaging', 'image/jpeg', 21_300_000, 'lumina-serum-photo-set.zip', { description: '16 approved shots: bottles on stone, dropper texture close-ups and hands applying the serum. No face retouching.', usage: 'Instagram, TikTok, product pages, email.', restrictions: 'No before and after pairs.' }],
    ['103', 'Cleanser texture and routine shots', 'packaging', 'image/jpeg', 12_800_000, 'lumina-cleanser-routine.zip', { description: 'Lather close-ups and bathroom routine scenes with real skin texture visible.', usage: 'All channels.' }],
    ['104', 'Lumina colour palette and type', 'color_palette', 'application/json', 2_300, 'lumina-palette.json', { description: 'Rose #db2777, blush #fce7f3, charcoal #1f2937, cream #fffbeb. Headlines in a serif, body in a clean sans.', usage: 'All channels.' }],
    ['105', 'Study footnote overlay', 'disclaimer_block', 'image/png', 140_000, 'lumina-footnote-overlay.png', { description: 'On-screen footnote template for Reels and TikTok showing panel size and duration.', usage: 'Instagram, TikTok.', min_display: 'Visible for as long as the claim is on screen.' }],
  ],
};
const aId = (s: string) => `00000000-0000-4000-ast0-000000000${s}`;
export const LIB_ASSETS: BrandAsset[] = (Object.keys(ASSETS) as B[]).flatMap((b) =>
  ASSETS[b].map(([s, name, asset_type, mime_type, size, file, metadata]) => ({
    id: aId(s), organisation_id: ORG, brand_id: LIB_BRAND[b], name, asset_type, mime_type, file_size_bytes: size,
    file_url: `https://storage.uideas.digital/assets/${file}`, metadata, created_at: CREATED, updated_at: CREATED,
  })));

type D = [string, string, FileType, number, string];
const DOCS: Record<B, D[]> = {
  A: [
    ['204', 'Apex batch testing records Q3 2026.pdf', 'pdf', 2_300_000, 'Release test results for every Q3 batch: protein, amino acids, heavy metals and banned substance screening. Backs CLM-APX-003, 008, 009 and 016.'],
    ['205', 'Apex customer taste survey Aug 2026.csv', 'csv', 180_000, 'Raw responses from 412 subscribers. Backs CLM-APX-012. Respondents were self-selected.'],
    ['206', 'Apex regulatory wording memo 2026.docx', 'docx', 96_000, 'Internal memo approving the protein, creatine and recovery wording, with required qualifiers.'],
  ],
  Z: [
    ['301', 'Zenith brand book 2026.pdf', 'pdf', 7_800_000, 'Voice, naming, colour, diagrams and screenshot rules for all Zenith marketing.'],
    ['302', 'Zenith Q3 2026 latency and reliability report.pdf', 'pdf', 1_400_000, 'p50 and p99 latency by region, upgrade outcomes and restore drills. Backs CLM-ZEN-004, 008 and 015.'],
    ['303', 'Zenith SLA and refund terms legal memo.docx', 'docx', 84_000, 'Internal legal review of Business and Enterprise SLA wording and the annual plan refund terms.'],
  ],
  L: [
    ['101', 'Lumina brand book 2026.pdf', 'pdf', 9_100_000, 'Voice, cosmetic claim rules, photography and retouching policy, product naming.'],
    ['102', 'Lumina consumer perception study Jun 2026.pdf', 'pdf', 2_100_000, '104 participants, 4 weeks. Backs CLM-LUM-004 and 022.'],
    ['103', 'Lumina patch and use test reports 2026.pdf', 'pdf', 3_400_000, 'Patch test on 50 sensitive skin participants and daily use tolerance results. Backs CLM-LUM-002, 010 and 024.'],
  ],
};
const dId = (s: string) => `00000000-0000-4000-doc0-000000000${s}`;
/** Summary shown in the asset detail view (Document has no description column). */
export const DOC_SUMMARY: Record<string, string> = {
  '00000000-0000-4000-doc0-000000000001': 'Internal summary of the post-exercise protein study behind CLM-APX-001. Full report pending review.',
  '00000000-0000-4000-doc0-000000000002': 'Apex brand book: tone, claims, disclosures and logo rules.',
  '00000000-0000-4000-doc0-000000000003': 'Annual security audit report, shared with customers under NDA. Backs CLM-ZEN-002.',
};
export const LIB_DOCUMENTS: Document[] = (Object.keys(DOCS) as B[]).flatMap((b) =>
  DOCS[b].map(([s, title, file_type, size, summary]) => {
    DOC_SUMMARY[dId(s)] = summary;
    return {
      id: dId(s), organisation_id: ORG, brand_id: LIB_BRAND[b], title, file_type, file_size_bytes: size,
      file_url: `https://storage.uideas.digital/documents/${title.toLowerCase().replace(/[^a-z0-9.]+/g, '-')}`,
      status: 'indexed' as const, uploaded_by: ANALYST, created_at: CREATED, updated_at: CREATED,
    };
  }));
