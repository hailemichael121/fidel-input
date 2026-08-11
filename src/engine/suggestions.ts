/**
 * Candidate Suggestion Engine for Homophones and Phonetic Variants
 */

import { FIDEL_FAMILIES } from "./mapping.js";

export interface CandidateSuggestion {
  latin: string;
  ethiopic: string;
  label: string;
  description?: string;
}

/** Map of phonetic consonant homophone families */
const HOMOPHONE_GROUPS: Record<string, string[]> = {
  h: ["h", "H", "hh", "h'"],
  H: ["H", "h", "hh", "h'"],
  hh: ["hh", "H", "h", "h'"],
  "h'": ["h'", "h", "H", "hh"],
  s: ["s", "ss"],
  ss: ["ss", "s"],
  a: ["a", "A", "ah"],
  A: ["A", "a", "ah"],
  ah: ["ah", "a", "A"],
  t: ["t", "T", "t'"],
  T: ["T", "t", "t'"],
  "t'": ["t'", "t", "T"],
  ts: ["ts", "tz", "Tz"],
  tz: ["tz", "ts", "Tz"],
};

import { transliterateText } from "./transliterator.js";

export class SuggestionEngine {
  /**
   * Generates candidate Ethiopic suggestions for a given Latin phonetic input.
   */
  public generateSuggestions(input: string, primaryResult: string): string[] {
    if (!input) {
      return [];
    }

    const suggestions: string[] = primaryResult ? [primaryResult] : [];

    // Find homophone alternatives by swapping consonant root prefixes
    for (const [prefix, alternatives] of Object.entries(HOMOPHONE_GROUPS)) {
      if (input.toLowerCase().startsWith(prefix.toLowerCase())) {
        const restOfWord = input.slice(prefix.length);
        for (const alt of alternatives) {
          if (alt.toLowerCase() === prefix.toLowerCase()) continue;
          const altInput = alt + restOfWord;
          const altResult = transliterateText(altInput);
          if (altResult && !suggestions.includes(altResult)) {
            suggestions.push(altResult);
          }
        }
      }
    }

    return suggestions;
  }

  /**
   * Generates detailed candidate objects for interactive QuickPick suggestion UI.
   */
  public getCandidateObjects(input: string, primaryResult: string): CandidateSuggestion[] {
    const rawSuggestions = this.generateSuggestions(input, primaryResult);
    return rawSuggestions.map((ethiopic, index) => ({
      latin: input,
      ethiopic,
      label: ethiopic,
      description: index === 0 ? "Default Transliteration" : `Homophone Variant ${index}`,
    }));
  }
}
