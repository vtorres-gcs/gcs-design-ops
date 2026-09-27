/**
 * Shared layout/color/font constants for gcs-brochure-builder.
 *
 * Colors are the brochure's actual hex values (`#3D51E8` accent), NOT
 * `tokens/colors.css`'s `#3F8CFF` — this is a deliberate, documented
 * divergence inherited from skills/gcs-brochure/references/design-system.md.
 * See references/design-tokens.md for the full rationale.
 */

const path = require('path');

const SKILL_DIR = path.resolve(__dirname, '..');
const asset = (p) => path.join(SKILL_DIR, 'assets', p);

// A4 portrait, 210mm x 297mm, exact.
const PAGE_W = 8.27;
const PAGE_H = 11.69;

// Chrome geometry (px->in at the brochure's 96dpi base: 1px = 0.010417in).
const PX = (px) => px * 0.010417;

const MARGIN_X = PX(64); // 0.667in — default/free-mode side padding when no template is set
const HEADER_H = PX(56); // 0.583in
const FOOTER_H = PX(44); // 0.458in
const CONTENT_Y = HEADER_H; // 0.583in — top of the content area, flush with the header hairline
// Leading gap below the header hairline before the first block's own content starts.
// Ported templates use 48-56px of top padding on every text-first content page (only
// hero-image sits flush against the header) — 52px is the modal value across all six
// templates/brochures/*.dc.html pages. See references/page-archetypes.md.
const CONTENT_TOP_PAD = PX(52); // 0.542in
const CONTENT_BOTTOM = PAGE_H - FOOTER_H; // 11.232in on GCS pages using default footer height
const CONTENT_W = PAGE_W - 2 * MARGIN_X; // 6.936in

// Side margin (px) per templates/brochures/*.dc.html template, confirmed against each
// template's own header/body padding. Free mode (no `template` set) keeps the fixed
// MARGIN_X above. Also doubles as the chrome header/footer inset so body copy and chrome
// can never drift apart (previously `CHROME_PAD` in chrome.js only covered brand, not
// per-template variance — case-study/quarterly-report/giu-corporate use 64px,
// factsheet/giu-calendar/lead-magnet use 56px, independent of GCS/GIU brand).
const TEMPLATE_MARGIN_PX = {
  'case-study': 64,
  'quarterly-report': 64,
  'giu-corporate': 64,
  factsheet: 56,
  'giu-calendar': 56,
  'lead-magnet': 56,
};

/**
 * Resolve the side margin/content width for a page, given an optional template name
 * or brand. Free mode (no template) falls back to the fixed MARGIN_X/CONTENT_W used
 * today; brand is used only as a secondary fallback for chrome (gcs=64px, giu=56px)
 * when neither a template nor an override is given.
 * @param {{template?: string, brand?: string}} [opts]
 * @returns {{marginX: number, contentW: number}}
 */
function getContentMetrics({ template, brand } = {}) {
  if (template && TEMPLATE_MARGIN_PX[template] != null) {
    const marginX = PX(TEMPLATE_MARGIN_PX[template]);
    return { marginX, contentW: PAGE_W - 2 * marginX };
  }
  if (brand === 'giu') {
    const marginX = PX(56);
    return { marginX, contentW: PAGE_W - 2 * marginX };
  }
  return { marginX: MARGIN_X, contentW: CONTENT_W };
}

const COLORS = {
  nightBlue: '000957',
  accent: '3D51E8', // brochure accent — intentionally not tokens/colors.css's 3F8CFF, see references/design-tokens.md
  headingInk: '16182A',
  bodyInk: '4B4E65',
  leadInk: '252839',
  mutedInk: '6F7185',
  faintInk: '9B9CAD',
  hairline: 'E0E2EA',
  hairlineTint: 'ECEDF5',
  highlightTint: 'F2F3FE', // == --doc-surface-alt in tokens/colors.css
  surface: 'F7F8FD', // == --doc-surface in tokens/colors.css
  lavender: 'B3B5CD',
  white: 'FFFFFF',
};

/**
 * Pre-blended solid hexes for rgba(255,255,255,A) over #000957 (Night Blue).
 * Used instead of `transparency` whenever the run also needs `charSpacing` —
 * combining both causes LibreOffice to silently truncate the run (same
 * pitfall documented in skills/gcs-pptx/SKILL.md).
 */
const WHITE_ON_NIGHT_BLUE = {
  10: '1A2268',
  20: '333A79',
  25: '404781',
  40: '666B9A',
  45: '7378A3',
  50: '8084AB',
  55: '8C90B3',
  60: '999DBC',
  65: 'A6A9C4',
};

const FONTS = {
  heading: 'Yrsa',
  headingItalic: 'Yrsa', // italic:true on the same family — both regular+italic are embedded
  label: 'Heebo SemiBold',
  labelMedium: 'Heebo Medium',
  labelBold: 'Heebo Bold',
  body: 'Heebo Light',
  base: 'Heebo',
};

module.exports = {
  SKILL_DIR,
  asset,
  PAGE_W,
  PAGE_H,
  PX,
  MARGIN_X,
  HEADER_H,
  FOOTER_H,
  CONTENT_Y,
  CONTENT_TOP_PAD,
  CONTENT_BOTTOM,
  CONTENT_W,
  TEMPLATE_MARGIN_PX,
  getContentMetrics,
  COLORS,
  WHITE_ON_NIGHT_BLUE,
  FONTS,
};
