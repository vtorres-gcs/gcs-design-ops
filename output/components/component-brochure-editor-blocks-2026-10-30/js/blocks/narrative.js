const EYEBROW = "font-family:'Heebo',sans-serif;font-size:10px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:var(--doc-muted);margin-bottom:10px;";
const TITLE = "font-family:'Yrsa',serif;font-weight:400;font-size:44px;color:var(--doc-heading);line-height:1.06;letter-spacing:-.8px;margin-bottom:28px;";
const LEAD = "font-family:'Yrsa',serif;font-weight:400;font-size:22px;color:var(--doc-heading);line-height:1.45;margin-bottom:18px;";
const BODY = "font-family:'Heebo',sans-serif;font-size:15px;font-weight:300;color:var(--doc-body);line-height:1.85;margin-bottom:14px;";

export default {
  type: 'narrative', label: 'Texto corrido', icon: 'description', group: 'Texto',
  defaults: () => ({
    eyebrow: '', title: 'About this Report', lead: '',
    paragraphs: [
      { text: 'The Global Citizen Solutions Investment Migration Quarterly Report is designed to distill and consolidate key developments across the residency and citizenship planning landscape.' },
      { text: 'Tailored for our institutional audience, the report delivers timely, relevant and easily digestible insights to support strategic decision-making and stay ahead of industry trends.' },
      { text: 'All analysis and insights are produced by Global Citizen Solutions industry experts and the Intelligence Unit Team.' }]
  }),
  fields: [['eyebrow', 'Eyebrow'], ['title', 'Title'], ['lead', 'Lead paragraph', 'area', 3]],
  lists: { paragraphs: { min: 0, max: 6, one: 'Paragraph', add: () => ({ text: 'New paragraph.' }), f: [['text', 'Text', 'area', 4]] } },
  render: (p, ctx) => `<div>${p.eyebrow ? ctx.F('eyebrow', 'div', EYEBROW) : ''}${ctx.F('title', 'div', TITLE)}${p.lead ? ctx.F('lead', 'div', LEAD) : ''}${p.paragraphs.map((_, i) => ctx.F(`paragraphs.${i}.text`, 'div', BODY)).join('')}</div>`
};
