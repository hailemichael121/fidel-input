import { describe, it, expect } from "bun:test";
import { buildFlatMapping, FIDEL_FAMILIES } from "../src/engine/mapping.js";
import { transliterateText, transliterateWord } from "../src/engine/transliterator.js";
import { CompositionEngine } from "../src/engine/composition.js";

describe("Exhaustive Ethiopic Syllabary Test Suite (33 Families x 7 Orders)", () => {
  const flatMap = buildFlatMapping();

  it("verifies all 33 core Ethiopic families map correctly", () => {
    const familyKeys = Object.keys(FIDEL_FAMILIES);
    expect(familyKeys.length).toBeGreaterThanOrEqual(33);

    for (const prefix of familyKeys) {
      const family = FIDEL_FAMILIES[prefix];

      expect(flatMap[prefix]).toBe(family[""]);
      expect(flatMap[prefix + "e"]).toBe(family.e);
      expect(flatMap[prefix + "u"]).toBe(family.u);
      expect(flatMap[prefix + "i"]).toBe(family.i);
      expect(flatMap[prefix + "a"]).toBe(family.a);
      expect(flatMap[prefix + "ee"]).toBe(family.ee);
      expect(flatMap[prefix + "o"]).toBe(family.o);

      if (family.wa) {
        expect(flatMap[prefix + "wa"]).toBe(family.wa);
      }
    }
  });

  it("translates 8th-order labialized / diqala compound forms", () => {
    expect(transliterateWord("lwa")).toBe("ሏ");
    expect(transliterateWord("mwa")).toBe("ሟ");
    expect(transliterateWord("rwa")).toBe("ሯ");
    expect(transliterateWord("swa")).toBe("ሷ");
    expect(transliterateWord("shwa")).toBe("ሿ");
    expect(transliterateWord("qwa")).toBe("ቋ");
    expect(transliterateWord("bwa")).toBe("ቧ");
    expect(transliterateWord("twa")).toBe("ቷ");
    expect(transliterateWord("chwa")).toBe("ቿ");
    expect(transliterateWord("nwa")).toBe("ኗ");
    expect(transliterateWord("kwa")).toBe("ኳ");
    expect(transliterateWord("zwa")).toBe("ዟ");
    expect(transliterateWord("zhwa")).toBe("ዧ");
    expect(transliterateWord("dwa")).toBe("ዷ");
    expect(transliterateWord("jwa")).toBe("ጇ");
    expect(transliterateWord("gwa")).toBe("ጓ");
    expect(transliterateWord("Twa")).toBe("ጧ");
    expect(transliterateWord("CHwa")).toBe("ጯ");
    expect(transliterateWord("Pwa")).toBe("ጷ");
    expect(transliterateWord("tswa")).toBe("ጿ");
    expect(transliterateWord("fwa")).toBe("ፏ");
  });
});

describe("Multi-Character Consonants & Capitalization Variants", () => {
  it("handles multi-character consonant prefixes", () => {
    expect(transliterateWord("sha")).toBe("ሸ");
    expect(transliterateWord("shu")).toBe("ሹ");
    expect(transliterateWord("shi")).toBe("ሺ");
    expect(transliterateWord("shaa")).toBe("ሻ");
    expect(transliterateWord("she")).toBe("ሼ");
    expect(transliterateWord("shee")).toBe("ሼ");
    expect(transliterateWord("sho")).toBe("ሾ");
    expect(transliterateWord("Sa")).toBe("ሰ");
    expect(transliterateWord("Sha")).toBe("ሸ");

    expect(transliterateWord("cha")).toBe("ቸ");
    expect(transliterateWord("chu")).toBe("ቹ");
    expect(transliterateWord("chi")).toBe("ቺ");
    expect(transliterateWord("chaa")).toBe("ቻ");
    expect(transliterateWord("che")).toBe("ቼ");
    expect(transliterateWord("chee")).toBe("ቼ");
    expect(transliterateWord("cho")).toBe("ቾ");
    expect(transliterateWord("ca")).toBe("ቸ");

    expect(transliterateWord("tsa")).toBe("ጸ");
    expect(transliterateWord("tsu")).toBe("ጹ");
    expect(transliterateWord("tsi")).toBe("ጺ");
    expect(transliterateWord("tsaa")).toBe("ጻ");
    expect(transliterateWord("tse")).toBe("ጼ");
    expect(transliterateWord("tsee")).toBe("ጼ");
    expect(transliterateWord("tso")).toBe("ጾ");
    expect(transliterateWord("Tza")).toBe("ጸ");

    expect(transliterateWord("kha")).toBe("ኸ");
    expect(transliterateWord("khu")).toBe("ኹ");

    expect(transliterateWord("zha")).toBe("ዠ");
    expect(transliterateWord("Za")).toBe("ዠ");

    expect(transliterateWord("Ta")).toBe("ጠ");
    expect(transliterateWord("t'a")).toBe("ጠ");

    // Verify homophone family variants (H / hh / ss) with smartCorrection enabled
    expect(transliterateWord("hha", { smartCorrection: true })).toBe("ሐ");
    expect(transliterateWord("hhaa", { smartCorrection: true })).toBe("ሓ");
    expect(transliterateWord("hhe", { smartCorrection: true })).toBe("ሔ");
    expect(transliterateWord("hhee", { smartCorrection: true })).toBe("ሔ");
    expect(transliterateWord("Ha", { smartCorrection: true })).toBe("ሐ");
    expect(transliterateWord("Haa", { smartCorrection: true })).toBe("ሓ");
    expect(transliterateWord("ssa", { smartCorrection: true })).toBe("ሠ");
    expect(transliterateWord("ssaa", { smartCorrection: true })).toBe("ሣ");

    expect(transliterateWord("CHe")).toBe("ጨ");
    expect(transliterateWord("c'e")).toBe("ጨ");

    expect(transliterateWord("Pe")).toBe("ጰ");
    expect(transliterateWord("p'e")).toBe("ጰ");
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
    expect(transliterateText("abebe, beso", { convertPunctuation: true })).toBe("አበበ፤ በሶ");
    expect(transliterateText("yihun;-", { convertPunctuation: true })).toBe("ይሁን፤-");
    expect(transliterateText("mewad?", { convertPunctuation: true })).toBe("መዋድ፧");
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

    state = engine.backspace();
    expect(state.rendered).toBe("ይ");

    state = engine.backspace();
    expect(state.rendered).toBe("");
    expect(engine.getState().buffer).toBe("");
  });
});
