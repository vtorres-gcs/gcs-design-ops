---
name: design-docx
description: "Use whenever the user wants to create, read, edit, or manipulate Global Citizen Solutions (GCS) Word documents (.docx) — letters, memos, reports, contracts, or any GCS-branded deliverable. Triggers: 'Word doc', '.docx', 'GCS letter', 'letterhead', 'legal letter', or requests for reports/memos/letters/templates with TOCs, headings, page numbers, or letterheads. Also covers extracting/reorganizing .docx content, inserting/replacing images, find-and-replace, tracked changes, and comments. Applies GCS's brand (Night Blue, Yrsa/Heebo, blue logo) for general correspondence, or the conservative Legal variant (Times New Roman, black logo) for legal/compliance correspondence. Do NOT use for PDFs, spreadsheets, Google Docs, or unrelated coding tasks."
license: Proprietary. LICENSE.txt has complete terms
---

# GCS DOCX creation, editing, and analysis

## Overview

A .docx file is a ZIP archive containing XML files. This skill produces documents on Global Citizen Solutions' brand — see **GCS Branding** below before generating any new document; skip straight to **Quick Reference** for editing/reading existing files.

## GCS Branding

GCS documents ship in two variants. Pick based on the request; default to General when unspecified.

| | **General** (default) | **Legal** |
|---|---|---|
| Use for | Standard business correspondence, client letters, reports, memos | Legal/compliance correspondence, contracts, formal notices from the Legal team |
| Body font | Heebo (weights 300/400/500/600) | Times New Roman |
| Accent font | Yrsa (serif) — subject line, sender name | Times New Roman (no serif/sans mix) |
| Heading/accent colour | Night Blue `#000957` | Black `#000000` |
| Body text colour | `#343750` (paragraphs), `#252839` (salutation/closing) | `#000000` |
| Logo | `assets/logos/GCS-Primary-Blue.svg` (or `.png` for docx embedding) | `assets/logos/GCS-Primary-Black.svg` (or `.png`) |
| Footer | `GLOBALCITIZENSOLUTIONS.COM` in light grey `#C6C8D5`, small caps, letter-spaced | `GLOBALCITIZENSOLUTIONS.COM` in grey `#6F7185` |
| Tone | Warm, confident, precise — address the recipient directly ("you"/"your") | Neutral, precise, deliberately conservative — no warmth, no brand flourishes |

Both variants: UK English, Title Case headings, **no emoji, no exclamation marks**, sharp corners (no rounded rects/tables), A4 page size (GCS correspondence is Portugal-based — do not switch to US Letter for GCS documents).

The canonical visual reference for each variant lives in this skill at `references/letterhead-general/Letterhead.dc.html` and `references/letterhead-legal/LetterheadLegal.dc.html` — read these before building a letterhead to match spacing, field order, and copy tone exactly (fields: `date`, `recipientName`, `recipientTitle`, `recipientOrg`, `recipientAddress`, `subject`, `salutation`, `body1`/`body2`/`body3`, `closing`, `senderName`, `senderTitle`).

### Building a GCS letterhead as .docx

There is no pre-built `.docx`/`.dotx` letterhead file to clone — construct it with `docx-js` (see Creating New Documents below), reproducing the HTML reference's layout:

```javascript
const { Document, Packer, Paragraph, TextRun, ImageRun, Header, Footer,
        AlignmentType, BorderStyle, TabStopType, TabStopPosition, PageNumber } = require('docx');
const fs = require('fs');

const isLegal = false; // toggle per request

const brand = isLegal
  ? { font: 'Times New Roman', accentFont: 'Times New Roman', ink: '000000', accent: '000000',
      logo: 'assets/logos/GCS-Primary-Black.png', footerColor: '6F7185' }
  : { font: 'Heebo', accentFont: 'Yrsa', ink: '343750', accent: '000957',
      logo: 'assets/logos/GCS-Primary-Blue.png', footerColor: 'C6C8D5' };

const doc = new Document({
  sections: [{
    properties: {
      page: { size: { width: 11906, height: 16838 }, // A4 in DXA
        // CRITICAL: top margin must clear the header's own content (logo + divider) plus a
        // visible gap, or body text collides with the header rule. Word does NOT auto-push
        // body content below an oversized header — the body always starts at `margin.top`.
        // 45mm top margin (GCS letterhead spec) = 45 * 56.6929 DXA/mm ≈ 2551 DXA
        margin: { top: 2551, right: 1350, bottom: 1440, left: 1350, header: 720, footer: 720 } },
    },
    headers: {
      default: new Header({ children: [
        new Paragraph({ children: [
          new ImageRun({ type: 'png', data: fs.readFileSync(brand.logo),
            transformation: { width: 139, height: 50 },
            altText: { title: 'GCS', description: 'Global Citizen Solutions logo', name: 'GCS logo' } }),
        ] }),
        new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E0E2EA', space: 4 } }, children: [] }),
      ] }),
    },
    footers: {
      default: new Footer({ children: [
        new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'E0E2EA', space: 4 } }, children: [] }),
        new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: 'GLOBALCITIZENSOLUTIONS.COM', font: brand.font, size: 20, color: brand.footerColor }),
            new TextRun({ text: '\t' }),
            new TextRun({ children: [PageNumber.CURRENT], font: brand.font, size: 20, color: brand.footerColor }),
          ],
        }),
      ] }),
    },
    children: [
      new Paragraph({ spacing: { after: 320 }, children: [
        new TextRun({ text: '{{ date }}', font: brand.font, size: 22, color: '6F7185' }) ] }),
      new Paragraph({ children: [new TextRun({ text: '{{ recipientName }}', font: brand.font, size: 22, bold: isLegal, color: brand.ink })] }),
      new Paragraph({ children: [new TextRun({ text: '{{ recipientTitle }}', font: brand.font, size: 22, color: brand.ink })] }),
      new Paragraph({ children: [new TextRun({ text: '{{ recipientOrg }}', font: brand.font, size: 22, color: brand.ink })] }),
      new Paragraph({ spacing: { after: 320 }, children: [new TextRun({ text: '{{ recipientAddress }}', font: brand.font, size: 22, color: brand.ink })] }),
      new Paragraph({ spacing: { after: 320 }, children: [
        new TextRun({ text: 'RE: ', font: brand.font, size: 22, bold: true, color: brand.accent }),
        new TextRun({ text: '{{ subject }}', font: brand.accentFont, size: 24, bold: isLegal, italics: !isLegal, color: brand.ink }),
      ] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'Dear {{ salutation }},', font: brand.font, size: 22, color: '252839' })] }),
      new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 200 }, children: [new TextRun({ text: '{{ body1 }}', font: brand.font, size: 22, color: brand.ink })] }),
      new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 200 }, children: [new TextRun({ text: '{{ body2 }}', font: brand.font, size: 22, color: brand.ink })] }),
      new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 400 }, children: [new TextRun({ text: '{{ body3 }}', font: brand.font, size: 22, color: brand.ink })] }),
      new Paragraph({ spacing: { after: 520 }, children: [new TextRun({ text: '{{ closing }},', font: brand.font, size: 22, color: '252839' })] }),
      new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E0E2EA', space: 1 } }, spacing: { after: 140 }, children: [] }),
      new Paragraph({ children: [new TextRun({ text: '{{ senderName }}', font: brand.accentFont, size: 24, bold: isLegal, color: brand.ink })] }),
      new Paragraph({ children: [new TextRun({ text: '{{ senderTitle }}', font: brand.font, size: 22, color: '6F7185' })] }),
      new Paragraph({ children: [new TextRun({ text: 'Global Citizen Solutions', font: brand.font, size: 22, color: brand.accent })] }),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => fs.writeFileSync('letter.docx', buffer));
```

Replace every `{{ placeholder }}` with real content before writing the file — never ship a document with template placeholders still in it. Export the reference `.svg` logos to `.png` first if they haven't been rasterised (docx-js `ImageRun` doesn't support SVG); reuse the exported PNG across a session instead of re-exporting per document.

For any non-letterhead GCS document (report, memo, brief) that doesn't need the full header/footer treatment, still apply the brand's type and colour rules from the table above via the `styles.default`/`paragraphStyles` override shown in **Styles (Override Built-in Headings)** below — that example is already GCS-branded (Yrsa headings, Heebo body, Night Blue heading colour, regular weight), so use it as-is rather than starting from a generic Arial override.

---

## Quick Reference

| Task | Approach |
|------|----------|
| Read/analyze content | `pandoc` or unpack for raw XML |
| Create new document | Use `docx-js` - see Creating New Documents below |
| Edit existing document | Unpack → edit XML → repack - see Editing Existing Documents below |

### Converting .doc to .docx

Legacy `.doc` files must be converted before editing:

```bash
python scripts/office/soffice.py --headless --convert-to docx document.doc
```

### Reading Content

```bash
# Text extraction with tracked changes
pandoc --track-changes=all document.docx -o output.md

# Raw XML access
python scripts/office/unpack.py document.docx unpacked/
```

### Converting to Images

```bash
python scripts/office/soffice.py --headless --convert-to pdf document.docx
pdftoppm -jpeg -r 150 document.pdf page
```

### Accepting Tracked Changes

To produce a clean document with all tracked changes accepted (requires LibreOffice):

```bash
python scripts/accept_changes.py input.docx output.docx
```

---

## Creating New Documents

Generate .docx files with JavaScript, then validate. Install: `npm install -g docx`

### Setup
```javascript
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
        Header, Footer, AlignmentType, PageOrientation, LevelFormat, ExternalHyperlink,
        InternalHyperlink, Bookmark, FootnoteReferenceRun, PositionalTab,
        PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader,
        TabStopType, TabStopPosition, Column, SectionType,
        TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
        VerticalAlign, PageNumber, PageBreak } = require('docx');

const doc = new Document({ sections: [{ children: [/* content */] }] });
Packer.toBuffer(doc).then(buffer => fs.writeFileSync("doc.docx", buffer));
```

### Validation
After creating the file, validate it. If validation fails, unpack, fix the XML, and repack.
```bash
python scripts/office/validate.py doc.docx
```

### Page Size

```javascript
// CRITICAL: docx-js defaults to A4, not US Letter
// Always set page size explicitly for consistent results
sections: [{
  properties: {
    page: {
      size: {
        width: 12240,   // 8.5 inches in DXA
        height: 15840   // 11 inches in DXA
      },
      margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch margins
    }
  },
  children: [/* content */]
}]
```

**Common page sizes (DXA units, 1440 DXA = 1 inch):**

| Paper | Width | Height | Content Width (1" margins) |
|-------|-------|--------|---------------------------|
| US Letter | 12,240 | 15,840 | 9,360 |
| A4 (default) | 11,906 | 16,838 | 9,026 |

**Landscape orientation:** docx-js swaps width/height internally, so pass portrait dimensions and let it handle the swap:
```javascript
size: {
  width: 12240,   // Pass SHORT edge as width
  height: 15840,  // Pass LONG edge as height
  orientation: PageOrientation.LANDSCAPE  // docx-js swaps them in the XML
},
// Content width = 15840 - left margin - right margin (uses the long edge)
```

### Styles (Override Built-in Headings)

For GCS documents use Yrsa (headings) / Heebo (body), Night Blue `000957` for heading colour, regular weight — **never bold** (see `tokens/typography.css`: `.text-h1`/`.text-h2` are `font-weight: 400`; Yrsa is never bold anywhere in the design system).

**CRITICAL for Google Docs compatibility:** override every heading level actually used in the document, plus the document default (`Normal`), not just `Heading1`/`Heading2`. Any style slot left undefined falls back to Google Docs' own generic built-in preview/formatting when the file is opened in Google Drive (shows up as Google's default blue headings / grey italic subtitle instead of the GCS brand) — this is the #1 cause of "styles don't apply when opened in Google Drive".

```javascript
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Heebo", size: 22, color: "343750" } } }, // Normal: 11pt Heebo body
    paragraphStyles: [
      // IMPORTANT: Use exact IDs to override built-in styles — cover every level used, not just H1/H2
      { id: "Title", name: "Title", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 48, bold: false, font: "Yrsa", color: "000957" },
        paragraph: { spacing: { before: 0, after: 240 } } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: false, font: "Yrsa", color: "000957" },
        paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 } }, // outlineLevel required for TOC
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: false, font: "Yrsa", color: "000957" },
        paragraph: { spacing: { before: 180, after: 180 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: false, font: "Yrsa", color: "000957" },
        paragraph: { spacing: { before: 160, after: 160 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    children: [
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Title")] }),
    ]
  }]
});
```

### Lists (NEVER use unicode bullets)

```javascript
// ❌ WRONG - never manually insert bullet characters
new Paragraph({ children: [new TextRun("• Item")] })  // BAD
new Paragraph({ children: [new TextRun("\u2022 Item")] })  // BAD

// ✅ CORRECT - use numbering config with LevelFormat.BULLET
const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    children: [
      new Paragraph({ numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Bullet item")] }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Numbered item")] }),
    ]
  }]
});

// ⚠️ Each reference creates INDEPENDENT numbering
// Same reference = continues (1,2,3 then 4,5,6)
// Different reference = restarts (1,2,3 then 1,2,3)
```

### Tables

**CRITICAL: Tables need dual widths** - set both `columnWidths` on the table AND `width` on each cell. Without both, tables render incorrectly on some platforms.

```javascript
// CRITICAL: Always set table width for consistent rendering
// CRITICAL: Use ShadingType.CLEAR (not SOLID) to prevent black backgrounds
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

new Table({
  width: { size: 9360, type: WidthType.DXA }, // Always use DXA (percentages break in Google Docs)
  columnWidths: [4680, 4680], // Must sum to table width (DXA: 1440 = 1 inch)
  rows: [
    new TableRow({
      children: [
        new TableCell({
          borders,
          width: { size: 4680, type: WidthType.DXA }, // Also set on each cell
          shading: { fill: "D5E8F0", type: ShadingType.CLEAR }, // CLEAR not SOLID
          margins: { top: 80, bottom: 80, left: 120, right: 120 }, // Cell padding (internal, not added to width)
          children: [new Paragraph({ children: [new TextRun("Cell")] })]
        })
      ]
    })
  ]
})
```

**Table width calculation:**

Always use `WidthType.DXA` — `WidthType.PERCENTAGE` breaks in Google Docs.

**CRITICAL: derive the width from THIS section's own `page.size`/`page.margin` values — never copy a constant from a different page-size/margin example.** That mismatch (e.g. reusing a US Letter constant on an A4 document) is why tables fall short of, or overflow past, the true page width.

```
content width (DXA) = page.size.width − page.margin.left − page.margin.right
```

Worked numbers for the page setups used in this skill:

| Setup | Page width | Left margin | Right margin | Content width |
|---|---|---|---|---|
| A4, 1" margins | 11906 | 1440 | 1440 | **9026** |
| GCS letterhead margins | 11906 | 1350 | 1350 | **9206** |
| US Letter, 1" margins | 12240 | 1440 | 1440 | 9360 |

```javascript
// GCS documents are A4 (see GCS Branding above) — use the A4 content width, not the US Letter one
width: { size: 9026, type: WidthType.DXA }, // full page width, 1" A4 margins
columnWidths: [4513, 4513]  // must sum to table width
```

**Width rules:**
- **Always use `WidthType.DXA`** — never `WidthType.PERCENTAGE` (incompatible with Google Docs)
- Table `width`/`columnWidths` must be computed from *this document's* actual margins, not a hard-coded constant
- Table width must equal the sum of `columnWidths`
- Cell `width` must match corresponding `columnWidth`
- Cell `margins` are internal padding - they reduce content area, not add to cell width
- For full-width tables: use the computed content width (page width minus left and right margins) as the table width

### Images

```javascript
// CRITICAL: type parameter is REQUIRED
new Paragraph({
  children: [new ImageRun({
    type: "png", // Required: png, jpg, jpeg, gif, bmp, svg
    data: fs.readFileSync("image.png"),
    transformation: { width: 200, height: 150 },
    altText: { title: "Title", description: "Desc", name: "Name" } // All three required
  })]
})
```

### Icons

Icons aren't currently used in this skill's templates (the letterhead
references have none). If a document needs one — an icon-led callout or
list item, say — the source is Material Symbols only, same as
`gcs-social-media`/`gcs-brochure`.

Because `docx-js`'s `ImageRun` doesn't support SVG (the same constraint
already noted above for logos — "Export the reference `.svg` logos to
`.png` first if they haven't been rasterised"), an icon must be rasterized
to PNG with its intended fill colour baked in before embedding — never
point `ImageRun` at a raw `.svg` file, it silently fails or breaks. This
skill doesn't ship its own rasterization script (`scripts/` has no
`cairosvg`/`svg2png` helper); its committed logo PNGs in `assets/logos/`
were rasterized once, out of band, and checked in alongside their source
`.svg`. Follow the same fetch-then-rasterize pattern `gcs-pptx` and
`gcs-brochure-builder` use for their own icons:

```bash
curl -sL "https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/<icon_name>/materialsymbolsoutlined/<icon_name>_24px.svg" -o <icon_name>.svg
python3 -c "import cairosvg; cairosvg.svg2png(url='<icon_name>.svg', write_to='<icon_name>.png', output_width=24, output_height=24)"
```

Recolor the fill (edit the `<svg fill="...">` attribute, or pass a
solid-color background) to match the ink colour it sits next to before
rasterizing — a raw black-on-transparent icon next to Night Blue or
Heebo body text will look wrong once embedded. Reuse the exported PNG
across a session instead of re-exporting per document.

Never Font Awesome, Heroicons, Feather, Lucide, or emoji — Material
Symbols only, even for a one-off icon.

### Page Breaks

```javascript
// CRITICAL: PageBreak must be inside a Paragraph
new Paragraph({ children: [new PageBreak()] })

// Or use pageBreakBefore
new Paragraph({ pageBreakBefore: true, children: [new TextRun("New page")] })
```

### Hyperlinks

```javascript
// External link
new Paragraph({
  children: [new ExternalHyperlink({
    children: [new TextRun({ text: "Click here", style: "Hyperlink" })],
    link: "https://example.com",
  })]
})

// Internal link (bookmark + reference)
// 1. Create bookmark at destination
new Paragraph({ heading: HeadingLevel.HEADING_1, children: [
  new Bookmark({ id: "chapter1", children: [new TextRun("Chapter 1")] }),
]})
// 2. Link to it
new Paragraph({ children: [new InternalHyperlink({
  children: [new TextRun({ text: "See Chapter 1", style: "Hyperlink" })],
  anchor: "chapter1",
})]})
```

### Footnotes

```javascript
const doc = new Document({
  footnotes: {
    1: { children: [new Paragraph("Source: Annual Report 2024")] },
    2: { children: [new Paragraph("See appendix for methodology")] },
  },
  sections: [{
    children: [new Paragraph({
      children: [
        new TextRun("Revenue grew 15%"),
        new FootnoteReferenceRun(1),
        new TextRun(" using adjusted metrics"),
        new FootnoteReferenceRun(2),
      ],
    })]
  }]
});
```

### Tab Stops

```javascript
// Right-align text on same line (e.g., date opposite a title)
new Paragraph({
  children: [
    new TextRun("Company Name"),
    new TextRun("\tJanuary 2025"),
  ],
  tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
})

// Dot leader (e.g., TOC-style)
new Paragraph({
  children: [
    new TextRun("Introduction"),
    new TextRun({ children: [
      new PositionalTab({
        alignment: PositionalTabAlignment.RIGHT,
        relativeTo: PositionalTabRelativeTo.MARGIN,
        leader: PositionalTabLeader.DOT,
      }),
      "3",
    ]}),
  ],
})
```

### Multi-Column Layouts

```javascript
// Equal-width columns
sections: [{
  properties: {
    column: {
      count: 2,          // number of columns
      space: 720,        // gap between columns in DXA (720 = 0.5 inch)
      equalWidth: true,
      separate: true,    // vertical line between columns
    },
  },
  children: [/* content flows naturally across columns */]
}]

// Custom-width columns (equalWidth must be false)
sections: [{
  properties: {
    column: {
      equalWidth: false,
      children: [
        new Column({ width: 5400, space: 720 }),
        new Column({ width: 3240 }),
      ],
    },
  },
  children: [/* content */]
}]
```

Force a column break with a new section using `type: SectionType.NEXT_COLUMN`.

### Table of Contents

```javascript
// CRITICAL: Headings must use HeadingLevel ONLY - no custom styles
new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" })
```

### Headers/Footers

```javascript
sections: [{
  properties: {
    page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } // 1440 = 1 inch
  },
  headers: {
    default: new Header({ children: [new Paragraph({ children: [new TextRun("Header")] })] })
  },
  footers: {
    default: new Footer({ children: [new Paragraph({
      children: [new TextRun("Page "), new TextRun({ children: [PageNumber.CURRENT] })]
    })] })
  },
  children: [/* content */]
}]
```

**Combining label text with a page number (e.g. a site domain + page number):** never concatenate them directly — that produces run-together text like `GLOBALCITIZENSOLUTIONS.COM4`. Always use a right-aligned tab stop instead:

```javascript
footers: {
  default: new Footer({ children: [new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children: [
      new TextRun("Label Text"),
      new TextRun({ text: '\t' }),
      new TextRun({ children: [PageNumber.CURRENT] }),
    ],
  })] })
},
```

### Critical Rules for docx-js

- **Set page size explicitly** - docx-js defaults to A4; use US Letter (12240 x 15840 DXA) for US documents
- **Landscape: pass portrait dimensions** - docx-js swaps width/height internally; pass short edge as `width`, long edge as `height`, and set `orientation: PageOrientation.LANDSCAPE`
- **Never use `\n`** - use separate Paragraph elements
- **Never use unicode bullets** - use `LevelFormat.BULLET` with numbering config
- **PageBreak must be in Paragraph** - standalone creates invalid XML
- **ImageRun requires `type`** - always specify png/jpg/etc
- **Always set table `width` with DXA** - never use `WidthType.PERCENTAGE` (breaks in Google Docs)
- **Tables need dual widths** - `columnWidths` array AND cell `width`, both must match
- **Table width = sum of columnWidths** - for DXA, ensure they add up exactly, and derive both from *this section's* actual `page.size`/`page.margin` (see Table width calculation) - never reuse a constant from a different page-size/margin example
- **Always add cell margins** - use `margins: { top: 80, bottom: 80, left: 120, right: 120 }` for readable padding
- **Use `ShadingType.CLEAR`** - never SOLID for table shading
- **Never use tables as dividers/rules** - cells have minimum height and render as empty boxes (including in headers/footers); use `border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6", space: 1 } }` on a Paragraph instead. For two-column footers, use tab stops (see Tab Stops section), not tables
- **Never concatenate label text and a page number** - e.g. a footer domain + page number; always separate them with a `'\t'` run and a right-aligned `tabStops` entry (`TabStopType.RIGHT` at `TabStopPosition.MAX`), or they render running together
- **TOC requires HeadingLevel only** - no custom styles on heading paragraphs
- **Override built-in styles for every level used, plus Normal** - use exact IDs: "Title", "Heading1", "Heading2", "Heading3", etc. Any level left undefined falls back to Google Docs' generic default formatting when opened in Google Drive
- **GCS headings are never bold** - Yrsa headings are regular weight (`font-weight: 400` in `tokens/typography.css`); set `bold: false` on heading styles, not `bold: true`
- **`margin.top`/`margin.bottom` must clear header/footer content** - Word does not auto-expand margins to fit a tall header or footer; body text starts exactly at `margin.top` regardless of header height. With a logo or multi-line header, size `margin.top` ≥ `header` distance + actual header content height + a visible gap (same logic for `margin.bottom` vs footer), or the body will visually collide with the header/footer rule
- **Include `outlineLevel`** - required for TOC (0 for H1, 1 for H2, etc.)

---

## Editing Existing Documents

**Follow all 3 steps in order.**

### Step 1: Unpack
```bash
python scripts/office/unpack.py document.docx unpacked/
```
Extracts XML, pretty-prints, merges adjacent runs, and converts smart quotes to XML entities (`&#x201C;` etc.) so they survive editing. Use `--merge-runs false` to skip run merging.

### Step 2: Edit XML

Edit files in `unpacked/word/`. See XML Reference below for patterns.

**Use "Claude" as the author** for tracked changes and comments, unless the user explicitly requests use of a different name.

**Use the Edit tool directly for string replacement. Do not write Python scripts.** Scripts introduce unnecessary complexity. The Edit tool shows exactly what is being replaced.

**CRITICAL: Use smart quotes for new content.** When adding text with apostrophes or quotes, use XML entities to produce smart quotes:
```xml
<!-- Use these entities for professional typography -->
<w:t>Here&#x2019;s a quote: &#x201C;Hello&#x201D;</w:t>
```
| Entity | Character |
|--------|-----------|
| `&#x2018;` | ‘ (left single) |
| `&#x2019;` | ’ (right single / apostrophe) |
| `&#x201C;` | “ (left double) |
| `&#x201D;` | ” (right double) |

**Adding comments:** Use `comment.py` to handle boilerplate across multiple XML files (text must be pre-escaped XML):
```bash
python scripts/comment.py unpacked/ 0 "Comment text with &amp; and &#x2019;"
python scripts/comment.py unpacked/ 1 "Reply text" --parent 0  # reply to comment 0
python scripts/comment.py unpacked/ 0 "Text" --author "Custom Author"  # custom author name
```
Then add markers to document.xml (see Comments in XML Reference).

### Step 3: Pack
```bash
python scripts/office/pack.py unpacked/ output.docx --original document.docx
```
Validates with auto-repair, condenses XML, and creates DOCX. Use `--validate false` to skip.

**Auto-repair will fix:**
- `durableId` >= 0x7FFFFFFF (regenerates valid ID)
- Missing `xml:space="preserve"` on `<w:t>` with whitespace

**Auto-repair won't fix:**
- Malformed XML, invalid element nesting, missing relationships, schema violations

### Common Pitfalls

- **Replace entire `<w:r>` elements**: When adding tracked changes, replace the whole `<w:r>...</w:r>` block with `<w:del>...<w:ins>...` as siblings. Don't inject tracked change tags inside a run.
- **Preserve `<w:rPr>` formatting**: Copy the original run's `<w:rPr>` block into your tracked change runs to maintain bold, font size, etc.

---

## XML Reference

### Schema Compliance

- **Element order in `<w:pPr>`**: `<w:pStyle>`, `<w:numPr>`, `<w:spacing>`, `<w:ind>`, `<w:jc>`, `<w:rPr>` last
- **Whitespace**: Add `xml:space="preserve"` to `<w:t>` with leading/trailing spaces
- **RSIDs**: Must be 8-digit hex (e.g., `00AB1234`)

### Tracked Changes

**Insertion:**
```xml
<w:ins w:id="1" w:author="Claude" w:date="2025-01-01T00:00:00Z">
  <w:r><w:t>inserted text</w:t></w:r>
</w:ins>
```

**Deletion:**
```xml
<w:del w:id="2" w:author="Claude" w:date="2025-01-01T00:00:00Z">
  <w:r><w:delText>deleted text</w:delText></w:r>
</w:del>
```

**Inside `<w:del>`**: Use `<w:delText>` instead of `<w:t>`, and `<w:delInstrText>` instead of `<w:instrText>`.

**Minimal edits** - only mark what changes:
```xml
<!-- Change "30 days" to "60 days" -->
<w:r><w:t>The term is </w:t></w:r>
<w:del w:id="1" w:author="Claude" w:date="...">
  <w:r><w:delText>30</w:delText></w:r>
</w:del>
<w:ins w:id="2" w:author="Claude" w:date="...">
  <w:r><w:t>60</w:t></w:r>
</w:ins>
<w:r><w:t> days.</w:t></w:r>
```

**Deleting entire paragraphs/list items** - when removing ALL content from a paragraph, also mark the paragraph mark as deleted so it merges with the next paragraph. Add `<w:del/>` inside `<w:pPr><w:rPr>`:
```xml
<w:p>
  <w:pPr>
    <w:numPr>...</w:numPr>  <!-- list numbering if present -->
    <w:rPr>
      <w:del w:id="1" w:author="Claude" w:date="2025-01-01T00:00:00Z"/>
    </w:rPr>
  </w:pPr>
  <w:del w:id="2" w:author="Claude" w:date="2025-01-01T00:00:00Z">
    <w:r><w:delText>Entire paragraph content being deleted...</w:delText></w:r>
  </w:del>
</w:p>
```
Without the `<w:del/>` in `<w:pPr><w:rPr>`, accepting changes leaves an empty paragraph/list item.

**Rejecting another author's insertion** - nest deletion inside their insertion:
```xml
<w:ins w:author="Jane" w:id="5">
  <w:del w:author="Claude" w:id="10">
    <w:r><w:delText>their inserted text</w:delText></w:r>
  </w:del>
</w:ins>
```

**Restoring another author's deletion** - add insertion after (don't modify their deletion):
```xml
<w:del w:author="Jane" w:id="5">
  <w:r><w:delText>deleted text</w:delText></w:r>
</w:del>
<w:ins w:author="Claude" w:id="10">
  <w:r><w:t>deleted text</w:t></w:r>
</w:ins>
```

### Comments

After running `comment.py` (see Step 2), add markers to document.xml. For replies, use `--parent` flag and nest markers inside the parent's.

**CRITICAL: `<w:commentRangeStart>` and `<w:commentRangeEnd>` are siblings of `<w:r>`, never inside `<w:r>`.**

```xml
<!-- Comment markers are direct children of w:p, never inside w:r -->
<w:commentRangeStart w:id="0"/>
<w:del w:id="1" w:author="Claude" w:date="2025-01-01T00:00:00Z">
  <w:r><w:delText>deleted</w:delText></w:r>
</w:del>
<w:r><w:t> more text</w:t></w:r>
<w:commentRangeEnd w:id="0"/>
<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="0"/></w:r>

<!-- Comment 0 with reply 1 nested inside -->
<w:commentRangeStart w:id="0"/>
  <w:commentRangeStart w:id="1"/>
  <w:r><w:t>text</w:t></w:r>
  <w:commentRangeEnd w:id="1"/>
<w:commentRangeEnd w:id="0"/>
<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="0"/></w:r>
<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="1"/></w:r>
```

### Images

1. Add image file to `word/media/`
2. Add relationship to `word/_rels/document.xml.rels`:
```xml
<Relationship Id="rId5" Type=".../image" Target="media/image1.png"/>
```
3. Add content type to `[Content_Types].xml`:
```xml
<Default Extension="png" ContentType="image/png"/>
```
4. Reference in document.xml:
```xml
<w:drawing>
  <wp:inline>
    <wp:extent cx="914400" cy="914400"/>  <!-- EMUs: 914400 = 1 inch -->
    <a:graphic>
      <a:graphicData uri=".../picture">
        <pic:pic>
          <pic:blipFill><a:blip r:embed="rId5"/></pic:blipFill>
        </pic:pic>
      </a:graphicData>
    </a:graphic>
  </wp:inline>
</w:drawing>
```

---

## Dependencies

- **pandoc**: Text extraction
- **docx**: `npm install -g docx` (new documents)
- **LibreOffice**: PDF conversion (auto-configured for sandboxed environments via `scripts/office/soffice.py`)
- **Poppler**: `pdftoppm` for images
- **Python 3.10+**: required by `scripts/office/validate.py` (uses `match` statements) — check with `python3 -V` before running it; on macOS with an older system Python, install via `brew install python@3.12` and use that interpreter explicitly (e.g. `/usr/local/bin/python3.12`) rather than relying on `python3` resolving to it
- **defusedxml, lxml**: required by `scripts/office/validators/` — install with `pip install defusedxml lxml` into a venv (`python3.12 -m venv venv && ./venv/bin/pip install defusedxml lxml`) if the system Python blocks global installs (PEP 668 `externally-managed-environment` error)
