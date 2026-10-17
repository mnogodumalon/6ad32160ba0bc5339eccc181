import type { EnrichedEntscheidungenUndFreigaben, EnrichedErgebnisseUndNutzen, EnrichedErkenntnisse, EnrichedInformationenUndAnnahmen, EnrichedKiInteraktionen } from '@/types/enriched';
import type { EntscheidungenUndFreigaben, ErgebnisseUndNutzen, Erkenntnisse, InformationenUndAnnahmen, KiInteraktionen, Vorhaben } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface InformationenUndAnnahmenMaps {
  vorhabenMap: Map<string, Vorhaben>;
}

export function enrichInformationenUndAnnahmen(
  informationenUndAnnahmen: InformationenUndAnnahmen[],
  maps: InformationenUndAnnahmenMaps
): EnrichedInformationenUndAnnahmen[] {
  return informationenUndAnnahmen.map(r => ({
    ...r,
    vorhabenName: resolveDisplay(r.fields.vorhaben, maps.vorhabenMap, 'titel'),
  }));
}

interface KiInteraktionenMaps {
  vorhabenMap: Map<string, Vorhaben>;
  informationenUndAnnahmenMap: Map<string, InformationenUndAnnahmen>;
}

export function enrichKiInteraktionen(
  kiInteraktionen: KiInteraktionen[],
  maps: KiInteraktionenMaps
): EnrichedKiInteraktionen[] {
  return kiInteraktionen.map(r => ({
    ...r,
    vorhabenName: resolveDisplay(r.fields.vorhaben, maps.vorhabenMap, 'titel'),
    informationenName: resolveDisplay(r.fields.informationen, maps.informationenUndAnnahmenMap, 'bezeichnung'),
  }));
}

interface EntscheidungenUndFreigabenMaps {
  vorhabenMap: Map<string, Vorhaben>;
  kiInteraktionenMap: Map<string, KiInteraktionen>;
}

export function enrichEntscheidungenUndFreigaben(
  entscheidungenUndFreigaben: EntscheidungenUndFreigaben[],
  maps: EntscheidungenUndFreigabenMaps
): EnrichedEntscheidungenUndFreigaben[] {
  return entscheidungenUndFreigaben.map(r => ({
    ...r,
    vorhabenName: resolveDisplay(r.fields.vorhaben, maps.vorhabenMap, 'titel'),
    ki_interaktionName: resolveDisplay(r.fields.ki_interaktion, maps.kiInteraktionenMap, 'werkzeug'),
  }));
}

interface ErgebnisseUndNutzenMaps {
  vorhabenMap: Map<string, Vorhaben>;
  entscheidungenUndFreigabenMap: Map<string, EntscheidungenUndFreigaben>;
}

export function enrichErgebnisseUndNutzen(
  ergebnisseUndNutzen: ErgebnisseUndNutzen[],
  maps: ErgebnisseUndNutzenMaps
): EnrichedErgebnisseUndNutzen[] {
  return ergebnisseUndNutzen.map(r => ({
    ...r,
    vorhabenName: resolveDisplay(r.fields.vorhaben, maps.vorhabenMap, 'titel'),
    entscheidungName: resolveDisplay(r.fields.entscheidung, maps.entscheidungenUndFreigabenMap, 'entscheidung'),
  }));
}

interface ErkenntnisseMaps {
  vorhabenMap: Map<string, Vorhaben>;
  ergebnisseUndNutzenMap: Map<string, ErgebnisseUndNutzen>;
}

export function enrichErkenntnisse(
  erkenntnisse: Erkenntnisse[],
  maps: ErkenntnisseMaps
): EnrichedErkenntnisse[] {
  return erkenntnisse.map(r => ({
    ...r,
    vorhabenName: resolveDisplay(r.fields.vorhaben, maps.vorhabenMap, 'titel'),
    ergebnisName: resolveDisplay(r.fields.ergebnis, maps.ergebnisseUndNutzenMap, 'ergebnisbeschreibung'),
  }));
}
