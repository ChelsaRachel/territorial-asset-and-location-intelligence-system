// Mirrors docs/04_OPPORTUNITY_RISK.md §4.1 — Opportunity & Risk Assessment shapes (Page 4 / SPRINT-05)

import type {
  WilayahId,
  Sektor,
  VerdictStatus,
  FeasibilityZone,
  InvestmentReadinessKlasifikasi,
  SektorSiapStatus,
  RegulatoryFlag,
  Timestamp,
} from "./common";

export type BobotKey = "A1" | "A2" | "A3" | "A4" | "A8";

/** Canonical alias used by the scoring module. */
export type DimensionKey = BobotKey;

export type BobotPreset = Record<BobotKey, number>; // weights, sum = 100

/** Raw dimension scores 0-100 passed into formula functions. */
export type ScoreDimensions = Record<DimensionKey, number>;

/** Integer weights 0-100 that must sum to exactly 100. */
export type Weights = Record<DimensionKey, number>;

// --- Scoring result types ---

export interface DimensionContribution {
  raw_score: number;
  weight: number; // integer 0-100
  contribution: number; // raw_score × weight / 100, rounded to 2 dp
}

export interface LocationScoreResult {
  total: number; // weighted sum, rounded to 2 dp
  contributions: Record<DimensionKey, DimensionContribution>;
  capped: boolean;
  cap_reason?: string;
}

export interface InvestmentReadinessResult {
  score: number; // B.4 — 0-100, 2 dp
  klasifikasi: InvestmentReadinessKlasifikasi;
}

export type QuadrantTier = "Baik" | "Cukup" | "Perlu_Perhatian";

export type QuadrantMap = Record<"lahan" | "pasar" | "infrastruktur" | "regulasi", QuadrantTier>;

export type RecommendationStatus =
  | "rekomendasi_jelas"
  | "rekomendasi_dengan_syarat"
  | "perlu_kajian_lanjut";

export interface PeruntukanRekomendasiOutput {
  status: RecommendationStatus;
  rekomendasi_utama?: { sektor: Sektor; label: string; alasan: string };
  rekomendasi_alternatif: { sektor: Sektor; label: string }[];
  syarat_belum_terpenuhi?: string[];
}

export interface SektorSiapDetail {
  sektor: Sektor;
  status: SektorSiapStatus;
  syarat_terpenuhi: number;
  total_syarat: number;
  syarat_belum: string[];
}

export type SektorSiapMap = Record<Sektor, SektorSiapDetail>;

export interface SektorDemandInput {
  sektor: Sektor;
  a1_land_suitability: number; // sektor-specific land suitability
  a6_demand_absorption: number; // 0-100; > 0 means positive demand gap
}

export interface EffortVsImpactItem {
  dimensi: DimensionKey;
  dimensi_label: string;
  current_score: number;
  gap_to_target: number;
  aksi: string;
  impact_estimate: string;
}

// Re-export RegulatoryFlag so scoring functions can import from a single place
export type { RegulatoryFlag };

export interface WilayahLocationScore {
  wilayah_id: WilayahId;
  location_score: number; // C.1 — 0-100
  sektor: Sektor;
  bobot: BobotPreset;
  breakdown: Record<BobotKey, { raw_score: number; contribution: number }>;
  is_capped: boolean; // true if regulatory flag caps to 40
  last_refreshed_at: Timestamp;
}

export interface RiskDimension {
  dimensi: "iklim" | "regulasi" | "infrastruktur" | "sosial";
  skor: number; // 0-100 (lower = riskier)
  mitigasi: string;
  timeline: string;
  cost_estimate?: string;
}

export interface WilayahRiskProfile {
  wilayah_id: WilayahId;
  risk_dimensions: RiskDimension[];
  risiko_dominan: "iklim" | "regulasi" | "infrastruktur" | "sosial";
  last_refreshed_at: Timestamp;
}

/** Legacy alias — prefer QuadrantTier in new scoring code. */
export type FeasibilityQuadrant = QuadrantTier;

export interface WilayahFeasibilitySnapshot {
  wilayah_id: WilayahId;
  lahan: QuadrantTier;
  pasar: QuadrantTier;
  infrastruktur: QuadrantTier;
  regulasi: QuadrantTier;
  catatan?: Record<"lahan" | "pasar" | "infrastruktur" | "regulasi", string>;
}

export interface AsumsiKritis {
  yield_kg_per_ha: number;
  harga_per_kg: number;
  biaya_input: number;
  biaya_tenaga_kerja: number;
  biaya_logistik: number;
  komoditas: string;
}

export interface SensitivitasSkenario {
  ratio: number;
  zone: FeasibilityZone;
  delta_pct: string;
}

export interface WilayahFinancialViability {
  wilayah_id: WilayahId;
  sektor: Sektor;
  zona: FeasibilityZone;
  revenue_proxy_rp_ha_thn: number;
  cost_proxy_rp_ha_thn: number;
  revenue_cost_ratio: number;
  asumsi: AsumsiKritis;
  sensitivitas: Record<string, SensitivitasSkenario>;
  last_refreshed_at: Timestamp;
}

export interface SektorSiap {
  sektor: Sektor;
  status: SektorSiapStatus;
}

export interface WilayahInvestmentReadiness {
  wilayah_id: WilayahId;
  investment_readiness_score: number; // B.4 — 0-100
  klasifikasi: InvestmentReadinessKlasifikasi;
  sektor_siap: SektorSiap[];
  verdict_status: VerdictStatus;
  verdict_kondisi: string[];
  last_refreshed_at: Timestamp;
}

export interface WilayahRankingRegion {
  wilayah_id: WilayahId;
  rank_provinsi: number;
  rank_nasional?: number;
  total_kandidat_provinsi: number;
  total_kandidat_nasional?: number;
}

export interface PeruntukanItem {
  sektor: Sektor;
  label: string;
  rekomendasi_teks: string;
  is_utama: boolean;
  score?: number;
}

export interface WilayahPeruntukanRekomendasi {
  wilayah_id: WilayahId;
  status: RecommendationStatus;
  rekomendasi: PeruntukanItem[];
  syarat_belum_terpenuhi?: string[];
  last_refreshed_at: Timestamp;
}

export interface GapSubKomponen {
  nama: string;
  current_pct: number;
  target_pct: number;
  gap: number; // negative = deficit
  unit: string;
  prioritas: number;
}

export interface GapItem {
  dimensi: string;
  gap_size: "besar" | "sedang" | "kecil";
  deskripsi: string;
  prioritas: number;
}

export interface WilayahGapAnalysisRow {
  wilayah_id: WilayahId;
  nama: string;
  kabupaten: string;
  skor_potensi: number;
  infrastructure_index: number;
  infrastructure_gap: number; // 100 - infrastructure_index
  priority_score: number; // skor_potensi × infrastructure_gap
  rank_provinsi: number;
  detail_gap: GapSubKomponen[];
  snapshot_date: string;
}

export interface WilayahGapAnalysis {
  wilayah_id: WilayahId;
  gaps: GapItem[];
  total_effort_estimate?: string;
}

// Gap analysis regional fixture shape (array of rows per region)
export type RegionalGapAnalysis = WilayahGapAnalysisRow[];
