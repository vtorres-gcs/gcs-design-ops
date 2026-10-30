import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, addItem, removeItem, moveItem } from '../js/store.js';

const preset = {
  id: 'lists', label: 'L', blurb: '', tags: [],
  cover: { defaults: () => ({}) }, back: { render: () => '' }, meta: { defaults: () => ({}) },
  blocks: [{ type: 'figures' }, { type: 'benefits' }]
};

test('figures list stops at its 2..6 limits', () => {
  const s = createState(preset), id = s.blocks[0].id;
  assert.equal(s.blocks[0].props.items.length, 4);
  while (addItem(s, id, 'items')) { /* grow to max */ }
  assert.equal(s.blocks[0].props.items.length, 6);
  assert.equal(addItem(s, id, 'items'), false);
  while (removeItem(s, id, 'items', 0)) { /* shrink to min */ }
  assert.equal(s.blocks[0].props.items.length, 2);
  assert.equal(removeItem(s, id, 'items', 0), false);
});

test('benefits list can be emptied (min 0) and then refuses more removals', () => {
  const s = createState(preset), id = s.blocks[1].id;
  while (removeItem(s, id, 'items', 0)) { /* empty it */ }
  assert.equal(s.blocks[1].props.items.length, 0);
  assert.equal(removeItem(s, id, 'items', 0), false);
});

test('moveItem reorders items inside a list', () => {
  const s = createState(preset), id = s.blocks[0].id;
  const first = s.blocks[0].props.items[0];
  assert.equal(moveItem(s, id, 'items', 0, 2), true);
  assert.equal(s.blocks[0].props.items[2], first);
  assert.equal(moveItem(s, id, 'items', 99, 0), false);
});
