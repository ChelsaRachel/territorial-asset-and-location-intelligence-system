import { describe, it, expect } from "vitest";
import { scoreColor } from "../scoreColor";

describe("scoreColor", () => {
  it("returns verdict-success for 85", () => expect(scoreColor(85)).toBe("verdict-success"));
  it("returns verdict-success for 70 (boundary)", () => expect(scoreColor(70)).toBe("verdict-success"));
  it("returns verdict-warning for 69.999", () => expect(scoreColor(69.999)).toBe("verdict-warning"));
  it("returns verdict-warning for 55", () => expect(scoreColor(55)).toBe("verdict-warning"));
  it("returns verdict-warning for 40 (boundary)", () => expect(scoreColor(40)).toBe("verdict-warning"));
  it("returns verdict-danger for 39.999", () => expect(scoreColor(39.999)).toBe("verdict-danger"));
  it("returns verdict-danger for 0", () => expect(scoreColor(0)).toBe("verdict-danger"));
  it("returns verdict-danger for negative input", () => expect(scoreColor(-5)).toBe("verdict-danger"));
});
