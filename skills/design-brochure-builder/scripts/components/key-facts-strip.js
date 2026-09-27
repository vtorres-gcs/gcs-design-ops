/**
 * key-facts-strip — light card, up to 3 columns divided by hairline
 * `border-right` (not separate tiles/gaps like stat-strip-light), each with
 * a small muted uppercase label + a Yrsa value. Ported from
 * templates/brochures/case-study/CaseStudy.dc.html's "Key facts strip".
 *
 * @param {Slide} slide
 * @param {Presentation} pres
 * @param {{label:string, value:string}[]} facts - up to 3
 * @param {number} y
 * @param {{marginX?: number, contentW?: number}} [layout]
 * @returns {number} new Y cursor
 */
const { MARGIN_X, CONTENT_W, COLORS, FONTS } = require('../tokens');
const { estimateTextHeight } = require('../estimate-text-height');

function addKeyFactsStrip(slide, pres, facts, y, layout = {}) {
  const { marginX: x = MARGIN_X, contentW: w = CONTENT_W } = layout;
  const pad = 0.229;
  const colW = (w - 2 * pad) / facts.length;
  const innerW = colW - 0.208;

  // Values can wrap to 2 lines in a narrow column (e.g. a 3-column strip in
  // a 2.6in-wide right column) — size the card from the tallest value.
  const valueHeights = facts.map((f) => estimateTextHeight(f.value, innerW, 20, 1.15, 'Yrsa'));
  const maxValueH = Math.max(0.28, ...valueHeights);
  const h = 0.4 + maxValueH + 0.19;

  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: COLORS.surface }, line: { type: 'none' }, rectRadius: 0.0625 });

  facts.slice(0, 3).forEach((f, i) => {
    const cx = x + pad + i * colW;
    if (i < facts.length - 1) {
      slide.addShape(pres.shapes.LINE, {
        x: cx + colW - 0.208, y: y + 0.15, w: 0, h: h - 0.3,
        line: { color: COLORS.hairlineTint, width: 0.75 },
      });
    }
    slide.addText((f.label || '').toUpperCase(), {
      x: cx, y: y + 0.19, w: innerW, h: 0.15,
      fontFace: FONTS.labelBold, fontSize: 7, color: COLORS.faintInk, charSpacing: 1.8, valign: 'top', margin: 0,
    });
    slide.addText(f.value, {
      x: cx, y: y + 0.4, w: innerW, h: maxValueH,
      fontFace: FONTS.heading, fontSize: 20, color: COLORS.accent, valign: 'top', margin: 0,
    });
  });

  return y + h;
}

module.exports = { addKeyFactsStrip };
