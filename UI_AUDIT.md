# INKLOOM AI — COMPREHENSIVE UI/UX AUDIT & DEFECT INVENTORY
**Target Repository:** `E:\Hackathon Projects\Inkloom - 2026`  
**Evaluation Standard:** Clean Swiss Minimalism × High-End Editorial Typography × Disciplined Enterprise SaaS  
**Author:** Agent 1 — UI/UX Auditor  
**Date:** November 2026  
**Status:** Audit Complete · Action Plan Handed Off to Agents 2, 3, and 4  

---

## 1. Executive Summary & Design Diagnosis

Inkloom AI is positioned as an enterprise-grade pre-publication governance platform for brand truth, statutory marketing compliance (FTC Act § 5, FDA DSHEA 21 CFR § 101.93, MoCRA 2022), and clinical claim verification.

However, an exhaustive visual and architectural audit of the current frontend codebase reveals a severe stylistic disconnect. Instead of presenting as a restrained, authoritative, editorial SaaS platform (comparable to Linear, Vercel, Stripe, or The New York Times R&D), the interface currently suffers from **"AI-generated cybersecurity developer terminal" syndrome**.

### Core Visual Failures Identified:
1. **Pervasive Monospace Misuse & Micro-Typography:** Ordinary marketing copy, section headers, card narratives, and button text are trapped in tiny `10px–11px` monospace (`font-mono text-[10px]`, `text-[11px]`, `text-xs`). Marketing executives and legal reviewers are forced to squint at content drafts styled like raw Unix shell terminal output.
2. **Dense "Boxes-Inside-Boxes" (Russian Doll Syndrome):** Almost every component is nested inside multiple layers of thick borders, dark milled wells, and inset-shadowed cards. This creates severe visual fatigue and eliminates whitespace.
3. **Gratuitous Terminal & Hardware Skeuomorphism:** Artificial CLI markers (`>_`, `<Terminal />`), hardware LEDs with artificial glass reflections, pulsing colored diodes, and simulated milled metal wells distract from the platform's core functional value.
4. **Color Pollution:** Electric cyan (`#00F2FE`), neon blue (`#06B6D4`), loud amber, and glowing red borders compete simultaneously for visual hierarchy, violating monochromatic restraint.
5. **Inappropriate Hackathon / Personal Artifacts:** A prominent "Team & Acknowledgments" section detailing personal student emails and names sits in the center of what should be an enterprise B2B product landing page.

---

## 2. Inventory of the 5 Target User Screens

The audit directly evaluated the five specific problem areas highlighted by stakeholders:

| # | Screen / Area | Primary Files | Severity | High-Level Defect Description |
|---|---|---|---|---|
| **1** | **Live Content Audit Workbench** | `src/app/page.tsx` (lines 527–887) | **CRITICAL** | Cramped 7:5 split layout; textarea forces draft marketing copy into `text-xs font-mono`; 4-layer nested border boxes; loud red/green fills; labelled as `• INTERACTIVE HARDWARE TERMINAL`. |
| **2** | **4 Landmark Cases** | `src/app/page.tsx` (lines 1033–1122) | **HIGH** | Heavy black boxes with neon red/amber borders; tiny 10px–11px console text; repetitive uppercase tags (`CASE 01`, `STATUTE:`, `INKLOOM REMEDY:`); remedy copy placed in nested green terminal wells. |
| **3** | **Team Section** | `src/app/page.tsx` (lines 1334–1396) | **MANDATE: MUST BE DELETED** | "Built for Truth by Compliance Engineers" with 4 personal cards (Daksh, Reviewer, Creator, Analyst) and student emails (`@uideas.digital`). Destroys enterprise authority. **Must be excised completely.** |
| **4** | **Hero Section** | `src/app/page.tsx` (lines 408–525) | **HIGH** | Headline cramped into 7-col split alongside a simulated `PRE-PUBLICATION COPILOT` terminal box; tiny 10px metrics; micro-tag in monospace; weak button sizing (38px height). |
| **5** | **Benchmark Dashboard** | `src/app/evaluations/page.tsx` (lines 1–457) | **CRITICAL** | Dense matrix of terminal cards; glowing electric cyan dots/accents (`#00F2FE`); blue navy borders (`#1E2E50`); copy snippet in tiny monospace; illegible 10px confusion matrix cells. |

---

## 3. Defect Category 1: Typography Problems

### 3.1 Prevalence of Micro-Typography (10px–11px Monospace for Normal Text)
The codebase exhibits an obsessive reliance on `text-[10px]`, `text-[11px]`, and `text-xs font-mono` for human-readable content. Below is an exact citation inventory:

#### In `src/app/page.tsx`:
- **Line 355:** `<span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white/5 text-[#A0A0A0] border border-white/10">GOVERNANCE OS</span>` — Navbar badge in tiny 10px monospace.
- **Line 362:** `<div className="hidden lg:flex items-center gap-8 text-xs font-mono text-[#A0A0A0]">` — Primary navigation items are rendered in 12px monospace instead of clean, readable sans-serif.
- **Line 386:** `<div className="... text-[11px] font-mono text-[#A0A0A0]">` — Header engine status diode and text set in 11px monospace.
- **Line 424:** `<div className="... text-xs font-mono text-[#A0A0A0]">` — Hero badge tag in 12px monospace.
- **Line 469:** `<div className="... text-xs font-mono text-[#A0A0A0]">` — Hero trust metrics bar set in 12px monospace.
- **Line 496:** `<span className="text-[10px] font-mono ...">RLS PROTECTED</span>` — Teaser card badge.
- **Line 503:** `<div className="text-[10px] text-[#A0A0A0] uppercase">Input Raw Copy:</div>` — 10px micro-label.
- **Line 510:** `<div className="text-[10px] text-emerald-400 uppercase">Surgical Revision (Grounded):</div>` — 10px micro-label.
- **Line 535:** `<span className="text-xs font-mono uppercase tracking-widest text-[#A0A0A0]">INTERACTIVE HARDWARE TERMINAL</span>` — Monospace section tracker.
- **Line 556:** `<button className="... text-xs font-mono ...">` — Interactive workbench preset pills use 12px monospace.
- **Line 570:** `<div className="... font-mono text-xs">` — Entire telemetry bar forced into monospace.
- **Lines 572, 586, 593, 600:** `<div className="text-[10px] text-[#A0A0A0] uppercase">...</div>` — 10px labels for all 4 telemetry gauges.
- **Line 623:** `<button className="text-[11px] font-mono ...">Reset Copy</button>` — Action button in 11px monospace.
- **Line 638:** `<textarea className="... text-xs font-mono leading-relaxed text-white resize-none" ... />` — **Critical UX Flaw**: Marketing copy editor forces draft prose into 12px monospace.
- **Line 643:** `<div className="... text-xs font-mono text-[#A0A0A0]">` — Character counter in 12px monospace.
- **Line 675:** `<span className="text-xs font-mono font-semibold ... uppercase">Word-Level Surgical Red-Line Diff</span>`
- **Line 690:** `<div className="space-y-3 font-mono text-xs">` — Word-level diff container in 12px monospace.
- **Line 693:** `<div className="text-[10px] text-rose-400 uppercase ...">` — 10px deletion header.
- **Line 702:** `<div className="text-[10px] text-emerald-400 uppercase ...">` — 10px addition header.
- **Line 741:** `<span className="text-xs font-mono font-semibold ...">Flagged Violations</span>`
- **Line 745:** `<span className="text-[10px] font-mono text-[#A0A0A0]">ACTIVE REGULATORY FLAGS</span>`
- **Line 766:** `<span className="text-[9px] font-mono font-bold ...">` — **9px font size** for severity tags!
- **Line 775:** `<p className="text-[11px] leading-relaxed text-[#A0A0A0]">{issue.description}</p>` — **11px font size** for substantive legal violation descriptions!
- **Line 776:** `<div className="text-[10px] font-mono ...">STATUTORY RULE: {issue.regulation}</div>` — 10px monospace citation.
- **Line 818:** `<div className="... font-mono text-xs space-y-2">` — Provenance inspector card in 12px monospace.
- **Lines 842, 849, 861, 866:** `text-[10px]`, `text-[11px]` monospace throughout the provenance inspector.
- **Line 909:** `<table className="w-full text-left text-xs font-mono">` — Competitive table container in 12px monospace.
- **Line 910:** `<thead className="... text-[11px] uppercase ...">` — 11px table header.
- **Line 1037:** `<span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">PREVENTABLE BRAND CATASTROPHES</span>`
- **Line 1098:** `<span className="text-[10px] font-mono font-bold text-rose-400">{c.caseNum}</span>` — `CASE 01`, etc. in 10px monospace.
- **Line 1099:** `<span className="text-[10px] font-mono px-2 py-0.5 rounded ...">{c.cost}</span>` — 10px fine badge.
- **Line 1105:** `<div className="text-xs font-mono text-[#A0A0A0]">{c.category}</div>`
- **Line 1109:** `<div className="pt-4 border-t border-white/10 space-y-2 font-mono text-[11px]">` — Landmark remedy in 11px monospace.
- **Line 1199:** `<span className="text-xs font-mono font-bold text-white">STAGE {s.stage}</span>`
- **Line 1263:** `<span className="text-[10px] font-mono ...">` — Sector badges in 10px monospace.
- **Line 1268:** `<div className="text-[11px] font-mono text-emerald-400">{p.regs}</div>` — Sector statutes in 11px monospace.
- **Line 1338:** `<span className="text-xs font-mono uppercase tracking-widest ...">TEAM AGRAWALDAKSH008 ...</span>`
- **Line 1344:** `<div className="text-xs font-mono font-bold text-emerald-400 ...">` — Team tagline in 12px monospace.
- **Line 1388:** `<div className="text-xs font-mono text-emerald-400">{m.role}</div>`
- **Line 1391:** `<div className="text-[10px] font-mono text-[#737373]">{m.email}</div>`
- **Line 1399:** `<footer className="py-16 bg-[#080808] text-xs font-mono border-t border-white/10">` — Entire footer container set in 12px monospace!
- **Lines 1404, 1436, 1470, 1509:** `<div className="text-white font-bold uppercase tracking-wider text-[11px]">` — 11px footer category headings.
- **Line 1542:** `<div className="... text-[#737373] text-[11px]">` — 11px copyright text.

#### In `src/app/evaluations/page.tsx`:
- **Line 144:** `<div className="... text-xs font-mono text-slate-400 ...">` — Breadcrumbs in 12px monospace.
- **Line 186:** `<div className="flex items-center justify-between text-xs font-mono text-slate-400">PRECISION</div>`
- **Lines 191, 200, 209, 218:** Sub-metrics in `text-[11px] font-mono`.
- **Line 230:** `<div className="text-[10px] text-slate-500 font-mono truncate">{lastRunTimestamp}</div>`
- **Line 239:** `<span className="text-xs font-mono uppercase tracking-wider text-slate-400">Landmark Test Suite (4 Cases)</span>`
- **Line 242:** `<span className="text-[11px] font-mono text-[#00F2FE]">100% PASS RATE</span>`
- **Line 267:** `<span className="text-[11px] font-mono text-slate-400">({tCase.year})</span>`
- **Line 283:** `<span className="text-[10px] font-mono text-slate-500 uppercase">{tCase.category}</span>`
- **Line 317:** `<span className="text-xs font-mono text-[#00F2FE] uppercase tracking-wider">BENCHMARK DOSSIER</span>`
- **Line 348:** `<div className="recessed-well rounded-lg p-4 font-mono text-xs text-slate-200 ...">` — Audited copy snippet forced into 12px monospace code font.
- **Lines 356, 370, 375, 380:** Verdicts and confidence scores in `text-[11px] font-mono`.
- **Line 408–422:** Confusion matrix metric labels in `text-[10px] text-slate-500`.

#### In `src/app/globals.css`:
- **Lines 486–494:**
  ```css
  .swiss-label {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #A0A0A0;
    user-select: none;
  }
  ```
  *(Defect: Defines a 10px monospace uppercase tracking utility that propagates micro-text everywhere).*

---

### 3.2 Absence of Proper 15px–17px Body Copy
- Paragraph descriptions in case studies (`line 1106`), workbench explanations (`line 542`), violation notes (`line 775`), and architecture breakdowns (`line 1205`) are shrunk to `text-xs` (12px) or `text-[11px]` (11px).
- **Target Standard:** Explanatory text must be set in readable sans-serif `text-[15px]` or `text-base` (16px) with relaxed leading (`leading-relaxed` or `leading-7`) and high-contrast neutral color (`#B5B5B5` or `#D4D4D4`).

### 3.3 Lack of 52px–64px Hero Scale
- The primary hero headline (`src/app/page.tsx`, line 430) is currently `text-4xl sm:text-6xl`. On tablets and small desktops, it defaults to `text-4xl` (36px). Furthermore, because it is constrained to a 7-column grid alongside a 5-column teaser card, the text wraps aggressively into 4 narrow lines.
- **Target Standard:** A dominant, commanding hero headline: `text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] max-w-4xl`.

### 3.4 Lack of 32px–40px Section Headers
- Section titles across the page vary inconsistently between `text-2xl` (24px) and `text-3xl` (30px):
  - Workbench header (`line 539`): `text-2xl sm:text-3xl font-bold` (undersized).
  - Landmark Cases header (`line 1040`): `text-3xl sm:text-4xl font-bold`.
  - Architecture header (`line 1131`): `text-3xl sm:text-4xl font-bold`.
- **Target Standard:** Standardize all main section headers to `text-3xl sm:text-4xl lg:text-[40px] font-semibold tracking-tight text-white leading-tight`.

---

## 4. Defect Category 2: Visual Noise Inventory

### 4.1 Decorative Terminal Symbols & False CLI Metaphors
- **`<Terminal />` Icon & `PRE-PUBLICATION COPILOT` Title (`page.tsx`, lines 491–494):** Simulates a Linux terminal prompt in the hero section.
- **`• INTERACTIVE HARDWARE TERMINAL` Label (`page.tsx`, line 536):** Completely inaccurate branding for an enterprise legal/marketing SaaS tool.
- **Terminal Preset Buttons (`page.tsx`, line 556):** Preset selection buttons look like CLI command flags.
- **Input / Output Diff Blocks (`page.tsx`, lines 503–515, 692–707):** Renders marketing text inside simulated shell output boxes with line-throughs and terminal fills.

### 4.2 Excessive Borders & "Boxes-Inside-Boxes"
The user interface nests bordered containers inside bordered containers with little spatial purpose:
```
┌─────────────────────────────────────────────────────────────────┐
│ Section Container (border-b border-white/10)                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Workbench Card (bg-[#141414] border border-white/10)      │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ Text Well (bg-[#080808] border border-white/10)     │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │ Textarea (bg-[#080808] border border-white/10)│  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```
- In the Workbench: Card container -> Well container -> Textarea container -> Action bar.
- In the Diff Box: Card container -> Red-line deletion box -> Green-line addition box.
- In the Provenance Drawer: Card container -> Specs box -> Excerpt well box.
- In Evaluations: Outer layout -> Metric card -> Inner well -> Status badge.

### 4.3 Coloured Dots, LEDs, and Hardware Diodes
- **`globals.css` (lines 406–481):** Defines `.hardware-led`, `.status-diode`, `.status-diode-emerald`, `.status-diode-cyan`, `.status-diode-amber`, `.status-diode-rose`, and `.status-diode::after` (which renders an artificial specular glass reflection!).
- **Pulsing Green LED in Navbar (`page.tsx`, line 387):** `<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />` creates constant distracting motion.
- **Hardware LEDs in Evaluations (`evaluations/page.tsx`, lines 188, 197, 206, 215, 224, 433):** Glowing colored dots placed beside metric labels.
- **Glow Shadow:** `shadow-[0_0_15px_rgba(0,242,254,0.15)]` produces an arcade neon glow.

### 4.4 Repetitive Uppercase Tracking Labels
- Repeated headers: `STATUTE:`, `INKLOOM REMEDY:`, `CLAIM CODE:`, `EVIDENCE DOC:`, `DOI REFERENCE:`, `ASSAY STANDARD:`, `AUTHORIZED BY:`, `PERMITTED CHANNELS:`, `SHA-256:`.
- Repeated case numbers: `CASE 01`, `CASE 02`, `CASE 03`, `CASE 04`.
- Excessive uppercase badges: `RLS PROTECTED`, `PASSED`, `FLAGGED`, `CRITICAL`, `ACTIVE REGULATORY FLAGS`, `ZERO FINDINGS`.

### 4.5 Color Pollution
- **Electric Cyan (`#00F2FE` / `#06B6D4`):** Heavily splattered across `evaluations/page.tsx`, `dashboard/page.tsx`, and `Badge.tsx`. Clashes directly with the monochromatic dark theme.
- **Deep Navy Borders (`#1E2E50`, `#2A406E`, `#121F3A`):** Found in `evaluations/page.tsx`, creating an unwanted blue tint inconsistent with the neutral gray `#303030` of the design system.
- **Loud Amber/Gold (`#E5A93C`):** Used inconsistently across icons, badges, and button variants.

---

## 5. Defect Category 3: Spacing & Margin Deficiencies

### 5.1 Cramped Card Padding
- Numerous panels use `p-3`, `p-3.5`, or `p-4` for dense technical data:
  - Provenance spec box: `p-3.5` (`page.tsx`, line 818).
  - Findings violation cards: `p-3.5` (`page.tsx`, line 755).
  - Confusion matrix cells: `p-2.5` (`evaluations/page.tsx`, lines 407–422).
  - Teaser card input/revision wells: `p-3` (`page.tsx`, lines 502, 509).
- Text lines press tightly against borders, producing a crowded, low-budget look.

### 5.2 Crowded Multi-Column Grid Splits
- **Hero 7:5 Grid:** Left 7 columns crowd the headline, subheadline, buttons, and trust badges into a narrow column while the right 5 columns host a non-interactive teaser box.
- **Workbench 7:5 Grid:** Compresses the findings cards and evidence drawer into ~460px width on typical 13–14" laptop screens (1280px–1440px), causing severe text wrapping and squished badges.
- **Evaluations Top Row:** 5 columns forced onto one row (`grid grid-cols-2 md:grid-cols-5 gap-4`), truncating timestamps and crowding numbers.

### 5.3 Lack of 8px Grid Breathing Room
- Vertical spacing between major sections relies on a flat `py-24` (96px) with harsh `border-b border-white/10` dividers, but interior elements lack proportional breathing room (e.g. `gap-2`, `gap-3`, `space-y-2` are overused where `gap-6` or `gap-8` is required).

---

## 6. Defect Category 4: Redundant & Inappropriate Elements

### 6.1 MANDATE: Complete Removal of the Team Section
- **Location:** `src/app/page.tsx`, Section 9 (lines 1334–1396).
- **Code to Be Excised:**
  ```tsx
  {/* 9. TEAM & ACKNOWLEDGMENTS SECTION */}
  <section className="py-24 border-b border-white/10 bg-[#080808]">
    <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-white font-semibold">
          TEAM AGRAWALDAKSH008 · CODETITANS INDIA 2026
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Built for Truth by Compliance Engineers
        </h2>
        <div className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
          "CHECK THE CLAIM. SHOW THE SOURCE. KEEP PEOPLE IN CONTROL."
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: "Daksh Agrawal", ... },
          { name: "Demo Reviewer", ... },
          { name: "Demo Creator", ... },
          { name: "Demo Analyst", ... }
        ].map(...)}
      </div>
    </div>
  </section>
  ```
- **Rationale:**
  - This section contains hackathon team credentials, student emails (`@uideas.digital`), and team identifiers (`TEAM AGRAWALDAKSH008`).
  - Presenting personal team cards on the public homepage destroys enterprise SaaS credibility and contradicts the clean, art-directed Swiss minimalist aesthetic.
- **Associated Cleanups:**
  - In `src/app/evaluations/page.tsx` (lines 434–436): Delete `CORE PHILOSOPHY · TEAM AGRAWALDAKSH008` subtitle and replace with clean platform philosophy.
  - In `src/app/page.tsx` footer (line 1544): Replace `&copy; 2026 Inkloom Technologies Inc. · CodeTitans India 2026 Submission` with `&copy; 2026 Inkloom AI Technologies Inc. All rights reserved.`
  - Ensure zero dead `#team` anchors or links remain in header navigation or footers.

### 6.2 Redundant Simulated Terminal in Hero
- The right-side `PRE-PUBLICATION COPILOT` box (`page.tsx`, lines 487–522) is a static mockup duplicating what the Live Audit Workbench already does interactively 200 pixels lower on the page. Removing or replacing it with an open, high-impact editorial layout will give the Hero headline the prominence it deserves.

### 6.3 Background Grain Overlay
- `globals.css` (lines 93–105) contains an SVG fractal noise overlay (`body::before`) at `0.035` opacity. This creates visual grit and pixel fuzziness on OLED and Retina screens, degrading crisp typography.

---

## 7. Deep-Dive Screen Audits & Remediation Blueprints

### 7.1 Screen 1: Live Content Audit Workbench (`src/app/page.tsx`)
```
[ BEFORE: Cramped Terminal Aesthetic ]
• INTERACTIVE HARDWARE TERMINAL
[Preset 1] [Preset 2] [Preset 3] (Tiny 11px monospace pills)
4 Cramped Diagnostic Telemetry Boxes (10px uppercase)
┌──────────────────────────────────────┐ ┌──────────────────────────────────────┐
│ [Card 1: Editable Copy]              │ │ [Card 3: Flagged Violations]         │
│ ┌──────────────────────────────────┐ │ │ ┌──────────────────────────────────┐ │
│ │ Textarea (12px Monospace Font)   │ │ │ │ Violation Card (9px-11px text)   │ │
│ └──────────────────────────────────┘ │ │ └──────────────────────────────────┘ │
│ [Card 2: Redline Diff]               │ │ [Card 4: Provenance Drawer]          │
│ ┌──────────────────────────────────┐ │ │ ┌──────────────────────────────────┐ │
│ │ Red strike-through box           │ │ │ │ Spec Box (10px monospace)        │ │
│ │ Green addition box               │ │ │ └──────────────────────────────────┘ │
│ └──────────────────────────────────┘ │ └──────────────────────────────────────┘
└──────────────────────────────────────┘
```

#### Remediation Plan for Agent 3:
1. **Remove Terminal Labels:** Change section header to:
   - Category Label: `text-xs font-semibold uppercase tracking-wider text-[#858585]` — `INTERACTIVE VERIFICATION ENGINE`.
   - Title: `text-3xl sm:text-4xl font-semibold tracking-tight text-white` — `Live Content Audit Workbench`.
   - Description: `text-[15px] sm:text-base text-[#B5B5B5] max-w-2xl leading-relaxed`.
2. **Modernize Preset Selector:** Convert preset buttons from monospace pills to a sleek segmented control tab bar (`bg-[#141414] border border-[#303030] p-1 rounded-lg`).
3. **Elevate Telemetry Bar:** Display key metrics in clean sans-serif with high-contrast numerals (`text-2xl font-semibold text-white tabular-nums`) and clean 13px muted labels (`text-xs text-[#858585]`), eliminating loud colored diode dots.
4. **Editor Typography Overhaul:** Change textarea from `font-mono text-xs` to readable sans-serif: `font-sans text-base text-white leading-relaxed p-5 bg-[#0C0C0C] border border-[#303030] rounded-xl focus:border-white`.
5. **Flatten Diff Presentation:** Eliminate the double-box container. Use an open editorial comparison with clean red strikethrough text and green substantiated text without thick nested borders.
6. **Legible Findings Cards:** Replace `text-[9px]` severity badges and `text-[11px]` descriptions with `text-xs font-medium` status tags and readable `text-sm text-[#D4D4D4] leading-relaxed` explanations.

---

### 7.2 Screen 2: 4 Landmark Cases (`src/app/page.tsx`)
```
[ BEFORE: Dark Boxes with Loud Red Borders & Console Font ]
PREVENTABLE BRAND CATASTROPHES (Red Monospace)
┌──────────────────────────────────────┐ ┌──────────────────────────────────────┐
│ CASE 01             [$15.2M Order]   │ │ CASE 02            [PR Crisis]      │
│ FTC v. Teami Lifestyle              │ │ Adidas Boston Marathon               │
│ (12px text description)              │ │ (12px text description)              │
│ ──────────────────────────────────── │ │ ──────────────────────────────────── │
│ STATUTE: FTC Act § 5                 │ │ STATUTE: Crisis Guidelines           │
│ [Green Terminal Remedy Well]         │ │ [Green Terminal Remedy Well]         │
└──────────────────────────────────────┘ └──────────────────────────────────────┘
```

#### Remediation Plan for Agent 3:
1. **Editorial Architecture:** Replace heavy boxed cards with an open 2-column editorial grid using subtle hairlines (`border border-[#242424] hover:border-[#383838] bg-[#141414] rounded-xl p-8`).
2. **Restrained Badging:** Remove bright red borders from fine badges. Use minimal hairline tags: `text-xs font-mono text-[#EF4444] bg-[#EF4444]/10 px-2.5 py-1 rounded-md`.
3. **Readable Typography:**
   - Case Title: `text-xl sm:text-2xl font-semibold text-white tracking-tight`.
   - Incident Narrative: `text-[15px] text-[#B5B5B5] leading-relaxed font-sans`.
   - Remove green console monospace from remedy text. Present Inkloom's solution in clean sans-serif prose (`text-sm text-[#E5E5E5] leading-normal`) with a subtle white checkmark icon.

---

### 7.3 Screen 3: Team Section (`src/app/page.tsx`)
```
[ BEFORE: Unwanted Hackathon Team Section ]
TEAM AGRAWALDAKSH008 · CODETITANS INDIA 2026
"Built for Truth by Compliance Engineers"
[Card 1: Daksh] [Card 2: Reviewer] [Card 3: Creator] [Card 4: Analyst]
```

#### Remediation Plan for Agent 3:
1. **Delete Section Entirely:** Delete lines 1334 to 1396 of `src/app/page.tsx`.
2. **Clean Container Gaps:** Ensure smooth vertical transition between Regulated Sectors / Security Architecture and the Footer.
3. **Audit Link Integrity:** Ensure no broken `#team` anchors or navigation references exist.

---

### 7.4 Screen 4: Hero Section (`src/app/page.tsx`)
```
[ BEFORE: Squished 7:5 Split with Fake Terminal ]
Tagline: • the Pre-Publication Governance Layer (12px mono)
Headline: Check the Claim... (36px-60px, cramped in 7 cols)
Paragraph: (Dim #A0A0A0, cramped)
Buttons: [Launch Sandbox] [Enter App] (Tiny 38px height)
Trust Metrics: 54/54 Passing • 100% Recall • 420ms (Terminal output)
[ Right 5 cols: Fake Terminal Box with >_ PRE-PUBLICATION COPILOT ]
```

#### Remediation Plan for Agent 3:
1. **Dominant Editorial Composition:** Replace the cramped 7:5 split with a generous, commanding layout. The headline should take center stage or span full width:
   - Tagline Pill: `text-xs font-medium text-[#B5B5B5] bg-[#141414] border border-[#303030] px-3.5 py-1.5 rounded-full`.
   - Headline: `text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] max-w-4xl`.
   - Body Paragraph: `text-lg sm:text-xl text-[#B5B5B5] leading-relaxed max-w-2xl`.
2. **Generous Primary & Secondary CTAs:**
   - Primary: White solid background (`#FFFFFF`), black text (`#0A0A0A`), 44px height (`h-11 px-6`), `text-sm font-semibold rounded-lg hover:bg-[#E5E5E5]`.
   - Secondary: Dark surface (`#191919`), hairline border (`border border-[#303030]`), `text-sm font-medium text-white rounded-lg hover:bg-[#242424]`.
3. **Elevated Social Proof Bar:** Present the 54/54 passing tests and 100% recall as clean, elegant typography metrics rather than terminal log lines.

---

### 7.5 Screen 5: Benchmark Dashboard (`src/app/evaluations/page.tsx`)
```
[ BEFORE: Dense Terminal Matrix with Cyan Glow & Navy Borders ]
Breadcrumbs in cyan (#00F2FE)
5 Hardware Gauge Cards with Glowing Turquoise/Emerald LEDs
Left Column: 4 Landmark Test Cards (Navy borders #1E2E50, cyan borders)
Right Column:
  Benchmark Dossier
  Audited Copy Snippet (12px monospace inside recessed well)
  2 Engine Detection Result boxes
  Confusion Matrix (4 boxes with 10px text)
Bottom: Team AgrawalDaksh008 philosophy with glowing diode
```

#### Remediation Plan for Agent 4:
1. **Purge Electric Cyan & Navy:**
   - Replace `#00F2FE`, `#06B6D4`, `#1E2E50`, `#2A406E`, `#121F3A` with standard monochromatic palette (`#0A0A0A`, `#141414`, `#191919`, `#303030`).
2. **Remove Hardware LEDs & Glow Shadows:**
   - Remove `.hardware-led`, `.led-turquoise`, `.led-emerald`, `.led-blue` and cyan box-shadows.
3. **Readable Audited Snippet:**
   - Render the audited copy in clean, elegant `text-sm sm:text-base text-white font-sans leading-relaxed p-4 bg-[#141414] border border-[#303030] rounded-lg`.
4. **Legible Confusion Matrix:**
   - Refactor into a clean, minimalist tabular layout with clear column headers (`text-xs font-medium text-[#858585]`) and readable numbers (`text-xl font-semibold text-white`).
5. **Clean Footer Banner:**
   - Remove `TEAM AGRAWALDAKSH008` reference; present platform governance principles in clean Swiss typography.

---

## 8. Target Design System Specification

### 8.1 Monochromatic Color Palette Tokens
```css
/* Core Canvas & Surface Tokens */
--bg-canvas: #0A0A0A;        /* Deep page background */
--bg-surface: #141414;       /* Primary cards, containers, panels */
--bg-surface-subtle: #191919;/* Secondary panels, tab bars, table rows */
--bg-elevated: #202020;      /* Modals, popovers, active highlights */

/* Hairline Precision Borders */
--border-subtle: #242424;    /* Fine dividers, inactive borders */
--border-default: #303030;   /* Standard card borders, inputs */
--border-focus: #FFFFFF;     /* Focused interactive inputs */

/* High-Contrast Typography Hierarchy */
--text-primary: #FFFFFF;     /* Headlines, titles, active labels */
--text-secondary: #B5B5B5;   /* Body paragraphs, descriptions, section subtitles */
--text-muted: #858585;       /* Metadata, timestamps, breadcrumbs */

/* Functional Semantic Accents (Strict Signal Value Only) */
--status-green: #10B981;     /* Compliant, verified, passed */
--status-amber: #F59E0B;     /* Pending human sign-off, caution */
--status-red: #EF4444;       /* Statutory violation, critical risk */
```

### 8.2 Strict Desktop & Mobile Typography Scale
| Element | Desktop Size | Class / Styling | Permitted Usage |
|---|---:|---|---|
| **Hero Headline** | 56–72px | `text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]` | Hero top title only |
| **Section Headings** | 32–40px | `text-3xl sm:text-4xl font-semibold tracking-tight text-white` | Main page section headers |
| **Subsection Headings** | 22–26px | `text-xl sm:text-2xl font-semibold text-white` | Landmark case titles, workbench title |
| **Card Headings** | 18–20px | `text-lg sm:text-xl font-medium text-white` | Primary card headers |
| **Primary Body Copy** | 15–17px | `text-[15px] sm:text-base leading-relaxed text-[#B5B5B5] font-sans` | Standard descriptions, copy draft inputs |
| **Secondary Text** | 13–14px | `text-sm leading-normal text-[#858585] font-sans` | Footnotes, secondary notes, table cells |
| **Technical Metadata** | 12–13px | `text-xs font-mono text-[#858585]` | **Monospace STRICTLY ONLY:** DOIs, Claim IDs, SHA-256 hashes, numerical metrics |

> [!CAUTION]
> **Monospace Ban:** Monospace (`font-mono`) is strictly prohibited for ordinary body paragraphs, marketing drafts, headings, button labels, and section descriptions. Monospace text `< 12px` is prohibited except for cryptographic hashes.

---

## 9. Prioritized Action Plan by Subagent

### 9.1 Agent 2: Design System & Typography Specialist
- [ ] **Cleanse `src/app/globals.css`:**
  - Remove paper noise grain overlay (`body::before` fractal noise filter).
  - Purge hardware LED diodes, lens reflections, and skeuomorphic button classes (`.hardware-led`, `.status-diode`, `.tactile-button-gold`, `.tactile-button-turquoise`).
  - Redefine `.btn-primary` (44px height, solid white `#FFFFFF`, black text `#0A0A0A`, font-semibold) and `.btn-secondary` (`#191919`, 1px border `#303030`, white text).
  - Redefine `.swiss-label` from 10px uppercase tracking monospace to clean `text-xs font-medium text-[#858585] uppercase tracking-wider font-sans`.
- [ ] **Standardize Primitive Components:**
  - Update `src/components/ui/Button.tsx`: standard 40px–44px heights (`h-10` / `h-11`), readable `text-sm font-semibold`, remove cyan/gold variants.
  - Update `src/components/ui/Badge.tsx`: remove micro `text-[10px]` sizes; consolidate 30 variants into 5 functional variants (`verified`, `violation`, `warning`, `neutral`, `metadata`).
  - Update `src/components/ui/Card.tsx`: clean `#141414` surface and `#303030` border; update `CardDescription` to readable `text-sm text-[#B5B5B5]`.
  - Update `src/components/ui/DiffViewer.tsx`: remove heavy nested box fills; format diffs with clean editorial strikethroughs and highlights.

---

### 9.2 Agent 3: Layout & Composition Specialist
- [ ] **Overhaul Landing Page (`src/app/page.tsx`):**
  - **MANDATE: Delete Section 9 (Team Section, lines 1334–1396) completely.**
  - **Refactor Hero Section (lines 408–525):** Expand headline to commanding scale (`text-5xl sm:text-6xl lg:text-7xl`); replace simulated terminal teaser box with an open, high-impact editorial layout; resize CTA buttons to 44px height with readable typography.
  - **Refactor Live Content Audit Workbench (lines 527–887):**
    - Remove `• INTERACTIVE HARDWARE TERMINAL` label.
    - Switch textarea from `text-xs font-mono` to `text-base font-sans leading-relaxed`.
    - Flatten nested box-in-box structures in diff viewer and provenance drawer.
    - Style preset buttons as clean segmented tabs.
    - Remove 9px/10px/11px font sizes on violation items and descriptions.
  - **Refactor 4 Landmark Cases (lines 1033–1122):**
    - Replace heavy black cards and red neon borders with open editorial cards (`#141414`, `#242424` border).
    - Remove green console remedy text; present remedies in readable sans-serif prose (`text-sm text-[#E5E5E5]`).
    - Remove loud red border badges.
  - **Refactor 8-Stage Architecture & Sectors (lines 1124–1275):**
    - Upgrade stage and sector descriptions from `text-xs` (12px) to `text-[15px] sm:text-base` sans-serif.
  - **Clean Footer (lines 1399–1552):**
    - Remove `text-xs font-mono` container class; switch footer links to clean `text-sm font-sans text-[#858585] hover:text-white`.
    - Replace hackathon submission text with standard enterprise copyright.

---

### 9.3 Agent 4: Component Refinement & Sub-Views Engineer
- [ ] **Overhaul Benchmark Dashboard (`src/app/evaluations/page.tsx`):**
  - Strip all electric cyan (`#00F2FE`), cyan glowing shadows, and navy blue borders (`#1E2E50`).
  - Standardize metric gauges to clean white numerals and 13px muted labels without hardware LEDs.
  - Convert audited copy snippet from 12px monospace to readable sans-serif.
  - Rebuild confusion matrix with clean, scannable table typography.
  - Remove `TEAM AGRAWALDAKSH008` callout from footer banner.
- [ ] **Refine In-App Sub-Views (`/dashboard`, `/submissions/[id]`):**
  - Audit and clean `src/app/dashboard/page.tsx`: eliminate cyan accents, fix 10px labels, ensure table rows have generous 8px grid padding.
  - Audit and clean `src/app/submissions/[id]/page.tsx`: remove fake terminal audit logs, eliminate nested border clutter.
  - Update `Header.tsx` and `Sidebar.tsx` to match the Inter/Geist typography scale and monochromatic surface tokens.

---

## 10. Verification Checkpoints for Subsequent QA Agents

When Agents 2, 3, and 4 complete their implementation, the following QA checkpoints must be verified:

1. **Zero Monospace for Normal Prose:** `grep -r "font-mono" src/` must return hits ONLY for technical IDs (e.g. `CLM-APX-001`), DOIs, numerical metrics, and hashes.
2. **Zero Text Below 12px:** `grep -r "text-\[10px\]" src/` and `grep -r "text-\[11px\]" src/` and `grep -r "text-\[9px\]"` must return ZERO hits.
3. **Team Section Completely Gone:** No trace of "Built for Truth by Compliance Engineers", "TEAM AGRAWALDAKSH008", or personal student email addresses in `src/app/page.tsx` or any rendered view.
4. **Clean Color Contrast:** No neon electric cyan (`#00F2FE`) or navy blue (`#1E2E50`) borders remaining.
5. **No Terminal Symbols:** No `>_`, `<Terminal />`, or `HARDWARE TERMINAL` text on customer-facing pages.
6. **Passes Next.js Build & Tests:** `npm run build` and `npm run test` execute with zero compilation or runtime errors.

---
*End of UI/UX Audit Specification.*
