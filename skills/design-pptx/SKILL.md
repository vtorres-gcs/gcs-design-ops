---
name: design-pptx
description: "Use this skill any time a GCS-branded .pptx file is involved — as input, output, or both. This includes: creating GCS pitch decks, investor decks, or presentations that need to be a real editable PowerPoint file; reading, parsing, or extracting text from any GCS .pptx file; editing, modifying, or updating existing GCS presentations; combining or splitting slide files; working with templates, layouts, speaker notes, or comments. Trigger whenever the user mentions a GCS \"deck,\" \"slides,\" \"presentation,\" \"PowerPoint,\" or references a .pptx filename in a Global Citizen Solutions context. If the deliverable must be a real, editable .pptx file, use this skill — for a browser-navigable HTML deck (arrow-key navigation, PNG/PDF export) use the `templates/slides/` template instead."
license: Proprietary. LICENSE.txt has complete terms
---

# GCS PPTX Skill

Self-contained skill for GCS-branded PowerPoint production. All brand specs are sourced from `references/slides/Slides.dc.html` and its `*.card.html` companions (bundled copies of the repo's `templates/slides/` — if those change, re-sync this folder too).

### 4 Base Layouts

Every GCS deck is built from these four foundational archetypes — every deck must include all four, in this role:

| Layout | Archetype | Role |
|---|---|---|
| **Capa** | [#1 Title](#1-title) | First slide — full-bleed dark wave background, bottom-anchored title block |
| **Abertura** | [#13 Section Intro](#13-section-intro) | Section divider — dark gradient, centred kicker + title |
| **Conteúdo base** | [#2 Content](#2-content) + Zone system | Slides 3–N — shared chrome (`addContentChrome()`) with Zona A/B composed from the component library |
| **Closing** | [#12 Closing](#12-closing--global-presence) | Last slide, always — fixed boilerplate, immutable |

The remaining archetypes (Image Content, Charts, Table, Agenda, Steps, Stats, Timeline, Schedule, Quote, Hero Stat, Comparison) are optional specializations of the Content base — reach for them when the content calls for it, but every deck's spine is Capa → (Abertura ×N) → Conteúdo base ×N → Closing.

---

## Reading Content

```bash
# Text extraction
python -m markitdown presentation.pptx

# Visual overview (template analysis only — for QA use soffice+pdftoppm)
python scripts/thumbnail.py presentation.pptx

# Raw XML
python scripts/office/unpack.py presentation.pptx unpacked/
```

---

## Editing Workflow

### Template-Based Workflow

When using an existing presentation as a template:

1. **Analyze existing slides**:
   ```bash
   python scripts/thumbnail.py template.pptx
   python -m markitdown template.pptx
   ```
   Review `thumbnails.jpg` to see layouts, and markitdown output to see placeholder text.

2. **Plan slide mapping**: For each content section, choose a template slide.

   ⚠️ **USE VARIED LAYOUTS** — monotonous presentations are a common failure mode. Don't default to basic title + bullet slides. Actively seek out:
   - Multi-column layouts (2-column, 3-column)
   - Image + text combinations
   - Full-bleed images with text overlay
   - Quote or callout slides
   - Stat/number callouts
   - Icon grids or icon + text rows

   **Avoid:** Repeating the same text-heavy layout for every slide.

   Match content type to layout style (e.g. key points → content slide, team info → agenda, testimonials → quote slide, milestones → timeline slide).

   **Item count → archetype guide:**

   | Items to show | Recommended archetype |
   |---|---|
   | 2–3 items with a photo context | Agenda (icon list left + photo column right) |
   | 4–6 short items, no photo | Steps (3-column card grid) or a 2-column icon grid |
   | 6+ items or tabular data | Table archetype; or split across two slides |

   **Never truncate content into a trailing "Also mapped:" or "Other:" paragraph** — that is a layout failure, not an editorial summary. If the content doesn't fit the archetype, pick a different archetype or add a second slide.

3. **Unpack**: `python scripts/office/unpack.py template.pptx unpacked/`

4. **Build presentation** (do this yourself, not with subagents):
   - Delete unwanted slides (remove from `<p:sldIdLst>`)
   - Duplicate slides you want to reuse (`add_slide.py`)
   - Reorder slides in `<p:sldIdLst>`
   - **Complete all structural changes before step 5**

5. **Edit content**: Update text in each `slide{N}.xml`.
   **Use subagents here if available** — slides are separate XML files, so subagents can edit in parallel.

6. **Clean**: `python scripts/clean.py unpacked/`

7. **Pack**: `python scripts/office/pack.py unpacked/ output.pptx --original template.pptx`

8. **Embed fonts (mandatory)**: `python scripts/embed_fonts.py output.pptx` — see [Embedding Fonts](#embedding-fonts). Without this, the deck opens with wrong fonts in PowerPoint desktop even though it looks correct in Google Slides and in this skill's own LibreOffice-based QA.

### Scripts

| Script | Purpose |
|--------|---------|
| `scripts/office/unpack.py` | Extract and pretty-print PPTX |
| `scripts/add_slide.py` | Duplicate slide or create from layout |
| `scripts/clean.py` | Remove orphaned files |
| `scripts/office/pack.py` | Repack with validation |
| `scripts/thumbnail.py` | Create visual grid of slides |

```bash
# Unpack
python scripts/office/unpack.py input.pptx unpacked/

# Duplicate a slide
python scripts/add_slide.py unpacked/ slide2.xml      # Duplicate slide
python scripts/add_slide.py unpacked/ slideLayout2.xml # From layout

# Clean
python scripts/clean.py unpacked/

# Pack
python scripts/office/pack.py unpacked/ output.pptx --original input.pptx

# Thumbnail grid
python scripts/thumbnail.py input.pptx [output_prefix] [--cols N]
```

### Slide Operations

Slide order is in `ppt/presentation.xml` → `<p:sldIdLst>`.

**Reorder**: Rearrange `<p:sldId>` elements.

**Delete**: Remove `<p:sldId>`, then run `clean.py`.

**Add**: Use `add_slide.py`. Never manually copy slide files — the script handles notes references, Content_Types.xml, and relationship IDs.

### Editing Content

**Use subagents after completing structural changes (step 4).** Each slide is a separate XML file — subagents can edit in parallel. In subagent prompt, include:
- The slide file path(s) to edit
- **"Use the Edit tool for all changes"**
- The formatting rules and pitfalls below

For each slide:
1. Read the slide's XML
2. Identify ALL placeholder content — text, images, charts, icons, captions
3. Replace each placeholder with final content

**Use the Edit tool, not sed or Python scripts.**

### Formatting Rules

- **Bold all headers, subheadings, and inline labels**: Use `b="1"` on `<a:rPr>`. This includes section headers, inline labels like "Status:", "Description:". **Exception: Yrsa runs must never carry `b="1"`** — Yrsa 400/500 are weight tokens, not bold. Synthetic bold distorts the typeface and is a QA failure. Only Heebo and JetBrains Mono runs may use `b="1"`.
- **Never use unicode bullets (•)**: Use proper list formatting with `<a:buChar>` or `<a:buAutoNum>`.
- **Bullet consistency**: Let bullets inherit from the layout. Only specify `<a:buChar>` or `<a:buNone>`.

### Common Editing Pitfalls

**Template Adaptation**

When source content has fewer items than the template:
- **Remove excess elements entirely** (images, shapes, text boxes), don't just clear text.
- Check for orphaned visuals after clearing text content.
- Run visual QA to catch mismatched counts.

When replacing text with different-length content:
- Shorter replacements: usually safe.
- Longer replacements: may overflow — test with visual QA.

**Multi-Item Content**

Never concatenate multiple items into one string. Create separate `<a:p>` elements:

```xml
<!-- ❌ WRONG -->
<a:p>
  <a:r><a:rPr .../><a:t>Step 1: Do the first thing. Step 2: Do the second thing.</a:t></a:r>
</a:p>

<!-- ✅ CORRECT -->
<a:p>
  <a:pPr algn="l"><a:lnSpc><a:spcPts val="3919"/></a:lnSpc></a:pPr>
  <a:r><a:rPr lang="en-US" sz="2799" b="1" .../><a:t>Step 1</a:t></a:r>
</a:p>
<a:p>
  <a:pPr algn="l"><a:lnSpc><a:spcPts val="3919"/></a:lnSpc></a:pPr>
  <a:r><a:rPr lang="en-US" sz="2799" .../><a:t>Do the first thing.</a:t></a:r>
</a:p>
```

Copy `<a:pPr>` from the original paragraph to preserve line spacing.

**Smart Quotes**

Handled automatically by unpack/pack. When adding new text via Edit tool, use XML entities:

| Character | XML Entity |
|-----------|------------|
| `"` (U+201C) | `&#x201C;` |
| `"` (U+201D) | `&#x201D;` |
| `'` (U+2018) | `&#x2018;` |
| `'` (U+2019) | `&#x2019;` |

**Other**
- **Whitespace**: Use `xml:space="preserve"` on `<a:t>` with leading/trailing spaces.
- **XML parsing**: Use `defusedxml.minidom`, not `xml.etree.ElementTree` (corrupts namespaces).

---

## Creating from Scratch (PptxGenJS)

Use when no template or reference presentation is available.

### Asset Path Resolution

**Always resolve background images and static assets via `SKILL_DIR`** — bare relative paths break on remote machines where the working directory is not the design system root.

```javascript
const path = require('path');
// __dirname resolves to the directory of the running script.
// If there is no __dirname (e.g. inline script), set SKILL_DIR manually to the
// absolute path of skills/gcs-pptx/.
const SKILL_DIR = typeof __dirname !== 'undefined'
  ? path.resolve(__dirname, '..')          // script is inside skills/gcs-pptx/scripts/
  : path.resolve('skills/gcs-pptx');      // fallback when running from repo root

// Helper — never pass bare strings to slide.background or addImage.
const A = (p) => path.join(SKILL_DIR, 'assets', p);

// Title slide (always use the wave texture — never generate a flat gradient)
slide1.background = { path: A('background-slide-title.png') };

// Closing slide (radial gradient pre-rendered as PNG — PptxGenJS has no gradient fill)
slide10.background = { path: A('background-closing.png') };
```

The `skills/gcs-pptx/assets/` folder contains all static background PNGs committed to the repo:

| File | Slide | Notes |
|------|-------|-------|
| `background-slide-title.png` | Title (slide 1) | 1920×1080 wave-arc texture — do not substitute a flat colour |
| `background-closing.png` | Section Intro + Closing | Dark navy gradient — used for both archetypes 12 and 13 |
| `social-media-icons.png` | Closing | Pre-composed icon row, w=3.419in, h=0.444in |
| `closing-pin.png` | Closing | Location pin, w=h=0.18in |

---

### Setup & Basic Structure

```javascript
const pptxgen = require("pptxgenjs");

let pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';  // 13.3" × 7.5" — matches GCS 1280×720px template
pres.author = 'Global Citizen Solutions';
pres.title = 'Presentation Title';

let slide = pres.addSlide();
slide.addText("Hello World!", { x: 0.5, y: 0.5, fontSize: 36, color: "363636" });

pres.writeFile({ fileName: "Presentation.pptx" });
```

**After `writeFile`, embed fonts (mandatory)**: `python scripts/embed_fonts.py Presentation.pptx` — see [Embedding Fonts](#embedding-fonts). pptxgenjs only writes `fontFace: 'Yrsa'` etc. as a name reference; it never embeds the actual font data, so the deck will show the wrong fonts in PowerPoint desktop until this runs.

**Coordinate conversion**: GCS template is 1280×720px = 13.333×7.5in. `1px = 0.01042in ≈ 0.75pt`.

Key converted values:
- 64px sides = 0.667in | 72px = 0.75in | 80px = 0.833in
- 48px = 0.5in | 44px = 0.458in | 20px = 0.208in | 16px = 0.167in | 14px = 0.146in

---

### Chrome Fixo — addContentChrome()

Slides 2–11 partilham header/divider/footer idênticos. Nunca construir manualmente — chamar sempre esta função.

**Coordenadas (LAYOUT_WIDE 13.333×7.5in):**
- Header logo: y=0.208in, x=0.667in, w=2.604in, h=0.157in
- Divider: y=0.569in (edge-to-edge, x=0, w=13.333)
- Footer top border: y=7.009in (edge-to-edge)
- Corpo disponível: y_start=1.032in, y_end=6.509in, height=5.477in, x=0.667in, w=12.0in

```javascript
function addContentChrome(slide, pres, kicker, pageNum) {
  // Header logo (Secondary-Blue = horizontal wordmark)
  slide.addImage({
    path: A('assets/logos/GCS-Secondary-Blue.png'),
    x: 0.667, y: 0.208, w: 2.604, h: 0.157
  });
  // Kicker — right-aligned, uppercase, letter-spaced
  slide.addText(kicker.toUpperCase(), {
    x: 0.667, y: 0.208, w: 12.0, h: 0.157,
    fontFace: 'Heebo', fontSize: 8.25, bold: true,
    color: '9B9CAD', charSpacing: 4, align: 'right', valign: 'middle', margin: 0
  });
  // Divider top (edge-to-edge)
  slide.addShape(pres.shapes.LINE, {
    x: 0, y: 0.569, w: 13.333, h: 0,
    line: { color: 'D6D8E8', width: 1 }
  });
  // Footer border (edge-to-edge)
  slide.addShape(pres.shapes.LINE, {
    x: 0, y: 7.009, w: 13.333, h: 0,
    line: { color: 'D6D8E8', width: 1 }
  });
  // Footer copyright
  slide.addText('© 2025 Global Citizen Solutions. All rights reserved.', {
    x: 0.667, y: 7.121, w: 9.0, h: 0.25,
    fontFace: 'Heebo', fontSize: 8.25, color: '9B9CAD', valign: 'middle', margin: 0
  });
  // Footer page number
  slide.addText(String(pageNum), {
    x: 0.667, y: 7.121, w: 12.0, h: 0.25,
    fontFace: 'Heebo', fontSize: 9, bold: true, color: '000957',
    align: 'right', valign: 'middle', margin: 0
  });
}
```

**O modelo não escolhe — `addContentChrome()` é sempre chamada nos slides 2–11.**

---

### Sistema de Zonas

O corpo (entre divider y=0.532in e footer y=7.094in) divide-se em zonas nomeadas. O modelo escolhe proporção A/B em função do conteúdo, não do archetype.

| Zona | Uso | y start | Height | x | Width |
|------|-----|---------|--------|---|-------|
| [HEADLINE] | Título do slide, opcional | 1.032in | ~0.5in | 0.667in | 12.0in |
| [ZONA A] | Coluna esquerda | 1.532in* | 4.977in* | 0.667in | ver proporção |
| [ZONA B] | Coluna direita | 1.532in* | 4.977in* | ver proporção | ver proporção |
| [ZONA FULL] | Largura total | 1.032in | 5.477in | 0.667in | 12.0in |

\*Quando [HEADLINE] presente; sem headline: y=1.032in, height=5.477in.

**Proporções padrão A/B** (x_content=0.667in, w_total=12.0in):

| Proporção | Gap | A_w | B_x | B_w | Usado em |
|-----------|-----|-----|-----|-----|----------|
| 1fr/1fr (gap 48px) | 0.5in | 5.75in | 6.917in | 5.75in | Content |
| 1fr/1fr (gap 56px) | 0.583in | 5.708in | 6.958in | 5.708in | Image Content |
| 1.1fr/1fr | 0.583in | 5.982in | 7.232in | 5.441in | Agenda |
| 1fr/1.05fr | 0.583in | 5.569in | 6.819in | 5.848in | Stats |
| 1fr/1.1fr | 0.75in | 5.357in | 6.774in | 5.893in | Timeline |
| 1.4fr/1fr | 0.417in | 6.757in | 7.841in | 4.826in | Charts |

O modelo escolhe a proporção que melhor serve o conteúdo — não é ditada pelo archetype.

---

### Biblioteca de Componentes Atómicos

Compõe livremente dentro das zonas. Um slide = `addContentChrome()` + zonas + componentes.

#### text-block
**Zona:** A  
Headline Yrsa 500 42–46px≈31.5–34.5pt `16182A` (line-height 1.12–1.15, margin-bottom 8–18px≈0.083–0.188in) + body Heebo 300 18–19px≈13.5–14.25pt `343750` (line-height 1.65–1.7).  
Opcional: kicker acima — Heebo 600 11px uppercase `000957`, margin-bottom 6–8px.  
**Pitfall:** Não usar em Zona A em mais de 2 slides consecutivos.

#### stat-panel
**Zona:** A ou B  
RECTANGLE `F2F3FE` + borda esquerda 3px `000957` (shape separado: w=0.031in, h=painel, fill `000957`). Padding 16px/20px≈0.167/0.208in. Label: Heebo 600 10px≈7.5pt uppercase `000957`. Valor: Yrsa 500 30px≈22.5pt `16182A`.  
**Pitfall:** Borda esquerda é RECTANGLE separado — `line` do pptxgenjs aplica a todas as bordas.

#### mini-stat-grid
**Zona:** A ou B  
2–4 cards em row. Cada card: RECTANGLE `F8F9FB`, borda 1px `E0E2EA`, sharp corners. Label: Heebo 600 9px≈6.75pt uppercase `9B9CAD`. Valor: JetBrains Mono 500 16px≈12pt `000957`.  
Largura de cada card = (zona_w − (n−1)×0.104in) / n. Gap entre cards: 0.104in (10px).

#### icon-list
**Zona:** A  
2–4 itens em coluna, gap 18px≈0.188in. Cada item: RECTANGLE 0.417×0.417in (fill `000957` ou `3F8CFF` alternando) + ícone Material Symbol rasterizado 20×20px branco centrado + título Heebo 600 14px≈10.5pt `16182A` + desc Heebo 300 16px≈12pt `6C6F8C` (line-height 1.55).  
**Pitfall:** Rasterizar ícone com fill branco via cairosvg — não embed SVG directo.

#### step-cards
**Zona:** FULL  
2–3 cards em row (típico: photo-zone + 2 cards coloridos). Cards coloridos: RECTANGLE fill `3F8CFF` (col 2) e `000957` (col 3), padding 28px≈0.292in. Número Yrsa 500 44px≈33pt branco topo-esq + seta icon 20×20px branco topo-dir. Título Heebo 600 15px≈11.25pt `FFFFFF`. Desc Heebo 300 16px≈12pt — usar solid `D6D8E8` (não white+opacity).  
**Pitfall:** `transparency` em runs com `charSpacing` causa truncagem no LibreOffice.

#### timeline-vertical
**Zona:** B  
3 milestones em coluna. Dot quadrado 12×12px≈0.125×0.125in (`3F8CFF` milestones 1–2, `000957` milestone 3) + linha conectora 1px `D6D8E8` (RECTANGLE w=0.01in entre dots). Título Heebo 600 14px≈10.5pt `16182A`. Desc Heebo 300 16px≈12pt `6C6F8C`. Padding-bottom 22px≈0.229in entre itens.

#### schedule-card
**Zona:** B (posicionamento absoluto)  
RECTANGLE fill `3F8CFF`, padding 32px/36px≈0.333/0.375in. Data: Yrsa 500 32px≈24pt `FFFFFF`, margin-bottom 18px. 4 time rows: border-top solid `9B9CAD` (não rgba); time JetBrains Mono 500 13px `FFFFFF`; item Heebo 300 16px `D6D8E8` sólido.

#### photo-zone
**Zona:** A ou B  
Imagem real: `addImage` com `sizing: { type: 'cover' }`.  
Placeholder: pre-render stripe PNG via Pillow (parallelograms `#F2F3FE`/`#E8E9F7`, 45deg, 10px pitch) + label chip JetBrains Mono 12px centrado (RECTANGLE `FFFFFF`, borda 1px `D6D8E8`, texto `6C6F8C`).  
Caption abaixo: Heebo 400 12px≈9pt `9B9CAD`, centrado.  
**Pitfall:** pptxgenjs não tem repeating gradient — stripe é sempre PNG pré-renderizado.

#### chart-zone
**Zona:** A ou B  
Label acima: Heebo 600 10px uppercase `9B9CAD`, margin-bottom 10px. Chart ocupa altura restante.  
Bar: 2 séries `000957` + `3F8CFF`. Pie: `000957`/`1B4D9B`/`3F8CFF` — todos escuros (labels brancos precisam contraste).  
**Pitfall:** Verificar labels brancos no render — tints claros são QA failure.

#### table-zone
**Zona:** FULL ou B  
Header row fill `000957`, texto `FFFFFF` bold. Linhas brancas abaixo. Colunas numéricas right-aligned. Flags ~24×24px circulares (`addImage` com w=h=24px e `rounding: true`), borda opcional 1px `E0E2EA`.

#### kpi-overlay
**Zona:** B (absoluto, sobrepõe photo-zone)  
RECTANGLE `3F8CFF`. x = B_x − 0.5in (sobressai à esquerda da zona B — intencional). y = footer_top − 0.333in − card_height. w=2.5in. Valor Yrsa 500 44px≈33pt `FFFFFF`. Label Heebo 600 12px uppercase letter-spaced `FFFFFF`. Desc Heebo 300 12px `D6D8E8` (line-height 1.5).  
**Pitfall:** Coordenadas absolutas no slide, não relativas à zona B.

#### floating-cards
**Zona:** A (absoluto, sobre photo-zone)  
2 cards RECTANGLE. Card 1 fill `3F8CFF` (y≈0.375in); card 2 fill `000957` (y≈2.042in). w=2.083in, padding 20px≈0.208in. Icon 20×20px branco, título Heebo 600 13px branco, desc Heebo 300 11px `D6D8E8`.

---

### Regras de Composição

Regras obrigatórias — verificar no Slide Map antes de gerar código:

1. **Zona A** não pode ter `text-block` em mais de 2 slides consecutivos.
2. **Zona B** não pode ter `photo-zone` em mais de 3 slides do mesmo deck.
3. Deck com 6+ slides deve incluir pelo menos 1 slide com `[ZONA FULL]`.
4. Todo o deck deve incluir pelo menos 1 slide com `stat-panel` ou `kpi-overlay`.
5. Todo o deck deve incluir pelo menos 1 slide onde Zona A ≠ `text-block`.

Violações são layout failures — corrigir no Slide Map antes de gerar código.

---

### Slide Map Obrigatório

**Antes de qualquer código ou XML**, produzir um Slide Map e aguardar aprovação explícita.

Formato:

```
Slide 1  — Title | background-slide-title.png
Slide 2  — [Chrome] kicker: "Overview" | [HEADLINE]: "Our Approach" | [ZONA A 1fr]: text-block | [ZONA B 1fr]: stat-panel + mini-stat-grid (3 cards)
Slide 3  — [Chrome] kicker: "Process" | [ZONA FULL]: step-cards (photo + 2 cards coloridos)
Slide 4  — [Chrome] kicker: "Data" | [HEADLINE]: "Key Metrics" | [ZONA FULL 1.4fr/1fr]: chart-zone (bar) + chart-zone (pie)
...
Slide N  — Closing | background-closing.png (boilerplate fixo)
```

Verificar Regras de Composição no Slide Map antes de submeter. Aguardar aprovação antes de escrever qualquer JS/XML.

---

### Text & Formatting

```javascript
// Basic text — Yrsa always bold: false (400/500 are weight tokens, not bold)
slide.addText("Simple Text", {
  x: 1, y: 1, w: 8, h: 2, fontSize: 24, fontFace: "Yrsa",
  color: "16182A", bold: false, align: "center", valign: "middle"
});

// Character spacing (use charSpacing, not letterSpacing which is silently ignored)
slide.addText("SPACED TEXT", { x: 1, y: 1, w: 8, h: 1, charSpacing: 6 });

// Rich text arrays
slide.addText([
  { text: "Bold ", options: { bold: true } },
  { text: "Italic ", options: { italic: true } }
], { x: 1, y: 3, w: 8, h: 1 });

// Multi-line text (requires breakLine: true)
slide.addText([
  { text: "Line 1", options: { breakLine: true } },
  { text: "Line 2", options: { breakLine: true } },
  { text: "Line 3" }
], { x: 0.5, y: 0.5, w: 8, h: 2 });

// Text box margin (internal padding)
slide.addText("Title", {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  margin: 0  // Use 0 when aligning text precisely with shapes or icons
});
```

### Lists & Bullets

```javascript
// ✅ CORRECT
slide.addText([
  { text: "First item", options: { bullet: true, breakLine: true } },
  { text: "Second item", options: { bullet: true, breakLine: true } },
  { text: "Third item", options: { bullet: true } }
], { x: 0.5, y: 0.5, w: 8, h: 3 });

// ❌ WRONG: Never use unicode bullets
slide.addText("• First item", { ... });  // Creates double bullets
```

### Shapes

```javascript
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0.5, y: 0.8, w: 1.5, h: 3.0,
  fill: { color: "000957" }, line: { color: "000957", width: 0 }
});

slide.addShape(pres.shapes.LINE, {
  x: 0.667, y: 0.6, w: 12, h: 0,
  line: { color: "E0E2EA", width: 1 }
});

// With shadow
slide.addShape(pres.shapes.RECTANGLE, {
  x: 1, y: 1, w: 3, h: 2,
  fill: { color: "FFFFFF" },
  shadow: { type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.15 }
});
```

Shadow options:

| Property | Range | Notes |
|----------|-------|-------|
| `type` | `"outer"`, `"inner"` | |
| `color` | 6-char hex, no `#` | Never 8-char hex |
| `blur` | 0–100 pt | |
| `offset` | 0–200 pt | Must be non-negative |
| `angle` | 0–359° | 135=bottom-right, 270=upward |
| `opacity` | 0.0–1.0 | Use this, never encode in color |

**Gradient fills are not natively supported.** Pre-render a PNG and use as background image.

### Images

```javascript
// From file path
slide.addImage({ path: "assets/logos/GCS-Primary-White.png", x: 0.75, y: 0.75, w: 1.67, h: 0.417 });

// From base64
slide.addImage({ data: "image/png;base64,iVBORw0KGgo...", x: 1, y: 1, w: 5, h: 3 });

// Sizing modes
{ sizing: { type: 'contain', w: 4, h: 3 } }
{ sizing: { type: 'cover', w: 4, h: 3 } }
```

### Charts

```javascript
// Bar chart — 2 series, GCS colors
slide.addChart(pres.charts.BAR, [
  { name: "Filed",    labels: ["Q1","Q2","Q3","Q4"], values: [42,58,65,71] },
  { name: "Approved", labels: ["Q1","Q2","Q3","Q4"], values: [34,47,55,63] }
], {
  x: 0.667, y: 1.0, w: 7.0, h: 4.0, barDir: 'col',
  chartColors: ["000957", "3F8CFF"],
  chartArea: { fill: { color: "FFFFFF" } },
  catAxisLabelColor: "9B9CAD", valAxisLabelColor: "9B9CAD",
  valGridLine: { color: "E0E2EA", size: 0.5 },
  catGridLine: { style: "none" },
  showValue: true, dataLabelPosition: "outEnd", dataLabelColor: "16182A",
  showLegend: true, legendPos: "b"
});

// Pie chart — 3 segments, dark tints only (pale tints make white labels unreadable)
slide.addChart(pres.charts.PIE, [{
  name: "Share",
  labels: ["Fund Subscription", "Real Estate", "Business Investment"],
  values: [48, 32, 20]
}], {
  x: 7.5, y: 1.0, w: 5.5, h: 4.0,
  chartColors: ["000957", "1B4D9B", "3F8CFF"],
  showPercent: true, dataLabelColor: "FFFFFF"
});
```

### Tables

```javascript
slide.addTable([
  [
    { text: "Country", options: { fill: { color: "000957" }, color: "FFFFFF", bold: true } },
    { text: "Min. Investment", options: { fill: { color: "000957" }, color: "FFFFFF", bold: true, align: "right" } },
    { text: "Timeline", options: { fill: { color: "000957" }, color: "FFFFFF", bold: true, align: "right" } }
  ],
  ["Portugal", { text: "€500,000", options: { align: "right" } }, { text: "12–24 Mo", options: { align: "right" } }],
  ["Malta",    { text: "€690,000", options: { align: "right" } }, { text: "12–36 Mo", options: { align: "right" } }],
], {
  x: 0.667, y: 2.0, w: 12.0,
  border: { pt: 1, color: "E0E2EA" },
  fill: { color: "FFFFFF" }
});
```

### Common PptxGenJS Pitfalls

1. **NEVER use `#` with hex colors** — causes file corruption.
   ```javascript
   color: "FF0000"   // ✅
   color: "#FF0000"  // ❌
   ```

2. **NEVER encode opacity in 8-char hex** — corrupts the file.
   ```javascript
   shadow: { color: "00000020" }                        // ❌
   shadow: { color: "000000", opacity: 0.12 }           // ✅
   ```

3. **NEVER use unicode bullets (•)** — creates double bullets.

4. **Use `breakLine: true`** between array items in rich text.

5. **Each presentation needs fresh instance** — don't reuse `pptxgen()` objects.

6. **NEVER reuse option objects across calls** — PptxGenJS mutates them in-place.
   ```javascript
   // ❌ second call gets already-converted values
   const shadow = { type: "outer", blur: 6, offset: 2, color: "000000", opacity: 0.15 };
   slide.addShape(pres.shapes.RECTANGLE, { shadow, ... });
   slide.addShape(pres.shapes.RECTANGLE, { shadow, ... });

   // ✅ fresh object each time
   const makeShadow = () => ({ type: "outer", blur: 6, offset: 2, color: "000000", opacity: 0.15 });
   slide.addShape(pres.shapes.RECTANGLE, { shadow: makeShadow(), ... });
   slide.addShape(pres.shapes.RECTANGLE, { shadow: makeShadow(), ... });
   ```

7. **Don't use `ROUNDED_RECTANGLE` with accent borders** — rectangular overlay bars won't cover rounded corners. Use `RECTANGLE` instead.

---

## Design Ideas

GCS has a fixed brand. Every deck must look like it came from the same company — use the exact values below, every time.

### Colors

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary (dominant) | Night Blue | `000957` | Title/quote/closing backgrounds (near-black navy `0A1330` on title slide), primary CTAs, icon squares |
| Accent | Electric Blue | `3F8CFF` | Step cards, KPI overlay cards, timeline dots, icon squares — used purposefully, never as a general background |
| Rating only | Star Gold | `DFB300` | **Only** for ratings/badges/achievements — never decorative |
| Headline text | Dark navy | `16182A` | Headlines on light/content slides |
| Body text | Slate | `343750` | Body copy on light/content slides |
| Stat panel bg | Lavender | `F2F3FE` | Big stat-callout background |
| Mini-card bg | Off-white | `F8F9FB` | Mini stat cards, secondary panels |
| Divider | Light gray | `E0E2EA` | Hairline borders/dividers |
| Italic accent | Muted lavender | `B3B5CD` | Second title line, italic accent words on dark backgrounds |
| Page background | Warm off-white | `F7F8FA` | Light-slide background (not pure white) |
| Dimmed label on dark | Muted gray-blue | `9B9CAD` | Eyebrows/kickers on dark backgrounds — **use this solid hex, not white + `transparency`** (see pitfall below) |
| Dimmed subtitle on dark | Muted lavender-white | `9195A2` | Subtitles on dark backgrounds — solid hex, not white + `transparency` |

Never invent a color outside this table. Never introduce a topic-specific accent hue — the generic pptx-skill idea of a topic palette does not apply to GCS.

**Layout pitfall — compute stacked text-box heights from real line-height, don't eyeball them.** The title's bottom-anchored block and the closing slide's bottom-aligned columns stack several text boxes with no auto-grow. pptxgenjs text boxes don't reflow siblings, so an undersized box silently overlaps the next. Compute each box's height as `fontSize(pt) × lineHeight ÷ 72 × numberOfLines` before placing the next box below, and re-check in the rendered image.

**Rendering pitfall — don't combine `charSpacing` with `transparency` on the same run.** Reproducing dimmed text on dark slides via both `charSpacing` and `transparency` causes LibreOffice to silently truncate the run. Use the solid muted hexes above instead of white + `transparency`. Reserve `transparency` for runs that don't carry `charSpacing`.

### Typography

Fixed font set — only three families across the entire template:

| Font | Role |
|------|------|
| **Yrsa** (serif, 400/500, regular + italic) | All headlines on every slide type: title display, content headlines, quote text, stats headline, agenda/steps/timeline/schedule/closing display text |
| **Heebo** (sans, 300/400/500/600) | Eyebrows, kickers, body copy, item labels, footer, captions, address — all supporting text |
| **JetBrains Mono** (400/500) | Mini stat values, schedule time codes, photo placeholder labels, data callouts |

**Never substitute Arial, Calibri, Raleway, Source Sans, Georgia, Cambria, Trebuchet, Impact, Garamond, or any other font** — those are off-brand.

**Yrsa `bold: false` — always.** Yrsa 400 and 500 are weight tokens (regular/medium), not bold. In pptxgenjs: always `bold: false` for every Yrsa text box. Never use `bold: true` with Yrsa — it forces a synthetic bold that distorts the typeface and is a QA failure.

| Element | Font | Size (px→pt) |
|---------|------|------|
| Title display (title/quote/closing) | Yrsa 400 | 76px ≈ 57pt |
| Headline (content/agenda/steps/stats/timeline/schedule slides) | Yrsa 500 | 42–46px ≈ 31.5–34.5pt |
| Big stat overlay value | Yrsa 500 | 44px ≈ 33pt |
| Inline stat value | Yrsa 500 | 30px ≈ 22.5pt |
| Stat panel value | Yrsa 500 | 30px ≈ 22.5pt |
| Quote text | Yrsa 400 italic | 38px ≈ 28.5pt |
| Schedule date | Yrsa 500 | 32px ≈ 24pt |
| Step number (01./02.) | Yrsa 500 | 44px ≈ 33pt |
| Body copy (content slides) | Heebo 300 | 18–19px ≈ 13.5–14.25pt |
| Kicker/section label | Heebo 600, uppercase, letter-spaced | 11px ≈ 8.25pt |
| Item title (agenda/stats) | Heebo 600 | 14px ≈ 10.5pt |
| Item desc (agenda/timeline) | Heebo 300 | 16px ≈ 12pt |
| Step card title | Heebo 600 | 15px ≈ 11.25pt |
| Step card desc | Heebo 300 | 16px ≈ 12pt |
| Caption | Heebo 400 | 12px ≈ 9pt |
| Footer text | Heebo 400 | 11px ≈ 8.25pt |
| Footer page number | Heebo 600 | 12px ≈ 9pt |
| Mini stat value | JetBrains Mono 500 | 16px ≈ 12pt |
| Schedule time | JetBrains Mono 500 | 13px ≈ 9.75pt |
| Schedule item | Heebo 300 | 16px ≈ 12pt |
| Closing website URL | Heebo 400 | 24px ≈ 18pt |
| Closing address/contact | Heebo 400/500 | 28px ≈ 21pt |

Note: the timeline archetype's floating mini-card description stays at 11px ≈ 8.25pt (smaller than the other description text above) — unchanged, but now reads inconsistently small next to the bumped 16px descriptions elsewhere; worth revisiting.

**Font embedding is mandatory, not optional.** pptxgenjs and slide-XML editing only reference these fonts by name — nothing embeds the actual font data into the `.pptx`. Google Slides and the LibreOffice-based QA loop below both silently substitute their own copies of Yrsa/Heebo/JetBrains Mono (they're Google Fonts), which is why a deck can look correct in every check this skill runs and still show the wrong fonts the moment a client opens it in PowerPoint desktop — PowerPoint has none of these fonts installed locally and falls back to a default substitute unless the fonts are embedded in the file itself. Always run `python scripts/embed_fonts.py output.pptx` as the last build step, before QA — see [Converting to Images](#converting-to-images).

### Slide Archetypes

Build every deck from these twelve GCS layouts, sourced directly from `references/slides/Slides.dc.html` and the individual `*.card.html` companions. **Coordinate conversion**: template canvas is 1280×720px = 13.333×7.5in (use `LAYOUT_WIDE`); `1px = 0.01042in`.

#### 1. Title

Full-bleed dark background. **Background image is always `A('background-slide-title.png')`** (dark-navy abstract wave with curved blue lines, 1920×1080, cover-fit). Never generate a flat gradient as a fallback — the file is committed to `skills/gcs-pptx/assets/` and must always be available.

```javascript
slide.background = { path: A('background-slide-title.png') };
// No flat-colour fallback — the asset is committed and portable.
```

Padding: 72px (0.75in) top, 80px (0.833in) sides. Layout: flex column.

- **Logo** `GCS-Primary-White.png`, h=56px (0.589in), top-left. Compute width from ratio 2.80 × 0.589 = 1.649in.
- **Spacer** fills remaining vertical space (logo to text block is empty).
- **Text block** anchored to bottom, max-width 820px (8.542in):
  - Eyebrow: Heebo 600, 13px≈9.75pt, uppercase, color `3F8CFF` (Electric Blue — phase/section label). Margin-bottom 3px≈0.029in.
  - Title line 1: Yrsa 400, 76px≈57pt, white `FFFFFF`, line-height 1.06, letter-spacing -1.5px≈-1.125pt.
  - Title line 2: Yrsa 400 italic, 76px≈57pt, muted lavender `B3B5CD`, same sizing. Margin-bottom 30px≈0.313in.
  - Subtitle: Heebo 300, 19px≈14.25pt, color `9195A2`, line-height 1.55.

**Pitfall**: eyebrow and subtitle on dark backgrounds — use solid hex `9B9CAD`/`9195A2`, never `rgba(255,255,255,0.42)` + `charSpacing` on the same run (LibreOffice truncation bug).

**pptxgenjs — complete code reference:**

Template is 1280×720px, padding 72px top / 80px sides. Text block is bottom-anchored: every element is positioned by computing y upward from `y_end = 6.75in` (= 7.5 − 0.75).

**Verified anchors** — re-extracted with `python-pptx` directly from `template (1).pptx` (the canonical Capa source) and confirmed to 0.000in error. Two distinct constants matter here and must not be conflated:
- `titleH = 0.900` — a title line's own **box height** (used once, for the last title line before measuring the gap down to the subtitle).
- `lineAdvance = 0.840` — the real **pitch between two stacked title-line boxes** (used when stepping from title line 2 up to title line 1, and from title line 1 up to the eyebrow). This is smaller than `titleH` because the boxes overlap slightly by design (valign: middle absorbs it) — do not substitute `titleH` here, that was the source of the old ±0.06in drift.

```javascript
slide.background = { path: A('background-slide-title.png') };

// Logo — top-left within padding
slide.addImage({
  path: A('assets/logos/GCS-Primary-White.png'),
  x: 0.833, y: 0.750, h: 0.589, w: 1.649  // h=56.5px; w=56.5×2.80
});

// Bottom-anchored text block (single-line titles)
const Y_END       = 6.894;   // 7.5in − 0.606in bottom margin
const subtitleH   = 0.700;   // Heebo 14.25pt box
const titleH      = 0.900;   // title-line box height (last line only)
const lineAdvance = 0.840;   // pitch between stacked title-line boxes
const eyebrowH    = 0.200;   // Heebo 9.75pt box

const ySubtitle  = Y_END - subtitleH;                 // 6.194
const yTitle2    = ySubtitle - 0.313 - titleH;        // 4.981 — exact match
const yTitle1    = yTitle2   - lineAdvance;           // 4.141 — exact match
const yEyebrow   = yTitle1   - 0.029 - eyebrowH;      // 3.912 — exact match, 3pt gap eyebrow→title

slide.addText(eyebrow.toUpperCase(), {
  x: 0.833, y: yEyebrow, w: 8.542, h: eyebrowH,
  fontFace: 'Heebo', fontSize: 9.75, bold: true, color: '3F8CFF',
  valign: 'middle', margin: 0
});
slide.addText(titleLine1, {
  x: 0.833, y: yTitle1, w: 8.542, h: titleH,
  fontFace: 'Yrsa', fontSize: 57, bold: false, color: 'FFFFFF',
  charSpacing: -1.125, valign: 'top', margin: 0
});
slide.addText(titleLine2, {
  x: 0.833, y: yTitle2, w: 8.542, h: titleH,
  fontFace: 'Yrsa', fontSize: 57, bold: false, italic: true, color: 'B3B5CD',
  charSpacing: -1.125, valign: 'top', margin: 0
});
slide.addText(titleSubtitle, {
  x: 0.833, y: ySubtitle, w: 8.542, h: subtitleH,
  fontFace: 'Heebo', fontSize: 14.25, bold: false, color: '9195A2',
  valign: 'top', margin: 0
});
```

**Valign matters here** — the template's title-line and subtitle boxes are `anchor="t"` (top), not centered; only the eyebrow is `anchor="ctr"`. pptxgenjs defaults to a vertically-centered box when `valign` is omitted, which silently drifts text down within an oversized box (box height includes deliberate slack for line-height headroom). Always set `valign: 'top'` on titleLine1/titleLine2/titleSubtitle explicitly — verified by re-rendering against `template (1).pptx` and diffing pixel output.

**If a title line wraps to N physical lines**, that line's rendered height is `lineAdvance × N` (≈0.840in per line) — not the fixed `titleH` constant, which only holds for the single-line case. Recompute the cascade upward from `Y_END` using the per-line height for whichever line wrapped. If titleLine1 and titleLine2 have different line counts, compute each height separately and stack manually.

#### 2. Content

**Chrome:** `addContentChrome(slide, pres, kicker, pageNum)` — obrigatório.

**Zone composition:**
- [HEADLINE]: Yrsa 500 44px≈33pt `16182A`
- [ZONA A] (1fr): text-block
- [ZONA B] (1fr): stat-panel + mini-stat-grid (3 cards)

**Proporção:** 1fr/1fr, gap 0.5in (A_w=5.75in, B_x=6.917in, B_w=5.75in)

---

White background. Same header/divider/footer chrome used across slides 2–10.

**Chrome (shared across slides 2–10):**
- Header: padding 20px (0.208in) top, 64px (0.667in) sides. Logo `GCS-Secondary-Blue.png` **w=250px=2.604in, h=2.604÷16.57=0.157in** left; kicker text right (Heebo 600, 11px≈8.25pt, `9B9CAD`, letter-spaced, uppercase).
- Divider: 1px `E0E2EA` line, 16px (0.167in) below header.
- Footer: 1px `E0E2EA` top border, 14px (0.146in) top/bottom, 64px sides. Copyright Heebo 400 11px `9B9CAD` left; page number Heebo 600 12px `000957` right.

**Body** — vertically centered in remaining space, padding 48px (0.5in) top/bottom, 64px sides:
- Headline: Yrsa 500, 44px≈33pt, `16182A`, letter-spacing -0.025em. Margin-bottom 8px.
- 2-column grid, 1fr/1fr, 48px (0.5in) gap:
  - **Left column**: Two Heebo 300 body paragraphs, 19px≈14.25pt, `343750`, line-height 1.7. First has margin-bottom 16px.
  - **Right column** (flex column, 12px gap):
    - **Stat panel**: `F2F3FE` bg, 3px solid `000957` left border, padding 16px/20px. Label: Heebo 600, 10px≈7.5pt, uppercase, `000957`. Value: Yrsa 500, 30px≈22.5pt, `16182A`.
    - **Mini-stat grid**: 3 columns, 10px gap. Each card: `F8F9FB` bg, 1px `E0E2EA` border (no radius — sharp), padding 12px/14px. Label: Heebo 600, 9px≈6.75pt, uppercase, `9B9CAD`. Value: JetBrains Mono 500, 16px≈12pt, `000957`.

#### 3. Image Content

**Chrome:** `addContentChrome(slide, pres, kicker, pageNum)` — obrigatório.

**Zone composition:**
- [HEADLINE]: Yrsa 500 42px≈31.5pt `16182A`
- [ZONA A] (1fr): text-block
- [ZONA B] (1fr): photo-zone

**Proporção:** 1fr/1fr, gap 0.583in/56px (A_w=5.708in, B_x=6.958in, B_w=5.708in)

---

Same chrome as #2. Body vertically centered, padding 48px/64px, gap 28px.

2-column grid, 1fr/1fr, 56px (0.583in) gap, align-items center:
- **Left column**: Headline Yrsa 500 42px≈31.5pt `16182A` (line-height 1.15, margin-bottom 18px) + two Heebo 300 19px body paragraphs (margin-bottom 14px between them).
- **Right column**: 4:3 ratio photo box. **If no real photo supplied**, use the template's placeholder: diagonal-stripe pattern (`repeating-linear-gradient(45deg,#F2F3FE 10px,#E8E9F7 10px,#E8E9F7 20px)`) with a JetBrains Mono 12px label chip centered on top (white bg, 1px `D6D8E8` border, `6C6F8C` text). pptxgenjs has no repeating fill — pre-render stripe as PNG (Pillow: offset parallelograms), then `addImage`. Caption below: Heebo 400 12px `9B9CAD`, centered.

#### 4. Charts

**Chrome:** `addContentChrome(slide, pres, kicker, pageNum)` — obrigatório.

**Zone composition:**
- [HEADLINE]: Yrsa 500 38px≈28.5pt `16182A` — top-anchored (y=0.907in, não centrado verticalmente)
- [ZONA FULL, 1.4fr/1fr]: chart-zone (bar, w=6.757in) + chart-zone (pie, w=4.826in), gap 0.417in

**Nota:** Charts é o único archetype top-anchored — corpo não é centrado verticalmente.

---

Same chrome. Body **top-anchored** (not vertically centered — charts need the space), padding 36px top, 64px sides, 24px bottom.

- Headline: Yrsa 500, 38px≈28.5pt, `16182A`.
- 2-column grid, 1.4fr/1fr, 40px (0.417in) gap, align-items stretch:
  - Each column: Heebo 600 10px uppercase label `9B9CAD` (margin-bottom 10px) + chart filling remaining height.
  - Bar chart: 2 series, `000957` (Filed) + `3F8CFF` (Approved).
  - Pie chart: 3 segments, `000957` / `1B4D9B` / `3F8CFF` — all dark enough for white percentage labels (verify in rendered image, not fill swatches).

**Charts is the only archetype that's top-anchored** — don't let this pattern bleed into Table or other slides.

#### 5. Table

**Chrome:** `addContentChrome(slide, pres, kicker, pageNum)` — obrigatório.

**Zone composition:**
- [HEADLINE]: Yrsa 500 38px≈28.5pt `16182A`
- [ZONA FULL]: table-zone

---

Same chrome. Body **vertically centered**, padding 36px/64px, gap 22px.

- Headline: Yrsa 500, 38px≈28.5pt, `16182A`. Margin-bottom 10px.
- Intro: Heebo 300, 15px≈11.25pt, `343750`, max-width 760px.
- Table: Night Blue `000957` header row, white text bold. White rows below. Numeric columns right-aligned. When rows are countries/programmes: flag PNG (~24×24px, `addImage` with `{ rounding: true }` for a circular crop, 1px `E0E2EA` outline) immediately left of country name.

#### 6. Agenda

**Chrome:** `addContentChrome(slide, pres, kicker, pageNum)` — obrigatório.

**Zone composition:**
- [HEADLINE]: Yrsa 500 46px≈34.5pt `16182A`
- [ZONA A] (1.1fr): icon-list (3 items)
- [ZONA B] (1fr): photo-zone

**Proporção:** 1.1fr/1fr, gap 0.583in/56px (A_w=5.982in, B_x=7.232in, B_w=5.441in)

---

Same chrome. Body padding 44px/64px. 2-column grid, 1.1fr/1fr, 56px gap, align-items center.

**Left column:**
- Headline: Yrsa 500, 46px≈34.5pt, `16182A`, line-height 1.12. Margin-bottom 20px.
- Section label: Heebo 600, 11px, uppercase, `000957`. Margin-bottom 8px.
- Intro: Heebo 300, 18px, `343750`, line-height 1.65. Margin-bottom 26px, max-width 480px.
- 3 icon-list items (flex column, 18px gap each):
  - Icon square: 40×40px, background Night Blue `000957` or Electric Blue `3F8CFF` (alternate for visual rhythm), white icon 20×20px (`filter:brightness(0) invert(1)` in HTML; rasterize icon with white fill for pptx).
  - Title: Heebo 600, 14px≈10.5pt, `16182A`. Margin-bottom 2px.
  - Desc: Heebo 300, 16px≈12pt, `6C6F8C`, line-height 1.55, max-width 440px.

**Right column:** Full-height striped photo placeholder (same treatment as archetype #3).

#### 7. Steps

**Chrome:** `addContentChrome(slide, pres, kicker, pageNum)` — obrigatório.

**Zone composition:**
- [HEADLINE]: Yrsa 500 46px≈34.5pt `16182A`
- [ZONA FULL]: step-cards (photo-zone col 1 + card `3F8CFF` col 2 + card `000957` col 3)

---

Same chrome. Body flex column, padding 44px/64px/40px, gap 32px.

**Headline block:**
- Headline: Yrsa 500, 46px≈34.5pt, `16182A`, line-height 1.12. Max-width 720px, margin-bottom 14px.
- Kicker: Heebo 600, 11px, uppercase, `000957`. Margin-bottom 6px.
- Intro: Heebo 300, 18px, `343750`, line-height 1.65, max-width 640px.

**3-column grid** (1.2fr/1fr/1fr, 24px gap, flex:1):
- **Col 1**: Striped photo placeholder (full height).
- **Col 2**: Electric Blue `3F8CFF` card, padding 28px, flex column:
  - Top row: "01." Yrsa 500 44px white + arrow icon top-right (20×20px white).
  - Spacer.
  - Title: Heebo 600, 15px, `FFFFFF`. Margin-bottom 6px.
  - Desc: Heebo 300, 16px, `rgba(255,255,255,0.85)`.
- **Col 3**: Night Blue `000957` card, same structure, "02.", desc at `rgba(255,255,255,0.75)`.

#### 8. Stats

**Chrome:** `addContentChrome(slide, pres, kicker, pageNum)` — obrigatório.

**Zone composition:**
- [HEADLINE]: Yrsa 500 46px≈34.5pt `16182A`
- [ZONA A] (1fr): text-block + mini-stat-grid (2 inline stats)
- [ZONA B] (1.05fr): photo-zone + kpi-overlay

**Proporção:** 1fr/1.05fr, gap 0.583in/56px (A_w=5.569in, B_x=6.819in, B_w=5.848in)

---

Same chrome. Body padding 44px/64px. 2-column grid, 1fr/1.05fr, 56px gap, align-items center.

**Left column:**
- Headline: Yrsa 500, 46px≈34.5pt, `16182A`, line-height 1.12. Margin-bottom 18px.
- Kicker: Heebo 600, 11px, uppercase, `000957`. Margin-bottom 8px.
- Body: Heebo 300, 18px, `343750`, line-height 1.65. Margin-bottom 30px, max-width 460px.
- 2 inline stats (flex row, 48px gap):
  - Each: 40×40px 1px `D6D8E8` bordered icon box + value Yrsa 500 30px `16182A` (line-height 1) + label Heebo 600 11px uppercase `6C6F8C`.

**Right column** (position:relative, full height):
- Background: full-height striped photo placeholder.
- **Overlapping KPI card**: `position:absolute; left:-48px (-0.5in); bottom:32px (0.333in); width:240px (2.5in)`. Background `3F8CFF`, padding 24px:
  - Value: Yrsa 500, 44px≈33pt, `FFFFFF`, line-height 1.
  - Label: Heebo 600, 12px, letter-spaced 0.1em, uppercase, `FFFFFF`. Margin 8px/6px.
  - Desc: Heebo 300, 12px, `rgba(255,255,255,0.85)`, line-height 1.5.

The KPI card overlaps left into the body column — position it as absolute so it visually bridges both columns.

#### 9. Timeline

**Chrome:** `addContentChrome(slide, pres, kicker, pageNum)` — obrigatório.

**Zone composition:**
- [HEADLINE]: Yrsa 500 46px≈34.5pt `16182A` (na zona B — coluna direita)
- [ZONA A] (1fr): photo-zone + floating-cards (absolutos)
- [ZONA B] (1.1fr): text-block (headline + intro) + timeline-vertical (3 milestones)

**Proporção:** 1fr/1.1fr, gap 0.75in/72px (A_w=5.357in, B_x=6.774in, B_w=5.893in)

---

Same chrome. Body padding 44px/64px. 2-column grid, 1fr/1.1fr, 72px gap, align-items center.

**Left column** (position:relative, full height):
- Photo placeholder: `position:absolute; inset:0 0 0 56px (0.583in)` — offset from left to make room for floating cards.
- **Floating card 1** (top:36px, 0.375in): `position:absolute; left:0; width:200px (2.083in); background:#3F8CFF; padding:20px`. Icon 20×20px white, margin-bottom 10px. Title Heebo 600 13px white. Desc Heebo 300 11px `rgba(255,255,255,0.85)`.
- **Floating card 2** (top:196px, 2.042in): Same structure, `background:#000957`, desc `rgba(255,255,255,0.75)`.

**Right column:**
- Headline: Yrsa 500, 46px≈34.5pt, `16182A`, line-height 1.12. Margin-bottom 14px.
- Intro: Heebo 300, 18px, `343750`, line-height 1.65. Margin-bottom 30px, max-width 480px.
- 3-milestone vertical timeline:
  - Each milestone: 12×12px square dot + 1px `D6D8E8` vertical connector line (flex:1, no line after last dot). Dot: Electric Blue `3F8CFF` for milestones 1–2, Night Blue `000957` for milestone 3.
  - Title: Heebo 600, 14px, `16182A`. Desc: Heebo 300, 16px, `6C6F8C`. Padding-bottom 22px between items.

#### 10. Schedule

**Chrome:** `addContentChrome(slide, pres, kicker, pageNum)` — obrigatório.

**Zone composition:** Posicionamento absoluto — não usa proporções A/B standard.
- photo-zone (absoluto, esquerda/topo)
- schedule-card (absoluto, direita/centro)
- text-block headline + intro (absoluto, esquerda/baixo)

---

Same chrome. Body uses **absolute positioning** (position:relative container, no flex/grid).

- **Photo banner**: `position:absolute; left:64px (0.667in); top:40px (0.417in); width:660px (6.875in); height:250px (2.604in)`. Striped placeholder.
- **Timetable card**: `position:absolute; right:96px (1in); top:88px (0.917in); width:400px (4.167in); background:#3F8CFF; padding:32px/36px (0.333/0.375in)`.
  - Date: Yrsa 500, 32px≈24pt, `FFFFFF`. Margin-bottom 18px.
  - 4 time rows (padding 12px top/bottom each, top border `1px solid rgba(255,255,255,0.3)`):
    - Time: JetBrains Mono 500, 13px≈9.75pt, `FFFFFF`, flex-shrink:0.
    - Item: Heebo 300, 16px, `rgba(255,255,255,0.9)`.
- **Headline block**: `position:absolute; left:64px; bottom:36px (0.375in); width:560px (5.833in)`.
  - Headline: Yrsa 500, 46px≈34.5pt, `16182A`, line-height 1.12. Margin-bottom 14px.
  - Intro: Heebo 300, 18px, `343750`, line-height 1.65.

#### 11. Quote

**Chrome próprio — Night Blue `000957` background. Não usar `addContentChrome()`.**

**Zone composition:** Layout centrado, sem zonas A/B — ver implementação detalhada.

---

Night Blue `000957` background. Centered layout.

- Giant background quote mark: Yrsa 500, 280px≈210pt, `FFFFFF` at 5% opacity (via `transparency: 95`), position top-left. **Must use U+201C (left curly double quote), never `"` (U+0022, ASCII straight quote)** — straight quotes at 210pt render as two vertical bars in every renderer, not a quotation mark.

  ```javascript
  // ✅ CORRECT — U+201C left double quotation mark
  slide.addText('“', {
    fontFace: 'Yrsa', fontSize: 210, color: 'FFFFFF', transparency: 95,
    x: 0.625, y: 0.625, w: 3.5, h: 3.5, margin: 0
  });

  // ❌ WRONG — renders as two vertical bars at large sizes
  slide.addText('"', { fontSize: 210, ... });
  ```
- Logo `GCS-Symbol-White.png` h=36px, opacity 0.3, margin-bottom 40px, centered.
- Blockquote: Yrsa 400 italic, 38px≈28.5pt, `FFFFFF`, line-height 1.4, centered, max-width 840px. Margin-bottom 36px. Use actual curly opening/closing quotes around the text.
- Attribution: Heebo 600, 13px≈9.75pt, letter-spaced 0.18em, uppercase, `rgba(255,255,255,0.4)` → use solid `9B9CAD`.

#### 12. Closing / Global Presence

// CLOSING — não editar. Layout fixado a partir do template.

**This slide is mandatory and must always be the last slide of every GCS deck — no exceptions.** Content is fixed boilerplate — do not customize company details, countries, address, or contacts.

**Provenance — verified byte-for-byte against `template (1).pptx`.** Every shape's x/y/w/h, font, size, weight, and color below was re-extracted from that file with `python-pptx` and matches this spec exactly (0.000in error on every anchor). Every embedded image (logo, closing-pin, social-media-icons, background gradient) is pixel-identical (PIL diff bbox=`None`) to the corresponding file in `skills/gcs-pptx/assets/` and `assets/logos/`. All 6 text boxes are `anchor="t"` in the template — the `valign: 'top'` on every `addText` call below is not decorative, it's required to eliminate a real vertical drift (confirmed via rendered pixel-diff: pptxgenjs defaults to vertical-center when `valign` is omitted, which silently pushed text ~0.2in down inside these oversized boxes). **Do not "fix" or re-tune any value here without first re-diffing against a template file** — this spec is the ground truth.

Background: `A('background-closing.png')` — dark navy gradient (same asset as Section Intro). **Never substitute a flat colour.**

```javascript
// CLOSING — não editar. Layout fixado a partir do template.
slide.background = { path: A('background-closing.png') };

// Logo — top-left, margin 0.833in
slide.addImage({
  path: A('assets/logos/GCS-Primary-White.png'),
  x: 0.833, y: 0.833, w: 1.400, h: 0.500
});

// Title block — single addText with runs (never split into 2 separate addText calls)
// valign: 'top' is required — template box is anchor="t"; pptxgenjs defaults to
// vertically-centered, which drifts text down inside this deliberately oversized box.
slide.addText([
  { text: 'Our Global ', options: { color: 'FFFFFF' } },
  { text: 'Presence',   options: { color: 'B3B5CD', italic: true } }
], { x: 0.833, y: 2.270, w: 6.366, h: 1.300,
     fontFace: 'Yrsa', fontSize: 52, bold: false, valign: 'top', margin: 0 });

// Subtitle
slide.addText('Global Citizen Solutions supports clients across residency and citizenship by investment programmes worldwide.', {
  x: 0.833, y: 3.330, w: 6.366, h: 0.600,
  fontFace: 'Heebo', fontSize: 14, bold: false, color: 'A8B3CD', valign: 'top', margin: 0
});

// Location pin (required — never omit)
slide.addImage({ path: A('closing-pin.png'), x: 0.833, y: 4.420, w: 0.180, h: 0.180 });

// Countries — 2 paragraphs in one text box
slide.addText([
  { text: 'ANTIGUA AND BARBUDA | BRAZIL | DUBAI | GRENADA | ITALY | MALTA | PORTUGAL', options: { breakLine: true } },
  { text: 'SPAIN | ST. LUCIA | SWITZERLAND | TURKEY | UNITED KINGDOM | VANUATU' }
], { x: 0.833, y: 4.620, w: 9.760, h: 0.650,
     fontFace: 'Heebo', fontSize: 14, bold: false, color: 'FFFFFF', valign: 'top', margin: 0 });

// URL
slide.addText('GLOBALCITIZENSOLUTIONS.COM', {
  x: 0.833, y: 5.887, w: 6.120, h: 0.180,
  fontFace: 'Heebo', fontSize: 12, bold: false, color: 'FFFFFF', valign: 'top', margin: 0
});

// Social media icons row (required — never omit)
slide.addImage({ path: A('social-media-icons.png'), x: 0.833, y: 6.473, w: 3.419, h: 0.444 });

// Column 2 — address (left-aligned; right margin = 0.833in)
slide.addText([
  { text: 'Studio 5 Richmond Road, Kingston-Upon-Thames', options: { breakLine: true } },
  { text: 'KT2 5BX &#x2014; United Kingdom' }
], { x: 9.470, y: 5.377, w: 3.030, h: 0.550,
     fontFace: 'Heebo', fontSize: 14, bold: false, color: 'FFFFFF', align: 'left', valign: 'top', margin: 0 });

// Column 2 — contact
slide.addText([
  { text: '+44 20 8068 3119', options: { breakLine: true } },
  { text: 'info@globalcitizensolutions.com' }
], { x: 9.470, y: 6.367, w: 3.030, h: 0.550,
     fontFace: 'Heebo', fontSize: 14, bold: true, color: 'FFFFFF', align: 'left', valign: 'top', margin: 0 });
```

#### 13. Section Intro

**Chrome próprio — gradiente escuro. Não usar `addContentChrome()`.**

**Zone composition:** slide inteiro — kicker opcional + título, bloco centrado verticalmente no ponto médio do slide (y=3.750in).

---

Background: `A('background-closing.png')` (mesmo gradiente do Closing). Ultra-minimalista: fundo + kicker (opcional) + título, sem logo, sem footer.

**Título sozinho** (sem kicker) — spec original, extraída de `template (1).pptx`: single text box centrado no ponto médio do slide (y=3.356, h=0.788 → centro = 3.750in = metade exata de 7.5in):

```javascript
slide.background = { path: A('background-closing.png') };

slide.addText(sectionTitle, {
  x: 0.833, y: 3.356, w: 9.535, h: 0.788,
  fontFace: 'Yrsa', fontSize: 45, bold: false, color: 'FFFFFF',
  valign: 'top', margin: 0
});
```

**Com kicker** (recomendado — ex: "Section One"): mesmo tratamento do eyebrow da Capa (Heebo 600, 9.75pt, uppercase, `3F8CFF`). O bloco kicker+título é recentrado no mesmo ponto médio (3.750in) usando o padrão `blockH`/`yStart` já usado no archetype Hero Stat (#14):

```javascript
slide.background = { path: A('background-closing.png') };

const kickerH = 0.200;  // mesma altura do eyebrow da Capa
const gap     = 0.167;  // 16px — token de espaçamento já usado no divider do chrome
const titleH  = 0.788;  // altura real da caixa de título para 1 linha (inalterada)

const blockH  = kickerH + gap + titleH;
const yStart  = 3.750 - blockH / 2;
const yKicker = yStart;
const yTitle  = yStart + kickerH + gap;

slide.addText(kicker.toUpperCase(), {
  x: 0.833, y: yKicker, w: 9.535, h: kickerH,
  fontFace: 'Heebo', fontSize: 9.75, bold: true, color: '3F8CFF',
  valign: 'middle', margin: 0
});
slide.addText(sectionTitle, {
  x: 0.833, y: yTitle, w: 9.535, h: titleH,
  fontFace: 'Yrsa', fontSize: 45, bold: false, color: 'FFFFFF',
  valign: 'top', margin: 0
});
```

**Se o título fizer wrap para N linhas**, cresce `titleH` em `lineAdvance ≈ 0.663in` (45pt × 1.06 ÷ 72) por linha extra e recalcula `blockH`/`yStart` — o bloco inteiro permanece centrado no ponto médio do slide.

**Pitfall:** sem logo nem footer — qualquer elemento extra além do kicker opcional não pertence a este archetype.

---

#### 14. Hero Stat

**Chrome:** `addContentChrome(slide, pres, kicker, pageNum)` — obrigatório.

**Zone composition:**
- [ZONA FULL]: 1–2 valores numéricos grandes + headline, centrados vertical e horizontalmente.

---

Background `F7F8FA`. Layout centrado na área de corpo (y_start=1.032in, y_end=6.594in, centre=3.813in).

**1 valor:**
- Headline: Yrsa 500, 38px≈28.5pt, `16182A`, centrado, w=6.667in, margin-bottom 0.417in.
- Valor: Yrsa 500, 96px≈72pt, `000957`, centrado. Altura ≈ 72÷72×1.1 = 1.1in.
- Label: Heebo 600, 12px≈9pt, uppercase, `9B9CAD`, centrado, margin-top 0.083in.

```javascript
// Centrar bloco verticalmente
const blockH = 0.42 + 0.417 + 1.1 + 0.083 + 0.167; // headline + gap + valor + gap + label
const yStart = 3.813 - blockH / 2;
slide.addText('Headline text', {
  x: 3.333, y: yStart, w: 6.667, h: 0.42,
  fontFace: 'Yrsa', fontSize: 28.5, color: '16182A', align: 'center', valign: 'middle'
});
slide.addText('94%', {
  x: 0.667, y: yStart + 0.42 + 0.417, w: 12.0, h: 1.1,
  fontFace: 'Yrsa', fontSize: 72, bold: false, color: '000957', align: 'center', valign: 'middle'
});
slide.addText('SUCCESS RATE', {
  x: 0.667, y: yStart + 0.42 + 0.417 + 1.1 + 0.083, w: 12.0, h: 0.167,
  fontFace: 'Heebo', fontSize: 9, bold: true, color: '9B9CAD', charSpacing: 4, align: 'center'
});
```

**2 valores:**
- Headline igual acima.
- Separador vertical RECTANGLE 1px `E0E2EA` entre os valores (h≈1.5in, centrado).
- Cada valor: Yrsa 500 96px≈72pt `000957` + label Heebo 600 12px uppercase `9B9CAD` abaixo.
- Gap entre os 2 blocos de valor: 0.833in (80px).

**Pitfall:** pptxgenjs não tem flexbox — posicionar cada elemento manualmente usando y calculado a partir do centro do corpo. Calcular altura total do bloco antes de posicionar.

---

#### 15. Comparison

**Chrome:** `addContentChrome(slide, pres, kicker, pageNum)` — obrigatório.

**Zone composition:**
- [HEADLINE]: Yrsa 500 38px≈28.5pt `16182A` (opcional)
- [ZONA FULL]: tabela 2–3 colunas com headers coloridos por coluna

---

Usar quando 2–3 programas/países têm identidade visual distinta por coluna. Preferir ao archetype Table quando o header colorido adiciona valor semântico.

```javascript
const headerColors = ['000957', '3F8CFF', '16182A'];  // col 1, 2, 3
const headers = ['Programme', 'Option A', 'Option B'];

const headerRow = headers.map((h, i) => ({
  text: h,
  options: {
    fill: { color: headerColors[i] }, color: 'FFFFFF',
    bold: true, fontFace: 'Heebo', fontSize: 9.75, align: 'center'
  }
}));

const dataRows = rows.map((row, rIdx) =>
  row.map((cell, cIdx) => ({
    text: typeof cell === 'string' ? cell : cell.text,
    options: {
      fill: { color: rIdx % 2 === 0 ? 'FFFFFF' : 'F8F9FB' },
      color: '343750', fontFace: 'Heebo', fontSize: 9,
      align: cIdx === 0 ? 'left' : 'center'
    }
  }))
);

slide.addTable([headerRow, ...dataRows], {
  x: 0.667, y: 1.532, w: 12.0,
  border: { pt: 1, color: 'E0E2EA' },
  fill: { color: 'FFFFFF' }
});
```

**Flags em Col 1:** `addImage` posicionado manualmente sobre a célula (pptxgenjs não suporta imagens em células). Calcular x/y de cada linha a partir de y_table, rowHeight, e cIdx=0 x.

**Pitfall:** `fill` por célula requer pptxgenjs ≥3.x. Verificar na versão instalada. Se `fill` por célula falhar: usar shapes RECTANGLE como header manual sobre a tabela.

### Logos

Use the official pre-rasterized PNGs — **no SVG rasterization needed for logos**:

| File | Pixel size | Ratio (w÷h) |
|------|-----------|-------------|
| `assets/logos/GCS-Primary-{color}.png` | 793×283 | 2.80 |
| `assets/logos/GCS-Secondary-{color}.png` | 1077×65 | 16.57 |
| `assets/logos/GCS-Symbol-{color}.png` | 278×283 | 0.98 |

**Never hardcode a guessed aspect ratio** — Primary and Secondary have very different proportions (2.80 vs 16.57). Compute the missing dimension from the table every time.

- **White** variants: dark (Night Blue) backgrounds — title, quote, closing slides.
- **Blue** or **Black** variants: light backgrounds — content, image, chart, table, agenda, steps, stats, timeline, schedule slides.
- **Symbol** (mark only): quote slide.

### Icons

Prefer `assets/icons/{outlined|rounded|sharp}/{name}[-fill].svg` (91MB, shared across the whole design-system repo, requires that repo checked out alongside this folder). Default: **outlined**, 24px, unless heavier/lighter feel needed.

**If the full repo isn't checked out** (skill running standalone), fetch the Material Symbol on demand instead of skipping it — same fallback `gcs-brochure` uses (`curl` via Bash, never the WebFetch tool):

```bash
curl -sL "https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/account_balance/materialsymbolsoutlined/account_balance_24px.svg" -o account_balance.svg
```

Only ask the user for the specific SVG if that fetch itself fails (icon name not found in Material Symbols).

Unlike `gcs-brochure` — which inlines the fetched SVG markup directly into HTML (`fill="currentColor"`) — OOXML slide shapes can't hold inline scalable vector markup, so every icon (repo-sourced or fetched) still has to be rasterized to PNG and recolored before embedding:

```python
import cairosvg
svg = open("assets/icons/outlined/account_balance.svg").read()  # or the curl-fetched file
svg = svg.replace("<svg ", '<svg fill="#000957" ', 1)  # or "#FFFFFF" on dark backgrounds
cairosvg.svg2png(bytestring=svg.encode(), write_to="account_balance-24.png", output_width=24, output_height=24)
```

For icon squares on agenda/steps/timeline slides: rasterize at 40×40px with white fill, embed as PNG.

### Flags

**Not bundled in this skill** — `assets/flags/` (6.3MB, shared across the whole design-system repo) requires that repo checked out alongside this folder. If this skill is running standalone (repo not present), skip flags or ask the user for the specific PNGs.

Use `assets/flags/{iso-alpha-2}.png` (lowercase ISO 3166-1 alpha-2 codes, self-hosted from [msikma/country-flags](https://github.com/msikma/country-flags)) — already PNG, no rasterization needed. Embed at ~24×24px (w=h) with `addImage({ ..., rounding: true })` for a circular crop — `rounding` only produces a perfect circle when width and height are equal; since the source PNG isn't square, there's no `object-fit`-style cover in `addImage`, but setting w=h=24 already center-crops it. The UK is `gb.png` here (upstream names it `uk.png`). A few dependencies/micro-territories and UK sub-nations that repo doesn't cover are still `.svg` — rasterize only those with `cairosvg` as above.

Common codes: `pt` Portugal, `mt` Malta, `es` Spain, `gr` Greece, `cy` Cyprus, `gd` Grenada, `lc` St Lucia, `dm` Dominica, `ag` Antigua & Barbuda.

### Shape Language

Sharp corners everywhere (`border-radius: 0`) — deliberate brand choice. One exception: **no 4px radius exception exists in the current template** — content cards (`F8F9FB` mini stats, stat panel) use `border:1px solid #E0E2EA` with no radius in `Slides.dc.html` and `content.card.html`. Keep all shapes sharp.

Cards get a thin 1px border (`E0E2EA`), not a drop shadow. Reserve shadows for floating/modal elements only.

### Voice & Copy

- UK English spelling (programme, colour, organised, authorise) — never US spelling.
- Title Case for headings/CTAs, Sentence case for body copy.
- No emoji. No exclamation marks.
- Confident, precise, warm — not hype-y. Prefer "Book a Consultation" / "Explore Your Options" over generic AI-deck CTAs.

### Spacing

- 0.667in (64px) standard content margins.
- 0.5in (48px) minimum between content blocks.
- Leave breathing room on sparse slides (title, quote, closing).

### Avoid (GCS-Specific)

- **Don't pick a topic color palette** — GCS has one fixed brand palette; use it on every deck.
- **Don't use Raleway, Source Sans 3, or any other font** — Yrsa/Heebo/JetBrains Mono only.
- **Don't use rounded corners** — sharp corners everywhere.
- **Don't substitute fonts** — no Arial/Calibri/Georgia/etc.
- **Don't use Star Gold decoratively** — ratings/badges only.
- **Don't center body text** — left-align paragraphs; center only titles/quotes.
- **Don't use drop shadows on cards** — use 1px `E0E2EA` border instead.
- **Don't use emoji or exclamation marks** — off-brand.
- **Don't mix US spelling** — UK English throughout.
- **Don't accent lines under titles** — whitespace or background color instead.
- **Don't create text-only slides** — every slide needs a stat, chart, table, image, or the quote/closing visual treatment.
- **Don't omit the closing slide** — it is mandatory and always the last slide of every GCS deck.
- **Don't use pale chart colors** — white data labels need dark-enough fill (verify in rendered image).
- **Don't use a straight `"` in the quote slide** — U+201C curly quote only.

---

## QA (Required)

**Assume there are problems. Your job is to find them.**

Your first render is almost never correct. Approach QA as a bug hunt, not a confirmation step.

### Pre-Delivery Checklist

Run through this before declaring done. Every "fail" must be fixed and re-rendered.

- [ ] **Slide 1** — Wave texture is visible (NOT flat solid navy). Open the thumbnail and look for curved blue lines in the lower-right area.
- [ ] **Slide 1** — Text block is bottom-anchored, not vertically centred.
- [ ] **Every content slide** — Logo variant is correct: White on dark backgrounds, Blue or Black on light backgrounds.
- [ ] **Quote slide** — The large background `"` renders as a quotation mark shape, not two vertical bars. If you see `||` you used U+0022 — fix it to U+201C.
- [ ] **Closing slide** — Background shows dark navy gradient (same as Section Intro). NOT flat solid navy.
- [ ] **Closing slide** — Social media icons PNG present below URL (w=3.419in).
- [ ] **Closing slide** — Location pin present before countries row.
- [ ] **All slides** — No "VISUAL PLACEHOLDER" text visible where real content was expected.
- [ ] **All slides** — No leftover template kicker text (e.g. "SLIDE TITLE", "SECTION NAME").
- [ ] **All slides** — Footer present: copyright line on the left, page number on the right.
- [ ] **All slides** — No content truncated into a trailing "Also mapped:" or "Other:" paragraph.

### Content QA

```bash
python -m markitdown output.pptx
```

Check for missing content, typos, wrong order.

**Check for leftover placeholder text:**

```bash
python -m markitdown output.pptx | grep -iE "xxxx|lorem|ipsum|this.*(page|slide).*layout"
```

### Visual QA

**⚠️ USE SUBAGENTS** — even for 2–3 slides. You've been staring at the code and will see what you expect, not what's there.

Convert slides to images (see Converting to Images), then use this prompt:

```
Visually inspect these slides. Assume there are issues — find them.

Look for:
- Overlapping elements (text through shapes, lines through words)
- Text overflow or cut off at edges/box boundaries
- Elements too close (< 0.5in gaps) or nearly touching
- Uneven gaps
- Insufficient margin from slide edges (< 0.667in)
- Columns or similar elements not aligned
- Low-contrast text (especially muted gray on off-white)
- Low-contrast icons on dark backgrounds
- Leftover placeholder content
- Wrong GCS color hex values (compare against the Colors table in SKILL.md)
- Wrong font (Yrsa for headlines, Heebo for body, JetBrains Mono for data)
- Wrong logo variant (White on dark, Blue/Black on light)
- Rounded corners on any shape (should be sharp)
- Emoji, exclamation marks, or US spelling
- Headings not in Title Case, body not in Sentence case
- Title slide: missing wave texture (flat solid navy instead), or text block vertically centered instead of bottom-anchored
- Stats slide: KPI card positioned correctly (overlapping left edge of photo, not floating separately)
- Closing slide: flat gradient instead of radial, wrong countries/address/contact boilerplate, missing social icons PNG

For each slide, list issues or areas of concern, even if minor.

Read and analyze these images:
1. /path/to/slide-01.jpg (Expected: [brief description])
...

Report ALL issues found, including minor ones.
```

### Verification Loop

1. Generate slides → **Embed fonts** → Convert to images → Inspect
2. **List issues found** (if none found, look again more critically)
3. Fix issues
4. **Re-verify affected slides** — one fix often creates another problem
5. Repeat until a full pass reveals no new issues

**Do not declare success until you've completed at least one fix-and-verify cycle.**

Screenshot QA (below) cannot detect a missing font embed — LibreOffice substitutes the same way Google Slides does, so a visually correct render proves nothing about PowerPoint desktop. Confirm the embed itself happened instead:

```bash
unzip -p output.pptx ppt/presentation.xml | grep -o 'embedTrueTypeFonts="1"'
unzip -p output.pptx ppt/presentation.xml | grep -o '<p:embeddedFontLst>'
```

Both must print a match before the deck is considered done.

---

## Embedding Fonts

**Mandatory, every build, before converting to images.** Embeds real Heebo/Yrsa/JetBrains Mono TrueType data into the `.pptx` (`ppt/fonts/*.fntdata` + `<p:embeddedFontLst>` in `presentation.xml`) so PowerPoint desktop renders the correct fonts without requiring them installed locally:

```bash
python scripts/embed_fonts.py output.pptx
```

Fonts are bundled at `assets/fonts/`. Run this on the final `.pptx`, whichever workflow produced it (template-based repack or pptxgenjs from-scratch) — it operates on the finished file, not on the build process.

**Embedding alone is not fully reliable on PowerPoint for Mac.** Verified: the embedded font data this script writes is byte-identical to the source `.ttf` files and structurally correct OOXML (unrestricted `fsType`, correct relationships/content-types) — but PowerPoint for Mac's support for *reading* embedded fonts is known to be inconsistent (Microsoft's own support forums document decks that keep losing/ignoring embedded fonts on Mac). Windows PowerPoint honors the embed reliably; Mac PowerPoint sometimes doesn't. **If a reviewer is on Mac and still sees a substitute font despite a correctly embedded file, install the real fonts locally as a companion fix** — copy every `.ttf` from `assets/fonts/` into `~/Library/Fonts/` (no admin password needed) — this makes PowerPoint use the real font directly regardless of embedding support. Keep both: embedding still matters for Windows recipients who don't have these fonts installed.

## Converting to Images

```bash
python scripts/office/soffice.py --headless --convert-to pdf output.pptx
pdftoppm -jpeg -r 150 output.pdf slide
```

Creates `slide-01.jpg`, `slide-02.jpg`, etc.

To re-render specific slides after fixes:

```bash
pdftoppm -jpeg -r 150 -f N -l N output.pdf slide-fixed
```

---

## Dependencies

- `pip install "markitdown[pptx]"` — text extraction
- `pip install Pillow` — thumbnail grids, stripe pattern PNG generation
- `pip install cairosvg` — SVG icon rasterization (flags are self-hosted PNG, no rasterization needed except the few legacy-SVG exceptions)
- `npm install -g pptxgenjs` — creating from scratch
- LibreOffice (`soffice`) — PDF conversion (auto-configured via `scripts/office/soffice.py`)
- Poppler (`pdftoppm`) — PDF to images
