import { useEffect, useMemo, useState } from 'react';
import { PublicShell } from '@/components/PublicShell';
import {
  loadPublicPagesConfig,
  prepareChallenge,
  type PublicPagesConfig,
  type PublicPageConfig,
} from '@/lib/publicClient';
import { useStepForm, useJourneySubmit } from '@/lib/journey';
import { createPublicPort } from '@/lib/journey/publicPort';
import { IntentWizardShell } from '@/components/blocks/IntentWizardShell';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { Bound } from '@/components/blocks/Bound';
import { tx } from '@/i18n';

const SLUG = 'vorhaben-einreichen';


export default function VorhabenEinreichen() {
  const [cfg, setCfg] = useState<PublicPagesConfig | null>(null);
  const [page, setPage] = useState<PublicPageConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicPagesConfig(SLUG).then(c => {
      setCfg(c);
      setPage(c?.pages[SLUG] ?? null);
      setLoading(false);
    });
  }, []);

  if (loading || !cfg || !page) {
    return <PublicShell loading={loading} unavailable={!loading} />;
  }

  return (
    <PublicShell title={page.title} description={page.description}>
      <VorhabenWizard cfg={cfg} page={page} />
    </PublicShell>
  );
}

function VorhabenWizard({ cfg, page }: { cfg: PublicPagesConfig; page: PublicPageConfig }) {
  const [step, setStep] = useState(1);
  const port = useMemo(() => createPublicPort(cfg, page), [cfg, page]);

  const form = useStepForm('vorhaben', {
    fields: [
      'titel',
      'problem',
      'zielbild',
      'erfolgskriterien',
      'verantwortlich_vorname',
      'verantwortlich_nachname',
      'bereich',
      'startdatum',
      'zieldatum',
    ],
    required: {
      titel: true,
      problem: true,
      verantwortlich_vorname: true,
      verantwortlich_nachname: true,
    },
    steps: {
      titel: 1,
      problem: 1,
      zielbild: 2,
      erfolgskriterien: 2,
      verantwortlich_vorname: 3,
      verantwortlich_nachname: 3,
      bereich: 3,
      startdatum: 3,
      zieldatum: 3,
    },
    autoComplete: true,
  });

  const submit = useJourneySubmit(
    port,
    [{ key: 'vorhaben', entity: 'vorhaben', form, primary: true }],
    { draftKey: 'vorhaben-einreichen' },
  );

  const warm = () => prepareChallenge(cfg, page, 'POST', `/apps/${page.endpoints?.find(e => e.op === 'create')?.app_id}/records`);

  const STEPS = [
    { label: tx('Titel und Problem'), description: tx('Worum geht es bei deinem Vorhaben? Du brauchst dafür kein Login.') },
    { label: tx('Zielbild und Erfolgskriterien'), description: tx('Wie soll es nachher aussehen und woran erkennst du den Erfolg?') },
    { label: tx('Verantwortliche Person und Zeitraum'), description: tx('Wer kümmert sich darum und in welchem Zeitraum?') },
    { label: tx('Prüfen und einreichen') },
  ];

  const restart = () => {
    submit.reset();
    form.reset();
    setStep(1);
  };

  return (
    <div onFocusCapture={warm}>
      <IntentWizardShell
        steps={STEPS}
        currentStep={step}
        onStepChange={setStep}
        back={false}
        forms={[form]}
        draftKey="vorhaben-einreichen"
      >
        {step === 1 && (
          <>
            <Bound form={form} name="titel" />
            <Bound form={form} name="problem" rows={5} />
            <StepNav
              hideBack
              onNext={() => form.validate(['titel', 'problem'])}
              nextStepLabel={tx('Zielbild')}
            />
          </>
        )}
        {step === 2 && (
          <>
            <Bound form={form} name="zielbild" rows={4} />
            <Bound form={form} name="erfolgskriterien" rows={4} />
            <StepNav
              onBack={() => setStep(1)}
              onNext={() => form.validate(['zielbild', 'erfolgskriterien'])}
              nextStepLabel={tx('Verantwortliche Person')}
            />
          </>
        )}
        {step === 3 && (
          <>
            <Bound form={form} name="verantwortlich_vorname" />
            <Bound form={form} name="verantwortlich_nachname" />
            <Bound form={form} name="bereich" />
            <Bound form={form} name="startdatum" />
            <Bound form={form} name="zieldatum" />
            <StepNav
              onBack={() => setStep(2)}
              onNext={() =>
                form.validate(['verantwortlich_vorname', 'verantwortlich_nachname', 'bereich', 'startdatum', 'zieldatum'])
              }
              nextStepLabel={tx('Prüfen')}
            />
          </>
        )}
        {step === 4 && !submit.done && (
          <SummaryStep
            forms={[form]}
            submit={submit}
            whatHappensNext={tx('Dein Vorhaben wird eingereicht. Das Team meldet sich bei Bedarf bei dir.')}
          />
        )}
        {submit.result && (
          <SuccessStep
            result={submit.result}
            forms={[form]}
            title={tx('Vorhaben eingereicht')}
            whatHappensNext={tx('Danke! Das Team prüft dein Vorhaben und übernimmt es in die Planung.')}
            next={[{ label: tx('Weiteres Vorhaben einreichen'), onClick: restart }]}
          />
        )}
      </IntentWizardShell>
    </div>
  );
}
