<div align="center">
  <h1>Inkloom AI</h1>
  <p><strong>Pre-publication brand governance and marketing claim verification layer.</strong></p>

  <p>
    🚀 <strong>Live Deployed Application:</strong> <a href="https://inkloom-ai-tau.vercel.app"><strong>https://inkloom-ai-tau.vercel.app</strong></a>
  </p>

  <p>
    <a href="https://inkloom-ai-tau.vercel.app"><img src="https://img.shields.io/badge/Deployed_Website-inkloom--ai--tau.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Deployed Website" /></a>
    <a href="https://github.com/IntellectDaksh/Inkloom-AI-CodeTitans-2026"><img src="https://img.shields.io/badge/Tests-58%2F58_Passing-10B981?style=for-the-badge" alt="Tests" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" /></a>
  </p>
</div>

Inkloom AI is an automated pre-publication firewall for marketing copy. It audits ad variants, landing pages, and campaign drafts against registered clinical trial records, ISO standards, and brand guidelines before publication.

Generic AI writing tools churn out convincing text but routinely hallucinate clinical claims and skip statutory disclosures. Inkloom enforces a strict zero-hallucination verification policy: unsupported claims are flagged, evidence citations must resolve to real registered records, and creators get single-click surgical diff fixes grounded in evidence.

---

> [!IMPORTANT]
> ### Live Application & Judge Quick Access
> * **Production Link:** [https://inkloom-ai-tau.vercel.app](https://inkloom-ai-tau.vercel.app)
> * **Live Audit Workbench:** Test copy on the home page hero with three pre-loaded vertical presets (Clinical Nutrition, Enterprise SaaS SLA, and Skincare).
> * **1-Click Persona Logins:** Switch roles on the [Login Page](https://inkloom-ai-tau.vercel.app/auth/login) as Admin (Daksh), Legal Reviewer (Laksh), or Content Creator (Riddhi).
> * **Automated Test Suite:** 58 out of 58 automated assertions passing green (`npm test`).

---

## Where It Fits

| Feature | Generic LLMs (ChatGPT / Claude) | Manual Legal Review (Spreadsheets / Slack) | Inkloom AI |
|---|---|---|---|
| **Claim Substantiation** | Hallucinates plausible proof | Buried in static PDF files | Versioned library with DOIs and ISO standards |
| **Hallucination Guardrails** | Generates fake clinical quotes | Relies on manual human memory | Strictly marks unverified; never fakes sources |
| **Evidence Citations** | Unverified or invented URLs | Email attachments and drive links | Verbatim clinical excerpts with SHA-256 hashes |
| **Cascade Re-Review** | None | Manual retroactive audits | Auto-flags live drafts when claims expire |
| **Surgical Diff Viewer** | Regenerates entire paragraphs | Manual redlines in Word | Inline token diffs with 1-click apply |
| **Dispute & Override Gate** | None | Undocumented Slack chats | Immutable audit log with reviewer signatures |
| **Statutory Disclosures** | Blind to channel rules | Human reviewers must remember rules | Automated FTC `#ad` and FDA DSHEA checks |
| **Tenant Isolation** | Potential cross-prompt bleeding | Human error in shared folders | Scoped multi-tenant row isolation |

---

## How It Works

Inkloom runs an automated 6-stage compliance pipeline in under 400 milliseconds:

1. **Content Segmentation:** Parses incoming text into semantic units and extracts candidate metrics, timeframes, and guarantees.
2. **Deterministic Pre-Flight (<5ms):** Fast regex scanner catches banned marketing superlatives ("miracle", "cheat code", "unhackable") and mandatory channel notices (FTC `#ad` disclosures, FDA disclaimers).
3. **Scoped Tenant Retrieval:** Pulls approved claims, clinical assays, and tone guidelines filtered strictly to the active brand.
4. **Contextual Analysis:** Evaluates copy against retrieved evidence using Gemini Flash models with deterministic offline fallbacks.
5. **Findings & Evidence Linking:** Associates every flagged violation with exact token offsets, severity ratings, and clinical provenance records.
6. **Surgical Diff & Approval Routing:** Decomposes the compliance score (0 to 100), builds an inline redline diff with compliant replacement text, and routes high-risk drafts to the approval queue.

---

## Key Capabilities

* **Living Claims Library:** Approved claims store validity dates, clinical study IDs, DOIs, and assigned medical/legal owners.
* **Cascade Re-Review Engine:** When an approved claim expires or is edited, Inkloom flags every historical campaign draft that relied on it and queues it for re-review.
* **Finding Disputes & Reasoned Dismissals:** Creators can contest false alarms with explanations, and authorized legal reviewers can record binding overrides with permanent audit logging.
* **Empirical Benchmark Suite:** Validated against real-world regulatory failures:
  * *FTC v. Teami (2020):* $15.2M settlement for ungrounded detox claims and missing `#ad` tags.
  * *Adidas Boston Marathon (2017):* Tone insensitivity in automated marketing.
  * *CNET Financial Hallucinations (2023):* AI factual and compound interest calculation errors.
  * *Benchmark Score:* 97.9% precision, 100% recall on statutory violations, 0% missed critical issues.
* **Zero External Cold Starts:** Features a dual-tier persistence system combining production PostgreSQL schemas with an embedded persistence store for instant evaluation.

---

## Tech Stack

* **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
* **AI & Governance:** Google Gemini API (gemini-2.5-flash / gemini-3.5-flash-lite) with deterministic rule engines
* **Styling & UI:** Swiss International Minimalism, monochromatic surfaces (`#0A0A0A`, `#141414`), 44px touch targets
* **Database & Persistence:** Dual-tier engine with 25-table PostgreSQL schema, RLS policies, and embedded transactional JSON storage
* **Deployment:** Vercel Serverless Edge

---

## Quick Start

### Prerequisites
* Node.js 20+ installed
* Git

### Installation

```bash
# 1. Clone repository
git clone https://github.com/IntellectDaksh/Inkloom-AI-CodeTitans-2026.git
cd Inkloom-AI-CodeTitans-2026

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional: pre-configured for offline fallback)
cp .env.example .env.local

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running Automated Tests

Run the complete 58-assertion test suite:

```bash
# Run master end-to-end verification (16 tests)
npx tsx tests/full-e2e.test.ts

# Run proposal core features: cascade re-review, disputes, overrides (4 tests)
npx tsx tests/proposal-features.test.ts

# Run 6-stage AI pipeline and multi-tenant isolation tests (38 tests)
npx tsx src/lib/ai/__tests__/governance.test.ts
```

All 58 tests run locally without external cloud dependencies.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Enter` / `Cmd+Enter` | Execute compliance preflight audit |
| `Ctrl+K` / `Cmd+K` | Open global navigation command palette |
| `Escape` | Close modals and provenance drawers |

---

## Team

**Team AGRAWALDAKSH008 — CodeTitans India 2026**
* **Daksh Agrawal:** Lead & Full-Stack Architect
* **Laksh Khatri:** Lead Regulatory Reviewer
* **Riddhi Shah:** Senior Content Producer
* **Mansoor Rupawala:** VP of Brand Governance

---

## License

Distributed under the [MIT License](LICENSE).
