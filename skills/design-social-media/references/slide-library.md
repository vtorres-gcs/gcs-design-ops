# Slide Library — carousel, single post, story, LinkedIn post

Design foundation: `templates/social-media/carousel/InstagramCarousel.dc.html` (carousel), `templates/social-media/stories/Stories.dc.html` (story), and `templates/social-media/linkedin/LinkedInPostLandscape.dc.html` + `templates/social-media/linkedin/LinkedInPostSquare.dc.html` (LinkedIn post) in this repository. The templates below are extracted from them and adapted for static rendering. All placeholders in `{CURLY_BRACES}` are filled at generation time; `{LOGO_*}` and `{PHOTO_*}` are base64 data URIs (see `rendering.md`).

## Contents

1. [Carousel — slide types 1–11](#carousel--the-11-slide-types)
2. [Carousel structure & platform limits](#carousel-structure)
3. [Single Post](#single-post)
4. [LinkedIn Post](#linkedin-post) — 1200×627 landscape or 1080×1080 square, headline-only feed image
5. [Story — the 11 frame types](#story--the-11-frame-types) — 1080×1920, mirrors the Carousel's Type 1–11 set frame-for-frame
6. [Visual asset snippets](#visual-asset-snippets) (stat cards, bar chart, table, timeline, ranked list)
7. [Type 12 — Custom Layout](#type-12--custom-layout) — free canvas inside the brand tokens
8. [Icons & flags](#icons--flags)

---

## Carousel — the 11 slide types

Canvas: 1080×1350 (Instagram/LinkedIn) or 1080×1080 (X/Facebook — reduce vertical offsets proportionally, keep type sizes).

| # | Name | Background | When |
|---|---|---|---|
| 1 | Cover | Full-bleed photo + smooth 5-stop bottom gradient → solid Night Blue at 92% | Always slide 1 |
| 2 | Photo Gradient | Full-bleed photo + same bottom gradient, headline + body at bottom | Inner photo slide with text |
| 3 | White | Pure white — headline + body OR visual asset | Written content, detailed explanation |
| 3B | Dark | Night Blue bg — headline + body OR visual asset (no photo required) | Bold claims, key insight, impact moments |
| 4 | Photo Overlay | Full-bleed photo + solid Night Blue 0.7 overlay | Atmosphere / lifestyle |
| 5 | Image Only | Full-bleed photo + 0.20 dark overlay, logo only | Visual break / emotional beat |
| 6 | Image Block White | White bg, image strip 450px top, body below | Feature with supporting photo (light) |
| 7 | Image Block Dark | Night Blue bg, image strip 450px top, body below | Feature with supporting photo (dark) |
| 8 | Quote White | White bg, quote-mark PNG, quote + attribution | Client or GCS expert quote |
| 9 | Quote Dark | Night Blue bg, white quote-mark PNG | Same on dark canvas |
| 10 | CTA | Full-bleed `background-cta.png` (bundled asset), centred content | Always the last slide |
| 11 | Trustpilot | Night Blue → deep-navy gradient, centred logo, bordered review card, Trustpilot lockup in the footer | A real Trustpilot review — social proof (Story version in the Story section) |

**Core rule: alternate White (Type 3) and Dark (Type 3B) — never more than 2 consecutive slides with the same background colour. Both are available without photos.**

```html
<!-- TYPE 1 · Cover -->
<div style="position:absolute; inset:0; width:1080px; height:1350px; display:flex; flex-direction:column;">
  <img src="{PHOTO_DATA_URI}" style="position:absolute; inset:0; width:1080px; height:1350px; object-fit:cover; display:block;" alt="">
  <!-- No photo → remove the <img> entirely and add this background to the outer div:
       background: linear-gradient(160deg, #0c1563 0%, #000957 35%, #000644 100%);
       Apply the same gradient to Types 2, 4, and 5 when no photo is provided. -->
  <div style="position:absolute; inset:0; background:linear-gradient(to bottom, transparent 0%, transparent 20%, color-mix(in srgb, #000957 60%, transparent) 50%, color-mix(in srgb, #000957 92%, transparent) 70%, #000957 92%);"></div>
  <div style="position:relative; z-index:2; display:flex; flex-direction:column; justify-content:space-between; height:1350px; padding:125px;">
    <img src="{LOGO_WHITE}" style="height:79px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
    <div style="display:flex; flex-direction:column; gap:20px;">
      <p style="font-family:'Heebo',sans-serif; font-size:30px; font-weight:500; color:#3F8CFF; letter-spacing:0.1em; text-transform:uppercase; line-height:1.2;">{OVERLINE}</p>
      <h1 style="font-family:'Yrsa',serif; font-size:88px; font-weight:400; line-height:1.0; margin:0;">
        <span style="display:-webkit-box; color:#ffffff; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">{HEADLINE}</span>
        <span style="display:-webkit-box; font-style:italic; color:#B3B5CD; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">{HEADLINE_HIGHLIGHT}</span>
      </h1>
      <!-- {HEADLINE} + {HEADLINE_HIGHLIGHT} together ≤ 12 words — plain white line, then an italic, lighter-tint highlight line -->
      <div style="display:flex; align-items:center; gap:10px; margin-top:8px;">
        <span style="font-family:'Heebo',sans-serif; font-size:20px; font-weight:500; color:#ffffff; letter-spacing:0.1em; text-transform:uppercase;">SWIPE</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </div>
    </div>
  </div>
</div>

<!-- TYPE 2 · Photo Gradient — inner photo slide with text -->
<div style="position:absolute; inset:0; width:1080px; height:1350px; display:flex; flex-direction:column;">
  <img src="{PHOTO_DATA_URI}" style="position:absolute; inset:0; width:1080px; height:1350px; object-fit:cover; display:block;" alt="">
  <div style="position:absolute; inset:0; background:linear-gradient(to bottom, transparent 0%, transparent 20%, color-mix(in srgb, #000957 60%, transparent) 50%, color-mix(in srgb, #000957 92%, transparent) 70%, #000957 92%);"></div>
  <div style="position:relative; z-index:2; display:flex; flex-direction:column; justify-content:space-between; height:1350px; padding:125px;">
    <img src="{LOGO_WHITE}" style="height:79px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
    <div style="display:flex; flex-direction:column; gap:40px;">
      <h2 style="font-family:'Yrsa',serif; font-size:76px; font-weight:400; color:#ffffff; line-height:1.0;">{HEADLINE}</h2>
      <p style="font-family:'Heebo',sans-serif; font-size:42px; font-weight:400; color:#E8EBF0; line-height:1.5;">{BODY — max 40 words}</p>
    </div>
  </div>
</div>

<!-- TYPE 3 · White — text mode -->
<div style="position:absolute; inset:0; width:1080px; height:1350px; background:#ffffff; display:flex; flex-direction:column; padding:125px;">
  <img src="{LOGO_BLUE}" style="height:79px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:40px;">
    <h2 style="font-family:'Yrsa',serif; font-size:76px; font-weight:400; color:#000957; line-height:1.0;">{HEADLINE}</h2>
    <p style="font-family:'Heebo',sans-serif; font-size:42px; font-weight:400; color:#414856; line-height:1.5;">{BODY — max 40 words}</p>
  </div>
</div>

<!-- TYPE 3 · White — visual mode (replace body paragraph with a visual asset snippet) -->
<div style="position:absolute; inset:0; width:1080px; height:1350px; background:#ffffff; display:flex; flex-direction:column; padding:125px;">
  <img src="{LOGO_BLUE}" style="height:79px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:32px;">
    <p style="font-family:'Heebo',sans-serif; font-size:26px; font-weight:600; color:#3F8CFF; letter-spacing:0.1em; text-transform:uppercase;">{OVERLINE — optional}</p>
    <h2 style="font-family:'Yrsa',serif; font-size:64px; font-weight:400; color:#000957; line-height:1.0;">{SHORT HEADING}</h2>
    {VISUAL_ASSET — see snippets below}
  </div>
</div>

<!-- TYPE 3B · Dark — text mode (no photo required) -->
<div style="position:absolute; inset:0; width:1080px; height:1350px; background:#000957; display:flex; flex-direction:column; padding:125px;">
  <img src="{LOGO_WHITE}" style="height:79px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:40px;">
    <h2 style="font-family:'Yrsa',serif; font-size:76px; font-weight:400; color:#ffffff; line-height:1.0;">{HEADLINE}</h2>
    <p style="font-family:'Heebo',sans-serif; font-size:40px; font-weight:400; color:#E8EBF0; line-height:1.5;">{BODY — max 40 words}</p>
  </div>
</div>

<!-- TYPE 3B · Dark — visual mode (replace body paragraph with a visual asset snippet; apply dark palette override) -->
<div style="position:absolute; inset:0; width:1080px; height:1350px; background:#000957; display:flex; flex-direction:column; padding:125px;">
  <img src="{LOGO_WHITE}" style="height:79px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:32px;">
    <p style="font-family:'Heebo',sans-serif; font-size:26px; font-weight:600; color:#3F8CFF; letter-spacing:0.1em; text-transform:uppercase;">{OVERLINE — optional}</p>
    <h2 style="font-family:'Yrsa',serif; font-size:64px; font-weight:400; color:#ffffff; line-height:1.0;">{SHORT HEADING}</h2>
    {VISUAL_ASSET — use dark palette override; see "Dark palette override" section}
  </div>
</div>

<!-- TYPE 4 · Photo Overlay -->
<div style="position:absolute; inset:0; width:1080px; height:1350px; display:flex; flex-direction:column;">
  <img src="{PHOTO_DATA_URI}" style="position:absolute; inset:0; width:1080px; height:1350px; object-fit:cover; display:block;" alt="">
  <div style="position:absolute; inset:0; background:rgba(0,9,87,0.7);"></div>
  <div style="position:relative; z-index:2; display:flex; flex-direction:column; justify-content:space-between; height:1350px; padding:125px;">
    <img src="{LOGO_WHITE}" style="height:79px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
    <div style="display:flex; flex-direction:column; gap:40px;">
      <h2 style="font-family:'Yrsa',serif; font-size:76px; font-weight:400; color:#ffffff; line-height:1.0;">{HEADLINE}</h2>
      <p style="font-family:'Heebo',sans-serif; font-size:42px; font-weight:400; color:#E8EBF0; line-height:1.5;">{BODY — max 40 words}</p>
    </div>
  </div>
</div>

<!-- TYPE 5 · Image Only — visual break, no copy -->
<div style="position:absolute; inset:0; width:1080px; height:1350px; display:flex; flex-direction:column;">
  <img src="{PHOTO_DATA_URI}" style="position:absolute; inset:0; width:1080px; height:1350px; object-fit:cover; display:block;" alt="">
  <div style="position:absolute; inset:0; background:rgba(0,0,0,0.20);"></div>
  <div style="position:relative; z-index:2; padding:125px;">
    <img src="{LOGO_WHITE}" style="height:79px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
  </div>
</div>

<!-- TYPE 6 · Image Block White -->
<div style="position:absolute; inset:0; width:1080px; height:1350px; background:#ffffff; display:flex; flex-direction:column;">
  <div style="padding:125px 125px 60px; flex-shrink:0;">
    <img src="{LOGO_BLUE}" style="height:79px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
  </div>
  <div style="position:relative; width:1080px; height:450px; flex-shrink:0; overflow:hidden;">
    <img src="{PHOTO_DATA_URI}" style="width:1080px; height:450px; object-fit:cover; display:block;" alt="">
    <div style="position:absolute; inset:0; background:rgba(0,0,0,0.20);"></div>
  </div>
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; padding:125px;">
    <p style="font-family:'Heebo',sans-serif; font-size:42px; font-weight:400; color:#414856; line-height:1.5;">{BODY — max 40 words}</p>
  </div>
</div>

<!-- TYPE 7 · Image Block Dark -->
<div style="position:absolute; inset:0; width:1080px; height:1350px; background:#000957; display:flex; flex-direction:column;">
  <div style="padding:125px 125px 60px; flex-shrink:0;">
    <img src="{LOGO_WHITE}" style="height:79px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
  </div>
  <div style="position:relative; width:1080px; height:450px; flex-shrink:0; overflow:hidden;">
    <img src="{PHOTO_DATA_URI}" style="width:1080px; height:450px; object-fit:cover; display:block;" alt="">
    <div style="position:absolute; inset:0; background:rgba(0,0,0,0.20);"></div>
  </div>
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; padding:125px;">
    <p style="font-family:'Heebo',sans-serif; font-size:40px; font-weight:400; color:#E8EBF0; line-height:1.5;">{BODY — max 40 words}</p>
  </div>
</div>

<!-- TYPE 8 · Quote White -->
<div style="position:absolute; inset:0; width:1080px; height:1350px; background:#ffffff; display:flex; flex-direction:column; padding:125px;">
  <img src="{LOGO_BLUE}" style="height:79px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:40px;">
    <img src="{QUOTE_ICON_BLUE}" style="width:178px; height:153px; display:block; flex-shrink:0;" alt="">
    <p style="font-family:'Heebo',sans-serif; font-size:40px; font-weight:400; color:#000957; line-height:1.5;">{QUOTE TEXT — max 4 lines}</p>
  </div>
  <div style="display:flex; flex-direction:column; gap:8px; flex-shrink:0;">
    <p style="font-family:'Heebo',sans-serif; font-size:36px; font-weight:500; color:#000957; line-height:1.4;">{SPEAKER NAME}</p>
    <p style="font-family:'Heebo',sans-serif; font-size:36px; font-weight:400; color:#8892AF; line-height:1.4;">{TITLE}</p>
  </div>
</div>

<!-- TYPE 9 · Quote Dark -->
<div style="position:absolute; inset:0; width:1080px; height:1350px; background:#000957; display:flex; flex-direction:column; padding:125px;">
  <img src="{LOGO_WHITE}" style="height:79px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:40px;">
    <img src="{QUOTE_ICON_WHITE}" style="width:178px; height:153px; display:block; flex-shrink:0;" alt="">
    <p style="font-family:'Heebo',sans-serif; font-size:40px; font-weight:400; color:#ffffff; line-height:1.5;">{QUOTE TEXT — max 4 lines}</p>
  </div>
  <div style="display:flex; flex-direction:column; gap:8px; flex-shrink:0;">
    <p style="font-family:'Heebo',sans-serif; font-size:36px; font-weight:500; color:#ffffff; line-height:1.4;">{SPEAKER NAME}</p>
    <p style="font-family:'Heebo',sans-serif; font-size:36px; font-weight:400; color:#8892AF; line-height:1.4;">{TITLE}</p>
  </div>
</div>

<!-- TYPE 10 · CTA — always the last slide
     Background: always the bundled asset — never a user photo, never Unsplash.
     Comes from the skill's own assets/images/background-cta.png as `CTA_BG` (see rendering.md).
-->
<div style="position:absolute; inset:0; width:1080px; height:1350px; display:flex; flex-direction:column;">
  <img src="{CTA_BG}" style="position:absolute; inset:0; width:1080px; height:1350px; object-fit:cover; display:block;" alt="">
  <div style="position:relative; z-index:2; display:flex; flex-direction:column; height:1350px; padding:125px;">
    <div style="display:flex; justify-content:center; flex-shrink:0;">
      <img src="{LOGO_WHITE}" style="height:79px; width:auto; display:block;" alt="Global Citizen Solutions">
    </div>
    <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:40px; text-align:center;">
      <h2 style="font-family:'Yrsa',serif; font-size:76px; font-weight:400; color:#ffffff; line-height:1.0;">{CTA HEADLINE}</h2>
      <p style="font-family:'Heebo',sans-serif; font-size:46px; font-weight:400; color:#E8EBF0; line-height:1.5;">{BODY — invite to comment / share / visit}</p>
      <p style="font-family:'Yrsa',serif; font-size:64px; font-weight:400; color:#ffffff; line-height:1.0;">{SIGN-OFF — e.g. "Thanks."}</p>
    </div>
    <p style="font-family:'Heebo',sans-serif; font-size:32px; font-weight:400; color:#3F8CFF; letter-spacing:0.18em; text-transform:uppercase; text-align:center; line-height:1.5; flex-shrink:0;">{URL — e.g. "globalcitizensolutions.com"}</p>
  </div>
</div>

<!-- TYPE 11 · Trustpilot — one real review (Story variant of this frame is in the Story section)
     Only ever use a review the user supplied or that is published on Global Citizen Solutions'
     Trustpilot profile — never invent a reviewer, a country, a date, or a rating.
     The star row is the bundled `TRUSTPILOT_STARS` asset (never a redrawn star row) and the
     footer carries the bundled `TRUSTPILOT_LOGO` lockup.
     The three action icons are Material Symbols inlined below — copy this markup
     verbatim rather than re-fetching them; they are a closed set for this slide.
     Structure is fixed: centred GCS logo, card, Trustpilot lockup. NO overline above the card.
-->
<div style="position:absolute; inset:0; width:1080px; height:1350px; background:linear-gradient(to bottom, #000957 41%, #0C1734 90%, #0F1A2D 100%); display:flex; flex-direction:column; padding:125px;">
  <div style="display:flex; align-items:center; justify-content:center; flex-shrink:0;">
    <img src="{LOGO_WHITE}" style="height:79px; width:auto; display:block;" alt="Global Citizen Solutions">
  </div>
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; padding:60px;">
    <!-- Review card — 50px radius, a deliberate exception to the brand's sharp-corner default (it mimics the Trustpilot card) -->
    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:49px; padding:0 40px; border:1px solid #22416E; border-radius:50px; background:linear-gradient(to bottom, #000957 0%, #0F1A2D 100%);">
      <div style="display:flex; align-items:center; gap:20px; flex-shrink:0;">
        <div style="width:99px; height:99px; flex-shrink:0; border-radius:50%; border:3px solid #ffffff; background:#C4CCE3; display:flex; align-items:center; justify-content:center;">
          <span style="font-family:'Heebo',sans-serif; font-size:46px; font-weight:400; color:#000957; line-height:1.5;">{INITIALS — 2 letters from the reviewer's name}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; min-width:0;">
          <p style="font-family:'Heebo',sans-serif; font-size:34px; font-weight:500; color:#ffffff; line-height:1.4;">{REVIEWER NAME}</p>
          <p style="font-family:'Heebo',sans-serif; font-size:34px; font-weight:400; color:#8892AF; line-height:1.4;">{COUNTRY} • {MONTH YEAR}</p>
        </div>
      </div>
      <img src="{TRUSTPILOT_STARS}" style="width:231px; height:43px; display:block; flex-shrink:0;" alt="Rated five out of five on Trustpilot">
      <p style="font-family:'Heebo',sans-serif; font-size:40px; font-weight:400; color:#ffffff; line-height:1.5;">{REVIEW TEXT — max 45 words / 7 lines; quote verbatim, no paraphrasing}</p>
      <!-- Action row — inline Material Symbols, colour comes from the parent's `color` -->
      <div style="display:flex; align-items:center; justify-content:space-between; width:407px; flex-shrink:0; color:#A8B3CD;">
        <div style="display:flex; align-items:center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 -960 960 960" fill="currentColor" style="display:block; flex-shrink:0;"><path d="M716-120H272v-512l278-288 39 31q6 5 9 14t3 22v10l-45 211h299q24 0 42 18t18 42v81.84q0 7.16 1.5 14.66T915-461L789-171q-8.88 21.25-29.59 36.12Q738.69-120 716-120Zm-384-60h397l126-299v-93H482l53-249-203 214v427Zm0-427v427-427Zm-60-25v60H139v392h133v60H79v-512h193Z"/></svg>
          <span style="font-family:'Heebo',sans-serif; font-size:28px; font-weight:400; line-height:1.5;">Useful</span>
        </div>
        <div style="display:flex; align-items:center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 -960 960 960" fill="currentColor" style="display:block; flex-shrink:0;"><path d="M686-80q-47.5 0-80.75-33.25T572-194q0-8 5-34L278-403q-16.28 17.34-37.64 27.17Q219-366 194-366q-47.5 0-80.75-33T80-480q0-48 33.25-81T194-594q24 0 45 9.3 21 9.29 37 25.7l301-173q-2-8-3.5-16.5T572-766q0-47.5 33.25-80.75T686-880q47.5 0 80.75 33.25T800-766q0 47.5-33.25 80.75T686-652q-23.27 0-43.64-9Q622-670 606-685L302-516q3 8 4.5 17.5t1.5 18q0 8.5-1 16t-3 15.5l303 173q16-15 36.09-23.5 20.1-8.5 43.07-8.5Q734-308 767-274.75T800-194q0 47.5-33.25 80.75T686-80Zm.04-60q22.96 0 38.46-15.54 15.5-15.53 15.5-38.5 0-22.96-15.54-38.46-15.53-15.5-38.5-15.5-22.96 0-38.46 15.54-15.5 15.53-15.5 38.5 0 22.96 15.54 38.46 15.53 15.5 38.5 15.5Zm-492-286q22.96 0 38.46-15.54 15.5-15.53 15.5-38.5 0-22.96-15.54-38.46-15.53-15.5-38.5-15.5-22.96 0-38.46 15.54-15.5 15.53-15.5 38.5 0 22.96 15.54 38.46 15.53 15.5 38.5 15.5ZM724.5-727.54q15.5-15.53 15.5-38.5 0-22.96-15.54-38.46-15.53-15.5-38.5-15.5-22.96 0-38.46 15.54-15.5 15.53-15.5 38.5 0 22.96 15.54 38.46 15.53 15.5 38.5 15.5 22.96 0 38.46-15.54ZM686-194ZM194-480Zm492-286Z"/></svg>
          <span style="font-family:'Heebo',sans-serif; font-size:28px; font-weight:400; line-height:1.5;">Share</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 -960 960 960" fill="currentColor" style="display:block; flex-shrink:0;"><path d="M200-120v-680h343l19 86h238v370H544l-18.93-85H260v309h-60Zm300-452Zm95 168h145v-250H511l-19-86H260v251h316l19 85Z"/></svg>
      </div>
    </div>
  </div>
  <!-- Footer — Trustpilot lockup, the review's source attribution -->
  <div style="display:flex; align-items:center; justify-content:center; flex-shrink:0;">
    <img src="{TRUSTPILOT_LOGO}" style="height:52px; width:auto; display:block;" alt="Trustpilot">
  </div>
</div>
```

**Type 11 rules:**

- **No overline.** This is the one slide type that never carries an Electric Blue overline (or any heading, eyebrow, or label) above the card. The centred GCS logo, the card, and the Trustpilot lockup in the footer are the whole composition — the lockup already says where the review comes from, so a "TRUSTPILOT REVIEW" label on top is redundant and breaks the layout's balance.
- **One review per slide** — never stack two reviews in the same card.
- **Verbatim copy.** Fix nothing but obvious typos in the reviewer's text; never rewrite it into GCS voice, never trim mid-sentence without an ellipsis. If a review needs more than ~45 words to make sense, pick a shorter one instead of cutting it badly.
- **Attribution is name + country + month/year** — no surnames-only, no job titles, no company names. Initials in the avatar are the reviewer's own.
- The `Useful` / `Share` / flag row is decorative Trustpilot chrome — it stays as-is, in English, and is never used as a CTA. The real ask always lives on the Type 10 CTA slide.
- Only for 5-star reviews. A lower rating needs a different stars asset, which the system does not ship — do not fake it by cropping.

## Carousel structure

```
Slide 1    → Type 1  (Cover)
Slides 2+  → Type 3 (White) / Type 3B (Dark) — alternate; never more than 2 consecutive same-colour slides
             Type 2 or 4 (Photo) — only when extra user photos exist
             Type 5  (Image Only) — visual break, no copy needed
             Type 6/7 (Image Block) — when a supporting photo amplifies the body copy
Slide N-1  → Type 8 or 9 (Quote — only when a real quote exists)
             Type 11 (Trustpilot — only when a real review exists; sits after the content, before the CTA)
Slide N    → Type 10 (CTA)
```

Type 11 is social proof, so it belongs late — after the argument is made, immediately before the CTA. Use **either** a Quote slide (Type 8/9) **or** a Trustpilot slide, not both back-to-back: two testimonial slides in a row read as filler. A Trustpilot slide never opens or closes a carousel.

Sequences by content type:

- **Article / report:** Cover → Photo Gradient (context) → White / Dark alternating ×N → Quote White or Dark → CTA
- **Educational / tips:** Cover → Photo Gradient (intro) → White / Dark alternating ×N → Image Only (visual break) → CTA
- **Comparison:** Cover → White (Option A) → Dark (Option B) → White visual (table) → CTA
- **Q&A / "X minutes with":** Cover (speaker photo) → White (Q&A pairs, question in Electric Blue Yrsa) ×N → Quote Dark → CTA
- **Client story / service proof:** Cover → Photo Gradient (situation) → White / Dark alternating ×N (what was done) → Trustpilot (Type 11) → CTA

Platform limits: Instagram/LinkedIn max 20 slides (practical 7–10) · Facebook 10 (practical 5–7) · Twitter/X **4** — pick the strongest points. Instagram: slide 1 already has the swipe cue (translated to content language); ask for a *save* in the CTA. LinkedIn: PDF carousels outperform image posts; ask for a *comment or repost*.

## Single Post

One canvas, 1080×1350 (or 1080×1080 on request). Pick the layout that fits the message — you are not restricted to the cover layout:

- **Photo hook** (Cover / Photo Gradient layout) — announcement, destination, lifestyle message. Add a short CTA line under the headline (Heebo 400, 30px, `rgba(255,255,255,0.86)`) since there are no further slides.
- **Data post** (White visual layout) — one strong statistic or comparison as the hero. Great for stat cards or a compact ranking.
- **Statement post** (Night Blue background, no quote icon) — bold claim or quote, centred, logo on top. Use `background:#000957` or `background:linear-gradient(160deg,#0c1563 0%,#000957 35%,#000644 100%)` for more depth.

A single post must be self-sufficient: headline + one supporting element + where to go next (URL or "link in bio").

## LinkedIn Post

Two canvases, pick per placement: **Landscape** 1200×627 (1.91:1, default — matches the LinkedIn feed link-preview aspect) or **Square** 1080×1080 (1:1). Design foundation: `templates/social-media/linkedin/LinkedInPostLandscape.dc.html` and `templates/social-media/linkedin/LinkedInPostSquare.dc.html`.

Structure (identical on both canvases, only geometry and padding differ):

1. Full-bleed cover photo, `object-fit:cover`, centred.
2. Gradient overlay: `linear-gradient(180deg, rgba(0,9,87,0.1) 12.41%, rgb(0,9,87) 86.27%)` — Night Blue, never black.
3. Centred headline block, Yrsa 82px / line-height 1.05:
   - Main line — `{{coverHeadline}}`, `color:var(--primary-foreground)`, 2-line clamp.
   - Highlight line — `{{coverHeadlineHighlight}}`, italic, `color:var(--night-blue-50)`, 2-line clamp.
4. Logo footer, centred, `{LOGO_WORDMARK_WHITE}` (bundled `assets/logos/GCS-Secondary-White.png`) at `height:28px`.

Rules specific to this format — do not apply the Carousel/Story rules here:

- **Photo is mandatory.** There is no gradient-only variant — always block on the cover photo (see SKILL.md photo gate).
- **Headline only.** No body copy, no CTA line, no swipe cue on the canvas. The call to action goes in the LinkedIn post caption text, not the image.
- **Logo is always the Secondary White lockup** (`{LOGO_WORDMARK_WHITE}`), never the primary icon used on Carousel/Story slides.
- One idea, one headline + one highlight line — same "never overcrowd" bar as every other format.

## Story — the 11 frame types

Canvas: 1080×1920 (9:16). Frame types and numbering mirror the Carousel exactly (Type 1–11, with 3B as the dark variant of 3) — same logic, same colours, same font families, but every canvas-geometry-dependent number is independently tuned for the taller Story canvas. Design foundation: `templates/social-media/stories/Stories.dc.html`.

| # | Name | Background | Padding | When |
|---|---|---|---|---|
| 1 | Cover | Full-bleed photo + smooth 5-stop bottom gradient → solid Night Blue at 85% | `250px 100px 310px` | Always frame 1 |
| 2 | Photo Gradient | Full-bleed photo + same bottom gradient, headline + body at bottom | `250px 100px 310px` | Inner photo frame with text |
| 3 | White | Pure white — headline + body | `250px 100px 310px` | Written content |
| 3B | Dark | Night Blue bg — headline + body (no photo required) | `250px 100px 310px` | Bold claims, key insight |
| 4 | Photo Overlay | Full-bleed photo + solid Night Blue 0.7 overlay | `250px 100px 310px` | Atmosphere / lifestyle |
| 5 | Image Only | Full-bleed photo + 0.20 dark overlay, logo only | `250px 100px` (2-value — only frame like this) | Visual break |
| 6 | Image Block White | White bg, image block 620px, body below | header `250px 100px 60px` / body `100px 100px 310px` | Feature with supporting photo (light) |
| 7 | Image Block Dark | Night Blue bg, image block 620px, body below | same two zones as #6 | Feature with supporting photo (dark) |
| 8 | Quote White | White bg, quote-mark PNG, quote + attribution | `250px 100px 310px` | Client or GCS expert quote |
| 9 | Quote Dark | Night Blue bg, white quote-mark PNG | `250px 100px 310px` | Same on dark canvas |
| 10 | CTA | Full-bleed bundled CTA background — `STORY_CTA_BG`, the same image as the carousel's | `250px 100px 310px` | Always the last frame |
| 11 | Trustpilot | Night Blue → deep-navy gradient, centred logo, bordered review card, Trustpilot lockup in the footer | `250px 100px 310px` | A real Trustpilot review — social proof |

**Core rule: same as Carousel — alternate White (Type 3) and Dark (Type 3B), never more than 2 consecutive frames with the same background colour.** Logo is always `height:88px` — do not mix logo sizes across frames of the same story.

```html
<!-- TYPE 1 · Cover -->
<div style="position:relative; width:1080px; height:1920px; display:flex; flex-direction:column; overflow:hidden;">
  <img src="{PHOTO_DATA_URI}" style="position:absolute; inset:0; width:1080px; height:1920px; object-fit:cover; display:block;" alt="">
  <!-- No photo → remove the <img> entirely and add this background to the outer div:
       background: linear-gradient(160deg, #0c1563 0%, #000957 35%, #000644 100%);
       Apply the same gradient to Types 2, 4, and 5 when no photo is provided. -->
  <div style="position:absolute; inset:0; background:linear-gradient(to bottom, transparent 0%, transparent 15%, color-mix(in srgb, #000957 60%, transparent) 42%, color-mix(in srgb, #000957 92%, transparent) 62%, #000957 85%);"></div>
  <div style="position:relative; z-index:2; display:flex; flex-direction:column; justify-content:space-between; height:1920px; padding:250px 100px 310px;">
    <img src="{LOGO_WHITE}" style="height:88px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
    <div style="display:flex; flex-direction:column; gap:28px;">
      <p style="font-family:'Heebo',sans-serif; font-size:30px; font-weight:500; color:#3F8CFF; letter-spacing:0.1em; text-transform:uppercase; line-height:1.2;">{OVERLINE}</p>
      <h1 style="font-family:'Yrsa',serif; font-size:82px; font-weight:400; line-height:1.05; margin:0;">
        <span style="display:-webkit-box; color:#ffffff; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">{HEADLINE}</span>
        <span style="display:-webkit-box; font-style:italic; color:#B3B5CD; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">{HEADLINE_HIGHLIGHT}</span>
      </h1>
      <!-- {HEADLINE} + {HEADLINE_HIGHLIGHT} together ≤ 16 words — plain white line, then an italic, lighter-tint highlight line -->
      <div style="display:flex; align-items:center; gap:10px; margin-top:12px;">
        <span style="font-family:'Heebo',sans-serif; font-size:22px; font-weight:500; color:#ffffff; letter-spacing:0.13em; text-transform:uppercase;">SWIPE</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </div>
    </div>
  </div>
</div>

<!-- TYPE 2 · Photo Gradient — inner photo frame with text -->
<div style="position:relative; width:1080px; height:1920px; display:flex; flex-direction:column; overflow:hidden;">
  <img src="{PHOTO_DATA_URI}" style="position:absolute; inset:0; width:1080px; height:1920px; object-fit:cover; display:block;" alt="">
  <div style="position:absolute; inset:0; background:linear-gradient(to bottom, transparent 0%, transparent 15%, color-mix(in srgb, #000957 60%, transparent) 42%, color-mix(in srgb, #000957 92%, transparent) 62%, #000957 85%);"></div>
  <div style="position:relative; z-index:2; display:flex; flex-direction:column; justify-content:space-between; height:1920px; padding:250px 100px 310px;">
    <img src="{LOGO_WHITE}" style="height:88px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
    <div style="display:flex; flex-direction:column; gap:40px;">
      <h2 style="font-family:'Yrsa',serif; font-size:72px; font-weight:400; color:#ffffff; line-height:1.05;">{HEADLINE}</h2>
      <p style="font-family:'Heebo',sans-serif; font-size:36px; font-weight:400; color:#E8EBF0; line-height:1.5;">{BODY — max 40 words}</p>
    </div>
  </div>
</div>

<!-- TYPE 3 · White -->
<div style="position:relative; width:1080px; height:1920px; background:#ffffff; display:flex; flex-direction:column; padding:250px 100px 310px; overflow:hidden;">
  <img src="{LOGO_BLUE}" style="height:88px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:40px;">
    <h2 style="font-family:'Yrsa',serif; font-size:72px; font-weight:400; color:#000957; line-height:1.05;">{HEADLINE}</h2>
    <p style="font-family:'Heebo',sans-serif; font-size:36px; font-weight:400; color:#414856; line-height:1.5;">{BODY — max 40 words}</p>
  </div>
</div>

<!-- TYPE 3B · Dark (no photo required) -->
<div style="position:relative; width:1080px; height:1920px; background:#000957; display:flex; flex-direction:column; padding:250px 100px 310px; overflow:hidden;">
  <img src="{LOGO_WHITE}" style="height:88px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:40px;">
    <h2 style="font-family:'Yrsa',serif; font-size:72px; font-weight:400; color:#ffffff; line-height:1.05;">{HEADLINE}</h2>
    <p style="font-family:'Heebo',sans-serif; font-size:36px; font-weight:400; color:#E8EBF0; line-height:1.5;">{BODY — max 40 words}</p>
  </div>
</div>

<!-- TYPE 4 · Photo Overlay -->
<div style="position:relative; width:1080px; height:1920px; display:flex; flex-direction:column; overflow:hidden;">
  <img src="{PHOTO_DATA_URI}" style="position:absolute; inset:0; width:1080px; height:1920px; object-fit:cover; display:block;" alt="">
  <div style="position:absolute; inset:0; background:rgba(0,9,87,0.7);"></div>
  <div style="position:relative; z-index:2; display:flex; flex-direction:column; justify-content:space-between; height:1920px; padding:250px 100px 310px;">
    <img src="{LOGO_WHITE}" style="height:88px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
    <div style="display:flex; flex-direction:column; gap:40px;">
      <h2 style="font-family:'Yrsa',serif; font-size:72px; font-weight:400; color:#ffffff; line-height:1.05;">{HEADLINE}</h2>
      <p style="font-family:'Heebo',sans-serif; font-size:36px; font-weight:400; color:#E8EBF0; line-height:1.5;">{BODY — max 40 words}</p>
    </div>
  </div>
</div>

<!-- TYPE 5 · Image Only — visual break, no copy (only frame with 2-value padding) -->
<div style="position:relative; width:1080px; height:1920px; display:flex; flex-direction:column; overflow:hidden;">
  <img src="{PHOTO_DATA_URI}" style="position:absolute; inset:0; width:1080px; height:1920px; object-fit:cover; display:block;" alt="">
  <div style="position:absolute; inset:0; background:rgba(0,0,0,0.20);"></div>
  <div style="position:relative; z-index:2; padding:250px 100px;">
    <img src="{LOGO_WHITE}" style="height:88px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
  </div>
</div>

<!-- TYPE 6 · Image Block White (image block is 620px tall — taller than the Carousel's 450px) -->
<div style="position:relative; width:1080px; height:1920px; background:#ffffff; display:flex; flex-direction:column; overflow:hidden;">
  <div style="padding:250px 100px 60px; flex-shrink:0;">
    <img src="{LOGO_BLUE}" style="height:88px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
  </div>
  <div style="position:relative; width:1080px; height:620px; flex-shrink:0; overflow:hidden;">
    <img src="{PHOTO_DATA_URI}" style="width:1080px; height:620px; object-fit:cover; display:block;" alt="">
    <div style="position:absolute; inset:0; background:rgba(0,0,0,0.20);"></div>
  </div>
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; padding:100px 100px 310px;">
    <p style="font-family:'Heebo',sans-serif; font-size:36px; font-weight:400; color:#414856; line-height:1.5;">{BODY — max 40 words}</p>
  </div>
</div>

<!-- TYPE 7 · Image Block Dark -->
<div style="position:relative; width:1080px; height:1920px; background:#000957; display:flex; flex-direction:column; overflow:hidden;">
  <div style="padding:250px 100px 60px; flex-shrink:0;">
    <img src="{LOGO_WHITE}" style="height:88px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
  </div>
  <div style="position:relative; width:1080px; height:620px; flex-shrink:0; overflow:hidden;">
    <img src="{PHOTO_DATA_URI}" style="width:1080px; height:620px; object-fit:cover; display:block;" alt="">
    <div style="position:absolute; inset:0; background:rgba(0,0,0,0.20);"></div>
  </div>
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; padding:100px 100px 310px;">
    <p style="font-family:'Heebo',sans-serif; font-size:36px; font-weight:400; color:#E8EBF0; line-height:1.5;">{BODY — max 40 words}</p>
  </div>
</div>

<!-- TYPE 8 · Quote White -->
<div style="position:relative; width:1080px; height:1920px; background:#ffffff; display:flex; flex-direction:column; padding:250px 100px 310px; overflow:hidden;">
  <img src="{LOGO_BLUE}" style="height:88px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:40px;">
    <img src="{QUOTE_ICON_BLUE}" style="width:178px; height:153px; display:block; flex-shrink:0;" alt="">
    <p style="font-family:'Heebo',sans-serif; font-size:40px; font-weight:400; color:#000957; line-height:1.5;">{QUOTE TEXT — max 4 lines}</p>
  </div>
  <div style="display:flex; flex-direction:column; gap:8px; flex-shrink:0;">
    <p style="font-family:'Heebo',sans-serif; font-size:36px; font-weight:500; color:#000957; line-height:1.4;">{SPEAKER NAME}</p>
    <p style="font-family:'Heebo',sans-serif; font-size:36px; font-weight:400; color:#8892AF; line-height:1.4;">{TITLE}</p>
  </div>
</div>

<!-- TYPE 9 · Quote Dark -->
<div style="position:relative; width:1080px; height:1920px; background:#000957; display:flex; flex-direction:column; padding:250px 100px 310px; overflow:hidden;">
  <img src="{LOGO_WHITE}" style="height:88px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:40px;">
    <img src="{QUOTE_ICON_WHITE}" style="width:178px; height:153px; display:block; flex-shrink:0;" alt="">
    <p style="font-family:'Heebo',sans-serif; font-size:40px; font-weight:400; color:#ffffff; line-height:1.5;">{QUOTE TEXT — max 4 lines}</p>
  </div>
  <div style="display:flex; flex-direction:column; gap:8px; flex-shrink:0;">
    <p style="font-family:'Heebo',sans-serif; font-size:36px; font-weight:500; color:#ffffff; line-height:1.4;">{SPEAKER NAME}</p>
    <p style="font-family:'Heebo',sans-serif; font-size:36px; font-weight:400; color:#8892AF; line-height:1.4;">{TITLE}</p>
  </div>
</div>

<!-- TYPE 10 · CTA — always the last frame
     Background: always the bundled document-photo asset — never a user photo, never Unsplash.
     This is the SAME image as the Carousel's CTA background: `STORY_CTA_BG` is an alias of
     `CTA_BG` (assets/images/background-cta.png, byte-identical to the design system's
     assets/uploads/background-document.png). Never load it from a repo path.
-->
<div style="position:relative; width:1080px; height:1920px; display:flex; flex-direction:column; overflow:hidden;">
  <img src="{STORY_CTA_BG}" style="position:absolute; inset:0; width:1080px; height:1920px; object-fit:cover; display:block;" alt="">
  <div style="position:relative; z-index:2; display:flex; flex-direction:column; height:1920px; padding:250px 100px 310px;">
    <div style="display:flex; justify-content:center; flex-shrink:0;">
      <img src="{LOGO_WHITE}" style="height:88px; width:auto; display:block; align-self:flex-start;" alt="Global Citizen Solutions">
    </div>
    <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:40px; text-align:center;">
      <h2 style="font-family:'Yrsa',serif; font-size:68px; font-weight:400; color:#ffffff; line-height:1.05;">{CTA HEADLINE}</h2>
      <p style="font-family:'Heebo',sans-serif; font-size:42px; font-weight:400; color:#E8EBF0; line-height:1.5;">{BODY — invite to comment / share / visit}</p>
      <p style="font-family:'Yrsa',serif; font-size:58px; font-weight:400; color:#ffffff; line-height:1.05;">{SIGN-OFF — e.g. "Thanks."}</p>
    </div>
    <p style="font-family:'Heebo',sans-serif; font-size:30px; font-weight:400; color:#3F8CFF; letter-spacing:0.18em; text-transform:uppercase; text-align:center; line-height:1.5; flex-shrink:0;">{URL — e.g. "globalcitizensolutions.com"}</p>
  </div>
</div>

<!-- TYPE 11 · Trustpilot — the Carousel Type 11 card retuned for the 1080×1920 canvas.
     Same rules as the carousel version (real review only, verbatim, one per frame, NO overline)
     — see "Type 11 rules" in the Carousel section. Differences from the carousel: the card is
     content-sized rather than stretched (the canvas is 570px taller), vertical padding 90px,
     reviewer name/meta at the Story's 34px speaker scale, logo 88px, lockup 60px.
-->
<div style="position:relative; width:1080px; height:1920px; background:linear-gradient(to bottom, #000957 41%, #0C1734 90%, #0F1A2D 100%); display:flex; flex-direction:column; padding:250px 100px 310px; overflow:hidden;">
  <div style="display:flex; align-items:center; justify-content:center; flex-shrink:0;">
    <img src="{LOGO_WHITE}" style="height:88px; width:auto; display:block;" alt="Global Citizen Solutions">
  </div>
  <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
    <!-- Review card — 50px radius, a deliberate exception to the brand's sharp-corner default -->
    <div style="display:flex; flex-direction:column; gap:49px; padding:90px 50px; border:1px solid #22416E; border-radius:50px; background:linear-gradient(to bottom, #000957 0%, #0F1A2D 100%);">
      <div style="display:flex; align-items:center; gap:20px; flex-shrink:0;">
        <div style="width:99px; height:99px; flex-shrink:0; border-radius:50%; border:3px solid #ffffff; background:#C4CCE3; display:flex; align-items:center; justify-content:center;">
          <span style="font-family:'Heebo',sans-serif; font-size:46px; font-weight:400; color:#000957; line-height:1.5;">{INITIALS — 2 letters from the reviewer's name}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; min-width:0;">
          <p style="font-family:'Heebo',sans-serif; font-size:36px; font-weight:500; color:#ffffff; line-height:1.4;">{REVIEWER NAME}</p>
          <p style="font-family:'Heebo',sans-serif; font-size:36px; font-weight:400; color:#8892AF; line-height:1.4;">{COUNTRY} • {MONTH YEAR}</p>
        </div>
      </div>
      <img src="{TRUSTPILOT_STARS}" style="width:231px; height:43px; display:block; flex-shrink:0;" alt="Rated five out of five on Trustpilot">
      <p style="font-family:'Heebo',sans-serif; font-size:40px; font-weight:400; color:#ffffff; line-height:1.5;">{REVIEW TEXT — max 45 words / 6 lines on this canvas; quote verbatim}</p>
      <!-- Action row — inline Material Symbols, colour comes from the parent's `color` -->
      <div style="display:flex; align-items:center; justify-content:space-between; width:407px; flex-shrink:0; color:#A8B3CD;">
        <div style="display:flex; align-items:center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 -960 960 960" fill="currentColor" style="display:block; flex-shrink:0;"><path d="M716-120H272v-512l278-288 39 31q6 5 9 14t3 22v10l-45 211h299q24 0 42 18t18 42v81.84q0 7.16 1.5 14.66T915-461L789-171q-8.88 21.25-29.59 36.12Q738.69-120 716-120Zm-384-60h397l126-299v-93H482l53-249-203 214v427Zm0-427v427-427Zm-60-25v60H139v392h133v60H79v-512h193Z"/></svg>
          <span style="font-family:'Heebo',sans-serif; font-size:28px; font-weight:400; line-height:1.5;">Useful</span>
        </div>
        <div style="display:flex; align-items:center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 -960 960 960" fill="currentColor" style="display:block; flex-shrink:0;"><path d="M686-80q-47.5 0-80.75-33.25T572-194q0-8 5-34L278-403q-16.28 17.34-37.64 27.17Q219-366 194-366q-47.5 0-80.75-33T80-480q0-48 33.25-81T194-594q24 0 45 9.3 21 9.29 37 25.7l301-173q-2-8-3.5-16.5T572-766q0-47.5 33.25-80.75T686-880q47.5 0 80.75 33.25T800-766q0 47.5-33.25 80.75T686-652q-23.27 0-43.64-9Q622-670 606-685L302-516q3 8 4.5 17.5t1.5 18q0 8.5-1 16t-3 15.5l303 173q16-15 36.09-23.5 20.1-8.5 43.07-8.5Q734-308 767-274.75T800-194q0 47.5-33.25 80.75T686-80Zm.04-60q22.96 0 38.46-15.54 15.5-15.53 15.5-38.5 0-22.96-15.54-38.46-15.53-15.5-38.5-15.5-22.96 0-38.46 15.54-15.5 15.53-15.5 38.5 0 22.96 15.54 38.46 15.53 15.5 38.5 15.5Zm-492-286q22.96 0 38.46-15.54 15.5-15.53 15.5-38.5 0-22.96-15.54-38.46-15.53-15.5-38.5-15.5-22.96 0-38.46 15.54-15.5 15.53-15.5 38.5 0 22.96 15.54 38.46 15.53 15.5 38.5 15.5ZM724.5-727.54q15.5-15.53 15.5-38.5 0-22.96-15.54-38.46-15.53-15.5-38.5-15.5-22.96 0-38.46 15.54-15.5 15.53-15.5 38.5 0 22.96 15.54 38.46 15.53 15.5 38.5 15.5 22.96 0 38.46-15.54ZM686-194ZM194-480Zm492-286Z"/></svg>
          <span style="font-family:'Heebo',sans-serif; font-size:28px; font-weight:400; line-height:1.5;">Share</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 -960 960 960" fill="currentColor" style="display:block; flex-shrink:0;"><path d="M200-120v-680h343l19 86h238v370H544l-18.93-85H260v309h-60Zm300-452Zm95 168h145v-250H511l-19-86H260v251h316l19 85Z"/></svg>
      </div>
    </div>
  </div>
  <!-- Footer — Trustpilot lockup, the review's source attribution -->
  <div style="display:flex; align-items:center; justify-content:center; flex-shrink:0;">
    <img src="{TRUSTPILOT_LOGO}" style="height:60px; width:auto; display:block;" alt="Trustpilot">
  </div>
</div>
```

### Story structure

```
Frame 1    → Type 1  (Cover)
Frames 2+  → Type 3 (White) / Type 3B (Dark) — alternate; never more than 2 consecutive same-colour frames
             Type 2 or 4 (Photo) — only when extra user photos exist
             Type 5  (Image Only) — visual break, no copy needed
             Type 6/7 (Image Block) — when a supporting photo amplifies the body copy
Frame N-1  → Type 8 or 9 (Quote — only when a real quote exists)
Frame N    → Type 10 (CTA)
```

A single-frame Story most often uses just Type 1 (Cover) with the swipe cue removed, or Type 10 (CTA) alone for a link-in-bio push. If the content needs more than one frame, sequence exactly as a short Carousel would (see Carousel structure above), one PNG per frame.

## Visual asset snippets

Drop these inside a Type 3/3B slide (Carousel or Story), scaled down to ≤3 items on Story frames given the narrower vertical rhythm. Palette: `#000957` primary · `#3F8CFF` highlight · `#6b7280` labels · `#e5e7eb` tracks/borders. `border-radius:0`, no shadows, spacing in multiples of 4px. Large numbers in Yrsa; labels in Heebo.

### Stat cards (2–4 stats)

```html
<div style="display:flex; gap:16px; margin-top:32px;">
  <div style="flex:1; padding:32px 24px; border:1px solid #e5e7eb; display:flex; flex-direction:column; gap:12px;">
    <span style="font-family:'Yrsa',serif; font-size:76px; color:#000957; line-height:1;">€500k</span>
    <span style="font-family:'Heebo',sans-serif; font-size:26px; color:#6b7280; line-height:1.4;">Minimum investment</span>
  </div>
  <div style="flex:1; padding:32px 24px; border:1px solid #e5e7eb; display:flex; flex-direction:column; gap:12px;">
    <span style="font-family:'Yrsa',serif; font-size:76px; color:#3F8CFF; line-height:1;">27</span>
    <span style="font-family:'Heebo',sans-serif; font-size:26px; color:#6b7280; line-height:1.4;">Schengen countries</span>
  </div>
</div>
```

### Horizontal bar chart

```html
<div style="display:flex; flex-direction:column; gap:20px; margin-top:32px;">
  <div style="display:flex; flex-direction:column; gap:8px;">
    <div style="display:flex; justify-content:space-between; align-items:baseline;">
      <span style="font-family:'Heebo',sans-serif; font-size:28px; color:#000957;">Portugal</span>
      <span style="font-family:'Yrsa',serif; font-size:36px; color:#000957;">€500k</span>
    </div>
    <div style="height:12px; background:#e5e7eb;"><div style="height:12px; width:60%; background:#000957;"></div></div>
  </div>
  <!-- repeat per row; highlight one row with #3F8CFF -->
</div>
```

### Comparison table

```html
<div style="margin-top:32px; border:1px solid #e5e7eb;">
  <div style="display:grid; grid-template-columns:1fr 1fr 1fr; background:#000957;">
    <div style="padding:20px 24px;"><span style="font-family:'Heebo',sans-serif; font-size:24px; font-weight:500; color:#fff; letter-spacing:0.05em;">CRITERIA</span></div>
    <div style="padding:20px 24px; border-left:1px solid rgba(255,255,255,0.15);"><span style="font-family:'Heebo',sans-serif; font-size:24px; font-weight:500; color:#fff;">Portugal</span></div>
    <div style="padding:20px 24px; border-left:1px solid rgba(255,255,255,0.15);"><span style="font-family:'Heebo',sans-serif; font-size:24px; font-weight:500; color:#fff;">Malta</span></div>
  </div>
  <div style="display:grid; grid-template-columns:1fr 1fr 1fr; border-top:1px solid #e5e7eb;">
    <div style="padding:20px 24px;"><span style="font-family:'Heebo',sans-serif; font-size:26px; color:#6b7280;">Investment</span></div>
    <div style="padding:20px 24px; border-left:1px solid #e5e7eb;"><span style="font-family:'Yrsa',serif; font-size:32px; color:#000957;">€500k</span></div>
    <div style="padding:20px 24px; border-left:1px solid #e5e7eb;"><span style="font-family:'Yrsa',serif; font-size:32px; color:#6b7280;">€690k</span></div>
  </div>
  <!-- repeat rows; checkmarks in #3F8CFF -->
</div>
```

### Process timeline (horizontal steps)

```html
<div style="display:flex; align-items:flex-start; position:relative; margin-top:40px;">
  <div style="position:absolute; top:28px; left:28px; right:28px; height:2px; background:#e5e7eb; z-index:0;"></div>
  <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:16px; position:relative; z-index:1;">
    <div style="width:56px; height:56px; background:#000957; display:flex; align-items:center; justify-content:center;">
      <span style="font-family:'Yrsa',serif; font-size:32px; color:#fff;">1</span>
    </div>
    <span style="font-family:'Heebo',sans-serif; font-size:26px; font-weight:500; color:#000957; text-align:center;">Application</span>
    <span style="font-family:'Heebo',sans-serif; font-size:22px; color:#6b7280; text-align:center;">1–2 weeks</span>
  </div>
  <!-- repeat per step, alternating #000957 / #3F8CFF squares -->
</div>
```

### Ranked / numbered list

```html
<div style="display:flex; flex-direction:column; gap:4px; margin-top:24px;">
  <div style="display:flex; align-items:center; gap:32px; padding:24px 0; border-bottom:1px solid #e5e7eb;">
    <span style="font-family:'Yrsa',serif; font-size:68px; color:#e5e7eb; line-height:1; min-width:56px;">1</span>
    <div style="display:flex; flex-direction:column; gap:6px;">
      <span style="font-family:'Heebo',sans-serif; font-size:34px; font-weight:500; color:#000957;">Portugal</span>
      <span style="font-family:'Heebo',sans-serif; font-size:26px; font-weight:300; color:#6b7280;">GCS Global Passport Index — 189 visa-free destinations</span>
    </div>
  </div>
  <!-- repeat per rank; last row without border-bottom -->
</div>
```

### Country ranking row with flag

Use inside a `display:flex; flex-direction:column; gap:4px` list. Replaces the plain ranked list when countries are being compared — the flag makes the row instantly recognisable.

```html
<div style="display:flex; align-items:center; gap:24px; padding:28px 0; border-bottom:1px solid #e5e7eb;">
  <span style="font-family:'Yrsa',serif; font-size:56px; color:#e5e7eb; line-height:1; min-width:48px; text-align:right;">1</span>
  <img src="{FLAG_URI}" style="width:60px; height:60px; object-fit:cover; border-radius:50%; flex-shrink:0;">
  <div style="flex:1; display:flex; flex-direction:column; gap:4px;">
    <span style="font-family:'Heebo',sans-serif; font-size:34px; font-weight:500; color:#000957;">Portugal</span>
    <span style="font-family:'Heebo',sans-serif; font-size:26px; font-weight:300; color:#6b7280;">GCS Global Passport Index — 189 visa-free destinations</span>
  </div>
</div>
<!-- repeat per rank; last row without border-bottom; highlight top rank number with #3F8CFF instead of #e5e7eb -->
```

### Icon-led list item

Replace numbered bullet lists with icon-led items — each criterion/benefit gets a specific, semantically meaningful icon. Container: `display:flex; flex-direction:column; gap:0`.

```html
<div style="display:flex; align-items:flex-start; gap:24px; padding:20px 0; border-bottom:1px solid #e5e7eb; color:#000957;">
  <!-- inline Material Symbol, fetched with curl — see rendering.md. Never <img>. -->
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 -960 960 960" fill="currentColor" style="display:block; flex-shrink:0; margin-top:4px;"><path d="{ICON_PATH}"/></svg>
  <div style="display:flex; flex-direction:column; gap:6px;">
    <span style="font-family:'Heebo',sans-serif; font-size:32px; font-weight:500; color:#000957;">{CRITERION OR BENEFIT}</span>
    <span style="font-family:'Heebo',sans-serif; font-size:26px; font-weight:300; color:#6b7280;">{ONE-LINE DETAIL}</span>
  </div>
</div>
<!-- last item: no border-bottom. Max 4 items per slide at these sizes. -->
```

### Stat card with icon

Use when a statistic needs domain context — the icon above the number communicates category before the reader processes the number.

```html
<div style="flex:1; padding:32px 24px; border:1px solid #e5e7eb; display:flex; flex-direction:column; gap:12px; color:#000957;">
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 -960 960 960" fill="currentColor" style="display:block;"><path d="{ICON_PATH}"/></svg>
  <span style="font-family:'Yrsa',serif; font-size:76px; color:#000957; line-height:1;">€500k</span>
  <span style="font-family:'Heebo',sans-serif; font-size:26px; color:#6b7280; line-height:1.4;">Minimum investment</span>
</div>
<!-- use #3F8CFF for the number when this is the highlighted/recommended card -->
```

### Icon-overline accent

Replace the standard Heebo text overline with an icon+label pairing when the slide's domain is visually communicable (process, legal, investment, travel). Use sparingly — one per carousel at most.

```html
<div style="display:flex; align-items:center; gap:14px; margin-bottom:8px; color:#3F8CFF;">
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 -960 960 960" fill="currentColor" style="display:block; flex-shrink:0;"><path d="{ICON_PATH}"/></svg>
  <span style="font-family:'Heebo',sans-serif; font-size:22px; font-weight:600; letter-spacing:0.13em; text-transform:uppercase;">{OVERLINE}</span>
</div>
```

### Comparison table with flags in headers

Upgrade of the standard comparison table — country columns carry the flag above the country name for instant visual identification.

```html
<div style="margin-top:32px; border:1px solid #e5e7eb;">
  <div style="display:grid; grid-template-columns:1fr 1fr 1fr; background:#000957;">
    <div style="padding:20px 24px;"><span style="font-family:'Heebo',sans-serif; font-size:24px; font-weight:500; color:#fff; letter-spacing:0.05em; text-transform:uppercase;">Criteria</span></div>
    <div style="padding:20px 24px; border-left:1px solid rgba(255,255,255,0.15); display:flex; flex-direction:column; gap:8px;">
      <img src="{FLAG_PT_URI}" style="width:60px; height:60px; object-fit:cover; border-radius:50%;">
      <span style="font-family:'Heebo',sans-serif; font-size:24px; font-weight:500; color:#fff;">Portugal</span>
    </div>
    <div style="padding:20px 24px; border-left:1px solid rgba(255,255,255,0.15); display:flex; flex-direction:column; gap:8px;">
      <img src="{FLAG_MT_URI}" style="width:60px; height:60px; object-fit:cover; border-radius:50%;">
      <span style="font-family:'Heebo',sans-serif; font-size:24px; font-weight:500; color:#fff;">Malta</span>
    </div>
  </div>
  <div style="display:grid; grid-template-columns:1fr 1fr 1fr; border-top:1px solid #e5e7eb;">
    <div style="padding:20px 24px;"><span style="font-family:'Heebo',sans-serif; font-size:26px; color:#6b7280;">Investment</span></div>
    <div style="padding:20px 24px; border-left:1px solid #e5e7eb; background:#ECF4FF;">
      <span style="font-family:'Yrsa',serif; font-size:32px; color:#3F8CFF;">€500k</span>
    </div>
    <div style="padding:20px 24px; border-left:1px solid #e5e7eb;">
      <span style="font-family:'Yrsa',serif; font-size:32px; color:#6b7280;">€690k</span>
    </div>
  </div>
  <!-- repeat rows; highlight the winning cell with background:#ECF4FF and value in #3F8CFF -->
</div>
```

### Choosing text vs visual mode

Numbers, percentages, rankings, comparisons between ≥2 items, processes with steps → **visual**. Narrative, single value point, editorial tip → **text**. Unsure? If a table/chart would be clearer than a paragraph, go visual.

**Quick decision matrix:**

| Content signal | Reach for |
|---|---|
| ≥3 countries mentioned on one slide | Country ranking rows with flags |
| Two countries compared | Comparison table with flags in headers |
| A process with 3–5 steps | Horizontal timeline |
| A list of criteria / requirements | Icon-led list |
| A list of benefits without numbers | Icon-led list or icon grid |
| 2–4 key statistics | Stat cards (with icon when domain context helps) |
| One dominant statistic | Single full-width stat card or big Yrsa number as hero |
| Country-specific stats | Stat cards with country flag in the overline or card corner |

### Dark palette override (Type 3B slides)

When placing visual asset snippets on a Type 3B (Night Blue) slide, replace these light-mode values:

| Light value | Dark replacement |
|---|---|
| `#000957` (primary numbers / text) | `#ffffff` |
| `#414856` (body text) | `#E8EBF0` |
| `#e5e7eb` (borders, bar tracks) | `rgba(255,255,255,0.12)` |
| `#f8f9fb` (card backgrounds) | `rgba(255,255,255,0.06)` |
| `1px solid #e5e7eb` | `1px solid rgba(255,255,255,0.12)` |

`#3F8CFF` (Electric Blue highlight) and `#6b7280` (label grey) stay the same in both modes.

Icon colour on dark slides: set `color:#ffffff` on the icon's parent element — the inline SVG uses `fill="currentColor"`, so icons that are `#000957` on white flip automatically.

## Type 12 — Custom Layout

A free compositional canvas inside the GCS brand tokens. There is no fixed template: the layout comes from the approved textual sketch (Step 3 of `SKILL.md`). Use it when the request falls outside Types 1–11, or when Reference Mode's structural analysis does not map onto an existing type.

**Invariables that never change:**

- Palette: Night Blue `#000957`, Electric Blue `#3F8CFF`, white, and the tints defined in `design-system.md`
- Typography: Yrsa + Heebo only (bundled in `assets/fonts/`) — never Google Fonts, never an external face
- Logo: always present, always one of the four bundled assets (`LOGO_WHITE`, `LOGO_BLUE`, `LOGO_WORDMARK_WHITE`, `LOGO_WORDMARK_BLUE`) — `LOGO_WHITE` on dark/photo/gradient, `LOGO_BLUE` on white
- `border-radius: 0` on every element (only exception: the Type 11 review card, 50px)
- No `box-shadow`, `text-shadow` or `drop-shadow`
- Photo overlays: always Night Blue, never `rgba(0,0,0,…)`
- Type scale and padding rhythm consistent with the rest of the set

**Compositional patterns allowed (not exhaustive):**

- Vertical split 50/50 — photo left, text right (or reversed)
- 2×2 or 2×3 grid of icon cards over Night Blue or white
- Editorial: large headline top, horizontal image crop, body bottom
- Centred hero: gradient background, centred headline, stat card beneath
- Horizontal band: a 300–400px photo strip mid-canvas, text above and below
- Custom photo-to-text proportions, and any visual asset snippet from this file placed in a new configuration

**QA gate — run before rendering any Type 12 slide:**

- [ ] Logo present, and the correct variant for the background?
- [ ] Palette exclusively GCS?
- [ ] Fonts Yrsa + Heebo only, loaded from `FONTS_CSS`?
- [ ] `border-radius: 0` everywhere (except a Type 11 card)?
- [ ] No shadows of any kind?
- [ ] Photo overlay Night Blue, not black?
- [ ] Body copy ≤ ~40 words, headline ≤ 12 words?
- [ ] Layout matches the approved sketch?

In a carousel: max 2 consecutive Type 12 slides · never replaces the Type 10 CTA (always last) · may replace any interior slide (Types 2–9, 11).

## Icons & flags

- **Flags** — PNG from the `msikma/country-flags` GitHub repository (see `flag_uri()` helper in `rendering.md`). URL pattern: `https://raw.githubusercontent.com/msikma/country-flags/master/flags/png/{iso2}.png` (UK is `uk.png` upstream, not `gb.png`). Render as a 60×60px circle: `<img src="{FLAG_URI}" style="width:60px; height:60px; object-fit:cover; border-radius:50%; display:block;">`. Flags keep their native colours — do not recolor.
- **Icons** — **Material Symbols only**, fetched with `curl` and pasted **inline** as `<svg fill="currentColor">` (see "Icons — fetch with curl, paste inline" in `rendering.md`). Never `<img>`, never a `data:` URI, never Font Awesome / Heroicons / Feather / Lucide / a hand-drawn SVG. Use sparingly as functional markers (one per list item / stat card), render at 40–56px, colour via the parent's `color`: `#000957` on white, `#ffffff` on dark, `#3F8CFF` for accent. Never decorative icon confetti.

### Icon selection — verify the name before using

Fetch with `curl -sL "https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/<name>/materialsymbolsoutlined/<name>_24px.svg"` via Bash — never the WebFetch tool, which mangles the markup. A wrong name returns nothing, so verify at **https://fonts.google.com/icons** before fetching. Prefer the most semantically specific icon over a generic one.

**GCS domain icons (verified names):**

| Domain | Icon name | Usage |
|---|---|---|
| Travel / mobility | `flight` | Visa-free access, travel freedom |
| Investment / savings | `savings` | Capital investment requirement |
| Investment growth | `trending_up` | ROI, returns, market growth |
| Property / real estate | `real_estate_agent` | Real estate investment route |
| Family | `family_restroom` | Family reunification, dependants |
| Legal / compliance | `gavel` | Legal process, due diligence |
| Documents | `article` | Application requirements, paperwork |
| Global citizenship | `public` | International access, world passport |
| Community / network | `groups` | Expat community, network |
| Freedom / access | `lock_open` | Visa-free access, removal of restrictions |
| Time / process | `schedule` | Processing time, timeline |
| Residency | `home` | Residency rights, home base |
| Healthcare | `local_hospital` | Healthcare access, benefits |
| Tax | `receipt_long` | Tax advantages, fiscal benefits |

**Colour rule:** `#000957` for icons on white backgrounds (functional, supporting role); `#3F8CFF` when the icon is the visual anchor of the slide (prominent, leading element).

### Composition decisions — per-slide rules

These are not suggestions; apply them when the conditions are met:

- **≥3 countries on one slide** → country ranking rows with flags (never three inline paragraphs)
- **One specific country as the slide's subject** → flag visible, minimum 40×30px
- **A process with named stages** (application, due diligence, approval, issuance) → horizontal timeline; never a bullet list for ordered steps
- **2 or more comparable numbers on the same slide** → stat cards or bar chart; never two paragraphs with numbers buried in text
- **Benefits list without numbers** → icon-led list (each item gets a specific, meaningful icon) or icon grid
- **Comparison of two countries** → flags in the comparison table headers, `#ECF4FF` highlight on the winning cells
