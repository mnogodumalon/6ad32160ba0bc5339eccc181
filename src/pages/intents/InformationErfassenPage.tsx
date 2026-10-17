/**
 * Information erfassen — Wizard für eine Information oder Annahme zu einem Vorhaben.
 * Steps: 1) Vorhaben wählen → 2) Bezeichnung, Art und Inhalt erfassen → 3) Quelle, Zuständige und Gültigkeit → 4) Prüfen & anlegen.
 * Reads: vorhaben. Writes: informationen_und_annahmen (Prüfstatus fix „ungeprüft“).
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
import { useInformationErfassenFlow } from '@/lib/journey/flows/InformationErfassen';
import { tx } from '@/i18n';

export default function InformationErfassenPage() {
  const [step, setStep] = useState(1);
  const flow = useInformationErfassenFlow({
    steps: {
      vorhaben: 1,
      bezeichnung: 2, art: 2, inhalt: 2,
      quelle: 3, zustaendig_vorname: 3, zustaendig_nachname: 3, gueltig_bis: 3, vertrauensgrad: 3,
    },
    items: {
      vorhaben: r => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: fieldLookup(r, 'status')?.label,
      }),
    },
  });
  const f = flow.forms.informationen_und_annahmen;

  return (
    <IntentWizardShell
      title={tx('Information erfassen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine Information oder Annahme festhalten — zunächst als ungeprüft.'),
        needs: [tx('Das passende Vorhaben'), tx('Bezeichnung und Inhalt')],
      }}
    >
      <WizardStep label={tx('Vorhaben')} description={tx('Zu welchem Vorhaben gehört die Information?')}>
        <EntitySelectStep
          {...flow.picks.vorhaben.select}
          {...flow.pick('vorhaben')}
          searchPlaceholder={tx('Titel des Vorhabens …')}
        />
      </WizardStep>

      <WizardStep label={tx('Inhalt')} description={tx('Was ist die Information oder Annahme?')} needs={['vorhaben']}>
        <div className="space-y-4">
          <Bound form={f} name="bezeichnung" />
          <Bound form={f} name="art" />
          <Bound form={f} name="inhalt" rows={4} />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Quelle und Gültigkeit')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Quelle')} description={tx('Woher stammt sie, wer ist zuständig und wie lange gilt sie?')} needs={['bezeichnung', 'art', 'inhalt']}>
        <div className="space-y-4">
          <Bound form={f} name="quelle" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Bound form={f} name="zustaendig_vorname" />
            <Bound form={f} name="zustaendig_nachname" />
          </div>
          <Bound form={f} name="gueltig_bis" />
          <Bound form={f} name="vertrauensgrad" allowClear />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'pruefstatus', label: tx('Prüfstatus'), value: tx('Ungeprüft') }]}
            whatHappensNext={tx('Die Information wird als ungeprüft gespeichert und kann danach geprüft werden.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Information prüfen'), href: '#/intents/information-pruefen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Im Ablauf „Information prüfen“ bestätigst oder widerlegst du sie.')}
        />
      )}
    </IntentWizardShell>
  );
}
