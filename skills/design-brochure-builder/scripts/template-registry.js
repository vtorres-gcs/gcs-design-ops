/**
 * Registry of the six fixed templates/brochures/* templates. Each entry is a
 * pair: <name>.json (propsSchema + page/component summary, extracted from the
 * source .dc.html's data-props — used to present the fixed page map and to
 * validate a props.json) and <name>.js (mapPropsToBlocks(), the pure
 * translation into the plain content.json shape scripts/build-brochure.js
 * already renders — that renderer has zero awareness "template mode" exists).
 *
 * Only case-study is implemented so far; the other five throw a clear
 * "not yet ported" error naming what's missing (see SKILL.md "Scope") rather
 * than silently falling back to free mode.
 */
const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = __dirname + '/templates';

const IMPLEMENTED = ['case-study', 'quarterly-report', 'factsheet'];
const ALL_TEMPLATE_NAMES = ['case-study', 'quarterly-report', 'factsheet', 'giu-calendar', 'giu-corporate', 'lead-magnet'];

function getTemplateSchema(templateName) {
  const schemaPath = path.join(TEMPLATES_DIR, `${templateName}.json`);
  if (!fs.existsSync(schemaPath)) {
    throw new Error(
      `Unknown template "${templateName}". Available: ${ALL_TEMPLATE_NAMES.join(', ')}.`
    );
  }
  return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
}

function mapPropsToBlocks(templateName, props) {
  if (!ALL_TEMPLATE_NAMES.includes(templateName)) {
    throw new Error(`Unknown template "${templateName}". Available: ${ALL_TEMPLATE_NAMES.join(', ')}.`);
  }
  if (!IMPLEMENTED.includes(templateName)) {
    throw new Error(
      `Template "${templateName}" is documented (see scripts/templates/${templateName}.json) but not yet ` +
      `ported to gcs-brochure-builder (implemented so far: ${IMPLEMENTED.join(', ')}). Use free mode, or the ` +
      `gcs-brochure skill (PDF output), for this template today.`
    );
  }
  const mapper = require(path.join(TEMPLATES_DIR, `${templateName}.js`));
  return mapper.mapPropsToBlocks(props);
}

module.exports = { getTemplateSchema, mapPropsToBlocks, ALL_TEMPLATE_NAMES, IMPLEMENTED };
