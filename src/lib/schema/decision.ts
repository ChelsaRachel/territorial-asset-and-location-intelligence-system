// Zod schemas for SPRINT-06 decision module fixtures
// docs/05_INVESTMENT_DECISION.md §4.1

import { z } from "zod";

const isoTimestamp = z.string().datetime({ offset: true });
const scoreField = z.number().min(0).max(100);

// ─── Business Recommender ─────────────────────────────────────────────────────

export const BusinessRecommendationFixtureSchema = z.object({
  sektor: z.string().min(1),
  suitability_score: scoreField,
  urgency_score: scoreField,
  urgensi: z.enum(["SEGERA", "TERBUKA", "JANGKA_PANJANG"]),
  alasan_timing: z.string().min(1),
  cost_of_delay_rp_bulan_ha: z.number().positive().nullable(),
  aksi: z.string().min(1).nullable().optional(),
});

export const BusinessRecommenderFixtureSchema = z.object({
  wilayah_id: z.number().int().positive(),
  sektor_aktif: z.enum(["agribisnis", "hospitality", "pariwisata", "properti"]),
  recommendations: z.array(BusinessRecommendationFixtureSchema).min(1),
  last_refreshed_at: isoTimestamp,
});

// ─── Land Banking Score ───────────────────────────────────────────────────────

const LBBreakdownComponentSchema = z.object({
  score: scoreField,
  weight: z.number().min(0).max(1),
});

const ReturnHorizonSchema = z.object({
  konservatif: z.number().positive(),
  optimistis: z.number().positive(),
  asumsi: z.string().min(1).max(90),
});

export const LandBankingScoreFixtureSchema = z.object({
  wilayah_id: z.number().int().positive(),
  land_banking_score: scoreField,
  klasifikasi: z.enum(["Peluang_Tinggi", "Sedang", "Rendah"]),
  breakdown: z.object({
    apresiasi: LBBreakdownComponentSchema,
    pipeline: LBBreakdownComponentSchema,
    cagr: LBBreakdownComponentSchema,
    emerging: LBBreakdownComponentSchema,
  }),
  return_estimate: z.object({
    "1yr": ReturnHorizonSchema,
    "3yr": ReturnHorizonSchema,
    "5yr": ReturnHorizonSchema,
  }),
  urgency_badge: z.enum(["SEGERA", "TERBUKA", "JANGKA_PANJANG"]),
  window_keterangan: z.string().min(1),
  last_refreshed_at: isoTimestamp,
});

// ─── Shortlist ────────────────────────────────────────────────────────────────

export const ShortlistItemFixtureSchema = z.object({
  id: z.string().min(1),
  user_id: z.string().min(1),
  wilayah_id: z.number().int().positive(),
  catatan: z.string().optional(),
  saved_at: isoTimestamp,
});

// ─── Array schemas for validating full fixture files ─────────────────────────

export const BusinessRecommenderFixtureArraySchema = z.array(
  BusinessRecommenderFixtureSchema
);

export const LandBankingScoreFixtureArraySchema = z.array(
  LandBankingScoreFixtureSchema
);

export const ShortlistFixtureArraySchema = z.array(ShortlistItemFixtureSchema);
