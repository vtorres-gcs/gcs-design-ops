const H = "font-family:'Yrsa',serif;font-weight:400;font-size:28px;line-height:1.1;color:var(--primary);letter-spacing:-.3px;margin-bottom:12px;";
const TITLE = "font-family:'Heebo',sans-serif;font-size:13px;font-weight:500;color:var(--doc-heading);margin-bottom:4px;line-height:1.3;";
const DESC = "font-family:'Heebo',sans-serif;font-size:10.5px;font-weight:300;color:var(--doc-body);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;";

export default {
  type: 'benefits', label: 'Benefícios', icon: 'star', group: 'Listas',
  defaults: () => ({
    title: 'Key Benefits',
    items: [
      { icon: 'travel_explore', title: 'Visa-Free Travel', desc: 'Travel across the Schengen Area without a visa.' },
      { icon: 'badge', title: 'Dual Citizenship', desc: 'Keep your original nationality alongside the new one.' },
      { icon: 'family_restroom', title: 'Full Family Inclusion', desc: 'Spouse and dependent children up to age 18 included.' },
      { icon: 'work', title: 'Right to Live & Work', desc: 'Live, work and study in the country from day one.' },
      { icon: 'savings', title: 'Tax Incentives', desc: 'Attractive regimes for new residents on foreign income.' },
      { icon: 'public', title: 'Path to EU Citizenship', desc: 'Eligible to apply for citizenship after the qualifying period.' }]
  }),
  fields: [['title', 'Section title']],
  lists: { items: { min: 0, max: 8, one: 'Benefit', icon: true, add: () => ({ icon: 'star', title: 'New benefit', desc: 'Short description.' }), f: [['title', 'Title'], ['desc', 'Description (max 2 lines)', 'area', 2]] } },
  render: (p, ctx) => {
    const n = p.items.length;
    if (!n) return '';
    const cards = p.items.map((b, i) => `<div style="background:var(--doc-surface);border:1px solid var(--doc-border-soft);padding:14px 16px;">${ctx.ico(b.icon, 'display:block;margin-bottom:10px;color:var(--accent);')}${ctx.F(`items.${i}.title`, 'div', TITLE)}${ctx.F(`items.${i}.desc`, 'div', DESC)}</div>`).join('');
    return `<div>${ctx.F('title', 'div', H)}<div style="display:grid;grid-template-columns:repeat(${n <= 4 ? Math.max(n, 1) : n <= 6 ? 3 : 4},1fr);gap:8px;">${cards}</div></div>`;
  }
};
