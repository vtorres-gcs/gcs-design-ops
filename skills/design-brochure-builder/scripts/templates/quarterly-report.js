/**
 * Template mapper for "quarterly-report" — translates a flat props object
 * (shaped like quarterly-report.json's propsSchema) into the plain content.json shape
 * scripts/build-brochure.js already renders. See quarterly-report.json for
 * the prop list and the dropped (dead) coverSubtitle/CTA/consultant props.
 *
 * Never invents copy: every text field below comes straight from `props`;
 * this file only decides page/component structure, which is fixed by the
 * template itself.
 *
 * Cover note: the source renders `quarter` ABOVE the two-line title, with no
 * subtitle box. `cover.js`'s addCoverGCS is a shared, fixed-layout component
 * (eyebrow always renders below the title) already reused as-is by
 * case-study — this mapper accepts the same approximation rather than
 * building a one-off cover variant for a single template.
 */

const { checkProps } = require('./_validate');

const REQUIRED = [
  'quarter', 'aboutPara1', 'article1Title', 'article1Excerpt',
  'contentSectionLabel', 'contentHeading', 'section1Heading', 'section1Body',
  'pullQuote', 'pullQuoteAuthor',
];
const OPTIONAL_SLOTS = [
  'aboutPara2', 'aboutPara3',
  ...[2, 3, 4, 5].flatMap((n) => [`article${n}Title`, `article${n}Excerpt`]),
  ...[2, 3].flatMap((n) => [`section${n}Heading`, `section${n}Body`]),
];

function mapPropsToBlocks(props) {
  checkProps('quarterly-report', props, REQUIRED, OPTIONAL_SLOTS);
  const year = props.year || String(new Date().getFullYear());

  return {
    title: 'Investment Migration Quarterly Report — GCS',
    pages: [
      {
        type: 'cover-gcs',
        eyebrow: props.quarter,
        coverTitleLine1: 'Investment Migration',
        coverTitleLine2: 'Quarterly Report',
        titleFontSize: 46.5, // pt — the template's 62px (cover.js sizes are points)
      },
      {
        type: 'content',
        template: 'quarterly-report',
        brand: 'gcs',
        eyebrowText: 'About this Report',
        pageNumber: '02',
        year,
        blocks: [
          {
            type: 'narrative',
            heading: 'About this Report',
            body: [props.aboutPara1, props.aboutPara2, props.aboutPara3].filter(Boolean),
          },
          {
            type: 'article-list',
            articles: [1, 2, 3, 4, 5]
              .map((n) => ({
                title: props[`article${n}Title`],
                excerpt: props[`article${n}Excerpt`],
                url: props[`article${n}Url`],
              }))
              .filter((a) => a.title || a.excerpt),
          },
        ],
      },
      {
        type: 'content',
        template: 'quarterly-report',
        brand: 'gcs',
        eyebrowText: props.contentSectionLabel,
        pageNumber: '03',
        year,
        blocks: [
          {
            type: 'narrative',
            heading: props.contentHeading,
            subSections: [1, 2, 3]
              .map((n) => ({ heading: props[`section${n}Heading`], body: props[`section${n}Body`] }))
              .filter((s) => s.heading || s.body),
          },
          {
            type: 'pull-quote',
            quoteSize: 16.5, attrSize: 8.25, // pt = template px x0.75 (22px / 11px)
            quoteText: props.pullQuote,
            attribution: props.pullQuoteAuthor,
            photoSrc: props.ceoPhotoPath,
          },
        ],
      },
      { type: 'back-cover' },
    ],
  };
}

module.exports = { mapPropsToBlocks };
