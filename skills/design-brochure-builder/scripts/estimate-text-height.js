/**
 * Approximate the rendered height of a text run so components can stack on
 * the Y cursor without PptxGenJS's lack of text reflow silently clipping
 * content (PptxGenJS boxes do not auto-grow or report overflow — see
 * SKILL.md "No automatic text reflow").
 *
 * Line counts use measured glyph advances for the bundled fonts (text-metrics.js)
 * and fall back to an average-character-width heuristic for any other face. Neither
 * is a real text-layout engine. Always leave ~10% headroom in a page's height
 * budget and confirm with the QA render (scripts/office/soffice.py + pdftoppm)
 * — never trust this number alone.
 */

// Average glyph width as a fraction of font size, calibrated loosely against
// Heebo/Yrsa's actual metrics — sans fonts run narrower than serif at the
// same point size.
const AVG_CHAR_FACTOR = {
  Yrsa: 0.5,
  Heebo: 0.46,
  'Heebo Light': 0.46,
  'Heebo Medium': 0.47,
  'Heebo SemiBold': 0.48,
  'Heebo Bold': 0.49,
};

const { countLines } = require('./text-metrics');
const MEASURED_FACES = new Set(['Yrsa', 'Heebo', 'Heebo Light', 'Heebo Medium', 'Heebo SemiBold', 'Heebo Bold']);

function estimateLineCount(text, widthIn, fontSizePt, fontFace) {
  // Known faces: word-wrap with real glyph advances (assets/font-metrics.json) —
  // the flat average-width heuristic below over-counts Yrsa/Heebo lines and left
  // visible gaps between stacked blocks.
  if (MEASURED_FACES.has(fontFace)) {
    return Math.max(1, countLines(String(text || ''), fontFace, fontSizePt / 0.75, widthIn * 96));
  }
  const factor = AVG_CHAR_FACTOR[fontFace] || 0.48;
  const avgCharWidthIn = (fontSizePt * factor) / 72;
  const charsPerLine = Math.max(1, Math.floor(widthIn / avgCharWidthIn));

  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 1;

  let lines = 1;
  let lineLen = 0;
  for (const word of words) {
    const wordLen = word.length + 1; // +1 for the trailing space
    if (lineLen + wordLen > charsPerLine && lineLen > 0) {
      lines += 1;
      lineLen = wordLen;
    } else {
      lineLen += wordLen;
    }
  }
  return lines;
}

/**
 * @param {string} text
 * @param {number} widthIn - box width in inches
 * @param {number} fontSizePt - font size in points
 * @param {number} lineSpacingMultiple - e.g. 1.85
 * @param {string} [fontFace] - one of AVG_CHAR_FACTOR's keys; defaults to a Heebo-ish average
 * @returns {number} estimated height in inches
 */
function estimateTextHeight(text, widthIn, fontSizePt, lineSpacingMultiple, fontFace) {
  const lines = estimateLineCount(text, widthIn, fontSizePt, fontFace);
  const lineHeightIn = (fontSizePt * lineSpacingMultiple) / 72;
  return lines * lineHeightIn;
}

/**
 * Estimated single-line rendered width, for cases that need to position a
 * second run right after a variable-length label (e.g. timeline step title
 * + duration on the same baseline).
 */
function estimateLineWidth(text, fontSizePt, fontFace) {
  const factor = AVG_CHAR_FACTOR[fontFace] || 0.48;
  const avgCharWidthIn = (fontSizePt * factor) / 72;
  return String(text || '').length * avgCharWidthIn;
}

module.exports = { estimateTextHeight, estimateLineCount, estimateLineWidth };
