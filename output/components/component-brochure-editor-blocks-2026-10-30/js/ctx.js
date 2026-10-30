import { esc, getPath } from './util.js';

const DS = '../../../../gcs-design-system';
const FLAG_ONLINE = 'https://raw.githubusercontent.com/msikma/country-flags/master/flags/png/';

// Online repo defined by the DS (msikma/country-flags); DS local copy as offline fallback; uk <-> gb alias.
export function flagUrls(code) {
  if (!/^[a-z]{2}$/i.test(code || '')) return null;
  const c = code.toLowerCase();
  return [FLAG_ONLINE + (c === 'gb' ? 'uk' : c) + '.png', `${DS}/assets/flags/${c === 'uk' ? 'gb' : c}.png`];
}

export function makeCtx({ state, icons, flagUrls: urls = flagUrls }, blockId) {
  const block = blockId ? state.blocks.find(b => b.id === blockId) : null;
  const split = path => {
    if (path.startsWith('cover.')) return ['cover', path.slice(6), state.cover];
    if (path.startsWith('meta.')) return ['meta', path.slice(5), state.meta];
    return [blockId, path, block ? block.props : undefined];
  };
  const F = (path, tag = 'div', style = '', attrs = '') => {
    const [target, key, root] = split(path);
    return `<${tag} data-b="${esc(target)}" data-f="${esc(key)}" style="${style}"${attrs ? ' ' + attrs : ''}>${esc(root == null ? '' : getPath(root, key))}</${tag}>`;
  };
  const ico = (name, style = '') =>
    `<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" style="${style}"><path d="${icons[name] || icons.star}"/></svg>`;
  const flag = (code, size = 44) => {
    const u = urls(code);
    if (!u) return '';
    return `<img src="${u[0]}" alt="" data-fb="${u[1]}" onerror="if(this.dataset.fb){this.src=this.dataset.fb;this.dataset.fb=''}else{this.style.display='none'}" style="width:${size}px;height:${size}px;object-fit:cover;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,9,87,.12);display:block;flex-shrink:0;">`;
  };
  return { blockId, cover: state.cover, meta: state.meta, F, ico, flag };
}
