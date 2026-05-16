import { describe, it, expect } from "vitest";
import { rebalanceWeights } from "./rebalanceWeights";
import type { Weights } from "@/lib/types/assessment";

function sumWeights(w: Weights): number {
  return Object.values(w).reduce((a, b) => a + b, 0);
}

// Berastagi hospitality preset: A1=15, A2=30, A3=20, A4=20, A8=15
const HOSP: Weights = { A1: 15, A2: 30, A3: 20, A4: 20, A8: 15 };
// Berastagi agribisnis preset: A1=35, A2=20, A3=10, A4=25, A8=10
const AGRO: Weights = { A1: 35, A2: 20, A3: 10, A4: 25, A8: 10 };

describe("rebalanceWeights — invariants", () => {
  it("always sums to 100 after a change (hospitality preset, drag A2 to 45)", () => {
    const result = rebalanceWeights(HOSP, "A2", 45);
    expect(sumWeights(result)).toBe(100);
  });

  it("always sums to 100 after a change (agribisnis preset, drag A1 to 50)", () => {
    const result = rebalanceWeights(AGRO, "A1", 50);
    expect(sumWeights(result)).toBe(100);
  });

  it("all values are non-negative integers", () => {
    const result = rebalanceWeights(HOSP, "A2", 45);
    for (const val of Object.values(result)) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it("dragged key receives exactly the new value", () => {
    const result = rebalanceWeights(HOSP, "A2", 45);
    expect(result.A2).toBe(45);
  });
});

describe("rebalanceWeights — edge cases", () => {
  it("drag to 100: all others become 0", () => {
    const result = rebalanceWeights(HOSP, "A2", 100);
    expect(result.A2).toBe(100);
    expect(result.A1).toBe(0);
    expect(result.A3).toBe(0);
    expect(result.A4).toBe(0);
    expect(result.A8).toBe(0);
    expect(sumWeights(result)).toBe(100);
  });

  it("drag to 0: dragged becomes 0, others take full 100 proportionally", () => {
    const result = rebalanceWeights(HOSP, "A2", 0);
    expect(result.A2).toBe(0);
    expect(sumWeights(result)).toBe(100);
    // Others maintain relative proportions from HOSP (A1:15, A3:20, A4:20, A8:15)
    // otherSum = 70, remaining = 100
    // A1 → round(15/70 × 100) = 21, A3 → round(20/70 × 100) = 29, A4 → 29, A8 → 21
    expect(result.A2).toBe(0);
  });

  it("drag to 0 when all others are already 0 distributes equally", () => {
    const allOnOne: Weights = { A1: 100, A2: 0, A3: 0, A4: 0, A8: 0 };
    const result = rebalanceWeights(allOnOne, "A1", 0);
    expect(result.A1).toBe(0);
    expect(sumWeights(result)).toBe(100);
    // Each of 4 others gets 25
    expect(result.A2).toBe(25);
    expect(result.A3).toBe(25);
    expect(result.A4).toBe(25);
    expect(result.A8).toBe(25);
  });

  it("drag that produces non-integer proportions reconciles to 100", () => {
    // Equal 20/20/20/20/20 — drag A1 to 33 (leaves 67 to distribute equally among 4)
    const equal: Weights = { A1: 20, A2: 20, A3: 20, A4: 20, A8: 20 };
    const result = rebalanceWeights(equal, "A1", 33);
    expect(result.A1).toBe(33);
    expect(sumWeights(result)).toBe(100);
  });

  it("drag A1 from 35 to 35 (no change) keeps current weights", () => {
    const result = rebalanceWeights(AGRO, "A1", 35);
    expect(sumWeights(result)).toBe(100);
    expect(result.A1).toBe(35);
  });

  it("clamps value above 100 to 100", () => {
    const result = rebalanceWeights(HOSP, "A2", 150);
    expect(result.A2).toBe(100);
    expect(sumWeights(result)).toBe(100);
  });

  it("clamps value below 0 to 0", () => {
    const result = rebalanceWeights(HOSP, "A2", -5);
    expect(result.A2).toBe(0);
    expect(sumWeights(result)).toBe(100);
  });
});

describe("rebalanceWeights — §8.1 custom weights scenario", () => {
  it("drag Infrastructure (A2) from 30 to 45, Land Suitability (A1) from 15 to 5", () => {
    // Hospitality preset: A1=15, A2=30, A3=20, A4=20, A8=15
    // Step 1: drag A2 from 30 to 45 (delta = +15)
    const step1 = rebalanceWeights(HOSP, "A2", 45);
    expect(step1.A2).toBe(45);
    expect(sumWeights(step1)).toBe(100);

    // Step 2: drag A1 from current to 5
    const step2 = rebalanceWeights(step1, "A1", 5);
    expect(step2.A1).toBe(5);
    expect(sumWeights(step2)).toBe(100);
  });
});

describe("rebalanceWeights — rounding stress tests", () => {
  it("handles drag to value where 99/4 does not divide evenly", () => {
    const base: Weights = { A1: 25, A2: 25, A3: 25, A4: 25, A8: 0 };
    // drag A8 from 0 to 1 → remaining 99 distributed among 4 equal sliders (24.75 each)
    const result = rebalanceWeights(base, "A8", 1);
    expect(result.A8).toBe(1);
    expect(sumWeights(result)).toBe(100);
  });

  it("handles all-zero others when dragging non-zero slider down to 0", () => {
    const concentrated: Weights = { A1: 0, A2: 0, A3: 0, A4: 100, A8: 0 };
    const result = rebalanceWeights(concentrated, "A4", 0);
    expect(result.A4).toBe(0);
    expect(sumWeights(result)).toBe(100);
    // 100 distributed among A1, A2, A3, A8 equally = 25 each
    expect(result.A1).toBe(25);
    expect(result.A2).toBe(25);
    expect(result.A3).toBe(25);
    expect(result.A8).toBe(25);
  });
});
