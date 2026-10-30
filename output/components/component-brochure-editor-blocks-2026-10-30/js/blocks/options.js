const H = "font-family:'Yrsa',serif;font-weight:400;font-size:28px;line-height:1.1;color:var(--primary);letter-spacing:-.3px;margin-bottom:12px;";

export default {
  type: 'options', label: 'Opções de investimento', icon: 'payments', group: 'Listas',
  defaults: () => ({
    title: 'Investment Options',
    items: [
      { title: 'Innovative Startup', amount: 'From €250k+', desc: 'Invest in a qualifying innovative company to support local growth.' },
      { title: 'Listed or Unlisted Company', amount: 'From €500k+', desc: 'Support local business growth and job creation.' },
      { title: 'Philanthropic Donation', amount: 'From €1M+', desc: 'Non-refundable contribution to a government-recognised initiative.' },
      { title: 'Government Bonds', amount: 'From €2M+', desc: 'Stable, low-risk investment backed by the state.' }]
  }),
  fields: [['title', 'Section title']],
  lists: { items: { min: 0, max: 8, one: 'Option', add: () => ({ title: 'New option', amount: 'From €0', desc: 'Short description.' }), f: [['title', 'Title'], ['amount', 'Amount'], ['desc', 'Description', 'area', 2]] } },
  render: (p, ctx) => {
    const n = p.items.length;
    if (!n) return '';
    const cards = p.items.map((_, i) => `<div style="background:var(--doc-surface);border:1px solid var(--doc-border-soft);padding:12px 14px;"><div style="font-family:'Yrsa',serif;font-size:20px;color:var(--accent);line-height:1;margin-bottom:6px;">0${i + 1}</div>${ctx.F(`items.${i}.title`, 'div', "font-family:'Heebo',sans-serif;font-size:12px;font-weight:500;color:var(--doc-heading);line-height:1.3;margin-bottom:2px;")}${ctx.F(`items.${i}.amount`, 'div', "font-family:'Heebo',sans-serif;font-size:13px;font-weight:700;color:var(--primary);margin-bottom:5px;")}${ctx.F(`items.${i}.desc`, 'div', "font-family:'Heebo',sans-serif;font-size:10px;font-weight:300;color:var(--doc-body);line-height:1.45;")}</div>`).join('');
    return `<div>${ctx.F('title', 'div', H)}<div style="display:grid;grid-template-columns:repeat(${n <= 4 ? n : Math.ceil(n / 2)},1fr);gap:6px;">${cards}</div></div>`;
  }
};
