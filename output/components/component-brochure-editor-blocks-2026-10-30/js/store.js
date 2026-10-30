import { get, makeBlock } from './blocks/index.js';
import { clone, setPath } from './util.js';

const KEY = 'gcs-brochure-editor-v4:';
const VERSION = 4;
const ids = state => new Set(state.blocks.map(b => b.id));
const find = (state, id) => state.blocks.find(b => b.id === id);
const listOf = (state, blockId, listKey) => {
  const block = find(state, blockId), def = block && get(block.type);
  const ld = def && def.lists && def.lists[listKey], arr = block && block.props[listKey];
  return ld && Array.isArray(arr) ? { ld, arr } : null;
};

export function createState(preset) {
  const used = new Set();
  const blocks = preset.blocks.map(b => {
    const nb = makeBlock(b.type, clone(b.props || {}), used);
    used.add(nb.id);
    return nb;
  });
  return { v: VERSION, template: preset.id, cover: preset.cover.defaults(), meta: preset.meta.defaults(), blocks };
}

export function addBlock(state, type, afterId) {
  const def = get(type);
  if (!def || (def.unique && state.blocks.some(b => b.type === type))) return null;
  const nb = makeBlock(type, {}, ids(state));
  const at = afterId ? state.blocks.findIndex(b => b.id === afterId) : -1;
  state.blocks.splice(at < 0 ? state.blocks.length : at + 1, 0, nb);
  return nb.id;
}

export function duplicateBlock(state, id) {
  const at = state.blocks.findIndex(b => b.id === id);
  if (at < 0) return null;
  const src = state.blocks[at], def = get(src.type);
  if (!def || def.unique) return null;
  const nb = makeBlock(src.type, clone(src.props), ids(state));
  state.blocks.splice(at + 1, 0, nb);
  return nb.id;
}

export function removeBlock(state, id) {
  const at = state.blocks.findIndex(b => b.id === id);
  if (at < 0) return false;
  state.blocks.splice(at, 1);
  return true;
}

export function moveBlock(state, id, toIndex) {
  const at = state.blocks.findIndex(b => b.id === id);
  if (at < 0) return false;
  const [b] = state.blocks.splice(at, 1);
  state.blocks.splice(Math.max(0, Math.min(toIndex, state.blocks.length)), 0, b);
  return true;
}

export function setValue(state, target, path, value) {
  if (target === 'cover' || target === 'meta') return setPath(state[target], path, value);
  const block = find(state, target);
  if (block) setPath(block.props, path, value);
}

export function addItem(state, blockId, listKey) {
  const l = listOf(state, blockId, listKey);
  if (!l || l.arr.length >= l.ld.max) return false;
  l.arr.push(l.ld.add());
  return true;
}

export function removeItem(state, blockId, listKey, index) {
  const l = listOf(state, blockId, listKey);
  if (!l || l.arr.length <= l.ld.min || index < 0 || index >= l.arr.length) return false;
  l.arr.splice(index, 1);
  return true;
}

export function moveItem(state, blockId, listKey, from, to) {
  const l = listOf(state, blockId, listKey);
  if (!l || from < 0 || from >= l.arr.length) return false;
  const [it] = l.arr.splice(from, 1);
  l.arr.splice(Math.max(0, Math.min(to, l.arr.length)), 0, it);
  return true;
}

/* ── persistence ── */
const read = (backend, templateId) => { try { return backend.getItem(KEY + templateId); } catch { return null; } };

export function loadState(preset, backend) {
  let raw;
  try { raw = JSON.parse(read(backend, preset.id)); } catch { raw = null; }
  const ok = raw && raw.v === VERSION && raw.template === preset.id && raw.cover && raw.meta && Array.isArray(raw.blocks);
  if (!ok) return createState(preset);
  const blocks = raw.blocks
    .filter(b => b && get(b.type) && b.props && typeof b.props === 'object')
    .map(b => ({ id: b.id, type: b.type, props: { ...get(b.type).defaults(), ...b.props } }));
  return { v: VERSION, template: preset.id, cover: { ...preset.cover.defaults(), ...raw.cover }, meta: { ...preset.meta.defaults(), ...raw.meta }, blocks };
}

let saveListener = null;
export const onSave = fn => { saveListener = fn; };   // fn(ok) after every write attempt

export function saveState(state, backend) {
  let ok = true;
  try { backend.setItem(KEY + state.template, JSON.stringify(state)); } catch { ok = false; }
  if (saveListener) saveListener(ok);
  return ok;
}

export const hasDraft = (templateId, backend) => read(backend, templateId) != null;

export function clearDraft(templateId, backend) {
  try { backend.removeItem(KEY + templateId); } catch { /* storage unavailable */ }
}

let timer = 0, pending = null;
export function scheduleSave(state, backend, delayMs = 300) {
  pending = { state, backend };
  clearTimeout(timer);
  timer = setTimeout(flush, delayMs);
}
export function flush() {
  clearTimeout(timer);
  timer = 0;
  if (!pending) return;
  const { state, backend } = pending;
  pending = null;
  saveState(state, backend);
}
