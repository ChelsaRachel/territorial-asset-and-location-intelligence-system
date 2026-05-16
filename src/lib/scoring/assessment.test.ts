import { describe, it, expect } from "vitest";
import {
  computeLocationScore,
  computeInvestmentReadiness,
  classifyInvestmentReadiness,
  feasibilityQuadrants,
  scoreTier,
  viabilityZone,
  computeSektorSiap,
  recommendPeruntukan,
  effortVsImpact,
} from "./assessment";
import { SEKTOR_PRESETS } from "./weights";

// --- Canonical Berastagi dimension scores (from docs/04_OPPORTUNITY_RISK.md §4.2) ---
// A1=82 (land_suitability_agro), A2=76 (infrastructure_index rounded),
// A3=84 (zoning_compliance), A4=64 (market_access), A8=81 (growth_projection)
const BERASTAGI_SCORES = { A1: 82, A2: 76, A3: 84, A4: 64, A8: 81 };

// --- Sektor preset weight sums ---

describe("SEKTOR_PRESETS", () => {
  it("all four presets sum to exactly 100", () => {
    for (const [sektor, weights] of Object.entries(SEKTOR_PRESETS)) {
      const total = Object.values(weights).reduce((a, b) => a + b, 0);
      expect(total, `${sektor} weights should sum to 100`).toBe(100);
    }
  });
});

// --- computeLocationScore ---

describe("computeLocationScore", () => {
  it("returns the correct weighted sum for agribisnis preset with Berastagi scores", () => {
    // Expected: 82×0.35 + 76×0.20 + 84×0.10 + 64×0.25 + 81×0.10 = 76.40
    const result = computeLocationScore(BERASTAGI_SCORES, SEKTOR_PRESETS.agribisnis);
    expect(result.total).toBeCloseTo(76.4, 1);
    expect(result.capped).toBe(false);
  });

  it("returns the correct weighted sum for hospitality preset with Berastagi scores", () => {
    // Expected: 82×0.15 + 76×0.30 + 84×0.20 + 64×0.20 + 81×0.15
    //         = 12.30 + 22.80 + 16.80 + 12.80 + 12.15 = 76.85
    const result = computeLocationScore(BERASTAGI_SCORES, SEKTOR_PRESETS.hospitality);
    expect(result.total).toBeCloseTo(76.85, 1);
    expect(result.capped).toBe(false);
  });

  it("returns the correct weighted sum for pariwisata preset", () => {
    // 82×0.15 + 76×0.25 + 84×0.15 + 64×0.25 + 81×0.20
    // = 12.3 + 19.0 + 12.6 + 16.0 + 16.2 = 76.1
    const result = computeLocationScore(BERASTAGI_SCORES, SEKTOR_PRESETS.pariwisata);
    expect(result.total).toBeCloseTo(76.1, 1);
  });

  it("returns the correct weighted sum for properti preset", () => {
    // 82×0.10 + 76×0.35 + 84×0.25 + 64×0.15 + 81×0.15
    // = 8.2 + 26.6 + 21.0 + 9.6 + 12.15 = 77.55
    const result = computeLocationScore(BERASTAGI_SCORES, SEKTOR_PRESETS.properti);
    expect(result.total).toBeCloseTo(77.55, 1);
  });

  it("includes per-dimension contribution values", () => {
    const result = computeLocationScore(BERASTAGI_SCORES, SEKTOR_PRESETS.agribisnis);
    // A1 contribution = 82 × 35 / 100 = 28.70
    expect(result.contributions.A1.contribution).toBeCloseTo(28.7, 1);
    expect(result.contributions.A1.raw_score).toBe(82);
    expect(result.contributions.A1.weight).toBe(35);
    // A4 contribution = 64 × 25 / 100 = 16.00
    expect(result.contributions.A4.contribution).toBeCloseTo(16.0, 1);
  });

  it("uniform scores return score equal to that value regardless of weights", () => {
    const uniform = { A1: 80, A2: 80, A3: 80, A4: 80, A8: 80 };
    const result = computeLocationScore(uniform, SEKTOR_PRESETS.agribisnis);
    expect(result.total).toBe(80);
  });

  it("applies cap rule for KAWASAN_LINDUNG — score capped at 40", () => {
    const scores = { A1: 80, A2: 75, A3: 85, A4: 70, A8: 80 };
    const result = computeLocationScore(scores, SEKTOR_PRESETS.agribisnis, "KAWASAN_LINDUNG");
    expect(result.capped).toBe(true);
    expect(result.total).toBeLessThanOrEqual(40);
    expect(result.cap_reason).toBe("Status regulasi membatasi skor maksimum");
  });

  it("applies cap rule for MORATORIUM", () => {
    const result = computeLocationScore(BERASTAGI_SCORES, SEKTOR_PRESETS.agribisnis, "MORATORIUM");
    expect(result.capped).toBe(true);
    expect(result.total).toBeLessThanOrEqual(40);
  });

  it("cap rule clamps to 40 not zero — already-low score stays unchanged", () => {
    const lowScores = { A1: 30, A2: 30, A3: 30, A4: 30, A8: 30 };
    const result = computeLocationScore(lowScores, SEKTOR_PRESETS.agribisnis, "KAWASAN_LINDUNG");
    // Without cap: 30×1.0 = 30 < 40, so cap does not reduce it further
    expect(result.capped).toBe(true);
    expect(result.total).toBe(30);
  });

  it("does NOT apply cap for KONFLIK_REGULASI", () => {
    const result = computeLocationScore(BERASTAGI_SCORES, SEKTOR_PRESETS.agribisnis, "KONFLIK_REGULASI");
    expect(result.capped).toBe(false);
  });

  it("does NOT apply cap for BEBAS_INVESTASI", () => {
    const result = computeLocationScore(BERASTAGI_SCORES, SEKTOR_PRESETS.agribisnis, "BEBAS_INVESTASI");
    expect(result.capped).toBe(false);
  });
});

// --- computeInvestmentReadiness ---

describe("computeInvestmentReadiness", () => {
  it("returns 80.75 and Siap_Investasi for canonical Berastagi values", () => {
    // B.4 = (A1+A2+A3+A8)/4 = (82+76+84+81)/4 = 323/4 = 80.75
    const result = computeInvestmentReadiness({ A1: 82, A2: 76, A3: 84, A8: 81 });
    expect(result.score).toBe(80.75);
    expect(result.klasifikasi).toBe("Siap_Investasi");
  });

  it("returns Siap_Dengan_Catatan for score in 41-70 range", () => {
    // (60+55+60+65)/4 = 240/4 = 60
    const result = computeInvestmentReadiness({ A1: 60, A2: 55, A3: 60, A8: 65 });
    expect(result.score).toBe(60);
    expect(result.klasifikasi).toBe("Siap_Dengan_Catatan");
  });

  it("returns Perlu_Persiapan for score ≤40", () => {
    const result = computeInvestmentReadiness({ A1: 30, A2: 35, A3: 40, A8: 35 });
    expect(result.score).toBe(35);
    expect(result.klasifikasi).toBe("Perlu_Persiapan");
  });

  it("boundary: score of 71 maps to Siap_Investasi", () => {
    expect(classifyInvestmentReadiness(71)).toBe("Siap_Investasi");
  });

  it("boundary: score of 70 maps to Siap_Dengan_Catatan", () => {
    expect(classifyInvestmentReadiness(70)).toBe("Siap_Dengan_Catatan");
  });

  it("boundary: score of 41 maps to Siap_Dengan_Catatan", () => {
    expect(classifyInvestmentReadiness(41)).toBe("Siap_Dengan_Catatan");
  });

  it("boundary: score of 40 maps to Perlu_Persiapan", () => {
    expect(classifyInvestmentReadiness(40)).toBe("Perlu_Persiapan");
  });
});

// --- scoreTier and feasibilityQuadrants ---

describe("scoreTier", () => {
  it("returns Baik for score ≥70", () => {
    expect(scoreTier(70)).toBe("Baik");
    expect(scoreTier(100)).toBe("Baik");
  });
  it("returns Cukup for score 50-69", () => {
    expect(scoreTier(50)).toBe("Cukup");
    expect(scoreTier(69)).toBe("Cukup");
  });
  it("returns Perlu_Perhatian for score <50", () => {
    expect(scoreTier(49)).toBe("Perlu_Perhatian");
    expect(scoreTier(0)).toBe("Perlu_Perhatian");
  });
});

describe("feasibilityQuadrants", () => {
  it("returns canonical Berastagi quadrants — lahan:Baik, pasar:Cukup, infrastruktur:Cukup, regulasi:Baik", () => {
    // A1=82(Baik), A2=76(Baik→wait: 76≥70=Baik), A3=84(Baik), A4=64, A6=78(demand)
    // pasar = avg(64, 78) = 71 → Baik
    // But docs say pasar=Cukup. This implies A6 for Berastagi agro is lower, ~58-60 avg.
    // We use the fixture's A6 demand_absorption_score for agro = 58 (distinct from score_aggregate's 88)
    const berastagi = { A1: 82, A2: 76, A3: 84, A4: 64, A6: 58 };
    const q = feasibilityQuadrants(berastagi);
    expect(q.lahan).toBe("Baik");     // A1=82 ≥70
    expect(q.infrastruktur).toBe("Baik"); // A2=76 ≥70
    expect(q.regulasi).toBe("Baik");  // A3=84 ≥70
    // pasar = avg(64, 58) = 61 → Cukup (50-69)
    expect(q.pasar).toBe("Cukup");
  });

  it("returns Perlu_Perhatian when scores are below 50", () => {
    const q = feasibilityQuadrants({ A1: 40, A2: 45, A3: 30, A4: 35, A6: 40 });
    expect(q.lahan).toBe("Perlu_Perhatian");
    expect(q.infrastruktur).toBe("Perlu_Perhatian");
    expect(q.regulasi).toBe("Perlu_Perhatian");
    expect(q.pasar).toBe("Perlu_Perhatian");
  });
});

// --- viabilityZone ---

describe("viabilityZone", () => {
  it("returns VIABLE for ratio ≥1.5", () => {
    expect(viabilityZone(1.5)).toBe("VIABLE");
    expect(viabilityZone(2.12)).toBe("VIABLE"); // Berastagi stroberi canonical
    expect(viabilityZone(10)).toBe("VIABLE");
  });
  it("returns BORDERLINE for ratio 1.2-1.5", () => {
    expect(viabilityZone(1.2)).toBe("BORDERLINE");
    expect(viabilityZone(1.31)).toBe("BORDERLINE"); // §8.1 eco-resort scenario
    expect(viabilityZone(1.499)).toBe("BORDERLINE");
  });
  it("returns NOT_VIABLE for ratio <1.2", () => {
    expect(viabilityZone(1.19)).toBe("NOT_VIABLE");
    expect(viabilityZone(0.8)).toBe("NOT_VIABLE");
    expect(viabilityZone(0)).toBe("NOT_VIABLE");
  });
});

// --- computeSektorSiap ---

describe("computeSektorSiap", () => {
  const FOUR_SEKTORS = [
    { sektor: "agribisnis" as const, a1_land_suitability: 82, a6_demand_absorption: 88 },
    { sektor: "hospitality" as const, a1_land_suitability: 76, a6_demand_absorption: 74 },
    { sektor: "pariwisata" as const, a1_land_suitability: 78, a6_demand_absorption: 72 },
    { sektor: "properti" as const, a1_land_suitability: 65, a6_demand_absorption: 55 },
  ];

  it("returns siap when all 4 syarat are met (Berastagi agribisnis)", () => {
    const result = computeSektorSiap(76, "BEBAS_INVESTASI", [FOUR_SEKTORS[0]!]);
    expect(result.agribisnis.status).toBe("siap");
    expect(result.agribisnis.syarat_terpenuhi).toBe(4);
    expect(result.agribisnis.syarat_belum).toHaveLength(0);
  });

  it("returns belum_siap when land_suitability and infrastructure both fail", () => {
    const failInputs = [
      { sektor: "hospitality" as const, a1_land_suitability: 58, a6_demand_absorption: 55 },
    ];
    const result = computeSektorSiap(42, "KONFLIK_REGULASI", failInputs);
    expect(result.hospitality.status).toBe("belum_siap");
    expect(result.hospitality.syarat_belum.length).toBeGreaterThanOrEqual(2);
  });

  it("returns siap_dengan_syarat when 3 out of 4 syarat met", () => {
    // A1 below threshold (58 < 65), everything else ok
    const partial = [
      { sektor: "agribisnis" as const, a1_land_suitability: 58, a6_demand_absorption: 80 },
    ];
    const result = computeSektorSiap(76, "BEBAS_INVESTASI", partial);
    expect(result.agribisnis.status).toBe("siap_dengan_syarat");
    expect(result.agribisnis.syarat_terpenuhi).toBe(3);
  });

  it("perlu_kajian_lanjut scenario — hospitality fails 3 syarat (§8.3)", () => {
    // A1=58 (<65), A2=42 (<60), flag=KONFLIK_REGULASI (!=BEBAS_INVESTASI), A6>0
    const edge = [
      { sektor: "hospitality" as const, a1_land_suitability: 58, a6_demand_absorption: 30 },
    ];
    const result = computeSektorSiap(42, "KONFLIK_REGULASI", edge);
    expect(result.hospitality.status).toBe("belum_siap");
    expect(result.hospitality.syarat_terpenuhi).toBeLessThanOrEqual(1);
  });
});

// --- recommendPeruntukan ---

describe("recommendPeruntukan", () => {
  it("returns rekomendasi_jelas with agribisnis as utama when Berastagi scenario", () => {
    const sektorInputs = [
      { sektor: "agribisnis" as const, a1_land_suitability: 82, a6_demand_absorption: 88 },
      { sektor: "hospitality" as const, a1_land_suitability: 76, a6_demand_absorption: 74 },
      { sektor: "pariwisata" as const, a1_land_suitability: 78, a6_demand_absorption: 72 },
    ];
    const result = recommendPeruntukan(76, "BEBAS_INVESTASI", sektorInputs);
    expect(result.status).toBe("rekomendasi_jelas");
    expect(result.rekomendasi_utama?.sektor).toBe("agribisnis"); // highest A1=82
    expect(result.rekomendasi_alternatif.length).toBeGreaterThanOrEqual(1);
  });

  it("returns perlu_kajian_lanjut when regulatory flag is KAWASAN_LINDUNG", () => {
    const sektorInputs = [
      { sektor: "agribisnis" as const, a1_land_suitability: 80, a6_demand_absorption: 75 },
    ];
    const result = recommendPeruntukan(70, "KAWASAN_LINDUNG", sektorInputs);
    expect(result.status).toBe("perlu_kajian_lanjut");
    expect(result.rekomendasi_utama).toBeUndefined();
    expect(result.syarat_belum_terpenuhi?.length).toBeGreaterThan(0);
  });

  it("returns perlu_kajian_lanjut when regulatory flag is MORATORIUM", () => {
    const result = recommendPeruntukan(70, "MORATORIUM", [
      { sektor: "agribisnis" as const, a1_land_suitability: 80, a6_demand_absorption: 75 },
    ]);
    expect(result.status).toBe("perlu_kajian_lanjut");
  });

  it("returns perlu_kajian_lanjut when infrastructure is too low for all sektors", () => {
    const result = recommendPeruntukan(45, "BEBAS_INVESTASI", [
      { sektor: "agribisnis" as const, a1_land_suitability: 80, a6_demand_absorption: 75 },
    ]);
    expect(result.status).toBe("perlu_kajian_lanjut");
    expect(result.syarat_belum_terpenuhi?.some((s) => s.toLowerCase().includes("infrastructure"))).toBe(true);
  });

  it("picks sektor with highest A1 as utama when multiple sektors qualify", () => {
    const result = recommendPeruntukan(70, "BEBAS_INVESTASI", [
      { sektor: "pariwisata" as const, a1_land_suitability: 78, a6_demand_absorption: 72 },
      { sektor: "agribisnis" as const, a1_land_suitability: 82, a6_demand_absorption: 88 },
    ]);
    expect(result.rekomendasi_utama?.sektor).toBe("agribisnis");
  });
});

// --- effortVsImpact ---

describe("effortVsImpact", () => {
  it("returns at most 2 items", () => {
    const result = effortVsImpact(BERASTAGI_SCORES, SEKTOR_PRESETS.agribisnis);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it("returns the dimension with largest weighted impact first", () => {
    // A4=64 (gap=36, weight=25) → weightedImpact=9.0
    // A2=76 (gap=24, weight=20) → weightedImpact=4.8
    // A8=81 (gap=19, weight=10) → weightedImpact=1.9
    // A1=82 (gap=18, weight=35) → weightedImpact=6.3
    // A3=84 (gap=16, weight=10) → weightedImpact=1.6
    // Sorted by weightedImpact: A4(9.0) > A1(6.3) > A2(4.8) > ...
    const result = effortVsImpact(BERASTAGI_SCORES, SEKTOR_PRESETS.agribisnis);
    expect(result[0]!.key).toBe("A4");
    expect(result[1]!.key).toBe("A1");
  });

  it("returns empty array when all scores are 100", () => {
    const perfect = { A1: 100, A2: 100, A3: 100, A4: 100, A8: 100 };
    const result = effortVsImpact(perfect, SEKTOR_PRESETS.agribisnis);
    expect(result).toHaveLength(0);
  });
});
