const TITLE = "font-family:'Yrsa',serif;font-weight:400;font-size:28px;line-height:1.1;color:var(--primary);letter-spacing:-.3px;margin-bottom:12px;";
const TEXT = "font-family:'Heebo',sans-serif;font-size:11px;font-weight:300;color:var(--doc-body);line-height:1.6;white-space:pre-line;column-count:2;column-gap:24px;";

export default {
  type: 'overview', label: 'Visão geral', icon: 'description', group: 'Texto', unique: true,
  defaults: () => ({
    title: 'Overview',
    text: "Italy offers one of Europe's most attractive Golden Visa programmes, granting permanent residency in as little as 1–2 months for one of the lowest minimum investments in the EU.\n\nApplicants receive pre-approval (Nulla Osta) before completing their investment, ensuring no funds are committed prior to confirmation. Investment options range from innovative startups to government bonds.\n\nAs the EU's 3rd largest economy, Italy provides stability, a Mediterranean lifestyle, and after 10 years of residence, eligibility to apply for citizenship and an EU passport.\n\nNo stay requirement: Golden Visa holders do not need to live in Italy continuously to maintain their residence permit, allowing full flexibility to travel."
  }),
  fields: [['title', 'Section title'], ['text', 'Overview text', 'area', 14]],
  render: (p, ctx) => `<div style="display:flex;flex-direction:column;">${ctx.F('title', 'div', TITLE)}<div style="background:var(--doc-surface);border:1px solid var(--doc-border-soft);padding:18px;">${ctx.F('text', 'div', TEXT)}</div></div>`
};
