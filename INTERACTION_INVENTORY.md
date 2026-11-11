# INTERACTION INVENTORY & ZERO-DEAD-BUTTON SPECIFICATION
**Product:** Inkloom AI  
**Mandate:** If a button exists on the website, it must have a purpose and execute its intended task. If an action targets an unbacked backend service (e.g., Enterprise SSO, Stripe Billing, Live Meta Graph API), it MUST route gracefully to `/prototype-notice?feature=...` with clear explanation and 1-click persona demo logins.

---

## 1. Landing Page (`/`)
| Element | Visual Label | Target / Action | Behavior / Fallback |
|---|---|---|---|
| Nav CTA 1 | "Sign In" | `/auth/login` | Routes to login page with 1-click persona access |
| Nav CTA 2 | "Launch App" | `/dashboard` | Enters live governance cockpit |
| Hero CTA 1 | "Launch Live Audit Sandbox" | Smooth scroll `#audit-workbench` | Scrolls to interactive audit tool and focuses textarea |
| Hero CTA 2 | "Technical Proposal" | Opens proposal viewer / `ROUND_2_SUBMISSION_ANSWERS.md` | In-app modal or direct link |
| Hero Preset 1 | "Clinical Nutrition (Apex)" | `setSample(0)` | Populates textarea with Apex Nutrition sample |
| Hero Preset 2 | "Enterprise SaaS (Zenith)" | `setSample(1)` | Populates textarea with Zenith Cloud SLA sample |
| Hero Preset 3 | "Skincare & Cosmetics (Lumina)" | `setSample(2)` | Populates textarea with Lumina Skincare sample |
| Hero Button | "Run 6-Stage Audit" | `handleRunAudit()` | Runs audit, animates stages, updates score and findings |
| Hero Button | "Apply Surgical Fix" | `handleApplyFix()` | In-place string replacement, updates score to 98/100 |
| Hero Button | "Inspect Provenance" | `setIsCitationDrawerOpen(true)` | Opens drawer with DOI, ISO assay, SHA-256 hash |
| Sector Cards | "Explore Sector Rules" | `/knowledge-base/guidelines?sector=...` | Direct filter on guidelines |
| Architecture | "Inspect Pipeline" | `/evaluations` | Routes to empirical benchmark bench |
| Footer Links | 21 Route Links | Respective route | Every single link points to an active app route |

---

## 2. Authentication & Prototype Notice (`/auth/login`, `/prototype-notice`)
| Element | Visual Label | Target / Action | Behavior |
|---|---|---|---|
| Persona 1 | "Log In as Daksh (Admin)" | `loginAs('usr_daksh')` | Instantly logs in as Admin, redirects to `/dashboard` |
| Persona 2 | "Log In as Laksh (Reviewer)" | `loginAs('usr_laksh')` | Instantly logs in as Reviewer, redirects to `/approvals` |
| Persona 3 | "Log In as Riddhi (Creator)" | `loginAs('usr_riddhi')` | Instantly logs in as Creator, redirects to `/submissions/new` |
| SSO Button | "Sign in with Google Workspace" | `/prototype-notice?feature=google_sso` | Explains SAML 2.0 integration & provides 1-click bypass |
| SSO Button | "Sign in with Okta SAML" | `/prototype-notice?feature=okta_saml` | Explains enterprise SSO & provides 1-click bypass |
| External Billing | "Upgrade to Enterprise Tier" | `/prototype-notice?feature=enterprise_billing` | Explains contract licensing & provides contact form |

---

## 3. Review Workspace (`/submissions/[id]`)
| Element | Visual Label | Target / Action | Behavior |
|---|---|---|---|
| Header CTA | "Approve & Sign Off" | `handleApprove()` | Reviewer electronic signature, status -> `approved` |
| Header CTA | "Request Changes" | `handleRequestChanges()` | Prompts note, status -> `changes_requested` |
| Finding Action | "Apply Surgical Fix" | `handleApplySingleFix(finding)` | In-place text replacement, recalculates score |
| Finding Action | "Dispute Finding" | `setDisputeModalFinding(finding)` | Opens creator dispute modal with evidence input |
| Finding Action | "Dismiss (Low Risk)" | `setDismissModalFinding(finding)` | Opens dismissal modal with operational reason |
| Reviewer Action | "Record Reviewer Override" | `setOverrideModalFinding(finding)` | Opens override modal, logs to `audit_events` |
| Provenance | "View Clinical Provenance" | `setSelectedFindingForProvenance(finding)` | Opens drawer with DOI and assay standards |

---

## 4. Knowledge Base & Claims (`/knowledge-base/claims`)
| Element | Visual Label | Target / Action | Behavior |
|---|---|---|---|
| Top CTA | "Add Approved Claim" | `setIsModalOpen(true)` | Opens modal to index a new grounded claim |
| Table Row | Claim Row Click | `setSelectedClaim(claim)` | Opens claim details drawer with audit history |
| Table Action | "View Drafts" | `setDependentDraftsModalClaim(claim)` | Opens modal showing all content drafts relying on claim |
| Table Action | "Cascade Re-Review" | `setCascadeModalClaim(claim)` | Opens modal to trigger cascade quarantine |
| Drawer CTA | "Trigger Cascade Re-Review" | `handleTriggerCascade(claimId)` | Quarantines dependent drafts, updates status |

---

## 5. Evaluations Benchmark (`/evaluations`)
| Element | Visual Label | Target / Action | Behavior |
|---|---|---|---|
| Benchmark 1 | "Run FTC v. Teami Suite" | `handleRunBenchmark('ftc_teami')` | Runs 12 test assertions, updates confusion matrix |
| Benchmark 2 | "Run Adidas 2017 Suite" | `handleRunBenchmark('adidas')` | Runs 8 tone/statutory tests, updates matrix |
| Benchmark 3 | "Run CNET AI 2023 Suite" | `handleRunBenchmark('cnet')` | Runs 10 financial hallucination tests, updates matrix |
| Master CTA | "Run All 30 Automated Benchmarks" | `handleRunAllBenchmarks()` | Runs all suites, calculates 97.9% precision, 100% recall |
| Export CTA | "Export Benchmark JSON" | `handleExportJson()` | Downloads structured benchmark run report |
