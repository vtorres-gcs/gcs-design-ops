const H = "font-family:'Yrsa',serif;font-weight:400;font-size:28px;line-height:1.1;color:var(--primary);letter-spacing:-.3px;margin-bottom:12px;";
const CHIP = "display:inline-block;font-family:'Heebo',sans-serif;font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--primary);background:var(--doc-surface);border:1px solid var(--doc-border-soft);padding:2px 6px;margin-top:6px;";

export default {
  type: 'steps', label: 'Etapas', icon: 'schedule', group: 'Listas',
  defaults: () => ({
    title: 'Application Procedure',
    items: [
      { title: 'Intro Call', desc: 'Discuss goals and eligibility (1 day)' },
      { title: 'Documents', desc: 'Collect and legalise the application file (2–4 weeks)' },
      { title: 'Pre-approval', desc: 'Authorities review the application (4–6 weeks)' },
      { title: 'Visa Approval', desc: 'Visa issued after the investment (2–4 weeks)' },
      { title: 'Travel to Country', desc: 'Enter and complete local registration' },
      { title: 'Visa Issued', desc: 'Receive residence permit and start your new life' }]
  }),
  fields: [['title', 'Section title']],
  lists: { items: { min: 0, max: 8, one: 'Step', add: () => ({ title: 'New step', desc: 'Short description.', duration: '' }), f: [['title', 'Title'], ['desc', 'Description', 'area', 2], ['duration', 'Duration (optional)']] } },
  render: (p, ctx) => {
    const n = p.items.length;
    if (!n) return '';
    const steps = p.items.map((s, i) => `<div style="border-top:2px solid var(--primary);padding-top:8px;"><div style="font-family:'Heebo',sans-serif;font-size:9px;font-weight:700;letter-spacing:.16em;color:var(--accent);margin-bottom:3px;">${i + 1}</div>${ctx.F(`items.${i}.title`, 'div', "font-family:'Heebo',sans-serif;font-size:11px;font-weight:500;color:var(--doc-heading);line-height:1.3;margin-bottom:3px;")}${ctx.F(`items.${i}.desc`, 'div', "font-family:'Heebo',sans-serif;font-size:9.5px;font-weight:300;color:var(--doc-body);line-height:1.4;")}${s.duration ? ctx.F(`items.${i}.duration`, 'div', CHIP) : ''}</div>`).join('');
    return `<div>${ctx.F('title', 'div', H)}<div style="display:grid;grid-template-columns:repeat(${n <= 6 ? n : Math.ceil(n / 2)},1fr);gap:${n > 6 ? 14 : 10}px;">${steps}</div></div>`;
  }
};
