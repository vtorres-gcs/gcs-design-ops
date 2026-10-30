import { esc } from '../util.js';

// Icon popover anchored under `anchor`. Resolves with the chosen icon name, or null when dismissed.
export function openPicker(anchor, icons, current) {
  return new Promise(resolve => {
    const pop = document.createElement('div');
    pop.className = 'ipick';
    pop.innerHTML = Object.entries(icons).map(([name, d]) =>
      `<button type="button" data-icon="${esc(name)}" title="${esc(name.replace(/_/g, ' '))}" class="${name === current ? 'on' : ''}"><svg width="22" height="22" viewBox="0 -960 960 960" fill="currentColor"><path d="${d}"/></svg></button>`).join('');
    anchor.insertAdjacentElement('afterend', pop);
    const done = value => { document.removeEventListener('mousedown', outside, true); document.removeEventListener('keydown', esc_, true); pop.remove(); resolve(value); };
    const outside = e => { if (!pop.contains(e.target) && e.target !== anchor) done(null); };
    const esc_ = e => { if (e.key === 'Escape') done(null); };
    pop.addEventListener('click', e => { const b = e.target.closest('[data-icon]'); if (b) done(b.dataset.icon); });
    document.addEventListener('mousedown', outside, true);
    document.addEventListener('keydown', esc_, true);
  });
}
