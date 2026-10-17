import type { InformationenUndAnnahmen, Vorhaben, KiInteraktionen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface InformationenUndAnnahmenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: InformationenUndAnnahmen;
  /** N:1-Ziel „Vorhaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorhabenList: Vorhaben[];
  /** Klick auf die Vorhaben-Relation → overlay.push auf dessen Detail. */
  onOpenVorhaben?: (record: Vorhaben) => void;
  /** 1:N „KI-Interaktionen" (informationen): VOLLE Liste — der Block filtert auf diesen Record. */
  kiInteraktionenList: KiInteraktionen[];
  /** Zeilen-Klick → overlay.push auf das KiInteraktionen-Detail (nie der Edit-Dialog). */
  onOpenKiInteraktionen: (record: KiInteraktionen) => void;
  /** Kontextuelles „+": öffnet den KiInteraktionen-Dialog mit diesem Record vorgesetzt. */
  onAddKiInteraktionen?: () => void;
  /** „Vorhandene wählen": Listenfeld-Rückbezug — hängt diesen Record an einen bestehenden KiInteraktionen-Datensatz. */
  onPickKiInteraktionen?: () => void;
}

export function InformationenUndAnnahmenDetails({
  record,
  vorhabenList,
  onOpenVorhaben,
  kiInteraktionenList,
  onOpenKiInteraktionen,
  onAddKiInteraktionen,
  onPickKiInteraktionen,
}: InformationenUndAnnahmenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorhabenTarget = vorhabenList.find(r => r.record_id === extractRecordId(record.fields.vorhaben));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('informationen_und_annahmen', 'bezeichnung')} value={record.fields.bezeichnung} format="text" />
        <RecordField label={fieldLabel('informationen_und_annahmen', 'art')} value={record.fields.art} format="pill" />
        <RecordField label={fieldLabel('informationen_und_annahmen', 'inhalt')} value={record.fields.inhalt} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('informationen_und_annahmen', 'quelle')} value={record.fields.quelle} format="text" />
        <RecordField label={fieldLabel('informationen_und_annahmen', 'zustaendig_vorname')} value={record.fields.zustaendig_vorname} format="text" />
        <RecordField label={fieldLabel('informationen_und_annahmen', 'zustaendig_nachname')} value={record.fields.zustaendig_nachname} format="text" />
        <RecordField label={fieldLabel('informationen_und_annahmen', 'gueltig_bis')} value={record.fields.gueltig_bis} format="date" />
        <RecordField label={fieldLabel('informationen_und_annahmen', 'pruefstatus')} value={record.fields.pruefstatus} format="pill" />
        <RecordField label={fieldLabel('informationen_und_annahmen', 'vertrauensgrad')} value={record.fields.vertrauensgrad} format="pill" />
        <RecordField label={fieldLabel('informationen_und_annahmen', 'pruefhinweis')} value={record.fields.pruefhinweis} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('informationen_und_annahmen', 'vorhaben')}
          name={vorhabenTarget?.fields.titel ?? '—'}
          meta={[vorhabenTarget?.fields.verantwortlich_vorname, vorhabenTarget?.fields.verantwortlich_nachname].filter(Boolean).join(' · ') || undefined}
          onClick={vorhabenTarget && onOpenVorhaben ? () => onOpenVorhaben!(vorhabenTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('ki_interaktionen')}
        items={kiInteraktionenList.filter(r => Array.isArray(r.fields.informationen) && r.fields.informationen.some((u: unknown) => extractRecordId(u) === record.record_id))}
        map={r => ({ name: r.fields.werkzeug ?? appLabel('ki_interaktionen'), meta: r.fields.zeitpunkt })}
        onOpen={onOpenKiInteraktionen}
        onAdd={onAddKiInteraktionen}
        onPick={onPickKiInteraktionen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.INFORMATIONEN_UND_ANNAHMEN} recordId={record.record_id} readOnly={!perms.canWrite('informationen_und_annahmen')} />
    </>
  );
}
