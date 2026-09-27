/**
 * photo-column — fixed-width (280px) left rail: a photo (or placeholder)
 * filling the column, with a Night Blue overlay panel at the bottom holding
 * a name, profile line, and up to 3 tag pills. Ported from
 * templates/brochures/case-study/CaseStudy.dc.html's "Page 2" left column.
 *
 * Spans the full content-row height (below the header divider, down to the
 * footer divider) and sits flush against the page's left edge — it is not
 * part of the normal marginX-inset vertical stack, so it takes explicit
 * x/y/w/h rather than a threaded Y cursor.
 *
 * @param {Slide} slide
 * @param {Presentation} pres
 * @param {object} props
 * @param {string} [props.photoSrc] - absolute path; omit for the placeholder icon + "Client Photo" label
 * @param {string} props.name
 * @param {string} [props.profile]
 * @param {string[]} [props.tags] - up to 3
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 */
const { COLORS, FONTS, WHITE_ON_NIGHT_BLUE } = require('../tokens');
const { estimateTextHeight } = require('../estimate-text-height');

const OVERLAY_PAD_TOP = 0.292; // 28px
const OVERLAY_PAD_BOTTOM = 0.333; // 32px
const TAG_ROW_H = 0.208;

function addPhotoColumn(slide, pres, { photoSrc, name, profile, tags = [] }, x, y, w, h) {
  const innerW = w - 0.58;
  const nameH = estimateTextHeight(name, innerW, 24, 1.15, 'Yrsa') + 0.04;
  const profileH = profile ? estimateTextHeight(profile, innerW, 11, 1.3, 'Heebo') + 0.14 : 0;
  const tagsH = tags.length ? TAG_ROW_H + 0.2 : 0;
  const overlayH = OVERLAY_PAD_TOP + nameH + profileH + tagsH + OVERLAY_PAD_BOTTOM;
  const photoH = h - overlayH;

  if (photoSrc) {
    slide.addImage({ path: photoSrc, x, y, w, h: photoH, sizing: { type: 'cover', w, h: photoH } });
  } else {
    slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h: photoH, fill: { color: COLORS.accent }, line: { type: 'none' } });
    slide.addText('CLIENT PHOTO', {
      x, y: y + photoH / 2 - 0.1, w, h: 0.2,
      fontFace: FONTS.labelMedium, fontSize: 8, color: WHITE_ON_NIGHT_BLUE[65] || COLORS.white,
      charSpacing: 2, align: 'center', valign: 'middle', margin: 0,
    });
  }

  slide.addShape(pres.shapes.RECTANGLE, { x, y: y + photoH, w, h: overlayH, fill: { color: COLORS.nightBlue }, line: { type: 'none' } });

  const px = x + 0.29;
  let cy = y + photoH + OVERLAY_PAD_TOP;
  slide.addText(name, {
    x: px, y: cy, w: innerW, h: nameH,
    fontFace: FONTS.heading, fontSize: 24, color: COLORS.white, valign: 'top', margin: 0,
  });
  cy += nameH;
  if (profile) {
    slide.addText(profile, {
      x: px, y: cy, w: innerW, h: profileH,
      fontFace: FONTS.base, fontSize: 11, color: WHITE_ON_NIGHT_BLUE[50], charSpacing: 0.7, valign: 'top', margin: 0,
    });
    cy += profileH;
  }

  let tx = px;
  const tagY = cy + 0.06;
  tags.slice(0, 3).forEach((tag) => {
    const tagW = Math.max(0.5, tag.length * 0.075 + 0.2);
    slide.addShape(pres.shapes.RECTANGLE, {
      x: tx, y: tagY, w: tagW, h: TAG_ROW_H,
      fill: { color: WHITE_ON_NIGHT_BLUE[20] }, line: { type: 'none' }, rectRadius: 0.031,
    });
    slide.addText((tag || '').toUpperCase(), {
      x: tx, y: tagY, w: tagW, h: TAG_ROW_H,
      fontFace: FONTS.labelBold, fontSize: 7, color: COLORS.lavender, charSpacing: 1.2,
      align: 'center', valign: 'middle', margin: 0,
    });
    tx += tagW + 0.06;
  });
}

module.exports = { addPhotoColumn };
