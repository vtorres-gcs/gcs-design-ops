# PNG export — transparent, high-resolution

Every deliverable set includes, besides the HTML/CSS, a transparent PNG of
the table and (when one was built) of each chart — ready for presentations,
brochures, and websites. "Transparent" means the pixels *around* the
component are transparent; the component's own card surface stays white
(or navy, for dark-theme bands) exactly as designed.

## How

`scripts/export_png.py` does the whole flow — wraps the fragment in a page
with a transparent body, inlines the canonical stylesheets from `assets/`,
screenshots with headless Chrome at 2× device scale, and trims the
transparent margins with Pillow:

```bash
# one component per fragment file, one PNG per component
python3 scripts/export_png.py table-fragment.html table.png --width 960
python3 scripts/export_png.py chart-fragment.html chart.png --width 900
```

- `--width` is the CSS width the component is laid out at (default 1200px);
  the PNG comes out at 2× that (`--scale 2` default), so 1200 → 2400px wide.
  Use `--scale 3` if the user asks for print-grade output.
- The fragment file must contain ONLY the component markup (the
  `<div class="gcs-table">…</div>` or `<figure class="gcs-chart">…</figure>`
  block) — no `<style>`, no page scaffold; the script injects the CSS itself.
- Export the table and the chart as **separate PNGs** (that's the required
  deliverable), even when the HTML delivery stacks them on one page.

Requirements: Google Chrome/Chromium on the machine and Pillow
(`pip3 install Pillow`). The script locates Chrome itself on macOS/Linux.

## Verify before delivering

Open the PNG (Read tool renders it) and check:

1. background outside the card is actually transparent (not white);
2. webfonts rendered (Yrsa serif title, Heebo body — for tables these are
   base64-embedded in `tables.css` with no network fetch, so this should
   never race; for charts, still pulled via `charts.css`'s Google Fonts
   `@import`, so if you see Times/Arial the font load raced the screenshot —
   re-run, the script's virtual-time budget normally prevents this);
3. nothing is clipped (very tall tables: the script's window is 6000px tall —
   beyond that, raise the window height in the script or split the table);
4. flags and icons rendered.

Then hand the files over at real paths (e.g. an `output/` folder in the
project or wherever the user asked), never just described.

## Naming

`{slug}-table.png` / `{slug}-chart.png`, where `{slug}` is a short
kebab-case name for the dataset (`golden-visa-comparison-table.png`).
