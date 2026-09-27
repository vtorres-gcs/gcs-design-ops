# Elementor V4 JSON — Schema Mechanics

Reference for the exact JSON shape this skill must produce. Elementor V4 uses **containers** (flexbox, nestable) instead of the legacy section/column/widget tree — never emit `elType: "section"` or `elType: "column"`.

## WordPress theme isolation (non-negotiable)

The JSON is pasted into a real WordPress site running an active theme. This skill splits responsibility deliberately: **text and buttons inherit the theme; structure and color-blocking do not.**

- **`heading`, `text-editor`, and `button` widgets never set any `typography_*` key, nor any color key** (`title_color`, `text_color`, `background_color`, `button_text_color`, `border_*`). Leave these settings out of the widget entirely — Elementor then renders the widget with the live theme's/Kit's native typography and button style, exactly as if an editor had dropped a fresh widget on the page with no overrides. Do not set `typography_typography: "custom"` on these widgets — that flag is only relevant when overriding typography, which this skill no longer does.
- Every **container**, and every **`icon`**/**`divider`** widget, must still be fully explicit — these are what give a section its GCS structure and color-blocking, and the theme's defaults for them are unknown/unpredictable:
  - Every container must explicitly set `border_radius` — literal `0` by default, `9999` only for the documented pill/avatar/circle exceptions. Never omit it and rely on the theme's own corner radius.
  - Every container must explicitly set `border_border` + `border_width` + `border_color` (or `border_border: "none"` when no border is wanted) — never leave border unset.
  - Every container must explicitly set `background_background: "classic"` + a literal `background_color` — never leave background unset.
  - `icon` widgets keep `primary_color`; `divider` widgets keep `color` — literal GCS hex values, never left unset.
- Every container must explicitly set `flex_wrap: "nowrap"` — **never `"wrap"`, on any container, including repeating-tile/grid sections**. Grids (Features, Testimonials, Pricing, Stats, TrustBar, TeamSection, OfficeLocations) are built from explicit inner "row" containers instead — see "Repeating grids without flex_wrap" below.

## Root object

```json
{
  "type": "elementor",
  "siteurl": "https://www.globalcitizensolutions.com/wp-json/",
  "elements": [ /* top-level containers */ ]
}
```

`elements` is an array — for a single section it holds exactly one top-level container. For a **full page**, it holds N top-level containers, one per chosen section, as plain siblings in the confirmed order — same shape as any single-section root, just more entries in the same array. No page-level wrapper container exists or is needed; each entry is a complete, self-contained section tree exactly as it would be if generated alone.

## Container element (recursive)

```json
{
  "id": "gcs-hero-outer",
  "elType": "container",
  "isInner": false,
  "isLocked": false,
  "settings": {
    "flex_direction": "row",
    "flex_direction_tablet": "row",
    "flex_direction_mobile": "column",
    "flex_gap": { "unit": "px", "size": 32 },
    "align_items": "center",
    "justify_content": "space-between",
    "padding": { "unit": "px", "top": 64, "right": 64, "bottom": 64, "left": 64, "isLinked": false },
    "padding_tablet": { "unit": "px", "top": 40, "right": 32, "bottom": 40, "left": 32, "isLinked": false },
    "padding_mobile": { "unit": "px", "top": 32, "right": 24, "bottom": 32, "left": 24, "isLinked": false },
    "background_background": "classic",
    "background_color": "#F9FAFB",
    "min_height": { "unit": "px", "size": 0 }
  },
  "elements": [ /* nested containers or widgets */ ]
}
```

- `isInner: false` at the top level of a section; `isInner: true` for every container nested inside another container.
- `id` is a short, unique, human-readable string (see ID convention below) — Elementor accepts arbitrary unique strings and regenerates its own random IDs on paste anyway, so descriptive IDs are safe and preferred for readability.
- Common container settings: `flex_direction`, `flex_wrap`, `flex_gap`, `align_items`, `justify_content`, `padding`, `background_background` + `background_color`, `border_border` + `border_width` + `border_color`, `border_radius`, `min_height`, `width`/`content_width`. Add `_tablet`/`_mobile` for any of these that should change per breakpoint.
- **Required on every container** (see "WordPress theme isolation" above — not optional, not left to theme defaults): `flex_wrap` (`"nowrap"` unless the section is a confirmed grid), `border_radius` (`0` unless a documented pill/circle exception), `border_border`/`border_width`/`border_color` (or explicit `"none"`), `background_background: "classic"` + literal `background_color`.

## Widget element (common envelope)

```json
{
  "id": "gcs-hero-heading",
  "elType": "widget",
  "widgetType": "heading",
  "isInner": false,
  "isLocked": false,
  "settings": { /* per-widget keys, see below */ },
  "elements": []
}
```

Widgets **always** have `"elements": []` — they never nest children. Only `elType`/`widgetType` and the `settings` payload differ per widget.

## Per-widget settings (only these 6 widget types are allowed)

### `heading`

No typography or color keys — inherits the WordPress theme's native heading style.

| Key | Example |
|---|---|
| `title` | `"Secure Your Family's Future"` |
| `header_size` | `"h1"` – `"h6"` |
| `align` (+`_tablet`/`_mobile`) | `"left"` / `"center"` / `"right"` |

### `text-editor`

No typography or color keys — inherits the WordPress theme's native body-text style.

| Key | Example |
|---|---|
| `editor` | `"<p>Body copy as an HTML string.</p>"` |
| `align` | `"left"` |

### `button`

No color, border, radius, or typography keys — inherits the WordPress theme's/Elementor Kit's native button style.

| Key | Example |
|---|---|
| `text` | `"Book a Consultation"` |
| `link` | `{ "url": "https://www.globalcitizensolutions.com/contact/", "is_external": false, "nofollow": false }` |
| `align` | `"left"` |

### `image`

| Key | Example |
|---|---|
| `image` | `{ "url": "https://images.unsplash.com/photo-...", "id": 0 }` (placeholder — tell the user to replace with the real WP attachment) |
| `image_size` | `"large"` |
| `align` | `"center"` |
| `width` | `{ "unit": "%", "size": 100 }` |
| `object-fit` (custom CSS setting on the widget's advanced tab) | `"cover"` |

### `icon`

| Key | Example |
|---|---|
| `selected_icon` | `{ "value": { "library": "fa-solid", "value": "fa-solid fa-check" }, "library": "fa-solid" }` |
| `align` | `"center"` |
| `size` (+responsive) | `{ "unit": "px", "size": 24 }` |
| `primary_color` | `"#3F8CFF"` |

### `divider`

| Key | Example |
|---|---|
| `style` | `"solid"` |
| `weight` | `{ "unit": "px", "size": 1 }` |
| `color` | `"#DBEAFF"` |
| `gap` | `{ "unit": "px", "size": 0 }` |

## Responsive suffix convention

Any setting that can reasonably differ by breakpoint gets three keys: the base key (desktop), `<key>_tablet`, and `<key>_mobile`. Elementor's default breakpoints are **tablet ≤ 1024px** and **mobile ≤ 767px** — author `_tablet`/`_mobile` values assuming those widths (e.g. reduce font sizes, switch `flex_direction` from `row` to `column`, reduce padding).

## Repeating grids without flex_wrap

Every container always sets `flex_wrap: "nowrap"` — never `"wrap"`. Sections that repeat tiles (Features, Testimonials, Pricing, Stats, TrustBar, TeamSection, OfficeLocations, CountryCard, Footer's link columns, BenefitsGrid, ComparisonTable's rows) are built from explicit **row containers** instead of letting flexbox auto-wrap:

1. Chunk the repeated items into rows of a fixed count N (per-section guidance is in `section-recipes.md`, e.g. Features ≤4, Testimonials 2, Pricing 2-4, Stats/TrustBar ≤4, TeamSection ≤4, OfficeLocations 3-4, CountryCard ≤4, Footer 5 columns (4 static + the accordion column), BenefitsGrid 2, ComparisonTable one row per compared feature × (1 label column + N plans)).
2. Emit one inner "row" container per chunk: `isInner: true`, `flex_direction: "row"`, `flex_direction_mobile: "column"`, `flex_wrap: "nowrap"`, plus the section's usual `flex_gap`/padding.
3. Each item inside a row gets an explicit `width: { "unit": "%", "size": 100 / N }` and `width_mobile: { "unit": "%", "size": 100 }` so it fills the row on desktop and stacks full-width on mobile.
4. If the item count isn't a multiple of N, recompute the last row's item widths against however many items actually land in it (e.g. 5 items chunked at N=3 → a 3-item row at 33.33% each, then a 2-item row at 50% each) — never leave a row with empty trailing space sized as if a missing item were still there.

This replaces every prior use of `flex_wrap: "wrap"` in this skill — grid layout is now fully explicit and predictable across breakpoints, rather than relying on the browser's auto-wrap behavior.

## ID convention

Short, unique, kebab-case: `gcs-<section>-<role>` — e.g. `gcs-hero-outer`, `gcs-hero-heading`, `gcs-hero-cta`, `gcs-cta-button`.

**Repeated section types on one page:** if the same section type is used more than once in a full page, suffix every ID in the second and later occurrences with a running index right before the role, e.g. `gcs-cta-outer` → `gcs-cta-2-outer`, `gcs-cta-button` → `gcs-cta-2-button`. The first occurrence keeps the unsuffixed form.

**The Six-Widget Rule.** Only `heading`, `text-editor`, `button`, `image`, `icon`, `divider` — never introduce another Elementor widget type, native or third-party, regardless of what the request seems to call for.

## Worked minimal example

A single outer container with one heading and one button — the copy-paste skeleton every recipe in `section-recipes.md` builds on:

```json
{
  "type": "elementor",
  "siteurl": "https://www.globalcitizensolutions.com/wp-json/",
  "elements": [
    {
      "id": "gcs-minimal-outer",
      "elType": "container",
      "isInner": false,
      "isLocked": false,
      "settings": {
        "flex_direction": "column",
        "flex_direction_tablet": "column",
        "flex_direction_mobile": "column",
        "flex_wrap": "nowrap",
        "align_items": "flex-start",
        "flex_gap": { "unit": "px", "size": 24 },
        "padding": { "unit": "px", "top": 64, "right": 64, "bottom": 64, "left": 64, "isLinked": false },
        "padding_tablet": { "unit": "px", "top": 48, "right": 32, "bottom": 48, "left": 32, "isLinked": false },
        "padding_mobile": { "unit": "px", "top": 32, "right": 24, "bottom": 32, "left": 24, "isLinked": false },
        "background_background": "classic",
        "background_color": "#F9FAFB",
        "border_border": "none",
        "border_radius": { "unit": "px", "top": 0, "right": 0, "bottom": 0, "left": 0 }
      },
      "elements": [
        {
          "id": "gcs-minimal-heading",
          "elType": "widget",
          "widgetType": "heading",
          "isInner": false,
          "isLocked": false,
          "settings": {
            "title": "Plan With Confidence",
            "header_size": "h2",
            "align": "left"
          },
          "elements": []
        },
        {
          "id": "gcs-minimal-button",
          "elType": "widget",
          "widgetType": "button",
          "isInner": false,
          "isLocked": false,
          "settings": {
            "text": "Book a Consultation",
            "link": { "url": "https://www.globalcitizensolutions.com/contact/", "is_external": false, "nofollow": false },
            "align": "left"
          },
          "elements": []
        }
      ]
    }
  ]
}
```
