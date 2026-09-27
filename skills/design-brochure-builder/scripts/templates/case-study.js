/**
 * Template mapper for "case-study" — translates a flat props object (shaped
 * like case-study.json's propsSchema, mirroring the source .dc.html's
 * data-props) into the plain content.json shape scripts/build-brochure.js
 * already renders. See case-study.json for the prop list and the dropped
 * (dead) ctaLine1/ctaLine2/ctaBody props.
 *
 * Never invents copy: every text field below comes straight from `props`;
 * this file only decides page/component structure, which is fixed by the
 * template itself (see templates/brochures/case-study/CaseStudy.dc.html).
 */

function mapPropsToBlocks(props) {
  const year = props.year || new Date().getFullYear();

  return {
    title: `${props.clientName || 'Case Study'} — GCS Case Study`,
    pages: [
      {
        type: 'cover-gcs',
        eyebrowLabel: 'Case Study',
        eyebrow: props.eyebrow,
        coverTitleLine1: props.coverTitleLine1,
        coverTitleLine2: props.coverTitleLine2,
        subtitle: props.subtitle,
        titleFontSize: 64,
      },
      {
        type: 'content-2col',
        template: 'case-study',
        brand: 'gcs',
        eyebrowText: '01 · Client Profile',
        pageNumber: '02',
        year,
        leftColumn: {
          component: 'photo-column',
          props: {
            photoSrc: props.clientPhotoPath,
            name: props.clientName,
            profile: props.clientProfile,
            tags: [props.clientTag1, props.clientTag2, props.clientTag3].filter(Boolean),
          },
        },
        rightColumn: {
          blocks: [
            {
              type: 'narrative',
              sectionLabel: 'The Challenge',
              heading: props.challengeHeading,
              body: [props.challengeBody1, props.challengeBody2].filter(Boolean),
            },
            {
              type: 'key-facts-strip',
              facts: [
                { label: 'Nationality', value: props.factNationality },
                { label: 'Programme', value: props.factProgramme },
                { label: 'Timeline', value: props.factTimeline },
              ],
            },
            {
              type: 'pull-quote',
              quoteText: props.clientQuote,
              attribution: props.clientName,
              tint: 'F2F3FE',
              borderColor: '3D51E8',
            },
          ],
        },
      },
      {
        type: 'content',
        template: 'case-study',
        brand: 'gcs',
        eyebrowText: '02 · Our Solution',
        pageNumber: '03',
        year,
        blocks: [
          {
            type: 'narrative',
            sectionLabel: 'The Solution',
            heading: props.solutionHeading,
            body: [props.solutionBody1, props.solutionBody2].filter(Boolean),
          },
          {
            type: 'step-list',
            heading: 'What We Did',
            steps: [
              { title: props.step1Title, desc: props.step1Desc },
              { title: props.step2Title, desc: props.step2Desc },
              { title: props.step3Title, desc: props.step3Desc },
              { title: props.step4Title, desc: props.step4Desc },
            ].filter((s) => s.title || s.desc),
          },
          {
            type: 'stat-strip-dark',
            stats: [
              { value: props.result1Value, label: props.result1Label },
              { value: props.result2Value, label: props.result2Label },
              { value: props.result3Value, label: props.result3Label },
            ].filter((s) => s.value || s.label),
          },
        ],
      },
      { type: 'back-cover' },
    ],
  };
}

module.exports = { mapPropsToBlocks };
