const LABEL = "font-family:'Heebo',sans-serif;font-size:8px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--accent);margin-bottom:8px;";
const VALUE = { dark: 'var(--primary-foreground)', light: 'var(--primary)' };
const CARD = { dark: 'background:var(--primary);padding:16px 16px 14px;', light: 'background:var(--doc-surface);border:1px solid var(--doc-border-soft);padding:16px 16px 14px;' };

export default {
  type: 'figures', label: 'Números-chave', icon: 'trending_up', group: 'Números',
  defaults: () => ({
    theme: 'dark',
    items: [{ label: 'Min. Investment', value: '€250,000' }, { label: 'Processing Time', value: '1–2 Months' },
      { label: 'Path to Citizenship', value: '10 Years' }, { label: 'Visa-Free Access', value: 'Schengen' }]
  }),
  fields: [['theme', 'Theme', 'select', ['dark', 'light']]],
  lists: { items: { min: 2, max: 6, one: 'Figure', add: () => ({ label: 'New label', value: 'Value' }), f: [['label', 'Label'], ['value', 'Value']] } },
  render: (p, ctx) => {
    const n = p.items.length, cols = n <= 5 ? Math.max(n, 1) : 3, t = p.theme === 'light' ? 'light' : 'dark';
    const cards = p.items.map((_, i) => `<div style="${CARD[t]}">${ctx.F(`items.${i}.label`, 'div', LABEL)}${ctx.F(`items.${i}.value`, 'div', `font-family:'Yrsa',serif;font-weight:400;font-size:28px;color:${VALUE[t]};line-height:1;letter-spacing:-.5px;`)}</div>`).join('');
    return `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;">${cards}</div>`;
  }
};
