# INKLOOM AI DESIGN SYSTEM
**Style:** Modern Swiss International Style × Restrained Skeuomorphism  
**Palette:** Monochromatic High-Contrast Black & White with Functional Status Diodes  
**Version:** 2.0 (November 2026)  

---

## 1. Color Palette Architecture

### 1.1 Monochromatic Neutrals
| Token | Hex | Role & Usage |
|---|---|---|
| `--canvas-deep` | `#080808` | Primary page canvas & global background |
| `--canvas-subtle` | `#0F0F0F` | Alternate section background, sidebar, header |
| `--surface-well` | `#141414` | Recessed input wells, diff viewers, milled code blocks |
| `--surface-card` | `#181818` | Elevated cards, dialogs, drawers |
| `--border-hairline`| `#242424` | 1px subtle divider lines, inactive borders |
| `--border-milled`  | `#333333` | Interactive borders, input borders on hover |
| `--text-muted`     | `#737373` | Minor captions, metadata, character counters |
| `--text-secondary` | `#A0A0A0` | Secondary descriptions, subheadings, table headers |
| `--text-primary`   | `#F8F8F8` | Primary body copy, table data |
| `--text-bright`    | `#FFFFFF` | Headlines, active tab labels, high-contrast badges |

### 1.2 Functional Hardware Diodes (Strictly Semantic)
Accent colors are strictly forbidden for generic decorative backgrounds or rainbow gradients. They are reserved exclusively for functional status meaning:
- **Emerald LED (`#10B981` / `#059669`):** Compliant, Approved, Passing Test, 0.0% Missed Issues.
- **Amber LED (`#F59E0B` / `#D97706`):** Warning, Impending Expiry (<30 days), Informational Dispute, Needs Review.
- **Rose LED (`#EF4444` / `#DC2626`):** Statutory Breach, Critical Violation, Prohibited Claim, Regulatory Fine.
- **Cyan LED (`#06B6D4` / `#0891B2`):** Telemetry, Cryptographic Hash (SHA-256), DOI Citation, ISO Standard.

---

## 2. Typography Scale

- **Sans Grotesk (`var(--font-sans)`, Inter / Geist / system-ui):**
  - Hero Headline: `text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1]`
  - Section Title: `text-2xl sm:text-3xl font-semibold tracking-tight text-white`
  - Card Title: `text-base sm:text-lg font-medium text-white`
  - Body Copy: `text-sm leading-relaxed text-[#A0A0A0]`
  - Micro-Copy: `text-xs leading-normal text-[#737373]`
- **Monospace Grotesk (`var(--font-mono)`, JetBrains Mono / Geist Mono / monospace):**
  - Section Index: `text-[11px] font-mono tracking-[0.25em] uppercase text-white/60`
  - Hardware Badges: `text-[10px] font-mono uppercase font-semibold tracking-wider`
  - Audit Data / Offsets / Hashes: `text-xs font-mono text-[#F8F8F8]`

---

## 3. Restrained Skeuomorphism & Tactile Tokens

1. **Paper Grain Noise Overlay:**
   Applied via `.noise-overlay` with an SVG turbulence filter at 0.035 opacity over `--canvas-deep`.
2. **Tactile Buttons (`.tactile-button`):**
   - 1px top specular rim (`border-t border-t-white/20`)
   - 1px hairline border (`border border-white/10`)
   - Subtle shadow (`shadow-[0_2px_4px_rgba(0,0,0,0.5)]`)
   - Physical depression on press (`active:translate-y-px active:shadow-none`)
3. **Milled Inset Wells (`.milled-well`):**
   - Deep inner shadow: `shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)]`
   - Background: `#0C0C0C` or `#121212`
   - Border: `border border-white/8`
4. **Hardware Status Diodes (`.status-diode`):**
   - 6px × 6px circular indicator with subtle glowing ring (`ring-2 ring-emerald-500/20`)

---

## 4. Spacing & Swiss Grid System

- **Grid:** 12-column Swiss typographic grid with 24px column gutters.
- **Section Padding:** Generous `py-24 sm:py-32` inspired by Freshflow spatial rhythm.
- **Container:** `max-w-7xl mx-auto px-6 sm:px-8 lg:px-12`.
- **Rhythm:** Multiples of 4px / 8px (4, 8, 12, 16, 24, 32, 48, 64, 96, 128).
