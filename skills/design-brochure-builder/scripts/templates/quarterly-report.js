/**
 * Template mapper for "quarterly-report" — translates a flat props object
 * (shaped like quarterly-report.json's propsSchema, mirroring the source
 * .dc.html's data-props) into the plain content.json shape
 * scripts/build-brochure.js already renders. See quarterly-report.json for
 * the prop list and the dropped (dead) coverSubtitle/CTA/consultant props.
 *
 * Never invents copy: every text field below comes straight from `props`;
 * this file only decides page/component structure, which is fixed by the
 * template itself (see
 * templates/brochures/quarterly-report/QuarterlyReport.dc.html).
 *
 * Cover note: the source renders `quarter` ABOVE the two-line title, with no
 * subtitle box. `cover.js`'s addCoverGCS is a shared, fixed-layout component
 * (eyebrow always renders below the title) already reused as-is by
 * case-study — this mapper accepts the same approximation rather than
 * building a one-off cover variant for a single template.
 */

function mapPropsToBlocks(props) {
  const year = props.year || String(new Date().getFullYear());

  return {
    title: 'Investment Migration Quarterly Report — GCS',
    pages: [
      {
        type: 'cover-gcs',
        eyebrow: props.quarter,
        coverTitleLine1: 'Investment Migration',
        coverTitleLine2: 'Quarterly Report',
        titleFontSize: 62,
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
