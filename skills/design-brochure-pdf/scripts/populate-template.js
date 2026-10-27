#!/usr/bin/env node
/**
 * Populates one of this repo's branded `.dc.html` templates with real content
 * and flattens it into a self-contained static HTML file.
 *
 * The `{{ fieldName }}` tokens inside each template's .dc.html file sit directly in the
 * visible markup (not inside the React "dc-runtime" that also ships with each
 * template), so this script does a plain string substitution pass rather than
 * booting a browser — no local Chrome, no static file server, and no network
 * dependency on unpkg.com/React the old dc-runtime pipeline required.
 *
 * After substitution, the dc-runtime itself is stripped entirely (the
 * `<script src="./support.js">`/`<script src="./ds-base.js">` loaders, the
 * trailing `<script type="text/x-dc" data-dc-script>` block, and the
 * `<x-dc>`/`<helmet>` wrapper tags), leaving plain static HTML with zero JS
 * and zero dependency beyond the Google Fonts <link> each template already
 * has in its <head>. That flat HTML is what `html-to-pdf.js` renders.
 *
 * Usage:
 *   node populate-template.js --template <path/to/Template.dc.html> --props <path/to/props.json> --out <path/to/output.html>
 *   node populate-template.js --template <path/to/Template.dc.html> --list-fields
 */

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { template: null, props: null, out: null, listFields: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--template') args.template = argv[++i];
    else if (arg === '--props') args.props = argv[++i];
    else if (arg === '--out') args.out = argv[++i];
    else if (arg === '--list-fields') args.listFields = true;
    else {
      process.stderr.write(`Unknown argument: ${arg}\n`);
      process.exit(1);
    }
  }
  return args;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const FIELD_TOKEN = /\{\{\s*([A-Za-z0-9_$]+)\s*\}\}/g;

function findFields(html) {
  const fields = new Set();
  let match;
  FIELD_TOKEN.lastIndex = 0;
  while ((match = FIELD_TOKEN.exec(html)) !== null) {
    fields.add(match[1]);
  }
  return Array.from(fields).sort();
}

function substituteFields(html, props) {
  const replaced = new Set();
  const missing = new Set();
  const output = html.replace(FIELD_TOKEN, (full, field) => {
    if (Object.prototype.hasOwnProperty.call(props, field)) {
      replaced.add(field);
      return escapeHtml(props[field]);
    }
    missing.add(field);
    return full;
  });
  return { output, replaced: Array.from(replaced).sort(), missing: Array.from(missing).sort() };
}

function stripDcRuntime(html) {
  let out = html;
  // Loader scripts (React/support.js and the local design-system-token loader).
  out = out.replace(/<script src="\.\/support\.js"><\/script>\n?/, '');
  out = out.replace(/<script src="\.\/ds-base\.js"><\/script>\n?/, '');
  // Unwrap the custom <x-dc>/<helmet> wrapper tags — keep their children in place.
  out = out.replace(/<\/?x-dc>\n?/g, '');
  out = out.replace(/<\/?helmet>\n?/g, '');
  // Drop the trailing dc-runtime props/logic script block entirely.
  out = out.replace(/<script type="text\/x-dc"[\s\S]*?<\/script>\n?/, '');
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.template) {
    process.stderr.write('Usage: populate-template.js --template <path> (--list-fields | --props <path> --out <path>)\n');
    process.exit(1);
  }

  const templatePath = path.resolve(args.template);
  const html = fs.readFileSync(templatePath, 'utf8');

  if (args.listFields) {
    const fields = findFields(html);
    process.stdout.write(JSON.stringify({ template: templatePath, fields }, null, 2) + '\n');
    return;
  }

  if (!args.props || !args.out) {
    process.stderr.write('Usage: populate-template.js --template <path> --props <path> --out <path>\n');
    process.exit(1);
  }

  const props = JSON.parse(fs.readFileSync(path.resolve(args.props), 'utf8'));
  const { output: substituted, replaced, missing } = substituteFields(html, props);
  const flattened = stripDcRuntime(substituted);

  const outPath = path.resolve(args.out);
  fs.writeFileSync(outPath, flattened, 'utf8');

  if (missing.length > 0) {
    process.stderr.write(
      `WARNING: ${missing.length} field(s) had no matching prop and were left as literal {{ }} tokens: ${missing.join(', ')}\n`
    );
  }

  process.stdout.write(
    JSON.stringify({ template: templatePath, out: outPath, fieldsReplaced: replaced, fieldsMissing: missing }, null, 2) + '\n'
  );

  if (missing.length > 0) {
    process.exit(2);
  }
}

main();
