import { get } from '../blocks/index.js';
import { setValue, addItem, removeItem, moveItem } from '../store.js';
import { esc, getPath } from '../util.js';
import { openPicker } from './picker.js';

const META_FIELDS = [['headerLabel', 'Header label'], ['footerLeft', 'Footer left ({year} = year)'], ['footerRight', 'Footer right ({year} = year)'], ['year', 'Year']];

export function mountForm(el, api) {
  const open = new Set(['cover:media', 'cover:cover']);   // remembered open groups

  const field = (t, path, label, kind, arg, value) => {
    const a = `data-t="${esc(t)}" data-k="${esc(path)}"`;
    if (kind === 'area') return `<label class="fl"><span>${esc(label)}</span><textarea ${a} rows="${arg || 3}">${esc(value)}</textarea></label>`;
    if (kind === 'select') return `<label class="fl"><span>${esc(label)}</span><select ${a}>${arg.map(o => `<option ${o === value ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
    if (kind === 'toggle') return `<label class="chk"><input type="checkbox" ${a} ${value ? 'checked' : ''}> ${esc(label)}</label>`;
    if (kind === 'img') return `<div class="fl"><span>${esc(label)}</span><div class="imgrow">${value ? `<img src="${esc(value)}" alt="">` : ''}<input type="file" accept="image/*" data-up ${a} data-w="${arg || 1200}"> ${value ? `<button class="sbtn" data-act="rmimg" ${a}>Remove</button>` : ''}</div></div>`;
    return `<label class="fl"><span>${esc(label)}</span><input type="text" ${a} value="${esc(value)}"></label>`;
  };
  const group = (key, title, body, isOpen) => `<details class="grp" data-g="${esc(key)}" ${isOpen || open.has(key) ? 'open' : ''}><summary>${esc(title)}</summary><div class="body">${body}</div></details>`;
  const fieldsHtml = (t, root, fields) => fields.map(([p, l, k, a]) => field(t, p, l, k, a, getPath(root, p))).join('');

  function listHtml(block, def, key, ld) {
    const arr = block.props[key] || [];
    const items = arr.map((it, i) => `<div class="sub" data-i="${i}"><div class="subh"><b>${esc(ld.one)} ${i + 1}</b>
      <button class="ib" data-act="iup" data-key="${key}" data-i="${i}" ${i === 0 ? 'disabled' : ''}>↑</button>
      <button class="ib" data-act="idown" data-key="${key}" data-i="${i}" ${i === arr.length - 1 ? 'disabled' : ''}>↓</button>
      <button class="ib" data-act="idel" data-key="${key}" data-i="${i}" ${arr.length <= ld.min ? 'disabled' : ''}>✕</button></div>
      ${ld.icon ? `<div class="iconbtn"><button class="sbtn" data-act="icon" data-key="${key}" data-i="${i}">Icon: ${esc(String(it.icon || 'star').replace(/_/g, ' '))}</button></div>` : ''}
      ${ld.f.map(([p, l, k, a]) => field(block.id, `${key}.${i}.${p}`, l, k, a, it[p])).join('')}</div>`).join('');
    return `<div class="list" data-list="${key}"><div class="hint">${arr.length}/${ld.max} · min ${ld.min}</div>${items}
      <button class="sbtn add" data-act="add" data-key="${key}" ${arr.length >= ld.max ? 'disabled' : ''}>+ Add ${esc(ld.one.toLowerCase())}</button></div>`;
  }

  function render() {
    const S = api.state, P = api.preset;
    let html = P.cover.form.map(g => group(`cover:${g.id}`, g.title, fieldsHtml('cover', S.cover, g.fields), false)).join('');
    html += group('meta', 'Document', fieldsHtml('meta', S.meta, META_FIELDS));
    const block = S.blocks.find(b => b.id === api.selected), def = block && get(block.type);
    if (def) {
      const body = fieldsHtml(block.id, block.props, def.fields || []) + Object.entries(def.lists || {}).map(([k, ld]) => listHtml(block, def, k, ld)).join('');
      html += group(`block:${block.id}`, def.label, body || '<div class="hint">No editable fields.</div>', true);
    }
    el.innerHTML = `<div class="sidescroll">${html}</div>`;
  }

  el.addEventListener('toggle', e => { const g = e.target.closest && e.target.closest('[data-g]'); if (g) (g.open ? open.add(g.dataset.g) : open.delete(g.dataset.g)); }, true);

  el.addEventListener('input', e => {
    const t = e.target;
    if (!t.dataset || !t.dataset.k || t.type === 'file') return;
    setValue(api.state, t.dataset.t, t.dataset.k, t.type === 'checkbox' ? t.checked : t.value);
    api.changed({});
  });

  el.addEventListener('change', e => {
    const t = e.target;
    if (!t.matches || !t.matches('[data-up]') || !t.files[0]) return;
    const file = t.files[0], maxW = +t.dataset.w || 1200, reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const sc = Math.min(1, maxW / img.width), c = document.createElement('canvas');
        c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        setValue(api.state, t.dataset.t, t.dataset.k, c.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.88));
        api.changed({ form: true });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  el.addEventListener('click', async e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const S = api.state, id = api.selected, i = +b.dataset.i, key = b.dataset.key;
    if (b.dataset.act === 'rmimg') { setValue(S, b.dataset.t, b.dataset.k, ''); }
    else if (b.dataset.act === 'add') addItem(S, id, key);
    else if (b.dataset.act === 'idel') removeItem(S, id, key, i);
    else if (b.dataset.act === 'iup') moveItem(S, id, key, i, i - 1);
    else if (b.dataset.act === 'idown') moveItem(S, id, key, i, i + 1);
    else if (b.dataset.act === 'icon') {
      const block = S.blocks.find(x => x.id === id), cur = block.props[key][i].icon;
      const name = await openPicker(b, api.icons, cur);
      if (!name) return;
      setValue(S, id, `${key}.${i}.icon`, name);
    } else return;
    api.changed({ form: true });
  });

  // Open the group that holds `target` ('cover' | 'meta' | block id), then focus and flash the field.
  function focus(target, path) {
    if (target === 'cover') open.add(`cover:${api.preset.cover.form.find(g => g.fields.some(f => f[0] === path))?.id || 'cover'}`);
    else if (target === 'meta') open.add('meta');
    render();
    const input = el.querySelector(`[data-t="${CSS.escape(target)}"][data-k="${CSS.escape(path)}"]`);
    if (!input) return;
    input.closest('details') && (input.closest('details').open = true);
    input.scrollIntoView({ block: 'center' });
    input.focus();
    const fl = input.closest('.fl');
    if (fl) { fl.classList.add('flash'); setTimeout(() => fl.classList.remove('flash'), 1000); }
  }

  return { render, focus };
}
