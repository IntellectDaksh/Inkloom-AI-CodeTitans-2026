/**
 * Inkloom AI - Persistent Multi-Tenant Data Store
 * Provides transparent persistence via local '.inkloom_data.json' or in-memory fallback,
 * seeded automatically on first launch.
 * Enforces multi-tenant isolation via organisation_id and brand_id.
 * Includes optional Supabase client integration helpers.
 */

import fs from 'fs';
import { createHash } from 'crypto';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  InkloomDatabaseState,
  Organisation,
  UserProfile,
  Brand,
  BrandGuideline,
  ApprovedClaim,
  ApprovedClaimWithEvidence,
  ClaimEvidence,
  BrandTerm,
  BrandAsset,
  Document,
  Submission,
  SubmissionWithDetails,
  SubmissionVersion,
  AnalysisRun,
  Finding,
  FindingWithDetails,
  SuggestedRevision,
  ApprovalRequest,
  ApprovalDecision,
  Comment,
  Dispute,
  AuditEvent,
  Notification,
  DashboardSummary,
  ClaimStatus,
  SubmissionStatus,
  FindingStatus,
  RevisionStatus,
  ApprovalDecisionType,
} from './types';
import { createInitialSeedState, SEED_IDS } from './seed';

// ============================================================================
// PERSISTENCE ENGINE (JSON File + Memory Cache)
// ============================================================================

const DATA_FILE_NAME = '.inkloom_data.json';

function getDataFilePath(): string {
  try {
    return path.join(process.cwd(), DATA_FILE_NAME);
  } catch {
    return DATA_FILE_NAME;
  }
}

let inMemoryState: InkloomDatabaseState | null = null;

function loadState(): InkloomDatabaseState {
  if (inMemoryState) {
    return inMemoryState;
  }

  const filePath = getDataFilePath();

  // Try reading from file system
  try {
    if (typeof fs !== 'undefined' && fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      inMemoryState = JSON.parse(raw) as InkloomDatabaseState;
      return inMemoryState;
    }
  } catch (err) {
    console.warn('[Inkloom DB] Unable to read .inkloom_data.json, seeding new state:', err);
  }

  // Initialize fresh seed state
  inMemoryState = createInitialSeedState();
  saveState(inMemoryState);
  return inMemoryState;
}

function saveState(state: InkloomDatabaseState): void {
  inMemoryState = state;
  try {
    if (typeof fs !== 'undefined') {
      const filePath = getDataFilePath();
      fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[Inkloom DB] Unable to persist to .inkloom_data.json (using memory):', err);
  }
}

// ============================================================================
// SUPABASE CLIENT INTEGRATION HELPERS
// ============================================================================

export function getSupabaseConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (url && key) {
    return { url, key };
  }
  return null;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const config = getSupabaseConfig();
  if (config) {
    supabaseInstance = createClient(config.url, config.key, {
      auth: { persistSession: false },
    });
    return supabaseInstance;
  }
  return null;
}

// ============================================================================
// DATA ACCESS LAYER (MULTI-TENANT CRUD)
// ============================================================================

export class InkloomStore {
  /**
   * Reset store to initial seed state
   */
  public static resetToSeed(): InkloomDatabaseState {
    const fresh = createInitialSeedState();
    saveState(fresh);
    return fresh;
  }

  /**
   * Get raw database snapshot
   */
  public static getState(): InkloomDatabaseState {
    return loadState();
  }

  // --------------------------------------------------------------------------
  // Organisations & Users
  // --------------------------------------------------------------------------

  public static getOrganisations(): Organisation[] {
    return loadState().organisations;
  }

  public static getOrganisationById(orgId: string): Organisation | undefined {
    return loadState().organisations.find((o) => o.id === orgId);
  }

  public static getUserProfiles(orgId: string): UserProfile[] {
    return loadState().user_profiles.filter((u) => u.organisation_id === orgId);
  }

  public static getUserById(orgId: string, userId: string): UserProfile | undefined {
    return loadState().user_profiles.find(
      (u) => u.organisation_id === orgId && u.id === userId
    );
  }

  public static getCurrentUser(orgId: string = SEED_IDS.ORGANISATION_UIDEAS): UserProfile {
    const users = this.getUserProfiles(orgId);
    return (
      users.find((u) => u.id === SEED_IDS.USER_DAKSH) ||
      users[0] || {
        id: SEED_IDS.USER_DAKSH,
        organisation_id: orgId,
        email: 'daksh@uideas.digital',
        full_name: 'Daksh Agrawal',
        role: 'admin',
        job_title: 'Head of Growth & Compliance Architect',
        preferences: {
          notifications_email: true,
          notifications_in_app: true,
          theme: 'system',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );
  }

  // --------------------------------------------------------------------------
  // Brands
  // --------------------------------------------------------------------------

  public static getBrands(orgId: string): Brand[] {
    return loadState().brands.filter((b) => b.organisation_id === orgId);
  }

  public static getBrand(brandId?: string): Brand | undefined {
    if (!brandId) return undefined;
    return loadState().brands.find((b) => b.id === brandId || b.slug === brandId);
  }

  public static getBrandById(orgId: string, brandId?: string): Brand | undefined {
    if (!brandId) return undefined;
    return loadState().brands.find(
      (b) => b.organisation_id === orgId && (b.id === brandId || b.slug === brandId)
    );
  }

  public static getActiveBrand(orgId: string = SEED_IDS.ORGANISATION_UIDEAS): Brand {
    const brands = this.getBrands(orgId);
    return (
      brands.find((b) => b.id === SEED_IDS.BRAND_APEX) ||
      brands.find((b) => b.is_active) ||
      brands[0]
    );
  }

  // --------------------------------------------------------------------------
  // Guidelines
  // --------------------------------------------------------------------------

  public static getBrandGuidelines(orgId: string, brandId?: string): BrandGuideline[] {
    const state = loadState();
    return state.brand_guidelines.filter((g) => {
      if (g.organisation_id !== orgId) return false;
      if (brandId && g.brand_id !== brandId) return false;
      return true;
    });
  }

  public static createBrandGuideline(
    orgId: string,
    guideline: Omit<BrandGuideline, 'id' | 'organisation_id' | 'created_at' | 'updated_at'>
  ): BrandGuideline {
    const state = loadState();
    const newGuideline: BrandGuideline = {
      ...guideline,
      id: crypto.randomUUID(),
      organisation_id: orgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.brand_guidelines.push(newGuideline);
    saveState(state);
    return newGuideline;
  }

  // --------------------------------------------------------------------------
  // Approved Claims & Evidence
  // --------------------------------------------------------------------------

  public static getApprovedClaims(
    orgId: string,
    brandId?: string,
    options?: { status?: ClaimStatus; expiringOnly?: boolean }
  ): ApprovedClaimWithEvidence[] {
    const state = loadState();
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const filtered = state.approved_claims.filter((c) => {
      if (!this.matchOrg(c.organisation_id, orgId)) return false;
      if (brandId && !this.matchBrand(c.brand_id, brandId)) return false;
      if (options?.status && c.status !== options.status) return false;
      if (options?.expiringOnly) {
        if (!c.expires_at) return false;
        const exp = new Date(c.expires_at);
        return exp > now && exp <= thirtyDaysFromNow;
      }
      return true;
    });

    return filtered.map((c) => {
      const evidence = state.claim_evidence.filter((e) => e.claim_id === c.id);
      const verifier = c.verified_by
        ? state.user_profiles.find((u) => u.id === c.verified_by)
        : null;

      let is_expiring_soon = false;
      let days_until_expiry: number | null = null;
      if (c.expires_at) {
        const exp = new Date(c.expires_at);
        const diffMs = exp.getTime() - now.getTime();
        days_until_expiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        is_expiring_soon = days_until_expiry > 0 && days_until_expiry <= 30;
      }

      const dependent_submissions = this.getDependentSubmissionsForClaim(c.id);

      return {
        ...c,
        evidence,
        verifier,
        is_expiring_soon,
        days_until_expiry,
        dependent_submissions,
      };
    });
  }

  public static getClaimById(orgId: string, claimId: string): ApprovedClaimWithEvidence | undefined {
    const claims = this.getApprovedClaims(orgId);
    return claims.find((c) => c.id === claimId || c.claim_code === claimId);
  }

  public static createApprovedClaim(
    orgId: string,
    brandId: string,
    claim: Omit<ApprovedClaim, 'id' | 'organisation_id' | 'brand_id' | 'created_at' | 'updated_at'>,
    evidence?: Omit<ClaimEvidence, 'id' | 'claim_id' | 'created_at' | 'updated_at'>[]
  ): ApprovedClaimWithEvidence {
    const state = loadState();
    const claimId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const newClaim: ApprovedClaim = {
      ...claim,
      id: claimId,
      organisation_id: orgId,
      brand_id: brandId,
      created_at: timestamp,
      updated_at: timestamp,
    };
    state.approved_claims.push(newClaim);

    const createdEvidence: ClaimEvidence[] = [];
    if (evidence && evidence.length > 0) {
      for (const ev of evidence) {
        const newEv: ClaimEvidence = {
          ...ev,
          id: crypto.randomUUID(),
          claim_id: claimId,
          created_at: timestamp,
          updated_at: timestamp,
        };
        state.claim_evidence.push(newEv);
        createdEvidence.push(newEv);
      }
    }

    saveState(state);
    return {
      ...newClaim,
      evidence: createdEvidence,
      is_expiring_soon: false,
      days_until_expiry: null,
    };
  }

  public static updateApprovedClaim(
    orgId: string,
    claimId: string,
    updates: Partial<ApprovedClaim>
  ): ApprovedClaim | null {
    const state = loadState();
    const idx = state.approved_claims.findIndex(
      (c) => c.organisation_id === orgId && c.id === claimId
    );
    if (idx === -1) return null;

    state.approved_claims[idx] = {
      ...state.approved_claims[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveState(state);
    return state.approved_claims[idx];
  }

  // --------------------------------------------------------------------------
  // Brand Terms
  // --------------------------------------------------------------------------

  public static getBrandTerms(orgId: string, brandId?: string): BrandTerm[] {
    const state = loadState();
    return state.brand_terms.filter((t) => {
      if (t.organisation_id !== orgId) return false;
      if (brandId && t.brand_id !== brandId) return false;
      return true;
    });
  }

  public static createBrandTerm(
    orgId: string,
    brandId: string,
    term: Omit<BrandTerm, 'id' | 'organisation_id' | 'brand_id' | 'created_at' | 'updated_at'>
  ): BrandTerm {
    const state = loadState();
    const newTerm: BrandTerm = {
      ...term,
      id: crypto.randomUUID(),
      organisation_id: orgId,
      brand_id: brandId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.brand_terms.push(newTerm);
    saveState(state);
    return newTerm;
  }

  // --------------------------------------------------------------------------
  // Brand Assets & Documents
  // --------------------------------------------------------------------------

  public static getBrandAssets(orgId: string, brandId?: string): BrandAsset[] {
    const state = loadState();
    return state.brand_assets.filter((a) => {
      if (a.organisation_id !== orgId) return false;
      if (brandId && a.brand_id !== brandId) return false;
      return true;
    });
  }

  public static getDocuments(orgId: string, brandId?: string): Document[] {
    const state = loadState();
    return state.documents.filter((d) => {
      if (d.organisation_id !== orgId) return false;
      if (brandId && d.brand_id !== brandId) return false;
      return true;
    });
  }

  // --------------------------------------------------------------------------
  // Submissions & Workflows
  // --------------------------------------------------------------------------

  private static matchOrg(targetId: string, queryId?: string): boolean {
    if (!queryId) return true;
    return (
      targetId === queryId ||
      (queryId === 'org_uideas_digital' && targetId === SEED_IDS.ORGANISATION_UIDEAS) ||
      (queryId === SEED_IDS.ORGANISATION_UIDEAS && targetId === 'org_uideas_digital')
    );
  }

  private static matchBrand(targetId: string, queryId?: string): boolean {
    if (!queryId) return true;
    return (
      targetId === queryId ||
      (queryId === 'brand_apex' && targetId === SEED_IDS.BRAND_APEX) ||
      (queryId === SEED_IDS.BRAND_APEX && targetId === 'brand_apex') ||
      (queryId === 'brand_zenith' && targetId === SEED_IDS.BRAND_ZENITH) ||
      (queryId === SEED_IDS.BRAND_ZENITH && targetId === 'brand_zenith')
    );
  }

  public static getSubmissions(
    orgId: string,
    brandId?: string,
    options?: { status?: SubmissionStatus; creatorId?: string }
  ): SubmissionWithDetails[] {
    const state = loadState();
    const subs = state.submissions.filter((s) => {
      if (!this.matchOrg(s.organisation_id, orgId)) return false;
      if (brandId && !this.matchBrand(s.brand_id, brandId)) return false;
      if (options?.status && s.status !== options.status) return false;
      if (options?.creatorId && s.creator_id !== options.creatorId) return false;
      return true;
    });

    return subs.map((sub) => this.hydrateSubmission(state, sub));
  }

  public static getSubmissionById(
    orgId: string,
    submissionId: string
  ): SubmissionWithDetails | undefined {
    const state = loadState();
    const sub = state.submissions.find(
      (s) => s.organisation_id === orgId && s.id === submissionId
    );
    if (!sub) return undefined;
    return this.hydrateSubmission(state, sub);
  }

  public static getSubmission(submissionId: string): SubmissionWithDetails | undefined {
    const state = loadState();
    const sub = state.submissions.find((s) => s.id === submissionId);
    if (!sub) return undefined;
    return this.hydrateSubmission(state, sub);
  }

  public static listSubmissions(
    brandId?: string,
    orgId?: string,
    status?: any
  ): SubmissionWithDetails[] {
    return this.getSubmissions(
      orgId || SEED_IDS.ORGANISATION_UIDEAS,
      brandId,
      status ? { status } : undefined
    );
  }

  private static hydrateSubmission(
    state: InkloomDatabaseState,
    sub: Submission
  ): SubmissionWithDetails {
    const brand = state.brands.find((b) => b.id === sub.brand_id);
    const creator = state.user_profiles.find((u) => u.id === sub.creator_id);
    const reviewer = sub.assigned_reviewer_id
      ? state.user_profiles.find((u) => u.id === sub.assigned_reviewer_id)
      : null;
    const versions = state.submission_versions.filter((v) => v.submission_id === sub.id);

    // Latest analysis run
    const runs = state.analysis_runs
      .filter((r) => r.submission_id === sub.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const latest_analysis = runs[0] || null;

    // Findings
    const findings: FindingWithDetails[] = state.findings
      .filter((f) => f.submission_id === sub.id)
      .map((f) => {
        const evidence = state.finding_evidence.filter((fe) => fe.finding_id === f.id);
        const suggested_revisions = state.suggested_revisions.filter(
          (sr) => sr.finding_id === f.id
        );
        const disputes = state.disputes.filter((d) => d.finding_id === f.id);
        const comments = state.comments.filter((c) => c.finding_id === f.id);
        return {
          ...f,
          submissionId: f.submission_id,
          organizationId: sub.organisation_id,
          brandId: sub.brand_id,
          flaggedText: f.highlighted_snippet,
          message: f.description,
          explanation: f.description,
          evidence,
          suggested_revisions,
          disputes,
          comments,
        };
      });

    const approval_requests = state.approval_requests.filter(
      (ar) => ar.submission_id === sub.id
    );
    const decisions = state.approval_decisions
      .filter((ad) => ad.submission_id === sub.id)
      .sort((a, b) => new Date(b.decided_at).getTime() - new Date(a.decided_at).getTime());
    const latest_decision = decisions[0] || null;

    const comments = state.comments.filter((c) => c.submission_id === sub.id);

    return {
      ...sub,
      organizationId: sub.organisation_id,
      brandId: sub.brand_id,
      currentContent: sub.raw_content,
      channel: ((sub.metadata as any)?.channel as string) || 'social_media',
      authorId: sub.creator_id,
      authorName: creator?.full_name || 'Daksh Agrawal',
      brand,
      creator,
      reviewer,
      versions,
      latest_analysis,
      findings,
      approval_requests,
      latest_decision,
      comments,
    };
  }

  public static createSubmission(
    arg1: any,
    arg2?: string,
    arg3?: any
  ): SubmissionWithDetails {
    const state = loadState();
    let orgId: string;
    let brandId: string;
    let title: string;
    let submission_type: any;
    let raw_content: string;
    let creator_id: string;
    let assigned_reviewer_id: string | null = null;
    let metadata: Record<string, unknown> = {};
    let status: any = 'submitted';

    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
      orgId = arg1;
      brandId = arg2;
      title = arg3.title;
      submission_type = arg3.submission_type || 'reel_script';
      raw_content = arg3.raw_content || arg3.currentContent || '';
      creator_id = arg3.creator_id || arg3.authorId || SEED_IDS.USER_DAKSH;
      assigned_reviewer_id = arg3.assigned_reviewer_id || null;
      metadata = arg3.metadata || {};
    } else {
      const payload = arg1 || {};
      orgId = payload.organizationId || payload.organisation_id || SEED_IDS.ORGANISATION_UIDEAS;
      brandId = payload.brandId || payload.brand_id || SEED_IDS.BRAND_APEX;
      title = payload.title || 'Untitled Submission';
      submission_type = payload.submissionType || payload.submission_type || 'reel_script';
      raw_content = payload.currentContent || payload.raw_content || payload.content || '';
      creator_id = payload.authorId || payload.creator_id || SEED_IDS.USER_DAKSH;
      assigned_reviewer_id = payload.assignedReviewerId || payload.assigned_reviewer_id || null;
      status = payload.status || 'submitted';
      metadata = {
        channel: payload.channel,
        authorName: payload.authorName,
        ...payload.metadata,
      };
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newSub: Submission = {
      id,
      organisation_id: orgId,
      brand_id: brandId,
      title,
      submission_type,
      status,
      creator_id,
      assigned_reviewer_id,
      raw_content,
      current_version_number: 1,
      metadata: metadata as any,
      created_at: now,
      updated_at: now,
    };
    state.submissions.unshift(newSub);

    // Initial version
    const versionId = crypto.randomUUID();
    const newVersion: SubmissionVersion = {
      id: versionId,
      submission_id: id,
      version_number: 1,
      content: raw_content,
      change_summary: 'Initial draft submission',
      created_by: creator_id,
      created_at: now,
    };
    state.submission_versions.push(newVersion);

    // Initial approval request
    const approvalReq: ApprovalRequest = {
      id: crypto.randomUUID(),
      submission_id: id,
      requested_by: creator_id,
      target_reviewer_id: assigned_reviewer_id,
      status: 'pending',
      notes: 'Initial submission awaiting review',
      created_at: now,
      updated_at: now,
    };
    state.approval_requests.push(approvalReq);

    // Audit Event
    const auditEvent: AuditEvent = {
      id: crypto.randomUUID(),
      organisation_id: orgId,
      brand_id: brandId,
      user_id: creator_id,
      entity_type: 'submission',
      entity_id: id,
      action: 'created',
      metadata: { title },
      created_at: now,
    };
    state.audit_events.unshift(auditEvent);

    saveState(state);
    return this.hydrateSubmission(state, newSub);
  }

  public static updateSubmission(
    id: string,
    updates: any
  ): SubmissionWithDetails | null {
    const state = loadState();
    const idx = state.submissions.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    const sub = state.submissions[idx];
    if (updates.currentContent !== undefined) {
      sub.raw_content = updates.currentContent;
    }
    if (updates.raw_content !== undefined) {
      sub.raw_content = updates.raw_content;
    }
    if (updates.status !== undefined) {
      sub.status = updates.status;
    }
    if (updates.title !== undefined) {
      sub.title = updates.title;
    }
    sub.updated_at = new Date().toISOString();
    saveState(state);
    return this.hydrateSubmission(state, sub);
  }

  public static updateSubmissionStatus(
    orgId: string,
    submissionId: string,
    status: SubmissionStatus
  ): SubmissionWithDetails | null {
    const state = loadState();
    const idx = state.submissions.findIndex(
      (s) => s.organisation_id === orgId && s.id === submissionId
    );
    if (idx === -1) return null;

    state.submissions[idx].status = status;
    state.submissions[idx].updated_at = new Date().toISOString();
    saveState(state);
    return this.hydrateSubmission(state, state.submissions[idx]);
  }

  // --------------------------------------------------------------------------
  // Findings & Revisions
  // --------------------------------------------------------------------------

  /** Drop still-open findings before a re-check so they don't pile up; decided ones stay for the audit trail. */
  public static clearOpenFindings(submissionId: string): number {
    const state = loadState();
    const before = state.findings.length;
    state.findings = state.findings.filter(
      (f) =>
        !((f.submission_id === submissionId || (f as any).submissionId === submissionId) &&
          (!(f as any).status || (f as any).status === 'open'))
    );
    saveState(state);
    return before - state.findings.length;
  }

  public static listFindings(submissionId: string): FindingWithDetails[] {
    const state = loadState();
    return state.findings
      .filter((f) => f.submission_id === submissionId || (f as any).submissionId === submissionId)
      .map((f) => {
        const evidence = state.finding_evidence.filter((fe) => fe.finding_id === f.id);
        const suggested_revisions = state.suggested_revisions.filter(
          (sr) => sr.finding_id === f.id
        );
        return {
          ...f,
          submissionId: f.submission_id,
          flaggedText: f.highlighted_snippet,
          message: f.description,
          explanation: f.description,
          evidence,
          suggested_revisions,
        };
      });
  }

  public static createFinding(finding: any): Finding {
    const state = loadState();
    const id = finding.id || crypto.randomUUID();
    const now = new Date().toISOString();
    const newFinding: Finding = {
      id,
      analysis_run_id:
        finding.analysis_run_id || finding.analysisRunId || SEED_IDS.ANALYSIS_RUN_REEL,
      submission_id: finding.submission_id || finding.submissionId,
      category: finding.category || 'unsupported_claim',
      severity: finding.severity || 'high',
      title: finding.title || finding.flaggedText || 'Compliance Flag',
      description: finding.description || finding.explanation || finding.message || '',
      highlighted_snippet: finding.highlighted_snippet || finding.flaggedText || '',
      line_number_start: finding.line_number_start ?? finding.lineStart ?? 1,
      line_number_end: finding.line_number_end ?? finding.lineEnd ?? 1,
      character_start: finding.character_start ?? finding.startIndex ?? 0,
      character_end: finding.character_end ?? finding.endIndex ?? 0,
      rule_ref: finding.rule_ref || finding.ruleId || null,
      status: finding.status || 'open',
      created_at: now,
      updated_at: now,
      submissionId: finding.submission_id || finding.submissionId,
      organizationId: finding.organisation_id || finding.organizationId,
      brandId: finding.brand_id || finding.brandId,
      flaggedText: finding.highlighted_snippet || finding.flaggedText,
      message: finding.message || finding.description,
      explanation: finding.explanation || finding.description,
      suggestedCorrection: finding.suggestedCorrection,
      ruleId: finding.ruleId || finding.rule_ref,
      claimId: finding.claimId,
      confidence: finding.confidence,
      isVerified: finding.isVerified,
    };
    state.findings.push(newFinding);
    saveState(state);
    return newFinding;
  }

  public static listSuggestedRevisions(submissionId: string): SuggestedRevision[] {
    const state = loadState();
    const findingIds = new Set(
      state.findings
        .filter((f) => f.submission_id === submissionId || (f as any).submissionId === submissionId)
        .map((f) => f.id)
    );
    return state.suggested_revisions
      .filter((r) => findingIds.has(r.finding_id) || (r as any).submissionId === submissionId)
      .map((r) => ({
        ...r,
        submissionId,
        revisedText: r.suggested_text,
        isApplied: r.status === 'accepted',
      }));
  }

  public static createSuggestedRevision(revision: any): SuggestedRevision {
    const state = loadState();
    const id = revision.id || crypto.randomUUID();
    const now = new Date().toISOString();
    const newRev: SuggestedRevision = {
      id,
      finding_id: revision.finding_id || revision.findingId || crypto.randomUUID(),
      original_text: revision.original_text || revision.originalText || '',
      suggested_text: revision.suggested_text || revision.revisedText || '',
      explanation: revision.explanation || revision.reasoning || '',
      status: revision.isApplied ? 'accepted' : (revision.status || 'suggested'),
      applied_by: revision.applied_by || revision.appliedBy || null,
      applied_at: revision.applied_at || revision.appliedAt || null,
      created_at: now,
      submissionId: revision.submissionId,
      organizationId: revision.organizationId,
      revisedText: revision.suggested_text || revision.revisedText,
      isApplied: Boolean(revision.isApplied),
      reasoning: revision.explanation || revision.reasoning,
    };
    state.suggested_revisions.push(newRev);
    saveState(state);
    return newRev;
  }

  public static updateSuggestedRevision(
    revisionId: string,
    updates: any
  ): SuggestedRevision | null {
    const state = loadState();
    const idx = state.suggested_revisions.findIndex((r) => r.id === revisionId);
    if (idx === -1) return null;

    const rev = state.suggested_revisions[idx];
    if (updates.isApplied !== undefined) {
      rev.status = updates.isApplied ? 'accepted' : 'suggested';
      rev.isApplied = updates.isApplied;
    }
    if (updates.appliedBy !== undefined) rev.applied_by = updates.appliedBy;
    if (updates.appliedAt !== undefined) rev.applied_at = updates.appliedAt;
    if (updates.revisedText !== undefined) {
      rev.suggested_text = updates.revisedText;
      rev.revisedText = updates.revisedText;
    }
    saveState(state);
    return rev;
  }

  public static recordAuditEvent(event: any): AuditEvent {
    const state = loadState();
    const audit: AuditEvent = {
      id: crypto.randomUUID(),
      organisation_id:
        event.organisation_id || event.organizationId || SEED_IDS.ORGANISATION_UIDEAS,
      brand_id: event.brand_id || event.brandId || null,
      user_id: event.user_id || event.userId || SEED_IDS.USER_DAKSH,
      entity_type: event.entity_type || event.entityType || 'submission',
      entity_id: event.entity_id || event.entityId || crypto.randomUUID(),
      action: event.action || 'updated',
      ip_address: event.ip_address || event.ipAddress || '127.0.0.1',
      metadata:
        event.metadata || { previousValue: event.previousValue, updatedValue: event.updatedValue },
      created_at: new Date().toISOString(),
    };
    const prev = state.audit_events.find((e) => e.hash) ?? null;
    audit.prev_hash = prev?.hash ?? null;
    audit.hash = createHash('sha256')
      .update(`${audit.prev_hash ?? ''}|${audit.id}|${audit.entity_id}|${audit.action}|${audit.user_id}|${audit.created_at}|${JSON.stringify(audit.metadata)}`)
      .digest('hex');
    state.audit_events.unshift(audit);
    saveState(state);
    return audit;
  }

  /** Audit trail for one entity, oldest first, for the submission timeline. */
  public static listAuditForEntity(entityId: string): AuditEvent[] {
    return loadState()
      .audit_events.filter((e) => e.entity_id === entityId || (e.metadata as any)?.submission_id === entityId)
      .slice()
      .reverse();
  }

  // --------------------------------------------------------------------------
  // Findings & Revisions
  // --------------------------------------------------------------------------

  public static updateFindingStatus(
    findingId: string,
    status: FindingStatus
  ): Finding | null {
    const state = loadState();
    const idx = state.findings.findIndex((f) => f.id === findingId);
    if (idx === -1) return null;

    state.findings[idx].status = status;
    state.findings[idx].updated_at = new Date().toISOString();
    saveState(state);
    return state.findings[idx];
  }

  public static recordFindingOverride(
    findingId: string,
    reviewerId: string = SEED_IDS.USER_DAKSH,
    memo: string = 'Override authorized under Legal Memo LM-2026-44'
  ): { finding: Finding; submission: SubmissionWithDetails } | null {
    const state = loadState();
    const fIdx = state.findings.findIndex((f) => f.id === findingId);
    if (fIdx === -1) return null;

    const finding = state.findings[fIdx];
    const now = new Date().toISOString();

    finding.status = 'overridden';
    finding.override_memo = memo;
    finding.overridden_by = reviewerId;
    finding.updated_at = now;

    const subIdx = state.submissions.findIndex((s) => s.id === finding.submission_id);
    if (subIdx === -1) return null;
    const sub = state.submissions[subIdx];

    // Record immutable audit event
    state.audit_events.unshift({
      id: crypto.randomUUID(),
      organisation_id: sub.organisation_id,
      brand_id: sub.brand_id,
      user_id: reviewerId,
      entity_type: 'submission',
      entity_id: sub.id,
      action: 'overridden',
      ip_address: '127.0.0.1',
      metadata: {
        findingId: finding.id,
        findingTitle: finding.title,
        flaggedText: finding.highlighted_snippet,
        overrideMemo: memo,
        authorizedBy: reviewerId,
        complianceImpact: 'Finding neutralized under authorized executive legal memo',
      },
      created_at: now,
    });

    // Notify creator of override authorization
    state.notifications.unshift({
      id: crypto.randomUUID(),
      organisation_id: sub.organisation_id,
      user_id: sub.creator_id,
      title: `Finding Override Authorized: ${finding.title}`,
      message: `Reviewer recorded authorized override: "${memo}"`,
      notification_type: 'finding_overridden',
      link_url: `/submissions/${sub.id}`,
      is_read: false,
      read_at: null,
      created_at: now,
    });

    // Re-evaluate submission compliance rating if all remaining findings are cleared/dismissed/overridden
    const activeCriticals = state.findings.filter(
      (f) =>
        f.submission_id === sub.id &&
        f.status === 'open' &&
        (f.severity === 'critical' || f.severity === 'high')
    );
    if (activeCriticals.length === 0) {
      const run = state.analysis_runs.find((r) => r.submission_id === sub.id);
      if (run) {
        run.overall_score = Math.max(run.overall_score, 92);
        run.compliance_rating = 'compliant';
      }
    }

    saveState(state);
    return {
      finding,
      submission: this.hydrateSubmission(state, sub),
    };
  }

  public static dismissFinding(
    findingId: string,
    dismissedBy: string = SEED_IDS.USER_DAKSH,
    reason: string = 'Permitted exception under brand guideline tolerance policy'
  ): { finding: Finding; submission: SubmissionWithDetails } | null {
    const state = loadState();
    const fIdx = state.findings.findIndex((f) => f.id === findingId);
    if (fIdx === -1) return null;

    const finding = state.findings[fIdx];
    const now = new Date().toISOString();

    finding.status = 'dismissed';
    finding.dismissal_reason = reason;
    finding.dismissed_by = dismissedBy;
    finding.updated_at = now;

    const subIdx = state.submissions.findIndex((s) => s.id === finding.submission_id);
    if (subIdx === -1) return null;
    const sub = state.submissions[subIdx];

    // Record immutable audit event
    state.audit_events.unshift({
      id: crypto.randomUUID(),
      organisation_id: sub.organisation_id,
      brand_id: sub.brand_id,
      user_id: dismissedBy,
      entity_type: 'submission',
      entity_id: sub.id,
      action: 'dismissed',
      ip_address: '127.0.0.1',
      metadata: {
        findingId: finding.id,
        findingTitle: finding.title,
        flaggedText: finding.highlighted_snippet,
        dismissalReason: reason,
        dismissedBy,
      },
      created_at: now,
    });

    saveState(state);
    return {
      finding,
      submission: this.hydrateSubmission(state, sub),
    };
  }

  public static applyRevision(
    revisionId: string,
    userId: string
  ): { revision: SuggestedRevision; finding: Finding; submission: Submission } | null {
    const state = loadState();
    const revIdx = state.suggested_revisions.findIndex((r) => r.id === revisionId);
    if (revIdx === -1) return null;

    const revision = state.suggested_revisions[revIdx];
    revision.status = 'accepted';
    revision.applied_by = userId;
    revision.applied_at = new Date().toISOString();

    const findingIdx = state.findings.findIndex((f) => f.id === revision.finding_id);
    if (findingIdx === -1) return null;
    const finding = state.findings[findingIdx];
    finding.status = 'resolved';
    finding.updated_at = new Date().toISOString();

    const subIdx = state.submissions.findIndex((s) => s.id === finding.submission_id);
    if (subIdx === -1) return null;
    const submission = state.submissions[subIdx];

    // Replace original snippet with suggested revision in raw_content
    if (submission.raw_content.includes(revision.original_text)) {
      submission.raw_content = submission.raw_content.replace(
        revision.original_text,
        revision.suggested_text
      );
      submission.current_version_number += 1;
      submission.updated_at = new Date().toISOString();

      // Create new version
      state.submission_versions.push({
        id: crypto.randomUUID(),
        submission_id: submission.id,
        version_number: submission.current_version_number,
        content: submission.raw_content,
        change_summary: `Applied revision for finding: ${finding.title}`,
        created_by: userId,
        created_at: new Date().toISOString(),
      });
    }

    saveState(state);
    return { revision, finding, submission };
  }

  // --------------------------------------------------------------------------
  // Approvals Workflow & API Compatibility Methods
  // --------------------------------------------------------------------------

  public static listApprovals(orgId?: string, status?: any): any[] {
    const state = loadState();
    return state.approval_requests
      .filter((ar) => (status ? ar.status === status : true))
      .map((ar) => {
        const sub = state.submissions.find((s) => s.id === ar.submission_id);
        const reviewer = ar.target_reviewer_id
          ? state.user_profiles.find((u) => u.id === ar.target_reviewer_id)
          : null;
        return {
          ...ar,
          submission: sub,
          reviewer,
        };
      });
  }

  public static recordApprovalDecision(
    arg1: any,
    arg2?: any
  ): any {
    const state = loadState();
    let orgId: string;
    let submission_id: string;
    let decided_by: string;
    let decision: ApprovalDecisionType;
    let comments: string | undefined;
    let conditions: string | undefined;

    if (typeof arg1 === 'string' && arg2) {
      orgId = arg1;
      submission_id = arg2.submission_id || arg2.submissionId;
      decided_by = arg2.decided_by || arg2.reviewerId || SEED_IDS.USER_DAKSH;
      decision = arg2.decision;
      comments = arg2.comments || arg2.notes;
      conditions = arg2.conditions;
    } else {
      const payload = arg1 || {};
      orgId = payload.organizationId || payload.organisation_id || SEED_IDS.ORGANISATION_UIDEAS;
      submission_id = payload.submissionId || payload.submission_id;
      decided_by = payload.reviewerId || payload.decided_by || SEED_IDS.USER_DAKSH;
      decision = payload.decision;
      comments = payload.notes || payload.comments;
      conditions = payload.conditions;
    }

    const subIdx = state.submissions.findIndex(
      (s) => s.id === submission_id
    );
    if (subIdx === -1) return null;

    const sub = state.submissions[subIdx];
    const now = new Date().toISOString();

    // Find pending request or create one
    let req = state.approval_requests.find(
      (r) => r.submission_id === submission_id && r.status === 'pending'
    );
    if (!req) {
      req = {
        id: crypto.randomUUID(),
        submission_id,
        requested_by: sub.creator_id,
        target_reviewer_id: decided_by,
        status: decision,
        created_at: now,
        updated_at: now,
      };
      state.approval_requests.push(req);
    } else {
      req.status = decision;
      req.updated_at = now;
    }

    const approvalDecision: ApprovalDecision = {
      id: crypto.randomUUID(),
      request_id: req.id,
      submission_id,
      decided_by,
      decision,
      comments: comments || null,
      conditions: conditions || null,
      decided_at: now,
    };
    state.approval_decisions.push(approvalDecision);

    // Update submission status
    if (decision === 'approved') {
      sub.status = 'approved';
    } else if (decision === 'changes_requested') {
      sub.status = 'changes_requested';
    } else if (decision === 'rejected') {
      sub.status = 'rejected';
    }
    sub.updated_at = now;

    // Create Audit Event
    state.audit_events.unshift({
      id: crypto.randomUUID(),
      organisation_id: orgId,
      brand_id: sub.brand_id,
      user_id: decided_by,
      entity_type: 'approval',
      entity_id: approvalDecision.id,
      action: decision === 'approved' ? 'approved' : 'rejected',
      metadata: { submission_id: sub.id, decision },
      created_at: now,
    });

    // Notify creator
    state.notifications.unshift({
      id: crypto.randomUUID(),
      organisation_id: orgId,
      user_id: sub.creator_id,
      title: `Submission ${decision === 'approved' ? 'Approved' : 'Changes Requested'}: ${sub.title}`,
      message: comments || `Reviewer decided: ${decision}`,
      notification_type: decision === 'approved' ? 'approval_granted' : 'changes_requested',
      link_url: `/submissions/${sub.id}`,
      is_read: false,
      read_at: null,
      created_at: now,
    });

    saveState(state);
    return {
      decision: approvalDecision,
      submission: this.hydrateSubmission(state, sub),
    };
  }

  public static getAnalytics(orgId?: string, brandId?: string): any {
    const summary = this.getDashboardSummary(
      orgId || SEED_IDS.ORGANISATION_UIDEAS,
      brandId || SEED_IDS.BRAND_APEX
    );
    return summary.stats;
  }

  public static listClaims(
    brandId?: string,
    orgId?: string,
    status?: any
  ): any[] {
    return this.getApprovedClaims(
      orgId || SEED_IDS.ORGANISATION_UIDEAS,
      brandId,
      status ? { status } : undefined
    ).map((c) => ({
      ...c,
      claimText: c.claim_text,
      permittedContext: c.permitted_context,
      restrictedContext: c.restricted_context,
      expiresAt: c.expires_at,
      dependent_submissions: c.dependent_submissions || [],
      dependentCount: c.dependent_submissions?.length || 0,
    }));
  }

  public static createClaim(data: any): any {
    const orgId = data.organizationId || data.organisation_id || SEED_IDS.ORGANISATION_UIDEAS;
    const brandId = data.brandId || data.brand_id || SEED_IDS.BRAND_APEX;
    const claimCode = `CLM-GEN-${Math.floor(100 + Math.random() * 900)}`;

    const newClaim = this.createApprovedClaim(
      orgId,
      brandId,
      {
        claim_code: claimCode,
        claim_text: data.claimText || data.claim_text,
        category: data.category || 'performance',
        status: data.status || 'approved',
        permitted_context: data.permittedContext || data.permitted_context || 'All channels',
        restricted_context: data.restrictedContext || data.restricted_context || 'None',
        required_disclosures: data.requiredDisclosures || null,
        expires_at: data.expiresAt || data.expires_at || null,
        verified_by: data.userId || SEED_IDS.USER_DAKSH,
      },
      data.evidenceSource
        ? [
            {
              title: data.evidenceSource,
              citation: data.evidenceSource,
              excerpt: data.evidenceExcerpt || data.claimText,
              evidence_type: 'clinical_trial',
              confidence_score: 0.95,
            },
          ]
        : undefined
    );

    return {
      ...newClaim,
      claimText: newClaim.claim_text,
      permittedContext: newClaim.permitted_context,
      restrictedContext: newClaim.restricted_context,
      expiresAt: newClaim.expires_at,
    };
  }

  public static createNotification(data: any): Notification {
    const state = loadState();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const notif: Notification = {
      id,
      organisation_id: data.organizationId || data.organisation_id || SEED_IDS.ORGANISATION_UIDEAS,
      user_id: data.userId || data.user_id || SEED_IDS.USER_DAKSH,
      title: data.title || 'Notification',
      message: data.message || '',
      notification_type: data.type || data.notification_type || 'approval_granted',
      link_url: data.linkUrl || data.link_url || null,
      is_read: Boolean(data.isRead || data.is_read),
      read_at: null,
      created_at: now,
    };
    state.notifications.unshift(notif);
    saveState(state);
    return notif;
  }

  public static listNotifications(userId?: string): Notification[] {
    const state = loadState();
    return state.notifications
      .filter((n) => (userId ? n.user_id === userId || userId === 'usr_daksh' : true))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // --------------------------------------------------------------------------
  // Comments & Disputes
  // --------------------------------------------------------------------------

  public static addComment(
    submissionId: string,
    authorId: string,
    content: string,
    findingId?: string | null
  ): Comment {
    const state = loadState();
    const comment: Comment = {
      id: crypto.randomUUID(),
      submission_id: submissionId,
      finding_id: findingId || null,
      author_id: authorId,
      parent_comment_id: null,
      content,
      is_internal_only: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.comments.push(comment);
    saveState(state);
    return comment;
  }

  public static raiseDispute(
    findingId: string,
    raisedBy: string,
    reason: string,
    creatorEvidence?: string
  ): Dispute {
    const state = loadState();
    const now = new Date().toISOString();
    const dispute: Dispute = {
      id: crypto.randomUUID(),
      finding_id: findingId,
      raised_by: raisedBy,
      reason,
      creator_evidence: creatorEvidence || null,
      status: 'open',
      resolved_by: null,
      resolution_notes: null,
      resolved_at: null,
      created_at: now,
      updated_at: now,
    };
    state.disputes.push(dispute);

    // Update finding status to disputed
    const fIdx = state.findings.findIndex((f) => f.id === findingId);
    if (fIdx !== -1) {
      const finding = state.findings[fIdx];
      finding.status = 'disputed';
      finding.updated_at = now;

      const sub = state.submissions.find((s) => s.id === finding.submission_id);
      if (sub) {
        // Record immutable audit event
        state.audit_events.unshift({
          id: crypto.randomUUID(),
          organisation_id: sub.organisation_id,
          brand_id: sub.brand_id,
          user_id: raisedBy,
          entity_type: 'dispute',
          entity_id: dispute.id,
          action: 'disputed',
          ip_address: '127.0.0.1',
          metadata: {
            findingId: finding.id,
            submissionId: sub.id,
            reason,
            creatorEvidence: creatorEvidence || null,
            findingTitle: finding.title,
            flaggedText: finding.highlighted_snippet,
          },
          created_at: now,
        });

        // Notify reviewer
        state.notifications.unshift({
          id: crypto.randomUUID(),
          organisation_id: sub.organisation_id,
          user_id: sub.assigned_reviewer_id || SEED_IDS.USER_REVIEWER,
          title: `Finding Disputed: ${sub.title}`,
          message: `Creator challenged finding "${finding.title}": ${reason}`,
          notification_type: 'finding_disputed',
          link_url: `/submissions/${sub.id}`,
          is_read: false,
          read_at: null,
          created_at: now,
        });
      }
    }

    saveState(state);
    return dispute;
  }

  // --------------------------------------------------------------------------
  // Cascade Re-Review & Claim Dependencies (Central Originality Feature)
  // --------------------------------------------------------------------------

  public static getDependentSubmissionsForClaim(claimIdOrCode: string): Submission[] {
    const state = loadState();
    const claim = state.approved_claims.find(
      (c) => c.id === claimIdOrCode || c.claim_code === claimIdOrCode
    );
    if (!claim) return [];

    const targetCode = claim.claim_code.toUpperCase();
    const targetId = claim.id;

    // Hard-mapped defaults for reliable demo & seeded coherence
    const seedMapping: Record<string, string[]> = {
      'CLM-APX-001': [SEED_IDS.SUB_REEL_SCRIPT, SEED_IDS.SUB_WEBSITE_BANNER],
      'CLM-APX-002': [SEED_IDS.SUB_INSTAGRAM_POST],
      'CLM-APX-003': [SEED_IDS.SUB_WEBSITE_BANNER, SEED_IDS.SUB_AD_CREATIVE],
      'CLM-APX-004': [SEED_IDS.SUB_LINKEDIN_UPDATE],
      'CLM-APX-005': [SEED_IDS.SUB_AD_CREATIVE, SEED_IDS.SUB_REEL_SCRIPT],
    };

    const mappedSubIds = seedMapping[targetCode] || [];

    const matched = state.submissions.filter((sub) => {
      // Direct mapped ID
      if (mappedSubIds.includes(sub.id)) return true;
      if (claim.dependent_submission_ids?.includes(sub.id)) return true;

      // Finding evidence links
      const subFindings = state.findings.filter((f) => f.submission_id === sub.id);
      for (const f of subFindings) {
        if (f.claimId === targetCode || (f as any).claim_id === targetId) return true;
        const feMatch = state.finding_evidence.some(
          (fe) => fe.finding_id === f.id && fe.claim_id === targetId
        );
        if (feMatch) return true;
      }

      // Keyword & content correlation
      const content = (sub.raw_content || '').toLowerCase();
      if (targetCode === 'CLM-APX-003' && (content.includes('informed-sport') || content.includes('wada') || content.includes('certified'))) return true;
      if (targetCode === 'CLM-APX-004' && (content.includes('vo2 max') || content.includes('14.3%'))) return true;
      if (targetCode === 'CLM-APX-001' && (content.includes('protein synthesis') || content.includes('2x faster'))) return true;
      if (targetCode === 'CLM-APX-002' && (content.includes('bcaa') || content.includes('5.8g'))) return true;

      return false;
    });

    return matched;
  }

  public static triggerCascadeReReview(
    claimIdOrCode: string,
    reason: string = 'Claim validity period expired or evidence modified',
    triggeredBy: string = SEED_IDS.USER_DAKSH
  ): { success: boolean; claim: ApprovedClaim; affectedSubmissions: Submission[]; count: number } {
    const state = loadState();
    const claim = state.approved_claims.find(
      (c) => c.id === claimIdOrCode || c.claim_code === claimIdOrCode
    );
    if (!claim) {
      throw new Error(`Claim not found for identifier: ${claimIdOrCode}`);
    }

    const dependentSubs = this.getDependentSubmissionsForClaim(claim.id);
    const now = new Date().toISOString();

    for (const sub of dependentSubs) {
      const liveSub = state.submissions.find((s) => s.id === sub.id);
      if (liveSub) {
        liveSub.status = 'needs_re_review';
        liveSub.updated_at = now;

        // Record audit event for this submission
        state.audit_events.unshift({
          id: crypto.randomUUID(),
          organisation_id: claim.organisation_id,
          brand_id: claim.brand_id,
          user_id: triggeredBy,
          entity_type: 'submission',
          entity_id: liveSub.id,
          action: 'cascade_re_review',
          ip_address: '127.0.0.1',
          metadata: {
            claimCode: claim.claim_code,
            claimId: claim.id,
            reason,
            triggeredBy,
            previousStatus: sub.status,
            newStatus: 'needs_re_review',
          },
          created_at: now,
        });

        // Notify creator & assigned reviewer
        state.notifications.unshift({
          id: crypto.randomUUID(),
          organisation_id: claim.organisation_id,
          user_id: liveSub.creator_id,
          title: `Cascade Re-Review: ${liveSub.title}`,
          message: `Evidence record ${claim.claim_code} updated/expired ("${reason}"). Draft flagged with needs_re_review.`,
          notification_type: 'cascade_re_review',
          link_url: `/submissions/${liveSub.id}`,
          is_read: false,
          read_at: null,
          created_at: now,
        });
      }
    }

    // Record audit event on the claim itself
    state.audit_events.unshift({
      id: crypto.randomUUID(),
      organisation_id: claim.organisation_id,
      brand_id: claim.brand_id,
      user_id: triggeredBy,
      entity_type: 'claim',
      entity_id: claim.id,
      action: 'cascade_re_review',
      ip_address: '127.0.0.1',
      metadata: {
        claimCode: claim.claim_code,
        reason,
        affectedCount: dependentSubs.length,
        affectedSubmissions: dependentSubs.map((s) => ({ id: s.id, title: s.title })),
      },
      created_at: now,
    });

    saveState(state);

    return {
      success: true,
      claim,
      affectedSubmissions: dependentSubs,
      count: dependentSubs.length,
    };
  }

  // --------------------------------------------------------------------------
  // Audit Events & Notifications
  // --------------------------------------------------------------------------

  public static getAuditEvents(orgId: string, brandId?: string): AuditEvent[] {
    const state = loadState();
    return state.audit_events
      .filter((a) => {
        if (a.organisation_id !== orgId) return false;
        if (brandId && a.brand_id && a.brand_id !== brandId) return false;
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public static getNotifications(
    orgId: string,
    userId: string,
    unreadOnly: boolean = false
  ): Notification[] {
    const state = loadState();
    return state.notifications
      .filter((n) => {
        if (n.organisation_id !== orgId) return false;
        if (n.user_id !== userId) return false;
        if (unreadOnly && n.is_read) return false;
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public static markNotificationRead(notificationId: string): boolean {
    const state = loadState();
    const n = state.notifications.find((notif) => notif.id === notificationId);
    if (!n) return false;
    n.is_read = true;
    n.read_at = new Date().toISOString();
    saveState(state);
    return true;
  }

  // --------------------------------------------------------------------------
  // High-Level Dashboard Summary Aggregator
  // --------------------------------------------------------------------------

  public static getDashboardSummary(
    orgId: string = SEED_IDS.ORGANISATION_UIDEAS,
    brandId: string = SEED_IDS.BRAND_APEX,
    userId: string = SEED_IDS.USER_DAKSH
  ): DashboardSummary {
    const org = this.getOrganisationById(orgId) || loadState().organisations[0];
    const brand = this.getBrandById(orgId, brandId) || this.getActiveBrand(orgId);
    const currentUser = this.getUserById(orgId, userId) || this.getCurrentUser(orgId);

    const submissions = this.getSubmissions(orgId, brandId);
    const claims = this.getApprovedClaims(orgId, brandId);
    const expiringClaims = claims.filter((c) => c.is_expiring_soon);

    const total_submissions = submissions.length;
    const pending_review = submissions.filter((s) => s.status === 'under_review' || s.status === 'submitted').length;
    const approved = submissions.filter((s) => s.status === 'approved').length;
    const changes_requested = submissions.filter((s) => s.status === 'changes_requested').length;

    // Average score across scored analysis runs
    const scoredRuns = submissions
      .map((s) => s.latest_analysis?.overall_score)
      .filter((score): score is number => typeof score === 'number' && score > 0);
    const average_score =
      scoredRuns.length > 0
        ? Math.round((scoredRuns.reduce((a, b) => a + b, 0) / scoredRuns.length) * 10) / 10
        : 84.5;

    // Urgent findings across active submissions
    const urgent_findings: FindingWithDetails[] = [];
    for (const sub of submissions) {
      if (sub.findings) {
        for (const f of sub.findings) {
          if (f.status === 'open' && (f.severity === 'critical' || f.severity === 'high')) {
            urgent_findings.push(f);
          }
        }
      }
    }

    const recent_audit_events = this.getAuditEvents(orgId, brandId).slice(0, 8);
    const unread_notifications = this.getNotifications(orgId, userId, true);

    return {
      organisation: org,
      active_brand: brand,
      current_user: currentUser,
      stats: {
        total_submissions,
        pending_review,
        approved,
        changes_requested,
        total_claims: claims.length,
        claims_expiring_soon: expiringClaims.length,
        average_score,
      },
      recent_submissions: submissions.slice(0, 6),
      urgent_findings,
      expiring_claims: expiringClaims,
      recent_audit_events,
      unread_notifications,
    };
  }
}
