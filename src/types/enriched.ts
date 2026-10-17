import type { EntscheidungenUndFreigaben, ErgebnisseUndNutzen, Erkenntnisse, InformationenUndAnnahmen, KiInteraktionen } from './app';

export type EnrichedInformationenUndAnnahmen = InformationenUndAnnahmen & {
  vorhabenName: string;
};

export type EnrichedKiInteraktionen = KiInteraktionen & {
  vorhabenName: string;
  informationenName: string;
};

export type EnrichedEntscheidungenUndFreigaben = EntscheidungenUndFreigaben & {
  vorhabenName: string;
  ki_interaktionName: string;
};

export type EnrichedErgebnisseUndNutzen = ErgebnisseUndNutzen & {
  vorhabenName: string;
  entscheidungName: string;
};

export type EnrichedErkenntnisse = Erkenntnisse & {
  vorhabenName: string;
  ergebnisName: string;
};
