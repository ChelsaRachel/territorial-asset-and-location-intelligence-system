// Tests for SPRINT-06 comparison library
// Canonical winners: Agribisnis=Berastagi(84), LandBanking=Berastagi(88), RiskAverse=Ciwidey(82)
// Test fixture values are designed to produce these exact canonical outputs — see SPRINT-06 task spec.

import { describe, it, expect } from "vitest";
import {
  computeRekomendasiCards,
  applyHighlights,
  computeDeltaRows,
  type WilayahComparisonRow,
} from "./compare";

// ─── Canonical 4-candidate test fixture ───────────────────────────────────────
// Scores are chosen to produce canonical winners (Berastagi=84/88, Ciwidey=82).
// These differ from raw wilayah_score_aggregate values which yield lower scores.
// A.1(50%)+A.6(30%)+A.4(20%) and A.7(40%)+A.8(30%)+A.4(30%) formulas verified below.

const BERASTAGI: WilayahComparisonRow = {
  wilayah_id: 1206090,
  nama: "Berastagi",
  // A1=82, A6=96, A4=71: Agribisnis=82×0.5+96×0.3+71×0.2=41+28.8+14.2=84.0
  // A7=100, A8=89, A4=71: LandBanking=100×0.4+89×0.3+71×0.3=40+26.7+21.3=88.0
  A1: 82,
  A2: 76,
  A3: 84,
  A4: 71,
  A6: 96,
  A7: 100,
  A8: 89,
  C1: 78,
  harga_lahan: 420_000,
  apresiasi_yoy_pct: 15.4,
};

const CIWIDEY: WilayahComparisonRow = {
  wilayah_id: 3204170,
  nama: "Ciwidey",
  // RiskAverse: 80×0.3+90×0.3+60×0.2+95.18×0.2=24+27+12+19.04=82.04→82
  A1: 70,
  A2: 80,
  A3: 90,
  A4: 60,
  A6: 88,
  A7: 88,
  A8: 74,
  C1: 76,
  harga_lahan: 185_000,
  apresiasi_yoy_pct: 18.7,
};

const PACET: WilayahComparisonRow = {
  wilayah_id: 3204030,
  nama: "Pacet",
  A1: 68,
  A2: 72,
  A3: 80,
  A4: 56,
  A6: 74,
  A7: 82,
  A8: 68,
  C1: 68,
  harga_lahan: 165_000,
  apresiasi_yoy_pct: 7.3,
};

const TOBA: WilayahComparisonRow = {
  wilayah_id: 1212140,
  nama: "Toba",
  A1: 56,
  A2: 52,
  A3: 68,
  A4: 44,
  A6: 58,
  A7: 72,
  A8: 72,
  C1: 62,
  harga_lahan: 580_000,
  apresiasi_yoy_pct: 8.2,
};

const FOUR_CANDIDATES = [BERASTAGI, CIWIDEY, PACET, TOBA];

// ─── computeRekomendasiCards ───────────────────────────────────────────────────

describe("computeRekomendasiCards — canonical winners", () => {
  const cards = computeRekomendasiCards(FOUR_CANDIDATES);

  it("returns 3 cards", () => {
    expect(cards).toHaveLength(3);
  });

  it("Agribisnis winner is Berastagi with score 84", () => {
    const card = cards.find((c) => c.tujuan === "Agribisnis");
    expect(card?.winner_wilayah_id).toBe(1206090);
    expect(card?.winner_score).toBe(84);
  });

  it("Land Banking winner is Berastagi with score 88", () => {
    const card = cards.find((c) => c.tujuan === "Land Banking");
    expect(card?.winner_wilayah_id).toBe(1206090);
    expect(card?.winner_score).toBe(88);
  });

  it("Risk-Averse winner is Ciwidey with score 82", () => {
    const card = cards.find((c) => c.tujuan === "Risk-Averse");
    expect(card?.winner_wilayah_id).toBe(3204170);
    expect(card?.winner_score).toBe(82);
  });

  it("all cards have non-empty rationale strings", () => {
    for (const card of cards) {
      expect(card.rationale.length).toBeGreaterThan(0);
    }
  });
});

describe("computeRekomendasiCards — edge cases", () => {
  it("returns empty array for empty input", () => {
    expect(computeRekomendasiCards([])).toEqual([]);
  });

  it("2-candidate edge case: winner is still correctly determined", () => {
    const cards = computeRekomendasiCards([BERASTAGI, CIWIDEY]);
    expect(cards).toHaveLength(3);
    // Berastagi must win Agribisnis (higher A1=82 vs A1=70)
    const agri = cards.find((c) => c.tujuan === "Agribisnis");
    expect(agri?.winner_wilayah_id).toBe(1206090);
    // Ciwidey must win Risk-Averse (lower price and infrastructure)
    const risk = cards.find((c) => c.tujuan === "Risk-Averse");
    expect(risk?.winner_wilayah_id).toBe(3204170);
  });

  it("tiebreak: lower wilayah_id wins", () => {
    const rowA: WilayahComparisonRow = { ...BERASTAGI, wilayah_id: 1000, A1: 80, A6: 80, A4: 80 };
    const rowB: WilayahComparisonRow = { ...CIWIDEY, wilayah_id: 2000, A1: 80, A6: 80, A4: 80 };
    const cards = computeRekomendasiCards([rowA, rowB]);
    const agri = cards.find((c) => c.tujuan === "Agribisnis");
    expect(agri?.winner_wilayah_id).toBe(1000);
  });
});

// ─── applyHighlights ──────────────────────────────────────────────────────────

describe("applyHighlights", () => {
  const hl = applyHighlights(FOUR_CANDIDATES);

  it("identifies Berastagi as best for A.1 (score 82)", () => {
    // Berastagi A1=82, others lower
    expect(hl.best["A1"]).toBe(1206090);
  });

  it("identifies Pacet as best for harga_lahan (lowest price = 165,000)", () => {
    // harga_lahan is inverted: lowest price is "best"
    expect(hl.best["harga_lahan"]).toBe(3204030);
  });

  it("identifies Toba as worst for harga_lahan (highest price = 580,000)", () => {
    expect(hl.worst["harga_lahan"]).toBe(1212140);
  });

  it("identifies Ciwidey as best for apresiasi_yoy_pct (18.7% — highest in set)", () => {
    // Ciwidey apresiasi=18.7, Berastagi=15.4 → Ciwidey wins highest rate
    expect(hl.best["apresiasi_yoy_pct"]).toBe(3204170);
  });

  it("best and worst objects contain all 10 expected parameter keys", () => {
    const expectedKeys = ["A1", "A2", "A3", "A4", "A6", "A7", "A8", "C1", "harga_lahan", "apresiasi_yoy_pct"];
    for (const key of expectedKeys) {
      expect(hl.best).toHaveProperty(key);
      expect(hl.worst).toHaveProperty(key);
    }
  });
});

// ─── computeDeltaRows ─────────────────────────────────────────────────────────

describe("computeDeltaRows", () => {
  const deltas = computeDeltaRows(BERASTAGI, TOBA);

  it("returns 10 delta rows (one per parameter)", () => {
    expect(deltas).toHaveLength(10);
  });

  it("C1 delta is marked HIGH when |Δ| > 10 (Berastagi=78, Toba=62, Δ=16)", () => {
    const c1Delta = deltas.find((d) => d.param === "C1");
    expect(c1Delta?.delta).toBe(16);
    expect(c1Delta?.severity).toBe("HIGH");
  });

  it("harga_lahan delta uses percentage and marks HIGH when Δ% > 20", () => {
    // Berastagi=420000, Toba=580000 → Δ=-160000, Δ%=-27.6% → |Δ%|=27.6 > 20 → HIGH
    const hargaDelta = deltas.find((d) => d.param === "harga_lahan");
    expect(hargaDelta?.severity).toBe("HIGH");
    expect(hargaDelta?.delta_pct).toBeDefined();
    expect(Math.abs(hargaDelta?.delta_pct ?? 0)).toBeGreaterThan(20);
  });

  it("delta is signed (A - B)", () => {
    const a1Delta = deltas.find((d) => d.param === "A1");
    // Berastagi A1=82, Toba A1=56 → Δ=26
    expect(a1Delta?.delta).toBe(26);
    expect(a1Delta?.wilayahA_value).toBe(82);
    expect(a1Delta?.wilayahB_value).toBe(56);
  });

  it("LOW severity for small deltas", () => {
    // Use two similar rows
    const close = computeDeltaRows(BERASTAGI, {
      ...BERASTAGI,
      wilayah_id: 9999,
      A1: 80,
      C1: 76,
      harga_lahan: 430_000,
    });
    const c1 = close.find((d) => d.param === "C1");
    // |78-76| = 2 < 10 → LOW
    expect(c1?.severity).toBe("LOW");
  });
});
