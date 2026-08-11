import { describe, it, expect } from "bun:test";
import { transliterateWord, transliterateText } from "../src/engine/transliterator.js";

describe("Transliterator", () => {
  it("transliterates core words correctly", () => {
    expect(transliterateWord("selam")).toBe("ሰላም");
    expect(transliterateWord("abebe")).toBe("አበበ");
    expect(transliterateWord("yihun")).toBe("ይሁን");
  });

  it("handles multi-character consonants correctly", () => {
    expect(transliterateWord("she")).toBe("ሸ");
    expect(transliterateWord("che")).toBe("ቸ");
    expect(transliterateWord("tse")).toBe("ጸ");
  });

  it("transliterates multi-word sentences", () => {
    expect(transliterateText("selam yihun")).toBe("ሰላም ይሁን");
    expect(transliterateText("abebe beso bela")).toBe("አበበ በሶ በላ");
  });

  it("converts Ethiopic punctuation when enabled", () => {
    expect(transliterateText("selam.", { convertPunctuation: true })).toBe("ሰላም።");
    expect(transliterateText("selam::", { convertPunctuation: true })).toBe("ሰላም።");
  });
});
