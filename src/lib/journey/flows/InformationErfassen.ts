/**
 * useInformationErfassenFlow — the plumbing of the flow « Information oder Annahme erfassen », generated from the plan.
 *
 * Writes `informationen_und_annahmen`: asks `vorhaben`, `bezeichnung`, `art`, `inhalt`, `quelle`, `zustaendig_vorname`, `zustaendig_nachname`, `gueltig_bis`, `vertrauensgrad`; sets `pruefstatus` itself.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 3)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useInformationErfassenFlow({
 *     steps: { vorhaben: 1, bezeichnung: 2, art: 2, inhalt: 2, quelle: 2, zustaendig_vorname: 2, zustaendig_nachname: 2, gueltig_bis: 2, vertrauensgrad: 2 },
 *     items: { vorhaben: r => ({ id: r.id, title: fieldText(r, 'titel') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <EntitySelectStep {...flow.picks.vorhaben.select} {...flow.pick('vorhaben')} />
 *     <Bound form={flow.forms.informationen_und_annahmen} name="bezeichnung" />
 *     <Bound form={flow.forms.informationen_und_annahmen} name="art" />
 *     <Bound form={flow.forms.informationen_und_annahmen} name="inhalt" />
 *     <Bound form={flow.forms.informationen_und_annahmen} name="quelle" />
 *     <Bound form={flow.forms.informationen_und_annahmen} name="zustaendig_vorname" />
 *     <Bound form={flow.forms.informationen_und_annahmen} name="zustaendig_nachname" />
 *     <Bound form={flow.forms.informationen_und_annahmen} name="gueltig_bis" />
 *     <Bound form={flow.forms.informationen_und_annahmen} name="vertrauensgrad" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep, type SummaryItem,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
export type InformationErfassenFieldKey = 'art' | 'bezeichnung' | 'gueltig_bis' | 'inhalt' | 'quelle' | 'vertrauensgrad' | 'vorhaben' | 'zustaendig_nachname' | 'zustaendig_vorname';

export interface InformationErfassenForms {
  informationen_und_annahmen: StepForm<'informationen_und_annahmen'>;
}

// Alias so the option generics stay readable.
type Key = InformationErfassenFieldKey;

export interface InformationErfassenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    vorhaben?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"art": 2, "bezeichnung": 2, "gueltig_bis": 2, "inhalt": 2, "quelle": 2, "vertrauensgrad": 2, "vorhaben": 1, "zustaendig_nachname": 2, "zustaendig_vorname": 2};
export const INFORMATIONERFASSEN_REVIEW_STEP = 3;

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

export function useInformationErfassenFlow(options: InformationErfassenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const informationen_und_annahmen = useStepForm('informationen_und_annahmen', {
    fields: ["vorhaben", "bezeichnung", "art", "inhalt", "quelle", "zustaendig_vorname", "zustaendig_nachname", "gueltig_bis", "vertrauensgrad"],
    steps: only(steps, ["vorhaben", "bezeichnung", "art", "inhalt", "quelle", "zustaendig_vorname", "zustaendig_nachname", "gueltig_bis", "vertrauensgrad"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["vorhaben", "bezeichnung", "art", "inhalt", "quelle", "zustaendig_vorname", "zustaendig_nachname", "gueltig_bis", "vertrauensgrad"]),
    messages: only(options.messages as Record<string, string> | undefined, ["vorhaben", "bezeichnung", "art", "inhalt", "quelle", "zustaendig_vorname", "zustaendig_nachname", "gueltig_bis", "vertrauensgrad"]),
  });
  const forms: InformationErfassenForms = { informationen_und_annahmen };
  const formList: StepForm[] = [informationen_und_annahmen];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    vorhaben: useRecordSearch(servicePort, 'vorhaben', withPickPolicy('vorhaben', {
      searchFields: ["titel"] as never,
      filter: "r.v_status in ['geplant', 'in_arbeit', 'pausiert']",
      where: (r: JourneyRecord) => ["geplant", "in_arbeit", "pausiert"].includes(fieldLookup(r, "status")?.key ?? ''),
      toItem: options.items?.vorhaben as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:information-erfassen:read:${entity}`);
  // a fixed value the flow sets itself, as a review row with the link that changes it
  const setting = (entity: EntityKey, field: string, value: unknown): SummaryItem => ({
    key: `setting:${entity}.${field}`, label: labelOf(entity, field),
    value: optionsOf(entity, field).find(o => o.key === String(value))?.label ?? String(value ?? ''),
    href: `#/verwaltung/anwendung?line=intent:information-erfassen:write:${entity}.${field}`,
  });
  const picks = {
    vorhaben: { ...searches.vorhaben, select: { ...searches.vorhaben.select, create: false as boolean, hint: hintFor('vorhaben', 'vorhaben', {"conditions": [{"field": "status", "op": "in", "value": ["geplant", "in_arbeit", "pausiert"]}], "mode": "any"} as PickWhere | null) } },
  };

  const plan: PlanStep[] = [
    {
      key: 'informationen_und_annahmen', entity: 'informationen_und_annahmen', form: informationen_und_annahmen, primary: true,
      values: (): FormValues => ({
        pruefstatus: policyFixedValue('informationen_und_annahmen', 'pruefstatus') ?? "ungeprueft",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('informationen_und_annahmen', 'pruefstatus', policyFixedValue('informationen_und_annahmen', 'pruefstatus') ?? "ungeprueft")],
    },
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'information-erfassen' });

  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: InformationErfassenFieldKey) => {
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
  const pickMany = (field: InformationErfassenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)));
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); };

  return {
    slug: 'information-erfassen' as const,
    draftKey: 'information-erfassen' as const,
    entity: 'informationen_und_annahmen' as const,
    form: informationen_und_annahmen,
    forms, formList, picks, submit, steps,    reviewStep: INFORMATIONERFASSEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type InformationErfassenFlow = ReturnType<typeof useInformationErfassenFlow>;
