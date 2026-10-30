import { test } from 'node:test';
import assert from 'node:assert/strict';
import { all, get, list, makeBlock } from '../js/blocks/index.js';
import { getPath, clone } from '../js/util.js';
import { renderBlock } from './helpers.mjs';

const KEEP = new Set(['icon', 'flag', 'theme', 'style']);   // enum-like props are not free text
const poison = v => {
  if (typeof v === 'string') return '<b>&"';
  if (Array.isArray(v)) return v.map(poison);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, KEEP.has(k) ? x : poison(x)]));
  return v;
};
const bad = html => /undefined|NaN/.test(html);

test('registry resolves known types and rejects unknown ones', () => {
  assert.equal(get('nope'), undefined);
  assert.equal(get('heading').type, 'heading');
  assert.ok(all().length >= 2);
});

test('block types are unique', () => {
  const types = all().map(b => b.type);
  assert.equal(new Set(types).size, types.length);
});

test('list() returns non-empty groups in the documented order', () => {
  const groups = list();
  assert.ok(groups.length > 0 && groups.every(g => g.blocks.length > 0));
  const order = ['Texto', 'Números', 'Listas', 'Estrutura'];
  const idx = groups.map(g => order.indexOf(g.group));
  assert.ok(idx.every(i => i >= 0));
  assert.deepEqual(idx, [...idx].sort((a, b) => a - b));
});

test('makeBlock builds {id,type,props} and applies overrides', () => {
  const b = makeBlock('heading');
  assert.match(b.id, /^b_[0-9a-z]{4}$/);
  assert.equal(b.type, 'heading');
  assert.ok(typeof b.props.title === 'string');
  assert.equal(makeBlock('heading', { title: 'X' }).props.title, 'X');
  assert.notEqual(makeBlock('heading', {}, new Set([makeBlock('heading').id])).id, undefined);
});

for (const def of all()) {
  test(`contract: ${def.type} declares the required members`, () => {
    for (const k of ['type', 'label', 'icon', 'group']) assert.ok(typeof def[k] === 'string' && def[k], `${def.type}.${k}`);
    assert.equal(typeof def.defaults, 'function');
    assert.equal(typeof def.render, 'function');
  });

  test(`render: ${def.type} defaults render without undefined/NaN`, () => {
    assert.ok(!bad(renderBlock(def, def.defaults())));
  });

  test(`edit paths: ${def.type} data-f paths resolve in props`, () => {
    const props = def.defaults();
    const html = renderBlock(def, props);
    for (const [, b, path] of html.matchAll(/data-b="([^"]+)" data-f="([^"]+)"/g)) {
      if (b === 'cover' || b === 'meta') continue;
      assert.notEqual(getPath(props, path), undefined, `${def.type}: ${path}`);
    }
  });

  for (const [key, ld] of Object.entries(def.lists || {})) {
    test(`list ${def.type}.${key}: renders at max (${ld.max}) items`, () => {
      const props = def.defaults();
      props[key] = Array.from({ length: ld.max }, () => ld.add());
      assert.ok(!bad(renderBlock(def, props)));
    });
    if (ld.min === 0) {
      test(`list ${def.type}.${key}: renders with 0 items`, () => {
        const props = def.defaults();
        props[key] = [];
        assert.ok(!bad(renderBlock(def, props)));
      });
    }
  }

  test(`escape: ${def.type} never emits user text as markup`, () => {
    const html = renderBlock(def, poison(clone(def.defaults())));
    assert.ok(!html.includes('<b>'));
  });
}

test('heading: empty subtitle renders no subtitle element', () => {
  const def = get('heading');
  const html = renderBlock(def, { ...def.defaults(), subtitle: '' });
  assert.ok(!html.includes('data-f="subtitle"'));
  assert.ok(renderBlock(def, { ...def.defaults(), subtitle: 'Hi' }).includes('data-f="subtitle"'));
});

test('ctx.F targets cover and meta groups without the prefix', async () => {
  const { fakeCtx, fakeState } = await import('./helpers.mjs');
  const ctx = fakeCtx({ state: fakeState({ cover: { t: 'A' }, meta: { h: 'B' } }) });
  assert.match(ctx.F('cover.t', 'span'), /data-b="cover" data-f="t"[^>]*>A</);
  assert.match(ctx.F('meta.h', 'span'), /data-b="meta" data-f="h"[^>]*>B</);
});

test('ctx.ico falls back to the star icon and ctx.flag is empty without a code', async () => {
  const { fakeCtx } = await import('./helpers.mjs');
  const ctx = fakeCtx();
  assert.ok(ctx.ico('missing').includes('d="M0 0"'));
  assert.equal(ctx.flag(''), '');
  assert.match(ctx.flag('it'), /country-flags\/master\/flags\/png\/it\.png/);
});

/* ── Task 4 blocks ── */
test('titleBanner reads title and subtitle from the cover and edits go to the cover group', () => {
  const def = get('titleBanner');
  const html = renderBlock(def, def.defaults(), { cover: { coverTitleLine1: 'A', coverTitleLine2: 'B', subtitle: 'S' } });
  assert.match(html, /data-b="cover" data-f="coverTitleLine1"[^>]*>A</);
  assert.match(html, /data-b="cover" data-f="subtitle"[^>]*>S</);
  assert.equal(def.unique, true);
});

test('narrative omits empty eyebrow and lead', () => {
  const def = get('narrative');
  const html = renderBlock(def, { ...def.defaults(), eyebrow: '', lead: '' });
  assert.ok(!html.includes('data-f="eyebrow"') && !html.includes('data-f="lead"'));
  const full = renderBlock(def, { ...def.defaults(), eyebrow: 'E', lead: 'L' });
  assert.ok(full.includes('data-f="eyebrow"') && full.includes('data-f="lead"'));
});

test('sections renders nothing without items', () => {
  const def = get('sections');
  assert.equal(renderBlock(def, { items: [] }).trim(), '');
});

test('pullQuote styles differ and the photo is optional', () => {
  const def = get('pullQuote');
  const base = def.defaults();
  const html = s => renderBlock(def, { ...base, style: s });
  assert.notEqual(html('dark'), html('plain'));
  assert.notEqual(html('boxed'), html('plain'));
  assert.ok(!renderBlock(def, { ...base, img: '' }).includes('<img'));
  assert.ok(renderBlock(def, { ...base, img: 'x.png' }).includes('<img'));
});

test('overview keeps line breaks and is unique', () => {
  const def = get('overview');
  assert.ok(renderBlock(def, def.defaults()).includes('white-space:pre-line'));
  assert.equal(def.unique, true);
});

/* ── Task 5 blocks ── */
import { splitBlock } from './helpers.mjs';
const items = (def, key, n) => Array.from({ length: n }, () => def.lists[key].add());

test('figures picks columns by count: n up to 5 uses n, 6 uses 3', () => {
  const def = get('figures');
  for (const [n, cols] of [[2, 2], [4, 4], [5, 5], [6, 3]]) {
    const html = renderBlock(def, { ...def.defaults(), items: items(def, 'items', n) });
    assert.ok(html.includes(`repeat(${cols},1fr)`), `n=${n}`);
  }
});

test('figures themes render differently', () => {
  const def = get('figures');
  assert.notEqual(renderBlock(def, { ...def.defaults(), theme: 'dark' }), renderBlock(def, { ...def.defaults(), theme: 'light' }));
});

test('benefits, options and steps render nothing when empty', () => {
  for (const type of ['benefits', 'options', 'steps']) {
    const def = get(type);
    assert.equal(renderBlock(def, { ...def.defaults(), items: [] }).trim(), '', type);
  }
});

test('articles renders nothing when empty and has no title', () => {
  const def = get('articles');
  assert.equal(renderBlock(def, { title: '', items: [] }).trim(), '');
});

test('options columns follow n<=4 ? n : ceil(n/2); steps follow n<=6 ? n : ceil(n/2)', () => {
  const o = get('options'), s = get('steps');
  assert.ok(renderBlock(o, { ...o.defaults(), items: items(o, 'items', 8) }).includes('repeat(4,1fr)'));
  assert.ok(renderBlock(o, { ...o.defaults(), items: items(o, 'items', 3) }).includes('repeat(3,1fr)'));
  assert.ok(renderBlock(s, { ...s.defaults(), items: items(s, 'items', 8) }).includes('repeat(4,1fr)'));
  assert.ok(renderBlock(s, { ...s.defaults(), items: items(s, 'items', 6) }).includes('repeat(6,1fr)'));
});

test('steps shows the duration chip only when set', () => {
  const def = get('steps');
  const base = def.defaults();
  const none = renderBlock(def, { ...base, items: [{ title: 'T', desc: 'D', duration: '' }] });
  const some = renderBlock(def, { ...base, items: [{ title: 'T', desc: 'D', duration: '2 weeks' }] });
  assert.ok(!none.includes('items.0.duration'));
  assert.ok(some.includes('items.0.duration'));
});

test('benefits clamp descriptions to 2 lines', () => {
  const def = get('benefits');
  assert.ok(renderBlock(def, def.defaults()).includes('-webkit-line-clamp:2'));
});

test('articles and sections split into one part per item', () => {
  for (const [type, n] of [['articles', 5], ['sections', 3]]) {
    const def = get(type);
    const parts = splitBlock(def, def.defaults());
    assert.equal(parts.length, n, type);
    assert.ok(parts.every(h => typeof h === 'string' && h.trim()));
  }
});
