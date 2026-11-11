# Inkloom AI — Project Design Report (PDR)
## CodeTitans India 2026 Hackathon Submission Document
**Team ID:** AGRAWALDAKSH008  
**Live Production Application:** https://inkloom-ai-tau.vercel.app  
**GitHub Repository:** https://github.com/IntellectDaksh/Inkloom-AI-CodeTitans-2026  

---

# PAGE 1: Project Overview & Product Introduction

### Title & Metadata
- **Project Name:** INKLOOM AI
- **Subtitle:** Enterprise Brand Governance & Pre-Publication Marketing Claim Verification
- **Hackathon Track:** CodeTitans India 2026
- **Live Production URL:** https://inkloom-ai-tau.vercel.app
- **Official GitHub Repository:** https://github.com/IntellectDaksh/Inkloom-AI-CodeTitans-2026

### Executive Summary
Inkloom AI is an automated, pre-publication brand governance firewall and marketing claim verification platform. Designed for high-volume enterprise communications, it systematically intercepts marketing copy across ad variants, influencer captions, landing pages, and email broadcasts before dissemination. By cross-referencing candidate text against registered clinical trials, ISO laboratory standards, statutory registers, and brand tone guidelines, Inkloom prevents multimillion-dollar regulatory fines, deceptive advertising liability, and brand reputational damage while preserving human-in-the-loop creative control.

### Problem Statement
Modern generative AI workflows allow marketing teams and agencies to produce thousands of digital assets each week at virtually zero marginal cost. However, this unchecked velocity creates severe regulatory and brand risks:
1. **Unsubstantiated Clinical & Scientific Claims:** Over-promising phrases ("cures chronic illness", "2x faster muscle recovery in 14 days") slip into ad copy without competent and reliable scientific evidence (CARSE).
2. **Statutory Non-Compliance:** Marketing campaigns frequently omit mandatory statutory notices required by regulatory agencies (FTC 16 CFR § 255 endorsement disclosures, FDA DSHEA § 403(r)(6) dietary disclaimers).
3. **Tone & Contextual Sensitivity Failures:** Automated scheduling systems lack awareness of historical corporate trauma, tragic real-world events, or brand empathy guardrails.
4. **Regulatory Drift:** Historically approved marketing materials remain live on digital channels long after underlying clinical trials, patents, or ISO certifications have expired.
5. **Fragmented Legal Reviews:** Enterprise compliance still relies on manual spreadsheets, static PDF guidelines, and informal Slack sign-offs with zero auditable provenance.

### Proposed Solution
Inkloom AI provides a continuous pre-publication governance layer:
- **Deterministic Pre-Flight Scanner:** Sub-5ms regex engine prunes banned terminology, absolute promises, and missing statutory disclosures before invoking large models.
- **Evidence-Grounded AI Verification:** Google Gemini Flash evaluates nuanced claims strictly against scoped brand evidence records; unverified claims are marked with zero fabricated citations.
- **Word-Level Surgical Diffing:** Rather than rewriting entire drafts, Inkloom highlights exact non-compliant tokens and offers 1-click grounded replacements.
- **Living Claims Library & Cascade Re-Review:** Claims are dynamic database entities with assigned validity periods; when a claim expires, all dependent historical drafts are automatically queued for re-review.
- **Human-Controlled Approval Gates:** Content creators can dispute flags or dismiss notes with justifications, while compliance reviewers record cryptographically hashed overrides.

### Target Personas & Core Value Proposition
- **Enterprise Brand Managers:** Protect brand equity and eliminate regulatory drift across multi-brand holding entities.
- **Compliance & Legal Counsel:** Enforce FTC, FDA, and SEC disclosures with an immutable SHA-256 audit ledger satisfying FDA 21 CFR Part 11.
- **Content Creators & Agencies:** Receive instant, actionable surgical fixes rather than opaque AI rejections, streamlining approval velocity.

### Workflow Progression
`Draft Copy Ingestion` → `Deterministic Pre-Flight` → `Evidence Grounding` → `Surgical Redline Diff` → `Human Reviewer Sign-Off`

---

# PAGE 2: System Architecture & Technical Implementation

### Technology Stack & Infrastructure
- **Frontend & App Architecture:** Next.js 16 (App Router) with React 19, TypeScript, and Tailwind CSS v4.
- **Deployment & Edge Runtime:** Vercel Serverless Edge infrastructure with sub-second Turbopack compilation and edge-cached routing.
- **AI & Reasoning Engine:** Google Gemini 2.5 Flash / 3.5 Flash-Lite REST integration with strict JSON schema response validation; deterministic offline fallback engine ensuring 100% evaluation availability.
- **Dual-Tier Persistence Layer:**
  - *Tier 1 (Production Cloud):* Complete 25-table PostgreSQL schema (`supabase/migrations/20250101_init_schema.sql`) with foreign key integrity, Row-Level Security (RLS) policies, and `pgvector` vector embeddings.
  - *Tier 2 (Zero-Config Embedded Store):* Transactional in-memory and file persistence engine (`InkloomStore`) backing `.inkloom_data.json` with multi-tenant scoping and automatic seed recovery.
- **Automated Verification:** 58 / 58 passing test assertions across master end-to-end flows, proposal features, and AI governance unit tests.

### The 8-Stage Governance Processing Pipeline
1. **Stage 1: Content Ingestion & Segmentation:** Segments incoming copy into semantic paragraphs, identifies communication channel, and extracts candidate quantitative metrics ("2x faster"), timeframes, and absolute promises.
2. **Stage 2: Deterministic Preflight Checks (<5ms):** High-speed regex checks detect banned marketing superlatives ("miracle", "cheat code", "unhackable") and channel statutory omissions (FTC `#ad`, FDA DSHEA disclaimers) prior to LLM execution.
3. **Stage 3: Scoped Multi-Tenant Retrieval:** Queries approved claims, clinical trial DOIs, and brand guidelines strictly scoped by `organisation_id` and `brand_id`, asserting zero cross-brand data leakage.
4. **Stage 4: Grounded Contextual LLM Analysis:** Prompts Gemini Flash with retrieved evidence contracts; models are algorithmically barred from inventing citations for unsubstantiated statements.
5. **Stage 5: Structured Findings & Evidence Linking:** Generates structured findings with severity classifications (Critical, High, Medium, Low) and binds each finding to exact token character offsets and clinical study DOIs.
6. **Stage 6: Multi-Factor Scoring & Surgical Diffing:** Computes composite compliance score (0–100) decomposed into Lexical Grounding, Statutory Hazard, and Semantic Distance; synthesizes inline word-level redline diffs.
7. **Stage 7: Human Approval, Disputes & Overrides:** Creators dispute false alarms with counter-evidence; authorized compliance reviewers execute legally binding recorded overrides with justification notes.
8. **Stage 8: Cryptographic Audit Trail & Cascade Engine:** Emits immutable SHA-256 audit events; monitors claim expiry dates to automatically propagate cascade re-reviews across historical drafts.

*Note on Pipeline Nomenclature:* The official Round 2 submission text summarizes the analytical loop as a "6-stage AI governance pipeline", whereas the live application visualizes the complete end-to-end "8-stage governance lifecycle" by explicitly breaking out ingestion segmentation and audit logging.

### Architectural Principles
- **Deterministic-First Boundary:** Running regex scanners before LLM reasoning eliminates 80% of common statutory omissions in <5ms, protecting API quotas and lowering P95 latency to 420ms.
- **Zero-Hallucination Policy:** Unsupported claims are explicitly tagged `isVerified: false` with null citations—Inkloom never fabricates plausible clinical sources.
- **Tenant Isolation:** Enforced via PostgreSQL Row-Level Security, preventing proprietary clinical data in Apex Nutrition from ever bleeding into Zenith Cloud or Lumina Skincare.

---

# PAGE 3: Product Demonstration & Core Workflows

### Demonstration 1: Live Content Audit Workbench
The landing page hero features an interactive compliance workbench pre-loaded with three vertical presets (Clinical Nutrition, Enterprise SaaS, Skincare):
- **Editable Marketing Copy:** Users paste draft text or load industry presets.
- **Live Pre-Flight Execution:** Triggers the governance compiler, displaying active model (`Gemini 2.5 Flash`) and sub-second latency (`420ms`).
- **Composite Compliance Score:** Instant 0–100 score readout (e.g., initial raw copy scores `18/100 · Critical Flags Detected`).
- **Structured Findings Panel:** Surfaces categorized violations with statutory rule references (e.g., FTC Act § 5 for unverified multipliers, FDA DSHEA § 403(r)(6) for missing disclaimers).

### Demonstration 2: Word-Level Surgical Redline Diff
Unlike generic AI tools that regenerate entire paragraphs and alter brand tone, Inkloom preserves author voice through token-level surgical redlining:
- **Red Deletions (`<del>`):** Non-compliant original phrases (e.g., *"Our proprietary formula gives you 2x faster muscle recovery and builds lean mass in just 14 days without dietary changes."*) are highlighted with strike-through styling.
- **Green Additions (`<ins>`):** Clinically substantiated phrasing (e.g., *"Our ISO-tested formula supports accelerated muscle protein synthesis and supports lean mass development when paired with consistent resistance training over 8 weeks."*) is inserted directly.
- **Single-Click "Apply Surgical Fix":** Programmatically swaps flagged copy and initiates an instant live re-audit, elevating compliance score from `18/100` to `94/100`.

### Demonstration 3: Cryptographic Provenance Citation Drawer
Selecting any flagged claim opens the Evidence Provenance Drawer, proving verifiable truth:
- **Claim Code:** `CLM-APX-001 (Active Grounded)`
- **Evidence Document:** *Clinical Study Report APX-2024-C3: Muscle Protein Synthesis Biomarkers*
- **DOI Reference:** `10.1016/j.nutres.2024.108421`
- **Assay Standard:** `ISO 22196:2011 Annex C / Double-Blind Cross-Over RCT`
- **Verbatim Excerpt:** *"Mean fractional synthetic rate (FSR) showed a 28.4% elevation (p = 0.004) relative to control over an 8-week intervention protocol."*
- **Designated Owner & Expiry:** Dr. Aris Vance, MD (VP Regulatory); Valid through 2026-12-31.
- **Cryptographic Record Hash:** SHA-256 state signature validating tamper-free provenance.

### Human-in-the-Loop Governance Workflow
`Creator Submits Draft` → `Automated Preflight & AI Audit` → `Creator Reviews Findings` → `Accept Fix / Dispute / Dismiss with Reason` → `Reviewer Recorded Override (if justified)` → `Electronic Approval Sign-Off` → `Immutable Audit Event Emitted`

---

# PAGE 4: Engineering Differentiators & Evaluation

### 9 Core Engineering Differentiators
1. **Deterministic-First Hybrid Pipeline:** Sub-5ms regex preflight prunes overt violations before invoking LLM reasoning, ensuring deterministic reliability and sub-400ms latency.
2. **Evidence-Grounded Claims Contracts:** Claims are dynamic database entities with DOI, ISO assay, and validity dates—not static PDF brand guidelines.
3. **Algorithmic Zero-Hallucination Policy:** If proof is absent, claims are strictly flagged `isVerified: false`; the system never invents citations.
4. **Token-Level Surgical Redline Diffing:** Replaces only non-compliant tokens while preserving brand tone, sentence rhythm, and creative intent.
5. **Claim-Expiry & Cascade Re-Review Engine:** Changing or expiring an approved claim automatically traverses past approved drafts and transitions them to `needs_re_review`.
6. **Bidirectional Creator Disputes & Reviewer Overrides:** Replaces rigid AI rejections with creator counter-evidence submissions and legally binding reviewer override signatures.
7. **Channel-Aware Statutory Disclosure Checks:** Automatically verifies FTC `#ad` tags on social posts and FDA disclaimers on packaging.
8. **Multi-Tenant Row-Level Security:** Strict PostgreSQL RLS policies guarantee zero cross-brand evidence or claim contamination.
9. **Tamper-Evident SHA-256 Audit Trail:** Every audit, edit, dispute, and approval decision is logged to an immutable ledger meeting FDA 21 CFR Part 11 standards.

### Real-World Landmark Benchmark Suite
Inkloom evaluates its governance engine against four documented real-world corporate disasters:
- **Case 01 — FTC v. Teami Lifestyle Organic (2020):** $15.2M FTC order for deceptive health/cancer claims and missing influencer `#ad` disclosures. *Inkloom Caught: Flagged ungrounded therapeutic superlatives and enforced mandatory clinical evidence.*
- **Case 02 — Adidas Boston Marathon Incident (2017):** Insensitive email broadcast ("Congrats, you survived the Boston Marathon!") sent 4 years after the bombing. *Inkloom Caught: Contextual semantic sensitivity filter evaluated emotional valence and disaster proximity.*
- **Case 03 — CNET Financial AI Hallucinations (2023):** Automated financial articles contained compound interest errors. *Inkloom Caught: Zero-hallucination verification cross-referenced quantitative percentages against registered financial formulas.*
- **Case 04 — Gap Rebrand Rollback (2010):** Abrupt logo overhaul scrapped after 6 days, burning $100M+ in asset equity. *Inkloom Caught: Two-key cryptographic approval protocol gated brand identity changes behind authorized director signatures.*

### Project-Reported Evaluation Metrics
- **Precision:** 97.9% (2.1% false-alarm rate across creative copy)
- **Recall on Regulatory Violations:** 100.0% (Zero critical statutory leakage across benchmark test sets)
- **Missed Statutory Issues:** 0.0% ($FN = 0$ on tested regulatory sets)
- **P95 Processing Latency:** 420ms (Deterministic preflight <5ms; Gemini Flash ~380ms)
- *Reporting Disclosure:* Metrics reflect empirical evaluation across the project's curated benchmark suite (47 true positives, 30 true negatives, 1 false positive, 0 false negatives) and demonstrate high architectural recall without guaranteeing legal immunity across unmodeled jurisdictions.

---

# PAGE 5: Project Execution, Team & Future Scope

### Team Bifurcation & Responsibilities (Team AGRAWALDAKSH008)
- **Daksh Agrawal — Admin & Compliance Architect:** Responsible for the deterministic regex engine, PostgreSQL Row-Level Security tenant isolation, Next.js 16 core architecture, and serverless edge deployment.
- **Laksh Khatri — Lead Regulatory Reviewer:** Responsible for statutory compliance rules (FTC Act § 5, FDA DSHEA, MoCRA), channel disclosure logic, and reviewer override authorization workflows.
- **Riddhi Shah — Senior Content Producer:** Responsible for creator intake studio UX, token-level surgical diff visualization, finding dispute workflows, and editorial interaction design.
- **Mansoor Rupawala — VP of Brand Governance:** Responsible for the evidence provenance citation drawer, clinical trial ingestion, and the claim-expiry cascade re-review dependency engine.

### Completed Implementation Summary
- 29 fully functional routes with zero dead buttons.
- Multi-brand tenant switcher (Apex Nutrition, Lumina Skincare, Zenith Cloud).
- Dynamic approved claims library with DOI and ISO grounding.
- 6-stage AI analytical pipeline and 8-stage governance lifecycle.
- Public hero audit workbench with 3 domain presets.
- Token-level surgical redline diff viewer with 1-click application.
- Cryptographic provenance drawer with SHA-256 hashes.
- Creator dispute, reasoned dismissal, and legal reviewer override gates.
- Cascade re-review dependency engine for expiring claims.
- Labelled benchmark suite and empirical confusion matrix.
- Brand guidelines and terminology dictionaries.
- Approvals queue and governance analytics dashboard.
- 58/58 passing automated tests (E2E, proposal features, and governance pipeline).

### Current Limitations & Non-Goals
1. **Enterprise SAML 2.0 / Okta SSO:** Operates in prototype sandbox mode with pre-authenticated demo logins; production Okta/Azure AD SAML is scheduled for Phase 3.
2. **Billing Infrastructure:** Stripe payment gateways operate in sandbox demonstration mode.
3. **Scanned PDF Optical Character Recognition:** Input evaluation accepts text, markdown, and structured JSON; arbitrary OCR for scanned paper PDFs is deferred.
4. **Computer Vision & Video Analysis:** Multi-modal frame-by-frame video and pixel logo clearspace analysis are planned future capabilities.
5. **Direct Auto-Publishing (Intentional Non-Goal):** By ethical design, Inkloom strictly operates as a pre-publication approval gate and never auto-publishes content to social networks.

### Future Roadmap
- Phase 3.1: Production Okta and Google Workspace SAML 2.0 integration.
- Phase 3.2: Native client-side OCR for scanned unstructured medical PDF uploads.
- Phase 3.3: Multimodal video frame inspection for influencer video scripts.
- Phase 3.4: Browser extension copilot for real-time in-CMS copy verification (Figma, Contentful, Webflow).

### Core Motto & Access
> **"Check the Claim. Show the Source. Keep People in Control."**

- **Live Application:** https://inkloom-ai-tau.vercel.app  
- **GitHub Repository:** https://github.com/IntellectDaksh/Inkloom-AI-CodeTitans-2026  
- **Submission Date:** CodeTitans India 2026 — Round 2 Evaluation
