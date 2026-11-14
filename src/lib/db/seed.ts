/**
 * Inkloom AI - Production Seed Data
 * Mirrors UI specifications exactly:
 * - Organisation: 'Uideas Digital Workspace'
 * - Active Brand: 'Apex Nutrition' + 'Zenith Cloud SaaS'
 * - Current User: 'Daksh Agrawal' (Admin)
 * - Team Members: 'Creator S.' (Creator), 'Demo Reviewer' (Reviewer), 'Analyst R.' (Brand Manager)
 * - 8+ Verified Claims with Clinical Evidence (including 2+ expiring claims)
 * - 6 Documents & Brand Assets
 * - 5 Submissions including 'Q4 Campaign – Reel Script' with 3 distinct findings and revisions
 * - Approval queues, audit logs, and notification feeds
 */

import {
  InkloomDatabaseState,
  Organisation,
  UserProfile,
  OrganisationMember,
  Brand,
  BrandMember,
  BrandGuideline,
  GuidelineVersion,
  ApprovedClaim,
  ClaimEvidence,
  BrandTerm,
  BrandAsset,
  Document,
  DocumentExtraction,
  Submission,
  SubmissionVersion,
  AnalysisRun,
  Finding,
  FindingEvidence,
  SuggestedRevision,
  ApprovalRequest,
  ApprovalDecision,
  Comment,
  Dispute,
  AuditEvent,
  Notification,
} from './types';

// ============================================================================
// CONSTANT IDENTIFIERS (Deterministic UUIDs)
// ============================================================================

export const SEED_IDS = {
  ORGANISATION_UIDEAS: '00000000-0000-4000-a000-000000000001',

  USER_DAKSH: '00000000-0000-4000-a000-000000000010', // Admin & Current User
  USER_RIDDHI: '00000000-0000-4000-a000-000000000011', // Creator
  USER_LAKSH: '00000000-0000-4000-a000-000000000012', // Reviewer
  USER_MANSOOR: '00000000-0000-4000-a000-000000000013', // Brand Manager

  BRAND_APEX: '00000000-0000-4000-b000-000000000001', // Active Brand
  BRAND_ZENITH: '00000000-0000-4000-b000-000000000002',

  // Submissions
  SUB_REEL_SCRIPT: '00000000-0000-4000-c000-000000000001',
  SUB_INSTAGRAM_POST: '00000000-0000-4000-c000-000000000002',
  SUB_WEBSITE_BANNER: '00000000-0000-4000-c000-000000000003',
  SUB_LINKEDIN_UPDATE: '00000000-0000-4000-c000-000000000004',
  SUB_AD_CREATIVE: '00000000-0000-4000-c000-000000000005',

  // Analysis Run for Reel Script
  ANALYSIS_RUN_REEL: '00000000-0000-4000-d000-000000000001',

  // Findings for Reel Script
  FINDING_UNSUPPORTED_1: '00000000-0000-4000-e000-000000000001',
  FINDING_PROHIBITED_2: '00000000-0000-4000-e000-000000000002',
  FINDING_DISCLOSURE_3: '00000000-0000-4000-e000-000000000003',
};

// ============================================================================
// 1. ORGANISATIONS
// ============================================================================

export const seedOrganisations: Organisation[] = [
  {
    id: SEED_IDS.ORGANISATION_UIDEAS,
    name: 'Uideas Digital Workspace',
    slug: 'uideas-digital',
    plan: 'enterprise',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
    settings: {
      enforce_approval_chain: true,
      ai_guardrails_enabled: true,
      default_tone_check: true,
      allowed_domains: ['uideas.digital'],
    },
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
];

// ============================================================================
// 2. USER PROFILES
// ============================================================================

export const seedUsers: UserProfile[] = [
  {
    id: SEED_IDS.USER_DAKSH,
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    email: 'daksh@uideas.digital',
    full_name: 'Daksh Agrawal',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
    role: 'admin',
    job_title: 'Head of Growth & Compliance Architect',
    preferences: {
      notifications_email: true,
      notifications_in_app: true,
      theme: 'system',
    },
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
  {
    id: SEED_IDS.USER_RIDDHI,
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    email: 'creator@demo.adsnitch',
    full_name: 'Creator S.',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&auto=format&fit=crop&q=80',
    role: 'creator',
    job_title: 'Senior Content Producer & Copywriter',
    preferences: {
      notifications_email: true,
      notifications_in_app: true,
      theme: 'system',
    },
    created_at: '2026-01-15T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
  {
    id: SEED_IDS.USER_LAKSH,
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    email: 'reviewer@demo.adsnitch',
    full_name: 'Demo Reviewer',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80',
    role: 'reviewer',
    job_title: 'Lead Legal & Regulatory Reviewer',
    preferences: {
      notifications_email: true,
      notifications_in_app: true,
      theme: 'system',
    },
    created_at: '2026-02-01T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
  {
    id: SEED_IDS.USER_MANSOOR,
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    email: 'analyst@demo.adsnitch',
    full_name: 'Analyst R.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&auto=format&fit=crop&q=80',
    role: 'brand_manager',
    job_title: 'VP of Brand Governance',
    preferences: {
      notifications_email: true,
      notifications_in_app: true,
      theme: 'system',
    },
    created_at: '2026-02-10T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
];

// ============================================================================
// 3. ORGANISATION MEMBERS
// ============================================================================

export const seedOrganisationMembers: OrganisationMember[] = [
  {
    id: '00000000-0000-4000-a001-000000000001',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    user_id: SEED_IDS.USER_DAKSH,
    role: 'admin',
    joined_at: '2026-01-01T00:00:00.000Z',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-a001-000000000002',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    user_id: SEED_IDS.USER_RIDDHI,
    role: 'creator',
    joined_at: '2026-01-15T00:00:00.000Z',
    created_at: '2026-01-15T00:00:00.000Z',
    updated_at: '2026-01-15T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-a001-000000000003',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    user_id: SEED_IDS.USER_LAKSH,
    role: 'reviewer',
    joined_at: '2026-02-01T00:00:00.000Z',
    created_at: '2026-02-01T00:00:00.000Z',
    updated_at: '2026-02-01T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-a001-000000000004',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    user_id: SEED_IDS.USER_MANSOOR,
    role: 'brand_manager',
    joined_at: '2026-02-10T00:00:00.000Z',
    created_at: '2026-02-10T00:00:00.000Z',
    updated_at: '2026-02-10T00:00:00.000Z',
  },
];

// ============================================================================
// 4. BRANDS
// ============================================================================

export const seedBrands: Brand[] = [
  {
    id: SEED_IDS.BRAND_APEX,
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    name: 'Apex Nutrition',
    slug: 'apex-nutrition',
    industry: 'Sports Nutrition & Performance Supplements',
    description: 'Elite clinical sports nutrition engineered for maximum bioavailability, lean mass accretion, and rapid glycogen synthesis.',
    logo_url: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=128&auto=format&fit=crop&q=80',
    website_url: 'https://apexnutrition.example.com',
    is_active: true,
    compliance_threshold: 88.0,
    settings: {
      auto_flag_unsubstantiated: true,
      strict_prohibited_terms: true,
      require_clinical_doi: true,
      primary_color: '#0284c7',
    },
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
  {
    id: SEED_IDS.BRAND_ZENITH,
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    name: 'Zenith Cloud SaaS',
    slug: 'zenith-cloud',
    industry: 'B2B Enterprise Cloud Infrastructure',
    description: 'High-availability Kubernetes and distributed edge database cloud with end-to-end SOC-2 Type II encryption.',
    logo_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=128&auto=format&fit=crop&q=80',
    website_url: 'https://zenithcloud.example.io',
    is_active: true,
    compliance_threshold: 92.0,
    settings: {
      auto_flag_unsubstantiated: true,
      strict_prohibited_terms: true,
      require_clinical_doi: false,
      primary_color: '#6366f1',
    },
    created_at: '2026-02-01T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
];

// ============================================================================
// 5. BRAND MEMBERS
// ============================================================================

export const seedBrandMembers: BrandMember[] = [
  {
    id: '00000000-0000-4000-b001-000000000001',
    brand_id: SEED_IDS.BRAND_APEX,
    user_id: SEED_IDS.USER_MANSOOR,
    role: 'brand_manager',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-b001-000000000002',
    brand_id: SEED_IDS.BRAND_APEX,
    user_id: SEED_IDS.USER_LAKSH,
    role: 'reviewer',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-b001-000000000003',
    brand_id: SEED_IDS.BRAND_APEX,
    user_id: SEED_IDS.USER_RIDDHI,
    role: 'creator',
    created_at: '2026-01-15T00:00:00.000Z',
    updated_at: '2026-01-15T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-b001-000000000004',
    brand_id: SEED_IDS.BRAND_ZENITH,
    user_id: SEED_IDS.USER_DAKSH,
    role: 'brand_manager',
    created_at: '2026-02-01T00:00:00.000Z',
    updated_at: '2026-02-01T00:00:00.000Z',
  },
];

// ============================================================================
// 6. BRAND GUIDELINES
// ============================================================================

export const seedBrandGuidelines: BrandGuideline[] = [
  {
    id: '00000000-0000-4000-g000-000000000001',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    category: 'voice_and_tone',
    title: 'Scientific, Authoritative & Grounded Tone',
    description: 'Apex Nutrition speaks with clinical authority, precision, and athletic motivation. We never resort to sensationalism or exaggerated bro-science.',
    rule_content: 'All product copy must sound like an elite sports scientist talking to a dedicated athlete. Avoid hype phrases, exclamation-mark inflation, or miracle guarantees. Emphasize bioavailability, verified purity tests, and sustainable physiological adaptations.',
    severity_level: 'high',
    is_active: true,
    created_at: '2026-01-05T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-g000-000000000002',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    category: 'messaging_rules',
    title: 'Mandatory Clinical Citations & Asterisk Disclosures',
    description: 'Any numerical percentage improvement or physiological claim must reference an approved clinical trial ID and include the disclaimer asterisk.',
    rule_content: 'Whenever a claim like "42% increased protein synthesis" or "14.3% VO2 max boost" is stated, the sentence must carry an asterisk (*) corresponding to a bottom-of-screen or caption footnote: "*Based on randomized, double-blind clinical trial CT-8842 conducted over 8 weeks on trained athletes."',
    severity_level: 'critical',
    is_active: true,
    created_at: '2026-01-05T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-g000-000000000003',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    category: 'dos_and_donts',
    title: "Do's and Don'ts: Body Transformations & Timelines",
    description: 'Strict guidelines on timeframe promises, arbitrary weight gain/loss, and comparison against competitors.',
    rule_content: "DO: Emphasize micro-filtered whey isolate, rapid leucine kinetic absorption, Informed-Sport certification, and natural fermentation. DON'T: Never guarantee a specific number of pounds gained or lost (e.g. '10 lbs of muscle in 14 days'), never promise results without dietary adherence, and never claim superiority over unnamed competitor products without direct head-to-head published data.",
    severity_level: 'critical',
    is_active: true,
    created_at: '2026-01-05T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-g000-000000000004',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    category: 'prohibited_words',
    title: 'Prohibited Vocabulary Blacklist',
    description: 'Blacklist of forbidden slang, medical overreach terms, and unscientific buzzwords.',
    rule_content: "The following terms are banned in all creative assets, scripts, and captions: 'cheat code', 'miracle workout formula', 'miracle cure', '100% risk free', 'magic powder', 'melt fat effortlessly', 'anabolic loophole', 'cure', 'prevent disease'. Violations will trigger automated rejection in review.",
    severity_level: 'high',
    is_active: true,
    created_at: '2026-01-05T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-g000-000000000005',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    category: 'regulatory_standards',
    title: 'FDA DSHEA Disclaimer Requirements',
    description: 'Statutory compliance requirements for dietary supplements under DSHEA 1994.',
    rule_content: "All landing pages, print packaging, digital carousels, and long-form video ads must incorporate the standard DSHEA notice: 'These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.'",
    severity_level: 'critical',
    is_active: true,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
];

// ============================================================================
// 7. GUIDELINE VERSIONS
// ============================================================================

export const seedGuidelineVersions: GuidelineVersion[] = [
  {
    id: '00000000-0000-4000-g001-000000000001',
    guideline_id: '00000000-0000-4000-g000-000000000001',
    version_number: 1,
    title: 'Scientific, Authoritative & Grounded Tone v1.0',
    rule_content: 'Initial tone and voice definition for Apex Nutrition Q1 release.',
    changelog: 'Initial baseline guidelines established by Analyst R.',
    created_by: SEED_IDS.USER_MANSOOR,
    created_at: '2026-01-05T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-g001-000000000002',
    guideline_id: '00000000-0000-4000-g000-000000000004',
    version_number: 2,
    title: 'Prohibited Vocabulary Blacklist v2.1',
    rule_content: "Expanded prohibited words to include 'cheat code' and 'anabolic loophole' following TikTok influencer compliance audit.",
    changelog: 'Added social media buzzwords prohibited by legal team.',
    created_by: SEED_IDS.USER_LAKSH,
    created_at: '2026-03-12T00:00:00.000Z',
  },
];

// ============================================================================
// 8. APPROVED CLAIMS (8+ verified, including 2+ expiring soon)
// Current Date Reference: November 2026
// ============================================================================

export const seedApprovedClaims: ApprovedClaim[] = [
  {
    id: '00000000-0000-4000-clm0-000000000001',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    claim_code: 'CLM-APX-001',
    claim_text: 'Clinically proven to increase post-exercise muscle protein synthesis by 42% within 60 minutes post-ingestion.',
    category: 'efficacy',
    status: 'approved',
    permitted_context: 'Approved for reel scripts, Meta ads, landing page hero, and product label front. Must feature CT-8842 footnote.',
    restricted_context: 'Never state that it yields 42% more total muscle mass over time; specify muscle protein synthesis (MPS) rate.',
    required_disclosures: '*Based on a double-blind, placebo-controlled clinical trial of 120 resistance-trained adults over 8 weeks (Study CT-8842).',
    expires_at: '2027-06-30T00:00:00.000Z',
    verified_by: SEED_IDS.USER_LAKSH,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-clm0-000000000002',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    claim_code: 'CLM-APX-002',
    claim_text: 'Provides 5.8g of Branched-Chain Amino Acids (BCAAs) per 25g scoop with a verified 2:1:1 leucine-to-isoleucine-valine ratio.',
    category: 'sourcing',
    status: 'approved',
    permitted_context: 'Allowed across all packaging, nutritional tables, video overlays, and social banners.',
    restricted_context: 'Cannot state BCAAs replace complete dietary protein.',
    required_disclosures: 'Verified through batch HPLC chromatography testing.',
    expires_at: '2027-12-31T00:00:00.000Z',
    verified_by: SEED_IDS.USER_LAKSH,
    created_at: '2026-01-12T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-clm0-000000000003',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    claim_code: 'CLM-APX-003',
    claim_text: '100% Informed-Sport certified, tested for over 250 WADA-prohibited substances and heavy metal residues.',
    category: 'certifications',
    status: 'approved',
    permitted_context: 'Approved for Olympic and collegiate athlete marketing, retail endcaps, and sport sponsorships.',
    restricted_context: 'Must display the official Informed-Sport badge alongside batch lookup QR code.',
    required_disclosures: 'Certificate #IS-2025-99812 valid through current batch cycle.',
    expires_at: '2026-11-25T00:00:00.000Z', // EXPIRING SOON! (17 days)
    verified_by: SEED_IDS.USER_LAKSH,
    created_at: '2025-11-25T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-clm0-000000000004',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    claim_code: 'CLM-APX-004',
    claim_text: 'Increases peak VO2 max output and time-to-exhaustion by 14.3% in trained endurance athletes when taken 45 minutes pre-training.',
    category: 'performance',
    status: 'approved',
    permitted_context: 'Permitted in endurance campaign reels, athlete testimonials, and technical whitepapers.',
    restricted_context: 'Do not claim cardiovascular disease prevention or treatment.',
    required_disclosures: '*Results observed in cycling ergometer endurance protocol study APX-VO2-2025.',
    expires_at: '2026-12-05T00:00:00.000Z', // EXPIRING SOON! (27 days)
    verified_by: SEED_IDS.USER_LAKSH,
    created_at: '2025-12-05T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-clm0-000000000005',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    claim_code: 'CLM-APX-005',
    claim_text: 'Ultra-pure 99.8% micronized creatine monohydrate with 200-mesh particle sizing for complete solubility and zero gastric distress.',
    category: 'efficacy',
    status: 'approved',
    permitted_context: 'All marketing channels, social captions, retail display collateral.',
    restricted_context: 'Do not compare negatively against generic creatine without citing mesh micronization data.',
    required_disclosures: 'Solubility tested in 250ml water at 20°C.',
    expires_at: '2027-09-15T00:00:00.000Z',
    verified_by: SEED_IDS.USER_MANSOOR,
    created_at: '2026-02-15T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-clm0-000000000006',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    claim_code: 'CLM-APX-006',
    claim_text: 'Manufactured in an FDA-registered, cGMP certified facility with zero artificial sweeteners, dyes, or gums.',
    category: 'safety',
    status: 'approved',
    permitted_context: 'Product label back, website purity FAQ, influencer talking points.',
    restricted_context: 'FDA registration does not imply FDA approval of the finished dietary supplement product.',
    required_disclosures: 'Facility audit cert cGMP-9001-USA.',
    expires_at: '2028-01-01T00:00:00.000Z',
    verified_by: SEED_IDS.USER_LAKSH,
    created_at: '2026-03-01T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-clm0-000000000007',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_ZENITH,
    claim_code: 'CLM-ZEN-001',
    claim_text: '99.999% cloud platform uptime Service Level Agreement with automated multi-region automated failover under 400ms.',
    category: 'performance',
    status: 'approved',
    permitted_context: 'Enterprise sales decks, website hero, RFP responses, customer case studies.',
    restricted_context: 'Applies strictly to Enterprise Tier contracts with multi-region deployment enabled.',
    required_disclosures: 'Subject to Zenith Enterprise SLA Terms of Service.',
    expires_at: '2027-04-10T00:00:00.000Z',
    verified_by: SEED_IDS.USER_DAKSH,
    created_at: '2026-02-10T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-clm0-000000000008',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_ZENITH,
    claim_code: 'CLM-ZEN-002',
    claim_text: 'Independently audited SOC 2 Type II and HIPAA compliant infrastructure with zero critical findings.',
    category: 'certifications',
    status: 'approved',
    permitted_context: 'All enterprise marketing, security trust center, partner collateral.',
    restricted_context: 'Must offer access to the full redacted audit report via signed NDA.',
    required_disclosures: 'Audit conducted by Schellman & Company LLP.',
    expires_at: '2026-11-30T00:00:00.000Z', // EXPIRING SOON! (22 days)
    verified_by: SEED_IDS.USER_DAKSH,
    created_at: '2025-11-30T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-clm0-000000000009',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    claim_code: 'CLM-APX-007',
    claim_text: 'Cold micro-filtration retains 98.4% of native immuno-globulins and lactoferrin proteins compared to heat-pasteurized isolates.',
    category: 'sourcing',
    status: 'approved',
    permitted_context: 'Packaging educational callouts, long-form blog articles, and physician outreach.',
    restricted_context: 'Do not claim immune-boosting disease defense.',
    required_disclosures: 'Lab electrophoresis analysis report APX-BIO-44.',
    expires_at: '2027-08-20T00:00:00.000Z',
    verified_by: SEED_IDS.USER_LAKSH,
    created_at: '2026-02-20T00:00:00.000Z',
    updated_at: '2026-11-08T12:00:00.000Z',
  },
];

// ============================================================================
// 9. CLAIM EVIDENCE
// ============================================================================

export const seedClaimEvidence: ClaimEvidence[] = [
  {
    id: '00000000-0000-4000-ev00-000000000001',
    claim_id: '00000000-0000-4000-clm0-000000000001',
    title: 'Randomized Double-Blind Trial: Leucine Kinetics & MPS Post-Resistance Exercise',
    citation: 'Journal of Applied Physiology & Sports Nutrition, Vol. 48, Iss. 4, pp. 312-329 (2025), DOI: 10.1152/japplphysiol.00412.2025',
    excerpt: 'Participants receiving the Apex ProWhey micro-filtered formulation demonstrated a 42.1 ± 3.4% elevation in fractional synthetic rate (FSR) of muscle protein synthesis at 60 minutes versus standard whey concentrate (p < 0.01).',
    study_url: 'https://doi.org/10.1152/japplphysiol.00412.2025',
    evidence_type: 'clinical_trial',
    confidence_score: 0.98,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-10T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-ev00-000000000002',
    claim_id: '00000000-0000-4000-clm0-000000000003',
    title: 'Informed-Sport Anti-Doping Laboratory Certificate of Analysis',
    citation: 'LGC Sport and Specialised Analytical Services, Ref #IS-2025-99812-C',
    excerpt: 'Batch sample #APX-2025-B4 tested via ISO 17025 accredited gas/liquid chromatography and found non-detectable for all 250+ prohibited substances listed in the WADA 2026 Prohibited List.',
    study_url: 'https://www.informed-sport.com/certified-substance/apex-nutrition-batch-99812',
    evidence_type: 'lab_report',
    confidence_score: 0.99,
    created_at: '2025-11-25T00:00:00.000Z',
    updated_at: '2025-11-25T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-ev00-000000000003',
    claim_id: '00000000-0000-4000-clm0-000000000004',
    title: 'Endurance Performance & Ergogenic Threshold Assessment in Cyclists',
    citation: 'European Journal of Sports Science, 2025 Oct; 25(8): 940-951',
    excerpt: 'Apex PeakVO2 supplementation demonstrated an increase of 14.3% in sustained power output at ventilatory threshold 2 over 8 weeks of supervised high-intensity interval training (HIIT).',
    study_url: 'https://doi.org/10.1080/17461391.2025.184912',
    evidence_type: 'clinical_trial',
    confidence_score: 0.96,
    created_at: '2025-12-05T00:00:00.000Z',
    updated_at: '2025-12-05T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-ev00-000000000004',
    claim_id: '00000000-0000-4000-clm0-000000000008',
    title: 'Zenith Cloud SOC 2 Type II Examination Report 2025-2026',
    citation: 'Schellman & Company Audit Report ID #SCH-ZEN-2025-T2',
    excerpt: 'The system description and controls operated effectively throughout the period from Dec 1, 2024 to Nov 30, 2025 meeting the Trust Services Criteria for Security, Availability, and Confidentiality.',
    study_url: 'https://trust.zenithcloud.example.io/soc2-2025.pdf',
    evidence_type: 'iso_cert',
    confidence_score: 1.0,
    created_at: '2025-11-30T00:00:00.000Z',
    updated_at: '2025-11-30T00:00:00.000Z',
  },
];

// ============================================================================
// 10. BRAND TERMS
// ============================================================================

export const seedBrandTerms: BrandTerm[] = [
  {
    id: '00000000-0000-4000-t000-000000000001',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    term: 'miracle cure',
    term_type: 'prohibited',
    replacement: 'clinically formulated performance nutrition',
    rationale: 'Regulatory violation under FTC 16 CFR § 255 and FDA statutory health claim regulations.',
    context_rules: 'Prohibited in all media, scripts, captions, hashtags, and email newsletters.',
    created_at: '2026-01-05T00:00:00.000Z',
    updated_at: '2026-01-05T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-t000-000000000002',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    term: 'cheat code',
    term_type: 'prohibited',
    replacement: 'performance catalyst / science-backed recovery formulation',
    rationale: 'Implies dishonest athletic shortcut and clashes with Apex authoritative scientific brand tone.',
    context_rules: 'Strictly prohibited across short-form video hooks and paid social ads.',
    created_at: '2026-03-12T00:00:00.000Z',
    updated_at: '2026-03-12T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-t000-000000000003',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    term: '100% risk free',
    term_type: 'prohibited',
    replacement: 'backed by our 30-day athlete satisfaction guarantee',
    rationale: 'Misleading consumer warranty claim that triggers automated FTC scrutiny.',
    context_rules: 'Forbidden in ad headlines and call-to-action buttons.',
    created_at: '2026-01-05T00:00:00.000Z',
    updated_at: '2026-01-05T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-t000-000000000004',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    term: 'Apex ProWhey™',
    term_type: 'trademark',
    replacement: 'Apex ProWhey™',
    rationale: 'Registered brand trademark. Must always include the trademark symbol (™) on first mention in any copy.',
    context_rules: 'Always capitalize correctly with the ™ superscript glyph.',
    created_at: '2026-01-05T00:00:00.000Z',
    updated_at: '2026-01-05T00:00:00.000Z',
  },
];

// ============================================================================
// 11. BRAND ASSETS & DOCUMENTS (6 total items)
// ============================================================================

export const seedDocuments: Document[] = [
  {
    id: '00000000-0000-4000-doc0-000000000001',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    title: 'Apex Clinical Study Report CT-8842 (MPS Kinetics).pdf',
    file_type: 'pdf',
    file_url: 'https://storage.uideas.digital/documents/apex-clinical-ct8842.pdf',
    file_size_bytes: 4182900,
    status: 'indexed',
    uploaded_by: SEED_IDS.USER_DAKSH,
    created_at: '2026-01-10T00:00:00.000Z',
    updated_at: '2026-01-10T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-doc0-000000000002',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    title: 'Apex Brand Identity & Legal Compliance Guide Q4.pdf',
    file_type: 'pdf',
    file_url: 'https://storage.uideas.digital/documents/apex-brand-guide-q4.pdf',
    file_size_bytes: 8412000,
    status: 'indexed',
    uploaded_by: SEED_IDS.USER_MANSOOR,
    created_at: '2026-01-12T00:00:00.000Z',
    updated_at: '2026-01-12T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-doc0-000000000003',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_ZENITH,
    title: 'Zenith Cloud - SOC 2 Type II Security Assessment 2026.pdf',
    file_type: 'pdf',
    file_url: 'https://storage.uideas.digital/documents/zenith-soc2-audit-2026.pdf',
    file_size_bytes: 2845000,
    status: 'indexed',
    uploaded_by: SEED_IDS.USER_DAKSH,
    created_at: '2026-02-05T00:00:00.000Z',
    updated_at: '2026-02-05T00:00:00.000Z',
  },
];

export const seedBrandAssets: BrandAsset[] = [
  {
    id: '00000000-0000-4000-ast0-000000000001',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    name: 'Apex Nutrition Primary Vector Logo & Badges',
    asset_type: 'logo',
    file_url: 'https://storage.uideas.digital/assets/apex-primary-logo.svg',
    file_size_bytes: 48920,
    mime_type: 'image/svg+xml',
    metadata: {
      resolution: 'vector',
      aspect_ratio: '3:1',
      variants: ['dark', 'light', 'monochrome'],
    },
    created_at: '2026-01-05T00:00:00.000Z',
    updated_at: '2026-01-05T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-ast0-000000000002',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    name: 'Mandatory FDA DSHEA Disclaimer Footer Overlay',
    asset_type: 'disclaimer_block',
    file_url: 'https://storage.uideas.digital/assets/fda-dshea-footer-lockup.png',
    file_size_bytes: 182400,
    mime_type: 'image/png',
    metadata: {
      min_font_size: '10pt',
      contrast_ratio: '7.1:1',
      placement: 'bottom_pinned',
    },
    created_at: '2026-01-08T00:00:00.000Z',
    updated_at: '2026-01-08T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-ast0-000000000003',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_ZENITH,
    name: 'Zenith SOC 2 & Zero-Trust Trust Seals Pack',
    asset_type: 'banner',
    file_url: 'https://storage.uideas.digital/assets/zenith-trust-badges.svg',
    file_size_bytes: 92300,
    mime_type: 'image/svg+xml',
    metadata: {
      compliance_years: [2025, 2026],
      audit_firm: 'Schellman',
    },
    created_at: '2026-02-15T00:00:00.000Z',
    updated_at: '2026-02-15T00:00:00.000Z',
  },
];

// Document extractions for RAG search
export const seedDocumentExtractions: DocumentExtraction[] = [
  {
    id: '00000000-0000-4000-ext0-000000000001',
    document_id: '00000000-0000-4000-doc0-000000000001',
    chunk_index: 0,
    chunk_content: 'Study CT-8842 protocol demonstrated that whey microfiltration preserved 98.4% of native immuno-globulins while producing 42.1% faster circulating leucine peaks compared to conventional ion-exchange methods.',
    metadata: {
      page_number: 4,
      section: 'Pharmacokinetics & Leucine Kinetics',
      keywords: ['protein synthesis', 'leucine', 'bioavailability', 'CT-8842'],
    },
    created_at: '2026-01-10T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-ext0-000000000002',
    document_id: '00000000-0000-4000-doc0-000000000002',
    chunk_index: 0,
    chunk_content: 'Apex Brand Voice guidelines mandate that creators never use hyperbolic slang such as cheat code or promise absolute weight transformations in fixed day intervals.',
    metadata: {
      page_number: 12,
      section: 'Section 3.4 - Prohibited Claims & Disclaimers',
      keywords: ['prohibited words', 'cheat code', 'compliance', 'FTC'],
    },
    created_at: '2026-01-12T00:00:00.000Z',
  },
];

// ============================================================================
// 12. SUBMISSIONS (5 total items matching UI reference)
// ============================================================================

export const seedSubmissions: Submission[] = [
  // 1. Q4 Campaign – Reel Script (needs review / under_review, 3 issues)
  {
    id: SEED_IDS.SUB_REEL_SCRIPT,
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    title: 'Q4 Campaign – Reel Script',
    submission_type: 'reel_script',
    status: 'under_review',
    creator_id: SEED_IDS.USER_RIDDHI,
    assigned_reviewer_id: SEED_IDS.USER_LAKSH,
    raw_content: `[00:00 - 00:03] Hook:
Creator holds up Apex ProWhey™ tub directly in front of camera in gym locker room.
Creator: "Stop wasting money on chalky protein that does nothing!"

[00:04 - 00:08] The Claim:
Creator: "Guaranteed to pack on 10 lbs of pure muscle in just 14 days without changing your diet!"
B-roll cuts to high-intensity deadlift session with energetic heavy rock beat.

[00:09 - 00:15] The Pitch:
Creator: "This is literally the ultimate cheat code and a miracle workout formula."
Creator scoops powder into clear shaker cup showing ultra-fast dissolvability.

[00:16 - 00:23] Scientific Callout:
Creator: "It increases protein synthesis by 42% faster than any other brand on Earth."
Overlaid text: "42% FASTER MUSCLE GROWTH".

[00:24 - 00:30] Call to Action:
Creator drinks shaker: "Hit the link in my bio to get 20% off Apex ProWhey™ before stock runs out!"`,
    current_version_number: 1,
    metadata: {
      campaign: 'Q4 Performance Surge',
      target_channels: ['Instagram Reels', 'TikTok', 'YouTube Shorts'],
      target_launch_date: '2026-11-20',
      flagged_issues_count: 3,
    },
    created_at: '2026-11-07T09:30:00.000Z',
    updated_at: '2026-11-08T11:45:00.000Z',
  },

  // 2. Product Launch - Instagram Post (approved)
  {
    id: SEED_IDS.SUB_INSTAGRAM_POST,
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    title: 'Product Launch - Instagram Post',
    submission_type: 'social_post',
    status: 'approved',
    creator_id: SEED_IDS.USER_RIDDHI,
    assigned_reviewer_id: SEED_IDS.USER_LAKSH,
    raw_content: `Pure science. No compromises. 🔬

Meet the all-new Apex ProWhey™ Cold-Filtered Isolate.
Delivering 25g of pure protein and 5.8g of BCAAs per scoop, verified by independent 3rd-party batch chromatography.

Certified Informed-Sport free of banned substances.

*Based on randomized double-blind clinical trial CT-8842.
#ApexNutrition #SportsNutrition #InformedSport #PerformanceNutrition`,
    current_version_number: 2,
    metadata: {
      campaign: 'Fall Product Expansion',
      target_channels: ['Instagram Feed'],
      target_launch_date: '2026-11-10',
    },
    created_at: '2026-11-01T14:00:00.000Z',
    updated_at: '2026-11-04T16:20:00.000Z',
  },

  // 3. Website Banner - V2 (changes requested)
  {
    id: SEED_IDS.SUB_WEBSITE_BANNER,
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    title: 'Website Banner - V2',
    submission_type: 'banner_copy',
    status: 'changes_requested',
    creator_id: SEED_IDS.USER_RIDDHI,
    assigned_reviewer_id: SEED_IDS.USER_MANSOOR,
    raw_content: `HERO BANNER HEADLINE:
The #1 Muscle Builder on the Market — 100% Risk Free Trial!

SUBHEAD:
Get your first month of Apex ProWhey™ with zero risk and start gaining immediately.`,
    current_version_number: 2,
    metadata: {
      campaign: 'Direct-to-Consumer Homepage Refresh',
      target_channels: ['Website Hero'],
      target_launch_date: '2026-11-15',
    },
    created_at: '2026-11-03T11:15:00.000Z',
    updated_at: '2026-11-06T15:30:00.000Z',
  },

  // 4. LinkedIn – Product Update (pending review)
  {
    id: SEED_IDS.SUB_LINKEDIN_UPDATE,
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_ZENITH,
    title: 'LinkedIn – Product Update',
    submission_type: 'social_post',
    status: 'submitted',
    creator_id: SEED_IDS.USER_RIDDHI,
    assigned_reviewer_id: SEED_IDS.USER_LAKSH,
    raw_content: `Delighted to announce that Zenith Cloud has officially completed its SOC 2 Type II re-certification with zero exceptions.

Our enterprise cloud SLA now guarantees 99.999% uptime with sub-400ms cross-region automated failover for mission-critical Kubernetes workloads.

Read the executive security brief on our Trust Center.
#CloudInfrastructure #SOC2 #Kubernetes #EnterpriseTech`,
    current_version_number: 1,
    metadata: {
      campaign: 'Zenith Security Trust Campaign',
      target_channels: ['LinkedIn Org Page'],
      target_launch_date: '2026-11-18',
    },
    created_at: '2026-11-07T14:10:00.000Z',
    updated_at: '2026-11-07T14:10:00.000Z',
  },

  // 5. Ad Creative – V2 (pending review)
  {
    id: SEED_IDS.SUB_AD_CREATIVE,
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    title: 'Ad Creative – V2',
    submission_type: 'video_ad',
    status: 'submitted',
    creator_id: SEED_IDS.USER_RIDDHI,
    assigned_reviewer_id: SEED_IDS.USER_DAKSH,
    raw_content: `VIDEO AD COPY:
Fuel your recovery with clinical precision. Apex ProWhey™ provides 42% faster muscle protein synthesis* backed by randomized double-blind sports medicine trials.

Informed-Sport certified. Zero banned substances. Zero artificial fillers.
Shop today with free express shipping on orders over $50.

*Referencing clinical trial CT-8842.`,
    current_version_number: 1,
    metadata: {
      campaign: 'Q4 Black Friday Warmup',
      target_channels: ['Meta Video Ads', 'YouTube In-Stream'],
      target_launch_date: '2026-11-22',
    },
    created_at: '2026-11-08T08:00:00.000Z',
    updated_at: '2026-11-08T08:00:00.000Z',
  },
];

// ============================================================================
// 13. SUBMISSION VERSIONS
// ============================================================================

export const seedSubmissionVersions: SubmissionVersion[] = [
  {
    id: '00000000-0000-4000-ver0-000000000001',
    submission_id: SEED_IDS.SUB_REEL_SCRIPT,
    version_number: 1,
    content: seedSubmissions[0].raw_content,
    change_summary: 'Initial draft submitted by Creator S. for compliance analysis.',
    created_by: SEED_IDS.USER_RIDDHI,
    created_at: '2026-11-07T09:30:00.000Z',
  },
  {
    id: '00000000-0000-4000-ver0-000000000002',
    submission_id: SEED_IDS.SUB_INSTAGRAM_POST,
    version_number: 1,
    content: 'Initial unapproved copy without clinical asterisk.',
    change_summary: 'Initial draft',
    created_by: SEED_IDS.USER_RIDDHI,
    created_at: '2026-11-01T14:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-ver0-000000000003',
    submission_id: SEED_IDS.SUB_INSTAGRAM_POST,
    version_number: 2,
    content: seedSubmissions[1].raw_content,
    change_summary: 'Added mandatory CT-8842 disclaimer asterisk and Informed-Sport badge citation.',
    created_by: SEED_IDS.USER_RIDDHI,
    created_at: '2026-11-04T11:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-ver0-000000000004',
    submission_id: SEED_IDS.SUB_WEBSITE_BANNER,
    version_number: 1,
    content: 'The #1 Miracle Supplement on the Market - 100% Free Forever!',
    change_summary: 'V1 Banner draft',
    created_by: SEED_IDS.USER_RIDDHI,
    created_at: '2026-11-03T11:15:00.000Z',
  },
  {
    id: '00000000-0000-4000-ver0-000000000005',
    submission_id: SEED_IDS.SUB_WEBSITE_BANNER,
    version_number: 2,
    content: seedSubmissions[2].raw_content,
    change_summary: 'Removed miracle supplement, but kept 100% Risk Free which remains non-compliant.',
    created_by: SEED_IDS.USER_RIDDHI,
    created_at: '2026-11-06T15:30:00.000Z',
  },
];

// ============================================================================
// 14. ANALYSIS RUNS
// ============================================================================

export const seedAnalysisRuns: AnalysisRun[] = [
  {
    id: SEED_IDS.ANALYSIS_RUN_REEL,
    submission_id: SEED_IDS.SUB_REEL_SCRIPT,
    submission_version_id: '00000000-0000-4000-ver0-000000000001',
    triggered_by: SEED_IDS.USER_DAKSH,
    status: 'completed',
    overall_score: 64.0,
    compliance_rating: 'warning',
    summary: 'Automated scan detected 3 compliance violations: 1 Critical (Unsubstantiated 14-day muscle gain promise), 1 High (Prohibited buzzwords: cheat code, miracle workout formula), and 1 Medium (Missing mandatory clinical footnote disclosure and unsubstantiated comparative superiority).',
    issues_count: 3,
    critical_issues_count: 1,
    run_duration_ms: 1180,
    model_used: 'inkloom-governance-engine-v2.4',
    created_at: '2026-11-07T09:31:00.000Z',
    completed_at: '2026-11-07T09:31:01.180Z',
  },
];

// ============================================================================
// 15. FINDINGS (Matching the 3 issues on 'Q4 Campaign – Reel Script')
// ============================================================================

export const seedFindings: Finding[] = [
  // Issue 1: Critical - Unsupported claim
  {
    id: SEED_IDS.FINDING_UNSUPPORTED_1,
    analysis_run_id: SEED_IDS.ANALYSIS_RUN_REEL,
    submission_id: SEED_IDS.SUB_REEL_SCRIPT,
    category: 'unsupported_claim',
    severity: 'critical',
    title: 'Unsubstantiated Rate of Muscle Gain Claim',
    description: 'Promising "10 lbs of pure muscle in just 14 days without changing your diet" directly violates FTC 16 CFR § 255 and Apex Brand Guideline #3. Physiological hypertrophy cannot produce 10 lbs of contractile tissue in 14 days, and diet disclaimer is absent.',
    highlighted_snippet: 'Guaranteed to pack on 10 lbs of pure muscle in just 14 days without changing your diet!',
    line_number_start: 6,
    line_number_end: 7,
    character_start: 172,
    character_end: 251,
    rule_ref: 'GUIDE-DONT-01 / FTC-16-CFR-255',
    status: 'open',
    created_at: '2026-11-07T09:31:01.000Z',
    updated_at: '2026-11-08T11:45:00.000Z',
  },

  // Issue 2: High - Prohibited terms
  {
    id: SEED_IDS.FINDING_PROHIBITED_2,
    analysis_run_id: SEED_IDS.ANALYSIS_RUN_REEL,
    submission_id: SEED_IDS.SUB_REEL_SCRIPT,
    category: 'prohibited_term',
    severity: 'high',
    title: "Prohibited Brand Vocabulary ('cheat code', 'miracle workout formula')",
    description: 'The phrases "cheat code" and "miracle workout formula" are on the strict brand blacklist. Apex maintains an authoritative clinical voice and never utilizes sensationalist slang.',
    highlighted_snippet: 'This is literally the ultimate cheat code and a miracle workout formula.',
    line_number_start: 10,
    line_number_end: 11,
    character_start: 350,
    character_end: 421,
    rule_ref: 'BRAND-TERM-PROHIB-01 / GUIDE-TONE-04',
    status: 'open',
    created_at: '2026-11-07T09:31:01.000Z',
    updated_at: '2026-11-08T11:45:00.000Z',
  },

  // Issue 3: Medium - Missing disclosure & Comparative superiority
  {
    id: SEED_IDS.FINDING_DISCLOSURE_3,
    analysis_run_id: SEED_IDS.ANALYSIS_RUN_REEL,
    submission_id: SEED_IDS.SUB_REEL_SCRIPT,
    category: 'missing_disclosure',
    severity: 'medium',
    title: 'Missing Clinical Study Asterisk & Comparative Claim Without Substantiation',
    description: 'Claiming "increases protein synthesis by 42% faster than any other brand on Earth" requires the mandatory clinical asterisk footnote referencing Study CT-8842, and the comparative phrase "faster than any other brand on Earth" is unsupported by multi-brand lab trials.',
    highlighted_snippet: 'It increases protein synthesis by 42% faster than any other brand on Earth.',
    line_number_start: 15,
    line_number_end: 16,
    character_start: 520,
    character_end: 596,
    rule_ref: 'CLM-APX-001 / REG-DISC-02',
    status: 'open',
    created_at: '2026-11-07T09:31:01.000Z',
    updated_at: '2026-11-08T11:45:00.000Z',
  },
];

// ============================================================================
// 16. FINDING EVIDENCE
// ============================================================================

export const seedFindingEvidence: FindingEvidence[] = [
  {
    id: '00000000-0000-4000-fe00-000000000001',
    finding_id: SEED_IDS.FINDING_UNSUPPORTED_1,
    guideline_id: '00000000-0000-4000-g000-000000000003',
    citation: "Apex Do's and Don'ts: Rule 3.2 (Prohibited Gain Claims)",
    excerpt: "DON'T: Never guarantee a specific number of pounds gained or lost (e.g. '10 lbs of muscle in 14 days'), and never promise results without dietary adherence.",
    confidence_score: 0.99,
    match_type: 'direct_contradiction',
    created_at: '2026-11-07T09:31:01.000Z',
  },
  {
    id: '00000000-0000-4000-fe00-000000000002',
    finding_id: SEED_IDS.FINDING_PROHIBITED_2,
    guideline_id: '00000000-0000-4000-g000-000000000004',
    citation: 'Apex Prohibited Terms Blacklist (Rev 2.1)',
    excerpt: "The following terms are banned in all creative assets: 'cheat code', 'miracle workout formula', 'miracle cure', '100% risk free'.",
    confidence_score: 1.0,
    match_type: 'forbidden_vocabulary',
    created_at: '2026-11-07T09:31:01.000Z',
  },
  {
    id: '00000000-0000-4000-fe00-000000000003',
    finding_id: SEED_IDS.FINDING_DISCLOSURE_3,
    claim_id: '00000000-0000-4000-clm0-000000000001',
    citation: 'Approved Claim CLM-APX-001 (Protein Synthesis Rate)',
    excerpt: 'Mandatory Disclosure: *Based on a double-blind, placebo-controlled clinical trial of 120 resistance-trained adults over 8 weeks (Study CT-8842). Never state it yields 42% faster than unnamed market competitors.',
    confidence_score: 0.95,
    match_type: 'missing_qualifier',
    created_at: '2026-11-07T09:31:01.000Z',
  },
];

// ============================================================================
// 17. SUGGESTED REVISIONS (Matching the 3 issues)
// ============================================================================

export const seedSuggestedRevisions: SuggestedRevision[] = [
  // Revision for Finding 1
  {
    id: '00000000-0000-4000-rev0-000000000001',
    finding_id: SEED_IDS.FINDING_UNSUPPORTED_1,
    original_text: 'Guaranteed to pack on 10 lbs of pure muscle in just 14 days without changing your diet!',
    suggested_text: 'Clinically shown to support accelerated lean muscle recovery and protein synthesis when paired with your resistance training regimen.*',
    explanation: 'Substitutes an unscientific 14-day 10 lb gain promise with approved clinical language compliant with Study CT-8842 and FTC guidance.',
    status: 'suggested',
    applied_by: null,
    applied_at: null,
    created_at: '2026-11-07T09:31:01.000Z',
  },

  // Revision for Finding 2
  {
    id: '00000000-0000-4000-rev0-000000000002',
    finding_id: SEED_IDS.FINDING_PROHIBITED_2,
    original_text: 'This is literally the ultimate cheat code and a miracle workout formula.',
    suggested_text: 'This is the gold standard in sports nutrition, engineered with micro-filtered whey isolate for maximum bioavailability.',
    explanation: 'Eliminates prohibited slang words ("cheat code", "miracle") while reinforcing the brand’s clinical and authoritative voice.',
    status: 'suggested',
    applied_by: null,
    applied_at: null,
    created_at: '2026-11-07T09:31:01.000Z',
  },

  // Revision for Finding 3
  {
    id: '00000000-0000-4000-rev0-000000000003',
    finding_id: SEED_IDS.FINDING_DISCLOSURE_3,
    original_text: 'It increases protein synthesis by 42% faster than any other brand on Earth.',
    suggested_text: 'It increases post-exercise muscle protein synthesis by up to 42%* (*Referencing 8-week clinical trial CT-8842 vs standard whey concentrate).',
    explanation: 'Attaches the statutory clinical footnote and eliminates unsubstantiated sweeping competitive superiority language.',
    status: 'suggested',
    applied_by: null,
    applied_at: null,
    created_at: '2026-11-07T09:31:01.000Z',
  },
];

// ============================================================================
// 18. APPROVAL REQUESTS & DECISIONS
// ============================================================================

export const seedApprovalRequests: ApprovalRequest[] = [
  {
    id: '00000000-0000-4000-app0-000000000001',
    submission_id: SEED_IDS.SUB_REEL_SCRIPT,
    requested_by: SEED_IDS.USER_RIDDHI,
    target_reviewer_id: SEED_IDS.USER_LAKSH,
    status: 'pending',
    notes: 'Please review Q4 Reel Script. 3 compliance findings need resolution before recording.',
    due_date: '2026-11-12T18:00:00.000Z',
    created_at: '2026-11-07T09:35:00.000Z',
    updated_at: '2026-11-07T09:35:00.000Z',
  },
  {
    id: '00000000-0000-4000-app0-000000000002',
    submission_id: SEED_IDS.SUB_INSTAGRAM_POST,
    requested_by: SEED_IDS.USER_RIDDHI,
    target_reviewer_id: SEED_IDS.USER_LAKSH,
    status: 'approved',
    notes: 'V2 includes CT-8842 footnote and Informed-Sport badge.',
    due_date: '2026-11-05T18:00:00.000Z',
    created_at: '2026-11-04T11:05:00.000Z',
    updated_at: '2026-11-04T16:20:00.000Z',
  },
  {
    id: '00000000-0000-4000-app0-000000000003',
    submission_id: SEED_IDS.SUB_WEBSITE_BANNER,
    requested_by: SEED_IDS.USER_RIDDHI,
    target_reviewer_id: SEED_IDS.USER_MANSOOR,
    status: 'changes_requested',
    notes: 'Homepage hero copy for review.',
    due_date: '2026-11-08T18:00:00.000Z',
    created_at: '2026-11-06T15:35:00.000Z',
    updated_at: '2026-11-06T17:10:00.000Z',
  },
  {
    id: '00000000-0000-4000-app0-000000000004',
    submission_id: SEED_IDS.SUB_LINKEDIN_UPDATE,
    requested_by: SEED_IDS.USER_RIDDHI,
    target_reviewer_id: SEED_IDS.USER_LAKSH,
    status: 'pending',
    notes: 'Zenith SOC-2 security announcement copy.',
    due_date: '2026-11-14T18:00:00.000Z',
    created_at: '2026-11-07T14:15:00.000Z',
    updated_at: '2026-11-07T14:15:00.000Z',
  },
  {
    id: '00000000-0000-4000-app0-000000000005',
    submission_id: SEED_IDS.SUB_AD_CREATIVE,
    requested_by: SEED_IDS.USER_RIDDHI,
    target_reviewer_id: SEED_IDS.USER_DAKSH,
    status: 'pending',
    notes: 'Pre-sale video ad copy for Black Friday surge.',
    due_date: '2026-11-15T18:00:00.000Z',
    created_at: '2026-11-08T08:05:00.000Z',
    updated_at: '2026-11-08T08:05:00.000Z',
  },
];

export const seedApprovalDecisions: ApprovalDecision[] = [
  {
    id: '00000000-0000-4000-dec0-000000000001',
    request_id: '00000000-0000-4000-app0-000000000002',
    submission_id: SEED_IDS.SUB_INSTAGRAM_POST,
    decided_by: SEED_IDS.USER_LAKSH,
    decision: 'approved',
    comments: 'Verified against CLM-APX-001 and CLM-APX-003. Proper footnote present. Approved for release.',
    conditions: 'Ensure high-res Informed-Sport vector seal is used on graphic.',
    decided_at: '2026-11-04T16:20:00.000Z',
  },
  {
    id: '00000000-0000-4000-dec0-000000000002',
    request_id: '00000000-0000-4000-app0-000000000003',
    submission_id: SEED_IDS.SUB_WEBSITE_BANNER,
    decided_by: SEED_IDS.USER_MANSOOR,
    decision: 'changes_requested',
    comments: 'Headline contains "100% Risk Free" which violates brand policy TERM-PROHIB-03. Change to "30-Day Athlete Satisfaction Guarantee".',
    conditions: 'Replace prohibited risk-free wording and resubmit.',
    decided_at: '2026-11-06T17:10:00.000Z',
  },
];

// ============================================================================
// 19. COMMENTS & DISPUTES
// ============================================================================

export const seedComments: Comment[] = [
  {
    id: '00000000-0000-4000-cmt0-000000000001',
    submission_id: SEED_IDS.SUB_REEL_SCRIPT,
    finding_id: SEED_IDS.FINDING_UNSUPPORTED_1,
    author_id: SEED_IDS.USER_LAKSH,
    parent_comment_id: null,
    content: 'Creator, please accept the AI suggested revision on the 14-day muscle gain claim. The FTC has been aggressively issuing warning letters on timeframe muscle promises.',
    is_internal_only: false,
    created_at: '2026-11-07T10:15:00.000Z',
    updated_at: '2026-11-07T10:15:00.000Z',
  },
  {
    id: '00000000-0000-4000-cmt0-000000000002',
    submission_id: SEED_IDS.SUB_REEL_SCRIPT,
    finding_id: SEED_IDS.FINDING_UNSUPPORTED_1,
    author_id: SEED_IDS.USER_RIDDHI,
    parent_comment_id: '00000000-0000-4000-cmt0-000000000001',
    content: 'Understood Reviewer! I will adopt the revised copy and add the CT-8842 footnote to the on-screen graphics overlay.',
    is_internal_only: false,
    created_at: '2026-11-07T11:20:00.000Z',
    updated_at: '2026-11-07T11:20:00.000Z',
  },
];

export const seedDisputes: Dispute[] = [
  {
    id: '00000000-0000-4000-dsp0-000000000001',
    finding_id: SEED_IDS.FINDING_PROHIBITED_2,
    raised_by: SEED_IDS.USER_RIDDHI,
    reason: 'Can we keep "performance catalyst" instead of "gold standard" to appeal better to our Gen-Z gym community?',
    creator_evidence: 'Competitor brands use "performance catalyst" in verified Meta ad campaigns without FDA warning letters.',
    status: 'open',
    resolved_by: null,
    resolution_notes: null,
    resolved_at: null,
    created_at: '2026-11-07T11:25:00.000Z',
    updated_at: '2026-11-07T11:25:00.000Z',
  },
];

// ============================================================================
// 20. AUDIT EVENTS
// ============================================================================

export const seedAuditEvents: AuditEvent[] = [
  {
    id: '00000000-0000-4000-aud0-000000000001',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    user_id: SEED_IDS.USER_DAKSH,
    entity_type: 'claim',
    entity_id: '00000000-0000-4000-clm0-000000000001',
    action: 'created',
    ip_address: '192.168.1.100',
    metadata: {
      claim_code: 'CLM-APX-001',
      title: 'Muscle Protein Synthesis 42%',
    },
    created_at: '2026-01-10T10:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-aud0-000000000002',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    user_id: SEED_IDS.USER_RIDDHI,
    entity_type: 'submission',
    entity_id: SEED_IDS.SUB_REEL_SCRIPT,
    action: 'created',
    ip_address: '192.168.1.105',
    metadata: {
      title: 'Q4 Campaign – Reel Script',
      version: 1,
    },
    created_at: '2026-11-07T09:30:00.000Z',
  },
  {
    id: '00000000-0000-4000-aud0-000000000003',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    user_id: SEED_IDS.USER_DAKSH,
    entity_type: 'analysis_run',
    entity_id: SEED_IDS.ANALYSIS_RUN_REEL,
    action: 'analyzed',
    ip_address: '192.168.1.100',
    metadata: {
      score: 64.0,
      violations_detected: 3,
    },
    created_at: '2026-11-07T09:31:01.000Z',
  },
  {
    id: '00000000-0000-4000-aud0-000000000004',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    brand_id: SEED_IDS.BRAND_APEX,
    user_id: SEED_IDS.USER_MANSOOR,
    entity_type: 'approval',
    entity_id: '00000000-0000-4000-app0-000000000003',
    action: 'rejected',
    ip_address: '192.168.1.108',
    metadata: {
      submission: 'Website Banner - V2',
      decision: 'changes_requested',
    },
    created_at: '2026-11-06T17:10:00.000Z',
  },
];

// ============================================================================
// 21. NOTIFICATIONS
// ============================================================================

export const seedNotifications: Notification[] = [
  {
    id: '00000000-0000-4000-not0-000000000001',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    user_id: SEED_IDS.USER_DAKSH,
    title: 'Claim Expiring in 17 Days',
    message: 'Approved claim CLM-APX-003 ("Informed-Sport Certified") expires on Nov 25, 2026. Review re-certification docs.',
    notification_type: 'claim_expiring',
    link_url: '/claims/CLM-APX-003',
    is_read: false,
    read_at: null,
    created_at: '2026-11-08T08:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-not0-000000000002',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    user_id: SEED_IDS.USER_LAKSH,
    title: 'Review Assigned: Q4 Campaign – Reel Script',
    message: 'Creator S. assigned you to review Q4 Campaign – Reel Script. 3 compliance flags require action.',
    notification_type: 'review_assigned',
    link_url: '/submissions/00000000-0000-4000-c000-000000000001',
    is_read: false,
    read_at: null,
    created_at: '2026-11-07T09:35:00.000Z',
  },
  {
    id: '00000000-0000-4000-not0-000000000003',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    user_id: SEED_IDS.USER_RIDDHI,
    title: 'Changes Requested: Website Banner - V2',
    message: 'Analyst R. requested changes on Website Banner - V2: Replace "100% Risk Free" with approved satisfaction guarantee.',
    notification_type: 'changes_requested',
    link_url: '/submissions/00000000-0000-4000-c000-000000000003',
    is_read: true,
    read_at: '2026-11-06T17:30:00.000Z',
    created_at: '2026-11-06T17:10:00.000Z',
  },
  {
    id: '00000000-0000-4000-not0-000000000004',
    organisation_id: SEED_IDS.ORGANISATION_UIDEAS,
    user_id: SEED_IDS.USER_DAKSH,
    title: 'AI Scan Completed: Q4 Campaign – Reel Script',
    message: 'Scan finished with Compliance Score 64.0 (Warning). 1 Critical, 1 High, and 1 Medium issues flagged.',
    notification_type: 'analysis_completed',
    link_url: '/submissions/00000000-0000-4000-c000-000000000001',
    is_read: false,
    read_at: null,
    created_at: '2026-11-07T09:31:02.000Z',
  },
];

// ============================================================================
// COMPLETE DATABASE STATE SEED OBJECT
// ============================================================================

export function createInitialSeedState(): InkloomDatabaseState {
  return {
    organisations: JSON.parse(JSON.stringify(seedOrganisations)),
    user_profiles: JSON.parse(JSON.stringify(seedUsers)),
    organisation_members: JSON.parse(JSON.stringify(seedOrganisationMembers)),
    brands: JSON.parse(JSON.stringify(seedBrands)),
    brand_members: JSON.parse(JSON.stringify(seedBrandMembers)),
    brand_guidelines: JSON.parse(JSON.stringify(seedBrandGuidelines)),
    guideline_versions: JSON.parse(JSON.stringify(seedGuidelineVersions)),
    approved_claims: JSON.parse(JSON.stringify(seedApprovedClaims)),
    claim_evidence: JSON.parse(JSON.stringify(seedClaimEvidence)),
    brand_terms: JSON.parse(JSON.stringify(seedBrandTerms)),
    brand_assets: JSON.parse(JSON.stringify(seedBrandAssets)),
    documents: JSON.parse(JSON.stringify(seedDocuments)),
    document_extractions: JSON.parse(JSON.stringify(seedDocumentExtractions)),
    submissions: JSON.parse(JSON.stringify(seedSubmissions)),
    submission_versions: JSON.parse(JSON.stringify(seedSubmissionVersions)),
    analysis_runs: JSON.parse(JSON.stringify(seedAnalysisRuns)),
    findings: JSON.parse(JSON.stringify(seedFindings)),
    finding_evidence: JSON.parse(JSON.stringify(seedFindingEvidence)),
    suggested_revisions: JSON.parse(JSON.stringify(seedSuggestedRevisions)),
    approval_requests: JSON.parse(JSON.stringify(seedApprovalRequests)),
    approval_decisions: JSON.parse(JSON.stringify(seedApprovalDecisions)),
    comments: JSON.parse(JSON.stringify(seedComments)),
    disputes: JSON.parse(JSON.stringify(seedDisputes)),
    audit_events: JSON.parse(JSON.stringify(seedAuditEvents)),
    notifications: JSON.parse(JSON.stringify(seedNotifications)),
  };
}
