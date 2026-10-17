import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Vorhaben, InformationenUndAnnahmen, KiInteraktionen, EntscheidungenUndFreigaben, ErgebnisseUndNutzen, Erkenntnisse } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { t } from '@/i18n';

/** Dashboard data + the OPTIMISTIC-WRITE API.
 *
 *  The per-entity setters (`set<Entity>`) are exported for exactly one job:
 *  optimistic updates on drag writes (onEventDrop / onEventResize /
 *  onCardMove). Call the setter FIRST — the bar/card lands instantly — then
 *  fire the PATCH in the background and call `fetchAll()` ONLY in the catch.
 *  Never await the PATCH before updating state (the UI freezes for the full
 *  round-trip on every drag) and never refetch after a successful write.
 *  There is no other mechanism (no `__optimistic`, no `mutate`).
 */
/** Entities this hook can load — the same keys the journey layer uses. */
export type DashboardEntity = 'vorhaben' | 'informationen_und_annahmen' | 'ki_interaktionen' | 'entscheidungen_und_freigaben' | 'ergebnisse_und_nutzen' | 'erkenntnisse';

export interface DashboardDataOptions {
  /** Entities this page does NOT need (picked through useRecordSearch instead).
   *  Every flow page mounts this hook on its own route, so without `omit` a
   *  page that searches 3.000 guests server-side would still pull all 3.000
   *  through the side door. */
  omit?: DashboardEntity[];
}

export function useDashboardData(options: DashboardDataOptions = {}) {
  // A string key, not the array: an inline `omit={['gaeste']}` is a new array
  // on every render and would restart the fetch forever.
  const omitKey = (options.omit ?? []).slice().sort().join('|');
  const [vorhaben, setVorhaben] = useState<Vorhaben[]>([]);
  const [informationenUndAnnahmen, setInformationenUndAnnahmen] = useState<InformationenUndAnnahmen[]>([]);
  const [kiInteraktionen, setKiInteraktionen] = useState<KiInteraktionen[]>([]);
  const [entscheidungenUndFreigaben, setEntscheidungenUndFreigaben] = useState<EntscheidungenUndFreigaben[]>([]);
  const [ergebnisseUndNutzen, setErgebnisseUndNutzen] = useState<ErgebnisseUndNutzen[]>([]);
  const [erkenntnisse, setErkenntnisse] = useState<Erkenntnisse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  /** Lists the signed-in user may not read (403 on the platform). They load as
   *  empty and the rest of the page loads normally — one forbidden list used to
   *  empty the whole dashboard (05.10.2026). Hide a block whose list is here. */
  const [forbidden, setForbidden] = useState<DashboardEntity[]>([]);

  // Every list on its own: a 403 is „not yours“, any other failure is an error.
  const settle = useCallback((settled: PromiseSettledResult<unknown>[]) => {
    const denied: DashboardEntity[] = [];
    let failure: unknown = null;
    // null = this list failed for another reason: its current data stays
    const pick = <T,>(i: number, key: DashboardEntity): T[] | null => {
      const s = settled[i];
      if (s.status === 'fulfilled') return s.value as T[];
      if ((s.reason as { status?: number } | null)?.status === 403) { denied.push(key); return []; }
      failure = failure ?? s.reason;
      return null;
    };
    { const rows = pick<Vorhaben>(0, 'vorhaben'); if (rows) setVorhaben(rows); }
    { const rows = pick<InformationenUndAnnahmen>(1, 'informationen_und_annahmen'); if (rows) setInformationenUndAnnahmen(rows); }
    { const rows = pick<KiInteraktionen>(2, 'ki_interaktionen'); if (rows) setKiInteraktionen(rows); }
    { const rows = pick<EntscheidungenUndFreigaben>(3, 'entscheidungen_und_freigaben'); if (rows) setEntscheidungenUndFreigaben(rows); }
    { const rows = pick<ErgebnisseUndNutzen>(4, 'ergebnisse_und_nutzen'); if (rows) setErgebnisseUndNutzen(rows); }
    { const rows = pick<Erkenntnisse>(5, 'erkenntnisse'); if (rows) setErkenntnisse(rows); }
    setForbidden(prev => (prev.join('|') === denied.join('|') ? prev : denied));
    return failure;
  }, []);

  const fetchAll = useCallback(async () => {
    setError(null);
    const omit = new Set(omitKey ? omitKey.split('|') : []);
    try {
      const failure = settle(await Promise.allSettled([
        omit.has('vorhaben') ? Promise.resolve([] as Vorhaben[]) : LivingAppsService.getVorhaben(),
        omit.has('informationen_und_annahmen') ? Promise.resolve([] as InformationenUndAnnahmen[]) : LivingAppsService.getInformationenUndAnnahmen(),
        omit.has('ki_interaktionen') ? Promise.resolve([] as KiInteraktionen[]) : LivingAppsService.getKiInteraktionen(),
        omit.has('entscheidungen_und_freigaben') ? Promise.resolve([] as EntscheidungenUndFreigaben[]) : LivingAppsService.getEntscheidungenUndFreigaben(),
        omit.has('ergebnisse_und_nutzen') ? Promise.resolve([] as ErgebnisseUndNutzen[]) : LivingAppsService.getErgebnisseUndNutzen(),
        omit.has('erkenntnisse') ? Promise.resolve([] as Erkenntnisse[]) : LivingAppsService.getErkenntnisse(),
      ]));
      if (failure) throw failure;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(t('data_load_failed')));
    } finally {
      setLoading(false);
    }
  }, [omitKey, settle]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    const omit = new Set(omitKey ? omitKey.split('|') : []);
    async function silentRefresh() {
      try {
        // a failed list keeps its stale data out of the way: settle() only
        // replaces what loaded or was refused
        settle(await Promise.allSettled([
          omit.has('vorhaben') ? Promise.resolve([] as Vorhaben[]) : LivingAppsService.getVorhaben(),
          omit.has('informationen_und_annahmen') ? Promise.resolve([] as InformationenUndAnnahmen[]) : LivingAppsService.getInformationenUndAnnahmen(),
          omit.has('ki_interaktionen') ? Promise.resolve([] as KiInteraktionen[]) : LivingAppsService.getKiInteraktionen(),
          omit.has('entscheidungen_und_freigaben') ? Promise.resolve([] as EntscheidungenUndFreigaben[]) : LivingAppsService.getEntscheidungenUndFreigaben(),
          omit.has('ergebnisse_und_nutzen') ? Promise.resolve([] as ErgebnisseUndNutzen[]) : LivingAppsService.getErgebnisseUndNutzen(),
          omit.has('erkenntnisse') ? Promise.resolve([] as Erkenntnisse[]) : LivingAppsService.getErkenntnisse(),
        ]));
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    // assistant:data-changed comes from the assistant (<la-klar-assistant>)
    // after every mutation. The element additionally fires the legacy
    // dashboard-refresh event for OLD deployed bundles — do NOT subscribe to
    // both here, or every mutation fetches twice.
    window.addEventListener('assistant:data-changed', handleRefresh);
    return () => window.removeEventListener('assistant:data-changed', handleRefresh);
  }, [omitKey, settle]);

  const vorhabenMap = useMemo(() => {
    const m = new Map<string, Vorhaben>();
    vorhaben.forEach(r => m.set(r.record_id, r));
    return m;
  }, [vorhaben]);

  const informationenUndAnnahmenMap = useMemo(() => {
    const m = new Map<string, InformationenUndAnnahmen>();
    informationenUndAnnahmen.forEach(r => m.set(r.record_id, r));
    return m;
  }, [informationenUndAnnahmen]);

  const kiInteraktionenMap = useMemo(() => {
    const m = new Map<string, KiInteraktionen>();
    kiInteraktionen.forEach(r => m.set(r.record_id, r));
    return m;
  }, [kiInteraktionen]);

  const entscheidungenUndFreigabenMap = useMemo(() => {
    const m = new Map<string, EntscheidungenUndFreigaben>();
    entscheidungenUndFreigaben.forEach(r => m.set(r.record_id, r));
    return m;
  }, [entscheidungenUndFreigaben]);

  const ergebnisseUndNutzenMap = useMemo(() => {
    const m = new Map<string, ErgebnisseUndNutzen>();
    ergebnisseUndNutzen.forEach(r => m.set(r.record_id, r));
    return m;
  }, [ergebnisseUndNutzen]);

  return { vorhaben, setVorhaben, informationenUndAnnahmen, setInformationenUndAnnahmen, kiInteraktionen, setKiInteraktionen, entscheidungenUndFreigaben, setEntscheidungenUndFreigaben, ergebnisseUndNutzen, setErgebnisseUndNutzen, erkenntnisse, setErkenntnisse, loading, error, fetchAll, forbidden, vorhabenMap, informationenUndAnnahmenMap, kiInteraktionenMap, entscheidungenUndFreigabenMap, ergebnisseUndNutzenMap };
}

/** The hook's return — the `data` prop of DashboardOverview in the Ready-Wrapper form. */
export type DashboardData = ReturnType<typeof useDashboardData>;