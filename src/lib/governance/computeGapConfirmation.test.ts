import { describe, expect, it } from "vitest";
import { computeGapConfirmation } from "./computeGapConfirmation";

describe("computeGapConfirmation", () => {
  it("derives all documented enum outputs", () => {
    expect(computeGapConfirmation(42, 2)).toBe("terkonfirmasi");
    expect(computeGapConfirmation(42, 5)).toBe("hambatan_non_data");
    expect(computeGapConfirmation(6, 5)).toBe("koreksi_oversupply");
    expect(computeGapConfirmation(6, 2)).toBe("belum_relevan");
  });
});
