# Rendering Pipeline — editable HTML → PNG / PDF

The deliverable HTML file is the **source of truth**: one standalone file with fonts, logos, and images embedded as base64, one `<div data-slide>` per slide. PNGs and the PDF are screenshots of those divs — so anyone can edit the HTML and re-render.

Every brand asset comes from this skill's own `assets/` folder via the bundled loader `scripts/gcs_assets.py`. No repo checkout, no network, no base64 pasted into scripts by hand.

**Review loop (Steps 5-6 of SKILL.md):** the `.html` file is always opened in the Browser pane for a live text-edit pass (Step 5) **before** `render()` is ever called — never render straight off `build_document()`. After that, `render()` is called again every time the user asks for a change — it's idempotent, it just reloads the `.html` from disk and overwrites the previous PNGs. The `.html` file is the *only* thing Claude edits between calls: apply the user's requested change with the Edit tool directly on the existing slide markup (or capture a browser-side edit, see Step 5), then call `render()` again. Never rebuild `build_document()` from scratch mid-review — that discards edits already applied in earlier rounds. Only assemble the PDF (`pngs_to_pdf`) once, after the user gives final approval.

## Dependencies

```bash
# Run once per session if playwright is not installed
pip3 install playwright pillow --break-system-packages -q
python3 -m playwright install chromium

# Verify Chrome is available
python3 -c "from playwright.sync_api import sync_playwright; p = sync_playwright().start(); b = p.chromium.launch(args=['--no-sandbox']); b.close(); p.stop(); print('OK')"
```

## Step 0 — Load the bundled assets

`scripts/gcs_assets.py` resolves `SKILL_DIR` from its own file location and base64-encodes the bundled TTFs and PNGs at runtime. Put this bootstrap at the top of every generation script:

```python
import sys
from pathlib import Path

SKILL_DIR = Path("<absolute path of the folder you read SKILL.md from>")
sys.path.insert(0, str(SKILL_DIR / "scripts"))

from gcs_assets import (
    FONTS_CSS,                                   # all @font-face rules, TTFs inlined
    LOGO_WHITE, LOGO_BLUE,                       # primary mark — white / blue
    LOGO_WORDMARK_BLUE, LOGO_WORDMARK_WHITE,     # secondary lockup (LinkedIn footer)
    QUOTE_ICON_BLUE, QUOTE_ICON_WHITE,           # Types 8 / 9
    CTA_BG,                                      # Type 10 background (carousel + story)
    TRUSTPILOT_STARS, TRUSTPILOT_LOGO,           # Type 11 star row + footer lockup
    embed_image,                                 # user photos → data URI
    flag_uri,                                    # country flags — the one network call
)
```

Icons are not in that list — they are inlined as SVG markup, never loaded as an image. See "Icon images" below.
```

Verify the folder is complete before generating — this is also the first thing to run after copying the skill to another machine:

```bash
python3 "<SKILL_DIR>/scripts/gcs_assets.py"
```

It prints one line per bundled asset and fails with the exact missing path if `assets/` is incomplete.

### What is bundled

| Constant | File under `assets/` | Notes |
|---|---|---|
| `FONTS_CSS` | `fonts/Yrsa-{Regular,Italic}.ttf`, `fonts/Heebo-{Light,Regular,Medium,SemiBold,Bold}.ttf` | Yrsa 400 + real italic; Heebo 300/400/500/600/700 |
| `LOGO_WHITE` | `logos/GCS-Primary-White.png` | DARK / PHOTO backgrounds: Types 1, 2, 3B, 4, 5, 7, 9, 10, 11 |
| `LOGO_BLUE` | `logos/GCS-Primary-Blue.png` | WHITE backgrounds ONLY: Types 3, 6, 8 |
| `LOGO_WORDMARK_BLUE` | `logos/GCS-Secondary-Blue.png` | Quote-slide footer on white (height 32px, centred) |
| `LOGO_WORDMARK_WHITE` | `logos/GCS-Secondary-White.png` | LinkedIn post footer (height 28px) |
| `QUOTE_ICON_BLUE` / `QUOTE_ICON_WHITE` | `images/quote-blue.png` / `images/quote-white.png` | 178×153, render at exact size |
| `CTA_BG` | `images/background-cta.png` | Same image for the carousel Type 10 and the story CTA frame |
| `TRUSTPILOT_STARS` | `images/trustpilot-5stars.png` | 231×43 on canvas; never cropped to fake a lower rating |
| `TRUSTPILOT_LOGO` | `images/logo-trustpilot.png` | Type 11 footer lockup (green star + white wordmark), `height:52px`, centred — dark backgrounds only |

**Never** reintroduce a live fetch (npm, Google Fonts, GitHub raw) or a repo-root path (`../../assets/...`, a `Path.cwd()` walk-up) for any of these. The bundled folder is the only source, and it is what makes the skill work on a machine that has no copy of the design system.

If a rendered PNG shows `alt` text instead of a logo, or system fonts instead of Yrsa/Heebo, the cause is a broken `assets/` folder or a script that skipped the bootstrap — run the self-check, do not redraw the asset.

Rules for the HTML you write: quote marks and logos at their documented pixel sizes, photos with `object-fit:cover`.

```html
<img src="{QUOTE_ICON_BLUE}"  style="width:178px; height:153px; display:block; flex-shrink:0;" alt="">
<img src="{QUOTE_ICON_WHITE}" style="width:178px; height:153px; display:block; flex-shrink:0;" alt="">
```

## Icons — fetch with curl, paste inline

Same treatment as the `gcs-brochure` skill. Icons are **Material Symbols only** and always arrive as **inline `<svg>` markup with `fill="currentColor"`** — never an `<img>`, never a `data:` URI, never a bundled file, never Font Awesome / Heroicons / Feather / Lucide / an ad-hoc drawn SVG.

Fetch the one you need with `curl` via Bash (never the WebFetch tool — it summarises through a model and returns mangled markup):

```bash
curl -sL "https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/<icon_name>/materialsymbolsoutlined/<icon_name>_24px.svg"
```

`<icon_name>` is the snake_case Material Symbols name (`trending_up`, `savings`, `gavel`, `public`). Verify names at https://fonts.google.com/icons before fetching — a wrong name returns nothing.

Paste the returned markup straight into the slide HTML, add `fill="currentColor"` to the root `<svg>`, and set the size with `width`/`height` attributes (40–56px on a 1080px canvas; 36–40px inside list rows):

```html
<!-- Icon inherits its colour from the parent's `color` — no hex on the icon itself -->
<div style="display:flex; align-items:center; gap:20px; color:#000957;">
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 -960 960 960" fill="currentColor" style="display:block; flex-shrink:0;"><path d="…"/></svg>
  <p style="font-family:'Heebo',sans-serif; font-size:34px; font-weight:400;">Visa-free access to 190 destinations</p>
</div>
```

Colour rules: `#000957` on white slides · `#ffffff` on dark/photo slides · `#3F8CFF` when the icon is the visual anchor · `#A8B3CD` for the Type 11 action row. Set it once on the parent, let `currentColor` do the rest — that way one wrapper controls icon and label together.

Never leave a downloaded `.svg` file behind: the markup only needs to exist inline in the generated HTML.

**Offline:** the `curl` fails. Say the slide needs internet, or ask the user for the SVG — never substitute another icon set and never draw your own. `flag_uri()` below is the pipeline's only other network dependency.

## Flag images (network)

```python
FLAG_PT = flag_uri("pt")   # Portugal
FLAG_MT = flag_uri("mt")   # Malta
FLAG_KN = flag_uri("kn")   # St. Kitts & Nevis
FLAG_GB = flag_uri("gb")   # United Kingdom (fetches uk.png upstream)
```

High-resolution PNGs (1200×800) from `msikma/country-flags`. Some dependencies and micro-territories aren't in that repo (a missing code 404s) — if that happens, tell the user and show the name without a flag rather than substituting a different source. Render as a 60×60px circle, e.g. `<img src="{FLAG_URI}" style="width:60px; height:60px; object-fit:cover; border-radius:50%; display:block;">`.

## User images

`embed_image(path)` (same function as `data_uri`) turns any local file into a `data:` URI:

```python
COVER = embed_image("/absolute/path/to/user-photo.jpg")
```

Rules: always `data:` URIs, never relative paths · `<img … style="object-fit:cover">` for photo fills · **write HTML from Python (`Path.write_text`)** — never via shell heredoc, which corrupts base64 through `$`/backtick interpolation.

> ⚠️ **CRITICAL — Playwright renders from `file://`. External image URLs are silently ignored.**
> **NEVER** put any `https://` URL directly in `<img src>`.
> ALL photos — user-provided — **MUST** be converted to `data:` URIs before writing the HTML.

## The editable HTML file

⚠️ CRITICAL: Always write the HTML file using Python (`Path.write_text` or `open`/`write`). Never use a shell heredoc (`cat > file << 'EOF'`) — dollar signs and backticks inside base64 strings are silently corrupted by the shell, producing broken images and fonts.

```python
def build_document(slides_html: list[str], w: int, h: int, title: str) -> str:
    slides = "\n".join(
        f'<div data-slide="{i}" style="width:{w}px; height:{h}px; flex-shrink:0; overflow:hidden; position:relative;">{s}</div>'
        for i, s in enumerate(slides_html, 1))
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8"><title>{title}</title>
<style>
* {{ box-sizing:border-box; margin:0; padding:0; }}
body {{ background:#0a0b12; display:flex; flex-direction:column; align-items:center; gap:40px; padding:40px; }}
{FONTS_CSS}
</style></head><body>
{slides}
</body></html>"""
```

Each slide's inner HTML uses the templates from `slide-library.md`. Inside a `data-slide` wrapper, remove any fixed `width/height` duplication conflicts (the wrapper clips at exact canvas size).

## Render PNGs + PDF

Screenshot the `data-slide` elements from the single document — the deliverable HTML and the renders can never drift apart:

```python
import asyncio, os, zipfile
from playwright.async_api import async_playwright
from PIL import Image

# Chrome requires --no-sandbox in this execution environment. Never omit these flags.
async def render(html_path: str, out_dir: str, prefix: str, w: int, h: int) -> list[str]:
    paths = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox", "--disable-setuid-sandbox"])
        page = await browser.new_page(viewport={"width": w + 100, "height": h + 100})
        await page.goto(f"file://{html_path}", wait_until="networkidle")
        await page.wait_for_timeout(500)  # font/image settle
        slides = await page.query_selector_all("[data-slide]")
        for i, el in enumerate(slides, 1):
            out = os.path.join(out_dir, f"{prefix}_slide_{i:02d}.png" if len(slides) > 1
                               else f"{prefix}.png")
            await el.screenshot(path=out)
            paths.append(out)
        await browser.close()
    return paths

def pngs_to_pdf(png_paths: list[str], pdf_path: str) -> str:
    images = [Image.open(p).convert("RGB") for p in png_paths]
    images[0].save(pdf_path, save_all=True, append_images=images[1:], resolution=150)
    return pdf_path
```

## Per-format checklist

| Format | Canvas | Deliverables |
|---|---|---|
| Carousel IG/LinkedIn | 1080×1350 | `<slug>.html`, `<slug>_slide_NN.png` ×N, `<slug>.pdf` |
| Carousel X/FB | 1080×1080 | same as above |
| Single Post | 1080×1350 (or 1080×1080) | `<slug>.html`, `<slug>.png` |
| Story — single frame | 1080×1920 | `<slug>_story.html`, `<slug>_story.png` |
| Story — multi-frame | 1080×1920 | `<slug>_story.html`, `<slug>_story_slide_NN.png` ×N |

After rendering, **look at the PNGs** (Read tool) before delivering: check text isn't clipped or overflowing, fonts rendered as Yrsa/Heebo (serif headings!), the cover highlight line in real Yrsa italic (not a slanted sans), logos visible, no empty placeholder boxes. If a logo corner shows plain text instead of the mark, the bootstrap or the `assets/` folder is broken — run `python3 scripts/gcs_assets.py`, fix, and re-render. Never ship it as-is.

## Running outside the design system repo

The skill folder is self-sufficient. Copied on its own to another machine it needs only Python 3, `playwright`, and `pillow`.

| Works offline | Needs internet |
|---|---|
| Fonts, logos, quote marks, CTA background, Trustpilot star row, the Type 11 action icons (inline SVG in `slide-library.md`), all layouts | fetching a *new* Material Symbol with `curl`, `flag_uri()` (country flags) |

Two things are *not* bundled and are only available inside the full repo: `assets/passports/` and the 91 MB Material Symbols / 6 MB flag sets. If a plan needs them and the repo is absent, ask the user for the specific files.
