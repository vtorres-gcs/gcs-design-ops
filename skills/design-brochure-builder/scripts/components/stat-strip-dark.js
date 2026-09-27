/**
 * stat-strip-dark — horizontal strip of 2-4 headline numbers on Night Blue.
 * Ported from skills/gcs-brochure/components/stat-strip-dark.html.
 *
 * @param {Slide} slide
 * @param {Presentation} pres
 * @param {{value:string, label:string, desc?:string}[]} stats - 2 to 4 entries (desc only used by the 'eyebrow' variant)
 * @param {number} y
 * @param {{marginX?: number, contentW?: number}} [layout] - per-template margin override
 * @param {{variant?: 'eyebrow'}} [opts] - 'eyebrow': factsheet's 3-tile variant (small accent eyebrow label ABOVE the value, plus a muted desc line below — a 3-line stack). Omit for the legacy value-then-label 2-line tiles (case-study/lead-magnet/giu-corporate), unchanged.
 * @returns {number} new Y cursor
 */
const { MARGIN_X, CONTENT_W, COLORS, FONTS, WHITE_ON_NIGHT_BLUE } = require('../tokens');
const { estimateTextHeight } = require('../estimate-text-height');

const MIN_HEIGHT = 1.0; // 96px fixed floor per components.md; grows if a label wraps to 2+ lines

function addStatStripDark(slide, pres, stats, y, layout = {}, opts = {}) {
  const { marginX: x = MARGIN_X, contentW: w = CONTENT_W } = layout;
  const tileW = w / stats.length;
  const innerW = tileW - 0.4;

  if (opts.variant === 'eyebrow') {
    const padX = 0.208;
    const innerWE = tileW - 2 * padX;
    const descHeights = stats.map((s) => estimateTextHeight(s.desc || '', innerWE, 9.5, 1.35, FONTS.body));
    const maxDescH = Math.max(0.14, ...descHeights);
    const h = 0.1875 + 0.13 + 0.06 + 0.31 + 0.06 + maxDescH + 0.167;

    slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: COLORS.nightBlue }, line: { type: 'none' }, rectRadius: 0.0625 });

    stats.forEach((s, i) => {
      const tx = x + i * tileW;
      if (i < stats.length - 1) {
        slide.addShape(pres.shapes.LINE, {
          x: tx + tileW, y: y + 0.15, w: 0, h: h - 0.3,
          line: { color: WHITE_ON_NIGHT_BLUE[10], width: 0.75 },
        });
      }
      let ty = y + 0.1875;
      slide.addText((s.label || '').toUpperCase(), {
        x: tx + padX, y: ty, w: innerWE, h: 0.13,
        fontFace: FONTS.labelBold, fontSize: 7, color: COLORS.accent, charSpacing: 2, valign: 'top', margin: 0,
      });
      ty += 0.13 + 0.06;
      slide.addText(s.value, {
        x: tx + padX, y: ty, w: innerWE, h: 0.31,
        fontFace: FONTS.heading, fontSize: 22, color: COLORS.white, valign: 'top', margin: 0,
      });
      ty += 0.31 + 0.06;
      slide.addText(s.desc || '', {
        x: tx + padX, y: ty, w: innerWE, h: maxDescH,
        fontFace: FONTS.body, fontSize: 9.5, color: WHITE_ON_NIGHT_BLUE[50], lineSpacingMultiple: 1.35, valign: 'top', margin: 0,
      });
    });

    return y + h + 0.35;
  }

  // Charspaced uppercase labels wrap wider than the plain estimate assumes —
  // pad the width fudge-factor used for line-count so a long label reliably
  // gets counted as 2 lines instead of clipping at 1.
  const labelHeights = stats.map((s) => estimateTextHeight((s.label || '').toUpperCase(), innerW * 0.82, 7.5, 1.3, 'Heebo Medium'));
  const maxLabelH = Math.max(0.15, ...labelHeights);
  const h = Math.max(MIN_HEIGHT, 0.68 + maxLabelH + 0.17);

  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: COLORS.nightBlue }, line: { type: 'none' }, rectRadius: 0.0625 });

  stats.forEach((s, i) => {
    const tx = x + i * tileW;
    if (i < stats.length - 1) {
      slide.addShape(pres.shapes.LINE, {
        x: tx + tileW, y: y + 0.15, w: 0, h: h - 0.3,
        line: { color: WHITE_ON_NIGHT_BLUE[10], width: 0.75 },
      });
    }
    slide.addText(s.value, {
      x: tx + 0.29, y: y + 0.15, w: innerW, h: 0.5,
      fontFace: FONTS.heading, fontSize: 31.5, color: COLORS.white, valign: 'top', margin: 0,
    });
    slide.addText((s.label || '').toUpperCase(), {
      x: tx + 0.29, y: y + 0.68, w: innerW, h: maxLabelH,
      fontFace: FONTS.labelMedium, fontSize: 7.5, color: WHITE_ON_NIGHT_BLUE[45],
      charSpacing: 2.3, valign: 'top', margin: 0,
    });
  });

  return y + h + 0.5;
}

module.exports = { addStatStripDark };
