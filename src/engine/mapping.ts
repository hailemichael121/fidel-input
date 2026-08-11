export interface FamilyRules {
  e: string;   // 1st order (ግዕዝ)
  u: string;   // 2nd order (ካዕብ)
  i: string;   // 3rd order (ሣልስ)
  a: string;   // 4th order (ራብዕ)
  ee: string;  // 5th order (ኃምስ)
  "": string;  // 6th order (ሳድስ) - default/bare consonant
  o: string;   // 7th order (ሣብዕ)
  wa?: string; // 8th order (ዲቃላ/labialized)
}

export const FIDEL_FAMILIES: Record<string, FamilyRules> = {
  // h (ሀ)
  h: { e: "ሀ", u: "ሁ", i: "ሂ", a: "ሃ", ee: "ሄ", "": "ህ", o: "ሆ", wa: "ኋ" },
  // l (ለ)
  l: { e: "ለ", u: "ሉ", i: "ሊ", a: "ላ", ee: "ሌ", "": "ል", o: "ሎ", wa: "ሏ" },
  // H / hh (ሐ)
  H: { e: "ሐ", u: "ሑ", i: "ሒ", a: "ሓ", ee: "ሔ", "": "ሕ", o: "ሖ", wa: "ሗ" },
  hh: { e: "ሐ", u: "ሑ", i: "ሒ", a: "ሓ", ee: "ሔ", "": "ሕ", o: "ሖ", wa: "ሗ" },
  // m (መ)
  m: { e: "መ", u: "ሙ", i: "ሚ", a: "ማ", ee: "ሜ", "": "ም", o: "ሞ", wa: "ሟ" },
  // ss (ሠ)
  ss: { e: "ሠ", u: "ሡ", i: "ሢ", a: "ሣ", ee: "ሤ", "": "ሥ", o: "ሦ", wa: "ሧ" },
  // r (ረ)
  r: { e: "ረ", u: "ሩ", i: "ሪ", a: "ራ", ee: "ሬ", "": "ር", o: "ሮ", wa: "ሯ" },
  // s (ሰ)
  s: { e: "ሰ", u: "ሱ", i: "ሲ", a: "ሳ", ee: "ሴ", "": "ስ", o: "ሶ", wa: "ሷ" },
  // sh / S (ሸ)
  sh: { e: "ሸ", u: "ሹ", i: "ሺ", a: "ሻ", ee: "ሼ", "": "ሽ", o: "ሾ", wa: "ሿ" },
  S: { e: "ሸ", u: "ሹ", i: "ሺ", a: "ሻ", ee: "ሼ", "": "ሽ", o: "ሾ", wa: "ሿ" },
  // q / k' (ቀ)
  q: { e: "ቀ", u: "ቁ", i: "ቂ", a: "ቃ", ee: "ቄ", "": "ቅ", o: "ቆ", wa: "ቋ" },
  "k'": { e: "ቀ", u: "ቁ", i: "ቂ", a: "ቃ", ee: "ቄ", "": "ቅ", o: "ቆ", wa: "ቋ" },
  // b (በ)
  b: { e: "በ", u: "ቡ", i: "ቢ", a: "ባ", ee: "ቤ", "": "ብ", o: "ቦ", wa: "ቧ" },
  // v (ቨ)
  v: { e: "ቨ", u: "ቨ", i: "ቪ", a: "ቫ", ee: "ቬ", "": "ቭ", o: "ቮ", wa: "ቯ" },
  // t (ተ)
  t: { e: "ተ", u: "ቱ", i: "ቲ", a: "ታ", ee: "ቴ", "": "ት", o: "ቶ", wa: "ቷ" },
  // ch / c (ቸ)
  ch: { e: "ቸ", u: "ቹ", i: "ቺ", a: "ቻ", ee: "ቼ", "": "ች", o: "ቾ", wa: "ቿ" },
  c: { e: "ቸ", u: "ቹ", i: "ቺ", a: "ቻ", ee: "ቼ", "": "ች", o: "ቾ", wa: "ቿ" },
  // h' (ኀ)
  "h'": { e: "ኀ", u: "ኁ", i: "ኂ", a: "ኃ", ee: "ኄ", "": "ኅ", o: "ኆ", wa: "ኋ" },
  // n (ነ)
  n: { e: "ነ", u: "ኑ", i: "ኒ", a: "ና", ee: "ኔ", "": "ን", o: "ኖ", wa: "ኗ" },
  // ny / GN / N (ኘ)
  ny: { e: "ኘ", u: "ኙ", i: "ኚ", a: "ኛ", ee: "ጜ", "": "ኝ", o: "ኞ", wa: "፝" },
  GN: { e: "ኘ", u: "ኙ", i: "ኚ", a: "ኛ", ee: "ጜ", "": "ኝ", o: "ኞ", wa: "፝" },
  N: { e: "ኘ", u: "ኙ", i: "ኚ", a: "ኛ", ee: "ጜ", "": "ኝ", o: "ኞ", wa: "፝" },
  // Standalone Vowels (አ family)
  a: { e: "አ", u: "ኡ", i: "ኢ", a: "ኣ", ee: "ኤ", "": "አ", o: "ኦ", wa: "ኧ" },
  e: { e: "እ", u: "ኡ", i: "ኢ", a: "አ", ee: "ኤ", "": "እ", o: "ኦ" },
  // k (ከ)
  k: { e: "ከ", u: "ኩ", i: "ኪ", a: "ካ", ee: "ኬ", "": "ክ", o: "ኮ", wa: "ኳ" },
  // kh (ኸ)
  kh: { e: "ኸ", u: "ኹ", i: "ኺ", a: "ኻ", ee: "ኼ", "": "ኽ", o: "ኾ", wa: "ዃ" },
  // w (ወ)
  w: { e: "ወ", u: "ዉ", i: "ዊ", a: "ዋ", ee: "ዌ", "": "ው", o: "ዎ" },
  // A / ah (ዐ)
  A: { e: "ዐ", u: "ዑ", i: "ዒ", a: "ዓ", ee: "ዔ", "": "ዕ", o: "ዖ" },
  ah: { e: "ዐ", u: "ዑ", i: "ዒ", a: "ዓ", ee: "ዔ", "": "ዕ", o: "ዖ" },
  // z (ዘ)
  z: { e: "ዘ", u: "ዙ", i: "ዚ", a: "ዛ", ee: "ዜ", "": "ዝ", o: "ዞ", wa: "ዟ" },
  // zh / Z (ዠ)
  zh: { e: "ዠ", u: "ዡ", i: "ዢ", a: "ዣ", ee: "ዤ", "": "ዥ", o: "ዦ", wa: "ዧ" },
  Z: { e: "ዠ", u: "ዡ", i: "ዢ", a: "ዣ", ee: "ዤ", "": "ዥ", o: "ዦ", wa: "ዧ" },
  // y (የ)
  y: { e: "የ", u: "ዩ", i: "ይ", a: "ያ", ee: "ዬ", "": "ይ", o: "ዮ" },
  // d (ደ)
  d: { e: "ደ", u: "ዱ", i: "ዲ", a: "ዳ", ee: "ዴ", "": "ድ", o: "ዶ", wa: "ዷ" },
  // j (ጀ)
  j: { e: "ጀ", u: "ጁ", i: "ጂ", a: "ጃ", ee: "ጄ", "": "ጅ", o: "ጆ", wa: "ጇ" },
  // g (ገ)
  g: { e: "ገ", u: "ጉ", i: "ጊ", a: "ጋ", ee: "ጌ", "": "ግ", o: "ጎ", wa: "ጓ" },
  // T / t' (ጠ)
  T: { e: "ጠ", u: "ጡ", i: "ጢ", a: "ጣ", ee: "ጤ", "": "ጥ", o: "ጦ", wa: "ጧ" },
  "t'": { e: "ጠ", u: "ጡ", i: "ጢ", a: "ጣ", ee: "ጤ", "": "ጥ", o: "ጦ", wa: "ጧ" },
  // CH / c' (ጨ)
  CH: { e: "ጨ", u: "ጩ", i: "ጪ", a: "ጫ", ee: "ጬ", "": "ጭ", o: "ጮ", wa: "ጯ" },
  "c'": { e: "ጨ", u: "ጩ", i: "ጪ", a: "ጫ", ee: "ጬ", "": "ጭ", o: "ጮ", wa: "ጯ" },
  // P / p' (ጰ)
  P: { e: "ጰ", u: "ጱ", i: "ጲ", a: "ጳ", ee: "ጴ", "": "ጵ", o: "ጶ", wa: "ጷ" },
  "p'": { e: "ጰ", u: "ጱ", i: "ጲ", a: "ጳ", ee: "ጴ", "": "ጵ", o: "ጶ", wa: "ጷ" },
  // ts / Tz / S' (ጸ)
  ts: { e: "ጸ", u: "ጹ", i: "ጺ", a: "ጻ", ee: "ጼ", "": "ጽ", o: "ጾ", wa: "ጿ" },
  Tz: { e: "ጸ", u: "ጹ", i: "ጺ", a: "ጻ", ee: "ጼ", "": "ጽ", o: "ጾ", wa: "ጿ" },
  "S'": { e: "ጸ", u: "ጹ", i: "ጺ", a: "ጻ", ee: "ጼ", "": "ጽ", o: "ጾ", wa: "ጿ" },
  // tz (ፀ)
  tz: { e: "ፀ", u: "ፁ", i: "ፂ", a: "ፃ", ee: "ፄ", "": "ፅ", o: "ፆ" },
  // f (ፈ)
  f: { e: "ፈ", u: "ፉ", i: "ፊ", a: "ፋ", ee: "ፌ", "": "ፍ", o: "ፎ", wa: "ፏ" },
  // p (ፐ)
  p: { e: "ፐ", u: "ፑ", i: "ፒ", a: "ፓ", ee: "ፔ", "": "ፕ", o: "ፖ", wa: "ፗ" },
};

/** Ethiopic Punctuation Map */
export const PUNCTUATION_MAP: Record<string, string> = {
  ".": "።",
  ":": "፡",
  "::": "።",
  "..": "።",
  ",": "፤",
  ";": "፤",
  ":-": "፦",
  "?": "፧",
  "*": "፠",
};

/** Special Word Exceptions for common transliterations */
export const COMMON_WORD_MAP: Record<string, string> = {
  bet: "ቤት",
  beet: "ቤት",
  yihun: "ይሁን",
  ethiopia: "ኢትዮጵያ",
  abebe: "አበበ",
  endemin: "እንደምን",
  selam: "ሰላም",
  haile: "ኃይለ",
  hayle: "ኃይለ",
  hailemichael: "ኃይለሚካኤል",
  haylemikael: "ኃይለሚካኤል",
};

/**
 * Builds a flattened lookup dictionary mapping Latin sequence -> Ethiopic symbol.
 */
export function buildFlatMapping(): Record<string, string> {
  const map: Record<string, string> = {};

  for (const [prefix, family] of Object.entries(FIDEL_FAMILIES)) {
    map[prefix] = family[""];
    map[prefix + "e"] = family.e;
    map[prefix + "u"] = family.u;
    map[prefix + "i"] = family.i;
    map[prefix + "a"] = family.a;
    map[prefix + "aa"] = family.a;
    map[prefix + "ee"] = family.ee;
    map[prefix + "ie"] = family.ee;
    map[prefix + "o"] = family.o;

    if (family.wa) {
      map[prefix + "wa"] = family.wa;
      map[prefix + "oa"] = family.wa;
    }
  }

  // Add common words
  for (const [word, ethiopic] of Object.entries(COMMON_WORD_MAP)) {
    map[word] = ethiopic;
  }

  return map;
}
