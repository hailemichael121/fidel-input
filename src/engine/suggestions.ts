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

import { COMMON_WORD_MAP } from "./mapping.js";
import { transliterateText } from "./transliterator.js";
import { FidelTrie } from "./trie.js";

/** Map of phonetic consonant homophone families and spelling variants */
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
  ts: ["ts", "tz", "Tz", "S'"],
  tz: ["tz", "ts", "Tz", "S'"],
  Tz: ["Tz", "ts", "tz", "S'"],
  k: ["k", "q", "k'"],
  q: ["q", "k", "k'"],
  "k'": ["k'", "k", "q"],
  c: ["c", "ch", "c'"],
  ch: ["ch", "c", "c'"],
  "c'": ["c'", "ch", "c"],
  p: ["p", "p'"],
  "p'": ["p'", "p"],
  z: ["z", "zh", "Z"],
  zh: ["zh", "z", "Z"],
  Z: ["Z", "z", "zh"],
};

export class SuggestionEngine {
  private trie = new FidelTrie();

  /**
   * Generates candidate Ethiopic suggestions for a given Latin phonetic input.
   */
  public generateSuggestions(input: string, primaryResult: string): string[] {
    if (!input) {
      return [];
    }

    const suggestions: string[] = primaryResult ? [primaryResult] : [];

    // Check common word dictionary match
    const commonMatch = COMMON_WORD_MAP[input.toLowerCase()];
    if (commonMatch && !suggestions.includes(commonMatch)) {
      suggestions.push(commonMatch);
    }

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

  /**
   * Detects if the input ends with a consonant+vowel sequence that could be a standalone split,
   * and returns a candidate suggestion with a shortcut tip.
   */
  public getAmbiguousSplitCandidate(input: string, primaryResult: string): CandidateSuggestion | null {
    if (!input || input.length < 2) return null;

    // Avoid false positives on established dictionary words (e.g. abebe, bet)
    if (COMMON_WORD_MAP[input.toLowerCase()]) return null;

    const lastChar = input.slice(-1);
    const vowelChars = new Set(["e", "E", "i", "I", "u", "U", "o", "O", "a", "A"]);
    if (!vowelChars.has(lastChar)) return null;

    const prev = input.slice(0, -1);
    const prevSearch = this.trie.search(prev);
    const fullSearch = this.trie.search(input);

    // Bare terminal consonant was isEnd: true and canContinue: true, and input extends it
    if (prevSearch.type === "exact" && prevSearch.canContinue && fullSearch.type === "exact") {
      const standaloneSplit = (prevSearch.output ?? "") + transliterateText(lastChar);
      if (standaloneSplit === primaryResult) return null;

      let tip = "";
      const lowerVowel = lastChar.toLowerCase();
      if (lowerVowel === "e") {
        tip = `Type capital E (e.g. "${prev}E") for "${standaloneSplit}" instead of "${primaryResult}"`;
      } else if (lowerVowel === "i") {
        tip = `Type capital I (e.g. "${prev}I") for "${standaloneSplit}" instead of "${primaryResult}"`;
      } else if (lowerVowel === "u") {
        tip = `Type capital U (e.g. "${prev}U") for "${standaloneSplit}" instead of "${primaryResult}"`;
      } else if (lowerVowel === "o") {
        tip = `Type capital O (e.g. "${prev}O") for "${standaloneSplit}" instead of "${primaryResult}"`;
      } else {
        tip = `Use boundary "-" (e.g. "${prev}-${lastChar}") for "${standaloneSplit}" instead of "${primaryResult}"`;
      }

      return {
        latin: input,
        ethiopic: standaloneSplit,
        label: standaloneSplit,
        description: `Split Alternative: ${tip}`,
      };
    }

    return null;
  }
}
