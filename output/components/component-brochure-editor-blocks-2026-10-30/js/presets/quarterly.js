import { DS, BR, PG } from '../consts.js';
import { renderBack } from './back.js';

export default {
  id: 'quarterly-report', label: 'Quarterly Report',
  blurb: 'A4 quarterly report: cover, about + article list, market content with pull quote, global presence.',
  tags: ['4+ pages', 'Institutional'],
  cover: {
    defaults: () => ({ quarter: 'Q2 2026', coverTitle1: 'Investment Migration', coverTitle2: 'Quarterly Report', coverImg: '' }),
    form: [
      { id: 'media', title: 'Media', open: true, fields: [['coverImg', 'Cover image', 'img', 1800]] },
      { id: 'cover', title: 'Cover', open: true, fields: [['quarter', 'Quarter label'], ['coverTitle1', 'Title line 1'], ['coverTitle2', 'Title line 2 (italic)']] }
    ],
    render: (cover, ctx) => `<div data-doc-page style="${PG}box-shadow:0 8px 40px rgba(0,0,0,.45);background:var(--doc-primary-deep);">
    <img src="${(cover.coverImg || BR + '/quarterly-report/background-cover.png').replace(/"/g, '&quot;')}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:0;">
    <div style="position:relative;z-index:2;padding:48px 56px 0;"><img src="${DS}/assets/logos/GCS-Primary-White.svg" alt="" style="height:40px;width:auto;display:block;"></div>
    <div style="position:relative;z-index:2;flex:1;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:0 56px;">
      ${ctx.F('cover.quarter', 'div', "font-family:'Heebo',sans-serif;font-size:11px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--doc-accent-alt);margin-bottom:20px;")}
      ${ctx.F('cover.coverTitle1', 'div', "font-family:'Yrsa',serif;font-weight:400;font-size:62px;color:var(--primary-foreground);line-height:1.05;letter-spacing:-1.5px;")}
      ${ctx.F('cover.coverTitle2', 'div', "font-family:'Yrsa',serif;font-weight:400;font-style:italic;font-size:62px;color:var(--night-blue-50);line-height:1.05;letter-spacing:-1.5px;")}
    </div>
    <div style="position:relative;z-index:2;padding:0 56px 56px;"><div style="font-family:'Heebo',sans-serif;font-size:12px;font-weight:500;letter-spacing:.06em;color:var(--doc-label-on-dark);">GLOBALCITIZENSOLUTIONS.COM</div></div>
  </div>`
  },
  back: { render: renderBack },
  meta: {
    defaults: () => ({ headerLabel: 'Investment Migration Quarterly Report', footerLeft: '© {year} Global Citizen Solutions — Confidential', footerRight: '', year: '2026' })
  },
  blocks: [
    { type: 'narrative' }, { type: 'articles' }, { type: 'pageBreak' },
    { type: 'heading', props: { eyebrow: '01 · Market Overview', title: 'Key Regulatory & Policy Developments' } },
    { type: 'sections' },
    { type: 'pullQuote', props: { style: 'boxed', img: DS + '/assets/uploads/Patricia%20Casaburi.png' } }
  ]
};
