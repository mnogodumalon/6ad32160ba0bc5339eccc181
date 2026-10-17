import type { ErgebnisseUndNutzen, Vorhaben, EntscheidungenUndFreigaben, Erkenntnisse } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface ErgebnisseUndNutzenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: ErgebnisseUndNutzen;
  /** N:1-Ziel „Vorhaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorhabenList: Vorhaben[];
  /** Klick auf die Vorhaben-Relation → overlay.push auf dessen Detail. */
  onOpenVorhaben?: (record: Vorhaben) => void;
  /** N:1-Ziel „EntscheidungenUndFreigaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  entscheidungenUndFreigabenList: EntscheidungenUndFreigaben[];
  /** Klick auf die EntscheidungenUndFreigaben-Relation → overlay.push auf dessen Detail. */
  onOpenEntscheidungenUndFreigaben?: (record: EntscheidungenUndFreigaben) => void;
  /** 1:N „Erkenntnisse" (ergebnis): VOLLE Liste — der Block filtert auf diesen Record. */
  erkenntnisseList: Erkenntnisse[];
  /** Zeilen-Klick → overlay.push auf das Erkenntnisse-Detail (nie der Edit-Dialog). */
  onOpenErkenntnisse: (record: Erkenntnisse) => void;
  /** Kontextuelles „+": öffnet den Erkenntnisse-Dialog mit diesem Record vorgesetzt. */
  onAddErkenntnisse?: () => void;
}

export function ErgebnisseUndNutzenDetails({
  record,
  vorhabenList,
  onOpenVorhaben,
  entscheidungenUndFreigabenList,
  onOpenEntscheidungenUndFreigaben,
  erkenntnisseList,
  onOpenErkenntnisse,
  onAddErkenntnisse,
}: ErgebnisseUndNutzenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorhabenTarget = vorhabenList.find(r => r.record_id === extractRecordId(record.fields.vorhaben));
  const entscheidungTarget = entscheidungenUndFreigabenList.find(r => r.record_id === extractRecordId(record.fields.entscheidung));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('ergebnisse_und_nutzen', 'ergebnisbeschreibung')} value={record.fields.ergebnisbeschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('ergebnisse_und_nutzen', 'datum')} value={record.fields.datum} format="date" />
        <RecordField label={fieldLabel('ergebnisse_und_nutzen', 'qualitaet')} value={record.fields.qualitaet} format="pill" />
        <RecordField label={fieldLabel('ergebnisse_und_nutzen', 'anzahl_fehler')} value={record.fields.anzahl_fehler} format="text" />
        <RecordField label={fieldLabel('ergebnisse_und_nutzen', 'nacharbeit_stunden')} value={record.fields.nacharbeit_stunden} format="text" />
        <RecordField label={fieldLabel('ergebnisse_und_nutzen', 'bearbeitungszeit_stunden')} value={record.fields.bearbeitungszeit_stunden} format="text" />
        <RecordField label={fieldLabel('ergebnisse_und_nutzen', 'nutzen')} value={record.fields.nutzen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('ergebnisse_und_nutzen', 'nachweis')} value={record.fields.nachweis} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('ergebnisse_und_nutzen', 'vorhaben')}
          name={vorhabenTarget?.fields.titel ?? '—'}
          meta={[vorhabenTarget?.fields.verantwortlich_vorname, vorhabenTarget?.fields.verantwortlich_nachname].filter(Boolean).join(' · ') || undefined}
          onClick={vorhabenTarget && onOpenVorhaben ? () => onOpenVorhaben!(vorhabenTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('ergebnisse_und_nutzen', 'entscheidung')}
          name={entscheidungTarget?.fields.entscheidung ?? '—'}
          meta={[entscheidungTarget?.fields.verantwortlich_vorname, entscheidungTarget?.fields.verantwortlich_nachname].filter(Boolean).join(' · ') || undefined}
          onClick={entscheidungTarget && onOpenEntscheidungenUndFreigaben ? () => onOpenEntscheidungenUndFreigaben!(entscheidungTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('erkenntnisse')}
        items={erkenntnisseList.filter(r => extractRecordId(r.fields.ergebnis) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('erkenntnisse'), meta: r.fields.gueltig_bis })}
        onOpen={onOpenErkenntnisse}
        onAdd={onAddErkenntnisse}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.ERGEBNISSE_UND_NUTZEN} recordId={record.record_id} readOnly={!perms.canWrite('ergebnisse_und_nutzen')} />
    </>
  );
}
