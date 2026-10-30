const HEAD = "font-family:'Heebo',sans-serif;font-size:14px;font-weight:600;color:var(--doc-badge);line-height:1.4;margin-bottom:10px;";
const BODY = "font-family:'Heebo',sans-serif;font-size:15px;font-weight:300;color:var(--doc-body);line-height:1.85;margin-bottom:30px;";

export default {
  type: 'sections', label: 'Seções de texto', icon: 'description', group: 'Texto',
  defaults: () => ({
    items: [
      { heading: 'A Shift Toward Long-Term Mobility Planning', body: 'The final quarter of 2025 represented a period of consolidation and strategic evolution for the global investment migration industry, as changes in passport rankings, regulatory refinement in Europe, and closer international scrutiny encouraged a more sophisticated approach to global mobility. Rather than slowing demand, these developments reinforced a shift toward long-term, resilience-based mobility planning, where investors increasingly prioritize stability, legal certainty, and sustainable access over short-term convenience.' },
      { heading: 'Passport Rankings and Global Rebalancing', body: 'The Global Citizen Solutions Global Passport Index 2025 illustrated this evolution clearly. While traditionally dominant passports such as that of the United States experienced a relative decline, European passports continued to strengthen, occupying nine of the top ten positions in the ranking. This rebalancing reflects not a loss of mobility overall, but a growing emphasis on quality-of-life indicators, economic opportunity, and investment potential.' },
      { heading: 'Regulatory Developments Strengthening the Industry', body: "Across regions, regulatory and programmatic developments pointed to a more robust and credible industry. Portugal's nationality law reforms signaled a maturing European framework that aligns investor pathways with integration and social cohesion. In the Caribbean, enhanced due diligence standards have accelerated regional efforts to reinforce transparency and compliance. At the same time, St. Vincent and the Grenadines' announcement of a forthcoming Citizenship program underscores continued innovation and confidence in the model." }]
  }),
  lists: { items: { min: 0, max: 8, one: 'Section', add: () => ({ heading: 'New section', body: 'Section text.' }), f: [['heading', 'Heading'], ['body', 'Body', 'area', 6]] } },
  render: (p, ctx) => p.items.map((_, i) => part(ctx, i)).join(''),
  split: (p, ctx) => p.items.map((_, i) => part(ctx, i))
};

function part(ctx, i) {
  return `<div>${ctx.F(`items.${i}.heading`, 'div', HEAD)}${ctx.F(`items.${i}.body`, 'div', BODY)}</div>`;
}
