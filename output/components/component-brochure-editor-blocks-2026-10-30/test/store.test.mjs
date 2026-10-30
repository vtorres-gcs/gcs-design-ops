import { test } from 'node:test';
import assert from 'node:assert/strict';
import { get } from '../js/blocks/index.js';
import {
  createState, addBlock, duplicateBlock, removeBlock, moveBlock, setValue,
  addItem, removeItem, loadState, saveState, hasDraft, clearDraft, scheduleSave, flush
} from '../js/store.js';

const preset = {
  id: 'test', label: 'Test', blurb: '', tags: [],
  cover: { defaults: () => ({ title: 'A' }) },
  back: { render: () => '' },
  meta: { defaults: () => ({ year: '2026' }) },
  blocks: [{ type: 'heading', props: { title: 'First' } }, { type: 'pageBreak' }]
};
const memory = () => {
  const m = new Map();
  return { m, getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => void m.set(k, String(v)), removeItem: k => void m.delete(k) };
};
const KEY = 'gcs-brochure-editor-v4:test';

test('createState builds v4 state with unique block ids from the preset', () => {
  const s = createState(preset);
  assert.equal(s.v, 4);
  assert.equal(s.template, 'test');
  assert.deepEqual(s.cover, { title: 'A' });
  assert.equal(s.blocks.length, 2);
  assert.equal(s.blocks[0].props.title, 'First');
  assert.notEqual(s.blocks[0].id, s.blocks[1].id);
});

test('addBlock inserts after the given id, or appends', () => {
  const s = createState(preset);
  const id = addBlock(s, 'heading', s.blocks[0].id);
  assert.equal(s.blocks[1].id, id);
  const last = addBlock(s, 'heading');
  assert.equal(s.blocks[s.blocks.length - 1].id, last);
  assert.equal(addBlock(s, 'ghost'), null);
});

test('addBlock refuses a second unique block', { skip: !get('overview') }, () => {
  const s = createState(preset);
  assert.ok(addBlock(s, 'overview'));
  assert.equal(addBlock(s, 'overview'), null);
});

test('duplicateBlock clones props under a new id right after the original', () => {
  const s = createState(preset);
  const id = duplicateBlock(s, s.blocks[0].id);
  assert.equal(s.blocks[1].id, id);
  s.blocks[1].props.title = 'Changed';
  assert.equal(s.blocks[0].props.title, 'First');
  assert.equal(duplicateBlock(s, 'b_nope'), null);
});

test('removeBlock removes by id', () => {
  const s = createState(preset);
  assert.equal(removeBlock(s, s.blocks[0].id), true);
  assert.equal(s.blocks.length, 1);
  assert.equal(removeBlock(s, 'b_nope'), false);
});

test('moveBlock reorders and clamps the target index', () => {
  const s = createState(preset);
  const [a, b] = s.blocks.map(x => x.id);
  moveBlock(s, a, 99);
  assert.deepEqual(s.blocks.map(x => x.id), [b, a]);
  moveBlock(s, a, -1);
  assert.deepEqual(s.blocks.map(x => x.id), [a, b]);
  assert.equal(moveBlock(s, 'b_nope', 0), false);
});

test('setValue writes to cover, meta and block props', () => {
  const s = createState(preset);
  setValue(s, 'cover', 'title', 'X');
  setValue(s, 'meta', 'year', '2030');
  setValue(s, s.blocks[0].id, 'title', 'Y');
  assert.equal(s.cover.title, 'X');
  assert.equal(s.meta.year, '2030');
  assert.equal(s.blocks[0].props.title, 'Y');
});

test('addItem/removeItem on an unknown block or list return false', () => {
  const s = createState(preset);
  assert.equal(addItem(s, 'b_nope', 'items'), false);
  assert.equal(addItem(s, s.blocks[0].id, 'items'), false);
  assert.equal(removeItem(s, s.blocks[0].id, 'items', 0), false);
});

test('saveState then loadState round-trips under the v4 key', () => {
  const be = memory(), s = createState(preset);
  setValue(s, 'cover', 'title', 'Saved');
  assert.equal(saveState(s, be), true);
  assert.ok(be.m.has(KEY));
  assert.equal(loadState(preset, be).cover.title, 'Saved');
  assert.equal(hasDraft('test', be), true);
  clearDraft('test', be);
  assert.equal(hasDraft('test', be), false);
});

test('loadState falls back to the preset on invalid JSON', () => {
  const be = memory();
  be.setItem(KEY, '{bad');
  assert.equal(loadState(preset, be).cover.title, 'A');
});

test('loadState ignores a draft with another version and leaves v3 keys alone', () => {
  const be = memory();
  be.setItem(KEY, JSON.stringify({ v: 3, template: 'test', cover: { title: 'Old' }, meta: {}, blocks: [] }));
  be.setItem('gcs-brochure-editor-v3:test', '{"x":1}');
  assert.equal(loadState(preset, be).cover.title, 'A');
  assert.equal(be.getItem('gcs-brochure-editor-v3:test'), '{"x":1}');
});

test('loadState drops blocks of unknown type and keeps the rest', () => {
  const be = memory(), s = createState(preset);
  s.blocks.push({ id: 'b_ghst', type: 'ghost', props: {} });
  be.setItem(KEY, JSON.stringify(s));
  const loaded = loadState(preset, be);
  assert.deepEqual(loaded.blocks.map(b => b.type), ['heading', 'pageBreak']);
});

test('saveState returns false when the backend throws', () => {
  const be = { getItem: () => null, setItem() { throw new Error('quota'); }, removeItem() {} };
  assert.equal(saveState(createState(preset), be), false);
});

test('scheduleSave writes only after flush()', () => {
  const be = memory(), s = createState(preset);
  scheduleSave(s, be, 5000);
  assert.equal(be.getItem(KEY), null);
  flush();
  assert.notEqual(be.getItem(KEY), null);
});

test('scheduleSave writes by itself after the delay', async () => {
  const be = memory(), s = createState(preset);
  scheduleSave(s, be, 10);
  await new Promise(r => setTimeout(r, 40));
  assert.notEqual(be.getItem(KEY), null);
});
