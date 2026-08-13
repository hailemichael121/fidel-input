import { describe, expect, it } from "bun:test";
import { FIDEL_FAMILIES, buildFlatMapping } from "../src/engine/mapping.js";

describe("Mapping Data", () => {
  it("contains all 33 core Ethiopic families", () => {
    const keys = Object.keys(FIDEL_FAMILIES);
    expect(keys.length).toBeGreaterThanOrEqual(33);
  });

  it("maps basic consonant families correctly", () => {
    expect(FIDEL_FAMILIES["s"].e).toBe("ሰ");
    expect(FIDEL_FAMILIES["s"].u).toBe("ሱ");
    expect(FIDEL_FAMILIES["s"].i).toBe("ሲ");
    expect(FIDEL_FAMILIES["s"].a).toBe("ሳ");
    expect(FIDEL_FAMILIES["s"].ee).toBe("ሴ");
    expect(FIDEL_FAMILIES["s"].o).toBe("ሶ");
    expect(FIDEL_FAMILIES["s"].wa).toBe("ሷ");
  });

  it("builds flat mapping with expanded vowel orders", () => {
    const flat = buildFlatMapping();
    expect(flat["s"]).toBe("ስ");
    expect(flat["se"]).toBe("ሰ");
    expect(flat["su"]).toBe("ሱ");
    expect(flat["si"]).toBe("ሲ");
    expect(flat["sa"]).toBe("ሳ");
    expect(flat["saa"]).toBe("ሳ");
    expect(flat["see"]).toBe("ሴ");
    expect(flat["so"]).toBe("ሶ");
    expect(flat["swa"]).toBe("ሷ");

    expect(flat["sh"]).toBe("ሽ");
    expect(flat["she"]).toBe("ሸ");
    expect(flat["sha"]).toBe("ሻ");
    expect(flat["shaa"]).toBe("ሻ");
    expect(flat["shee"]).toBe("ሼ");

    expect(flat["me"]).toBe("መ");
    expect(flat["ma"]).toBe("ማ");
    expect(flat["le"]).toBe("ለ");
    expect(flat["la"]).toBe("ላ");
    expect(flat["Te"]).toBe("ጠ");
    expect(flat["Ta"]).toBe("ጣ");
    expect(flat["CHe"]).toBe("ጨ");
    expect(flat["CHa"]).toBe("ጫ");
    expect(flat["Pe"]).toBe("ጰ");
    expect(flat["Pa"]).toBe("ጳ");

    expect(flat["lwa"]).toBe("ሏ");
    expect(flat["mwa"]).toBe("ሟ");
  });

  it("verifies 1st order (e) vs 4th order (a) rule across all 33 families", () => {
    const flat = buildFlatMapping();
    const H_FAMILIES = new Set(["h", "H", "hh", "h'", "xh", "hx", "ah", "A", "a'"]);

    for (const [prefix, family] of Object.entries(FIDEL_FAMILIES)) {
      if (H_FAMILIES.has(prefix)) {
        expect(flat[prefix + "a"]).toBe(family.e);   // 1st order 'a' (ha -> ሀ)
        expect(flat[prefix + "aa"]).toBe(family.a);  // 4th order 'aa' (haa -> ሃ)
        expect(flat[prefix + "e"]).toBe(family.ee);  // 5th order 'e' (he -> ሄ)
        expect(flat[prefix + "ee"]).toBe(family.ee); // 5th order 'ee' (hee -> ሄ)
      } else {
        expect(flat[prefix + "e"]).toBe(family.e);   // 1st order 'e' (me -> መ)
        expect(flat[prefix + "a"]).toBe(family.a);   // 4th order 'a' (ma -> ማ)
        expect(flat[prefix + "aa"]).toBe(family.a);  // 4th order 'aa' (maa -> ማ)
        expect(flat[prefix + "ee"]).toBe(family.ee); // 5th order 'ee' (mee -> ሜ)
      }
    }
  });
});
