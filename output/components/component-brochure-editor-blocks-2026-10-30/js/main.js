import { get, all } from './presets/index.js';
import { loadState, scheduleSave, flush } from './store.js';
import { renderDocument, pageChrome } from './document.js';
import { mountStage } from './ui/stage.js';
import { mountStructure } from './ui/structure.js';
import { mountForm } from './ui/form.js';

const $ = s => document.querySelector(s);
const memory = new Map();
const backend = (() => {
  try { localStorage.getItem('gcs-probe'); return localStorage; } catch { /* private mode: keep drafts in memory */ }
  return { getItem: k => (memory.has(k) ? memory.get(k) : null), setItem: (k, v) => void memory.set(k, v), removeItem: k => void memory.delete(k) };
})();

let icons = {}, S = null, preset = null, redrawTimer = 0;
const stage = mountStage($('#stagewrap'));
const api = {
  get state() { return S; }, get preset() { return preset; }, get icons() { return icons; },
  selected: null,
  scrollTo: id => stage.scrollToBlock(id),
  changed({ structure = false, form = false } = {}) {
    if (structure) structureUi.render();
    if (form) formUi.render();
    clearTimeout(redrawTimer);
    redrawTimer = setTimeout(rerender, 30);
    scheduleSave(S, backend);
  }
};
const structureUi = mountStructure($('#structure'), api);
const formUi = mountForm($('#form'), api);
const deps = () => ({ icons });

function measure(items) {
  const probe = $('#probe');
  probe.innerHTML = pageChrome(items, { state: S, pageNo: 2, deps: deps() });
  const body = probe.querySelector('[data-body]');
  return body.scrollHeight - body.clientHeight;
}

function rerender() {
  const { pages, warnings } = renderDocument(S, preset, deps(), measure);
  $('#probe').innerHTML = '';
  stage.render(pages, warnings);
  const fit = $('#fit');
  fit.textContent = warnings.length ? `⚠ ${warnings.length} warning${warnings.length > 1 ? 's' : ''}` : '✓ A4 OK';
  fit.classList.toggle('bad', warnings.length > 0);
}

function route() {
  flush();
  const p = get(location.hash.slice(1));
  if (!p) { location.hash = '#' + all()[0].id; return; }
  preset = p;
  S = loadState(p, backend);
  $('#switch').value = p.id;
  api.selected = null;
  document.body.dataset.view = 'editor';
  structureUi.render();
  formUi.render();
  rerender();
  stage.fit();
}

$('#pages').addEventListener('click', e => {
  if (e.target.closest('a')) e.preventDefault();
  const f = e.target.closest('[data-f]'), blk = e.target.closest('[data-blk]');
  if (f) {
    const target = f.dataset.b;
    api.selected = target === 'cover' || target === 'meta' ? null : target;
    structureUi.render();
    formUi.render();
    formUi.focus(target, f.dataset.f);
  } else if (blk) {
    api.selected = blk.dataset.blk;
    structureUi.render();
    formUi.render();
  }
});

window.addEventListener('hashchange', route);
window.addEventListener('beforeunload', flush);

(async () => {
  icons = await (await fetch('data/icons.json')).json();
  $('#switch').innerHTML = all().map(p => `<option value="${p.id}">${p.label}</option>`).join('');
  $('#switch').addEventListener('change', e => { location.hash = '#' + e.target.value; });
  await document.fonts.ready;
  route();
  window.__editor = { get state() { return S; }, api, rerender };
})();
