#!/usr/bin/env node
/**
 * CLI orchestrator for template mode. Wraps: props.json -> mapPropsToBlocks()
 * -> scratch content.json -> prepare-assets.py (resolves any flagIso2/icon
 * refs to PNG paths) -> build-brochure.js's build(). See SKILL.md step 1b/4.
 *
 * Usage: node scripts/build-from-template.js <template-name> props.json output.pptx
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const { mapPropsToBlocks } = require('./template-registry');
const { build } = require('./build-brochure');

function buildFromTemplate(templateName, propsPath, outputPath) {
  const props = JSON.parse(fs.readFileSync(propsPath, 'utf8'));
  const content = mapPropsToBlocks(templateName, props);

  const scratchPath = `${outputPath}.content.json`;
  fs.writeFileSync(scratchPath, JSON.stringify(content, null, 2));
  console.log(`Wrote scratch content.json -> ${scratchPath}`);

  execFileSync('python3', [path.join(__dirname, 'prepare-assets.py'), scratchPath], { stdio: 'inherit' });

  return build(scratchPath, outputPath);
}

if (require.main === module) {
  const [, , templateArg, propsArg, outputArg] = process.argv;
  if (!templateArg || !propsArg || !outputArg) {
    console.error('Usage: node scripts/build-from-template.js <template-name> props.json output.pptx');
    process.exit(1);
  }
  buildFromTemplate(templateArg, path.resolve(propsArg), path.resolve(outputArg)).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { buildFromTemplate };
