import { describe, expect, test } from "bun:test";
import { SmartCorrector } from "../src/engine/corrector.js";
import { Transliterator } from "../src/engine/transliterator.js";

describe("Smart Phonetic Correction Engine (Step 2)", () => {
  const corrector = new SmartCorrector();

  test("generates trailing character collapsed candidates", () => {
    const candidates = corrector.normalizeInput("selamm");
    expect(candidates).toContain("selamm");
    expect(candidates).toContain("selam");
  });

  test("generates digraph substitution candidates for ph and ck", () => {
    const phCandidates = corrector.normalizeInput("amhariph");
    expect(phCandidates).toContain("amharif");

    const ckCandidates = corrector.normalizeInput("amharick");
    expect(ckCandidates).toContain("amharik");
  });

  test("correctWord selects top valid match using lookup function", () => {
    const mockLookup = (word: string) => {
      if (word === "selam") return "ሰላም";
      return null;
    };

    const corrected = corrector.correctWord("selamm", mockLookup);
    expect(corrected).toBe("ሰላም");
  });

  test("Transliterator auto-corrects spelling variants when smartCorrection is true", () => {
    const t = new Transliterator({ smartCorrection: true });
    expect(t.transliterate("selamm")).toBe("ሰላም");
    expect(t.transliterate("yihunn")).toBe("ይሁን");
  });

  test("Transliterator preserves exact typing when smartCorrection is false", () => {
    const t = new Transliterator({ smartCorrection: false });
    expect(t.transliterate("selamm")).toBe("ሰላምም");
  });
});
