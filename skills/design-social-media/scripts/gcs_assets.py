"""GCS Social Media — bundled asset loader.

Everything a slide needs as an image (fonts, logos, quote marks, CTA
background, Trustpilot star row) is read from this skill's own `assets/` folder
and returned as a `data:` URI. Standard library only, no network, no repo
checkout, no hardcoded base64 in the docs.

Icons are NOT here on purpose: Material Symbols are fetched with `curl` and
pasted inline as `<svg fill="currentColor">`, exactly as the gcs-brochure skill
does it. Flags stay `<img>` via `flag_uri()`, the one network call.

Import it from a generation script:

    import sys
    from pathlib import Path
    SKILL_DIR = Path("<the folder you read SKILL.md from>")
    sys.path.insert(0, str(SKILL_DIR / "scripts"))
    from gcs_assets import FONTS_CSS, LOGO_WHITE, embed_image   # etc.

Self-check (run after copying the skill to a new machine):

    python3 scripts/gcs_assets.py
"""

from pathlib import Path
import base64
import urllib.error
import urllib.request

# Resolve the skill folder from this file, never from the working directory —
# bare relative paths break on any machine where cwd is not the skill root.
SKILL_DIR = Path(__file__).resolve().parent.parent
ASSETS = SKILL_DIR / "assets"

_MIME = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
}


class MissingAsset(RuntimeError):
    """A required asset is not on disk (or not reachable)."""


def data_uri(path) -> str:
    """Read any file and return it as a base64 `data:` URI."""
    p = Path(path)
    if not p.is_file():
        raise MissingAsset(
            f"asset not found: {p}\n"
            f"  SKILL_DIR resolved to: {SKILL_DIR}\n"
            f"If this is a bundled asset the skill folder was copied incompletely — "
            f"re-copy all of {SKILL_DIR.name}/ (assets/ included) and run: "
            f"python3 {SKILL_DIR / 'scripts' / 'gcs_assets.py'}"
        )
    mime = _MIME.get(p.suffix.lower(), "application/octet-stream")
    return f"data:{mime};base64,{base64.b64encode(p.read_bytes()).decode()}"


def embed_image(file_path) -> str:
    """Embed a user-supplied image as a data URI, MIME sniffed by magic bytes.

    Extensions on user photos lie often enough to matter (a `.jpg` that is
    really a PNG renders fine in a browser but not through a mislabelled data
    URI), and shelling out to `file` would add a binary this skill cannot
    assume on another machine.
    """
    p = Path(file_path)
    if not p.is_file():
        raise MissingAsset(f"user image not found: {p}")
    raw = p.read_bytes()
    head = raw[:12]
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        mime = "image/png"
    elif head.startswith(b"\xff\xd8\xff"):
        mime = "image/jpeg"
    elif head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        mime = "image/webp"
    elif raw.lstrip()[:5] in (b"<svg ", b"<?xml"):
        mime = "image/svg+xml"
    else:
        mime = _MIME.get(p.suffix.lower(), "image/jpeg")
    return f"data:{mime};base64,{base64.b64encode(raw).decode()}"


def assert_valid_data_uri(name: str, uri: str) -> None:
    """Fail loudly on a data URI that is malformed or does not decode."""
    header, _, payload = uri.partition(",")
    if not header.startswith("data:") or ";base64" not in header:
        raise ValueError(f"{name}: malformed data URI header")
    try:
        base64.b64decode(payload, validate=True)
    except Exception as e:  # noqa: BLE001 — surface the cause verbatim
        raise ValueError(f"{name}: corrupted base64 payload ({e})") from e


# ----------------------------------------------------------------------------
# Fonts — Yrsa (headings, incl. italic) + Heebo 300/400/500/600/700
# ----------------------------------------------------------------------------

_FACES = [
    ("Yrsa", 400, "normal", "Yrsa-Regular.ttf"),
    ("Yrsa", 400, "italic", "Yrsa-Italic.ttf"),  # cover highlight line
    ("Heebo", 300, "normal", "Heebo-Light.ttf"),
    ("Heebo", 400, "normal", "Heebo-Regular.ttf"),
    ("Heebo", 500, "normal", "Heebo-Medium.ttf"),
    ("Heebo", 600, "normal", "Heebo-SemiBold.ttf"),
    ("Heebo", 700, "normal", "Heebo-Bold.ttf"),
]


def _face(family: str, weight: int, style: str, ttf: str) -> str:
    return (
        f"@font-face{{font-family:'{family}';font-style:{style};font-weight:{weight};"
        f"font-display:block;"
        f"src:url('{data_uri(ASSETS / 'fonts' / ttf)}') format('truetype');}}"
    )


def build_fonts_css() -> str:
    """All @font-face rules with the TTFs inlined — drop into the doc's <style>."""
    return "\n".join(_face(*f) for f in _FACES)


FONTS_CSS = build_fonts_css()

# ----------------------------------------------------------------------------
# Logos — PNG. Naming is counterintuitive: WHITE = the white mark, for dark
# backgrounds; BLUE = the blue mark, for white backgrounds.
# ----------------------------------------------------------------------------

LOGO_WHITE = data_uri(ASSETS / "logos" / "GCS-Primary-White.png")
LOGO_BLUE = data_uri(ASSETS / "logos" / "GCS-Primary-Blue.png")
LOGO_WORDMARK_BLUE = data_uri(ASSETS / "logos" / "GCS-Secondary-Blue.png")
LOGO_WORDMARK_WHITE = data_uri(ASSETS / "logos" / "GCS-Secondary-White.png")

# ----------------------------------------------------------------------------
# Slide graphics
# ----------------------------------------------------------------------------

QUOTE_ICON_BLUE = data_uri(ASSETS / "images" / "quote-blue.png")    # Type 8
QUOTE_ICON_WHITE = data_uri(ASSETS / "images" / "quote-white.png")  # Type 9
CTA_BG = data_uri(ASSETS / "images" / "background-cta.png")         # Type 10, carousel
STORY_CTA_BG = CTA_BG   # story Type 10 uses the same image — alias, not a second copy
TRUSTPILOT_STARS = data_uri(ASSETS / "images" / "trustpilot-5stars.png")  # Type 11 star row
TRUSTPILOT_LOGO = data_uri(ASSETS / "images" / "logo-trustpilot.png")     # Type 11 footer lockup

# ----------------------------------------------------------------------------
# Icons are deliberately NOT handled here. Material Symbols are fetched with
# `curl` in Bash and pasted **inline** into the slide HTML as
# `<svg fill="currentColor">` — same treatment as the gcs-brochure skill. An
# icon is never an <img>, never a data URI, never a bundled file. See the
# "Icon images" section of references/rendering.md.
#
# Flags are the exception: they are photographic PNGs, so they stay <img> —
# and this is the one network-dependent helper in the pipeline.
# ----------------------------------------------------------------------------


def flag_uri(iso2: str) -> str:
    """Fetch a country flag PNG (1200×800) from msikma/country-flags as a data URI.

    iso2: ISO 3166-1 alpha-2, lowercase. The United Kingdom is 'uk' upstream,
    so 'gb' is mapped for you. Needs network. Missing micro-territories 404 —
    tell the user and show the country name without a flag rather than sourcing
    one elsewhere.
    """
    code = iso2.strip().lower()
    code = "uk" if code == "gb" else code
    url = f"https://raw.githubusercontent.com/msikma/country-flags/master/flags/png/{code}.png"
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            data = r.read()
    except urllib.error.HTTPError as e:
        raise MissingAsset(
            f"flag '{code}' returned HTTP {e.code} — that territory is not in the "
            f"upstream set. Show the country name without a flag."
        ) from e
    except OSError as e:
        raise MissingAsset(
            f"flag '{code}' needs network access and there is none ({e}). "
            f"Show the country name without a flag — never substitute another source."
        ) from e
    return f"data:image/png;base64,{base64.b64encode(data).decode()}"


# ----------------------------------------------------------------------------
# Self-check
# ----------------------------------------------------------------------------

_BUNDLED = [
    ("LOGO_WHITE", "LOGO_BLUE", "LOGO_WORDMARK_BLUE", "LOGO_WORDMARK_WHITE"),
    ("QUOTE_ICON_BLUE", "QUOTE_ICON_WHITE", "CTA_BG"),
    ("TRUSTPILOT_STARS", "TRUSTPILOT_LOGO"),
]


_MAGIC = {
    "image/png": (b"\x89PNG\r\n\x1a\n",),
    "font/ttf": (b"\x00\x01\x00\x00", b"true", b"ttcf", b"OTTO"),
}


def selfcheck() -> None:
    """Verify every bundled asset exists and decodes. Raises on the first problem."""
    for group in _BUNDLED:
        for name in group:
            uri = globals()[name]
            assert_valid_data_uri(name, uri)
            mime = uri[len("data:") : uri.index(";")]
            raw = base64.b64decode(uri.partition(",")[2], validate=True)
            magic = _MAGIC.get(mime)
            if magic and not raw.startswith(magic):
                raise ValueError(f"{name}: not a valid {mime} (starts {raw[:8]!r})")
            print(f"  ok  {name:<20} {len(uri) // 1024:>5} KB")
    for family, weight, style, ttf in _FACES:
        path = ASSETS / "fonts" / ttf
        if not path.is_file():
            raise FileNotFoundError(f"font missing: {path}")
        if f"font-weight:{weight}" not in FONTS_CSS or f"font-style:{style}" not in FONTS_CSS:
            raise ValueError(f"FONTS_CSS missing {family} {weight} {style}")
        print(f"  ok  {family} {weight} {style:<7} {ttf}")
    print(f"\nAll bundled assets present. FONTS_CSS is {len(FONTS_CSS) // 1024} KB.")
    print(f"SKILL_DIR = {SKILL_DIR}")


if __name__ == "__main__":
    selfcheck()
