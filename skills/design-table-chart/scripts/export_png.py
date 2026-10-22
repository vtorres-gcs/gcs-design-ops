#!/usr/bin/env python3
"""
GCS PNG exporter — renders a `.gcs-table` / `.gcs-chart` HTML fragment to a
high-resolution PNG with a TRANSPARENT background (outside the component's
own card surface), ready for presentations, brochures, and websites.

How it works: wraps the fragment in a minimal page with a transparent body,
inlines the canonical stylesheets (tables.css + charts.css) from this
skill's assets/ directory, screenshots it with headless Chrome at 2x device
scale, then trims the transparent margins with Pillow.

Usage:
    python3 export_png.py fragment.html out.png [--width 1200] [--scale 2]

    fragment.html  — file containing ONLY the component markup
                     (the <div class="gcs-table">…</div> and/or
                      <figure class="gcs-chart">…</figure> block)
    --width        — CSS pixel width of the component (default 1200)
    --scale        — device scale factor / resolution multiplier (default 2)

Requires: Google Chrome (or Chromium) and Pillow (`pip3 install Pillow`).
"""

import os
import shutil
import subprocess
import sys
import tempfile
import time

SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "google-chrome",
    "chromium",
    "chromium-browser",
    "chrome",
]


def find_chrome():
    for c in CHROME_CANDIDATES:
        if os.path.sep in c:
            if os.path.exists(c):
                return c
        elif shutil.which(c):
            return shutil.which(c)
    raise SystemExit("ERROR: no Chrome/Chromium found. Install Google Chrome or pass a path.")


def read_css():
    css = []
    for name in ("tables.css", "charts.css"):
        p = os.path.join(SKILL_DIR, "assets", name)
        if os.path.exists(p):
            with open(p, encoding="utf-8") as f:
                css.append(f.read())
    return "\n".join(css)


def main():
    args = sys.argv[1:]
    if len(args) < 2:
        print(__doc__)
        sys.exit(1)
    frag_path, out_path = args[0], args[1]
    width = int(args[args.index("--width") + 1]) if "--width" in args else 1200
    scale = int(args[args.index("--scale") + 1]) if "--scale" in args else 2

    with open(frag_path, encoding="utf-8") as f:
        fragment = f.read()

    page = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  html, body {{ margin: 0; padding: 0; background: transparent !important; }}
  #stage {{ width: {width}px; padding: 1px; }}
</style>
<style>{read_css()}</style>
</head><body><div id="stage">{fragment}</div></body></html>"""

    tmpdir = tempfile.mkdtemp(prefix="gcs-export-")
    page_path = os.path.join(tmpdir, "page.html")
    shot_path = os.path.join(tmpdir, "shot.png")
    with open(page_path, "w", encoding="utf-8") as f:
        f.write(page)

    chrome = find_chrome()
    # Tall window; transparent margins are trimmed afterwards.
    # --virtual-time-budget lets webfonts (Heebo/Yrsa) finish loading before
    # the screenshot. Chrome's new headless mode sometimes writes the
    # screenshot and then never exits, so we don't wait for the process —
    # we poll for the file, wait for its size to go stable, then kill Chrome.
    cmd = [
        chrome,
        "--headless=new",
        f"--screenshot={shot_path}",
        f"--window-size={width + 2},6000",
        f"--force-device-scale-factor={scale}",
        "--default-background-color=00000000",
        "--hide-scrollbars",
        "--virtual-time-budget=8000",
        "--timeout=20000",
        "--disable-gpu",
        f"--user-data-dir={os.path.join(tmpdir, 'profile')}",
        f"file://{page_path}",
    ]
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    deadline = time.time() + 120
    last_size = -1
    while time.time() < deadline:
        if proc.poll() is not None and os.path.exists(shot_path):
            break  # Chrome exited cleanly and the file is there
        if os.path.exists(shot_path):
            size = os.path.getsize(shot_path)
            if size > 0 and size == last_size:
                break  # file written and stable for one poll interval
            last_size = size
        time.sleep(1.0)
    if proc.poll() is None:
        proc.kill()
        proc.wait()
    if not os.path.exists(shot_path) or os.path.getsize(shot_path) == 0:
        err = proc.stderr.read().decode(errors="replace") if proc.stderr else ""
        raise SystemExit(f"ERROR: Chrome screenshot failed.\n{err[-2000:]}")

    try:
        from PIL import Image
    except ImportError:
        raise SystemExit("ERROR: Pillow missing — run: pip3 install Pillow")

    img = Image.open(shot_path).convert("RGBA")
    bbox = img.getbbox()  # bounding box of non-transparent pixels
    if bbox:
        img = img.crop(bbox)
    img.save(out_path)
    w, h = img.size
    print(f"written: {out_path} ({w}x{h}px, {scale}x scale, transparent background)")

    webp_path = out_path.replace(".png", ".webp")
    img.save(webp_path, "WEBP", lossless=True)
    print(f"written: {webp_path} (WebP lossless)")


if __name__ == "__main__":
    main()
