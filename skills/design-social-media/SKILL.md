---
name: design-social-media
description: "Creates social media creatives with the Global Citizen Solutions visual identity: multi-slide carousels (Instagram/LinkedIn/X/Facebook), single-image posts, vertical Stories (1080×1920), and LinkedIn posts. Give it a topic, draft copy, an article, a DOCX/Markdown file, or a URL — it plans the slides, writes the copy, and builds one editable HTML file. Before any PNG/PDF is rendered, it always opens that HTML in the Browser pane for live text edits, plus plain-language chat requests for anything else (photos, layout, slide order) — Claude applies changes directly to the HTML — and keeps iterating until the user approves. Use whenever the user mentions a carousel, social post, story, slide post, Instagram/LinkedIn/social content, or wants to turn any text or article into GCS-branded social imagery — even if they never say 'carousel'. Does NOT create paid ads: Google Ads and Meta Ads formats are out of scope."
allowed-tools: Bash(*), Edit, Write, mcp__Claude_Browser__preview_start, mcp__Claude_Browser__navigate, mcp__Claude_Browser__javascript_tool, mcp__Claude_Browser__computer, mcp__Claude_Browser__read_page, mcp__Claude_Browser__tabs_create, mcp__Claude_Browser__tabs_close
metadata:
  last_updated: "2026-09-08"
  updated_by: codex-gcs-integration-20260906
  change_note: "Preserved existing production flow and added image-source and external prompt help"
---

# Social Media — Global Citizen Solutions

Generates **Carousels**, **Single Posts**, **Stories** and **LinkedIn Posts** with the GCS visual identity. Slides are authored as one editable HTML file, rendered with **Playwright**. Before any PNG/PDF is rendered, the generated HTML always opens in the Browser pane so the user can click into any text and retype/reformat it directly in the live preview — plain-language chat requests still cover anything beyond text (add/remove a slide element, swap a photo, reorder slides). Only after the user approves does rendering happen.

## Self-contained — runs anywhere

This folder carries everything it needs. Copy `skills/gcs-social-media/` on its own to any machine with Python 3, `playwright` and `pillow`, and every format renders — fonts, logos, quote marks, CTA background and the Trustpilot graphics all come from `assets/` in this folder, loaded by `scripts/gcs_assets.py`.

```bash
python3 <SKILL_DIR>/scripts/gcs_assets.py    # verify the bundle before a long job
```

Only two things need internet: fetching a new Material Symbols icon with `curl` (they are pasted inline as SVG, never bundled — same as `gcs-brochure`) and `flag_uri()` (country flags). Everything else is offline. **Never** resolve an asset through a repo root, a `Path.cwd()` walk-up, `templates/`, or the design system's `assets/uploads/` — none of those exist on the target machine. If a new asset is needed, bundle it under `assets/` and expose it in `scripts/gcs_assets.py`.


## Supported formats

| Format | Dimensions | Aspect | Outputs |
|---|---|---|---|
| **Carousel** — Instagram / LinkedIn | 1080 × 1350 px | 4:5 | PNG per slide + PDF of all slides |
| **Carousel** — Twitter/X / Facebook | 1080 × 1080 px | 1:1 | PNG per slide + PDF of all slides |
| **Single Post** | 1080 × 1350 px (4:5 default; 1:1 on request) | 4:5 | PNG |
| **Story** | 1080 × 1920 px | 9:16 | PNG |
| **LinkedIn Post** — Landscape | 1200 × 627 px | 1.91:1 | PNG |
| **LinkedIn Post** — Square | 1080 × 1080 px | 1:1 | PNG |

Every job produces **all** listed outputs — the editable HTML is the source of truth, the PNGs/PDF are rendered from it.

## Reference files — read before generating

| File | When to read |
|---|---|
| `references/design-system.md` | **Always**, before writing any slide HTML — colour tokens, typography, logo rules, consistency rules, common errors |
| `references/slide-library.md` | **Always**, before writing any slide HTML — the slide type templates (carousel, single post, story) and the visual-asset snippets (stat cards, charts, tables, timelines, ranked lists) |
| `references/rendering.md` | At generation time — font embedding, image embedding, the Playwright render pipeline, PNG/PDF export |

---

## Workflow

```
1. Understand the input   → what did the user give me, what format do they want?
2. Create the content     → adapt or write the copy for the chosen format
3. Plan (+ approval when Claude authored the content)
4. Generate               → build the editable HTML (no render yet)
5. Open in browser        → live text edits in the preview, captured back into the HTML file
6. Render & review        → render PNG previews, keep iterating (browser edits or chat requests) until approved
7. Deliver                → finalize PDF (carousels) → offer next steps
```

### Step 1 — Understand the input

The user may provide any combination of: a topic or idea, complete text, a draft, a DOCX file, Markdown, plain text, an existing article or report, a URL, and instructions (audience, objective, tone, CTA, slide count, format).

#### Photo source — resolve only when the chosen layout needs imagery

Use any image and purpose already supplied; do not ask the user to upload it
again. Infer format and image purpose first. A layout reference is not a cover
photo: use the reference gate below when appropriate.

For a photo-based layout with no usable image, ask in the user's language:

> 🖼️ **Where should the image come from?**
> 1. I have a photo — I will upload it.
> 2. Help me create an image — prepare a prompt or generate it here if available.
> 3. Use a layout without a photo, if this format allows it.
>
> Reply with the number or describe what you prefer.

Offer only applicable choices. Text, data, quote, CTA and Trustpilot layouts do
not require a photo; Trustpilot still requires a real supplied review, never an
invented one. Photo-based covers, inner slides, Single Post photo hooks and
LinkedIn Post templates need an image or an explicitly accepted layout change.
Do not silently replace a required photo or interpret silence as a choice.
For extra inner-slide imagery ask once, when useful, “1. Add more photos; 2.
Continue with the existing images and Night Blue backgrounds.” Accept multiple
files together. Do not search for photos unless the user requests it.

For option 2, first apply the imagery rules in
[image handoff](references/image-handoff.md). Check the actual tools available
in this session. If there is no image-generation tool, including in a Claude
session without one, provide the completed prompt in a fenced text block for
Gemini or ChatGPT and tell the user to generate there and upload the image here.
A prompt is not a generated image. Continue with content/planning while waiting
when useful, but do not render a photo-based layout as if the image exists.

#### Reference image gate — runs after the photo gate

If a supplied image shows signs of being a **layout reference** rather than a content photo, activate **Reference Mode** before moving to Step 2.

**Layout-reference signals:** "make something like this" · "take inspiration from this" · "similar to this image" · "use as reference" · "replicate this style" · an image sent with no copy attached, before the topic is given.

**Content-photo signals** (do *not* activate): "cover photo" · "foto de capa" · a landscape/portrait/event image sent alongside defined copy or a defined topic.

**If Reference Mode activates:**

1. Confirm: *"I'll use this image as a layout reference — I'm reading the structure, not the content or the branding."*
2. Analyse and describe in writing: number of visual zones and their hierarchy · background type (photo, solid, gradient) · logo position · headline treatment (relative size, weight, position) · secondary elements (icons, badges, overlines, CTAs) · visual density (minimal, moderate, dense).
3. Map it to an existing Type (1–11), or propose **Type 12 (Custom Layout)** — see `references/slide-library.md`.
4. Show the proposal and wait for approval before writing any HTML.
5. Never copy external brand elements — logos, colours, or typefaces from the reference. The analysis is structural, not visual. The GCS brand invariables always apply: the output is GCS, not a copy of the original.
6. If the reference is not analysable (low resolution, ambiguous content), ask the user to describe what they want replicated.

**Infer before asking.** After the photo gate is resolved, infer the remaining details. Only ask about things you genuinely cannot infer:

- **Format** — if not stated, infer from the content: multi-point content → Carousel; one strong message → Single Post; announcement / teaser / high-impact stat → Story; one strong headline meant specifically for the LinkedIn feed → LinkedIn Post. If genuinely ambiguous, ask once.
- **LinkedIn Post orientation** — if the user asks for a LinkedIn Post but doesn't say landscape or square, default to Landscape (1200×627) and ask only if it matters for their placement.
- **Platform** (carousels only) — default to Instagram/LinkedIn (1080×1350) unless the user says otherwise.
- **Language** — write in the language of the user's content/request. Only ask if the input mixes languages.

**Reading input files:** DOCX → extract with `pandoc` or python-docx; Markdown/plain text → read directly; URL → fetch the page and extract the article text (if fetching fails, ask the user to paste the content).

### Step 2 — Create the content

Understand the *purpose* of the content and adapt it to the format:

- **Carousel** — break the content into logical slides: hook → context/points (one idea per slide) → optional quote → CTA. Typical 5–8 slides; hard platform limits in `references/slide-library.md`.
- **Single Post** — distil the key message into one canvas. One headline, minimal supporting copy, clear takeaway.
- **Story** — concise messaging, high visual impact. Uses the same Type 1–11 frame system as the Carousel (see `references/slide-library.md`), just on a 1080×1920 canvas — pick the frame types that fit the message; a Story does not need to use all 11.
- **LinkedIn Post** — headline only, no body copy or CTA text on the canvas. Write a two-line headline: a main statement and an italic highlight line (see `references/slide-library.md`). The call to action belongs in the LinkedIn post caption, not the image.

You decide: number of slides, information hierarchy, text distribution, visual balance, and CTA placement.

**Two modes — choose before touching the text:**

**A — You are authoring the content** (user gave a topic, brief, or rough notes): write or improve freely. The result should read as professionally crafted marketing content — simplify long paragraphs, write stronger headlines, surface the most important data, adapt phrasing for social, write engaging CTAs — while staying factually faithful to the source.

**B — User provided ready-to-use content** (finished text, a document, a DOCX, a pasted draft they explicitly consider done): **preserve verbatim**.
- Preserve all text exactly as written. Do not paraphrase, reorder, correct, omit, or add content.
- Preserve all URLs, email addresses, hyperlinks, and anchor text exactly. Never remove or modify links.
- You may break a long block into separate slides (one idea per slide) and add an overline, but do not rewrite the sentences.

**GCS copywriting voice** (applies to mode A only): professional yet accessible · direct · authority without arrogance. Use verifiable data, the language of choice and control, action verbs, and the questions the reader is already asking. Avoid generic superlatives, legal jargon, guaranteed promises, and aggressive sales language.

**Three messaging pillars to draw from:**
- **Optionality** — having another option in place; not relying on one country; planning ahead (not reacting to pressure).
- **Security and Access** — a legally established alternative; greater control over where you live and operate; reducing single-jurisdiction risk.
- **Family and Future Generations** — benefits that extend to children and future generations; planning for the family, not just the individual.

**Terms to avoid in copy:**
- Never write "relocation firm", "passport shop", "passport scheme", "citizenship by investment firm" — the firm is a **residency and citizenship planning advisory**.
- Never write "borderless living", "dream lifestyle", or "fallback option" — use "optionality", "plan B" (sparingly, with explanation), or "multi-jurisdictional strategy".
- Never describe a programme as a "passport programme" — use "citizenship programme" or "residency programme".
- UK English throughout: "programme", "colour", "organised", "authorised". No emoji. No exclamation marks.

### Step 3 — Plan and approval

Two paths, depending on who authored the content:

**A — User gave only a topic, idea, or brief.** You are authoring the content, so present it for approval before rendering:

```
📋 PLAN — [Carousel / Single Post / Story]

Topic · Language · Platform · No. of slides

Slide 1 — [type + role]
  Headline: …
  Highlight: …   ← italic, lighter-tint second line — Cover slide (Type 1) only
  Body/asset: …
  Photo: [user-provided cover photo]   ← cover slide always uses the provided photo
[…one block per slide…]

Approve, or tell me what to change — I can rewrite copy,
change slide types, or add/remove slides.
```

Wait for an explicit go-ahead. Silence, questions, or doubts are not approval.

**B — User provided ready content.** Skip the approval step. Briefly state your slide mapping in one or two sentences ("I'll split this into 6 slides: hook, 4 points, CTA") and generate immediately. **Preserve all text verbatim** (see Step 2 mode B). Only fall back to path A if the content is so unstructured that a coherent slide order is genuinely unclear.

### Step 4 — Generate

1. Read `references/design-system.md` and `references/slide-library.md`.
2. **Load the bundled assets.** Every generation script starts with the bootstrap in `references/rendering.md` (`sys.path.insert` on `<SKILL_DIR>/scripts`, then `from gcs_assets import ...`). Fonts, logos, quote marks, the CTA background and the Trustpilot graphics are read from this skill's own `assets/` folder — never from a repo path, never from a base64 constant pasted into the script. If anything looks missing, run `python3 <SKILL_DIR>/scripts/gcs_assets.py`.
3. **Logo — primary icon only on every slide/frame.** Use `LOGO_WHITE` (white icon) on all dark/photo/gradient types (Types 1, 2, 3B, 4, 5, 7, 9, 10). Use `LOGO_BLUE` (blue icon) on all white types (Types 3, 6, 8). This applies identically whether you're building a Carousel or a Story — the Type numbers are shared between both formats, Type 11 (Trustpilot) included — it also uses `LOGO_WHITE`, centred rather than left-aligned, on both canvases. `LOGO_WORDMARK_BLUE` is **not used** in carousel, story, or social slides — it is **never** the primary logo on any slide. The LinkedIn Post footer is the one place `LOGO_WORDMARK_WHITE` appears.
4. **Embed user-provided images:** `embed_image(path)` on each provided file. Never put any `https://` URL in `<img src>` — Playwright renders from `file://` and silently ignores external images. Inner slides without a user-provided image use the Night Blue gradient.
5. Build **one editable HTML file** containing all slides (structure defined in `references/rendering.md`), with fonts and images embedded as base64. **Do not render PNGs or a PDF yet** — the file goes to Step 5 first.

### Step 5 — Open in browser for live edit

The generated `.html` is always opened for a visual check before anything is rasterized — never render straight from Step 4.

1. Open a **fresh** Browser pane tab (`tabs_create`, then `navigate`). Always use a new tab, not a reused one — a reused tab can retain a stale/edited DOM from a previous round instead of loading the file fresh from disk.
   - **Tested:** `file://` only works for small HTML files — a real generated file (fonts + photos embedded as base64) is typically several hundred KB to a few MB, and `navigate`/`preview_start` fail outright on a file that large (`the file may be missing, unreadable, or the user declined access`). Serve the output folder over local HTTP instead: `npx --yes http-server -p <port> -c-1 "<output dir>"` (run in the background), then `navigate` to `http://127.0.0.1:<port>/<slug>.html`. Do not use Python's `http.server` — it fails on this repo's volume (see project memory).
2. Run this script via `javascript_tool` to make every text-bearing leaf element directly editable, **without** touching the surrounding structure:
   ```js
   document.querySelectorAll('[data-slide] *').forEach(el => {
     const isLeafText = el.children.length === 0
       && el.textContent.trim().length > 0
       && !['IMG', 'SVG', 'STYLE', 'SCRIPT'].includes(el.tagName);
     if (isLeafText) el.setAttribute('contenteditable', 'true');
   });
   ```
   **Do not use `document.designMode = 'on'` for the whole document.** Tested: it turns the entire page into one flowed editing surface, and a click-drag or triple-click that starts inside one element can silently swallow a sibling element's closing tag when the user retypes over the selection — an `<h1>` and the `<p>` right after it can merge into a single `<h1>`, destroying the second element's markup with no visible error. Scoping `contenteditable` to individual leaf text nodes keeps each element's editing region isolated, so a user can retype/clear/reformat text without risk of deleting a neighbouring element's tags.
3. Tell the user: *"The preview is open — click into any text to edit it directly (retype, delete, select-and-bold). Say when you're done, or ask me for anything else (swap a photo, remove/reorder a slide, change a colour) and I'll edit the file directly."* Non-text changes (images, adding/removing elements, reordering slides) still go through the chat-request + **Edit** tool path in Step 6, since scoped `contenteditable` intentionally can't delete or rearrange whole elements.
4. **Do not capture `document.documentElement.outerHTML`.** With fonts and photos embedded as base64, the full document can be several MB — reading that back through `javascript_tool` would dump megabytes of text into the conversation for no reason. Instead, pull back only the small set of editable text values:
   ```js
   const edits = [];
   document.querySelectorAll('[contenteditable="true"]').forEach(el => {
     edits.push({id: el.id || null, text: el.textContent});
   });
   JSON.stringify(edits, null, 2)
   ```
5. Diff that against the text you originally wrote for each `id`. For every value that changed, apply it to the `.html` file with the **Edit** tool — a plain old/new string replacement on that element's text content, same as any chat-requested edit in Step 6. This is also the sanity check: if an id's old text can't be found verbatim in the file, or the new text is empty where the old text wasn't, stop and show the user before touching the file — don't guess at a fix.
6. Close the tab once the edits are applied.

### Step 6 — Render & review

1. Render each slide to PNG with Playwright (`render()` in `references/rendering.md`). **Do not assemble the PDF yet for carousels** — that happens once, in Step 7, after final approval.
2. Show/attach the rendered PNG preview(s) to the user (all slides for a carousel/story).
3. From here, further adjustments can come two ways:
   - **Back to the browser** — reopen Step 5 for more direct text edits.
   - **In chat** — the user describes a change in plain language; find the target slide's `[data-slide="N"]` block in the single `<slug>.html` and apply it with the **Edit** tool directly on that HTML (never regenerate the whole file from scratch — that risks reverting earlier approved edits). Re-run `render()` to refresh the PNGs — it's cheap, Playwright reloads the whole file and re-screenshots every slide each time.
4. Repeat for as many rounds as needed. **Do not rush to Step 7.** Only an explicit approval ("looks good", "aprovado", "pode finalizar", "ship it") ends the loop — silence, a follow-up question, or a new content request are not approval.

### Step 7 — Deliver

Once the user approves:

1. For carousels, assemble the final PDF from the latest approved PNGs (`references/rendering.md`).
2. Confirm the delivered files match the naming table below.
3. Offer next steps: adjust a slide further · adapt to another format (e.g. Story version of slide 1) · adapt to another platform · write the publishing caption · start a new piece.

---

## Layout quality — the bar

Every composition should feel professionally designed, not AI-generated. Concretely:

- **Never overcrowd.** Generous whitespace is part of the GCS identity. Max ~40 words of body copy per slide; headlines ≤ 12 words.
- **Content grows → add slides, don't shrink type.** If a point doesn't fit at the specified type sizes, split it across two slides (carousel) or cut copy (post/story). Never drop below the reference typography sizes to squeeze content in.
- **One idea per slide.** Never two concepts on one canvas.
- **Consistency across slides.** Same logo placement, padding rhythm, palette, and type scale on every slide of a set.
- **Vary the layouts.** A carousel of six identical text slides looks generated. Mix text slides with visual-asset slides (stat cards, comparison table, timeline, ranked list, bar chart) where the content supports it — the full snippet library is in `references/slide-library.md`.

### Anti-AI checklist — reject the draft and redo if any of these are present

- **Three or more consecutive White (Type 3) slides** without a Dark (Type 3B) or visual break → restructure; use Type 3B for the next content point
- **Three or more consecutive slides with identical structure** (overline + heading + body) → break the sequence with a visual asset slide
- **Generic overlines** ("Key Point", "Did You Know?", "Important") → replace with content-specific labels ("Schengen Access", "Processing Time", "Why Malta?")
- **Stat cards where all values have the same typographic weight** → one number must visually dominate (≥102px Yrsa); the others are supporting
- **Comparison table with no highlighted winner row** → the best-value row uses `background:#ECF4FF` or its number in `#3F8CFF`
- **Country slide without the country flag** → if Portugal/Malta/Greece etc. is the subject of the slide and there's layout room, the flag must appear

## Creative freedom & asset library

You have creative freedom over each layout *within* the design system — use its assets, don't invent a new visual language. Asset availability by type:

| Asset | Source | Notes |
|---|---|---|
| **Fonts** | `assets/fonts/*.ttf` bundled in this skill | `FONTS_CSS`. Yrsa 400 + real italic, Heebo 300/400/500/600/700. Never a Google Fonts `<link>` — it is blocked at render and falls back to system fonts silently. |
| **Logos** | `assets/logos/*.png` bundled in this skill | `LOGO_WHITE`, `LOGO_BLUE`, `LOGO_WORDMARK_WHITE` (LinkedIn footer), `LOGO_WORDMARK_BLUE`. No network. The GitHub repo is private; never attempt to fetch logos over the network. |
| **Quote marks** | `assets/images/quote-blue.png`, `quote-white.png` | `QUOTE_ICON_BLUE` (Type 8) / `QUOTE_ICON_WHITE` (Type 9). Exactly 178×153px. |
| **CTA background** | `assets/images/background-cta.png` | `CTA_BG` (carousel Type 10) and `STORY_CTA_BG` (story Type 10) — same image, one file. |
| **Trustpilot graphics** | `assets/images/trustpilot-5stars.png`, `logo-trustpilot.png` | Type 11 only: `TRUSTPILOT_STARS` at exactly 231×43px and `TRUSTPILOT_LOGO` at `height:52px` centred in the footer. Never redraw the stars or crop the row to fake a lower rating. The slide's three action icons are inline SVG in `slide-library.md` — copy them verbatim. No overline above the card. |
| **Icons** | `google/material-design-icons` — `curl` on demand, **needs network** for a name not already in `slide-library.md` | **Material Symbols only**, always **inline `<svg fill="currentColor">`** — never `<img>`, never a `data:` URI, never Font Awesome / Heroicons / Feather / Lucide / a hand-drawn SVG. Fetch with `curl` via Bash, never WebFetch (it mangles markup). Size 40–56px via `width`/`height`; colour from the parent's `color`. Same treatment as the `gcs-brochure` skill. |
| **Country flags** | `msikma/country-flags` on GitHub (public) — **needs network** | `flag_uri("pt")`. UK is `uk.png` upstream, so pass `gb` and the helper maps it. If a code is missing or there is no network, show the country name without a flag. |
| **Passports** | `assets/passports/` in the design system repo | The one genuinely repo-only asset — not bundled, not portable. If a plan needs it without the repo, ask the user for the file. |

Compose freely with: infographics, comparison tables, statistics, callout boxes, timelines, numbered lists, highlight cards, quotes, and visual dividers — all following the token rules (palette, `border-radius:0`, no shadows) in `references/design-system.md`.

### Content-to-asset mapping — what to reach for first

| Type of content | Recommended visual |
|---|---|
| Passport ranking / GCS Global Passport Index | Ranked list rows with flag + visa-free count |
| Programme comparison (PT vs MT vs GR) | Comparison table with country flags in column headers |
| Eligibility requirements / criteria | Icon-led list (one specific icon per criterion) |
| Investment statistics | Stat cards with one dominant number + contextual icon above |
| Citizenship / residency process steps | Horizontal process timeline |
| Visa-free destination counts | Horizontal bar chart with flag beside each bar label |
| Programme benefits without numbers | Icon grid (2×2 or 2×3, one icon per benefit) |
| Client satisfaction / service proof (a real Trustpilot review) | Trustpilot review card (carousel Type 11) — late in the deck, just before the CTA |

### Visual rhythm — plan before writing HTML

Before writing a single slide, decide the visual rhythm of the full carousel:

- **5–6 slides:** minimum 1 Dark (Type 3B) slide + minimum 1 visual slide (stat card, ranking, table, timeline, or icon list)
- **7–10 slides:** minimum 2 Dark (Type 3B) slides + minimum 2 visual slides
- **Never more than 2 consecutive White (Type 3) slides** — the next must be Type 3B, a visual slide, or a photo slide

The plan step (Step 3) must reflect this rhythm — a plan with all-text slides is incomplete; add visual slides before approving.

### Editorial intent — decide before composing

For every slide that uses a visual asset (flags, icons, stat cards, tables), have a clear reason *before* writing the HTML: what does this asset communicate that text alone cannot? A flag communicates geographic specificity. An icon communicates domain category at a glance. A dominant number communicates magnitude instantly. If the asset is there just to fill space, it will look like it is.

## Custom & Reference Mode

Both modes are **additive** — a request that triggers neither runs the standard workflow unchanged.

### When to activate

| Mode | Activate when |
|---|---|
| **Reference Mode** | The user sends an image as a layout reference (see the reference image gate in Step 1) |
| **Custom Layout (Type 12)** | The user asks for a layout outside the 11 types ("split 50/50", "grid of 4 cards", "editorial magazine layout", "try something different"), or Reference Mode does not map onto an existing type, or the user asks for dimensions outside the six supported formats |

Neither mode waives the Step 3 plan approval. In Reference Mode and Custom Layout, a **textual sketch of the layout** replaces the standard slide list — describe the zones, proportions, type sizes and asset placement in words, then wait for an explicit go-ahead.

Sketch example:

```
Upper zone (60%): full-bleed photo with Night Blue overlay.
Lower zone (40%): white background, headline Yrsa 62px,
body Heebo 36px, logo bottom-right.
```

### Brand invariables — never negotiable in any mode

GCS palette only (Night Blue `#000957`, Electric Blue `#3F8CFF`, white, defined tints) · Yrsa + Heebo from `assets/fonts/` · logo always present, always one of the four bundled assets · `border-radius:0` (only exception: Type 11 Trustpilot card, 50px) · no `box-shadow`, `text-shadow` or `drop-shadow` · photo overlays always Night Blue, never black.

All editorial rules still apply to Type 12: max ~40 words of body copy, headlines ≤ 12 words, White/Dark alternation, and the anti-AI checklist.

### Type 12 in carousels

- Maximum **2 consecutive** Type 12 slides
- Type 12 **never replaces** the Type 10 (CTA) slide — the CTA is always last
- Type 12 may replace any interior slide (Types 2–9, 11)
- The Type 12 QA gate (see `references/slide-library.md`) runs before rendering

### Custom dimensions

If the user asks for dimensions outside the supported list (e.g. Pinterest 1000×1500), confirm explicitly before generating, then scale padding and the type scale proportionally to the new canvas. The Playwright render pipeline in `references/rendering.md` is unchanged — only the canvas size differs.

## Outputs & file naming

Write outputs to `/mnt/user-data/outputs/` when that directory exists (Claude.ai); otherwise create `./output/<slug>/` in the working directory. `slug` = topic in `snake_case`.

| Format | Files |
|---|---|
| Carousel | `<slug>.html` · `<slug>_slide_01.png` … `_NN.png` · `<slug>.pdf` |
| Single Post | `<slug>.html` · `<slug>.png` |
| Story — single frame | `<slug>_story.html` · `<slug>_story.png` |
| Story — multi-frame | `<slug>_story.html` · `<slug>_story_slide_01.png` … `_NN.png` |
| LinkedIn Post | `<slug>_linkedin.html` · `<slug>_linkedin.png` |

Story is single-file/single-PNG only when the whole message fits one frame (e.g. Type 1 Cover alone, or Type 10 CTA alone). As soon as a Story needs 2+ frames, name it exactly like a Carousel (`_slide_NN.png` sequence) — the same `render()` helper in `rendering.md` handles both automatically based on prefix and slide count.

For LinkedIn carousels, name the PDF after the carousel title — the filename shows in the LinkedIn feed.

---

> **Reminder:** all written carousel content lives on White (Type 3) or Dark (Type 3B) slides — alternate throughout · the last carousel slide is always the CTA (Type 10) · photo overlays are always Night Blue, never black · read `references/design-system.md` before writing a single line of slide HTML.
