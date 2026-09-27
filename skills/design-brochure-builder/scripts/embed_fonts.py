"""Embed real TrueType font data into a .pptx so it renders correctly in PowerPoint desktop.

Without this, Yrsa/Heebo are only referenced by name in the slide XML. Google Slides and
LibreOffice both silently substitute their own copies of these (they're Google Fonts),
which is why the deck looks right there — but PowerPoint desktop has none of them
installed and falls back to a default substitute font instead.

Adapted from skills/gcs-pptx/scripts/embed_fonts.py: FONT_FAMILIES here registers each
Heebo weight as its own family name (see comment above FONT_FAMILIES) because the
brochure content uses five Heebo weights, not just regular/bold.

Usage:
    python embed_fonts.py <deck.pptx> [--fonts-dir DIR] [--output OUT.pptx]

Examples:
    python embed_fonts.py output.pptx
    python embed_fonts.py output.pptx --output output-embedded.pptx
"""

import argparse
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

DEFAULT_FONTS_DIR = Path(__file__).resolve().parent.parent / "assets" / "fonts"

NS = {
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "ct": "http://schemas.openxmlformats.org/package/2006/content-types",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}
# NOTE: ET.register_namespace() is a single GLOBAL prefix->URI map — registering
# two different URIs to the same "" (default) prefix here (ct and rel both need
# to serialize unprefixed) means the second call silently wins and the first
# reverts to an auto-generated "ns0"/"ns1" prefix. That produced a `[Content_Types].xml`
# with every element under an "ns0:" prefix, which LibreOffice's importer rejects
# outright ("source file could not be loaded") even though the XML is still
# technically namespace-valid.
#
# `Element.write(..., default_namespace=...)` looks like the fix but isn't:
# CPython's serializer raises "cannot use non-qualified names with
# default_namespace option" the moment it meets a plain (unprefixed) ATTRIBUTE
# name — and every attribute in this format (Extension, ContentType, Id, ...)
# is unprefixed by design. So instead: register real, non-colliding prefixes
# globally for p/r/a, and re-register "" to whichever of ct/rel's URI is about
# to be serialized right before each individual write() call below.
ET.register_namespace("p", NS["p"])
ET.register_namespace("r", NS["r"])
ET.register_namespace("a", NS["a"])

FONT_RELATIONSHIP_TYPE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/font"
FONTDATA_CONTENT_TYPE = "application/x-fontdata"

# family -> style -> filename.
#
# OOXML's <p:embeddedFontLst> models at most regular/bold/italic/boldItalic
# per family name — it has no notion of a numeric weight axis. The brochure
# content uses Heebo at five distinct weights (Light/Regular/Medium/SemiBold/
# Bold), so each weight is registered here as its OWN family name (e.g.
# "Heebo Light") rather than as a style variant of "Heebo". scripts/tokens.js's
# FONTS map and every component's `fontFace` must reference these exact
# family names for the embed to actually apply — PowerPoint does not
# validate that the name matches an installed system family, it just uses
# whatever is embedded under that literal name.
FONT_FAMILIES = {
    "Heebo Light": {"regular": "Heebo-Light.ttf"},
    "Heebo": {"regular": "Heebo-Regular.ttf"},
    "Heebo Medium": {"regular": "Heebo-Medium.ttf"},
    "Heebo SemiBold": {"regular": "Heebo-SemiBold.ttf"},
    "Heebo Bold": {"regular": "Heebo-Bold.ttf"},
    "Yrsa": {
        "regular": "Yrsa-Regular.ttf",
        "italic": "Yrsa-Italic.ttf",
    },
}

# CT_Presentation child element order (ECMA-376), used to insert embeddedFontLst correctly.
PRESENTATION_CHILD_ORDER = [
    "sldMasterIdLst",
    "notesMasterIdLst",
    "handoutMasterIdLst",
    "sldIdLst",
    "sldSz",
    "notesSz",
    "smartTags",
    "embeddedFontLst",
    "custShowLst",
    "photoAlbum",
    "custDataLst",
    "kinsoku",
    "defaultTextStyle",
    "modifyVerifier",
    "extLst",
]


def embed_fonts(pptx_path: Path, fonts_dir: Path, output_path: Path) -> None:
    available = {}
    for family, styles in FONT_FAMILIES.items():
        found = {}
        for style, filename in styles.items():
            font_file = fonts_dir / filename
            if font_file.exists():
                found[style] = font_file
        if found:
            available[family] = found

    if not available:
        print(f"No bundled fonts found in {fonts_dir} — nothing to embed.", file=sys.stderr)
        sys.exit(1)

    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        with zipfile.ZipFile(pptx_path) as zf:
            zf.extractall(tmp_dir)

        content_types_path = tmp_dir / "[Content_Types].xml"
        presentation_path = tmp_dir / "ppt" / "presentation.xml"
        rels_path = tmp_dir / "ppt" / "_rels" / "presentation.xml.rels"
        fonts_out_dir = tmp_dir / "ppt" / "fonts"
        fonts_out_dir.mkdir(exist_ok=True)

        ct_tree = ET.parse(content_types_path)
        ct_root = ct_tree.getroot()
        has_fontdata_default = any(
            el.get("Extension") == "fntdata" for el in ct_root.findall("ct:Default", NS)
        )
        if not has_fontdata_default:
            default_el = ET.SubElement(ct_root, "{%s}Default" % NS["ct"])
            default_el.set("Extension", "fntdata")
            default_el.set("ContentType", FONTDATA_CONTENT_TYPE)

        rels_tree = ET.parse(rels_path)
        rels_root = rels_tree.getroot()
        existing_ids = {
            rel.get("Id") for rel in rels_root.findall("rel:Relationship", NS)
        }

        def next_rid():
            n = 1
            while f"rId{n}" in existing_ids:
                n += 1
            existing_ids.add(f"rId{n}")
            return f"rId{n}"

        presentation_tree = ET.parse(presentation_path)
        presentation_root = presentation_tree.getroot()

        embedded_font_lst = ET.Element("{%s}embeddedFontLst" % NS["p"])

        font_index = 1
        for family, styles in available.items():
            embedded_font = ET.SubElement(embedded_font_lst, "{%s}embeddedFont" % NS["p"])
            font_el = ET.SubElement(embedded_font, "{%s}font" % NS["p"])
            font_el.set("typeface", family)

            for style in ("regular", "bold", "italic", "boldItalic"):
                font_file = styles.get(style)
                if not font_file:
                    continue

                part_name = f"font{font_index}.fntdata"
                font_index += 1
                shutil.copy(font_file, fonts_out_dir / part_name)

                rid = next_rid()
                rel_el = ET.SubElement(rels_root, "{%s}Relationship" % NS["rel"])
                rel_el.set("Id", rid)
                rel_el.set("Type", FONT_RELATIONSHIP_TYPE)
                rel_el.set("Target", f"fonts/{part_name}")

                style_el = ET.SubElement(embedded_font, "{%s}%s" % (NS["p"], style))
                style_el.set("{%s}id" % NS["r"], rid)

        insert_index = 0
        target_pos = PRESENTATION_CHILD_ORDER.index("embeddedFontLst")
        for i, child in enumerate(presentation_root):
            tag = child.tag.split("}")[-1]
            if tag in PRESENTATION_CHILD_ORDER and PRESENTATION_CHILD_ORDER.index(tag) < target_pos:
                insert_index = i + 1
        presentation_root.insert(insert_index, embedded_font_lst)
        presentation_root.set("embedTrueTypeFonts", "1")

        ET.register_namespace("", NS["ct"])
        ct_tree.write(content_types_path, xml_declaration=True, encoding="UTF-8", default_namespace=None)
        ET.register_namespace("", NS["rel"])
        rels_tree.write(rels_path, xml_declaration=True, encoding="UTF-8", default_namespace=None)
        presentation_tree.write(presentation_path, xml_declaration=True, encoding="UTF-8", default_namespace=None)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for f in tmp_dir.rglob("*"):
                if f.is_file():
                    zf.write(f, f.relative_to(tmp_dir))

    families = ", ".join(available.keys())
    print(f"Embedded fonts ({families}) into {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Embed TrueType fonts into a .pptx for PowerPoint desktop compatibility")
    parser.add_argument("pptx", help="Path to the .pptx file to process")
    parser.add_argument("--fonts-dir", default=str(DEFAULT_FONTS_DIR), help="Directory containing font .ttf files")
    parser.add_argument("--output", help="Output path (default: overwrite input in place)")
    args = parser.parse_args()

    pptx_path = Path(args.pptx)
    if not pptx_path.exists():
        print(f"Error: {pptx_path} not found", file=sys.stderr)
        sys.exit(1)

    output_path = Path(args.output) if args.output else pptx_path
    embed_fonts(pptx_path, Path(args.fonts_dir), output_path)
