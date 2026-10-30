import { get, list } from '../blocks/index.js';
import { addBlock, duplicateBlock, removeBlock, moveBlock } from '../store.js';
import { esc } from '../util.js';

export function mountStructure(el, api) {
  let dragId = null;

  function render() {
    const S = api.state;
    const present = new Set(S.blocks.map(b => b.type));
    const rows = S.blocks.map((b, i) => {
      const def = get(b.type);
      return `<div class="srow" data-row="${esc(b.id)}" draggable="true" aria-selected="${api.selected === b.id}">
        <span class="drag" data-act="drag" title="Drag to reorder">⠿</span><span class="nm">${esc(def ? def.label : b.type)}</span>
        <button class="ib" data-act="up" title="Move up" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button class="ib" data-act="down" title="Move down" ${i === S.blocks.length - 1 ? 'disabled' : ''}>↓</button>
        <button class="ib" data-act="dup" title="Duplicate" ${def && def.unique ? 'disabled' : ''}>⧉</button>
        <button class="ib" data-act="del" title="Remove">✕</button></div>`;
    }).join('');
    const menu = list().map(g => {
      const items = g.blocks.filter(d => !(d.unique && present.has(d.type)));
      return items.length ? `<div class="agrp"><div class="gl">${esc(g.group)}</div>${items.map(d => `<button class="sbtn" data-add="${esc(d.type)}">${esc(d.label)}</button>`).join('')}</div>` : '';
    }).join('');
    el.innerHTML = `<div class="sidescroll"><div class="sh">Structure</div><div class="slist">${rows || '<div class="hint" style="padding:0 16px">No blocks yet. Add one below.</div>'}</div><div class="sh">Add block</div><div class="amenu">${menu}</div></div>`;
  }

  el.addEventListener('click', e => {
    const S = api.state, add = e.target.closest('[data-add]'), row = e.target.closest('[data-row]');
    if (add) {
      const id = addBlock(S, add.dataset.add, api.selected && S.blocks.some(b => b.id === api.selected) ? api.selected : undefined);
      if (id) { api.selected = id; api.changed({ structure: true, form: true }); api.scrollTo(id); }
      return;
    }
    if (!row) return;
    const id = row.dataset.row, at = S.blocks.findIndex(b => b.id === id), act = e.target.closest('[data-act]');
    const kind = act && act.dataset.act;
    if (kind === 'up') moveBlock(S, id, at - 1);
    else if (kind === 'down') moveBlock(S, id, at + 1);
    else if (kind === 'dup') { const n = duplicateBlock(S, id); if (n) api.selected = n; }
    else if (kind === 'del') { removeBlock(S, id); if (api.selected === id) api.selected = null; }
    else { api.selected = id; api.changed({ structure: true, form: true }); api.scrollTo(id); return; }
    api.changed({ structure: true, form: true });
  });

  el.addEventListener('dragstart', e => { const r = e.target.closest('[data-row]'); if (r) { dragId = r.dataset.row; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId); } });
  el.addEventListener('dragover', e => { if (dragId && e.target.closest('[data-row]')) e.preventDefault(); });
  el.addEventListener('drop', e => {
    const r = e.target.closest('[data-row]');
    if (!dragId || !r) return;
    e.preventDefault();
    moveBlock(api.state, dragId, api.state.blocks.findIndex(b => b.id === r.dataset.row));
    dragId = null;
    api.changed({ structure: true, form: true });
  });
  el.addEventListener('dragend', () => { dragId = null; });

  return { render };
}
