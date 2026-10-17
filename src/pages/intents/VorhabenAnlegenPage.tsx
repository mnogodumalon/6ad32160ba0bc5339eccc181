/**
 * Vorhaben anlegen — 3-Schritt-Wizard plus Prüfen.
 * Steps: 1) Titel und Problem → 2) Zielbild und Erfolgskriterien → 3) Verantwortliche Person und Zeitraum → 4) Prüfen & anlegen.
 * Reads: nichts. Writes: vorhaben (Status fix „geplant“, vom Hook gesetzt).
 * Composes: IntentWizardShell, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { useVorhabenAnlegenFlow } from '@/lib/journey/flows/VorhabenAnlegen';
import { tx } from '@/i18n';

export default function VorhabenAnlegenPage() {
  const [step, setStep] = useState(1);
  const flow = useVorhabenAnlegenFlow({
    steps: {
      titel: 1, problem: 1,
      zielbild: 2, erfolgskriterien: 2,
      verantwortlich_vorname: 3, verantwortlich_nachname: 3, bereich: 3, startdatum: 3, zieldatum: 3,
    },
  });
  const f = flow.forms.vorhaben;

  return (
    <IntentWizardShell
      title={tx('Vorhaben anlegen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Lege ein neues Vorhaben als zentralen Arbeitskontext an.'),
        needs: [tx('Titel und Problem'), tx('Zielbild'), tx('Name der verantwortlichen Person')],
      }}
    >
      <WizardStep label={tx('Problem')} description={tx('Gib dem Vorhaben einen Titel und beschreibe das Problem.')}>
        <div className="space-y-4">
          <Bound form={f} name="titel" />
          <Bound form={f} name="problem" rows={4} />
          <StepNav onNext={() => flow.validateStep(1)} nextStepLabel={tx('Zielbild')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Zielbild')} description={tx('Beschreibe, was erreicht werden soll und woran du Erfolg erkennst.')}>
        <div className="space-y-4">
          <Bound form={f} name="zielbild" rows={4} />
          <Bound form={f} name="erfolgskriterien" rows={4} />
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Verantwortung')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Verantwortung')} description={tx('Wer ist verantwortlich und in welchem Zeitraum läuft das Vorhaben?')}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Bound form={f} name="verantwortlich_vorname" />
            <Bound form={f} name="verantwortlich_nachname" />
          </div>
          <Bound form={f} name="bereich" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Bound form={f} name="startdatum" />
            <Bound form={f} name="zieldatum" />
          </div>
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'status', label: tx('Status'), value: tx('Geplant') }]}
            whatHappensNext={tx('Das Vorhaben steht danach als Arbeitskontext für Informationen und KI-Interaktionen bereit.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Information erfassen'), href: '#/intents/information-erfassen' },
            { label: tx('KI-Interaktion dokumentieren'), href: '#/intents/ki-interaktion-dokumentieren' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
