import type { Vorhaben, InformationenUndAnnahmen, KiInteraktionen, EntscheidungenUndFreigaben, ErgebnisseUndNutzen, Erkenntnisse } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface VorhabenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Vorhaben;
  /** 1:N „Informationen und Annahmen" (vorhaben): VOLLE Liste — der Block filtert auf diesen Record. */
  informationenUndAnnahmenList: InformationenUndAnnahmen[];
  /** Zeilen-Klick → overlay.push auf das InformationenUndAnnahmen-Detail (nie der Edit-Dialog). */
  onOpenInformationenUndAnnahmen: (record: InformationenUndAnnahmen) => void;
  /** Kontextuelles „+": öffnet den InformationenUndAnnahmen-Dialog mit diesem Record vorgesetzt. */
  onAddInformationenUndAnnahmen?: () => void;
  /** 1:N „KI-Interaktionen" (vorhaben): VOLLE Liste — der Block filtert auf diesen Record. */
  kiInteraktionenList: KiInteraktionen[];
  /** Zeilen-Klick → overlay.push auf das KiInteraktionen-Detail (nie der Edit-Dialog). */
  onOpenKiInteraktionen: (record: KiInteraktionen) => void;
  /** Kontextuelles „+": öffnet den KiInteraktionen-Dialog mit diesem Record vorgesetzt. */
  onAddKiInteraktionen?: () => void;
  /** 1:N „Entscheidungen und Freigaben" (vorhaben): VOLLE Liste — der Block filtert auf diesen Record. */
  entscheidungenUndFreigabenList: EntscheidungenUndFreigaben[];
  /** Zeilen-Klick → overlay.push auf das EntscheidungenUndFreigaben-Detail (nie der Edit-Dialog). */
  onOpenEntscheidungenUndFreigaben: (record: EntscheidungenUndFreigaben) => void;
  /** Kontextuelles „+": öffnet den EntscheidungenUndFreigaben-Dialog mit diesem Record vorgesetzt. */
  onAddEntscheidungenUndFreigaben?: () => void;
  /** 1:N „Ergebnisse und Nutzen" (vorhaben): VOLLE Liste — der Block filtert auf diesen Record. */
  ergebnisseUndNutzenList: ErgebnisseUndNutzen[];
  /** Zeilen-Klick → overlay.push auf das ErgebnisseUndNutzen-Detail (nie der Edit-Dialog). */
  onOpenErgebnisseUndNutzen: (record: ErgebnisseUndNutzen) => void;
  /** Kontextuelles „+": öffnet den ErgebnisseUndNutzen-Dialog mit diesem Record vorgesetzt. */
  onAddErgebnisseUndNutzen?: () => void;
  /** 1:N „Erkenntnisse" (vorhaben): VOLLE Liste — der Block filtert auf diesen Record. */
  erkenntnisseList: Erkenntnisse[];
  /** Zeilen-Klick → overlay.push auf das Erkenntnisse-Detail (nie der Edit-Dialog). */
  onOpenErkenntnisse: (record: Erkenntnisse) => void;
  /** Kontextuelles „+": öffnet den Erkenntnisse-Dialog mit diesem Record vorgesetzt. */
  onAddErkenntnisse?: () => void;
}

export function VorhabenDetails({
  record,
  informationenUndAnnahmenList,
  onOpenInformationenUndAnnahmen,
  onAddInformationenUndAnnahmen,
  kiInteraktionenList,
  onOpenKiInteraktionen,
  onAddKiInteraktionen,
  entscheidungenUndFreigabenList,
  onOpenEntscheidungenUndFreigaben,
  onAddEntscheidungenUndFreigaben,
  ergebnisseUndNutzenList,
  onOpenErgebnisseUndNutzen,
  onAddErgebnisseUndNutzen,
  erkenntnisseList,
  onOpenErkenntnisse,
  onAddErkenntnisse,
}: VorhabenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('vorhaben', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('vorhaben', 'problem')} value={record.fields.problem} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'zielbild')} value={record.fields.zielbild} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'erfolgskriterien')} value={record.fields.erfolgskriterien} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'verantwortlich_vorname')} value={record.fields.verantwortlich_vorname} format="text" />
        <RecordField label={fieldLabel('vorhaben', 'verantwortlich_nachname')} value={record.fields.verantwortlich_nachname} format="text" />
        <RecordField label={fieldLabel('vorhaben', 'bereich')} value={record.fields.bereich} format="text" />
        <RecordField label={fieldLabel('vorhaben', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('vorhaben', 'startdatum')} value={record.fields.startdatum} format="date" />
        <RecordField label={fieldLabel('vorhaben', 'zieldatum')} value={record.fields.zieldatum} format="date" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('informationen_und_annahmen')}
        items={informationenUndAnnahmenList.filter(r => extractRecordId(r.fields.vorhaben) === record.record_id)}
        map={r => ({ name: r.fields.bezeichnung ?? appLabel('informationen_und_annahmen'), meta: r.fields.gueltig_bis })}
        onOpen={onOpenInformationenUndAnnahmen}
        onAdd={onAddInformationenUndAnnahmen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('ki_interaktionen')}
        items={kiInteraktionenList.filter(r => extractRecordId(r.fields.vorhaben) === record.record_id)}
        map={r => ({ name: r.fields.werkzeug ?? appLabel('ki_interaktionen'), meta: r.fields.zeitpunkt })}
        onOpen={onOpenKiInteraktionen}
        onAdd={onAddKiInteraktionen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('entscheidungen_und_freigaben')}
        items={entscheidungenUndFreigabenList.filter(r => extractRecordId(r.fields.vorhaben) === record.record_id)}
        map={r => ({ name: r.fields.entscheidung ?? appLabel('entscheidungen_und_freigaben'), meta: r.fields.datum })}
        onOpen={onOpenEntscheidungenUndFreigaben}
        onAdd={onAddEntscheidungenUndFreigaben}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('ergebnisse_und_nutzen')}
        items={ergebnisseUndNutzenList.filter(r => extractRecordId(r.fields.vorhaben) === record.record_id)}
        map={r => ({ name: appLabel('ergebnisse_und_nutzen'), meta: r.fields.datum })}
        onOpen={onOpenErgebnisseUndNutzen}
        onAdd={onAddErgebnisseUndNutzen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('erkenntnisse')}
        items={erkenntnisseList.filter(r => extractRecordId(r.fields.vorhaben) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('erkenntnisse'), meta: r.fields.gueltig_bis })}
        onOpen={onOpenErkenntnisse}
        onAdd={onAddErkenntnisse}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.VORHABEN} recordId={record.record_id} readOnly={!perms.canWrite('vorhaben')} />
    </>
  );
}
