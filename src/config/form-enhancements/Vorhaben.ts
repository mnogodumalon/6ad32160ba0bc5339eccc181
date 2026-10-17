// Auto-generated. Per-entity form-enhancements config for "Vorhaben".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["titel", {"row": ["verantwortlich_vorname", "verantwortlich_nachname"]}, "status", {"row": ["startdatum", "zieldatum"], "cols": "1fr 1fr"}, "bereich", "problem", "zielbild", "erfolgskriterien"],
  defaults: {
    'status': { kind: 'lookup', key: 'geplant', label: 'Geplant' },
    'startdatum': { kind: 'today' },
  },
  computed: {
    '_vorhaben_dauer_tage': { kind: 'dateDiff', from: 'startdatum', to: 'zieldatum', unit: 'days' },
  },
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
