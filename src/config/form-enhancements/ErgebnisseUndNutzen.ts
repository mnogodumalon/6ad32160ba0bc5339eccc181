// Auto-generated. Per-entity form-enhancements config for "Ergebnisse und Nutzen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["vorhaben", "ergebnisbeschreibung", {"row": ["datum", "qualitaet"], "cols": "1fr 1fr"}, "entscheidung", "anzahl_fehler", {"row": ["bearbeitungszeit_stunden", "nacharbeit_stunden"], "cols": "1fr 1fr"}, "nutzen", "nachweis"],
  defaults: {
    'datum': { kind: 'today' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
