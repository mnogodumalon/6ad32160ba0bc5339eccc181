// The orchestrator's plan, as far as the running app needs it
// (docs/orchestrator/SPEC.md). Generated — do not edit; regenerated on every
// build and update from the stored plan. Without a plan every map is empty.
//
//   SYSTEM_ASSIGNED entity → fields a tool fills when a record is CREATED — the
//                   value does not exist before; dialogs hide these on create and
//                   the form-polish sets no default on them. A scheduled or
//                   update-triggered tool owns its field but is NOT in here.
//   PLAN_SENTENCES  slug → the plan in the owner's words (flows' field page)
//
// The runtime write guard (FLOW_WRITES/OWNERSHIP, planGuard.ts) left on
// 23.09.2026: a flow page composes against its generated hook, whose submit
// plan IS the Schreibliste — there is no way to spell a write outside it.

export const SYSTEM_ASSIGNED: Record<string, string[]> = {};

export const PLAN_SENTENCES: Record<string, string[]> = {
  "vorhaben-anlegen": [
    "Legt an: vorhaben",
    "Automatisch: status (fester Wert „geplant“)"
  ],
  "information-erfassen": [
    "Legt an: informationen_und_annahmen",
    "Automatisch: pruefstatus (fester Wert „ungeprueft“)"
  ],
  "information-pruefen": [
    "Ändert: informationen_und_annahmen"
  ],
  "ki-interaktion-dokumentieren": [
    "Legt an: ki_interaktionen",
    "Automatisch: zeitpunkt (aktueller Zeitpunkt, automatisch)"
  ],
  "entscheidung-festhalten": [
    "Legt an: entscheidungen_und_freigaben",
    "Automatisch: datum (heutiges Datum, automatisch)"
  ],
  "ergebnis-nachweisen": [
    "Legt an: ergebnisse_und_nutzen",
    "Automatisch: datum (heutiges Datum, automatisch)"
  ]
};

export const PLAN_SUMMARY = "Die Anwendung verbindet jede KI-Nutzung mit der tatsächlichen Arbeit. Im Mittelpunkt steht das Vorhaben mit Problem, Zielbild und Verantwortlichen. Dazu kommen die genutzten Informationen und Annahmen, die KI-Interaktionen mit menschlicher Bewertung, Entscheidungen und Freigaben, Ergebnisse mit nachweisbarem Nutzen und geprüfte Erkenntnisse für künftige Aufgaben. So bleibt nachvollziehbar, wer was verantwortet hat, und Erfahrung wird erst nach Prüfung wiederverwendet.";

/** slug → the lists a flow writes (the plan's Schreibliste). The nav leaves a
 *  flow out for a user who may not write one of them (lib/permissions.ts). */
export const FLOW_ENTITIES: Record<string, string[]> = {
  "vorhaben-anlegen": [
    "vorhaben"
  ],
  "information-erfassen": [
    "informationen_und_annahmen"
  ],
  "information-pruefen": [
    "informationen_und_annahmen"
  ],
  "ki-interaktion-dokumentieren": [
    "ki_interaktionen"
  ],
  "entscheidung-festhalten": [
    "entscheidungen_und_freigaben"
  ],
  "ergebnis-nachweisen": [
    "ergebnisse_und_nutzen"
  ]
};
