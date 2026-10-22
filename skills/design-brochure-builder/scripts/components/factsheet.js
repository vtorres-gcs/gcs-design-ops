/**
 * Factsheet pages — fixed-layout builders for the factsheet template.
 * Unlike the free-mode components, the factsheet is a
 * fixed, absolutely-positioned layout: every x/y/size below is the pixel
 * geometry on a 794x1123 px canvas (A4 @ 96dpi), converted to inches/points
 * by the helpers below.
 *
 *   addFactsheetCover(pres, props)       page 1 — photo cover, logo, bottom text block
 *   addFactsheetContent(pres, props)     page 2 — header, title+flag, 4 key figures,
 *                                        Overview / Key Benefits, Investment Options,
 *                                        Application Procedure, footer
 *   addFactsheetBackCover(pres)          page 3 — "Our Global Presence." (static copy)
 *
 * Where the HTML flows (CSS grid/flex), the same flow is reproduced from
 * measured line counts (scripts/text-metrics.js) so longer or shorter copy
 * grows/shrinks the same boxes the template would. Text inside a card is one
 * multi-paragraph text box, so the renderer — not an estimate — decides where
 * each paragraph lands.
 *
 * Colours are the template's own CSS tokens (var(--accent) = #3F8CFF, NOT the
 * #3D51E8 used by the older brochure templates — see references/design-tokens.md).
 */
const { asset, PX, PAGE_W, PAGE_H, FONTS, WHITE_ON_NIGHT_BLUE } = require('../tokens');
const { countLines } = require('../text-metrics');
const { COUNTRIES } = require('./back-cover');

const PT = 0.75; // 1 CSS px = 0.75 pt
const LS = -0.16; // body letter-spacing (px) applied to all Heebo text

const C = {
  primary: '000957', // --primary
  accent: '3F8CFF', // --accent
  heading: '16182A', // --doc-heading
  body: '4B4E65', // --doc-body
  muted: '9B9CAD', // --doc-muted
  border: 'E0E2EA', // --doc-border
  borderSoft: 'E8EAF5', // --doc-border-soft
  surface: 'F7F8FD', // --doc-surface
  lavender: 'B3B5CD', // --night-blue-50
  labelOnDark: 'A8B3CD', // back-cover intro copy
  linkOnDark: 'B3B5CD', // back-cover url + socials
  white: 'FFFFFF',
  flagRing: 'E0E2EB', // rgba(0,9,87,.12) over white
};

// Page geometry (px)
const W = 794;
const H = 1123;
const PAD = 56; // page-2 / back-cover side padding
const CONTENT_W = W - 2 * PAD; // 682

// ── helpers ────────────────────────────────────────────────────────────────

function r(text, o) {
  const opt = { fontFace: o.font, fontSize: o.size * PT, color: o.color };
  if (o.italic) opt.italic = true;
  if (o.ls) opt.charSpacing = o.ls * PT;
  if (o.lh) opt.lineSpacing = o.lh * PT;
  if (o.after) opt.paraSpaceAfter = o.after * PT;
  if (o.br) opt.breakLine = true;
  if (o.align) opt.align = o.align;
  if (o.transparency != null) opt.transparency = o.transparency;
  return { text: o.upper ? String(text).toUpperCase() : String(text), options: opt };
}

// With exact point line-spacing (a:spcPts) LibreOffice seats glyphs ~2px (Heebo) /
// ~3px (Yrsa) lower in the line box than CSS half-leading does — measured by
// diffing a render against the template's DOM. Compensate so ink lands where it
// does in the HTML; bottom-anchored boxes (the cover's text block) sit ~4px low.
const DY_PX = { Yrsa: -3, default: -2, bottom: -4 };

function box(slide, runs, { x, y, w, h, valign = 'top', dy: dyOverride }) {
  const first = Array.isArray(runs) ? runs[0] : null;
  const face = (first && first.options && first.options.fontFace) || '';
  const dy = dyOverride != null ? dyOverride : valign === 'bottom' ? DY_PX.bottom : (face.startsWith('Yrsa') ? DY_PX.Yrsa : DY_PX.default);
  slide.addText(runs, { x: PX(x), y: PX(y + dy), w: PX(w), h: PX(h), margin: 0, valign, wrap: true });
}

function rect(slide, pres, x, y, w, h, { fill, line, lineW = 0.75 } = {}) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: PX(x), y: PX(y), w: PX(w), h: PX(h),
    fill: fill ? { color: fill } : { type: 'none' },
    line: line ? { color: line, width: lineW } : { type: 'none' },
  });
}

function hline(slide, pres, x1, x2, y, color) {
  slide.addShape(pres.shapes.LINE, { x: PX(x1), y: PX(y), w: PX(x2 - x1), h: 0, line: { color, width: 0.75 } });
}

function image(slide, p, x, y, w, h, extra = {}) {
  slide.addImage({ path: p, x: PX(x), y: PX(y), w: PX(w), h: PX(h), ...extra });
}

function warn(msg) {
  console.warn(`WARNING (factsheet): ${msg}`);
}

const sectionHeading = (slide, text, x, y, w) =>
  box(slide, [r(text, { font: FONTS.heading, size: 28, color: C.primary, ls: -0.3, lh: 30.8 })], { x, y, w, h: 31 });

const SECTION_H = 30.8 + 12; // heading line + margin-bottom

// Overview box: sits beside three Key Benefit rows (3 x 116.4px cards + 2 x 8px gaps
// = 365.2px). Its text area is that minus 2px border + 36px padding, at 17.6px/line.
// More lines than this and the HTML grid (and so the PPTX) grows the box, pushing
// every section below it down.
const OVERVIEW_MAX_LINES = Math.floor((3 * 116.4 + 2 * 8 - 38) / 17.6); // 18

/** Lines (blank paragraph gaps count) and chars the Overview copy takes in its box. */
function overviewFit(text) {
  const t = String(text || '');
  return { lines: countLines(t, FONTS.body, 11, (CONTENT_W - 20) * 0.4 - 38, LS), maxLines: OVERVIEW_MAX_LINES, chars: t.length };
}

// ── page 1: cover ──────────────────────────────────────────────────────────

function addFactsheetCover(pres, props) {
  const { coverTitleLine1 = '', coverTitleLine2 = '', subtitle = '', supportText = '', backgroundPath } = props;
  const slide = pres.addSlide();
  slide.background = { color: C.primary };
  image(slide, backgroundPath || asset('covers/background-cover-gcs.png'), 0, 0, W, H, {
    sizing: { type: 'cover', w: PX(W), h: PX(H) },
  });
  image(slide, asset('logos/GCS-Symbol-White.png'), 60, 52, 42, 42);

  // Bottom block: padding 0 60px 64px, anchored to the bottom edge.
  const bottom = H - 64;
  const SUPPORT_W = 490;
  const supportLines = supportText ? countLines(supportText, FONTS.body, 16, SUPPORT_W, LS) : 0;
  const supportH = supportLines * 26.4;
  const supportTop = bottom - supportH;
  if (supportText) {
    box(slide, [r(supportText, { font: FONTS.body, size: 16, color: C.white, ls: 0, lh: 26.4, transparency: 42 })], {
      x: 60, y: supportTop, w: SUPPORT_W, h: supportH, valign: 'bottom',
    });
  }

  const gap = supportText ? 16 : 0; // subtitle margin-bottom
  const textTop = 110;
  const textBottom = supportTop - gap;
  box(slide, [
    r(`${coverTitleLine1} `, { font: FONTS.heading, size: 74, color: C.white, ls: -2, lh: 72.52, after: 20 }),
    r(coverTitleLine2, { font: FONTS.heading, size: 74, color: C.lavender, italic: true, ls: -2, lh: 72.52, br: true }),
    r(subtitle, { font: FONTS.body, size: 28, color: C.white, ls: LS, lh: 36.4 }),
  ], { x: 60, y: textTop, w: W - 120, h: textBottom - textTop, valign: 'bottom' });

  return slide;
}

// ── page 2: content ────────────────────────────────────────────────────────

function addFactsheetContent(pres, props) {
  const p = props;
  const slide = pres.addSlide();
  slide.background = { color: C.white };

  // Header
  box(slide, [r(p.country || `${p.coverTitleLine1} ${p.coverTitleLine2}`, { font: FONTS.labelMedium, size: 10, color: C.muted, ls: 2, lh: 14.5, upper: true })],
    { x: PAD, y: 18, w: 480, h: 15 });
  // Secondary logo (symbol + "GLOBAL CITIZEN SOLUTIONS" wordmark) as the real asset, right-aligned,
  // same ~180px footprint the template's symbol + live-text lockup occupies.
  const logoW = 180;
  image(slide, asset('logos/GCS-Secondary-Blue.png'), W - PAD - logoW, 25.5 - logoW / (1620 / 102) / 2, logoW, logoW / (1620 / 102));
  hline(slide, pres, PAD, W - PAD, 51.5, C.border);

  // Title block (flag + programme name)
  const hasFlag = !!p.flagPngPath;
  const titleX = hasFlag ? PAD + 44 + 16 : PAD;
  const titleW = W - PAD - titleX;
  const titleLines = countLines(`${p.coverTitleLine1} ${p.coverTitleLine2}`, 'Yrsa', 46, titleW, -1);
  const subLines = p.subtitle ? countLines(p.subtitle, FONTS.body, 14, titleW, LS) : 0;
  const titleBlockH = Math.max(hasFlag ? 44 : 0, titleLines * 46 + (subLines ? 8 + subLines * 21 : 0));
  const titleTop = 52 + 28;
  if (hasFlag) {
    image(slide, p.flagPngPath, PAD, titleTop, 44, 44, { rounding: true });
    slide.addShape(pres.shapes.OVAL, { x: PX(PAD), y: PX(titleTop), w: PX(44), h: PX(44), fill: { type: 'none' }, line: { color: C.flagRing, width: 0.75 } });
  }
  box(slide, [
    r(`${p.coverTitleLine1} `, { font: FONTS.heading, size: 46, color: C.primary, ls: -1, lh: 46, after: 8 }),
    r(p.coverTitleLine2, { font: FONTS.heading, size: 46, color: C.lavender, italic: true, ls: -1, lh: 46, br: !!p.subtitle }),
    ...(p.subtitle ? [r(p.subtitle, { font: FONTS.body, size: 14, color: C.body, ls: LS, lh: 21 })] : []),
  ], { x: titleX, y: titleTop, w: titleW, h: titleBlockH });

  // Key figures — 4 dark tiles
  const figs = [1, 2, 3, 4].map((n) => ({ label: p[`fig${n}Label`] || '', value: p[`fig${n}Value`] || '' }));
  const figW = (CONTENT_W - 3 * 6) / 4; // 166
  const figInnerW = figW - 32;
  const figContentH = Math.max(...figs.map((f) =>
    Math.max(1, countLines(f.label.toUpperCase(), FONTS.labelBold, 8, figInnerW, 1.76)) * 11.2 + 8 +
    Math.max(1, countLines(f.value, FONTS.heading, 28, figInnerW, -0.5)) * 28));
  const figH = 16 + figContentH + 14;
  const figY = titleTop + titleBlockH + 4 + 18;
  figs.forEach((f, i) => {
    const fx = PAD + i * (figW + 6);
    rect(slide, pres, fx, figY, figW, figH, { fill: C.primary });
    box(slide, [
      r(f.label, { font: FONTS.labelBold, size: 8, color: C.accent, ls: 1.76, lh: 11.2, upper: true, br: true, after: 8 }),
      r(f.value, { font: FONTS.heading, size: 28, color: C.white, ls: -0.5, lh: 28 }),
    ], { x: fx + 16, y: figY + 16, w: figInnerW, h: figH - 30 });
  });

  // Overview + Key Benefits grid (4fr / 6fr, gap 20)
  const gridY = figY + figH + 20;
  const colGap = 20;
  const leftW = (CONTENT_W - colGap) * 0.4; // 264.8
  const rightX = PAD + leftW + colGap; // 340.8
  const rightW = CONTENT_W - leftW - colGap; // 397.2
  const cardW = (rightW - 8) / 2; // 194.6
  const cardInnerW = cardW - 34;

  const benefits = [0, 1, 2, 3, 4, 5].map((i) => (p.benefits && p.benefits[i]) || { title: '', desc: '' });
  const benefitCardH = benefits.map((b, i) => {
    const tl = Math.max(1, countLines(b.title, FONTS.labelMedium, 13, cardInnerW, LS));
    const dl = countLines(b.desc, FONTS.body, 10.5, cardInnerW, LS);
    if (dl > 2) warn(`benefit${i + 1}Desc wraps to ${dl} lines; the template clamps it to 2 — shorten it.`);
    return 1 + 14 + 24 + 10 + tl * 16.9 + 4 + Math.min(Math.max(dl, 1), 2) * 15.75 + 14 + 1;
  });
  const rowH = [0, 1, 2].map((row) => Math.max(benefitCardH[row * 2], benefitCardH[row * 2 + 1]));
  const rightColH = rowH.reduce((a, b) => a + b, 0) + 2 * 8;

  const overview = p.overview || '';
  const ovLines = countLines(overview, FONTS.body, 11, leftW - 38, LS);
  const leftColH = 2 + 36 + ovLines * 17.6;
  const bodyH = Math.max(leftColH, rightColH);
  const gridH = SECTION_H + bodyH;

  sectionHeading(slide, 'Overview', PAD, gridY, leftW);
  rect(slide, pres, PAD, gridY + SECTION_H, leftW, bodyH, { fill: C.surface, line: C.borderSoft });
  const ovParas = overview.split('\n');
  box(slide, ovParas.map((line, i) =>
    r(line || ' ', { font: FONTS.body, size: 11, color: C.body, ls: LS, lh: 17.6, br: i < ovParas.length - 1 })),
  { x: PAD + 19, y: gridY + SECTION_H + 19, w: leftW - 38, h: bodyH - 38 });

  sectionHeading(slide, 'Key Benefits', rightX, gridY, rightW);
  let cy = gridY + SECTION_H;
  [0, 1, 2].forEach((row) => {
    [0, 1].forEach((col) => {
      const b = benefits[row * 2 + col];
      const cx = rightX + col * (cardW + 8);
      rect(slide, pres, cx, cy, cardW, rowH[row], { fill: C.surface, line: C.borderSoft });
      if (b.iconPngPath) image(slide, b.iconPngPath, cx + 17, cy + 15, 24, 24);
      box(slide, [
        r(b.title, { font: FONTS.labelMedium, size: 13, color: C.heading, ls: LS, lh: 16.9, br: true, after: 4 }),
        r(b.desc, { font: FONTS.body, size: 10.5, color: C.body, ls: LS, lh: 15.75 }),
      ], { x: cx + 17, y: cy + 15 + 24 + 10, w: cardInnerW, h: rowH[row] - 49 - 15 });
    });
    cy += rowH[row] + 8;
  });

  // Investment Options — 4 cards
  const invY = gridY + gridH + 18;
  const invs = [1, 2, 3, 4].map((n) => ({ title: p[`inv${n}Title`] || '', amount: p[`inv${n}Amount`] || '', desc: p[`inv${n}Desc`] || '' }));
  const invInnerW = figW - 30; // 1px border + 14px padding each side
  const invCardH = Math.max(...invs.map((v) =>
    1 + 12 + 20 + 6 +
    Math.max(1, countLines(v.title, FONTS.labelMedium, 12, invInnerW, LS)) * 15.6 + 2 +
    18.2 + 5 +
    Math.max(1, countLines(v.desc, FONTS.body, 10, invInnerW, LS)) * 14.5 + 12 + 1));
  sectionHeading(slide, 'Investment Options', PAD, invY, CONTENT_W);
  invs.forEach((v, i) => {
    const ix = PAD + i * (figW + 6);
    const iy = invY + SECTION_H;
    rect(slide, pres, ix, iy, figW, invCardH, { fill: C.surface, line: C.borderSoft });
    box(slide, [
      r(String(i + 1).padStart(2, '0'), { font: FONTS.heading, size: 20, color: C.accent, lh: 20, br: true, after: 6 }),
      r(v.title, { font: FONTS.labelMedium, size: 12, color: C.heading, ls: LS, lh: 15.6, br: true, after: 2 }),
      r(v.amount, { font: FONTS.labelBold, size: 13, color: C.primary, ls: LS, lh: 18.2, br: true, after: 5 }),
      r(v.desc, { font: FONTS.body, size: 10, color: C.body, ls: LS, lh: 14.5 }),
    ], { x: ix + 15, y: iy + 13, w: invInnerW, h: invCardH - 26 });
  });

  // Application Procedure — 6 columns
  const procY = invY + SECTION_H + invCardH + 18;
  const steps = [1, 2, 3, 4, 5, 6].map((n) => ({ title: p[`step${n}Title`] || '', desc: p[`step${n}Desc`] || '' }));
  const stepW = (CONTENT_W - 5 * 10) / 6; // 105.33
  const stepH = Math.max(...steps.map((s) =>
    2 + 8 + 12.6 + 3 +
    Math.max(1, countLines(s.title, FONTS.labelMedium, 11, stepW, LS)) * 14.3 + 3 +
    Math.max(1, countLines(s.desc, FONTS.body, 9.5, stepW, LS)) * 13.3));
  sectionHeading(slide, 'Application Procedure', PAD, procY, CONTENT_W);
  steps.forEach((s, i) => {
    const sx = PAD + i * (stepW + 10);
    const sy = procY + SECTION_H;
    rect(slide, pres, sx, sy, stepW, 2, { fill: C.primary });
    box(slide, [
      r(String(i + 1), { font: FONTS.labelBold, size: 9, color: C.accent, ls: 1.44, lh: 12.6, br: true, after: 3 }),
      r(s.title, { font: FONTS.labelMedium, size: 11, color: C.heading, ls: LS, lh: 14.3, br: true, after: 3 }),
      r(s.desc, { font: FONTS.body, size: 9.5, color: C.body, ls: LS, lh: 13.3 }),
    ], { x: sx, y: sy + 10, w: stepW, h: stepH - 10 });
  });

  const contentBottom = procY + SECTION_H + stepH;
  const FOOTER_TOP = 1080;
  if (contentBottom > FOOTER_TOP - 16) {
    warn(`page 2 content ends at ${Math.round(contentBottom)}px, past the ${FOOTER_TOP - 16}px limit above the footer — shorten the overview, benefit, investment or step copy.`);
  }

  // Footer
  hline(slide, pres, 0, W, FOOTER_TOP + 0.5, C.border);
  box(slide, [r('GLOBALCITIZENSOLUTIONS.COM', { font: FONTS.label, size: 10, color: C.primary, ls: 1.4, lh: 14 })],
    { x: PAD, y: 1095, w: 300, h: 14 });
  box(slide, [r(`${p.coverTitleLine1} ${p.coverTitleLine2} — Factsheet`, { font: FONTS.base, size: 10, color: C.muted, ls: LS, lh: 14, align: 'right' })],
    { x: W - PAD - 400, y: 1095, w: 400, h: 14 });

  return slide;
}

// ── page 3: back cover ─────────────────────────────────────────────────────

const SOCIALS = [
  { name: 'linkedin', url: 'https://www.linkedin.com/company/globalcitizensolutions/' },
  { name: 'facebook', url: 'https://www.facebook.com/globalcitizensolutions/' },
  { name: 'instagram', url: 'https://www.instagram.com/globalcitizensolutions/' },
  { name: 'youtube', url: 'https://beglobal.link/GCS-youtube' },
];

function addFactsheetBackCover(pres) {
  const slide = pres.addSlide();
  slide.background = { path: asset('covers/background-back-cover.png') };

  image(slide, asset('logos/GCS-Primary-White.png'), PAD, PAD, 32 * (199 / 71), 32);

  box(slide, [
    r('Our Global', { font: FONTS.heading, size: 68, color: C.white, ls: -1.5, lh: 73.44, br: true }),
    r('Presence.', { font: FONTS.heading, size: 68, color: C.lavender, italic: true, ls: -1.5, lh: 73.44 }),
  ], { x: PAD, y: 552.7, w: CONTENT_W, h: 147, dy: -8 });

  box(slide, [r(
    'We operate globally, with teams supporting clients across different regions, both through local offices and dedicated contact points.',
    { font: FONTS.base, size: 16, color: C.labelOnDark, ls: LS, lh: 25.6 },
  )], { x: PAD, y: 721.5, w: 520, h: 51.2, dy: -4 });

  image(slide, asset('icons/pin.png'), PAD, 816.7, 16, 20);
  box(slide, [r(COUNTRIES, { font: FONTS.base, size: 17, color: C.white, ls: 0.17, lh: 28.05 })],
    { x: PAD, y: 846.7, w: CONTENT_W, h: 56.1, dy: -6 });

  hline(slide, pres, PAD, W - PAD, 946.8, WHITE_ON_NIGHT_BLUE[10]);
  box(slide, [r('GLOBALCITIZENSOLUTIONS.COM', { font: FONTS.base, size: 11, color: C.linkOnDark, ls: 2.2, lh: 15.4 })],
    { x: PAD, y: 1011.6, w: 300, h: 15.4 });
  SOCIALS.forEach((s, i) => {
    image(slide, asset(`icons/social/${s.name}.png`), PAD + i * 36, 1045, 22, 22, { hyperlink: { url: s.url } });
  });

  const addr = (lines, y) => box(slide,
    lines.map((l, i) => r(l, { font: FONTS.base, size: 13, color: C.white, ls: LS, lh: 20.8, align: 'right', br: i < lines.length - 1 })),
    { x: W - PAD - 285, y, w: 285, h: 41.6, dy: -4 });
  addr(['8–10 Hill Street, London', 'W1J 5NG — United Kingdom'], 975.8);
  addr(['+44 20 8068 3119', 'info@globalcitizensolutions.com'], 1025.4);

  return slide;
}

module.exports = { addFactsheetCover, addFactsheetContent, addFactsheetBackCover, overviewFit, OVERVIEW_MAX_LINES };
