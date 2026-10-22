---
last_updated: 2026-09-08
updated_by: codex-gcs-image-usability
change_note: "Aligned scene-specific image focus and clarified illustrative portrait use"
---

# Global Citizen Solutions — Imagery Guideline (bundled)

Self-contained copy of the brand's imagery rules, extracted from the design system's `readme.md` → "Imagery & Illustrations". Bundled here so this skill works standalone, on any machine, without the design system repo present. If the design system repo *is* available, that `readme.md` section is the source of truth and should win on conflict.

The brand uses clean, data-driven layouts without decorative imagery. When photography is used, it must read as calm, deliberate, and institutional — never as lifestyle or travel marketing.

## Allowed subjects

This table defines the brand's photography subjects across real and generated
imagery. It does not by itself authorise AI generation. Apply the separate
AI-eligibility rules below before creating or editing an image.

| Category | Use | Notes |
|----------|-----|-------|
| Country / Architecture | Brochure covers, heroes, backgrounds | Iconic city skylines, landmark buildings, historic architecture — the permanent and the established |
| Interiors | Brochures, editorial content | Executive boardrooms, refined residential interiors, formal legal settings — understated quality |
| Portraits / Headshots | Case studies, speaker cards, advisor profiles | Professional, neutral background (white, light grey, or Night Blue), direct gaze |
| Multi-generational family | Brochure covers, social content | Authentic, understated — a family having a considered conversation, not a beach photoshoot |
| Data visualisation | Content pages, GIU reports | SVG charts using brand tokens — preferred over photography for content-heavy layouts |
| Maps and geography | Country cards, programme pages | Minimal, monochrome — not decorative tourist maps |

For AI work, a fictional professional or family may appear only in an otherwise
eligible internal concept, prototype, or non-premium context. An advisor,
employee, client, speaker, testimonial author, or other real identifiable person
must come from an authorised supplied photograph and must never be replaced by a
synthetic lookalike.

## Forbidden / avoid

| Avoid | Why |
|-------|-----|
| Tropical beaches, resorts, yachts, luxury cars | Conveys escapism and lifestyle aspiration — not advisory positioning |
| Handshake / "corporate stock" clichés | Looks transactional; positions Global Citizen Solutions as a product vendor, not an advisor |
| Company- or logo-centric hero shots (advisor as focal point, oversized branding) | Breaks the client-is-the-hero rule |
| Political imagery, flags in political context | Violates the neutrality principle |
| Over-saturated, high-contrast HDR, tropical/vacation-bright photography | Too lifestyle-escapist; undermines the controlled, premium-editorial grading |
| Cartoons, illustrations, clip art | No decorative or whimsical elements |
| AI artefacts — distorted text, extra digits, unnatural symmetry | Undermines credibility with a high-net-worth audience |
| People pointing at laptops or charts | Classic staged stock — instantly recognisable as inauthentic |

## Sentiment / tone test

The audience — high-net-worth individuals and families planning across jurisdictions — are deliberate, not impulsive. Imagery must convey: calm confidence (slow, quiet pacing, room to breathe); international perspective (cosmopolitan cities, recognised landmarks); stability and permanence (architecture and institutions built for generations); human legacy (considered, familial moments — never performative); and precision and authority (abstract treatments lean architectural and structured, not soft or organic).

*Tone test:* would this image sit comfortably in *The Economist*, the *Financial Times*, or a Swiss private bank's annual report? If yes, it fits. If it feels like a travel brochure or luxury lifestyle magazine, it does not.

## Messaging pillar mapping

Every image should trace back to one of the three pillars:

- **Optionality** → cosmopolitan skylines, multiple jurisdictions in view.
- **Security and Access** → stable architecture and institutions, calm and permanent composition.
- **Family and Future Generations** → understated multi-generational imagery, considered rather than staged.

## Colour treatment — Visual Identity Spec

Every photographic image (real or AI-generated) shares one identity so nothing looks like it came from a different shoot: **warm-neutral, muted, filmic colour grading** — controlled highlights, deep clean shadows, subtle organic contrast, never over-saturated or tropical/vacation-bright. **Soft natural directional light**, no harsh shadows. **Scene-appropriate depth of field**: moderate shallow focus for close portraits, enough depth for every face in groups, and deeper focus for architecture and interiors; keep important context legible. **Subtle film grain**. Where people appear: realistic skin and fabric texture preserved, no beauty retouching, no artificial skin smoothing. A Night Blue overlay gradient at 20–40% opacity still applies on cover/hero images for type legibility. Black and white is acceptable for editorial moments.

## Technical specifications

| Context | Minimum resolution | Ratio | Treatment |
|---------|-------------------|-------|-----------|
| Brochure cover (A4) | 3,000 × 4,200 px | Portrait | Full-bleed + Night Blue gradient overlay |
| Slide deck hero | 2,560 × 1,440 px | 16:9 | Full-bleed, warm-neutral muted grade |
| Website hero | 2,400 × 1,350 px | 16:9 | Full-bleed, overlay optional |
| Social (Instagram/LinkedIn feed) | 1,080 × 1,080 px | 1:1 | Night Blue overlay + brand elements |
| Portrait / headshot | 800 × 1,000 px min | 4:5 | Clean neutral or Night Blue background |
| Content / editorial | 1,200 × 800 px min | 3:2 | Warm-neutral muted grade |

## AI-generated images — eligibility

**Acceptable for:** internal mockups/prototypes, social media filler (non-premium touchpoints), abstract background textures (no people), and concept visualisations before real photography exists.

**Not acceptable for:** client-facing brochures and case studies, synthetic
advisor/team/client portraits, paid advertisements (legal disclosure risk), or
passport/ID document mockups.

## Prompt vocabulary

**Include:** `architectural photography`, `wide angle cityscape`, `editorial documentary style`, `warm-neutral muted tones`, `soft natural directional light`, `scene-appropriate depth of field`, `subtle film grain`, `candid moment`, `financial district`, `European landmark`, `understated interior`, `photorealistic`, `35mm film`, `no people` (architecture) or `executive portrait`, `realistic skin/fabric texture`, `professional`, `neutral background` (portraits).

**Exclude:** `over-saturated`, `HDR`, `tropical/vacation-bright golden hour`, `luxury lifestyle`, `beach`, `resort`, `vacation`, `colourful`, `fun`, `dynamic`, `bold`, `dramatic`, `fantasy`, `over-retouching`, `artificial skin smoothing`, `harsh shadows`.

After generation: inspect hands and text (common failure points), verify no unintended political symbols or flags, apply the same warm-neutral colour grading as real photography, and label the file with an `_ai` suffix for tracking.

## Ready-to-use prompts

1. **Country / Architecture** (16:9, 2,400 × 1,350 px): *"Architectural photography, wide angle cityscape of a cosmopolitan European financial district skyline, recognised historic and modern landmarks sharing the frame, editorial documentary style, warm-neutral muted colour grading, soft natural directional light, deeper focus with legible architecture and controlled verticals, subtle film grain, photorealistic, no people, no over-saturation, no tropical or vacation-bright tones, no HDR, no text, no flags."*
2. **Interiors** (3:2, 1,200 × 800 px min): *"Understated executive boardroom or formal legal office interior, refined and calm, soft natural directional light through large windows, editorial documentary style, warm-neutral muted colour grading, sufficient depth of field to keep the room and furniture coherent, subtle film grain, photorealistic, no people, no harsh shadows, no HDR, no visible branding."*
3. **Fictional professional portrait concept — eligible internal use only** (4:5, 800 × 1,000 px min): *"Editorial portrait of a fictional professional, not a real advisor, employee, or client, direct gaze, candid moment, neutral background in white, light grey, or deep navy, soft natural directional light, shallow depth of field, warm-neutral muted colour grading, subtle film grain, realistic skin texture preserved, no beauty retouching, no artificial skin smoothing, no harsh shadows, no over-saturation."*
4. **Multi-generational family** (4:5, 800 × 1,000 px min): *"Understated multi-generational family having a considered quiet conversation at home, candid and authentic, not staged or performative, professional documentary photography, warm-neutral muted colour grading, soft natural directional light, sufficient depth of field to keep every face naturally sharp, subtle film grain, realistic skin and fabric texture preserved, no beauty retouching, no beach or resort setting, no over-saturation or vacation-bright tones, no visible text or logos."*
5. **Maps and geography** (3:2, 1,200 × 800 px min): *"Minimal monochrome map illustration of a country or region, clean cartographic line work, muted navy tones on a light background, no decorative tourist icons, no vibrant colours, no illustrated figures, no text labels beyond simple place markers."*

After generating with any of the above: inspect hands and text, verify no unintended political symbols or flags, apply the same warm-neutral muted colour grading and film-grain texture, and save the file with an `_ai` suffix.

## Brand colours (for reference only — not used to recolour photographic output)

Night Blue `#000957` · Electric Blue `#3F8CFF`. These are the digital-product palette, not a photo-grade target — photographic imagery follows the warm-neutral grade above; Night Blue only appears as an overlay gradient on hero/cover images for legibility.
