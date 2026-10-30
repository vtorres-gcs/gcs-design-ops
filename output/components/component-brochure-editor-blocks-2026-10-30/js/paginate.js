// Pure pagination: items are {id, html, kind?:'break', split?:()=>string[]}.
// measure(pageItems) returns how many px the page overflows (<= 1 means it fits).
export function paginate(items, { measure, guard = 200 }) {
  const segments = [[]];
  for (const it of items) {
    if (it.kind === 'break') segments.push([]);
    else segments[segments.length - 1].push(it);
  }
  const pages = [], warnings = [];
  let steps = 0;
  for (const seg of segments) {
    if (!seg.length) continue;
    const base = pages.length, pgs = [seg.slice()];
    let stop = false;
    for (let p = 0; p < pgs.length && !stop; p++) {
      for (;;) {
        const page = pgs[p];
        if (++steps > guard) { warnings.push({ page: base + p, blockId: page[page.length - 1].id, kind: 'tooTall' }); stop = true; break; }
        if (measure(page) <= 1) break;
        if (page.length > 1) { (pgs[p + 1] = pgs[p + 1] || []).unshift(page.pop()); continue; }
        const only = page[0];
        if (only.split) { pgs[p] = only.split().map(html => ({ id: only.id, html })); continue; }
        warnings.push({ page: base + p, blockId: only.id, kind: 'tooTall' });
        break;
      }
    }
    pages.push(...pgs.filter(g => g.length));
  }
  return { pages, warnings };
}
