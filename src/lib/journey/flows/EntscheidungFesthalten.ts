/**
 * useEntscheidungFesthaltenFlow — the plumbing of the flow « Entscheidung oder Freigabe festhalten », generated from the plan.
 *
 * Writes `entscheidungen_und_freigaben`: asks `vorhaben`, `ki_interaktion`, `entscheidung`, `entscheidungsart`, `begruendung`, `alternativen`, `verantwortlich_vorname`, `verantwortlich_nachname`, `freigabestatus`; sets `datum` itself.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 4)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useEntscheidungFesthaltenFlow({
 *     steps: { vorhaben: 1, ki_interaktion: 2, entscheidung: 3, entscheidungsart: 3, begruendung: 3, alternativen: 3, verantwortlich_vorname: 3, verantwortlich_nachname: 3, freigabestatus: 3 },
 *     items: { vorhaben: r => ({ id: r.id, title: fieldText(r, 'titel') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <EntitySelectStep {...flow.picks.vorhaben.select} {...flow.pick('vorhaben')} />
 *     <EntitySelectStep {...flow.picks.ki_interaktion.select} {...flow.pick('ki_interaktion')} />
 *     <Bound form={flow.forms.entscheidungen_und_freigaben} name="entscheidung" />
 *     <Bound form={flow.forms.entscheidungen_und_freigaben} name="entscheidungsart" />
 *     <Bound form={flow.forms.entscheidungen_und_freigaben} name="begruendung" />
 *     <Bound form={flow.forms.entscheidungen_und_freigaben} name="alternativen" />
 *     <Bound form={flow.forms.entscheidungen_und_freigaben} name="verantwortlich_vorname" />
 *     <Bound form={flow.forms.entscheidungen_und_freigaben} name="verantwortlich_nachname" />
 *     <Bound form={flow.forms.entscheidungen_und_freigaben} name="freigabestatus" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
export type EntscheidungFesthaltenFieldKey = 'alternativen' | 'begruendung' | 'entscheidung' | 'entscheidungsart' | 'freigabestatus' | 'ki_interaktion' | 'verantwortlich_nachname' | 'verantwortlich_vorname' | 'vorhaben';

export interface EntscheidungFesthaltenForms {
  entscheidungen_und_freigaben: StepForm<'entscheidungen_und_freigaben'>;
}

// Alias so the option generics stay readable.
type Key = EntscheidungFesthaltenFieldKey;

export interface EntscheidungFesthaltenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    vorhaben?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    ki_interaktion?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"alternativen": 3, "begruendung": 3, "entscheidung": 3, "entscheidungsart": 3, "freigabestatus": 3, "ki_interaktion": 2, "verantwortlich_nachname": 3, "verantwortlich_vorname": 3, "vorhaben": 1};
export const ENTSCHEIDUNGFESTHALTEN_REVIEW_STEP = 4;

function fromPick<T>(pick: { recordOf(id: string): JourneyRecord | undefined }, form: StepForm, field: string, read: (r: JourneyRecord) => T): T | undefined {
  const id = form.get(field);
  const rec = typeof id === 'string' && id ? pick.recordOf(id) : undefined;
  return rec ? read(rec) : undefined;
}
function isoDaysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Returns T, not Partial<T>: a Record's index signature is already "maybe
// absent", and Partial<Record<string, string>> does not assign to the
// Record<string, string> useStepForm wants (tsc, live 23.09.2026 — eight
// errors, one per hook, caught only in the sandbox build).
function only<T extends Record<string, unknown>>(obj: T | undefined, keys: string[]): T | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out as T;
}

function hasValues(form: StepForm): boolean {
  return form.keys.some(k => !isEmptyValue(form.values[k]));
}

export function useEntscheidungFesthaltenFlow(options: EntscheidungFesthaltenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const entscheidungen_und_freigaben = useStepForm('entscheidungen_und_freigaben', {
    fields: ["vorhaben", "ki_interaktion", "entscheidung", "entscheidungsart", "begruendung", "alternativen", "verantwortlich_vorname", "verantwortlich_nachname", "freigabestatus"],
    steps: only(steps, ["vorhaben", "ki_interaktion", "entscheidung", "entscheidungsart", "begruendung", "alternativen", "verantwortlich_vorname", "verantwortlich_nachname", "freigabestatus"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["vorhaben", "ki_interaktion", "entscheidung", "entscheidungsart", "begruendung", "alternativen", "verantwortlich_vorname", "verantwortlich_nachname", "freigabestatus"]),
    messages: only(options.messages as Record<string, string> | undefined, ["vorhaben", "ki_interaktion", "entscheidung", "entscheidungsart", "begruendung", "alternativen", "verantwortlich_vorname", "verantwortlich_nachname", "freigabestatus"]),
  });
  const forms: EntscheidungFesthaltenForms = { entscheidungen_und_freigaben };
  const formList: StepForm[] = [entscheidungen_und_freigaben];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    vorhaben: useRecordSearch(servicePort, 'vorhaben', withPickPolicy('vorhaben', {
      searchFields: ["titel"] as never,
      toItem: options.items?.vorhaben as never,
    })),
    ki_interaktion: useRecordSearch(servicePort, 'ki_interaktionen', withPickPolicy('ki_interaktion', {
      searchFields: ["zweck"] as never,
      filter: "r.v_bewertung != 'verworfen'",
      where: (r: JourneyRecord) => (fieldLookup(r, "bewertung")?.key ?? null) !== "verworfen",
      toItem: options.items?.ki_interaktion as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:entscheidung-festhalten:read:${entity}`);
  const picks = {
    vorhaben: { ...searches.vorhaben, select: { ...searches.vorhaben.select, create: false as boolean, hint: hintFor('vorhaben', 'vorhaben', null as PickWhere | null) } },
    ki_interaktion: { ...searches.ki_interaktion, select: { ...searches.ki_interaktion.select, create: false as boolean, hint: hintFor('ki_interaktion', 'ki_interaktionen', {"conditions": [{"field": "bewertung", "op": "ne", "value": "verworfen"}], "mode": "all"} as PickWhere | null) } },
  };

  const plan: PlanStep[] = [
    {
      key: 'entscheidungen_und_freigaben', entity: 'entscheidungen_und_freigaben', form: entscheidungen_und_freigaben, primary: true,
      values: (): FormValues => ({
        datum: policyFixedValue('entscheidungen_und_freigaben', 'datum') ?? todayIso(),
      }),
    },
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'entscheidung-festhalten' });

  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: EntscheidungFesthaltenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return {
      selectedId: (typeof owner.get(field) === 'string' ? (owner.get(field) as string) : null) || null,
      // `field as never` collapsed the conditional SetArgs<E, never> to never and
      // no argument was assignable any more (tsc, live 23.09.2026); widen `set`
      // itself instead — the label stays a required third argument.
      onSelect: (id: string) => (owner.set as (k: string, v: unknown, l?: string) => void)(field, id, search?.labelOf(id)),
    };
  };
  /** Props for a multi-record pick step: {...flow.picks.x.select} {...flow.pickMany('x')} */
  const pickMany = (field: EntscheidungFesthaltenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)));
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); };

  return {
    slug: 'entscheidung-festhalten' as const,
    draftKey: 'entscheidung-festhalten' as const,
    entity: 'entscheidungen_und_freigaben' as const,
    form: entscheidungen_und_freigaben,
    forms, formList, picks, submit, steps,    reviewStep: ENTSCHEIDUNGFESTHALTEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type EntscheidungFesthaltenFlow = ReturnType<typeof useEntscheidungFesthaltenFlow>;
