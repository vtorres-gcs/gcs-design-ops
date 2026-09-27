"""Country-flag pipeline for gcs-brochure-builder.

Flags come exclusively from the repo's own assets/flags/ (self-hosted PNGs
from msikma/country-flags — never flagcdn, Wikipedia, or any other source,
per skills/gcs-table-chart/references/flags.md's 2026-07 policy). Most codes
are already PNG (no rasterization needed — PptxGenJS's
`addImage({rounding: true})` does the circular crop at the OOXML level, so
this module never pre-crops). A handful of territories/UK-sub-nations/Kosovo
only exist as legacy .svg in assets/flags/ and are rasterized on demand via
the same cairosvg helper icons.py uses.

Usage (CLI):
    python3 scripts/flags.py it            # -> assets/flags/it.png
    python3 scripts/flags.py xk --size 42  # legacy .svg -> rasterized PNG
"""

import sys
from pathlib import Path

from icons import MissingAsset

SKILL_DIR = Path(__file__).resolve().parent.parent
REPO_ASSETS = SKILL_DIR.parents[1] / "assets"
FLAGS_DIR = REPO_ASSETS / "flags"
GENERATED_DIR = SKILL_DIR / "assets" / "flags" / "_generated"

# The repo's local copy names the UK flag gb.png (upstream msikma/country-flags
# calls it uk.png) — always resolve through this alias so either code works.
ALIASES = {"uk": "gb"}


def resolve_flag_path(iso2: str, size_px: int = 42) -> Path:
    code = ALIASES.get(iso2.lower(), iso2.lower())

    png_path = FLAGS_DIR / f"{code}.png"
    if png_path.exists():
        return png_path

    svg_path = FLAGS_DIR / f"{code}.svg"
    if svg_path.exists():
        svg_markup = svg_path.read_text(encoding="utf-8")
        # Flags keep their own multi-color artwork — recolor is a no-op here,
        # but _rasterize_and_cache always recolors the root <svg>'s fill, which
        # would corrupt a multi-path flag. Rasterize directly instead.
        import cairosvg
        GENERATED_DIR.mkdir(parents=True, exist_ok=True)
        out_path = GENERATED_DIR / f"{code}-{size_px}.png"
        if not out_path.exists():
            cairosvg.svg2png(bytestring=svg_markup.encode("utf-8"), write_to=str(out_path),
                              output_width=size_px, output_height=size_px)
        return out_path

    raise MissingAsset(
        f"No flag found for ISO2 code '{iso2}' (checked {png_path} and {svg_path}). "
        "Never substitute a placeholder — ask the user for the correct country code."
    )


def get_flag_png(iso2: str, size_px: int = 42) -> Path:
    return resolve_flag_path(iso2, size_px=size_px)


def _main(argv):
    import argparse

    parser = argparse.ArgumentParser(description="Resolve/rasterize a GCS brochure country flag to PNG.")
    parser.add_argument("iso2")
    parser.add_argument("--size", type=int, default=42)
    args = parser.parse_args(argv)
    print(get_flag_png(args.iso2, size_px=args.size))


if __name__ == "__main__":
    _main(sys.argv[1:])
