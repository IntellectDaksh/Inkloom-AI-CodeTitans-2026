# DESIGN CORRECTIONS & TYPOGRAPHY SPECIFICATION
**Product:** Inkloom AI  
**Design Direction:** Premium Swiss Minimalism × Editorial Typography × Restrained Technical UI  
**Author:** Agent 2 (Typography & Design System Specialist)  

---

## 1. Color Palette Tokens

```css
/* Core Monochromatic Canvas & Surfaces */
--bg-canvas: #0A0A0A;        /* Global page background */
--bg-surface: #141414;       /* Primary cards, workbench, dialogs */
--bg-surface-subtle: #191919;/* Secondary panels, table headers, hover wells */
--bg-elevated: #202020;      /* Modals, popovers, active selection */

/* Hairline Precision Borders */
--border-subtle: #242424;    /* Inactive borders, fine divider hairlines */
--border-default: #303030;   /* Standard card borders, input borders */
--border-focus: #FFFFFF;     /* Focused inputs */

/* Typography Contrast Hierarchy */
--text-primary: #FFFFFF;     /* Headlines, primary body, active tabs */
--text-secondary: #B5B5B5;   /* Supporting copy, section descriptions, labels */
--text-muted: #858585;       /* Metadata, character counts, timestamps */

/* Semantic Status Accents (Functional Meaning Only!) */
--status-green: #10B981;     /* Verified, compliant, approved, 100% recall */
--status-amber: #F59E0B;     /* Warning, pending review, expiring <30d */
--status-red: #EF4444;       /* Critical violation, statutory breach, $15.2M fine */
```

---

## 2. Typography Scale (Strict Desktop Targets)

| Element | Target Size | Class / Styling | Usage Rule |
|---|---:|---|---|
| **Main Hero Heading** | 52–64px | `text-5xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1]` | Top hero headline only |
| **Section Headings** | 32–40px | `text-3xl sm:text-4xl font-semibold tracking-tight text-white` | Section titles ("Where It Fits", etc.) |
| **Subsection Headings** | 22–26px | `text-xl sm:text-2xl font-semibold text-white` | Case study titles, workbench title |
| **Card Headings** | 18–21px | `text-lg sm:text-xl font-medium text-white` | Card titles, modal headers |
| **Body Copy** | 15–17px | `text-[15px] sm:text-base leading-relaxed text-[#B5B5B5]` | Standard explanations, paragraphs |
| **Supporting Text** | 14–15px | `text-sm leading-normal text-[#858585]` | Secondary labels, descriptions |
| **Navigation** | 14–15px | `text-sm font-medium text-[#B5B5B5] hover:text-white` | Top nav links, breadcrumbs |
| **Technical Metadata** | 12–13px | `text-xs font-mono text-[#858585]` | **Monospace ONLY:** DOIs, Claim IDs, hashes, numbers |

> [!IMPORTANT]
> Monospace font (`font-mono`) is strictly prohibited for headings, ordinary paragraphs, button labels, and standard section descriptions. It is reserved exclusively for technical identifiers (e.g., `CLM-APX-001`, `10.1016/j.nutres.2024.108421`), timestamps, SHA-256 hashes, and numerical metrics.

---

## 3. Button & Interactive Component Standards

### Primary Action Button (`.btn-primary`)
- Height: 44px (`h-11 px-6`)
- Typography: `text-sm font-semibold tracking-normal`
- Appearance: Solid pure white background (`#FFFFFF`), solid deep black text (`#0A0A0A`), 8px border radius (`rounded-lg`)
- Hover: Soft neutral-200 transition (`hover:bg-[#E5E5E5]`)
- No gratuitous gradients or rainbow glowing shadows.

### Secondary Action Button (`.btn-secondary`)
- Height: 44px (`h-11 px-6`)
- Typography: `text-sm font-medium tracking-normal text-white`
- Appearance: Secondary surface background (`#191919`), 1px border (`border border-[#303030]`), `rounded-lg`
- Hover: Subtle lighter background (`hover:bg-[#242424] hover:border-[#404040]`)

### Card & Panel Architecture
- Open, breathable layouts preferred over boxed containers.
- When containerization is needed (Workbench, Evidence Drawer), use single `#141414` background with `#303030` border.
- Generous padding: `p-6 sm:p-8 lg:p-10`.
- No nested cards inside cards!
