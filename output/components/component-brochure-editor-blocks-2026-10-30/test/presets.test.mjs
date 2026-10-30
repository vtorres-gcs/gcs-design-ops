import { test } from 'node:test';
import assert from 'node:assert/strict';
import { all, get, SOON } from '../js/presets/index.js';
import { get as getBlock } from '../js/blocks/index.js';
import { createState } from '../js/store.js';
import { fakeCtx, fakeState } from './helpers.mjs';

test('presets: factsheet and quarterly-report are registered, four templates are coming soon', () => {
  assert.deepEqual(all().map(p => p.id), ['factsheet', 'quarterly-report']);
  assert.equal(get('factsheet').id, 'factsheet');
  assert.equal(get('nope'), undefined);
  assert.equal(SOON.length, 4);
});

for (const preset of all()) {
  test(`${preset.id}: every preset block exists and unique blocks appear once`, () => {
    const seen = new Set();
    for (const b of preset.blocks) {
      const def = getBlock(b.type);
      assert.ok(def, `unknown block ${b.type}`);
      if (def.unique) { assert.ok(!seen.has(b.type), `duplicate unique ${b.type}`); seen.add(b.type); }
    }
  });

  test(`${preset.id}: cover and back render a document page and meta has the year`, () => {
    const state = createState(preset);
    const ctx = fakeCtx({ state });
    const cover = preset.cover.render(state.cover, ctx);
    assert.ok(cover.includes('data-doc-page'));
    assert.ok(cover.includes('data-b="cover"'));
    assert.ok(preset.back.render(ctx).includes('data-doc-page'));
    assert.equal(preset.meta.defaults().year, '2026');
    assert.ok(Array.isArray(preset.cover.form) && preset.cover.form.length > 0);
  });
}

test('factsheet preset: titleBanner first, six blocks, four figures', () => {
  const s = createState(get('factsheet'));
  assert.equal(s.blocks.length, 6);
  assert.deepEqual(s.blocks.map(b => b.type), ['titleBanner', 'figures', 'overview', 'benefits', 'options', 'steps']);
  assert.equal(s.blocks[1].props.items.length, 4);
  assert.equal(s.blocks[1].props.theme, 'dark');
  assert.equal(s.blocks[0].props.flag, 'it');
});

test('quarterly preset: one pageBreak after the articles, boxed pull quote with the default author photo', () => {
  const s = createState(get('quarterly-report'));
  assert.deepEqual(s.blocks.map(b => b.type), ['narrative', 'articles', 'pageBreak', 'heading', 'sections', 'pullQuote']);
  assert.equal(s.blocks[3].props.eyebrow, '01 · Market Overview');
  assert.equal(s.blocks[5].props.style, 'boxed');
  assert.match(s.blocks[5].props.img, /Patricia%20Casaburi\.png$/);
});

test('meta defaults: footers keep the {year} token', () => {
  assert.match(get('quarterly-report').meta.defaults().footerLeft, /\{year\}/);
  assert.equal(get('factsheet').meta.defaults().footerLeft, 'GLOBALCITIZENSOLUTIONS.COM');
});
