import { get } from './blocks/index.js';
import { makeCtx } from './ctx.js';
import { paginate } from './paginate.js';
import { esc } from './util.js';
import { DS, PG } from './consts.js';

const PAD = 56;
const wrap = (id, html) => `<div class="blk" data-blk="${esc(id)}">${html}</div>`;
const fill = (text, meta) => String(text || '').replace(/\{year\}/g, meta.year || '');

export function buildItems(state, deps) {
  const items = [];
  for (const b of state.blocks) {
    const def = get(b.type);
    if (!def) continue;
    if (b.type === 'pageBreak') { items.push({ id: b.id, html: '', kind: 'break' }); continue; }
    const ctx = makeCtx({ state, icons: deps.icons, flagUrls: deps.flagUrls }, b.id);
    const html = def.render(b.props, ctx);
    if (!html || !html.trim()) continue;
    const item = { id: b.id, html: wrap(b.id, html) };
    if (def.split) item.split = () => def.split(b.props, ctx).map(h => wrap(b.id, h));
    items.push(item);
  }
  return items;
}

const FOOT = "font-family:'Heebo',sans-serif;font-size:10px;color:var(--doc-muted);";

// One body page: running header, [data-body] with the items, running footer.
export function pageChrome(items, { state, pageNo, deps = {} }) {
  const ctx = makeCtx({ state, icons: deps.icons || {} }, null);
  const label = ctx.F('meta.headerLabel', 'span', "font-family:'Heebo',sans-serif;font-size:10px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:var(--doc-muted);");
  const no = String(pageNo).padStart(2, '0');
  const right = (state.meta.footerRight ? esc(fill(state.meta.footerRight, state.meta)) + ' · ' : '');
  return `<div data-doc-page style="${PG}background:var(--card);box-shadow:0 4px 20px rgba(0,9,87,.1);">
    <div style="padding:18px ${PAD}px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">${label}
      <div style="display:flex;align-items:center;gap:7px;"><img src="${DS}/assets/logos/GCS-Symbol-Blue.svg" alt="" style="height:15px;width:auto;"><span style="font-family:'Heebo',sans-serif;font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--primary);">Global Citizen Solutions</span></div></div>
    <div style="border-bottom:1px solid var(--doc-border);margin:0 ${PAD}px;flex-shrink:0;"></div>
    <div data-body style="padding:20px ${PAD}px 0;flex:1;display:flex;flex-direction:column;gap:16px;min-height:0;">${items.map(i => i.html).join('')}</div>
    <div style="border-top:1px solid var(--doc-border);padding:14px ${PAD}px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;margin-top:16px;">
      <span style="${FOOT}font-weight:600;letter-spacing:.06em;">${esc(fill(state.meta.footerLeft, state.meta))}</span>
      <span style="${FOOT}">${right}<span>${no}</span></span>
    </div></div>`;
}

// measure(pageItems) -> overflow px; the browser provides it, tests pass a fake.
export function renderDocument(state, preset, deps, measure) {
  const ctx = makeCtx({ state, icons: deps.icons, flagUrls: deps.flagUrls }, null);
  const { pages, warnings } = paginate(buildItems(state, deps), { measure });
  const body = pages.map((items, k) => pageChrome(items, { state, pageNo: k + 2, deps }));
  return { pages: [preset.cover.render(state.cover, ctx), ...body, preset.back.render(ctx)], warnings };
}
