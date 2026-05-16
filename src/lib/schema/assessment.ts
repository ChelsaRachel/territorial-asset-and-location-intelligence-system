// Zod validation schemas for SPRINT-05 assessment mock fixtures
// Source: docs/04_OPPORTUNITY_RISK.md §4.1

import { z } from "zod";

const isoTimestamp = z.string().datetime({ offset: true });
const scoreField = z.number().min(0).max(100);
const wilayahId = z.number().int().positive();

const SEKTORS = ["agribisnis", "hospitality", "pariwisata", "properti"] as const;
const QUADRANT_TIERS = ["Baik", "Cukup", "Perlu_Perhatian"] as const;
const VIABILITY_ZONES = ["VIABLE", "BORDERLINE", "NOT_VIABLE"] as const;
const READINESS_KLASI = ["Siap_Investasi", "Siap_Dengan_Catatan", "Perlu_Persiapan"] as const;
const SEKTOR_SIAP_STATUS = ["siap", "siap_dengan_syarat", "belum_siap"] as const;
const RECOMMENDATION_STATUS = ["rekomendasi_jelas", "rekomendasi_dengan_syarat", "perlu_kajian_lanjut"] as const;
const DIMENSION_KEYS = ["A1", "A2", "A3", "A4", "A8"] as const;

// --- C.1 Location Score ---

const DimensionBreakdownSchema = z.object({
  raw_score: scoreField,
  weight: z.number().int().min(0).max(100),
  contribution: z.number().min(0).max(100),
});

const EffortVsImpactItemSchema = z.object({
  dimensi: z.enum(DIMENSION_KEYS),
  dimensi_label: z.string().min(1),
  aksi: z.string().min(1),
  impact_estimate: z.string().min(1),
});

export const LocationScoreFixtureSchema = z.object({
  wilayah_id: wilayahId,
  sektor: z.enum(SEKTORS),
  location_score: scoreField,
  score_breakdown: z.record(z.enum(DIMENSION_KEYS), DimensionBreakdownSchema),
  weights_used: z.record(z.enum(DIMENSION_KEYS), z.number().int().min(0).max(100)),
  is_capped: z.boolean(),
  cap_reason: z.string().optional(),
  effort_vs_impact: z.array(EffortVsImpactItemSchema).max(3),
  last_computed_at: isoTimestamp,
});

export type LocationScoreFixture = z.infer<typeof LocationScoreFixtureSchema>;

// --- C.3 Risk Profile ---

const RiskSubFaktorSchema = z.object({
  nama: z.string().min(1),
  skor: scoreField,
  keterangan: z.string().min(1),
});

const RiskDimensionDetailSchema = z.object({
  dimensi: z.enum(["iklim", "regulasi", "infrastruktur", "sosial"]),
  skor: scoreField,
  sub_faktor: z.array(RiskSubFaktorSchema).min(1),
});

const MitigasiRowSchema = z.object({
  dimensi: z.enum(["iklim", "regulasi", "infrastruktur", "sosial"]),
  skor_risiko: scoreField,
  aksi: z.string().min(1),
  timeline: z.string().min(1),
  cost_estimate: z.string().min(1),
});

export const RiskProfileFixtureSchema = z.object({
  wilayah_id: wilayahId,
  scores: z.object({
    iklim: scoreField,
    regulasi: scoreField,
    infrastruktur: scoreField,
    sosial: scoreField,
  }),
  risiko_dominan: z.enum(["iklim", "regulasi", "infrastruktur", "sosial"]),
  detail_per_dimensi: z.array(RiskDimensionDetailSchema).length(4),
  mitigation_plan: z.array(MitigasiRowSchema).length(4),
  last_computed_at: isoTimestamp,
});

export type RiskProfileFixture = z.infer<typeof RiskProfileFixtureSchema>;

// --- C.4 Feasibility Snapshot ---

const QuadrantDetailSchema = z.object({
  tier: z.enum(QUADRANT_TIERS),
  score: scoreField,
  catatan: z.string().min(1),
});

export const FeasibilityFixtureSchema = z.object({
  wilayah_id: wilayahId,
  quadrants: z.object({
    lahan: QuadrantDetailSchema,
    pasar: QuadrantDetailSchema,
    infrastruktur: QuadrantDetailSchema,
    regulasi: QuadrantDetailSchema,
  }),
  last_computed_at: isoTimestamp,
});

export type FeasibilityFixture = z.infer<typeof FeasibilityFixtureSchema>;

// --- C.6 Financial Viability ---

const AsumsiKritisSchema = z.object({
  komoditas: z.string().min(1),
  yield_kg_per_ha: z.number().positive(),
  harga_per_kg: z.number().positive(),
  biaya_input: z.number().positive(),
  biaya_tenaga_kerja: z.number().positive(),
  biaya_logistik: z.number().positive(),
});

const SensitivitasSkenarioSchema = z.object({
  ratio: z.number().positive(),
  zone: z.enum(VIABILITY_ZONES),
  delta_pct: z.string().min(1),
});

export const FinancialViabilityFixtureSchema = z.object({
  wilayah_id: wilayahId,
  sektor: z.enum(SEKTORS),
  revenue_proxy_rp: z.number().positive(),
  cost_proxy_rp: z.number().positive(),
  ratio: z.number().positive(),
  zone: z.enum(VIABILITY_ZONES),
  asumsi: AsumsiKritisSchema,
  sensitivitas: z.object({
    harga_turun_10pct: SensitivitasSkenarioSchema,
    yield_turun_15pct: SensitivitasSkenarioSchema,
    biaya_input_naik_20pct: SensitivitasSkenarioSchema,
    kombinasi_terburuk: SensitivitasSkenarioSchema,
  }),
  last_computed_at: isoTimestamp,
});

export type FinancialViabilityFixture = z.infer<typeof FinancialViabilityFixtureSchema>;

// --- B.4 Investment Readiness ---

const SektorSiapDetailSchema = z.object({
  status: z.enum(SEKTOR_SIAP_STATUS),
  syarat_terpenuhi: z.number().int().min(0).max(4),
  total: z.number().int().min(4).max(4),
  syarat_belum: z.array(z.string()),
});

export const InvestmentReadinessFixtureSchema = z.object({
  wilayah_id: wilayahId,
  investment_readiness_score: scoreField,
  klasifikasi: z.enum(READINESS_KLASI),
  sektor_siap: z.object({
    agribisnis: SektorSiapDetailSchema,
    hospitality: SektorSiapDetailSchema,
    pariwisata: SektorSiapDetailSchema,
    properti: SektorSiapDetailSchema,
  }),
  verdict_status: z.enum(["LAYAK", "LAYAK_BERSYARAT", "TIDAK_LAYAK"]),
  verdict_kondisi: z.array(z.string().min(1)).min(1).max(3),
  last_refreshed_at: isoTimestamp,
});

export type InvestmentReadinessFixture = z.infer<typeof InvestmentReadinessFixtureSchema>;

// --- B.1 Regional Ranking ---

const RankingRowSchema = z.object({
  rank: z.number().int().positive(),
  wilayah_id: wilayahId,
  nama: z.string().min(1),
  kabupaten: z.string().min(1),
  score: scoreField,
});

const RankingFixtureEntrySchema = z.object({
  wilayah_id: wilayahId,
  sektor: z.enum(SEKTORS),
  ranking_provinsi: z.object({
    region_id: z.number().int().positive(),
    region_name: z.string().min(1),
    rank: z.number().int().positive(),
    of: z.number().int().positive(),
    top_wilayah: z.array(RankingRowSchema).min(3),
  }),
  ranking_nasional: z.object({
    rank: z.number().int().positive(),
    of: z.number().int().positive(),
  }),
  snapshot_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const RankingRegionFixtureSchema = z.array(RankingFixtureEntrySchema);
export type RankingRegionFixture = z.infer<typeof RankingRegionFixtureSchema>;

// --- B.6 Peruntukan Rekomendasi ---

const PeruntukanItemFixtureSchema = z.object({
  sektor: z.enum(SEKTORS),
  label: z.string().min(1),
  rekomendasi_teks: z.string().min(1),
  alasan: z.string().min(1).optional(),
  score: z.number().min(0).max(100).optional(),
  is_utama: z.boolean(),
});

export const PeruntukanRekomendasiFixtureSchema = z.object({
  wilayah_id: wilayahId,
  status: z.enum(RECOMMENDATION_STATUS),
  rekomendasi: z.array(PeruntukanItemFixtureSchema).min(1),
  syarat_belum_terpenuhi: z.array(z.string()).optional(),
  last_computed_at: isoTimestamp,
});

export type PeruntukanRekomendasiFixture = z.infer<typeof PeruntukanRekomendasiFixtureSchema>;

// --- B.2 Gap Analysis ---

const GapSubKomponenSchema = z.object({
  nama: z.string().min(1),
  current_pct: z.number().min(0).max(100),
  target_pct: z.number().min(0).max(100),
  gap: z.number().max(0),
  unit: z.string().min(1),
  prioritas: z.number().int().positive(),
});

export const GapAnalysisRowSchema = z.object({
  wilayah_id: wilayahId,
  nama: z.string().min(1),
  kabupaten: z.string().min(1),
  skor_potensi: scoreField,
  infrastructure_index: scoreField,
  infrastructure_gap: z.number().min(0).max(100),
  priority_score: z.number().nonnegative(),
  rank_provinsi: z.number().int().positive(),
  detail_gap: z.array(GapSubKomponenSchema).min(1),
  snapshot_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const GapAnalysisFixtureSchema = z.array(GapAnalysisRowSchema);
export type GapAnalysisFixture = z.infer<typeof GapAnalysisFixtureSchema>;
