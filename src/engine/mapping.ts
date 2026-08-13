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
  // ss / S / s' (ሠ)
  ss: { e: "ሠ", u: "ሡ", i: "ሢ", a: "ሣ", ee: "ሤ", "": "ሥ", o: "ሦ", wa: "ሧ" },
  S: { e: "ሠ", u: "ሡ", i: "ሢ", a: "ሣ", ee: "ሤ", "": "ሥ", o: "ሦ", wa: "ሧ" },
  "s'": { e: "ሠ", u: "ሡ", i: "ሢ", a: "ሣ", ee: "ሤ", "": "ሥ", o: "ሦ", wa: "ሧ" },
  // r (ረ)
  r: { e: "ረ", u: "ሩ", i: "ሪ", a: "ራ", ee: "ሬ", "": "ር", o: "ሮ", wa: "ሯ" },
  // s (ሰ)
  s: { e: "ሰ", u: "ሱ", i: "ሲ", a: "ሳ", ee: "ሴ", "": "ስ", o: "ሶ", wa: "ሷ" },
  // sh (ሸ)
  sh: { e: "ሸ", u: "ሹ", i: "ሺ", a: "ሻ", ee: "ሼ", "": "ሽ", o: "ሾ", wa: "ሿ" },
  // q / k' / K / Q (ቀ)
  q: { e: "ቀ", u: "ቁ", i: "ቂ", a: "ቃ", ee: "ቄ", "": "ቅ", o: "ቆ", wa: "ቋ" },
  "k'": { e: "ቀ", u: "ቁ", i: "ቂ", a: "ቃ", ee: "ቄ", "": "ቅ", o: "ቆ", wa: "ቋ" },
  K: { e: "ቀ", u: "ቁ", i: "ቂ", a: "ቃ", ee: "ቄ", "": "ቅ", o: "ቆ", wa: "ቋ" },
  Q: { e: "ቀ", u: "ቁ", i: "ቂ", a: "ቃ", ee: "ቄ", "": "ቅ", o: "ቆ", wa: "ቋ" },
  // b (በ)
  b: { e: "በ", u: "ቡ", i: "ቢ", a: "ባ", ee: "ቤ", "": "ብ", o: "ቦ", wa: "ቧ" },
  // v / V / B / b' (ቨ)
  v: { e: "ቨ", u: "ቩ", i: "ቪ", a: "ቫ", ee: "ቬ", "": "ቭ", o: "ቮ", wa: "ቯ" },
  V: { e: "ቨ", u: "ቩ", i: "ቪ", a: "ቫ", ee: "ቬ", "": "ቭ", o: "ቮ", wa: "ቯ" },
  B: { e: "ቨ", u: "ቩ", i: "ቪ", a: "ቫ", ee: "ቬ", "": "ቭ", o: "ቮ", wa: "ቯ" },
  "b'": { e: "ቨ", u: "ቩ", i: "ቪ", a: "ቫ", ee: "ቬ", "": "ቭ", o: "ቮ", wa: "ቯ" },
  // t (ተ)
  t: { e: "ተ", u: "ቱ", i: "ቲ", a: "ታ", ee: "ቴ", "": "ት", o: "ቶ", wa: "ቷ" },
  // ch / c (ቸ)
  ch: { e: "ቸ", u: "ቹ", i: "ቺ", a: "ቻ", ee: "ቼ", "": "ች", o: "ቾ", wa: "ቿ" },
  c: { e: "ቸ", u: "ቹ", i: "ቺ", a: "ቻ", ee: "ቼ", "": "ች", o: "ቾ", wa: "ቿ" },
  // h' / xh / hx (ኀ)
  "h'": { e: "ኀ", u: "ኁ", i: "ኂ", a: "ኃ", ee: "ኄ", "": "ኅ", o: "ኆ", wa: "ኋ" },
  xh: { e: "ኀ", u: "ኁ", i: "ኂ", a: "ኃ", ee: "ኄ", "": "ኅ", o: "ኆ", wa: "ኋ" },
  hx: { e: "ኀ", u: "ኁ", i: "ኂ", a: "ኃ", ee: "ኄ", "": "ኅ", o: "ኆ", wa: "ኋ" },
  // n (ነ)
  n: { e: "ነ", u: "ኑ", i: "ኒ", a: "ና", ee: "ኔ", "": "ን", o: "ኖ", wa: "ኗ" },
  // ny / GN / N / n' (ኘ)
  ny: { e: "ኘ", u: "ኙ", i: "ኚ", a: "ኛ", ee: "ጜ", "": "ኝ", o: "ኞ", wa: "፝" },
  GN: { e: "ኘ", u: "ኙ", i: "ኚ", a: "ኛ", ee: "ጜ", "": "ኝ", o: "ኞ", wa: "፝" },
  N: { e: "ኘ", u: "ኙ", i: "ኚ", a: "ኛ", ee: "ጜ", "": "ኝ", o: "ኞ", wa: "፝" },
  "n'": { e: "ኘ", u: "ኙ", i: "ኚ", a: "ኛ", ee: "ጜ", "": "ኝ", o: "ኞ", wa: "፝" },
  // Standalone Vowels (አ / እ / ኢ / ኡ / ኦ families)
  a: { e: "አ", u: "ኡ", i: "ኢ", a: "ኣ", ee: "ኤ", "": "አ", o: "ኦ", wa: "ኧ" },
  e: { e: "እ", u: "ኡ", i: "ኢ", a: "አ", ee: "ኤ", "": "እ", o: "ኦ" },
  i: { e: "ኢ", u: "ኡ", i: "ኢ", a: "ኢያ", ee: "ኤ", "": "ኢ", o: "ኦ" },
  u: { e: "ኡ", u: "ኡ", i: "ኢ", a: "ኡኣ", ee: "ኤ", "": "ኡ", o: "ኦ" },
  o: { e: "ኦ", u: "ኡ", i: "ኢ", a: "ኦኣ", ee: "ኤ", "": "ኦ", o: "ኦ" },
  // k (ከ)
  k: { e: "ከ", u: "ኩ", i: "ኪ", a: "ካ", ee: "ኬ", "": "ክ", o: "ኮ", wa: "ኳ" },
  // kh / x / X (ኸ)
  kh: { e: "ኸ", u: "ኹ", i: "ኺ", a: "ኻ", ee: "ኼ", "": "ኽ", o: "ኾ", wa: "ዃ" },
  x: { e: "ኸ", u: "ኹ", i: "ኺ", a: "ኻ", ee: "ኼ", "": "ኽ", o: "ኾ", wa: "ዃ" },
  X: { e: "ኸ", u: "ኹ", i: "ኺ", a: "ኻ", ee: "ኼ", "": "ኽ", o: "ኾ", wa: "ዃ" },
  // w (ወ)
  w: { e: "ወ", u: "ዉ", i: "ዊ", a: "ዋ", ee: "ዌ", "": "ው", o: "ዎ" },
  // ah / A / a' (ዐ)
  ah: { e: "ዐ", u: "ዑ", i: "ዒ", a: "ዓ", ee: "ዔ", "": "ዕ", o: "ዖ" },
  A: { e: "ዐ", u: "ዑ", i: "ዒ", a: "ዓ", ee: "ዔ", "": "ዕ", o: "ዖ" },
  "a'": { e: "ዐ", u: "ዑ", i: "ዒ", a: "ዓ", ee: "ዔ", "": "ዕ", o: "ዖ" },
  // z (ዘ)
  z: { e: "ዘ", u: "ዙ", i: "ዚ", a: "ዛ", ee: "ዜ", "": "ዝ", o: "ዞ", wa: "ዟ" },
  // zh / Z / z' (ዠ)
  zh: { e: "ዠ", u: "ዡ", i: "ዢ", a: "ዣ", ee: "ዤ", "": "ዥ", o: "ዦ", wa: "ዧ" },
  Z: { e: "ዠ", u: "ዡ", i: "ዢ", a: "ዣ", ee: "ዤ", "": "ዥ", o: "ዦ", wa: "ዧ" },
  "z'": { e: "ዠ", u: "ዡ", i: "ዢ", a: "ዣ", ee: "ዤ", "": "ዥ", o: "ዦ", wa: "ዧ" },
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
  // c' / CH / C (ጨ)
  "c'": { e: "ጨ", u: "ጩ", i: "ጪ", a: "ጫ", ee: "ጬ", "": "ጭ", o: "ጮ", wa: "ጯ" },
  CH: { e: "ጨ", u: "ጩ", i: "ጪ", a: "ጫ", ee: "ጬ", "": "ጭ", o: "ጮ", wa: "ጯ" },
  C: { e: "ጨ", u: "ጩ", i: "ጪ", a: "ጫ", ee: "ጬ", "": "ጭ", o: "ጮ", wa: "ጯ" },
  // p' / P (ጰ)
  "p'": { e: "ጰ", u: "ጱ", i: "ጲ", a: "ጳ", ee: "ጴ", "": "ጵ", o: "ጶ", wa: "ጷ" },
  P: { e: "ጰ", u: "ጱ", i: "ጲ", a: "ጳ", ee: "ጴ", "": "ጵ", o: "ጶ", wa: "ጷ" },
  // ts / tz / Tz / S' / Ts / ts' (ጸ / ፀ)
  ts: { e: "ጸ", u: "ጹ", i: "ጺ", a: "ጻ", ee: "ጼ", "": "ጽ", o: "ጾ", wa: "ጿ" },
  Ts: { e: "ጸ", u: "ጹ", i: "ጺ", a: "ጻ", ee: "ጼ", "": "ጽ", o: "ጾ", wa: "ጿ" },
  Tz: { e: "ጸ", u: "ጹ", i: "ጺ", a: "ጻ", ee: "ጼ", "": "ጽ", o: "ጾ", wa: "ጿ" },
  "S'": { e: "ጸ", u: "ጹ", i: "ጺ", a: "ጻ", ee: "ጼ", "": "ጽ", o: "ጾ", wa: "ጿ" },
  tz: { e: "ፀ", u: "ፁ", i: "ፂ", a: "ፃ", ee: "ፄ", "": "ፅ", o: "ፆ" },
  TZ: { e: "ፀ", u: "ፁ", i: "ፂ", a: "ፃ", ee: "ፄ", "": "ፅ", o: "ፆ" },
  "ts'": { e: "ፀ", u: "ፁ", i: "ፂ", a: "ፃ", ee: "ፄ", "": "ፅ", o: "ፆ" },
  // f (ፈ)
  f: { e: "ፈ", u: "ፉ", i: "ፊ", a: "ፋ", ee: "ፌ", "": "ፍ", o: "ፎ", wa: "ፏ" },
  // p (ፐ)
  p: { e: "ፐ", u: "ፑ", i: "ፒ", a: "ፓ", ee: "ፔ", "": "ፕ", o: "ፖ", wa: "ፗ" },
};

/** Complete Ethiopic Punctuation Map */
export const PUNCTUATION_MAP: Record<string, string> = {
  // 1. Distinct 1-to-1 Keyboard Triggers
  ".": "።",     // Ethiopic Full Stop / Arat Neteb (አራት ነጥብ)
  ",": "፣",     // Ethiopic Comma / Netela Serez (ነጠላ ሰረዝ)
  ";": "፤",     // Ethiopic Semicolon / Derb Serez (ድርብ ሰረዝ)
  ":": "፡",     // Ethiopic Wordspace / Hulat Neteb (ሁለት ነጥብ)
  "?": "፧",     // Ethiopic Question Mark / Yimer (ይመር)
  "|": "፥",     // Ethiopic Colon / Sost Neteb (ሦስት ነጥብ / አንቀጽ)
  ">": "፦",     // Ethiopic Preface Colon / Meqereya (መቅረዝ)
  "@": "፠",     // Ethiopic Section Mark / Ayne T'ila (ዓይነ ጥላ)
  "#": "፨",     // Ethiopic Paragraph Separator / Yieti (ይእቲ)
  "~": "፟",     // Ethiopic Combining Gemination Mark / T'ebiq (ጥብቅ)

  // 2. Multi-character & Shorthand Aliases
  "::": "።",    // Arat Neteb alias
  "..": "።",    // Arat Neteb alias
  ",,": "፤",    // Derb Serez alias
  ":-": "፥",    // Sost Neteb alias
  ":-:": "፦",   // Meqereya alias
  ":::": "፦",   // Meqereya alias
  "*": "፠",     // Ayne T'ila alias
  "@@": "፠",    // Ayne T'ila alias
  "**": "፨",    // Yieti alias
  "***": "፨",   // Yieti alias
  "##": "፨",    // Yieti alias
  "_": "፟",     // Gemination Mark alias
};

/** Special Word Exceptions for common transliterations */
export const COMMON_WORD_MAP: Record<string, string> = {
  // Common greetings & expressions
  selam: "ሰላም",
  endemin: "እንደምን",
  tena: "ጤና",
  tenayistillign: "ጤናይስጥልኝ",
  tenayistilign: "ጤናይስጥልኝ",
  tenayistilln: "ጤናይስጥልኝ",
  ameseginalehu: "አመሰግናለሁ",
  amesegenalehu: "አመሰግናለሁ",
  dehna: "ደህና",
  ishii: "እሺ",
  ishi: "እሺ",
  awo: "አዎ",
  yellem: "የለም",
  yelem: "የለም",

  // Family & Relationships
  enat: "እናት",
  abat: "አባት",
  wendim: "ወንድም",
  ihit: "እህት",
  lij: "ልጅ",
  lijoch: "ልጆች",
  wodaj: "ወዳጅ",
  gwad: "ጓድ",

  // Places & Country
  ethiopia: "ኢትዮጵያ",
  ityopya: "ኢትዮጵያ",
  "ityop'ya": "ኢትዮጵያ",
  ethiopian: "ኢትዮጵያዊ",
  amharic: "አማርኛ",
  amaric: "አማርኛ",
  amharik: "አማርኛ",
  fidel: "ፊደል",
  addis: "አዲስ",
  adis: "አዲስ",
  ababa: "አበባ",
  abeba: "አበባ",
  addisababa: "አዲስ አበባ",
  addisabeba: "አዲስ አበባ",
  amhara: "አማራ",
  oromia: "ኦሮሚያ",
  tigray: "ትግራይ",
  habesha: "ሀበሻ",

  // Religious & Cultural Names / Terms
  egziabher: "እግዚአብሔር",
  igziabher: "እግዚአብሔር",
  mariam: "ማሪያም",
  maryam: "ማሪያም",
  mikael: "ሚካኤል",
  michael: "ሚካኤል",
  gebriel: "ገብርኤል",
  gabriel: "ገብርኤል",

  // Common Amharic Personal Names
  abebe: "አበበ",
  bet: "ቤት",
  beet: "ቤት",
  yihun: "ይሁን",
  haile: "ኃይለ",
  hayle: "ኃይለ",
  hailemichael: "ኃይለሚካኤል",
  haylemikael: "ኃይለሚካኤል",
  haileselassie: "ኃይለሥላሴ",
  hayleselassie: "ኃይለሥላሴ",
  shekuri: "ሸኩሪ",
  dawit: "ዳዊት",
  dawiit: "ዳዊት",
  solomon: "ሰለሞን",
  yohannes: "ዮሐንስ",
  tesfaye: "ተስፋዬ",
  worku: "ወርቁ",
  berhanu: "ብርሃኑ",
  girma: "ግርማ",
  getachew: "ጌታቸው",
  tadesse: "ታደሰ",
  tadese: "ታደሰ",
  kebede: "ከበደ",
  bekele: "በቀለ",
  mulugeta: "ሙሉጌታ",
  mulu: "ሙሉ",
  almaz: "አልማዝ",
  aster: "አስቴር",
  genet: "ገነት",
  tigist: "ትዕግሥት",
  meseret: "መሠረት",
  helen: "ሔለን",
  amanuel: "አማኑኤል",
  kifle: "ክፍሌ",

  // Titles & Common Nouns
  ato: "አቶ",
  woizero: "ወይዘሮ",
  weyzerit: "ወይዘሪት",
  timhirt: "ትምህርት",
  timhirtbet: "ትምህርት ቤት",
  sira: "ሥራ",
  wuha: "ውሃ",
  wuhah: "ውሃ",
  beso: "በሶ",
  bela: "በላ",
  mewad: "መዋድ",
};

/**
 * Builds a flattened lookup dictionary mapping Latin sequence -> Ethiopic symbol.
 */
export function buildFlatMapping(): Record<string, string> {
  const map: Record<string, string> = {};

  // For h families (ሀ, ሐ, ኀ) and Ayn (ዐ):
  // - 'ha' produces 1st order (ሀ, ሐ, ኀ, ዐ)
  // - 'haa' produces 4th order (ሃ, ሓ, ኃ, ዓ)
  // - 'he' or 'hee' produces 5th order (ሄ, ሔ, ኄ, ዔ)
  // For all other consonant families (m, l, s, r, b, t, k, d, T, CH, P, etc.):
  // - 'e' produces 1st order (e.g. me -> መ, le -> ለ, Te -> ጠ)
  // - 'a' or 'aa' produces 4th order (e.g. ma -> ማ, la -> ላ, Ta -> ጣ)
  // - 'ee' produces 5th order (e.g. mee -> ሜ, lee -> ሌ, see -> ሴ)
  const H_FAMILY_PREFIXES = new Set([
    "h", "H", "hh", "h'", "xh", "hx",
    "ah", "A", "a'"
  ]);

  // 1. Pass 1: Insert exact explicit keys from FIDEL_FAMILIES
  for (const [prefix, family] of Object.entries(FIDEL_FAMILIES)) {
    map[prefix] = family[""];

    if (H_FAMILY_PREFIXES.has(prefix)) {
      map[prefix + "a"] = family.e;   // 1st order 'a' (e.g. ha -> ሀ, Ha -> ሐ, xha -> ኀ, Aa -> ዐ)
      map[prefix + "aa"] = family.a;  // 4th order 'aa' (e.g. haa -> ሃ, Haa -> ሓ, xhaa -> ኃ, Aaa -> ዓ)
      map[prefix + "e"] = family.ee;  // 5th order 'e' (e.g. he -> ሄ, He -> ሔ, xhe -> ኄ, Ae -> ዔ)
      map[prefix + "ee"] = family.ee; // 5th order 'ee' (e.g. hee -> ሄ, Hee -> ሔ, xhee -> ኄ)
      map[prefix + "ie"] = family.ee; // 5th order 'ie' (e.g. hie -> ሄ)
    } else {
      map[prefix + "e"] = family.e;   // 1st order 'e' (e.g. me -> መ, le -> ለ, se -> ሰ, Te -> ጠ)
      map[prefix + "a"] = family.a;   // 4th order 'a' (e.g. ma -> ማ, la -> ላ, sa -> ሳ, Ta -> ጣ)
      map[prefix + "aa"] = family.a;  // 4th order 'aa' (e.g. maa -> ማ, laa -> ላ, saa -> ሳ)
      map[prefix + "ee"] = family.ee; // 5th order 'ee' (e.g. mee -> ሜ, lee -> ሌ, see -> ሴ)
      map[prefix + "ie"] = family.ee; // 5th order 'ie' (e.g. mie -> ሜ)
    }

    map[prefix + "u"] = family.u;     // 2nd order (e.g. hu -> ሁ, mu -> ሙ)
    map[prefix + "i"] = family.i;     // 3rd order (e.g. hi -> ሂ, mi -> ሚ)
    map[prefix + "o"] = family.o;     // 7th order (e.g. ho -> ホ -> ሆ, mo -> ሞ)

    if (family.wa) {
      map[prefix + "wa"] = family.wa; // 8th order
      map[prefix + "oa"] = family.wa;
    }
  }

  // 2. Pass 2: Add Title Case / Capitalized variants for general typing (if not already explicitly defined)
  for (const [prefix, family] of Object.entries(FIDEL_FAMILIES)) {
    const titlePrefix = prefix.length > 0 ? prefix[0].toUpperCase() + prefix.slice(1).toLowerCase() : prefix;
    const upperPrefix = prefix.toUpperCase();
    const variants = [titlePrefix, upperPrefix];
    const isHFamily = H_FAMILY_PREFIXES.has(prefix);
    const aTarget = isHFamily ? family.e : family.a;
    const eTarget = isHFamily ? family.ee : family.e;

    const suffixEntries: [string, string | undefined][] = [
      ["", family[""]],
      ["e", eTarget],
      ["a", aTarget],
      ["u", family.u],
      ["i", family.i],
      ["aa", family.a],
      ["ee", family.ee],
      ["ie", family.ee],
      ["o", family.o],
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

