/**
 * Inkloom AI Brand Governance Engine - Core Type Definitions
 * 
 * Defines standard schemas for content segmentation, claims detection,
 * deterministic rule checks, scoped multi-tenant retrieval, Gemini 2.5 Flash
 * structured prompt input/output, governance findings, and review summaries.
 */

// ============================================================================
// Severities, Confidence & Categories
// ============================================================================

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type FindingCategory =
  | 'unsupported_claim'
  | 'time_bound_claim'
  | 'tone_inconsistency'
  | 'prohibited_term'
  | 'missing_disclosure'
  | 'out_of_scope'
  | 'factual_conflict'
  | 'readability';

export type ContentChannel =
  | 'social_media'
  | 'email'
  | 'landing_page'
  | 'press_release'
  | 'advertisement'
  | 'blog_post'
  | 'product_documentation'
  | 'general';

export type ComplianceStatus = 'approved' | 'needs_review' | 'rejected';

// ============================================================================
// Stage 1: Content Segmentation & Claims Detection
// ============================================================================

export type SegmentType =
  | 'heading'
  | 'paragraph'
  | 'bullet_point'
  | 'callout'
  | 'quote'
  | 'disclaimer';

export type ClaimType =
  | 'factual'
  | 'comparative'
  | 'superlative'
  | 'numeric'
  | 'temporal'
  | 'guarantee';

export interface ExtractedMetric {
  numericValue?: number;
  unit?: string;
  rawMetric?: string;
  timeframe?: string;
}

export interface DetectedClaim {
  id: string;
  segmentId: string;
  text: string;
  claimType: ClaimType;
  startIndex: number;
  endIndex: number;
  extractedMetrics?: ExtractedMetric;
}

export interface ContentSegment {
  id: string;
  index: number;
  text: string;
  segmentType: SegmentType;
  startIndex: number;
  endIndex: number;
  isClaimCandidate: boolean;
  detectedClaims: DetectedClaim[];
}

export interface SegmentationResult {
  submissionId: string;
  channel: ContentChannel;
  detectedChannel: ContentChannel;
  totalCharacters: number;
  totalWords: number;
  segments: ContentSegment[];
  detectedClaims: DetectedClaim[];
}

// ============================================================================
// Stage 2: Deterministic Rule Checks
// ============================================================================

export interface ProhibitedTermRule {
  id: string;
  brandId: string;
  organizationId: string;
  term: string;
  matchMode?: 'exact' | 'regex' | 'word_boundary';
  caseSensitive?: boolean;
  category?: FindingCategory;
  reason: string;
  suggestedReplacement?: string;
  severity: FindingSeverity;
}

export interface RequiredPhraseRule {
  id: string;
  brandId: string;
  organizationId: string;
  phrase: string;
  channels?: ContentChannel[]; // Empty or undefined means all channels
  placement?: 'anywhere' | 'footer' | 'header';
  reason: string;
  severity: FindingSeverity;
  exactMatch?: boolean;
}

export interface ClaimEvidenceRecord {
  id: string;
  claimId: string;
  sourceName: string;
  sourceUrl?: string;
  publicationDate?: string;
  excerpt: string;
  verifiedBy: string;
  verificationDate: string;
  confidenceScore: number; // 0.0 - 1.0
}

export interface ClaimRecord {
  id: string;
  organizationId: string;
  brandId: string;
  claimText: string;
  normalizedKeywords?: string[];
  status: 'active' | 'expired' | 'deprecated' | 'draft';
  allowedChannels?: ContentChannel[];
  allowedContexts: string[]; // e.g. ["enterprise", "us_only", "b2b"]
  validFrom: string; // ISO 8601 date string
  validUntil?: string; // ISO 8601 date string
  deprecationReason?: string;
  mandatoryDisclaimers?: string[];
  evidenceRecords: ClaimEvidenceRecord[];
}

export interface BrandGuideline {
  id: string;
  organizationId: string;
  brandId: string;
  title: string;
  category: 'voice_tone' | 'prohibited_claims' | 'channel_rules' | 'terminology' | 'compliance';
  summary: string;
  rules: string[];
  examplesAllowed: string[];
  examplesProhibited: string[];
}

export interface RuleViolation {
  id: string;
  ruleId: string;
  ruleType:
    | 'prohibited_term'
    | 'missing_required_phrase'
    | 'expired_claim'
    | 'out_of_scope_claim'
    | 'deprecated_claim';
  category: FindingCategory;
  severity: FindingSeverity;
  matchedText: string;
  startIndex?: number;
  endIndex?: number;
  message: string;
  suggestedReplacement?: string;
  metadata?: Record<string, unknown>;
}

export interface RuleCheckResult {
  violations: RuleViolation[];
  passedRulesCount: number;
  evaluatedRulesCount: number;
  checkedAt: string;
}

// ============================================================================
// Stage 3: Scoped Multi-Tenant Retrieval
// ============================================================================

export interface ScopedKnowledgeContext {
  organizationId: string;
  brandId: string;
  guidelines: BrandGuideline[];
  activeApprovedClaims: ClaimRecord[];
  expiredClaims: ClaimRecord[];
  deprecatedClaims: ClaimRecord[];
  prohibitedTerms: ProhibitedTermRule[];
  requiredPhrases: RequiredPhraseRule[];
}

export interface ScopedRetrievalQuery {
  organizationId: string;
  brandId: string;
  content: string;
  channel?: ContentChannel;
  detectedClaims?: DetectedClaim[];
}

export interface ScopedRetrievalResult {
  organizationId: string;
  brandId: string;
  tenantIsolationVerified: boolean;
  matchedGuidelines: BrandGuideline[];
  matchedApprovedClaims: ClaimRecord[];
  matchedExpiredClaims: ClaimRecord[];
  relevantEvidence: ClaimEvidenceRecord[];
  activeProhibitedTerms: ProhibitedTermRule[];
  activeRequiredPhrases: RequiredPhraseRule[];
  executionTimeMs: number;
}

// ============================================================================
// Stage 4: Gemini 2.5 Flash Structured Analysis
// ============================================================================

export interface GeminiAnalysisInput {
  submissionId: string;
  channel: ContentChannel;
  content: string;
  brandGuidelines: Array<{
    category: string;
    summary: string;
    rules: string[];
  }>;
  approvedClaims: Array<{
    id: string;
    claimText: string;
    allowedContexts: string[];
    evidence: Array<{ source: string; excerpt: string }>;
  }>;
  deterministicViolations: RuleViolation[];
}

export interface GeminiFindingPayload {
  category: FindingCategory;
  severity: FindingSeverity;
  confidence: ConfidenceLevel;
  flaggedText: string;
  explanation: string;
  citedEvidenceIds: string[];
  suggestedCorrection: string;
  isVerified: boolean;
}

export interface GeminiStructuredOutput {
  complianceScore: number;
  summaryAssessment: string;
  findings: GeminiFindingPayload[];
  suggestedRevisedText: string;
}

// ============================================================================
// Stage 5 & 6: Governance Findings & Review Summary
// ============================================================================

export interface GovernanceFinding {
  id: string;
  submissionId: string;
  stage: 'stage_2_rules' | 'stage_4_llm';
  category: FindingCategory;
  severity: FindingSeverity;
  confidence: ConfidenceLevel;
  flaggedText: string;
  startIndex?: number;
  endIndex?: number;
  explanation: string;
  evidenceRecords: ClaimEvidenceRecord[];
  citedEvidenceIds?: string[];
  citedExcerpt?: string;
  isVerified?: boolean;
  unverified: boolean;
  suggestedCorrection?: string;
  ruleId?: string;
}

export interface StageExecutionTimings {
  stage1SegmentationMs: number;
  stage2RuleChecksMs: number;
  stage3RetrievalMs: number;
  stage4LlmAnalysisMs: number;
  stage5FindingsCompilationMs: number;
  stage6SummaryGenerationMs: number;
  totalMs: number;
}

export interface GovernanceReviewSummary {
  submissionId: string;
  organizationId: string;
  brandId: string;
  channel: ContentChannel;
  status: ComplianceStatus;
  complianceScore: number; // 0 to 100
  totalFindingsCount: number;
  unverifiedClaimsCount: number;
  findingsBySeverity: Record<FindingSeverity, number>;
  findingsByCategory: Record<FindingCategory, number>;
  findings: GovernanceFinding[];
  executiveSummary: string;
  suggestedRevisedContent: string;
  suggestedRevision?: string;
  stageExecutionTimes: StageExecutionTimings;
  pipelineCompletedAt: string;
  modelUsed: string;
}
