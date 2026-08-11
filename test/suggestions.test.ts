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
});
