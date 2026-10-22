"""Country-flag pipeline for design-brochure-builder.

Flags come ONLY from the vendored copy of github.com/msikma/country-flags kept
inside this skill as ONE sprite atlas: assets/flags/atlas.png (every flag already
center-cropped to a 256px square, packed in a grid) + atlas.json (code -> name +
cell, upstream commit) + the upstream MIT licence. A single image keeps the skill
under upload file-count limits. Never flagcdn, Wikipedia, any other CDN or flag
set, a hand-drawn flag, or an image model. A code the set does not contain (e.g.
xk, gb-sct, most overseas territories) raises MissingAsset — never substitute a
placeholder; ask the user.

UK: msikma names it uk (ISO2 "gb" is accepted as an alias).

Cells are already square (CSS object-fit: cover equivalent), so this module only cuts
the cell out and resizes it; PptxGenJS's `addImage({rounding: true})` does the circular
crop at the OOXML level. Sizes above 256px are upscaled (no real extra detail).

AI-generated images must never contain flags (political symbolism): any flag on
a page comes from the atlas as a badge, never from an image model.

Refresh the vendored set from upstream with scripts/update-flags.py.

Usage (CLI):
    python3 scripts/flags.py it            # -> square PNG path
    python3 scripts/flags.py gb --size 176
"""

import json
import re
import sys
from pathlib import Path

from icons import MissingAsset

SKILL_DIR = Path(__file__).resolve().parent.parent
FLAGS_DIR = SKILL_DIR / "assets" / "flags"
GENERATED_DIR = SKILL_DIR / "assets" / "flags_cache"  # square-cropped PNGs, created on demand

ALIASES = {"gb": "uk"}  # ISO2 for the United Kingdom; msikma file is uk.png
CODE_RE = re.compile(r"^[a-z]{2}$")


def _index() -> dict:
    return json.loads((FLAGS_DIR / "atlas.json").read_text(encoding="utf-8"))


def _cut_cell(code: str, cell_no: int, meta: dict, size_px: int) -> Path:
    from PIL import Image
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    out_path = GENERATED_DIR / f"{code}-sq-{size_px}.png"
    if not out_path.exists():
        cell, cols = meta["cell"], meta["cols"]
        left, top = (cell_no % cols) * cell, (cell_no // cols) * cell
        with Image.open(FLAGS_DIR / "atlas.png") as atlas:
            im = atlas.crop((left, top, left + cell, top + cell)).convert("RGB")
        im.resize((size_px, size_px), Image.LANCZOS).save(out_path)
    return out_path


def available_codes() -> list:
    return sorted(_index()["flags"])


def resolve_flag_path(iso2: str, size_px: int = 42) -> Path:
    requested = (iso2 or "").strip().lower()
    if not CODE_RE.match(requested):
        raise MissingAsset(f"'{iso2}' is not a valid ISO 3166-1 alpha-2 flag code (e.g. 'pt').")
    code = ALIASES.get(requested, requested)
    meta = _index()
    entry = meta["flags"].get(code)
    if entry is None:
        raise MissingAsset(
            f"No flag for '{iso2}': '{code}' is not in msikma/country-flags (vendored in {FLAGS_DIR.name}/atlas.png). "
            "Never substitute a placeholder, another flag source or a drawn flag — ask the user how to proceed."
        )
    return _cut_cell(code, entry["cell"], meta, size_px)


def get_flag_png(iso2: str, size_px: int = 42) -> Path:
    return resolve_flag_path(iso2, size_px=size_px)


def _main(argv):
    import argparse

    parser = argparse.ArgumentParser(description="Resolve a country flag from the vendored msikma/country-flags set.")
    parser.add_argument("iso2")
    parser.add_argument("--size", type=int, default=42)
    args = parser.parse_args(argv)
    print(get_flag_png(args.iso2, size_px=args.size))


if __name__ == "__main__":
    _main(sys.argv[1:])
