import { describe, it, expect } from "bun:test";
import { CompositionEngine } from "../src/engine/composition.js";

describe("Composition Engine", () => {
  it("progressively builds composition state as characters are fed", () => {
    const engine = new CompositionEngine();

    let state = engine.feedChar("s");
    expect(state.rendered).toBe("ስ");
    expect(state.committed).toBe(false);

    state = engine.feedChar("e");
    expect(state.rendered).toBe("ሰ");

    state = engine.feedChar("l");
    expect(state.rendered).toBe("ሰል");

    state = engine.feedChar("a");
    expect(state.rendered).toBe("ሰላ");

    state = engine.feedChar("m");
    expect(state.rendered).toBe("ሰላም");
  });

  it("resets and commits on space character", () => {
    const engine = new CompositionEngine();
    engine.feedChar("s");
    engine.feedChar("e");
    engine.feedChar("l");
    engine.feedChar("a");
    engine.feedChar("m");

    const state = engine.feedChar(" ");
    expect(state.rendered).toBe("ሰላም ");
    expect(state.committed).toBe(true);
    expect(engine.getState().buffer).toBe("");
  });

  it("handles backspace correctly", () => {
    const engine = new CompositionEngine();
    engine.feedChar("s");
    engine.feedChar("e");
    engine.feedChar("l");
    engine.feedChar("a");
    engine.feedChar("m");

    let state = engine.backspace();
    expect(state?.rendered).toBe("ሰላ");

    state = engine.backspace();
    expect(state?.rendered).toBe("ሰል");

    state = engine.feedChar("a");
    expect(state?.rendered).toBe("ሰላ");

    state = engine.feedChar("m");
    expect(state?.rendered).toBe("ሰላም");
  });

  it("pops exactly one character per backspace on pending input (e.g. selamm)", () => {
    const engine = new CompositionEngine({ smartCorrection: true });
    engine.feedChar("s");
    engine.feedChar("e");
    engine.feedChar("l");
    engine.feedChar("a");
    engine.feedChar("m");
    const lastFeed = engine.feedChar("m");
    expect(lastFeed.rendered).toBe("ሰላምም");
    expect(engine.locked).toBe("ሰላም");
    expect(engine.pending).toBe("m");

    // 1st backspace pops trailing 'm' from pendingFragment -> buffer 'selam', rendered 'ሰላም'
    let state = engine.backspace();
    expect(engine.pending).toBe("");
    expect(engine.locked).toBe("ሰላም");
    expect(state.rendered).toBe("ሰላም");
    expect(state.replaceLength).toBe(4);

    // 2nd backspace when pending is empty -> does not mutate lockedOutput
    state = engine.backspace();
    expect(engine.locked).toBe("ሰላም");
    expect(state.replaceLength).toBe(0);
  });

  it("handles default merge mode (t + e -> ተ) and records ambiguity", () => {
    const engine = new CompositionEngine({ defaultSyllableMerging: "merge" });
    engine.feedChar("t");
    expect(engine.output).toBe("ት");

    const state = engine.feedChar("e");
    expect(state.rendered).toBe("ተ");
    expect(state.ambiguousSpans?.length).toBeGreaterThan(0);
    expect(state.ambiguousSpans?.[0].chosen).toBe("ተ");
    expect(state.ambiguousSpans?.[0].alternate).toBe("ትእ");
  });

  it("handles configurable standalone mode (t + e -> ትእ) and records ambiguity", () => {
    const engine = new CompositionEngine({ defaultSyllableMerging: "standalone" });
    engine.feedChar("t");
    expect(engine.output).toBe("ት");

    const state = engine.feedChar("e");
    expect(state.rendered).toBe("ትእ");
    expect(state.ambiguousSpans?.length).toBeGreaterThan(0);
    expect(state.ambiguousSpans?.[0].chosen).toBe("ትእ");
    expect(state.ambiguousSpans?.[0].alternate).toBe("ተ");
  });

  it("forces syllable separation via boundary character (t + '-' + e -> ትእ)", () => {
    const engine = new CompositionEngine({ defaultSyllableMerging: "merge", compositionBoundaryChar: "-" });
    engine.feedChar("t");
    expect(engine.output).toBe("ት");

    const boundaryState = engine.feedChar("-");
    expect(boundaryState.rendered).toBe("ት");
    expect(boundaryState.committed).toBe(false);

    const nextState = engine.feedChar("e");
    expect(nextState.rendered).toBe("ትእ");
  });

  it("forces syllable merge via merge character under standalone mode (t + '+' + e -> ተ)", () => {
    const engine = new CompositionEngine({ defaultSyllableMerging: "standalone", compositionMergeChar: "+" });
    engine.feedChar("t");
    expect(engine.output).toBe("ት");

    const mergeState = engine.feedChar("+");
    expect(mergeState.rendered).toBe("ት");

    const nextState = engine.feedChar("e");
    expect(nextState.rendered).toBe("ተ");
  });

  it("ensures backspace only pops from pendingFragment without mutating lockedOutput", () => {
    const engine = new CompositionEngine();
    // Feed 'mr' -> 'm' is locked, 'r' is pending
    engine.feedChar("m");
    engine.feedChar("r");
    expect(engine.output).toBe("ምር");
    expect(engine.locked).toBe("ም");
    expect(engine.pending).toBe("r");

    // Backspace once -> pops 'r', leaving locked 'ም' intact
    const state = engine.backspace();
    expect(state.rendered).toBe("ም");
    expect(engine.locked).toBe("ም");
    expect(engine.pending).toBe("");

    // Backspace again when pending is empty -> does not mutate locked
    const state2 = engine.backspace();
    expect(state2.rendered).toBe("ም");
    expect(state2.replaceLength).toBe(0);
    expect(engine.locked).toBe("ም");
    expect(engine.pending).toBe("");
  });

  it("handles capital-vowel split shortcut (tE -> ትእ, gEz -> ግእዝ, tEgst -> ትእግስት) under default merge mode", () => {
    const feed = (seq: string, mode: "merge" | "standalone" = "merge") => {
      const eng = new CompositionEngine({ defaultSyllableMerging: mode });
      for (const ch of seq) eng.feedChar(ch);
      return eng.output;
    };

    expect(feed("tE", "merge")).toBe("ትእ");
    expect(feed("gEz", "merge")).toBe("ግእዝ");
    expect(feed("tEgst", "merge")).toBe("ትእግስት");
    expect(feed("tI", "merge")).toBe("ትኢ");
    expect(feed("tU", "merge")).toBe("ትኡ");
    expect(feed("tO", "merge")).toBe("ትኦ");
  });

  it("handles capital-vowel split shortcut identically under standalone mode", () => {
    const feed = (seq: string, mode: "merge" | "standalone" = "standalone") => {
      const eng = new CompositionEngine({ defaultSyllableMerging: mode });
      for (const ch of seq) eng.feedChar(ch);
      return eng.output;
    };

    expect(feed("tE", "standalone")).toBe("ትእ");
    expect(feed("gEz", "standalone")).toBe("ግእዝ");
    expect(feed("tEgst", "standalone")).toBe("ትእግስት");
    expect(feed("tI", "standalone")).toBe("ትኢ");
    expect(feed("tU", "standalone")).toBe("ትኡ");
    expect(feed("tO", "standalone")).toBe("ትኦ");
  });

  it("preserves capital A as Ayn family without conflicting with vowel split", () => {
    const feed = (seq: string) => {
      const eng = new CompositionEngine();
      for (const ch of seq) eng.feedChar(ch);
      return eng.output;
    };

    expect(feed("Aa")).toBe("ዐ"); // 1st order Ayn
    expect(feed("A")).toBe("ዕ");  // 6th order Ayn
    expect(feed("t-a")).toBe("ትአ"); // split with Alef via boundary char
  });
});
