<p align="center"><img src="public/adsnitch-logo.svg" alt="AdSnitch" height="56"></p>

# AdSnitch

Checks your ad before the internet does.

> **Renamed:** this project was **Inkloom AI**. It is now **AdSnitch**. Same repo, same deployment.

**Live:** [inkloom-ai-tau.vercel.app](https://inkloom-ai-tau.vercel.app)

Paste or upload ad copy (a caption, reel script, email, landing page, PDF or image). AdSnitch flags claims you can't back up, missing disclosures, banned wording and copy that doesn't fit the channel, then suggests a compliant rewrite and routes risky drafts to a reviewer.

It never invents evidence. A claim is "verified" only when it matches a record in your brand's claims library; everything else is marked unsupported.

---

## Highlights

| Area | What it does |
|---|---|
| **Live check** | Score 0–100 with a breakdown, findings highlighted inline, one-click fixes |
| **File reading** | TXT, MD, HTML, RTF, JSON, CSV, DOCX locally; PDF and images read by AI with watermarks, page numbers and repeated headers/footers stripped |
| **Channel fit** | A pitch deck or brochure submitted as a reel or ad is rejected, not scored |
| **Claims library** | Approved claims with sources, excerpts, expiry dates and owners; CSV/JSON import |
| **Cascade re-review** | When a claim expires or changes, every draft that used it is flagged again |
| **Disclosures** | FTC `#ad` endorsement and FDA DSHEA disclaimer checks |
| **Approvals** | Creator, reviewer, brand manager and admin roles; disputes and overrides logged |
| **Workspaces** | One claims library and rule set per brand |
| **Audit log** | Every decision on the record |
| **First-run demo** | Two-minute walkthrough for new accounts, skippable |

## How a check runs

1. **Segment** the copy and pick out candidate claims (numbers, guarantees, superlatives, comparisons).
2. **Rules** catch banned terms, missing required phrases, expired claims and channel misfit.
3. **Retrieve** only the active brand's claims and guidelines.
4. **Model review** (Gemini) audits every claim against that evidence. A deterministic engine takes over if the model is unavailable.
5. **Safety net:** any claim nobody commented on and no record covers is still flagged unsupported.
6. **Score** with hard caps, so the number matches the verdict (any critical finding caps at 40, any high at 75).

## Repository layout

```
adsnitch/
├── src/
│   ├── app/                  Next.js App Router pages and API routes
│   │   ├── api/              check, extract, submissions, claims, approvals, profile …
│   │   ├── auth/             sign in, sign up, code-based password reset
│   │   ├── dashboard/        home for signed-in users
│   │   ├── submissions/      new check, results, history
│   │   ├── knowledge-base/   claims, guidelines, terminology, assets
│   │   └── settings/         tabbed settings
│   ├── components/           UI, landing, layout, tour and demo, submission views
│   └── lib/
│       ├── ai/               pipeline, rules, retrieval, Gemini, file extraction
│       ├── db/               store and seed data
│       └── auth/             Supabase clients
├── supabase/migrations/      Postgres schema and policies
└── tests/                    end-to-end, brand isolation, feature tests
```

## Run locally

```bash
npm install
cp .env.example .env.local   # or create it with the keys below
npm run dev
```

| Variable | Needed for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Accounts and storage |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side data access |
| `GEMINI_API_KEY` | Model review and PDF/image reading (checks still run without it) |

Password reset sends a 6-digit code: the Supabase "Reset Password" email template must include `{{ .Token }}`.

## Tests

```bash
npm test        # pipeline, governance, brand isolation, extraction, channel fit
npm run eval    # benchmark against the evaluation dataset
```

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase (Postgres, Auth, Storage), Gemini 2.5 Flash, deployed on Vercel.

## License

MIT
