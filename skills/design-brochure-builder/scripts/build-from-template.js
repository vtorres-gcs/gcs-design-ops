#!/usr/bin/env node
/**
 * CLI orchestrator for template mode. Wraps: props.json -> mapPropsToBlocks()
 * -> scratch content.json (OS temp dir) -> prepare-assets.py (resolves any flagIso2/icon
 * refs to PNG paths) -> build-brochure.js's build(). See SKILL.md step 1b/4.
 *
 * Usage: node scripts/build-from-template.js <template-name> props.json output.pptx
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const { mapPropsToBlocks } = require('./template-registry');
const { build } = require('./build-brochure');

function buildFromTemplate(templateName, propsPath, outputPath) {
  const props = JSON.parse(fs.readFileSync(propsPath, 'utf8'));
  const content = mapPropsToBlocks(templateName, props);

  // Scratch content.json lives in the OS temp dir (not next to the deliverable);
  // set KEEP_SCRATCH=1 to keep it for debugging.
  const scratchDir = fs.mkdtempSync(path.join(os.tmpdir(), 'brochure-'));
  const scratchPath = path.join(scratchDir, 'content.json');
  fs.writeFileSync(scratchPath, JSON.stringify(content, null, 2));

  const cleanup = () => { if (!process.env.KEEP_SCRATCH) fs.rmSync(scratchDir, { recursive: true, force: true }); else console.log(`Scratch content.json kept at ${scratchPath}`); };
  try {
    execFileSync('python3', [path.join(__dirname, 'prepare-assets.py'), scratchPath], { stdio: 'inherit' });
  } catch (err) {
    cleanup();
    throw err;
  }
  return build(scratchPath, outputPath).finally(cleanup);
}

if (require.main === module) {
  const [, , templateArg, propsArg, outputArg] = process.argv;
  if (!templateArg || !propsArg || !outputArg) {
    console.error('Usage: node scripts/build-from-template.js <template-name> props.json output.pptx');
    process.exit(1);
  }
  Promise.resolve()
    .then(() => buildFromTemplate(templateArg, path.resolve(propsArg), path.resolve(outputArg)))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

module.exports = { buildFromTemplate };
