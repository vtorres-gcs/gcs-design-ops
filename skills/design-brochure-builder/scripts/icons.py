"""General-purpose icon pipeline for gcs-brochure-builder.

PptxGenJS/OOXML cannot embed live SVG when run under Node (a `.svg` path
passed to `addImage()` resolves to a broken-image placeholder in Node —
see pptxgenjs GitHub issue #401), so every icon this skill uses is
rasterized to PNG first, exactly like skills/gcs-pptx already documents in
its "Icons" section.

Two families:
  - Material Symbols content icons — sourced from a sibling design-system
    checkout's assets/icons/{outlined,rounded,sharp}/{name}[-fill].svg when
    this skill is checked out alongside that repo, else fetched on demand
    from the upstream google/material-design-icons repo.
  - The 5 bespoke GCS social/pin marks (not swappable to Material Symbols —
    these are the approved icon set for those exact placements per
    skills/gcs-brochure/references/design-system.md) — kept as literal SVG
    markup, but routed through the same rasterize-and-cache mechanism as
    Material Symbols so there is only one code path to maintain.

Never Font Awesome, Heroicons, Feather, Lucide, or emoji — Material Symbols
(or the 5 bespoke marks above) only.

Usage (CLI):
    python3 scripts/icons.py account_balance --style outlined --fill '#000957' --size 24
    python3 scripts/icons.py linkedin --social --fill '#FFFFFF'
Prints the resolved/generated PNG path to stdout.
"""

import re
import sys
import urllib.request
import urllib.error
from pathlib import Path

import cairosvg

SKILL_DIR = Path(__file__).resolve().parent.parent
REPO_ASSETS = SKILL_DIR.parents[1] / "assets"  # sibling design-system repo's assets/, when checked out alongside
REPO_ICONS_DIR = REPO_ASSETS / "icons"

GENERATED_DIR = SKILL_DIR / "assets" / "icons" / "_generated"
SOCIAL_CACHE_DIR = GENERATED_DIR  # cache only — gen-assets.py copies the result to the canonical assets/icons/{name}.png

MATERIAL_SYMBOLS_URL = (
    "https://raw.githubusercontent.com/google/material-design-icons/master/"
    "symbols/web/{name}/materialsymbols{style}/{name}_24px.svg"
)

# The 5 bespoke GCS social/pin marks — verbatim from
# skills/gcs-brochure/assets/covers/back-cover.html. Not Material Symbols;
# never fetched, never swapped. Base fill is overwritten per-call by
# _recolor_svg() so a single markup entry serves any requested fill_hex.
SOCIAL_ICONS = {
    "pin": (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.671 15.338" fill="#FFFFFF">'
        '<path d="M 6.836 0 C 3.06 0 0 3.06 0 6.836 C 0 8.889 1.07 10.675 2.26 12.036 C 3.459 13.407 4.859 14.436 5.692 14.991 '
        'C 6.388 15.454 7.283 15.454 7.979 14.991 C 8.812 14.436 10.212 13.407 11.411 12.036 C 12.601 10.675 13.671 8.889 13.671 6.836 '
        'C 13.671 3.06 10.611 0 6.836 0 Z M 6.836 3.798 C 5.158 3.798 3.798 5.158 3.798 6.836 C 3.798 8.513 5.158 9.874 6.836 9.874 '
        'C 8.513 9.874 9.874 8.513 9.874 6.836 C 9.874 5.158 8.513 3.798 6.836 3.798 Z" fill-rule="evenodd"/></svg>'
    ),
    "linkedin": (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#B3B5CD">'
        '<path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>'
    ),
    "facebook": (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#B3B5CD">'
        '<path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>'
    ),
    "instagram": (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#B3B5CD">'
        '<path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>'
    ),
    "youtube": (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#B3B5CD">'
        '<path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/></svg>'
    ),
}


class MissingAsset(Exception):
    pass


def _recolor_svg(svg_markup: str, fill_hex: str) -> str:
    """Force the root <svg>'s fill to fill_hex, matching the technique already
    used by gen-assets.py and documented in skills/gcs-pptx/SKILL.md."""
    if 'fill="' in svg_markup.split(">", 1)[0]:
        return re.sub(r'fill="[^"]*"', f'fill="{fill_hex}"', svg_markup, count=1)
    return svg_markup.replace("<svg ", f'<svg fill="{fill_hex}" ', 1)


def _rasterize_and_cache(svg_markup: str, fill_hex: str, size_px: int, cache_dir: Path, cache_key: str) -> Path:
    cache_dir.mkdir(parents=True, exist_ok=True)
    out_path = cache_dir / f"{cache_key}.png"
    if out_path.exists():
        return out_path
    recolored = _recolor_svg(svg_markup, fill_hex)
    cairosvg.svg2png(
        bytestring=recolored.encode("utf-8"),
        write_to=str(out_path),
        output_width=size_px,
        output_height=size_px,
    )
    return out_path


def resolve_icon_svg(name: str, style: str = "outlined", filled: bool = False) -> str:
    """Return raw SVG markup for a Material Symbols icon: repo-local first,
    else fetched from upstream. Raises MissingAsset if neither works."""
    suffix = "-fill" if filled else ""
    local_path = REPO_ICONS_DIR / style / f"{name}{suffix}.svg"
    if local_path.exists():
        return local_path.read_text(encoding="utf-8")

    url = MATERIAL_SYMBOLS_URL.format(name=name, style=style)
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            return resp.read().decode("utf-8")
    except (urllib.error.URLError, urllib.error.HTTPError) as exc:
        raise MissingAsset(
            f"Icon '{name}' (style={style}, filled={filled}) not found in {local_path} "
            f"and could not be fetched from {url}: {exc}. Ask the user for the specific SVG."
        ) from exc


def get_icon_png(name: str, *, style: str = "outlined", filled: bool = False,
                  fill_hex: str = "#000957", size_px: int = 24) -> Path:
    """Public entry point for a generic Material Symbols content icon."""
    svg = resolve_icon_svg(name, style=style, filled=filled)
    cache_key = f"{name}-{style}-{'fill' if filled else 'outline'}-{fill_hex.lstrip('#')}-{size_px}"
    return _rasterize_and_cache(svg, fill_hex, size_px, GENERATED_DIR, cache_key)


def get_social_icon_png(name: str, fill_hex: str = "#FFFFFF", size_px: int = 64) -> Path:
    """Public entry point for one of the 5 bespoke GCS social/pin marks."""
    if name not in SOCIAL_ICONS:
        raise MissingAsset(f"'{name}' is not a bundled social icon. Available: {', '.join(SOCIAL_ICONS)}")
    cache_key = f"social-{name}-{fill_hex.lstrip('#')}"
    return _rasterize_and_cache(SOCIAL_ICONS[name], fill_hex, size_px, SOCIAL_CACHE_DIR, cache_key)


def _main(argv):
    import argparse

    parser = argparse.ArgumentParser(description="Resolve/rasterize a GCS brochure icon to PNG.")
    parser.add_argument("name")
    parser.add_argument("--style", choices=["outlined", "rounded", "sharp"], default="outlined")
    parser.add_argument("--filled", action="store_true")
    parser.add_argument("--social", action="store_true", help="Treat name as one of the 5 bespoke social/pin marks")
    parser.add_argument("--fill", default="#000957", dest="fill_hex")
    parser.add_argument("--size", type=int, default=24)
    args = parser.parse_args(argv)

    if args.social:
        path = get_social_icon_png(args.name, fill_hex=args.fill_hex, size_px=args.size)
    else:
        path = get_icon_png(args.name, style=args.style, filled=args.filled, fill_hex=args.fill_hex, size_px=args.size)
    print(path)


if __name__ == "__main__":
    _main(sys.argv[1:])
