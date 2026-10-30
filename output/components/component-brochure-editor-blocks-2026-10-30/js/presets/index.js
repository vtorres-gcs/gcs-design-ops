import factsheet from './factsheet.js';
import quarterly from './quarterly.js';

const PRESETS = [factsheet, quarterly];

export const all = () => [...PRESETS];
export const get = id => PRESETS.find(p => p.id === id);
export const SOON = [
  { id: 'case-study', label: 'Case Study' }, { id: 'giu-calendar', label: 'GIU Calendar' },
  { id: 'giu-corporate', label: 'GIU Corporate' }, { id: 'lead-magnet', label: 'Lead Magnet' }
];
