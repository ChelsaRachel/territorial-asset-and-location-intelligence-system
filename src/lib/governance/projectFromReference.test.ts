import { describe, expect, it } from "vitest";
import { projectFromReference } from "./projectFromReference";

describe("projectFromReference", () => {
  it("applies reference then-to-now growth to the active value", () => {
    expect(projectFromReference({ activeNow: 78, referenceThen: 70, referenceNow: 84 })).toEqual({
      value: 94,
      growthPctApplied: 20,
      capped: false,
    });
  });

  it("caps unrealistic growth at 50 percent", () => {
    expect(projectFromReference({ activeNow: 100, referenceThen: 10, referenceNow: 40 })).toEqual({
      value: 150,
      growthPctApplied: 50,
      capped: true,
    });
  });
});
