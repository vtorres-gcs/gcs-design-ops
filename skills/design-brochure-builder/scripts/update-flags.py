"""Refresh the vendored flag set (assets/flags/) from upstream github.com/msikma/country-flags.

Downloads the master tarball and rebuilds a single sprite atlas: every flag is
center-cropped to a square (what the round badge shows) and resized to CELL px,
then packed into assets/flags/atlas.png with an index in atlas.json
(code -> name + cell). One image instead of ~220 files keeps the skill under
upload file-count limits (and zip uploads may not contain nested archives).
Also writes the upstream MIT licence and SOURCE.txt (upstream commit).
Needs network; normal builds never do — they read the vendored atlas.

Usage: python3 scripts/update-flags.py
"""

import io
import json
import shutil
import tarfile
import urllib.request
from pathlib import Path

from PIL import Image

FLAGS_DIR = Path(__file__).resolve().parent.parent / "assets" / "flags"
REPO = "msikma/country-flags"
CELL = 256  # px per square cell; 44px badge at ~5.8x
COLS = 16


def build_atlas(pngs: dict, names: dict, sha: str, licence: bytes) -> int:
    """pngs: code -> raw PNG bytes; names: code -> country name."""
    codes = sorted(pngs)
    rows = -(-len(codes) // COLS)
    atlas = Image.new("RGBA", (COLS * CELL, rows * CELL), (0, 0, 0, 0))
    index = {}
    for i, code in enumerate(codes):
        im = Image.open(io.BytesIO(pngs[code])).convert("RGBA")
        side = min(im.size)
        left, top = (im.width - side) // 2, (im.height - side) // 2
        cell = im.crop((left, top, left + side, top + side)).resize((CELL, CELL), Image.LANCZOS)
        atlas.paste(cell, ((i % COLS) * CELL, (i // COLS) * CELL))
        meta = names.get(code, code)
        index[code] = {"name": meta.get("name", code) if isinstance(meta, dict) else meta, "cell": i}
    FLAGS_DIR.mkdir(parents=True, exist_ok=True)
    atlas.save(FLAGS_DIR / "atlas.png", optimize=True)
    (FLAGS_DIR / "atlas.json").write_text(
        json.dumps({"cell": CELL, "cols": COLS, "source": f"https://github.com/{REPO} @ {sha}", "flags": index},
                   indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    (FLAGS_DIR / "LICENSE-msikma-country-flags").write_bytes(licence)
    (FLAGS_DIR / "SOURCE.txt").write_text(f"https://github.com/{REPO} @ {sha}\n", encoding="utf-8")
    return len(codes)


def main():
    sha = json.load(urllib.request.urlopen(f"https://api.github.com/repos/{REPO}/commits/master", timeout=30))["sha"]
    data = urllib.request.urlopen(f"https://codeload.github.com/{REPO}/tar.gz/{sha}", timeout=120).read()
    pngs, names, licence = {}, {}, b""
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as tar:
        for member in tar.getmembers():
            rel = member.name.split("/", 1)[1] if "/" in member.name else ""
            if not member.isfile():
                continue
            if rel.startswith("flags/png/") and rel.endswith(".png"):
                pngs[Path(rel).stem] = tar.extractfile(member).read()
            elif rel == "flags/flags.json":
                names = json.loads(tar.extractfile(member).read().decode("utf-8"))
            elif rel == "license":
                licence = tar.extractfile(member).read()
    shutil.rmtree(FLAGS_DIR.parent / "flags_cache", ignore_errors=True)
    count = build_atlas(pngs, names, sha, licence)
    print(f"Vendored {count} flags from {REPO}@{sha[:7]} into {FLAGS_DIR.name}/atlas.png")


if __name__ == "__main__":
    main()
