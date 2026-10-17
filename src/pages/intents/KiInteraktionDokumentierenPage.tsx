/**
 * KI-Interaktion dokumentieren — 4-Schritt-Wizard.
 * Steps: 1) Vorhaben wählen → 2) Werkzeug, Zweck und Eingabe erfassen → 3) Genutzte Informationen auswählen
 *        → 4) KI-Ergebnis und Bewertung mit Korrekturen und Prüfer erfassen → Prüfen & anlegen.
 * Reads: vorhaben, informationen_und_annahmen. Writes: ki_interaktionen (Zeitpunkt setzt der Flow selbst).
 * Composes: IntentWizardShell, EntitySelectStep, Field, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { Field } from '@/components/blocks/Field';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup, fieldDate } from '@/lib/journey';
import { useKiInteraktionDokumentierenFlow } from '@/lib/journey/flows/KiInteraktionDokumentieren';
import { tx } from '@/i18n';

export default function KiInteraktionDokumentierenPage() {
  const [step, setStep] = useState(1);
  const flow = useKiInteraktionDokumentierenFlow({
    steps: {
      vorhaben: 1,
      werkzeug: 2, zweck: 2, eingabe: 2,
      informationen: 3,
      ki_ergebnis: 4, bewertung: 4, korrekturen: 4, pruefer_vorname: 4, pruefer_nachname: 4,
    },
    items: {
      vorhaben: r => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: fieldLookup(r, 'status')?.label,
      }),
      informationen: r => {
        const bis = fieldDate(r, 'gueltig_bis');
        return {
          id: r.id,
          title: fieldText(r, 'bezeichnung'),
          subtitle: [fieldLookup(r, 'art')?.label, fieldLookup(r, 'pruefstatus')?.label, bis ? tx`gültig bis ${bis}` : '']
            .filter(Boolean)
            .join(' · '),
        };
      },
    },
  });
  const f = flow.forms.ki_interaktionen;

  return (
    <IntentWizardShell
      title={tx('KI-Interaktion dokumentieren')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine KI-Nutzung mit Informationen, Ergebnis und menschlicher Bewertung festhalten.'),
        needs: [tx('Vorhaben'), tx('Eingesetztes KI-Werkzeug und Zweck'), tx('Bewertung des KI-Ergebnisses')],
      }}
    >
      <WizardStep label={tx('Vorhaben')} description={tx('Zu welchem Vorhaben gehört die KI-Nutzung?')}>
        <EntitySelectStep
          {...flow.picks.vorhaben.select}
          {...flow.pick('vorhaben')}
          searchPlaceholder={tx('Titel oder Problem suchen …')}
        />
      </WizardStep>

      <WizardStep label={tx('Eingabe')} description={tx('Welches Werkzeug hast du wofür genutzt, und was hast du eingegeben?')}>
        <div className="space-y-4">
          <Bound form={f} name="werkzeug" />
          <Bound form={f} name="zweck" />
          <Bound form={f} name="eingabe" rows={4} />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Informationen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Informationen')} description={tx('Welche Informationen oder Annahmen sind in die Eingabe eingeflossen?')}>
        <div className="space-y-4">
          <Field form={f} name="informationen">
            <EntitySelectStep
              {...flow.picks.informationen.select}
              {...flow.pickMany('informationen')}
              searchPlaceholder={tx('Bezeichnung, Inhalt oder Quelle suchen …')}
            />
          </Field>
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Ergebnis und Bewertung')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Bewertung')} description={tx('Was hat die KI geliefert, und wie hast du es bewertet?')}>
        <div className="space-y-4">
          <Bound form={f} name="ki_ergebnis" rows={5} />
          <Bound form={f} name="bewertung" />
          <Bound form={f} name="korrekturen" rows={3} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Bound form={f} name="pruefer_vorname" />
            <Bound form={f} name="pruefer_nachname" />
          </div>
          <StepNav
            onBack={() => setStep(3)}
            onNext={() => flow.validateStep(4)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'zeitpunkt', label: tx('Zeitpunkt'), value: tx('Jetzt (wird automatisch gesetzt)') }]}
            whatHappensNext={tx('Die KI-Interaktion wird dem Vorhaben zugeordnet und ist danach nachvollziehbar dokumentiert.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          whatHappensNext={tx('Auf dieser Grundlage kannst du eine Entscheidung oder Freigabe festhalten.')}
          next={[
            { label: tx('Entscheidung festhalten'), href: '#/intents/entscheidung-festhalten' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
