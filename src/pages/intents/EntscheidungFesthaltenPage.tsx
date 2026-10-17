/**
 * Entscheidung festhalten — 4-Schritt-Wizard.
 * Steps: 1) Vorhaben wählen → 2) Optional KI-Interaktion auswählen → 3) Entscheidung, Art, Begründung, Alternativen
 *        → 4) Verantwortliche Person und Freigabestatus → Prüfen & anlegen.
 * Reads: vorhaben, ki_interaktionen. Writes: entscheidungen_und_freigaben (datum = heute, vom Plan gesetzt).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { format } from 'date-fns';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup } from '@/lib/journey';
import { useEntscheidungFesthaltenFlow } from '@/lib/journey/flows/EntscheidungFesthalten';
import { tx } from '@/i18n';

export default function EntscheidungFesthaltenPage() {
  const [step, setStep] = useState(1);
  const flow = useEntscheidungFesthaltenFlow({
    steps: {
      vorhaben: 1,
      ki_interaktion: 2,
      entscheidung: 3,
      entscheidungsart: 3,
      begruendung: 3,
      alternativen: 3,
      verantwortlich_vorname: 4,
      verantwortlich_nachname: 4,
      freigabestatus: 4,
    },
    items: {
      vorhaben: r => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: [fieldText(r, 'verantwortlich_vorname'), fieldText(r, 'verantwortlich_nachname')].filter(Boolean).join(' '),
      }),
      ki_interaktion: (r, ctx) => ({
        id: r.id,
        title: fieldText(r, 'zweck'),
        subtitle: [ctx.ref('vorhaben'), fieldLookup(r, 'bewertung')?.label].filter(Boolean).join(' · '),
      }),
    },
  });
  const f = flow.forms.entscheidungen_und_freigaben;

  return (
    <IntentWizardShell
      title={tx('Entscheidung festhalten')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine Entscheidung oder Freigabe mit Begründung und Verantwortlichem dokumentieren.'),
        needs: [tx('Das zugehörige Vorhaben'), tx('Die Entscheidung samt Begründung'), tx('Name der verantwortlichen Person')],
      }}
    >
      <WizardStep label={tx('Vorhaben')} description={tx('Zu welchem Vorhaben gehört die Entscheidung?')}>
        <EntitySelectStep
          {...flow.picks.vorhaben.select}
          {...flow.pick('vorhaben')}
          searchPlaceholder={tx('Titel oder Problem suchen …')}
        />
      </WizardStep>
      <WizardStep
        label={tx('KI-Interaktion')}
        description={tx('Beruht die Entscheidung auf einer KI-Interaktion? Dann wähle sie aus — sonst überspringe den Schritt.')}
        needs={['vorhaben']}
      >
        <EntitySelectStep
          {...flow.picks.ki_interaktion.select}
          {...flow.pick('ki_interaktion')}
          searchPlaceholder={tx('Zweck oder Werkzeug suchen …')}
        />
        <StepNav
          onBack={() => setStep(1)}
          onNext={() => flow.validateStep(2)}
          nextStepLabel={tx('Entscheidung erfassen')}
        />
      </WizardStep>
      <WizardStep
        label={tx('Entscheidung')}
        description={tx('Was wurde entschieden — und warum?')}
        needs={['vorhaben']}
      >
        <div className="space-y-4">
          <Bound form={f} name="entscheidung" />
          <Bound form={f} name="entscheidungsart" />
          <Bound form={f} name="begruendung" rows={3} />
          <Bound form={f} name="alternativen" rows={3} />
        </div>
        <StepNav
          onBack={() => setStep(2)}
          onNext={() => flow.validateStep(3)}
          nextStepLabel={tx('Verantwortliche Person')}
        />
      </WizardStep>
      <WizardStep
        label={tx('Verantwortung')}
        description={tx('Wer verantwortet die Entscheidung und wie ist der Freigabestatus?')}
        needs={['entscheidung']}
      >
        <div className="space-y-4">
          <Bound form={f} name="verantwortlich_vorname" />
          <Bound form={f} name="verantwortlich_nachname" />
          <Bound form={f} name="freigabestatus" />
        </div>
        <StepNav
          onBack={() => setStep(3)}
          onNext={() => flow.validateStep(4)}
          nextStepLabel={tx('Prüfen')}
        />
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'datum', label: tx('Datum'), value: format(new Date(), 'dd.MM.yyyy') }]}
            whatHappensNext={tx('Die Entscheidung wird mit dem heutigen Datum beim Vorhaben dokumentiert.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Ergebnis nachweisen'), href: '#/intents/ergebnis-nachweisen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Halte als Nächstes das Ergebnis und den Nutzen dieser Entscheidung fest.')}
        />
      )}
    </IntentWizardShell>
  );
}
