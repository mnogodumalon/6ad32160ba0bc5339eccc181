import type { EntscheidungenUndFreigaben, Vorhaben, KiInteraktionen, ErgebnisseUndNutzen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface EntscheidungenUndFreigabenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: EntscheidungenUndFreigaben;
  /** N:1-Ziel „Vorhaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorhabenList: Vorhaben[];
  /** Klick auf die Vorhaben-Relation → overlay.push auf dessen Detail. */
  onOpenVorhaben?: (record: Vorhaben) => void;
  /** N:1-Ziel „KiInteraktionen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  kiInteraktionenList: KiInteraktionen[];
  /** Klick auf die KiInteraktionen-Relation → overlay.push auf dessen Detail. */
  onOpenKiInteraktionen?: (record: KiInteraktionen) => void;
  /** 1:N „Ergebnisse und Nutzen" (entscheidung): VOLLE Liste — der Block filtert auf diesen Record. */
  ergebnisseUndNutzenList: ErgebnisseUndNutzen[];
  /** Zeilen-Klick → overlay.push auf das ErgebnisseUndNutzen-Detail (nie der Edit-Dialog). */
  onOpenErgebnisseUndNutzen: (record: ErgebnisseUndNutzen) => void;
  /** Kontextuelles „+": öffnet den ErgebnisseUndNutzen-Dialog mit diesem Record vorgesetzt. */
  onAddErgebnisseUndNutzen?: () => void;
}

export function EntscheidungenUndFreigabenDetails({
  record,
  vorhabenList,
  onOpenVorhaben,
  kiInteraktionenList,
  onOpenKiInteraktionen,
  ergebnisseUndNutzenList,
  onOpenErgebnisseUndNutzen,
  onAddErgebnisseUndNutzen,
}: EntscheidungenUndFreigabenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorhabenTarget = vorhabenList.find(r => r.record_id === extractRecordId(record.fields.vorhaben));
  const ki_interaktionTarget = kiInteraktionenList.find(r => r.record_id === extractRecordId(record.fields.ki_interaktion));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('entscheidungen_und_freigaben', 'entscheidung')} value={record.fields.entscheidung} format="text" />
        <RecordField label={fieldLabel('entscheidungen_und_freigaben', 'entscheidungsart')} value={record.fields.entscheidungsart} format="pill" />
        <RecordField label={fieldLabel('entscheidungen_und_freigaben', 'begruendung')} value={record.fields.begruendung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('entscheidungen_und_freigaben', 'alternativen')} value={record.fields.alternativen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('entscheidungen_und_freigaben', 'verantwortlich_vorname')} value={record.fields.verantwortlich_vorname} format="text" />
        <RecordField label={fieldLabel('entscheidungen_und_freigaben', 'verantwortlich_nachname')} value={record.fields.verantwortlich_nachname} format="text" />
        <RecordField label={fieldLabel('entscheidungen_und_freigaben', 'datum')} value={record.fields.datum} format="date" />
        <RecordField label={fieldLabel('entscheidungen_und_freigaben', 'freigabestatus')} value={record.fields.freigabestatus} format="pill" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('entscheidungen_und_freigaben', 'vorhaben')}
          name={vorhabenTarget?.fields.titel ?? '—'}
          meta={[vorhabenTarget?.fields.verantwortlich_vorname, vorhabenTarget?.fields.verantwortlich_nachname].filter(Boolean).join(' · ') || undefined}
          onClick={vorhabenTarget && onOpenVorhaben ? () => onOpenVorhaben!(vorhabenTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('entscheidungen_und_freigaben', 'ki_interaktion')}
          name={ki_interaktionTarget?.fields.werkzeug ?? '—'}
          meta={[ki_interaktionTarget?.fields.zweck, ki_interaktionTarget?.fields.pruefer_vorname].filter(Boolean).join(' · ') || undefined}
          onClick={ki_interaktionTarget && onOpenKiInteraktionen ? () => onOpenKiInteraktionen!(ki_interaktionTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('ergebnisse_und_nutzen')}
        items={ergebnisseUndNutzenList.filter(r => extractRecordId(r.fields.entscheidung) === record.record_id)}
        map={r => ({ name: appLabel('ergebnisse_und_nutzen'), meta: r.fields.datum })}
        onOpen={onOpenErgebnisseUndNutzen}
        onAdd={onAddErgebnisseUndNutzen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.ENTSCHEIDUNGEN_UND_FREIGABEN} recordId={record.record_id} readOnly={!perms.canWrite('entscheidungen_und_freigaben')} />
    </>
  );
}
