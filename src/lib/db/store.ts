/**
 * Inkloom AI - Persistent Multi-Tenant Data Store
 * Provides transparent persistence via local '.inkloom_data.json' or in-memory fallback,
 * seeded automatically on first launch.
 * Enforces multi-tenant isolation via organisation_id and brand_id.
 * Includes optional Supabase client integration helpers.
 */

import fs from 'fs';
import { AsyncLocalStorage } from 'async_hooks';
import { createHash } from 'crypto';
import path from 'path';
import os from 'os';
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

// ponytail: on Vercel the deploy dir is read-only, so the file lives in per-instance /tmp
// (not shared across serverless instances). Upgrade path: Supabase, schema in supabase/.
let useTmp = !!process.env.VERCEL;
function getDataFilePath(): string {
  if (useTmp) return path.join(os.tmpdir(), 'adsnitch-data.json');
  try {
    return path.join(process.cwd(), DATA_FILE_NAME);
  } catch {
    return DATA_FILE_NAME;
  }
}

// ---------------------------------------------------------------------------
// Supabase persistence: one JSON document per organisation (public.app_state,
// id = organisation id). Each API request runs inside its own context
// (AsyncLocalStorage), pulls its organisation's document, and writes it back
// with a compare-and-swap on `version`. A concurrent write makes the CAS fail
// and withStore re-runs the request on fresh data instead of overwriting.
// ponytail: whole-document CAS per org; split hot tables out when one org has
// enough concurrent writers that retries become common.
// ---------------------------------------------------------------------------
interface StoreCtx {
  state: InkloomDatabaseState | null;
  remote: boolean;
  dirty: boolean;
  docId: string | null;
  version: number;
  /** Anonymous public checks: seed data, never persisted. */
  ephemeral: boolean;
  /** Audit events created during this request, mirrored to the append-only audit_log table on save. */
  newAudit: AuditEvent[];
}
const als = new AsyncLocalStorage<StoreCtx>();
const fallbackCtx: StoreCtx = { state: null, remote: false, dirty: false, docId: null, version: 0, ephemeral: false, newAudit: [] };
const cur = (): StoreCtx => als.getStore() ?? fallbackCtx;

export class StoreConflictError extends Error {}

/** Run fn with an isolated store context (one per request). */
export function runWithStore<T>(fn: () => Promise<T>): Promise<T> {
  return als.run({ state: null, remote: false, dirty: false, docId: null, version: 0, ephemeral: false, newAudit: [] }, fn);
}

/** Load the organisation's document. orgId null = anonymous: seed data in memory only. */
export async function syncFromRemote(orgId: string | null): Promise<void> {
  const ctx = cur();
  if (orgId === null) {
    ctx.state = createInitialSeedState();
    ctx.ephemeral = true;
    ctx.remote = true; // never touch the file store either
    ctx.dirty = false;
    return;
  }
  const sb = getSupabaseClient();
  if (!sb || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const { data, error } = await sb.from('app_state').select('data, version').eq('id', orgId).maybeSingle();
  if (error) throw new Error(`Supabase read failed: ${error.message}`);
  ctx.docId = orgId;
  ctx.remote = true;
  if (data?.data) {
    ctx.version = Number(data.version) || 0;
    ctx.state = backfillSeed(data.data as InkloomDatabaseState);
    ctx.dirty = false;
  } else {
    ctx.version = 0;
    ctx.state = createInitialSeedState();
    ctx.dirty = true;
  }
}

export async function flushToRemote(): Promise<void> {
  const ctx = cur();
  if (ctx.ephemeral || !ctx.remote || !ctx.dirty || !ctx.state || !ctx.docId) return;
  const sb = getSupabaseClient();
  if (!sb) return;
  const { data, error } = await sb.rpc('app_state_cas', { p_id: ctx.docId, p_version: ctx.version, p_data: ctx.state });
  if (error) throw new Error(`Supabase write failed: ${error.message}`);
  if (data === null || data === undefined) throw new StoreConflictError('Someone else saved at the same time.');
  ctx.version = Number(data);
  ctx.dirty = false;
  if (ctx.newAudit.length) {
    const rows = ctx.newAudit.map((e) => ({
      id: e.id, organization_id: ctx.docId, brand_id: e.brand_id ?? null, user_id: e.user_id ?? null,
      entity_type: e.entity_type, entity_id: e.entity_id, action: e.action, metadata: e.metadata ?? {},
      hash: e.hash ?? null, prev_hash: e.prev_hash ?? null, created_at: e.created_at,
    }));
    ctx.newAudit = [];
    // The document is already saved; a failed mirror is logged, not surfaced as a failed request.
    const { error: auditErr } = await sb.from('audit_log').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
    if (auditErr) console.error('audit_log mirror failed', auditErr.message);
  }
}

/** Organisation whose document this request loaded (null outside a request or when signed out). */
export function currentOrgId(): string | null {
  return cur().docId;
}

export function isRemoteStoreActive(): boolean {
  return cur().remote;
}

// Re-reads the file every call so warm instances see writes from other requests.
/** Add seed rows (by id) missing from an older data file, e.g. a brand added to the seed later. Never overwrites saved rows. */
function backfillSeed(state: InkloomDatabaseState): InkloomDatabaseState {
  scrubSeedReferences(state);
  if (state.brands?.some((b) => b.id === SEED_IDS.BRAND_LUMINA)) return state; // one-time migration
  const seed = createInitialSeedState() as unknown as Record<string, { id: string }[]>;
  const st = state as unknown as Record<string, { id: string }[]>;
  for (const key of Object.keys(seed)) {
    const ids = new Set((st[key] ??= []).map((r) => r.id));
    for (const row of seed[key]) if (!ids.has(row.id)) st[key].push(row);
  }
  return state;
}

function loadState(): InkloomDatabaseState {
  const ctx = cur();
  if (ctx.remote && ctx.state) return ctx.state;
  const filePath = getDataFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const s = backfillSeed(JSON.parse(fs.readFileSync(filePath, 'utf-8')) as InkloomDatabaseState);
      ctx.state = s;
      return s;
    }
  } catch (err) {
    console.warn('[Inkloom DB] Unable to read data file, using memory:', err);
  }
  if (ctx.state) return ctx.state;
  const fresh = createInitialSeedState();
  saveState(fresh);
  return fresh;
}

function saveState(state: InkloomDatabaseState): void {
  cur().state = state;
  if (cur().remote) {
    cur().dirty = true;
    return;
  }
  const body = JSON.stringify(state, null, 2);
  try {
    fs.writeFileSync(getDataFilePath(), body, 'utf-8');
  } catch (err) {
    if (!useTmp) {
      useTmp = true; // cwd not writable: fall back to os.tmpdir()
      try { fs.writeFileSync(getDataFilePath(), body, 'utf-8'); return; } catch {}
    }
    console.warn('[Inkloom DB] Unable to persist data file (using memory):', err);
  }
}

/** SHA-256 over an audit event's sealed fields, chained to the previous event's hash. */
export function auditHash(e: AuditEvent, prevHash: string | null): string {
  return createHash('sha256')
    .update(`${prevHash ?? ''}|${e.id}|${e.entity_id}|${e.action}|${e.user_id}|${e.created_at}|${JSON.stringify(e.metadata)}`)
    .digest('hex');
}

/** Every audit write goes through here so the hash chain never has gaps. Newest first. */
function pushAudit(state: InkloomDatabaseState, e: AuditEvent): void {
  const prev = state.audit_events.find((x) => x.hash) ?? null;
  e.prev_hash = prev?.hash ?? null;
  e.hash = auditHash(e, e.prev_hash);
  state.audit_events.unshift(e);
  cur().newAudit.push(e);
}

/**
 * One-time migration: earlier seeds shipped invented citations (DOIs, trial IDs, certificates).
 * Overwrite those seed rows with the cleaned seed: evidence keeps its type plus an internal note,
 * seed claims go back to unverified. User-created rows are never touched.
 */
const SCRUB_TAG = 'scrub_seed_refs_v1';
function scrubSeedReferences(state: InkloomDatabaseState): void {
  const st = state as InkloomDatabaseState & StoreExtras;
  if (st._migrations?.includes(SCRUB_TAG)) return;
  const seed = createInitialSeedState();
  const ev = new Map(seed.claim_evidence.map((e) => [e.id, e]));
  st.claim_evidence = (st.claim_evidence ?? []).map((e) => ev.get(e.id) ?? e);
  const cl = new Map(seed.approved_claims.map((c) => [c.id, c]));
  st.approved_claims = (st.approved_claims ?? []).map((c) => {
    const s = cl.get(c.id);
    return s ? { ...c, status: s.status, verified_by: s.verified_by, required_disclosures: s.required_disclosures, permitted_context: s.permitted_context } : c;
  });
  const g = new Map(seed.brand_guidelines.map((x) => [x.id, x]));
  st.brand_guidelines = (st.brand_guidelines ?? []).map((x) => g.get(x.id) ?? x);
  const d = new Map(seed.documents.map((x) => [x.id, x]));
  st.documents = (st.documents ?? []).map((x) => d.get(x.id) ?? x);
  st._migrations = [...(st._migrations ?? []), SCRUB_TAG];
  if (cur().remote) cur().dirty = true;
}

// ---------------------------------------------------------------------------
// Knowledge-base records, uploaded files and workspace fields the typed tables
// don't carry. Kept on the same state document.
// ---------------------------------------------------------------------------
export type KbKind = 'guideline' | 'term' | 'document' | 'claim';
export interface KbItem {
  id: string; // `${brand_id}:${kind}:${key}`
  organisation_id: string;
  brand_id: string;
  kind: KbKind;
  key: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
export interface StoredFileRecord {
  id: string;
  organisation_id: string;
  brand_id: string | null;
  name: string;
  mime: string;
  size: number;
  path: string; // object path in the private 'evidence' bucket
  uploaded_by: string | null;
  created_at: string;
}
export interface Workspace {
  id: string;
  name: string;
  industry: string;
  channels: string[];
  description?: string;
  custom: boolean;
  createdAt?: string;
}
interface StoreExtras {
  kb_items?: KbItem[];
  /** `${brand}:${kind}` pairs saved at least once, so an emptied list stays empty. */
  kb_saved?: string[];
  stored_files?: StoredFileRecord[];
  _migrations?: string[];
}
type BrandX = Brand & { channels?: string[] };
const SEED_BRAND_IDS = new Set<string>([SEED_IDS.BRAND_APEX, SEED_IDS.BRAND_ZENITH, SEED_IDS.BRAND_LUMINA]);
const SEED_CHANNELS: Record<string, string[]> = {
  [SEED_IDS.BRAND_APEX]: ['Instagram', 'Landing page', 'Email'],
  [SEED_IDS.BRAND_ZENITH]: ['LinkedIn', 'Landing page', 'Ads'],
  [SEED_IDS.BRAND_LUMINA]: ['Instagram', 'TikTok', 'Product page'],
};
const ext = (s: InkloomDatabaseState) => s as InkloomDatabaseState & StoreExtras;
const cleanName = (n: unknown) => String(n ?? '').trim().replace(/\s+/g, ' ');
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

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
      (queryId === SEED_IDS.BRAND_ZENITH && targetId === 'brand_zenith') ||
      (queryId === 'brand_lumina' && targetId === SEED_IDS.BRAND_LUMINA) ||
      (queryId === SEED_IDS.BRAND_LUMINA && targetId === 'brand_lumina')
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
    pushAudit(state, auditEvent);

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
    pushAudit(state, audit);
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
    pushAudit(state, {
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
    pushAudit(state, {
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
    pushAudit(state, {
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
    creatorEvidence?: string,
    evidenceFile?: { name: string; text: string } | null
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
      // Counter-evidence lives on the finding too, so reviewers see it without opening the dispute.
      (finding as any).counter_evidence = {
        text: creatorEvidence || null,
        file: evidenceFile ? { name: evidenceFile.name, text: evidenceFile.text.slice(0, 20000) } : null,
        sha256: createHash('sha256').update(`${creatorEvidence ?? ''}|${evidenceFile?.text ?? ''}`).digest('hex'),
        disputeId: dispute.id,
        at: now,
      };

      const sub = state.submissions.find((s) => s.id === finding.submission_id);
      if (sub) {
        // Record immutable audit event
        pushAudit(state, {
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
            evidenceFile: evidenceFile?.name ?? null,
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
  ): {
    success: boolean;
    claim: ApprovedClaim;
    affectedSubmissions: Submission[];
    count: number;
    replacements: ReturnType<typeof InkloomStore.cascadeReplacement>[];
  } {
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
        pushAudit(state, {
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
    pushAudit(state, {
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
      replacements: dependentSubs.map((sub) => this.cascadeReplacement(state, claim, sub)),
    };
  }

  // --------------------------------------------------------------------------
  // Audit Events & Notifications
  // --------------------------------------------------------------------------

  /**
   * Recommended replacement for one draft hit by a cascade. Prefers a suggested revision already
   * stored on a finding that cites this claim; otherwise falls back to the claim's approved wording.
   */
  public static cascadeReplacement(state: InkloomDatabaseState, claim: ApprovedClaim, sub: Submission) {
    const fids = state.findings
      .filter((f) => f.submission_id === sub.id && (f.claimId === claim.claim_code || (f as any).claim_id === claim.id ||
        state.finding_evidence.some((fe) => fe.finding_id === f.id && fe.claim_id === claim.id)))
      .map((f) => f);
    const rev = state.suggested_revisions.find((r) => fids.some((f) => f.id === r.finding_id) && r.suggested_text);
    const finding = rev ? fids.find((f) => f.id === rev.finding_id) : fids[0];
    const disclosure = claim.required_disclosures ? ` ${claim.required_disclosures}` : '';
    const expired = claim.status === 'expired' || (claim.expires_at && new Date(claim.expires_at) < new Date());
    return {
      submissionId: sub.id,
      title: sub.title,
      originalText: finding?.highlighted_snippet || null,
      recommendedText: rev ? rev.suggested_text : `${claim.claim_text}${disclosure}`,
      source: rev ? ('suggested_revision' as const) : ('approved_claim_wording' as const),
      note: expired
        ? `Claim ${claim.claim_code} has lapsed. Use this wording only once its evidence is renewed; otherwise remove the claim.`
        : `Approved wording for ${claim.claim_code}.`,
    };
  }

  public static getUserRole(userId: string): string | undefined {
    return loadState().user_profiles.find((u) => u.id === userId)?.role;
  }

  public static getUserName(userId: string | null | undefined): string | undefined {
    if (!userId) return undefined;
    return loadState().user_profiles.find((u) => u.id === userId)?.full_name;
  }

  /**
   * Recomputes the SHA-256 chain oldest to newest. Events written before hashing existed
   * (seed data) are counted as unsealed, not passed off as verified.
   */
  public static verifyAuditChain(): {
    intact: boolean; checked: number; unsealed: number;
    brokenAt?: { id: string; action: string; created_at: string; reason: string };
  } {
    const events = loadState().audit_events.slice().reverse();
    let prev: string | null = null;
    let checked = 0, unsealed = 0, started = false;
    for (const e of events) {
      if (!e.hash) {
        if (started) return { intact: false, checked, unsealed, brokenAt: { id: e.id, action: e.action, created_at: e.created_at, reason: 'Event has no hash inside the sealed chain' } };
        unsealed++;
        continue;
      }
      started = true;
      if ((e.prev_hash ?? null) !== prev)
        return { intact: false, checked, unsealed, brokenAt: { id: e.id, action: e.action, created_at: e.created_at, reason: 'prev_hash does not match the previous event' } };
      if (auditHash(e, prev) !== e.hash)
        return { intact: false, checked, unsealed, brokenAt: { id: e.id, action: e.action, created_at: e.created_at, reason: 'Event body was changed after it was sealed' } };
      prev = e.hash;
      checked++;
    }
    return { intact: true, checked, unsealed };
  }

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

  // --------------------------------------------------------------------------
  // Workspaces (= brands)
  // --------------------------------------------------------------------------

  private static toWorkspace(b: BrandX): Workspace {
    return {
      id: b.id, name: b.name, industry: b.industry ?? 'Other',
      channels: b.channels ?? SEED_CHANNELS[b.id] ?? [],
      description: b.description ?? undefined,
      custom: !SEED_BRAND_IDS.has(b.id), createdAt: b.created_at,
    };
  }

  public static listWorkspaces(orgId: string): Workspace[] {
    return this.getBrands(orgId).map((b) => this.toWorkspace(b));
  }

  /** Resolves a brand by id, slug or name inside one organisation only. */
  public static resolveBrand(orgId: string, ref?: string | null): Brand | undefined {
    if (!ref) return undefined;
    const r = String(ref).toLowerCase();
    return this.getBrands(orgId).find((b) => b.id === ref || b.slug === ref || b.name.toLowerCase() === r);
  }

  private static checkWorkspace(orgId: string, name: string, industry: unknown, channels: unknown, selfId?: string): string | null {
    if (name.length < 2) return 'Give the workspace a name of at least 2 characters.';
    if (name.length > 60) return 'Keep the name under 60 characters.';
    if (this.getBrands(orgId).some((b) => b.id !== selfId && b.name.toLowerCase() === name.toLowerCase()))
      return `A workspace called "${name}" already exists. Pick it from the list instead.`;
    if (industry !== undefined && (typeof industry !== 'string' || !industry.trim() || industry.length > 60)) return 'Pick an industry.';
    if (channels !== undefined && (!Array.isArray(channels) || !channels.length || channels.some((c) => typeof c !== 'string' || c.length > 40)))
      return 'Pick at least one channel.';
    return null;
  }

  public static createWorkspace(
    orgId: string,
    input: { name?: unknown; industry?: unknown; channels?: unknown; description?: unknown },
    userId?: string
  ): { ok: true; workspace: Workspace } | { ok: false; error: string } {
    const name = cleanName(input.name);
    const err = this.checkWorkspace(orgId, name, input.industry ?? 'Other', input.channels ?? []);
    if (err) return { ok: false, error: err };
    const state = loadState();
    const now = new Date().toISOString();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'workspace';
    const brand: BrandX = {
      id: crypto.randomUUID(), organisation_id: orgId, name,
      slug: state.brands.some((b) => b.slug === slug) ? `${slug}-${Date.now().toString(36)}` : slug,
      industry: String(input.industry ?? 'Other'), description: cleanName(input.description).slice(0, 400) || null,
      is_active: true, compliance_threshold: 80,
      settings: { auto_flag_unsubstantiated: true, strict_prohibited_terms: true, require_clinical_doi: false },
      channels: input.channels as string[], created_at: now, updated_at: now,
    };
    state.brands.push(brand);
    pushAudit(state, this.auditRow(orgId, brand.id, userId, 'brand', brand.id, 'workspace_created', { name }));
    saveState(state);
    return { ok: true, workspace: this.toWorkspace(brand) };
  }

  public static updateWorkspace(
    orgId: string,
    id: string,
    patch: { name?: unknown; industry?: unknown; channels?: unknown; description?: unknown },
    userId?: string
  ): { ok: true; workspace: Workspace } | { ok: false; error: string; status: number } {
    const state = loadState();
    const brand = state.brands.find((b) => b.organisation_id === orgId && b.id === id) as BrandX | undefined;
    if (!brand) return { ok: false, error: 'Workspace not found.', status: 404 };
    if (SEED_BRAND_IDS.has(brand.id)) return { ok: false, error: "Built-in workspaces can't be edited.", status: 403 };
    const name = patch.name === undefined ? brand.name : cleanName(patch.name);
    const err = this.checkWorkspace(orgId, name, patch.industry, patch.channels, brand.id);
    if (err) return { ok: false, error: err, status: 400 };
    const before = this.toWorkspace(brand);
    brand.name = name;
    if (patch.industry !== undefined) brand.industry = patch.industry as string;
    if (patch.channels !== undefined) brand.channels = patch.channels as string[];
    if (patch.description !== undefined) brand.description = cleanName(patch.description).slice(0, 400) || null;
    brand.updated_at = new Date().toISOString();
    pushAudit(state, this.auditRow(orgId, brand.id, userId, 'brand', brand.id, 'workspace_updated', { before, after: this.toWorkspace(brand) }));
    saveState(state);
    return { ok: true, workspace: this.toWorkspace(brand) };
  }

  private static auditRow(
    orgId: string, brandId: string | null, userId: string | undefined,
    entityType: string, entityId: string, action: string, metadata: Record<string, unknown>
  ): AuditEvent {
    return {
      id: crypto.randomUUID(), organisation_id: orgId, brand_id: brandId, user_id: userId || SEED_IDS.USER_DAKSH,
      entity_type: entityType as AuditEvent['entity_type'], entity_id: entityId, action: action as AuditEvent['action'],
      ip_address: null, metadata, created_at: new Date().toISOString(),
    };
  }

  // --------------------------------------------------------------------------
  // Knowledge-base records (guidelines, terms, documents, claim review records)
  // --------------------------------------------------------------------------

  /** One brand's records of one kind. `saved` stays false until the brand saves this kind once. */
  public static listKbItems(orgId: string, brandId: string, kind: KbKind): { items: Record<string, unknown>[]; saved: boolean } {
    const st = ext(loadState());
    const items = (st.kb_items ?? [])
      .filter((i) => i.organisation_id === orgId && i.brand_id === brandId && i.kind === kind)
      .map((i) => i.data);
    return { items, saved: (st.kb_saved ?? []).includes(`${brandId}:${kind}`) };
  }

  /**
   * Replaces one brand's list of one kind (order kept) and audits what was added, changed and removed.
   * ponytail: whole-list replace, last write wins. Move to per-item endpoints if two editors collide.
   */
  public static replaceKbItems(
    orgId: string, brandId: string, kind: KbKind, items: Record<string, unknown>[],
    keyOf: (d: Record<string, unknown>) => string, userId?: string
  ) {
    const st = ext(loadState());
    const all = st.kb_items ?? [];
    const isMine = (i: KbItem) => i.organisation_id === orgId && i.brand_id === brandId && i.kind === kind;
    const prev = new Map(all.filter(isMine).map((i) => [i.key, i]));
    const now = new Date().toISOString();
    const added: string[] = [], changed: string[] = [];
    const next: KbItem[] = [];
    for (const data of items) {
      const key = keyOf(data);
      if (!key || next.some((n) => n.key === key)) continue;
      const old = prev.get(key);
      const dirty = !old || !same(old.data, data);
      if (!old) added.push(key);
      else if (dirty) changed.push(key);
      next.push({
        id: `${brandId}:${kind}:${key}`, organisation_id: orgId, brand_id: brandId, kind, key, data,
        created_at: old?.created_at ?? now, updated_at: dirty ? now : old!.updated_at,
      });
    }
    const removed = [...prev.keys()].filter((k) => !next.some((n) => n.key === k));
    st.kb_items = [...all.filter((i) => !isMine(i)), ...next];
    const tag = `${brandId}:${kind}`;
    st.kb_saved = [...new Set([...(st.kb_saved ?? []), tag])];
    if (added.length || changed.length || removed.length)
      pushAudit(st, this.auditRow(orgId, brandId, userId, 'brand', brandId, `${kind}s_updated`, { kind, added, changed, removed }));
    saveState(st);
    return { items: next.map((i) => i.data), added: added.length, changed: changed.length, removed: removed.length };
  }

  /** Upserts one record (per-claim review records: edits, attached evidence, sign-offs). */
  public static putKbItem(
    orgId: string, brandId: string, kind: KbKind, key: string, data: Record<string, unknown>,
    action: string, meta: Record<string, unknown>, userId?: string
  ) {
    const st = ext(loadState());
    const all = (st.kb_items ??= []);
    const id = `${brandId}:${kind}:${key}`;
    const now = new Date().toISOString();
    const i = all.findIndex((x) => x.id === id);
    const row: KbItem = { id, organisation_id: orgId, brand_id: brandId, kind, key, data, created_at: i >= 0 ? all[i].created_at : now, updated_at: now };
    if (i >= 0) all[i] = row;
    else all.push(row);
    pushAudit(st, this.auditRow(orgId, brandId, userId, kind === 'claim' ? 'claim' : 'brand', key, action, meta));
    saveState(st);
    return row.data;
  }

  // --------------------------------------------------------------------------
  // Uploaded originals (bytes live in Supabase Storage, private bucket 'evidence')
  // --------------------------------------------------------------------------

  public static addStoredFile(rec: StoredFileRecord): StoredFileRecord {
    const st = ext(loadState());
    (st.stored_files ??= []).push(rec);
    pushAudit(st, this.auditRow(rec.organisation_id, rec.brand_id, rec.uploaded_by ?? undefined, 'document', rec.id, 'file_uploaded', { name: rec.name, size: rec.size, mime: rec.mime }));
    saveState(st);
    return rec;
  }

  public static getStoredFile(orgId: string, id: string): StoredFileRecord | undefined {
    return (ext(loadState()).stored_files ?? []).find((f) => f.organisation_id === orgId && f.id === id);
  }
}
