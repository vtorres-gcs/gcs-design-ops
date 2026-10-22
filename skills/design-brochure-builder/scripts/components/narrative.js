/**
 * narrative — running text block: section heading + up to 3 body paragraphs
 * + optional lead paragraph + optional sub-sections.
 *
 * @param {Slide} slide
 * @param {Presentation} pres
 * @param {object} props
 * @param {string} [props.sectionLabel] - omit entirely (no reserved space) if not needed
 * @param {string} [props.heading] - omit entirely (no reserved space) if not needed
 * @param {string} [props.leadPara]
 * @param {string[]} [props.body] - 1-3 paragraphs
 * @param {{heading:string, body:string}[]} [props.subSections]
 * @param {number} [props.headingSize] - pt, default 33 (quarterly-report's 44px); also headingLh, bodySize (11.25), bodyLh (1.85) — CSS line-height multiples
 * @param {boolean} [props.subSectionDividers] - hairline divider between subsections (factsheet's 4 mini-sections); default false (quarterly-report's 3 sections have no dividers in source)
 * @param {{size?: number, uppercase?: boolean, charSpacing?: number}} [props.subHeadingStyle] - defaults match quarterly-report's plain-case 10.5pt mini-headings; factsheet needs {size: 9, uppercase: true, charSpacing: 2}
 * @param {number} y - current Y cursor (inches)
 * @param {{marginX?: number, contentW?: number}} [layout] - per-template margin override
 * @returns {number} new Y cursor
 */
const { MARGIN_X, CONTENT_W, COLORS, FONTS, lh } = require('../tokens');
const { estimateTextHeight } = require('../estimate-text-height');

function addNarrative(slide, pres, { sectionLabel, heading, leadPara, body = [], subSections = [], subSectionDividers = false, subHeadingStyle = {}, headingSize = 33, headingLh = 1.06, bodySize = 11.25, bodyLh = 1.85 }, y, layout = {}) {
  const { marginX: x = MARGIN_X, contentW: w = CONTENT_W } = layout;

  if (sectionLabel) {
    slide.addText(sectionLabel.toUpperCase(), {
      x, y, w, h: 0.14, fontFace: FONTS.label, fontSize: 7.5, color: COLORS.accent,
      charSpacing: 3.2, margin: 0,
    });
    y += 0.2;
  }

  if (heading) {
    const headingH = estimateTextHeight(heading, w, headingSize, headingLh, 'Yrsa') + 0.05;
    slide.addText(heading, {
      x, y, w, h: headingH, fontFace: FONTS.heading, fontSize: headingSize, color: COLORS.headingInk,
      lineSpacing: lh(headingSize, headingLh), valign: 'top', margin: 0,
    });
    y += headingH + 0.29;
  }

  if (leadPara) {
    const h = estimateTextHeight(leadPara, w, 15.75, 1.6, 'Yrsa');
    slide.addText(leadPara, {
      x, y, w, h, fontFace: FONTS.heading, fontSize: 15.75, color: COLORS.leadInk,
      lineSpacing: lh(15.75, 1.6), valign: 'top', margin: 0,
    });
    y += h + 0.29;
  }

  for (const para of body.filter(Boolean).slice(0, 3)) {
    const h = estimateTextHeight(para, w, bodySize, bodyLh, FONTS.body);
    slide.addText(para, {
      x, y, w, h, fontFace: FONTS.body, fontSize: bodySize, color: COLORS.bodyInk,
      lineSpacing: lh(bodySize, bodyLh), valign: 'top', margin: 0,
    });
    y += h + 0.23;
  }

  const subSize = subHeadingStyle.size || 10.5;
  subSections.forEach((sub, i) => {
    const subHeadH = 0.146;
    slide.addText(subHeadingStyle.uppercase ? (sub.heading || '').toUpperCase() : sub.heading, {
      x, y, w, h: subHeadH, fontFace: FONTS.label, fontSize: subSize, color: COLORS.accent,
      charSpacing: subHeadingStyle.charSpacing || 0, valign: 'top', margin: 0,
    });
    y += subHeadH + 0.1;
    const bodyH = estimateTextHeight(sub.body, w, bodySize, bodyLh, FONTS.body);
    slide.addText(sub.body, {
      x, y, w, h: bodyH, fontFace: FONTS.body, fontSize: bodySize, color: COLORS.bodyInk,
      lineSpacing: lh(bodySize, bodyLh), valign: 'top', margin: 0,
    });
    y += bodyH;
    if (subSectionDividers && i < subSections.length - 1) {
      y += 0.146;
      slide.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: COLORS.hairlineTint, width: 1 } });
      y += 0.146;
    } else {
      y += 0.23;
    }
  });

  return y;
}

module.exports = { addNarrative };
