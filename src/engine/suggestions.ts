/**
 * Candidate Suggestion Engine for Homophones and Phonetic Variants
 */

import { FIDEL_FAMILIES } from "./mapping.js";

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

export class SuggestionEngine {
  /**
   * Generates candidate Ethiopic suggestions for a given Latin phonetic input.
   */
  public generateSuggestions(input: string, primaryResult: string): string[] {
    if (!input || !primaryResult) {
      return [];
    }

    const suggestions: string[] = [primaryResult];

    // Find homophone alternatives for prefix consonant root
    for (const [prefix, alternatives] of Object.entries(HOMOPHONE_GROUPS)) {
      if (input.toLowerCase().startsWith(prefix.toLowerCase())) {
        const suffix = input.slice(prefix.length);
        for (const alt of alternatives) {
          if (alt === prefix) continue;
          const family = FIDEL_FAMILIES[alt];
          if (family) {
            const vowelOrder = (suffix in family ? suffix : "") as keyof typeof family;
            const ethChar = family[vowelOrder];
            if (ethChar && !suggestions.includes(ethChar)) {
              suggestions.push(ethChar);
            }
          }
        }
      }
    }

    return suggestions;
  }
}
