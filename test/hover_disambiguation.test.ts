import { describe, it, expect } from "bun:test";
import { AmbiguitySpanTracker } from "../src/engine/ambiguity.js";

describe("AmbiguitySpanTracker", () => {
  it("records ambiguous spans and retrieves them by position", () => {
    const tracker = new AmbiguitySpanTracker();
    const docUri = "file:///test.txt";
    const wordStartPos = { line: 0, character: 0 };

    tracker.addSpans(docUri, wordStartPos, [
      {
        chosen: "ተ",
        alternate: "ትእ",
        startOffset: 0,
        endOffset: 1,
        raw: "te",
      },
    ]);

    const getTextInRange = (range: any) => "ተ";

    const span = tracker.findSpanAt(
      docUri,
      { line: 0, character: 0 },
      getTextInRange
    );

    expect(span).not.toBeNull();
    expect(span?.chosen).toBe("ተ");
    expect(span?.alternate).toBe("ትእ");
  });

  it("invalidates span if document text at range no longer matches chosen text", () => {
    const tracker = new AmbiguitySpanTracker();
    const docUri = "file:///test.txt";
    const wordStartPos = { line: 0, character: 0 };

    tracker.addSpans(docUri, wordStartPos, [
      {
        chosen: "ተ",
        alternate: "ትእ",
        startOffset: 0,
        endOffset: 1,
        raw: "te",
      },
    ]);

    const getTextInRange = (range: any) => "ሰላም"; // text modified in editor

    const span = tracker.findSpanAt(
      docUri,
      { line: 0, character: 0 },
      getTextInRange
    );

    expect(span).toBeNull();
  });
});
