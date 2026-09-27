# Choosing a variant

Six `data-*` attributes on the outer `.gcs-table` cover every visual variant
— there's never a reason to write new CSS for a one-off table.

| Attribute | Values | Effect |
|---|---|---|
| `data-theme` | `"light"` (default) / `"dark"` | Plain title on the white card surface vs. a full-bleed Night Blue hero band + a footer attribution bar. |
| `data-header` | `"solid"` (default) / `"minimal"` / `"plain"` | Filled navy header row vs. label + navy rule sitting on the body surface vs. bold sentence-case + a simple dark rule. |
| `data-footer` | `"light"` | White footer background with dark attribution text and the GCS blue secondary logo (Templates 01 and 03). Omit for the default dark footer. |
| `data-card` | `"deep"` | Night Blue outer card with a white table interior. Use with `data-theme="dark"` (Template 02). |
| `data-zebra` | default: on / `"off"` | Alternating row background. Turn off for short, high-contrast editorial tables where the extra texture isn't needed. |
| `data-density` | default / `"dense"` | Tighter row padding and smaller cell text — for tables with 6+ rows that would otherwise run long. |

`data-header="minimal"` always renders navy text on the light body surface
regardless of `data-theme` — the hero band (when `data-theme="dark"`) is a
separate block above the table, not a background the header row sits on. Text
color for `minimal` never changes with theme; only `solid`'s filled row does.

## Which template to use

Always start from one of the three official templates in `references/template.md`.
The template picker (SKILL.md step 2) maps the use case directly:

| Use case | Template | Key attributes |
|---|---|---|
| Programme comparison embedded inside an article | **Template 01** — Standard Card Table | `data-theme="light"` `data-header="solid"` `data-footer="light"`, `.gcs-table__head` present |
| Standalone ranking, flagship index, or hero editorial table | **Template 02** — Dark Blue Card Table | `data-theme="dark"` `data-header="minimal"` `data-card="deep"`, `.gcs-table__head` present |
| Table within a longer article that already sets context above it | **Template 03** — Standard Table | `data-theme="light"` `data-header="solid"` `data-footer="light"`, no `.gcs-table__head` |

If the use case doesn't clearly map to Template 02 or 03, default to Template 01.

## Header icon layout

All three official templates use **`gcs-table__th-stack`** — icon stacked
above the text in a flex-column span. The `gcs-table__th-inline` class (icon
beside text, flex-row) is still valid CSS but is not used in any official
output.

## Mobile behavior — read this before writing `data-label`

Below a 640px viewport, `tables.css` hides `<thead>` entirely and turns each
`<tr>` into a labelled stacked card. The label text comes from a CSS
`content: attr(data-label)` rule, which means **every `<td>` needs a
`data-label` attribute that repeats that column's header text exactly.** If
`data-label` doesn't match, the mobile card shows the wrong label (or none) —
this is the single most common mistake when writing a `gcs-table` by hand, so
double-check it once the table is built.

Nothing else is needed for the collapse to work — it's pure CSS, keyed off
viewport width, with no JavaScript and nothing to configure.

## Content rules

Same discipline the rest of this design system uses for tables, plus two
rules specific to this pure-HTML+CSS version:

**Do:**
- 2–4 columns, one data point per cell, headers ≤18 characters
- Pair every country name with its flag (`.gcs-table__country` +
  `.gcs-table__flag`) — never the bare name. Flags come exclusively from the
  msikma/country-flags repo — see `references/flags.md`.
- Give every header an icon (see `references/icons.md`) — never a bare text
  label.
- Use a `<span class="badge badge--success|info|warning">` for status values
  instead of raw coloured text.
- Keep the lead (first) column short — it becomes the title of the mobile
  stacked card, so it needs to read on its own without the other columns for
  context.

**Avoid:**
- Relative image paths (`../assets/...`) — they resolve inside this design
  system's own repo and nowhere else. Any image reference in a table someone
  will actually paste elsewhere needs to be a working `https://` URL.
- 5+ columns — the mobile card gets tall and defeats the point of collapsing
  in the first place. If the data genuinely needs that many attributes, split
  into two tables or move detail into a linked page instead.
- Editing `tables.css` per-table. If a table needs something the six
  variants don't cover, that's a signal to extend `tables.css` itself (so
  every table benefits), not to bolt on one-off inline styles.
