const EYEBROW = "font-family:'Heebo',sans-serif;font-size:10px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:var(--doc-muted);margin-bottom:8px;";
const TITLE = "font-family:'Yrsa',serif;font-weight:400;font-size:28px;line-height:1.1;color:var(--primary);letter-spacing:-.3px;margin-bottom:12px;";
const SUB = "font-family:'Heebo',sans-serif;font-size:13px;font-weight:300;color:var(--doc-body);line-height:1.5;";

export default {
  type: 'heading', label: 'Título de seção', icon: 'title', group: 'Texto',
  defaults: () => ({ eyebrow: 'Section', title: 'Section title', subtitle: '' }),
  fields: [['eyebrow', 'Eyebrow'], ['title', 'Title'], ['subtitle', 'Subtitle', 'area', 2]],
  render: (p, ctx) => `<div>${p.eyebrow ? ctx.F('eyebrow', 'div', EYEBROW) : ''}${ctx.F('title', 'div', TITLE)}${p.subtitle ? ctx.F('subtitle', 'div', SUB) : ''}</div>`
};
