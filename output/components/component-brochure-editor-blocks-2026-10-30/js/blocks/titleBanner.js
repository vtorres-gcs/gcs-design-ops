const TITLE = "font-family:'Yrsa',serif;font-weight:400;font-size:46px;line-height:1;letter-spacing:-1px;color:var(--primary);";
const SUB = "font-family:'Heebo',sans-serif;font-size:14px;font-weight:300;color:var(--doc-body);line-height:1.5;margin-top:8px;";

export default {
  type: 'titleBanner', label: 'Banner de título', icon: 'public', group: 'Estrutura', unique: true,
  defaults: () => ({ flag: 'it' }),
  fields: [['flag', 'Flag (ISO-2 code, msikma/country-flags)']],
  render: (p, ctx) => `<div style="display:flex;align-items:flex-start;gap:16px;">${ctx.flag(p.flag, 44)}<div><div style="${TITLE}">${ctx.F('cover.coverTitleLine1', 'span')} ${ctx.F('cover.coverTitleLine2', 'span', 'font-style:italic;color:var(--night-blue-50);')}</div>${ctx.F('cover.subtitle', 'div', SUB)}</div></div>`
};
