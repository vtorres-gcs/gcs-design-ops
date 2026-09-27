/**
 * Cover pages — ported from skills/gcs-brochure/assets/covers/cover-gcs.dc.html
 * and cover-giu.dc.html. Full-bleed background photo + bottom-anchored text
 * block (title cascades upward from a fixed bottom margin, same technique as
 * the "Title" archetype in skills/gcs-pptx/SKILL.md).
 */

const { asset, PAGE_W, PAGE_H, PX, COLORS, FONTS, WHITE_ON_NIGHT_BLUE } = require('../tokens');
const { estimateTextHeight } = require('../estimate-text-height');

const SIDE_PAD = PX(56);
const TOP_PAD = PX(48);
const BOTTOM_PAD = PX(64);

function addCoverGCS(pres, { eyebrowLabel = '', eyebrow, coverTitleLine1, coverTitleLine2, subtitle, titleFontSize = 48, backgroundPath, flagPngPath }) {
  const slide = pres.addSlide();
  slide.addImage({ path: backgroundPath || asset('covers/background-cover-gcs.png'), x: 0, y: 0, w: PAGE_W, h: PAGE_H, sizing: { type: 'cover', w: PAGE_W, h: PAGE_H } });

  slide.addImage({ path: asset('logos/GCS-Symbol-White.png'), x: SIDE_PAD, y: TOP_PAD, w: 0.438, h: 0.438 });
  if (eyebrowLabel) {
    slide.addText(eyebrowLabel.toUpperCase(), {
      x: PAGE_W / 2, y: TOP_PAD + 0.06, w: PAGE_W / 2 - SIDE_PAD, h: 0.2,
      fontFace: FONTS.labelMedium, fontSize: 7.5, color: WHITE_ON_NIGHT_BLUE[55],
      charSpacing: 3.5, align: 'right', margin: 0,
    });
  }

  const w = PAGE_W - 2 * SIDE_PAD;
  const subtitleH = subtitle ? 0.85 : 0;
  const dividerGap = 0.29;
  // Estimated (word-wrap aware) so a longer/larger title that wraps to 2
  // lines gets a taller box instead of overlapping the line below it.
  const title2H = estimateTextHeight(coverTitleLine2, w, titleFontSize, 1.06, 'Yrsa') + 0.05;
  const title1H = estimateTextHeight(coverTitleLine1, w, titleFontSize, 1.06, 'Yrsa') + 0.05;
  const eyebrowH = 0.2;

  let y = PAGE_H - BOTTOM_PAD;
  if (subtitle) {
    y -= subtitleH;
    slide.addText(subtitle, {
      x: SIDE_PAD, y, w: Math.min(w, 5.0), h: subtitleH,
      fontFace: FONTS.body, fontSize: 9.75, color: WHITE_ON_NIGHT_BLUE[60],
      lineSpacingMultiple: 1.7, valign: 'top', margin: 0,
    });
    y -= dividerGap;
  }
  slide.addShape(pres.shapes.RECTANGLE, { x: SIDE_PAD, y: y - 0.02, w: 0.5, h: 0.021, fill: { color: COLORS.accent }, line: { type: 'none' } });
  y -= 0.29;
  y -= title2H;
  slide.addText(coverTitleLine2, { x: SIDE_PAD, y, w, h: title2H, fontFace: FONTS.heading, fontSize: titleFontSize, italic: true, color: COLORS.lavender, charSpacing: -1.1, valign: 'top', margin: 0 });
  y -= title1H;
  slide.addText(coverTitleLine1, { x: SIDE_PAD, y, w, h: title1H, fontFace: FONTS.heading, fontSize: titleFontSize, color: COLORS.white, charSpacing: -1.1, valign: 'top', margin: 0 });
  y -= 0.19 + eyebrowH;
  slide.addText((eyebrow || '').toUpperCase(), { x: SIDE_PAD, y, w, h: eyebrowH, fontFace: FONTS.labelMedium, fontSize: 7.5, color: WHITE_ON_NIGHT_BLUE[50], charSpacing: 4, valign: 'top', margin: 0 });

  if (flagPngPath) {
    // factsheet's round country-flag badge (42px), positioned above the
    // whole title stack (matches source's "margin-top: auto; margin-bottom:
    // 32px" placement) — no-op for templates that don't pass flagPngPath.
    const flagSize = PX(42);
    slide.addImage({ path: flagPngPath, x: SIDE_PAD, y: y - 0.33 - flagSize, w: flagSize, h: flagSize, rounding: true });
  }

  return slide;
}

function addCoverGIU(pres, { eyebrow, coverTitleLine1, coverTitleLine2, coverSubtitle }) {
  const slide = pres.addSlide();
  slide.addImage({ path: asset('covers/background-cover-giu.png'), x: 0, y: 0, w: PAGE_W, h: PAGE_H, sizing: { type: 'cover', w: PAGE_W, h: PAGE_H } });

  const symbolH = 0.438;
  const wordmarkH = 0.135, wordmarkW = wordmarkH * (1128 / 56);
  slide.addImage({ path: asset('logos/GCS-Symbol-White.png'), x: SIDE_PAD, y: TOP_PAD, w: symbolH, h: symbolH });
  slide.addShape(pres.shapes.RECTANGLE, { x: SIDE_PAD + symbolH + 0.146, y: TOP_PAD + symbolH / 2 - 0.156, w: 0.01, h: 0.313, fill: { color: WHITE_ON_NIGHT_BLUE[20] }, line: { type: 'none' } });
  slide.addImage({ path: asset('logos/GIU-Wordmark-White.png'), x: SIDE_PAD + symbolH + 0.146 + 0.146, y: TOP_PAD + symbolH / 2 - wordmarkH / 2, w: wordmarkW, h: wordmarkH });

  const w = PAGE_W - 2 * SIDE_PAD;
  const subtitleH = coverSubtitle ? 0.85 : 0;
  const title2H = 0.75, title1H = 0.75, eyebrowH = 0.2;

  let y = PAGE_H - BOTTOM_PAD;
  if (coverSubtitle) {
    y -= subtitleH;
    slide.addText(coverSubtitle, {
      x: SIDE_PAD, y, w: Math.min(w, 5.0), h: subtitleH,
      fontFace: FONTS.body, fontSize: 9.75, color: WHITE_ON_NIGHT_BLUE[60],
      lineSpacingMultiple: 1.65, valign: 'top', margin: 0,
    });
    y -= 0.29;
  }
  slide.addShape(pres.shapes.LINE, { x: SIDE_PAD, y: y - 0.01, w: 0.5, h: 0, line: { color: WHITE_ON_NIGHT_BLUE[25], width: 0.75 } });
  y -= 0.29;
  y -= title2H;
  slide.addText(coverTitleLine2, { x: SIDE_PAD, y, w, h: title2H, fontFace: FONTS.heading, fontSize: 48, italic: true, color: COLORS.lavender, charSpacing: -1.1, valign: 'top', margin: 0 });
  y -= title1H;
  slide.addText(coverTitleLine1, { x: SIDE_PAD, y, w, h: title1H, fontFace: FONTS.heading, fontSize: 48, color: COLORS.white, charSpacing: -1.1, valign: 'top', margin: 0 });
  y -= 0.2 + eyebrowH;
  slide.addText((eyebrow || '').toUpperCase(), { x: SIDE_PAD, y, w, h: eyebrowH, fontFace: FONTS.labelMedium, fontSize: 7.5, color: WHITE_ON_NIGHT_BLUE[50], charSpacing: 3.6, valign: 'top', margin: 0 });

  return slide;
}

module.exports = { addCoverGCS, addCoverGIU };
