# Table & Chart Embed Patterns

Two patterns for embedding GCS-branded tables and charts into brochure pages
when the template's built-in token slots aren't sufficient. Both use tooling
from the `gcs-table-chart` skill — no hand-written SVG geometry, no one-off
styling.

---

## Pattern A — Static SVG chart

Use when:
- The source document has a chart as an image and the data is recoverable (numbers appear in the image or elsewhere in the text)
- The required chart type isn't available in the template's native chart slots (`hbar`, `pie`, `donut`, `grouped`, `stacked`, `column`, `area`)
- A new chart page is needed beyond the `giu-corporate` template's three shipped chart pages

For the `giu-corporate` template's built-in chart token slots (`{{ chart1Labels }}` etc.), the default token workflow is valid and preferred — use this pattern only when the tokens can't accommodate the data.

### Steps

**1. Write a JSON spec** following `gcs-table-chart/references/charts.md`. The spec format is documented in `skills/gcs-table-chart/scripts/gcs_chart.py`'s docstring — read it before writing. Key fields: `type`, `title` (omit if the page heading already frames it), `ariaLabel`, `data`.

**2. Generate the bare SVG:**

```bash
python3 skills/gcs-table-chart/scripts/gcs_chart.py spec.json --svg-only
```

This prints a bare `<svg>` to stdout — redirect to a file:

```bash
python3 skills/gcs-table-chart/scripts/gcs_chart.py spec.json --svg-only > chart.svg
```

**3. Inline the SVG into the page's chart-card chrome.** Wrap it in the template's card and annotation blocks, not in `gcs-table-chart`'s `<figure class="gcs-chart">` frame (which carries its own card background that clashes with the brochure page):

```html
<!-- Eyebrow / heading / subtitle (use the page-level heading pattern from components/narrative.html) -->

<!-- Chart card -->
<div style="border: 1px solid #ECEDF5; border-radius: 6px; padding: 24px 24px 18px; background: #FFFFFF;">
  <!-- Legend row — include only when there is more than one named series -->
  <div style="display: flex; gap: 22px; align-items: center; margin-bottom: 18px;">
    <div style="display: flex; gap: 8px; align-items: center;">
      <div style="width: 18px; height: 3px; background: #3D51E8; border-radius: 2px;"></div>
      <div style="font-family: 'Heebo', sans-serif; font-size: 11px; font-weight: 500; color: #4B4E65;">Series Name</div>
    </div>
    <!-- repeat for each additional series, with its palette colour -->
  </div>
  <!-- Paste the bare SVG output here (style="width: 100%; height: auto; display: block;" on the <svg> tag) -->
  <svg viewBox="…" style="width: 100%; height: auto; display: block;">…</svg>
</div>

<!-- Insight block — always include when the source document provides an insight or takeaway -->
<div style="margin-top: 26px; border-left: 3px solid #3D51E8; padding: 4px 0 4px 20px;">
  <div style="font-family: 'Heebo', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #000957; margin-bottom: 6px;">What This Shows</div>
  <div style="font-family: 'Heebo', sans-serif; font-size: 14px; font-weight: 300; color: #4B4E65; line-height: 1.8;">Insight text from the source document, verbatim.</div>
</div>

<!-- Source note — verbatim from the source document -->
<div style="margin-top: 14px; font-family: 'Heebo', sans-serif; font-size: 11px; font-style: italic; color: #C6C8D5;">Source: …</div>
```

**4. No additional CSS is needed** — the SVG is self-contained. The SVG's `fill` attributes reference absolute hex values from the design system palette, not CSS variables.

**5. Check for overflow** with `scripts/check-overflow.js` before exporting. Tall charts (many horizontal-bar rows) may need a taller page or a continuation page — never shrink user data to fit.

---

## Pattern B — `.gcs-table` block

Use when:
- The data table needs country flags, badge chips, or Material icon column headers
- Column count exceeds the template slot (>4 columns, or the needed column type isn't in the template)
- The table is a comparison, ranking, or reference table where the `.gcs-table` component's mobile-collapse and scrollable layout are a better fit than the template's fixed-grid markup

For simpler tables (≤4 plain text columns, no flags/badges/icons), the template's built-in token slots remain the right choice.

### Steps

**1. Build the `.gcs-table` HTML block** following `gcs-table-chart/SKILL.md` steps 0–3. Skip step 5 (PNG export) — that's web-only output and irrelevant here.

Key rules from that skill that apply inside a brochure:
- Every `<td>` carries a `data-label` (required for mobile collapse — harmless in PDF)
- Every country name is paired with its flag from msikma/country-flags (see `gcs-table-chart/references/flags.md`). **Never** flagcdn.com or any other source.
- Every column header carries a Material icon as inline SVG wrapped in a **`gcs-table__th-stack`** span (icon stacked above text, flex-column) — see `gcs-table-chart/references/icons.md`. The `gcs-table__th-inline` variant (icon beside text) is not used in official output. **Never** Font Awesome, Heroicons, Feather, Lucide, or any other icon set.
- Status values get `<span class="badge badge--success|info|warning">`
- Use `data-density="dense"` for tables with 6+ rows that would otherwise run long on the page.
- Use `data-zebra="off"` for short, high-contrast editorial tables where alternating row backgrounds add unnecessary texture.

**2. Choose the template.** Pick from the three official templates, matching the brochure page's visual context:

| Template | Attributes | Use when |
|---|---|---|
| **Template 01 — Standard Card Table** | `data-theme="light"` `data-header="solid"` `data-footer="light"` | Content page with a white or light-grey background; table has its own `.gcs-table__head` eyebrow/title block |
| **Template 02 — Dark Blue Card Table** | `data-theme="dark"` `data-header="minimal"` `data-card="deep"` | Standalone ranking or flagship data table on a dark feature page; `.gcs-table__head` present |
| **Template 03 — Standard Table** | `data-theme="light"` `data-header="solid"` `data-footer="light"` *(no `.gcs-table__head`)* | Content page where the brochure page itself already provides an eyebrow/heading above the table |

Drop the `.gcs-table__head` block when the brochure page already supplies its own heading (Template 03 pattern) — the table body stands alone without repeating the heading.

**Footer logo routing rule** (from `gcs-table-chart/references/icons.md`): the footer's inline brand SVG must match the surface it sits on:
- `data-footer="light"` (Templates 01 and 03) → **blue logo** `fill="#000957"`
- `data-theme="dark"` / `data-card="deep"` (Template 02) → **white logo** `fill="white"`

Never substitute or omit the footer logo, and never swap the colour variant.

**3. Place the block in the page's content area:**

Inside the brochure page's standard content shell (`<div style="padding: 48px 64px; flex: 1; …">`), drop the `.gcs-table` div in place of the template's table markup. No additional wrapper is needed.

**4. Inject the stylesheets** into the `populated.html` file's `<head>`, immediately before `</head>`:

```html
<style>
/* gcs-table-chart/assets/tables.css — paste verbatim */
…
/* gcs-table-chart/assets/charts.css — add only if a chart is also embedded on this page */
…
</style>
```

Paste the full contents of each CSS file inside the `<style>` block. Do not link to external files — Puppeteer must find everything self-contained. The design system fonts (Yrsa, Heebo) are already loaded by the template; the `@import` line at the top of `tables.css` is a duplicate declaration but harmless.

**5. Check for overflow** with `scripts/check-overflow.js` before exporting. A table with many rows will push the page past its fixed height — move surplus rows to a cloned continuation page (same page chrome + `<thead>`) rather than shrinking content.
