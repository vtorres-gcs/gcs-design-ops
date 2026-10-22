"""
Generate background-closing.png — the radial-gradient background for the GCS closing slide.
Run once and commit the output; re-run only if the brand colours change.

Matches closing.card.html exactly:
  background: radial-gradient(1872px 1893px at 101.45% 0%,
                rgb(0,9,87) 0%, rgb(15,26,45) 100%);

The gradient centre sits just off the right edge so the bright Night Blue
(#000957) glows in the top-right corner; the rest of the slide fades to
the dark near-black navy (#0F1A2D).

Usage:
    python3 skills/gcs-pptx/scripts/gen_closing_bg.py
"""

import math
from pathlib import Path

import numpy as np
from PIL import Image

W, H = 1280, 720

# Colours from the CSS (scaled from 1920×1080 source)
CENTRE = (0,  9,  87)   # rgb(0,9,87)   = #000957 — Night Blue (gradient 0%)
EDGE   = (15, 26, 45)   # rgb(15,26,45) = #0F1A2D — near-black navy (gradient 100%)

# CSS gradient centre at 101.45% × 0% of the 1920×1080 source canvas.
# Scaled to 1280×720 (factor 2/3):
cx = 1948 * (W / 1920)   # ≈ 1299 px (just off the right edge)
cy = 0.0

# CSS gradient radius 1872px scaled to 1280-wide canvas
radius = 1872 * (W / 1920)   # ≈ 1248 px

xs = np.arange(W, dtype=np.float32)
ys = np.arange(H, dtype=np.float32)
xv, yv = np.meshgrid(xs, ys)

dist = np.sqrt((xv - cx) ** 2 + (yv - cy) ** 2)
t = np.clip(dist / radius, 0.0, 1.0)   # 0 = centre colour, 1 = edge colour

r = (CENTRE[0] + (EDGE[0] - CENTRE[0]) * t).astype(np.uint8)
g = (CENTRE[1] + (EDGE[1] - CENTRE[1]) * t).astype(np.uint8)
b = (CENTRE[2] + (EDGE[2] - CENTRE[2]) * t).astype(np.uint8)

arr = np.stack([r, g, b], axis=-1)
img = Image.fromarray(arr)

out = Path(__file__).parent.parent / "assets" / "background-closing.png"
out.parent.mkdir(parents=True, exist_ok=True)
img.save(out, optimize=True)
print(f"Written: {out}  ({out.stat().st_size // 1024} KB)")
