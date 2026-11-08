<div align="center">
  # Inkloom AI — CodeTitans 2026

  **The Governance Layer for Brand Truth and Marketing Claims.**

  ![Version](https://img.shields.io/badge/version-v2.0-blue)
  ![Platform](https://img.shields.io/badge/platform-Web-informational)
  ![License](https://img.shields.io/badge/license-MIT-green)
  ![Build](https://img.shields.io/badge/build-passing-emerald)

  ---
  
  ## [CLICK HERE TO ACCESS LIVE PRODUCTION APPLICATION](https://inkloom-ai-tau.vercel.app/)
  
  **`https://inkloom-ai-tau.vercel.app/`**
  
  *(Live Production Build — 6-Stage AI Brand Governance Engine)*
  
  ---
</div>

## Problem & Solution

**The Problem:** Modern marketing teams and agencies publish at high velocity across dozens of channels. Generic AI writing tools frequently hallucinate facts, invent statistics, or generate unsubstantiated superlative claims (e.g., "2x faster", "miracle formula", "100% unhackable") that violate FTC Endorsement Guides, FDA regulations, and corporate brand standards.

**The Solution:** Inkloom AI sits as an infallible brand governance layer between content creation and publication. Grounded strictly in an evidence-backed brand repository, every marketing claim is cross-referenced against clinical trials, regulatory filings, ISO assays, or verified company documentation. If a claim lacks proof or context, Inkloom flags it as unverified—never fabricating a citation—and enforces human-in-the-loop approvals.

---

## 🚀 Product Definition

**Inkloom AI** is an intelligent brand-governance SaaS application designed for marketing teams, enterprise brands, and digital agencies. It reviews marketing content, audits factual claims against verified evidence, and enforces tone and vocabulary guidelines before publication.

### Core Differentiator: Evidence-Backed Brand Truth System
Every approved marketing claim in Inkloom contains:
- **Claim Text**: Exact approved phrasing.
- **Supporting Evidence**: Clinical trial identifier, ISO assay, patent, or legal opinion.
- **Supporting Excerpt**: Verifiable statistical findings.
- **Permitted Context & Scope**: Authorized channels and target audiences.
- **Approval Status**: Active, Expired, Deprecated, or Under Review.
- **Responsible Owner & Expiry Date**: Proactive alerts before evidence contracts expire.
- **Zero Hallucination Policy**: If a claim is not found in the approved repository, it is explicitly flagged as unverified—never fabricated.

---

## 🎨 Visual Identity

Built with a dark premium SaaS interface matching the Inkloom visual reference:
- **Backgrounds**: Deep charcoal and near-black (`#090A0F`, `#0C0D15`, `#111320`).
- **Accents**: Restrained lavender & violet (`#8B5CF6`, `#A78BFA`, `#6D28D9`).
- **Badges**: High-contrast semantic status pills (Emerald for approved, Rose for critical/unsupported, Amber for warnings).
- **Typography**: Crisp, clean hierarchy designed for dense audit dashboards.

---

## 🛠️ Technology Architecture

- **Framework**: Next.js 16 (App Router) + TypeScript + React 19.
- **Styling**: Tailwind CSS v4 with custom dark-palette variables.
- **Backend**: Next.js Server Actions & API Routes (`/api/submissions`, `/api/claims`, `/api/approvals`, `/api/analytics`, `/api/notifications`).
- **Database**:
  - **Supabase PostgreSQL** migration scripts with `pgvector` embeddings, Row Level Security (RLS), and automated triggers (`supabase/migrations/20250101_init_schema.sql`).
  - **Embedded Persistent Store** (`InkloomStore`) providing local file/memory persistence with multi-tenant isolation, automatic seed state initialization, and zero-config local development.
- **AI Engine**: Google Gemini API (`gemini-2.5-flash` / `gemini-3.5-flash-lite` with structured JSON schema) + deterministic regex pre-flight engine and fallback analyzer.
- **Deployment**: Vercel production hosting + GitHub version control.

---

## 📦 Features & Implemented Screens

1. **Public Landing Page** (`/`): Positioning, hero with interactive brand check preview, 4-step workflow, capabilities, security principles.
2. **Main Dashboard** (`/dashboard`): Real-time metrics (Drafts Reviewed, Approved, Needs Review, Issues Repeated), Recent Submissions table, Top Issues this week.
3. **Content Review Workspace** (`/submissions/[id]`): Two-column layout with highlighted draft text, 3 issues found, suggested revisions with one-click **Apply**, and re-audit trigger.
4. **Knowledge Base Hub** (`/knowledge-base`): Brand Guidelines, Approved Claims, Product Information, and Brand Assets.
5. **Approved Claims Library** (`/knowledge-base/claims`): Search, status filters, evidence citations, permitted context, expiry dates, and new claim creation modal.
6. **Brand Guidelines** (`/knowledge-base/guidelines`): Enforced voice & tone standards, do's & don'ts rules.
7. **Brand Terminology** (`/knowledge-base/terminology`): Prohibited terms dictionary with recommended replacements and preferred vocabulary.
8. **Document & Asset Management** (`/knowledge-base/assets`): Upload PDF/DOCX evidence files, text extraction status, and parsed claims count.
9. **Content Submission Workflow** (`/submissions/new`): Brand selector, content format, channel picker, campaign details, sample draft loader, and instant AI audit.
10. **Submission History** (`/submissions`): Searchable archive of all drafts with status badges and quick review links.
11. **Approval Queue** (`/approvals`): Segmented filter tabs (`Pending`, `Approved`, `Rejected`) and one-click review actions.
12. **Analytics & Governance Insights** (`/analytics`): Findings by severity, top recurring flags, claims approaching expiry (<30 days), turnaround time.
13. **Team & Permissions** (`/team`): RBAC matrix for Admin, Brand Manager, Reviewer, and Creator.
14. **Notifications** (`/notifications`): Alerts for pending reviews, claim expiry warnings, and approval sign-offs.
15. **Organisation & AI Settings** (`/settings`): AI guardrail toggles, strict zero-hallucination switches, model selection.
16. **Authentication** (`/auth/login`, `/auth/register`): User login and registration with pre-authenticated demo credentials.
17. **Onboarding** (`/onboarding`): 3-step setup wizard for new brand workspaces.

---

## 🚦 Getting Started Locally

### Prerequisites
- Node.js 20+ (Node 24 recommended)
- npm or pnpm

### 1. Clone & Install
```bash
git clone https://github.com/IntellectDaksh/Inkloom-AI-CodeTitans-2026.git
cd Inkloom-AI-CodeTitans-2026
npm install
```

### 2. Environment Variables
Copy the template to your local environment:
```bash
cp .env.example .env.local
```
Add your `GEMINI_API_KEY`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

Inkloom AI includes a comprehensive test suite covering the 6-stage AI engine, multi-tenant isolation, claims verification, and approval workflows:

```bash
# Run unit & pipeline tests (38 assertions)
npx tsx src/lib/ai/__tests__/governance.test.ts

# Run master end-to-end test suite (16 assertions)
npx tsx tests/full-e2e.test.ts
```

**All 54/54 automated tests pass** verifying zero cross-tenant leakage, unverified claim detection, deterministic prohibited term filtering, and approval transitions.

---

## 🚀 Production Build & Deployment

To verify production build locally:
```bash
npm run build
```

To deploy to Vercel:
```bash
vercel --prod
```

---

## 📄 License
Private SaaS application developed for enterprise brand governance.
