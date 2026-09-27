/**
 * Template mapper for "factsheet" — translates a flat props object (shaped
 * like factsheet.json's propsSchema, mirroring the source .dc.html's
 * data-props) into the plain content.json shape scripts/build-brochure.js
 * already renders. See factsheet.json for the prop list.
 *
 * Never invents copy: every text field below comes straight from `props`;
 * this file only decides page/component structure, which is fixed by the
 * template itself (see templates/brochures/factsheet/Factsheet.dc.html).
 *
 * Icon choices for the 4 "Key Benefits" rows are a reasonable Material
 * Symbols pick per benefit's theme (the source uses literal bespoke SVG
 * paths with no icon name to port 1:1) — override via propsSchema's
 * `benefit<N>Icon` if a closer match is needed.
 */

function mapPropsToBlocks(props) {
  const year = props.year || String(new Date().getFullYear());
  const country = props.country || `${props.coverTitleLine1 || ''} ${props.coverTitleLine2 || ''}`.trim();

  const investmentRows = [1, 2, 3, 4]
    .map((n) => ({ title: props[`inv${n}Title`], subtitle: props[`inv${n}Subtitle`], amount: props[`inv${n}Amount`] }))
    .filter((r) => r.title || r.amount);

  const DEFAULT_BENEFIT_ICONS = { 1: 'public', 2: 'home', 3: 'health_and_safety', 4: 'translate' };
  const benefitRows = [1, 2, 3, 4]
    .map((n) => ({
      text: props[`benefit${n}`],
      icon: props[`benefit${n}`]
        ? { name: props[`benefit${n}Icon`] || DEFAULT_BENEFIT_ICONS[n], size: 16, fillHex: '#3D51E8' }
        : undefined,
    }))
    .filter((r) => r.text);

  return {
    title: `${country} — GCS Factsheet`,
    pages: [
      {
        type: 'cover-gcs',
        eyebrow: props.eyebrow,
        coverTitleLine1: props.coverTitleLine1,
        coverTitleLine2: props.coverTitleLine2,
        subtitle: props.subtitle,
        titleFontSize: 60,
        flagIso2: props.flagIso2,
      },
      {
        type: 'content-2col-stack',
        template: 'factsheet',
        brand: 'gcs',
        eyebrowText: country,
        pageNumber: '02',
        year,
        topBlocks: [
          { type: 'hero-image', heightIn: 1.75 },
          {
            type: 'stat-strip-dark',
            variant: 'eyebrow',
            stats: [
              { label: props.stat1Label, value: props.stat1Value, desc: props.stat1Desc },
              { label: props.stat2Label, value: props.stat2Value, desc: props.stat2Desc },
              { label: props.stat3Label, value: props.stat3Value, desc: props.stat3Desc },
            ].filter((s) => s.value || s.label),
          },
        ],
        leftColumn: {
          blocks: [
            {
              type: 'narrative',
              subSectionDividers: true,
              subHeadingStyle: { size: 9, uppercase: true, charSpacing: 2 },
              subSections: [1, 2, 3, 4]
                .map((n) => ({ heading: props[`section${n}Heading`], body: props[`section${n}Body`] }))
                .filter((s) => s.heading || s.body),
            },
          ],
        },
        rightColumn: {
          widthPx: 232,
          blocks: [
            { type: 'investment-panel', heading: 'Investment Options', rows: investmentRows },
            { type: 'benefits-panel', heading: 'Key Benefits', rows: benefitRows },
          ],
        },
      },
      { type: 'back-cover' },
    ],
  };
}

module.exports = { mapPropsToBlocks };
