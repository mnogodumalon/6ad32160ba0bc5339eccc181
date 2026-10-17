import type { Erkenntnisse, Vorhaben, ErgebnisseUndNutzen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';

export interface ErkenntnisseDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Erkenntnisse;
  /** N:1-Ziel „Vorhaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorhabenList: Vorhaben[];
  /** Klick auf die Vorhaben-Relation → overlay.push auf dessen Detail. */
  onOpenVorhaben?: (record: Vorhaben) => void;
  /** N:1-Ziel „ErgebnisseUndNutzen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  ergebnisseUndNutzenList: ErgebnisseUndNutzen[];
  /** Klick auf die ErgebnisseUndNutzen-Relation → overlay.push auf dessen Detail. */
  onOpenErgebnisseUndNutzen?: (record: ErgebnisseUndNutzen) => void;
}

export function ErkenntnisseDetails({
  record,
  vorhabenList,
  onOpenVorhaben,
  ergebnisseUndNutzenList,
  onOpenErgebnisseUndNutzen,
}: ErkenntnisseDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorhabenTarget = vorhabenList.find(r => r.record_id === extractRecordId(record.fields.vorhaben));
  const ergebnisTarget = ergebnisseUndNutzenList.find(r => r.record_id === extractRecordId(record.fields.ergebnis));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('erkenntnisse', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('erkenntnisse', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('erkenntnisse', 'erkenntnisart')} value={record.fields.erkenntnisart} format="pill" />
        <RecordField label={fieldLabel('erkenntnisse', 'anwendungsbereich')} value={record.fields.anwendungsbereich} format="text" />
        <RecordField label={fieldLabel('erkenntnisse', 'anwendbarkeit')} value={record.fields.anwendbarkeit} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('erkenntnisse', 'einschraenkungen')} value={record.fields.einschraenkungen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('erkenntnisse', 'qualitaetsstatus')} value={record.fields.qualitaetsstatus} format="pill" />
        <RecordField label={fieldLabel('erkenntnisse', 'gueltig_bis')} value={record.fields.gueltig_bis} format="date" />
        <RecordField label={fieldLabel('erkenntnisse', 'pruefer_vorname')} value={record.fields.pruefer_vorname} format="text" />
        <RecordField label={fieldLabel('erkenntnisse', 'pruefer_nachname')} value={record.fields.pruefer_nachname} format="text" />
        <RecordField label={fieldLabel('erkenntnisse', 'pruefdatum')} value={record.fields.pruefdatum} format="date" />
        <RecordField label={fieldLabel('erkenntnisse', 'wiederverwendung')} value={record.fields.wiederverwendung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('erkenntnisse', 'vorhaben')}
          name={vorhabenTarget?.fields.titel ?? '—'}
          meta={[vorhabenTarget?.fields.verantwortlich_vorname, vorhabenTarget?.fields.verantwortlich_nachname].filter(Boolean).join(' · ') || undefined}
          onClick={vorhabenTarget && onOpenVorhaben ? () => onOpenVorhaben!(vorhabenTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('erkenntnisse', 'ergebnis')}
          name={ergebnisTarget?.fields.ergebnisbeschreibung ?? '—'}
          meta={undefined}
          onClick={ergebnisTarget && onOpenErgebnisseUndNutzen ? () => onOpenErgebnisseUndNutzen!(ergebnisTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.ERKENNTNISSE} recordId={record.record_id} readOnly={!perms.canWrite('erkenntnisse')} />
    </>
  );
}
