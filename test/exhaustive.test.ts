import { describe, it, expect } from "bun:test";
import { buildFlatMapping, FIDEL_FAMILIES } from "../src/engine/mapping.js";
import { transliterateText, transliterateWord } from "../src/engine/transliterator.js";
import { CompositionEngine } from "../src/engine/composition.js";

describe("Exhaustive Ethiopic Syllabary Test Suite (33 Families x 7 Orders)", () => {
  const flatMap = buildFlatMapping();

  it("verifies all 33 core Ethiopic families map correctly", () => {
    const familyKeys = Object.keys(FIDEL_FAMILIES);
    expect(familyKeys.length).toBeGreaterThanOrEqual(33);

    const H_FAMILIES = new Set(["h", "H", "hh", "h'", "xh", "hx", "ah", "A", "a'"]);

    for (const prefix of familyKeys) {
      const family = FIDEL_FAMILIES[prefix];

      expect(flatMap[prefix]).toBe(family[""]);
      if (H_FAMILIES.has(prefix)) {
        expect(flatMap[prefix + "a"]).toBe(family.e);
        expect(flatMap[prefix + "aa"]).toBe(family.a);
        expect(flatMap[prefix + "e"]).toBe(family.ee);
      } else {
        expect(flatMap[prefix + "e"]).toBe(family.e);
        expect(flatMap[prefix + "a"]).toBe(family.a);
        expect(flatMap[prefix + "aa"]).toBeUndefined();
      }
      expect(flatMap[prefix + "u"]).toBe(family.u);
      expect(flatMap[prefix + "i"]).toBe(family.i);
      expect(flatMap[prefix + "ee"]).toBe(family.ee);
      expect(flatMap[prefix + "o"]).toBe(family.o);

      if (family.wa) {
        expect(flatMap[prefix + "w"]).toBe(family.wa);
        expect(flatMap[prefix + "wa"]).toBeUndefined();
      }
    }
  });

  it("translates 8th-order labialized / diqala compound forms", () => {
    expect(transliterateWord("lw")).toBe("ሏ");
    expect(transliterateWord("mw")).toBe("ሟ");
    expect(transliterateWord("rw")).toBe("ሯ");
    expect(transliterateWord("sw")).toBe("ሷ");
    expect(transliterateWord("shw")).toBe("ሿ");
    expect(transliterateWord("qw")).toBe("ቋ");
    expect(transliterateWord("bw")).toBe("ቧ");
    expect(transliterateWord("tw")).toBe("ቷ");
    expect(transliterateWord("chw")).toBe("ቿ");
    expect(transliterateWord("nw")).toBe("ኗ");
    expect(transliterateWord("kw")).toBe("ኳ");
    expect(transliterateWord("zw")).toBe("ዟ");
    expect(transliterateWord("zhw")).toBe("ዧ");
    expect(transliterateWord("dw")).toBe("ዷ");
    expect(transliterateWord("jw")).toBe("ጇ");
    expect(transliterateWord("gw")).toBe("ጓ");
    expect(transliterateWord("Tw")).toBe("ጧ");
    expect(transliterateWord("CHw")).toBe("ጯ");
    expect(transliterateWord("Pw")).toBe("ጷ");
    expect(transliterateWord("tsw")).toBe("ጿ");
    expect(transliterateWord("fw")).toBe("ፏ");
  });
});

describe("Multi-Character Consonants & Capitalization Variants", () => {
  it("handles multi-character consonants prefixes", () => {
    expect(transliterateWord("she")).toBe("ሸ");
    expect(transliterateWord("shu")).toBe("ሹ");
    expect(transliterateWord("shi")).toBe("ሺ");
    expect(transliterateWord("sha")).toBe("ሻ");
    expect(transliterateWord("shee")).toBe("ሼ");
    expect(transliterateWord("se")).toBe("ሰ");
    expect(transliterateWord("sa")).toBe("ሳ");
    expect(transliterateWord("Se")).toBe("ሠ");
    expect(transliterateWord("Sa")).toBe("ሣ");
    expect(transliterateWord("Sha")).toBe("ሻ");
    expect(transliterateWord("She")).toBe("ሸ");

    expect(transliterateWord("che")).toBe("ቸ");
    expect(transliterateWord("cha")).toBe("ቻ");
    expect(transliterateWord("chu")).toBe("ቹ");
    expect(transliterateWord("chi")).toBe("ቺ");
    expect(transliterateWord("chee")).toBe("ቼ");
    expect(transliterateWord("cho")).toBe("ቾ");
    expect(transliterateWord("ce")).toBe("ቸ");
    expect(transliterateWord("ca")).toBe("ቻ");

    expect(transliterateWord("tse")).toBe("ጸ");
    expect(transliterateWord("tsa")).toBe("ጻ");
    expect(transliterateWord("tsu")).toBe("ጹ");
    expect(transliterateWord("tsi")).toBe("ጺ");
    expect(transliterateWord("tsee")).toBe("ጼ");
    expect(transliterateWord("tso")).toBe("ጾ");
    expect(transliterateWord("Tze")).toBe("ጸ");
    expect(transliterateWord("Tza")).toBe("ጻ");

    expect(transliterateWord("khe")).toBe("ኸ");
    expect(transliterateWord("kha")).toBe("ኻ");
    expect(transliterateWord("khu")).toBe("ኹ");

    expect(transliterateWord("zhe")).toBe("ዠ");
    expect(transliterateWord("zha")).toBe("ዣ");
    expect(transliterateWord("Ze")).toBe("ዠ");
    expect(transliterateWord("Za")).toBe("ዣ");

    expect(transliterateWord("Te")).toBe("ጠ");
    expect(transliterateWord("Ta")).toBe("ጣ");
    expect(transliterateWord("t'e")).toBe("ጠ");
    expect(transliterateWord("t'a")).toBe("ጣ");

    // Verify homophone family variants (H / hh / ss) with smartCorrection enabled
    expect(transliterateWord("hha", { smartCorrection: true })).toBe("ሐ");
    expect(transliterateWord("hhe", { smartCorrection: true })).toBe("ሔ");
    expect(transliterateWord("hhaa", { smartCorrection: true })).toBe("ሓ");
    expect(transliterateWord("hhee", { smartCorrection: true })).toBe("ሔ");
    expect(transliterateWord("Ha", { smartCorrection: true })).toBe("ሐ");
    expect(transliterateWord("He", { smartCorrection: true })).toBe("ሔ");
    expect(transliterateWord("Haa", { smartCorrection: true })).toBe("ሓ");
    expect(transliterateWord("sse", { smartCorrection: true })).toBe("ሠ");
    expect(transliterateWord("ssa", { smartCorrection: true })).toBe("ሣ");

    expect(transliterateWord("CHe")).toBe("ጨ");
    expect(transliterateWord("CHa")).toBe("ጫ");
    expect(transliterateWord("c'e")).toBe("ጨ");
    expect(transliterateWord("c'a")).toBe("ጫ");

    expect(transliterateWord("Pe")).toBe("ጰ");
    expect(transliterateWord("Pa")).toBe("ጳ");
    expect(transliterateWord("p'e")).toBe("ጰ");
    expect(transliterateWord("p'a")).toBe("ጳ");

    // Alternate homophone root triggers
    expect(transliterateWord("Ce")).toBe("ጨ");
    expect(transliterateWord("Ca")).toBe("ጫ");
    expect(transliterateWord("Se")).toBe("ሠ");
    expect(transliterateWord("Sa")).toBe("ሣ");
    expect(transliterateWord("s'e")).toBe("ሠ");
    expect(transliterateWord("s'a")).toBe("ሣ");
    expect(transliterateWord("Ke")).toBe("ቀ");
    expect(transliterateWord("Ka")).toBe("ቃ");
    expect(transliterateWord("Qe")).toBe("ቀ");
    expect(transliterateWord("Qa")).toBe("ቃ");
    expect(transliterateWord("Be")).toBe("ቨ");
    expect(transliterateWord("Ba")).toBe("ቫ");
    expect(transliterateWord("b'e")).toBe("ቨ");
    expect(transliterateWord("b'a")).toBe("ቫ");
    expect(transliterateWord("xe")).toBe("ኸ");
    expect(transliterateWord("xa")).toBe("ኻ");
    expect(transliterateWord("Xe")).toBe("ኸ");
    expect(transliterateWord("Xa")).toBe("ኻ");
    expect(transliterateWord("Ae")).toBe("ዔ");
    expect(transliterateWord("Aa")).toBe("ዐ");
    expect(transliterateWord("Aaa")).toBe("ዓ");
    expect(transliterateWord("a'e")).toBe("ዔ");
    expect(transliterateWord("a'a")).toBe("ዐ");
    expect(transliterateWord("a'aa")).toBe("ዓ");
    expect(transliterateWord("z'e")).toBe("ዠ");
    expect(transliterateWord("z'a")).toBe("ዣ");
    expect(transliterateWord("n'e")).toBe("ኘ");
    expect(transliterateWord("n'a")).toBe("ኛ");
    expect(transliterateWord("ts'e")).toBe("ፀ");
    expect(transliterateWord("ts'a")).toBe("ፃ");
    expect(transliterateWord("xhe")).toBe("ኄ");
    expect(transliterateWord("xha")).toBe("ኀ");
    expect(transliterateWord("xhaa")).toBe("ኃ");
    expect(transliterateWord("hxe")).toBe("ኄ");
    expect(transliterateWord("hxa")).toBe("ኀ");
    expect(transliterateWord("hxaa")).toBe("ኃ");
  });

  it("handles capitalized words (Selam Yihun) and standalone i conversion", () => {
    expect(transliterateText("Selam Yihun")).toBe("ሰላም ይሁን");
    expect(transliterateText("selam yihun")).toBe("ሰላም ይሁን");
    expect(transliterateText("SELAM YIHUN")).toBe("ሰላም ይሁን");
    expect(transliterateText("Shekuri")).toBe("ሸኩሪ");
    expect(transliterateText("i")).toBe("ኢ");
    expect(transliterateText("I")).toBe("ኢ");
    expect(transliterateText("in")).toBe("ኢን");
    expect(transliterateText("ityop'ya")).toBe("ኢትዮጵያ");
  });
});

describe("Duplicate, Consecutive & Repeated Syllables", () => {
  it("handles repeated identical syllables", () => {
    expect(transliterateWord("bebe")).toBe("በበ");
    expect(transliterateWord("sese")).toBe("ሰሰ");
    expect(transliterateWord("lala")).toBe("ላላ");
    expect(transliterateWord("mimi")).toBe("ሚሚ");
    expect(transliterateWord("shasha")).toBe("ሻሻ");
    expect(transliterateWord("chache")).toBe("ቻቸ");
  });

  it("handles repeated bare consonants", () => {
    expect(transliterateWord("ssss")).toBe("ሥሥ");
    expect(transliterateWord("lllll")).toBe("ልልልልል");
    expect(transliterateWord("mmmm")).toBe("ምምምም");
  });
});

describe("Punctuation, Numbers, Formatting & Mixed Inputs", () => {
  it("converts Ethiopic punctuation when convertPunctuation is true", () => {
    expect(transliterateText("selam.", { convertPunctuation: true })).toBe("ሰላም።");
    expect(transliterateText("selam::", { convertPunctuation: true })).toBe("ሰላም።");
    expect(transliterateText("selam..", { convertPunctuation: true })).toBe("ሰላም።");
    expect(transliterateText("bet:", { convertPunctuation: true })).toBe("ቤት፡");
    expect(transliterateText("abebe, beso", { convertPunctuation: true })).toBe("አበበ፣ በሶ");
    expect(transliterateText("abebe; beso", { convertPunctuation: true })).toBe("አበበ፤ በሶ");
    expect(transliterateText("yihun:-", { convertPunctuation: true })).toBe("ይሁን፥");
    expect(transliterateText("yihun|", { convertPunctuation: true })).toBe("ይሁን፥");
    expect(transliterateText("yihun:::", { convertPunctuation: true })).toBe("ይሁን፦");
    expect(transliterateText("yihun>", { convertPunctuation: true })).toBe("ይሁን፦");
    expect(transliterateText("mewad?", { convertPunctuation: true })).toBe("መዋድ፧");
    expect(transliterateText("fidel@", { convertPunctuation: true })).toBe("ፊደል፠");
    expect(transliterateText("fidel#", { convertPunctuation: true })).toBe("ፊደል፨");
    expect(transliterateText("fidel~", { convertPunctuation: true })).toBe("ፊደል፟");
    expect(transliterateText("fidel*", { convertPunctuation: true })).toBe("ፊደል፠");
    expect(transliterateText("fidel**", { convertPunctuation: true })).toBe("ፊደል፨");
  });

  it("preserves Latin punctuation when convertPunctuation is false", () => {
    expect(transliterateText("selam.", { convertPunctuation: false })).toBe("ሰላም.");
    expect(transliterateText("bet:", { convertPunctuation: false })).toBe("ቤት:");
    expect(transliterateText("abebe, beso", { convertPunctuation: false })).toBe("አበበ, በሶ");
  });

  it("preserves tabs, newlines, spaces, and unknown symbols", () => {
    expect(transliterateText("selam\tyihun\nendemin")).toBe("ሰላም\tይሁን\nእንደምን");
    expect(transliterateText("code @ 2026 #123!")).toBe("ቾደ @ 2026 #123!");
    expect(transliterateText("")).toBe("");
    expect(transliterateText("   ")).toBe("   ");
  });
});

describe("Composition Engine — Deep Interception & Backspace Tests", () => {
  it("handles backspacing at every progressive composition stage", () => {
    const engine = new CompositionEngine();

    let state = engine.feedChar("s");
    expect(state.rendered).toBe("ስ");

    state = engine.feedChar("e");
    expect(state.rendered).toBe("ሰ");

    state = engine.feedChar("l");
    expect(state.rendered).toBe("ሰል");

    state = engine.feedChar("a");
    expect(state.rendered).toBe("ሰላ");

    state = engine.feedChar("m");
    expect(state.rendered).toBe("ሰላም");

    state = engine.backspace();
    expect(state.rendered).toBe("ሰላ");
    expect(state.buffer).toBe("sela");

    state = engine.backspace();
    expect(state.rendered).toBe("ሰል");
    expect(state.buffer).toBe("sel");

    state = engine.backspace();
    expect(state.rendered).toBe("ሰ");
    expect(state.buffer).toBe("se");

    state = engine.backspace();
    expect(state.rendered).toBe("ስ");
    expect(state.buffer).toBe("s");

    state = engine.backspace();
    expect(state.rendered).toBe("");
    expect(state.buffer).toBe("");

    state = engine.feedChar("a");
    expect(state.rendered).toBe("አ");

    state = engine.feedChar("b");
    expect(state.rendered).toBe("አብ");

    state = engine.feedChar("e");
    expect(state.rendered).toBe("አበ");
  });

  it("handles space commit followed by new word composition and backspace", () => {
    const engine = new CompositionEngine();

    engine.feedChar("s");
    engine.feedChar("e");
    engine.feedChar("l");
    engine.feedChar("a");
    engine.feedChar("m");

    let state = engine.feedChar(" ");
    expect(state.committed).toBe(true);
    expect(engine.getState().buffer).toBe("");

    state = engine.feedChar("y");
    expect(state.rendered).toBe("ይ");
    state = engine.feedChar("i");
    expect(state.rendered).toBe("ይ");
    state = engine.feedChar("h");
    expect(state.rendered).toBe("ይህ");
    state = engine.feedChar("u");
    expect(state.rendered).toBe("ይሁ");
    state = engine.feedChar("n");
    expect(state.rendered).toBe("ይሁን");

    state = engine.backspace();
    expect(state.rendered).toBe("ይሁ");
    expect(state.buffer).toBe("yihu");

    state = engine.backspace();
    expect(state.rendered).toBe("ይህ");
    expect(state.buffer).toBe("yih");

    state = engine.backspace();
    expect(state.rendered).toBe("ይ");
    expect(state.buffer).toBe("yi");

    state = engine.backspace();
    expect(state.rendered).toBe("ይ");
    expect(state.buffer).toBe("y");

    state = engine.backspace();
    expect(state.rendered).toBe("");
    expect(state.buffer).toBe("");
    expect(engine.getState().buffer).toBe("");
  });
});
