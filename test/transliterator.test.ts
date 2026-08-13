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
    expect(transliterateWord("sha")).toBe("ሻ");
    expect(transliterateWord("che")).toBe("ቸ");
    expect(transliterateWord("cha")).toBe("ቻ");
    expect(transliterateWord("tse")).toBe("ጸ");
    expect(transliterateWord("tsa")).toBe("ጻ");
    expect(transliterateWord("me")).toBe("መ");
    expect(transliterateWord("ma")).toBe("ማ");
    expect(transliterateWord("Te")).toBe("ጠ");
    expect(transliterateWord("Ta")).toBe("ጣ");
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
