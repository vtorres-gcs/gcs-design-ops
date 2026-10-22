# Brochure Builder — Setup Guide

## Prerequisites

- Node.js
- Python 3 with `pip install -r requirements.txt` (cairosvg, Pillow, numpy — icon/flag rasterizing, `embed_fonts.py`)
- Network only for the first use of a *new* Material Symbols icon (it is fetched once from `google/material-design-icons` and cached) and for `scripts/update-flags.py`. Fonts, logos, covers and the flag set ship inside this skill.
- LibreOffice (`soffice` on PATH) — used for QA-rendering the `.pptx` to PDF/JPEG. Not required to generate the file itself.

## 1. Install Dependencies

From this skill's own directory:

```bash
npm install
```

This installs PptxGenJS.

## 2. Test

```bash
node scripts/build-brochure.js examples/lead-magnet-example.json /tmp/test.pptx
python3 scripts/embed_fonts.py /tmp/test.pptx
ls -la /tmp/test.pptx
```

If the `.pptx` is created and `embed_fonts.py` prints `Embedded fonts (...)`,
setup is complete.

## 3. QA render (recommended before delivering anything)

```bash
soffice --headless --convert-to pdf --outdir /tmp /tmp/test.pptx
pdftoppm -jpeg -r 100 /tmp/test.pdf /tmp/page
```

Then inspect `/tmp/page-1.jpg`, `/tmp/page-2.jpg`, ... per SKILL.md's QA
checklist.

## Regenerating assets

Everything the builder reads is inside this skill:

- `assets/logos/*.png`, `assets/covers/*.png`, `assets/fonts/*.ttf` — shipped as-is.
- `assets/icons/social/*.svg` — the 4 brand marks (shipped; never recolored); their
  PNGs, `assets/icons/pin.png` and `assets/covers/background-back-cover.png` come
  from `python3 scripts/gen-assets.py` (re-run only if the marks or gradient spec change).
- `assets/icons/_generated/` — cache of Material Symbols PNGs, filled on demand.
- `assets/flags/` — vendored copy of github.com/msikma/country-flags as ONE sprite atlas
  (`atlas.png`: 218 flags, each center-cropped to a 256px square; `atlas.json`: code → name/cell;
  MIT licence; upstream commit in `SOURCE.txt`). One image instead of ~220 files keeps the skill
  under upload file-count limits (and zip uploads can't contain nested zips). Refresh with
  `python3 scripts/update-flags.py`.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `soffice` conversion silently produces no PDF and no error | A stale/locked LibreOffice user profile. Re-run with an isolated profile: `soffice --headless --convert-to pdf -env:UserInstallation=file:///tmp/lo_profile ...` |
| `.pptx` opens fine in PowerPoint but LibreOffice says "source file could not be loaded" after `embed_fonts.py` | You're likely on an unpatched copy of this script — see the namespace-collision note at the top of `scripts/embed_fonts.py`. The fix is already applied here; don't revert it. |
| Fonts look wrong in PowerPoint desktop specifically (Google Slides/LibreOffice look fine) | Run `python3 scripts/embed_fonts.py output.pptx` — it wasn't run, or ran against the wrong file. |
| A block type in the page map isn't building | Check `references/components.md` for the full supported set. Unsupported types fail with an explicit message naming the supported set. |
