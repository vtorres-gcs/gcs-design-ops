/**
 * stat-strip-light — 3-column grid of metrics on a light background, each
 * tile with a label/value/desc. Ported from
 * skills/gcs-brochure/components/stat-strip-light.html.
 *
 * @param {Slide} slide
 * @param {Presentation} pres
 * @param {{label:string, value:string, desc:string, highlight?:boolean}[]} tiles - up to 3 per row
 * @param {number} y
 * @param {{marginX?: number, contentW?: number}} [layout] - per-template margin override
 * @returns {number} new Y cursor
 */
const { MARGIN_X, CONTENT_W, COLORS, FONTS } = require('../tokens');

function addStatStripLight(slide, pres, tiles, y, layout = {}) {
  const { marginX: x = MARGIN_X, contentW: w = CONTENT_W } = layout;
  const h = 1.25, gap = 0.02;
  const tileW = (w - 2 * gap) / 3;

  tiles.slice(0, 3).forEach((t, i) => {
    const tx = x + i * (tileW + gap);
    slide.addShape(pres.shapes.RECTANGLE, {
      x: tx, y, w: tileW, h,
      fill: { color: t.highlight ? COLORS.highlightTint : COLORS.white }, line: { type: 'none' },
    });
    slide.addText((t.label || '').toUpperCase(), {
      x: tx + 0.23, y: y + 0.22, w: tileW - 0.4, h: 0.15,
      fontFace: FONTS.labelBold, fontSize: 6.75, color: t.highlight ? COLORS.accent : COLORS.faintInk,
      charSpacing: 2.9, valign: 'top', margin: 0,
    });
    slide.addText(t.value, {
      x: tx + 0.23, y: y + 0.42, w: tileW - 0.4, h: 0.4,
      fontFace: FONTS.heading, fontSize: 28.5, color: COLORS.nightBlue, valign: 'top', margin: 0,
    });
    slide.addText(t.desc || '', {
      x: tx + 0.23, y: y + 0.85, w: tileW - 0.4, h: 0.3,
      fontFace: FONTS.body, fontSize: 8.25, color: COLORS.mutedInk, valign: 'top', margin: 0,
    });
  });

  return y + h + 0.5;
}

module.exports = { addStatStripLight };
