/**
 * Multi-Language Ethiopic Profile System (Amharic, Tigrinya, Oromo, Ge'ez)
 */

import { FIDEL_FAMILIES, FamilyRules } from "./mapping.js";

export type LanguageId = "amharic" | "tigrinya" | "oromo" | "geez";

export interface LanguageProfile {
  id: LanguageId;
  name: string;
  nativeName: string;
  extraFamilies?: Record<string, FamilyRules>;
  wordOverrides?: Record<string, string>;
}

/** Tigrinya specific extra character families (e.g. ቐ, ቘ) */
export const TIGRINYA_EXTRA_FAMILIES: Record<string, FamilyRules> = {
  // qh (ቐ family)
  qh: { e: "ቐ", u: "ቑ", i: "ቒ", a: "ቓ", ee: "ቄ", "": "ቕ", o: "ቖ", wa: "ቛ" },
  // khw (ቘ family)
  khw: { e: "ቘ", u: "ቚ", i: "ቛ", a: "ቜ", ee: "ቝ", "": "ቝ", o: "ቘ" },
};

/** Ethiopic Language Profiles Definition */
export const LANGUAGE_PROFILES: Record<LanguageId, LanguageProfile> = {
  amharic: {
    id: "amharic",
    name: "Amharic",
    nativeName: "አማርኛ",
  },
  tigrinya: {
    id: "tigrinya",
    name: "Tigrinya",
    nativeName: "ትግርኛ",
    extraFamilies: TIGRINYA_EXTRA_FAMILIES,
    wordOverrides: {
      selam: "ሰላም",
      yihun: "ይኹን",
    },
  },
  oromo: {
    id: "oromo",
    name: "Oromo (Ethiopic)",
    nativeName: "ኦሮሞ",
    wordOverrides: {
      nagaa: "ነጋ",
      oromo: "ኦሮሞ",
    },
  },
  geez: {
    id: "geez",
    name: "Ge'ez",
    nativeName: "ግዕዝ",
    wordOverrides: {
      selam: "ሰላም",
      geez: "ግዕዝ",
    },
  },
};

export function getLanguageProfile(id: LanguageId = "amharic"): LanguageProfile {
  return LANGUAGE_PROFILES[id] ?? LANGUAGE_PROFILES.amharic;
}
