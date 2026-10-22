/**
 * Back cover. Static content (no props): background gradient, logo, "Our Global
 * Presence." heading, country list, social row (clickable), address/phone block.
 *
 * All six templates share one back cover, so there is a single implementation:
 * the measured absolute-pixel layout in factsheet.js (`addFactsheetBackCover`).
 * This module only owns the shared COUNTRIES string and keeps `addBackCover` as
 * the stable entry point for the free-mode/template `back-cover` page type.
 *
 * The CSS radial-gradient background has no PptxGenJS equivalent (shapes
 * have no gradient fill) — it's pre-rendered once by scripts/gen-assets.py
 * into assets/covers/background-back-cover.png.
 */

const COUNTRIES = [
  'ANTIGUA AND BARBUDA', 'BRAZIL', 'DUBAI', 'GRENADA', 'ITALY', 'MALTA',
  'PORTUGAL', 'SPAIN', 'ST. LUCIA', 'SWITZERLAND', 'TURKEY', 'UNITED KINGDOM', 'VANUATU',
].join(' | ');

function addBackCover(pres) {
  // Lazy require: factsheet.js imports COUNTRIES from this module.
  return require('./factsheet').addFactsheetBackCover(pres);
}

module.exports = { addBackCover, COUNTRIES };
