/**
 * Ergebnis und Nutzen nachweisen — 5-Schritt-Wizard.
 * Steps: 1) Vorhaben wählen → 2) Zugehörige Entscheidung wählen → 3) Ergebnis und Qualität beschreiben
 *        → 4) Fehler, Nacharbeit und Bearbeitungszeit eintragen → 5) Nutzen und Nachweis festhalten → Prüfen & anlegen.
 * Reads: vorhaben, entscheidungen_und_freigaben. Writes: ergebnisse_und_nutzen (via useErgebnisNachweisenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup } from '@/lib/journey';
import { useErgebnisNachweisenFlow } from '@/lib/journey/flows/ErgebnisNachweisen';
import { tx } from '@/i18n';

export default function ErgebnisNachweisenPage() {
  const [step, setStep] = useState(1);
  const flow = useErgebnisNachweisenFlow({
    steps: {
      vorhaben: 1,
      entscheidung: 2,
      ergebnisbeschreibung: 3,
      qualitaet: 3,
      anzahl_fehler: 4,
      nacharbeit_stunden: 4,
      bearbeitungszeit_stunden: 4,
      nutzen: 5,
      nachweis: 5,
    },
    items: {
      vorhaben: r => ({ id: r.id, title: fieldText(r, 'titel'), subtitle: fieldText(r, 'problem') }),
      entscheidung: r => ({
        id: r.id,
        title: fieldText(r, 'entscheidung'),
        subtitle: fieldLookup(r, 'entscheidungsart')?.label,
        status: fieldLookup(r, 'freigabestatus') ?? undefined,
      }),
    },
  });
  const f = flow.forms.ergebnisse_und_nutzen;

  return (
    <IntentWizardShell
      title={tx('Ergebnis und Nutzen nachweisen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Halte Qualität, Aufwand und Nutzen eines Ergebnisses fest.'),
        needs: [tx('Das Vorhaben'), tx('Qualität, Fehler und Zeiten'), tx('Nachweis der Wirkung')],
      }}
    >
      <WizardStep label={tx('Vorhaben')} description={tx('Zu welchem Vorhaben gehört das Ergebnis?')}>
        <EntitySelectStep
          {...flow.picks.vorhaben.select}
          {...flow.pick('vorhaben')}
          searchPlaceholder={tx('Titel oder Problem suchen …')}
        />
      </WizardStep>

      <WizardStep
        label={tx('Entscheidung')}
        description={tx('Welche Entscheidung hat zu diesem Ergebnis geführt? Das kannst du auch überspringen.')}
        needs={['vorhaben']}
      >
        <EntitySelectStep
          {...flow.picks.entscheidung.select}
          {...flow.pick('entscheidung')}
          searchPlaceholder={tx('Entscheidung oder Begründung suchen …')}
        />
        <StepNav onBack={() => setStep(1)} onNext={() => true} nextStepLabel={tx('Ergebnis')} />
      </WizardStep>

      <WizardStep label={tx('Ergebnis')} description={tx('Beschreibe das Ergebnis und bewerte seine Qualität.')}>
        <div className="space-y-4">
          <Bound form={f} name="ergebnisbeschreibung" rows={4} />
          <Bound form={f} name="qualitaet" allowClear />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Fehler und Aufwand')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Aufwand')} description={tx('Wie viele Fehler gab es und wie viel Zeit hat es gekostet?')}>
        <div className="space-y-4">
          <Bound form={f} name="anzahl_fehler" />
          <Bound form={f} name="nacharbeit_stunden" hint={tx('In Stunden')} />
          <Bound form={f} name="bearbeitungszeit_stunden" hint={tx('In Stunden')} />
          <StepNav
            onBack={() => setStep(3)}
            onNext={() => flow.validateStep(4)}
            nextStepLabel={tx('Nutzen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Nutzen')} description={tx('Was bringt das Ergebnis und woran erkennst du die Wirkung?')}>
        <div className="space-y-4">
          <Bound form={f} name="nutzen" rows={3} />
          <Bound form={f} name="nachweis" rows={3} />
          <StepNav
            onBack={() => setStep(4)}
            onNext={() => flow.validateStep(5)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'datum', label: tx('Datum'), value: tx('Heute') }]}
            whatHappensNext={tx('Das Ergebnis wird mit Vorhaben und Entscheidung verknüpft gespeichert.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          whatHappensNext={tx('Du kannst jetzt weitere Entscheidungen oder KI-Einsätze dokumentieren.')}
          next={[
            { label: tx('Entscheidung festhalten'), href: '#/intents/entscheidung-festhalten' },
            { label: tx('KI-Interaktion dokumentieren'), href: '#/intents/ki-interaktion-dokumentieren' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
