// Auto-generated. Per-entity form-enhancements config for "KI-Interaktionen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["zweck", "vorhaben", "bewertung", "zeitpunkt", "werkzeug", {"row": ["pruefer_vorname", "pruefer_nachname"]}, "informationen", "eingabe", "ki_ergebnis", "korrekturen"],
  defaults: {
    'zeitpunkt': { kind: 'today', withTime: true },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
