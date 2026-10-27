# gcs-wireframe

Static HTML wireframes/mockups for Global Citizen Solutions pages (`index.html`, `citizenship.html`, `residency.html`, `country-malta.html`, etc). No build step, no framework — plain HTML + inline `<style>`.

## Design system dependency

This repo uses the **GCS Design System** as its source of truth for brand, tokens and components:

```
/Volumes/GCS - DISK 1T/GCS 2026/Github/gcs-design-system
```

Read `gcs-design-system/CLAUDE.md` first for the full map (tokens, components, templates, imagery, brand voice). Key points for this repo:

- **Tokens** — `gcs-design-system/tokens/*.css` (colours, type, spacing, radius, shadows, animation) via `styles.css`. Don't invent new hex values, font sizes, or spacing — match these tokens, even though this repo doesn't `@import` the CSS file directly (see below).
- **Colour**: Night Blue `#000957` primary, Electric Blue `#3F8CFF` accent, warm near-white background, `0px` radius by default (avatars/badges/pills are the exceptions).
- **Type**: Yrsa (serif, display/headings), Heebo (sans, UI/body), JetBrains Mono (codes/IDs/data).
- **Components** — `gcs-design-system/components/core/` (primitives + sections). When a wireframe needs a real pattern (navbar, hero, FAQ accordion, pricing table, etc.), check there first; each section also has a `*.reference.html` static mockup worth copying from directly.
- **Assets** — logos, flags, icons in `gcs-design-system/assets/`. Reuse real GCS logo SVGs and Material Symbols icons instead of drawing placeholders when a mockup needs to look production-real.
- **Brand voice/copy** — Content Fundamentals section of `gcs-design-system/readme.md` (UK English, Title Case headings, client-as-hero, messaging pillars). Apply when writing real copy instead of lorem/placeholder text.

## How this repo differs from the design system

These are **wireframes**, not final UI: low-fidelity greyscale blocks (`.wire-img`, `.wt`, `.w100`/`.w80`/...) stand in for imagery and copy, and the current inline CSS in each page uses its own approximated palette/fonts (Georgia/Segoe UI, hardcoded hex) rather than importing the design system directly. When editing:

- Keep using the existing wireframe placeholder convention (`wire-img`, `wt` text bars) for structure/layout mockups — don't suddenly inject real photography or copy unless asked for a high-fidelity pass.
- When asked to move a page toward final/high-fidelity, swap the local approximated tokens for the real ones (Night Blue/Electric Blue hex values, Yrsa/Heebo/JetBrains Mono, `0px` radius) and prefer copying markup/CSS from the matching `components/core/sections/*.reference.html` in the design system over rebuilding from scratch.
- Don't hardcode a new colour or font that isn't in the design system's token set.

## File structure

- `index.html`, `citizenship.html`, `citizenship-malta.html`, `residency.html`, `residency-malta.html`, `countries.html`, `country-malta.html`, `malta-real-estate.html`, `10years.html`, `blog-malta-mprp.html` — page wireframes
- `assets/` — page-local images/icons used only by these wireframes
- `references/` — reference material for the wireframes
- `sitemap/` — site structure notes
