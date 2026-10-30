import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paginate } from '../js/paginate.js';

const it = (id, h, extra = {}) => ({ id, html: id, h, ...extra });
const brk = id => ({ id, html: '', kind: 'break' });
const measure = page => page.reduce((s, i) => s + i.h, 0) - 100;   // page holds 100 units, overflow = excess
const ids = pages => pages.map(p => p.map(i => i.id));

test('fills pages in order and moves overflow to the next page', () => {
  const r = paginate([it('a', 40), it('b', 40), it('c', 40)], { measure });
  assert.deepEqual(ids(r.pages), [['a', 'b'], ['c']]);
  assert.deepEqual(r.warnings, []);
});

test('an item that does not fit beside another goes to its own page', () => {
  assert.deepEqual(ids(paginate([it('a', 50), it('b', 60)], { measure }).pages), [['a'], ['b']]);
});

test('pageBreak starts a new page and never makes empty pages', () => {
  assert.deepEqual(ids(paginate([brk('x'), it('a', 10), brk('y'), brk('z'), it('b', 10), brk('w')], { measure }).pages), [['a'], ['b']]);
});

test('only breaks, or no items, give no pages', () => {
  assert.deepEqual(paginate([brk('x'), brk('y')], { measure }), { pages: [], warnings: [] });
  assert.deepEqual(paginate([], { measure }), { pages: [], warnings: [] });
});

test('an item taller than a page with no split warns tooTall for that block', () => {
  const r = paginate([it('a', 10), it('big', 150)], { measure });
  assert.deepEqual(ids(r.pages), [['a'], ['big']]);
  assert.deepEqual(r.warnings, [{ page: 1, blockId: 'big', kind: 'tooTall' }]);
});

test('an item taller than a page is split when it can be, without warning', () => {
  const big = it('big', 150, { split: () => ['part1', 'part2'] });
  const r = paginate([big], { measure: page => page.reduce((s, i) => s + (i.html === 'big' ? 150 : 60), 0) - 100 });
  assert.deepEqual(ids(r.pages), [['big'], ['big']]);
  assert.deepEqual(r.pages.map(p => p[0].html), ['part1', 'part2']);
  assert.equal(r.warnings.length, 0);
});

test('the guard stops a measure that never fits and reports tooTall', () => {
  const r = paginate([it('a', 60), it('b', 60), it('c', 60), it('d', 60)], { measure: () => 999, guard: 3 });
  assert.ok(r.warnings.length >= 1);
  assert.equal(r.warnings[0].kind, 'tooTall');
});

test('a long brochure paginates completely: no false warning, no page over capacity', () => {
  const many = Array.from({ length: 40 }, (_, i) => it('b' + i, 45));   // two items fit per page
  const r = paginate(many, { measure });
  assert.deepEqual(r.warnings, []);
  assert.equal(r.pages.length, 20);
  assert.ok(r.pages.every(p => p.length <= 2));
  assert.equal(r.pages.flat().length, 40);
});
