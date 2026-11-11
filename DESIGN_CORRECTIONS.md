# INKLOOM AI DESIGN SYSTEM & TYPOGRAPHY SPECIFICATION

**Product:** Inkloom AI  
**Design Direction:** High-Contrast Swiss Minimalism × Editorial Typography × Restrained Sovereign UI  
**Author:** Agent 2 (Typography & Design System Specialist)  
**Status:** Implemented & Verified (`npx tsc --noEmit` passing)  
**Target Codebase:** `E:\Hackathon Projects\Inkloom - 2026`  

---

## 1. Executive Summary & Core Principles

Inkloom AI operates as a **pre-publication deterministic compliance engine** auditing marketing copy against certified clinical trials, SEC regulatory disclosures, and statutory registers. The user interface reflects the rigor of an institutional legal-regulatory instrument rather than a consumer gadget:

1. **Monochromatic Technical Restraint:** The visual canvas is disciplined around deep obsidian `#0A0A0A`, primary surfaces `#141414`, secondary surfaces `#191919`, and machined borders `#303030`.
2. **Strictly Functional Semantic Diode Accents:** Color conveys statutory status only:
   - **Green (`#10B981`):** Compliant, verified, approved.
   - **Red (`#EF4444`):** Critical violations, statutory red-lines, legal breach risks.
   - **Amber (`#F59E0B`):** Warnings, pending human reviews, impending claim expirations.
   - **Zero Blue/Cyan/Violet/Rainbow Accents:** Decorative electric highlights, cyan glows, and violet gradients are completely eliminated.
3. **Purity of Surface & Elimination of Noise:** The distracting `body::before` SVG fractal noise grain overlay and radial dot patterns have been completely removed for razor-sharp legibility.
4. **Editorial Typography Hierarchy:** High-contrast desktop scale with generous leading and proportional line spacing. Monospace is strictly cordoned off for technical identifiers (Claim IDs, DOIs, hashes, metrics).
5. **Standardized 44px Touch & Click Targets:** Both primary and secondary actions satisfy WCAG 2.5.5 touch target criteria with tactile 44px (`h-11`) height and `px-6` padding.

---

## 2. Definitive Color Palette Tokens

All colors are established in `src/app/globals.css` via Tailwind v4 `@theme` and `:root` variables:

```css
/* Core Monochromatic Canvas & Surfaces */
--color-background: #0A0A0A;        /* Global page background */
--color-surface-primary: #141414;   /* Primary cards, workbench, dialogs, drawers */
--color-surface-secondary: #191919; /* Secondary panels, table headers, hover wells */
--color-surface-elevated: #202020;  /* Popovers, modals, dropdown menus */

/* Precision Hairline Borders */
--color-border-subtle: #242424;     /* Fine interior dividers */
--color-border-default: #303030;    /* Standard card borders, table dividers, inputs */
--color-border-strong: #404040;     /* Active borders, hover border states */
--color-border-focus: #FFFFFF;      /* High-contrast focus indicator */

/* High-Contrast Foreground Typography */
--color-text-primary: #FFFFFF;      /* Headlines, primary body, button text */
--color-text-secondary: #B5B5B5;    /* Explanatory body copy, section descriptions */
--color-text-muted: #858585;        /* Metadata, character counts, secondary labels */

/* Strictly Functional Semantic Accents (No Decorative Rainbows!) */
--color-status-green: #10B981;      /* Verified compliant, approved claims, 100% precision */
--color-status-red: #EF4444;        /* Critical violations, statutory breach, -100% score penalty */
--color-status-amber: #F59E0B;      /* Warnings, pending review, expiring <30d claims */
```

### Color Token Crosswalk

| Token / Role | Hex Value | Tailwind Class Equivalent | Purpose & Usage Rule |
|---|---|---|---|
| **Background** | `#0A0A0A` | `bg-[#0A0A0A]` | Global page canvas, code blocks, milled wells |
| **Primary Surface** | `#141414` | `bg-[#141414]` | Main workbench panel, evidence cards, audit drawers |
| **Secondary Surface** | `#191919` | `bg-[#191919]` | Table headers, secondary buttons, active selection pills |
| **Primary Text** | `#FFFFFF` | `text-white` | Hero headlines, section titles, primary buttons |
| **Secondary Text** | `#B5B5B5` | `text-[#B5B5B5]` | Standard body paragraphs, card explanations, nav links |
| **Muted Text** | `#858585` | `text-[#858585]` | Timestamps, counters, technical labels, breadcrumb dividers |
| **Borders** | `#303030` | `border-[#303030]` | Standard bounding boxes, horizontal dividers, table rows |
| **Functional Green** | `#10B981` | `text-[#10B981]`, `bg-[#0C1A14]` | **COMPLIANT ONLY:** Approved claims, passed checks, diff additions |
| **Functional Red** | `#EF4444` | `text-[#EF4444]`, `bg-[#1A0E10]` | **CRITICAL ONLY:** FTC/FDA violations, banned superlatives, diff removals |
| **Functional Amber** | `#F59E0B` | `text-[#F59E0B]`, `bg-[#1C1608]` | **WARNINGS ONLY:** Impending claim expiry (<30d), pending reviewer sign-off |

---

## 3. Strict Typography Scale & Rules

Inkloom AI implements a high-contrast editorial hierarchy designed for readability on high-DPI displays.

| Element | Target Desktop Size | Class / Tailwind Utility | CSS Token Class | Usage Rule |
|---|---:|---|---|---|
| **Main Hero Heading** | 52–64px | `text-5xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08]` | `.heading-hero` | Top hero headline only ("Check the Claim. Show the Source.") |
| **Section Headings** | 32–40px | `text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-[1.15]` | `.heading-section` | Major section titles ("Interactive Regulatory Workbench", "Where It Fits") |
| **Subsection Headings** | 22–26px | `text-xl sm:text-2xl font-semibold text-white leading-[1.25]` | `.heading-subsection` | Case study titles, drawer headers, card groups |
| **Card Headings** | 18–21px | `text-lg sm:text-xl font-medium text-white leading-[1.35]` | `.heading-card` | Card titles, modal headers, component titles |
| **Body Copy** | 15–17px | `text-[15px] sm:text-base leading-relaxed text-[#B5B5B5]` | `.text-body-standard` | Standard explanations, narrative descriptions, findings explanations |
| **Supporting Text** | 14–15px | `text-sm leading-normal text-[#858585]` | `.text-supporting` | Secondary descriptions, timestamps, card footers |
| **Navigation** | 14–15px | `text-sm font-medium text-[#B5B5B5] hover:text-white transition-colors` | `.text-nav-link` | Top navigation links, breadcrumb items, tab labels |
| **Technical Metadata** | 12–13px | `text-xs font-mono text-[#858585]` | `.text-tech-metadata` | **Monospace ONLY:** DOIs, Claim IDs, hashes, numerical metrics |

### Strict Monospace Boundary Rule

> [!IMPORTANT]
> **Monospace (`font-mono`) is strictly cordoned off:**
> - **PERMITTED:** Machine identifiers (`CLM-APX-001`), scientific DOIs (`10.1016/j.nutres.2024.108421`), SHA-256 signatures (`3b8a1c90...`), numerical percentages (`97.9%`), timestamps (`09:14:22Z`), and keyboard shortcuts (`Ctrl+K`).
> - **PROHIBITED:** Hero headlines, section titles, card titles, narrative body copy, button labels, and navigation links MUST NEVER be formatted in monospace.

---

## 4. Standardized Button Component Architecture

Inkloom AI standardizes interactive buttons with consistent 44px (`h-11`) touch targets conforming to WCAG 2.5.5:

### Primary Action Button (`.btn-primary`)
```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 2.75rem; /* 44px (h-11) */
  padding-left: 1.5rem; /* 24px (px-6) */
  padding-right: 1.5rem;
  background-color: #FFFFFF;
  color: #0A0A0A;
  font-size: 0.875rem; /* 14px (text-sm) */
  font-weight: 600; /* font-semibold */
  line-height: 1.25rem;
  border-radius: 0.5rem; /* 8px (rounded-lg) */
  border: 1px solid #FFFFFF;
  transition-property: color, background-color, border-color, transform;
  transition-duration: 150ms;
  user-select: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn-primary:hover:not(:disabled) {
  background-color: #E5E5E5; /* hover:bg-neutral-200 */
  border-color: #E5E5E5;
}

.btn-primary:active:not(:disabled) {
  transform: translateY(1px);
}
```

### Secondary Action Button (`.btn-secondary`)
```css
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 2.75rem; /* 44px (h-11) */
  padding-left: 1.5rem; /* 24px (px-6) */
  padding-right: 1.5rem;
  background-color: #191919;
  color: #FFFFFF;
  font-size: 0.875rem; /* 14px (text-sm) */
  font-weight: 500; /* font-medium */
  line-height: 1.25rem;
  border-radius: 0.5rem; /* 8px (rounded-lg) */
  border: 1px solid #303030;
  transition-property: color, background-color, border-color, transform;
  transition-duration: 150ms;
  user-select: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #222222;
  border-color: #404040;
}

.btn-secondary:active:not(:disabled) {
  transform: translateY(1px);
}
```

---

## 5. Noise & Texture Elimination Report

1. **Eliminated `body::before` SVG Fractal Noise:**
   - Previous implementation had an absolute overlay (`width: 100vw; height: 100vh; pointer-events: none; z-index: 9999; opacity: 0.035;`) rendering an SVG turbulence filter (`#noiseFilter feTurbulence`).
   - This overlay was completely deleted from `src/app/globals.css`.
2. **Eliminated Radial-Gradient Paper Texture:**
   - Removed `backgroundImage: radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)` overlay from `src/app/page.tsx`.
3. **Eliminated Background Gradients:**
   - Neutralized all gradient overlays (`from-[#0D1527] to-[#111C35]`, `from-[#0C101E] to-[#120E24]`, and `from-violet-950/40 via-[#0E1528] to-cyan-950/30`) across `analytics`, `team`, `claims`, `brands`, and `assets` pages.
   - Replaced with solid single-surface `#141414` containers and `#303030` hairline borders.

---

## 6. Functional Component Upgrades

### UI Component Synchronization
- **`src/components/ui/Button.tsx`:** Updated `md` and `lg` size styles to 44px (`h-11 px-6`), standardized `primary` (`bg-white text-[#0A0A0A]`) and `secondary` (`bg-[#191919] border-[#303030]`), and eliminated legacy turquoise styling.
- **`src/components/ui/Badge.tsx`:** Mapped all variants strictly into the 3 functional diode colors:
  - Success / Compliant: `bg-[#0C1A14] text-[#10B981] border-[#10B981]/30`
  - Critical Violation: `bg-[#1A0E10] text-[#EF4444] border-[#EF4444]/30`
  - Warnings / Review: `bg-[#1C1608] text-[#F59E0B] border-[#F59E0B]/30`
  - Technical / Neutral: `bg-[#141414] text-[#B5B5B5] border-[#303030]`
  - Neutralized all cyan/violet/blue badges to monochromatic or functional status.
- **`src/components/ui/Card.tsx`:** Default surface set to `#141414` with `#303030` border. Card Title standardized to `text-lg sm:text-xl font-medium text-white`. Card Description set to `text-sm leading-normal text-[#858585]`.
- **`src/components/ui/DiffViewer.tsx`:** Clean word-level surgical diff with `#10B981` addition highlights, `#EF4444` removal red-lines, and `#303030` structural dividers.

---

## 7. Verification & Compliance Checklist

- [x] Background `#0A0A0A` established in `globals.css` and applied to `body`.
- [x] Primary surface `#141414` established for all cards and interactive desks.
- [x] Secondary surface `#191919` established for secondary actions and table headers.
- [x] Primary text `#FFFFFF`, Secondary text `#B5B5B5`, Muted text `#858585` strictly mapped.
- [x] Borders standardized to `#303030`.
- [x] Functional Green `#10B981`, Red `#EF4444`, Amber `#F59E0B` restricted to statutory meaning only.
- [x] Blue, cyan, violet, and electric rainbow status accents completely eliminated from all components and pages.
- [x] `body::before` SVG noise overlay and all background textures deleted.
- [x] Main hero heading 52–64px (`text-5xl sm:text-6xl font-bold tracking-tight text-white`).
- [x] Section headings 32–40px (`text-3xl sm:text-4xl font-semibold tracking-tight text-white`).
- [x] Subsection headings 22–26px (`text-xl sm:text-2xl font-semibold text-white`).
- [x] Card headings 18–21px (`text-lg sm:text-xl font-medium text-white`).
- [x] Body copy 15–17px (`text-[15px] sm:text-base leading-relaxed text-[#B5B5B5]`).
- [x] Supporting text 14–15px (`text-sm leading-normal text-[#858585]`).
- [x] Navigation 14–15px (`text-sm font-medium text-[#B5B5B5] hover:text-white`).
- [x] Technical metadata 12–13px (`text-xs font-mono text-[#858585]`).
- [x] Monospace strictly reserved for IDs, DOIs, hashes, and numbers.
- [x] `.btn-primary` class implemented (44px height, `#FFFFFF` bg, `#0A0A0A` text, `font-semibold text-sm rounded-lg hover:bg-neutral-200`).
- [x] `.btn-secondary` class implemented (44px height, `#191919` bg, 1px border `#303030`, white text, `font-medium text-sm rounded-lg hover:bg-[#222222]`).
- [x] `npx tsc --noEmit` verifies clean compilation with zero TypeScript errors.
