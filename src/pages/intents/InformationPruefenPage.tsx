/**
 * Information prüfen — 3-Schritt-Wizard plus Prüfen.
 * Steps: 1) Ungeprüfte Information wählen → 2) Prüfstatus und Vertrauensgrad setzen → 3) Prüfhinweis erfassen → 4) Prüfen & speichern.
 * Reads: informationen_und_annahmen. Writes: informationen_und_annahmen (update: pruefstatus, vertrauensgrad, pruefhinweis).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup, fieldDate } from '@/lib/journey';
import { useInformationPruefenFlow } from '@/lib/journey/flows/InformationPruefen';
import { tx } from '@/i18n';

export default function InformationPruefenPage() {
  const [step, setStep] = useState(1);
  const flow = useInformationPruefenFlow({
    steps: { informationen_und_annahmen: 1, pruefstatus: 2, vertrauensgrad: 2, pruefhinweis: 3 },
    items: {
      informationen_und_annahmen: r => {
        const gueltig = fieldDate(r, 'gueltig_bis');
        return {
          id: r.id,
          title: fieldText(r, 'bezeichnung'),
          subtitle: [fieldLookup(r, 'art')?.label, gueltig ? tx`gültig bis ${gueltig}` : null].filter(Boolean).join(' · '),
          status: fieldLookup(r, 'pruefstatus') ?? undefined,
        };
      },
    },
  });
  const f = flow.forms.informationen_und_annahmen;

  return (
    <IntentWizardShell
      title={tx('Information prüfen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Ungeprüfte Informationen und Annahmen bestätigen, widerlegen oder als veraltet markieren.'),
        needs: [tx('Die Information, die du prüfen willst'), tx('Dein Prüfergebnis')],
      }}
    >
      <WizardStep label={tx('Information')} heading={tx('Information wählen')} description={tx('Welche ungeprüfte oder veraltete Information willst du prüfen?')}>
        <EntitySelectStep
          {...flow.picks.informationen_und_annahmen.select}
          {...flow.pick('informationen_und_annahmen')}
          searchPlaceholder={tx('Bezeichnung, Inhalt oder Quelle …')}
          emptyText={tx('Keine ungeprüfte oder veraltete Information vorhanden.')}
        />
      </WizardStep>
      <WizardStep label={tx('Ergebnis')} heading={tx('Prüfstatus und Vertrauensgrad')} description={tx('Wie fällt deine Prüfung aus und wie sicher bist du?')} needs={['informationen_und_annahmen']}>
        <div className="space-y-4">
          <Bound form={f} name="pruefstatus" />
          <Bound form={f} name="vertrauensgrad" allowClear />
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Prüfhinweis')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Hinweis')} heading={tx('Prüfhinweis erfassen')} description={tx('Halte kurz fest, woran du dein Ergebnis festmachst.')} needs={['informationen_und_annahmen']}>
        <div className="space-y-4">
          <Bound form={f} name="pruefhinweis" rows={4} />
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Der Prüfstatus der Information wird sofort aktualisiert.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('KI-Interaktion dokumentieren'), href: '#/intents/ki-interaktion-dokumentieren' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
