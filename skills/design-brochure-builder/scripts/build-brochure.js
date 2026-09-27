#!/usr/bin/env node
/**
 * Build a GCS/GIU brochure .pptx (A4 portrait) from an approved page-map
 * content.json. See SKILL.md for the full pipeline (page map approval,
 * embed_fonts.py, QA render).
 *
 * Usage: node scripts/build-brochure.js content.json output.pptx
 *
 * content.json shape:
 * {
 *   "pages": [
 *     { "type": "cover-gcs" | "cover-giu", ...cover props },
 *     {
 *       "type": "content",
 *       "brand": "gcs" | "giu",
 *       "eyebrowText": "01 · Introduction",
 *       "pageNumber": "02",
 *       "year": 2026,
 *       "blocks": [ { "type": "narrative" | "stat-strip-dark" | "stat-strip-light"
 *                     | "hero-image" | "timeline" | "cta-panel" | "key-facts-strip"
 *                     | "step-list" | "pull-quote" | "flag-badge", ...block props } ]
 *     },
 *     {
 *       "type": "content-2col",
 *       "leftColumn": { "component": "photo-column", "props": {...}, "widthPx"?: 280 },
 *       "rightColumn": { "padXPx"?: 48, "topPadPx"?: 48, "blocks": [ ...same block types... ] }
 *     },
 *     { "type": "back-cover" }
 *   ]
 * }
 */

const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');

const { PAGE_W, PAGE_H, CONTENT_Y, CONTENT_TOP_PAD, CONTENT_BOTTOM, MARGIN_X, PX, getContentMetrics } = require('./tokens');
const { addCoverGCS, addCoverGIU } = require('./components/cover');
const { addBackCover } = require('./components/back-cover');
const { addPageChrome } = require('./components/chrome');
const { addNarrative } = require('./components/narrative');
const { addStatStripDark } = require('./components/stat-strip-dark');
const { addStatStripLight } = require('./components/stat-strip-light');
const { addHeroImage } = require('./components/hero-image');
const { addTimeline } = require('./components/timeline');
const { addCtaPanel } = require('./components/cta-panel');
const { addFlagBadge } = require('./components/flag-badge');
const { addPhotoColumn } = require('./components/photo-column');
const { addKeyFactsStrip } = require('./components/key-facts-strip');
const { addStepList } = require('./components/step-list');
const { addPullQuote } = require('./components/pull-quote');
const { addArticleList } = require('./components/article-list');
const { addInvestmentPanel } = require('./components/investment-panel');
const { addBenefitsPanel } = require('./components/benefits-panel');

// Components NOT ported yet (see SKILL.md "Scope"). Listed explicitly so an
// unsupported block fails with a clear, actionable message instead of a
// silent no-op.
const UNSUPPORTED_BLOCKS = [
  'table-ranking', 'toc', 'month-grid',
  'data-table', 'chart-line', 'sidebar-cards',
];

const BLOCK_BUILDERS = {
  narrative: (slide, pres, props, y, layout) => addNarrative(slide, pres, props, y, layout),
  'stat-strip-dark': (slide, pres, props, y, layout) => addStatStripDark(slide, pres, props.stats, y, layout, { variant: props.variant }),
  'stat-strip-light': (slide, pres, props, y, layout) => addStatStripLight(slide, pres, props.tiles, y, layout),
  'hero-image': (slide, pres, props, y, layout) => addHeroImage(slide, pres, props, y, layout),
  timeline: (slide, pres, props, y, layout) => addTimeline(slide, pres, props, y, layout),
  'cta-panel': (slide, pres, props, y, layout) => addCtaPanel(slide, pres, props, y, layout),
  'key-facts-strip': (slide, pres, props, y, layout) => addKeyFactsStrip(slide, pres, props.facts, y, layout),
  'step-list': (slide, pres, props, y, layout) => addStepList(slide, pres, props, y, layout),
  'pull-quote': (slide, pres, props, y, layout) => addPullQuote(slide, pres, props, y, layout),
  'article-list': (slide, pres, props, y, layout) => addArticleList(slide, pres, props, y, layout),
  'investment-panel': (slide, pres, props, y, layout) => addInvestmentPanel(slide, pres, props, y, layout),
  'benefits-panel': (slide, pres, props, y, layout) => addBenefitsPanel(slide, pres, props, y, layout),
  'flag-badge': (slide, pres, props, y, layout) => {
    const { marginX: x = MARGIN_X } = layout || {};
    const size = props.size || PX(42);
    addFlagBadge(slide, pres, { flagPngPath: props.flagPngPath, x: props.x != null ? props.x : x, y, size, ringColor: props.ringColor });
    return y + size + 0.2;
  },
};

function runBlockStack(slide, pres, blocks, y, layout, pageIndex) {
  for (const block of blocks) {
    if (UNSUPPORTED_BLOCKS.includes(block.type)) {
      throw new Error(
        `Block type "${block.type}" is not supported by gcs-brochure-builder yet (supported: ` +
        `${Object.keys(BLOCK_BUILDERS).join(', ')}). Use the gcs-brochure skill (PDF output) for this content instead.`
      );
    }
    const builder = BLOCK_BUILDERS[block.type];
    if (!builder) {
      throw new Error(`Unknown block type "${block.type}". Supported: ${Object.keys(BLOCK_BUILDERS).join(', ')}`);
    }
    y = builder(slide, pres, block, y, layout);
  }
  if (y > CONTENT_BOTTOM) {
    const overBy = (y - CONTENT_BOTTOM).toFixed(2);
    console.warn(
      `WARNING: page ${pageIndex} content extends ~${overBy}in past the available area ` +
      `(${CONTENT_BOTTOM.toFixed(2)}in budget). Content will likely overlap the footer. ` +
      `Trim a paragraph/step or split across two pages.`
    );
  }
  return y;
}

// Block types that sit flush against the header hairline (no leading top pad) —
// everything else gets CONTENT_TOP_PAD added before its first block starts.
const FLUSH_FIRST_BLOCK_TYPES = ['hero-image'];

function buildContentPage(pres, pageDef, pageIndex) {
  const slide = pres.addSlide();
  addPageChrome(slide, pres, {
    brand: pageDef.brand || 'gcs',
    template: pageDef.template,
    eyebrowText: pageDef.eyebrowText,
    pageNumber: pageDef.pageNumber || String(pageIndex).padStart(2, '0'),
    year: pageDef.year,
  });

  const layout = getContentMetrics({ template: pageDef.template, brand: pageDef.brand });
  const blocks = pageDef.blocks || [];
  const flushFirst = blocks.length > 0 && FLUSH_FIRST_BLOCK_TYPES.includes(blocks[0].type);
  const y0 = CONTENT_Y + (flushFirst ? 0 : CONTENT_TOP_PAD);

  // Height-budget check is approximate and runs after shapes are already
  // added to the in-memory slide — a signal to revise and rebuild, not a
  // true pre-generation guard. See SKILL.md "No automatic text reflow".
  runBlockStack(slide, pres, blocks, y0, layout, pageIndex);
}

/**
 * Two-column content page — fixed-width left rail (e.g. photo-column) +
 * an independent block stack in the remaining right column. Ported from
 * templates/brochures/case-study/CaseStudy.dc.html's "Page 2" layout,
 * which doesn't fit the single-column vertical-stack model every other
 * page uses.
 *
 * pageDef shape: { type: 'content-2col', brand, template, eyebrowText,
 *   pageNumber, year, leftColumn: { component: 'photo-column', props: {...},
 *   width?: pxNumber }, rightColumn: { padX?: pxNumber, topPad?: pxNumber,
 *   blocks: [...] } }
 */
const LEFT_COLUMN_BUILDERS = {
  'photo-column': (slide, pres, props, x, y, w, h) => addPhotoColumn(slide, pres, props, x, y, w, h),
};

function buildTwoColumnPage(pres, pageDef, pageIndex) {
  const slide = pres.addSlide();
  addPageChrome(slide, pres, {
    brand: pageDef.brand || 'gcs',
    template: pageDef.template,
    eyebrowText: pageDef.eyebrowText,
    pageNumber: pageDef.pageNumber || String(pageIndex).padStart(2, '0'),
    year: pageDef.year,
  });

  const { leftColumn, rightColumn = {} } = pageDef;
  const leftW = PX(leftColumn && leftColumn.widthPx != null ? leftColumn.widthPx : 280);
  const colTop = CONTENT_Y; // flush under the header, like hero-image
  const colBottom = CONTENT_BOTTOM; // flush above the footer

  if (leftColumn) {
    const builder = LEFT_COLUMN_BUILDERS[leftColumn.component];
    if (!builder) {
      throw new Error(`Unknown leftColumn.component "${leftColumn.component}". Supported: ${Object.keys(LEFT_COLUMN_BUILDERS).join(', ')}`);
    }
    builder(slide, pres, leftColumn.props || {}, 0, colTop, leftW, colBottom - colTop);
  }

  const padX = PX(rightColumn.padXPx != null ? rightColumn.padXPx : 48);
  const topPad = PX(rightColumn.topPadPx != null ? rightColumn.topPadPx : 48);
  const rightX = leftW + padX;
  const rightW = PAGE_W - leftW - 2 * padX;
  const layout = { marginX: rightX, contentW: rightW };

  runBlockStack(slide, pres, rightColumn.blocks || [], colTop + topPad, layout, pageIndex);
}

/**
 * Two independent-stack content page — an optional full-width `topBlocks`
 * stack (e.g. a hero-image placeholder + stat-strip-dark band), followed by
 * a two-column split where BOTH columns run their own independent block
 * stack (unlike `content-2col`, whose left rail is a single fixed-geometry
 * component). Ported from
 * templates/brochures/factsheet/Factsheet.dc.html's page 2: a flexible left
 * column of narrative sections beside a fixed-232px right column of sidebar
 * panels.
 *
 * pageDef shape: { type: 'content-2col-stack', brand, template, eyebrowText,
 *   pageNumber, year, topBlocks?: [...], leftColumn: { blocks: [...] },
 *   rightColumn: { widthPx?: 232, gapPx?: 32, blocks: [...] } }
 */
function buildDualStackPage(pres, pageDef, pageIndex) {
  const slide = pres.addSlide();
  addPageChrome(slide, pres, {
    brand: pageDef.brand || 'gcs',
    template: pageDef.template,
    eyebrowText: pageDef.eyebrowText,
    pageNumber: pageDef.pageNumber || String(pageIndex).padStart(2, '0'),
    year: pageDef.year,
  });

  const { marginX, contentW } = getContentMetrics({ template: pageDef.template, brand: pageDef.brand });
  const topBlocks = pageDef.topBlocks || [];
  const flushFirst = topBlocks.length > 0 && FLUSH_FIRST_BLOCK_TYPES.includes(topBlocks[0].type);
  let y = CONTENT_Y + (flushFirst ? 0 : CONTENT_TOP_PAD);
  y = runBlockStack(slide, pres, topBlocks, y, { marginX, contentW }, pageIndex);

  const { leftColumn = {}, rightColumn = {} } = pageDef;
  const gap = PX(rightColumn.gapPx != null ? rightColumn.gapPx : 32);
  const rightW = PX(rightColumn.widthPx != null ? rightColumn.widthPx : 232);
  const leftW = contentW - rightW - gap;
  const rightX = marginX + leftW + gap;

  runBlockStack(slide, pres, leftColumn.blocks || [], y, { marginX, contentW: leftW }, pageIndex);
  runBlockStack(slide, pres, rightColumn.blocks || [], y, { marginX: rightX, contentW: rightW }, pageIndex);
}

function build(contentPath, outputPath) {
  const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
  const pres = new pptxgen();
  pres.defineLayout({ name: 'A4_PORTRAIT', width: PAGE_W, height: PAGE_H });
  pres.layout = 'A4_PORTRAIT';
  pres.author = 'Global Citizen Solutions';
  pres.title = content.title || 'GCS Brochure';

  let pageIndex = 1;
  for (const pageDef of content.pages) {
    if (pageDef.type === 'cover-gcs') {
      addCoverGCS(pres, pageDef);
    } else if (pageDef.type === 'cover-giu') {
      addCoverGIU(pres, pageDef);
    } else if (pageDef.type === 'back-cover') {
      addBackCover(pres);
    } else if (pageDef.type === 'content') {
      buildContentPage(pres, pageDef, pageIndex);
      pageIndex += 1;
    } else if (pageDef.type === 'content-2col') {
      buildTwoColumnPage(pres, pageDef, pageIndex);
      pageIndex += 1;
    } else if (pageDef.type === 'content-2col-stack') {
      buildDualStackPage(pres, pageDef, pageIndex);
      pageIndex += 1;
    } else {
      throw new Error(`Unknown page type "${pageDef.type}"`);
    }
  }

  return pres.writeFile({ fileName: outputPath }).then(() => {
    console.log(`Wrote ${outputPath}`);
  });
}

if (require.main === module) {
  const [, , contentArg, outputArg] = process.argv;
  if (!contentArg || !outputArg) {
    console.error('Usage: node scripts/build-brochure.js content.json output.pptx');
    process.exit(1);
  }
  build(path.resolve(contentArg), path.resolve(outputArg)).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { build };
