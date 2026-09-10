import { describe, expect, test } from "bun:test";
import { PersonalDictionary } from "../src/engine/dictionary.js";
import { SmartCorrector } from "../src/engine/corrector.js";
import { SuggestionEngine } from "../src/engine/suggestions.js";
import { Transliterator } from "../src/engine/transliterator.js";

describe("Phase 4 — Intelligence & Customization Features", () => {

  describe("PersonalDictionary (src/engine/dictionary.ts)", () => {
    test("adds, retrieves, and checks custom dictionary entries", () => {
      const dict = new PersonalDictionary();
      dict.addEntry("myword", "ሚያቃልል");
      dict.addEntry("haile", "ኃይለ");

      expect(dict.has("myword")).toBe(true);
      expect(dict.get("myword")).toBe("ሚያቃልል");
      expect(dict.get("haile")).toBe("ኃይለ");
    });

    test("removes entries correctly", () => {
      const dict = new PersonalDictionary({ temp: "ቴምፕ" });
      expect(dict.has("temp")).toBe(true);

      const removed = dict.removeEntry("temp");
      expect(removed).toBe(true);
      expect(dict.has("temp")).toBe(false);
    });

    test("overrides standard transliteration with personal dictionary rules", () => {
      const t = new Transliterator({
        dictionary: {
          myword: "ሚያቃልል",
          haile: "ኃይለ",
        },
      });

      expect(t.transliterate("myword")).toBe("ሚያቃልል");
      expect(t.transliterate("haile")).toBe("ኃይለ");
    });
  });

  describe("SmartCorrector (src/engine/corrector.ts)", () => {
    test("normalizes double-consonant phonetic typos", () => {
      const corrector = new SmartCorrector();
      const candidates = corrector.normalizeInput("selamm");

      expect(candidates).toContain("selamm");
      expect(candidates).toContain("selam");
    });

    test("auto-corrects trailing double consonants in Transliterator", () => {
      const t = new Transliterator({ smartCorrection: true });
      expect(t.transliterate("selamm")).toBe("ሰላም");
      expect(t.transliterate("yihunn")).toBe("ይሁን");
    });
  });

  describe("SuggestionEngine (src/engine/suggestions.ts)", () => {
    test("generates homophone alternative candidates for phonetic roots", () => {
      const engine = new SuggestionEngine();
      const suggestions = engine.generateSuggestions("haile", "ሀይለ");

      expect(suggestions).toContain("ሀይለ");
      expect(suggestions.length).toBeGreaterThan(1);
    });
  });

});
