/**
 * hero-image — full-width photo (fixed 420px/4.375in) with a scrim and a
 * label + title burned into the bottom. Ported from
 * skills/gcs-brochure/components/hero-image.html.
 *
 * The CSS `linear-gradient(to top, rgba(0,9,87,0.85), transparent 60%)`
 * overlay has no PptxGenJS equivalent over a placed image — approximated
 * here with a solid semi-transparent Night Blue scrim across the bottom
 * third instead (see SKILL.md "No native gradients").
 *
 * @param {Slide} slide
 * @param {Presentation} pres
 * @param {object} props
 * @param {string} [props.imageSrc] - absolute path; omit/empty for the solid Night Blue fallback
 * @param {string} [props.sectionLabel] - omit both this and imageTitle for a plain blank band with no scrim/text (factsheet's 168px placeholder)
 * @param {string} [props.imageTitle]
 * @param {number} [props.heightIn] - default 4.375in (420px); factsheet's placeholder band is 1.75in (168px)
 * @param {number} y
 * @param {{marginX?: number, contentW?: number}} [layout] - per-template margin override
 * @returns {number} new Y cursor
 */
const { MARGIN_X, CONTENT_W, COLORS, FONTS, WHITE_ON_NIGHT_BLUE } = require('../tokens');

const HEIGHT_IN = 4.375; // 420px fixed default

function addHeroImage(slide, pres, { imageSrc, sectionLabel, imageTitle, heightIn }, y, layout = {}) {
  const { marginX: x = MARGIN_X, contentW: w = CONTENT_W } = layout;
  const h = heightIn || HEIGHT_IN;

  if (imageSrc) {
    slide.addImage({ path: imageSrc, x, y, w, h, sizing: { type: 'cover', w, h } });
  } else {
    slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: COLORS.nightBlue }, line: { type: 'none' } });
  }

  if (sectionLabel || imageTitle) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: y + h - 1.5, w, h: 1.5,
      fill: { color: COLORS.nightBlue, transparency: 35 }, line: { type: 'none' },
    });
    slide.addText((sectionLabel || '').toUpperCase(), {
      x: x + 0.29, y: y + h - 1.2, w: w - 0.6, h: 0.18,
      fontFace: FONTS.labelMedium, fontSize: 7.5, color: WHITE_ON_NIGHT_BLUE[45],
      charSpacing: 2.9, margin: 0,
    });
    slide.addText(imageTitle, {
      x: x + 0.29, y: y + h - 0.95, w: w - 0.6, h: 0.65,
      fontFace: FONTS.heading, fontSize: 33, color: COLORS.white, valign: 'top', margin: 0,
    });
  }

  return y + h;
}

module.exports = { addHeroImage };
