import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esc, getPath, setPath, uid, clone } from '../js/util.js';

test('esc escapes html-special characters', () => {
  assert.equal(esc('<b>&"\''), '&lt;b&gt;&amp;&quot;&#39;');
});

test('esc turns null and undefined into empty string', () => {
  assert.equal(esc(undefined), '');
  assert.equal(esc(null), '');
});

test('getPath reads dotted paths and array indexes', () => {
  assert.equal(getPath({ a: { b: [{ c: 1 }] } }, 'a.b.0.c'), 1);
});

test('getPath returns undefined for a missing path', () => {
  assert.equal(getPath({}, 'x.y'), undefined);
});

test('setPath creates intermediate objects', () => {
  const o = {};
  setPath(o, 'a.b', 'x');
  assert.equal(o.a.b, 'x');
});

test('setPath writes into existing array items', () => {
  const o = { items: [{ v: 1 }] };
  setPath(o, 'items.0.v', 2);
  assert.equal(o.items[0].v, 2);
});

test('uid is b_ plus 4 chars and never repeats ids in used', () => {
  const used = new Set(['b_aaaa']);
  for (let i = 0; i < 1000; i++) {
    const id = uid(used);
    assert.match(id, /^b_[0-9a-z]{4}$/);
    assert.equal(id.length, 6);
    assert.ok(!used.has(id));
    used.add(id);
  }
});

test('clone deep-copies JSON data', () => {
  const a = { x: [{ y: 1 }] };
  const b = clone(a);
  b.x[0].y = 2;
  assert.equal(a.x[0].y, 1);
});
