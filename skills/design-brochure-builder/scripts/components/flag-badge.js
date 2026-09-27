/**
 * flag-badge — small circular country flag, e.g. the factsheet cover badge.
 * Source PNG resolved via scripts/flags.py (assets/flags/{iso2}.png, self-
 * hosted from msikma/country-flags — never another source, see
 * skills/gcs-table-chart/references/flags.md).
 *
 * @param {Slide} slide
 * @param {Presentation} pres
 * @param {object} props
 * @param {string} props.flagPngPath - absolute path, from scripts/flags.py's get_flag_png()
 * @param {number} props.x
 * @param {number} props.y
 * @param {number} [props.size] - diameter, inches (default 0.583in / 42px, matches factsheet cover)
 * @param {string} [props.ringColor] - optional thin inset ring hex, for badges placed over a photo
 */
const { PX } = require('../tokens');

const DEFAULT_SIZE = PX(42);

function addFlagBadge(slide, pres, { flagPngPath, x, y, size = DEFAULT_SIZE, ringColor }) {
  slide.addImage({ path: flagPngPath, x, y, w: size, h: size, rounding: true });
  if (ringColor) {
    slide.addShape(pres.shapes.OVAL, {
      x, y, w: size, h: size,
      fill: { type: 'none' },
      line: { color: ringColor, width: 0.75 },
    });
  }
}

module.exports = { addFlagBadge };
