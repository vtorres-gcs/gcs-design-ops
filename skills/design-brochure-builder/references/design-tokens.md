# Design tokens — design-brochure-builder

Values used by `scripts/tokens.js`.

## Two accents — read before "fixing" one

The free-mode components and the `case-study` / `quarterly-report` templates use
accent **`#3D51E8`** (`COLORS.accent` in `scripts/tokens.js`).

**Factsheet exception.** The factsheet template uses accent **`#3F8CFF`**, the
`#333`-family `--doc-*` greys and `#B3B5CD` lavender, so `components/factsheet.js`
carries its own colour table (`C`) instead of `COLORS.accent`. Don't "unify" the
two accents; if the other templates are ever migrated, change `COLORS.accent` and
drop the split in one step.

## Palette

| Token | Hex | Use |
|---|---|---|
| `nightBlue` | `#000957` | Primary dark background (chrome-free panels, circles, cover gradient base) |
| `accent` | `#3D51E8` | Labels, dividers, final timeline step, highlight tint text |
| `headingInk` | `#16182A` | Yrsa headings on white |
| `bodyInk` | `#4B4E65` | Heebo Light body paragraphs on white |
| `leadInk` | `#252839` | Yrsa lead paragraphs |
| `mutedInk` | `#6F7185` | Secondary/desc text on white |
| `faintInk` | `#9B9CAD` | Header eyebrow, unhighlighted stat-strip-light labels |
| `hairline` | `#E0E2EA` | Chrome header/footer dividers |
| `hairlineTint` | `#ECEDF5` | stat-strip-light grid gaps, timeline line fade target |
| `highlightTint` | `#F2F3FE` | stat-strip-light highlighted tile background |
| `lavender` | `#B3B5CD` | Italic title lines, muted text on Night Blue |
| `white` | `#FFFFFF` | Text/shapes on dark backgrounds |

## White-on-Night-Blue solid hexes (`WHITE_ON_NIGHT_BLUE`)

Design specs express white-on-dark as `rgba(255,255,255,alpha)`. PptxGenJS's
`transparency` option reproduces that — **except** on any run that also sets
`charSpacing`: LibreOffice silently truncates that run (a known LibreOffice pitfall). `tokens.js` pre-blends the common
alphas against `#000957` into solid hex, for use wherever `charSpacing` is
also needed:

| Alpha | Hex |
|---|---|
| 0.10 | `#1A2268` |
| 0.20 | `#333A79` |
| 0.25 | `#404781` |
| 0.40 | `#666B9A` |
| 0.45 | `#7378A3` |
| 0.50 | `#8084AB` |
| 0.55 | `#8C90B3` |
| 0.60 | `#999DBC` |
| 0.65 | `#A6A9C4` |

Use plain `transparency` for any run with **no** `charSpacing` (e.g. the
cta-panel body paragraph).

## Fonts

Yrsa (display/serif) and Heebo (body/sans), self-hosted `.ttf` in
`assets/fonts/`, embedded per-document by `scripts/embed_fonts.py`.

Heebo is used at five distinct weights across the brochure components
(Light 300, Regular 400, Medium 500, SemiBold 600, Bold 700). OOXML's
`<p:embeddedFontLst>` has no weight axis — it only models regular/bold/
italic/boldItalic **per family name**. So each weight is registered as its
own literal family name and every component's `fontFace` must use these
exact strings:

| `fontFace` string | File |
|---|---|
| `Heebo Light` | `Heebo-Light.ttf` |
| `Heebo` | `Heebo-Regular.ttf` |
| `Heebo Medium` | `Heebo-Medium.ttf` |
| `Heebo SemiBold` | `Heebo-SemiBold.ttf` |
| `Heebo Bold` | `Heebo-Bold.ttf` |
| `Yrsa` (+ `italic: true`) | `Yrsa-Regular.ttf` / `Yrsa-Italic.ttf` |

`FONTS` in `tokens.js` maps semantic roles (`heading`, `label`, `body`, ...)
to these exact family strings — always go through that map rather than
typing a `fontFace` literal in a component.

**Never set `bold: true` on a Yrsa run.** Yrsa has no embedded bold face in
this skill (the brochure never uses bold Yrsa) — PowerPoint would fake a
synthetic bold, distorting the serif. Use a different family/weight if a
heading needs more visual weight.
