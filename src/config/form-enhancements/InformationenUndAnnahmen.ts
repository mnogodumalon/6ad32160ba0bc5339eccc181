// Auto-generated. Per-entity form-enhancements config for "Informationen und Annahmen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["bezeichnung", "vorhaben", "art", {"row": ["pruefstatus", "vertrauensgrad"], "cols": "1fr 1fr"}, "inhalt", "quelle", {"row": ["zustaendig_vorname", "zustaendig_nachname"]}, "gueltig_bis", "pruefhinweis"],
  defaults: {
    'art': { kind: 'lookup', key: 'information', label: 'Information' },
    'pruefstatus': { kind: 'lookup', key: 'ungeprueft', label: 'Ungeprüft' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
