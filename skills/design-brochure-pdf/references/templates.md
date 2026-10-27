# Choosing a cover and composing pages

This skill uses a **hybrid model**: fixed brand covers + a composable component library.
Do not pick a monolithic template — instead, select a cover variant and compose each content
page from individual component snippets. See [`components.md`](components.md) for every
available component with height estimates and parameter lists.

## Cover selection

| Brand | Cover file | Back cover |
|---|---|---|
| GCS (all non-GIU brochures) | `assets/covers/cover-gcs.dc.html` | `assets/covers/back-cover.html` |
| GIU sub-brand | `assets/covers/cover-giu.dc.html` | `assets/covers/back-cover.html` |

Both cover files are filled via `populate-template.js` (same `{{ token }}` mechanic as
before). The back cover is copied verbatim — no tokens.

## Content page composition

1. Copy `components/_chrome-gcs.html` (or `_chrome-giu.html`) for each content page.
2. Choose 1–2 components from `components/` and paste them between the chrome markers.
3. Fill plain-text placeholders (e.g. `SECTION_LABEL`, `HEADING_TEXT`).
4. Run `check-overflow.js` and `check-fidelity.js --design-lint` before rendering.

## When to use each component

| Content type | Component(s) |
|---|---|
| Programme/country introduction | `narrative` + optional `pull-quote` |
| Key numbers at a glance | `stat-strip-dark` or `stat-strip-light` |
| Visual break / country photo | `hero-image` |
| Application process | `timeline` |
| Programme comparison | `table-ranking` |
| Closing / "speak to an advisor" | `cta-panel` + `bio-card` |
| Article digest / newsletter | `article-list` |
| Document index (5+ sections) | `toc` |
| GIU publication schedule | `month-grid` |

## Cover `{{ token }}` fill mechanics

Cover files use `{{ fieldName }}` tokens filled via `populate-template.js`:

```bash
node scripts/populate-template.js --template assets/covers/cover-gcs.dc.html --props cover-props.json --output assets/covers/assembled-cover.html
```

Run `node scripts/populate-template.js --template assets/covers/cover-gcs.dc.html --list-fields` to get the exact field list. Never leave a `{{ }}` token unfilled in the final assembled HTML.
