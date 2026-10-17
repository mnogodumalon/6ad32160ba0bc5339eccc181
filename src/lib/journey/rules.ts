/**
 * Field rules — GENERATED from the app metadata. Do not edit.
 *
 * The mechanical truth about every field: what kind it is, whether the
 * platform's base view marks it required, which lookup keys exist, where an
 * applookup points, what the label is. `useStepForm` validates against these
 * rules and phrases its messages with the real labels; `toWirePayload` uses
 * them to shape the create payload; `SHAPES` tells a page which input FORM
 * fits the data (a date pair wants a calendar, not two fields) — it is a
 * signal, not a gate.
 */
import { appLabel, fieldLabel, lookupLabel } from '@/i18n';
import { policyLabel } from './policy';
import { LOOKUP_OPTIONS } from '@/types/app';

export type EntityKey = 'vorhaben' | 'informationen_und_annahmen' | 'ki_interaktionen' | 'entscheidungen_und_freigaben' | 'ergebnisse_und_nutzen' | 'erkenntnisse';

/** The text fields of each entity — what a search may run over (generated;
 *  `never` for an entity without text of its own, e.g. a link table). */
export interface StringFields {
  "vorhaben": "titel" | "problem" | "zielbild" | "erfolgskriterien" | "verantwortlich_vorname" | "verantwortlich_nachname" | "bereich";
  "informationen_und_annahmen": "bezeichnung" | "inhalt" | "quelle" | "zustaendig_vorname" | "zustaendig_nachname" | "pruefhinweis";
  "ki_interaktionen": "werkzeug" | "zweck" | "eingabe" | "ki_ergebnis" | "korrekturen" | "pruefer_vorname" | "pruefer_nachname";
  "entscheidungen_und_freigaben": "entscheidung" | "begruendung" | "alternativen" | "verantwortlich_vorname" | "verantwortlich_nachname";
  "ergebnisse_und_nutzen": "ergebnisbeschreibung" | "nutzen" | "nachweis";
  "erkenntnisse": "titel" | "beschreibung" | "anwendungsbereich" | "anwendbarkeit" | "einschraenkungen" | "pruefer_vorname" | "pruefer_nachname" | "wiederverwendung";
}
export type StringFieldKey<E extends EntityKey> = E extends keyof StringFields ? StringFields[E] : never;

/** The applookup fields of each entity (generated). A pick stored through
 *  `form.set` on one of these must carry its display name — at compile time
 *  (`StepForm.set`), because the review would otherwise show the id. */
export interface RecordFields {
  "vorhaben": never;
  "informationen_und_annahmen": "vorhaben";
  "ki_interaktionen": "vorhaben" | "informationen";
  "entscheidungen_und_freigaben": "vorhaben" | "ki_interaktion";
  "ergebnisse_und_nutzen": "vorhaben" | "entscheidung";
  "erkenntnisse": "vorhaben" | "ergebnis";
}
export type RecordFieldKey<E extends EntityKey> = E extends keyof RecordFields ? RecordFields[E] : never;

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'lookup'
  | 'multilookup'
  | 'record'
  | 'multirecord'
  | 'file'
  | 'geo';

export interface FieldRule {
  key: string;
  fulltype: string;
  kind: FieldKind;
  /** From the app's base view. A public page may override this per field. */
  required: boolean;
  /** Build-time label — `labelOf()` prefers the runtime i18n bundle. */
  label: string;
  /** Whether a journey may write it (`file` is upload-only, never via a journey). */
  writable: boolean;
  maxLength?: number;
  /** lookup / multilookup: the ONLY valid write values. */
  options?: string[];
  /** record / multirecord: the target app (always) and its entity key (when inside this appgroup). */
  targetAppId?: string;
  targetEntity?: EntityKey;
  format?: 'currency';
  /** HTML autocomplete token derived from the field name (given-name, email, tel, …). */
  autoComplete?: string;
}

export interface EntityInfo {
  key: EntityKey;
  appId: string;
  label: string;
  /** PascalCase plural — `get<pascal>()` on the service. */
  pascal: string;
  /** The single-record suffix — `create<single>()` on the service. */
  single: string;
}

/** Input-form signals per entity: which data shape each field (pair) has.
 *  `range`  — two date fields that form a stay/period → AvailabilityRangePicker
 *  `choice` — a lookup with few options → ChoiceGroup pills instead of a select
 *  `record` — an applookup → EntitySelectStep with search, never a raw id field
 *  `stock`  — a quantity that has a stock/capacity counterpart → show it, warn on overshoot */
export type Shape =
  | { kind: 'range'; from: string; to: string }
  | { kind: 'choice'; field: string; count: number }
  | { kind: 'record'; field: string; targetEntity?: EntityKey }
  | { kind: 'stock'; field: string };

export const ENTITIES: Record<EntityKey, EntityInfo> = {
  "vorhaben": {
    "key": "vorhaben",
    "appId": "6ad3213fa3643e45557898e1",
    "label": "Vorhaben",
    "pascal": "Vorhaben",
    "single": "VorhabenEntry"
  },
  "informationen_und_annahmen": {
    "key": "informationen_und_annahmen",
    "appId": "6ad32143edcd8e44d455c655",
    "label": "Informationen und Annahmen",
    "pascal": "InformationenUndAnnahmen",
    "single": "InformationenUndAnnahmenEntry"
  },
  "ki_interaktionen": {
    "key": "ki_interaktionen",
    "appId": "6ad321445f74705ef853a84c",
    "label": "KI-Interaktionen",
    "pascal": "KiInteraktionen",
    "single": "KiInteraktionenEntry"
  },
  "entscheidungen_und_freigaben": {
    "key": "entscheidungen_und_freigaben",
    "appId": "6ad321459223d37ca90058bc",
    "label": "Entscheidungen und Freigaben",
    "pascal": "EntscheidungenUndFreigaben",
    "single": "EntscheidungenUndFreigabenEntry"
  },
  "ergebnisse_und_nutzen": {
    "key": "ergebnisse_und_nutzen",
    "appId": "6ad32145576378c1e8dfb822",
    "label": "Ergebnisse und Nutzen",
    "pascal": "ErgebnisseUndNutzen",
    "single": "ErgebnisseUndNutzenEntry"
  },
  "erkenntnisse": {
    "key": "erkenntnisse",
    "appId": "6ad3214624c957560d133810",
    "label": "Erkenntnisse",
    "pascal": "Erkenntnisse",
    "single": "ErkenntnisseEntry"
  }
};

export const FIELD_RULES: Record<EntityKey, Record<string, FieldRule>> = {
  "vorhaben": {
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel des Vorhabens",
      "writable": true,
      "maxLength": 4000
    },
    "problem": {
      "key": "problem",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Problembeschreibung",
      "writable": true
    },
    "zielbild": {
      "key": "zielbild",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Zielbild",
      "writable": true
    },
    "erfolgskriterien": {
      "key": "erfolgskriterien",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Erfolgskriterien",
      "writable": true
    },
    "verantwortlich_vorname": {
      "key": "verantwortlich_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Verantwortliche Person – Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "verantwortlich_nachname": {
      "key": "verantwortlich_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Verantwortliche Person – Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "bereich": {
      "key": "bereich",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Bereich",
      "writable": true,
      "maxLength": 4000
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "geplant",
        "in_arbeit",
        "abgeschlossen",
        "pausiert",
        "abgebrochen"
      ]
    },
    "startdatum": {
      "key": "startdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Startdatum",
      "writable": true
    },
    "zieldatum": {
      "key": "zieldatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Zieldatum",
      "writable": true
    }
  },
  "informationen_und_annahmen": {
    "vorhaben": {
      "key": "vorhaben",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorhaben",
      "writable": true,
      "targetAppId": "6ad3213fa3643e45557898e1",
      "targetEntity": "vorhaben"
    },
    "bezeichnung": {
      "key": "bezeichnung",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Bezeichnung",
      "writable": true,
      "maxLength": 4000
    },
    "art": {
      "key": "art",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Art",
      "writable": true,
      "options": [
        "information",
        "annahme"
      ]
    },
    "inhalt": {
      "key": "inhalt",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Inhalt",
      "writable": true
    },
    "quelle": {
      "key": "quelle",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Quelle",
      "writable": true,
      "maxLength": 4000
    },
    "zustaendig_vorname": {
      "key": "zustaendig_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Zuständige Person – Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "zustaendig_nachname": {
      "key": "zustaendig_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Zuständige Person – Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "gueltig_bis": {
      "key": "gueltig_bis",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Gültig bis",
      "writable": true
    },
    "pruefstatus": {
      "key": "pruefstatus",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Prüfstatus",
      "writable": true,
      "options": [
        "ungeprueft",
        "bestaetigt",
        "widerlegt",
        "veraltet"
      ]
    },
    "vertrauensgrad": {
      "key": "vertrauensgrad",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Vertrauensgrad",
      "writable": true,
      "options": [
        "niedrig",
        "mittel",
        "hoch"
      ]
    },
    "pruefhinweis": {
      "key": "pruefhinweis",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Prüfhinweis",
      "writable": true
    }
  },
  "ki_interaktionen": {
    "vorhaben": {
      "key": "vorhaben",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorhaben",
      "writable": true,
      "targetAppId": "6ad3213fa3643e45557898e1",
      "targetEntity": "vorhaben"
    },
    "zeitpunkt": {
      "key": "zeitpunkt",
      "fulltype": "date/datetimeminute",
      "kind": "datetime",
      "required": false,
      "label": "Zeitpunkt",
      "writable": true
    },
    "werkzeug": {
      "key": "werkzeug",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Eingesetztes KI-Werkzeug",
      "writable": true,
      "maxLength": 4000
    },
    "zweck": {
      "key": "zweck",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Zweck",
      "writable": true,
      "maxLength": 4000
    },
    "eingabe": {
      "key": "eingabe",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Eingabe",
      "writable": true
    },
    "informationen": {
      "key": "informationen",
      "fulltype": "multipleapplookup/select",
      "kind": "multirecord",
      "required": false,
      "label": "Genutzte Informationen",
      "writable": true,
      "targetAppId": "6ad32143edcd8e44d455c655",
      "targetEntity": "informationen_und_annahmen"
    },
    "ki_ergebnis": {
      "key": "ki_ergebnis",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "KI-Ergebnis",
      "writable": true
    },
    "bewertung": {
      "key": "bewertung",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Menschliche Bewertung",
      "writable": true,
      "options": [
        "uebernommen",
        "angepasst",
        "verworfen"
      ]
    },
    "korrekturen": {
      "key": "korrekturen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Korrekturen",
      "writable": true
    },
    "pruefer_vorname": {
      "key": "pruefer_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Prüfer – Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "pruefer_nachname": {
      "key": "pruefer_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Prüfer – Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    }
  },
  "entscheidungen_und_freigaben": {
    "vorhaben": {
      "key": "vorhaben",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorhaben",
      "writable": true,
      "targetAppId": "6ad3213fa3643e45557898e1",
      "targetEntity": "vorhaben"
    },
    "ki_interaktion": {
      "key": "ki_interaktion",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Zugrunde liegende KI-Interaktion",
      "writable": true,
      "targetAppId": "6ad321445f74705ef853a84c",
      "targetEntity": "ki_interaktionen"
    },
    "entscheidung": {
      "key": "entscheidung",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Entscheidung",
      "writable": true,
      "maxLength": 4000
    },
    "entscheidungsart": {
      "key": "entscheidungsart",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Art",
      "writable": true,
      "options": [
        "entscheidung",
        "handlung",
        "freigabe"
      ]
    },
    "begruendung": {
      "key": "begruendung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Begründung",
      "writable": true
    },
    "alternativen": {
      "key": "alternativen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Betrachtete Alternativen",
      "writable": true
    },
    "verantwortlich_vorname": {
      "key": "verantwortlich_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Verantwortliche Person – Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "verantwortlich_nachname": {
      "key": "verantwortlich_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Verantwortliche Person – Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "datum": {
      "key": "datum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Datum",
      "writable": true
    },
    "freigabestatus": {
      "key": "freigabestatus",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Status der Freigabe",
      "writable": true,
      "options": [
        "beantragt",
        "freigegeben",
        "abgelehnt"
      ]
    }
  },
  "ergebnisse_und_nutzen": {
    "vorhaben": {
      "key": "vorhaben",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorhaben",
      "writable": true,
      "targetAppId": "6ad3213fa3643e45557898e1",
      "targetEntity": "vorhaben"
    },
    "entscheidung": {
      "key": "entscheidung",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Zugehörige Entscheidung",
      "writable": true,
      "targetAppId": "6ad321459223d37ca90058bc",
      "targetEntity": "entscheidungen_und_freigaben"
    },
    "ergebnisbeschreibung": {
      "key": "ergebnisbeschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Ergebnisbeschreibung",
      "writable": true
    },
    "datum": {
      "key": "datum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Datum",
      "writable": true
    },
    "qualitaet": {
      "key": "qualitaet",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Qualitätsbewertung",
      "writable": true,
      "options": [
        "sehr_gut",
        "gut",
        "ausreichend",
        "mangelhaft"
      ]
    },
    "anzahl_fehler": {
      "key": "anzahl_fehler",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Anzahl Fehler",
      "writable": true
    },
    "nacharbeit_stunden": {
      "key": "nacharbeit_stunden",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Nacharbeit in Stunden",
      "writable": true
    },
    "bearbeitungszeit_stunden": {
      "key": "bearbeitungszeit_stunden",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Bearbeitungszeit in Stunden",
      "writable": true
    },
    "nutzen": {
      "key": "nutzen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Nutzenbeschreibung",
      "writable": true
    },
    "nachweis": {
      "key": "nachweis",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Nachweis der Wirkung",
      "writable": true
    }
  },
  "erkenntnisse": {
    "vorhaben": {
      "key": "vorhaben",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorhaben",
      "writable": true,
      "targetAppId": "6ad3213fa3643e45557898e1",
      "targetEntity": "vorhaben"
    },
    "ergebnis": {
      "key": "ergebnis",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Zugehöriges Ergebnis",
      "writable": true,
      "targetAppId": "6ad32145576378c1e8dfb822",
      "targetEntity": "ergebnisse_und_nutzen"
    },
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel der Erkenntnis",
      "writable": true,
      "maxLength": 4000
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Beschreibung der Erfahrung",
      "writable": true
    },
    "erkenntnisart": {
      "key": "erkenntnisart",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Art",
      "writable": true,
      "options": [
        "vorgehensweise",
        "fehlerquelle",
        "gute_praxis",
        "warnhinweis"
      ]
    },
    "anwendungsbereich": {
      "key": "anwendungsbereich",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Anwendungsbereich",
      "writable": true,
      "maxLength": 4000
    },
    "anwendbarkeit": {
      "key": "anwendbarkeit",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Bedingungen der Anwendbarkeit",
      "writable": true
    },
    "einschraenkungen": {
      "key": "einschraenkungen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Einschränkungen",
      "writable": true
    },
    "qualitaetsstatus": {
      "key": "qualitaetsstatus",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Qualitätsstatus",
      "writable": true,
      "options": [
        "entwurf",
        "geprueft",
        "freigegeben",
        "zurueckgezogen"
      ]
    },
    "gueltig_bis": {
      "key": "gueltig_bis",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Gültig bis",
      "writable": true
    },
    "pruefer_vorname": {
      "key": "pruefer_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Prüfer – Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "pruefer_nachname": {
      "key": "pruefer_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Prüfer – Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "pruefdatum": {
      "key": "pruefdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Prüfdatum",
      "writable": true
    },
    "wiederverwendung": {
      "key": "wiederverwendung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Hinweis zur Wiederverwendung",
      "writable": true
    }
  }
};

export const SHAPES: Record<EntityKey, Shape[]> = {
  "vorhaben": [
    {
      "kind": "choice",
      "field": "status",
      "count": 5
    }
  ],
  "informationen_und_annahmen": [
    {
      "kind": "choice",
      "field": "art",
      "count": 2
    },
    {
      "kind": "choice",
      "field": "pruefstatus",
      "count": 4
    },
    {
      "kind": "choice",
      "field": "vertrauensgrad",
      "count": 3
    },
    {
      "kind": "record",
      "field": "vorhaben",
      "targetEntity": "vorhaben"
    }
  ],
  "ki_interaktionen": [
    {
      "kind": "choice",
      "field": "bewertung",
      "count": 3
    },
    {
      "kind": "record",
      "field": "vorhaben",
      "targetEntity": "vorhaben"
    },
    {
      "kind": "record",
      "field": "informationen",
      "targetEntity": "informationen_und_annahmen"
    }
  ],
  "entscheidungen_und_freigaben": [
    {
      "kind": "choice",
      "field": "entscheidungsart",
      "count": 3
    },
    {
      "kind": "choice",
      "field": "freigabestatus",
      "count": 3
    },
    {
      "kind": "record",
      "field": "vorhaben",
      "targetEntity": "vorhaben"
    },
    {
      "kind": "record",
      "field": "ki_interaktion",
      "targetEntity": "ki_interaktionen"
    }
  ],
  "ergebnisse_und_nutzen": [
    {
      "kind": "choice",
      "field": "qualitaet",
      "count": 4
    },
    {
      "kind": "record",
      "field": "vorhaben",
      "targetEntity": "vorhaben"
    },
    {
      "kind": "record",
      "field": "entscheidung",
      "targetEntity": "entscheidungen_und_freigaben"
    }
  ],
  "erkenntnisse": [
    {
      "kind": "choice",
      "field": "erkenntnisart",
      "count": 4
    },
    {
      "kind": "choice",
      "field": "qualitaetsstatus",
      "count": 4
    },
    {
      "kind": "record",
      "field": "vorhaben",
      "targetEntity": "vorhaben"
    },
    {
      "kind": "record",
      "field": "ergebnis",
      "targetEntity": "ergebnisse_und_nutzen"
    }
  ]
};

/** The fields a record of this entity is recognised by (a person: first and
 *  last name; else its title-like text field) — the same choice the dashboard's
 *  enrichment makes for `<key>Name`. `useRecordSearch` resolves an applookup to
 *  this name (`ctx.ref('gast')` in `toItem`). */
export const DISPLAY_FIELDS: Record<EntityKey, string[]> = {
  "vorhaben": [
    "titel"
  ],
  "informationen_und_annahmen": [
    "bezeichnung"
  ],
  "ki_interaktionen": [
    "werkzeug"
  ],
  "entscheidungen_und_freigaben": [
    "entscheidung"
  ],
  "ergebnisse_und_nutzen": [
    "ergebnisbeschreibung"
  ],
  "erkenntnisse": [
    "titel"
  ]
};

/** The display name of a record: its display fields joined, else the first
 *  non-empty text value, else ''. */
/** A display-field value as text: strings as they are, a lookup `{ key, label }`
 *  (either door hydrates lookups to objects) by its label — an entity whose
 *  only title-like field is a lookup/select otherwise had no name at all. */
function displayPart(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object' && 'label' in v) {
    const l = (v as { label?: unknown }).label;
    return l === null || l === undefined ? '' : String(l).trim();
  }
  return '';
}

export function displayNameOf(entity: EntityKey, fields: Record<string, unknown>): string {
  const parts = (DISPLAY_FIELDS[entity] ?? [])
    .map(k => displayPart(fields[k]))
    .filter(v => v !== '');
  if (parts.length > 0) return parts.join(' ');
  for (const [k, rule] of Object.entries(FIELD_RULES[entity] ?? {})) {
    if (rule.kind !== 'text' && rule.kind !== 'email') continue;
    const v = fields[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

export function ruleOf(entity: EntityKey, key: string): FieldRule | undefined {
  return FIELD_RULES[entity]?.[key];
}

/** The field label as the user sees it — the owner's policy label first (a
 *  public page's "Felder anpassen"), runtime bundle second, generated label last. */
export function labelOf(entity: EntityKey, key: string): string {
  const own = policyLabel(entity, key);
  if (own) return own;
  const fromBundle = fieldLabel(entity, key);
  if (fromBundle !== key) return fromBundle;
  return ruleOf(entity, key)?.label ?? key;
}

export function entityLabel(entity: EntityKey): string {
  const fromBundle = appLabel(entity);
  if (fromBundle !== entity) return fromBundle;
  return ENTITIES[entity]?.label ?? entity;
}

/** Lookup options with runtime labels — the only legitimate source of `{key,label}` pairs. */
export function optionsOf(entity: EntityKey, key: string): Array<{ key: string; label: string }> {
  const generated = (LOOKUP_OPTIONS as Record<string, Record<string, Array<{ key: string; label: string }>>>)[entity]?.[key];
  if (generated && generated.length) return generated.map(o => ({ key: o.key, label: o.label }));
  const keys = ruleOf(entity, key)?.options ?? [];
  return keys.map(k => ({ key: k, label: lookupLabel(entity, key, k) ?? k }));
}

export function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object' && 'from' in (v as object) && 'to' in (v as object)) {
    const r = v as { from: unknown; to: unknown };
    return isEmptyValue(r.from) && isEmptyValue(r.to);
  }
  return false;
}
