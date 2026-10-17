/**
 * Required-field messages — WRITTEN BY THE BUILD AGENT, never by a heuristic.
 *
 * The layer knows two things about an empty required field: that it is
 * required and what its label is. Out of that it can only say „„Anreise" ist
 * ein Pflichtfeld". What the person should do instead („Bitte einen Gast
 * auswählen.") is meaning, and meaning is the agent's: the Phase-2 orchestrator
 * writes one short instruction per required field — what is needed, not why — to
 * `.intents-staging/messages.json`, the integration step validates it against
 * the app metadata and renders it into the block below. Scaffold updates keep
 * the block. Do not edit outside the markers.
 *
 * Every door reads this and nothing else: `useStepForm` (flows and public
 * pages), the generated {Entity}Dialog and the public form's server-error line.
 * A field without a sentence falls back to the label sentence — never to a
 * bare „Dieses Feld ist erforderlich".
 *
 * Required fields per entity (from the base view):
 *   - vorhaben: titel (Titel des Vorhabens), problem (Problembeschreibung), verantwortlich_vorname (Verantwortliche Person – Vorname), verantwortlich_nachname (Verantwortliche Person – Nachname), status (Status)
 *   - informationen_und_annahmen: vorhaben (Vorhaben), bezeichnung (Bezeichnung), art (Art), inhalt (Inhalt), pruefstatus (Prüfstatus)
 *   - ki_interaktionen: vorhaben (Vorhaben), zweck (Zweck), bewertung (Menschliche Bewertung)
 *   - entscheidungen_und_freigaben: vorhaben (Vorhaben), entscheidung (Entscheidung), entscheidungsart (Art), verantwortlich_vorname (Verantwortliche Person – Vorname), verantwortlich_nachname (Verantwortliche Person – Nachname)
 *   - ergebnisse_und_nutzen: vorhaben (Vorhaben), ergebnisbeschreibung (Ergebnisbeschreibung)
 *   - erkenntnisse: vorhaben (Vorhaben), titel (Titel der Erkenntnis), beschreibung (Beschreibung der Erfahrung), qualitaetsstatus (Qualitätsstatus)
 */
import { t, tx } from '@/i18n';
import { labelOf, type EntityKey } from './rules';

/** The writable fields of each entity — the keys a message may address (generated). */
export interface MessageFields {
  "vorhaben": "titel" | "problem" | "zielbild" | "erfolgskriterien" | "verantwortlich_vorname" | "verantwortlich_nachname" | "bereich" | "status" | "startdatum" | "zieldatum";
  "informationen_und_annahmen": "vorhaben" | "bezeichnung" | "art" | "inhalt" | "quelle" | "zustaendig_vorname" | "zustaendig_nachname" | "gueltig_bis" | "pruefstatus" | "vertrauensgrad" | "pruefhinweis";
  "ki_interaktionen": "vorhaben" | "zeitpunkt" | "werkzeug" | "zweck" | "eingabe" | "informationen" | "ki_ergebnis" | "bewertung" | "korrekturen" | "pruefer_vorname" | "pruefer_nachname";
  "entscheidungen_und_freigaben": "vorhaben" | "ki_interaktion" | "entscheidung" | "entscheidungsart" | "begruendung" | "alternativen" | "verantwortlich_vorname" | "verantwortlich_nachname" | "datum" | "freigabestatus";
  "ergebnisse_und_nutzen": "vorhaben" | "entscheidung" | "ergebnisbeschreibung" | "datum" | "qualitaet" | "anzahl_fehler" | "nacharbeit_stunden" | "bearbeitungszeit_stunden" | "nutzen" | "nachweis";
  "erkenntnisse": "vorhaben" | "ergebnis" | "titel" | "beschreibung" | "erkenntnisart" | "anwendungsbereich" | "anwendbarkeit" | "einschraenkungen" | "qualitaetsstatus" | "gueltig_bis" | "pruefer_vorname" | "pruefer_nachname" | "pruefdatum" | "wiederverwendung";
}
export type MessageFieldKey<E extends EntityKey> = E extends keyof MessageFields ? MessageFields[E] : never;

export const REQUIRED_MESSAGES: { [E in EntityKey]?: Partial<Record<MessageFieldKey<E>, string>> } = {
  // <custom:messages>
  vorhaben: { titel: "Bitte einen Titel eingeben.", problem: "Bitte das Problem beschreiben.", verantwortlich_vorname: "Bitte den Vornamen der verantwortlichen Person eingeben.", verantwortlich_nachname: "Bitte den Nachnamen der verantwortlichen Person eingeben.", status: "Bitte einen Status wählen." },
  informationen_und_annahmen: { vorhaben: "Bitte ein Vorhaben auswählen.", bezeichnung: "Bitte eine Bezeichnung eingeben.", art: "Bitte Information oder Annahme wählen.", inhalt: "Bitte den Inhalt beschreiben.", pruefstatus: "Bitte einen Prüfstatus wählen." },
  ki_interaktionen: { vorhaben: "Bitte ein Vorhaben auswählen.", zweck: "Bitte den Zweck der KI-Nutzung eingeben.", bewertung: "Bitte die menschliche Bewertung wählen." },
  entscheidungen_und_freigaben: { vorhaben: "Bitte ein Vorhaben auswählen.", entscheidung: "Bitte die Entscheidung eingeben.", entscheidungsart: "Bitte die Art wählen.", verantwortlich_vorname: "Bitte den Vornamen der verantwortlichen Person eingeben.", verantwortlich_nachname: "Bitte den Nachnamen der verantwortlichen Person eingeben." },
  ergebnisse_und_nutzen: { vorhaben: "Bitte ein Vorhaben auswählen.", ergebnisbeschreibung: "Bitte das Ergebnis beschreiben." },
  erkenntnisse: { vorhaben: "Bitte ein Vorhaben auswählen.", titel: "Bitte einen Titel eingeben.", beschreibung: "Bitte die Erfahrung beschreiben.", qualitaetsstatus: "Bitte einen Qualitätsstatus wählen." },
  // </custom:messages>
};

/** The sentence shown when `key` of `entity` is required and empty — the
 *  agent's own text (translated at runtime like every page string), else the
 *  label sentence. Call it while rendering, not at module scope. */
export function requiredMessage(entity: EntityKey, key: string): string {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  if (own && own.trim()) return tx(own);
  return t('v_required', { label: labelOf(entity, key) });
}

/** True when the agent wrote a sentence for the field. */
export function hasOwnMessage(entity: EntityKey, key: string): boolean {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  return Boolean(own && own.trim());
}
