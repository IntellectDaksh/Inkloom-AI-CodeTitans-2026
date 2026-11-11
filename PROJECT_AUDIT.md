# PROJECT AUDIT — INKLOOM AI
**Product:** Inkloom AI — The Governance Layer for Brand Truth and Marketing Claims  
**Repository:** `E:\Hackathon Projects\Inkloom - 2026`  
**Framework:** Next.js 16.4.5 (App Router), React 19.3.0, TypeScript 5, Tailwind CSS v4  
**Date:** November 2026  
**Auditor:** Lead Product & Systems Architect (Agent 1)  

---

## 1. Executive Architecture Summary

Inkloom AI operates as a deterministic brand-governance firewall between content generation (creators, copywriters, agency tools) and publication channels. It inspects copy against an immutable, version-controlled library of clinical trial assays, FDA/FTC regulatory guidelines, and corporate voice standards.

### Technical Stack
- **Framework:** Next.js 16.4.5 (App Router) + Turbopack
- **Runtime:** Node.js 20+ / Serverless Edge compatible
- **Styling:** Tailwind CSS v4 with custom CSS token variables
- **Database & Persistence:**
  - Embedded zero-config JSON persistence engine (`InkloomStore` in `src/lib/db/store.ts` backing `.inkloom_data.json`) with deterministic UUIDs and multi-tenant scoping.
  - Supabase PostgreSQL schema (`supabase/migrations/20250101_init_schema.sql`) with 25 tables, `pgvector` embeddings, and Row-Level Security (RLS) tenant isolation policies.
- **AI Engine:** Google Gemini API (`gemini-2.5-flash` / `gemini-3.5-flash-lite`) behind a structured JSON schema provider abstraction, paired with deterministic regex guardrails and an offline heuristic fallback scanner.
- **Automated Testing:** 54/54 automated test assertions (38 in `src/lib/ai/__tests__/governance.test.ts`, 16 in `tests/full-e2e.test.ts`).

---

## 2. Complete Route Inventory (29 Routes)

| # | Route | Type | Description & Primary Functionality |
|---|---|---|---|
| 1 | `/` | Static / Client | Public Landing Page: Hero with Live Interactive Audit Workbench, Presets, Competitive Matrix, 8-Stage Architecture, Regulated Sectors, Landmark Cases, Footer |
| 2 | `/dashboard` | Static / Client | Main Governance Cockpit: Health score, active submissions table, top compliance issues, brand switcher, quick actions |
| 3 | `/submissions` | Static / Client | Submissions Archive: Filterable list of all drafts, statuses (`submitted`, `in_review`, `approved`, `rejected`, `needs_re_review`), search |
| 4 | `/submissions/new` | Static / Client | Ingestion & Audit Studio: Multi-format draft input, channel selector, sample loaders, preflight audit runner |
| 5 | `/submissions/[id]` | Partial Prerender | Content Review Workspace: Dual-pane milled well, line numbers, highlighted violation spans, word-level surgical diff viewer, evidence provenance drawer, finding dispute form, reviewer recorded override modal, cryptographic audit log ledger |
| 6 | `/approvals` | Static / Client | Human Approval Triage Queue: Segmented tabs (`Pending`, `Approved`, `Rejected`), multi-tier sign-off gate, reviewer action controls |
| 7 | `/knowledge-base` | Static / Client | Knowledge Base Hub: Directory connecting Guidelines, Approved Claims, Terminology, and Asset Management |
| 8 | `/knowledge-base/claims` | Static / Client | Approved Marketing Claims Register: Substantive clinical citations, expiration countdowns, dependent submissions modal, cascade re-review trigger, claim indexing modal |
| 9 | `/knowledge-base/guidelines` | Static / Client | Brand Guidelines Manager: Voice & tone rules, do's & don'ts, category filters, guideline versioning |
| 10 | `/knowledge-base/terminology` | Static / Client | Brand Terminology Dictionary: Prohibited terms, severity rules, clinical rationale, preferred compliant vocabulary |
| 11 | `/knowledge-base/assets` | Static / Client | Evidence & Assays Manager: Uploaded trial documents, text extraction status, parsed claims counter |
| 12 | `/evaluations` | Static / Client | Labelled Evaluation Benchmark Dashboard: 4 landmark cases (FTC v. Teami 2020, Adidas 2017, CNET 2023, Compliant Control), live test runner, confusion matrix |
| 13 | `/analytics` | Static / Client | Governance Analytics: Compliance score velocity, severity charts, recurring issues ranking, expiring claims watchlist, dataset exporter |
| 14 | `/brands` | Static / Client | Multi-Brand Workspaces: Strict tenant isolation between Apex Nutrition, Zenith Cloud, and Lumina Skincare |
| 15 | `/team` | Static / Client | Role-Based Access Control (RBAC): Admin, Reviewer, Creator, Brand Manager permission matrix |
| 16 | `/notifications` | Static / Client | In-App Alert Feed: Triage warnings for expiring claims, dispute escalations, review requests |
| 17 | `/settings` | Static / Client | Governance & Model Settings: AI strict zero-hallucination switches, Gemini model selector, tenant guardrail policies |
| 18 | `/auth/login` | Static / Client | Authentication: 1-click pre-authenticated demo logins (Admin, Reviewer, Creator), password credentials form |
| 19 | `/auth/register` | Static / Client | Workspace Registration: Organization setup, workspace naming, security policy initialization |
| 20 | `/onboarding` | Static / Client | Workspace Onboarding: 3-step wizard configuring brand guidelines, initial claims, and team invites |
| 21 | `/prototype-notice` | Static / Client | Prototype Environment Notice: Clear explanation of simulated backend features (SSO, external billing) with 1-click persona bypasses |
| 22 | `/api/submissions` | Dynamic API | List submissions, create submission with preflight audit |
| 23 | `/api/submissions/[id]` | Dynamic API | Retrieve submission details, findings, revisions, apply surgical edits |
| 24 | `/api/submissions/[id]/analyze` | Dynamic API | Run full 6-stage AI governance pipeline on a draft |
| 25 | `/api/submissions/[id]/findings` | Dynamic API | Handle finding dispute, reasoned dismissal, and reviewer recorded overrides |
| 26 | `/api/claims` | Dynamic API | Retrieve and filter approved marketing claims by tenant |
| 27 | `/api/claims/[id]/cascade` | Dynamic API | Inspect dependent content assets, trigger cascade re-review |
| 28 | `/api/approvals` | Dynamic API | Execute reviewer approve / reject / request changes transitions |
| 29 | `/api/notifications` | Dynamic API | Fetch in-app notifications and mark alerts as read |

---

## 3. Preserved Architecture & Engineering Guarantees
1. **Zero Hallucination Policy:** Factual statements without clinical proof are explicitly tagged `isVerified: false` with null citations.
2. **Multi-Tenant Row-Level Security:** Strict isolation between brands (`brand_apex`, `brand_zenith`, `brand_lumina`).
3. **Word-Level Surgical Red-Line Diffing:** Clean token replacements without breaking surrounding copy.
4. **Human Approval Gate:** Creators cannot approve their own drafts; high-risk copy requires reviewer sign-off.
5. **No Auto-Publishing:** By policy, the system acts strictly as an inspection firewall.
