# Inkloom AI — System Architecture & Engineering Specification

## 1. Overview & Core Philosophy

**Inkloom AI** is an enterprise AI-powered brand governance and content compliance platform. It acts as an authoritative, version-controlled firewall between content creation (creators, copywriters, agencies) and publication channels (social media, ad networks, websites, press releases).

Unlike generic AI grammar checkers or text generators, Inkloom is grounded in an **evidence-backed, version-controlled truth system**.

```
[ Content Submission ]
          │
          ▼
┌────────────────────────────────────────────────────────┐
│             MULTI-STAGE GOVERNANCE ENGINE              │
│                                                        │
│  Stage 1: Content Segmentation & Claim Extraction     │
│  Stage 2: Deterministic Rule Checks (Prohibited terms) │
│  Stage 3: Scoped Multi-Tenant Knowledge Retrieval      │
│  Stage 4: LLM Contextual Analysis (Gemini 2.5 Flash)   │
│  Stage 5: Structured Findings & Severity Tagging       │
│  Stage 6: Review Summary & Remediated Revision         │
└────────────────────────────────────────────────────────┘
          │
          ▼
[ Human Approval Queue (Reviewer Gate) ] ──▶ [ Approved for Publication ]
```

---

## 2. Technology Stack

- **Frontend Application**: Next.js 16 with App Router, React 19, TypeScript, Tailwind CSS v4, Lucide React.
- **Backend**: Next.js Server-Side API Routes, Server Actions, and Node.js v24 runtime.
- **Database & Storage**:
  - **Cloud Production**: Supabase PostgreSQL with `pgvector` for semantic embeddings, Row Level Security (RLS) for tenant isolation, and Supabase Storage for source documents.
  - **Embedded / Zero-Config Persistence**: Transparent file/memory persistent store (`InkloomStore`) backing all 25 entities with full CRUD, relational queries, and automatic seed state recovery.
- **AI Governance Engine**:
  - Provider abstraction utilizing Google Gemini (`gemini-2.5-flash` / `gemini-3.5-flash-lite` via REST with strict JSON schema outputs).
  - Deterministic pre-flight regex scanners for prohibited terms, channel disclaimers, and expired claim detection.
  - Zero-hallucination enforcement: unverified claims are strictly marked `isVerified: false` with empty evidence citations.

---

## 3. Database Schema & Multi-Tenant Isolation

The database migration is located at [`supabase/migrations/20250101_init_schema.sql`](./supabase/migrations/20250101_init_schema.sql).

### Relational Entity Model (25 Tables)

1. `organisations`: Root tenant entity (id, name, slug, plan, settings).
2. `user_profiles`: User accounts mapped to organisations and global roles (`admin`, `brand_manager`, `reviewer`, `creator`).
3. `organisation_members`: Tenant membership mapping.
4. `brands`: Independent workspaces under an organisation (`Apex Nutrition`, `Zenith Cloud SaaS`).
5. `brand_members`: Per-brand permission assignments.
6. `brand_guidelines`: Structured voice, tone, and messaging standards (with `vector(1536)`).
7. `guideline_versions`: Version history and changelogs for guidelines.
8. `approved_claims`: Verifiable marketing claims library (with `vector(1536)`, owner, context, expiry).
9. `claim_evidence`: Supporting clinical studies, lab assays, ISO certs, and URLs.
10. `brand_terms`: Prohibited, preferred, and trademarked terms dictionary.
11. `brand_assets`: Logos, color palettes, fonts, and disclaimer blocks.
12. `documents`: Uploaded evidence documents (PDF, DOCX, TXT).
13. `document_extractions`: Extracted passages with embeddings for semantic retrieval.
14. `submissions`: Content drafts undergoing governance review.
15. `submission_versions`: Saved revision history with exact content diffs.
16. `analysis_runs`: Execution logs of the AI governance pipeline.
17. `findings`: Flagged compliance issues with severity and confidence.
18. `finding_evidence`: Links between findings and specific claim evidence.
19. `suggested_revisions`: AI/reviewer suggested compliant text replacements.
20. `approval_requests`: Active approval queue entries.
21. `approval_decisions`: Immutable audit log of reviewer approvals/rejections.
22. `comments`: Threaded reviewer-creator discussion.
23. `disputes`: Creator challenges to automated findings.
24. `audit_events`: Comprehensive SOC-2 compliant tamper-proof audit trail.
25. `notifications`: In-app notification alerts.

---

## 4. Multi-Stage AI Brand Governance Engine

### Stage 1: Segmentation & Claims Detection
Breaks down raw copy into paragraphs, sentences, and semantic segments. Identifies metric claims (`2x faster`), time-bound guarantees (`in just 14 days`), superlatives, and channel characteristics.

### Stage 2: Deterministic Rule Checks
Performs sub-millisecond regex and dictionary lookups:
- **Prohibited Words**: Catches banned terms like *"miracle"*, *"cure"*, *"cheat code"*, *"magic bullet"*.
- **Expired Claims**: Matches claims against deprecated or expired library records.
- **Required Disclosures**: Checks channel rules for missing disclaimers (e.g. FTC ads disclosure).

### Stage 3: Scoped Multi-Tenant Knowledge Retrieval
Filters brand guidelines, approved claims, and evidence strictly by `organisation_id` and `brand_id`.
**Zero-Leakage Assertion**: Validates that no record from an external organization or different brand enters the retrieval context.

### Stage 4: LLM Contextual Analysis
Sends grounded prompt to Gemini 2.5 Flash via REST endpoint with strict JSON schema formatting:
- Audits claim substantiation against approved evidence.
- Flags tone deviation (hyperbole, aggressiveness vs. confident brand tone).
- Prohibits hallucination: unverified claims are labelled unverified, never backed by fabricated citations.
- Includes deterministic fallback analyzer ensuring seamless operation even if offline.

### Stage 5: Findings Generation & Evidence Linking
Each finding includes:
- Category (`unsupported_claim`, `time_bound_claim`, `tone_inconsistency`, `prohibited_term`, `missing_disclosure`, `out_of_scope`)
- Severity (`critical`, `high`, `medium`, `low`, `informational`)
- Confidence (`high`, `medium`, `low`)
- Flagged text snippet with character start/end offsets
- Explanation and source record citations
- Suggested compliant replacement

### Stage 6: Review Summary & Revisions
Calculates composite compliance score (0–100), overall status (`approved`, `needs_review`, `rejected`), issue counts, and synthesizes a full revised draft with the suggested changes.

---

## 5. Security & Responsible AI Guardrails

- **Zero Data Training**: User content is never used to train public models.
- **Tenant Isolation**: Row-Level Security in PostgreSQL and strict repository filtering in application memory prevent cross-tenant data leaks.
- **Human-in-the-Loop**: High-risk and critical issues require manual human reviewer approval. The platform never auto-publishes content.
- **Audit Logging**: Every action (create, analyze, apply suggestion, approve, reject) generates an immutable `audit_events` record with timestamp, user ID, and previous/updated values.
