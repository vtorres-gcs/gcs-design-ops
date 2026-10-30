// Pure pagination: items are {id, html, kind?:'break', split?:()=>string[]}.
// measure(pageItems) returns how many px the page overflows (<= 1 means it fits).
export function paginate(items, { measure, guard = 10000 }) {
  const segments = [[]];
  for (const it of items) {
    if (it.kind === 'break') segments.push([]);
    else segments[segments.length - 1].push(it);
  }
  const pages = [], warnings = [];
  for (const seg of segments) {
    if (!seg.length) continue;
    const base = pages.length, pgs = [seg.slice()];
    for (let p = 0; p < pgs.length; p++) {
      let steps = 0;   // budget per page: moving items forward always makes progress, this only stops a runaway measure()
      for (;;) {
        const page = pgs[p];
        if (++steps > guard) { warnings.push({ page: base + p, blockId: page[page.length - 1].id, kind: 'tooTall' }); break; }
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
