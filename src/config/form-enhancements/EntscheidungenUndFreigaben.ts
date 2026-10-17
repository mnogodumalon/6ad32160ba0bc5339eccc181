// Auto-generated. Per-entity form-enhancements config for "Entscheidungen und Freigaben".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["entscheidung", "vorhaben", {"row": ["entscheidungsart", "freigabestatus"], "cols": "1fr 1fr"}, {"row": ["verantwortlich_vorname", "verantwortlich_nachname"]}, "datum", "ki_interaktion", "begruendung", "alternativen"],
  defaults: {
    'datum': { kind: 'today' },
    'freigabestatus': { kind: 'lookup', key: 'beantragt', label: 'Beantragt' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
