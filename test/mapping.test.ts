import { describe, it, expect } from "bun:test";
import { buildFlatMapping, FIDEL_FAMILIES } from "../src/engine/mapping.js";

describe("Mapping Data", () => {
  it("contains all 33 core Ethiopic families", () => {
    expect(Object.keys(FIDEL_FAMILIES).length).toBeGreaterThanOrEqual(33);
  });

  it("maps basic consonant families correctly", () => {
    expect(FIDEL_FAMILIES["s"][""]).toBe("ስ");
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
    expect(flat["see"]).toBe("ሴ");
    expect(flat["so"]).toBe("ሶ");
    expect(flat["swa"]).toBe("ሷ");

    expect(flat["sh"]).toBe("ሽ");
    expect(flat["she"]).toBe("ሸ");
    expect(flat["sha"]).toBe("ሻ");

    expect(flat["lwa"]).toBe("ሏ");
    expect(flat["mwa"]).toBe("ሟ");
  });
});
