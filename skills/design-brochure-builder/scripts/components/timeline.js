/**
 * timeline — vertical step-by-step process: numbered circles connected by a
 * line, each with a title + duration + description. Ported from
 * skills/gcs-brochure/components/timeline.html.
 *
 * The CSS connecting line is `linear-gradient(to bottom, #3D51E8, #ECEDF5)` —
 * PptxGenJS shapes have no gradient fill, so it's approximated with discrete
 * solid segments interpolated per step (see SKILL.md "No native gradients").
 *
 * @param {Slide} slide
 * @param {Presentation} pres
 * @param {object} props
 * @param {string} props.heading
 * @param {string} [props.subtitle]
 * @param {{title:string, duration:string, desc:string}[]} props.steps
 * @param {number} y
 * @param {{marginX?: number, contentW?: number}} [layout] - per-template margin override
 * @returns {number} new Y cursor
 */
const { MARGIN_X, CONTENT_W, COLORS, FONTS } = require('../tokens');
const { estimateTextHeight, estimateLineWidth } = require('../estimate-text-height');

const CIRCLE_D = 0.417; // 40px
const GAP = 0.29; // 28px between circle and text
const STEP_GAP = 0.375; // 36px padding-bottom between steps

function lerpHex(hexA, hexB, t) {
  const a = parseInt(hexA, 16), b = parseInt(hexB, 16);
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  const r = Math.round(ar + t * (br - ar));
  const g = Math.round(ag + t * (bg - ag));
  const bl = Math.round(ab + t * (bb - ab));
  return [r, g, bl].map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function addTimeline(slide, pres, { heading, subtitle, steps }, y, layout = {}) {
  const { marginX: x = MARGIN_X, contentW: w = CONTENT_W } = layout;

  slide.addText('APPLICATION PROCESS', {
    x, y, w, h: 0.14, fontFace: FONTS.label, fontSize: 7.5, color: COLORS.accent, charSpacing: 3.2, margin: 0,
  });
  y += 0.2;
  const headingH = estimateTextHeight(heading, w, 30, 1.08, 'Yrsa') + 0.05;
  slide.addText(heading, { x, y, w, h: headingH, fontFace: FONTS.heading, fontSize: 30, color: COLORS.headingInk, valign: 'top', margin: 0 });
  y += headingH + 0.1;
  if (subtitle) {
    const subH = estimateTextHeight(subtitle, w, 10.5, 1.65, FONTS.body);
    slide.addText(subtitle, { x, y, w, h: subH, fontFace: FONTS.body, fontSize: 10.5, color: COLORS.mutedInk, lineSpacingMultiple: 1.65, valign: 'top', margin: 0 });
    y += subH + 0.5;
  } else {
    y += 0.5;
  }

  const lineX = x + CIRCLE_D / 2;
  const textX = x + CIRCLE_D + GAP;
  const textW = w - CIRCLE_D - GAP;

  steps.forEach((step, i) => {
    const isLast = i === steps.length - 1;
    const descH = estimateTextHeight(step.desc, textW, 10.5, 1.75, FONTS.body);
    const stepH = Math.max(CIRCLE_D, 0.42 + descH);

    if (i > 0) {
      const segColor = lerpHex(COLORS.accent, COLORS.hairlineTint, i / Math.max(1, steps.length - 1));
      slide.addShape(pres.shapes.RECTANGLE, {
        x: lineX - 0.005, y: y - STEP_GAP, w: 0.01, h: STEP_GAP,
        fill: { color: segColor }, line: { type: 'none' },
      });
    }

    slide.addShape(pres.shapes.OVAL, {
      x, y, w: CIRCLE_D, h: CIRCLE_D,
      fill: { color: isLast ? COLORS.accent : COLORS.nightBlue }, line: { type: 'none' },
    });
    slide.addText(String(i + 1).padStart(2, '0'), {
      x, y, w: CIRCLE_D, h: CIRCLE_D, fontFace: FONTS.labelBold, fontSize: 9, color: COLORS.white,
      align: 'center', valign: 'middle', margin: 0,
    });

    const titleW = estimateLineWidth(step.title, 16.5, 'Yrsa');
    slide.addText(step.title, {
      x: textX, y: y + 0.083, w: Math.min(textW * 0.7, titleW + 0.1), h: 0.3,
      fontFace: FONTS.heading, fontSize: 16.5, color: COLORS.headingInk, valign: 'top', margin: 0,
    });
    if (step.duration) {
      slide.addText(step.duration.toUpperCase(), {
        x: textX + titleW + 0.17, y: y + 0.083, w: textW - titleW - 0.17, h: 0.3,
        fontFace: FONTS.labelMedium, fontSize: 7.5, color: COLORS.accent, charSpacing: 1.7,
        valign: 'top', margin: 0,
      });
    }
    slide.addText(step.desc, {
      x: textX, y: y + 0.083 + 0.28, w: textW, h: descH,
      fontFace: FONTS.body, fontSize: 10.5, color: COLORS.bodyInk, lineSpacingMultiple: 1.75,
      valign: 'top', margin: 0,
    });

    y += stepH + STEP_GAP;
  });

  return y - STEP_GAP;
}

module.exports = { addTimeline };
