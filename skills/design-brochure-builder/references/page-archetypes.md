# Page geometry — A4 portrait

## Canvas

`pres.defineLayout({ name: 'A4_PORTRAIT', width: 8.27, height: 11.69 })` —
210mm × 297mm exact, portrait. This is the same physical page size as
`skills/gcs-brochure`'s output (794×1123px @ 96dpi), so every px measurement
in that skill's `references/components.md` converts via a single constant:
**1px = 0.010417in** (`PX()` in `scripts/tokens.js`). No re-derivation needed
— the two canvases share the same 96dpi authoring basis.

## Chrome (every content page)

| Zone | y | height | x | width |
|---|---|---|---|---|
| Header | 0 | 0.583in (56px) | margin | page width − 2×margin |
| Footer | 11.232in | 0.458in (44px) | margin | page width − 2×margin |
| Content area top | 0.583in + `CONTENT_TOP_PAD` (0.542in/52px) — except `hero-image`-first pages, which start flush at 0.583in | up to 10.649in | margin | page width − 2×margin |

`margin` is resolved by `getContentMetrics({template, brand})` in
`scripts/tokens.js` — it is **the same value for chrome and body content**,
so they can never drift apart. In template mode it's looked up per template
in `TEMPLATE_MARGIN_PX` (64px for `case-study`/`quarterly-report`/
`giu-corporate`-style pages, 56px for `factsheet`/`giu-calendar`/
`lead-magnet`-style pages — this is a per-template property, not a
GCS/GIU-brand one, confirmed against each template's own header/body
padding). In free mode (no `template` set) it falls back to the fixed
`MARGIN_X` (64px), or 56px for `brand: 'giu'`.

`CONTENT_TOP_PAD` fixes a real bug: earlier, every component (except
`hero-image`, which is meant to sit flush under the header) started drawing
at the exact same y as the header's own bottom hairline, so headings/labels
rendered flush against or overlapping the header divider. See
`scripts/build-brochure.js`'s `FLUSH_FIRST_BLOCK_TYPES`.

## Layout models

### Vertical stack (default — most pages)

`skills/gcs-pptx` (16:9, 13.33in wide) uses side-by-side "Zone A / Zone B"
composition because its canvas is wide. This skill's canvas is narrower and
most components are full-width, so most pages use a single accumulating Y
cursor:

```
addPageChrome(slide, pres, {...})
let y = CONTENT_Y + CONTENT_TOP_PAD  // flush (no +CONTENT_TOP_PAD) if the first block is hero-image
y = addNarrative(slide, props, y, layout)
y = addStatStripDark(slide, pres, stats, y, layout)
// ...append more blocks, cursor accumulates downward
```

Each `addX()` component function returns the new Y cursor including its own
bottom margin, ready to hand to the next component. Never hardcode a second
component's `y` independently of the first's return value, or margins
between them silently collapse or double up (see the back-cover overlap bug
this exact mistake caused during development, fixed by switching to top-down
cursor accumulation throughout).

### Two-column (`content-2col` — case-study's client-profile page)

Not every page fits a single full-width stack. `case-study`'s page 2 pairs a
fixed-width left rail (`photo-column`, 280px, flush top-to-bottom against
header/footer with no side margin) with an independent block stack in the
remaining right column (its own `marginX`/`contentW`, offset past the left
rail). See `scripts/build-brochure.js`'s `buildTwoColumnPage()` and
`LEFT_COLUMN_BUILDERS`. This is a second, narrower composition model, not a
replacement for the vertical stack — most pages, and the right column of a
`content-2col` page, still use it internally.

A genuine 2D grid (e.g. `giu-calendar`'s 12-month grid, not yet ported) is a
third model neither of the above covers — budget it as its own page builder
when that template is ported, rather than forcing it into either cursor
model above.

### Dual independent stacks (`content-2col-stack` — factsheet's page 2)

A fourth model: an optional full-width `topBlocks` stack (factsheet's blank
hero placeholder + 3-tile `stat-strip-dark` band), followed by a two-column
split where **both** columns run their own independent block stack — unlike
`content-2col`, whose left rail is a single fixed-geometry component
(`photo-column`), here the left column is a plain `narrative` stack and the
right column is two stacked sidebar panels (`investment-panel` +
`benefits-panel`). See `scripts/build-brochure.js`'s `buildDualStackPage()`.
Both columns start from the same Y cursor (after `topBlocks` finishes) but
accumulate independently — a taller left column doesn't push the right
column down, and vice versa.

Because the right column is narrow (232px) and holds real running copy
(titles, subtitles, benefit sentences), it is the tightest layout in the
skill so far — keep sidebar row copy short (a subtitle or benefit line that
clearly wraps to 3+ lines is a strong signal to trim it, per the page-map
height check in SKILL.md step 3).

## Height budget

| Block | Height (in) | Notes |
|---|---|---|
| Cover / back-cover | fixed, full-page | own function, not stacked |
| `hero-image` | 4.375 (fixed) | 420px, does not vary with content |
| `stat-strip-dark` | 1.0 min, grows if a label wraps | see `stat-strip-dark.js` |
| `stat-strip-light` | 1.25 (fixed, per row of 3) | |
| `cta-panel` | ~3.3–4.4, body-dependent | + strip if `results` present |
| `narrative` | heading ~0.9in + ~0.9–1.1in per paragraph | lead para adds ~0.5in |
| `timeline` | header ~1.1in + ~0.5–0.7in per step | last-step circle is accent color |
| `key-facts-strip` | ~0.9in, grows if a value wraps | up to 3 facts |
| `step-list` | ~0.6–0.9in per step | no header row cost beyond the optional `heading` |
| `pull-quote` | ~0.9–1.3in, quote-length dependent | +0 if `photoSrc` (72px fits within typical quote height) |
| `article-list` | ~1.1–1.5in per row | up to 5 rows; thumbnail is a fixed 0.833in floor |
| `investment-panel` | ~0.6–1in per row + ~0.3in card overhead | up to 4 rows; amount column sized to its longest value |
| `benefits-panel` | ~0.5–0.9in per row + ~0.3in card overhead | up to 4 rows; icon is a fixed 0.167in floor |
| `photo-column` (content-2col left rail) | fixed to the column's full height | not stacked — see "Two-column" below |

`scripts/build-brochure.js` sums the actual drawn Y cursor per page and warns
to stderr if it exceeds the 10.649in content budget — **after** drawing (see
"No automatic text reflow" in SKILL.md), so treat the warning as a signal to
revise the page map and rebuild, not as a hard pre-check.
