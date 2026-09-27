/**
 * Back cover — ported from skills/gcs-brochure/assets/covers/back-cover.html.
 * Static content (no props): background gradient, logo, "Our Global
 * Presence." heading, country list, social row, address/phone block.
 *
 * The CSS radial-gradient background has no PptxGenJS equivalent (shapes
 * have no gradient fill) — it's pre-rendered once by scripts/gen-assets.py
 * into assets/covers/background-back-cover.png.
 */

const { asset, PAGE_W, PAGE_H, PX, COLORS, FONTS, WHITE_ON_NIGHT_BLUE } = require('../tokens');

const PAD = PX(56);

const COUNTRIES = [
  'ANTIGUA AND BARBUDA', 'BRAZIL', 'DUBAI', 'GRENADA', 'ITALY', 'MALTA',
  'PORTUGAL', 'SPAIN', 'ST. LUCIA', 'SWITZERLAND', 'TURKEY', 'UNITED KINGDOM', 'VANUATU',
].join(' | ');

const SOCIAL_LINKS = ['linkedin', 'facebook', 'instagram', 'youtube'];

function addBackCover(pres) {
  const slide = pres.addSlide();
  slide.background = { path: asset('covers/background-back-cover.png') };

  const logoH = 0.213, logoW = logoH * (199 / 71);
  slide.addImage({ path: asset('logos/GCS-Primary-White.png'), x: PAD, y: PAD, w: logoW, h: logoH });

  const w = PAGE_W - 2 * PAD;
  const contactBlockH = 1.2; // bottom row: socials/url left, address/phone right

  // Bottom-anchored text block, drawn top-to-bottom (source order: title ->
  // intro paragraph -> pin+countries), sized up-front so it lands flush
  // against the contact row's reserved area.
  const title1H = 1.0, title2H = 1.0, titleGap = 0.14;
  const introH = 0.42, introGap = 0.28;
  const countriesH = 0.35;
  const blockGap = 0.14; // between pin+countries and the title/intro above it

  const totalH = title1H + title2H + titleGap + introH + introGap + countriesH;
  let y = PAGE_H - PAD - contactBlockH - totalH;

  slide.addText('Our Global', { x: PAD, y, w, h: title1H, fontFace: FONTS.heading, fontSize: 68, color: COLORS.white, charSpacing: -1.5, valign: 'top', margin: 0 });
  y += title1H;
  slide.addText('Presence.', { x: PAD, y, w, h: title2H, fontFace: FONTS.heading, fontSize: 68, italic: true, color: COLORS.lavender, charSpacing: -1.5, valign: 'top', margin: 0 });
  y += title2H + titleGap;

  slide.addText(
    'We operate globally, with teams supporting clients across different regions, both through local offices and dedicated contact points.',
    {
      x: PAD, y, w: Math.min(w, 5.42), h: introH,
      fontFace: FONTS.base, fontSize: 10.5, color: WHITE_ON_NIGHT_BLUE[65],
      lineSpacingMultiple: 1.6, valign: 'top', margin: 0,
    }
  );
  y += introH + introGap;

  slide.addImage({ path: asset('icons/pin.png'), x: PAD, y: y + 0.03, w: 0.19, h: 0.208 });
  slide.addText(COUNTRIES, {
    x: PAD + 0.27, y, w: w - 0.27, h: countriesH,
    fontFace: FONTS.base, fontSize: 11.25, color: COLORS.white,
    lineSpacingMultiple: 1.65, charSpacing: 0.3, valign: 'top', margin: 0,
  });

  // Bottom contact row
  const rowY = PAGE_H - PAD - contactBlockH + 0.28;
  slide.addShape(pres.shapes.LINE, { x: PAD, y: rowY, w, h: 0, line: { color: WHITE_ON_NIGHT_BLUE[10], width: 0.75 } });

  slide.addText('GLOBALCITIZENSOLUTIONS.COM', {
    x: PAD, y: rowY + 0.1, w: w * 0.55, h: 0.2,
    fontFace: FONTS.base, fontSize: 8.25, color: WHITE_ON_NIGHT_BLUE[65], charSpacing: 2.2, margin: 0,
  });

  const iconSize = 0.229, iconGap = 0.146;
  SOCIAL_LINKS.forEach((name, i) => {
    slide.addImage({ path: asset(`icons/${name}.png`), x: PAD + i * (iconSize + iconGap), y: rowY + 0.4, w: iconSize, h: iconSize });
  });

  slide.addText('Studio 5 Richmond Road, Kingston-Upon-Thames\nKT2 5BX — United Kingdom', {
    x: PAD + w * 0.55, y: rowY + 0.1, w: w * 0.45, h: 0.4,
    fontFace: FONTS.base, fontSize: 9.75, color: COLORS.white, lineSpacingMultiple: 1.5,
    align: 'right', margin: 0,
  });
  slide.addText('+44 20 8068 3119\ninfo@globalcitizensolutions.com', {
    x: PAD + w * 0.55, y: rowY + 0.5, w: w * 0.45, h: 0.4,
    fontFace: FONTS.base, fontSize: 9.75, color: COLORS.white, lineSpacingMultiple: 1.5,
    align: 'right', margin: 0,
  });

  return slide;
}

module.exports = { addBackCover };
