/**
 * cta-panel — Night Blue call-to-action block: 2-line heading (2nd italic),
 * body, email, and an optional 3-stat results strip. Ported from
 * skills/gcs-brochure/components/cta-panel.html.
 *
 * @param {Slide} slide
 * @param {Presentation} pres
 * @param {object} props
 * @param {string} props.ctaLine1
 * @param {string} props.ctaLine2
 * @param {string} props.ctaBody
 * @param {string} [props.ctaEmail]
 * @param {{value:string, label:string}[]} [props.results] - up to 3; omit for a pure CTA
 * @param {number} y
 * @param {{marginX?: number, contentW?: number}} [layout] - per-template margin override
 * @returns {number} new Y cursor
 */
const { MARGIN_X, CONTENT_W, COLORS, FONTS, WHITE_ON_NIGHT_BLUE } = require('../tokens');
const { estimateTextHeight } = require('../estimate-text-height');

function addCtaPanel(slide, pres, { ctaLine1, ctaLine2, ctaBody, ctaEmail, results }, y, layout = {}) {
  const { marginX: x = MARGIN_X, contentW: w = CONTENT_W } = layout;
  const px = x + 0.5, pw = Math.min(w - 1.0, 5.42);

  const bodyH = estimateTextHeight(ctaBody, pw, 11.25, 1.75, FONTS.body);
  const contentH = 0.5 + 0.14 + 0.25 + 0.62 + 0.75 + 0.25 + 0.25 + bodyH + 0.2 + (ctaEmail ? 0.2 : 0) + 0.5;
  const stripH = results && results.length ? 1.0 : 0;
  const totalH = contentH + stripH;

  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h: totalH, fill: { color: COLORS.nightBlue }, line: { type: 'none' }, rectRadius: 0.0625 });

  let cy = y + 0.5;
  slide.addText('NEXT STEPS', {
    x: px, y: cy, w: pw, h: 0.14, fontFace: FONTS.label, fontSize: 7.5,
    color: WHITE_ON_NIGHT_BLUE[45], charSpacing: 3.2, margin: 0,
  });
  cy += 0.25;
  slide.addText(ctaLine1, { x: px, y: cy, w: pw, h: 0.62, fontFace: FONTS.heading, fontSize: 33, color: COLORS.white, valign: 'top', margin: 0 });
  cy += 0.62;
  slide.addText(ctaLine2, { x: px, y: cy, w: pw, h: 0.62, fontFace: FONTS.heading, fontSize: 33, italic: true, color: COLORS.lavender, valign: 'top', margin: 0 });
  cy += 0.75;

  slide.addShape(pres.shapes.LINE, { x: px, y: cy, w: 0.5, h: 0, line: { color: WHITE_ON_NIGHT_BLUE[20], width: 0.75 } });
  cy += 0.25;

  slide.addText(ctaBody, {
    x: px, y: cy, w: pw, h: bodyH, fontFace: FONTS.body, fontSize: 11.25,
    color: WHITE_ON_NIGHT_BLUE[65], lineSpacingMultiple: 1.75, valign: 'top', margin: 0,
  });
  cy += bodyH + 0.2;

  if (ctaEmail) {
    slide.addText(ctaEmail.toUpperCase(), {
      x: px, y: cy, w: pw, h: 0.2, fontFace: FONTS.labelMedium, fontSize: 9,
      color: WHITE_ON_NIGHT_BLUE[50], charSpacing: 1.7, margin: 0,
    });
  }

  if (results && results.length) {
    const stripY = y + contentH;
    slide.addShape(pres.shapes.LINE, { x, y: stripY, w, h: 0, line: { color: WHITE_ON_NIGHT_BLUE[10], width: 0.75 } });
    const tileW = w / results.length;
    results.slice(0, 3).forEach((r, i) => {
      const tx = x + i * tileW;
      slide.addText(r.value, {
        x: tx + 0.29, y: stripY + 0.2, w: tileW - 0.4, h: 0.45,
        fontFace: FONTS.heading, fontSize: 28.5, color: COLORS.white, valign: 'top', margin: 0,
      });
      slide.addText((r.label || '').toUpperCase(), {
        x: tx + 0.29, y: stripY + 0.65, w: tileW - 0.4, h: 0.2,
        fontFace: FONTS.labelMedium, fontSize: 6.75, color: WHITE_ON_NIGHT_BLUE[60],
        charSpacing: 2.3, valign: 'top', margin: 0,
      });
    });
  }

  return y + totalH + 0.417;
}

module.exports = { addCtaPanel };
