/**
 * Shared props validation for template mappers.
 *
 * `required` keys must be non-empty or the build throws (copy is never
 * invented, so a missing key can't be papered over). `slots` are keys the
 * template has a fixed place for but that may legitimately be left out — a
 * blank one only warns, since the block quietly renders without it.
 */
function checkProps(template, props, required, slots = []) {
  const blank = (k) => props[k] == null || String(props[k]).trim() === '';
  const missing = required.filter(blank);
  if (missing.length) {
    throw new Error(
      `${template}: missing required props: ${missing.join(', ')}. The template renders every one of these; ` +
      `supply them (verbatim copy) — nothing is filled in for you.`
    );
  }
  const empty = slots.filter(blank);
  if (empty.length) {
    console.warn(`WARNING (${template}): optional slots left empty, rendered without them: ${empty.join(', ')}`);
  }
}

module.exports = { checkProps };
