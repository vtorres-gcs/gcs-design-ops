export function mountStage(root, { onPageVisible } = {}) {
  const pagesEl = root.querySelector('#pages'), stage = root.querySelector('#stage');
  const chips = root.querySelector('#chips'), zoomEl = root.querySelector('#zoom');
  let zoom = 85, active = 0;

  const setZoom = z => { zoom = Math.max(40, Math.min(130, Math.round(z))); pagesEl.style.zoom = zoom / 100; zoomEl.value = zoom; };
  const fit = () => setZoom(((stage.clientWidth - 48) / 794) * 100);
  const wraps = () => [...pagesEl.querySelectorAll('.pg-wrap')];
  const mark = i => {
    active = i;
    [...chips.children].forEach((c, k) => c.classList.toggle('on', k === i));
    if (onPageVisible) onPageVisible(i);
  };

  zoomEl.addEventListener('input', () => setZoom(+zoomEl.value));
  root.querySelector('[data-act="fit"]').addEventListener('click', fit);
  stage.addEventListener('scroll', () => {
    const top = stage.getBoundingClientRect().top;
    let best = 0, bestD = Infinity;
    wraps().forEach((w, k) => { const d = Math.abs(w.getBoundingClientRect().top - top - 28); if (d < bestD) { bestD = d; best = k; } });
    if (best !== active) mark(best);
  }, { passive: true });

  function render(pages) {
    const keep = stage.scrollTop;
    pagesEl.innerHTML = pages.map(h => `<div class="pg-wrap">${h}</div>`).join('');
    const label = (k, n) => (k === 0 ? '1 · Cover' : k === n - 1 ? `${n} · Back` : String(k + 1));
    chips.innerHTML = pages.map((_, k) => `<button class="chip" data-page="${k}">${label(k, pages.length)}</button>`).join('');
    chips.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
      const w = wraps()[+c.dataset.page];
      if (w) stage.scrollTo({ top: w.offsetTop * (zoom / 100) - 16, behavior: 'smooth' });
    }));
    stage.scrollTop = keep;
    mark(Math.min(active, pages.length - 1));
  }

  function scrollToBlock(id) {
    const el = pagesEl.querySelector(`[data-blk="${CSS.escape(id)}"]`);
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 1200);
  }

  setZoom(zoom);
  return { render, fit, setZoom, scrollToBlock };
}
