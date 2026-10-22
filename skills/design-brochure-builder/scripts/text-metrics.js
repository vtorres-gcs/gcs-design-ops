/**
 * Measured text wrapping for components that size boxes from their copy.
 *
 * estimate-text-height.js uses an average-character-width heuristic, which is
 * good enough for loose stacks but mis-counts lines on narrow cards (a wrong
 * line count there means a box that is one line too short). This module sums
 * real per-glyph advances (assets/font-metrics.json, built by
 * scripts/gen-font-metrics.py) and word-wraps greedily the way a browser does
 * — breaking at spaces and after hyphens/dashes. Kerning is ignored.
 */
const fs = require('fs');
const path = require('path');

const METRICS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'assets', 'font-metrics.json'), 'utf8'));

// Browsers apply GPOS kerning; the advance table above doesn't. These factors
// were fitted against widths measured in Chrome on the factsheet template
// (Heebo ~1.2% over, Yrsa ~2.5% over) so line counts match the real render.
const KERNING_FIT = { Yrsa: 0.975, 'Yrsa Italic': 0.975 };
const DEFAULT_KERNING_FIT = 0.988;

/** Width in px of `text` set in `font` at `sizePx`, with `lsPx` letter-spacing per glyph. */
function textWidthPx(text, font, sizePx, lsPx = 0) {
  const m = METRICS[font];
  if (!m) throw new Error(`text-metrics: no metrics for font "${font}" (have: ${Object.keys(METRICS).join(', ')})`);
  const fit = KERNING_FIT[font] != null ? KERNING_FIT[font] : DEFAULT_KERNING_FIT;
  let w = 0;
  for (const ch of String(text)) w += (m.adv[ch] != null ? m.adv[ch] : m.default) * sizePx * fit + lsPx;
  return w;
}

/** Break a paragraph into unbreakable chunks (word + trailing space, or up to a hyphen/dash). */
function chunks(text) {
  return String(text).match(/[^\s\-–—]*[\-–—]|[^\s\-–—]+\s*|\s+/g) || [];
}

/** Number of lines `text` occupies in a box `widthPx` wide ('\n' starts a new line; an empty line still counts). */
function countLines(text, font, sizePx, widthPx, lsPx = 0) {
  let total = 0;
  for (const para of String(text == null ? '' : text).split('\n')) {
    if (!para.trim()) { total += 1; continue; }
    let lines = 1;
    let lineW = 0;
    for (const chunk of chunks(para)) {
      const w = textWidthPx(chunk.replace(/\s+$/, ''), font, sizePx, lsPx);
      const full = textWidthPx(chunk, font, sizePx, lsPx);
      if (lineW > 0 && lineW + w > widthPx + 0.01) {
        lines += 1;
        lineW = full;
      } else {
        lineW += full;
      }
    }
    total += lines;
  }
  return total;
}

module.exports = { textWidthPx, countLines };
