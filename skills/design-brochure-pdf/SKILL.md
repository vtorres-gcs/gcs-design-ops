---
name: design-brochure-pdf
description: Create a professional GCS brochure from user-provided content — a DOCX, Markdown, plain text, HTML, or pasted chat text. Uses a hybrid model — fixed brand covers + a composable component library — to assemble each page. Always shows a page-map plan for user approval before generating any HTML. User-supplied copy is final: never paraphrase, reorder, correct, omit, or add to it; never drop or alter URLs, email addresses, hyperlinks, or anchor text. Generates a pixel-perfect PDF via Puppeteer (Chrome Headless). Also handles plain 'convert HTML to PDF' requests. Brands: GCS and GIU sub-brand.
allowed-tools: Bash, Read, Write, Glob
---

# GCS Brochure Generator

GCS-adapted fork of a generic Puppeteer HTML-to-PDF conversion skill. All conversion mechanics — the CLI, every flag in Options Reference, the auto-fit/overflow-detection logic, and `scripts/html-to-pdf.js` itself — are unchanged from upstream. What's new is everything that turns raw content into a finished, on-brand brochure before that conversion step runs: selecting a cover variant, composing content pages from the component library, getting plan approval, and verifying fidelity and design tokens before export.

## Workflow

### Content fidelity (mandatory)

When the user supplies the content, these rules override everything else in this skill:

- **Preserve all text exactly as written. Do not paraphrase, reorder, correct, omit, or add content.**
- **Preserve all URLs, email addresses, hyperlinks, and anchor text exactly. Never remove or modify links.**

Operational consequences:

- User-supplied content is final copy by default; only write or edit copy when the user explicitly asks for that. This includes typos and non-UK spellings — deliver them as-is (flag them to the user in chat if worth noting, but never silently "fix" the brochure text).
- `populate-template.js` HTML-escapes prop values, so an `<a href>` placed in a props JSON renders as literal visible code. To keep a hyperlink clickable, put the plain text in the prop, then edit the populated HTML to wrap it in an `<a>` styled like the template's existing links — never solve this by deleting the link or flattening anchor text into a bare URL.

### Absolute data preservation (mandatory — overrides all other rules)

Every data point, value, and piece of text in the output must be **identical** to what exists in the source file. No exceptions.

The skill must **never**:

- **Invent information** — do not add facts, figures, names, dates, or any content that does not appear in the source.
- **Alter values** — numbers, percentages, prices, dates, codes, and identifiers must be reproduced character-for-character.
- **Modify texts** — word choice, phrasing, capitalisation, punctuation, and order must match the source exactly.
- **Summarise content** — do not condense, shorten, or abstract any portion of the source text.
- **Reorganise data without necessity** — only reorder content when the component layout makes it strictly unavoidable, and only within the same logical section; never move data across sections.
- **Infer absent information** — if a field has no value in the source, leave it blank or omit that element entirely; never fill it with a plausible guess, a placeholder, or a value derived from context.

**When data cannot be interpreted:** If any portion of the source file is illegible, corrupted, ambiguous, or structurally inconsistent, the skill must stop and report clearly to the user — stating exactly which field or section could not be read and why — before proceeding. It must not guess, approximate, or substitute a default value. The user decides how to handle missing or unreadable data; the skill does not.

### Layout autonomy (you decide the composition)

Within the fidelity rules above and the component library's design language, layout decisions are **yours** — don't ask the user how to lay things out, and don't mirror the source document's formatting when a component pattern communicates it better:

- Choose which components to use per page, how the content splits across pages, and how blocks mix on a single page (e.g. a `stat-strip-dark` + `hero-image` on one page).
- Promote headline numbers buried in prose to **stat tiles** (`stat-strip-dark` or `stat-strip-light`), and status words in tables to **badge chips** — the words themselves stay verbatim; only their visual container is your choice. Chips are for **short** status words (≲24 chars: "OPEN", "MODERATE", "4-6 MONTHS"); a longer phrase stays plain cell text. Uppercase letter-spaced chips holding a whole sentence read badly and blow the column past the page edge.
- Pair country names with a flag where a list or table of countries benefits visually — fetch the PNG on demand (`curl -sL "https://raw.githubusercontent.com/msikma/country-flags/master/flags/png/<iso2>.png" -o <workdir>/<iso2>.png`, lower-case ISO-3166 alpha-2, except the UK which is `uk.png` there; **never flagcdn.com or any other source**) into the `assets/covers/` folder (where `assembled.html` lives), then reference it with a plain relative `<img>` — ~20px, height equal to width (`object-fit: cover`), clipped to a circle (`border-radius: 50%`), vertically centred next to the name.
- Use icons by fetching a Material Symbol on demand (`curl -sL "https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/<icon_name>/materialsymbolsoutlined/<icon_name>_24px.svg"`) and **inlining the returned SVG markup** with `fill="currentColor"` added — never `<img>`-reference an icon (**never** Font Awesome, Heroicons, Feather, Lucide, or ad-hoc SVGs — Material Symbols only). Use `curl` via Bash for both fetches, never the WebFetch tool. See [references/design-system.md](references/design-system.md) for the full pattern.
- A chart supplied **as an image**: if its data is legible (or the numbers appear in the text), use the chart generator — write a JSON spec per `skills/gcs-table-chart/references/charts.md` and run `python3 skills/gcs-table-chart/scripts/gcs_chart.py spec.json --svg-only`; inline the bare SVG into the page. See [references/table-chart-embed.md](references/table-chart-embed.md).
- Hard constraints that are NOT yours to vary: the page chrome (header/footer/back-cover), the colour/type/spacing values in [references/design-system.md](references/design-system.md), the 4pt grid, and the user's text and links (verbatim, always).

---

**1. Ingest the content.** For a `.docx` file, use this environment's general `docx` skill to extract the text first. If the document contains images, extract them too (`unzip -o file.docx 'word/media/*' -d <workdir>`) and save the ones you'll embed into `assets/covers/` so relative paths hold. For Markdown, plain text, HTML, or content pasted into chat, just read it — no tooling needed. Keep a plain-text copy of the full source content in a file — the fidelity gate in step 7 needs it as input.

**2. Select the cover variant.** Read [references/templates.md](references/templates.md). Two choices:

- **GCS brand** (`assets/covers/cover-gcs.dc.html` + `assets/covers/back-cover.html`) — all non-GIU brochures
- **GIU sub-brand** (`assets/covers/cover-giu.dc.html` + `assets/covers/back-cover.html`) — GIU Corporate, GIU Calendar

**3. Plan the document — page map for approval.** Outline the source content first (sections, data tables, images, rough text volume per section), then write a page map: one bullet per output page, naming the cover variant, each component, and a brief title. Present this in chat and **wait for user approval before generating any HTML**.

Format:
```
- Page 1: Cover (GCS) — "Investor Visa Italy: What Changed in 2026"
- Page 2: _chrome-gcs | toc — 3 sections
- Page 3: _chrome-gcs | narrative + pull-quote — Programme Introduction
- Page 4: _chrome-gcs | stat-strip-dark + hero-image — Italy at a Glance
- Page 5: _chrome-gcs | timeline — Application Process (4 steps)
- Page 6: Back cover
```

Rules:
- Cover and back cover are always included.
- A `toc` page only when the document has **5 or more sections** — and its entries always list the real sections.
- Target 1–2 components per content page; 3 is the maximum (high overflow risk).
- Chrome header + footer consume ~100px of the 1123px page height, leaving ~1023px for components. Check height estimates in [references/components.md](references/components.md) before finalising the map.

**[WAIT FOR APPROVAL — do not generate any HTML until the page map is confirmed]**

**4. Compose the HTML.** For each content page:
- Copy `components/_chrome-gcs.html` (or `_chrome-giu.html`) as the page shell.
- Paste the chosen component snippets from `components/` between the `<!-- INSERT COMPONENTS -->` markers.
- Fill all plain-text placeholders (`SECTION_LABEL`, `HEADING_TEXT`, etc.) with verbatim content from the source.
- Never leave a placeholder unfilled in delivered output.

For the cover:
```bash
node scripts/populate-template.js --template assets/covers/cover-gcs.dc.html --props props.json --out assets/covers/cover-gcs-populated.html
```
(Or `cover-giu.dc.html` for GIU.)

For the back cover: copy `assets/covers/back-cover.html` verbatim — no substitution needed.

Concatenate all `[data-doc-page]` div blocks into a single `assets/covers/assembled.html` file, with the cover first and the back cover last. All asset paths are relative to `assets/covers/`, so logos reference `../logos/`, fonts reference `../fonts/`, etc.

**Critical:** `assembled.html` must keep the *entire* `<head>` (both `<style>` blocks — the `@font-face` self-hosted fonts and the `@page`/`@media print` rules) from the populated cover file (`cover-gcs-populated.html` or `cover-giu-populated.html`), copied unchanged. Do not reconstruct a new `<head>` from scratch and do not drop either `<style>` block — losing the `@media print` rules is what makes pages render as small shadowed cards on a grey background instead of full-bleed A4 pages; losing the `@font-face` rules is what makes Heebo/Yrsa silently fall back to system fonts.

For table pages with country flags, badges, or chart embeds, see [references/table-chart-embed.md](references/table-chart-embed.md).

**5. Populate the cover.** Run:
```bash
node scripts/populate-template.js --template assets/covers/cover-gcs.dc.html --props props.json --out assets/covers/cover-gcs-populated.html
```
It does a literal `{{ fieldName }}` substitution and strips dc-runtime scripts. It prints any unfilled fields — treat that as a checklist. Run `--list-fields` to get the authoritative field list at any time.

`cover-gcs.dc.html`'s `eyebrowLabel` field (the small label in the cover's top-right corner) is optional and hidden by default — pass `""` unless the user explicitly asks for a document-type badge there (e.g. "Case Study", "Lead Magnet"). Don't fill it in just because `--list-fields` lists it.

**6. Verify the fit.** Each brochure page is a fixed-size box with hidden overflow. Run:
```bash
node scripts/check-overflow.js assets/covers/assembled.html
```
It checks both directions, and the two failures have **opposite** remedies:

- **Exit 2 — `OVERFLOW`, a page is too tall.** Add another content page to the map (update step 3), clone the relevant component into a new page, and re-run. Shortening the content is only an option for text you authored yourself; user-supplied copy must stay verbatim.
- **Exit 3 — `HORIZONTAL CLIP`, an element is cut off sideways.** Never add a page for this. The report names the offending element, its component, its path and its text. Fix it in place: drop a `white-space: nowrap`, move an over-long badge chip's text into the cell as plain text, set explicit `<th>` widths, or move a wide table to the `gcs-table-chart` embed pattern.

Never export past either warning.

**7. Fidelity and design-token gate (mandatory).** Run both checks:
```bash
# Content fidelity (verbatim text, no residual tokens, no template sample text)
node scripts/check-fidelity.js --source <source-content.txt> --html assets/covers/assembled.html

# Design token lint (palette, fonts, component catalog, local asset paths resolve)
node scripts/check-fidelity.js --design-lint --html assets/covers/assembled.html
```
The `--design-lint` flag checks: (a) every hex colour is from the approved GCS palette; (b) every `font-family` is Heebo, Yrsa, or JetBrains Mono; (c) every `data-component` value is from the approved component catalog; (d) every local `<img src>`/CSS `url()` reference resolves to a file that actually exists. **Never render the PDF past a failure** — fix the HTML and re-run.

**8. Render the PDF.**
```bash
node scripts/html-to-pdf.js assets/covers/assembled.html output.pdf --expect-pages=<N>
```
Set `--expect-pages` to your page map's count from step 3.

**9. Visually verify before delivery.** Read the PDF file using the Read tool to inspect it. Follow "Auto-Fit Content (MANDATORY VERIFICATION)" below. This is the final gate regardless of how the HTML was produced. On top of the overflow/fit checks below, scan **every page** for these specific failure signatures (each one has shipped in a real brochure before):

- **Invisible or low-contrast text** — cover title/subtitle (or any text styled for a dark photo background) reading as pale/washed-out means its background image failed to load. Don't just check that text is *present*; check that it's *legible*.
- **Broken-image glyphs** — a small broken-picture icon or a boxed "?"/"tofu" character means a logo, flag, or icon reference didn't resolve.
- **Doubled or ghosted text** — the same heading or line appearing twice, at different sizes, or overlapping another element, usually means a font failed to load and a fallback font's different metrics broke the layout.
- **Elements clipped by the page edge or overlapping each other** (e.g. a numbered circle overlapping a heading) — same root cause as above, or a component reused outside its documented content budget.

If any of these appear, don't just re-render with different scale/margins (that's for the overflow case) — first suspect a broken local asset path or missing font and re-run step 7's `--design-lint` to confirm before touching layout.

For a plain "convert this HTML to PDF" request with no brochure template involved, skip straight to step 8/9 — everything below this point (Why Puppeteer, Options Reference, RTL best practices, troubleshooting) applies either way.

---

## Why Puppeteer?

- **Pixel-perfect rendering**: Uses actual Chrome engine
- **Full CSS3/HTML5 support**: Flexbox, Grid, custom fonts, backgrounds
- **JavaScript execution**: Renders dynamic content
- **Automatic RTL detection**: Detects Hebrew/Arabic and sets direction
- **Web font support**: Loads custom fonts properly

## Auto-Fit (Built-in, No Flag Needed)

The script automatically handles content overflow:

- **Small overflow (up to ~18%)** → auto-shrinks font size to fit the page
- **Large content** → flows cleanly across multiple pages with smart page-break rules (no cutting headers, table rows, or images in half)
- **Fits perfectly** → does nothing

This runs automatically on every PDF generation. No flags needed.

## CRITICAL: Fit Content to Single Page

**Backgrounds on `html` or `body` cause extra pages!** Put backgrounds on a container element instead:

```css
@page { size: A4; margin: 0; }

html, body {
  width: 210mm;
  height: 297mm;
  margin: 0;
  padding: 0;
  overflow: hidden;
  /* NO background here! */
}

.container {
  width: 100%;
  height: 100%;
  padding: 20mm;
  box-sizing: border-box;
  background: linear-gradient(...); /* Background goes HERE */
}
```

The assembled brochure already follows this rule correctly (background lives on each `[data-doc-page]`, never on `body`) — this section matters when converting HTML that didn't come from the component assembly workflow.

**Common causes of extra pages:**
1. **Background on html/body** - always put on `.container` instead
2. Content overflow - use `overflow: hidden`
3. Margins/padding pushing content out

**Tips:**
- Use `--scale=0.75 --margin=0` if content still overflows
- For landscape: use `--landscape`

## Setup (One-time)

Before first use, install dependencies (from this skill's own directory, `skills/design-brochure-pdf/`):

```bash
cd skills/design-brochure-pdf && npm install
```

## Quick Usage

### Convert local HTML file:
```bash
node scripts/html-to-pdf.js input.html output.pdf
```

### Convert URL to PDF:
```bash
node scripts/html-to-pdf.js https://example.com page.pdf
```

### Hebrew document with forced RTL:
```bash
node scripts/html-to-pdf.js hebrew.html hebrew.pdf --rtl
```

### Pipe HTML content:
```bash
echo "<h1>שלום עולם</h1>" | node scripts/html-to-pdf.js - output.pdf --rtl
```

## Options Reference

| Option | Description | Default |
|--------|-------------|---------|
| `--format=<format>` | Page format: A4, Letter, Legal, A3, A5 | A4 |
| `--landscape` | Use landscape orientation | false |
| `--margin=<value>` | Set all margins (e.g., "20mm", "1in") | 20mm |
| `--margin-top=<value>` | Top margin | 20mm |
| `--margin-right=<value>` | Right margin | 20mm |
| `--margin-bottom=<value>` | Bottom margin | 20mm |
| `--margin-left=<value>` | Left margin | 20mm |
| `--scale=<number>` | Scale factor 0.1-2.0 | 1 |
| `--background` | Print background graphics | true |
| `--no-background` | Don't print backgrounds | - |
| `--header=<html>` | Header HTML template | - |
| `--footer=<html>` | Footer HTML template | - |
| `--wait=<ms>` | Wait time for fonts/JS | 1000 |
| `--rtl` | Force RTL direction | auto-detect |
| `--expect-pages=<N>` | Expected page count (warns if different) | 1 |
| `--no-page-check` | Disable page count warning | - |

## Automatic Overflow Detection

The script automatically checks page count after generating the PDF. By default, it expects 1 page and warns if the output has more:

```
⚠️  WARNING: PAGE OVERFLOW DETECTED!
   Expected: 1 page(s)
   Actual:   2 page(s)

   Fix: Reduce content, margins, or font sizes in HTML
   Use --no-page-check to disable this warning
```

**Usage:**
- Default: expects 1 page, warns on overflow
- `--expect-pages=3`: expects 3 pages (for multi-page documents — set this to your page map's count, see workflow steps 3 and 8)
- `--no-page-check`: disables the check entirely

**Note:** Requires `pdfinfo` to be installed (part of poppler-utils). If not available, the check is silently skipped.

## Examples

### Basic conversion:
```bash
node scripts/html-to-pdf.js report.html report.pdf
```

### Letter format with custom margins:
```bash
node scripts/html-to-pdf.js doc.html doc.pdf --format=Letter --margin=1in
```

### Hebrew invoice:
```bash
node scripts/html-to-pdf.js invoice-he.html invoice.pdf --rtl
```

### Landscape presentation:
```bash
node scripts/html-to-pdf.js slides.html slides.pdf --landscape --format=A4
```

### No margins (full bleed):
```bash
node scripts/html-to-pdf.js poster.html poster.pdf --margin=0
```

## Hebrew/RTL Best Practices

For best Hebrew rendering in your HTML:

1. **Set lang attribute**: `<html lang="he" dir="rtl">`
2. **Use UTF-8**: `<meta charset="UTF-8">`
3. **CSS direction**: Add `direction: rtl; text-align: right;` to body
4. **Fonts**: use this design system's Heebo (`--font-sans` in `tokens/typography.css`) — it's already the sans-serif used everywhere in this repo and has excellent native Hebrew glyph coverage. Don't reach for Noto Sans Hebrew or Assistant — they aren't part of this system's type scale.

If you're building the page from scratch (not going through the brochure component workflow above), start from `references/design-system.md`'s color/type values plus the print-CSS block quoted in "CRITICAL: Fit Content to Single Page" above. For Hebrew content, the only difference is the root element and the container's direction:

```html
<html lang="he" dir="rtl">
...
<div class="container" style="direction: rtl; text-align: right;">
```

## CRITICAL: Always Use scale=1.0 for Multi-Page PDFs

**NEVER use `--scale` < 1.0 for multi-page documents.** It causes:
- Content offset (not centered on page)
- RTL text overflow/clipping in grid layouts
- Unpredictable viewport width calculations

**Instead: reduce CSS font sizes and spacing to fit content at scale=1.0.**

```css
.page {
  width: 210mm;         /* Matches A4 exactly at scale=1.0 */
  height: 297mm;        /* Matches A4 exactly at scale=1.0 */
  padding: 8mm 10mm 12mm;
  page-break-after: always;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}
```

**If content overflows at scale=1.0:** reduce font sizes (10-11px base), padding, margins — NOT the scale.

## Troubleshooting

### Fonts not rendering correctly
- Add `--wait=2000` for more font loading time
- Ensure fonts are loaded via `@font-face` or Google Fonts

### Hebrew appearing left-to-right
- Use `--rtl` flag to force RTL direction
- Add `dir="rtl"` to your HTML element

### Page breaks not working
Use CSS page-break properties:
```css
.page-break { page-break-after: always; }
.no-break { page-break-inside: avoid; }
```

### Backgrounds not showing
- Ensure `--background` is set (default is true)
- Use `--no-background` only if you want to exclude backgrounds

## Auto-Fit Content (MANDATORY VERIFICATION)

**CRITICAL - Claude MUST do this after EVERY PDF generation:**

1. **Read the PDF file** using the Read tool to visually inspect it
2. Check for **vertical overflow** (empty pages, content spilling to next page)
3. Check for **horizontal overflow** (text cut off at sides)
4. **If ANY issue found → FIX and regenerate** (max 5 attempts)
5. **Only deliver PDF to user after verification passes**

This is NOT optional. Never deliver a PDF without visual verification.

### Problems to Look For

| Problem | Symptom | Fix |
|---------|---------|-----|
| **Vertical overflow** | Empty space at page bottom, content on next page | Reduce `--scale` |
| **Horizontal cut-off** | Text cut at left/right edges | Reduce `--margin` AND fix HTML width |
| **Both issues** | Content cut AND extra pages | Fix HTML CSS first, then adjust scale |

### Fix Strategy (Max 5 Attempts)

**Attempt 1:** Default settings
```bash
node scripts/html-to-pdf.js assets/covers/assembled.html output.pdf --expect-pages=<N>
```

**Attempt 2:** If vertical overflow → reduce scale
```bash
node scripts/html-to-pdf.js assets/covers/assembled.html output.pdf --expect-pages=<N> --scale=0.9
```

**Attempt 3:** If horizontal cut-off → reduce margins
```bash
node scripts/html-to-pdf.js assets/covers/assembled.html output.pdf --expect-pages=<N> --scale=0.9 --margin=10mm
```

**Attempt 4:** If still issues → smaller scale + margins
```bash
node scripts/html-to-pdf.js assets/covers/assembled.html output.pdf --expect-pages=<N> --scale=0.8 --margin=5mm
```

**Attempt 5:** If still failing → FIX THE HTML CSS (add to the overflowing component):
```css
.container {
  width: 100%;
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
  box-sizing: border-box;
}
```

**STOP after 5 attempts** — go back to the page map (step 3) and split overflowing content across two pages.

For a brochure produced via the component workflow, prefer going back to steps 3–4 (add a page to the page map — shorten only Claude-authored copy, never the user's) over adjusting `--scale`/`--margin` — these pages are fixed-size print layouts, and `scripts/check-overflow.js` in step 6 should already have caught real overflow before you get here.

### HTML Width Fix (Required for Horizontal Fit)

If content is cut at sides, the HTML MUST have:

```css
html, body {
  width: 210mm;  /* A4 width */
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.container {
  width: 100%;
  max-width: 100%;
  padding: 15mm;
  box-sizing: border-box;
  overflow-wrap: break-word;
}
```

### Verification Checklist

After EVERY PDF generation, verify:
- [ ] All text visible (not cut at edges)
- [ ] All text legible — none reading as pale/washed-out against its background
- [ ] No unnecessary empty pages
- [ ] Content fills pages properly
- [ ] No large gaps between sections
- [ ] No broken-image glyphs (missing logo/flag/icon)
- [ ] No doubled/ghosted text or elements overlapping each other

If ANY check fails → adjust and regenerate (max 5 times).

## Technical Notes

- Uses Puppeteer with Chrome headless for rendering
- Waits for `networkidle0` to ensure all resources load
- Automatically waits for `document.fonts.ready`
- Supports `@page` CSS rules for print styling
- Device scale factor set to 2 for crisp rendering
