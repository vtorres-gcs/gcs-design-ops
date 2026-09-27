/**
 * investment-panel — bordered sidebar card: "INVESTMENT OPTIONS" eyebrow +
 * up to 4 rows of {title, subtitle, amount}, hairline divider between rows.
 * Ported from templates/brochures/factsheet/Factsheet.dc.html's right-column
 * sidebar (232px wide in source).
 *
 * @param {Slide} slide
 * @param {Presentation} pres
 * @param {object} props
 * @param {string} [props.heading] - default 'INVESTMENT OPTIONS'
 * @param {{title:string, subtitle?:string, amount:string}[]} props.rows - up to 4
 * @param {number} y
 * @param {{marginX?: number, contentW?: number}} [layout]
 * @returns {number} new Y cursor
 */
const { MARGIN_X, CONTENT_W, COLORS, FONTS } = require('../tokens');
const { estimateTextHeight, estimateLineWidth } = require('../estimate-text-height');

const PAD_X = 0.167; // 16px
const ROW_PAD_Y = 0.083;
const TOP_PAD = 0.21;
const BOTTOM_PAD = 0.13;

function addInvestmentPanel(slide, pres, { heading = 'Investment Options', rows = [] }, y, layout = {}) {
  const { marginX: x = MARGIN_X, contentW: w = CONTENT_W } = layout;
  const innerW = w - 2 * PAD_X;

  const items = rows.filter((r) => r && (r.title || r.amount)).slice(0, 4);
  // Amount column is only as wide as its longest actual value needs (source:
  // `flex-shrink: 0`, not a fixed reservation) — freeing more width for the
  // title/subtitle column, which is otherwise the tightest spot in this
  // 232px-wide sidebar.
  const AMOUNT_W = Math.max(0.5, ...items.map((r) => estimateLineWidth(r.amount || '', 13, 'Heebo Bold'))) + 0.15;
  const textW = innerW - AMOUNT_W - 0.083;
  const rowMetrics = items.map((row) => {
    // The shared word-wrap heuristic under-shoots LibreOffice's actual line
    // pitch at this narrow (~1.4in) width/font-size combo (confirmed via the
    // QA render: text overlapped the next row's divider) — a 1.2x safety
    // factor closes the gap, same calibration issue narrative.js's
    // subSections hit at a different width/size.
    const titleH = (estimateTextHeight(row.title, textW, 12, 1.3, 'Heebo Medium') + 0.03) * 1.2;
    const subH = row.subtitle ? (estimateTextHeight(row.subtitle, textW, 10, 1.35, FONTS.body) + 0.03) * 1.2 : 0;
    return { titleH, subH, rowH: Math.max(titleH + subH, 0.18) };
  });

  const headingH = 0.14 + 0.1;
  const rowsH = rowMetrics.reduce((sum, m) => sum + ROW_PAD_Y + m.rowH, 0);
  const h = TOP_PAD + headingH + rowsH + BOTTOM_PAD;

  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color: COLORS.surface }, line: { color: COLORS.hairline, width: 0.75 }, rectRadius: 0,
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

    slide.addText(row.title || '', {
      x: x + PAD_X, y: cy, w: textW, h: m.titleH, fontFace: FONTS.labelMedium, fontSize: 12, color: COLORS.headingInk,
      valign: 'top', margin: 0,
    });
    if (row.subtitle) {
      slide.addText(row.subtitle, {
        x: x + PAD_X, y: cy + m.titleH, w: textW, h: m.subH, fontFace: FONTS.body, fontSize: 10, color: COLORS.mutedInk,
        lineSpacingMultiple: 1.35, valign: 'top', margin: 0,
      });
    }
    slide.addText(row.amount || '', {
      x: x + PAD_X + textW + 0.083, y: cy, w: AMOUNT_W, h: 0.18,
      fontFace: FONTS.labelBold, fontSize: 13, color: COLORS.nightBlue, align: 'right', valign: 'top', margin: 0, wrap: false,
    });

    cy += m.rowH;
  });

  return y + h;
}

module.exports = { addInvestmentPanel };
