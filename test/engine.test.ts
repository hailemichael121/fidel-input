import { describe, expect, it } from "bun:test";
import { transliterateWord } from "../src/engine/transliterator.js";
import { CompositionEngine } from "../src/engine/composition.js";

describe("Fidel Transliterator", () => {
  it("basic h family", () => {
    expect(transliterateWord("ha")).toBe("ሀ");
    expect(transliterateWord("he")).toBe("ሀ");
    expect(transliterateWord("hu")).toBe("ሁ");
    expect(transliterateWord("hi")).toBe("ሂ");
    expect(transliterateWord("haa")).toBe("ሃ");
    expect(transliterateWord("hee")).toBe("ሄ");
    expect(transliterateWord("h")).toBe("ህ");
    expect(transliterateWord("ho")).toBe("ሆ");
  });

  it("basic s family", () => {
    expect(transliterateWord("sa")).toBe("ሰ");
    expect(transliterateWord("se")).toBe("ሰ");
    expect(transliterateWord("su")).toBe("ሱ");
    expect(transliterateWord("si")).toBe("ሲ");
    expect(transliterateWord("saa")).toBe("ሳ");
    expect(transliterateWord("see")).toBe("ሴ");
    expect(transliterateWord("s")).toBe("ስ");
    expect(transliterateWord("so")).toBe("ሶ");
  });

  it("multi-character consonants", () => {
    expect(transliterateWord("sha")).toBe("ሸ");
    expect(transliterateWord("she")).toBe("ሸ");
    expect(transliterateWord("shu")).toBe("ሹ");
    expect(transliterateWord("shi")).toBe("ሺ");
    expect(transliterateWord("shaa")).toBe("ሻ");
    expect(transliterateWord("shee")).toBe("ሼ");
    expect(transliterateWord("sh")).toBe("ሽ");
    expect(transliterateWord("sho")).toBe("ሾ");
  });

  it("common words", () => {
    expect(transliterateWord("bet")).toBe("ቤት");
    expect(transliterateWord("yihun")).toBe("ይሁን");
    expect(transliterateWord("ethiopia")).toBe("ኢትዮጵያ");
    expect(transliterateWord("abebe")).toBe("አበበ");
  });

  it("preserves spaces", () => {
    expect(transliterateWord("  ")).toBe("  ");
  });

  it("preserves unknown characters", () => {
    expect(transliterateWord("123")).toBe("123");
    expect(transliterateWord("!!!")).toBe("!!!");
  });
});

describe("CompositionEngine", () => {
  it("maintains raw and rendered state", () => {
    const engine = new CompositionEngine();
    engine.feedChar("s");
    expect(engine.getState().rendered).toBe("ስ");
    engine.feedChar("a");
    expect(engine.getState().rendered).toBe("ሰ");
  });

  it("commit resets composition", () => {
    const engine = new CompositionEngine();
    engine.feedChar("s");
    engine.feedChar("a");
    const state = engine.feedChar(" ");
    expect(state.committed).toBe(true);
    expect(state.rendered).toBe("ሰ ");
    expect(engine.raw).toBe("");
  });
});
