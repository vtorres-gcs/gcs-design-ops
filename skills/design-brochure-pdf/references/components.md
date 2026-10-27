# GCS Brochure Component Library

Master reference for all 14 content components available in `skills/design-brochure-pdf/components/`.
Read this before composing any content page. Components go inside the chrome wrapper
(`_chrome-gcs.html` or `_chrome-giu.html`). The chrome header + footer consume ~100px of the
1123px page height, leaving **~1023px** for components.

---

## Page composition rules

- Target **1–2 components per page**. Three is the maximum before overflow risk becomes high.
- Fixed-height components (`stat-strip-*`, `pull-quote`, `hero-image`, `cta-panel`, `bio-card`)
  do not stretch — plan page fill carefully.
- Growing components (`narrative`, `toc`, `article-list`, `timeline`) expand with content.
- After composing, run `check-overflow.js` and `check-fidelity.js --design-lint`.
- Chrome (`_chrome-gcs.html` or `_chrome-giu.html`) always wraps every content page.
  Covers and the back cover are never wrapped in chrome.

---

## _chrome-gcs
**File:** `components/_chrome-gcs.html`

Content page shell — GCS brand. Drop component HTML between the `<!-- INSERT COMPONENTS -->` markers.

**Placeholders (plain text, not `{{ }}`)**
- `EYEBROW_TEXT` — Section label in the left header (e.g. "Investment Options", "About the Programme")
- `PAGE_NUMBER` — Folio number right-aligned in the footer (e.g. "03")
- `YEAR` — Copyright year in the footer (e.g. "2026")

**Height consumed:** 56px header + 44px footer = **100px**; content area = **1023px**

---

## _chrome-giu
**File:** `components/_chrome-giu.html`

Content page shell — GIU sub-brand. Same placeholders and height as `_chrome-gcs.html`.
Use for all GIU Calendar and GIU Corporate brochures.

---

## narrative
**File:** `components/narrative.html`

Running text block — section heading + lead paragraph + up to 3 body paragraphs + optional
sub-section heading and body.

**When to use:** Programme introductions, context setting, editorial analysis pages.
Do NOT use for data — use `stat-strip-*` or `table-ranking` for numbers.

**Height estimate (approximate)**
- Heading + lead + 2 body paragraphs: ~500px
- Full block (all 6 paragraphs): ~850px — fills most of the page; leave room for a `pull-quote` below

**Parameters**
| Placeholder | Description |
|---|---|
| `SECTION_LABEL` | Small ALL-CAPS eyebrow above heading (e.g. "Programme Overview") |
| `HEADING_TEXT` | Yrsa 42px heading |
| `LEAD_PARAGRAPH` | Bold/larger opening paragraph |
| `BODY_PARAGRAPH_1` — `BODY_PARAGRAPH_3` | Body paragraphs; omit unused |
| `SUB_SECTION_HEADING` | Optional Yrsa 22px sub-heading |
| `SUB_SECTION_BODY` | Optional paragraph after sub-heading |

**Source:** extracted from lead-magnet page 3, quarterly-report page 3

---

## pull-quote
**File:** `components/pull-quote.html`

Quote block highlighting a memorable statement from a client, expert, or official source.
Two variants — text-only (Variant A) and photo + quote (Variant B).

**When to use:** One strong quote per section. Avoid for data; avoid for quotes over 50 words.

**Height estimate**
- Variant A (text only): ~110–140px
- Variant B (circular photo + quote): ~150–180px

**Parameters**
| Placeholder | Description |
|---|---|
| `QUOTE_TEXT` | Verbatim quote, no quotation marks (added by CSS) |
| `ATTRIBUTION` | Speaker name + role/date, e.g. "— GCS Client, Dubai · 2024" |
| `PHOTO_SRC` | (Variant B only) Path/URL to circular headshot |

**Source:** extracted from case-study page 2, quarterly-report page 3, lead-magnet page 5

---

## stat-strip-dark
**File:** `components/stat-strip-dark.html`

Dark horizontal strip of 2–4 stat tiles — Night Blue background, Yrsa large value,
Heebo ALL-CAPS label.

**When to use:** Key numbers at a glance (fund size, processing time, approval rate).
Pairs well with `hero-image` on the same page.

**Height estimate:** ~96px fixed (including strip padding)

**Parameters**
| Placeholder | Description |
|---|---|
| `STAT1_VALUE` — `STAT4_VALUE` | Large Yrsa value (e.g. "€250K", "18 Months", "98%") |
| `STAT1_LABEL` — `STAT4_LABEL` | Heebo ALL-CAPS label (e.g. "Min. Investment", "Avg. Processing") |

Omit tile divs for 2- or 3-stat versions. Last tile has no `border-right`.

**Source:** extracted from lead-magnet page 3, case-study page 4

---

## stat-strip-light
**File:** `components/stat-strip-light.html`

Light 3-column stat grid — `#F7F8FD` background with `#ECEDF5` gap borders.
Each tile has a label, large Yrsa value, and a short descriptor line.

**When to use:** Programme highlights with descriptive context (e.g. processing time +
"from application to approval"). Use instead of `stat-strip-dark` when the page has a
light feel or is near a `hero-image` that already supplies visual weight.

**Height estimate:** ~120px per row (1 row of 3 tiles = ~120px)

**Parameters**
| Placeholder | Description |
|---|---|
| `STAT1_LABEL` — `STAT3_LABEL` | Heebo ALL-CAPS tile label |
| `STAT1_VALUE` — `STAT3_VALUE` | Yrsa 38px value |
| `STAT1_DESC` — `STAT3_DESC` | Short descriptor below the value |

**Source:** extracted from factsheet page 2

---

## hero-image
**File:** `components/hero-image.html`

Full-width photo block with optional gradient overlay and caption.

**When to use:** Visual break in editorial sections; "country at a glance" pages.
One per page maximum — do not stack two hero-images.

**Height estimate:** 420px fixed

**Parameters**
| Placeholder | Description |
|---|---|
| `IMAGE_SRC` | Absolute path or URL to the image |
| `SECTION_LABEL` | ALL-CAPS caption label (e.g. "Italy") |
| `IMAGE_TITLE` | Short caption title (Yrsa 24px, over gradient) |

Fallback: swap the `<img>` for a solid `#000957` background block if no image is available.

**Source:** extracted from lead-magnet page 4, factsheet page 2

---

## table-ranking
**File:** `components/table-ranking.html`

Data table with optional flag column, badge status indicators, and sortable header.
Flags fetched from `msikma/country-flags` PNGs; badges use `data-level="green|amber|red"`.

**When to use:** Programme comparison tables, ranking lists, investment option summaries.
For complex multi-table pages (GIU Corporate style), see `giu-corporate` source directly.

**Height estimate:** header row ~40px + each data row ~44px
- 6 rows: ~304px; 10 rows: ~480px

**Parameters**
| Placeholder | Description |
|---|---|
| `TABLE_LABEL` | Section eyebrow above table |
| `TABLE_HEADING` | Yrsa table heading |
| `COL1` — `COL4` | Column header labels |
| `ROW_N_*` | Per-row cell values (clone the `<tr>` block per row) |

For flag cells: `<img src="https://raw.githubusercontent.com/msikma/country-flags/master/svg/flag-[ISO2].svg">`
with `width: 20px; height: 20px; object-fit: cover; border-radius: 50%; border: 1px solid #ECEDF5`.

For badge cells: `<span class="gc-badge" data-level="green">Approved</span>`

**Source:** extracted from giu-corporate (table pages), lead-magnet page 6, factsheet right panel

---

## timeline
**File:** `components/timeline.html`

Vertical process timeline — numbered steps connected by a gradient line.

**When to use:** Application process, onboarding steps, programme phases.
Up to 5 steps; 4 is the sweet spot for a single page alongside a `stat-strip-dark`.

**Height estimate**
- 4 steps: ~500px; 5 steps: ~620px
- Pair with a `stat-strip-dark` (~96px) for a full content page

**Parameters**
| Placeholder | Description |
|---|---|
| `TIMELINE_HEADING` | Yrsa heading (e.g. "The Application Process") |
| `TIMELINE_SUBTITLE` | Heebo subtitle / intro |
| `STEP1_TITLE` — `STEP5_TITLE` | Step name (Yrsa 17px) |
| `STEP1_DURATION` — `STEP5_DURATION` | Time indicator (e.g. "Weeks 1–2") |
| `STEP1_DESC` — `STEP5_DESC` | 1–2 sentence step description |

Omit the last step block for 4-step timelines. Last step circle colour: `#3D51E8`.

**Source:** extracted from lead-magnet page 7, case-study page 3

---

## bio-card
**File:** `components/bio-card.html`

Person card — circular avatar + name + title + location.
Variant A: single card. Variant B: 2-column grid (uncomment from file).

**When to use:** CTA pages introducing advisors; case study "meet the team" sections.
Do NOT use for client profiles — use the case-study sidebar pattern instead.

**Height estimate:** Variant A ~120px; Variant B ~140px

**Parameters**
| Placeholder | Description |
|---|---|
| `NAME` | Full name |
| `TITLE` | Job title or specialisation |
| `LOCATION` | City, Country |
| `PHOTO_SRC` | Path/URL to headshot (object-fit: cover, centre-top crop) |

For Variant B: use `PHOTO1_SRC`, `NAME1`, `TITLE1`, `LOCATION1` etc.

**Source:** extracted from quarterly-report page 3 CTA

---

## article-list
**File:** `components/article-list.html`

Newsletter-style rows — thumbnail image + Yrsa link title + Heebo excerpt.

**When to use:** Quarterly report "this issue" page; publication round-ups with 3–5 articles.
Do NOT use for investment option lists — use `table-ranking` for structured comparison data.

**Height estimate:** each row ~124px
- 3 articles: ~372px; 5 articles: ~620px

**Parameters**
| Placeholder | Description |
|---|---|
| `ARTICLE1_URL` — `ARTICLE5_URL` | Full verbatim URL for the article link |
| `ARTICLE1_TITLE` — `ARTICLE5_TITLE` | Article headline (Yrsa, Electric Blue link) |
| `ARTICLE1_EXCERPT` — `ARTICLE5_EXCERPT` | 1–2 sentence excerpt |
| `ARTICLE1_IMG` — `ARTICLE5_IMG` | Optional thumbnail (120×80px); omit the `<div>` if no image |

Omit the article `<div>` blocks beyond the count you need. Add `border-bottom` to the last visible row.

**Source:** extracted from quarterly-report page 2

---

## toc
**File:** `components/toc.html`

Table of contents — numbered section rows with title, description, and page reference.

**When to use:** Brochures with **5 or more sections** only. Lead Magnet, GIU Corporate,
GIU Calendar. Do NOT add a TOC to Case Study or Factsheet brochures.

**Height estimate:** header block ~120px + each row ~58px
- 6-row TOC: ~468px — leaves room for a brief intro paragraph above if needed

**Parameters**
| Placeholder | Description |
|---|---|
| `TOC_SUB_LABEL` | Small ALL-CAPS label above heading (e.g. "Contents") |
| `TOC_TITLE` | Yrsa 42px heading (e.g. "What's Inside") |
| `ITEM1_TITLE` — `ITEM6_TITLE` | Section title (Yrsa 20px) |
| `ITEM1_DESC` — `ITEM6_DESC` | One-line section description (Heebo 11px, muted) |
| Page numbers | Hardcode the actual page number in the right column per row |

Clone the item row block for each section. Last item always gets `border-bottom` too.

**Source:** extracted from lead-magnet page 2, giu-corporate page 2

---

## month-grid
**File:** `components/month-grid.html`

12-month publication calendar — 3 columns × 4 rows with colour-coded dot indicators.

**When to use:** GIU sub-brand only. Annual publication schedule pages.
This component fills a full content page — do not combine with other components.

**Height:** fills full content area (~1023px) — one per page, standalone

**Dot colours**
| Colour | Type |
|---|---|
| `#000957` Night Blue | Report |
| `#3D51E8` Electric Blue | Briefing |
| `#7B8FFF` Periwinkle | Index |

**Parameters**
| Placeholder | Description |
|---|---|
| `CALYEAR` | 4-digit year (e.g. "2026") |
| `GRID_HEADING` | Yrsa heading (e.g. "A Year of Intelligence") |
| `JAN_EVENT_1` — `DEC_EVENT_1` | Event name per month; clone the event row for multiple events in one month |

To highlight a month: change its cell border to `1.5px solid #000957` and background to `#F7F8FD`.

**Source:** extracted from giu-calendar page 2

---

## cta-panel
**File:** `components/cta-panel.html`

Dark Night Blue call-to-action block — Yrsa heading + Heebo body + optional result stat strip.

**When to use:** Closing page before the back cover. "Ready to start?" / "Speak to an advisor."
Case study results pages (use the built-in result stat strip). Pair with `bio-card` below on the same page.
Do NOT use for the actual back cover — use `assets/covers/back-cover.html`.

**Height estimate**
- Without result strip: ~320px
- With 3-stat result strip: ~420px
- + `bio-card` Variant B (~140px) → ~560px total — fits comfortably

**Parameters**
| Placeholder | Description |
|---|---|
| `CTA_LINE1` | First Yrsa heading line (roman) |
| `CTA_LINE2` | Second Yrsa heading line (italic, muted) |
| `CTA_BODY` | Heebo body text (1–3 sentences) |
| `CTA_EMAIL` | Contact email address (verbatim) — omit the div if not needed |
| `RESULT1_VALUE` — `RESULT3_VALUE` | Yrsa 38px stat value in result strip |
| `RESULT1_LABEL` — `RESULT3_LABEL` | ALL-CAPS stat label in result strip |

Omit the entire result strip `<div>` for pure CTA panels.

**Source:** extracted from case-study page 3, quarterly-report page 3

---

## Covers and back cover

These are not composable components — they are fixed-format files:

| File | Brand | Type | Tokens |
|---|---|---|---|
| `assets/covers/cover-gcs.dc.html` | GCS | Cover page | `{{ eyebrowLabel }}`, `{{ eyebrow }}`, `{{ coverTitleLine1 }}`, `{{ coverTitleLine2 }}`, `{{ subtitle }}` |
| `assets/covers/cover-giu.dc.html` | GIU | Cover page | `{{ eyebrow }}`, `{{ coverTitleLine1 }}`, `{{ coverTitleLine2 }}`, `{{ coverSubtitle }}` |
| `assets/covers/back-cover.html` | GCS / GIU | Back cover | None — fully static |

Cover files are processed by `populate-template.js`. The back cover is copied verbatim.
