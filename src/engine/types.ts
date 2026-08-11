export interface FamilyRules {
  e: string;
  u: string;
  i: string;
  a: string;
  ee: string;
  "": string;
  o: string;
  wa?: string;
}

export interface MappingRule {
  input: string;
  output: string;
}

export interface TransliterationMatch {
  output: string;
  consumed: number;
  terminal: boolean;
}

export type MatchType = "exact" | "prefix" | "none";

export interface MatchResult {
  type?: MatchType;
  output?: string | null;
  consumed?: number;
  matchedLength?: number;
  terminal?: boolean;
  canContinue?: boolean;
}

export interface CompositionState {
  buffer: string;
  rendered: string;
  committed: boolean;
  replaceLength: number;
  raw: string;
  output: string;
}

export interface LegacyCompositionState {
  buffer: string;
  rendered: string;
  committed?: boolean;
  replaceLength?: number;
}

export interface TransliterationOptions {
  caseSensitive?: boolean;
  convertPunctuation?: boolean;
  convertNumbers?: boolean;
  dictionary?: Record<string, string>;
  smartCorrection?: boolean;
  suggestions?: boolean;
}

export type FidelOptions = TransliterationOptions;
