/**
 * step-list — numbered rows (28px filled circle badge), each with a title +
 * description, separated by hairline `border-top` dividers. No connecting
 * line (unlike timeline.js's 40px-circle/gradient-connector variant).
 * Used for the case-study
 * "What We Did" section; also used by giu-corporate's milestones page
 * (with an added status-pill column, not yet ported).
 *
 * @param {Slide} slide
 * @param {Presentation} pres
 * @param {object} props
 * @param {string} [props.heading] - e.g. "WHAT WE DID"
 * @param {{title:string, desc:string}[]} props.steps
 * @param {number} y
 * @param {{marginX?: number, contentW?: number}} [layout]
 * @returns {number} new Y cursor
 */
const { MARGIN_X, CONTENT_W, COLORS, FONTS, lh } = require('../tokens');
const { estimateTextHeight } = require('../estimate-text-height');

const CIRCLE_D = 0.292; // 28px
const GAP = 0.25; // 24px between circle and text
const ROW_PAD_V = 0.19; // 18px row top/bottom padding
// Template CSS is in px; PptxGenJS wants pt (x0.75): 18px title, 13px desc, 9px number, 10px label.
const TITLE_PT = 13.5, DESC_PT = 9.75, NUM_PT = 6.75, LABEL_PT = 7.5;

function addStepList(slide, pres, { heading, steps }, y, layout = {}) {
  const { marginX: x = MARGIN_X, contentW: w = CONTENT_W } = layout;

  if (heading) {
    slide.addText((heading || '').toUpperCase(), {
      x, y, w, h: 0.16, fontFace: FONTS.labelBold, fontSize: LABEL_PT, color: COLORS.mutedInk, charSpacing: 1.35, margin: 0,
    });
    y += 0.28;
  }

  const textX = x + CIRCLE_D + GAP;
  const textW = w - CIRCLE_D - GAP;

  steps.forEach((step, i) => {
    const isLast = i === steps.length - 1;
    slide.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: COLORS.hairlineTint, width: 0.75 } });

    const descH = estimateTextHeight(step.desc, textW, DESC_PT, 1.7, FONTS.body);
    const titleGap = 0.22; // gap from the row's content-top to the desc line
    const contentH = Math.max(CIRCLE_D, titleGap + descH);
    const cy = y + ROW_PAD_V;

    slide.addShape(pres.shapes.OVAL, {
      x, y: cy, w: CIRCLE_D, h: CIRCLE_D,
      fill: { color: isLast ? COLORS.accent : COLORS.nightBlue }, line: { type: 'none' },
    });
    slide.addText(String(i + 1).padStart(2, '0'), {
      x, y: cy, w: CIRCLE_D, h: CIRCLE_D, fontFace: FONTS.labelBold, fontSize: NUM_PT, color: COLORS.white,
      align: 'center', valign: 'middle', margin: 0,
    });

    slide.addText(step.title, {
      x: textX, y: cy - 0.02, w: textW, h: 0.28,
      fontFace: FONTS.heading, fontSize: TITLE_PT, color: COLORS.headingInk, valign: 'top', margin: 0,
    });
    slide.addText(step.desc, {
      x: textX, y: cy + titleGap, w: textW, h: descH,
      fontFace: FONTS.body, fontSize: DESC_PT, color: COLORS.mutedInk, lineSpacing: lh(DESC_PT, 1.7), valign: 'top', margin: 0,
    });

    y = cy + contentH + ROW_PAD_V;
    if (isLast) {
      slide.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: COLORS.hairlineTint, width: 0.75 } });
    }
  });

  return y;
}

module.exports = { addStepList };
