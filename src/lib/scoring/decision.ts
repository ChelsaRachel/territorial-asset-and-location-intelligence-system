// Pure decision scoring functions for SPRINT-06 (docs/05_INVESTMENT_DECISION.md)
// No React, Zustand, browser APIs, or fixture imports allowed in this module.

import type { UrgencyBadge, LandBankingKlasifikasi } from "@/lib/types/common";

// Apresiasi decay assumption for computeReturnEstimate
// Year 1-2: input apresiasiYoyPct (unchanged)
// Year 3: decays to ~12%/yr (documented slowdown per SPRINT.md §2.3)
// Year 4+: steady at ~8%/yr long-term
// This is an MVP simplification; swap the curve for a real model post-PoC.
const APRESIASI_YEAR3_DECAY = 0.12; // 12%/yr at year 3
const APRESIASI_LONG_TERM_STEADY = 0.08; // 8%/yr long-term steady

function apresiasiForYear(year: number, apresiasiYoyPct: number): number {
  const rate = apresiasiYoyPct / 100;
  if (year <= 2) return rate;
  if (year === 3) return APRESIASI_YEAR3_DECAY;
  return APRESIASI_LONG_TERM_STEADY;
}

// Suitability formula: (A.1×0.30)+(A.6×0.30)+(A.8×0.25)+(A.4×0.15)
export function computeSuitabilityScore(scores: {
  A1: number;
  A6: number;
  A8: number;
  A4: number;
}): number {
  const raw =
    scores.A1 * 0.3 + scores.A6 * 0.3 + scores.A8 * 0.25 + scores.A4 * 0.15;
  return Math.round(raw);
}

// Urgency formula: (A.7×0.40)+(A.8_emerging×0.35)+(A.8_pipeline×0.25)
export function computeUrgencyScore(scores: {
  A7: number;
  A8_emerging: number;
  A8_pipeline: number;
}): number {
  const raw =
    scores.A7 * 0.4 + scores.A8_emerging * 0.35 + scores.A8_pipeline * 0.25;
  return Math.round(raw);
}

// Land Banking formula: (A.7×0.30)+(A.8_pipeline×0.25)+(A.8_cagr×0.25)+(A.8_emerging×0.20)
export function computeLandBankingScore(scores: {
  A7: number;
  A8_pipeline: number;
  A8_cagr: number;
  A8_emerging: number;
}): number {
  const raw =
    scores.A7 * 0.3 +
    scores.A8_pipeline * 0.25 +
    scores.A8_cagr * 0.25 +
    scores.A8_emerging * 0.2;
  return Math.round(raw);
}

export interface ReturnEstimate {
  konservatif: number; // per ha, rounded to nearest 100k IDR
  optimistis: number; // per ha, rounded to nearest 100k IDR
  asumsi: string; // ≤90 chars
}

// hargaLahanRpPerM2: price per m2 in IDR; 1 ha = 10,000 m²
// Returns compounded final value per ha rounded to nearest 100k IDR.
// NOTE: The canonical fixture pre-bakes Berastagi 5yr konservatif=Rp 8.2M/ha,
// optimistis=Rp 11.8M/ha. These represent miliar (billion) IDR display labels and
// are stored verbatim in the fixture — they reflect different model assumptions
// than the PoC decay curve below. The formula here is correct; fixture overrides apply.
export function computeReturnEstimate(input: {
  hargaLahanRpPerM2: number;
  apresiasiYoyPct: number;
  years: 1 | 3 | 5;
}): ReturnEstimate {
  const { hargaLahanRpPerM2, apresiasiYoyPct, years } = input;
  const hargaPerHa = hargaLahanRpPerM2 * 10_000;

  // Konservatif: uses the decayed apresiasi schedule
  let nilaiKonservatif = hargaPerHa;
  for (let y = 1; y <= years; y++) {
    nilaiKonservatif *= 1 + apresiasiForYear(y, apresiasiYoyPct);
  }

  // Optimistis: uses input rate for all years (no decay applied)
  const rateOptimistis = apresiasiYoyPct / 100;
  const nilaiOptimistis = hargaPerHa * Math.pow(1 + rateOptimistis, years);

  const konservatif = Math.round(nilaiKonservatif / 100_000) * 100_000;
  const optimistis = Math.round(nilaiOptimistis / 100_000) * 100_000;

  const asumsiMap: Record<number, string> = {
    1: `Apresiasi ${apresiasiYoyPct.toFixed(1)}%/th tahun pertama`,
    3: `Apresiasi melambat ~12%/th di tahun ke-3`,
    5: `Apresiasi steady ~8%/th jangka panjang`,
  };
  const asumsi = asumsiMap[years] ?? `Apresiasi ${apresiasiYoyPct.toFixed(1)}%/th`;

  return { konservatif, optimistis, asumsi };
}

// Urgency badge classification: score >= 71 → SEGERA, >= 41 → TERBUKA, < 41 → JANGKA_PANJANG
export function classifyUrgencyBadge(urgencyScore: number): UrgencyBadge {
  if (urgencyScore >= 71) return "SEGERA";
  if (urgencyScore >= 41) return "TERBUKA";
  return "JANGKA_PANJANG";
}

// Land Banking klasifikasi: score >= 71 → Peluang_Tinggi, >= 41 → Sedang, < 41 → Rendah
export function classifyLBKlasifikasi(lbScore: number): LandBankingKlasifikasi {
  if (lbScore >= 71) return "Peluang_Tinggi";
  if (lbScore >= 41) return "Sedang";
  return "Rendah";
}
