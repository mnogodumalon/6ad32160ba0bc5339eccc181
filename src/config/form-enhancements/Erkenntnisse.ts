// Auto-generated. Per-entity form-enhancements config for "Erkenntnisse".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["titel", "vorhaben", {"row": ["qualitaetsstatus", "erkenntnisart"], "cols": "1fr 1fr"}, "ergebnis", "anwendungsbereich", {"row": ["pruefer_vorname", "pruefer_nachname"]}, {"row": ["pruefdatum", "gueltig_bis"], "cols": "1fr 1fr"}, "beschreibung", "anwendbarkeit", "einschraenkungen", "wiederverwendung"],
  defaults: {
    'qualitaetsstatus': { kind: 'lookup', key: 'entwurf', label: 'Entwurf' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
