import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { IconAlertTriangle, IconPlus, IconRocket, IconClockHour4, IconHourglassOff, IconTool } from '@tabler/icons-react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import { DashboardGrid } from '@/components/DashboardGrid';
import { WorkList } from '@/components/WorkList';
import { HeroBanner } from '@/components/HeroBanner';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { KanbanWidget, type KanbanCard, type KanbanColumn, type KanbanTone } from '@/components/widgets/KanbanWidget';
import { ChartWidget, type ChartRow } from '@/components/widgets/ChartWidget';
import type { Erkenntnisse } from '@/types/app';
import { LOOKUP_OPTIONS, lookupOption } from '@/types/app';
import { LivingAppsService, extractRecordId } from '@/services/livingAppsService';
import { formatDate, lookupKey } from '@/lib/formatters';
import { useClock, gruss, undoToast } from '@/lib/polish';
import { tx, appLabel } from '@/i18n';

type Filter = 'info' | 'expired' | 'rework' | null;

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const {
    vorhaben, informationenUndAnnahmen, entscheidungenUndFreigaben, ergebnisseUndNutzen, erkenntnisse,
    setVorhaben, setInformationenUndAnnahmen, setEntscheidungenUndFreigaben, setErkenntnisse,
    fetchAll,
  } = data;
  const clock = useClock();
  const today = format(clock, 'yyyy-MM-dd');
  const [filter, setFilter] = useState<Filter>(null);

  // ---- shared advance helpers: one write path for hero, work lists, kanban and overlay footer ----
  const advanceInfo = (id: string, key: string) => {
    const prev = informationenUndAnnahmen.find(r => r.record_id === id);
    if (!prev) return;
    const before = prev.fields.pruefstatus;
    setInformationenUndAnnahmen(list => list.map(r => r.record_id === id
      ? { ...r, fields: { ...r.fields, pruefstatus: lookupOption('informationen_und_annahmen', 'pruefstatus', key) } } : r));
    LivingAppsService.updateInformationenUndAnnahmenEntry(id, { pruefstatus: key }).catch(() => fetchAll());
    undoToast(tx`${prev.fields.bezeichnung ?? ''} — Prüfstatus aktualisiert`, () => {
      setInformationenUndAnnahmen(list => list.map(r => r.record_id === id ? { ...r, fields: { ...r.fields, pruefstatus: before } } : r));
      LivingAppsService.updateInformationenUndAnnahmenEntry(id, { pruefstatus: before?.key ?? 'ungeprueft' }).catch(() => fetchAll());
    });
  };

  const setFreigabe = (id: string, key: string) => {
    const prev = entscheidungenUndFreigaben.find(r => r.record_id === id);
    if (!prev) return;
    const before = prev.fields.freigabestatus;
    setEntscheidungenUndFreigaben(list => list.map(r => r.record_id === id
      ? { ...r, fields: { ...r.fields, freigabestatus: lookupOption('entscheidungen_und_freigaben', 'freigabestatus', key) } } : r));
    LivingAppsService.updateEntscheidungenUndFreigabenEntry(id, { freigabestatus: key }).catch(() => fetchAll());
    undoToast(tx`${prev.fields.entscheidung ?? ''} — Freigabe aktualisiert`, () => {
      setEntscheidungenUndFreigaben(list => list.map(r => r.record_id === id ? { ...r, fields: { ...r.fields, freigabestatus: before } } : r));
      LivingAppsService.updateEntscheidungenUndFreigabenEntry(id, { freigabestatus: before?.key ?? 'beantragt' }).catch(() => fetchAll());
    });
  };

  const advanceErkenntnis = (id: string, key: string) => {
    const prev = erkenntnisse.find(r => r.record_id === id);
    if (!prev) return;
    const before = prev.fields.qualitaetsstatus;
    setErkenntnisse(list => list.map(r => r.record_id === id
      ? { ...r, fields: { ...r.fields, qualitaetsstatus: lookupOption('erkenntnisse', 'qualitaetsstatus', key) } } : r));
    LivingAppsService.updateErkenntnisseEntry(id, { qualitaetsstatus: key }).catch(() => fetchAll());
    undoToast(tx`${prev.fields.titel ?? ''} — Qualitätsstatus aktualisiert`, () => {
      setErkenntnisse(list => list.map(r => r.record_id === id ? { ...r, fields: { ...r.fields, qualitaetsstatus: before } } : r));
      LivingAppsService.updateErkenntnisseEntry(id, { qualitaetsstatus: before?.key ?? 'entwurf' }).catch(() => fetchAll());
    });
  };

  const advanceVorhaben = (id: string, key: string) => {
    const prev = vorhaben.find(r => r.record_id === id);
    if (!prev) return;
    const before = prev.fields.status;
    setVorhaben(list => list.map(r => r.record_id === id
      ? { ...r, fields: { ...r.fields, status: lookupOption('vorhaben', 'status', key) } } : r));
    LivingAppsService.updateVorhabenEntry(id, { status: key }).catch(() => fetchAll());
    undoToast(tx`${prev.fields.titel ?? ''} — Status geändert`, () => {
      setVorhaben(list => list.map(r => r.record_id === id ? { ...r, fields: { ...r.fields, status: before } } : r));
      LivingAppsService.updateVorhabenEntry(id, { status: before?.key ?? 'geplant' }).catch(() => fetchAll());
    });
  };

  const crud = useEntityCrud(data, {
    footer: (top) => {
      if (top.type === 'vorhaben') {
        const k = lookupKey(top.record.fields.status);
        if (k === 'geplant') return { label: tx('In Arbeit setzen'), onClick: () => advanceVorhaben(top.record.record_id, 'in_arbeit') };
        if (k === 'in_arbeit') return { label: tx('Abschließen'), onClick: () => advanceVorhaben(top.record.record_id, 'abgeschlossen') };
      }
      if (top.type === 'informationenUndAnnahmen') {
        if (lookupKey(top.record.fields.pruefstatus) !== 'bestaetigt') return { label: tx('Als bestätigt markieren'), onClick: () => advanceInfo(top.record.record_id, 'bestaetigt') };
      }
      if (top.type === 'entscheidungenUndFreigaben') {
        if (lookupKey(top.record.fields.freigabestatus) === 'beantragt') return { label: tx('Freigeben'), onClick: () => setFreigabe(top.record.record_id, 'freigegeben') };
      }
      if (top.type === 'erkenntnisse') {
        const k = lookupKey(top.record.fields.qualitaetsstatus);
        if (k === 'entwurf') return { label: tx('Als geprüft markieren'), onClick: () => advanceErkenntnis(top.record.record_id, 'geprueft') };
        if (k === 'geprueft') return { label: tx('Freigeben'), onClick: () => advanceErkenntnis(top.record.record_id, 'freigegeben') };
      }
      return undefined;
    },
  });
  const enrichedInfo = crud.enriched.informationenUndAnnahmen;
  const enrichedFreigaben = crud.enriched.entscheidungenUndFreigaben;
  const enrichedErgebnisse = crud.enriched.ergebnisseUndNutzen;
  const enrichedErkenntnisse = crud.enriched.erkenntnisse;

  // ---- derived state ----
  const isExpired = (d?: string) => !!d && d.slice(0, 10) < today;

  const openInfo = useMemo(() => enrichedInfo.filter(r => {
    const k = lookupKey(r.fields.pruefstatus);
    return k !== 'bestaetigt' && k !== 'widerlegt' ? true : isExpired(r.fields.gueltig_bis);
  }), [enrichedInfo, today]); // eslint-disable-line react-hooks/exhaustive-deps

  const expiredInfo = enrichedInfo.filter(r => isExpired(r.fields.gueltig_bis) && lookupKey(r.fields.pruefstatus) !== 'widerlegt');
  const expiredErk = enrichedErkenntnisse.filter(r => isExpired(r.fields.gueltig_bis) && lookupKey(r.fields.qualitaetsstatus) !== 'zurueckgezogen');
  const beantragt = enrichedFreigaben.filter(r => lookupKey(r.fields.freigabestatus) === 'beantragt');
  const problemErgebnisse = enrichedErgebnisse.filter(r =>
    (r.fields.anzahl_fehler ?? 0) > 0 || (r.fields.nacharbeit_stunden ?? 0) > 0 || lookupKey(r.fields.qualitaet) === 'mangelhaft');
  const reworkH = enrichedErgebnisse.reduce((s, r) => s + (r.fields.nacharbeit_stunden ?? 0), 0);
  const totalH = enrichedErgebnisse.reduce((s, r) => s + (r.fields.bearbeitungszeit_stunden ?? 0), 0);
  const fehler = enrichedErgebnisse.reduce((s, r) => s + (r.fields.anzahl_fehler ?? 0), 0);

  const idsOf = (list: { fields: { vorhaben?: string } }[]) =>
    new Set(list.map(r => extractRecordId(r.fields.vorhaben)).filter((x): x is string => !!x));
  const filterIds = useMemo(() => {
    if (filter === 'info') return idsOf(openInfo);
    if (filter === 'expired') return idsOf([...expiredInfo, ...expiredErk]);
    if (filter === 'rework') return idsOf(problemErgebnisse);
    return null;
  }, [filter, openInfo, expiredInfo, expiredErk, problemErgebnisse]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns = useMemo<KanbanColumn[]>(
    () => (LOOKUP_OPTIONS['vorhaben']?.['status'] ?? []).map(o => ({ key: o.key, label: o.label })),
    [],
  );

  const countFor = (list: { fields: { vorhaben?: string } }[], id: string) =>
    list.filter(r => extractRecordId(r.fields.vorhaben) === id).length;

  const toneFor = (k: string): KanbanTone =>
    k === 'in_arbeit' ? 'primary' : k === 'abgeschlossen' ? 'success' : k === 'pausiert' ? 'warning' : 'default';

  const cards = useMemo<KanbanCard[]>(() => vorhaben
    .filter(v => !filterIds || filterIds.has(v.record_id))
    .map(v => {
      const k = lookupKey(v.fields.status) ?? columns[0]?.key ?? '';
      const person = [v.fields.verantwortlich_vorname, v.fields.verantwortlich_nachname].filter(Boolean).join(' ');
      const openI = countFor(openInfo, v.record_id);
      const probs = countFor(problemErgebnisse, v.record_id);
      return {
        id: `vorhaben:${v.record_id}`,
        column: k,
        title: v.fields.titel ?? tx('Ohne Titel'),
        subtitle: (
          <span className="block truncate">
            {person || tx('Ohne Verantwortliche/n')}
            {openI > 0 ? ` · ${openI} ${tx('ungeprüft')}` : ''}
            {probs > 0 ? ` · ${probs} ${tx('mit Nacharbeit')}` : ''}
          </span>
        ),
        tone: toneFor(k),
      };
    }), [vorhaben, filterIds, columns, openInfo, problemErgebnisse]); // eslint-disable-line react-hooks/exhaustive-deps

  const moveCard = (cardId: string, newColumn: string) => {
    const id = cardId.split(':')[1];
    if (id) advanceVorhaben(id, newColumn);
  };

  const chartRows = useMemo<ChartRow<Erkenntnisse>[]>(
    () => erkenntnisse.map(e => ({ id: `erkenntnis:${e.record_id}`, data: e })),
    [erkenntnisse],
  );

  const nameOf = (r: { vorhabenName: string }) => r.vorhabenName || tx('Ohne Vorhaben');
  const joinNames = (xs: string[]) => Array.from(new Set(xs)).slice(0, 2).join(' & ');

  // ---- header context line (names in every branch) ----
  const inArbeit = vorhaben.filter(v => lookupKey(v.fields.status) === 'in_arbeit');
  let context: string;
  if (beantragt.length > 0) {
    context = tx`Freigabe wartet bei ${joinNames(beantragt.map(r => nameOf(r)))} — ${beantragt[0].fields.entscheidung ?? ''}.`;
  } else if (expiredInfo.length + expiredErk.length > 0) {
    const first = expiredInfo[0]?.fields.bezeichnung ?? expiredErk[0]?.fields.titel ?? '';
    context = tx`Abgelaufene Gültigkeit bei „${first}“ — bitte prüfen.`;
  } else if (openInfo.length > 0) {
    context = tx`${openInfo[0].fields.bezeichnung ?? ''} (${nameOf(openInfo[0])}) wartet auf Prüfung.`;
  } else if (inArbeit.length > 0) {
    context = tx`Aktuell in Arbeit: ${joinNames(inArbeit.map(v => v.fields.titel ?? ''))}.`;
  } else {
    context = tx`Alles geprüft — zuletzt angelegt: ${vorhaben[0]?.fields.titel ?? ''}.`;
  }

  const empty = vorhaben.length === 0;

  const ergebnisItems = problemErgebnisse.slice(0, 8).map(r => {
    const bad = lookupKey(r.fields.qualitaet) === 'mangelhaft';
    return {
      id: r.record_id,
      title: r.fields.ergebnisbeschreibung ?? nameOf(r),
      secondLine: (
        <>
          <span className={bad ? 'font-medium text-destructive' : 'font-medium text-amber-600'}>
            {tx`${r.fields.anzahl_fehler ?? 0} Fehler · ${r.fields.nacharbeit_stunden ?? 0} h Nacharbeit`}
          </span>
          <span className="text-muted-foreground"> · {nameOf(r)}</span>
        </>
      ),
      action: crud.erkenntnisse.canWrite ? {
        label: tx('Erkenntnis'),
        onClick: () => crud.erkenntnisse.openCreate({ vorhaben: extractRecordId(r.fields.vorhaben) ?? undefined, ergebnis: r.record_id }),
      } : undefined,
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{gruss(clock)}</h1>
          <p className="text-sm text-muted-foreground">{empty ? tx('Lege dein erstes Vorhaben an, um KI-Nutzung mit echter Arbeit zu verbinden.') : context}</p>
        </div>
        {crud.vorhaben.canWrite && (
          <Button onClick={() => crud.vorhaben.openCreate({ status: 'geplant' })}>
            <IconPlus size={16} className="shrink-0" />
            <span className="ml-1">{tx('Neues Vorhaben')}</span>
          </Button>
        )}
      </div>

      {empty ? (
        <div className="rounded-[27px] bg-card p-8 shadow-lg flex flex-col items-center gap-3 text-center">
          <IconRocket size={48} className="text-muted-foreground" />
          <p className="max-w-md text-sm text-muted-foreground">
            {tx('Ein Vorhaben beschreibt Problem, Zielbild und Verantwortliche. Von dort erfasst du Informationen, KI-Interaktionen, Entscheidungen, Ergebnisse und Erkenntnisse.')}
          </p>
          {crud.vorhaben.canWrite && (
            <Button onClick={() => crud.vorhaben.openCreate({ status: 'geplant' })}>{tx('Erstes Vorhaben anlegen')}</Button>
          )}
        </div>
      ) : (
        <DashboardGrid
          variant="wide"
          hero={beantragt.length > 0 && (
            <HeroBanner
              icon={<IconAlertTriangle size={18} />}
              action={{ label: tx('Freigeben'), onClick: () => setFreigabe(beantragt[0].record_id, 'freigegeben') }}
            >
              {beantragt.length === 1
                ? tx`Freigabe beantragt: ${beantragt[0].fields.entscheidung ?? ''} (${nameOf(beantragt[0])}).`
                : tx`${beantragt.length} Freigaben beantragt, zuerst: ${beantragt[0].fields.entscheidung ?? ''} (${nameOf(beantragt[0])}).`}
            </HeroBanner>
          )}
          kpis={(
            <StatStrip>
              <StatStripItem
                title={tx('Zu prüfen')}
                value={openInfo.length}
                icon={<IconClockHour4 size={18} className="text-muted-foreground" />}
                tone={openInfo.length > 0 ? 'warning' : 'default'}
                onClick={() => setFilter(f => f === 'info' ? null : 'info')}
                active={filter === 'info'}
              />
              <StatStripItem
                title={tx('Gültigkeit abgelaufen')}
                value={expiredInfo.length + expiredErk.length}
                icon={<IconHourglassOff size={18} className="text-muted-foreground" />}
                tone={expiredInfo.length + expiredErk.length > 0 ? 'destructive' : 'default'}
                onClick={() => setFilter(f => f === 'expired' ? null : 'expired')}
                active={filter === 'expired'}
              />
              <StatStripItem
                title={tx('Nacharbeit')}
                value={totalH > 0 ? `${Math.round(reworkH * 10) / 10} h / ${Math.round(totalH * 10) / 10} h` : `${Math.round(reworkH * 10) / 10} h`}
                icon={<IconTool size={18} className="text-muted-foreground" />}
                tone={fehler > 0 ? 'warning' : 'default'}
                onClick={() => setFilter(f => f === 'rework' ? null : 'rework')}
                active={filter === 'rework'}
              />
            </StatStrip>
          )}
          primary={(
            <KanbanWidget
              cards={cards}
              columns={columns}
              defaultCollapsed={['abgebrochen']}
              onCardClick={card => {
                const rec = vorhaben.find(v => v.record_id === card.id.split(':')[1]);
                if (rec) crud.vorhaben.openDetail(rec);
              }}
              onCardMove={moveCard}
              onAddCard={crud.vorhaben.canWrite ? (column => crud.vorhaben.openCreate({ status: column })) : undefined}
            />
          )}
          aside={(
            <>
              <WorkList
                title={tx('Informationen prüfen')}
                items={openInfo.slice(0, 8).map(r => {
                  const k = lookupKey(r.fields.pruefstatus);
                  const expired = isExpired(r.fields.gueltig_bis);
                  return {
                    id: r.record_id,
                    title: r.fields.bezeichnung ?? nameOf(r),
                    secondLine: (
                      <>
                        <span className={expired || k === 'veraltet' ? 'font-medium text-destructive' : 'font-medium text-amber-600'}>
                          {expired ? tx`Abgelaufen ${formatDate(r.fields.gueltig_bis)}` : (r.fields.pruefstatus?.label ?? tx('Ungeprüft'))}
                        </span>
                        <span className="text-muted-foreground"> · {nameOf(r)}</span>
                      </>
                    ),
                    action: crud.informationenUndAnnahmen.canWrite ? { label: tx('✓ Bestätigen'), onClick: () => advanceInfo(r.record_id, 'bestaetigt') } : undefined,
                  };
                })}
                onItemClick={id => {
                  const rec = informationenUndAnnahmen.find(r => r.record_id === id);
                  if (rec) crud.informationenUndAnnahmen.openDetail(rec);
                }}
                empty={{ text: tx('Alle Informationen und Annahmen sind geprüft und gültig.') }}
              />
              <WorkList
                title={tx('Ergebnisse mit Fehlern & Nacharbeit')}
                items={ergebnisItems}
                onItemClick={id => {
                  const rec = ergebnisseUndNutzen.find(r => r.record_id === id);
                  if (rec) crud.ergebnisseUndNutzen.openDetail(rec);
                }}
                empty={{ text: tx('Keine Fehler oder Nacharbeit in den erfassten Ergebnissen.') }}
              />
              <ChartWidget<Erkenntnisse>
                title={tx('Erkenntnisse nach Qualitätsstatus')}
                rows={chartRows}
                dimension={{ kind: 'category', accessor: r => r.data.fields.qualitaetsstatus, label: tx('Qualitätsstatus') }}
                tone={seg => (seg.key === 'zurueckgezogen' ? 'warning' : 'default')}
                footer={expiredErk.length > 0
                  ? <>{tx`${expiredErk.length} mit abgelaufener Gültigkeit, z. B. ${expiredErk[0].fields.titel ?? ''}`}</>
                  : <>{tx('Alle Erkenntnisse sind gültig.')}</>}
              />
            </>
          )}
        />
      )}
      {crud.surfaces}
    </div>
  );
}
