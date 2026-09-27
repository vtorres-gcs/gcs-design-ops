---
name: design-brochure-builder
description: Generate a GCS/GIU brochure as an EDITABLE .pptx file, A4 portrait (210x297mm), from an approved page map. Sibling to skills/gcs-brochure (same brand content, PDF output via Puppeteer) — this skill targets PowerPoint-editable output instead, via PptxGenJS. Asks up front whether to build from one of the six templates/brochures/* fixed templates (case-study, quarterly-report, factsheet — fully ported; giu-calendar, giu-corporate, lead-magnet — fail loudly naming what's missing) or free-form from the component palette (narrative, stat-strip-dark, stat-strip-light, hero-image, timeline, cta-panel, key-facts-strip, step-list, pull-quote, flag-badge, article-list, investment-panel, benefits-panel). Material Symbols icons and msikma/country-flags flags are rasterized on demand via scripts/icons.py and scripts/flags.py. Use when the user explicitly wants an editable/PowerPoint brochure, not a fixed PDF.
allowed-tools: Bash, Read, Write, Glob
---

# GCS Brochure Builder

Generates the same GCS/GIU brochure content as `skills/gcs-brochure`, but as
an **editable `.pptx`** (A4 portrait) instead of a fixed PDF. Independent
skill — does not modify `gcs-brochure` (PDF/Puppeteer) or `gcs-pptx` (16:9
slide decks/PptxGenJS); it borrows the brand content model from the former
and the PptxGenJS + font-embedding + LibreOffice-QA conventions from the
latter.

**When to use this instead of `gcs-brochure`:** the user explicitly wants a
file they (or a colleague) can open and edit in PowerPoint — not a
pixel-fixed, print-ready PDF. If the request doesn't specify, ask; don't
assume PPTX is a drop-in replacement for the PDF workflow.

**Scope:** cover (GCS or GIU) + back-cover + free-mode content components:
`narrative`, `stat-strip-dark`, `stat-strip-light`, `hero-image`, `timeline`,
`cta-panel`, `key-facts-strip`, `step-list`, `pull-quote`, `flag-badge`,
`article-list`, `investment-panel`, `benefits-panel` (`photo-column` too, but
only via a `content-2col` page's `leftColumn`, not as a stack block). Plus
**template mode**: `scripts/template-registry.js` knows all six
`templates/brochures/*` layouts (`case-study`, `quarterly-report`,
`factsheet`, `giu-calendar`, `giu-corporate`, `lead-magnet` — see step 1b);
**`case-study`, `quarterly-report` and `factsheet` are fully ported** today;
the other three are documented (`scripts/templates/<name>.json` lists their
pages and the new components they still need) and fail loudly with a clear
"not yet ported" message naming what's missing, rather than silently falling
back to free mode. See `references/components.md` for the full component
catalog and what's still **not** built. If the user's content needs an
unported template/component, say so explicitly and offer free mode or
`gcs-brochure` (PDF) instead of silently dropping or approximating that
section.

**Country flags currently unavailable.** `factsheet`'s optional cover
`flagIso2` badge (and any free-mode `flag-badge`/`flagIso2` use) depends on a
repo-level `assets/flags/` directory (self-hosted msikma/country-flags PNGs)
that isn't present in this checkout — `scripts/flags.py` raises `MissingAsset`
for every code until that asset library is added. Omit `flagIso2` until then;
don't substitute a placeholder flag.

## Workflow

### 1. Ingest content

Same as `gcs-brochure`: accept DOCX/Markdown/plain text/HTML/pasted chat
text. Extract sections, stats, steps, and any images the user provides.
User-supplied copy is final — never paraphrase, reorder, correct, omit, or
add to it.

### 1b. Template or free mode — mandatory question

Ask the user: should this be built from one of the six fixed brochure
templates (`case-study`, `quarterly-report`, `factsheet`, `giu-calendar`,
`giu-corporate`, `lead-magnet` — see `templates/brochures/*.dc.html`), using
that template's exact page count, component sequence, and prop schema? Or as
a free-form page map from the component palette (today's ad-hoc flow)?

If the user names a template, or the content obviously maps to one (e.g. "a
factsheet for Italy", "our quarterly investor report"), confirm **template
mode**:
- Brand is implied by the template (`case-study`/`quarterly-report`/
  `factsheet` are GCS; `giu-calendar`/`giu-corporate`/`lead-magnet` are GIU)
  — still confirm it.
- Confirm any per-template swap points the template documents (country/flag,
  hero image, client name/photo — e.g. `factsheet` swaps the country flag +
  hero image per the comment in its `.dc.html`).
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

GCS or GIU (Global Intelligence Unit sub-brand) — same decision as
`gcs-brochure`. In template mode this is implied by the chosen template
(confirm it); in free mode it changes the cover and chrome/content side
margin (64px for `case-study`/`quarterly-report`/`giu-corporate`-style pages,
56px for `factsheet`/`giu-calendar`/`lead-magnet`-style pages — see
`scripts/tokens.js`'s `TEMPLATE_MARGIN_PX`/`getContentMetrics()`) and header
logo lockup (`GCS-Secondary-Blue` vs `GCS-Symbol-Blue` +
`GIU-Wordmark-Blue`). Content components themselves are brand-agnostic.

### 3a. Optional brand-messaging QA pass

Before presenting the page map for approval, offer to run the ingested copy
(headings, body paragraphs, stat labels, CTA text — anything supplied
verbatim) through `skills/gcs-brand-messaging`'s review process. If accepted,
surface its findings (`BLOCKER`/`MAJOR`/`MINOR`/`NOTE`) and overall verdict
(`APPROVED` / `APPROVED_WITH_RECOMMENDATIONS` / `REVISE_BEFORE_PUBLISHING` /
`BLOCKED — DO NOT PUBLISH`) inline in chat, alongside the page map.

**This never edits or rewrites the user's text** — it only reports, exactly
like the "user-supplied copy is final" rule in step 1. If the verdict isn't
`APPROVED`, tell the user explicitly and let them decide: revise the source
copy and re-ingest, or proceed as-is — their call, not this skill's.

Known, currently-unresolved tension: `gcs-pptx`/`gcs-brochure` mandate UK
English; `gcs-brand-messaging` defaults to US English (preserving official
names/exceptions). Treat a spelling-variant finding (e.g. "program" vs
"programme") as informational only — don't silently override either skill's
documented default, and flag a recurring conflict to the user/maintainer
rather than resolving it yourself.

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
cd skills/gcs-brochure-builder
python3 scripts/prepare-assets.py content.json   # resolves any flag/icon refs to PNG paths, in place
node scripts/build-brochure.js content.json output.pptx
```

**Template mode:** fill the template's `propsSchema` (from
`scripts/templates/<name>.json`) with the approved copy/swaps into a
`props.json`, then:

```bash
cd skills/gcs-brochure-builder
node scripts/build-from-template.js <template-name> props.json output.pptx
```

This writes a scratch `content.json` (via `template-registry.js`'s
`mapPropsToBlocks()`) and calls the same renderer — `prepare-assets.py` runs
automatically as part of this step for any `flagIso2`/`icon` fields in the
props.

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

Read every `/tmp/page-N.jpg` and check, per page:
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

**No automatic text reflow.** Unlike `gcs-brochure`'s Puppeteer/CSS pipeline
(which lays out real text and can detect overflow after the fact via
`check-overflow.js`), PptxGenJS text boxes don't reflow or report overflow.
`scripts/estimate-text-height.js` provides a word-wrap heuristic used
throughout the components to size boxes and advance the Y cursor, but it's
an approximation — always confirm with the QA render in step 6, not the
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
Inherited pitfall from `skills/gcs-pptx`. Use the pre-blended solid hexes in
`WHITE_ON_NIGHT_BLUE` (`scripts/tokens.js`) instead of `rgba(255,255,255,a)` +
`transparency` wherever the run also needs `charSpacing`.

**SVG logos don't render via PptxGenJS in Node.** `addImage()` with an
`.svg` path works in a browser context but resolves to a broken-image
placeholder when pptxgenjs runs under Node (confirmed while building this
skill — see `pptxgenjs` GitHub issue #401). All logos and social/pin icons
are pre-rasterized to PNG by `scripts/gen-assets.py` (via `cairosvg`) for
exactly this reason — always add new brand marks as rasterized PNGs, not by
pointing `addImage` at the `.svg` source.

### Icons

`scripts/icons.py` is the general icon pipeline (not limited to the 5
social/pin marks anymore). `get_icon_png(name, style, filled, fill_hex,
size_px)` resolves a Material Symbols SVG from the repo's own
`assets/icons/{outlined|rounded|sharp}/{name}[-fill].svg` when checked out
alongside this skill, else fetches it from
`raw.githubusercontent.com/google/material-design-icons` (never `WebFetch`,
which mangles markup), recolors the root `<svg>`'s fill, and rasterizes via
`cairosvg` to a cached PNG under `assets/icons/_generated/` — required
because OOXML slide shapes built via PptxGenJS can't hold inline SVG.

The 5 bespoke GCS social/pin marks (`pin`, `linkedin`, `facebook`,
`instagram`, `youtube` — copied verbatim from
`skills/gcs-brochure/assets/covers/back-cover.html`, per that skill's own
"these are already GCS's approved icon set for these placements" rule) are
kept as literal SVG markup in `icons.py`'s `SOCIAL_ICONS` dict and go through
the same `get_social_icon_png()`/rasterize-and-cache mechanism — they are
not swappable to generic Material Symbols, only routed through the same code
path. `scripts/gen-assets.py` calls this once to (re)generate the canonical
`assets/icons/{name}.png` paths `components/back-cover.js` expects.

For any new content icon, call `scripts/icons.py <name> [--style ...]
[--filled] [--fill '#hex'] [--size N]` directly, or reference it declaratively
in a `content.json`/`props.json` block via an `"icon": {"name": ..., "style":
..., "fillHex": ..., "size": ...}` field — `scripts/prepare-assets.py`
resolves it to an `iconPngPath` before `build-brochure.js` runs.

Never Font Awesome, Heroicons, Feather, Lucide, or emoji — Material Symbols
(or the 5 bespoke marks above) only, even for a one-off icon.

### Flags

`scripts/flags.py` resolves `assets/flags/{iso2}.png` (self-hosted from
msikma/country-flags — never flagcdn, Wikipedia, or any other source, per
`skills/gcs-table-chart/references/flags.md`'s policy). Most codes are
already PNG (no rasterization); the ~36 legacy `.svg` files (territories,
UK sub-nations, Kosovo) are rasterized on demand via the same cairosvg
helper `icons.py` uses. `uk` aliases to the repo's local `gb.png`.
`components/flag-badge.js` embeds the result with PptxGenJS's
`addImage({rounding: true})` for the circular crop — no pre-cropping needed.

Declare a flag in `content.json`/`props.json` via a `"flagIso2": "<code>"`
field (optionally `"flagSize"`); `scripts/prepare-assets.py` resolves it to
`flagPngPath` before `build-brochure.js` runs. Never substitute a
placeholder flag if a code doesn't resolve — ask the user for the correct
country code.

**Editable means editable.** A delivered `.pptx` can be rearranged, resized,
or restyled by anyone in PowerPoint — unlike `gcs-brochure`'s fixed PDF. This
is the point of the skill, not a defect; set that expectation with the user
if they assumed a print-locked deliverable.

## Reference files

- `references/design-tokens.md` — color/font values, the accent-color
  divergence from `tokens/colors.css` (intentional, matches `gcs-brochure`),
  and the exact font-family strings to use.
- `references/page-archetypes.md` — A4 canvas geometry, chrome zones, the
  composition models (free-mode vertical stack + template-mode registry),
  and the height budget table.
- `references/components.md` — full component catalog: source HTML each was
  ported from, props, and what changed going from CSS to PptxGenJS shapes.
- `skills/gcs-brand-messaging/SKILL.md` — brand copy review used by the
  optional QA pass in step 3a (flag-only, never edits copy).

## Files

- `scripts/tokens.js` — shared color/font/geometry constants, including
  `CONTENT_TOP_PAD` and per-template margins (`TEMPLATE_MARGIN_PX`,
  `getContentMetrics()`).
- `scripts/estimate-text-height.js` — word-wrap height/width heuristic.
- `scripts/components/*.js` — one module per component (see
  `references/components.md`), including `flag-badge.js`.
- `scripts/build-brochure.js` — CLI orchestrator; reads `content.json`,
  writes the `.pptx`. Template-agnostic — template mode only ever hands it
  the same `content.json` shape free mode does.
- `scripts/icons.py` — general Material Symbols + bespoke social-icon
  rasterize-and-cache pipeline (see "Icons" above).
- `scripts/flags.py` — country-flag resolution pipeline (see "Flags" above).
- `scripts/prepare-assets.py` — pre-pass: resolves every `flagIso2`/`icon`
  reference in a `content.json` to a real PNG path before the Node build
  runs.
- `scripts/template-registry.js` + `scripts/templates/*.json` — the six
  fixed-template registries (page/component sequence + prop schema, each
  extracted from its `templates/brochures/<name>/<Name>.dc.html`) and the
  `mapPropsToBlocks()` translation into a plain `content.json`.
- `scripts/build-from-template.js` — CLI orchestrator for template mode;
  wraps `prepare-assets.py` + `template-registry.js` + `build-brochure.js`.
- `scripts/embed_fonts.py` — adapted from `skills/gcs-pptx`; see its own
  header comment for the per-weight family fix and a namespace-serialization
  bug fix (see SETUP.md troubleshooting) found and fixed while building this
  skill.
- `scripts/gen-assets.py` — one-off generator for `assets/logos/*.png`,
  `assets/covers/background-back-cover.png`, and the canonical
  `assets/icons/{pin,linkedin,facebook,instagram,youtube}.png` (now generated
  via `icons.py`, see "Icons" above). Re-run only if source SVGs or the
  gradient spec change.
- `scripts/office/soffice.py` — copied verbatim from `skills/gcs-pptx`;
  sandboxed-environment AF_UNIX socket workaround for headless LibreOffice.
- `examples/*.json` — worked free-mode `content.json` examples exercising
  every free-mode component (used to build and QA this skill). Template-mode
  examples live under `scripts/templates/` (prop schema) and
  `templates/brochures/<name>/props.json` where a template ships one.
