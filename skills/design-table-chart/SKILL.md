---
name: design-table-chart
description: Turns data from any source — pasted text, CSV, XLSX/Excel, DOCX, existing HTML tables, or images/screenshots (OCR) — into GCS-branded responsive tables AND charts (bar, horizontal bar, column, line, area, pie, donut, stacked, grouped) as plain HTML + CSS with static SVG — no JavaScript, no build step — ready to paste into WordPress (Gutenberg/Elementor) or any CMS, plus transparent PNG exports for presentations and brochures. Trigger whenever the user wants a table, chart, graph, comparison, ranking, or data visualisation — even without those words (e.g. "compare these programmes", "make this spreadsheet visual", "here's a screenshot of the data"). Also trigger when the user hands over a data file or image, needs mobile-responsive tables, GCS-branded output, or a PNG of tabular data.
---

# GCS Table & Chart

This skill turns a dataset into a **`.gcs-table`** (navy/serif branded data
table) and, when the data warrants it, a **`.gcs-chart`** (static SVG chart
in the same visual language) — both built entirely from semantic HTML and
shared stylesheets, with zero JavaScript and zero dependency on this design
system's build tooling. The output pastes directly into a WordPress Custom
HTML block (Gutenberg or Elementor, or any other CMS/static page) and looks
right immediately; each deliverable also ships as a high-resolution
transparent PNG and lossless WebP.

Files in this skill that are its actual product, not just documentation:

- `assets/tables.css` — the canonical table stylesheet. Never rewrite or
  approximate it; reproduce it byte-for-byte.
- `assets/charts.css` — the canonical chart stylesheet. Same rule: it is
  the single source of chart visual identity (ported from the design
  system's Chart component), never restyled per-request.
- `scripts/gcs_chart.py` — generates the chart SVG from a JSON spec. All
  chart geometry comes from this script; never hand-write SVG coordinates.
- `scripts/export_png.py` — renders any table/chart fragment to a
  transparent, 2× PNG via headless Chrome.

References to read before building (not optional background):

- `references/data-input.md` — how to read each input format (CSV, XLSX,
  DOCX, HTML, images via OCR), the validation pass, and the **absolute
  data-fidelity rules** that override everything else in this skill.
- `references/template.md` — the literal table markup to clone and adapt.
- `references/variants.md` — table theme/header variants + the mobile
  `data-label` collapse mechanism.
- `references/charts.md` — when to chart, which chart type, and the
  generator's rules.
- `references/icons.md` — Material Design Icons only (never Font Awesome
  or any other set); exact header-icon and footer-logo markup.
- `references/flags.md` — country flags exclusively from the
  msikma/country-flags repo; URL pattern and code quirks (`uk`, not `gb`).
- `references/export-png.md` — the transparent PNG export flow.

## Workflow

**0. Ask what to build.** Before touching any data, ask the user what type
of asset they want. Offer these options:

- Data comparison table (programmes, countries, plans side by side)
- Ranking / index table (sorted list with position numbers)
- Reference table (quiet spreadsheet-style data)
- Bar / column chart
- Line / area chart
- Pie / donut chart
- Table + chart pair (table as the faithful data record, chart as the visual
  companion)

If the user's request already names the type clearly ("make a bar chart",
"comparison table for CBI programmes", "ranking of passports"), skip the
question and proceed directly to step 1. Only ask when the type is genuinely
ambiguous (e.g. "make this CSV visual", "here's a screenshot of data").

**1. Get and validate the data** (`references/data-input.md`). Read the
source — file, pasted text, or image. Run the validation pass (ragged rows,
mixed types, unit mixtures, totals rows) and report anything found rather
than silently fixing it. For image inputs, transcribe cell-by-cell, mark
anything unreadable as such (never guess), and **echo the extracted table
back for confirmation before building** — that's the one deliberate pause
in this workflow.

The fidelity rules are absolute: nothing invented, altered, summarised,
reorganised, or inferred. Every value in the output is exactly the value in
the source; the only derived numbers anywhere are chart axis ticks and
pie/donut percentages.

**2. Pick a template.** Ask the user to choose from the three official
templates — or pick directly if the context is already clear from the
request:

- **Template 01 — Standard Card Table** (`data-theme="light"`,
  `data-header="solid"`, `data-footer="light"`) — card heading + solid
  navy header row + white footer with blue logo. Best for programme
  comparisons embedded inside an article or blog post.
- **Template 02 — Dark Blue Card Table** (`data-theme="dark"`,
  `data-header="minimal"`, `data-card="deep"`) — Night Blue card wrapping
  a white table interior + white footer with white logo. Best for
  standalone rankings, flagship indexes, or hero editorial tables that need
  to stand alone as a shareable asset.
- **Template 03 — Standard Table** (`data-theme="light"`,
  `data-header="solid"`, `data-footer="light"`, no `.gcs-table__head`) —
  same header and footer as Template 01, but without a card heading block.
  Best for tables embedded inside a longer article that already provides
  context above the table.

If the request already names the context clearly ("a dark ranking table",
"a comparison inside the article"), skip the question and pick directly.
The same template choice applies to the companion chart when one is built
— they must read as one asset.

Full attribute reference in `references/variants.md`.

**3. Build the table.** Start from `references/template.md` and adapt —
never rebuild the wrapper structure from scratch. Non-negotiables:

- **Every `<td>` carries a `data-label`** repeating its column header text
  exactly — this powers the mobile stacked-card collapse.
- **Every country name is paired with its flag** from the
  msikma/country-flags repo (`references/flags.md`) — never bare, never
  from another source, never drawn. Non-country rows get no flag.
- **Every header carries a Material icon** inside a **`gcs-table__th-stack`**
  span (icon above text, flex-column) as inline SVG with
  `fill="currentColor"` (`references/icons.md`) — never bare text, never
  `<img>`, never Font Awesome/Heroicons/Feather/Lucide/custom icons.
- Status-style values (a tier, a rating, yes/no) get
  `<span class="badge badge--success|info|warning">`, not raw coloured text.
- Title, subtitle, footnote, and every cell's text are copied exactly as
  supplied — no rewording, re-casing, trimming, or translation, ever
  (`references/data-input.md`'s fidelity rules are absolute).
- Every table has a `.gcs-table__footer` with the exact inline logo SVG
  from `references/icons.md` — blue logo (`fill="#000957"`) for Templates
  01 and 03 (`data-footer="light"`); white logo (`fill="white"`) for
  Template 02 (`data-card="deep"`). Never substitute or omit the logo.

**4. Decide whether the data warrants a chart** (`references/charts.md`).
If it has a quantitative story, pick the right type from the decision table
(never a pie for non-part-of-whole data, never a line for unordered
categories, never a mixed-unit axis), write a JSON spec, and generate:

```bash
python3 scripts/gcs_chart.py spec.json -o chart.html
```

Multiple charts are fine when different columns tell different stories.
When nothing about the data suits a chart, say so in one line and deliver
the table alone — a forced chart is worse than none.

**5. Export PNG + WebP** (`references/export-png.md`). One transparent PNG
(and matching WebP) per component, high-resolution:

```bash
python3 scripts/export_png.py table-fragment.html {slug}-table.png --width 960
# → also writes {slug}-table.webp automatically
python3 scripts/export_png.py chart-fragment.html {slug}-chart.png --width 900
# → also writes {slug}-chart.webp automatically
```

Open each PNG and check: transparent surround, webfonts rendered (Yrsa
title / Heebo body), nothing clipped, flags and icons visible. Then confirm
the matching `.webp` exists at the same path.

**6. Run the fidelity diff.** Re-read the generated HTML against the source
data cell by cell before delivering. Mandatory for image inputs.

## Output format

Deliver in three clearly labelled blocks, matching the WordPress Custom HTML
block's **HTML / CSS / JavaScript** tabs (Kadence, JetEngine, Elementor,
and similar block editors):

**CSS tab** — paste the verbatim contents of `assets/tables.css`, plus
`assets/charts.css` when a chart is included. One CSS block per page, not
per component. Label it clearly:

```
── CSS (paste into the CSS tab) ────────────────────────────────────────────
[full tables.css contents]
[full charts.css contents, when applicable]
```

**HTML tab** — the table markup, then the chart markup (table first when
both exist). No `<style>` tags here — CSS is handled separately. Label it:

```
── HTML (paste into the HTML tab) ──────────────────────────────────────────
[table HTML]
[chart HTML, when applicable]
```

**JavaScript tab** — leave empty; nothing in this skill uses JavaScript.

If the editor has only a single textarea (no separate CSS tab), wrap the
CSS in a `<style>` tag pasted directly above the HTML. `tables.css` embeds
Yrsa/Heebo as base64 `@font-face` data, so table fonts have no external
dependency and nothing for a minifier to strip. `charts.css` still pulls
Yrsa/Heebo via a Google Fonts `@import` — on a chart-only page, a minifier
plugin (Autoptimize etc.) may strip that line; it can be replaced with a
`<link>` in the theme header. Nothing needs to be installed — no plugin, no
build step, no JavaScript.

**PNG + WebP files**: four files per deliverable set —
`{slug}-table.png`, `{slug}-table.webp`, `{slug}-chart.png`,
`{slug}-chart.webp` — written to `output/` unless the user specifies
otherwise, with their paths stated. PNG for presentations and brochures;
WebP for the WordPress media library (smaller file, same lossless quality).

## Code quality bar

Everything delivered must be: semantic HTML5 (`<table>` for tables,
`<figure>`/`<figcaption>` for charts); CSS fully decoupled (no `style=""`
attributes anywhere — SVG presentation attributes like `fill` are the one
sanctioned exception, and only inside the generated SVG); accessible
(header icons decorative, flags `alt=""`, charts `role="img"` with a real
`aria-label`, the table itself as the accessible data record); responsive
by construction (mobile card collapse for tables, `viewBox` scaling for
charts); and consistently named (`gcs-table__*` / `gcs-chart__*` BEM,
variants via `data-*` attributes — never one-off classes or per-request
stylesheet edits; if a need isn't covered, extend the canonical CSS so
every future asset benefits).

## Example

**Ask:** "Here's a screenshot of our fees table — make it work on the blog
and give me something visual for the deck."

**Flow:** read the image → transcribe cell-by-cell, flag one blurred cell
as unreadable → echo the extraction back, user confirms and supplies the
missing value → ask light or dark (user: light) → header `solid`
(comparison in an article) → table built from `template.md` with
country-flags PNGs + Material header icons + `data-label`s → fees column
is one comparable numeric series across countries with long labels →
`hbar` spec → `gcs_chart.py` → both fragments exported as transparent PNG + WebP
→ fidelity diff against the confirmed transcription → deliver CSS tab block,
HTML tab block, and the four file paths (two PNG, two WebP).
