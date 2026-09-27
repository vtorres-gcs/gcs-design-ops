"""Pre-pass: resolve every icon/flag reference in a content.json to a real
PNG path on disk, before scripts/build-brochure.js (Node/PptxGenJS) runs.

Icon rasterization (icons.py) and flag resolution (flags.py) are Python
(cairosvg); slide assembly is Node — this script is the bridge, run once per
build so every PNG path the Node components expect already exists.

Recognized fields, resolved and written back in place:
  - a block/page with "flagIso2": "<iso2>" gets a sibling "flagPngPath" set
    via flags.get_flag_png().
  - a block/page with "icon": {"name": "...", "style"?, "filled"?,
    "fillHex"?, "size"?} gets a sibling "iconPngPath" set via
    icons.get_icon_png(). A list field, e.g. "items": [{"icon": {...}}, ...],
    is walked too.

Never invents or substitutes copy — this only resolves asset paths; text
fields are left untouched.

Usage: python3 scripts/prepare-assets.py content.json
(Rewrites content.json in place with the resolved *PngPath fields added.)
"""

import json
import sys
from pathlib import Path

from icons import get_icon_png
from flags import get_flag_png


def _resolve_icon_ref(icon_ref):
    return str(get_icon_png(
        icon_ref["name"],
        style=icon_ref.get("style", "outlined"),
        filled=icon_ref.get("filled", False),
        fill_hex=icon_ref.get("fillHex", "#000957"),
        size_px=icon_ref.get("size", 24),
    ))


def _walk(node, resolved_count):
    if isinstance(node, dict):
        if "flagIso2" in node and node["flagIso2"]:
            node["flagPngPath"] = str(get_flag_png(node["flagIso2"], size_px=node.get("flagSize", 42)))
            resolved_count[0] += 1
        if "icon" in node and isinstance(node["icon"], dict):
            node["iconPngPath"] = _resolve_icon_ref(node["icon"])
            resolved_count[0] += 1
        for value in node.values():
            _walk(value, resolved_count)
    elif isinstance(node, list):
        for item in node:
            _walk(item, resolved_count)


def prepare(content_path: Path):
    content = json.loads(content_path.read_text(encoding="utf-8"))
    resolved_count = [0]
    _walk(content, resolved_count)
    content_path.write_text(json.dumps(content, indent=2) + "\n", encoding="utf-8")
    print(f"Resolved {resolved_count[0]} icon/flag reference(s) in {content_path}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 scripts/prepare-assets.py content.json", file=sys.stderr)
        sys.exit(1)
    prepare(Path(sys.argv[1]).resolve())
