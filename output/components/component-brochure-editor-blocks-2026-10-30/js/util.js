const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const esc = s => (s == null ? '' : String(s).replace(/[&<>"']/g, c => ESC[c]));

export function getPath(obj, path) {
  let cur = obj;
  for (const k of String(path).split('.')) {
    if (cur == null) return undefined;
    cur = cur[k];
  }
  return cur;
}

export function setPath(obj, path, value) {
  const keys = String(path).split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
}

export function uid(used = new Set()) {
  let id;
  do { id = 'b_' + Math.random().toString(36).slice(2, 6).padEnd(4, '0'); } while (used.has(id));
  return id;
}

export const clone = v => JSON.parse(JSON.stringify(v));
