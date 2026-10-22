/**
 * pull-quote — one component covering the 3 visual presets used by the fixed
 * templates: case-study (tinted card, no photo), lead-magnet
 * (tinted card, no photo, different border color), quarterly-report (plain
 * hairline border-top, 72px circular real photo, no tint).
 *
 * @param {Slide} slide
 * @param {Presentation} pres
 * @param {object} props
 * @param {string} props.quoteText
 * @param {string} props.attribution
 * @param {string} [props.photoSrc] - if set, draws a 72px circular photo to the left (quarterly-report style)
 * @param {string} [props.tint] - hex background tint (case-study/lead-magnet style); omit for no tint
 * @param {string} [props.borderColor] - top border hex; defaults to COLORS.accent
 * @param {number} y
 * @param {{marginX?: number, contentW?: number}} [layout]
 * @returns {number} new Y cursor
 */
const { MARGIN_X, CONTENT_W, COLORS, FONTS, lh } = require('../tokens');
const { estimateTextHeight } = require('../estimate-text-height');

function addPullQuote(slide, pres, { quoteText, attribution, photoSrc, tint, borderColor = COLORS.accent, quoteSize = 18, attrSize = 9 }, y, layout = {}) {
  const { marginX: x = MARGIN_X, contentW: w = CONTENT_W } = layout;
  const hasPhoto = Boolean(photoSrc);
  const photoD = 0.75;
  const padX = 0.208, padTop = tint ? 0.208 : 0.18, padBottom = 0.167;
  const textX = x + padX + (hasPhoto ? photoD + 0.25 : 0);
  const textW = w - 2 * padX - (hasPhoto ? photoD + 0.25 : 0);

  const quoteH = estimateTextHeight(`"${quoteText}"`, textW, quoteSize, 1.5, 'Yrsa');
  const attrH = 0.16;
  const innerH = quoteH + 0.08 + attrH;
  const h = Math.max(hasPhoto ? photoD : 0, innerH) + padTop + padBottom;

  slide.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: borderColor, width: 1.5 } });

  if (tint) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: y + 0.02, w, h: h - 0.02,
      fill: { color: tint }, line: { type: 'none' }, rectRadius: 0.042,
    });
  }

  if (hasPhoto) {
    slide.addImage({ path: photoSrc, x: x + padX, y: y + padTop, w: photoD, h: photoD, rounding: true });
  }

  const textY = y + padTop;
  slide.addText(`"${quoteText}"`, {
    x: textX, y: textY, w: textW, h: quoteH,
    fontFace: FONTS.heading, fontSize: quoteSize, italic: true, color: COLORS.nightBlue,
    lineSpacing: lh(quoteSize, 1.5), valign: 'top', margin: 0,
  });
  slide.addText(`— ${attribution}`.toUpperCase(), {
    x: textX, y: textY + quoteH + 0.08, w: textW, h: attrH,
    fontFace: FONTS.labelBold, fontSize: attrSize, color: COLORS.mutedInk, charSpacing: attrSize / 9 * 1.2, valign: 'top', margin: 0,
  });

  return y + h;
}

module.exports = { addPullQuote };
