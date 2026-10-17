import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Vorhaben {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    titel?: string;
    problem?: string;
    zielbild?: string;
    erfolgskriterien?: string;
    verantwortlich_vorname?: string;
    verantwortlich_nachname?: string;
    bereich?: string;
    status?: LookupValue;
    startdatum?: string; // Format: YYYY-MM-DD oder ISO String
    zieldatum?: string; // Format: YYYY-MM-DD oder ISO String
  };
}

export interface InformationenUndAnnahmen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorhaben?: RecordUrl; // applookup -> URL zu 'Vorhaben' Record
    bezeichnung?: string;
    art?: LookupValue;
    inhalt?: string;
    quelle?: string;
    zustaendig_vorname?: string;
    zustaendig_nachname?: string;
    gueltig_bis?: string; // Format: YYYY-MM-DD oder ISO String
    pruefstatus?: LookupValue;
    vertrauensgrad?: LookupValue;
    pruefhinweis?: string;
  };
}

export interface KiInteraktionen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorhaben?: RecordUrl; // applookup -> URL zu 'Vorhaben' Record
    zeitpunkt?: string; // Format: YYYY-MM-DD oder ISO String
    werkzeug?: string;
    zweck?: string;
    eingabe?: string;
    informationen?: RecordUrl[];
    ki_ergebnis?: string;
    bewertung?: LookupValue;
    korrekturen?: string;
    pruefer_vorname?: string;
    pruefer_nachname?: string;
  };
}

export interface EntscheidungenUndFreigaben {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorhaben?: RecordUrl; // applookup -> URL zu 'Vorhaben' Record
    ki_interaktion?: RecordUrl; // applookup -> URL zu 'KiInteraktionen' Record
    entscheidung?: string;
    entscheidungsart?: LookupValue;
    begruendung?: string;
    alternativen?: string;
    verantwortlich_vorname?: string;
    verantwortlich_nachname?: string;
    datum?: string; // Format: YYYY-MM-DD oder ISO String
    freigabestatus?: LookupValue;
  };
}

export interface ErgebnisseUndNutzen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorhaben?: RecordUrl; // applookup -> URL zu 'Vorhaben' Record
    entscheidung?: RecordUrl; // applookup -> URL zu 'EntscheidungenUndFreigaben' Record
    ergebnisbeschreibung?: string;
    datum?: string; // Format: YYYY-MM-DD oder ISO String
    qualitaet?: LookupValue;
    anzahl_fehler?: number;
    nacharbeit_stunden?: number;
    bearbeitungszeit_stunden?: number;
    nutzen?: string;
    nachweis?: string;
  };
}

export interface Erkenntnisse {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorhaben?: RecordUrl; // applookup -> URL zu 'Vorhaben' Record
    ergebnis?: RecordUrl; // applookup -> URL zu 'ErgebnisseUndNutzen' Record
    titel?: string;
    beschreibung?: string;
    erkenntnisart?: LookupValue;
    anwendungsbereich?: string;
    anwendbarkeit?: string;
    einschraenkungen?: string;
    qualitaetsstatus?: LookupValue;
    gueltig_bis?: string; // Format: YYYY-MM-DD oder ISO String
    pruefer_vorname?: string;
    pruefer_nachname?: string;
    pruefdatum?: string; // Format: YYYY-MM-DD oder ISO String
    wiederverwendung?: string;
  };
}

export const APP_IDS = {
  VORHABEN: '6ad3213fa3643e45557898e1',
  INFORMATIONEN_UND_ANNAHMEN: '6ad32143edcd8e44d455c655',
  KI_INTERAKTIONEN: '6ad321445f74705ef853a84c',
  ENTSCHEIDUNGEN_UND_FREIGABEN: '6ad321459223d37ca90058bc',
  ERGEBNISSE_UND_NUTZEN: '6ad32145576378c1e8dfb822',
  ERKENNTNISSE: '6ad3214624c957560d133810',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'vorhaben': {
    status: [{ key: "geplant", get label() { return lookupLabel('vorhaben', 'status', "geplant") ?? "Geplant"; } }, { key: "in_arbeit", get label() { return lookupLabel('vorhaben', 'status', "in_arbeit") ?? "In Arbeit"; } }, { key: "abgeschlossen", get label() { return lookupLabel('vorhaben', 'status', "abgeschlossen") ?? "Abgeschlossen"; } }, { key: "pausiert", get label() { return lookupLabel('vorhaben', 'status', "pausiert") ?? "Pausiert"; } }, { key: "abgebrochen", get label() { return lookupLabel('vorhaben', 'status', "abgebrochen") ?? "Abgebrochen"; } }],
  },
  'informationen_und_annahmen': {
    art: [{ key: "information", get label() { return lookupLabel('informationen_und_annahmen', 'art', "information") ?? "Information"; } }, { key: "annahme", get label() { return lookupLabel('informationen_und_annahmen', 'art', "annahme") ?? "Annahme"; } }],
    pruefstatus: [{ key: "ungeprueft", get label() { return lookupLabel('informationen_und_annahmen', 'pruefstatus', "ungeprueft") ?? "Ungeprüft"; } }, { key: "bestaetigt", get label() { return lookupLabel('informationen_und_annahmen', 'pruefstatus', "bestaetigt") ?? "Bestätigt"; } }, { key: "widerlegt", get label() { return lookupLabel('informationen_und_annahmen', 'pruefstatus', "widerlegt") ?? "Widerlegt"; } }, { key: "veraltet", get label() { return lookupLabel('informationen_und_annahmen', 'pruefstatus', "veraltet") ?? "Veraltet"; } }],
    vertrauensgrad: [{ key: "niedrig", get label() { return lookupLabel('informationen_und_annahmen', 'vertrauensgrad', "niedrig") ?? "Niedrig"; } }, { key: "mittel", get label() { return lookupLabel('informationen_und_annahmen', 'vertrauensgrad', "mittel") ?? "Mittel"; } }, { key: "hoch", get label() { return lookupLabel('informationen_und_annahmen', 'vertrauensgrad', "hoch") ?? "Hoch"; } }],
  },
  'ki_interaktionen': {
    bewertung: [{ key: "uebernommen", get label() { return lookupLabel('ki_interaktionen', 'bewertung', "uebernommen") ?? "Übernommen"; } }, { key: "angepasst", get label() { return lookupLabel('ki_interaktionen', 'bewertung', "angepasst") ?? "Angepasst"; } }, { key: "verworfen", get label() { return lookupLabel('ki_interaktionen', 'bewertung', "verworfen") ?? "Verworfen"; } }],
  },
  'entscheidungen_und_freigaben': {
    entscheidungsart: [{ key: "entscheidung", get label() { return lookupLabel('entscheidungen_und_freigaben', 'entscheidungsart', "entscheidung") ?? "Entscheidung"; } }, { key: "handlung", get label() { return lookupLabel('entscheidungen_und_freigaben', 'entscheidungsart', "handlung") ?? "Handlung"; } }, { key: "freigabe", get label() { return lookupLabel('entscheidungen_und_freigaben', 'entscheidungsart', "freigabe") ?? "Freigabe"; } }],
    freigabestatus: [{ key: "beantragt", get label() { return lookupLabel('entscheidungen_und_freigaben', 'freigabestatus', "beantragt") ?? "Beantragt"; } }, { key: "freigegeben", get label() { return lookupLabel('entscheidungen_und_freigaben', 'freigabestatus', "freigegeben") ?? "Freigegeben"; } }, { key: "abgelehnt", get label() { return lookupLabel('entscheidungen_und_freigaben', 'freigabestatus', "abgelehnt") ?? "Abgelehnt"; } }],
  },
  'ergebnisse_und_nutzen': {
    qualitaet: [{ key: "sehr_gut", get label() { return lookupLabel('ergebnisse_und_nutzen', 'qualitaet', "sehr_gut") ?? "Sehr gut"; } }, { key: "gut", get label() { return lookupLabel('ergebnisse_und_nutzen', 'qualitaet', "gut") ?? "Gut"; } }, { key: "ausreichend", get label() { return lookupLabel('ergebnisse_und_nutzen', 'qualitaet', "ausreichend") ?? "Ausreichend"; } }, { key: "mangelhaft", get label() { return lookupLabel('ergebnisse_und_nutzen', 'qualitaet', "mangelhaft") ?? "Mangelhaft"; } }],
  },
  'erkenntnisse': {
    erkenntnisart: [{ key: "vorgehensweise", get label() { return lookupLabel('erkenntnisse', 'erkenntnisart', "vorgehensweise") ?? "Vorgehensweise"; } }, { key: "fehlerquelle", get label() { return lookupLabel('erkenntnisse', 'erkenntnisart', "fehlerquelle") ?? "Fehlerquelle"; } }, { key: "gute_praxis", get label() { return lookupLabel('erkenntnisse', 'erkenntnisart', "gute_praxis") ?? "Gute Praxis"; } }, { key: "warnhinweis", get label() { return lookupLabel('erkenntnisse', 'erkenntnisart', "warnhinweis") ?? "Warnhinweis"; } }],
    qualitaetsstatus: [{ key: "entwurf", get label() { return lookupLabel('erkenntnisse', 'qualitaetsstatus', "entwurf") ?? "Entwurf"; } }, { key: "geprueft", get label() { return lookupLabel('erkenntnisse', 'qualitaetsstatus', "geprueft") ?? "Geprüft"; } }, { key: "freigegeben", get label() { return lookupLabel('erkenntnisse', 'qualitaetsstatus', "freigegeben") ?? "Freigegeben"; } }, { key: "zurueckgezogen", get label() { return lookupLabel('erkenntnisse', 'qualitaetsstatus', "zurueckgezogen") ?? "Zurückgezogen"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'vorhaben': {
    'titel': 'string/text',
    'problem': 'string/textarea',
    'zielbild': 'string/textarea',
    'erfolgskriterien': 'string/textarea',
    'verantwortlich_vorname': 'string/text',
    'verantwortlich_nachname': 'string/text',
    'bereich': 'string/text',
    'status': 'lookup/select',
    'startdatum': 'date/date',
    'zieldatum': 'date/date',
  },
  'informationen_und_annahmen': {
    'vorhaben': 'applookup/select',
    'bezeichnung': 'string/text',
    'art': 'lookup/radio',
    'inhalt': 'string/textarea',
    'quelle': 'string/text',
    'zustaendig_vorname': 'string/text',
    'zustaendig_nachname': 'string/text',
    'gueltig_bis': 'date/date',
    'pruefstatus': 'lookup/select',
    'vertrauensgrad': 'lookup/select',
    'pruefhinweis': 'string/textarea',
  },
  'ki_interaktionen': {
    'vorhaben': 'applookup/select',
    'zeitpunkt': 'date/datetimeminute',
    'werkzeug': 'string/text',
    'zweck': 'string/text',
    'eingabe': 'string/textarea',
    'informationen': 'multipleapplookup/select',
    'ki_ergebnis': 'string/textarea',
    'bewertung': 'lookup/radio',
    'korrekturen': 'string/textarea',
    'pruefer_vorname': 'string/text',
    'pruefer_nachname': 'string/text',
  },
  'entscheidungen_und_freigaben': {
    'vorhaben': 'applookup/select',
    'ki_interaktion': 'applookup/select',
    'entscheidung': 'string/text',
    'entscheidungsart': 'lookup/radio',
    'begruendung': 'string/textarea',
    'alternativen': 'string/textarea',
    'verantwortlich_vorname': 'string/text',
    'verantwortlich_nachname': 'string/text',
    'datum': 'date/date',
    'freigabestatus': 'lookup/select',
  },
  'ergebnisse_und_nutzen': {
    'vorhaben': 'applookup/select',
    'entscheidung': 'applookup/select',
    'ergebnisbeschreibung': 'string/textarea',
    'datum': 'date/date',
    'qualitaet': 'lookup/select',
    'anzahl_fehler': 'number',
    'nacharbeit_stunden': 'number',
    'bearbeitungszeit_stunden': 'number',
    'nutzen': 'string/textarea',
    'nachweis': 'string/textarea',
  },
  'erkenntnisse': {
    'vorhaben': 'applookup/select',
    'ergebnis': 'applookup/select',
    'titel': 'string/text',
    'beschreibung': 'string/textarea',
    'erkenntnisart': 'lookup/select',
    'anwendungsbereich': 'string/text',
    'anwendbarkeit': 'string/textarea',
    'einschraenkungen': 'string/textarea',
    'qualitaetsstatus': 'lookup/select',
    'gueltig_bis': 'date/date',
    'pruefer_vorname': 'string/text',
    'pruefer_nachname': 'string/text',
    'pruefdatum': 'date/date',
    'wiederverwendung': 'string/textarea',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
  'vorhaben': [
    { field: 'vorhaben', entity: 'informationen_und_annahmen' },
    { field: 'vorhaben', entity: 'ki_interaktionen' },
    { field: 'vorhaben', entity: 'entscheidungen_und_freigaben' },
    { field: 'vorhaben', entity: 'ergebnisse_und_nutzen' },
    { field: 'vorhaben', entity: 'erkenntnisse' },
  ],
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateVorhaben = StripLookup<Vorhaben['fields']>;
export type CreateInformationenUndAnnahmen = StripLookup<InformationenUndAnnahmen['fields']>;
export type CreateKiInteraktionen = StripLookup<KiInteraktionen['fields']>;
export type CreateEntscheidungenUndFreigaben = StripLookup<EntscheidungenUndFreigaben['fields']>;
export type CreateErgebnisseUndNutzen = StripLookup<ErgebnisseUndNutzen['fields']>;
export type CreateErkenntnisse = StripLookup<Erkenntnisse['fields']>;