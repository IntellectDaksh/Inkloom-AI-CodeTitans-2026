/**
 * Inkloom AI - Enterprise Database Types & Domain Models
 * Multi-Tenant Brand Governance & AI Compliance Platform
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type UserRole = 'admin' | 'brand_manager' | 'creator' | 'reviewer';

export type PlanType = 'starter' | 'growth' | 'enterprise';

export type BrandMemberRole = 'brand_manager' | 'creator' | 'reviewer' | 'viewer';

export type GuidelineCategory =
  | 'voice_and_tone'
  | 'messaging_rules'
  | 'dos_and_donts'
  | 'prohibited_words'
  | 'visual_identity'
  | 'regulatory_standards';

export type ClaimCategory =
  | 'efficacy'
  | 'safety'
  | 'sourcing'
  | 'performance'
  | 'certifications';

export type ClaimStatus =
  | 'approved'
  | 'under_review'
  | 'expired'
  | 'deprecated'
  | 'disputed';

export type EvidenceType =
  | 'clinical_trial'
  | 'lab_report'
  | 'fda_notification'
  | 'iso_cert'
  | 'legal_opinion';

export type TermType =
  | 'prohibited'
  | 'preferred'
  | 'restricted'
  | 'trademark';

export type AssetType =
  | 'logo'
  | 'banner'
  | 'font'
  | 'color_palette'
  | 'disclaimer_block'
  | 'packaging';

export type FileType = 'pdf' | 'docx' | 'txt' | 'csv' | 'md';

export type DocumentStatus = 'processing' | 'indexed' | 'failed';

export type SubmissionType =
  | 'reel_script'
  | 'social_post'
  | 'banner_copy'
  | 'newsletter'
  | 'landing_page'
  | 'video_ad';

export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'resubmitted'
  | 'approved'
  | 'rejected'
  | 'archived'
  | 'needs_re_review';

export type AnalysisStatus = 'queued' | 'running' | 'completed' | 'failed';

export type ComplianceRating = 'compliant' | 'warning' | 'non_compliant';

export type FindingSeverity =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'informational';

export type FindingCategory =
  | 'unsupported_claim'
  | 'time_bound_claim'
  | 'tone_inconsistency'
  | 'prohibited_term'
  | 'missing_disclosure'
  | 'out_of_scope';

export type FindingStatus = 'open' | 'resolved' | 'disputed' | 'ignored' | 'dismissed' | 'overridden';

export type EvidenceMatchType =
  | 'direct_contradiction'
  | 'missing_qualifier'
  | 'unverified_stat'
  | 'forbidden_vocabulary'
  | 'unregistered_claim';

export type RevisionStatus = 'suggested' | 'accepted' | 'rejected' | 'modified';

export type ApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'changes_requested';

export type ApprovalDecisionType = 'approved' | 'rejected' | 'changes_requested';

export type DisputeStatus = 'open' | 'accepted' | 'rejected' | 'under_review';

export type AuditEntityType =
  | 'submission'
  | 'claim'
  | 'guideline'
  | 'analysis_run'
  | 'approval'
  | 'dispute'
  | 'brand_term';

export type AuditEventAction =
  | 'created'
  | 'updated'
  | 'analyzed'
  | 'approved'
  | 'rejected'
  | 'disputed'
  | 'dismissed'
  | 'overridden'
  | 'cascade_re_review'
  | 're_reviewed'
  | 'exported'
  | 'archived';

export type NotificationType =
  | 'analysis_completed'
  | 'review_assigned'
  | 'changes_requested'
  | 'claim_expiring'
  | 'approval_granted'
  | 'finding_disputed'
  | 'finding_overridden'
  | 'cascade_re_review';

// ============================================================================
// CORE ENTITY INTERFACES (Matching Database Schema)
// ============================================================================

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  plan: PlanType;
  logo_url?: string | null;
  settings: {
    enforce_approval_chain: boolean;
    ai_guardrails_enabled: boolean;
    default_tone_check: boolean;
    allowed_domains?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  organisation_id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  role: UserRole;
  job_title?: string | null;
  preferences: {
    notifications_email: boolean;
    notifications_in_app: boolean;
    theme: 'light' | 'dark' | 'system';
  };
  created_at: string;
  updated_at: string;
}

export interface OrganisationMember {
  id: string;
  organisation_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  organisation_id: string;
  name: string;
  slug: string;
  industry?: string | null;
  description?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  is_active: boolean;
  compliance_threshold: number; // e.g. 85.0
  settings: {
    auto_flag_unsubstantiated: boolean;
    strict_prohibited_terms: boolean;
    require_clinical_doi: boolean;
    primary_color?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface BrandMember {
  id: string;
  brand_id: string;
  user_id: string;
  role: BrandMemberRole;
  created_at: string;
  updated_at: string;
}

export interface BrandGuideline {
  id: string;
  organisation_id: string;
  brand_id: string;
  category: GuidelineCategory;
  title: string;
  description?: string | null;
  rule_content: string;
  severity_level: FindingSeverity;
  is_active: boolean;
  embedding?: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface GuidelineVersion {
  id: string;
  guideline_id: string;
  version_number: number;
  title: string;
  rule_content: string;
  changelog?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface ApprovedClaim {
  id: string;
  organisation_id: string;
  brand_id: string;
  claim_code: string;
  claim_text: string;
  category: ClaimCategory;
  status: ClaimStatus;
  permitted_context: string;
  restricted_context: string;
  required_disclosures?: string | null;
  expires_at?: string | null;
  verified_by?: string | null;
  embedding?: number[] | null;
  dependent_submission_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface ClaimEvidence {
  id: string;
  claim_id: string;
  title: string;
  citation: string;
  excerpt: string;
  study_url?: string | null;
  evidence_type: EvidenceType;
  confidence_score: number;
  embedding?: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface BrandTerm {
  id: string;
  organisation_id: string;
  brand_id: string;
  term: string;
  term_type: TermType;
  replacement?: string | null;
  rationale: string;
  context_rules?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandAsset {
  id: string;
  organisation_id: string;
  brand_id: string;
  name: string;
  asset_type: AssetType;
  file_url: string;
  file_size_bytes?: number | null;
  mime_type?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  organisation_id: string;
  brand_id: string;
  title: string;
  file_type: FileType;
  file_url: string;
  file_size_bytes: number;
  status: DocumentStatus;
  uploaded_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentExtraction {
  id: string;
  document_id: string;
  chunk_index: number;
  chunk_content: string;
  metadata: {
    page_number?: number;
    section?: string;
    keywords?: string[];
  };
  embedding?: number[] | null;
  created_at: string;
}

export interface Submission {
  id: string;
  organisation_id: string;
  brand_id: string;
  title: string;
  submission_type: SubmissionType;
  status: SubmissionStatus;
  creator_id: string;
  assigned_reviewer_id?: string | null;
  raw_content: string;
  current_version_number: number;
  metadata: {
    campaign?: string;
    target_channels?: string[];
    intended_publish_date?: string;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;

  // Compatibility aliases
  organizationId?: string;
  brandId?: string;
  currentContent?: string;
  channel?: string;
  authorId?: string;
  authorName?: string;
}

export interface SubmissionVersion {
  id: string;
  submission_id: string;
  version_number: number;
  content: string;
  change_summary?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface AnalysisRun {
  id: string;
  submission_id: string;
  submission_version_id: string;
  triggered_by?: string | null;
  status: AnalysisStatus;
  overall_score: number; // 0 to 100
  compliance_rating: ComplianceRating;
  summary: string;
  issues_count: number;
  critical_issues_count: number;
  run_duration_ms: number;
  model_used: string;
  created_at: string;
  completed_at?: string | null;
}

export interface Finding {
  id: string;
  analysis_run_id: string;
  submission_id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  description: string;
  highlighted_snippet: string;
  line_number_start?: number | null;
  line_number_end?: number | null;
  character_start?: number | null;
  character_end?: number | null;
  rule_ref?: string | null;
  status: FindingStatus;
  override_memo?: string | null;
  overridden_by?: string | null;
  dismissal_reason?: string | null;
  dismissed_by?: string | null;
  created_at: string;
  updated_at: string;

  // Compatibility aliases
  submissionId?: string;
  organizationId?: string;
  brandId?: string;
  flaggedText?: string;
  message?: string;
  explanation?: string;
  suggestedCorrection?: string;
  ruleId?: string;
  claimId?: string;
  confidence?: string;
  isVerified?: boolean;
}

export interface FindingEvidence {
  id: string;
  finding_id: string;
  claim_id?: string | null;
  guideline_id?: string | null;
  citation: string;
  excerpt: string;
  confidence_score: number;
  match_type: EvidenceMatchType;
  created_at: string;
}

export interface SuggestedRevision {
  id: string;
  finding_id: string;
  original_text: string;
  suggested_text: string;
  explanation: string;
  status: RevisionStatus;
  applied_by?: string | null;
  applied_at?: string | null;
  created_at: string;

  // Compatibility aliases
  submissionId?: string;
  organizationId?: string;
  revisedText?: string;
  isApplied?: boolean;
  reasoning?: string;
}

export interface ApprovalRequest {
  id: string;
  submission_id: string;
  requested_by: string;
  target_reviewer_id?: string | null;
  status: ApprovalStatus;
  notes?: string | null;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalDecision {
  id: string;
  request_id: string;
  submission_id: string;
  decided_by: string;
  decision: ApprovalDecisionType;
  comments?: string | null;
  conditions?: string | null;
  decided_at: string;
}

export interface Comment {
  id: string;
  submission_id: string;
  finding_id?: string | null;
  author_id: string;
  parent_comment_id?: string | null;
  content: string;
  is_internal_only: boolean;
  created_at: string;
  updated_at: string;
}

export interface Dispute {
  id: string;
  finding_id: string;
  raised_by: string;
  reason: string;
  creator_evidence?: string | null;
  status: DisputeStatus;
  resolved_by?: string | null;
  resolution_notes?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditEvent {
  id: string;
  organisation_id: string;
  brand_id?: string | null;
  user_id?: string | null;
  entity_type: AuditEntityType;
  entity_id: string;
  action: AuditEventAction;
  ip_address?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  /** SHA-256 over prev_hash + event body: editing any earlier event breaks the chain. */
  hash?: string;
  prev_hash?: string | null;
}

export interface Notification {
  id: string;
  organisation_id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  link_url?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

// ============================================================================
// AGGREGATE / COMPOSITE TYPES FOR APPLICATION UI
// ============================================================================

export interface ApprovedClaimWithEvidence extends ApprovedClaim {
  evidence: ClaimEvidence[];
  verifier?: UserProfile | null;
  is_expiring_soon?: boolean;
  days_until_expiry?: number | null;
  dependent_submissions?: Submission[];
}

export interface FindingWithDetails extends Finding {
  evidence?: FindingEvidence[];
  suggested_revisions?: SuggestedRevision[];
  disputes?: Dispute[];
  comments?: Comment[];
}

export interface SubmissionWithDetails extends Submission {
  brand?: Brand;
  creator?: UserProfile;
  reviewer?: UserProfile | null;
  versions?: SubmissionVersion[];
  latest_analysis?: AnalysisRun | null;
  findings?: FindingWithDetails[];
  approval_requests?: ApprovalRequest[];
  latest_decision?: ApprovalDecision | null;
  comments?: Comment[];
}

export interface BrandWithStats extends Brand {
  total_claims: number;
  approved_claims_count: number;
  expiring_claims_count: number;
  guidelines_count: number;
  submissions_count: number;
  pending_reviews_count: number;
  avg_compliance_score: number;
}

export interface DashboardSummary {
  organisation: Organisation;
  active_brand: Brand;
  current_user: UserProfile;
  stats: {
    total_submissions: number;
    pending_review: number;
    approved: number;
    changes_requested: number;
    total_claims: number;
    claims_expiring_soon: number;
    average_score: number;
  };
  recent_submissions: SubmissionWithDetails[];
  urgent_findings: FindingWithDetails[];
  expiring_claims: ApprovedClaimWithEvidence[];
  recent_audit_events: AuditEvent[];
  unread_notifications: Notification[];
}

// ============================================================================
// PERSISTENT DATABASE STORE STATE
// ============================================================================

export interface InkloomDatabaseState {
  organisations: Organisation[];
  user_profiles: UserProfile[];
  organisation_members: OrganisationMember[];
  brands: Brand[];
  brand_members: BrandMember[];
  brand_guidelines: BrandGuideline[];
  guideline_versions: GuidelineVersion[];
  approved_claims: ApprovedClaim[];
  claim_evidence: ClaimEvidence[];
  brand_terms: BrandTerm[];
  brand_assets: BrandAsset[];
  documents: Document[];
  document_extractions: DocumentExtraction[];
  submissions: Submission[];
  submission_versions: SubmissionVersion[];
  analysis_runs: AnalysisRun[];
  findings: Finding[];
  finding_evidence: FindingEvidence[];
  suggested_revisions: SuggestedRevision[];
  approval_requests: ApprovalRequest[];
  approval_decisions: ApprovalDecision[];
  comments: Comment[];
  disputes: Dispute[];
  audit_events: AuditEvent[];
  notifications: Notification[];
}

export type TableName = keyof InkloomDatabaseState;
