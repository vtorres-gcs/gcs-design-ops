"""One-off asset generator for the brochure builder.

Regenerates, from files shipped inside this skill:
  - assets/icons/social/{name}.png — the 4 brand marks (LinkedIn/Facebook/
    Instagram/YouTube, assets/icons/social/{name}.svg, never recolored) placed
    on a square 22px slot (8x oversampled) so components keep one fixed icon box.
  - assets/icons/pin.png — Material Symbols `location_on` (filled, white),
    fetched from google/material-design-icons and trimmed to its ink.
  - assets/covers/background-back-cover.png — the back-cover radial gradient as
    a flat PNG (pptxgenjs shapes have no gradient fill).
Logos in assets/logos/*.png are shipped as-is (PptxGenJS under Node cannot embed
SVG, so they are PNG-only here).

Re-run only if the marks or the gradient spec change.

Usage: python3 scripts/gen-assets.py
"""

import re
from pathlib import Path
from PIL import Image
import numpy as np

from icons import get_icon_png, get_social_icon_png, SOCIAL_MARKS, SOCIAL_DIR

ROOT = Path(__file__).resolve().parent.parent
OUT_COVERS = ROOT / "assets" / "covers"
OUT_ICONS = ROOT / "assets" / "icons"

SLOT_PX = 22 * 8        # 22px on-slide slot, 8x oversampled
MARK_SCALE = 1.2        # brand mark ink size = native SVG px * this, centred in the slot


def _svg_longest_side(svg_path: Path) -> float:
    head = svg_path.read_text(encoding="utf-8").split(">", 1)[0]
    return max(float(re.search(rf'\s{attr}="([\d.]+)', head).group(1)) for attr in ("width", "height"))


def rasterize_icons():
    SOCIAL_DIR.mkdir(parents=True, exist_ok=True)
    for name in SOCIAL_MARKS:
        target = round(_svg_longest_side(SOCIAL_DIR / f"{name}.svg") * MARK_SCALE * 8)
        mark = Image.open(get_social_icon_png(name, size_px=target)).convert("RGBA")
        slot = Image.new("RGBA", (SLOT_PX, SLOT_PX), (0, 0, 0, 0))
        slot.paste(mark, ((SLOT_PX - mark.width) // 2, (SLOT_PX - mark.height) // 2), mark)
        out_path = SOCIAL_DIR / f"{name}.png"
        slot.save(out_path)
        print(f"brand mark -> {out_path.relative_to(ROOT)}")

    pin = Image.open(get_icon_png("location_on", variant="outlined", fill=True, color="#FFFFFF", size_px=240)).convert("RGBA")
    pin = pin.crop(pin.getbbox())  # trim to ink so back-cover/factsheet can size it by its real aspect
    out_path = OUT_ICONS / "pin.png"
    pin.save(out_path)
    print(f"pin -> {out_path.relative_to(ROOT)} ({pin.width}x{pin.height})")


def gen_back_cover_gradient():
    """Approximates: radial-gradient(1146px 1196px at 101.45% 0%, #000957 0%, #0F1A2D 100%)
    over the 794x1123 (A4 @96dpi) brochure canvas, rendered at 3x for print quality."""
    W, H = 794 * 3, 1123 * 3
    cx, cy = 1.0145 * W, 0.0 * H  # gradient center: 101.45% x, 0% y (CSS % is of the box, not the radius box)
    rx, ry = 1146 * 3, 1196 * 3
    c0 = (0x00, 0x09, 0x57)  # #000957
    c1 = (0x0F, 0x1A, 0x2D)  # #0F1A2D

    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
    t = np.clip(d, 0.0, 1.0)[..., None]  # (H, W, 1)
    c0_arr = np.array(c0, dtype=np.float64)
    c1_arr = np.array(c1, dtype=np.float64)
    rgb = np.round(c0_arr + t * (c1_arr - c0_arr)).astype(np.uint8)

    out_path = OUT_COVERS / "background-back-cover.png"
    Image.fromarray(rgb).save(out_path)
    print(f"back-cover gradient -> {out_path.relative_to(ROOT)}")


if __name__ == "__main__":
    rasterize_icons()
    gen_back_cover_gradient()
