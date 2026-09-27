/**
 * Page chrome — header (eyebrow + logo lockup) and footer (copyright + page
 * number), fixed on every content page. Ported from
 * skills/gcs-brochure/components/_chrome-gcs.html and _chrome-giu.html.
 *
 * Side padding is resolved via tokens.js's getContentMetrics() so chrome and
 * body content always share the same margin — pass `template` (preferred, in
 * template mode) or fall back to `brand` (free mode: gcs=64px, giu=56px).
 */

const { asset, PAGE_W, PAGE_H, HEADER_H, FOOTER_H, COLORS, FONTS, getContentMetrics } = require('../tokens');

function addPageChrome(slide, pres, { brand = 'gcs', template, eyebrowText = '', pageNumber = '', year = new Date().getFullYear() } = {}) {
  const { marginX: pad } = getContentMetrics({ template, brand });
  const w = PAGE_W - 2 * pad;

  // Header eyebrow (left)
  slide.addText((eyebrowText || '').toUpperCase(), {
    x: pad, y: 0, w: w * 0.6, h: HEADER_H,
    fontFace: FONTS.labelMedium, fontSize: 7.5, color: COLORS.faintInk,
    charSpacing: 3.2, valign: 'middle', margin: 0,
  });

  // Header logo lockup (right)
  if (brand === 'giu') {
    const symbolH = 0.19, wordmarkH = 0.094;
    const wordmarkW = wordmarkH * (1128 / 56);
    const symbolW = symbolH * (70 / 71);
    const gap = 0.104, dividerW = 0.01;
    const lockupW = symbolW + gap + dividerW + gap + wordmarkW;
    const lx = PAGE_W - pad - lockupW;
    const cy = HEADER_H / 2;
    slide.addImage({ path: asset('logos/GCS-Symbol-Blue.png'), x: lx, y: cy - symbolH / 2, w: symbolW, h: symbolH });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: lx + symbolW + gap, y: cy - 0.083, w: dividerW, h: 0.167,
      fill: { color: 'D0D2E0' }, line: { type: 'none' },
    });
    slide.addImage({ path: asset('logos/GIU-Wordmark-Blue.png'), x: lx + symbolW + gap + dividerW + gap, y: cy - wordmarkH / 2, w: wordmarkW, h: wordmarkH });
  } else {
    const logoH = 0.115; // 11px
    const logoW = logoH * (270 / 17);
    slide.addImage({ path: asset('logos/GCS-Secondary-Blue.png'), x: PAGE_W - pad - logoW, y: HEADER_H / 2 - logoH / 2, w: logoW, h: logoH });
  }

  // Header/footer hairlines
  slide.addShape(pres.shapes.LINE, { x: pad, y: HEADER_H, w: w, h: 0, line: { color: COLORS.hairline, width: 0.75 } });
  slide.addShape(pres.shapes.LINE, { x: pad, y: PAGE_H - FOOTER_H, w: w, h: 0, line: { color: COLORS.hairline, width: 0.75 } });

  // Footer
  const footerCy = PAGE_H - FOOTER_H / 2;
  slide.addText(`© ${year} Global Citizen Solutions — Confidential`, {
    x: pad, y: footerCy - 0.1, w: w * 0.7, h: 0.2,
    fontFace: FONTS.base, fontSize: 8.25, color: 'C6C8D5', valign: 'middle', margin: 0,
  });
  slide.addText(String(pageNumber), {
    x: pad + w * 0.7, y: footerCy - 0.1, w: w * 0.3, h: 0.2,
    fontFace: FONTS.base, fontSize: 8.25, color: 'C6C8D5', charSpacing: 1.5,
    align: 'right', valign: 'middle', margin: 0,
  });
}

module.exports = { addPageChrome };
