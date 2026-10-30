import { uid } from '../util.js';
import heading from './heading.js';
import pageBreak from './pageBreak.js';
import narrative from './narrative.js';
import sections from './sections.js';
import pullQuote from './pullQuote.js';
import overview from './overview.js';
import titleBanner from './titleBanner.js';
import figures from './figures.js';
import benefits from './benefits.js';
import options from './options.js';
import steps from './steps.js';
import articles from './articles.js';

const DEFS = [titleBanner, heading, narrative, overview, sections, pullQuote, figures, benefits, options, steps, articles, pageBreak];   // new blocks register here
const BY_TYPE = new Map(DEFS.map(d => [d.type, d]));
const GROUPS = ['Texto', 'Números', 'Listas', 'Estrutura'];

export const get = type => BY_TYPE.get(type);
export const all = () => [...DEFS];

export function list() {
  return GROUPS.map(group => ({ group, blocks: DEFS.filter(d => d.group === group) })).filter(g => g.blocks.length);
}

export function makeBlock(type, overrides = {}, used = new Set()) {
  const def = BY_TYPE.get(type);
  if (!def) throw new Error(`Unknown block type: ${type}`);
  return { id: uid(used), type, props: { ...def.defaults(), ...overrides } };
}
