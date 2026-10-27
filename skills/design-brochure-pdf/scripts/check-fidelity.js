#!/usr/bin/env node
/**
 * Fidelity gate for composed brochures — run this AFTER populating/composing
 * the final HTML and BEFORE rendering the PDF. Enforces two sets of rules:
 *
 * Content fidelity (requires --source + --html):
 *   1. No residual `{{ field }}` tokens in the output.
 *   2. No template sample text: none of the template's built-in defaults
 *      (the `?? '...'` strings in its dc-script renderVals block) may appear
 *      in the output's visible text. Only defaults >= 20 chars are checked,
 *      so short generic values ("2026", "Complete") don't false-positive.
 *   3. Source coverage, verbatim: every text segment of the user's source
 *      content (sentences/lines of >= 4 words) must appear verbatim in the
 *      output's visible text (whitespace-normalised comparison only).
 *
 * Design token lint (requires --design-lint + --html):
 *   4. Palette fidelity: every hex colour in inline styles and <style> blocks
 *      must be from the approved GCS palette.
 *   5. Font fidelity: every font-family declaration must use only Heebo, Yrsa,
 *      or JetBrains Mono (generic fallbacks are allowed).
 *   6. Component catalog: every data-component value on content pages must be
 *      from the approved component library; no invented components.
 *   7. Asset integrity: every local <img src> / CSS url() reference must
 *      resolve to a file that actually exists (fixed skill assets resolved
 *      against the skill root, everything else against the HTML's own
 *      directory) -- catches the class of bug where a missing font, logo,
 *      cover background, or fetched icon/flag degrades silently at render
 *      time into invisible text or a broken-image glyph instead of failing.
 *
 * Usage:
 *   node check-fidelity.js --source <content.txt|md> --html <final.html> [--template <Template.dc.html>]
 *   node check-fidelity.js --design-lint --html <final.html>
 *   node check-fidelity.js --source <content.txt|md> --html <final.html> --design-lint
 *
 * Exit codes: 0 = all checks pass, 1 = usage error, 3 = failures.
 */

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { source: null, html: null, template: null, designLint: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--source') args.source = argv[++i];
    else if (argv[i] === '--html') args.html = argv[++i];
    else if (argv[i] === '--template') args.template = argv[++i];
    else if (argv[i] === '--design-lint') args.designLint = true;
    else {
      process.stderr.write(`Unknown argument: ${argv[i]}\n`);
      process.exit(1);
    }
  }
  return args;
}

const FIELD_TOKEN = /\{\{\s*([A-Za-z0-9_$]+)\s*\}\}/g;

// Collapse all whitespace and normalise the handful of characters that
// legitimately change shape between a source doc and rendered HTML.
function normalise(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Visible text of an HTML document: drop script/style bodies, then tags.
// Returns two variants: tags replaced by a space (block boundaries keep words
// apart) and tags removed outright (inline tags like <a>text</a>. keep
// punctuation attached) — a segment counts as present if found in either.
function visibleText(html) {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
  return {
    spaced: normalise(stripped.replace(/<[^>]+>/g, ' ')),
    tight: normalise(stripped.replace(/<[^>]+>/g, '')),
  };
}

// Extract the template's built-in sample defaults from its dc-script block:
// every `?? '...'` fallback in renderVals, plus every `"default": "..."` in
// the data-props JSON.
function templateDefaults(templateHtml) {
  const defaults = new Set();
  const dc = templateHtml.match(/<script type="text\/x-dc"[\s\S]*?<\/script>/);
  if (!dc) return defaults;
  const block = dc[0];
  const fallback = /\?\?\s*'((?:[^'\\]|\\.)*)'/g;
  let m;
  while ((m = fallback.exec(block)) !== null) {
    defaults.add(normalise(m[1].replace(/\\'/g, "'").replace(/\\n/g, ' ')));
  }
  const propDefault = /&quot;default&quot;:\s*&quot;((?:[^&]|&(?!quot;))*?)&quot;/g;
  while ((m = propDefault.exec(block)) !== null) {
    defaults.add(normalise(m[1]));
  }
  return defaults;
}

// Split source content into checkable segments: markdown syntax stripped
// lightly, then sentence/line pieces of >= 4 words.
function sourceSegments(sourceText) {
  const cleaned = sourceText
    .replace(/^```[\s\S]*?^```/gm, ' ')       // fenced code blocks: skip
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')     // images: skip
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 $2') // links: anchor + URL must both survive
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')        // heading markers
    .replace(/^\s{0,3}[-*+]\s+/gm, '')         // list bullets
    .replace(/^\s{0,3}\d+[.)]\s+/gm, '')       // numbered lists
    .replace(/^\s{0,3}>\s?/gm, '')             // blockquotes
    .replace(/\|/g, '\n')                      // table cells become lines
    .replace(/^[\s:-]+$/gm, '')                // table separator rows
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1');

  const segments = new Set();
  for (const line of cleaned.split(/\n+/)) {
    // Split long lines on sentence ends, keep the pieces reasonably sized.
    const pieces = line.split(/(?<=[.!?])\s+(?=[A-ZÀ-Þ0-9€$"'(])/);
    for (const piece of pieces) {
      const seg = normalise(piece);
      if (seg.split(' ').length >= 4) segments.add(seg);
    }
  }
  return Array.from(segments);
}

// ── Design-token lint helpers ─────────────────────────────────────────────

// Approved GCS palette — all hex values that may appear in brochure styles.
const APPROVED_HEX = new Set([
  '#000957', '#3d51e8', '#16182a', '#4b4e65',
  '#6f7185', '#9b9cad', '#ecedf5', '#e0e2ea',
  '#c6c8d5', '#f7f8fd', '#f2f3fe', '#fafbff',
  '#000b2e', '#0f1a2d', '#b3b5cd', '#ffffff',
  '#3f8cff', '#7b8fff',
  // Common neutrals used in rgba() bases:
  '#000000',
  // Page/wrapper chrome colours present in templates and assembled brochures:
  '#dde0e8', // body wrapper background (preview mode)
  '#caccd8', // TOC folio page numbers (lighter muted grey)
  // Badge-chip status colours (.gc-badge[data-level]) — semantic green/amber/red
  // pairs shipped by components/table-ranking.html and the reference template
  // templates/brochures/giu-corporate/GiuCorporate.dc.html:35-37.
  '#e8f7ee', '#15803d', // green  — active/open
  '#fdf3e3', '#b45309', // amber  — pending/conditional
  '#fdebeb', '#b91c1c', // red    — closed/suspended
]);

// Expand 3-digit short hex to 6-digit and lowercase.
function normaliseHex(raw) {
  const h = raw.toLowerCase();
  if (h.length === 4) {
    return '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  }
  return h;
}

// Approved font families (lowercase, strip quotes).
const APPROVED_FONTS = new Set(['heebo', 'yrsa', 'jetbrains mono']);
// Generic fallbacks and system fonts that are always allowed.
const ALLOWED_FONT_GENERICS = new Set([
  'sans-serif', 'serif', 'monospace', 'system-ui',
  'helvetica neue', 'helvetica', 'arial',
  '-apple-system', 'blinkmacsystemfont',
]);

// Approved data-component values.
const APPROVED_COMPONENTS = new Set([
  'toc', 'narrative', 'pull-quote',
  'stat-strip-dark', 'stat-strip-light',
  'hero-image', 'table-ranking', 'timeline',
  'bio-card', 'article-list', 'month-grid', 'cta-panel',
]);

// Check 7: the back cover must be pasted verbatim from assets/covers/back-cover.html.
// Back cover is always the last [data-doc-page] block in assembled.html (per
// SKILL.md step 4), so once we find its opening tag we can safely take the
// rest of the document as its content.
function runBackCoverCheck(html, failures) {
  const canonicalPath = path.join(__dirname, '..', 'assets', 'covers', 'back-cover.html');
  if (!fs.existsSync(canonicalPath)) return;
  const canonicalRaw = fs.readFileSync(canonicalPath, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const canonicalText = visibleText(canonicalRaw);

  const openTagRe = /<div[^>]+data-doc-page[^>]+data-back-cover[^>]*>/;
  const match = openTagRe.exec(html);
  if (!match) {
    failures.push(
      'BACK COVER MISSING — no [data-doc-page] with data-back-cover found in the output.\n' +
      '  Paste assets/covers/back-cover.html verbatim as the last page of the brochure.'
    );
    return;
  }

  const assembledSlice = html.slice(match.index);
  const assembledText = visibleText(assembledSlice);

  if (assembledText.tight !== canonicalText.tight) {
    failures.push(
      'BACK COVER DOES NOT MATCH assets/covers/back-cover.html\n' +
      `  Expected (verbatim, ${canonicalText.tight.length} chars):\n    "${canonicalText.tight.slice(0, 200)}${canonicalText.tight.length > 200 ? '…' : ''}"\n` +
      `  Found in output (${assembledText.tight.length} chars):\n    "${assembledText.tight.slice(0, 200)}${assembledText.tight.length > 200 ? '…' : ''}"\n` +
      '  The back cover must be copied unchanged from assets/covers/back-cover.html — no substitution, no truncation.'
    );
  }
}

// Check: every local asset reference (img src, CSS url()) must resolve to an
// existing file. A broken relative path degrades silently at render time --
// a missing cover background photo leaves cover text nearly invisible against
// the wrong fallback background, a missing icon/flag shows as a broken-image
// glyph -- instead of failing loudly here, before the PDF is ever generated.
// Fixed skill assets (fonts/logos/cover backgrounds under assets/) are
// resolved against the skill root, same as scripts/html-to-pdf.js does at
// render time; everything else (e.g. a flag/icon PNG fetched into the working
// folder) is resolved relative to the HTML file's own directory.
// Fixed skill-asset reference patterns -- mirrors scripts/html-to-pdf.js's
// rewriteSkillAssetPaths, which resolves exactly these against the skill
// root regardless of where the rendered HTML lives. Kept in sync deliberately:
// this check must validate against the same base the renderer will actually use.
const FIXED_FONT_LOGO_RE = /^\.\.\/(fonts|logos)\/[^/]+$/;
const FIXED_COVER_BG_RE = /^\.\/background-cover-(?:gcs|giu)\.png$/;

function runAssetIntegrityCheck(html, htmlPath, failures) {
  const skillRoot = path.join(__dirname, '..');
  const htmlDir = path.dirname(path.resolve(htmlPath));
  const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '');

  const missing = new Set();
  const checkRef = (ref) => {
    if (/^(https?:|data:|file:|#)/i.test(ref)) return; // remote, inline, or anchor -- skip
    let resolved;
    const fontLogoMatch = FIXED_FONT_LOGO_RE.exec(ref);
    if (fontLogoMatch) {
      resolved = path.join(skillRoot, 'assets', fontLogoMatch[1], path.basename(ref));
    } else if (FIXED_COVER_BG_RE.test(ref)) {
      resolved = path.join(skillRoot, 'assets', 'covers', ref.replace(/^\.\//, ''));
    } else if (ref.startsWith('/')) {
      resolved = path.join(skillRoot, ref);
    } else {
      resolved = path.resolve(htmlDir, ref);
    }
    if (!fs.existsSync(resolved)) missing.add(`"${ref}" -> ${resolved}`);
  };

  const imgSrcRe = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = imgSrcRe.exec(cleanHtml)) !== null) checkRef(m[1]);

  const urlRe = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
  while ((m = urlRe.exec(cleanHtml)) !== null) checkRef(m[1]);

  if (missing.size > 0) {
    failures.push(
      `ASSET INTEGRITY VIOLATION -- local asset reference(s) that do not resolve to an existing file (${missing.size}):\n` +
      Array.from(missing).map((r) => `  - ${r}`).join('\n') +
      '\n  Fix the path, or fetch/copy the missing file, before rendering the PDF -- a broken reference fails silently at render time (invisible text, broken-image icon) instead of erroring here.'
    );
  }
}

function runDesignLint(html, failures) {
  // Strip HTML comments before analysis so commented-out variants don't fire.
  const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '');

  // ── Check 4: Palette fidelity ─────────────────────────────────────────
  // Collect all hex colours from inline style attributes and <style> blocks.
  const styleContent = [];
  const styleBlock = /<style[\s\S]*?<\/style>/gi;
  let m;
  while ((m = styleBlock.exec(cleanHtml)) !== null) styleContent.push(m[0]);
  const inlineStyle = /style\s*=\s*"[^"]*"/gi;
  while ((m = inlineStyle.exec(cleanHtml)) !== null) styleContent.push(m[0]);

  const hexRe = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g;
  const badHex = new Set();
  for (const block of styleContent) {
    hexRe.lastIndex = 0;
    while ((m = hexRe.exec(block)) !== null) {
      const norm = normaliseHex(m[0]);
      if (!APPROVED_HEX.has(norm)) badHex.add(norm);
    }
  }
  if (badHex.size > 0) {
    failures.push(
      `PALETTE VIOLATION — unapproved hex colour(s) (${badHex.size}):\n` +
      Array.from(badHex).map((h) => `  - ${h}`).join('\n') +
      '\n  Only approved GCS palette tokens are permitted in brochure styles.'
    );
  }

  // ── Check 5: Font fidelity ────────────────────────────────────────────
  const fontFamilyRe = /font-family\s*:\s*([^;}"]+)/gi;
  const badFonts = new Set();
  for (const block of styleContent) {
    fontFamilyRe.lastIndex = 0;
    while ((m = fontFamilyRe.exec(block)) !== null) {
      const families = m[1].split(',').map((f) =>
        f.trim().replace(/^['"]|['"]$/g, '').toLowerCase()
      );
      for (const fam of families) {
        if (!APPROVED_FONTS.has(fam) && !ALLOWED_FONT_GENERICS.has(fam)) {
          badFonts.add(fam);
        }
      }
    }
  }
  if (badFonts.size > 0) {
    failures.push(
      `FONT VIOLATION — unapproved font-family value(s) (${badFonts.size}):\n` +
      Array.from(badFonts).map((f) => `  - "${f}"`).join('\n') +
      '\n  Only Heebo, Yrsa, and JetBrains Mono are permitted.'
    );
  }

  // ── Check 6: Component catalog ────────────────────────────────────────
  // Find all data-component values that appear outside of cover/back-cover pages.
  // Strategy: remove all cover and back-cover page blocks, then scan for data-component.
  // We use a regex that matches [data-doc-page] divs with data-cover or data-back-cover.
  // This is an approximation — it strips the page block by matching the outermost div open.
  let scanHtml = cleanHtml;

  // Remove cover/back-cover page content blocks (everything from the opening
  // data-doc-page div that has data-cover/data-back-cover through its paired closing div).
  // Approach: strip opening tags containing these attributes; the component check
  // only tests values found in the remaining markup.
  const coverPageRe = /<div[^>]+data-doc-page[^>]+data-(?:cover|back-cover)[^>]*>[\s\S]*?(?=<div[^>]+data-doc-page|$)/g;
  scanHtml = scanHtml.replace(coverPageRe, '');

  const componentRe = /data-component\s*=\s*["']([^"']+)["']/g;
  const badComponents = new Set();
  while ((m = componentRe.exec(scanHtml)) !== null) {
    if (!APPROVED_COMPONENTS.has(m[1])) {
      badComponents.add(m[1]);
    }
  }
  if (badComponents.size > 0) {
    failures.push(
      `COMPONENT CATALOG VIOLATION — unlisted data-component value(s) (${badComponents.size}):\n` +
      Array.from(badComponents).map((c) => `  - "${c}"`).join('\n') +
      '\n  Allowed: ' + Array.from(APPROVED_COMPONENTS).join(', ') + '.'
    );
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const runContent = !!(args.source && args.html);
  const runLint = args.designLint && !!args.html;

  if (!runContent && !runLint) {
    process.stderr.write(
      'Usage:\n' +
      '  check-fidelity.js --source <content.txt|md> --html <final.html> [--template <Template.dc.html>]\n' +
      '  check-fidelity.js --design-lint --html <final.html>\n' +
      '  check-fidelity.js --source <content.txt|md> --html <final.html> --design-lint\n'
    );
    process.exit(1);
  }

  const html = fs.readFileSync(path.resolve(args.html), 'utf8');
  const failures = [];

  if (runContent) {
    const source = fs.readFileSync(path.resolve(args.source), 'utf8');
    const text = visibleText(html);
    const sourceNorm = normalise(source);
    const found = (seg) => text.spaced.includes(seg) || text.tight.includes(seg);

    // 1. Residual tokens
    const tokens = new Set();
    let m;
    FIELD_TOKEN.lastIndex = 0;
    while ((m = FIELD_TOKEN.exec(html)) !== null) tokens.add(m[1]);
    if (tokens.size > 0) {
      failures.push(`RESIDUAL TOKENS (${tokens.size}): ${Array.from(tokens).join(', ')}`);
    }

    // 2. Template sample text
    if (args.template) {
      const templateHtml = fs.readFileSync(path.resolve(args.template), 'utf8');
      const leaked = Array.from(templateDefaults(templateHtml))
        .filter((d) => d.length >= 20 && !sourceNorm.includes(d) && found(d));
      if (leaked.length > 0) {
        failures.push(
          `TEMPLATE SAMPLE TEXT LEAKED (${leaked.length}):\n` +
          leaked.map((d) => `  - "${d.slice(0, 100)}${d.length > 100 ? '…' : ''}"`).join('\n')
        );
      }
    } else {
      process.stderr.write('NOTE: --template not given; sample-text check skipped.\n');
    }

    // 3. Source coverage
    const segments = sourceSegments(source);
    const missing = segments.filter((s) => !found(s));
    if (missing.length > 0) {
      failures.push(
        `SOURCE TEXT MISSING OR ALTERED (${missing.length} of ${segments.length} segments):\n` +
        missing.map((s) => `  - "${s.slice(0, 120)}${s.length > 120 ? '…' : ''}"`).join('\n')
      );
    }
  }

  // 4–7. Design token lint + asset integrity
  if (runLint) {
    runDesignLint(html, failures);
    runBackCoverCheck(html, failures);
    runAssetIntegrityCheck(html, args.html, failures);
  }

  if (failures.length > 0) {
    process.stdout.write('FIDELITY CHECK FAILED\n\n' + failures.join('\n\n') + '\n');
    process.stdout.write('\nFix the HTML (do not export the PDF) and re-run this check.\n');
    process.exit(3);
  }

  const parts = [];
  if (runContent) {
    const segments = sourceSegments(fs.readFileSync(path.resolve(args.source), 'utf8'));
    parts.push(`${segments.length} source segments verified verbatim, no residual tokens` +
      (args.template ? ', no template sample text' : ''));
  }
  if (runLint) parts.push('palette OK, fonts OK, component catalog OK');
  process.stdout.write('FIDELITY CHECK PASSED — ' + parts.join('; ') + '.\n');
}

main();
