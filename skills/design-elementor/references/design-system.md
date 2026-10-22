# GCS Design System — Portable Reference

> **Purpose of this file:** a self-contained brand + design-system brief for **Global Citizen Solutions (GCS)**, written so it can be pasted as context into *any* LLM (ChatGPT, Gemini, other Claude sessions, etc.) that doesn't have access to this repository. It contains every token value, component contract, and brand rule needed to generate on-brand HTML/CSS/React output from scratch, plus copy-paste CSS you can drop into a page with no build step.
>
> If you *do* have access to this repo, prefer the real files (`styles.css`, `tokens/`, `components/core/`) over retyping values from here — this document is a snapshot for external use.

---

## 1. About the brand

**Global Citizen Solutions** is a leading residency and citizenship planning advisory firm, helping high-net-worth clients and their families secure greater control over where they can live, travel, do business, and operate across jurisdictions. With a global team of legal, immigration, and programme specialists, the firm guides clients through complex cross-border decisions — covering programmes across Europe, the Caribbean, and the Pacific (Portugal Golden Visa, Greek Golden Visa, Malta programmes, Caribbean CBI, and more).

**GIU (Global Intelligence Unit)** is a related sub-brand (research reports, calendars) — same visual system, used for its own report/calendar deliverables.

**Brand personality:** reassuring authority. Clients are making life-changing legal/financial decisions — copy and UI should feel confident, precise, and sophisticated, never salesy or bureaucratic. The client is always the hero; frame outcomes from their perspective, not the firm's.

---

## 2. Tone of voice & copy rules

### Writing rules

- **UK English** spelling: "programme", "colour", "organise", "authorised".
- **Title Case** for headings, navigation labels, and CTA buttons. **Sentence case** for body copy and helper text.
- **No emoji.** No exclamation marks in professional contexts.
- Address the reader directly as "you"/"your" — never "the client" in second-person contexts.
- Short, declarative, active-voice sentences: "Upload your passport", not "Your passport should be uploaded."
- Every screen/section should point to a clear next step.
- The client is the hero — frame outcomes from their perspective, not the firm's.
- Tone test: would this read as credible to a knowledgeable private banker? If not, rewrite it.
- Never fearmonger, oversimplify, pit one programme against another, or create urgency where none exists.

**Standard CTA patterns:** "Start Your Application" · "Explore Your Options" · "Book a Consultation" · "Upload Documents" · "View Programme Details" · "Continue" / "Back".

**Reference/application IDs:** format `APP-YYYY-CC-NNNNN` (e.g. `APP-2024-GR-00847`), always rendered in the monospace font.

### Company descriptions

Use the appropriate variant for the context. Never abbreviate to "GCS" in external-facing copy.

| Variant | Copy |
|---------|------|
| **Main** | Global Citizen Solutions is a leading residency and citizenship planning advisory firm, helping high-net-worth clients and their families secure greater control over where they can live, travel, do business, and operate across jurisdictions. |
| **Mid-size** | Global Citizen Solutions is a residency and citizenship planning advisory firm that helps high-net-worth individuals and their families secure greater control over where they can live, travel, and do business. With a global team of legal, immigration, and programme specialists, we guide clients through complex cross-border decisions and build structured plans that provide long-term security, flexibility, and access to multiple jurisdictions. |
| **1-liner** | Global Citizen Solutions helps high-net-worth individuals and families secure the freedom to live, work, and operate across multiple countries through structured residency and citizenship planning. |
| **Events** | Global Citizen Solutions is a global advisory firm helping high-net-worth individuals and families structure residency and citizenship across jurisdictions, giving them greater control over their future. |
| **Presentation** | A global advisory firm helping high-net-worth individuals structure residency and citizenship across jurisdictions. |

### Messaging pillars

Three themes anchor all communications:

**1. Optionality** — the ability to act when circumstances change. Express as: having another option in place; not relying on one country; planning ahead rather than reacting to external pressures. Note: "Plan B" helps clients understand the concept but should not be the primary framing.

**2. Security and Access** — a legally established alternative to rely on; greater control over where you live and operate; reducing dependence on a single jurisdiction; protecting access, mobility, and assets.

**3. Family and Future Generations** — these decisions secure safety, access, and opportunities for children and future generations. Residency and citizenship often extends to family members and can be passed down.

### Terms to use and avoid

**Describing the firm:**

| Use | Avoid |
|-----|-------|
| Global Citizen Solutions | GCS (in external copy) |
| Residency and citizenship advisors | Relocation firm / global mobility firm |
| Residency and citizenship planning advisory | Passport shop |
| Investment migration firm | Tax advisory firm / relocation company |

**Describing a programme:**

| Use | Avoid |
|-----|-------|
| Citizenship programme | Citizenship by investment programme (SEO exception only) |
| Residency programme | Residency by investment programme |
| Golden visa / residency visa / residency permit | Passport programme / passport scheme |

**Benefits language** — use sparingly, always with explanation, never as a standalone headline:

| Use (with care) | Avoid |
|-----------------|-------|
| Plan B / optionality | Fallback option |
| Multi-jurisdictional strategy | Limitless possibilities |
| Global mobility (with context) | Borderless living / dream lifestyle |

### Language guidelines

- **Authoritative and pragmatic.** Never pressure clients, fearmonger, assume circumstances, or make promises that can't be kept.
- **Neutral.** State what is happening — not how to feel about it. No emotionally charged language.
- **Discreet and respectful.** No overly familiar tone. No dramatic or emotional language.
- **No shortcuts.** Residency and citizenship decisions take years — never imply an easy or fast path.

---

## 3. Visual foundations

### 3.1 Colour

| Role | Name | Hex | HSL |
|---|---|---|---|
| Primary | Night Blue 400 | `#000957` | `hsl(233 100% 17%)` |
| Accent | Electric Blue 400 | `#3F8CFF` | `hsl(216 100% 62%)` |
| Rating/star (exclusive use) | Star | `#DFB300` | `hsl(47 100% 44%)` |
| Background (light) | — | — | `hsl(210 20% 98%)` — warm near-white, not pure white |
| Border (light) | — | — | `hsl(216 100% 93%)` — near-invisible Electric Blue tint |
| Foreground (light) | — | — | `hsl(220 43% 11%)` |
| Foreground secondary | Body text | `#414856` | `rgb(65 72 86)` — established body-copy grey (`--foreground-secondary`); darker/more present than muted-foreground, lighter than foreground |

**Night Blue scale:** 25 `#E8EBF0` · 50 `#B3B5CD` · 100 `#8084AB` · 200 `#333A79` · 300 `#1A2268` · 400 `#000957` (primary)
**Electric Blue scale:** 25 `#ECF4FF` · 50 `#D9E8FF` · 400 `#3F8CFF` (accent)

**Status colours:** Success `hsl(142 71% 45%)` · Warning `hsl(38 92% 50%)` · Destructive `hsl(0 84% 60%)` · Info = Electric Blue 400.

**Rules:**
- Night Blue dominates navigation, headings, primary buttons, high-emphasis surfaces. The sidebar (if any) is **always** Night Blue, in both light and dark mode.
- Electric Blue is the accent only — links, secondary buttons, focus rings, highlights. Don't let it compete with Night Blue for dominance.
- Star/amber is used **exclusively** for star ratings — never as a generic accent.
- No gradients, no background patterns, no textures on UI surfaces.
- **Dark mode** inverts to a Night Blue background with white text; cards become a slightly lighter navy (`hsl(234 100% 22%)`), not pure black.

### 3.2 Typography

| Token | Family | Use |
|---|---|---|
| `--font-serif` | **Yrsa** (serif) | Display headings, editorial/hero moments. Weight 400 only — deliberately light, not heavy. Gives a cosmopolitan, international quality. |
| `--font-sans` | **Heebo** (sans) | All UI text: body, labels, nav, buttons. 300 for large light headings, 400 body, 500 emphasis. |
| `--font-mono` | **JetBrains Mono** | Application/reference IDs, codes, data, anything tabular/numeric that benefits from fixed width. |

Google Fonts import (swap for self-hosted `@font-face` in production):
```css
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&family=Yrsa:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap');
```

Letter-spacing scale: tighter `-0.05em` · tight `-0.025em` · **normal `-0.01em`** (default body) · wide `0.025em` · wider `0.05em` · widest `0.1em` (used uppercase, on overlines only).

**Type scale** (family / size / line-height / weight):

| Class | Family | Size / Line-height | Weight |
|---|---|---|---|
| `.text-display-xl` | serif | 60px / 64px | 400 |
| `.text-display-l` / `.text-h1` | serif | 48px / 54px | 400 |
| `.text-display-md` / `.text-h2` | serif | 36px / 40px | 400 |
| `.text-h3` | sans | 30px / 1.4 | 300 |
| `.text-h4` | sans | 24px / 1.4 | 400 |
| `.text-display-xs` | sans | 24px / 1.4 | 400 |
| `.text-text-xl` | sans | 20px / 1.4 | 400 |
| `.text-body-large` | sans | 18px / 1.4 | 400 |
| `.text-body` | sans | 16px / 1.4 | 400 |
| `.text-body-small` | sans | 14px / 20px | 400 |
| `.text-caption` | sans | 12px / 1.4 | 400, tracking-wide |
| `.text-overline` | sans | 12px / 1.4 | 600, uppercase, tracking-widest |
| `.text-serif-lg` | serif | 18px / 28px | 500 — pull quotes, bylines |
| `.text-mono` / `.text-mono-sm` | mono | 14px or 12px / 1.5 | 400 |

Body default: 16px / 1.4, `letter-spacing: -0.01em`, antialiased.

### 3.3 Corners — the defining brand choice

**The Sharp-Corner Rule.** Border radius is `0px` by default, everywhere — cards, buttons, inputs, dropdowns, panels. This is a deliberate premium/architectural signature; round nothing "to be safe."

Scale (for the rare exception): sm `2px` · md `4px` · lg `8px` · xl `12px` · **full `9999px`** (pill).

Exceptions that *do* use radius:
- **Avatars** — always circular (`full`).
- **Badges** — always pill-shaped (`full`).
- **Tags** — sharp by default; may use `sm` (2px) only inside card-embedded contexts.

### 3.4 Shadows

Restrained — reserved for floating/modal elements. Standard cards use **no shadow**, just a 1px border.

```css
--shadow-xs:  0 1px 2px 0 hsl(220 43% 11% / 0.05);
--shadow-sm:  0 4px 10px 0 hsl(220 43% 11% / 0.05), 0 1px 2px -1px hsl(220 43% 11% / 0.05);
--shadow-md:  0 4px 10px 0 hsl(220 43% 11% / 0.05), 0 2px 4px -1px hsl(220 43% 11% / 0.05);
--shadow-lg:  0 4px 10px 0 hsl(220 43% 11% / 0.05), 0 4px 6px -1px hsl(220 43% 11% / 0.05);
--shadow-xl:  0 4px 10px 0 hsl(220 43% 11% / 0.05), 0 8px 10px -1px hsl(220 43% 11% / 0.05);
--shadow-focus: 0 0 0 3px hsl(216 100% 62% / 0.35); /* Electric Blue focus ring */
```
Warm-navy tinted in light mode; deepen to near-black in dark mode (double the alpha, e.g. `--shadow-sm` dark → `0 10px 15px 0 hsl(0 0% 0% / 0.30), 0 1px 2px -1px hsl(0 0% 0% / 0.30)`).

Use `shadow-xs`/`shadow-sm` for slight elevation on interactive/hoverable cards; `shadow-md`–`shadow-xl` for modals, dropdowns, tooltips only.

### 3.5 Spacing

4pt base grid. `--space-1 = 4px`, scaling to `--space-64 = 256px` in standard steps (1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 32, 40, 48, 64 × base).

Semantic gaps: xs `4px` (tight inline) · sm `8px` (icon+label) · md `16px` (component internal) · lg `24px` (section internal) · xl `32px` (section separation) · 2xl `48px` (page sections) · 3xl `64px` (major sections).

Component defaults: button padding 12–24px horizontal; card padding `24px` (`16px` compact); input padding `12px 16px`. Container: max-width `1400px`, padding `32px`.

### 3.6 Motion

- Durations: `100ms` fast · `200ms` normal (state changes, accordion) · `300ms` slow · `500ms` slower (page-section fade-in).
- Easing: `ease-out` (`cubic-bezier(0,0,0.2,1)`) for almost everything — quick start, smooth stop. **No bouncy/springy easing.**
- `fade-in` keyframe: opacity 0→1 + `translateY(10px→0)` over 500ms — used when page sections appear.
- Respect `prefers-reduced-motion`.

### 3.7 Hover & press states

- Primary buttons: background shifts Night Blue 400 → Night Blue 300 (`#1A2268`) on hover.
- Secondary/accent buttons: Electric Blue lightens slightly on hover.
- Ghost/outline buttons: fill with `--muted` on hover.
- Interactive cards: add `shadow-sm` on hover (no colour change).
- **Colour shifts only on hover — no opacity-based hover states for buttons.**
- Press state: drop shadow, slight opacity reduction.

### 3.8 Iconography

Self-hosted **SVG icons**, no icon font. Naming and shapes are compatible with **Google Material Symbols** (Apache-2.0). Three families: `outlined` (default, general UI), `rounded` (softer/friendlier), `sharp` (dense data/table contexts), each with a `-fill` solid variant. Icons always render via `currentColor` — they inherit the parent's text colour. **No emoji anywhere in product UI.**

Sizing: 14px compact inline (table/badge) · 16px standard interactive (buttons/nav) · 20px standalone contextual · 24px feature/section icons.

If you don't have the self-hosted SVGs available (e.g. building in a fresh LLM/project with no asset pipeline), the closest drop-in equivalent is **Lucide** icons at `2px` stroke weight, sized to the same scale — visually compatible with Material Symbols' outlined style.

### 3.9 Imagery

No decorative illustration — clean, data-driven layouts. Where photography is used (e.g. destination/country imagery), keep it full-bleed, high-quality, very slightly desaturated toward cool tones.

**Flags:** self-hosted PNG, sourced from [`msikma/country-flags`](https://github.com/msikma/country-flags), rendered round (`border-radius: 50%`, `object-fit: cover`, equal width/height) — never the source's native rectangular aspect ratio. 37 territories (uncovered territories, UK sub-nations, Kosovo) remain legacy SVG. If you don't have the self-hosted set available, fall back to a public flag package (e.g. `flag-icons`) — same pattern as the Lucide fallback for icons in §3.8 — then clip it to a circle the same way regardless of source.

### 3.10 Logos

Real logo files ship alongside this document in `assets/logos/` (bundled with this skill — see the note at the top of this file). Four families, each in Blue / Black / White:

| Family | File pattern | Composition | Ratio (w÷h) |
|---|---|---|---|
| **Primary** | `GCS-Primary-{colour}` | Symbol + **stacked** wordmark | 199×71 ≈ **2.80** |
| **Secondary** | `GCS-Secondary-{colour}` | Symbol + **inline** wordmark | 270×17 ≈ **15.88** (pre-rasterized PNG export ≈ 16.57 — always compute from the actual file, don't hardcode) |
| **Symbol** | `GCS-Symbol-{colour}` | Starburst mark only, no wordmark | 70×71 ≈ **0.98** (near-square) |
| **GIU Wordmark** | `GIU-Wordmark-{colour}` | GIU sub-brand wordmark (no separate symbol variant) | — |

Each ships as both `.svg` (scalable, preferred) and `.png` (pre-rasterized — use directly in tools without SVG rasterization support, e.g. PowerPoint/pptxgenjs).

**Colour-variant pairing (never mix these):**
- **Blue** or **Black** — light backgrounds (white, `#F5F7FA`, near-white card surfaces).
- **White** — dark backgrounds: Night Blue, black, or the Electric Blue accent colour.
- **Black** specifically signals a conservative/legal context (e.g. legal correspondence, compliance documents) — Blue is the default for everything else on light backgrounds.

**Composition rules:**
- **Secondary already contains the symbol** — never place `GCS-Symbol` next to a `GCS-Secondary` lockup in the same layout (redundant mark).
- Use **Primary** for standard cover/title moments where a stacked lockup fits (square-ish or vertical space).
- Use **Secondary** for tight horizontal spaces — page headers, footers, letterheads, anywhere width is constrained but height is not.
- Use **Symbol** alone for favicon-style marks, watermarks (e.g. low-opacity on a quote/pull-quote slide), or anywhere a mark-only treatment is wanted with no wordmark.
- Use **GIU Wordmark** only for GIU (Global Intelligence Unit) sub-brand deliverables — its calendar and corporate report templates — never mixed with GCS lockups in the same document.
- Always compute placement dimensions from the real file's aspect ratio — Primary and Secondary have very different proportions (2.80 vs 15.88); never guess or reuse one ratio for the other.

If you don't have this skill's bundled `assets/logos/` available (e.g. this document was pasted as text only, with no accompanying files), ask the user for the specific logo file(s) needed rather than fabricating a wordmark or symbol.

---

## 4. Copy-paste CSS tokens

Drop this into any project with no build step. (This is the full content of this system's `tokens/*.css`, minus the Google Fonts `@import`, condensed.)

```css
:root {
  /* Colour */
  --night-blue-25:  hsl(218 17% 92%);
  --night-blue-50:  hsl(233 22% 75%);
  --night-blue-100: hsl(232 18% 59%);
  --night-blue-200: hsl(233 41% 34%);
  --night-blue-300: hsl(233 60% 26%);   /* #1A2268 */
  --night-blue-400: hsl(233 100% 17%);  /* #000957 — primary */
  --electric-blue-25:  hsl(215 100% 96%);
  --electric-blue-50:  hsl(216 100% 93%);
  --electric-blue-400: hsl(216 100% 62%); /* #3F8CFF — accent */
  --star: hsl(47 100% 44%); /* #DFB300 */

  --background:          hsl(210 20% 98%);
  --foreground:          hsl(220 43% 11%);
  --card:                hsl(0 0% 100%);
  --card-foreground:     hsl(220 43% 11%);
  --primary:             hsl(233 100% 17%);
  --primary-foreground:  hsl(0 0% 100%);
  --secondary:           hsl(216 100% 62%);
  --secondary-foreground: hsl(0 0% 100%);
  --muted:               hsl(218 21% 93%);
  --muted-foreground:    hsl(221 13% 46%);
  --foreground-secondary: #414856; /* established body-text grey */
  --accent:              hsl(216 100% 62%);
  --accent-foreground:   hsl(0 0% 100%);
  --destructive:         hsl(0 84% 60%);
  --success:             hsl(142 71% 45%);
  --warning:             hsl(38 92% 50%);
  --border:              hsl(216 100% 93%);
  --input:               hsl(216 100% 93%);
  --ring:                hsl(233 100% 17%);

  --sidebar-background: hsl(233 100% 17%);
  --sidebar-foreground: hsl(0 0% 100%);
  --sidebar-accent:     hsl(218 21% 93%);
  --sidebar-border:     hsl(216 100% 93%);

  /* Typography */
  --font-sans:  'Heebo', system-ui, -apple-system, sans-serif;
  --font-serif: 'Yrsa', Georgia, 'Times New Roman', serif;
  --font-mono:  'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  --tracking-normal: -0.01em;
  --tracking-widest:  0.1em;

  /* Radius */
  --radius:      0rem;     /* default: sharp corners */
  --radius-sm:   0.125rem; /* 2px */
  --radius-md:   0.25rem;  /* 4px */
  --radius-lg:   0.5rem;   /* 8px */
  --radius-xl:   0.75rem;  /* 12px */
  --radius-full: 9999px;   /* pills, avatars, badges */

  /* Spacing (4pt grid) */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-12: 48px;
  --space-16: 64px;

  /* Shadows */
  --shadow-xs: 0 1px 2px 0 hsl(220 43% 11% / 0.05);
  --shadow-sm: 0 4px 10px 0 hsl(220 43% 11% / 0.05), 0 1px 2px -1px hsl(220 43% 11% / 0.05);
  --shadow-md: 0 4px 10px 0 hsl(220 43% 11% / 0.05), 0 2px 4px -1px hsl(220 43% 11% / 0.05);
  --shadow-focus: 0 0 0 3px hsl(216 100% 62% / 0.35);

  /* Motion */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --duration-normal: 200ms;
  --duration-slower: 500ms;
}

.dark {
  --background:          hsl(233 100% 17%);
  --foreground:          hsl(0 0% 100%);
  --card:                hsl(234 100% 22%);
  --primary:             hsl(0 0% 100%);
  --primary-foreground:  hsl(233 100% 17%);
  --muted:               hsl(220 43% 11%);
  --foreground-secondary: hsl(0 0% 100% / 0.7);
  --border:              hsl(220 43% 11%);
  --sidebar-background:  hsl(234 100% 14%); /* stays Night Blue in dark mode too */
}

* , *::before, *::after { box-sizing: border-box; }
body {
  font-family: var(--font-sans);
  font-size: 16px; line-height: 1.4;
  color: var(--foreground); background-color: var(--background);
  letter-spacing: var(--tracking-normal);
}
```

---

## 5. Component contracts (React-style, framework-agnostic intent)

These describe *behaviour and props*, not literal source — reimplement in whatever stack the target project uses (React, Vue, plain HTML/CSS), preserving variants, sizes, and states.

### Button
Primary action element. Uppercase-free Heebo Medium label (not all-caps — Title Case per copy rules), sharp corners.
- `variant`: `primary | secondary | outline | ghost | link | destructive`
- `size`: `sm | md | lg | xl`
- `iconLeft` / `iconRight` / `iconOnly` (square, icon-only)
- `disabled`, `loading`, `fullWidth`
- Primary = Night Blue 400 bg, white text; hover → Night Blue 300. Secondary = Electric Blue. Destructive = `--destructive`.

### Badge
Inline status label, **always pill-shaped**.
- `variant`: `default | primary | secondary | success | warning | destructive | outline`
- `size`: `sm | md`
- `dot` (leading coloured dot)
- Use for record states: Approved / Pending / Rejected, categories, counts.

### Tag
Compact chip for filters, multi-select values, country/programme labels. Sharp by default (2px radius only inside cards).
- `variant`: `default | primary | outline | filled | success | warning`
- `size`: `sm | md`
- `dismissible` + `onDismiss`, optional leading `icon`

### Avatar
User thumbnail — image with initials fallback; fallback colour is **deterministic** (hashed from name), so the same person always gets the same tint.
- `src`, `name`, `size`: `xs | sm | md | lg | xl | 2xl`
- `shape`: `circle` (default) | `square`

### Icon
Wrapper around the self-hosted SVG set (or Lucide as fallback — see §3.8).
- `name` (Material-Symbols-style snake_case, e.g. `check_circle`, `arrow_forward`)
- `variant`: `outlined | rounded | sharp`
- `fill` (solid variant), `size` (px, default 20), `color` (default `currentColor`)

### Accordion
Collapsible disclosure. 200ms ease-out expand/collapse.
- `items: { title, content }[]`
- `multiOpen` (bool) — single-open by default

### Table
Mobile-first data table. Keep to 2–3 columns, one data point per cell. Below `stackBelow` (px, container width) it **auto-collapses each row into a labelled stacked card** rather than shrinking text or introducing horizontal scroll.
- `columns: { key, label, width?, align?, render? }[]` — keep labels ≤ ~18 characters
- `data`, `keyField`, `caption` (small uppercase label above table)
- `dense`, `zebra`, `responsive` (set false to force grid, disabling auto-collapse)

### Chart (BarChart / LineChart / PieChart)
SVG-rendered, no chart library dependency. Palette defaults to Night Blue + Electric Blue + neutrals (`--chart-1..5` = primary, accent, muted-foreground, border, muted). Hover tooltips, optional legend.
- Bar/Line: `data`, `series: { key, label, color? }[]`, `xKey`, `width`/`height` (viewBox), `tickCount`, `showLegend`
- Pie: `data`, `nameKey`, `valueKey`, `size` (square canvas), `colors?`

---

## 6. How to brief an LLM to build with this system

When asking another model (or a fresh Claude session without repo access) to produce GCS-branded output, include:

1. This whole file as context (or at minimum §2, §3, §4).
2. The specific deliverable and format (React component, static HTML page, PDF-ready brochure, PPTX slide, etc.).
3. A reminder of the **non-negotiables**: sharp corners (0px radius) everywhere except avatars/badges/pills, Night Blue as dominant colour with Electric Blue as accent only, Yrsa for display headings / Heebo for everything else / JetBrains Mono for IDs and data, UK English + Title Case CTAs, no emoji.
4. If icons are needed and Material Symbols SVGs aren't available in the target environment, ask for Lucide icons at 2px stroke as the nearest compatible substitute.

---

*This file is a portable snapshot generated from the authoritative source in this repository (`readme.md`, `CLAUDE.md`, `tokens/*.css`, `components/core/*.d.ts`, `assets/logos/`). If those files change, regenerate this document rather than hand-editing it out of sync. Real logo files are bundled in this skill's own `assets/logos/` folder (§3.10) so the skill is usable standalone — icons and flags are NOT bundled (too large; 91MB and 6MB respectively in the source repo) — see §3.8/§3.9 for fallback guidance when those aren't available.*
