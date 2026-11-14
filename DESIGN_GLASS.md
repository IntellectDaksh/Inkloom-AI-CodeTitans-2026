# AdSnitch app — glass design system
Sibling of the landing page (`src/app/landing.css`, do not edit). Source of truth: `src/app/globals.css`.

## Tokens (Tailwind: `bg-*`, `text-*`, `border-*`)
| Token | Value | Use |
|---|---|---|
| `canvas` | #f7f9ff (ghost) | page background |
| `panel` / `panel-hover` / `panel-elevated` | white 62% / 86% / #fff | rows, list items, hover fills |
| `border-subtle` / `-default` / `-strong` | ink-blue at 9% / 13% / 22% | hairlines |
| `text-primary` / `-secondary` / `-muted` / `-dim` | #091520 / #3d5163 / #6b7c8c / #8e9cab | text hierarchy |
| `ink`, `navy`, `navy-soft` | #091520, #07131d, #0c202e | primary buttons, brand mark, dark data panels |
| `ice`, `freeze`, `blue` | #c8f1ff, #7cddff, #4bc7f4 | accent: focus, selection, one highlight per view |
| `status-success` / `-warning` / `-critical` | #0f9a6e / #b7741a / #e0464f | status only |
Fonts: `font-sans` Inter (body), `font-display` Space Grotesk (h1-h3 automatically), `font-mono` IBM Plex Mono.

## Utility classes
- `.glass` frosted panel, 18px radius (default card/section). `.glass-strong` modals, popovers, drawers. `.glass-inset` wells, inputs, code/diff blocks.
- `.eyebrow` mono uppercase label above headings and metric names.
- `.atmosphere` fixed orbs; markup `<div className="atmosphere" aria-hidden><i/><i/><i/></div>`. Already rendered by `AppLayout`, do not repeat inside pages.
- `.contour-bg` faint contour lines; one hero/empty-state per page max.
- `.app-brand-mark` navy rounded square + ice `ShieldCheck` icon (same as landing `.brand-mark`).
- Radius from Tailwind (`rounded-xl` etc.) overrides `.glass` radius. Legacy `.btn-*`, `.tactile-*`, `.status-diode-*`, `.swiss-*` still work, now light.

## Components
`Card` default = glass, `elevated` = glass-strong, `well` = glass-inset. `Button` primary = ink fill, ghost text; secondary/outline = light panel. `Badge` status variants = 10% status tint + 30% border. `AppLayout` supplies atmosphere, glass sidebar + header. Prefer these over raw markup.

## Old dark class -> new
| Old | New |
|---|---|
| `bg-[#080808]` `bg-[#0A0A0A]` `bg-[#0C0C0C]` | `bg-canvas` (or nothing: shell already paints it) |
| `bg-[#141414]` card shells | `glass` (rows inside: `bg-panel`) |
| `bg-[#191919]` `bg-[#1A1A1A]` `hover:bg-[#1C1C1C]` | `bg-panel-hover` |
| `bg-[#202020]` `bg-[#222222]` | `bg-panel-elevated` |
| `bg-black/80` overlay | `bg-ink/25 backdrop-blur-sm` |
| `border-[#222]`..`[#282828]` / `border-white/5` | `border-border-subtle` |
| `border-[#303030]` `[#333]` / `border-white/10` | `border-border-default` |
| `border-[#404040]` / `border-white/20` | `border-border-strong` |
| `text-white` `text-[#EFEFEF]` | `text-text-primary` |
| `text-[#B5B5B5]` `text-[#A0A0A0]` `text-neutral-400` | `text-text-secondary` |
| `text-[#858585]` `text-[#737373]` `text-neutral-500` | `text-text-muted` |
| `bg-white text-[#0A0A0A]` (primary CTA) | `bg-ink text-ghost hover:bg-navy-soft` |
| `text-[#10B981]` / `[#F59E0B]` / `[#EF4444]` | `text-status-success` / `-warning` / `-critical` |
| `bg-[#0C1A14]` / `[#1C1608]` / `[#1A0E10]` | `bg-status-success/10` / `-warning/10` / `-critical/10` |
| `bg-emerald-400` dots | `bg-status-success` |
| dark code blocks `bg-black` | `glass-inset font-mono`, or `bg-navy text-ice` for one deliberate dark data panel |

## Anti-slop rules
- No purple/violet, no rainbow or multi-stop gradients. Accent is ice/freeze/blue only, used sparingly.
- No emoji in UI. lucide-react icons, 16-20px, `text-text-muted` unless active.
- No glow on everything: no colored box-shadow halos, no neon text. Shadows stay soft and blue-grey.
- Status colors mean status. Never use green/amber/red for decoration or brand.
- Restraint: one glass layer deep (no glass in glass in glass); separate inner rows with hairlines, not more cards.
- Headings Space Grotesk, tight tracking, sentence case. Labels use `.eyebrow`, not bold caps body text.
- Numbers `tabular-nums`. Keep 44px touch targets and visible `:focus-visible` (blue outline).
