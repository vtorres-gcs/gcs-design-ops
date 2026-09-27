/**
 * benefits-panel — bordered sidebar card: "KEY BENEFITS" eyebrow + up to 4
 * rows of {iconPngPath, text}, hairline divider between rows. Ported from
 * templates/brochures/factsheet/Factsheet.dc.html's right-column sidebar.
 * Icons are Material Symbols, resolved to a PNG by scripts/icons.py via a
 * declarative `"icon": {"name": ...}` field (see SKILL.md "Icons") —
 * `scripts/prepare-assets.py` sets the sibling `iconPngPath` before this
 * component runs.
 *
 * @param {Slide} slide
 * @param {Presentation} pres
 * @param {object} props
 * @param {string} [props.heading] - default 'KEY BENEFITS'
 * @param {{iconPngPath?:string, text:string}[]} props.rows - up to 4
 * @param {number} y
 * @param {{marginX?: number, contentW?: number}} [layout]
 * @returns {number} new Y cursor
 */
const { MARGIN_X, CONTENT_W, COLORS, FONTS } = require('../tokens');
const { estimateTextHeight } = require('../estimate-text-height');

const PAD_X = 0.167; // 16px
const ROW_PAD_Y = 0.083;
const TOP_PAD = 0.21;
const BOTTOM_PAD = 0.09;
const ICON_SIZE = 0.167; // 16px

function addBenefitsPanel(slide, pres, { heading = 'Key Benefits', rows = [] }, y, layout = {}) {
  const { marginX: x = MARGIN_X, contentW: w = CONTENT_W } = layout;
  const innerW = w - 2 * PAD_X;
  const gap = 0.104; // 10px
  const textW = innerW - ICON_SIZE - gap;

  const items = rows.filter((r) => r && r.text).slice(0, 4);
  // Same 1.2x calibration as investment-panel.js's rows — the shared
  // heuristic under-shoots LibreOffice's actual line pitch at this narrow
  // width/font-size combo (confirmed via the QA render).
  const rowMetrics = items.map((row) => ({
    textH: Math.max(ICON_SIZE, estimateTextHeight(row.text, textW, 12, 1.4, FONTS.body) * 1.2),
  }));

  const headingH = 0.14 + 0.1;
  const rowsH = rowMetrics.reduce((sum, m) => sum + ROW_PAD_Y + m.textH, 0);
  const h = TOP_PAD + headingH + rowsH + BOTTOM_PAD;

  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color: COLORS.surface }, line: { color: COLORS.hairline, width: 0.75 },
  });

  let cy = y + TOP_PAD;
  slide.addText(heading.toUpperCase(), {
    x: x + PAD_X, y: cy, w: innerW, h: 0.14,
    fontFace: FONTS.labelBold, fontSize: 9, color: COLORS.nightBlue, charSpacing: 2, valign: 'top', margin: 0,
  });
  cy += headingH;

  items.forEach((row, i) => {
    const m = rowMetrics[i];
    slide.addShape(pres.shapes.LINE, { x: x + PAD_X, y: cy, w: innerW, h: 0, line: { color: COLORS.hairline, width: 1 } });
    cy += ROW_PAD_Y;

    if (row.iconPngPath) {
      slide.addImage({ path: row.iconPngPath, x: x + PAD_X, y: cy + 0.01, w: ICON_SIZE, h: ICON_SIZE });
    }
    slide.addText(row.text || '', {
      x: x + PAD_X + ICON_SIZE + gap, y: cy, w: textW, h: m.textH,
      fontFace: FONTS.body, fontSize: 12, color: COLORS.bodyInk, lineSpacingMultiple: 1.4, valign: 'top', margin: 0,
    });

    cy += m.textH;
  });

  return y + h;
}

module.exports = { addBenefitsPanel };
