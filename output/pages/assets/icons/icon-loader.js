// GCS Material Symbols loader — fetches exact icons from Google's public repository.
(function () {
  var BASE = 'https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web';
  var STYLES = { outlined: true, rounded: true, sharp: true };
  var NAME = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
  var svgCache = new Map();
  function iconUrl(_base, variant, name, fill) {
    variant = variant || 'outlined';
    if (!STYLES[variant] || !NAME.test(name || '')) return '';
    return BASE + '/' + name + '/materialsymbols' + variant + '/' + name + (fill ? '_fill1' : '') + '_24px.svg';
  }
  function normalizeSvg(raw) {
    var text = String(raw || '').trim();
    if (!/^<svg\b[^>]*>[\s\S]*<\/svg>$/.test(text) || /<(?:script|foreignObject|iframe|object|embed|image|style)\b/i.test(text) || /\son[a-z]+\s*=|\s(?:href|src)\s*=|url\s*\(/i.test(text)) return '';
    return text.replace(/\s(?:width|height|fill)="[^"]*"/g, '').replace('<svg', '<svg width="100%" height="100%" fill="currentColor" aria-hidden="true" focusable="false"');
  }
  function loadSvg(url) {
    if (!url || url.indexOf(BASE + '/') !== 0) return Promise.resolve('');
    var cached = svgCache.get(url); if (cached) return Promise.resolve(cached);
    var promise = fetch(url).then(function (res) { return res.ok ? res.text() : Promise.reject(new Error('Icon not found')); })
      .then(function (text) { var normalized = normalizeSvg(text); if (!normalized) throw new Error('Invalid SVG'); svgCache.set(url, normalized); return normalized; })
      .catch(function () { svgCache.delete(url); return ''; });
    svgCache.set(url, promise); return promise;
  }
  function hydrate(rootEl) {
    rootEl = rootEl || document;
    rootEl.querySelectorAll('[data-icon]').forEach(function (el) {
      var url = iconUrl('', el.getAttribute('data-icon-variant') || 'outlined', el.getAttribute('data-icon'), el.getAttribute('data-icon-fill') === 'true');
      loadSvg(url).then(function (markup) { el.innerHTML = markup; });
    });
  }
  window.GCSIconLoader = { loadSvg: loadSvg, iconUrl: iconUrl, hydrate: hydrate, normalizeSvg: normalizeSvg };
  document.addEventListener('DOMContentLoaded', function () { hydrate(document); });
})();
