"""Icon pipeline for design-brochure-builder.

Single source: Material Symbols from the public google/material-design-icons
repo. No icon fonts, no Font Awesome / Lucide / Heroicons / Feather, no emoji,
no hand-drawn SVG. SVGs are NOT kept in this repo: each one is fetched on
demand from raw.githubusercontent.com (never WebFetch, which mangles markup),
validated, sanitized, recolored, and rasterized to PNG.

Why PNG: PptxGenJS under Node cannot embed live SVG (a `.svg` path passed to
`addImage()` resolves to a broken-image placeholder — pptxgenjs issue #401),
and Word/PPTX/brochure deliverables must work offline, so every icon is
downloaded and embedded as a raster before delivery. Rasters are cached under
assets/icons/_generated/ (and the raw SVG under _generated/svg/ so a rebuild
works offline).

Rules (name/variant validation and sanitization):
  - name must match ^[a-z0-9]+(?:_[a-z0-9]+)*$
  - variant is outlined (default) | rounded | sharp
  - fill=True selects the filled glyph (`{name}_fill1_24px.svg`)
  - the SVG must be one complete <svg>…</svg> and is rejected if it contains
    script / foreignObject / iframe / object / embed / image / style, any on*
    handler, href / src, or url(...)
  - width / height / fill are stripped and the root gets fill="currentColor";
    for raster output `currentColor` is then resolved to `color`

Props: name, variant, fill, color, size. `size` here is the RASTER edge in px — oversample for print (the
on-slide display size follows the system scale 14 / 16 / 20 / 24 px; e.g. a
24px slot is rasterized at 96).

Exception — brand marks: LinkedIn / Facebook / Instagram / YouTube are the
brand's own multi-colour SVGs shipped in this skill (assets/icons/social/*.svg).
They are NOT Material Symbols, are never recolored, and never go through
currentColor; they enter the deck as plain images. See get_social_icon_png().

Usage (CLI):
    python3 scripts/icons.py account_balance --variant outlined --color '#000957' --size 96
    python3 scripts/icons.py location_on --fill --color '#FFFFFF' --size 96
    python3 scripts/icons.py linkedin --social --size 192
Prints the resolved/generated PNG path to stdout.
"""

import re
import sys
import urllib.request
import urllib.error
from pathlib import Path

import cairosvg

SKILL_DIR = Path(__file__).resolve().parent.parent

GENERATED_DIR = SKILL_DIR / "assets" / "icons" / "_generated"
SVG_CACHE_DIR = GENERATED_DIR / "svg"
SOCIAL_DIR = SKILL_DIR / "assets" / "icons" / "social"

MATERIAL_SYMBOLS_BASE = "https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web"
VARIANTS = ("outlined", "rounded", "sharp")
NAME_RE = re.compile(r"^[a-z0-9]+(?:_[a-z0-9]+)*$")
SOCIAL_MARKS = ("linkedin", "facebook", "instagram", "youtube")

_FORBIDDEN_TAGS = re.compile(r"<(?:script|foreignObject|iframe|object|embed|image|style)\b", re.I)
_FORBIDDEN_ATTRS = re.compile(r"\son[a-z]+\s*=|\s(?:href|src)\s*=|xlink:href\s*=|url\s*\(", re.I)
_HEX_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")


class MissingAsset(Exception):
    pass


class InvalidIcon(MissingAsset):
    pass


def icon_url(name: str, variant: str = "outlined", fill: bool = False) -> str:
    """Upstream URL for a Material Symbols glyph. Validates name and variant."""
    if variant not in VARIANTS:
        raise InvalidIcon(f"Icon variant '{variant}' is not one of {', '.join(VARIANTS)}.")
    if not NAME_RE.match(name or ""):
        raise InvalidIcon(f"Icon name '{name}' is invalid: use the Material Symbols snake_case name (e.g. 'account_balance').")
    return f"{MATERIAL_SYMBOLS_BASE}/{name}/materialsymbols{variant}/{name}{'_fill1' if fill else ''}_24px.svg"


def sanitize_svg(raw: str) -> str:
    """Validate and normalize a fetched Material Symbols SVG (port of
    icon-loader.js normalizeSvg). Returns markup with fill="currentColor"."""
    text = (raw or "").strip()
    if not re.match(r"^<svg\b[^>]*>[\s\S]*</svg>$", text):
        raise InvalidIcon("Icon response is not a single complete <svg> element.")
    if _FORBIDDEN_TAGS.search(text) or _FORBIDDEN_ATTRS.search(text):
        raise InvalidIcon("Icon SVG contains blocked markup (script/href/on*/style/url()/…); refusing to embed it.")
    text = re.sub(r'\s(?:width|height|fill)="[^"]*"', "", text)
    return text.replace("<svg", '<svg fill="currentColor"', 1)


def fetch_icon_svg(name: str, variant: str = "outlined", fill: bool = False) -> str:
    """Return sanitized SVG markup (fill=currentColor) for a Material Symbols icon.
    Fetched from google/material-design-icons; the raw response is cached on disk
    so rebuilds work offline. Raises MissingAsset if it can't be had."""
    url = icon_url(name, variant, fill)  # validates name/variant before any I/O
    cache_path = SVG_CACHE_DIR / variant / f"{name}{'_fill1' if fill else ''}.svg"
    if cache_path.exists():
        return sanitize_svg(cache_path.read_text(encoding="utf-8"))
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            raw = resp.read().decode("utf-8")
    except (urllib.error.URLError, urllib.error.HTTPError) as exc:
        raise MissingAsset(
            f"Icon '{name}' (variant={variant}, fill={fill}) could not be fetched from {url}: {exc}. "
            "Check the name at fonts.google.com/icons — never substitute another icon library."
        ) from exc
    svg = sanitize_svg(raw)  # raises before anything is cached
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(raw, encoding="utf-8")
    return svg


def get_icon_png(name: str, *, variant: str = "outlined", fill: bool = False,
                 color: str = "#000957", size_px: int = 24) -> Path:
    """Public entry point for a Material Symbols content icon -> cached PNG."""
    if not _HEX_RE.match(color or ""):
        raise InvalidIcon(f"Icon color '{color}' must be a #RRGGBB hex.")
    svg = fetch_icon_svg(name, variant, fill)
    cache_key = f"{name}-{variant}-{'fill' if fill else 'outline'}-{color.lstrip('#').upper()}-{size_px}"
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    out_path = GENERATED_DIR / f"{cache_key}.png"
    if not out_path.exists():
        cairosvg.svg2png(
            bytestring=svg.replace("currentColor", color, 1).encode("utf-8"),
            write_to=str(out_path),
            output_width=size_px,
            output_height=size_px,
        )
    return out_path


def get_social_icon_png(name: str, size_px: int = 192) -> Path:
    """Brand mark (LinkedIn/Facebook/Instagram/YouTube) -> PNG, keeping the
    SVG's own colours. No recolor, no currentColor. Edge = longest side."""
    if name not in SOCIAL_MARKS:
        raise MissingAsset(f"'{name}' is not a bundled brand mark. Available: {', '.join(SOCIAL_MARKS)}")
    svg_path = SOCIAL_DIR / f"{name}.svg"
    if not svg_path.exists():
        raise MissingAsset(f"{svg_path} is missing from the skill's assets/icons/social/ — restore it from the skill package.")
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    out_path = GENERATED_DIR / f"social-{name}-{size_px}.png"
    if not out_path.exists():
        cairosvg.svg2png(url=str(svg_path), write_to=str(out_path), background_color=None, **_fit_longest(svg_path, size_px))
    return out_path


def _fit_longest(svg_path: Path, size_px: int) -> dict:
    head = svg_path.read_text(encoding="utf-8").split(">", 1)[0]
    w = float(re.search(r'\swidth="([\d.]+)', head).group(1))
    h = float(re.search(r'\sheight="([\d.]+)', head).group(1))
    return {"scale": size_px / max(w, h)}


def _main(argv):
    import argparse

    parser = argparse.ArgumentParser(description="Resolve/rasterize a brochure icon to PNG.")
    parser.add_argument("name")
    parser.add_argument("--variant", choices=VARIANTS, default="outlined")
    parser.add_argument("--fill", action="store_true", help="filled glyph")
    parser.add_argument("--social", action="store_true", help="name is one of the bundled brand marks")
    parser.add_argument("--color", default="#000957")
    parser.add_argument("--size", type=int, default=24)
    args = parser.parse_args(argv)

    if args.social:
        print(get_social_icon_png(args.name, size_px=args.size))
    else:
        print(get_icon_png(args.name, variant=args.variant, fill=args.fill, color=args.color, size_px=args.size))


if __name__ == "__main__":
    _main(sys.argv[1:])
