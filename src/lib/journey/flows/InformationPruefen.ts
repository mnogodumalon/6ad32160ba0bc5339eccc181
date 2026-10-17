/**
 * useInformationPruefenFlow — the plumbing of the flow « Information prüfen », generated from the plan.
 *
 * Changes `informationen_und_annahmen`: the record to change is picked (`flow.pick('informationen_und_annahmen')`), the form is prefilled with its values; asks `pruefstatus`, `vertrauensgrad`, `pruefhinweis`.
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
 *   const flow = useInformationPruefenFlow({
 *     steps: { informationen_und_annahmen: 1, pruefstatus: 2, vertrauensgrad: 2, pruefhinweis: 2 },
 *     items: { informationen_und_annahmen: r => ({ id: r.id, title: fieldText(r, 'bezeichnung') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.informationen_und_annahmen.select} {...flow.pick('informationen_und_annahmen')} />
 *     <Bound form={flow.forms.informationen_und_annahmen} name="pruefstatus" />
 *     <Bound form={flow.forms.informationen_und_annahmen} name="vertrauensgrad" />
 *     <Bound form={flow.forms.informationen_und_annahmen} name="pruefhinweis" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import { useState } from 'react';
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
import { entityLabel } from '@/lib/journey/rules';
export type InformationPruefenFieldKey = 'informationen_und_annahmen' | 'pruefhinweis' | 'pruefstatus' | 'vertrauensgrad';

export interface InformationPruefenForms {
  informationen_und_annahmen: StepForm<'informationen_und_annahmen'>;
}

// Alias so the option generics stay readable.
type Key = InformationPruefenFieldKey;

export interface InformationPruefenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    informationen_und_annahmen?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"informationen_und_annahmen": 1, "pruefhinweis": 2, "pruefstatus": 2, "vertrauensgrad": 2};
export const INFORMATIONPRUEFEN_REVIEW_STEP = 3;

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

export function useInformationPruefenFlow(options: InformationPruefenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const [informationen_und_annahmenTargetId, setInformationenUndAnnahmenTargetId] = useState<string | null>(null);
  const informationen_und_annahmen = useStepForm('informationen_und_annahmen', {
    fields: ["pruefstatus", "vertrauensgrad", "pruefhinweis"],
    steps: only(steps, ["pruefstatus", "vertrauensgrad", "pruefhinweis"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["pruefstatus", "vertrauensgrad", "pruefhinweis"]),
    messages: only(options.messages as Record<string, string> | undefined, ["pruefstatus", "vertrauensgrad", "pruefhinweis"]),
  });
  const forms: InformationPruefenForms = { informationen_und_annahmen };
  const formList: StepForm[] = [informationen_und_annahmen];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    informationen_und_annahmen: useRecordSearch(servicePort, 'informationen_und_annahmen', withPickPolicy('informationen_und_annahmen', {
      searchFields: ["bezeichnung", "inhalt"] as never,
      filter: "r.v_pruefstatus == 'ungeprueft' or r.v_gueltig_bis < today()",
      where: (r: JourneyRecord) => (fieldLookup(r, "pruefstatus")?.key ?? null) === "ungeprueft" || (fieldDate(r, "gueltig_bis") ?? '') < isoDaysFromToday(0),
      toItem: options.items?.informationen_und_annahmen as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:information-pruefen:read:${entity}`);
  const picks = {
    informationen_und_annahmen: { ...searches.informationen_und_annahmen, select: { ...searches.informationen_und_annahmen.select, create: false as boolean, hint: hintFor('informationen_und_annahmen', 'informationen_und_annahmen', {"conditions": [{"field": "pruefstatus", "op": "eq", "value": "ungeprueft"}, {"field": "gueltig_bis", "op": "lt", "value": {"rel": "today"}}], "mode": "any"} as PickWhere | null) } },
  };

  const plan: PlanStep[] = [
    {
      key: 'informationen_und_annahmen', entity: 'informationen_und_annahmen', form: informationen_und_annahmen, primary: true,
      updates: () => informationen_und_annahmenTargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => informationen_und_annahmenTargetId
        ? { key: 'target:informationen_und_annahmen', label: entityLabel('informationen_und_annahmen'), value: picks.informationen_und_annahmen.labelOf(informationen_und_annahmenTargetId) ?? informationen_und_annahmenTargetId, step: steps.informationen_und_annahmen }
        : undefined,    },
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'information-pruefen' });

  /** The record(s) this flow CHANGES: picked through {...flow.picks.<entity>.select} {...flow.pick('<entity>')};
   *  picking prefills the form with the record's current values, and the plan step updates that record. */
  const targets = {
    informationen_und_annahmen: {
      selectedId: informationen_und_annahmenTargetId,
      onSelect: (id: string) => {
        setInformationenUndAnnahmenTargetId(id);
        const rec = picks.informationen_und_annahmen.recordOf(id);
        if (rec) informationen_und_annahmen.reset({ pruefstatus: fieldLookup(rec, "pruefstatus")?.key, vertrauensgrad: fieldLookup(rec, "vertrauensgrad")?.key, pruefhinweis: fieldText(rec, "pruefhinweis"), });
      },
      get record(): JourneyRecord | undefined { return informationen_und_annahmenTargetId ? picks.informationen_und_annahmen.recordOf(informationen_und_annahmenTargetId) : undefined; },
    },
  };
  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: InformationPruefenFieldKey) => {
    if (field in targets) {
      const t = targets[field as keyof typeof targets];
      return { selectedId: t.selectedId, onSelect: t.onSelect };
    }
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
  const pickMany = (field: InformationPruefenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)))    && Object.entries(targets).every(([k, t]) => steps[k] !== n || !!t.selectedId);
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); setInformationenUndAnnahmenTargetId(null); };

  return {
    slug: 'information-pruefen' as const,
    draftKey: 'information-pruefen' as const,
    entity: 'informationen_und_annahmen' as const,
    form: informationen_und_annahmen,
    forms, formList, picks, submit, steps, targets,    reviewStep: INFORMATIONPRUEFEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type InformationPruefenFlow = ReturnType<typeof useInformationPruefenFlow>;
