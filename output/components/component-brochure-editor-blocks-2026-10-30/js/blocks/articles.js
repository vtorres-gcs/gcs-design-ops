import { esc } from '../util.js';

const H = "font-family:'Yrsa',serif;font-weight:400;font-size:28px;line-height:1.1;color:var(--primary);letter-spacing:-.3px;margin-bottom:12px;";
const BORDER = 'var(--doc-border-light)';

export default {
  type: 'articles', label: 'Lista de artigos', icon: 'description', group: 'Listas',
  defaults: () => ({
    title: '',
    items: [
      { title: 'Why tax incentives are shaping HNWI migration in Europe', excerpt: 'As traditional visa pathways tighten, favorable tax regimes are becoming a key factor in how wealthy individuals choose where to live, structure wealth, and plan across borders.', url: '#', img: '' },
      { title: 'From International Mobility to the Quality of Life', excerpt: 'Looking beyond visa-free access, this article shows how quality of life has become a central measure in evaluating the real value of a passport.', url: '#', img: '' },
      { title: 'Crypto Secure Jurisdictions: Where Crypto Actually Works', excerpt: 'A comparative look at the jurisdictions where digital-asset investors can operate with greater legal certainty, stronger banking support, and more reliable long-term structuring options.', url: '#', img: '' },
      { title: 'Policy Over Borders: How Restrictive Migration Laws Are Reshaping Citizenship Planning', excerpt: 'As governments tighten migration rules, investment migration is moving toward a more controlled model shaped by stricter screening, clearer rules, and greater accountability.', url: '#', img: '' },
      { title: 'Global Atlas of Risk and Readiness Report 2026', excerpt: 'Our latest report examines which countries are best positioned to protect capital and sustain long-term competitiveness, using a comparative framework built around structural risk, institutional resilience, and future readiness.', url: '#', img: '' }]
  }),
  fields: [['title', 'Section title (optional)']],
  lists: { items: { min: 0, max: 10, one: 'Article', add: () => ({ title: 'New article', excerpt: 'Short excerpt.', url: '#', img: '' }), f: [['title', 'Title'], ['excerpt', 'Excerpt', 'area', 3], ['url', 'Link URL'], ['img', 'Image', 'img', 600]] } },
  render: (p, ctx) => {
    if (!p.items.length) return '';
    return `<div>${p.title ? ctx.F('title', 'div', H) : ''}${row(p, ctx, 0, p.items.length)}</div>`;
  },
  split: (p, ctx) => {
    const parts = p.items.map((_, i) => row(p, ctx, i, i + 1));
    if (p.title && parts.length) parts[0] = `${ctx.F('title', 'div', H)}${parts[0]}`;
    return parts;
  }
};

function row(p, ctx, from, to) {
  return p.items.slice(from, to).map((a, k) => {
    const i = from + k, last = i === p.items.length - 1;
    const thumb = a.img
      ? `<img src="${esc(a.img)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">`
      : `<div style="width:100%;height:100%;background:repeating-linear-gradient(-45deg,var(--doc-pattern-1) 0,var(--doc-pattern-1) 6px,var(--doc-pattern-2) 6px,var(--doc-pattern-2) 12px);display:flex;align-items:center;justify-content:center;"><span style="font-family:monospace;font-size:9px;color:var(--doc-muted);text-align:center;padding:4px;">article image</span></div>`;
    return `<div style="display:flex;gap:24px;align-items:flex-start;padding:22px 0;border-top:1px solid ${BORDER};${last ? `border-bottom:1px solid ${BORDER};` : ''}">`
      + `<div style="width:120px;height:80px;flex-shrink:0;border-radius:3px;overflow:hidden;background:var(--doc-pattern-2);">${thumb}</div>`
      + `<div style="flex:1;min-width:0;">${ctx.F(`items.${i}.title`, 'a', "font-family:'Yrsa',serif;font-size:19px;font-weight:400;color:var(--doc-badge);line-height:1.3;text-decoration:none;display:block;margin-bottom:6px;", `href="${esc(a.url)}"`)}`
      + `<div style="font-family:'Heebo',sans-serif;font-size:13px;font-weight:300;color:var(--doc-muted-alt);line-height:1.65;">${ctx.F(`items.${i}.excerpt`, 'span')} <span style="color:var(--doc-badge);">→</span></div></div></div>`;
  }).join('');
}
