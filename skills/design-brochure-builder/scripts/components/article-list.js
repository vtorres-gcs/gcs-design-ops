/**
 * article-list — placeholder-thumbnail + linked title + excerpt rows. Ported
 * from templates/brochures/quarterly-report/QuarterlyReport.dc.html's "About
 * this Report" page (up to 5 rows). The source's diagonal-stripe thumbnail
 * pattern has no PptxGenJS shape equivalent — approximated as a flat tinted
 * rectangle with a small "ARTICLE IMAGE" caption, same spirit as the
 * gradient approximations documented in SKILL.md's "Known limitations".
 *
 * @param {Slide} slide
 * @param {Presentation} pres
 * @param {object} props
 * @param {{title:string, excerpt:string, url?:string}[]} props.articles - up to 5
 * @param {number} y
 * @param {{marginX?: number, contentW?: number}} [layout]
 * @returns {number} new Y cursor
 */
const { MARGIN_X, CONTENT_W, COLORS, FONTS } = require('../tokens');
const { estimateTextHeight } = require('../estimate-text-height');

const THUMB_W = 1.25; // 120px
const THUMB_H = 0.833; // 80px
const GAP = 0.25; // 24px
const PAD_Y = 0.229; // 22px

function addArticleList(slide, pres, { articles = [] }, y, layout = {}) {
  const { marginX: x = MARGIN_X, contentW: w = CONTENT_W } = layout;
  const textX = x + THUMB_W + GAP;
  const textW = w - THUMB_W - GAP;

  const rows = articles.filter((a) => a && (a.title || a.excerpt)).slice(0, 5);

  rows.forEach((article, i) => {
    slide.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: COLORS.hairlineTint, width: 1 } });
    y += PAD_Y;

    slide.addShape(pres.shapes.RECTANGLE, { x, y, w: THUMB_W, h: THUMB_H, fill: { color: COLORS.surface }, line: { type: 'none' } });
    slide.addText('ARTICLE IMAGE', {
      x, y, w: THUMB_W, h: THUMB_H, fontFace: FONTS.base, fontSize: 6.5, color: COLORS.mutedInk,
      align: 'center', valign: 'middle', margin: 0,
    });

    const titleH = estimateTextHeight(article.title, textW, 14.25, 1.3, 'Yrsa') + 0.03;
    slide.addText(article.title || '', {
      x: textX, y, w: textW, h: titleH, fontFace: FONTS.heading, fontSize: 14.25, color: COLORS.accent,
      valign: 'top', margin: 0,
    });

    const excerptY = y + titleH + 0.06;
    // estimateTextHeight's word-wrap heuristic over-counts lines at this
    // narrow width/font-size combo (confirmed via the QA render: a 2-line
    // excerpt was estimated as 3, compounding to a real page overflow across
    // 5 rows) — widen only the estimate input, not the actual draw width.
    const excerptH = estimateTextHeight(`${article.excerpt || ''} →`, textW * 1.12, 9.75, 1.65, FONTS.body);
    slide.addText(
      [
        { text: `${article.excerpt || ''} `, options: { fontFace: FONTS.body, color: COLORS.mutedInk } },
        { text: '→', options: { fontFace: FONTS.body, color: COLORS.accent } },
      ],
      { x: textX, y: excerptY, w: textW, h: excerptH, fontSize: 9.75, lineSpacingMultiple: 1.65, valign: 'top', margin: 0 }
    );

    y += Math.max(THUMB_H, titleH + 0.06 + excerptH) + PAD_Y;
    if (i === rows.length - 1) {
      slide.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: COLORS.hairlineTint, width: 1 } });
    }
  });

  return y;
}

module.exports = { addArticleList };
