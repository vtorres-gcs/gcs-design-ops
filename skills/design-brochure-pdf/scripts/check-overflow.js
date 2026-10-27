#!/usr/bin/env node
/**
 * Checks a populated, flattened brochure HTML file for per-page content
 * overflow before it's handed to html-to-pdf.js for export.
 *
 * Each brochure page is a fixed-size `[data-doc-page]` box (210mm×297mm)
 * with `overflow: hidden` — content that's too long for its slot doesn't
 * push the page taller, it silently clips. html-to-pdf.js's own overflow
 * check only counts PDF pages (via pdfinfo), which can't catch this; this
 * script measures each page's real DOM scrollHeight against its rendered
 * clientHeight instead, the same class of check the old dc-runtime-based
 * render pipeline used to run automatically as part of prop injection.
 *
 * It also checks HORIZONTAL clipping, which the page's own scroll metrics
 * cannot see: every component wrapper sets its own `overflow: hidden`, and
 * that inner clipper absorbs the scrollable-overflow region before it
 * reaches the page box (measured: a table overhanging by 218px still leaves
 * page.scrollWidth === page.clientWidth === 794). So instead of trusting
 * scrollWidth, we walk the tree and compare each element's real layout rect
 * against the padding box of its nearest clipping ancestor — which is where
 * the content actually gets cut, often well inside the paper edge.
 *
 * Usage:
 *   node check-overflow.js <populated.html>
 *
 * Exit codes:
 *   0 — clean.
 *   2 — a page overflows its fixed print height (remedy: add a continuation page).
 *   3 — an element is horizontally clipped (remedy: shorten, wrap, or re-column
 *       the content — never add a page).
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    process.stderr.write('Usage: check-overflow.js <populated.html>\n');
    process.exit(1);
  }

  const fileUrl = 'file://' + path.resolve(inputPath);
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 1200 });
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.evaluateHandle('document.fonts.ready');
    await page.emulateMediaType('print');

    const pages = await page.evaluate((TOL, MAX_PER_PAGE) => {
      const CLIPS = /^(hidden|clip|auto|scroll)$/;

      // Clip regions of nested containers intersect.
      const intersect = (a, b) => ({ left: Math.max(a.left, b.left), right: Math.min(a.right, b.right) });

      // `overflow` clips at the padding box, not the border box.
      const clipBox = (el) => {
        const r = el.getBoundingClientRect();
        const left = r.left + el.clientLeft;
        return { left, right: left + el.clientWidth };
      };

      const label = (el) => {
        if (el.hasAttribute('data-doc-page')) return '[data-doc-page]';
        const tag = el.tagName.toLowerCase();
        if (el.id) return tag + '#' + el.id;
        const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean);
        if (cls.length) return tag + '.' + cls.slice(0, 3).join('.');
        if (el.dataset && el.dataset.component) return tag + '[data-component="' + el.dataset.component + '"]';
        const sibs = Array.from(el.parentElement ? el.parentElement.children : []).filter((x) => x.tagName === el.tagName);
        return sibs.length > 1 ? tag + ':nth-of-type(' + (sibs.indexOf(el) + 1) + ')' : tag;
      };

      const pathTo = (el, stop) => {
        const parts = [];
        for (let n = el; n && n !== stop; n = n.parentElement) parts.unshift(label(n));
        return parts.join(' > ');
      };

      const snippet = (el) => {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        return t ? (t.length > 80 ? t.slice(0, 77) + '...' : t) : null;
      };

      return Array.from(document.querySelectorAll('[data-doc-page]')).map((pageEl, index) => {
        const pageClip = clipBox(pageEl);
        const raw = [];

        // Carry the nearest X-clipping ancestor down the tree. Absolutely
        // positioned boxes are clipped by the nearest *positioned* clipper,
        // so track that chain separately.
        const walk = (parent, clip, posClip) => {
          for (const el of parent.children) {
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;

            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) continue;

            const abs = cs.position === 'absolute' || cs.position === 'fixed';
            const ref = abs ? posClip : clip;
            const allowed = el.closest('[data-allow-bleed]');

            // Text-free absolutely positioned boxes are deliberate bleed
            // (cover background images, decorative shapes). Scoped to
            // `absolute` on purpose: an oversized *static* <img> is a real bug.
            const decorative = abs && !(el.textContent || '').trim();

            // SIGNAL A — this box is drawn outside the region that clips it.
            // Catches boxes that grow: a table whose min-content beats its
            // wrapper, an oversized <img>, absolutely positioned text.
            const overRight = r.right - ref.rect.right;
            const overLeft = ref.rect.left - r.left;
            const overhang = Math.max(overRight, overLeft);

            if (overhang > TOL && !decorative && !allowed) {
              raw.push({
                el,
                kind: 'box',
                clipEl: ref.el,
                overhang: +overhang.toFixed(1),
                side: overRight >= overLeft ? 'right' : 'left',
                beyondPage: +(overRight >= overLeft ? r.right - pageClip.right : pageClip.left - r.left).toFixed(1),
              });
            }

            const selfClips = CLIPS.test(cs.overflowX);

            // SIGNAL B — this element clips and its own content is wider than
            // it. Required because a *block* never grows past its container:
            // `white-space: nowrap` text overflows the box while the box's own
            // rect stays put, so Signal A is blind to it. Measured on a real
            // month-grid cell: scrollWidth 423 vs clientWidth 212, and not one
            // overhanging rect anywhere on the page. Only clipping elements are
            // tested — on a non-clipping ancestor the overflow just propagates
            // up to whichever element actually cuts it.
            const scrollOver = el.scrollWidth - el.clientWidth;
            if (selfClips && scrollOver > TOL && !allowed) {
              const box = clipBox(el);
              raw.push({
                el,
                kind: 'content',
                clipEl: el,
                overhang: +scrollOver.toFixed(1),
                side: 'right',
                beyondPage: +(box.left + el.scrollWidth - pageClip.right).toFixed(1),
              });
            }
            const nextClip = selfClips ? { el, rect: intersect(clip.rect, clipBox(el)) } : clip;
            const nextPos = selfClips && cs.position !== 'static'
              ? { el, rect: intersect(posClip.rect, clipBox(el)) }
              : posClip;
            walk(el, nextClip, nextPos);
          }
        };

        const root = { el: pageEl, rect: pageClip };
        walk(pageEl, root, root);

        // An element can trip both signals; keep its worst reading.
        const byEl = new Map();
        for (const o of raw) {
          const prev = byEl.get(o.el);
          if (!prev || o.overhang > prev.overhang) byEl.set(o.el, o);
        }
        const uniq = Array.from(byEl.values());

        // One entry per root cause: keep only leaf offenders, so a chain like
        // table > tbody > tr > td > span collapses to the span. The dropped
        // ancestors are kept in `via` for context.
        const leaves = uniq
          .filter((a) => !uniq.some((b) => b !== a && a.el.contains(b.el)))
          .sort((a, b) => b.overhang - a.overhang);

        return {
          index,
          scrollHeight: pageEl.scrollHeight,
          clientHeight: pageEl.clientHeight,
          overflow: pageEl.scrollHeight - pageEl.clientHeight,
          clientWidth: pageEl.clientWidth,
          scrollWidth: pageEl.scrollWidth,
          overflowX: pageEl.scrollWidth - pageEl.clientWidth,
          horizontalCount: leaves.length,
          horizontal: leaves.slice(0, MAX_PER_PAGE).map((o) => ({
            element: label(o.el),
            kind: o.kind,
            overhangPx: o.overhang,
            side: o.side,
            beyondPageEdgePx: o.beyondPage,
            component: o.el.closest('[data-component]')
              ? o.el.closest('[data-component]').dataset.component
              : null,
            clippedBy: pathTo(o.clipEl, pageEl) || '[data-doc-page]',
            path: pathTo(o.el, pageEl),
            via: raw.filter((b) => b !== o && b.el.contains(o.el)).map((b) => label(b.el)),
            text: snippet(o.el),
          })),
        };
      });
    }, 2, 10);

    const overflowing = pages.filter((p) => p.overflow > 2);
    const clipping = pages.flatMap((p) => p.horizontal.map((h) => ({ page: p.index + 1, ...h })));

    process.stdout.write(
      JSON.stringify(
        {
          file: inputPath,
          pageCount: pages.length,
          status: overflowing.length || clipping.length ? 'overflow' : 'ok',
          pages,
          overflowing,
          clipping,
        },
        null,
        2
      ) + '\n'
    );

    if (clipping.length > 0) {
      const pagesHit = new Set(clipping.map((c) => c.page));
      process.stderr.write(
        `HORIZONTAL CLIP: ${clipping.length} element(s) on ${pagesHit.size} page(s) extend past their container and are silently cut off in the PDF:\n`
      );
      for (const c of clipping) {
        const what = c.kind === 'content'
          ? `content is ${c.overhangPx}px wider than this box and is cut off`
          : `box overhangs ${c.side} by ${c.overhangPx}px`;
        process.stderr.write(
          `  page ${c.page}: <${c.element}> ${what}` +
            (c.component ? ` in component "${c.component}"` : '') +
            `\n    clipped by: ${c.clippedBy}\n` +
            `    path:       ${c.path}\n` +
            (c.via.length ? `    via:        ${c.via.join(' > ')}\n` : '') +
            (c.text ? `    text:       "${c.text}"\n` : '') +
            (c.beyondPageEdgePx > 0 ? `    also ${c.beyondPageEdgePx}px past the paper edge\n` : '')
        );
      }
      for (const p of pages) {
        if (p.horizontalCount > p.horizontal.length) {
          process.stderr.write(
            `  page ${p.index + 1}: ...and ${p.horizontalCount - p.horizontal.length} more (showing widest ${p.horizontal.length})\n`
          );
        }
      }
      process.stderr.write(
        'Fix by shortening the text, allowing it to wrap (remove white-space: nowrap), or widening/narrowing the column — never by adding a page.\n'
      );
    }

    if (overflowing.length > 0) {
      process.stderr.write(
        `OVERFLOW: ${overflowing.length} of ${pages.length} page(s) exceed their fixed print height: ${overflowing
          .map((p) => `page ${p.index + 1} (+${p.overflow}px)`)
          .join(', ')}\n`
      );
      process.exit(2);
    }
    if (clipping.length > 0) process.exit(3);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  process.stderr.write(String(err && err.stack ? err.stack : err) + '\n');
  process.exit(1);
});
