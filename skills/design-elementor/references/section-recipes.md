# Section Recipes

Container/widget trees for each supported section type, translated from this repo's real GCS section reference implementations (`components/core/sections/*.reference.html`, `*.card.html`, and `*.jsx`) into the Elementor container + 6-widget whitelist described in `elementor-json-spec.md`.

Every tree below builds on the worked minimal example in `elementor-json-spec.md`: an outer container, nested inner containers for layout, and leaf widgets carrying content.

**Before building, open the real source.** Each recipe below is a condensed index, not the source of truth. Before building a given section, open the actual `components/core/sections/<name>.reference.html` (or `.card.html`/`.jsx` where noted) file named in its "Source" line — and, where the recipe uses a primitive (Button, Icon, Tag, Badge, Avatar), the matching `components/core/primitives/<Name>.d.ts` contract — and take exact spacing/structure from there. If a number in this file and the real source file disagree, the real file wins.

**Two rules apply to every recipe below** (per "WordPress theme isolation" in `elementor-json-spec.md`, not repeated per line):

1. **`heading`, `text-editor`, and `button` widgets never carry any `typography_*` key or any color key** (`title_color`, `text_color`, `background_color`, `button_text_color`, `border_*`) — they inherit the live WordPress theme's native fonts and button style. Only structural keys (`title`/`editor`/`text`, `header_size`, `align`, `link`) are set on these three widget types.
2. **Containers, `icon`, and `divider` widgets keep literal GCS colors** — explicit `background_color`/`border_color` on containers, `primary_color` on `icon`, `color` on `divider` — and every container explicitly sets `flex_wrap: "nowrap"` (never `"wrap"`). Repeated/grid content (tiles, cards, stats) is built from explicit inner **row containers** of a fixed item count, not from wrap — see "Repeating grids without flex_wrap" in `elementor-json-spec.md` for the exact mechanic and the row size to use per section.

## Hero

Source: `components/core/sections/herosection.reference.html` (overlay variant with a full-bleed background image + Night Blue scrim: `herosection-overlay.reference.html` — use only if the user explicitly asks for it; the widget whitelist can't reproduce a gradient scrim, so approximate it with a solid `background_color` container instead)

- Outer container — `flex_direction: column`, `flex_wrap: nowrap`, `align_items: center`, `background_color: #FFFFFF`
  - Intro inner container (`isInner: true`, `flex_direction: column`, `align_items: center`, `flex_gap: 20px`)
    - `heading` (h1) — centred headline, no color/typography set
    - `text-editor` — centred intro copy, max-width ~582px, no color/typography set
    - Actions row inner container (`isInner: true`, `flex_direction: row`, `flex_wrap: nowrap`, `justify_content: center`, `flex_gap: 24px`, `flex_direction_mobile: column`)
      - `button` — primary CTA, no color/typography set
      - `button` — secondary CTA, no color/typography set

      **Caveat**: the real component distinguishes the two buttons with a filled vs. outline style. Since buttons carry no custom styling in this skill, both render identically as the WordPress theme's native button — tell the user this visual distinction is lost and, if it matters, must be set in the WordPress theme's own button variants.
  - Media inner container (`isInner: true`, full width, `min_height: 540px`, `_tablet: 420px`, `_mobile: 220px`)
    - `image` — full-bleed, `object-fit: cover`, `width: 100%`

**Caveat**: if the user asks for the lead-capture-form hero instead (name/email/phone inputs), real `<input>` fields aren't in the widget whitelist — represent the form's intent with `text-editor` copy plus a `button` linking to the live WordPress form page/shortcode, and tell the user forms are out of scope for this skill's JSON. (Source for that variant: `components/core/sections/heroleadform.reference.html`.)

## Features

Source: `components/core/sections/featuregrid.reference.html`

- Outer container — `flex_direction: column`, `flex_wrap: nowrap`, 1px border `#DBEAFF`
  - One row inner container per chunk of ≤4 features (`isInner: true`, `flex_direction: row`, `flex_direction_mobile: column`, `flex_wrap: nowrap`, `gap: 0`)
    - Repeated tile inner containers (`isInner: true`, one per feature in the row, `width: 100/N%`, `width_mobile: 100%`) — `background_color: #FFFFFF`, border-right/border-bottom `1px solid #DBEAFF`, padding 24px, `flex_direction: column`, `flex_gap: 12px`
      - `icon` — 48×48px, `primary_color: #FFFFFF` on a `#3F8CFF` background square (radius 0)
      - `heading` — no color/typography set
      - `text-editor` — no color/typography set
      - optional tag pill inner container (`border_radius: 9999` pill exception, `background_color: #E9ECF1`, small padding, `align-self: flex-start`) holding a `text-editor` label — no color/typography set on the text itself

## Testimonials

Source: `components/core/sections/testimonialssection.reference.html`

- Outer container — `flex_direction: column`, `flex_wrap: nowrap`, `background_color: #FFFFFF`, border-bottom `1px solid #DBEAFF` under the header
  - `heading` — section title, no color/typography set
  - Nav row inner container (`isInner: true`, `justify_content: flex-end`) — two circular `icon` containers (prev/next, `border_radius: 9999`, `background_color: #ECF4FF` / `#3F8CFF`) holding decorative chevron `icon` widgets (`primary_color` brand). **Non-functional** — static decoration only, real carousel nav is out of the widget whitelist.
  - Cards row inner container (`isInner: true`, `flex_direction: row`, `flex_wrap: nowrap`, `flex_gap: 42px`, `flex_direction_mobile: column`) — 2 card inner containers per row, `width: 50%` (`width_mobile: 100%`), `background_color: #FFFFFF`, 1px border `#DBEAFF`, padding 24px, `flex_direction: column`, `flex_gap: 32px`
    - Stars row inner container (`isInner: true`, `flex_direction: row`, `flex_gap: 3px`) — 5× `icon` (star, `primary_color` brand accent)
    - `text-editor` — italic quote copy, no color/typography set
    - Author row inner container (`isInner: true`, border-top `1px solid #DBEAFF`, padding-top 16px, `flex_direction: row`, `justify_content: space-between`, `align_items: center`, `flex_gap: 12px`)
      - Author inner container (`isInner: true`, `flex_direction: row`, `align_items: center`, `flex_gap: 12px`)
        - Avatar inner container (`isInner: true`, 40×40px, `border_radius: 9999` pill exception, `background_color: #ECF4FF`)
        - Name/role inner container (`isInner: true`, `flex_direction: column`) — `heading` name + `text-editor` role, no color/typography on either
      - `button` — "Read the full story" link, no color/typography set
  - Dots row inner container (`isInner: true`, `justify_content: center`, `flex_gap: 6px`) — repeated small circular containers (`border_radius: 9999`, `background_color` accent/muted). **Non-functional** — static, real pagination is out of the widget whitelist.

## Pricing

Source: `components/core/sections/pricingtable.reference.html`

- Outer container — `flex_direction: column`, `flex_wrap: nowrap`
  - One row inner container for the 2-4 tiers (`isInner: true`, `flex_direction: row`, `flex_direction_mobile: column`, `flex_wrap: nowrap`, `flex_gap: 24px`)
    - Repeated plan inner containers (`isInner: true`, `width: 100/N%`, `width_mobile: 100%`) — `background_color: #FFFFFF`, 1px border `#DBEAFF`, padding 32px, `flex_direction: column`, `flex_gap: 16px`. For the highlighted/recommended tier: `background_color: #000957` on the container (this is the only visual distinction the highlighted tier keeps — its button no longer differs in style, see caveat below).
      - Badge pill inner container (only on the highlighted tier) — `background_color: #3F8CFF`, `border_radius: 9999` — holding a `text-editor` label, no color/typography set on the text
      - `heading` — plan name, no color/typography set
      - `heading` — price, no color/typography set
      - `text-editor` — billing period, no color/typography set
      - `divider` — `color: #DBEAFF` (or a 20%-opacity white equivalent on the highlighted tier)
      - `text-editor` — feature list as an HTML `<ul>` string, no color/typography set
      - `button` — full width (`align: center`), no color/typography set

**Caveat**: since buttons carry no custom styling, the highlighted tier's button no longer gets its own white-on-blue treatment — only the card's `background_color` still marks it as the recommended tier. Tell the user this if the distinction matters to them.

## FAQ

Source: `components/core/sections/faqaccordion.reference.html`

- Outer container — `flex_direction: column`, `flex_wrap: nowrap`, max content width ~800px, centered
  - `heading` — section title, no color/typography set
  - Repeated item inner containers (`isInner: true`, one per question, already a vertical stack so no row-chunking needed) — border-top `1px solid #DBEAFF`, padding 24px 0, `flex_direction: row`, `flex_wrap: nowrap`, `flex_gap: 24px`
    - `heading` — item number (decorative ordinal, inherited from the real GCS reference component — keep here, but never introduce 01/02/03-style numbering elsewhere unless the sequence itself is informative), no color/typography set
    - Inner column (`isInner: true`, `flex_direction: column`, `flex_gap: 12px`)
      - `heading` — question, no color/typography set
      - `text-editor` — answer, no color/typography set, left-padded to align under the question (~72px)

**Caveat**: this is always-expanded/static content. True expand/collapse needs Elementor's native Accordion widget, which is outside the 6-widget whitelist — tell the user this is non-interactive unless they explicitly want the real Accordion widget (out of scope for this skill).

## CTA

Source: `components/core/sections/ctasection.reference.html` (overlay variant with full-bleed background image + gradient scrim: `ctasection-overlay.reference.html` — use only if the user explicitly asks for it; the widget whitelist can't reproduce a gradient overlay on an image, so approximate with a solid `background_color` container instead)

- Outer container — `flex_direction: row` (`flex_direction_mobile: column`), `flex_wrap: nowrap`, `min_height: 400px`
  - Left inner container (`isInner: true`) — `background_color: #000957`, padding 56/80px, `flex_direction: column`, `flex_gap: 32px`, `justify_content: center`
    - `icon` — 40×40px, `primary_color: #3F8CFF` (or white)
    - `heading` — no color/typography set
    - `button` — no color/typography set
  - Right inner container (`isInner: true`) — full-bleed
    - `image` — placeholder URL, `object-fit: cover`, `width: 100%`

## Stats

Source: `components/core/sections/statisticsgrid.card.html` / `StatisticsGrid.jsx` (open both — the `.d.ts` documents the props, the `.card.html` the exact markup/spacing; distinct from TrustBar's single-row layout below, this is a card grid)

- Outer container — `flex_direction: column`, `flex_wrap: nowrap`
  - One row inner container per chunk of ≤4 stats (`isInner: true`, `flex_direction: row`, `flex_direction_mobile: column`, `flex_wrap: nowrap`, `flex_gap` per source)
    - Repeated metric inner containers (`isInner: true`, `width: 100/N%`, `width_mobile: 100%`) — padding 24px, `flex_direction: column`, `align_items: center`, `flex_gap: 8px`
      - `icon` — 32×32px, `primary_color: #3F8CFF`
      - `heading` — the number/value, no color/typography set
      - `text-editor` — the label, no color/typography set

## Contact

Source: `components/core/sections/leadform.reference.html` (simplified — no real inputs)

- Outer container — `background_color: #F9FAFB`, padding 64px, `flex_direction: column`, `flex_wrap: nowrap`, `flex_gap: 24px`
  - `heading` — no color/typography set
  - `text-editor` — intro copy, no color/typography set
  - `button` — links to the real WP contact page or a `mailto:` link, no color/typography set

**Caveat**: same as Hero — real input fields are out of scope for this widget whitelist.

## TrustBar

Source: `components/core/sections/trustbar.reference.html`

- Outer container — `background_color` per the light (`#FFFFFF`) or dark (`#000957`) variant the user wants, padding 32px 24px
  - One row inner container (`isInner: true`, `flex_direction: row`, `flex_direction_mobile: column`, `flex_wrap: nowrap`, `justify_content: space-evenly`) holding up to 4 stat items, each separated by a `divider` (vertical, `color: #DBEAFF` on light / a low-opacity white equivalent on dark)
    - Each stat is an inner container (`isInner: true`, `width: 100/N%`, `width_mobile: 100%`, `flex_direction: row`, `align_items: center`, `flex_gap: 16px`)
      - `icon` — circular icon container (`border_radius: 9999`, `background_color` brand tint) holding an `icon` widget, `primary_color: #3F8CFF`
      - Text inner container (`isInner: true`, `flex_direction: column`, `flex_gap: 4px`) — `heading` value + `text-editor` label, no color/typography on either

## OfficeLocations

Source: `components/core/sections/officelocations.reference.html`

- Outer container — `flex_direction: column`, `flex_wrap: nowrap`
  - Header inner container (`isInner: true`, `flex_direction: row`, `flex_wrap: nowrap`, `flex_direction_mobile: column`, `flex_gap: 10px`) — `heading` + `text-editor` intro, no color/typography on either

  **Caveat**: the real component's region tabs are a JS filter. Represent it as a static, flat list of offices instead of functional tabs — either all of them or a representative subset the user confirms — and tell the user the filtering is out of scope for this JSON widget whitelist.

  - One row inner container per chunk of 3-4 offices (`isInner: true`, `flex_direction: row`, `flex_direction_mobile: column`, `flex_wrap: nowrap`)
    - Repeated card inner containers (`isInner: true`, `width: 100/N%`, `width_mobile: 100%`) — `background_color: #FFFFFF`, 1px border `#DBEAFF`, padding 20px, `flex_direction: column`, `flex_gap: 10px`
      - `text-editor` — region label, no color/typography set
      - `heading` — office name, no color/typography set
      - `text-editor` — one line per phone/email/address, no color/typography set
      - `button` — "Send an Enquiry", no color/typography set

## TeamSection

Source: `components/core/sections/teamsection.reference.html`

- Outer container — `background_color: #FFFFFF`, padding 66px 64px
  - Header inner container (`isInner: true`, `flex_direction: row`, `flex_wrap: nowrap`, `flex_direction_mobile: column`, `flex_gap: 22px`, border-bottom `1px solid #ECF4FF`) — `heading` + `text-editor` intro, no color/typography on either
  - Row label inner container (`isInner: true`, `flex_direction: row`, `justify_content: space-between`, `align_items: center`) — `text-editor` "Our Specialists" label (no color/typography) + nav row of two circular `icon` containers (prev/next, same pattern as Testimonials). **Non-functional** — static decoration only.
  - One row inner container per chunk of ≤4 specialists (`isInner: true`, `flex_direction: row`, `flex_direction_mobile: column`, `flex_wrap: nowrap`, `flex_gap: 42px`)
    - Repeated card inner containers (`isInner: true`, `width: 100/N%`, `width_mobile: 100%`) — 1px border `#ECF4FF`, `flex_direction: column`
      - `image` — headshot, square aspect ratio, `object-fit: cover`
      - Body inner container (`isInner: true`, padding 30px 24px, `flex_direction: column`, `flex_gap: 12px`)
        - `heading` — name, no color/typography set
        - `text-editor` — role, no color/typography set
        - `icon` — LinkedIn glyph, `primary_color: #3F8CFF`. **Caveat**: a bare `icon` widget isn't clickable in this whitelist — if the LinkedIn link matters, wrap it as a discreet `button` instead (e.g. button text "LinkedIn") rather than a bare icon.
        - `text-editor` — bio, no color/typography set

## Navbar

Source: `components/core/sections/navbar.reference.html`

- Utility bar container — `flex_direction: row`, `flex_wrap: nowrap`, `justify_content: flex-end`, `flex_gap: 8px` (row) `20px` (between items), `background_color: #000957`, padding `8px 48px`
  - Repeated `text-editor` + `icon` pairs (language selector, contact line) — white text, 16px icons, no color/typography set on the `text-editor` itself (inherits theme; the white-on-Night-Blue look is lost on the text, only the container's `background_color` carries — flag this to the user)
- Main bar container (`isInner: true`, `background_color: #fefefe`, border-bottom `1px solid #DBEAFF`, `min_height: 96px`, padding `0 48px`, `flex_direction: row`, `flex_wrap: nowrap`, `justify_content: space-between`, `align_items: center`)
  - `image` — logo, `height: 42px`
  - Links row inner container (`isInner: true`, `flex_direction: row`, `flex_wrap: nowrap`, `flex_gap: 39px`, `flex_direction_mobile: column`) — repeated `button` widgets (one per nav item, since only `button` carries a `link`; no color/typography set, so these render as the theme's native button style rather than plain text links — flag this to the user as a visual difference from the real component's plain-text nav links)
  - `button` — primary CTA, no color/typography set
  - `icon` — hamburger (`fa-solid fa-bars` → `menu`), shown only at the mobile breakpoint; decorative/non-clickable, since no JS toggle exists in the whitelist

**Caveat**: the mega-menu hover dropdowns and the mobile accordion submenu are both JS-driven show/hide — neither is reproducible. Render Navbar as a flat, always-visible link list only (no dropdown panels, no collapsible mobile groups), and tell the user this is out of scope for the widget whitelist.

## HeroInner

Source: `components/core/sections/heroinner.reference.html`

- Outer container — `flex_direction: row` (`row-reverse` if `imagePosition: "right"`), `flex_wrap: nowrap`, `align_items: center`, `min_height: 480px` (`_tablet: 400px`), `background_color: #FFFFFF`, border-bottom `1px solid #DBEAFF`, `flex_direction_mobile: column`
  - Copy inner container (`isInner: true`, `width: 50%`, `width_mobile: 100%`, `flex_direction: column`, `justify_content: center`, `flex_gap: 32px`, padding `48px 64px 0` (`_tablet: 40px 40px 0`, `_mobile` padding reduced, `flex_gap_mobile: 24px`))
    - `heading` (h1) — no color/typography set
    - `text-editor` — description, no color/typography set
  - Media inner container (`isInner: true`, `width: 50%`, `width_mobile: 100%`, `min_height` matches outer, `min_height_mobile: 280px`)
    - `image` — full-bleed, `object-fit: cover`, `width: 100%`

**Note**: unlike Hero, HeroInner has no CTA buttons — it's the lighter inner-page hero variant. Don't add buttons unless the user explicitly asks for them.

## HeroLeadForm

Source: `components/core/sections/heroleadform.reference.html`

- Outer container — `flex_direction: row`, `flex_wrap: nowrap`, `min_height: 600px`, `flex_direction_mobile: column`
  - Left panel inner container (`isInner: true`, `background_color: #000957`, `width: 599px` (fixed, `width_mobile: 100%`), padding `33px` (`_mobile: 32px`), `flex_direction: column`, `flex_gap: 33px`)
    - `image` — brand symbol, `50×50px`
    - `heading` (h1) — no color/typography set
    - `text-editor` — short intro line, no color/typography set
  - Right panel inner container (`isInner: true`, `background_color: #FFFFFF`, padding `93px 44px 66px 0` (`_mobile: 40px 32px`), `flex_direction: column`, `flex_gap: 48px`)
    - `heading` — form headline, no color/typography set
    - `text-editor` — describes the requested fields (name, phone, email, country, interest, message) as body copy, since real inputs aren't available
    - `button` — submit CTA linking to the real WordPress form page or shortcode, no color/typography set

**Caveat**: same as Hero/Contact — real `<input>`/`<textarea>`/`<select>`/checkbox fields are entirely out of the widget whitelist. Represent the form's intent with copy plus a linking button, and tell the user forms are out of scope for this skill's JSON.

## CountryCard

Source: `components/core/sections/countrycard.card.html`

- One row inner container per chunk of ≤4 countries (`isInner: true`, `flex_direction: row`, `flex_direction_mobile: column`, `flex_wrap: nowrap`, `flex_gap: 16px`)
  - Repeated tile inner containers (`isInner: true`, `width: 100/N%`, `width_mobile: 100%`) — `background_color: #FFFFFF`, 1px border `#DBEAFF`, `border_radius: 0`, padding `20px`, `flex_direction: row`, `align_items: center`, `flex_gap: 16px`
    - `image` — flag, `32×32px`, `border_radius: 9999` (pill/circle exception)
    - Text inner container (`isInner: true`, `flex_direction: column`) — `heading` (country name) + `text-editor` (programme label), no color/typography on either

**Note**: the real component can render the whole card as a link (`href`). Since containers in this widget model don't carry a `link` setting, add a small `button` ("View Programme Details") inside the tile instead of relying on a whole-card link, the same pattern used for OfficeLocations' "Send an Enquiry".

## ProgramCard

Source: `components/core/sections/programcard.card.html`

- Outer container — `background_color: #FFFFFF`, 1px border `#DBEAFF`, `border_radius: 0`, padding `24px`, `flex_direction: column`, `flex_gap: 16px`
  - `text-editor` — optional uppercase overline/category label, no color set (the Electric-Blue overline color is lost — flag this to the user)
  - `heading` — programme title, no color/typography set
  - Repeated fact-row inner containers (`isInner: true`, `flex_direction: row`, `flex_wrap: nowrap`, `justify_content: space-between`) — one per fact, each holding two `text-editor` widgets (label, value)

**Caveat**: the real component bolds the value and mutes the label for contrast. Since `text-editor` carries no typography/color overrides, both render in the same inherited weight/color — tell the user this label/value emphasis is lost.

## SpeakerCard

Source: `components/core/sections/speakercard.card.html`

**`lg` variant** (team/profile card):
- Outer container — 1px border `#DBEAFF`, `border_radius: 0`, `flex_direction: column`
  - `image` — headshot, square (1:1), `object-fit: cover`
  - Body inner container (`isInner: true`, padding `30px 24px`, `flex_direction: column`, `flex_gap: 24px`)
    - `heading` — name, no color/typography set
    - `text-editor` — role, no color/typography set
    - `text-editor` — organisation, no color/typography set
    - `text-editor` — bio, no color/typography set
    - Tags row inner container (`isInner: true`, `flex_direction: row`, `flex_wrap: nowrap`, `flex_gap: 8px`) — repeated pill inner containers (`background_color: #E9ECF1`, `border_radius: 9999` pill exception, padding `2px 8px`) each holding a `text-editor` label, no color/typography set on the text

**`sm` variant** (horizontal profile row): same body content in a single row inner container (`flex_direction: row`, `align_items: center`, `flex_gap: 16px`, padding `16px`), `image` at `64×64px` instead of full-bleed, no bio/tags.

**Caveat**: the real component's initials-fallback avatar (when no photo is supplied) is hand-rolled inline CSS, not the shared Avatar primitive — since this widget whitelist has no way to render a colored initials square other than an `icon`-less bare container + `text-editor`, always ask the user for a real headshot image rather than attempting an initials fallback.

## TestimonialCard

Source: `components/core/sections/TestimonialCard.jsx` (via `cards-overview.reference.html`)

Structurally identical to a single card from the Testimonials recipe's "Cards row" above — reuse that tile verbatim, without the outer carousel/nav/dots chrome:
- Outer container — `background_color: #FFFFFF`, 1px border `#DBEAFF`, `border_radius: 0`, padding `24px`, `flex_direction: column`, `flex_gap: 16px`
  - Stars row inner container (`isInner: true`, `flex_direction: row`, `flex_gap: 2px`) — 5× `icon` (star, `primary_color: #DFB300` filled / `#DBEAFF` empty)
  - `text-editor` — italic quote copy, no color/typography set
  - Author row inner container (`isInner: true`, border-top `1px solid #DBEAFF`, padding-top `12px`, `flex_direction: row`, `align_items: center`, `flex_gap: 12px`)
    - Avatar inner container (`isInner: true`, `40×40px`, `border_radius: 9999` pill exception, `background_color: #ECF4FF`)
    - Name/role inner container (`isInner: true`, `flex_direction: column`) — `heading` name + `text-editor` role/company, no color/typography on either

**Caveat (`featured` variant)**: the real component swaps the top border for a `4px solid` Electric-Blue accent. Approximate with a thin decorative inner bar container (`height: 4px`, `background_color: #3F8CFF`, full width) at the top of the card, since a container in this model only carries one uniform `border_color`/`border_width`, not a per-side override.

## Footer

Source: `components/core/sections/footer.reference.html`

- Outer container — `background_color: #000957`, padding `66px 93px` (`_tablet: 56px 48px`, `_mobile: 48px 24px`), `flex_direction: column`, `flex_wrap: nowrap`, `flex_gap: 30px`
  - Newsletter zone row inner container (`isInner: true`, `flex_direction: row`, `flex_wrap: nowrap`, `flex_direction_mobile: column`, `flex_gap: 24px`)
    - `image` — white logo, `height: 41px`
    - Newsletter box inner container (`isInner: true`, 1px border `#1A2268`, padding `20px`, `flex_direction: column`, `flex_gap: 16px`)
      - `heading` — newsletter label, no color/typography set
      - `text-editor` — "enter your email to subscribe" style copy plus a `button` ("Subscribe"), no color/typography set (real `<input>` fields aren't available — same caveat as Hero/Contact)
  - `divider` — full-width horizontal rule, `color: #1A2268`
  - Columns zone row inner container (`isInner: true`, `flex_direction: row`, `flex_direction_mobile: column`, `flex_wrap: nowrap`, `justify_content: space-between`, `flex_gap: 24px`)
    - "Explore Opportunities" column inner container (`isInner: true`, `flex_direction: column`) — a `heading` group label per topic, stacked with `divider` (`color: #1A2268`) between each — see caveat below
    - Repeated static link column inner containers (About / Global Intelligence Unit / Services / Support) (`isInner: true`, `flex_direction: column`, `flex_gap: 13.5px`) — `heading` (column title) + repeated `button` widgets (one per link, since only `button` carries a `link`), separated from neighbouring columns by a vertical `divider` (`color: #1A2268`, hidden `_tablet`)
  - `divider` — full-width horizontal rule, `color: #1A2268`
  - Membership zone row inner container (`isInner: true`, `flex_direction: row`, `justify_content: space-between`, `flex_wrap: nowrap`) — `text-editor` ("We Are Member") + `image` (partner logo, `height: 38px`) + `image` (EU/Lisboa2030 badge, `height: 22px`)
  - `divider` — full-width horizontal rule, `color: #1A2268`
  - Bottom bar row inner container (`isInner: true`, `flex_direction: row`, `justify_content: space-between`, `flex_wrap: nowrap`, `flex_direction_mobile: column`) — `text-editor` (legal/copyright line, no color/typography set) + social icon row inner container (`isInner: true`, `flex_direction: row`, `flex_gap: 12px`) of brand `icon` widgets (see "Brand/social glyphs are the one exemption" in SKILL.md)

**Caveat**: the "Explore Opportunities" column's groups are visually an accordion in the live app, but true expand/collapse needs Elementor's native Accordion widget, outside the whitelist — render the group labels as an always-expanded stacked list (same pattern as FAQ), and tell the user this is static, not interactive.

## Agenda

Source: `components/core/sections/agenda.reference.html`

- Outer container — `max_width: 840px`, centered, `flex_direction: column`, `flex_wrap: nowrap`
  - `text-editor` — eyebrow label, no color set
  - `heading` (h1) — no color/typography set
  - `text-editor` — lede copy, no color/typography set
  - Repeated day-group inner containers (`isInner: true`, one per day, already a vertical stack so no row-chunking needed)
    - Day header inner container (`isInner: true`, border-bottom `2px solid #000957`, padding `8px 0`, `flex_direction: row`, `justify_content: space-between`, `align_items: center`) — `heading` (day title) + `icon` (chevron, decorative/non-clickable — real accordion collapse isn't in the whitelist)
    - Day body inner container (`isInner: true`, 1px border `#DBEAFF`, no top border) — repeated session row inner containers (`isInner: true`, `flex_direction: row`, `flex_wrap: nowrap`, `flex_gap: 16px`, padding `16px 20px`, border-bottom `1px solid #DBEAFF`, `background_color: #FFFFFF`)
      - Time badge inner container (`isInner: true`, `background_color: #000957`, padding `4px 8px`, `min_width: 80px`, `align_items: center`, `justify_content: center`) — `text-editor` (time), no color set (white-on-Night-Blue look and the monospace face are both lost — flag both to the user)
      - Body column inner container (`isInner: true`, `flex_direction: column`, `flex_gap: 4px`) — `heading` (session title, +optional small "track" pill inner container `background_color: #E9ECF1` holding a `text-editor`), `text-editor` (speaker line), `text-editor` (description)

**Caveat**: the day-group header's expand/collapse chevron is decorative only — the real component's reference markup itself already renders always-expanded (no wired JS), so this matches the source; and the time badge's monospace typeface can't be set on `text-editor` (no typography overrides allowed).

## BenefitsGrid

Source: `components/core/sections/benefitsgrid.reference.html`

- Outer container — `max_width: 1032px`, centered, `flex_direction: column`, `flex_wrap: nowrap`
  - Header inner container (`isInner: true`, `align_items: center`, `flex_direction: column`, `flex_gap: 8px`) — `heading` (centred) + `text-editor` (centred subtitle), no color/typography on either
  - One row inner container per chunk of 2 benefits (`isInner: true`, `flex_direction: row`, `flex_direction_mobile: column`, `flex_wrap: nowrap`, `flex_gap: 16px`)
    - Repeated item inner containers (`isInner: true`, `width: 50%`, `width_mobile: 100%`) — `background_color: #FFFFFF`, 1px border `#DBEAFF`, `border_radius: 0`, padding `16px`, `flex_direction: row`, `flex_gap: 12px`
      - `icon` — `20×20px` check, `primary_color: #22C55E`
      - Body inner column (`isInner: true`, `flex_direction: column`) — `heading` (item title) + `text-editor` (item description), no color/typography on either

## ComparisonTable

Source: `components/core/sections/comparisontable.reference.html`

- Outer container — `max_width: 1120px`, centered, `flex_direction: column`, `flex_wrap: nowrap`
  - Header inner container (`isInner: true`, `align_items: center`, `flex_direction: column`, `flex_gap: 8px`) — `text-editor` (eyebrow) + `heading` (h1) + `text-editor` (lede), no color/typography on any
  - Header row inner container (`isInner: true`, `flex_direction: row`, `flex_wrap: nowrap`) — one cell inner container per column (feature-label column + one per plan), `background_color: #E9ECF1` on plain columns, `background_color: #000957` on the highlighted plan's column, each `width: 100/N%`, holding a `heading` (column title, no color set — so the highlighted column's white-on-Night-Blue text is lost, flag this)
  - Repeated feature-row inner containers (`isInner: true`, one per compared feature, `flex_direction: row`, `flex_wrap: nowrap`, border-bottom `1px solid #DBEAFF`, `background_color: #FFFFFF` (or `#F9FAFB` on alternating rows to approximate zebra striping)) — one cell inner container per column, `width: 100/N%`, each holding: `text-editor` (the feature label, left column only) or `icon` (`fa-solid fa-check` `primary_color: #22C55E` for included, `fa-solid fa-xmark` `primary_color: #667085` for excluded) or `text-editor` (plain value like "Add-on") depending on the cell

**Caveat**: this is the heaviest approximation in this file. A real `<table>` (native row/column semantics, per-cell borders, zebra striping, a highlighted-column background) has no equivalent in the 6-widget whitelist — there is no `table` widget, and containers can't emit `<table>`/`<tr>`/`<td>` markup. This row-of-cell-containers approximation is more lossy and harder to keep pixel-aligned across many rows than any other recipe in this file — tell the user explicitly before building it.

## VideoSection

Source: `components/core/sections/videosection.reference.html`

- Outer container — `max_width: 800px`, centered, `flex_direction: column`, `flex_wrap: nowrap`
  - Header inner container (`isInner: true`, `align_items: center`, `flex_direction: column`, `flex_gap: 8px`) — `heading` + `text-editor` (subtitle), no color/typography on either (optional — only if the section has a heading)
  - Video wrapper inner container (`isInner: true`, `background_color: #000000`, `min_height` sized to a 16:9 ratio for the chosen width, `align_items: center`, `justify_content: center`)
    - `image` — poster frame, `object-fit: cover`, `width: 100%`
    - `icon` — decorative, non-clickable play button (`fa-solid fa-play` → `play_arrow`), centred over the poster, `72×72px` circular treatment (`primary_color: #FFFFFF` on a `background_color: #000957` circular icon container, `border_radius: 9999` circle exception)

**Caveat**: no widget in the whitelist can embed a real `<iframe>`/`<video>` or reproduce click-to-play. This renders a static poster image with a decorative play button only — tell the user clicking it will do nothing, and that real video embedding is out of scope for this skill's JSON.

## FloatingContactButton

Source: `components/core/sections/floatingcontactbutton.reference.html`

- Static, in-flow row inner container (`isInner: true`, `flex_direction: row`, `flex_wrap: nowrap`, `justify_content: center`, `flex_gap: 12px`, padding `16px`) — repeated action inner containers, each a circular icon container (`44×44px`, `border_radius: 9999` circle exception) + adjacent `text-editor` label:
  - Call — `background_color: #000957`, `icon` `fa-solid fa-phone` → `call`
  - WhatsApp — `background_color: #25D366` (literal brand color), `icon` `fa-brands fa-whatsapp` (brand exemption)
  - Email — `background_color: #3F8CFF`, `icon` `fa-solid fa-envelope` → `mail`

**Caveat (read before building)**: the real component is `position: fixed`, portal-rendered outside normal document flow, and JS-toggled open/closed — none of which Elementor's plain container+6-widget model can reproduce (no fixed/sticky-to-viewport setting exists in this widget set). This recipe renders a static, always-open, in-flow row instead — it loses the entire point of a floating contact button (staying visible while the visitor scrolls), not just a style detail. Tell the user this explicitly, and suggest they instead use Elementor's own sticky/motion-effects settings directly in the editor once the JSON is pasted, if that behaviour matters to them.

## StickyCta

Source: `components/core/sections/stickycta.reference.html`

- Static, in-flow bar container — `flex_direction: row`, `flex_wrap: nowrap`, `align_items: center`, `justify_content: center`, `flex_gap: 24px`, padding `16px 32px`, `background_color: #000957` (`dark` theme) or `#FFFFFF` + 1px border `#DBEAFF` (`light` theme)
  - `text-editor` — message copy, no color/typography set
  - `button` — CTA, no color/typography set
  - `icon` — optional dismiss (`fa-solid fa-xmark` → `close`), decorative/non-clickable since no JS dismiss exists in the whitelist

**Caveat (read before building)**: same fixed/sticky-positioning limitation as FloatingContactButton — the real component is `position: fixed` (top or bottom) and portal-rendered. This renders as a static full-width bar in normal document flow instead, losing the "always visible while scrolling" behaviour entirely. Tell the user this explicitly before building, and suggest Elementor's own sticky/motion-effects settings as the real way to get that behaviour once pasted into the editor.

## Custom

No recipe among the 25 documented section types above matches — **before building anything, ask the user for a reference**: a Figma link, an image/screenshot, or raw HTML of the section they want. Do not improvise a brand-new visual pattern from a text description alone; every recipe in this file was derived from a real GCS source file, and Custom sections should be derived from a real reference the same way.

Once a reference is supplied, derive the container/widget tree from it following the same conventions used throughout this file: the six-widget whitelist (`heading`, `text-editor`, `button`, `image`, `icon`, `divider`), no typography/color on `heading`/`text-editor`/`button`, literal GCS colors on containers/`icon`/`divider`, `flex_wrap: "nowrap"` always with explicit row containers for any repeated/grid content (see "Repeating grids without flex_wrap" in `elementor-json-spec.md`). Ask one clarifying question only if the supplied reference doesn't specify enough content to build a tree (see SKILL.md's Error handling section).

Avoid the reflexive icon+heading+text tile grid or the big-number/small-label "hero-metric" layout as a default for a Custom section — those two patterns are licensed only for Features and Stats respectively, because they come from real GCS reference components. For Custom, reach for them only if the supplied reference specifically calls for that shape; otherwise build a structure that actually matches the reference.

## Primitives beyond the 25 sections

Every recipe above is derived from a real section component's own hand-rolled markup, not from importing a shared primitive directly — across all 25 sections, only `Icon` (Navbar, FaqAccordion, Footer, OfficeLocations, StatisticsGrid) and `Button` (Navbar) are ever imported from `components/core/primitives/`. The other 11 primitives (`Accordion`, `Avatar`, `Badge`, `Chart`, `Countdown`, `ImageGallery`, `LogoCarousel`, `Table`, `Tabs`, `Tag`, `Timeline`) are unused by any section today, but a supplied Custom reference may still call for a shape that conceptually matches one of them. Before building, check which side of this line the requested shape falls on:

**Approximable with the 6-widget whitelist** (static/structural, no real interactivity needed):
- `Table` — approximate the same way as ComparisonTable above: row-of-cell-containers, no true table semantics.
- `Avatar` — a circular (`border_radius: 9999`) `image` or initials container, same pattern as Testimonials'/TestimonialCard's avatar.
- `Badge` / `Tag` — a small pill inner container (`border_radius: 9999`, `background_color` per variant) holding a `text-editor` label, same pattern as Features' tag pill or SpeakerCard's tag chips.
- `Timeline` — a vertical stack of step inner containers, each with a circular `icon`/number container connected by `divider`-as-connector-line; status colour (done/active/pending) carried on the circle's `background_color`.

**Impossible regardless of the reference supplied** (real interactivity, animation, or embeds the whitelist has no widget for): `Accordion` (expand/collapse), `Tabs` (tab switching), `Chart` (SVG data visualisation), `Countdown` (live JS timer), `ImageGallery` (lightbox/keyboard nav), `LogoCarousel` (CSS marquee animation). If a Custom reference calls for one of these, tell the user upfront that only a static single-state snapshot can be built (e.g. one Chart data point rendered as a Stats-style number, one Countdown value frozen as static text, one Gallery image shown full-width) and that the real interactive/animated behaviour is out of scope for this skill's JSON — the same posture as the FAQ/Navbar/Testimonials caveats above.
