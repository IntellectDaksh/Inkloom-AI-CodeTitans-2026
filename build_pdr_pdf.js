const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const visualDir = 'E:/Hackathon Projects/Inkloom - 2026/VISUAL_ASSETS';
const rootDir = 'E:/Hackathon Projects/Inkloom - 2026';

function getBase64Image(filename) {
  const filePath = path.join(visualDir, filename);
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filename).toLowerCase().replace('.', '');
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
    return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
  }
  return '';
}

const imgHero = getBase64Image('01_hero_homepage.jpg');
const imgWorkbench = getBase64Image('02_workbench_full.jpg');
const imgEvaluations = getBase64Image('05_evaluations_benchmark.jpg');
const imgLandmark = getBase64Image('06_landmark_cases.jpg');
const imgTeam = getBase64Image('07_team_bifurcation.jpg');

let archSvg = '';
const svgPath = path.join(rootDir, 'ARCHITECTURE.svg');
if (fs.existsSync(svgPath)) {
  archSvg = fs.readFileSync(svgPath, 'utf8')
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<!DOCTYPE[\s\S]*?>/g, '');
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Inkloom AI — Project Design Report (PDR) — CodeTitans India 2026</title>
<style>
  @page {
    size: A4 portrait;
    margin: 0;
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #111111;
    background-color: #FFFFFF;
    font-size: 10pt;
    line-height: 1.45;
  }
  .page {
    width: 210mm;
    height: 297mm;
    max-height: 297mm;
    page-break-after: always;
    page-break-inside: avoid;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10mm 12mm 10mm 12mm;
    overflow: hidden;
  }
  .page:last-child {
    page-break-after: auto;
  }
  
  /* Running Header & Footer */
  .header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #E5E7EB;
    padding-bottom: 4px;
    margin-bottom: 8px;
    font-size: 8pt;
    color: #6B7280;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .header-bar .logo-tag {
    color: #087F5B;
    font-weight: 700;
  }
  .footer-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #E5E7EB;
    padding-top: 4px;
    margin-top: 6px;
    font-size: 8pt;
    color: #6B7280;
  }
  .footer-bar .page-num {
    font-weight: 700;
    color: #111111;
  }

  /* Typography */
  h1.doc-title {
    font-size: 26pt;
    font-weight: 800;
    letter-spacing: -0.8px;
    color: #0A0A0A;
    margin: 0 0 2px 0;
    line-height: 1.1;
  }
  .doc-subtitle {
    font-size: 12.5pt;
    font-weight: 600;
    color: #087F5B;
    margin: 0 0 8px 0;
    line-height: 1.3;
  }
  h2.page-heading {
    font-size: 18pt;
    font-weight: 700;
    letter-spacing: -0.4px;
    color: #0A0A0A;
    margin: 0 0 2px 0;
    line-height: 1.2;
  }
  .page-subheading {
    font-size: 9.5pt;
    color: #4B5563;
    margin: 0 0 8px 0;
  }
  h3.section-heading {
    font-size: 11pt;
    font-weight: 700;
    color: #111111;
    margin: 0 0 4px 0;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    border-left: 3px solid #087F5B;
    padding-left: 6px;
  }
  p {
    margin: 0 0 6px 0;
    color: #2B2F38;
    font-size: 9pt;
    line-height: 1.42;
  }
  strong {
    color: #111111;
    font-weight: 600;
  }

  /* Meta Strip */
  .meta-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    background: #F9FAFB;
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    padding: 6px 12px;
    margin-bottom: 10px;
    font-size: 8.5pt;
  }
  .meta-item {
    display: flex;
    gap: 4px;
  }
  .meta-label {
    color: #6B7280;
    font-weight: 600;
  }
  .meta-value {
    color: #111111;
    font-weight: 700;
  }
  .meta-link {
    color: #087F5B;
    text-decoration: none;
    font-weight: 600;
  }

  /* Grid Layouts */
  .grid-2col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .grid-3col {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }
  .grid-4col {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 8px;
  }

  /* Card Containers */
  .card {
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    padding: 8px 10px;
  }
  .card-gray {
    background: #F8F9FA;
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    padding: 8px 10px;
  }
  .card-highlight {
    background: #F0FDF4;
    border: 1px solid #86EFAC;
    border-radius: 6px;
    padding: 8px 10px;
  }

  /* Images & Figures */
  .figure-box {
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    overflow: hidden;
    background: #0A0A0A;
    margin-bottom: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .figure-box img {
    display: block;
    width: 100%;
    height: auto;
  }
  .figure-caption {
    font-size: 8pt;
    color: #6B7280;
    font-style: italic;
    margin-top: 2px;
    margin-bottom: 6px;
    text-align: center;
  }

  /* Tables */
  table.pdr-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8pt;
    margin: 4px 0 6px 0;
  }
  table.pdr-table th, table.pdr-table td {
    padding: 4px 6px;
    border: 1px solid #E5E7EB;
    text-align: left;
  }
  table.pdr-table th {
    background: #F3F4F6;
    font-weight: 700;
    color: #374151;
  }
  table.pdr-table tr:nth-child(even) td {
    background: #F9FAFB;
  }

  /* Process Steps Bar */
  .process-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #F3F4F6;
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    padding: 6px 12px;
    margin-top: 4px;
  }
  .step-node {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 8pt;
    font-weight: 700;
    color: #111111;
  }
  .step-node .circle {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #087F5B;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 7.5pt;
  }
  .step-arrow {
    color: #9CA3AF;
    font-size: 11pt;
    font-weight: bold;
  }

  /* Badges */
  .badge {
    display: inline-block;
    padding: 1.5px 6px;
    border-radius: 4px;
    font-size: 7.5pt;
    font-weight: 700;
  }
  .badge-green { background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0; }
  .badge-red { background: #FEE2E2; color: #991B1B; border: 1px solid #FECACA; }
  .badge-amber { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
  .badge-gray { background: #F3F4F6; color: #374151; border: 1px solid #E5E7EB; }

  /* Code & Monospace identifiers */
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 8pt;
    background: #F3F4F6;
    padding: 1px 3px;
    border-radius: 3px;
    color: #111111;
  }
</style>
</head>
<body>

<!-- ========================================================================= -->
<!-- PAGE 1: PROJECT OVERVIEW & PRODUCT INTRODUCTION                           -->
<!-- ========================================================================= -->
<div class="page" id="page-1">
  <div>
    <div class="header-bar">
      <span><span class="logo-tag">INKLOOM AI</span> · PROJECT DESIGN REPORT (PDR)</span>
      <span>CODETITANS INDIA 2026</span>
    </div>

    <!-- Title & Metadata -->
    <h1 class="doc-title">INKLOOM AI</h1>
    <div class="doc-subtitle">Enterprise Brand Governance &amp; Pre-Publication Marketing Claim Verification</div>

    <div class="meta-strip">
      <div class="meta-item"><span class="meta-label">Track:</span> <span class="meta-value">CodeTitans India 2026</span></div>
      <div class="meta-item"><span class="meta-label">Team ID:</span> <span class="meta-value">AGRAWALDAKSH008</span></div>
      <div class="meta-item"><span class="meta-label">Production URL:</span> <a href="https://inkloom-ai-tau.vercel.app" class="meta-link">https://inkloom-ai-tau.vercel.app</a></div>
      <div class="meta-item"><span class="meta-label">GitHub:</span> <a href="https://github.com/IntellectDaksh/Inkloom-AI-CodeTitans-2026" class="meta-link">IntellectDaksh/Inkloom-AI-CodeTitans-2026</a></div>
    </div>

    <!-- 2-Column Overview -->
    <div class="grid-2col" style="margin-bottom: 8px;">
      <!-- Left Column: Problem & Executive Summary -->
      <div>
        <h3 class="section-heading">Executive Summary</h3>
        <p>
          Inkloom AI is an automated, pre-publication brand governance firewall and marketing claim verification platform. It systematically intercepts marketing copy across social channels, paid ad variants, landing pages, and email campaigns before publication. By verifying assertions against registered clinical trials, ISO laboratory standards, statutory registers, and brand voice guidelines, Inkloom prevents multimillion-dollar regulatory fines and brand liabilities while keeping human reviewers in complete control.
        </p>

        <h3 class="section-heading">Problem Statement</h3>
        <p>
          Generative AI tools allow marketing teams to produce thousands of digital assets each week at near-zero marginal cost, drastically magnifying enterprise liability:
        </p>
        <div style="font-size: 8.5pt; color: #2B2F38; padding-left: 8px;">
          <div style="margin-bottom: 3px;">• <strong>Unsubstantiated Claims:</strong> Overpromising phrases ("cures illness", "2x faster in 14 days") slip into ad copy without randomized double-blind placebo control trials (CARSE standard).</div>
          <div style="margin-bottom: 3px;">• <strong>Statutory Omissions:</strong> Campaigns routinely violate mandatory statutory notices (FTC 16 CFR § 255 endorsement disclosures, FDA DSHEA § 403(r)(6) dietary disclaimers).</div>
          <div style="margin-bottom: 3px;">• <strong>Regulatory Drift:</strong> Approved ads remain in digital circulation long after the underlying clinical trial, patent certification, or ISO license has expired.</div>
          <div>• <strong>Fragmented Workflows:</strong> Enterprise legal review relies on static PDFs, dormant spreadsheets, and informal Slack sign-offs with zero auditable provenance.</div>
        </div>
      </div>

      <!-- Right Column: Proposed Solution & Core Value -->
      <div>
        <h3 class="section-heading">Proposed Solution</h3>
        <p>
          Inkloom AI establishes an end-to-end deterministic and AI-assisted governance firewall:
        </p>
        <div style="font-size: 8.5pt; color: #2B2F38; padding-left: 8px; margin-bottom: 6px;">
          <div style="margin-bottom: 3px;">• <strong>Deterministic Pre-Flight (<5ms):</strong> Regex scanner catches banned superlatives and missing statutory notices before invoking expensive LLMs.</div>
          <div style="margin-bottom: 3px;">• <strong>Evidence-Grounded AI Analysis:</strong> Google Gemini Flash evaluates context against active brand claims; ungrounded statements are strictly flagged with zero hallucinated sources.</div>
          <div style="margin-bottom: 3px;">• <strong>Word-Level Surgical Diffing:</strong> Preserves brand voice by highlighting exact non-compliant tokens and offering 1-click clinically substantiated replacements.</div>
          <div>• <strong>Living Claims &amp; Cascade Engine:</strong> Expiration dates trigger automated cascade re-reviews across all historically approved campaign drafts.</div>
        </div>

        <h3 class="section-heading">Primary Target Users</h3>
        <div class="grid-3col" style="gap: 6px; margin-top: 4px;">
          <div class="card-gray" style="padding: 5px 6px;">
            <strong style="font-size: 8pt; display: block; color: #087F5B;">Brand Managers</strong>
            <span style="font-size: 7.5pt; color: #555555;">Multi-brand scoping, guidelines &amp; risk analytics.</span>
          </div>
          <div class="card-gray" style="padding: 5px 6px;">
            <strong style="font-size: 8pt; display: block; color: #087F5B;">Legal Reviewers</strong>
            <span style="font-size: 7.5pt; color: #555555;">Binding overrides, disputes &amp; 21 CFR 11 audit trails.</span>
          </div>
          <div class="card-gray" style="padding: 5px 6px;">
            <strong style="font-size: 8pt; display: block; color: #087F5B;">Content Creators</strong>
            <span style="font-size: 7.5pt; color: #555555;">Instant 1-click surgical diff fixes in the review studio.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Visual: Live Content Audit Workbench -->
    <h3 class="section-heading" style="margin-top: 2px;">The Core Product in Action</h3>
    <div class="figure-box" style="height: 75mm; display: flex; align-items: center; justify-content: center; background: #000;">
      <img src="${imgWorkbench}" style="width: 100%; height: 100%; object-fit: contain;" alt="Live Content Audit Workbench" />
    </div>
    <div class="figure-caption">
      Figure 1.1: Live Content Audit Workbench — Real-time governance compiler dissecting raw copy, scoring compliance (18/100 Flagged), surfacing statutory violations, and generating word-level surgical diffs.
    </div>

    <!-- Process Workflow Strip -->
    <div class="process-bar">
      <div class="step-node"><span class="circle">1</span><span>Draft Ingestion</span></div>
      <span class="step-arrow">→</span>
      <div class="step-node"><span class="circle">2</span><span>Pre-Flight (<5ms)</span></div>
      <span class="step-arrow">→</span>
      <div class="step-node"><span class="circle">3</span><span>Evidence Grounding</span></div>
      <span class="step-arrow">→</span>
      <div class="step-node"><span class="circle">4</span><span>Surgical Redline</span></div>
      <span class="step-arrow">→</span>
      <div class="step-node"><span class="circle">5</span><span>Human Approval</span></div>
    </div>
  </div>

  <div class="footer-bar">
    <span>Inkloom AI · CodeTitans India 2026 Submission</span>
    <span>https://inkloom-ai-tau.vercel.app</span>
    <span class="page-num">Page 1 of 5</span>
  </div>
</div>

<!-- ========================================================================= -->
<!-- PAGE 2: SYSTEM ARCHITECTURE & TECHNICAL IMPLEMENTATION                    -->
<!-- ========================================================================= -->
<div class="page" id="page-2">
  <div>
    <div class="header-bar">
      <span><span class="logo-tag">INKLOOM AI</span> · SYSTEM ARCHITECTURE &amp; ENGINEERING</span>
      <span>CODETITANS INDIA 2026</span>
    </div>

    <h2 class="page-heading">System Architecture &amp; Engineering</h2>
    <div class="page-subheading">Deterministic Rule Enforcement Combined with Evidence-Grounded Contextual Intelligence</div>

    <!-- Technology Stack Strip -->
    <div class="meta-strip" style="margin-bottom: 6px;">
      <div class="meta-item"><span class="meta-label">Frontend &amp; Runtime:</span> <span class="meta-value">Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4</span></div>
      <div class="meta-item"><span class="meta-label">Deployment:</span> <span class="meta-value">Vercel Serverless Edge</span></div>
      <div class="meta-item"><span class="meta-label">Persistence:</span> <span class="meta-value">PostgreSQL with Row-Level Security (RLS) · Dual-Tier Embedded Store</span></div>
      <div class="meta-item"><span class="meta-label">AI Engine:</span> <span class="meta-value">Google Gemini 2.5 Flash &amp; 3.5 Flash-Lite</span></div>
      <div class="meta-item"><span class="meta-label">Verification:</span> <span class="meta-value">58 / 58 Passing Automated Tests</span></div>
    </div>

    <!-- High-Resolution Vector Architecture Diagram -->
    <div style="border: 1px solid #D1D5DB; border-radius: 6px; overflow: hidden; background: #FFFFFF; height: 122mm; margin-bottom: 4px;">
      ${archSvg}
    </div>
    <div class="figure-caption">
      Figure 2.1: Architectural Topology — 8-Stage Governance Lifecycle, Dual-Tier Database Persistence, and Deterministic Pre-Flight Guardrails.
    </div>

    <!-- Architecture Explanation Columns -->
    <div class="grid-3col" style="gap: 8px; margin-top: 4px;">
      <!-- Col 1: Deterministic vs LLM Boundary -->
      <div class="card-gray">
        <strong style="font-size: 8.5pt; color: #087F5B; display: block; margin-bottom: 3px;">1. Deterministic-First Pre-Flight</strong>
        <p style="font-size: 8pt; line-height: 1.35; margin: 0;">
          Running regex rule checks prior to LLM calls eliminates 80% of common violations in under 5ms. It deterministically blocks banned superlatives (<em>"miracle"</em>, <em>"unhackable"</em>) and statutory disclosure omissions (FTC <code>#ad</code>, FDA DSHEA notices), protecting API quotas and lowering P95 latency to 420ms.
        </p>
      </div>

      <!-- Col 2: Multi-Tenant RLS Scoping -->
      <div class="card-gray">
        <strong style="font-size: 8.5pt; color: #087F5B; display: block; margin-bottom: 3px;">2. Multi-Tenant Database Isolation</strong>
        <p style="font-size: 8pt; line-height: 1.35; margin: 0;">
          Enforced via PostgreSQL Row-Level Security (RLS) across 25 schema tables. Claims, evidence assets, and guidelines are partitioned strictly by <code>brand_id</code>. Vector embeddings (1536 dim) assert complete isolation, ensuring zero cross-brand evidence leakage between Apex Nutrition, Lumina Skincare, and Zenith Cloud.
        </p>
      </div>

      <!-- Col 3: Dual-Tier Persistence & Audit -->
      <div class="card-gray">
        <strong style="font-size: 8.5pt; color: #087F5B; display: block; margin-bottom: 3px;">3. Dual-Tier Persistence &amp; Ledger</strong>
        <p style="font-size: 8pt; line-height: 1.35; margin: 0;">
          Pairs a production 25-table PostgreSQL migration script with an embedded transactional engine (<code>InkloomStore</code>). This guarantees zero cold-start pauses during evaluation. All preflights, edits, disputes, and approvals emit immutable SHA-256 state hashes into <code>audit_events</code> satisfying FDA 21 CFR Part 11.
        </p>
      </div>
    </div>

    <!-- Pipeline Note & Explanation -->
    <div class="card-highlight" style="margin-top: 6px; padding: 6px 10px;">
      <strong style="font-size: 8.5pt; color: #087F5B;">Architecture Reconciliation Note:</strong>
      <span style="font-size: 8pt; color: #2B2F38;">
        The official Round 2 submission text describes the analytical core as a <em>6-stage AI governance pipeline</em> (Segmentation, Regex, Retrieval, LLM Analysis, Finding Generation, Scoring/Diffing). The live production application visualizes this as an <em>8-stage governance lifecycle</em> by explicitly presenting initial ingestion segmentation and the terminal cryptographic audit logging &amp; cascade re-review trigger. Both descriptions reflect the same unified codebase.
      </span>
    </div>
  </div>

  <div class="footer-bar">
    <span>Inkloom AI · CodeTitans India 2026 Submission</span>
    <span>https://inkloom-ai-tau.vercel.app</span>
    <span class="page-num">Page 2 of 5</span>
  </div>
</div>

<!-- ========================================================================= -->
<!-- PAGE 3: PRODUCT DEMONSTRATION & CORE WORKFLOWS                            -->
<!-- ========================================================================= -->
<div class="page" id="page-3">
  <div>
    <div class="header-bar">
      <span><span class="logo-tag">INKLOOM AI</span> · PRODUCT DEMONSTRATION &amp; WORKFLOWS</span>
      <span>CODETITANS INDIA 2026</span>
    </div>

    <h2 class="page-heading">Product Demonstration: From Risky Copy to Grounded Approval</h2>
    <div class="page-subheading">Word-Level Surgical Redline Diffing, Evidentiary Provenance, and Human Approval Governance</div>

    <!-- 3 Demonstrations Grid -->
    <div class="grid-3col" style="gap: 10px; margin-bottom: 8px;">
      <!-- Demonstration 1 -->
      <div class="card" style="padding: 8px;">
        <span class="badge badge-gray" style="margin-bottom: 4px;">DEMONSTRATION 01</span>
        <strong style="font-size: 9pt; display: block; color: #111111; margin-bottom: 3px;">Live Content Audit Workbench</strong>
        <p style="font-size: 8pt; line-height: 1.35; margin-bottom: 6px;">
          Available directly on the landing page hero. Evaluators select presets (Clinical Nutrition, Enterprise SaaS, Skincare) and execute live audits in 420ms.
        </p>
        <div style="background: #0A0A0A; border-radius: 4px; padding: 6px; font-family: monospace; font-size: 7.5pt; color: #EDEDED; margin-bottom: 4px;">
          <div style="color: #F87171; font-weight: bold;">Score: 18/100 · Critical Flags</div>
          <div style="color: #9CA3AF; margin-top: 2px;">• Unverified Multiplier ("2x faster")</div>
          <div style="color: #FBBF24;">• Ungrounded Time-Bound ("14 days")</div>
          <div style="color: #9CA3AF;">• Missing FDA DSHEA Statutory Tag</div>
        </div>
        <p style="font-size: 7.5pt; color: #555555; margin: 0;">
          Dissects high-stakes claims against registered library contracts in real time.
        </p>
      </div>

      <!-- Demonstration 2 -->
      <div class="card" style="padding: 8px;">
        <span class="badge badge-green" style="margin-bottom: 4px;">DEMONSTRATION 02</span>
        <strong style="font-size: 9pt; display: block; color: #111111; margin-bottom: 3px;">Word-Level Surgical Diff Viewer</strong>
        <p style="font-size: 8pt; line-height: 1.35; margin-bottom: 6px;">
          Rather than rewriting entire drafts, Inkloom highlights exact token additions and deletions, preserving authorial tone and creative flow.
        </p>
        <div style="background: #0A0A0A; border-radius: 4px; padding: 6px; font-size: 7.5pt; margin-bottom: 4px; line-height: 1.3;">
          <div style="color: #F87171; text-decoration: line-through; margin-bottom: 3px;">
            "2x faster muscle recovery and builds lean mass in just 14 days"
          </div>
          <div style="color: #4ADE80; font-weight: 500;">
            "accelerated muscle protein synthesis over 8 weeks resistance training"
          </div>
        </div>
        <p style="font-size: 7.5pt; color: #555555; margin: 0;">
          Single-click "Apply Surgical Fix" immediately elevates score from 18/100 to 94/100.
        </p>
      </div>

      <!-- Demonstration 3 -->
      <div class="card" style="padding: 8px;">
        <span class="badge badge-gray" style="margin-bottom: 4px;">DEMONSTRATION 03</span>
        <strong style="font-size: 9pt; display: block; color: #111111; margin-bottom: 3px;">Cryptographic Provenance Drawer</strong>
        <p style="font-size: 8pt; line-height: 1.35; margin-bottom: 6px;">
          Selecting any flagged claim displays the exact evidentiary grounding backing the substantiated replacement text.
        </p>
        <div style="background: #0A0A0A; border-radius: 4px; padding: 6px; font-family: monospace; font-size: 7.5pt; color: #EDEDED; margin-bottom: 4px;">
          <div style="color: #60A5FA;">Claim: CLM-APX-001 (Active Grounded)</div>
          <div style="color: #9CA3AF;">DOI: 10.1016/j.nutres.2024.108421</div>
          <div style="color: #9CA3AF;">Assay: ISO 22196:2011 Annex C RCT</div>
          <div style="color: #34D399;">SHA: 7f83b165...5cf6287c</div>
        </div>
        <p style="font-size: 7.5pt; color: #555555; margin: 0;">
          Verbatim clinical excerpts satisfy stringent legal and FDA audit requirements.
        </p>
      </div>
    </div>

    <!-- Visual: Hero Clearance Preview & 4 Landmark Cases -->
    <div class="grid-2col" style="gap: 10px; margin-bottom: 6px;">
      <div>
        <h3 class="section-heading" style="margin-top: 0;">Compliance Clearance Report</h3>
        <div class="figure-box" style="height: 60mm; display: flex; align-items: center; justify-content: center; background: #0A0A0A;">
          <img src="${imgHero}" style="width: 100%; height: 100%; object-fit: cover; object-position: 100% 20%;" alt="Hero Clearance Preview" />
        </div>
        <div class="figure-caption">Figure 3.1: Hero Pre-Publication Clearance Dossier — Dual-column redline comparison and evidence metadata.</div>
      </div>

      <div>
        <h3 class="section-heading" style="margin-top: 0;">Real-World Landmark Test Suite</h3>
        <div class="figure-box" style="height: 60mm; display: flex; align-items: center; justify-content: center; background: #0A0A0A;">
          <img src="${imgLandmark}" style="width: 100%; height: 100%; object-fit: contain;" alt="Landmark Regulatory Cases" />
        </div>
        <div class="figure-caption">Figure 3.2: 4 Canonical Regulatory Disasters Evaluated by the Inkloom Governance Engine.</div>
      </div>
    </div>

    <!-- Human-in-the-Loop Governance Flow -->
    <h3 class="section-heading" style="margin-top: 2px;">Human-in-the-Loop Multi-Action Governance Gate</h3>
    <div class="card-gray" style="padding: 8px 12px;">
      <p style="font-size: 8.5pt; margin-bottom: 4px;">
        Unlike opaque "black box" systems, Inkloom ensures humans retain absolute authority. Content creators are not blocked by rigid automated flags:
      </p>
      <div class="grid-3col" style="gap: 8px; font-size: 8pt;">
        <div>
          <strong style="color: #087F5B;">Creator Dispute Workflow:</strong>
          Creators can challenge automated flags by attaching counter-evidence or citing regional marketing safe harbors (e.g. 21 CFR § 101.93).
        </div>
        <div>
          <strong style="color: #087F5B;">Reasoned Dismissal:</strong>
          Minor stylistic suggestions can be dismissed with a mandatory justification note logged into the immutable audit ledger.
        </div>
        <div>
          <strong style="color: #087F5B;">Reviewer Recorded Override:</strong>
          Authorized compliance officers (<code>reviewer</code> / <code>admin</code> roles) can record formal legal overrides, signing with their digital ID and rationale.
        </div>
      </div>
    </div>
  </div>

  <div class="footer-bar">
    <span>Inkloom AI · CodeTitans India 2026 Submission</span>
    <span>https://inkloom-ai-tau.vercel.app</span>
    <span class="page-num">Page 3 of 5</span>
  </div>
</div>

<!-- ========================================================================= -->
<!-- PAGE 4: ENGINEERING DIFFERENTIATORS & EVALUATION                          -->
<!-- ========================================================================= -->
<div class="page" id="page-4">
  <div>
    <div class="header-bar">
      <span><span class="logo-tag">INKLOOM AI</span> · DIFFERENTIATORS &amp; EVALUATION</span>
      <span>CODETITANS INDIA 2026</span>
    </div>

    <h2 class="page-heading">Engineering Differentiators &amp; Evaluation</h2>
    <div class="page-subheading">Quantitative Heuristics, Canonical Regulatory Disasters, and Ground Truth Benchmarks</div>

    <!-- 9 Core Differentiators Grid -->
    <h3 class="section-heading" style="margin-bottom: 4px;">9 Core Engineering Differentiators</h3>
    <div class="grid-3col" style="gap: 6px; margin-bottom: 8px;">
      <div class="card" style="padding: 6px 8px;">
        <strong style="font-size: 8pt; color: #087F5B; display: block;">1. Deterministic-First Preflight</strong>
        <span style="font-size: 7.5pt; color: #4B5563;">Sub-5ms regex catches overt banned terms before invoking LLMs.</span>
      </div>
      <div class="card" style="padding: 6px 8px;">
        <strong style="font-size: 8pt; color: #087F5B; display: block;">2. Living Claims Contracts</strong>
        <span style="font-size: 7.5pt; color: #4B5563;">Claims are versioned DB entities with DOIs, ISO assays, and owners.</span>
      </div>
      <div class="card" style="padding: 6px 8px;">
        <strong style="font-size: 8pt; color: #087F5B; display: block;">3. Zero-Hallucination Policy</strong>
        <span style="font-size: 7.5pt; color: #4B5563;">Strictly flags unverified claims as false; never invents citations.</span>
      </div>
      <div class="card" style="padding: 6px 8px;">
        <strong style="font-size: 8pt; color: #087F5B; display: block;">4. Token Surgical Diffing</strong>
        <span style="font-size: 7.5pt; color: #4B5563;">Replaces only non-compliant tokens, protecting author tone.</span>
      </div>
      <div class="card" style="padding: 6px 8px;">
        <strong style="font-size: 8pt; color: #087F5B; display: block;">5. Cascade Re-Review Engine</strong>
        <span style="font-size: 7.5pt; color: #4B5563;">Expired claims auto-flag dependent past approved campaign drafts.</span>
      </div>
      <div class="card" style="padding: 6px 8px;">
        <strong style="font-size: 8pt; color: #087F5B; display: block;">6. Finding Disputes &amp; Overrides</strong>
        <span style="font-size: 7.5pt; color: #4B5563;">Bidirectional creator challenge &amp; legal reviewer signed override.</span>
      </div>
      <div class="card" style="padding: 6px 8px;">
        <strong style="font-size: 8pt; color: #087F5B; display: block;">7. Statutory Channel Checks</strong>
        <span style="font-size: 7.5pt; color: #4B5563;">Auto-enforces FTC #ad tags on social and FDA DSHEA disclaimers.</span>
      </div>
      <div class="card" style="padding: 6px 8px;">
        <strong style="font-size: 8pt; color: #087F5B; display: block;">8. Multi-Tenant PostgreSQL RLS</strong>
        <span style="font-size: 7.5pt; color: #4B5563;">Row-Level Security asserts zero cross-brand evidence bleeding.</span>
      </div>
      <div class="card" style="padding: 6px 8px;">
        <strong style="font-size: 8pt; color: #087F5B; display: block;">9. SHA-256 Audit Trail Ledger</strong>
        <span style="font-size: 7.5pt; color: #4B5563;">Tamper-evident event log meeting FDA 21 CFR Part 11 standards.</span>
      </div>
    </div>

    <!-- Benchmark Cases Table -->
    <h3 class="section-heading" style="margin-bottom: 4px;">The 4 Landmark Regulatory Cases Evaluated</h3>
    <table class="pdr-table">
      <thead>
        <tr>
          <th style="width: 22%;">Landmark Case</th>
          <th style="width: 24%;">The Real-World Disaster</th>
          <th style="width: 28%;">Root Cause Failure</th>
          <th style="width: 26%;">Inkloom Automated Remedy</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>01. FTC v. Teami (2020)</strong><br><span class="badge badge-red">$15.2M Order</span></td>
          <td>Deceptive health &amp; cancer claims; influencers omitted statutory disclosures.</td>
          <td>Influencer copy published without clinical substantiation or mandatory #ad tag.</td>
          <td>Deterministic regex flags unverified health superlatives; enforces clinical DOI upload.</td>
        </tr>
        <tr>
          <td><strong>02. Adidas Boston (2017)</strong><br><span class="badge badge-amber">Global PR Crisis</span></td>
          <td>Automated email: <em>"Congrats, you survived the Boston Marathon!"</em> 4 yrs post-bombing.</td>
          <td>Grammar checker saw valid syntax; zero semantic context or trauma awareness.</td>
          <td>Contextual semantic sensitivity filter evaluates emotional valence and event proximity.</td>
        </tr>
        <tr>
          <td><strong>03. CNET AI (2023)</strong><br><span class="badge badge-amber">Institutional Discredit</span></td>
          <td>77 AI articles contained compound interest and mathematical calculation errors.</td>
          <td>Ungrounded LLM generated quantitative statements without source verification.</td>
          <td>Zero-hallucination policy cross-references percentages against registered financial formulas.</td>
        </tr>
        <tr>
          <td><strong>04. Gap Rebrand (2010)</strong><br><span class="badge badge-red">$100M+ Asset Loss</span></td>
          <td>Redesigned iconic logo scrapped in 6 days due to immense customer backlash.</td>
          <td>Creative execution in silo disconnected from executive two-key approval.</td>
          <td>Two-key cryptographic approval protocol gates brand logo updates behind director signatures.</td>
        </tr>
      </tbody>
    </table>

    <!-- Quantitative Telemetry & Confusion Matrix Visual -->
    <h3 class="section-heading" style="margin-top: 4px; margin-bottom: 4px;">Empirical Evaluation Telemetry &amp; Confusion Matrix</h3>
    <div class="grid-2col" style="gap: 10px; align-items: start;">
      <div>
        <table class="pdr-table" style="margin-top: 0;">
          <thead>
            <tr>
              <th>Evaluation Metric</th>
              <th>Project-Reported Telemetry</th>
              <th>System Standard</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Precision</strong></td>
              <td><span class="badge badge-green">97.9%</span></td>
              <td>2.1% False Alarm Rate on Creative Copy</td>
            </tr>
            <tr>
              <td><strong>Recall (Statutory Violations)</strong></td>
              <td><span class="badge badge-green">100.0%</span></td>
              <td>Zero Critical Regulatory Leakage</td>
            </tr>
            <tr>
              <td><strong>Missed Issues Rate</strong></td>
              <td><span class="badge badge-green">0.0%</span></td>
              <td>FN = 0 on Tested Ground Truth Cases</td>
            </tr>
            <tr>
              <td><strong>P95 Pipeline Latency</strong></td>
              <td><span class="badge badge-gray">420ms</span></td>
              <td>Sub-5ms Regex + 380ms Gemini Flash</td>
            </tr>
          </tbody>
        </table>
        <p style="font-size: 7.5pt; color: #6B7280; font-style: italic; margin-top: 2px;">
          *Reporting Disclosure: Metrics reflect empirical performance on the project's curated benchmark dataset (47 TP, 30 TN, 1 FP, 0 FN). They prove high architectural recall but do not constitute legal certification or guarantee universal regulatory immunity.
        </p>
      </div>

      <div>
        <div class="figure-box" style="height: 48mm; display: flex; align-items: center; justify-content: center; background: #0A0A0A;">
          <img src="${imgEvaluations}" style="width: 100%; height: 100%; object-fit: contain;" alt="Benchmark Dashboard" />
        </div>
        <div class="figure-caption">Figure 4.1: Empirical Benchmark Dashboard (/evaluations) — Precision, Recall, and Confusion Matrix.</div>
      </div>
    </div>
  </div>

  <div class="footer-bar">
    <span>Inkloom AI · CodeTitans India 2026 Submission</span>
    <span>https://inkloom-ai-tau.vercel.app</span>
    <span class="page-num">Page 4 of 5</span>
  </div>
</div>

<!-- ========================================================================= -->
<!-- PAGE 5: TEAM, IMPLEMENTATION STATUS & ROADMAP                             -->
<!-- ========================================================================= -->
<div class="page" id="page-5">
  <div>
    <div class="header-bar">
      <span><span class="logo-tag">INKLOOM AI</span> · TEAM, STATUS &amp; FUTURE ROADMAP</span>
      <span>CODETITANS INDIA 2026</span>
    </div>

    <h2 class="page-heading">Project Execution, Team &amp; Future Scope</h2>
    <div class="page-subheading">Engineering Distribution, Production Deliverables, Explicit Limitations, and Strategic Roadmap</div>

    <!-- Team Bifurcation Grid (4 Members) -->
    <h3 class="section-heading" style="margin-bottom: 4px;">Team AGRAWALDAKSH008 — Engineering Responsibilities</h3>
    <div class="grid-4col" style="gap: 6px; margin-bottom: 8px;">
      <div class="card-gray" style="padding: 6px 8px;">
        <div style="width: 24px; height: 24px; border-radius: 50%; background: #087F5B; color: #FFF; font-weight: bold; font-size: 8pt; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">DA</div>
        <strong style="font-size: 8.5pt; display: block; color: #111111;">Daksh Agrawal</strong>
        <span style="font-size: 7.5pt; font-weight: 600; color: #087F5B; display: block;">Admin &amp; Architecture Lead</span>
        <span style="font-size: 7pt; color: #555555; display: block; margin-top: 2px;">Deterministic regex engine, PostgreSQL RLS isolation, Next.js 16 core &amp; Vercel deployment.</span>
      </div>

      <div class="card-gray" style="padding: 6px 8px;">
        <div style="width: 24px; height: 24px; border-radius: 50%; background: #087F5B; color: #FFF; font-weight: bold; font-size: 8pt; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">LK</div>
        <strong style="font-size: 8.5pt; display: block; color: #111111;">Laksh Khatri</strong>
        <span style="font-size: 7.5pt; font-weight: 600; color: #087F5B; display: block;">Lead Regulatory Reviewer</span>
        <span style="font-size: 7pt; color: #555555; display: block; margin-top: 2px;">Statutory rules (FTC Act § 5, FDA DSHEA, MoCRA), channel disclaimers &amp; reviewer override gate.</span>
      </div>

      <div class="card-gray" style="padding: 6px 8px;">
        <div style="width: 24px; height: 24px; border-radius: 50%; background: #087F5B; color: #FFF; font-weight: bold; font-size: 8pt; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">RS</div>
        <strong style="font-size: 8.5pt; display: block; color: #111111;">Riddhi Shah</strong>
        <span style="font-size: 7.5pt; font-weight: 600; color: #087F5B; display: block;">Senior Content Producer</span>
        <span style="font-size: 7pt; color: #555555; display: block; margin-top: 2px;">Creator studio intake UX, word-level surgical diffing, finding disputes &amp; interaction design.</span>
      </div>

      <div class="card-gray" style="padding: 6px 8px;">
        <div style="width: 24px; height: 24px; border-radius: 50%; background: #087F5B; color: #FFF; font-weight: bold; font-size: 8pt; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">MR</div>
        <strong style="font-size: 8.5pt; display: block; color: #111111;">Mansoor Rupawala</strong>
        <span style="font-size: 7.5pt; font-weight: 600; color: #087F5B; display: block;">VP of Brand Governance</span>
        <span style="font-size: 7pt; color: #555555; display: block; margin-top: 2px;">Evidence provenance drawer, clinical trial ingestion &amp; cascade re-review dependency graph.</span>
      </div>
    </div>

    <!-- 2-Column: Completed Capabilities vs Current Limitations -->
    <div class="grid-2col" style="gap: 10px; margin-bottom: 8px;">
      <!-- Completed Implementation -->
      <div class="card" style="padding: 8px;">
        <h3 class="section-heading" style="margin-top: 0; font-size: 9.5pt;">Completed Implementation</h3>
        <div style="font-size: 7.5pt; color: #2B2F38; display: grid; grid-template-columns: 1fr 1fr; gap: 2px 6px;">
          <div>✔ 29 functional routes</div>
          <div>✔ Multi-brand tenant RLS</div>
          <div>✔ Claims registry with DOIs</div>
          <div>✔ 8-stage governance compiler</div>
          <div>✔ Zero-hallucination guard</div>
          <div>✔ Sub-5ms regex preflight</div>
          <div>✔ Word-level surgical diff</div>
          <div>✔ Evidence provenance drawer</div>
          <div>✔ Creator dispute workflow</div>
          <div>✔ Reviewer override gate</div>
          <div>✔ Cascade re-review engine</div>
          <div>✔ Benchmark suite (4 cases)</div>
          <div>✔ Expiring claims alerts (<30d)</div>
          <div>✔ SHA-256 audit ledger</div>
          <div>✔ Role-Based Access Control</div>
          <div>✔ 58/58 passing test suite</div>
        </div>
      </div>

      <!-- Explicit Known Limitations -->
      <div class="card-gray" style="padding: 8px;">
        <h3 class="section-heading" style="margin-top: 0; font-size: 9.5pt; border-left-color: #D97706;">Current Limitations (Explicit Disclosure)</h3>
        <div style="font-size: 7.5pt; color: #4B5563;">
          <div style="margin-bottom: 2px;">• <strong>Enterprise SAML 2.0 / Okta SSO:</strong> Operates in prototype sandbox demo mode; 1-click pre-authenticated demo accounts are provided on <code>/auth/login</code>.</div>
          <div style="margin-bottom: 2px;">• <strong>Production Stripe Billing:</strong> Operates in prototype sandbox mode linking to transparent roadmap specifications.</div>
          <div style="margin-bottom: 2px;">• <strong>Arbitrary Scanned PDF OCR:</strong> Input accepts text, markdown, and JSON copy; raw scanned paper OCR is deferred in favor of verified clinical text passages.</div>
          <div>• <strong>Direct Auto-Publishing:</strong> Intentionally not implemented. Human reviewers retain final dissemination authority by ethical design.</div>
        </div>
      </div>
    </div>

    <!-- Strategic Future Roadmap -->
    <h3 class="section-heading" style="margin-bottom: 4px;">Strategic Roadmap (Post-Round 2)</h3>
    <div class="grid-4col" style="gap: 6px; margin-bottom: 10px;">
      <div class="card-gray" style="padding: 6px;">
        <strong style="font-size: 8pt; color: #087F5B;">Phase 3.1: Enterprise SSO</strong>
        <p style="font-size: 7pt; color: #555555; margin: 2px 0 0 0;">Production Okta, Google Workspace, and Azure AD SAML 2.0 gateway.</p>
      </div>
      <div class="card-gray" style="padding: 6px;">
        <strong style="font-size: 8pt; color: #087F5B;">Phase 3.2: Native PDF OCR</strong>
        <p style="font-size: 7pt; color: #555555; margin: 2px 0 0 0;">Automated table and text extraction from raw clinical trial PDF uploads.</p>
      </div>
      <div class="card-gray" style="padding: 6px;">
        <strong style="font-size: 8pt; color: #087F5B;">Phase 3.3: Multimodal Vision</strong>
        <p style="font-size: 7pt; color: #555555; margin: 2px 0 0 0;">Video frame speech-to-text and logo clearspace compliance inspection.</p>
      </div>
      <div class="card-gray" style="padding: 6px;">
        <strong style="font-size: 8pt; color: #087F5B;">Phase 3.4: In-CMS Extension</strong>
        <p style="font-size: 7pt; color: #555555; margin: 2px 0 0 0;">Browser copilot for live verification inside Figma, Webflow, and Contentful.</p>
      </div>
    </div>

    <!-- Closing Motto & Official Access Box -->
    <div class="card-highlight" style="text-align: center; padding: 10px 14px;">
      <div style="font-size: 13pt; font-weight: 800; color: #0A0A0A; letter-spacing: -0.3px; margin-bottom: 2px;">
        "Check the Claim. Show the Source. Keep People in Control."
      </div>
      <div style="font-size: 8.5pt; color: #4B5563; margin-bottom: 6px;">
        The Pre-Publication Governance Firewall for Brand Truth &amp; Marketing Claims
      </div>
      <div style="display: flex; justify-content: center; gap: 20px; font-size: 8.5pt;">
        <span>🌐 <strong>Live Application:</strong> <a href="https://inkloom-ai-tau.vercel.app" style="color: #087F5B; font-weight: bold; text-decoration: none;">https://inkloom-ai-tau.vercel.app</a></span>
        <span>💻 <strong>GitHub Repository:</strong> <a href="https://github.com/IntellectDaksh/Inkloom-AI-CodeTitans-2026" style="color: #087F5B; font-weight: bold; text-decoration: none;">IntellectDaksh/Inkloom-AI-CodeTitans-2026</a></span>
      </div>
    </div>
  </div>

  <div class="footer-bar">
    <span>Inkloom AI · CodeTitans India 2026 Submission</span>
    <span>https://inkloom-ai-tau.vercel.app</span>
    <span class="page-num">Page 5 of 5</span>
  </div>
</div>

</body>
</html>
`;

const htmlPath = path.join(rootDir, 'PDR_RENDER.html');
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('PDR_RENDER.html generated successfully.');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlUri = `file:///${htmlPath.replace(/\\/g, '/')}`;
const pdfPath = path.join(rootDir, 'INKLOOM_AI_CODETITANS_2026_PDR.pdf');

const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${htmlUri}"`;
try {
  execSync(cmd);
  console.log('PDF compiled successfully: ' + pdfPath);
} catch (e) {
  console.error('Edge print error:', e.message);
}
