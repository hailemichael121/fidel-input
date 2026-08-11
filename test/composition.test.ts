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
});
