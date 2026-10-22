# Template sources (frozen reference)

HTML sources of the six fixed brochure templates (`case-study`, `quarterly-report`,
`factsheet`, `giu-calendar`, `giu-corporate`, `lead-magnet`), saved as design
references. **They are not used at runtime** — no script reads this folder, and
the builder works the same without it.

Use them to:
- read exact copy slots, structure, spacing and colours when porting one of the
  three unimplemented templates (`giu-calendar`, `giu-corporate`, `lead-magnet`);
- re-measure `scripts/components/factsheet.js` if the factsheet design changes;
- compare a rendered `.pptx` against the intended design: `<template>/preview-NN.png`
  (one PNG per page, A4 at 100 dpi) is the visual target for QA.

Previews: `case-study` 4 pages, `factsheet` 3, `giu-calendar` 4, `giu-corporate` 13,
`lead-magnet` 8, `quarterly-report` 4. They were rendered once from the HTML with
headless Chrome (print-to-PDF → PNG). The `giu-calendar` / `giu-corporate` headers
show a broken symbol-logo image — the source HTML points that `<img>` at a wrong
relative path; ignore it.

Caveats:
- The HTML doesn't render from here: each page loads `ds-base.js`/`support.js` and a
  stylesheet bundle (`tokens/*.css`, `_ds_bundle.js`), and references logos, fonts
  and flags at `../../../assets/…`. None of that is shipped (the two helper scripts
  were removed as useless without the bundle; the cover photo is the skill's own
  `assets/covers/background-cover-*.png`). Read the markup and use the previews.
- Frozen snapshot: not kept in sync with the `scripts/templates/*.json` schemas or
  `scripts/components/factsheet.js`. If they disagree, the scripts win for builds;
  the HTML is the design intent.
