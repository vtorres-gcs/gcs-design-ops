import { DS, BR, PG } from '../consts.js';
import { renderBack } from './back.js';

export default {
  id: 'factsheet', label: 'Factsheet',
  blurb: 'A4 programme factsheet: cover, key facts and investment options, global presence.',
  tags: ['3+ pages', 'Visa programme'],
  cover: {
    defaults: () => ({
      coverTitleLine1: 'Italy', coverTitleLine2: 'Investor Visa', subtitle: 'Golden Visa Programme',
      supportText: "One of Europe's most accessible and fastest-processing investor visa programmes — offering a direct pathway to EU residency and, after 10 years, Italian citizenship.",
      coverImg: ''
    }),
    form: [
      { id: 'media', title: 'Media', open: true, fields: [['coverImg', 'Cover image', 'img', 1800]] },
      { id: 'cover', title: 'Cover & title', open: true, fields: [['coverTitleLine1', 'Title line 1'], ['coverTitleLine2', 'Title line 2 (italic)'], ['subtitle', 'Subtitle'], ['supportText', 'Cover support text', 'area', 4]] }
    ],
    render: (cover, ctx) => `<div data-doc-page style="${PG}box-shadow:0 8px 40px rgba(0,0,0,.45);background:var(--primary);">
    <img src="${(cover.coverImg || BR + '/factsheet/background-cover.png').replace(/"/g, '&quot;')}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:0;">
    <div style="position:relative;z-index:2;padding:52px 60px 0;"><img src="${DS}/assets/logos/GCS-Symbol-White.svg" alt="" style="width:42px;height:42px;"></div>
    <div style="position:relative;z-index:2;padding:0 60px 64px;margin-top:auto;">
      <div style="font-family:'Yrsa',serif;font-weight:400;font-size:74px;color:var(--primary-foreground);line-height:.98;letter-spacing:-2px;margin-bottom:20px;">${ctx.F('cover.coverTitleLine1', 'span')} ${ctx.F('cover.coverTitleLine2', 'span', 'font-style:italic;color:var(--night-blue-50);')}</div>
      ${ctx.F('cover.subtitle', 'div', "font-family:'Heebo',sans-serif;font-size:28px;font-weight:300;color:var(--primary-foreground);line-height:1.3;margin-bottom:16px;")}
      ${ctx.F('cover.supportText', 'div', "font-family:'Heebo',sans-serif;font-size:16px;font-weight:300;color:rgba(255,255,255,.58);line-height:1.65;max-width:490px;")}
    </div></div>`
  },
  back: { render: renderBack },
  meta: {
    defaults: () => ({ headerLabel: 'Italy Investor Visa', footerLeft: 'GLOBALCITIZENSOLUTIONS.COM', footerRight: 'Italy Investor Visa — Factsheet', year: '2026' })
  },
  blocks: [
    { type: 'titleBanner', props: { flag: 'it' } },
    { type: 'figures', props: { theme: 'dark' } },
    { type: 'overview' }, { type: 'benefits' }, { type: 'options' }, { type: 'steps' }
  ]
};
