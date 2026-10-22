---
name: design-elementor
description: Generates Elementor V4 JSON for globalcitizensolutions.com — either a single section (any of the 25 real GCS section components — Hero, HeroInner, HeroLeadForm, Navbar, Footer, Features, Testimonials, TestimonialCard, Pricing, FAQ, CTA, Stats, Contact, TrustBar, OfficeLocations, TeamSection, CountryCard, ProgramCard, SpeakerCard, Agenda, BenefitsGrid, ComparisonTable, VideoSection, FloatingContactButton, StickyCta — or Custom) or a full multi-section page assembled from those same section types — using containers/flexbox only, built from the real GCS section and primitive components in this design system. When a request doesn't match any of the 25 documented section types, the skill asks for a reference (Figma link, image, or HTML) before building anything new. Text and buttons (heading, text-editor, button widgets) carry no custom typography or color — they inherit the live WordPress theme's native fonts and button style. GCS brand colors (Night Blue #000957, Electric Blue #3F8CFF, 0px radius except pills/avatars) are still applied to containers, icons, and dividers. Containers never use `flex_wrap: "wrap"` — repeating grids are built from explicit row containers instead. Also produces a self-contained browser preview HTML with Desktop and Mobile renders and Copy JSON / Download JSON buttons. Use/Trigger whenever the user asks for an "Elementor section", "Elementor page", "Elementor JSON", a WordPress/Elementor page block or landing page for GCS, or wants to paste a section/page into Elementor V4 — even without the word "Elementor" if WordPress/Elementor is the stated destination.
---

# GCS Elementor Section & Page Generator

Generates a valid Elementor V4 JSON payload for globalcitizensolutions.com — container-only, no legacy sections/columns — plus a matching browser preview HTML with Copy JSON / Download JSON buttons. The payload is either **one section** or **a full page** made of several sections stacked in `elements`. Every run produces the pair: one `.json` file (the actual Elementor deliverable) and one `-preview.html` file (a visual check, never pasted into Elementor itself).

## Overview

Elementor V4 pages are built from **containers** (flexbox, nestable) instead of the legacy section/column/widget hierarchy. This skill only ever emits containers and a small whitelist of native widgets — never legacy sections/columns, never third-party widgets, never raw HTML/CSS as the actual Elementor payload.

## GCS Branding (condensed)

| Token | Value |
|---|---|
| Primary / Night Blue 400 | `#000957` |
| Accent / Electric Blue 400 | `#3F8CFF` |
| Body text (foreground) | `#101828` |
| Established body-copy grey (foreground-secondary) | `#414856` |
| Muted / secondary text | `#667085` |
| Page background | `#F9FAFB` |
| Card / white surface | `#FFFFFF` |
| Border (light) | `#DBEAFF` |
| Soft accent tint (badges) | `#ECF4FF` |
| Primary button hover | `#1A2268` |
| Headings / Body typography (Yrsa/Heebo) | **Not applied via JSON.** `heading`, `text-editor`, and `button` widgets carry no `typography_*` or color keys — they inherit the live WordPress theme's native fonts and button style. See "WordPress theme isolation" below |
| Border radius | **0px everywhere by default, on containers and shapes (cards, tiles, icon squares).** `9999px` only for avatars, badges, and pill/circular elements. Not applied to `heading`/`text-editor`/`button` widgets — see "WordPress theme isolation" |
| Spacing | 4px base grid — use 8/16/24/32/48/64px steps |

These colors/radii apply to **containers, `icon`, and `divider` widgets** — the blocks of color, borders, and dividers that give a section its GCS structure. `heading`, `text-editor`, and `button` widgets never carry any of these values (see below).

Full detail, tone-of-voice rules, banned/approved terminology, and the three messaging pillars (Optionality → Security and Access → Family and Future Generations) are in [`references/design-system.md`](references/design-system.md) — **read it before writing any placeholder copy or picking a color.**

### WordPress theme isolation

The JSON lands on a live WordPress site with its own active theme. This skill deliberately leans into that for text and buttons, and deliberately overrides it for color-blocking:

- **`heading`, `text-editor`, and `button` widgets never set any `typography_*` key, nor any color key** (`title_color`, `text_color`, `background_color`, `button_text_color`, `border_*`). Leave these keys out entirely — the widget then inherits the live WordPress theme's native fonts, sizes, and button style (background, border, radius) exactly as an editor would get by dropping a fresh widget on the page.
- Every **container**, and the **`icon`**/**`divider`** widgets, keep explicit GCS values — these are what build the section's structure and color-blocking, and Elementor's theme defaults for them are unpredictable:
  - Containers explicitly set `border_radius` (`0` by default, `9999` only for documented pill/avatar/circle cases).
  - Containers explicitly set `border_border`/`border_width`/`border_color` (or `"none"`) and `background_background: "classic"` + a literal `background_color`.
  - `icon` widgets keep `primary_color`; `divider` widgets keep `color` — both literal GCS hex values.
- Every container explicitly sets `flex_wrap: "nowrap"` — **never `"wrap"`**. Repeating/grid sections (Features, Testimonials, Pricing, Stats, TrustBar, TeamSection, OfficeLocations) are built from explicit inner "row" containers (a fixed number of same-width items per row) instead of relying on flexbox auto-wrap — see "Repeating grids without flex_wrap" in `references/elementor-json-spec.md`.

Full mechanics and the canonical worked example are in [`references/elementor-json-spec.md`](references/elementor-json-spec.md)'s "WordPress theme isolation" section.

## Quick Reference

| Section type | Source GCS pattern | Key widgets |
|---|---|---|
| Hero | `herosection.reference.html` (overlay variant: `herosection-overlay.reference.html`) | heading, text-editor, button, image |
| HeroInner | `heroinner.reference.html` | heading, text-editor, image |
| HeroLeadForm | `heroleadform.reference.html` | heading, text-editor, button, image |
| Navbar | `navbar.reference.html` | image (logo), text-editor, button, icon |
| Features | `featuregrid.reference.html` | icon, heading, text-editor |
| Testimonials | `testimonialssection.reference.html` | icon (stars), text-editor, heading, button |
| TestimonialCard | `TestimonialCard.jsx` (via `cards-overview.reference.html`) | icon (stars), text-editor, heading |
| Pricing | `pricingtable.reference.html` | text-editor (badge), heading, divider, button |
| FAQ | `faqaccordion.reference.html` | heading, text-editor, divider |
| CTA | `ctasection.reference.html` (overlay variant: `ctasection-overlay.reference.html`) | icon, heading, button, image |
| Stats | `statisticsgrid.card.html` / `StatisticsGrid.jsx` | icon, heading, text-editor |
| Contact | `leadform.reference.html` (simplified) | heading, text-editor, button |
| TrustBar | `trustbar.reference.html` | icon, heading, text-editor, divider |
| OfficeLocations | `officelocations.reference.html` | heading, text-editor, button |
| TeamSection | `teamsection.reference.html` | image, heading, text-editor, icon |
| CountryCard | `countrycard.card.html` | image, heading, text-editor |
| ProgramCard | `programcard.card.html` | heading, text-editor |
| SpeakerCard | `speakercard.card.html` | image, heading, text-editor |
| Footer | `footer.reference.html` | image (logo), heading, text-editor, button, icon, divider |
| Agenda | `agenda.reference.html` | heading, text-editor, divider |
| BenefitsGrid | `benefitsgrid.reference.html` | icon, heading, text-editor |
| ComparisonTable | `comparisontable.reference.html` | icon (✓/✕), heading, text-editor, divider |
| VideoSection | `videosection.reference.html` | image, icon (play), heading, text-editor |
| FloatingContactButton | `floatingcontactbutton.reference.html` | icon, text-editor |
| StickyCta | `stickycta.reference.html` | text-editor, button |

Full container/widget trees, with literal GCS values slotted in, are in [`references/section-recipes.md`](references/section-recipes.md).

## Component coverage

This skill's recipes are built from every one of this design system's **25 real section components** (`components/core/sections/`) — the full list is the Quick Reference table above. Of the 13 shared primitives (`components/core/primitives/`), only `Icon` and `Button` are actually imported by any section (Navbar, FaqAccordion, Footer, OfficeLocations, StatisticsGrid); every other section hand-rolls its own accordion/carousel/table/avatar/tag/badge visuals inline rather than importing the shared primitive. Where a section's hand-rolled pattern conceptually matches a primitive, the recipe says so (e.g. Footer's link-accordion ≈ `Accordion`, ComparisonTable ≈ `Table`, SpeakerCard's initials fallback ≈ `Avatar`, ProgramCard's fact-row chips ≈ `Tag`) — see "Primitives beyond the 25 sections" at the end of `references/section-recipes.md` for which primitive shapes are still approximable under the 6-widget whitelist versus which are impossible regardless of a supplied reference (real accordions, tabs, charts, countdowns, lightboxes, marquees).

## Elementor JSON rules (critical — non-negotiable)

- Root: `{ "type": "elementor", "siteurl": "https://www.globalcitizensolutions.com/wp-json/", "elements": [...] }`
- Every container and widget has: `elType`, `isInner`, `isLocked: false`, `settings`, `elements`
- Containers: `elType: "container"`, no `widgetType`. Widgets: `elType: "widget"`, `widgetType` = one of **`heading | text-editor | button | image | icon | divider`** only — no other native or third-party widgets
- All widgets have `elements: []` (always empty — widgets never nest children)
- Flexbox containers only — no grid unless the user explicitly asks for one
- Every setting that can reasonably differ by breakpoint gets `_tablet` and `_mobile` variants (font sizes, `flex_direction`, `padding`, `width`, `gap`)
- Colors are **literal hex** in `settings` for containers/`icon`/`divider` (`background_color`, `border_color`, `primary_color`, `color`) — Elementor JSON can't reference CSS variables. `heading`/`text-editor`/`button` widgets carry no color keys at all (see "WordPress theme isolation")
- IDs: short, unique, kebab-case, `gcs-<section>-<role>` (e.g. `gcs-hero-outer`, `gcs-cta-button`)

Full schema mechanics and a worked minimal example are in [`references/elementor-json-spec.md`](references/elementor-json-spec.md).

## Workflow

0. **Detect the mode.** If the user asks for a "page", "landing page", "full page", or names 2+ section types in one request, this is **page mode**. Otherwise it's **section mode** (today's default: exactly one section). In page mode, always ask the user which section types to include and in what order — never assume a default order. Confirm the final ordered list before building.
0.5. **Match against the 25 documented section types.** Check each requested section against the Quick Reference table above / `references/section-recipes.md`. If it matches one (including a close synonym — e.g. "menu"/"header" → Navbar, "footer"/"site footer" → Footer, "video embed" → VideoSection), proceed with that recipe. If it does NOT match any of the 25 — a genuinely new visual pattern — this is **Custom mode**, and before building anything you must ask the user for a reference: a Figma link, an image/screenshot, or raw HTML of the section they want. Do not improvise a new section's structure from a text description alone; see the "Custom" entry in `references/section-recipes.md` for how a recipe gets derived once a reference is supplied.
1. For each section to build (one in section mode, N in page mode, in the confirmed order), identify the section type (or Custom, gated per step 0.5) and gather content: headline, body copy, CTA text/link, images/icons needed, item counts (number of features/testimonials/pricing tiers/FAQ items).
2. Read `references/design-system.md` (tokens + voice), `references/elementor-json-spec.md` (schema mechanics), and `references/section-recipes.md` (the matching container/widget tree for each section type in use). For each section, also open the real `components/core/sections/<name>.reference.html` file named in that recipe's "Source" line (and any primitive `.d.ts` it uses, e.g. `Button.d.ts`, `Icon.d.ts`) — the recipe is a condensed index, the reference file is the source of truth for exact spacing/structure.
3. Assemble the root JSON: assign unique IDs, build each section's container/widget tree, add responsive keys. In page mode, place each section's tree as its own top-level sibling in `elements`, in the confirmed order — see "Full page assembly" below.
4. Validate against the checklist below, following the verification discipline below.
5. Build the preview HTML (spec below) — in page mode, stack all sections in order inside the same Desktop/Mobile frames.
6. Write both files per the output convention below.

## Full page assembly

A full page is not a new schema shape — it's the same root object with more than one top-level container in `elements`:

- `elements` holds one complete section tree per chosen section type, each still `elType: "container"`, `isInner: false`, in the order the user confirmed in Workflow step 0. No page-level wrapper container.
- Never pick a default order or a default set of sections. Page mode only proceeds once the user has stated the section list and order (they may reuse any of the types in `references/section-recipes.md`, including repeats).
- **Repeated section types:** if the same section type appears more than once in a page, suffix every ID in the second (and later) occurrence with a running index before the role, e.g. `gcs-cta-outer` → `gcs-cta-2-outer`, `gcs-cta-button` → `gcs-cta-2-button`.
- **Page output slug:** `<topic>_page` (e.g. `golden_visa_page`), producing `<topic>_page.json` + `<topic>_page-preview.html` — see Output convention below.

## Verification discipline

Build the full JSON once — every section, in page mode all of them together — then run exactly **one** batched validation pass against the checklist below, covering every section at once. Fix everything it finds in a single batch. Optionally run one more confirmation pass. Then stop. Do not re-check indefinitely — open-ended self-QA burns effort re-litigating things the checklist already covered.

## Placeholder content and truth

Any statistic, price, testimonial quote, or number not supplied by the user is illustrative only. Mark it clearly as a placeholder when telling the user what was built (and, where it reads naturally, in the copy itself, e.g. "e.g., 500+ clients") — never present placeholder content as if it were real client data.

## Section types and caveats

All 25 real GCS section components are supported — see the Quick Reference table above and `references/section-recipes.md` for each one's tree — plus Custom for anything genuinely outside that catalog (gated behind a supplied reference, see Workflow step 0.5). Several caveats apply because the widget whitelist has no interactive/input widgets:

- **FAQ / Footer's link-accordion**: true expand/collapse needs Elementor's native Accordion widget, which is outside the whitelist. Build these as an always-expanded stack of `heading`/`text-editor`/`divider`, and tell the user this is static, not interactive.
- **Hero / Contact / HeroLeadForm** (lead-capture forms): real `<input>`/`<textarea>`/`<select>`/checkbox fields aren't allowed widgets. Represent the form intent with `text-editor` copy plus a `button` linking to the real WordPress form page or shortcode, and tell the user forms are out of scope for this JSON widget whitelist.
- **Testimonials / TeamSection** (carousel nav): the real components' prev/next arrows and dot pagination are JS-driven carousels. Represent them as static decorative `icon` widgets (non-clickable) and show a fixed set of cards/specialists, telling the user the carousel behaviour is out of scope for this JSON widget whitelist.
- **OfficeLocations** (region tabs): the real component's region filter is JS-driven. Represent it as a flat, static list of offices (all of them, or a representative subset the user confirms) instead of functional tabs, and tell the user the filtering is out of scope for this JSON widget whitelist.
- **Navbar** (mega-menu dropdowns, mobile accordion submenu): both are JS-driven show/hide. Represent the nav as a flat, always-visible link list — no hover dropdown, no collapsible mobile submenu — and tell the user this is out of scope for this JSON widget whitelist.
- **ComparisonTable**: a real `<table>` (per-cell borders, zebra striping, a highlighted column background) has no native widget equivalent — no `table` widget exists in the whitelist, and containers can't emit `<table>`/`<tr>`/`<td>` semantics. Approximate with row-containers of equal-width cell containers and `icon` ✓/✕, and tell the user this is a heavier, more lossy approximation than any other recipe (no real table semantics, harder to keep pixel-aligned with many rows).
- **VideoSection**: no widget can embed a real `<iframe>`/`<video>` or reproduce click-to-play. Represent it as a static poster `image` with a decorative, non-clickable play-button `icon` on top, and tell the user this is a static poster only.
- **FloatingContactButton / StickyCta**: these are `position:fixed`, portal-rendered, JS-toggled widgets in the real component — Elementor's plain container+6-widget model has no fixed/sticky-to-viewport setting. Approximate as a static, in-flow bar/row (no floating or sticky-while-scrolling behaviour at all), and explicitly tell the user this loses the entire point of the component, not just a style detail — recommend they use Elementor's own sticky/motion-effects settings directly in the editor if that behaviour matters.
- **Agenda**: the time-badge's monospace typeface can't be set on `text-editor` (no typography overrides allowed) — tell the user the monospace styling is lost.
- **ProgramCard / SpeakerCard fact rows**: bold/weight distinctions between a label and its value are lost, since `text-editor` carries no typography overrides — both render in the same inherited body weight.

## Images and media

No local asset bundling — Elementor needs real WordPress Media Library URLs/attachment IDs, not local files. Use a placeholder image URL in the JSON and preview, and tell the user to replace `image.url` / `image.id` with the real attachment after uploading.

## Iconography

`references/design-system.md` §3.8 states this system's real rule: self-hosted SVG icons rendered via `currentColor`, Material-Symbols-compatible naming/shapes, and "**no emoji anywhere in product UI**." Elementor's native `icon` widget — the only widget this skill is allowed to emit for icon content (see "The Six-Widget Rule") — cannot honour that rule directly: it is a platform constraint, not a choice. The widget's `selected_icon` setting only accepts a Font Awesome library reference (`fa-solid`/`fa-regular`/`fa-brands` + a glyph name); it has no way to hold inline SVG markup, a `currentColor`-styled asset, or a Material Symbol name. This mirrors how `gcs-pptx` documents its own OOXML exception (`skills/gcs-pptx/SKILL.md` → "Icons"): OOXML slide shapes can't hold inline scalable vector markup either, so that skill rasterizes every icon to a recolored PNG before embedding. Here the constraint is different (a closed glyph library instead of a raster-only format) but the posture is the same — pick the icon whose Material Symbol equivalent it conceptually matches, document the substitution, and never silently drift onto some other icon set.

**Glyph-mapping table** — every `fa-solid`/`fa-brands` glyph this skill's documented output actually uses (`references/elementor-json-spec.md`, `references/section-recipes.md`, `examples/landing-page-example.json`), mapped to the Material Symbol it stands in for:

| `fa-solid` glyph | Material Symbol equivalent | Used in |
|---|---|---|
| `fa-solid fa-globe` | `public` | Features — "Multi-Jurisdictional Optionality" |
| `fa-solid fa-shield-halved` | `shield` | Features — "Security and Access" |
| `fa-solid fa-people-roof` | `diversity_3` | Features — "Family and Future Generations" |
| `fa-solid fa-arrow-right` | `arrow_forward` | CTA icon |
| `fa-solid fa-check` | `check` | Worked minimal `icon` widget example; BenefitsGrid, ComparisonTable ✓ |
| `fa-solid fa-bars` | `menu` | Navbar mobile hamburger toggle |
| `fa-solid fa-chevron-down` | `expand_more` | Navbar mega-menu/mobile-accordion arrow, Footer link-accordion arrow, Agenda day-group toggle |
| `fa-solid fa-language` | `language` | Navbar language selector |
| `fa-solid fa-xmark` | `close` | ComparisonTable ✕, StickyCta dismiss, FloatingContactButton collapse |
| `fa-solid fa-play` | `play_arrow` | VideoSection play button |
| `fa-solid fa-phone` | `call` | FloatingContactButton phone action |
| `fa-solid fa-envelope` | `mail` | FloatingContactButton / OfficeLocations email action |

When a section calls for an icon not yet in this table (e.g. a chevron for Testimonials/TeamSection carousel nav, a star for Testimonials ratings), pick the closest Font Awesome solid glyph for the Material Symbol you'd otherwise use, add the pair to this table, and tell the user which substitution was made — don't guess silently and don't leave the mapping undocumented.

**No other icon set, and no emoji, anywhere in this skill's output** — including the preview HTML. Heroicons, Feather, Lucide, or any other third-party icon set are never a substitute for Font Awesome in the actual Elementor JSON (the widget schema only accepts Font Awesome), and they are never a substitute for inline Material Symbols SVG in the preview HTML either. The preview HTML is a plain static mockup, not bound by the Elementor `icon` widget schema — it renders real inline Material Symbols SVG (`fill="currentColor"`), per `skills/gcs-social-media/SKILL.md:267`'s repo-wide baseline, never emoji glyphs and never a raw Font Awesome unicode character standing in for one.

**Brand/social glyphs are the one exemption.** Material Symbols has no social-logo icons, so a brand mark like the LinkedIn glyph used on TeamSection specialist cards, Footer's social-icon row (LinkedIn/X/Facebook/Instagram as applicable), or FloatingContactButton's WhatsApp action (see `references/section-recipes.md`) has no Material Symbol equivalent to map to — use the official `fa-brands` glyph directly (`fa-brands fa-linkedin`, `fa-brands fa-x-twitter`, `fa-brands fa-facebook`, `fa-brands fa-instagram`, `fa-brands fa-whatsapp`) and go no further afield (no generic "link" icon, no third-party brand-icon pack). This exemption is scoped to brand/social marks only; every non-brand icon still goes through the mapping table above.

## Preview HTML generation

The preview is a single self-contained HTML file. Since the JSON no longer carries typography or button styling, the preview must not imply it does:

- No external font dependencies — heading/text-editor/button copy in the preview renders in a **generic system font stack** (`system-ui, -apple-system, sans-serif`), and buttons render with a plain neutral style (light grey fill, thin border, default radius) — never Yrsa/Heebo or GCS button styling, since that's not what the JSON produces.
- A visible note in the header/toolbar: "Font and button styling shown here are generic placeholders — the live site will render these with your WordPress theme's own fonts and button style."
- Containers, `icon`, and `divider` still render with the **exact same literal GCS hex values** as the JSON (backgrounds, borders, icon colors) — the preview's job is to confirm layout, color-blocking, spacing, and that nothing relies on `flex_wrap: "wrap"`.
- Sticky header (white, subtle shadow): left = section name in Night Blue bold; right = "Copy JSON" button (`#000957` bg, white text, 0px radius) + "Download JSON" button (outlined, 0px radius) — these are the preview tool's own UI chrome, not part of the generated section, so they may use GCS styling.
- The full JSON embedded verbatim in `<script type="application/json" id="elementor-json">`
- Copy button: `navigator.clipboard.writeText(...)` reading that script tag's content
- Download button: builds a `Blob` and triggers a download named `<slug>.json`
- Two render frames: "Desktop" (full width) and "Mobile" (390px, centered, CSS-scaled if needed)

## Output convention

Write outputs to `/mnt/user-data/outputs/` when that directory exists (Claude.ai); otherwise create `./output/<slug>/` in the working directory. Each run writes two files into that location: `<slug>.json` (the Elementor JSON) and `<slug>-preview.html` (the browser preview).

- **Section mode:** `slug` = section type + short topic in snake_case (e.g. `hero_golden_visa`).
- **Page mode:** `slug` = short topic + `_page` in snake_case (e.g. `golden_visa_page`).

## Dependencies

None — pure text/JSON authoring, no scripts or packages required.

## Validation checklist

Ranked by severity — fix P0s first, always; fix P1/P2 in the same pass per the verification discipline above; P3 is polish.

**P0 — Blocking (never ship with these)**
- Every element has all 5 required keys (`elType`, `isInner`, `isLocked`, `settings`, `elements`)
- Only whitelisted widget types are used (`heading`, `text-editor`, `button`, `image`, `icon`, `divider`) — see "The Six-Widget Rule" in `references/elementor-json-spec.md`
- Literal hex colors only — no CSS variables
- In page mode, the root has N valid top-level sibling containers, each internally complete
- Contrast meets WCAG AA: body/placeholder text ≥4.5:1, large text/headings ≥3:1, buttons/icons/focus states ≥3:1, against the actual background it sits on
- No fabricated statistic, price, or testimonial quote is presented as real — see "Placeholder content and truth" above
- No `heading`, `text-editor`, or `button` widget sets any `typography_*`, `title_color`, `text_color`, `background_color`, `button_text_color`, or `border_*` key — these stay absent so the widget inherits the WordPress theme's native fonts and button style (see "WordPress theme isolation" above)
- No container sets `flex_wrap: "wrap"` — always `"nowrap"`; repeating grids use explicit row containers instead (see "Repeating grids without flex_wrap" in `references/elementor-json-spec.md`)

**P1 — Major**
- `_tablet`/`_mobile` variants present wherever a value should reasonably change by breakpoint
- `border_radius` is explicitly set to 0 on every **container** and shape (card, tile, icon square) — never omitted — except explicit pill/avatar/circle cases (see "The Sharp-Corner Rule" in `references/design-system.md`); this does not apply to `heading`/`text-editor`/`button` widgets, which never set `border_radius` at all
- `flex_wrap` is explicitly set to `"nowrap"` on every container, including repeating-tile/grid sections (Features, Testimonials, Pricing, Stats, TrustBar, TeamSection, OfficeLocations) — those are built from explicit row containers of a fixed item count, not from `flex_wrap: "wrap"`
- No kicker/eyebrow label above any heading
- No gradient text — emphasis comes from weight or size only
- No colored `border-left`/`border-right` above 1px on cards, callouts, or alerts (does not apply to the existing 1px structural `#DBEAFF` grid dividers already used in Features/Pricing/Testimonials — those are layout, not accents)
- Copy follows UK English, Title Case headings, no emoji, and avoids banned terms ("passport scheme", "relocation firm", "GCS" instead of "Global Citizen Solutions" in body copy)
- Headline/body containers tolerate real client copy running 30-40% longer than the placeholder example — no fixed-height clipping

**P2 — Minor**
- Pricing: 2-4 tiers. Features: chunked in groups of ≤4 tiles (visual break if more). FAQ: visually grouped past ~8 items. CTAs: max 1 primary + 1-2 secondary buttons per section. Any nav-like link list: ≤5 top-level items.
- Exemption: Features' icon+heading+text tiles and Stats' big-number/small-label pattern are GCS's own documented recipes, not reflexive AI defaults — this only constrains **Custom** sections reaching for the same shapes without reason (see `references/section-recipes.md`'s Custom entry)

**P3 — Polish**
- ID naming consistency: kebab-case, `gcs-<section>-<role>`, indexed suffix for repeated section types in page mode
- Preview HTML uses the exact same literal container/icon/divider colors as the JSON, and a generic system font + neutral button style (never Yrsa/Heebo/GCS button styling) for heading/text-editor/button, per "Preview HTML generation" above

## Error handling

- If the requested section isn't one of the 25 documented types (see Workflow step 0.5), ask the user for a reference — a Figma link, an image/screenshot, or raw HTML — before creating a new recipe ad hoc. Do not guess a new section's structure from a text description alone.
- If the user's request is too vague, ask one clarifying question: what is the section for?
- If a requested widget isn't native/whitelisted, substitute the closest allowed widget and tell the user what was substituted
- Never generate HTML or CSS as the actual Elementor deliverable — only JSON. The preview HTML is a separate, clearly-labeled artifact for visual confirmation, not something to paste into Elementor.
