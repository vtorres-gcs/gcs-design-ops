/**
 * Template mapper for "factsheet" — translates the flat props object
 * (see factsheet.json's propsSchema, plus
 * `flagIso2`) into the content.json pages scripts/build-brochure.js renders.
 *
 * The factsheet is a fixed 3-page layout reproduced 1:1 by
 * scripts/components/factsheet.js, so this mapper only (a) checks that every
 * prop the template renders was supplied — it never falls back to the
 * template's Italy defaults, because user copy is final and nothing may be
 * invented — and (b) attaches the per-country flag and the template's six
 * fixed Key Benefits icons.
 *
 * Key Benefits icons are not props: the template fixes six Material
 * Symbols (outlined) icons, listed below in card order.
 */

const { overviewFit } = require('../components/factsheet');

const BENEFIT_ICONS = ['travel_explore', 'badge', 'family_restroom', 'work', 'savings', 'public'];
const ACCENT = '#3F8CFF'; // template: color: var(--accent)

const REQUIRED = [
  'coverTitleLine1', 'coverTitleLine2', 'subtitle', 'supportText', 'overview',
  ...[1, 2, 3, 4].flatMap((n) => [`fig${n}Value`, `fig${n}Label`]),
  ...[1, 2, 3, 4, 5, 6].flatMap((n) => [`benefit${n}Title`, `benefit${n}Desc`]),
  ...[1, 2, 3, 4].flatMap((n) => [`inv${n}Title`, `inv${n}Amount`, `inv${n}Desc`]),
  ...[1, 2, 3, 4, 5, 6].flatMap((n) => [`step${n}Title`, `step${n}Desc`]),
];

function mapPropsToBlocks(props) {
  const missing = REQUIRED.filter((k) => props[k] == null || props[k] === '');
  if (missing.length) {
    throw new Error(
      `factsheet: missing required props: ${missing.join(', ')}. The template renders every one of these; ` +
      `supply them (verbatim copy) rather than relying on the template's Italy defaults.`
    );
  }
  const fit = overviewFit(props.overview);
  if (fit.lines > fit.maxLines) {
    throw new Error(
      `factsheet: overview is ${fit.lines} lines (${fit.chars} chars) but its box holds ${fit.maxLines} lines ` +
      `(~560-600 chars as 3 short paragraphs; a blank line between paragraphs costs one line). ` +
      `Shorten it by ${fit.lines - fit.maxLines} line(s) or the Overview box would grow and push every section below it down.`
    );
  }
  const country = props.country || `${props.coverTitleLine1} ${props.coverTitleLine2}`.trim();

  const page2 = { type: 'factsheet-content', country };
  for (const key of ['coverTitleLine1', 'coverTitleLine2', 'subtitle', 'overview']) page2[key] = props[key];
  for (const n of [1, 2, 3, 4]) {
    page2[`fig${n}Value`] = props[`fig${n}Value`];
    page2[`fig${n}Label`] = props[`fig${n}Label`];
    for (const f of ['Title', 'Amount', 'Desc']) page2[`inv${n}${f}`] = props[`inv${n}${f}`];
  }
  for (const n of [1, 2, 3, 4, 5, 6]) {
    page2[`step${n}Title`] = props[`step${n}Title`];
    page2[`step${n}Desc`] = props[`step${n}Desc`];
  }
  page2.benefits = BENEFIT_ICONS.map((icon, i) => ({
    title: props[`benefit${i + 1}Title`],
    desc: props[`benefit${i + 1}Desc`],
    icon: { name: icon, variant: 'outlined', color: ACCENT, size: 96 },
  }));
  if (props.flagIso2) {
    page2.flagIso2 = props.flagIso2;
    page2.flagSize = 176; // 4x the 44px badge, square-cropped by scripts/flags.py
  }

  return {
    title: `${country} — GCS Factsheet`,
    pages: [
      {
        type: 'factsheet-cover',
        coverTitleLine1: props.coverTitleLine1,
        coverTitleLine2: props.coverTitleLine2,
        subtitle: props.subtitle,
        supportText: props.supportText,
      },
      page2,
      { type: 'factsheet-back-cover' },
    ],
  };
}

module.exports = { mapPropsToBlocks };
