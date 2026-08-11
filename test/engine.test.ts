import { describe, expect, test } from "bun:test";

import { Transliterator } from "../src/engine/transliterator";
import { CompositionEngine } from "../src/engine/composition";

describe("Fidel Transliterator", () => {
    const transliterator = new Transliterator();

    test("basic h family", () => {
        expect(transliterator.transliterate("h")).toBe("ህ");
        expect(transliterator.transliterate("ha")).toBe("ሃ");
        expect(transliterator.transliterate("he")).toBe("ሀ");
        expect(transliterator.transliterate("hi")).toBe("ሂ");
        expect(transliterator.transliterate("hu")).toBe("ሁ");
        expect(transliterator.transliterate("hee")).toBe("ሄ");
        expect(transliterator.transliterate("ho")).toBe("ሆ");
    });

    test("basic s family", () => {
        expect(transliterator.transliterate("s")).toBe("ስ");
        expect(transliterator.transliterate("sa")).toBe("ሳ");
        expect(transliterator.transliterate("se")).toBe("ሰ");
        expect(transliterator.transliterate("si")).toBe("ሲ");
        expect(transliterator.transliterate("su")).toBe("ሱ");
        expect(transliterator.transliterate("see")).toBe("ሴ");
        expect(transliterator.transliterate("so")).toBe("ሶ");
    });

    test("multi-character consonants", () => {
        expect(transliterator.transliterate("sha")).toBe("ሻ");
        expect(transliterator.transliterate("she")).toBe("ሸ");
        expect(transliterator.transliterate("shi")).toBe("ሺ");

        expect(transliterator.transliterate("cha")).toBe("ቻ");
        expect(transliterator.transliterate("che")).toBe("ቸ");
    });

    test("common words", () => {
        expect(transliterator.transliterate("selam")).toBe("ሰላም");
        expect(transliterator.transliterate("yihun")).toBe("ይሁን");
        expect(transliterator.transliterate("bet")).toBe("ቤት");
        expect(transliterator.transliterate("abebe")).toBe("አበበ");
    });

    test("preserves spaces", () => {
        expect(transliterator.transliterate("selam yihun")).toBe(
            "ሰላም ይሁን",
        );
    });

    test("preserves unknown characters", () => {
        expect(transliterator.transliterate("hello!")).toBe(
            "ሀልሎ!",
        );
    });
});

describe("CompositionEngine", () => {
    test("maintains raw and rendered state", () => {
        const engine = new CompositionEngine();

        expect(engine.input("s")).toEqual({
            raw: "s",
            output: "ስ",
        });

        expect(engine.input("e")).toEqual({
            raw: "se",
            output: "ሰ",
        });

        expect(engine.input("l")).toEqual({
            raw: "sel",
            output: "ሰል",
        });

        expect(engine.input("a")).toEqual({
            raw: "sela",
            output: "ሰላ",
        });

        expect(engine.input("m")).toEqual({
            raw: "selam",
            output: "ሰላም",
        });
    });

    test("commit resets composition", () => {
        const engine = new CompositionEngine();

        engine.input("s");
        engine.input("e");

        expect(engine.commit()).toEqual({
            raw: "se",
            output: "ሰ",
        });

        expect(engine.state()).toEqual({
            raw: "",
            output: "",
        });
    });
});
