# Component catalog

Each entry: source HTML this was ported from, the builder function + props,
and anything that changed shape going from CSS to PptxGenJS shapes/text.

Free-mode components (usable directly in any `content.json` page's `blocks`)
plus template-mode-only pieces (`photo-column`, used via a page's
`leftColumn`, not a stack block) are both listed below. See
`scripts/template-registry.js` and `scripts/templates/*.json` for which
`templates/brochures/*` template each one was ported for.

## cover-gcs / cover-giu

`scripts/components/cover.js` — `addCoverGCS(pres, props)` /
`addCoverGIU(pres, props)`. Ported from
`skills/gcs-brochure/assets/covers/cover-{gcs,giu}.dc.html`. Full-bleed
background PNG + bottom-anchored text block (title cascades upward from a
fixed bottom margin — same technique `skills/gcs-pptx` uses for its Title
archetype). Each returns the created `slide` (rarely needed by callers —
`build-brochure.js` doesn't chain a Y cursor off these, they're one-per-page).

GCS props: `eyebrowLabel`, `eyebrow`, `coverTitleLine1`, `coverTitleLine2`, `subtitle`, `flagPngPath?` (factsheet's 42px round country-flag badge, positioned above the title stack — see `scripts/flags.py`; no-op if omitted).
GIU props: `eyebrow`, `coverTitleLine1`, `coverTitleLine2`, `coverSubtitle`.

## back-cover

`scripts/components/back-cover.js` — `addBackCover(pres)`. Ported from
`skills/gcs-brochure/assets/covers/back-cover.html`. Fully static (no props;
country list and contact details are hardcoded to match the source exactly).
The CSS `radial-gradient` background has no PptxGenJS equivalent — pre-baked
once into `assets/covers/background-back-cover.png` by `scripts/gen-assets.py`.

## narrative

`scripts/components/narrative.js` — `addNarrative(slide, pres, props, y)`
(takes `pres` since the `subSectionDividers` option below draws a divider
shape). Ported from `narrative.html`. Props: `sectionLabel?`, `heading?`
(both omit their reserved space entirely if falsy — factsheet's 4 mini-sections
use neither), `leadPara?`, `body?: string[]` (1-3 paragraphs),
`subSections?: {heading, body}[]`, `subSectionDividers?` (hairline between
subsections — factsheet only; quarterly-report's 3 sections have none in
source), `subHeadingStyle?: {size?, uppercase?, charSpacing?}` (factsheet's
mini-headings are smaller/uppercase/charspaced vs quarterly-report's plain
10.5pt default). Paragraph heights are estimated via `estimate-text-height.js`
— always approximate, confirm with the QA render; the `subSections` body
estimate carries a 1.2x calibration factor (see the component's own comment)
after the shared heuristic under-shot LibreOffice's real line pitch for long
paragraphs.

## stat-strip-dark

`scripts/components/stat-strip-dark.js` — `addStatStripDark(slide, pres, stats, y, layout, opts)`.
Ported from `stat-strip-dark.html`. `stats`: 2-4 `{value, label}` entries (plus
`desc?` for the `eyebrow` variant below). Tile height grows past the 1.0in
floor if a label's estimated wrap exceeds one line (a real bug hit during
development — a 4-tile strip with a long label overflowed the dark rectangle
before this fix; see the component's own comments). `opts.variant: 'eyebrow'`
switches to factsheet's 3-line tile (small accent eyebrow label above the
value, muted desc line below) — omit `opts` for the legacy 2-line
value-then-label tiles (case-study/lead-magnet/giu-corporate, unchanged).

## stat-strip-light

`scripts/components/stat-strip-light.js` — `addStatStripLight(slide, pres, tiles, y)`.
Ported from `stat-strip-light.html`. `tiles`: up to 3 `{label, value, desc, highlight?}`.
Only a single row of 3 is supported in v1 (the source supports a 2-row/6-tile
variant — not ported).

## hero-image

`scripts/components/hero-image.js` — `addHeroImage(slide, pres, props, y)`.
Ported from `hero-image.html`. Props: `imageSrc` (empty string → solid Night
Blue fallback, matching the source's fallback variant), `sectionLabel?`,
`imageTitle?`, `heightIn?` (default 4.375in/420px; factsheet's blank
placeholder band is 1.75in/168px). Omitting both `sectionLabel` and
`imageTitle` skips the scrim + text entirely, for a plain blank band
(factsheet's country-hero placeholder — no real photo ships with this demo).
The CSS gradient overlay (when a label/title is present) is approximated with
a flat semi-transparent Night Blue scrim across the bottom third — PptxGenJS
shapes have no gradient fill over a placed image.

## timeline

`scripts/components/timeline.js` — `addTimeline(slide, pres, props, y)`.
Ported from `timeline.html`. Props: `heading`, `subtitle?`,
`steps: {title, duration, desc}[]`. Last step's circle uses the accent color
(matches source). The connecting line's CSS gradient (`accent → hairlineTint`)
is approximated with discrete solid segments interpolated per step-gap
(`lerpHex()` in the component) — there is no gradient fill on PptxGenJS shapes.

## cta-panel

`scripts/components/cta-panel.js` — `addCtaPanel(slide, pres, props, y)`.
Ported from `cta-panel.html`. Props: `ctaLine1`, `ctaLine2` (rendered
italic/lavender), `ctaBody`, `ctaEmail?`, `results?: {value, label}[]` (up to
3 — omit for a pure CTA with no outcome strip).

## flag-badge

`scripts/components/flag-badge.js` — `addFlagBadge(slide, pres, props)`. New
(no direct HTML source — the circular flag-badge pattern from
`templates/brochures/factsheet/Factsheet.dc.html`'s cover). Props:
`flagPngPath` (from `scripts/flags.py`'s `get_flag_png()`), `x`, `y`, `size?`
(default 42px), `ringColor?`. Also usable as a `content.json` block
(`{type: 'flag-badge', flagIso2: '<code>'}` — resolved to `flagPngPath` by
`scripts/prepare-assets.py` before the Node build runs).

## photo-column

`scripts/components/photo-column.js` — `addPhotoColumn(slide, pres, props, x, y, w, h)`.
Ported from `templates/brochures/case-study/CaseStudy.dc.html`'s "Page 2"
left rail. Fixed-width (280px default) full-height column: a photo (or a
Night Blue placeholder + "CLIENT PHOTO" label) with a Night Blue overlay
panel at the bottom holding `name`, `profile?`, and up to 3 `tags`. Not a
stack block — used via a `content-2col` page's `leftColumn` (see
`scripts/build-brochure.js`'s `buildTwoColumnPage()`), since it doesn't fit
the single-column vertical-stack model every other page uses. Overlay height
and name/profile line heights are computed via `estimate-text-height.js` so
longer names/profiles don't get clipped.

## key-facts-strip

`scripts/components/key-facts-strip.js` — `addKeyFactsStrip(slide, pres, facts, y, layout)`.
Ported from case-study's "Key facts strip". Light card, up to 3 columns
divided by a hairline `border-right` (not separate tiles/gaps like
`stat-strip-light`), each `{label, value}`. Card height grows if a value
wraps to 2 lines in a narrow column.

## step-list

`scripts/components/step-list.js` — `addStepList(slide, pres, props, y, layout)`.
Ported from case-study's "What We Did" section. Numbered rows (28px filled
circle badge — distinct from `timeline.js`'s 40px circle + gradient
connector), each `{title, desc}`, separated by hairline `border-top`
dividers; last circle is accent-colored. Also the base for giu-corporate's
milestones page once that's ported (adds a status-pill column — not yet
built).

## pull-quote

`scripts/components/pull-quote.js` — `addPullQuote(slide, pres, props, y, layout)`.
One component covering the 3 visual presets confirmed across
`templates/brochures/*`: case-study/lead-magnet (tinted card, no photo,
`tint` + `borderColor` props) and quarterly-report (plain hairline border,
72px circular real photo via `photoSrc`, no tint). Props: `quoteText`,
`attribution`, `photoSrc?`, `tint?`, `borderColor?` (defaults to
`COLORS.accent`). Also covers what was speculatively listed as a separate
`bio-card` component — quarterly-report's CEO quote+photo block needs nothing
beyond this component's existing `photoSrc` variant; `bio-card` was dropped
from the "not yet ported" list below with no new code required.

## article-list

`scripts/components/article-list.js` — `addArticleList(slide, pres, props, y, layout)`.
Ported from `templates/brochures/quarterly-report/QuarterlyReport.dc.html`'s
"About this Report" page. Props: `articles: {title, excerpt, url?}[]` (up to
5). The source's diagonal-stripe placeholder-thumbnail pattern has no
PptxGenJS shape equivalent — approximated as a flat tinted rectangle with a
small "ARTICLE IMAGE" caption. Hairline dividers between rows, plus one above
the first and below the last.

## investment-panel

`scripts/components/investment-panel.js` — `addInvestmentPanel(slide, pres, props, y, layout)`.
Ported from `templates/brochures/factsheet/Factsheet.dc.html`'s right-column
sidebar. Props: `heading?` (default "Investment Options"), `rows: {title,
subtitle?, amount}[]` (up to 4). Bordered card, hairline divider between rows;
the amount column is sized to its longest actual value (source: `flex-shrink:
0`) rather than a fixed reservation, to leave more room for title/subtitle in
this 232px-wide sidebar. Row height estimates carry a 1.2x calibration factor
(see benefits-panel's note below — same shared-heuristic gap).

## benefits-panel

`scripts/components/benefits-panel.js` — `addBenefitsPanel(slide, pres, props, y, layout)`.
Ported from the same factsheet sidebar. Props: `heading?` (default "Key
Benefits"), `rows: {text, iconPngPath?}[]` (up to 4) — icons are declared via
a `"icon": {"name": ...}` field in the block's JSON (see SKILL.md "Icons") and
resolved to `iconPngPath` by `scripts/prepare-assets.py`, matching the pattern
`flag-badge` already uses. Row-height estimates carry a 1.2x calibration
factor: the shared `estimate-text-height.js` heuristic under-shot LibreOffice's
actual line pitch at this narrow (~1.4-1.8in) column width during the QA
render (confirmed by text overlapping the next row's divider before the fix)
— the same gap `narrative.js`'s `subSections` hit at a different width/size.

## Not yet ported — refuse and redirect

`table-ranking`, `toc`, `month-grid`, `data-table`, `chart-line`,
`sidebar-cards`.
`scripts/build-brochure.js` throws a clear error naming the supported set if a
page map references one of these. Point the user at `skills/gcs-brochure`
(PDF output) for content that needs them, rather than attempting a partial or
silent workaround. See `scripts/templates/*.json`'s `newComponentsNeeded` for
which unported component blocks which unported template. `table-ranking` and
`sidebar-cards` don't appear in any of the five still-unported templates'
real structure (confirmed against their source `.dc.html` files) — likely
dead entries from an earlier draft; flagged for removal rather than removed
outright, in case a future template needs them.
