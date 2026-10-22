# GCS Design System — tokens & rules for social media

The values below were traced from the design system's `tokens/` and the reference templates `templates/social-media/carousel/InstagramCarousel.dc.html` (carousel/single post) and `templates/social-media/stories/Stories.dc.html` (story). Those paths are **provenance only** — they live outside this skill and are not needed at generation time; this document is the runtime source of truth. **Never substitute with generic palettes.**

## Colours

| Token | HEX | Use |
|---|---|---|
| `--night-blue-25` | `#E8EBF0` | Dark foreground, borders |
| `--night-blue-50` | `#B3B5CD` | Muted text on light background |
| `--night-blue-100` | `#8084AB` | Decorative, dividers |
| `--night-blue-200` | `#333A79` | Medium overlay on photos |
| `--night-blue-300` | `#1A2268` | Headings on white, quote text |
| `--night-blue-400` | `#000957` | Primary background, logo, headings |
| `--electric-blue-25` | `#ECF4FF` | Subtle badge background |
| `--electric-blue-50` | `#D9E8FF` | Highlight borders |
| `--electric-blue-400` | `#3F8CFF` | Overlines, numbers, CTAs, Q&A |
| `--star` | `#DFB300` | Ratings (rare use) |
| body-text grey | `#6b7280` | Body copy on white |
| hairline grey | `#e5e7eb` | Dividers, chart tracks, card borders |
| `--doc-label-on-dark` | `#A8B3CD` | Type 11 action-row icons and labels on dark |
| review-card border | `#22416E` | Type 11 review-card border only |
| avatar tint (light) | `#C4CCE3` | Type 11 reviewer initials avatar (white 3px border, `#000957` initials) |

## Gradients

| Token | CSS | Use |
|---|---|---|
| `--gradient-primary` | `linear-gradient(180deg, #000957 0%, #0F1A2D 100%)` | Dark slide backgrounds |
| `--gradient-overlay-photo` | `linear-gradient(180deg, rgba(0,9,87,0.15) 0%, rgba(0,9,87,0.60) 45%, rgba(15,26,45,0.92) 100%)` | Overlay on full-bleed photos |
| `--gradient-band` | `linear-gradient(180deg, #1A2268 0%, #000957 100%)` | Bottom band over photos |
| CTA slide gradient | `linear-gradient(160deg, #0c1563 0%, #000957 35%, #000644 100%)` | CTA / dark slides |
| Trustpilot slide gradient | `linear-gradient(to bottom, #000957 41%, #0C1734 90%, #0F1A2D 100%)` | Type 11 canvas (card inside uses `--gradient-primary`) |

**Rules:** gradient always runs `#000957` (top) → darker (base) — never inverted. Do not mix the primary gradient with solid `#1A2268` as a background on the same slide.

## Typography

Families: `--font-serif: Yrsa, Georgia, serif` · `--font-sans: Heebo, system-ui, sans-serif`.
Google Fonts is blocked at render time — fonts come from the TTFs bundled at `assets/fonts/` via `FONTS_CSS` (see `rendering.md`). Yrsa ships a **real italic**, so italic headline lines are never browser-synthesised oblique.

| Element | Family | Size (at 1080px width) | Line-height | Weight |
|---|---|---|---|---|
| Cover Display / Hook (Type 1 only — unchanged) | Yrsa | 88px | 1.08 | 400 |
| Heading h2 (body slides) | Yrsa | 64–76px | 1.1 | 400 |
| Q&A question | Yrsa | 44–50px | 1.2 | 400 — Electric Blue |
| Quote | Heebo | 40px | 1.5 | 400 — `#000957` (light slides) / `#ffffff` (dark slides) |
| Body text | Heebo | 42px | 1.6 | 400 |
| Overline / label (cover — unchanged) | Heebo | 30px | 1.2 | 500 — uppercase, `letter-spacing:0.1em`, Electric Blue |
| Overline / label (visual slides) | Heebo | 26px | 1.2–1.4 | 600 — uppercase, `letter-spacing:0.13em`, Electric Blue |
| CTA / caption | Heebo | 24–28px | 1.4 | 400 |
| Speaker name | Heebo | 36px | 1.4 | 500 — `#000957` (light slides) / `#ffffff` (dark slides) |
| Speaker title | Heebo | 36px | 1.4 | 400 — `#8892AF` |
| Review text (Type 11) | Heebo | 40px | 1.5 | 400 — `#ffffff` |
| Reviewer name (Type 11) | Heebo | 34px | 1.4 | 500 — `#ffffff` |
| Reviewer country + date (Type 11) | Heebo | 34px | 1.4 | 400 — `#8892AF` |
| Action-row label (Type 11) | Heebo | 28px | 1.5 | 400 — `#A8B3CD` |
| Avatar initials (Type 11) | Heebo | 46px | 1.5 | 400 — `#000957` |

Story slides (1080×1920) use their own independently-tuned scale — smaller than Carousel's, not "top of range":

| Element | Family | Story size | Carousel size (for comparison) | Line-height |
|---|---|---|---|---|
| Cover H1 (unchanged) | Yrsa | 82px, clamp 4 lines | 88px, clamp 3 lines | 1.05 |
| Heading h2 | Yrsa | 72px | 76px | 1.05 |
| Quote | Heebo | 40px | 40px | 1.5 |
| Body text | Heebo | 36px | 42px | 1.5 |
| Overline / label (cover, unchanged) | Heebo | 30px | 30px | 1.2 |
| Swipe / CTA label (cover, unchanged) | Heebo | 22px | 20px | — |
| Speaker name / title | Heebo | 36px | 36px | 1.4 |
| CTA headline | Yrsa | 68px | 76px | 1.05 |
| CTA body | Heebo | 42px | 46px | 1.5 |
| Review text (Type 11) | Heebo | 40px | 40px | 1.5 |
| Reviewer name / country + date (Type 11) | Heebo | 36px | 34px | 1.4 |
| Trustpilot footer lockup (Type 11) | — | `height:60px` | `height:52px` | — |
| CTA sign-off | Yrsa | 58px | 64px | 1.05 |
| CTA URL line | Heebo | 30px | 32px | 1.5 |

All values traced to `templates/social-media/stories/Stories.dc.html`. Do not reuse Carousel sizes on a Story canvas — they are a different, independently-authored scale.

## Visual identity

- **Corner radius: 0** on all layout elements. Only exceptions: speaker photos (`border-radius:50%`), decorative circles, and the carousel Type 11 (Trustpilot) review card (`border-radius:50px` + `border-radius:50%` avatar), which deliberately mimics the Trustpilot card — never extend that radius to any other slide type.
- **No shadows.** Dividers are `1px solid #e5e7eb`.
- **Padding:** minimum 72–80px from canvas edges for content; spacing in multiples of 4px.
- **Overlay on photos:** always Night Blue `rgba(0,9,87,x)` — **never pure black**.
- **Speaker photo:** circular, border `4px solid white` (dark bg) or `3px solid #E8EBF0` (light bg).
- **Electric Blue** `#3F8CFF` appears only in overlines, sequence numbers, Q&A questions, names, and accents — never in body text.
- **Headings are always Yrsa** (serif) — never Heebo in a heading.

## Logos

Logos are **real PNG files bundled in this skill** (`assets/logos/`), exposed as data-URI constants by `scripts/gcs_assets.py` (see `rendering.md`). They work on any device, offline, without the repo. The GitHub repo is private; do not attempt to fetch logos over the network, and never point at an SVG in the design system's `assets/` — that folder does not exist on a machine that only has this skill.

| Constant | Bundled file | Use |
|---|---|---|
| `LOGO_WHITE` | `assets/logos/GCS-Primary-White.png` | White primary logo — on photos and dark backgrounds |
| `LOGO_BLUE` | `assets/logos/GCS-Primary-Blue.png` | Night Blue primary logo — on white backgrounds |
| `LOGO_WORDMARK_WHITE` | `assets/logos/GCS-Secondary-White.png` | White wordmark lockup — **LinkedIn Post footer only**, `height:28px` |
| `LOGO_WORDMARK_BLUE` | `assets/logos/GCS-Secondary-Blue.png` | Full blue wordmark — reserved for special branded materials; **not used** in carousel or social slides |

### ⚠️ Critical logo rule — never violate

**The GCS logo NEVER sits on a CSS-built white circle or any shape.** Render it directly as an `<img>` with no wrapper background.

- Never: `<div style="background:white;border-radius:50%">` + logo inside.
- Always: `<img src="{LOGO_WHITE}" style="height:79px; width:auto; display:block; align-self:flex-start;">` directly.

### Placement summary

| Context | Logo constant | Size | Position |
|---|---|---|---|
| Photo / dark / gradient slides (Types 1,2,3B,4,5,7,9,10) | `LOGO_WHITE` | `height:79px; width:auto` | top-left via flex `align-self:flex-start` |
| White slides (Types 3,6,8) | `LOGO_BLUE` | `height:79px; width:auto` | top-left via flex `align-self:flex-start` |
| Story (1080×1920) | `LOGO_WHITE` (Types 1,2,3B,4,5,7,9,10) / `LOGO_BLUE` (Types 3,6,8) | `height:88px; width:auto` | top-left via flex `align-self:flex-start`, inside `padding:250px 100px 310px` (or `250px 100px` on Type 5, `250px 100px 60px` header zone on Types 6/7) |

**Primary icon logo only — no exceptions.** Every slide carries `LOGO_WHITE` or `LOGO_BLUE` (the primary icon mark). `LOGO_WORDMARK_BLUE` is **not used** in carousel or social slides — it is **never** the primary logo on any slide type.

## Consistency rules

| Element | Rule |
|---|---|
| Logo backgrounds | Never a CSS circle — `<img>` with the SVG directly |
| Overlay on photos | Always Night Blue `rgba(0,9,87,x)` |
| Electric Blue | Overlines, numbers, Q&A, accents only — never body text |
| Corner radius | `0` everywhere except circular photos |
| Headings | Always Yrsa |
| Gradient direction | `#000957` top → darker base, never inverted |
| Words per slide | ≤ 40 body words · headlines ≤ 12 words |
| Swipe cue | "SWIPE" label + inline SVG chevron (not a `→` glyph) on Carousel/Story frame 1 (Instagram) |
| Written carousel content | Always on White slides (Type 3) |
| Last carousel slide | Always the CTA (Type 10) |
| Photos | User-provided photos only. No photo → use Night Blue gradient background. |

## Common errors

| Error | Fix |
|---|---|
| CSS circle behind the logo | Use the SVG directly — it carries its own background |
| White logo on white background | White slides use `LOGO_BLUE` (`GCS-Primary-Blue`) |
| Blue logo on dark background | Dark/photo slides use `LOGO_WHITE` (`GCS-Primary-White`) |
| LOGO_WORDMARK_BLUE as primary slide logo | Use `LOGO_WHITE` (dark/photo slides) or `LOGO_BLUE` (white slides) — `LOGO_WORDMARK_BLUE` is not used in carousel or social slides |
| LOGO_WHITE missing from Type 3B slides | Type 3B (Dark) is a dark background — always use `LOGO_WHITE`, same as Types 1,2,4,5,7,9,10 |
| Rounded corners on cards/charts | `border-radius:0` — the only exception is the Type 11 Trustpilot review card (50px) |
| Black photo overlay | `rgba(0,9,87,x)` |
| Heebo headings | Yrsa only |
| Missing logo on a slide | Every slide carries a GCS mark |
| Carousel without closing CTA | Always end with the CTA slide |
| Image referenced by path | Embed as base64 `data:` URI |
| HTML written via shell heredoc | `$`/backticks corrupt base64 — write files from Python |
| Shrinking type to fit content | Split into another slide instead |
| Google Fonts `<link>` | Blocked at render — embed `@font-face` (see `rendering.md`) |
| LOGO_BLUE on dark/photo/CTA slide | `LOGO_BLUE` is for white backgrounds; use `LOGO_WHITE` on any dark or photo slide — the names are counterintuitive |

## Human design touches

These are what separate a designed carousel from a generated one:

- **Visual density variation across slides.** A carousel should never feel like one repeating layout. Alternate between "light" slides (large Yrsa headline, short or no body copy — punchy, high whitespace) and "dense" slides (table, ranked list, or icon list with 3–4 items). If every slide is the same visual weight, the sequence reads as machine-generated.

- **One visual anchor per slide.** Every slide must have a single dominant entry point — the element the eye hits first. It can be a headline at 72px+, a flag, a large Yrsa number (100px+), or an icon leading a list. If two elements compete visually for dominance (e.g. two large numbers, two flags side by side), reduce one to supporting weight.

- **Electric Blue used sparingly and purposefully.** Maximum 1–2 instances of `#3F8CFF` per slide. If more than two elements want the accent colour, only the most important keeps it — the others revert to `#000957` or `#6b7280`. When Electric Blue appears on overlines, numbers *and* icons on the same slide, it loses its emphasis value entirely.

- **Country flag = editorial precision.** A flag is not decoration — it is a claim of specificity. Use it when the content is specifically about that country, not when a country is mentioned in passing. One well-placed flag communicates credibility and attention to detail; a slide scattered with flags for every passing reference communicates the opposite.
