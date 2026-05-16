// Pure assessment scoring functions for SPRINT-05 (docs/04_OPPORTUNITY_RISK.md)
// No React, Zustand, browser APIs, or fixture imports allowed in this module.

import type { Sektor, RegulatoryFlag, FeasibilityZone, InvestmentReadinessKlasifikasi, SektorSiapStatus } from "@/lib/types/common";
import type {
  DimensionKey,
  ScoreDimensions,
  Weights,
  LocationScoreResult,
  InvestmentReadinessResult,
  QuadrantTier,
  QuadrantMap,
  PeruntukanRekomendasiOutput,
  SektorSiapMap,
  SektorDemandInput,
} from "@/lib/types/assessment";
import { DIMENSION_KEYS } from "./weights";

// --- C.1 Location Scoring Card ---

/**
 * Computes the weighted location score from raw dimension scores and integer weights.
 *
 * Cap rule (docs §2.1): if regulatoryFlag is KAWASAN_LINDUNG or MORATORIUM,
 * the result is capped at min(total, 40).
 *
 * NOTE: The canonical Berastagi fixture stores pre-baked values (78 agribisnis,
 * 62 hospitality) that were computed using the production data pipeline, not
 * purely from this formula. This function is the authoritative live computation
 * engine for custom-weight scenarios and sektor-switch re-scoring.
 */
export function computeLocationScore(
  scores: ScoreDimensions,
  weights: Weights,
  regulatoryFlag?: RegulatoryFlag,
): LocationScoreResult {
  let total = 0;
  const contributions = {} as LocationScoreResult["contributions"];

  for (const key of DIMENSION_KEYS) {
    const raw_score = scores[key];
    const weight = weights[key];
    const contribution = Math.round((raw_score * weight) / 100 * 100) / 100;
    contributions[key] = { raw_score, weight, contribution };
    total += (raw_score * weight) / 100;
  }

  total = Math.round(total * 100) / 100;

  const isCapped =
    regulatoryFlag === "KAWASAN_LINDUNG" || regulatoryFlag === "MORATORIUM";

  if (isCapped) {
    return {
      total: Math.min(total, 40),
      contributions,
      capped: true,
      cap_reason: "Status regulasi membatasi skor maksimum",
    };
  }

  return { total, contributions, capped: false };
}

// --- B.4 Investment Readiness ---

/**
 * Classifies an investment readiness score into a Klasifikasi bucket.
 * Source: docs §2.5 — 71-100 = Siap_Investasi, 41-70 = Siap_Dengan_Catatan, 0-40 = Perlu_Persiapan
 */
export function classifyInvestmentReadiness(
  score: number,
): InvestmentReadinessKlasifikasi {
  if (score >= 71) return "Siap_Investasi";
  if (score >= 41) return "Siap_Dengan_Catatan";
  return "Perlu_Persiapan";
}

/**
 * Computes Investment Readiness Score (B.4).
 * Formula: equal-weight average of A1, A2, A3, A8 (each 25%).
 * Canonical Berastagi: (82+76+84+81)/4 = 80.75 → Siap_Investasi
 */
export function computeInvestmentReadiness(scores: {
  A1: number;
  A2: number;
  A3: number;
  A8: number;
}): InvestmentReadinessResult {
  const score = Math.round(((scores.A1 + scores.A2 + scores.A3 + scores.A8) / 4) * 100) / 100;
  return { score, klasifikasi: classifyInvestmentReadiness(score) };
}

// --- C.4 Feasibility Snapshot ---

/**
 * Maps a raw score to a feasibility quadrant tier.
 * Source: docs §2.3 — ≥70 = Baik, 50-69 = Cukup, <50 = Perlu_Perhatian
 */
export function scoreTier(score: number): QuadrantTier {
  if (score >= 70) return "Baik";
  if (score >= 50) return "Cukup";
  return "Perlu_Perhatian";
}

/**
 * Derives 2×2 feasibility quadrant tiers from dimension scores.
 * "pasar" uses average of A4 (market access) and A6 (demand absorption).
 */
export function feasibilityQuadrants(scores: {
  A1: number; // lahan
  A2: number; // infrastruktur
  A3: number; // regulasi
  A4: number; // market access — part of pasar
  A6: number; // demand absorption — part of pasar
}): QuadrantMap {
  const pasarScore = Math.round((scores.A4 + scores.A6) / 2);
  return {
    lahan: scoreTier(scores.A1),
    pasar: scoreTier(pasarScore),
    infrastruktur: scoreTier(scores.A2),
    regulasi: scoreTier(scores.A3),
  };
}

// --- C.6 Financial Viability ---

/**
 * Classifies a revenue-to-cost ratio into a viability zone.
 * Source: docs §2.4 — ≥1.5x VIABLE, 1.2–1.5x BORDERLINE, <1.2x NOT_VIABLE
 */
export function viabilityZone(ratio: number): FeasibilityZone {
  if (ratio >= 1.5) return "VIABLE";
  if (ratio >= 1.2) return "BORDERLINE";
  return "NOT_VIABLE";
}

// --- B.4 Sektor Siap Flags ---

const LAND_SUITABILITY_THRESHOLD = 65;
const INFRASTRUCTURE_THRESHOLD = 60;

/**
 * Evaluates "Sektor Siap" flags for all four sektors.
 * Source: docs §2.5 — 4/4 syarat = siap, 3/4 = siap_dengan_syarat, <3 = belum_siap
 */
export function computeSektorSiap(
  a2: number, // infrastructure_index — shared across sektors
  regulatoryFlag: RegulatoryFlag,
  sektorInputs: SektorDemandInput[],
): SektorSiapMap {
  const result = {} as SektorSiapMap;

  for (const input of sektorInputs) {
    const unmet: string[] = [];

    if (input.a1_land_suitability < LAND_SUITABILITY_THRESHOLD) {
      unmet.push(`land_suitability < ${LAND_SUITABILITY_THRESHOLD}`);
    }
    if (input.a6_demand_absorption <= 0) {
      unmet.push("demand_absorption <= 0");
    }
    if (a2 < INFRASTRUCTURE_THRESHOLD) {
      unmet.push(`infrastructure_index < ${INFRASTRUCTURE_THRESHOLD}`);
    }
    if (regulatoryFlag !== "BEBAS_INVESTASI") {
      unmet.push("regulatory_flag != BEBAS_INVESTASI");
    }

    const terpenuhi = 4 - unmet.length;
    let status: SektorSiapStatus;
    if (terpenuhi === 4) status = "siap";
    else if (terpenuhi === 3) status = "siap_dengan_syarat";
    else status = "belum_siap";

    result[input.sektor] = {
      sektor: input.sektor,
      status,
      syarat_terpenuhi: terpenuhi,
      total_syarat: 4,
      syarat_belum: unmet,
    };
  }

  return result;
}

// --- B.6 Rekomendasi Peruntukan ---

const INFRASTRUCTURE_MIN_REKOMENDASI = 50;

/**
 * Produces a rule-based peruntukan recommendation from per-sektor scores.
 * Source: docs §2.5 — checks 4 syarat in order, applies REKOMENDASI_UTAMA to highest-A1 sektor.
 */
export function recommendPeruntukan(
  a2: number,
  regulatoryFlag: RegulatoryFlag,
  sektorInputs: SektorDemandInput[],
): PeruntukanRekomendasiOutput {
  const eligible: { sektor: Sektor; a1: number }[] = [];

  for (const input of sektorInputs) {
    const syarat2ok = regulatoryFlag !== "KAWASAN_LINDUNG" && regulatoryFlag !== "MORATORIUM";
    const syarat3ok = input.a6_demand_absorption > 0;
    const syarat4ok = a2 >= INFRASTRUCTURE_MIN_REKOMENDASI;

    if (syarat2ok && syarat3ok && syarat4ok) {
      eligible.push({ sektor: input.sektor, a1: input.a1_land_suitability });
    }
  }

  if (eligible.length === 0) {
    const unmetReasons: string[] = [];
    if (regulatoryFlag === "KAWASAN_LINDUNG" || regulatoryFlag === "MORATORIUM") {
      unmetReasons.push(`Regulatory flag ${regulatoryFlag} melarang pengembangan`);
    }
    if (a2 < INFRASTRUCTURE_MIN_REKOMENDASI) {
      unmetReasons.push(`Infrastructure index ${a2} < ${INFRASTRUCTURE_MIN_REKOMENDASI}`);
    }
    sektorInputs.forEach((s) => {
      if (s.a6_demand_absorption <= 0) {
        unmetReasons.push(`Demand absorption ${s.sektor} = 0`);
      }
    });
    return {
      status: "perlu_kajian_lanjut",
      rekomendasi_alternatif: [],
      syarat_belum_terpenuhi: unmetReasons,
    };
  }

  // Sort by a1 descending — highest land suitability wins REKOMENDASI_UTAMA
  eligible.sort((a, b) => b.a1 - a.a1);
  const [utama, ...alternatif] = eligible;

  const sektorLabel = (s: Sektor) => SEKTOR_LABEL_MAP[s] ?? s;

  const status: PeruntukanRekomendasiOutput["status"] =
    alternatif.length > 0 ? "rekomendasi_jelas" : "rekomendasi_dengan_syarat";

  // utama is always defined here — we returned early above if eligible was empty
  const utamaEntry = utama!;

  return {
    status,
    rekomendasi_utama: {
      sektor: utamaEntry.sektor,
      label: sektorLabel(utamaEntry.sektor),
      alasan: `Land suitability tertinggi (${utamaEntry.a1}) + demand absorpsi positif + infrastruktur layak`,
    },
    rekomendasi_alternatif: alternatif.slice(0, 2).map((a) => ({
      sektor: a.sektor,
      label: sektorLabel(a.sektor),
    })),
  };
}

const SEKTOR_LABEL_MAP: Record<Sektor, string> = {
  agribisnis: "Agribisnis / Hortikultura",
  hospitality: "Hospitality / Eco-Resort",
  pariwisata: "Pariwisata Alam",
  properti: "Properti / Land Banking",
};

// --- Effort vs Impact helper ---

/**
 * Generates top-2 effort-vs-impact suggestions from a dimension score set.
 * Returns the two dimensions with the largest gap-to-target (100) weighted by
 * the provided weights — these represent the highest-leverage improvement areas.
 */
export function effortVsImpact(
  scores: ScoreDimensions,
  weights: Weights,
): { key: DimensionKey; gap: number; weightedImpact: number }[] {
  return DIMENSION_KEYS.map((key) => ({
    key,
    gap: 100 - scores[key],
    weightedImpact: Math.round(((100 - scores[key]) * weights[key]) / 100 * 10) / 10,
  }))
    .filter((d) => d.gap > 0)
    .sort((a, b) => b.weightedImpact - a.weightedImpact)
    .slice(0, 2);
}
