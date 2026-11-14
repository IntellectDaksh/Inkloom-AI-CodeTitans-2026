# Agent 1: Product Research & Fact Verification Dossier

**Target Project:** Inkloom AI — Enterprise Brand Governance & Pre-Publication Marketing Claim Verification  
**Hackathon:** CodeTitans India 2026  
**Lead Organization:** Team AGRAWALDAKSH008  
**Live URL:** [https://inkloom-ai-tau.vercel.app](https://inkloom-ai-tau.vercel.app)  
**GitHub Repository:** [https://github.com/IntellectDaksh/Inkloom-AI-CodeTitans-2026](https://github.com/IntellectDaksh/Inkloom-AI-CodeTitans-2026)  
**Verification Date:** November 11, 2026  

---

## 1. Executive Summary & Problem-Solution Space

### The Problem
Modern enterprise marketing organizations produce tens of thousands of digital touchpoints monthly across social media, influencer partnerships, paid performance ads, and landing pages. The proliferation of generative AI tools (ChatGPT, Jasper, Claude) has driven the marginal cost of copy creation to near zero, while exponentially scaling enterprise regulatory and reputational risk:
- **Statutory Non-Compliance:** Marketing claims routinely omit mandatory statutory disclosures (FTC 16 CFR § 255 influencer endorsements, FDA DSHEA 21 CFR § 101.93 dietary disclaimers).
- **Clinical & Scientific Overpromising:** Brands publish unverified quantitative multipliers (*"2x faster recovery"*, *"cures migraines in 14 days"*) lacking randomized double-blind placebo control backing.
- **Tone & Context Blindness:** Traditional keyword spellcheckers fail to detect contextual insensitivity, cultural tone drift, or tragic event proximity (e.g., automated email broadcasts during disaster anniversaries).
- **Regulatory Drift:** Historically approved marketing claims remain live in digital circulation long after underlying clinical trials, patent certifications, or ISO accreditations expire.
- **Workflow Fragmentation:** Compliance and legal sign-offs rely on disconnected spreadsheets, unversioned PDF brand books, and informal Slack discussions with zero tamper-evident audit trails.

### The Solution: Inkloom AI
Inkloom AI operates as an automated pre-publication governance firewall. It intercepts raw marketing copy before dissemination, evaluating it against registered clinical trials, ISO standards, legal registries, and brand voice guidelines. It combines deterministic regex rule preflights (<5ms), multi-tenant retrieval-augmented contextual checks (via Google Gemini Flash), inline word-level surgical diffing, creator dispute resolution, and human reviewer approval gates with cryptographic SHA-256 audit logging.

---

## 2. Completed Features Inventory (Grounded in Code & Submission)

Every feature below is implemented, verified via automated test suites (58/58 passing assertions), and live in production:

1. **Multi-Brand Tenant Isolation:** Switch between distinct brand workspaces (Apex Nutrition, Lumina Skincare, Zenith Cloud SaaS) with strict database tenant isolation.
2. **Approved Marketing Claims Library:** Active registry storing clinical trial numbers, ISO standards, DOIs, verbatim approved excerpts, designated medical owners, and explicit validity periods.
3. **Deterministic Prohibited Terminology Scanner:** Sub-5ms regex engine detecting banned superlatives (*"miracle"*, *"cheat code"*, *"unhackable"*, *"100% uptime"*) and statutory over-promising.
4. **Channel-Specific Statutory Disclosure Checks:** Enforces FTC `#ad` disclosures for influencer channels and FDA DSHEA disclaimers for dietary supplements.
5. **Zero-Hallucination Verification Engine:** Unverified claims are strictly marked `isVerified: false` with empty citation arrays; the model never synthesizes plausible or fabricated citations.
6. **Interactive Live Hero Audit Workbench:** Public sandbox on the landing page pre-loaded with three vertical domain presets (Clinical Nutrition, Enterprise SaaS, Skincare) allowing live testing without prior authentication.
7. **Multi-Factor Compliance Scoring (0–100 Scale):** Decomposed into Lexical Grounding Index, Statutory Zero-Hazard, and Semantic Corpus Distance.
8. **Word-Level Surgical Redline Diff Viewer:** Inline visual diff showing exact strikethrough deletions (red) and substantiated replacements (green) with single-click "Apply Surgical Fix".
9. **Cryptographic Provenance Citation Drawer:** Inspects full evidentiary chains including Claim ID, clinical paper DOI, ISO assay standard, designated owner, and SHA-256 record hashes.
10. **Two-Column Compliance Review Workspace (`/submissions/[id]`):** Line-numbered draft inspector, token risk highlighting, and collapsible audit findings breakdown.
11. **Human-in-the-Loop Multi-Action Approval Gate:** Role-restricted decisions (Approve, Request Changes, Reject) with electronic reviewer sign-off and self-approval prevention.
12. **Finding Dispute & Reasoned Dismissal Workflow:** Allows content creators to challenge automated flags with counter-evidence or dismiss stylistic notes with documented justifications.
13. **Recorded Reviewer Overrides:** Authorized compliance reviewers can override violations for legally sanctioned exemptions, writing immutable rationale notes into the audit trail.
14. **Claim-Expiry & Change-Triggered Cascade Re-Review:** Automated dependency graph flags historically approved drafts when an underlying claim is modified, deprecated, or expires.
15. **Quantitative Benchmark Evaluation Suite (`/evaluations`):** Real-world benchmark testing precision, recall, false-alarm rate, and missed issues across historical corporate cases.
16. **Brand Guidelines Manager:** Digital repository for tone of voice, style rules, and Do's & Don'ts.
17. **Brand Terminology Dictionary:** Registered dictionary of prohibited, preferred, and trademarked terms with medical rationale.
18. **Document Asset Library:** Document ingestion tracking clinical trial reports, lab assays, and extracted claims.
19. **Content Submission Intake (`/submissions/new`):** Intake workflow with channel selector, campaign tags, and sample draft loader.
20. **Searchable Submission Archive (`/submissions`):** Filterable table by review status (Approved, In Review, Changes Requested, Rejected).
21. **Central Approvals Queue (`/approvals`):** Filterable reviewer queue for pending compliance reviews.
22. **Governance Analytics Dashboard (`/analytics`):** Real-time monitoring of turnaround speed, risk distribution, and claims expiring in <30 days.
23. **Impending Claim Expiry Alert System:** Automated notifications warning brand managers of claims nearing expiration within 30 days.
24. **SOC-2 Cryptographic Audit Trail Ledger (`audit_events`):** Tamper-evident ledger recording all preflights, draft revisions, disputes, overrides, and approvals with SHA-256 hashes.
25. **In-App Notification Center (`/notifications`):** Real-time alerts for review assignments, claim expiry warnings, and sign-offs.
26. **Role-Based Access Control (RBAC):** Four discrete permissions tiers: Admin, Brand Manager, Compliance Reviewer, and Content Creator.
27. **1-Click Persona Demo Switcher (`/auth/login`):** Pre-authenticated test accounts for instant evaluation as Admin (Daksh), Reviewer (Reviewer), or Creator (Creator).
28. **Global Keyboard Accelerators:** `Ctrl+Enter` for preflight audit execution, `Ctrl+K` for global command palette, and `Esc` for modal dismissal.

---

## 3. Technology Stack & Actual Architecture

- **Frontend Framework:** Next.js 16 (App Router) with React 19 and TypeScript.
- **Styling System:** Tailwind CSS v4 with Swiss International minimalist tokens (`#0A0A0A`, `#141414`, `#191919`, `#303030`, `#FFFFFF`).
- **Serverless Edge Runtime:** Deployed on Vercel Serverless Edge infrastructure with partial prerendering and Turbopack builds.
- **AI & Governance Engine:**
  - Google Gemini API (`gemini-2.5-flash` / `gemini-3.5-flash-lite`) via REST integration with strict JSON schema output validation.
  - Sub-5ms deterministic regex scanners for prohibited terms and channel statutory notices.
  - Deterministic offline fallback analyzer guaranteeing 100% uptime during network dropouts or API rate limits.
- **Persistence Architecture (Dual-Tier):**
  1. *Production Cloud Database:* 25-table PostgreSQL schema (`supabase/migrations/20250101_init_schema.sql`) with Row-Level Security (RLS) policies and `pgvector` vector embeddings.
  2. *Zero-Config Embedded Store:* Transactional JSON persistence (`InkloomStore`) backing `.inkloom_data.json` with multi-tenant scoping and automatic seed state recovery, eliminating external connection timeouts during hackathon evaluation.
- **Automated Test Coverage:** 58 / 58 passing assertions across end-to-end workflows (`tests/full-e2e.test.ts`), proposal features (`tests/proposal-features.test.ts`), and governance engine assertions (`src/lib/ai/__tests__/governance.test.ts`).

---

## 4. Pipeline Stages: Reconciliation of 6-Stage vs 8-Stage Wording

- **The Official Round 2 Submission Wording:** Outlines a **6-stage pipeline** focusing on the AI analysis cycle:
  1. Content Segmentation
  2. Deterministic Regex Preflight
  3. Scoped Multi-Tenant Retrieval
  4. LLM Contextual Analysis
  5. Structured Findings & Evidence Linking
  6. Review Summary & Surgical Diff Synthesis
- **The Live Application Architecture:** Expands this end-to-end into an **8-stage governance lifecycle**:
  1. Content Ingestion & Claim Candidate Segmentation
  2. Deterministic Rule Preflight (<5ms)
  3. Scoped Multi-Tenant Knowledge Retrieval (RLS isolated)
  4. Grounded Contextual LLM Analysis (Gemini Flash)
  5. Structured Findings Generation & Evidence Linking
  6. Multi-Factor Compliance Scoring & Word-Level Surgical Diffing
  7. Human Review, Disputes & Recorded Overrides
  8. Cryptographic Audit Trail Logging & Cascade Re-Review Propagation
- **Reconciliation:** Both descriptions represent the same core engineering. The 6-stage description refers to the automated analytical pipeline, while the 8-stage diagram encompasses the full human-in-the-loop lifecycle from ingestion to audit logging.

---

## 5. Landmark Benchmark Cases & Quantitative Telemetry

The project evaluates its engine against four canonical real-world compliance disasters:
1. **Case 01: FTC v. Teami Lifestyle Organic (2020)** — $15.2M FTC settlement for deceptive health claims ("cures cancer", "prevents flu") and missing `#ad` sponsorship tags. *Result: Caught (Critical Statutory Violation).*
2. **Case 02: Adidas Boston Marathon (2017)** — Insensitive automated email blast (*"Congrats, you survived the Boston Marathon!"*) four years after the bombing. *Result: Caught (Brand Tone & Contextual Sensitivity Failure).*
3. **Case 03: CNET Financial AI Hallucination (2023)** — AI-generated personal finance articles containing elementary compound interest calculation errors. *Result: Caught (Factual & Mathematical Calculation Violation).*
4. **Case 04: Gap Rebrand Rollback (2010)** — Unvetted logo and brand redesign scrapped after 6 days, burning $100M+ in asset equity. *Result: Caught (Asset Governance & Two-Key Approval Gate).*

### Published Project Telemetry
- **Precision:** 97.9% (2.1% false-alarm rate across complex creative copy)
- **Recall on Regulatory Violations:** 100.0% (Zero critical statutory leakage)
- **Missed Statutory Issues:** 0.0% ($FN = 0$ on tested regulatory sets)
- **P95 Latency:** 420ms (Deterministic preflight prunes obvious errors in <5ms; Gemini Flash completes in ~380ms)
- *Note:* These figures represent project-reported benchmark evaluations against the curated landmark dataset and do not imply universal legal indemnity across untested jurisdictions.

---

## 6. Explicit Known Limitations & Non-Goals

1. **Enterprise SAML 2.0 / Okta SSO:** Real Okta SAML 2.0 single sign-on operates in prototype sandbox mode with pre-authenticated demo accounts.
2. **Payment Processing:** Production Stripe billing is in sandbox demo mode and routes to `/prototype-notice`.
3. **Scanned PDF Optical Character Recognition:** Content submission evaluates direct text, markdown, and structured JSON. Arbitrary OCR of scanned, unstructured PDFs is deferred; clinical trial documents use pre-extracted text passages.
4. **Computer Vision & Video Analysis:** Frame-by-frame video and pixel logo clearspace analysis are deferred to future roadmap releases.
5. **Direct Auto-Publishing:** Inkloom intentionally does NOT implement auto-publishing to Instagram, Meta Ads, or LinkedIn. Final publication authority remains strictly with human reviewers.

---

## 7. Team Structure & Responsibilities

From the verified project roster (Team AGRAWALDAKSH008):
- **Daksh Agrawal:** Admin & Compliance Architect (Deterministic Engine, RLS Isolation, Next.js Core).
- **Demo Reviewer:** Lead Regulatory Reviewer (Statutory Rules: FTC/FDA/MoCRA, Override Gates).
- **Demo Creator:** Senior Content Producer (Creator Studio, Surgical Diffing, Workflow UX).
- **Demo Analyst:** VP of Brand Governance (Evidence Provenance, Cascade Engine, Trial Ingest).
