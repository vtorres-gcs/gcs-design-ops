# Examples

Worked, structurally-valid fixtures for the `gcs-elementor` skill — clone or diff against these rather than inferring JSON validity purely from the prose spec in `../references/`.

These examples demonstrate the current rules: `heading`/`text-editor`/`button` widgets carry no `typography_*` or color keys (they inherit the WordPress theme's native fonts and button style); containers/`icon`/`divider` keep literal GCS colors; every container sets `flex_wrap: "nowrap"` (never `"wrap"`), with grid content built from explicit row containers.

- `hero-example.json` — a complete Hero section (`herosection.reference.html`): a centred intro container (`heading`, `text-editor`, a row of two `button` widgets) over a full-bleed `image` media container, with full `_tablet`/`_mobile` responsive keys. Exercises nested containers, responsive overrides, and the "no typography/color on text/button widgets" rule end-to-end.
- `hero-example-preview.html` — the matching browser preview: sticky header with working Copy JSON / Download JSON buttons, a Desktop full-width render and a Mobile 390px render. Container/media backgrounds use the exact literal GCS colors from the JSON; heading/text/button copy renders in a generic system font with a neutral button style (since the JSON sets none), with a visible note explaining why.
- `landing-page-example.json` — the **page-mode** ground truth: a full page as three top-level sibling containers in `elements` (Hero, Features, CTA), assembled with no page-level wrapper. Features demonstrates the row-container grid pattern (one `isInner: true` row holding 3 tiles at 33.33% width each, `flex_wrap: "nowrap"`) — diff against this to confirm multi-section assembly and grid-without-wrap are correct.
- `landing-page-example-preview.html` — the matching browser preview: same sticky-header/Copy/Download pattern, Desktop and Mobile frames each stacking all three sections in order.
