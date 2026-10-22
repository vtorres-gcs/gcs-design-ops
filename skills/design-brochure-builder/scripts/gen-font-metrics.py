"""One-off generator for assets/font-metrics.json — per-glyph advance widths
(em units) for the embedded Yrsa/Heebo faces, read by scripts/text-metrics.js.

PptxGenJS text boxes don't reflow or report overflow, so components that size
cards/boxes from their copy need a real width measurement, not an average-
character guess. This table (kerning ignored, <1% error on running copy) lets
text-metrics.js do an exact greedy word-wrap. Re-run only if the font files in
assets/fonts/ change.

Usage: python3 scripts/gen-font-metrics.py
"""
import json
from pathlib import Path
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = {
    "Heebo Light": "Heebo-Light.ttf",
    "Heebo": "Heebo-Regular.ttf",
    "Heebo Medium": "Heebo-Medium.ttf",
    "Heebo SemiBold": "Heebo-SemiBold.ttf",
    "Heebo Bold": "Heebo-Bold.ttf",
    "Yrsa": "Yrsa-Regular.ttf",
    "Yrsa Italic": "Yrsa-Italic.ttf",
}
EXTRA = [0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026, 0x20AC, 0x00A0]
CODEPOINTS = list(range(0x20, 0x180)) + EXTRA

out = {}
for key, fname in FONTS.items():
    font = TTFont(ROOT / "assets" / "fonts" / fname)
    upem = font["head"].unitsPerEm
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    adv = {}
    for cp in CODEPOINTS:
        glyph = cmap.get(cp)
        if glyph:
            adv[chr(cp)] = round(hmtx[glyph][0] / upem, 4)
    out[key] = {"adv": adv, "default": adv.get("n", 0.5)}

dest = ROOT / "assets" / "font-metrics.json"
dest.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
print(f"wrote {dest} ({dest.stat().st_size} bytes)")
