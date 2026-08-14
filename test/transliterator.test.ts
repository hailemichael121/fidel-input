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

  it("handles 8th order labialized letters directly with w", () => {
    expect(transliterateWord("lw")).toBe("ሏ");
    expect(transliterateWord("mw")).toBe("ሟ");
    expect(transliterateWord("tw")).toBe("ቷ");
    expect(transliterateWord("kw")).toBe("ኳ");
    expect(transliterateWord("gw")).toBe("ጓ");
    expect(transliterateWord("sw")).toBe("ሷ");
    expect(transliterateWord("bw")).toBe("ቧ");
    expect(transliterateWord("hw")).toBe("ኋ");
    expect(transliterateWord("qw")).toBe("ቋ");
    expect(transliterateWord("rw")).toBe("ሯ");
    expect(transliterateWord("nw")).toBe("ኗ");
    expect(transliterateWord("nyw")).toBe("ኟ");
    expect(transliterateWord("zw")).toBe("ዟ");
    expect(transliterateWord("dw")).toBe("ዷ");
    expect(transliterateWord("jw")).toBe("ጇ");
    expect(transliterateWord("Tw")).toBe("ጧ");
    expect(transliterateWord("CHw")).toBe("ጯ");
    expect(transliterateWord("Pw")).toBe("ጷ");
    expect(transliterateWord("tsw")).toBe("ጿ");
    expect(transliterateWord("fw")).toBe("ፏ");
  });

  it("handles fast consonant clusters without merging errors", () => {
    expect(transliterateWord("amst")).toBe("አምስት");
    expect(transliterateWord("gebriel")).toBe("ገብርኤል");
  });

  it("handles continuous 6th order consonant and standalone vowel via E", () => {
    expect(transliterateWord("tE")).toBe("ትእ");
    expect(transliterateWord("gEz")).toBe("ግእዝ");
    expect(transliterateWord("mEraf")).toBe("ምእራፍ");
    expect(transliterateWord("lElna")).toBe("ልእልና");
    expect(transliterateWord("tEzaz")).toBe("ትእዛዝ");
    expect(transliterateWord("yEti")).toBe("ይእቲ");
    expect(transliterateWord("tEgst")).toBe("ትእግስት");
  });

  it("separates second 'a' for non-H families while preserving H family 4th order", () => {
    // H family: ha -> ሀ, haa -> ሃ
    expect(transliterateWord("ha")).toBe("ሀ");
    expect(transliterateWord("haa")).toBe("ሃ");
    // Non-H families: la -> ላ, laa -> ላአ, ba -> ባ, baa -> ባአ
    expect(transliterateWord("la")).toBe("ላ");
    expect(transliterateWord("laa")).toBe("ላአ");
    expect(transliterateWord("ba")).toBe("ባ");
    expect(transliterateWord("baa")).toBe("ባአ");
  });
});
