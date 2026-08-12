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
  // sh (ሸ)
  sh: { e: "ሸ", u: "ሹ", i: "ሺ", a: "ሻ", ee: "ሼ", "": "ሽ", o: "ሾ", wa: "ሿ" },
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
  // ny / GN (ኘ)
  ny: { e: "ኘ", u: "ኙ", i: "ኚ", a: "ኛ", ee: "ጜ", "": "ኝ", o: "ኞ", wa: "፝" },
  GN: { e: "ኘ", u: "ኙ", i: "ኚ", a: "ኛ", ee: "ጜ", "": "ኝ", o: "ኞ", wa: "፝" },
  N: { e: "ኘ", u: "ኙ", i: "ኚ", a: "ኛ", ee: "ጜ", "": "ኝ", o: "ኞ", wa: "፝" },
  // Standalone Vowels (አ / እ / ኢ / ኡ / ኦ families)
  a: { e: "አ", u: "ኡ", i: "ኢ", a: "ኣ", ee: "ኤ", "": "አ", o: "ኦ", wa: "ኧ" },
  e: { e: "እ", u: "ኡ", i: "ኢ", a: "አ", ee: "ኤ", "": "እ", o: "ኦ" },
  i: { e: "ኢ", u: "ኡ", i: "ኢ", a: "ኢያ", ee: "ኤ", "": "ኢ", o: "ኦ" },
  u: { e: "ኡ", u: "ኡ", i: "ኢ", a: "ኡኣ", ee: "ኤ", "": "ኡ", o: "ኦ" },
  o: { e: "ኦ", u: "ኡ", i: "ኢ", a: "ኦኣ", ee: "ኤ", "": "ኦ", o: "ኦ" },
  // k (ከ)
  k: { e: "ከ", u: "ኩ", i: "ኪ", a: "ካ", ee: "ኬ", "": "ክ", o: "ኮ", wa: "ኳ" },
  // kh (ኸ)
  kh: { e: "ኸ", u: "ኹ", i: "ኺ", a: "ኻ", ee: "ኼ", "": "ኽ", o: "ኾ", wa: "ዃ" },
  // w (ወ)
  w: { e: "ወ", u: "ዉ", i: "ዊ", a: "ዋ", ee: "ዌ", "": "ው", o: "ዎ" },
  // ah / A (ዐ)
  ah: { e: "ዐ", u: "ዑ", i: "ዒ", a: "ዓ", ee: "ዔ", "": "ዕ", o: "ዖ" },
  A: { e: "ዐ", u: "ዑ", i: "ዒ", a: "ዓ", ee: "ዔ", "": "ዕ", o: "ዖ" },
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
  // t' / T (ጠ)
  "t'": { e: "ጠ", u: "ጡ", i: "ጢ", a: "ጣ", ee: "ጤ", "": "ጥ", o: "ጦ", wa: "ጧ" },
  T: { e: "ጠ", u: "ጡ", i: "ጢ", a: "ጣ", ee: "ጤ", "": "ጥ", o: "ጦ", wa: "ጧ" },
  // c' / CH (ጨ)
  "c'": { e: "ጨ", u: "ጩ", i: "ጪ", a: "ጫ", ee: "ጬ", "": "ጭ", o: "ጮ", wa: "ጯ" },
  CH: { e: "ጨ", u: "ጩ", i: "ጪ", a: "ጫ", ee: "ጬ", "": "ጭ", o: "ጮ", wa: "ጯ" },
  // p' / P (ጰ)
  "p'": { e: "ጰ", u: "ጱ", i: "ጲ", a: "ጳ", ee: "ጴ", "": "ጵ", o: "ጶ", wa: "ጷ" },
  P: { e: "ጰ", u: "ጱ", i: "ጲ", a: "ጳ", ee: "ጴ", "": "ጵ", o: "ጶ", wa: "ጷ" },
  // ts / tz / Tz / S' (ጸ / ፀ)
  ts: { e: "ጸ", u: "ጹ", i: "ጺ", a: "ጻ", ee: "ጼ", "": "ጽ", o: "ጾ", wa: "ጿ" },
  tz: { e: "ፀ", u: "ፁ", i: "ፂ", a: "ፃ", ee: "ፄ", "": "ፅ", o: "ፆ" },
  Tz: { e: "ጸ", u: "ጹ", i: "ጺ", a: "ጻ", ee: "ጼ", "": "ጽ", o: "ጾ", wa: "ጿ" },
  "S'": { e: "ጸ", u: "ጹ", i: "ጺ", a: "ጻ", ee: "ጼ", "": "ጽ", o: "ጾ", wa: "ጿ" },
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
  shekuri: "ሸኩሪ",
};

/**
 * Builds a flattened lookup dictionary mapping Latin sequence -> Ethiopic symbol.
 */
export function buildFlatMapping(): Record<string, string> {
  const map: Record<string, string> = {};

  // 1. Pass 1: Insert exact explicit keys from FIDEL_FAMILIES
  for (const [prefix, family] of Object.entries(FIDEL_FAMILIES)) {
    map[prefix] = family[""];
    map[prefix + "a"] = family.e;      // 1st order triggered by 'a' (e.g. ha -> ሀ, da -> ደ, sa -> ሰ)
    map[prefix + "u"] = family.u;      // 2nd order (e.g. hu -> ሁ)
    map[prefix + "i"] = family.i;      // 3rd order (e.g. hi -> ሂ)
    map[prefix + "aa"] = family.a;     // 4th order triggered by 'aa' (e.g. haa -> ሃ, daa -> ዳ, saa -> ሳ)
    map[prefix + "e"] = family.ee;     // 5th order triggered by 'e' (e.g. he -> ሄ, de -> ዴ, se -> ሴ)
    map[prefix + "ee"] = family.ee;    // 5th order triggered by 'ee' (e.g. hee -> ሄ, dee -> ዴ)
    map[prefix + "ie"] = family.ee;    // 5th order triggered by 'ie'
    map[prefix + "o"] = family.o;      // 7th order (e.g. ho -> ሆ)

    if (family.wa) {
      map[prefix + "wa"] = family.wa;  // 8th order
      map[prefix + "oa"] = family.wa;
    }
  }

  // 2. Pass 2: Add Title Case / Capitalized variants for general typing (if not already explicitly defined)
  for (const [prefix, family] of Object.entries(FIDEL_FAMILIES)) {
    const titlePrefix = prefix.length > 0 ? prefix[0].toUpperCase() + prefix.slice(1).toLowerCase() : prefix;
    const upperPrefix = prefix.toUpperCase();
    const variants = [titlePrefix, upperPrefix];

    const suffixEntries: [string, string | undefined][] = [
      ["", family[""]],
      ["a", family.e],   // 1st order 'a'
      ["u", family.u],   // 2nd order
      ["i", family.i],   // 3rd order
      ["aa", family.a],  // 4th order 'aa'
      ["e", family.ee],  // 5th order 'e'
      ["ee", family.ee], // 5th order 'ee'
      ["ie", family.ee], // 5th order 'ie'
      ["o", family.o],   // 7th order
      ["wa", family.wa],
      ["oa", family.wa],
    ];

    for (const vPrefix of variants) {
      for (const [suf, target] of suffixEntries) {
        if (!target) continue;
        const key = vPrefix + suf;
        if (map[key] === undefined) {
          map[key] = target;
        }
      }
    }
  }

  // 3. Pass 3: Add common words and their case variants (highest priority)
  for (const [word, ethiopic] of Object.entries(COMMON_WORD_MAP)) {
    map[word] = ethiopic;
    map[word.toLowerCase()] = ethiopic;
    map[word.toUpperCase()] = ethiopic;
    if (word.length > 0) {
      map[word[0].toUpperCase() + word.slice(1).toLowerCase()] = ethiopic;
    }
  }

  return map;
}
