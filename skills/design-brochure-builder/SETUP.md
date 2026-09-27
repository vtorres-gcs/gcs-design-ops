# GCS Brochure Builder — Setup Guide

## Prerequisites

- Node.js
- Python 3 (for `embed_fonts.py` and QA)
- LibreOffice (`soffice` on PATH) — used for QA-rendering the `.pptx` to PDF/JPEG. Not required to generate the file itself.

## 1. Install Dependencies

From this skill's own directory, `skills/gcs-brochure-builder/`:

```bash
cd skills/gcs-brochure-builder
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

`assets/logos/*.png`, `assets/icons/*.png`, and
`assets/covers/background-back-cover.png` are pre-rasterized/pre-rendered by
`scripts/gen-assets.py` (requires `cairosvg`, `Pillow`, `numpy` — all present
in the environment this skill was built in). Only re-run this if the source
SVGs in `skills/gcs-brochure/assets/logos/` or the back-cover gradient spec
change — the committed PNGs are the actual assets this skill ships with.

```bash
python3 scripts/gen-assets.py
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `soffice` conversion silently produces no PDF and no error | A stale/locked LibreOffice user profile. Re-run with an isolated profile: `soffice --headless --convert-to pdf -env:UserInstallation=file:///tmp/lo_profile ...` |
| `.pptx` opens fine in PowerPoint but LibreOffice says "source file could not be loaded" after `embed_fonts.py` | You're likely on an unpatched copy of this script — see the namespace-collision note at the top of `scripts/embed_fonts.py`. The fix is already applied here; don't revert it to match `skills/gcs-pptx`'s original verbatim. |
| Fonts look wrong in PowerPoint desktop specifically (Google Slides/LibreOffice look fine) | Run `python3 scripts/embed_fonts.py output.pptx` — it wasn't run, or ran against the wrong file. |
| A block type in the page map isn't building | Check `references/components.md` for the full supported set. Unsupported types fail with an explicit message naming the supported set. |
