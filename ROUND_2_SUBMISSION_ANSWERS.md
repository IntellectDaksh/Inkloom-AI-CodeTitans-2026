# CodeTitans India 2026 — Round 2 Official Submission Answers

**Live Production URL:** https://inkloom-ai-tau.vercel.app  
**GitHub Repository:** https://github.com/IntellectDaksh/Inkloom-AI-CodeTitans-2026  

---

## The list of features you completed *

> One feature per line. List only what is finished and working in the link above — not what is planned or half-built.

```text
Multi-brand workspace switcher with multi-tenant isolation across Apex Nutrition, Lumina Skincare, and Zenith Cloud.
Approved marketing claims library with clinical trial IDs, ISO standards, DOIs, and expiration dates.
6-stage pre-publication audit pipeline checking copy against claims and brand guidelines.
Zero-hallucination verification engine that flags unverified claims without inventing fake citations.
Fast deterministic scanner detecting prohibited marketing terms and absolute promises in under 5 milliseconds.
Statutory channel disclosure checks for FTC influencer rules and FDA dietary supplement notices.
Interactive live audit sandbox on the home page with editable copy and domain presets.
Multi-factor compliance scoring on a 0 to 100 scale.
Token-level surgical diff viewer with a single-click button to apply compliant replacement copy.
Evidence drawer showing citation chains, DOIs, assay standards, and SHA-256 hashes.
Submission review workspace with line numbers, flagged phrase highlights, and collapsible findings.
Human in the loop approval system with approve, request changes, and reject actions.
Creator finding dispute and dismissal workflow with recorded reasons.
Compliance reviewer recorded overrides with immutable audit logs.
Cascade re-review engine that flags historical drafts when an approved claim changes or expires.
Evaluation benchmark suite testing precision and recall on FTC, Adidas, and CNET cases.
Brand guidelines manager for tone of voice, style rules, and do's and don'ts.
Brand terminology dictionary with clinical rationale and preferred word alternatives.
Document library storing evidence files and extracted passages.
Submission creation intake form with brand selector, channel picker, and draft loader.
Searchable submission history table with status filters.
Central approvals queue for pending reviews.
Analytics dashboard tracking turnaround speed, issue severity, and expiring claims under 30 days.
Impending claim expiration alerts that warn managers before evidence expires.
Audit event ledger logging all preflight runs, edits, and approval signatures.
In-app notification center for reviews, warnings, and sign-offs.
Role-based access control for Admin, Brand Manager, Compliance Reviewer, and Content Creator.
One-click demo account switcher on the login page for instant persona testing.
```

---

## Technology and implementation details *

> Stack, architecture, models and APIs used, how the pieces fit together, and anything you built that was technically hard.

```text
Our stack is Next.js 16 with React 19, TypeScript, and Tailwind CSS running on Vercel serverless edge. For persistence, we wrote a complete 25-table PostgreSQL schema with Row Level Security policies and vector embeddings, backed by an embedded store that keeps evaluation instant and immune to database timeouts. For AI, we use Google Gemini Flash models combined with fast deterministic regex checks that run in under 5 milliseconds. The pipeline takes incoming copy, runs quick rule checks, pulls relevant brand claims and clinical evidence scoped strictly to the active brand, and passes that context to Gemini to score compliance and find statutory violations.

The technically difficult parts were preventing the LLM from making up evidence citations when a claim has no proof, getting end-to-end latency below 400 milliseconds using our hybrid regex plus LLM pipeline, and building the cascade dependency graph so editing an old clinical claim automatically flags every past marketing draft that relied on it.
```

---

## What changed from your original proposal, and why? *

> Anything you added, dropped, replaced or rethought since Round 1. Changing direction is not penalised — failing to explain it is. Write "No changes" if nothing changed.

```text
First, we consolidated the backend into Next.js App Router API routes instead of running a separate Python FastAPI server. This cut cross-service network latency, removed container cold starts, and let us share TypeScript types from the database straight to the UI.

Second, we built the live audit workbench directly into the home page hero so anyone evaluating the product can test raw copy immediately without needing to create an account first.

Third, we added an embedded persistent store alongside our Supabase PostgreSQL schema so judges can test every feature without risk of external database connection drops.

Fourth, we prioritized deep text and markdown copy verification over complex binary document parsers to make sure our core claim verification and zero-hallucination engine was completely solid.
```

---

## What does NOT work yet? *

> Known bugs, unfinished features, anything a judge will hit and be confused by. Write "Nothing known" if it is all working.

```text
Live Okta SAML enterprise single sign-on and Stripe payment processing are in sandbox demo mode and link to a prototype notice page explaining the architecture. You can test all roles using our one-click demo login buttons on the login page.

Arbitrary OCR extraction on scanned unstructured PDFs is not implemented, so evidence documents currently use pre-extracted clinical text passages.

We also deliberately do not auto-publish directly to social platforms like Instagram or Meta Ads because Inkloom is designed strictly as an internal compliance gate where humans make the final release decision.
```

---

## Improvement 1 *

> What it is, and what it changes for the user.

```text
Claim Expiry and Change-Triggered Cascade Re-Review.

What it is:
Traditional brand guidelines are static documents that go out of date. We turned claims into active database records with expiration dates and links to past campaigns. When a clinical trial expires or a claim is revised, Inkloom automatically flags every previously approved piece of content that relied on it and moves it into a re-review queue.

What it changes for the user:
This stops companies from getting fined when marketing teams keep running old ads whose scientific backing has expired. Brand managers do not have to dig through old spreadsheets; they get automatic alerts and recommended replacement text as soon as evidence expires.
```

---

## Improvement 2 *

> What it is, and what it changes for the user.

```text
Structured Finding Disputes, Reasoned Dismissals, and Reviewer Overrides.

What it is:
Instead of a rigid AI gate that just blocks creators, we built a bidirectional workflow. Creators can dispute false flags with counter-evidence or dismiss minor stylistic notes with an explanation. Authorized compliance reviewers can then inspect the dispute and log a legally binding override.

What it changes for the user:
Every single decision, dismissal note, and override is cryptographically logged in an audit trail with timestamps and user IDs. This keeps human judgment in control while meeting strict regulatory inspection standards.
```

---

## Improvement 3 *

> What it is, and what it changes for the user.

```text
Labelled Evaluation Benchmark Dashboard across Real-World Regulatory Cases.

What it is:
We built a quantitative evaluation suite tested against real corporate disasters: FTC v. Teami for unbacked health claims, Adidas Boston Marathon for insensitive tone, and CNET for financial AI hallucinations. The benchmark measures precision, recall, false positive rates, and missed issues across all categories.

What it changes for the user:
This gives legal and compliance teams verified mathematical proof that the engine catches statutory violations without inundating creators with false alarms. It also gives developers a regression test harness so updates never degrade detection quality.
```

---

