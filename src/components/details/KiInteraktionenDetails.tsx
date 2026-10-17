import type { KiInteraktionen, Vorhaben, InformationenUndAnnahmen, EntscheidungenUndFreigaben } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface KiInteraktionenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: KiInteraktionen;
  /** N:1-Ziel „Vorhaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorhabenList: Vorhaben[];
  /** Klick auf die Vorhaben-Relation → overlay.push auf dessen Detail. */
  onOpenVorhaben?: (record: Vorhaben) => void;
  /** N:1-Ziel „InformationenUndAnnahmen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  informationenUndAnnahmenList: InformationenUndAnnahmen[];
  /** Reserviert — InformationenUndAnnahmen ist hier nur über ein Mehrfach-Feld verknüpft (Text-Join, keine Einzel-Relation); Übergabe erlaubt, aber ohne Wirkung. */
  onOpenInformationenUndAnnahmen?: (record: InformationenUndAnnahmen) => void;
  /** 1:N „Entscheidungen und Freigaben" (ki_interaktion): VOLLE Liste — der Block filtert auf diesen Record. */
  entscheidungenUndFreigabenList: EntscheidungenUndFreigaben[];
  /** Zeilen-Klick → overlay.push auf das EntscheidungenUndFreigaben-Detail (nie der Edit-Dialog). */
  onOpenEntscheidungenUndFreigaben: (record: EntscheidungenUndFreigaben) => void;
  /** Kontextuelles „+": öffnet den EntscheidungenUndFreigaben-Dialog mit diesem Record vorgesetzt. */
  onAddEntscheidungenUndFreigaben?: () => void;
}

export function KiInteraktionenDetails({
  record,
  vorhabenList,
  onOpenVorhaben,
  informationenUndAnnahmenList,
  entscheidungenUndFreigabenList,
  onOpenEntscheidungenUndFreigaben,
  onAddEntscheidungenUndFreigaben,
}: KiInteraktionenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorhabenTarget = vorhabenList.find(r => r.record_id === extractRecordId(record.fields.vorhaben));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('ki_interaktionen', 'zeitpunkt')} value={record.fields.zeitpunkt} format="datetime" />
        <RecordField label={fieldLabel('ki_interaktionen', 'werkzeug')} value={record.fields.werkzeug} format="text" />
        <RecordField label={fieldLabel('ki_interaktionen', 'zweck')} value={record.fields.zweck} format="text" />
        <RecordField label={fieldLabel('ki_interaktionen', 'eingabe')} value={record.fields.eingabe} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('ki_interaktionen', 'informationen')} value={Array.isArray(record.fields.informationen) ? record.fields.informationen.map((u: unknown) => informationenUndAnnahmenList.find(t => t.record_id === extractRecordId(u))?.fields.bezeichnung ?? '—').join(', ') : null} format="text" />
        <RecordField label={fieldLabel('ki_interaktionen', 'ki_ergebnis')} value={record.fields.ki_ergebnis} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('ki_interaktionen', 'bewertung')} value={record.fields.bewertung} format="pill" />
        <RecordField label={fieldLabel('ki_interaktionen', 'korrekturen')} value={record.fields.korrekturen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('ki_interaktionen', 'pruefer_vorname')} value={record.fields.pruefer_vorname} format="text" />
        <RecordField label={fieldLabel('ki_interaktionen', 'pruefer_nachname')} value={record.fields.pruefer_nachname} format="text" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('ki_interaktionen', 'vorhaben')}
          name={vorhabenTarget?.fields.titel ?? '—'}
          meta={[vorhabenTarget?.fields.verantwortlich_vorname, vorhabenTarget?.fields.verantwortlich_nachname].filter(Boolean).join(' · ') || undefined}
          onClick={vorhabenTarget && onOpenVorhaben ? () => onOpenVorhaben!(vorhabenTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('entscheidungen_und_freigaben')}
        items={entscheidungenUndFreigabenList.filter(r => extractRecordId(r.fields.ki_interaktion) === record.record_id)}
        map={r => ({ name: r.fields.entscheidung ?? appLabel('entscheidungen_und_freigaben'), meta: r.fields.datum })}
        onOpen={onOpenEntscheidungenUndFreigaben}
        onAdd={onAddEntscheidungenUndFreigaben}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.KI_INTERAKTIONEN} recordId={record.record_id} readOnly={!perms.canWrite('ki_interaktionen')} />
    </>
  );
}
