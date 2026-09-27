# Charts — type selection, generation, and rules

A `gcs-chart` is a static, GCS-branded SVG chart wrapped in the same card
anatomy as a `gcs-table` (head / body / legend / footnote / footer). No
JavaScript, no charting library — the SVG is pre-computed by
`scripts/gcs_chart.py` and styled by `assets/charts.css`, so it pastes
straight into a WordPress Custom HTML block, Gutenberg, or Elementor and
scales responsively off its `viewBox`.

**Never hand-assemble the SVG geometry.** Write a JSON spec and run the
generator — it ports the design system Chart component's exact geometry
(margins, `nice()` axis math, dashed grid, palette order) and escapes all
text. Hand-written coordinates drift and make arithmetic mistakes; the
script doesn't.

```bash
python3 scripts/gcs_chart.py spec.json               # full .gcs-chart block
python3 scripts/gcs_chart.py spec.json --svg-only    # bare <svg> only
python3 scripts/gcs_chart.py spec.json -o chart.html
```

The spec format is documented in the script's own docstring — read it there.

## Deciding whether to chart at all

A chart is warranted when the data has a **quantitative column whose values
are worth comparing visually** — magnitudes, trends, or shares. It is NOT
warranted when:

- the table is qualitative (names, yes/no, descriptions, requirements);
- there's only one numeric value, or the numbers are identifiers
  (years-as-labels, ID codes, phone numbers);
- the numeric columns use incompatible units that would share one axis
  (€ amounts next to months next to scores — chart one of them, or one
  chart per unit, never a mixed axis);
- the values span such different magnitudes that all but one bar would be
  invisible (a €690,000 investment next to a €12 fee).

When charting is warranted, generate the chart **in addition to** the
table, never instead of it — the table is the accessible, faithful record
of the data; the chart is the visual companion. Multiple charts from one
dataset are fine when different columns tell different stories (one chart
per unit/story).

## Choosing the type — decision table

| Data shape | Type (`spec.type`) | Notes |
|---|---|---|
| One numeric series across ≤8 categories, short labels | `column` (vertical bars) | The default comparison chart. `bar` is an alias. |
| One numeric series, >8 categories OR long labels (country names, programme names) | `hbar` (horizontal bars) | Labels get full width; height grows per row automatically. |
| Rankings / index scores | `hbar`, sorted as in the source | Don't re-sort unless the source is sorted. |
| Two to three numeric series compared per category | `grouped` | More than 3 series turns to visual noise — split into two charts. |
| Series that are parts of a per-category total | `stacked` | Only when the sum is meaningful. Never stack unrelated measures. |
| Values over an ordered sequence (years, months, quarters) | `line` | Time/order on the x-axis, always in source order. |
| Same, when cumulative volume/magnitude matters | `area` | Single or few series; area fills overlap badly beyond 2 series. |
| Parts of a whole, 2–6 slices | `pie` | Slices must genuinely sum to a whole. |
| Parts of a whole with a headline total | `donut` + `centerLabel` | Same constraint as pie. |

**Never:**

- pie/donut with more than 6 slices, or with values that don't form a whole
  (scores, prices, and rankings are NOT parts of a whole);
- line/area for unordered categories (countries are not a sequence);
- stacked bars for values in different units;
- any of these types for negative values — the generator refuses them by
  design; report the situation to the user instead of transforming data;
- 3D, gradients, drop shadows, rounded bars, or any styling not in
  `charts.css` — sharp corners and flat fills are the brand.

If the type is genuinely ambiguous (e.g. grouped vs. stacked both defensible),
pick per the table above and say in one line why; don't ask the user to
choose a chart type — that's this skill's decision to make.

## Palette and series order

The palette is fixed, in this order (from `tokens/colors.css`, identical to
the Chart primitive):

| Slot | Hex | Token |
|---|---|---|
| s1 | `#000957` | night-blue-400 (primary) |
| s2 | `#3F8CFF` | electric-blue-400 (accent) |
| s3 | `#333A79` | night-blue-200 |
| s4 | `#D9E8FF` | electric-blue-50 |
| s5 | `#8084AB` | night-blue-100 |

The generator assigns colors by series/slice position automatically. Don't
reorder the palette, don't introduce new colors, and don't use the status
colors (success/warning) as series colors.

## Head, legend, footnote

- Give the chart a `title` (Title Case, UK English) unless it sits directly
  under an equivalent `gcs-table` head — then omit the head to avoid saying
  the same thing twice, and let the table carry the framing.
- `ariaLabel` is required — one sentence describing what the chart shows.
- The legend renders automatically for multi-series charts and pie/donut;
  single-series cartesian charts don't need one (the title says what the
  bars are).
- Use `footnote` for source attribution and for flagging any derived
  number (see the fidelity note below).

## Fidelity in charts

Same absolute rule as tables: every plotted value is exactly the value in
the source. The only derived numbers permitted are:

- axis tick values (pure presentation, computed by the generator);
- pie/donut percentages (computed exactly from the source values and shown
  alongside the original value in the legend, e.g. `Europe · 520 (41.9%)`).

If the user's data doesn't include a total, don't invent one for a donut
`centerLabel` — either compute the exact sum of the given values and label
it "Total", or omit the center label.

Units belong on the axis (via `tickPrefix` / `tickSuffix`) or in the
subtitle — never silently rescale values (no dividing by 1,000 to make
labels shorter unless the user's source already expresses them that way,
and if you do rescale at the user's request, say so in the subtitle:
"in USD thousands").

## Pairing a chart with a table

When a request produces both, deliver them as siblings, table first:

```html
<div class="gcs-table" data-theme="light" data-header="solid">…</div>
<figure class="gcs-chart" data-theme="light" data-type="bar">…</figure>
```

Both stylesheets (`tables.css` + `charts.css`) are pasted once per page. Use
the same `data-theme` on both — the pair must read as one asset. The chart's
head block is usually dropped in this arrangement (the table's head already
frames the content); keep the chart's `footnote` only if it adds something
the table's footnote doesn't.
