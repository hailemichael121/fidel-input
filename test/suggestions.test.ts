import { describe, expect, test } from "bun:test";
import { SuggestionEngine } from "../src/engine/suggestions.js";

describe("Candidate Suggestions Engine (Step 3)", () => {
  const engine = new SuggestionEngine();

  test("generates alternative candidates for homophone consonant roots", () => {
    const suggestions = engine.generateSuggestions("haile", "ሀይለ");
    expect(suggestions).toContain("ሀይለ");
    expect(suggestions.length).toBeGreaterThan(1);
  });

  test("generates detailed candidate objects with labels and descriptions", () => {
    const candidateObjects = engine.getCandidateObjects("haile", "ሀይለ");
    expect(candidateObjects.length).toBeGreaterThan(0);
    expect(candidateObjects[0].label).toBe("ሀይለ");
    expect(candidateObjects[0].description).toBe("Default Transliteration");
    expect(candidateObjects[1].description).toContain("Homophone Variant");
  });

  test("returns empty array for empty inputs", () => {
    const emptySuggestions = engine.generateSuggestions("", "");
    expect(emptySuggestions).toEqual([]);
  });

  test("generates ambiguous split candidate with shortcut tip for ambiguous sequences", () => {
    const teSplit = engine.getAmbiguousSplitCandidate("te", "ተ");
    expect(teSplit).not.toBeNull();
    expect(teSplit?.ethiopic).toBe("ትእ");
    expect(teSplit?.description).toContain("Type capital E");

    const tiSplit = engine.getAmbiguousSplitCandidate("ti", "ቲ");
    expect(tiSplit).not.toBeNull();
    expect(tiSplit?.ethiopic).toBe("ትኢ");
    expect(tiSplit?.description).toContain("Type capital I");
  });

  test("does not generate false positive split suggestions for common words", () => {
    expect(engine.getAmbiguousSplitCandidate("selam", "ሰላም")).toBeNull();
    expect(engine.getAmbiguousSplitCandidate("abebe", "አበበ")).toBeNull();
    expect(engine.getAmbiguousSplitCandidate("bet", "ቤት")).toBeNull();
  });
});
