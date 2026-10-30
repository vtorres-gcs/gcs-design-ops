import { test } from 'node:test';
import assert from 'node:assert/strict';
import { get } from '../js/presets/index.js';
import { createState, setValue } from '../js/store.js';
import { renderDocument, buildItems } from '../js/document.js';
import { ICONS } from './helpers.mjs';

const deps = { icons: ICONS };
const preset = get('quarterly-report');
const fits = () => 0;

test('quarterly renders cover, About, Content and back cover', () => {
  const state = createState(preset);
  const { pages } = renderDocument(state, preset, deps, fits);
  assert.equal(pages.length, 4);
  assert.ok(pages[1].includes('data-body') && pages[2].includes('data-body'));
});

test('body pages are numbered from the cover: 02 then 03', () => {
  const { pages } = renderDocument(createState(preset), preset, deps, fits);
  assert.ok(pages[1].includes('>02<'));
  assert.ok(pages[2].includes('>03<'));
});

test('zero blocks, or a lone pageBreak, give cover and back cover only', () => {
  const state = createState(preset);
  state.blocks = [];
  assert.equal(renderDocument(state, preset, deps, fits).pages.length, 2);
  state.blocks = [{ id: 'b_brk0', type: 'pageBreak', props: {} }];
  assert.equal(renderDocument(state, preset, deps, fits).pages.length, 2);
});

test('{year} in the footer is replaced by meta.year', () => {
  const state = createState(preset);
  setValue(state, 'meta', 'year', '2031');
  const page = renderDocument(state, preset, deps, fits).pages[1];
  assert.ok(page.includes('© 2031 Global Citizen Solutions'));
  assert.ok(!page.includes('{year}'));
});

test('header label is escaped', () => {
  const state = createState(preset);
  setValue(state, 'meta', 'headerLabel', '<b>x');
  const page = renderDocument(state, preset, deps, fits).pages[1];
  assert.ok(!page.includes('<b>x') && page.includes('&lt;b&gt;x'));
});

test('buildItems wraps blocks, marks breaks and attaches split only where the block has one', () => {
  const items = buildItems(createState(preset), deps);
  assert.equal(items.filter(i => i.kind === 'break').length, 1);
  const art = items.find(i => i.html.includes('data-blk') && typeof i.split === 'function');
  assert.ok(art);
  assert.ok(items.every(i => i.kind === 'break' || i.html.startsWith('<div class="blk" data-blk="')));
});

test('overflow reported by measure paginates body content across pages', () => {
  const state = createState(preset);
  let calls = 0;
  const { pages } = renderDocument(state, preset, deps, items => (++calls, items.length > 2 ? 5 : 0));
  assert.ok(pages.length > 4);
});
