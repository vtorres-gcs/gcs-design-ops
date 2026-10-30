import { esc } from '../util.js';
const QUOTE = {
  plain: "font-family:'Yrsa',serif;font-weight:400;font-style:italic;font-size:22px;color:var(--doc-heading);line-height:1.5;margin-bottom:16px;",
  dark: "font-family:'Yrsa',serif;font-weight:400;font-style:italic;font-size:22px;color:var(--primary-foreground);line-height:1.5;margin-bottom:16px;"
};
const AUTHOR = {
  plain: "font-family:'Heebo',sans-serif;font-size:11px;font-weight:700;color:var(--primary);letter-spacing:.04em;",
  dark: "font-family:'Heebo',sans-serif;font-size:11px;font-weight:700;color:var(--night-blue-50);letter-spacing:.04em;"
};
const FRAME = {
  boxed: 'padding:36px 0 0;margin-top:14px;border-top:1px solid var(--doc-border-light);',
  plain: 'padding:8px 0;',
  dark: 'padding:28px 32px;background:var(--primary);'
};

export default {
  type: 'pullQuote', label: 'Citação', icon: 'description', group: 'Texto',
  defaults: () => ({
    style: 'boxed',
    quote: '"Collectively, these trends position investment migration as a more regulated, resilient, and strategically relevant pillar of global mobility in the years ahead."',
    author: 'Patricia Casaburi, CEO of Global Citizen Solutions', img: ''
  }),
  fields: [['style', 'Style', 'select', ['boxed', 'plain', 'dark']], ['quote', 'Quote', 'area', 4], ['author', 'Author'], ['img', 'Author photo', 'img', 300]],
  render: (p, ctx) => {
    const tone = p.style === 'dark' ? 'dark' : 'plain';
    const photo = p.img ? `<div style="width:72px;height:72px;border-radius:50%;flex-shrink:0;overflow:hidden;background:var(--doc-pattern-2);"><img src="${esc(p.img)}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:center top;"></div>` : '';
    return `<div style="display:flex;gap:28px;align-items:flex-start;${FRAME[p.style] || FRAME.boxed}">${photo}<div style="flex:1;">${ctx.F('quote', 'div', QUOTE[tone])}${ctx.F('author', 'div', AUTHOR[tone])}</div></div>`;
  }
};
