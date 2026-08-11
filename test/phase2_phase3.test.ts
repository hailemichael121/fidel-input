import { describe, expect, test } from "bun:test";
import { convertNumberToEthiopic, convertNumbersInText } from "../src/engine/numbers.js";
import { CompositionEngine } from "../src/engine/composition.js";
import { Transliterator } from "../src/engine/transliterator.js";

describe("Phase 2 & Phase 3 Feature Verification", () => {

  describe("Ethiopic Numeral System (src/engine/numbers.ts)", () => {
    test("converts single digits 1-9 to Ethiopic numerals", () => {
      expect(convertNumberToEthiopic("1")).toBe("፩");
      expect(convertNumberToEthiopic("5")).toBe("፭");
      expect(convertNumberToEthiopic("9")).toBe("፱");
    });

    test("converts two-digit numbers (10-99)", () => {
      expect(convertNumberToEthiopic("10")).toBe("፲");
      expect(convertNumberToEthiopic("12")).toBe("፲፪");
      expect(convertNumberToEthiopic("25")).toBe("፳፭");
      expect(convertNumberToEthiopic("99")).toBe("፺፱");
    });

    test("converts three-digit numbers (100-999)", () => {
      expect(convertNumberToEthiopic("100")).toBe("፻");
      expect(convertNumberToEthiopic("105")).toBe("፻፭");
      expect(convertNumberToEthiopic("125")).toBe("፻፳፭");
      expect(convertNumberToEthiopic("200")).toBe("፪፻");
      expect(convertNumberToEthiopic("999")).toBe("፱፻፺፱");
    });

    test("converts four-digit numbers (1000-9999)", () => {
      expect(convertNumberToEthiopic("1000")).toBe("፲፻");
      expect(convertNumberToEthiopic("2026")).toBe("፳፻፳፮");
    });

    test("replaces standalone numbers in text when enabled", () => {
      expect(convertNumbersInText("selam 123 ethiopia 2026", true)).toBe("selam ፻፳፫ ethiopia ፳፻፳፮");
      expect(convertNumbersInText("selam 123", false)).toBe("selam 123");
    });
  });

  describe("Expanded Word Boundary Delimiters (CompositionEngine)", () => {
    test("commits composition on punctuation boundaries", () => {
      const engine = new CompositionEngine();
      engine.feedChar("s");
      engine.feedChar("e");
      engine.feedChar("l");
      engine.feedChar("a");
      engine.feedChar("m");

      const state = engine.feedChar(",");
      expect(state.committed).toBe(true);
      expect(state.rendered).toBe("ሰላም,");
      expect(engine.raw).toBe("");
    });

    test("converts boundary punctuation when convertPunctuation is true", () => {
      const engine = new CompositionEngine({ convertPunctuation: true });
      engine.feedChar("s");
      engine.feedChar("e");
      engine.feedChar("l");
      engine.feedChar("a");
      engine.feedChar("m");

      const state = engine.feedChar(".");
      expect(state.committed).toBe(true);
      expect(state.rendered).toBe("ሰላም።");
      expect(engine.raw).toBe("");
    });
  });

  describe("Glottal Stop Apostrophe Parsing & Transliterator Features", () => {
    test("transliterates glottal stop consonant + apostrophe patterns", () => {
      const t = new Transliterator();
      expect(t.transliterate("k'a")).toBe("ቃ");
      expect(t.transliterate("t'a")).toBe("ጣ");
      expect(t.transliterate("c'a")).toBe("ጫ");
      expect(t.transliterate("p'e")).toBe("ጰ");
      expect(t.transliterate("p'a")).toBe("ጳ");
    });

    test("transliterates text with convertNumbers enabled", () => {
      const t = new Transliterator({ convertNumbers: true });
      expect(t.transliterate("selam 25")).toBe("ሰላም ፳፭");
    });
  });

});
