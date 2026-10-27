# Design system assets for extended content

This skill uses a hybrid model: pick a cover variant from `assets/covers/` and compose content pages from component snippets in `components/` — see [`components.md`](components.md) for the full catalogue. This doc covers the brand tokens (colours, fonts, logos, icons, flags, spacing) you need when writing or extending any component or cover block.

## Colors

The templates hardcode these hex values directly (not CSS variables) — reuse them verbatim rather than picking new ones:

| Role | Hex | Where it shows up |
|---|---|---|
| Primary navy | `#000957` | Headers, dark backgrounds, primary headings, footer chrome logo text |
| Accent blue | `#3D51E8` | Links, eyebrows, active/highlighted states, section labels |
| Near-black text | `#16182A` | Large headings on white pages |
| Body text (dark → light) | `#4B4E65`, `#6F7185`, `#9B9CAD` | Body copy, captions, muted labels, in descending emphasis |
| Borders/dividers | `#ECEDF5`, `#E0E2EA`, `#C6C8D5` | Hairlines between sections, table borders, footer text |
| Section backgrounds | `#F7F8FD`, `#F2F3FE`, `#FAFBFF` | Sidebar fact boxes, pull-quote backgrounds, zebra-striped table rows |
| Cover/back-cover gradient base | `#000B2E`, `#0F1A2D` | Dark cover and back-cover page backgrounds |

The design system's root `tokens/colors.css` (`../../tokens/colors.css` from the repo root — only reachable when this skill runs from inside the `gcs-design-system` repo, not from a standalone install) defines a broader HSL-based token set (`--primary`, `--night-blue-400`, etc.) used elsewhere in this repo — the hex values above are what these brochure templates actually use in practice and are already bundled with the templates, so nothing in this skill's own workflow depends on reaching that file.

## Typography

- **Yrsa** (serif) — every large headline, cover title, and pull quote. Often set in italic for the second line of a two-line headline.
- **Heebo** (sans) — everything else: eyebrows (uppercase, letter-spaced), body copy, labels, footers.

**`fonts.googleapis.com` is blocked in the render environment — a Google Fonts `<link>` silently falls back to system fonts.** Both fonts are self-hosted instead: `cover-gcs.dc.html` and `cover-giu.dc.html` each carry a `@font-face` block in their `<head>` pointing at local files in `assets/fonts/` (Heebo 300/400/500/600/700, Yrsa 400 upright + italic — the only weights actually used by this skill's covers/components). This `<head>` becomes the assembled brochure's `<head>` once the cover file is used as the outer document — see SKILL.md step 4, "keep the entire `<head>`".

These `@font-face` rules (and the logo/cover-background `<img>` paths in the same templates) are written as paths relative to `assets/covers/`, on the assumption that `assembled.html` lives there too. `scripts/html-to-pdf.js` no longer depends on that assumption holding: it rewrites these specific, well-known skill-asset references to absolute paths anchored to the skill's own install directory before rendering, so fonts/logos/cover backgrounds resolve correctly even if the assembled HTML is written somewhere else entirely (a temp/output folder, a different clone). `scripts/check-fidelity.js --design-lint` also fails loudly if any local asset reference — this or any other — doesn't resolve, instead of the render silently degrading to invisible text or a broken-image icon.

## Logos

All under `assets/logos/`:

- `GCS-Primary-White.svg` — full wordmark, used on dark cover/back-cover pages.
- `GCS-Symbol-Blue.svg` — starburst mark alone (`70×71`). Used in the GIU content-page header (`_chrome-giu.html`), paired with `GIU-Wordmark-Blue.svg`, which really is text-only. Not used in GCS content-page headers.
- `GCS-Secondary-Blue.svg` — the horizontal lockup (`270×17`): starburst **plus** inline wordmark in one file. This is the whole GCS content-page header mark (`_chrome-gcs.html`) — use it **alone**. Never pair it with `GCS-Symbol-Blue.svg`, which renders the starburst twice, and never hand-type the brand name as text.
- `GCS-Symbol-White.svg` — same mark, white variant, used top-left on dark cover pages (GCS cover variant).
- `GIU-Wordmark-{White,Blue}.svg` — paired with the GCS symbol in the GIU cover variant (`assets/covers/cover-giu.dc.html`); don't use these in GCS-brand documents.

## Icons and flags

- Contact/social icons (phone, email, location, LinkedIn, Facebook, Instagram, YouTube) are always **inline `<svg>` with `fill="currentColor"`**, never `<img>` — copy the exact `<svg>` markup from an existing page in the same template rather than sourcing a new icon, since these are already GCS's approved icon set for these placements.
- **Icons**: not bundled in this skill (bundling a useful subset previously blew the skill's file-count limit for packaging). Fetch a Material Symbol on demand from Google's canonical repo:
  ```bash
  curl -sL "https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/<icon_name>/materialsymbolsoutlined/<icon_name>_24px.svg"
  ```
  (`<icon_name>` is the snake_case Material Symbols name, e.g. `trending_up`, `check_circle`, `bar_chart`.) Use `curl` via Bash, never the WebFetch tool — WebFetch summarises pages through a model and will not return exact, unmangled SVG markup. Copy the returned `<svg>` **inline** into the page (paste it directly, add `fill="currentColor"` to the root, size ~16–20px) so it inherits the surrounding text colour — never `<img>`-reference an icon or leave a stray downloaded file behind; the fetched markup only needs to exist inline in the HTML. **Never** use Font Awesome, Heroicons, Feather, Lucide, or any other icon set — Material Symbols only, even when the destination site loads another library. (This is a 2026-07 policy: an older version of the table-chart skill allowed Font Awesome when the destination loaded it; it no longer does, and the same rule applies here.)
- **Flags**: not bundled either, for the same reason. Fetch the PNG on demand from the msikma/country-flags repo:
  ```bash
  curl -sL "https://raw.githubusercontent.com/msikma/country-flags/master/flags/png/<iso2>.png" -o <workdir>/<iso2>.png
  ```
  (`<iso2>` is lower-case ISO-3166 alpha-2, e.g. `pt`, `ae`, `kn` — **except the United Kingdom, which is `uk.png` in this repo, not `gb.png`**; check `flags/flags.json` in that repo first if a code is uncertain.) **Never** hotlink or reference flagcdn.com, Wikipedia flags, or any other flag source — msikma/country-flags PNGs only. (2026-07 policy: an older version of the table-chart skill used flagcdn.com; it no longer does.) Download into the same working folder as the assembled HTML, then reference it with a plain relative `<img src="./<iso2>.png">` — ~20px, height equal to width (`object-fit: cover`), clipped to a circle (`border-radius: 50%`), `display: block`, vertically centred in a flex row next to the country name, always with a `border: 1px solid #ECEDF5` hairline so white-containing flags (Malta, Japan…) keep their shape on white pages. Formal running prose does not get flags. Delete the downloaded PNG alongside `assembled.html` once the PDF is exported — it's a per-document working file, not a persistent skill asset.

## Spacing and shape

- 4pt grid, matching this repo's `tokens/spacing.css` scale (`../../tokens/spacing.css` from the repo root — same repo-only caveat as the colors section above) — the templates' own padding/gap values (e.g. `padding: 20px 64px`, `gap: 24px`) are already multiples of 4px; keep new blocks on that same grid without needing to open that file.
- `border-radius: 0` is this design system's default "sharp corners" brand trait, but the brochure templates deliberately soften this for the print format — `2px`–`6px` radii show up throughout (page containers, cards, buttons). Match the radius of the nearest existing element rather than defaulting to fully sharp or introducing a new radius value.
