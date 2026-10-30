import { get, all, SOON } from './presets/index.js';
import { createState, loadState, scheduleSave, flush, clearDraft } from './store.js';
import { renderDocument, pageChrome } from './document.js';
import { mountStage } from './ui/stage.js';
import { mountStructure } from './ui/structure.js';
import { mountForm } from './ui/form.js';
import { mountGallery } from './ui/gallery.js';

const $ = s => document.querySelector(s);
const memory = new Map();
const backend = (() => {
  try { localStorage.getItem('gcs-probe'); return localStorage; } catch { /* private mode: keep drafts in memory */ }
  return { getItem: k => (memory.has(k) ? memory.get(k) : null), setItem: (k, v) => void memory.set(k, v), removeItem: k => void memory.delete(k) };
})();

let icons = {}, S = null, preset = null, redrawTimer = 0, issues = [];
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
const galleryUi = mountGallery($('#gallery'), { presets: all(), soon: SOON, backend, getIcons: () => icons });

function measure(items) {
  const probe = $('#probe');
  probe.innerHTML = pageChrome(items, { state: S, pageNo: 2, deps: { icons } });
  const body = probe.querySelector('[data-body]');
  return body.scrollHeight - body.clientHeight;
}

// Everything the user should know about: blocks taller than a page, and text cut by line-clamp.
function collectIssues(warnings) {
  const list = warnings.map(w => ({ blockId: w.blockId, kind: w.kind }));
  document.querySelectorAll('#pages [style*="line-clamp"]').forEach(el => {
    if (el.scrollHeight > el.clientHeight + 1) { const b = el.closest('[data-blk]'); list.push({ blockId: b && b.dataset.blk, kind: 'clamp' }); }
  });
  return list;
}

function rerender() {
  const { pages, warnings } = renderDocument(S, preset, { icons }, measure);
  $('#probe').innerHTML = '';
  stage.render(pages, warnings);
  issues = collectIssues(warnings);
  const fit = $('#fit');
  fit.textContent = issues.length ? `⚠ ${issues.length} warning${issues.length > 1 ? 's' : ''}` : '✓ A4 OK';
  fit.classList.toggle('bad', issues.length > 0);
  fit.title = issues.length ? 'Click to jump to the first problem' : '';
}

function showEditor(p) {
  preset = p;
  S = loadState(p, backend);
  api.selected = null;
  $('#switch').value = p.id;
  document.body.dataset.view = 'editor';
  structureUi.render();
  formUi.render();
  rerender();
  stage.fit();
}

function route() {
  flush();
  const p = get(location.hash.slice(1));
  if (!p) { document.body.dataset.view = 'gallery'; galleryUi.render(); return; }
  showEditor(p);
}

$('#fit').addEventListener('click', () => {
  const first = issues.find(i => i.blockId);
  if (!first) return;
  api.selected = first.blockId;
  structureUi.render();
  formUi.render();
  stage.scrollToBlock(first.blockId);
});

document.addEventListener('click', e => {
  const act = e.target.closest('#app [data-act]');
  if (!act) return;
  if (act.dataset.act === 'print') { flush(); window.print(); }
  else if (act.dataset.act === 'reset') {
    if (!confirm(`Reset "${preset.label}" to its original content? Your edits will be lost.`)) return;
    flush();
    clearDraft(preset.id, backend);
    S = createState(preset);
    api.selected = null;
    structureUi.render();
    formUi.render();
    rerender();
  }
});

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
  window.__editor = { get state() { return S; }, api, rerender, get issues() { return issues; } };
})();
