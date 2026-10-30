import { makeCtx } from '../js/ctx.js';

export const ICONS = { star: 'M0 0', check: 'M1 1' };

export function fakeState(extra = {}) {
  return { v: 4, template: 'test', cover: {}, meta: {}, blocks: [], ...extra };
}

export function fakeCtx({ state = fakeState(), blockId = null } = {}) {
  return makeCtx({ state, icons: ICONS }, blockId);
}

export function blockWith(type, props) {
  return { id: 'b_test', type, props };
}

// Renders one block the way document.js will: the block lives in state, ctx.F reads from it.
export function renderBlock(def, props, stateExtra = {}) {
  const block = blockWith(def.type, props);
  const state = fakeState({ ...stateExtra, blocks: [block] });
  return def.render(props, makeCtx({ state, icons: ICONS }, block.id));
}

export function splitBlock(def, props, stateExtra = {}) {
  const block = blockWith(def.type, props);
  const state = fakeState({ ...stateExtra, blocks: [block] });
  return def.split(props, makeCtx({ state, icons: ICONS }, block.id));
}
