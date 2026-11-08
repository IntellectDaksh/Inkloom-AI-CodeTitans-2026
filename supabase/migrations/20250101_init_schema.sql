-- ============================================================================
-- Inkloom AI - Production Database Migration
-- Multi-Tenant Brand Governance & Compliance Platform Schema
-- Migration: 20250101_init_schema.sql
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Drop existing triggers & functions if re-running
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS current_user_org_ids() CASCADE;
DROP FUNCTION IF EXISTS is_org_admin(UUID) CASCADE;

-- Reusable timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLE DEFINITIONS (25 Core Entities)
-- ============================================================================

-- 1. Organisations
CREATE TABLE IF NOT EXISTS organisations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    plan VARCHAR(50) NOT NULL DEFAULT 'enterprise' CHECK (plan IN ('starter', 'growth', 'enterprise')),
    logo_url TEXT,
    settings JSONB NOT NULL DEFAULT '{"enforce_approval_chain": true, "ai_guardrails_enabled": true, "default_tone_check": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'creator' CHECK (role IN ('admin', 'brand_manager', 'creator', 'reviewer')),
    job_title VARCHAR(100),
    preferences JSONB NOT NULL DEFAULT '{"notifications_email": true, "notifications_in_app": true, "theme": "system"}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Organisation Members
CREATE TABLE IF NOT EXISTS organisation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'creator' CHECK (role IN ('admin', 'brand_manager', 'creator', 'reviewer')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_org_member UNIQUE(organisation_id, user_id)
);

-- 4. Brands
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    industry VARCHAR(100),
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    compliance_threshold NUMERIC(5,2) NOT NULL DEFAULT 85.00 CHECK (compliance_threshold >= 0 AND compliance_threshold <= 100),
    settings JSONB NOT NULL DEFAULT '{"auto_flag_unsubstantiated": true, "strict_prohibited_terms": true, "require_clinical_doi": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_org_brand_slug UNIQUE(organisation_id, slug)
);

-- 5. Brand Members
CREATE TABLE IF NOT EXISTS brand_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'creator' CHECK (role IN ('brand_manager', 'creator', 'reviewer', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_brand_member UNIQUE(brand_id, user_id)
);

-- 6. Brand Guidelines
CREATE TABLE IF NOT EXISTS brand_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('voice_and_tone', 'messaging_rules', 'dos_and_donts', 'prohibited_words', 'visual_identity', 'regulatory_standards')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rule_content TEXT NOT NULL,
    severity_level VARCHAR(30) NOT NULL DEFAULT 'high' CHECK (severity_level IN ('critical', 'high', 'medium', 'low', 'informational')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    embedding vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Guideline Versions
CREATE TABLE IF NOT EXISTS guideline_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guideline_id UUID NOT NULL REFERENCES brand_guidelines(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    rule_content TEXT NOT NULL,
    changelog TEXT,
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_guideline_version UNIQUE(guideline_id, version_number)
);

-- 8. Approved Claims
CREATE TABLE IF NOT EXISTS approved_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    claim_code VARCHAR(50) NOT NULL,
    claim_text TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('efficacy', 'safety', 'sourcing', 'performance', 'certifications')),
    status VARCHAR(50) NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'under_review', 'expired', 'deprecated', 'disputed')),
    permitted_context TEXT NOT NULL,
    restricted_context TEXT NOT NULL,
    required_disclosures TEXT,
    expires_at TIMESTAMPTZ,
    verified_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    embedding vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_brand_claim_code UNIQUE(brand_id, claim_code)
);

-- 9. Claim Evidence
CREATE TABLE IF NOT EXISTS claim_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES approved_claims(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    citation TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    study_url TEXT,
    evidence_type VARCHAR(50) NOT NULL CHECK (evidence_type IN ('clinical_trial', 'lab_report', 'fda_notification', 'iso_cert', 'legal_opinion')),
    confidence_score NUMERIC(4,2) NOT NULL DEFAULT 0.95 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    embedding vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Brand Terms
CREATE TABLE IF NOT EXISTS brand_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    term VARCHAR(255) NOT NULL,
    term_type VARCHAR(50) NOT NULL CHECK (term_type IN ('prohibited', 'preferred', 'restricted', 'trademark')),
    replacement VARCHAR(255),
    rationale TEXT NOT NULL,
    context_rules TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Brand Assets
CREATE TABLE IF NOT EXISTS brand_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('logo', 'banner', 'font', 'color_palette', 'disclaimer_block', 'packaging')),
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('pdf', 'docx', 'txt', 'csv', 'md')),
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'indexed' CHECK (status IN ('processing', 'indexed', 'failed')),
    uploaded_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Document Extractions
CREATE TABLE IF NOT EXISTS document_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    embedding vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_doc_chunk UNIQUE(document_id, chunk_index)
);

-- 14. Submissions
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    submission_type VARCHAR(50) NOT NULL CHECK (submission_type IN ('reel_script', 'social_post', 'banner_copy', 'newsletter', 'landing_page', 'video_ad')),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'changes_requested', 'resubmitted', 'approved', 'rejected', 'archived')),
    creator_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    assigned_reviewer_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    raw_content TEXT NOT NULL,
    current_version_number INTEGER NOT NULL DEFAULT 1,
    metadata JSONB NOT NULL DEFAULT '{"campaign": "Q4 Growth", "target_channels": ["Instagram", "Meta Ads"]}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Submission Versions
CREATE TABLE IF NOT EXISTS submission_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    change_summary TEXT,
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_sub_version UNIQUE(submission_id, version_number)
);

-- 16. Analysis Runs
CREATE TABLE IF NOT EXISTS analysis_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    submission_version_id UUID NOT NULL REFERENCES submission_versions(id) ON DELETE CASCADE,
    triggered_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'completed' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
    overall_score NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (overall_score >= 0 AND overall_score <= 100),
    compliance_rating VARCHAR(50) NOT NULL DEFAULT 'warning' CHECK (compliance_rating IN ('compliant', 'warning', 'non_compliant')),
    summary TEXT,
    issues_count INTEGER NOT NULL DEFAULT 0,
    critical_issues_count INTEGER NOT NULL DEFAULT 0,
    run_duration_ms INTEGER NOT NULL DEFAULT 1240,
    model_used VARCHAR(100) NOT NULL DEFAULT 'inkloom-governance-v2.4',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Findings
CREATE TABLE IF NOT EXISTS findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_run_id UUID NOT NULL REFERENCES analysis_runs(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('unsupported_claim', 'time_bound_claim', 'tone_inconsistency', 'prohibited_term', 'missing_disclosure', 'out_of_scope')),
    severity VARCHAR(30) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'informational')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    highlighted_snippet TEXT NOT NULL,
    line_number_start INTEGER,
    line_number_end INTEGER,
    character_start INTEGER,
    character_end INTEGER,
    rule_ref VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'disputed', 'ignored')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. Finding Evidence
CREATE TABLE IF NOT EXISTS finding_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finding_id UUID NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
    claim_id UUID REFERENCES approved_claims(id) ON DELETE SET NULL,
    guideline_id UUID REFERENCES brand_guidelines(id) ON DELETE SET NULL,
    citation TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    confidence_score NUMERIC(4,2) NOT NULL DEFAULT 0.95 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    match_type VARCHAR(50) NOT NULL CHECK (match_type IN ('direct_contradiction', 'missing_qualifier', 'unverified_stat', 'forbidden_vocabulary', 'unregistered_claim')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. Suggested Revisions
CREATE TABLE IF NOT EXISTS suggested_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finding_id UUID NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
    original_text TEXT NOT NULL,
    suggested_text TEXT NOT NULL,
    explanation TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'accepted', 'rejected', 'modified')),
    applied_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    applied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. Approval Requests
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    target_reviewer_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
    notes TEXT,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. Approval Decisions
CREATE TABLE IF NOT EXISTS approval_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    decided_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('approved', 'rejected', 'changes_requested')),
    comments TEXT,
    conditions TEXT,
    decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. Comments
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    finding_id UUID REFERENCES findings(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_internal_only BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23. Disputes
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finding_id UUID NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
    raised_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    creator_evidence TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'rejected', 'under_review')),
    resolved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 24. Audit Events
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('submission', 'claim', 'guideline', 'analysis_run', 'approval', 'dispute', 'brand_term')),
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'updated', 'analyzed', 'approved', 'rejected', 'disputed', 'exported', 'archived')),
    ip_address VARCHAR(45),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 25. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('analysis_completed', 'review_assigned', 'changes_requested', 'claim_expiring', 'approval_granted', 'finding_disputed')),
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- AUTOMATED TRIGGERS FOR updated_at
-- ============================================================================

DO $$
DECLARE
    tbl text;
    tables_to_update text[] := ARRAY[
        'organisations', 'user_profiles', 'organisation_members', 'brands',
        'brand_members', 'brand_guidelines', 'approved_claims', 'claim_evidence',
        'brand_terms', 'brand_assets', 'documents', 'submissions',
        'findings', 'approval_requests', 'comments', 'disputes'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables_to_update LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_update_%I ON %I;', tbl, tbl);
        EXECUTE format('CREATE TRIGGER trigger_update_%I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', tbl, tbl);
    END LOOP;
END $$;

-- ============================================================================
-- COMPREHENSIVE PERFORMANCE INDEXES
-- ============================================================================

-- Multi-tenant isolation indexes (organisation_id)
CREATE INDEX IF NOT EXISTS idx_users_org ON user_profiles(organisation_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organisation_members(organisation_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organisation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_org ON brands(organisation_id);
CREATE INDEX IF NOT EXISTS idx_guidelines_org ON brand_guidelines(organisation_id);
CREATE INDEX IF NOT EXISTS idx_claims_org ON approved_claims(organisation_id);
CREATE INDEX IF NOT EXISTS idx_terms_org ON brand_terms(organisation_id);
CREATE INDEX IF NOT EXISTS idx_assets_org ON brand_assets(organisation_id);
CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(organisation_id);
CREATE INDEX IF NOT EXISTS idx_submissions_org ON submissions(organisation_id);
CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_events(organisation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org ON notifications(organisation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

-- Brand scoping indexes
CREATE INDEX IF NOT EXISTS idx_brand_members_brand ON brand_members(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_members_user ON brand_members(user_id);
CREATE INDEX IF NOT EXISTS idx_guidelines_brand ON brand_guidelines(brand_id);
CREATE INDEX IF NOT EXISTS idx_claims_brand ON approved_claims(brand_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON approved_claims(brand_id, status);
CREATE INDEX IF NOT EXISTS idx_claims_expiry ON approved_claims(expires_at) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_terms_brand ON brand_terms(brand_id, term_type);
CREATE INDEX IF NOT EXISTS idx_assets_brand ON brand_assets(brand_id, asset_type);
CREATE INDEX IF NOT EXISTS idx_documents_brand ON documents(brand_id, status);
CREATE INDEX IF NOT EXISTS idx_submissions_brand_status ON submissions(brand_id, status);
CREATE INDEX IF NOT EXISTS idx_submissions_creator ON submissions(creator_id);
CREATE INDEX IF NOT EXISTS idx_submissions_reviewer ON submissions(assigned_reviewer_id);

-- Relational traversal & workflow indexes
CREATE INDEX IF NOT EXISTS idx_claim_evidence_claim ON claim_evidence(claim_id);
CREATE INDEX IF NOT EXISTS idx_doc_extractions_doc ON document_extractions(document_id);
CREATE INDEX IF NOT EXISTS idx_sub_versions_sub ON submission_versions(submission_id);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_sub ON analysis_runs(submission_id);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_version ON analysis_runs(submission_version_id);
CREATE INDEX IF NOT EXISTS idx_findings_run ON findings(analysis_run_id);
CREATE INDEX IF NOT EXISTS idx_findings_sub ON findings(submission_id);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON findings(submission_id, severity);
CREATE INDEX IF NOT EXISTS idx_finding_evidence_finding ON finding_evidence(finding_id);
CREATE INDEX IF NOT EXISTS idx_revisions_finding ON suggested_revisions(finding_id);
CREATE INDEX IF NOT EXISTS idx_approvals_sub ON approval_requests(submission_id);
CREATE INDEX IF NOT EXISTS idx_approval_decisions_req ON approval_decisions(request_id);
CREATE INDEX IF NOT EXISTS idx_comments_sub ON comments(submission_id);
CREATE INDEX IF NOT EXISTS idx_comments_finding ON comments(finding_id);
CREATE INDEX IF NOT EXISTS idx_disputes_finding ON disputes(finding_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_events(entity_type, entity_id);

-- Vector Similarity Indexes (HNSW for rapid cosine distance search)
CREATE INDEX IF NOT EXISTS idx_guidelines_vector ON brand_guidelines USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_approved_claims_vector ON approved_claims USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_vector ON claim_evidence USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_doc_extractions_vector ON document_extractions USING hnsw (embedding vector_cosine_ops);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict multi-tenant isolation enforcing organisation_id matching auth.uid()
-- ============================================================================

-- Enable RLS across all tables
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE guideline_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE finding_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggested_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: Get organisation IDs for the current user session
CREATE OR REPLACE FUNCTION current_user_org_ids()
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    SELECT organisation_id
    FROM organisation_members
    WHERE user_id = auth.uid()
    UNION
    SELECT organisation_id
    FROM user_profiles
    WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: Check if current user is an admin for the organisation
CREATE OR REPLACE FUNCTION is_org_admin(target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM organisation_members
        WHERE organisation_id = target_org_id
          AND user_id = auth.uid()
          AND role = 'admin'
    ) OR EXISTS (
        SELECT 1
        FROM user_profiles
        WHERE id = auth.uid()
          AND organisation_id = target_org_id
          AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 1. Organisations RLS
CREATE POLICY "org_member_select" ON organisations
    FOR SELECT USING (id IN (SELECT current_user_org_ids()));

CREATE POLICY "org_admin_update" ON organisations
    FOR UPDATE USING (is_org_admin(id));

-- 2. User Profiles RLS
CREATE POLICY "user_profile_org_select" ON user_profiles
    FOR SELECT USING (organisation_id IN (SELECT current_user_org_ids()));

CREATE POLICY "user_profile_self_update" ON user_profiles
    FOR UPDATE USING (id = auth.uid() OR is_org_admin(organisation_id));

-- 3. Organisation Members RLS
CREATE POLICY "org_members_select" ON organisation_members
    FOR SELECT USING (organisation_id IN (SELECT current_user_org_ids()));

CREATE POLICY "org_members_admin_modify" ON organisation_members
    FOR ALL USING (is_org_admin(organisation_id));

-- 4. Brands RLS
CREATE POLICY "brands_org_select" ON brands
    FOR SELECT USING (organisation_id IN (SELECT current_user_org_ids()));

CREATE POLICY "brands_manager_all" ON brands
    FOR ALL USING (
        organisation_id IN (SELECT current_user_org_ids()) AND (
            is_org_admin(organisation_id) OR
            EXISTS (
                SELECT 1 FROM brand_members
                WHERE brand_members.brand_id = brands.id
                  AND brand_members.user_id = auth.uid()
                  AND brand_members.role = 'brand_manager'
            )
        )
    );

-- 5. Brand Members RLS
CREATE POLICY "brand_members_select" ON brand_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM brands
            WHERE brands.id = brand_members.brand_id
              AND brands.organisation_id IN (SELECT current_user_org_ids())
        )
    );

CREATE POLICY "brand_members_admin_modify" ON brand_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM brands
            WHERE brands.id = brand_members.brand_id
              AND is_org_admin(brands.organisation_id)
        )
    );

-- 6. Brand Guidelines RLS
CREATE POLICY "guidelines_org_select" ON brand_guidelines
    FOR SELECT USING (organisation_id IN (SELECT current_user_org_ids()));

CREATE POLICY "guidelines_manage" ON brand_guidelines
    FOR ALL USING (organisation_id IN (SELECT current_user_org_ids()));

-- 7. Guideline Versions RLS
CREATE POLICY "guideline_versions_select" ON guideline_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM brand_guidelines
            WHERE brand_guidelines.id = guideline_versions.guideline_id
              AND brand_guidelines.organisation_id IN (SELECT current_user_org_ids())
        )
    );

CREATE POLICY "guideline_versions_insert" ON guideline_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM brand_guidelines
            WHERE brand_guidelines.id = guideline_versions.guideline_id
              AND brand_guidelines.organisation_id IN (SELECT current_user_org_ids())
        )
    );

-- 8. Approved Claims RLS
CREATE POLICY "claims_org_select" ON approved_claims
    FOR SELECT USING (organisation_id IN (SELECT current_user_org_ids()));

CREATE POLICY "claims_org_modify" ON approved_claims
    FOR ALL USING (organisation_id IN (SELECT current_user_org_ids()));

-- 9. Claim Evidence RLS
CREATE POLICY "claim_evidence_select" ON claim_evidence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM approved_claims
            WHERE approved_claims.id = claim_evidence.claim_id
              AND approved_claims.organisation_id IN (SELECT current_user_org_ids())
        )
    );

CREATE POLICY "claim_evidence_modify" ON claim_evidence
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM approved_claims
            WHERE approved_claims.id = claim_evidence.claim_id
              AND approved_claims.organisation_id IN (SELECT current_user_org_ids())
        )
    );

-- 10. Brand Terms RLS
CREATE POLICY "brand_terms_org_select" ON brand_terms
    FOR SELECT USING (organisation_id IN (SELECT current_user_org_ids()));

CREATE POLICY "brand_terms_org_modify" ON brand_terms
    FOR ALL USING (organisation_id IN (SELECT current_user_org_ids()));

-- 11. Brand Assets RLS
CREATE POLICY "brand_assets_org_select" ON brand_assets
    FOR SELECT USING (organisation_id IN (SELECT current_user_org_ids()));

CREATE POLICY "brand_assets_org_modify" ON brand_assets
    FOR ALL USING (organisation_id IN (SELECT current_user_org_ids()));

-- 12. Documents RLS
CREATE POLICY "documents_org_select" ON documents
    FOR SELECT USING (organisation_id IN (SELECT current_user_org_ids()));

CREATE POLICY "documents_org_modify" ON documents
    FOR ALL USING (organisation_id IN (SELECT current_user_org_ids()));

-- 13. Document Extractions RLS
CREATE POLICY "doc_extractions_select" ON document_extractions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_extractions.document_id
              AND documents.organisation_id IN (SELECT current_user_org_ids())
        )
    );

CREATE POLICY "doc_extractions_modify" ON document_extractions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_extractions.document_id
              AND documents.organisation_id IN (SELECT current_user_org_ids())
        )
    );

-- 14. Submissions RLS
CREATE POLICY "submissions_org_select" ON submissions
    FOR SELECT USING (organisation_id IN (SELECT current_user_org_ids()));

CREATE POLICY "submissions_org_insert" ON submissions
    FOR INSERT WITH CHECK (organisation_id IN (SELECT current_user_org_ids()));

CREATE POLICY "submissions_org_update" ON submissions
    FOR UPDATE USING (organisation_id IN (SELECT current_user_org_ids()));

CREATE POLICY "submissions_org_delete" ON submissions
    FOR DELETE USING (organisation_id IN (SELECT current_user_org_ids()) AND (creator_id = auth.uid() OR is_org_admin(organisation_id)));

-- 15. Submission Versions RLS
CREATE POLICY "sub_versions_select" ON submission_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM submissions
            WHERE submissions.id = submission_versions.submission_id
              AND submissions.organisation_id IN (SELECT current_user_org_ids())
        )
    );

CREATE POLICY "sub_versions_insert" ON submission_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM submissions
            WHERE submissions.id = submission_versions.submission_id
              AND submissions.organisation_id IN (SELECT current_user_org_ids())
        )
    );

-- 16. Analysis Runs RLS
CREATE POLICY "analysis_runs_select" ON analysis_runs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM submissions
            WHERE submissions.id = analysis_runs.submission_id
              AND submissions.organisation_id IN (SELECT current_user_org_ids())
        )
    );

CREATE POLICY "analysis_runs_insert" ON analysis_runs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM submissions
            WHERE submissions.id = analysis_runs.submission_id
              AND submissions.organisation_id IN (SELECT current_user_org_ids())
        )
    );

-- 17. Findings RLS
CREATE POLICY "findings_select" ON findings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM submissions
            WHERE submissions.id = findings.submission_id
              AND submissions.organisation_id IN (SELECT current_user_org_ids())
        )
    );

CREATE POLICY "findings_modify" ON findings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM submissions
            WHERE submissions.id = findings.submission_id
              AND submissions.organisation_id IN (SELECT current_user_org_ids())
        )
    );

-- 18. Finding Evidence RLS
CREATE POLICY "finding_evidence_select" ON finding_evidence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM findings
            JOIN submissions ON submissions.id = findings.submission_id
            WHERE findings.id = finding_evidence.finding_id
              AND submissions.organisation_id IN (SELECT current_user_org_ids())
        )
    );

CREATE POLICY "finding_evidence_modify" ON finding_evidence
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM findings
            JOIN submissions ON submissions.id = findings.submission_id
            WHERE findings.id = finding_evidence.finding_id
              AND submissions.organisation_id IN (SELECT current_user_org_ids())
        )
    );

-- 19. Suggested Revisions RLS
CREATE POLICY "revisions_select" ON suggested_revisions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM findings
            JOIN submissions ON submissions.id = findings.submission_id
            WHERE findings.id = suggested_revisions.finding_id
              AND submissions.organisation_id IN (SELECT current_user_org_ids())
        )
    );

CREATE POLICY "revisions_modify" ON suggested_revisions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM findings
            JOIN submissions ON submissions.id = findings.submission_id
            WHERE findings.id = suggested_revisions.finding_id
              AND submissions.organisation_id IN (SELECT current_user_org_ids())
        )
    );

-- 20. Approval Requests RLS
CREATE POLICY "approval_requests_select" ON approval_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM submissions
            WHERE submissions.id = approval_requests.submission_id
              AND submissions.organisation_id IN (SELECT current_user_org_ids())
        )
    );

CREATE POLICY "approval_requests_modify" ON approval_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM submissions
            WHERE submissions.id = approval_requests.submission_id
              AND submissions.organisation_id IN (SELECT current_user_org_ids())
        )
    );

-- 21. Approval Decisions RLS
CREATE POLICY "approval_decisions_select" ON approval_decisions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM submissions
            WHERE submissions.id = approval_decisions.submission_id
              AND submissions.organisation_id IN (SELECT current_user_org_ids())
        )
    );

CREATE POLICY "approval_decisions_insert" ON approval_decisions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM submissions
            WHERE submissions.id = approval_decisions.submission_id
              AND submissions.organisation_id IN (SELECT current_user_org_ids())
        )
    );

-- 22. Comments RLS
CREATE POLICY "comments_select" ON comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM submissions
            WHERE submissions.id = comments.submission_id
              AND submissions.organisation_id IN (SELECT current_user_org_ids())
        )
    );

CREATE POLICY "comments_insert" ON comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM submissions
            WHERE submissions.id = comments.submission_id
              AND submissions.organisation_id IN (SELECT current_user_org_ids())
        )
    );

CREATE POLICY "comments_modify" ON comments
    FOR UPDATE USING (author_id = auth.uid());

-- 23. Disputes RLS
CREATE POLICY "disputes_select" ON disputes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM findings
            JOIN submissions ON submissions.id = findings.submission_id
            WHERE findings.id = disputes.finding_id
              AND submissions.organisation_id IN (SELECT current_user_org_ids())
        )
    );

CREATE POLICY "disputes_modify" ON disputes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM findings
            JOIN submissions ON submissions.id = findings.submission_id
            WHERE findings.id = disputes.finding_id
              AND submissions.organisation_id IN (SELECT current_user_org_ids())
        )
    );

-- 24. Audit Events RLS
CREATE POLICY "audit_org_select" ON audit_events
    FOR SELECT USING (organisation_id IN (SELECT current_user_org_ids()));

CREATE POLICY "audit_org_insert" ON audit_events
    FOR INSERT WITH CHECK (organisation_id IN (SELECT current_user_org_ids()));

-- 25. Notifications RLS
CREATE POLICY "notifications_user_select" ON notifications
    FOR SELECT USING (user_id = auth.uid() AND organisation_id IN (SELECT current_user_org_ids()));

CREATE POLICY "notifications_user_update" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_system_insert" ON notifications
    FOR INSERT WITH CHECK (organisation_id IN (SELECT current_user_org_ids()));

-- ============================================================================
-- END OF MIGRATION 20250101_init_schema.sql
-- ============================================================================
