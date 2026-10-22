---
name: design-brochure-builder
description: Generate a GCS/GIU brochure as an EDITABLE .pptx file, A4 portrait (210x297mm), from an approved page map, via PptxGenJS. Self-contained (fonts, logos, covers, icons, flags all ship in the skill). Asks up front whether to build from one of six fixed templates (case-study, quarterly-report, factsheet — implemented; giu-calendar, giu-corporate, lead-magnet — fail loudly naming what's missing) or free-form from the component palette (narrative, stat-strip-dark, stat-strip-light, hero-image, timeline, cta-panel, key-facts-strip, step-list, pull-quote, flag-badge, article-list, investment-panel, benefits-panel). Icons are Material Symbols only (fetched from google/material-design-icons, sanitized, rasterized, embedded); flags come only from the msikma/country-flags set vendored in assets/flags/ and are never AI-generated. Use when the user wants an editable/PowerPoint brochure.
allowed-tools: Bash, Read, Write, Glob
---

# Brochure Builder

Generates a GCS/GIU brochure as an **editable `.pptx`** (A4 portrait). The skill
is **self-contained**: everything it reads — fonts, logos, covers, brand marks,
cached icons, the flag set, scripts — lives in this directory. The only outside
calls are fetching a *new* Material Symbols icon from
`google/material-design-icons` the first time it is used (then cached), and the
optional `scripts/update-flags.py`. It depends on no other skill or repository.
Setup: `SETUP.md`.

**Editable vs. print-locked:** the user gets a file anyone can open and edit in
PowerPoint, not a pixel-fixed print PDF. If the request doesn't specify the
format, ask; don't assume a PPTX is a drop-in replacement for a PDF.

**Scope:** cover (GCS or GIU) + back-cover + free-mode content components:
`narrative`, `stat-strip-dark`, `stat-strip-light`, `hero-image`, `timeline`,
`cta-panel`, `key-facts-strip`, `step-list`, `pull-quote`, `flag-badge`,
`article-list`, `investment-panel`, `benefits-panel` (`photo-column` too, but
only via a `content-2col` page's `leftColumn`, not as a stack block). Plus
**template mode**: `scripts/template-registry.js` knows all six
fixed layouts (`case-study`, `quarterly-report`,
`factsheet`, `giu-calendar`, `giu-corporate`, `lead-magnet` — see step 1b);
**`case-study`, `quarterly-report` and `factsheet` are implemented** today;
the other three are documented (`scripts/templates/<name>.json` lists their
pages and the new components they still need) and fail loudly with a clear
"not yet implemented" message naming what's missing, rather than silently falling
back to free mode. See `references/components.md` for the full component
catalog and what's still **not** built. If the user's content needs an
unimplemented template/component, say so explicitly and offer free mode
instead of silently dropping or approximating that section.

**Country flags** come only from the vendored msikma/country-flags set in
`assets/flags/` (see "Flags" below). `factsheet` takes `flagIso2` (round 44px
badge beside the page-2 title); free-mode `flag-badge`/`flagIso2` use the same
resolver. A code the set lacks raises `MissingAsset` — never substitute a
placeholder; ask the user.

**Factsheet is a fixed-layout template.** `factsheet` is not assembled from the
free-mode components: `scripts/components/factsheet.js` lays out three fixed
pages (cover / key facts, investment options & procedure / "Our Global
Presence") from absolute pixel geometry on a 794×1123 canvas. See "Factsheet
template" below.

## Workflow

### 1. Ingest content

Accept DOCX/Markdown/plain text/HTML/pasted chat
text. Extract sections, stats, steps, and any images the user provides.
User-supplied copy is final — never paraphrase, reorder, correct, omit, or
add to it.

### 1b. Template or free mode — mandatory question

Ask the user: should this be built from one of the six fixed brochure
templates (`case-study`, `quarterly-report`, `factsheet`, `giu-calendar`,
`giu-corporate`, `lead-magnet` — see `scripts/templates/*.json`), using
that template's exact page count, component sequence, and prop schema? Or as
a free-form page map from the component palette (today's ad-hoc flow)?

If the user names a template, or the content obviously maps to one (e.g. "a
factsheet for Italy", "our quarterly investor report"), confirm **template
mode**:
- Brand is implied by the template (`case-study`/`quarterly-report`/
  `factsheet` are GCS; `giu-calendar`/`giu-corporate`/`lead-magnet` are GIU)
  — still confirm it.
- Confirm any per-template swap points the template documents (country/flag,
  client name/photo — e.g. `factsheet` swaps the `<iso2>` flag from `assets/flags/atlas.png` per
  country, which is the `flagIso2` prop; its cover photo is the fixed
  `background-cover` image).
- The page map (step 3) is then **already fixed** by
  `scripts/templates/<name>.json` — the only remaining freedom is prop
  content (verbatim copy) and swap selections, never invented page structure.
- Generation uses `scripts/build-from-template.js <template> props.json
  output.pptx` instead of step 4's `build-brochure.js` call directly (it
  calls the same renderer internally — see `scripts/template-registry.js`).

If the user has no preference and the content doesn't obviously name a
template, don't silently default to free mode — compare the ingested
content's shape (section count, presence of tables/charts/timelines/stats,
target length) against each **implemented** template's fixed page map, and
propose the best fit explicitly: "this looks closest to `lead-magnet`'s shape
because it has a stat band, a table, and a timeline — want me to use that
template, or build free-form instead?" Only fall back to free mode if no
implemented template fits reasonably, or the user declines the suggestion.

Otherwise, **free mode**: continue with the ad-hoc page-map + `content.json`
flow below (steps 2-4), which remains the only path for content that doesn't
match any of the six templates.

### 2. Choose brand

GCS or GIU (Global Intelligence Unit sub-brand). In template mode this is implied by the chosen template
(confirm it); in free mode it changes the cover and chrome/content side
margin (64px for `case-study`/`quarterly-report`/`giu-corporate`-style pages,
56px for `factsheet`/`giu-calendar`/`lead-magnet`-style pages — see
`scripts/tokens.js`'s `TEMPLATE_MARGIN_PX`/`getContentMetrics()`) and header
logo lockup (`GCS-Secondary-Blue` vs `GCS-Symbol-Blue` +
`GIU-Wordmark-Blue`). Content components themselves are brand-agnostic.

### 3. Page map — mandatory, wait for approval

In **template mode**, the page map is already fully determined by
`scripts/templates/<name>.json` — present it as "Template: lead-magnet (8
pages) → [Cover, TOC, Introduction+stat-band, ...]" with the user's actual
copy filled into each prop slot. Still require explicit approval; the only
open questions are prop content and swap selections (§1b).

In **free mode**, present a page map: one bullet per output page, naming the
cover variant and, for each content page, the ordered list of components
with their prop values. **Wait for explicit user approval before generating
anything.**

For each content page, sum the components' estimated heights (see
`references/page-archetypes.md`'s height-budget table) and flag any page
that looks tight against the 10.649in content budget **in the page map
itself**, before generation — this is cheaper than discovering it after a
render.

### 4. Build content.json and generate

**Free mode:** translate the approved page map into the `content.json` shape
documented at the top of `scripts/build-brochure.js` (see
`examples/lead-magnet-example.json` and `examples/giu-example.json` for
worked examples covering every free-mode component). Then:

```bash
# run from this skill's directory
python3 scripts/prepare-assets.py content.json   # resolves any flag/icon refs to PNG paths, in place
node scripts/build-brochure.js content.json output.pptx
```

**Template mode:** fill the template's `propsSchema` (from
`scripts/templates/<name>.json`) with the approved copy/swaps into a
`props.json`, then:

```bash
# run from this skill's directory
node scripts/build-from-template.js <template-name> props.json output.pptx
```

This writes a scratch `content.json` to the OS temp dir (deleted afterwards; `KEEP_SCRATCH=1` keeps it) (via `template-registry.js`'s
`mapPropsToBlocks()`) and calls the same renderer — `prepare-assets.py` runs
automatically as part of this step for any `flagIso2`/`icon` fields in the
props.

`case-study` and `quarterly-report` throw if a required prop is missing or empty
(same as `factsheet`); fixed optional slots left blank only warn. Nothing is filled in.

An unsupported block type fails loudly with a message naming the supported
set — don't catch and skip it silently.

### 5. Embed fonts (mandatory)

```bash
python3 scripts/embed_fonts.py output.pptx
```

Without this, Yrsa/Heebo are only referenced by name — Google Slides and
LibreOffice substitute their own copies (Google Fonts), so it looks fine
there, but PowerPoint desktop has none of them installed and silently
substitutes a different font. Confirm it worked:

```bash
unzip -p output.pptx ppt/presentation.xml | grep embedTrueTypeFonts
```

### 6. QA render — mandatory, inspect every page

```bash
soffice --headless --convert-to pdf --outdir /tmp output.pptx
pdftoppm -jpeg -r 100 /tmp/output.pdf /tmp/page
```

Read every `/tmp/page-N.jpg` and check, per page (in template mode, compare against
`references/templates/<template>/preview-NN.png`):
- No text clipped by or overflowing its component's box (see "No automatic
  text reflow" below — this is the most likely defect class)
- stat-strip-dark/light labels not truncated or overlapping neighboring tiles
- hero-image scrim gives the burned-in title/label enough contrast
- timeline circles align with their connecting-line segments; last circle is
  accent-colored
- Chrome header/footer present and not overlapping content — the first
  content block on the page has visible clearance below the header hairline
  (`CONTENT_TOP_PAD`), except `hero-image` pages, which stay flush
- Cover/back-cover text fully within the safe area, no overlap with the
  logo or contact row

If anything overflows or overlaps, fix the content (shorten copy, split
across two pages) or the component, then rebuild from step 4 — never patch
the generated `.pptx` by hand.

## Known limitations (by design — don't try to "fix" these away)

**Sizes are pt, line heights are exact.** Template CSS is in px: convert to pt (×0.75)
before passing `fontSize` (a 64px title is 48pt). Never use `lineSpacingMultiple` —
it multiplies the font's natural line height (Heebo 1.47em), not the font size like
CSS `line-height`, so 1.85 renders ~2.7em and the estimators under-shoot. Use
`lh(sizePt, cssMultiple)` from `scripts/tokens.js` (exact points). Footer page numbers
default to the physical page (cover = 1); overflow warnings use the same number.

**No automatic text reflow.** PptxGenJS text boxes don't reflow or report
overflow.
`scripts/estimate-text-height.js` word-wraps with measured glyph advances
(`text-metrics.js`) for the bundled fonts and is used throughout the components to size
boxes and advance the Y cursor, but it's an approximation — always confirm with the QA render in step 6, not the
estimate alone. `scripts/build-brochure.js` warns to stderr if a page's
accumulated Y cursor exceeds the content budget, but that check runs
**after** the shapes are already added to the in-memory slide — it's a
signal to revise and rebuild, not a true pre-generation guard.

**No native gradients.** Every CSS `linear-gradient`/`radial-gradient` in the
source HTML (hero-image overlay, timeline connector line, back-cover
background) has no PptxGenJS shape/image-overlay equivalent. Each is
approximated per-component (see `references/components.md`) — a flat scrim,
discrete interpolated segments, or a pre-rendered PNG. Don't try to
special-case a real gradient in; it isn't supported by the renderer.

**Font weights are "fake" families.** OOXML's embedded-font list has no
weight axis, so `Heebo Light`/`Heebo Medium`/`Heebo SemiBold`/`Heebo Bold`
are each registered as their own literal family name in
`scripts/embed_fonts.py`, not as styles of one "Heebo" family. This works
reliably as long as every component sources `fontFace` from
`scripts/tokens.js`'s `FONTS` map — never type a raw `fontFace: 'Heebo'`
string with an intended weight in mind.

**`charSpacing` + `transparency` on the same run truncates in LibreOffice.**
Known LibreOffice pitfall. Use the pre-blended solid hexes in
`WHITE_ON_NIGHT_BLUE` (`scripts/tokens.js`) instead of `rgba(255,255,255,a)` +
`transparency` wherever the run also needs `charSpacing`.

**SVG logos don't render via PptxGenJS in Node.** `addImage()` with an
`.svg` path works in a browser context but resolves to a broken-image
placeholder when pptxgenjs runs under Node (confirmed while building this
skill — see `pptxgenjs` GitHub issue #401). All logos, brand marks and the map pin
are pre-rasterized to PNG (`scripts/gen-assets.py` / `scripts/icons.py`, via `cairosvg`) for
exactly this reason — always add new brand marks as rasterized PNGs, not by
pointing `addImage` at the `.svg` source.

### Icons

**Single source: Material Symbols** from the `google/material-design-icons` repo.
No icon font, no Font Awesome / Lucide / Heroicons / Feather, no emoji, no
invented SVG. No icon SVGs are bundled: `scripts/icons.py` fetches
the exact glyph from `raw.githubusercontent.com` on demand (never `WebFetch`,
which mangles markup), validates it, rasterizes it to PNG and caches the PNG
(plus the raw SVG, so rebuilds work offline) under `assets/icons/_generated/`.
The deliverable embeds the downloaded icon — nothing is fetched when the file
is opened, so it works offline. The PNG step is required because
PptxGenJS under Node cannot embed live SVG.

Props and validation:

- `name` — Material Symbols snake_case name, must match
  `^[a-z0-9]+(?:_[a-z0-9]+)*$` (invalid names raise before any network call).
- `variant` — `outlined` (default), `rounded` or `sharp`.
- `fill` — `true` for the filled glyph (`{name}_fill1_24px.svg`).
- `color` — `#RRGGBB`. The SVG is normalized to `fill="currentColor"`, then
  `currentColor` is resolved to this color for the raster.
- `size` — raster edge in px. The on-slide display size follows the 14, 16, 20
  or 24px scale; rasterize at 4x or more for print (e.g. 24px slot → 96).
- **Sanitization:** the response must be one complete `<svg>…</svg>`; anything
  containing `script`, `foreignObject`, `iframe`, `object`, `embed`, `image`,
  `style`, an `on*` handler, `href`/`src` or `url(...)` is rejected
  (`InvalidIcon`) and never cached or embedded.

Declare an icon in a `content.json`/`props.json` block via
`"icon": {"name": ..., "variant": ..., "fill": ..., "color": ..., "size": ...}`;
`scripts/prepare-assets.py` resolves it to `iconPngPath` before
`build-brochure.js` runs. (Legacy keys `style`/`filled`/`fillHex` are still read.)
One-off from the shell:

```bash
python3 scripts/icons.py account_balance --variant outlined --color '#3F8CFF' --size 96
python3 scripts/icons.py location_on --fill --color '#FFFFFF' --size 96
```

If a name 404s, check it at fonts.google.com/icons or ask the user — never fall
back to another library. The back-cover/factsheet map pin is `location_on`
(filled, white), generated by `scripts/gen-assets.py` like any other icon.

**Exception — brand marks.** LinkedIn, Facebook, Instagram and YouTube are the
brand's own multi-colour SVGs, kept in `assets/icons/social/*.svg`. They are not
Material Symbols, are never recolored and never use `currentColor`; they enter
the slide as plain images (`assets/icons/social/{name}.png`, one fixed 22px slot,
generated by `scripts/gen-assets.py` / `icons.get_social_icon_png()`). Don't swap
them for generic glyphs.

### Flags

Flags come **only** from `github.com/msikma/country-flags`, vendored inside this
skill as one sprite atlas, `assets/flags/atlas.png` (218 flags, each center-cropped to a 256px square), plus `atlas.json` (code → name/cell),
the upstream MIT licence and `SOURCE.txt` (upstream commit). Rules:

- **Never** flagcdn, Wikipedia, another flag set, a CDN, a hand-drawn flag or an
  image model. Resolution is local only (`scripts/flags.py`).
- The UK is `uk` in that repo; `gb` is accepted as an alias.
- The repo doesn't cover some codes (e.g. `xk`, `gb-sct`, `gb-eng`, `gb-wls`,
  `gb-nir`, `pr`, `gu`, `gi`, `re`, `yt` and other overseas territories).
  Those raise `MissingAsset`. Never substitute a placeholder, a lookalike or a
  different source — tell the user the code isn't available.
- **AI-generated images must not contain flags** (avoids political symbolism).
  When imagery is generated for a cover/hero, strip flags from the prompt; any flag
  on the page comes from `assets/flags/` as a badge.
- `flags.py` center-crops the PNG to a square; the circular crop is done by
  PptxGenJS `addImage({rounding: true})`.
- To refresh the vendored set from upstream: `python3 scripts/update-flags.py`.

Declare a flag in `content.json`/`props.json` via `"flagIso2": "<code>"`
(optionally `"flagSize"`); `scripts/prepare-assets.py` resolves it to
`flagPngPath` before `build-brochure.js` runs.

### Factsheet template

`node scripts/build-from-template.js factsheet props.json out.pptx` — props are
flat keys (`examples/factsheet-props.json` is a worked example including
`flagIso2`; the full list with notes is `scripts/templates/factsheet.json`). Output, 3 pages, matching the
template:

1. **Cover** — full-bleed photo, white GCS symbol, bottom-anchored block: 74px
   Yrsa title (`coverTitleLine1` upright + `coverTitleLine2` italic on one
   line), 28px `subtitle`, 16px `supportText` (490px max width).
2. **Factsheet** — header (`country` eyebrow + the `GCS-Secondary-Blue` logo asset), round flag + 46px title + subtitle, four dark key-figure tiles
   (`fig1..4`), **Overview** (left) beside six **Key Benefits** icon cards
   (2×3), four **Investment Options** cards, six-column **Application
   Procedure**, footer. The six benefit icons are fixed by the template
   (`travel_explore, badge, family_restroom, work, savings, public`,
   Material Symbols outlined, accent `#3F8CFF`) — they are not props.
3. **Back cover** — static "Our Global Presence." copy, London address
   (8–10 Hill Street), socials (clickable).

Rules specific to this template:
- Every prop the template renders is required; the mapper throws listing any
  missing key instead of falling back to the template's Italy defaults (copy is
  never invented). `year` and `accentColor1-3` are accepted but never rendered; they're ignored.
- Accent is `#3F8CFF` here, not the `#3D51E8` the other templates use — see `references/design-tokens.md`.
- **Overview limit:** the Overview box holds 18 lines — about 560–600 characters as
  three short paragraphs (a blank line between paragraphs costs a line). The mapper
  throws, with the line/char count and how much to cut, above that, because a longer
  text would grow the box and push every section below it down. The template's own
  4-paragraph demo copy (719 chars, 19 lines) is over the limit.
- The template clamps each Key Benefit description to 2 lines. The builder warns
  if one wraps to 3+; shorten the copy rather than letting it overflow its card.
- Cards/boxes grow like a CSS grid does (Overview stretches to the taller of
  Overview/Key Benefits; investment cards stretch to the tallest). If page 2's
  content would run past the footer, the build prints `WARNING (factsheet): …` —
  trim copy, don't patch the `.pptx`.

### Adjusting the factsheet layout

Fidelity depends on the numbers in `scripts/components/factsheet.js` (positions,
sizes, spacing on a 794×1123 px canvas). The design intent is the saved
`references/templates/factsheet/Factsheet.dc.html` (+ `preview-NN.png`). To change the
layout, edit those constants, rebuild with `examples/factsheet-props.json`, then render (step 6) and
inspect every page. Colours come from the `C` table in that file — don't invent
new ones.

**QA renderer font weights.** LibreOffice on macOS resolves `Heebo Light` /
`Heebo Medium` / `Heebo SemiBold` against whatever Heebo is installed system-wide
(it can fall back to Thin/Regular), so body copy in the QA render may look paler
or lighter than PowerPoint with the embedded fonts. Judge layout and overflow in
step 6, not stroke weight.

**Editable means editable.** A delivered `.pptx` can be rearranged, resized,
or restyled by anyone in PowerPoint. This is the point of the skill, not a
defect; set that expectation with the user if they assumed a print-locked
deliverable.

## Reference files

- `references/design-tokens.md` — color/font values, the two accent colours
  (`#3D51E8` vs the factsheet's `#3F8CFF`), and the exact font-family strings.
- `references/page-archetypes.md` — A4 canvas geometry, chrome zones, the
  composition models (free-mode vertical stack + template-mode registry),
  and the height budget table.
- `references/templates/` — frozen HTML sources of the six templates plus a
  `preview-NN.png` per page (visual target for QA; reference for porting
  `giu-calendar`, `giu-corporate`, `lead-magnet` and re-measuring the factsheet).
  Not used at runtime; the HTML isn't renderable from there (it expects a
  stylesheet bundle that isn't shipped) — use the PNGs. See its `README.md`.
- `references/components.md` — full component catalog: props and what is
  approximated going from CSS-style layout to PptxGenJS shapes.

## Files

- `scripts/tokens.js` — shared color/font/geometry constants, including
  `CONTENT_TOP_PAD` and per-template margins (`TEMPLATE_MARGIN_PX`,
  `getContentMetrics()`).
- `scripts/estimate-text-height.js` — word-wrap height/width heuristic.
- `scripts/components/*.js` — one module per component (see
  `references/components.md`), including `flag-badge.js`. `factsheet.js` is the
  exception: three whole-page builders for the fixed factsheet template.
- `scripts/text-metrics.js` + `assets/font-metrics.json`
  (`scripts/gen-font-metrics.py`) — measured word-wrap (real glyph advances) used
  by `factsheet.js` to size cards from their copy; more exact than
  `estimate-text-height.js`.
- `scripts/build-brochure.js` — CLI orchestrator; reads `content.json`,
  writes the `.pptx`. Template-agnostic — template mode only ever hands it
  the same `content.json` shape free mode does.
- `scripts/icons.py` — Material Symbols fetch/validate/sanitize/rasterize/cache
  pipeline + brand-mark (`assets/icons/social/`) rasterizer (see "Icons" above).
- `scripts/flags.py` — local flag resolution from the `assets/flags/` atlas; `scripts/update-flags.py` refreshes that set from msikma/country-flags (see "Flags" above).
- `scripts/prepare-assets.py` — pre-pass: resolves every `flagIso2`/`icon`
  reference in a `content.json` to a real PNG path before the Node build
  runs.
- `scripts/template-registry.js` + `scripts/templates/*.json` — the six
  fixed-template registries (page/component sequence + prop schema) and the
  `mapPropsToBlocks()` translation into a plain `content.json`.
- `scripts/build-from-template.js` — CLI orchestrator for template mode;
  wraps `prepare-assets.py` + `template-registry.js` + `build-brochure.js`.
- `scripts/embed_fonts.py` — embeds the TTFs into the `.pptx`; see its header
  comment for the per-weight family fix and a namespace-serialization fix (see
  SETUP.md troubleshooting).
- `scripts/gen-assets.py` — one-off generator for
  `assets/covers/background-back-cover.png`, `assets/icons/pin.png` (Material
  Symbols `location_on`) and `assets/icons/social/{linkedin,facebook,instagram,youtube}.{svg,png}`
  (see "Icons" above). Re-run only if the marks or the
  gradient spec change. Logos in `assets/logos/*.png` ship as-is.
- `scripts/office/soffice.py` — sandboxed-environment AF_UNIX socket workaround for headless LibreOffice.
- `examples/*.json` — worked free-mode `content.json` examples exercising
  every free-mode component (used to build and QA this skill). Template-mode
  examples: `examples/*-props.json` (prop schemas in `scripts/templates/`).
