#!/usr/bin/env python3
"""
GCS Chart generator — emits a static, GCS-branded SVG chart (or the full
`.gcs-chart` HTML block) from a JSON spec. No dependencies, stdlib only.

The geometry and visual language are ported 1:1 from the design system's
Chart component (components/core/primitives/Chart.jsx): same margins,
same nice()/tick math, same palette order, same dashed grid.

Usage:
    python3 gcs_chart.py spec.json               # full .gcs-chart block -> stdout
    python3 gcs_chart.py spec.json --svg-only    # bare <svg> -> stdout
    python3 gcs_chart.py spec.json -o chart.html

Spec (JSON):
{
  "type": "bar | column | hbar | line | area | pie | donut | stacked | grouped",
  "theme": "light | dark",                  // default light
  "data":   [{"name": "Jan", "value": 65, "growth": 28}, ...],
  "series": [{"key": "value", "label": "Value"},
             {"key": "growth", "label": "Growth"}],
  "xKey": "name",                           // default "name"
  "width": 800, "height": 320,              // default 800x320 (pie/donut: 280x280)
  "tickPrefix": "", "tickSuffix": "",       // e.g. "€" / "%"
  "ariaLabel": "…",                         // REQUIRED for accessibility
  "eyebrow": "…", "title": "…", "subtitle": "…",   // head block (optional)
  "footnote": "…",                          // optional
  "legend": true,                           // default: auto (multi-series / pie / donut)
  "values": false,                          // draw value labels on bars/points
  "centerLabel": {"value": "…", "caption": "…"}    // donut only, optional
}

Fidelity rules enforced here:
- Values are plotted exactly as given. Negative values raise an error
  (these chart types can't represent them honestly) instead of clipping.
- Pie/donut percentages are computed from the given values only, shown
  to 1 decimal place.
"""

import json
import math
import sys
from html import escape

PALETTE = ["#000957", "#3F8CFF", "#333A79", "#D9E8FF", "#8084AB"]

M = {"top": 16, "right": 16, "bottom": 40, "left": 52}  # Chart.jsx margins
TICK_COUNT = 5
BAR_GAP = 4          # Chart.jsx gap
GROUP_PADDING = 12   # Chart.jsx groupPadding
DOT_RADIUS = 4       # Chart.jsx dotRadius

VALID_TYPES = {"bar", "column", "hbar", "line", "area", "pie", "donut", "stacked", "grouped"}


def nice(mx):
    """Round a raw max up to a 'nice' axis max — ported from Chart.jsx."""
    if mx <= 0:
        mx = 10
    exp = math.floor(math.log10(mx))
    f = mx / (10 ** exp)
    nf = 1 if f <= 1 else 2 if f <= 2 else 5 if f <= 5 else 10
    return nf * (10 ** exp)


def fmt_num(v):
    if isinstance(v, float) and v.is_integer():
        v = int(v)
    if isinstance(v, int):
        return f"{v:,}"
    return f"{v:,.10g}" if abs(v) >= 1000 else f"{v:g}"


def ticks_for(vmax, count=TICK_COUNT):
    ymax = nice(vmax)
    step = ymax / count
    ticks = [step * i for i in range(count + 1)]
    return ymax, ticks


def color_for(series_entry, i):
    return series_entry.get("color") or PALETTE[i % len(PALETTE)]


def check_non_negative(spec, keys):
    for row in spec["data"]:
        for k in keys:
            v = row.get(k, 0) or 0
            if v < 0:
                raise SystemExit(
                    f"ERROR: negative value {v!r} for '{k}' in row {row!r}. "
                    "bar/line/area/pie geometry cannot represent negatives — "
                    "report this back instead of clipping the data."
                )


def tick_label(spec, v):
    label = fmt_num(round(v, 6))
    return f'{spec.get("tickPrefix", "")}{label}{spec.get("tickSuffix", "")}'


# ────────────────────────────────────────────────────────────
# Cartesian scaffold (grid + axis + tick/category labels)
# ────────────────────────────────────────────────────────────

def axes_svg(spec, ticks, ymax, W, H, cats):
    inner_w = W - M["left"] - M["right"]
    inner_h = H - M["top"] - M["bottom"]
    out = []
    for v in ticks:
        y = M["top"] + inner_h - (v / ymax) * inner_h
        out.append(
            f'<line class="gcs-chart__grid" x1="{M["left"]}" x2="{M["left"] + inner_w}" '
            f'y1="{y:.1f}" y2="{y:.1f}"/>'
        )
        out.append(
            f'<text class="gcs-chart__tick" x="{M["left"] - 10}" y="{y + 4:.1f}" '
            f'text-anchor="end">{escape(tick_label(spec, v))}</text>'
        )
    out.append(
        f'<line class="gcs-chart__axis" x1="{M["left"]}" x2="{M["left"] + inner_w}" '
        f'y1="{M["top"] + inner_h}" y2="{M["top"] + inner_h}"/>'
    )
    band = inner_w / max(len(cats), 1)
    for i, c in enumerate(cats):
        cx = M["left"] + band * i + band / 2
        out.append(
            f'<text class="gcs-chart__cat" x="{cx:.1f}" y="{M["top"] + inner_h + 20}" '
            f'text-anchor="middle">{escape(str(c))}</text>'
        )
    return out


# ────────────────────────────────────────────────────────────
# Chart bodies
# ────────────────────────────────────────────────────────────

def render_bar(spec, grouped=False):
    data, series, xkey = spec["data"], spec["series"], spec.get("xKey", "name")
    W, H = spec.get("width", 800), spec.get("height", 320)
    keys = [s["key"] for s in series]
    check_non_negative(spec, keys)
    raw_max = max((row.get(k, 0) or 0) for row in data for k in keys)
    ymax, ticks = ticks_for(raw_max)
    inner_w, inner_h = W - M["left"] - M["right"], H - M["top"] - M["bottom"]
    band = inner_w / len(data)
    n = len(series)
    bar_w = max(4, (band - GROUP_PADDING * 2 - BAR_GAP * (n - 1)) / n)

    out = axes_svg(spec, ticks, ymax, W, H, [row.get(xkey, "") for row in data])
    for i, row in enumerate(data):
        gx = M["left"] + band * i + GROUP_PADDING
        for si, s in enumerate(series):
            val = row.get(s["key"], 0) or 0
            y = M["top"] + inner_h - (val / ymax) * inner_h
            h = M["top"] + inner_h - y
            x = gx + si * (bar_w + BAR_GAP)
            out.append(
                f'<rect x="{x:.1f}" y="{y:.1f}" width="{bar_w:.1f}" height="{h:.1f}" '
                f'fill="{color_for(s, si)}"><title>{escape(str(row.get(xkey, "")))} · '
                f'{escape(s["label"])}: {escape(tick_label(spec, val))}</title></rect>'
            )
            if spec.get("values"):
                out.append(
                    f'<text class="gcs-chart__value" x="{x + bar_w / 2:.1f}" '
                    f'y="{y - 6:.1f}" text-anchor="middle">{escape(tick_label(spec, val))}</text>'
                )
    return W, H, out


def render_stacked(spec):
    data, series, xkey = spec["data"], spec["series"], spec.get("xKey", "name")
    W, H = spec.get("width", 800), spec.get("height", 320)
    keys = [s["key"] for s in series]
    check_non_negative(spec, keys)
    raw_max = max(sum((row.get(k, 0) or 0) for k in keys) for row in data)
    ymax, ticks = ticks_for(raw_max)
    inner_w, inner_h = W - M["left"] - M["right"], H - M["top"] - M["bottom"]
    band = inner_w / len(data)
    bar_w = max(4, band - GROUP_PADDING * 2)

    out = axes_svg(spec, ticks, ymax, W, H, [row.get(xkey, "") for row in data])
    for i, row in enumerate(data):
        x = M["left"] + band * i + GROUP_PADDING
        acc = 0
        for si, s in enumerate(series):
            val = row.get(s["key"], 0) or 0
            y0 = M["top"] + inner_h - (acc / ymax) * inner_h
            y1 = M["top"] + inner_h - ((acc + val) / ymax) * inner_h
            out.append(
                f'<rect x="{x:.1f}" y="{y1:.1f}" width="{bar_w:.1f}" height="{y0 - y1:.1f}" '
                f'fill="{color_for(s, si)}"><title>{escape(str(row.get(xkey, "")))} · '
                f'{escape(s["label"])}: {escape(tick_label(spec, val))}</title></rect>'
            )
            acc += val
    return W, H, out


def render_hbar(spec):
    data, series, xkey = spec["data"], spec["series"], spec.get("xKey", "name")
    W, H = spec.get("width", 800), spec.get("height", None)
    keys = [s["key"] for s in series]
    check_non_negative(spec, keys)
    cats = [str(row.get(xkey, "")) for row in data]
    left = min(200, max(90, 14 + max(len(c) for c in cats) * 7))
    row_band = 34 * len(series) + 18
    if H is None:
        H = 16 + row_band * len(data) + 40
    inner_w = W - left - M["right"]
    inner_h = H - M["top"] - M["bottom"]
    raw_max = max((row.get(k, 0) or 0) for row in data for k in keys)
    xmax, ticks = ticks_for(raw_max)

    out = []
    for v in ticks:
        x = left + (v / xmax) * inner_w
        out.append(
            f'<line class="gcs-chart__grid" x1="{x:.1f}" x2="{x:.1f}" '
            f'y1="{M["top"]}" y2="{M["top"] + inner_h}"/>'
        )
        out.append(
            f'<text class="gcs-chart__tick" x="{x:.1f}" y="{M["top"] + inner_h + 20}" '
            f'text-anchor="middle">{escape(tick_label(spec, v))}</text>'
        )
    out.append(
        f'<line class="gcs-chart__axis" x1="{left}" x2="{left}" '
        f'y1="{M["top"]}" y2="{M["top"] + inner_h}"/>'
    )
    band = inner_h / len(data)
    n = len(series)
    bar_h = max(4, min(26, (band - 14 - BAR_GAP * (n - 1)) / n))
    for i, row in enumerate(data):
        gy = M["top"] + band * i + (band - (bar_h * n + BAR_GAP * (n - 1))) / 2
        out.append(
            f'<text class="gcs-chart__cat" x="{left - 10}" y="{M["top"] + band * i + band / 2 + 4:.1f}" '
            f'text-anchor="end">{escape(str(row.get(xkey, "")))}</text>'
        )
        for si, s in enumerate(series):
            val = row.get(s["key"], 0) or 0
            w = (val / xmax) * inner_w
            y = gy + si * (bar_h + BAR_GAP)
            out.append(
                f'<rect x="{left}" y="{y:.1f}" width="{w:.1f}" height="{bar_h:.1f}" '
                f'fill="{color_for(s, si)}"><title>{escape(str(row.get(xkey, "")))} · '
                f'{escape(s["label"])}: {escape(tick_label(spec, val))}</title></rect>'
            )
            if spec.get("values"):
                out.append(
                    f'<text class="gcs-chart__value" x="{left + w + 8:.1f}" '
                    f'y="{y + bar_h / 2 + 4:.1f}">{escape(tick_label(spec, val))}</text>'
                )
    return W, H, out


def render_line(spec, area=False):
    data, series, xkey = spec["data"], spec["series"], spec.get("xKey", "name")
    W, H = spec.get("width", 800), spec.get("height", 320)
    keys = [s["key"] for s in series]
    check_non_negative(spec, keys)
    raw_max = max((row.get(k, 0) or 0) for row in data for k in keys)
    ymax, ticks = ticks_for(raw_max)
    inner_w, inner_h = W - M["left"] - M["right"], H - M["top"] - M["bottom"]
    band = inner_w / len(data)
    px = lambda i: M["left"] + band * i + band / 2
    py = lambda v: M["top"] + inner_h - (v / ymax) * inner_h
    base_y = M["top"] + inner_h

    out = axes_svg(spec, ticks, ymax, W, H, [row.get(xkey, "") for row in data])
    for si, s in enumerate(series):
        color = color_for(s, si)
        pts = [(px(i), py(row.get(s["key"], 0) or 0)) for i, row in enumerate(data)]
        pts_attr = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
        if area:
            poly = (f"{pts[0][0]:.1f},{base_y} " + pts_attr +
                    f" {pts[-1][0]:.1f},{base_y}")
            out.append(f'<polygon points="{poly}" fill="{color}" fill-opacity="0.15"/>')
        out.append(
            f'<polyline points="{pts_attr}" fill="none" stroke="{color}" '
            f'stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'
        )
        for i, row in enumerate(data):
            val = row.get(s["key"], 0) or 0
            out.append(
                f'<circle cx="{px(i):.1f}" cy="{py(val):.1f}" r="{DOT_RADIUS}" '
                f'fill="{color}"><title>{escape(str(row.get(xkey, "")))} · '
                f'{escape(s["label"])}: {escape(tick_label(spec, val))}</title></circle>'
            )
            if spec.get("values"):
                out.append(
                    f'<text class="gcs-chart__value" x="{px(i):.1f}" '
                    f'y="{py(val) - 10:.1f}" text-anchor="middle">{escape(tick_label(spec, val))}</text>'
                )
    return W, H, out


def render_pie(spec, donut=False):
    data = spec["data"]
    name_key = spec.get("xKey", "name")
    value_key = spec.get("series", [{"key": "value"}])[0]["key"]
    check_non_negative(spec, [value_key])
    size = spec.get("width", 280)
    cx = cy = size / 2
    r = size * 0.42
    r_in = r * 0.62 if donut else 0
    total = sum((row.get(value_key, 0) or 0) for row in data)
    if total <= 0:
        raise SystemExit("ERROR: pie/donut total is zero — nothing to plot.")

    out = []
    angle = -math.pi / 2
    for i, row in enumerate(data):
        val = row.get(value_key, 0) or 0
        slice_a = (val / total) * 2 * math.pi
        a2 = angle + slice_a
        x1, y1 = cx + r * math.cos(angle), cy + r * math.sin(angle)
        x2, y2 = cx + r * math.cos(a2), cy + r * math.sin(a2)
        large = 1 if slice_a > math.pi else 0
        pct = f"{(val / total) * 100:.1f}"
        color = PALETTE[i % len(PALETTE)]
        if donut:
            xi2, yi2 = cx + r_in * math.cos(a2), cy + r_in * math.sin(a2)
            xi1, yi1 = cx + r_in * math.cos(angle), cy + r_in * math.sin(angle)
            path = (f"M {x1:.2f} {y1:.2f} A {r:.2f} {r:.2f} 0 {large} 1 {x2:.2f} {y2:.2f} "
                    f"L {xi2:.2f} {yi2:.2f} A {r_in:.2f} {r_in:.2f} 0 {large} 0 {xi1:.2f} {yi1:.2f} Z")
        else:
            path = (f"M {cx:.2f} {cy:.2f} L {x1:.2f} {y1:.2f} "
                    f"A {r:.2f} {r:.2f} 0 {large} 1 {x2:.2f} {y2:.2f} Z")
        out.append(
            f'<path d="{path}" fill="{color}" stroke="#ffffff" stroke-width="1.5">'
            f'<title>{escape(str(row.get(name_key, "")))}: '
            f'{escape(tick_label(spec, val))} ({pct}%)</title></path>'
        )
        angle = a2
    if donut and spec.get("centerLabel"):
        cl = spec["centerLabel"]
        out.append(
            f'<text class="gcs-chart__donut-total" x="{cx}" y="{cy + 4:.1f}" '
            f'text-anchor="middle">{escape(str(cl.get("value", "")))}</text>'
        )
        if cl.get("caption"):
            out.append(
                f'<text class="gcs-chart__donut-caption" x="{cx}" y="{cy + 26:.1f}" '
                f'text-anchor="middle">{escape(str(cl["caption"]))}</text>'
            )
    return size, size, out


# ────────────────────────────────────────────────────────────
# Assembly
# ────────────────────────────────────────────────────────────

def legend_items(spec):
    t = spec["type"]
    if t in ("pie", "donut"):
        name_key = spec.get("xKey", "name")
        value_key = spec.get("series", [{"key": "value"}])[0]["key"]
        total = sum((row.get(value_key, 0) or 0) for row in spec["data"])
        items = []
        for i, row in enumerate(spec["data"]):
            val = row.get(value_key, 0) or 0
            pct = f"{(val / total) * 100:.1f}"
            items.append((i, f'{row.get(name_key, "")} · {tick_label(spec, val)} ({pct}%)'))
        return items
    if len(spec.get("series", [])) > 1:
        return [(i, s["label"]) for i, s in enumerate(spec["series"])]
    return []


def build_svg(spec):
    t = spec["type"]
    if t in ("bar", "column"):
        W, H, body = render_bar(spec)
    elif t == "grouped":
        W, H, body = render_bar(spec, grouped=True)
    elif t == "stacked":
        W, H, body = render_stacked(spec)
    elif t == "hbar":
        W, H, body = render_hbar(spec)
    elif t == "line":
        W, H, body = render_line(spec)
    elif t == "area":
        W, H, body = render_line(spec, area=True)
    elif t == "pie":
        W, H, body = render_pie(spec)
    elif t == "donut":
        W, H, body = render_pie(spec, donut=True)
    else:
        raise SystemExit(f"ERROR: unknown chart type {t!r}. Valid: {sorted(VALID_TYPES)}")

    aria = spec.get("ariaLabel") or spec.get("title") or "Chart"
    inner = "\n    ".join(body)
    return (
        f'<svg class="gcs-chart__svg" viewBox="0 0 {W} {H}" role="img" '
        f'aria-label="{escape(aria)}" xmlns="http://www.w3.org/2000/svg">\n    {inner}\n  </svg>'
    )


def build_block(spec):
    svg = build_svg(spec)
    theme = spec.get("theme", "light")
    t = "bar" if spec["type"] in ("column", "grouped", "stacked") else spec["type"]
    parts = [f'<figure class="gcs-chart" data-theme="{theme}" data-type="{t}">']

    if spec.get("title") or spec.get("eyebrow") or spec.get("subtitle"):
        parts.append('  <div class="gcs-chart__head">')
        if spec.get("eyebrow"):
            parts.append(f'    <span class="gcs-chart__eyebrow">{escape(spec["eyebrow"])}</span>')
        if spec.get("title"):
            parts.append(f'    <h3 class="gcs-chart__title">{escape(spec["title"])}</h3>')
        if spec.get("subtitle"):
            parts.append(f'    <p class="gcs-chart__subtitle">{escape(spec["subtitle"])}</p>')
        parts.append('  </div>')

    parts.append('  <div class="gcs-chart__body">')
    parts.append(f'  {svg}')
    parts.append('  </div>')

    items = legend_items(spec) if spec.get("legend", True) else []
    if items:
        parts.append('  <ul class="gcs-chart__legend">')
        for i, label in items:
            s = (i % len(PALETTE)) + 1
            parts.append(
                f'    <li class="gcs-chart__legend-item">'
                f'<span class="gcs-chart__swatch gcs-chart__swatch--s{s}"></span>{escape(label)}</li>'
            )
        parts.append('  </ul>')

    if spec.get("footnote"):
        parts.append(f'  <figcaption class="gcs-chart__footnote">{escape(spec["footnote"])}</figcaption>')

    parts.append('</figure>')
    return "\n".join(parts)


def main():
    args = [a for a in sys.argv[1:]]
    if not args:
        print(__doc__)
        sys.exit(1)
    spec_path = args[0]
    svg_only = "--svg-only" in args
    out_path = None
    if "-o" in args:
        out_path = args[args.index("-o") + 1]

    with open(spec_path, encoding="utf-8") as f:
        spec = json.load(f)

    if spec.get("type") not in VALID_TYPES:
        raise SystemExit(f"ERROR: spec.type must be one of {sorted(VALID_TYPES)}")
    if not spec.get("data"):
        raise SystemExit("ERROR: spec.data is empty.")
    if not spec.get("series") and spec["type"] not in ("pie", "donut"):
        raise SystemExit("ERROR: spec.series is required for cartesian charts.")

    result = build_svg(spec) if svg_only else build_block(spec)
    if out_path:
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(result + "\n")
        print(f"written: {out_path}")
    else:
        print(result)


if __name__ == "__main__":
    main()
