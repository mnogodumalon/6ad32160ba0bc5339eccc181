/**
 * EntityCrud — pre-generated CRUD + overlay plumbing for the dashboard.
 * Compose it; NEVER re-roll dialog state, submit handlers, an overlay stack
 * or a RecordOverlayHost in the page — this file owns all of it.
 *
 * API at a glance:
 *   const data = useDashboardData();
 *   const crud = useEntityCrud(data, {
 *     // optional — the ONE semantic slot on the overlay: the record's next
 *     // workflow step. Return undefined for types without one.
 *     footer: (top) => top.type === 'vorhaben'
 *       ? { label: …, onClick: () => … }
 *       : undefined,
 *   });
 *
 *   `top.type` is the SAME camelCase key as `crud.<entity>` — one spelling
 *   per entity, everywhere in this API.
 *   …
 *   crud.vorhaben.openCreate({ …defaults })   // create dialog, prefilled — defaults are
 *                                       // shape-tolerant: bare lookup keys / record ids are fine
 *   crud.vorhaben.openEdit(record)            // edit dialog (recordId + defaults wired)
 *   crud.vorhaben.openDetail(record)          // record overlay — pass the RAW record,
 *                                       // enrichment is resolved inside
 *   crud.overlay                         // RecordOverlayStack<OverlayItem> for drills:
 *                                       // push / pop / replace / close
 *   crud.enriched.vorhaben              // the display-ready array for EVERY entity —
 *                                       // Enriched* where relations exist, the raw array
 *                                       // otherwise. Reuse these; never call enrich*()
 *                                       // in the page, and never guess which entity has
 *                                       // one: they all do.
 *   {crud.surfaces}                      // render ONCE at the end of the page JSX:
 *                                       // all entity dialogs + the overlay host
 *
 * Built in (do NOT re-implement): optimistic update + Rückgängig counter-write
 * on edit, fetchAll-on-error, edit-from-overlay, and per-entity overlay bodies
 * (RecordHeader + <{Entity}Details> with every relation reachable and the
 * contextual "+" prefilled; list-field back-references additionally get a
 * "choose existing" picker that links an EXISTING record — built in, do not
 * re-roll). Drag writes (onEventDrop/onCardMove) stay YOURS:
 * optimistic setter first, PATCH in background, undoToast with counter-write.
 *
 * Overlay content per entity (the host renders these — you never compose
 * Details blocks yourself):
 *   vorhaben: titel, problem, zielbild, erfolgskriterien, verantwortlich_vorname, verantwortlich_nachname, bereich, status, …  ·  ← informationen_und_annahmen (list + contextual +) · ← ki_interaktionen (list + contextual +) · ← entscheidungen_und_freigaben (list + contextual +) · ← ergebnisse_und_nutzen (list + contextual +) · ← erkenntnisse (list + contextual +)
 *   informationen_und_annahmen: vorhaben, bezeichnung, art, inhalt, quelle, zustaendig_vorname, zustaendig_nachname, gueltig_bis, …  ·  → vorhaben · ← ki_interaktionen (list + contextual + + choose existing)
 *   ki_interaktionen: vorhaben, zeitpunkt, werkzeug, zweck, eingabe, informationen, ki_ergebnis, bewertung, …  ·  → vorhaben · → informationen_und_annahmen · ← entscheidungen_und_freigaben (list + contextual +)
 *   entscheidungen_und_freigaben: vorhaben, ki_interaktion, entscheidung, entscheidungsart, begruendung, alternativen, verantwortlich_vorname, verantwortlich_nachname, …  ·  → vorhaben · → ki_interaktionen · ← ergebnisse_und_nutzen (list + contextual +)
 *   ergebnisse_und_nutzen: vorhaben, entscheidung, ergebnisbeschreibung, datum, qualitaet, anzahl_fehler, nacharbeit_stunden, bearbeitungszeit_stunden, …  ·  → vorhaben · → entscheidungen_und_freigaben · ← erkenntnisse (list + contextual +)
 *   erkenntnisse: vorhaben, ergebnis, titel, beschreibung, erkenntnisart, anwendungsbereich, anwendbarkeit, einschraenkungen, …  ·  → vorhaben · → ergebnisse_und_nutzen
 */
import { useState, useMemo, type ReactNode } from 'react';
import type { Vorhaben, InformationenUndAnnahmen, KiInteraktionen, EntscheidungenUndFreigaben, ErgebnisseUndNutzen, Erkenntnisse } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, createRecordUrl, extractRecordIds } from '@/services/livingAppsService';
import { enrichInformationenUndAnnahmen, enrichKiInteraktionen, enrichEntscheidungenUndFreigaben, enrichErgebnisseUndNutzen, enrichErkenntnisse } from '@/lib/enrich';
import type { EnrichedInformationenUndAnnahmen, EnrichedKiInteraktionen, EnrichedEntscheidungenUndFreigaben, EnrichedErgebnisseUndNutzen, EnrichedErkenntnisse } from '@/types/enriched';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useRecordOverlayStack, RecordOverlayHost, RecordHeader,
  type RecordOverlayStack,
} from '@/components/widgets/RecordView';
import { VorhabenDialog, type VorhabenDialogDefaults } from '@/components/dialogs/VorhabenDialog';
import { VorhabenDetails } from '@/components/details/VorhabenDetails';
import { InformationenUndAnnahmenDialog, type InformationenUndAnnahmenDialogDefaults } from '@/components/dialogs/InformationenUndAnnahmenDialog';
import { InformationenUndAnnahmenDetails } from '@/components/details/InformationenUndAnnahmenDetails';
import { KiInteraktionenDialog, type KiInteraktionenDialogDefaults } from '@/components/dialogs/KiInteraktionenDialog';
import { KiInteraktionenDetails } from '@/components/details/KiInteraktionenDetails';
import { EntscheidungenUndFreigabenDialog, type EntscheidungenUndFreigabenDialogDefaults } from '@/components/dialogs/EntscheidungenUndFreigabenDialog';
import { EntscheidungenUndFreigabenDetails } from '@/components/details/EntscheidungenUndFreigabenDetails';
import { ErgebnisseUndNutzenDialog, type ErgebnisseUndNutzenDialogDefaults } from '@/components/dialogs/ErgebnisseUndNutzenDialog';
import { ErgebnisseUndNutzenDetails } from '@/components/details/ErgebnisseUndNutzenDetails';
import { ErkenntnisseDialog, type ErkenntnisseDialogDefaults } from '@/components/dialogs/ErkenntnisseDialog';
import { ErkenntnisseDetails } from '@/components/details/ErkenntnisseDetails';
import { PickExistingDialog } from '@/components/PickExistingDialog';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { t, appLabel } from '@/i18n';
import { undoToast } from '@/lib/polish';
import { usePermissions } from '@/lib/permissions';
import { toast } from 'sonner';
import { formatDate } from '@/lib/formatters';

// The overlay union — one branch per entity, `record` typed the way the data
// flows: Enriched* where enrichment exists, the raw record type otherwise.
// The host resolves enrichment itself; pages pass raw records everywhere.
export type OverlayItem =
  | { type: 'vorhaben'; record: Vorhaben }
  | { type: 'informationenUndAnnahmen'; record: EnrichedInformationenUndAnnahmen }
  | { type: 'kiInteraktionen'; record: EnrichedKiInteraktionen }
  | { type: 'entscheidungenUndFreigaben'; record: EnrichedEntscheidungenUndFreigaben }
  | { type: 'ergebnisseUndNutzen'; record: EnrichedErgebnisseUndNutzen }
  | { type: 'erkenntnisse'; record: EnrichedErkenntnisse };

/** The useDashboardData() return — pass it in, never re-fetch inside. */
export type EntityCrudData = ReturnType<typeof useDashboardData>;

export interface EntityCrudOptions {
  /** Per-type overlay footer — the record's next workflow step. */
  footer?: (top: OverlayItem) => ReactNode | { label: ReactNode; onClick: () => void } | undefined;
  placement?: 'side' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface EntityCrudApi<TRecord, TDefaults> {
  /** Open the create dialog, optionally prefilled (shape-tolerant defaults). */
  openCreate: (defaults?: TDefaults) => void;
  /** Open the edit dialog for a record (recordId + defaults are wired). */
  openEdit: (record: TRecord) => void;
  /** Open the record overlay (raw record is fine — enrichment resolved inside). */
  openDetail: (record: TRecord) => void;
  /** May the signed-in user create/change records of this list? (the
   *  platform's rights — show a „+ Neu“ only when true; openCreate/openEdit
   *  refuse with a notice otherwise). */
  canWrite: boolean;
}

export interface EntityCrud {
  /** The overlay stack for drills: push / pop / replace / close. */
  overlay: RecordOverlayStack<OverlayItem>;
  /** Render ONCE at the end of the page JSX — all dialogs + the overlay host. */
  surfaces: ReactNode;
  vorhaben: EntityCrudApi<Vorhaben, VorhabenDialogDefaults>;
  informationenUndAnnahmen: EntityCrudApi<InformationenUndAnnahmen, InformationenUndAnnahmenDialogDefaults>;
  kiInteraktionen: EntityCrudApi<KiInteraktionen, KiInteraktionenDialogDefaults>;
  entscheidungenUndFreigaben: EntityCrudApi<EntscheidungenUndFreigaben, EntscheidungenUndFreigabenDialogDefaults>;
  ergebnisseUndNutzen: EntityCrudApi<ErgebnisseUndNutzen, ErgebnisseUndNutzenDialogDefaults>;
  erkenntnisse: EntityCrudApi<Erkenntnisse, ErkenntnisseDialogDefaults>;
  /** The display-ready array per entity: Enriched* where an enrich function
   *  exists, the raw array otherwise. One key per entity so no page has to
   *  know which is which. Reuse these; never re-enrich in the page. */
  enriched: { vorhaben: Vorhaben[]; informationenUndAnnahmen: EnrichedInformationenUndAnnahmen[]; kiInteraktionen: EnrichedKiInteraktionen[]; entscheidungenUndFreigaben: EnrichedEntscheidungenUndFreigaben[]; ergebnisseUndNutzen: EnrichedErgebnisseUndNutzen[]; erkenntnisse: EnrichedErkenntnisse[] };
}

export function useEntityCrud(data: EntityCrudData, options?: EntityCrudOptions): EntityCrud {
  const overlay = useRecordOverlayStack<OverlayItem>();
  // the platform's rights of the signed-in user (lib/permissions.ts) — unknown = allowed
  const perms = usePermissions();
  const refuse = () => { toast.error(t('perm_denied_title'), { description: t('perm_denied_desc') }); };
  const [vorhabenDialog, setVorhabenDialog] = useState<{ defaults?: VorhabenDialogDefaults; editing?: Vorhaben } | null>(null);
  const [informationenUndAnnahmenDialog, setInformationenUndAnnahmenDialog] = useState<{ defaults?: InformationenUndAnnahmenDialogDefaults; editing?: InformationenUndAnnahmen } | null>(null);
  const [kiInteraktionenDialog, setKiInteraktionenDialog] = useState<{ defaults?: KiInteraktionenDialogDefaults; editing?: KiInteraktionen } | null>(null);
  const [entscheidungenUndFreigabenDialog, setEntscheidungenUndFreigabenDialog] = useState<{ defaults?: EntscheidungenUndFreigabenDialogDefaults; editing?: EntscheidungenUndFreigaben } | null>(null);
  const [ergebnisseUndNutzenDialog, setErgebnisseUndNutzenDialog] = useState<{ defaults?: ErgebnisseUndNutzenDialogDefaults; editing?: ErgebnisseUndNutzen } | null>(null);
  const [erkenntnisseDialog, setErkenntnisseDialog] = useState<{ defaults?: ErkenntnisseDialogDefaults; editing?: Erkenntnisse } | null>(null);
  // „Vorhandene wählen" für den Listenfeld-Rückbezug ki_interaktionen.informationen → informationen_und_annahmen: hält die Hub-record_id.
  const [pickInformationenUndAnnahmenKiInteraktionen, setPickInformationenUndAnnahmenKiInteraktionen] = useState<string | null>(null);
  const enrichedInformationenUndAnnahmen = useMemo(() => enrichInformationenUndAnnahmen(data.informationenUndAnnahmen, { vorhabenMap: data.vorhabenMap }), [data.informationenUndAnnahmen, data.vorhabenMap]);
  const enrichedKiInteraktionen = useMemo(() => enrichKiInteraktionen(data.kiInteraktionen, { vorhabenMap: data.vorhabenMap, informationenUndAnnahmenMap: data.informationenUndAnnahmenMap }), [data.kiInteraktionen, data.vorhabenMap, data.informationenUndAnnahmenMap]);
  const enrichedEntscheidungenUndFreigaben = useMemo(() => enrichEntscheidungenUndFreigaben(data.entscheidungenUndFreigaben, { vorhabenMap: data.vorhabenMap, kiInteraktionenMap: data.kiInteraktionenMap }), [data.entscheidungenUndFreigaben, data.vorhabenMap, data.kiInteraktionenMap]);
  const enrichedErgebnisseUndNutzen = useMemo(() => enrichErgebnisseUndNutzen(data.ergebnisseUndNutzen, { vorhabenMap: data.vorhabenMap, entscheidungenUndFreigabenMap: data.entscheidungenUndFreigabenMap }), [data.ergebnisseUndNutzen, data.vorhabenMap, data.entscheidungenUndFreigabenMap]);
  const enrichedErkenntnisse = useMemo(() => enrichErkenntnisse(data.erkenntnisse, { vorhabenMap: data.vorhabenMap, ergebnisseUndNutzenMap: data.ergebnisseUndNutzenMap }), [data.erkenntnisse, data.vorhabenMap, data.ergebnisseUndNutzenMap]);

  function detailVorhaben(record: Vorhaben, push = false) {
    const item: OverlayItem = { type: 'vorhaben', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitVorhaben(fields: Vorhaben['fields']) {
    const editing = vorhabenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setVorhaben(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateVorhabenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('vorhaben')} — ${t('crud_updated')}`, async () => {
        data.setVorhaben(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateVorhabenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createVorhabenEntry(fields);
      undoToast(`${appLabel('vorhaben')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailInformationenUndAnnahmen(record: InformationenUndAnnahmen, push = false) {
    const rec = enrichedInformationenUndAnnahmen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'informationenUndAnnahmen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitInformationenUndAnnahmen(fields: InformationenUndAnnahmen['fields']) {
    const editing = informationenUndAnnahmenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setInformationenUndAnnahmen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateInformationenUndAnnahmenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('informationen_und_annahmen')} — ${t('crud_updated')}`, async () => {
        data.setInformationenUndAnnahmen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateInformationenUndAnnahmenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createInformationenUndAnnahmenEntry(fields);
      undoToast(`${appLabel('informationen_und_annahmen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  // Link an EXISTING KiInteraktionen to the InformationenUndAnnahmen hub: append the hub URL to the
  // source's list field. Optimistic setter first, PATCH, undoToast counter-write.
  async function linkInformationenUndAnnahmenKiInteraktionen(sourceId: string) {
    const hub = pickInformationenUndAnnahmenKiInteraktionen;
    const src = data.kiInteraktionen.find(r => r.record_id === sourceId);
    if (!hub || !src) return;
    const ids = extractRecordIds(src.fields.informationen);
    if (ids.includes(hub)) return;
    const next = [...ids, hub].map(id => createRecordUrl(APP_IDS.INFORMATIONEN_UND_ANNAHMEN, id));
    data.setKiInteraktionen(list => list.map(r => (r.record_id === sourceId ? { ...r, fields: { ...r.fields, informationen: next } } : r)));
    try {
      await LivingAppsService.updateKiInteraktionenEntry(sourceId, { informationen: next });
    } catch (err) {
      data.fetchAll();
      throw err;
    }
    undoToast(`${appLabel('ki_interaktionen')} — ${t('pick_linked')}`, async () => {
      data.setKiInteraktionen(list => list.map(r => (r.record_id === sourceId ? src : r)));
      try { await LivingAppsService.updateKiInteraktionenEntry(sourceId, { informationen: src.fields.informationen }); } catch { data.fetchAll(); }
    });
  }

  function detailKiInteraktionen(record: KiInteraktionen, push = false) {
    const rec = enrichedKiInteraktionen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'kiInteraktionen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitKiInteraktionen(fields: KiInteraktionen['fields']) {
    const editing = kiInteraktionenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setKiInteraktionen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateKiInteraktionenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('ki_interaktionen')} — ${t('crud_updated')}`, async () => {
        data.setKiInteraktionen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateKiInteraktionenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createKiInteraktionenEntry(fields);
      undoToast(`${appLabel('ki_interaktionen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailEntscheidungenUndFreigaben(record: EntscheidungenUndFreigaben, push = false) {
    const rec = enrichedEntscheidungenUndFreigaben.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'entscheidungenUndFreigaben', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitEntscheidungenUndFreigaben(fields: EntscheidungenUndFreigaben['fields']) {
    const editing = entscheidungenUndFreigabenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setEntscheidungenUndFreigaben(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateEntscheidungenUndFreigabenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('entscheidungen_und_freigaben')} — ${t('crud_updated')}`, async () => {
        data.setEntscheidungenUndFreigaben(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateEntscheidungenUndFreigabenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createEntscheidungenUndFreigabenEntry(fields);
      undoToast(`${appLabel('entscheidungen_und_freigaben')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailErgebnisseUndNutzen(record: ErgebnisseUndNutzen, push = false) {
    const rec = enrichedErgebnisseUndNutzen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'ergebnisseUndNutzen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitErgebnisseUndNutzen(fields: ErgebnisseUndNutzen['fields']) {
    const editing = ergebnisseUndNutzenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setErgebnisseUndNutzen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateErgebnisseUndNutzenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('ergebnisse_und_nutzen')} — ${t('crud_updated')}`, async () => {
        data.setErgebnisseUndNutzen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateErgebnisseUndNutzenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createErgebnisseUndNutzenEntry(fields);
      undoToast(`${appLabel('ergebnisse_und_nutzen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailErkenntnisse(record: Erkenntnisse, push = false) {
    const rec = enrichedErkenntnisse.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'erkenntnisse', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitErkenntnisse(fields: Erkenntnisse['fields']) {
    const editing = erkenntnisseDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setErkenntnisse(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateErkenntnisseEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('erkenntnisse')} — ${t('crud_updated')}`, async () => {
        data.setErkenntnisse(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateErkenntnisseEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createErkenntnisseEntry(fields);
      undoToast(`${appLabel('erkenntnisse')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  const surfaces = (
    <>
      <VorhabenDialog
        open={vorhabenDialog !== null}
        onClose={() => setVorhabenDialog(null)}
        onSubmit={submitVorhaben}
        defaultValues={vorhabenDialog?.defaults}
        recordId={vorhabenDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Vorhaben']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Vorhaben']}
      />
      <InformationenUndAnnahmenDialog
        open={informationenUndAnnahmenDialog !== null}
        onClose={() => setInformationenUndAnnahmenDialog(null)}
        onSubmit={submitInformationenUndAnnahmen}
        defaultValues={informationenUndAnnahmenDialog?.defaults}
        recordId={informationenUndAnnahmenDialog?.editing?.record_id}
        vorhabenList={data.vorhaben}
        enablePhotoScan={AI_PHOTO_SCAN['InformationenUndAnnahmen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['InformationenUndAnnahmen']}
      />
      <KiInteraktionenDialog
        open={kiInteraktionenDialog !== null}
        onClose={() => setKiInteraktionenDialog(null)}
        onSubmit={submitKiInteraktionen}
        defaultValues={kiInteraktionenDialog?.defaults}
        recordId={kiInteraktionenDialog?.editing?.record_id}
        vorhabenList={data.vorhaben}
        informationenUndAnnahmenList={data.informationenUndAnnahmen}
        enablePhotoScan={AI_PHOTO_SCAN['KiInteraktionen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['KiInteraktionen']}
      />
      <EntscheidungenUndFreigabenDialog
        open={entscheidungenUndFreigabenDialog !== null}
        onClose={() => setEntscheidungenUndFreigabenDialog(null)}
        onSubmit={submitEntscheidungenUndFreigaben}
        defaultValues={entscheidungenUndFreigabenDialog?.defaults}
        recordId={entscheidungenUndFreigabenDialog?.editing?.record_id}
        vorhabenList={data.vorhaben}
        kiInteraktionenList={data.kiInteraktionen}
        enablePhotoScan={AI_PHOTO_SCAN['EntscheidungenUndFreigaben']}
        enablePhotoLocation={AI_PHOTO_LOCATION['EntscheidungenUndFreigaben']}
      />
      <ErgebnisseUndNutzenDialog
        open={ergebnisseUndNutzenDialog !== null}
        onClose={() => setErgebnisseUndNutzenDialog(null)}
        onSubmit={submitErgebnisseUndNutzen}
        defaultValues={ergebnisseUndNutzenDialog?.defaults}
        recordId={ergebnisseUndNutzenDialog?.editing?.record_id}
        vorhabenList={data.vorhaben}
        entscheidungenUndFreigabenList={data.entscheidungenUndFreigaben}
        enablePhotoScan={AI_PHOTO_SCAN['ErgebnisseUndNutzen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['ErgebnisseUndNutzen']}
      />
      <ErkenntnisseDialog
        open={erkenntnisseDialog !== null}
        onClose={() => setErkenntnisseDialog(null)}
        onSubmit={submitErkenntnisse}
        defaultValues={erkenntnisseDialog?.defaults}
        recordId={erkenntnisseDialog?.editing?.record_id}
        vorhabenList={data.vorhaben}
        ergebnisseUndNutzenList={data.ergebnisseUndNutzen}
        enablePhotoScan={AI_PHOTO_SCAN['Erkenntnisse']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Erkenntnisse']}
      />
      <PickExistingDialog
        open={pickInformationenUndAnnahmenKiInteraktionen !== null}
        onClose={() => setPickInformationenUndAnnahmenKiInteraktionen(null)}
        title={t('pick_title', { title: appLabel('ki_interaktionen') })}
        items={data.kiInteraktionen
          .filter(r => !extractRecordIds(r.fields.informationen).includes(pickInformationenUndAnnahmenKiInteraktionen ?? ''))
          .map(r => ({ id: r.record_id, label: String(r.fields.werkzeug ?? appLabel('ki_interaktionen')), hint: r.fields.zeitpunkt ? String(r.fields.zeitpunkt) : undefined }))}
        onPick={linkInformationenUndAnnahmenKiInteraktionen}
      />
      <RecordOverlayHost
        overlay={overlay}
        placement={options?.placement}
        size={options?.size}
        footer={options?.footer}
        render={(top) => {
          if (top.type === 'vorhaben') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('vorhaben')} subtitle={top.record.fields.startdatum ? formatDate(top.record.fields.startdatum) : undefined} />
                <VorhabenDetails
                  record={top.record}
                  informationenUndAnnahmenList={data.informationenUndAnnahmen}
                  onOpenInformationenUndAnnahmen={(r) => detailInformationenUndAnnahmen(r, true)}
                  onAddInformationenUndAnnahmen={perms.canWrite('informationen_und_annahmen') ? () => setInformationenUndAnnahmenDialog({ defaults: { vorhaben: createRecordUrl(APP_IDS.VORHABEN, top.record.record_id) } }) : undefined}
                  kiInteraktionenList={data.kiInteraktionen}
                  onOpenKiInteraktionen={(r) => detailKiInteraktionen(r, true)}
                  onAddKiInteraktionen={perms.canWrite('ki_interaktionen') ? () => setKiInteraktionenDialog({ defaults: { vorhaben: createRecordUrl(APP_IDS.VORHABEN, top.record.record_id) } }) : undefined}
                  entscheidungenUndFreigabenList={data.entscheidungenUndFreigaben}
                  onOpenEntscheidungenUndFreigaben={(r) => detailEntscheidungenUndFreigaben(r, true)}
                  onAddEntscheidungenUndFreigaben={perms.canWrite('entscheidungen_und_freigaben') ? () => setEntscheidungenUndFreigabenDialog({ defaults: { vorhaben: createRecordUrl(APP_IDS.VORHABEN, top.record.record_id) } }) : undefined}
                  ergebnisseUndNutzenList={data.ergebnisseUndNutzen}
                  onOpenErgebnisseUndNutzen={(r) => detailErgebnisseUndNutzen(r, true)}
                  onAddErgebnisseUndNutzen={perms.canWrite('ergebnisse_und_nutzen') ? () => setErgebnisseUndNutzenDialog({ defaults: { vorhaben: createRecordUrl(APP_IDS.VORHABEN, top.record.record_id) } }) : undefined}
                  erkenntnisseList={data.erkenntnisse}
                  onOpenErkenntnisse={(r) => detailErkenntnisse(r, true)}
                  onAddErkenntnisse={perms.canWrite('erkenntnisse') ? () => setErkenntnisseDialog({ defaults: { vorhaben: createRecordUrl(APP_IDS.VORHABEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'informationenUndAnnahmen') {
            return (
              <>
                <RecordHeader title={top.record.fields.bezeichnung ?? appLabel('informationen_und_annahmen')} subtitle={top.record.fields.gueltig_bis ? formatDate(top.record.fields.gueltig_bis) : undefined} />
                <InformationenUndAnnahmenDetails
                  record={top.record}
                  vorhabenList={data.vorhaben}
                  onOpenVorhaben={(r) => detailVorhaben(r, true)}
                  kiInteraktionenList={data.kiInteraktionen}
                  onOpenKiInteraktionen={(r) => detailKiInteraktionen(r, true)}
                  onAddKiInteraktionen={perms.canWrite('ki_interaktionen') ? () => setKiInteraktionenDialog({ defaults: { informationen: [createRecordUrl(APP_IDS.INFORMATIONEN_UND_ANNAHMEN, top.record.record_id)] } }) : undefined}
                  onPickKiInteraktionen={perms.canWrite('ki_interaktionen') ? () => setPickInformationenUndAnnahmenKiInteraktionen(top.record.record_id) : undefined}
                />
              </>
            );
          }
          if (top.type === 'kiInteraktionen') {
            return (
              <>
                <RecordHeader title={top.record.fields.werkzeug ?? appLabel('ki_interaktionen')} subtitle={top.record.fields.zeitpunkt ? formatDate(top.record.fields.zeitpunkt) : undefined} />
                <KiInteraktionenDetails
                  record={top.record}
                  vorhabenList={data.vorhaben}
                  onOpenVorhaben={(r) => detailVorhaben(r, true)}
                  informationenUndAnnahmenList={data.informationenUndAnnahmen}
                  entscheidungenUndFreigabenList={data.entscheidungenUndFreigaben}
                  onOpenEntscheidungenUndFreigaben={(r) => detailEntscheidungenUndFreigaben(r, true)}
                  onAddEntscheidungenUndFreigaben={perms.canWrite('entscheidungen_und_freigaben') ? () => setEntscheidungenUndFreigabenDialog({ defaults: { ki_interaktion: createRecordUrl(APP_IDS.KI_INTERAKTIONEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'entscheidungenUndFreigaben') {
            return (
              <>
                <RecordHeader title={top.record.fields.entscheidung ?? appLabel('entscheidungen_und_freigaben')} subtitle={top.record.fields.datum ? formatDate(top.record.fields.datum) : undefined} />
                <EntscheidungenUndFreigabenDetails
                  record={top.record}
                  vorhabenList={data.vorhaben}
                  onOpenVorhaben={(r) => detailVorhaben(r, true)}
                  kiInteraktionenList={data.kiInteraktionen}
                  onOpenKiInteraktionen={(r) => detailKiInteraktionen(r, true)}
                  ergebnisseUndNutzenList={data.ergebnisseUndNutzen}
                  onOpenErgebnisseUndNutzen={(r) => detailErgebnisseUndNutzen(r, true)}
                  onAddErgebnisseUndNutzen={perms.canWrite('ergebnisse_und_nutzen') ? () => setErgebnisseUndNutzenDialog({ defaults: { entscheidung: createRecordUrl(APP_IDS.ENTSCHEIDUNGEN_UND_FREIGABEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'ergebnisseUndNutzen') {
            return (
              <>
                <RecordHeader title={appLabel('ergebnisse_und_nutzen')} subtitle={top.record.fields.datum ? formatDate(top.record.fields.datum) : undefined} />
                <ErgebnisseUndNutzenDetails
                  record={top.record}
                  vorhabenList={data.vorhaben}
                  onOpenVorhaben={(r) => detailVorhaben(r, true)}
                  entscheidungenUndFreigabenList={data.entscheidungenUndFreigaben}
                  onOpenEntscheidungenUndFreigaben={(r) => detailEntscheidungenUndFreigaben(r, true)}
                  erkenntnisseList={data.erkenntnisse}
                  onOpenErkenntnisse={(r) => detailErkenntnisse(r, true)}
                  onAddErkenntnisse={perms.canWrite('erkenntnisse') ? () => setErkenntnisseDialog({ defaults: { ergebnis: createRecordUrl(APP_IDS.ERGEBNISSE_UND_NUTZEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'erkenntnisse') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('erkenntnisse')} subtitle={top.record.fields.gueltig_bis ? formatDate(top.record.fields.gueltig_bis) : undefined} />
                <ErkenntnisseDetails
                  record={top.record}
                  vorhabenList={data.vorhaben}
                  onOpenVorhaben={(r) => detailVorhaben(r, true)}
                  ergebnisseUndNutzenList={data.ergebnisseUndNutzen}
                  onOpenErgebnisseUndNutzen={(r) => detailErgebnisseUndNutzen(r, true)}
                />
              </>
            );
          }
          return null;
        }}
        canEdit={(top) => {
          if (top.type === 'vorhaben') return perms.canWrite('vorhaben');
          if (top.type === 'informationenUndAnnahmen') return perms.canWrite('informationen_und_annahmen');
          if (top.type === 'kiInteraktionen') return perms.canWrite('ki_interaktionen');
          if (top.type === 'entscheidungenUndFreigaben') return perms.canWrite('entscheidungen_und_freigaben');
          if (top.type === 'ergebnisseUndNutzen') return perms.canWrite('ergebnisse_und_nutzen');
          if (top.type === 'erkenntnisse') return perms.canWrite('erkenntnisse');
          return true;
        }}
        onEdit={(top) => {
          overlay.close();
          if (top.type === 'vorhaben') setVorhabenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'informationenUndAnnahmen') setInformationenUndAnnahmenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'kiInteraktionen') setKiInteraktionenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'entscheidungenUndFreigaben') setEntscheidungenUndFreigabenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'ergebnisseUndNutzen') setErgebnisseUndNutzenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'erkenntnisse') setErkenntnisseDialog({ editing: top.record, defaults: top.record.fields });
        }}
      />
    </>
  );

  return {
    overlay,
    surfaces,
    vorhaben: {
      openCreate: (defaults?: VorhabenDialogDefaults) => (perms.canWrite('vorhaben') ? setVorhabenDialog({ defaults }) : refuse()),
      openEdit: (record: Vorhaben) => (perms.canWrite('vorhaben') ? setVorhabenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Vorhaben) => detailVorhaben(record, false),
      canWrite: perms.canWrite('vorhaben'),
    },
    informationenUndAnnahmen: {
      openCreate: (defaults?: InformationenUndAnnahmenDialogDefaults) => (perms.canWrite('informationen_und_annahmen') ? setInformationenUndAnnahmenDialog({ defaults }) : refuse()),
      openEdit: (record: InformationenUndAnnahmen) => (perms.canWrite('informationen_und_annahmen') ? setInformationenUndAnnahmenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: InformationenUndAnnahmen) => detailInformationenUndAnnahmen(record, false),
      canWrite: perms.canWrite('informationen_und_annahmen'),
    },
    kiInteraktionen: {
      openCreate: (defaults?: KiInteraktionenDialogDefaults) => (perms.canWrite('ki_interaktionen') ? setKiInteraktionenDialog({ defaults }) : refuse()),
      openEdit: (record: KiInteraktionen) => (perms.canWrite('ki_interaktionen') ? setKiInteraktionenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: KiInteraktionen) => detailKiInteraktionen(record, false),
      canWrite: perms.canWrite('ki_interaktionen'),
    },
    entscheidungenUndFreigaben: {
      openCreate: (defaults?: EntscheidungenUndFreigabenDialogDefaults) => (perms.canWrite('entscheidungen_und_freigaben') ? setEntscheidungenUndFreigabenDialog({ defaults }) : refuse()),
      openEdit: (record: EntscheidungenUndFreigaben) => (perms.canWrite('entscheidungen_und_freigaben') ? setEntscheidungenUndFreigabenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: EntscheidungenUndFreigaben) => detailEntscheidungenUndFreigaben(record, false),
      canWrite: perms.canWrite('entscheidungen_und_freigaben'),
    },
    ergebnisseUndNutzen: {
      openCreate: (defaults?: ErgebnisseUndNutzenDialogDefaults) => (perms.canWrite('ergebnisse_und_nutzen') ? setErgebnisseUndNutzenDialog({ defaults }) : refuse()),
      openEdit: (record: ErgebnisseUndNutzen) => (perms.canWrite('ergebnisse_und_nutzen') ? setErgebnisseUndNutzenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: ErgebnisseUndNutzen) => detailErgebnisseUndNutzen(record, false),
      canWrite: perms.canWrite('ergebnisse_und_nutzen'),
    },
    erkenntnisse: {
      openCreate: (defaults?: ErkenntnisseDialogDefaults) => (perms.canWrite('erkenntnisse') ? setErkenntnisseDialog({ defaults }) : refuse()),
      openEdit: (record: Erkenntnisse) => (perms.canWrite('erkenntnisse') ? setErkenntnisseDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Erkenntnisse) => detailErkenntnisse(record, false),
      canWrite: perms.canWrite('erkenntnisse'),
    },
    enriched: { vorhaben: data.vorhaben, informationenUndAnnahmen: enrichedInformationenUndAnnahmen, kiInteraktionen: enrichedKiInteraktionen, entscheidungenUndFreigaben: enrichedEntscheidungenUndFreigaben, ergebnisseUndNutzen: enrichedErgebnisseUndNutzen, erkenntnisse: enrichedErkenntnisse },
  };
}
