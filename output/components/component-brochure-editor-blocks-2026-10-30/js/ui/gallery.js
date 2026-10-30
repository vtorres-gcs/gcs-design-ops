import { loadState, hasDraft } from '../store.js';
import { makeCtx } from '../ctx.js';
import { esc } from '../util.js';

// Gallery: one card per preset (real cover, rendered from the saved draft) plus greyed "coming soon" cards.
export function mountGallery(root, { presets, soon, backend, getIcons }) {
  function render() {
    const icons = getIcons();
    root.querySelector('#gReady').innerHTML = presets.map(p => {
      const state = loadState(p, backend);
      const cover = p.cover.render(state.cover, makeCtx({ state, icons }, null));
      const tags = [...p.tags, ...(hasDraft(p.id, backend) ? ['Draft saved'] : [])]
        .map(t => `<span class="tag${t === 'Draft saved' ? ' draft' : ''}">${esc(t)}</span>`).join('');
      return `<a class="card" href="#${esc(p.id)}"><div class="th"><div class="sc"><div>${cover}</div></div></div>
        <div class="meta"><h3>${esc(p.label)}</h3><p>${esc(p.blurb)}</p><div class="tags">${tags}</div></div></a>`;
    }).join('');
    root.querySelector('#gSoon').innerHTML = soon.map(s =>
      `<div class="card soon"><div class="th"><div class="sc"><span>Coming soon</span></div></div><div class="meta"><h3>${esc(s.label)}</h3></div></div>`).join('');
  }
  return { render };
}
