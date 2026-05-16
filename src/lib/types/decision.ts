// Mirrors docs/05_INVESTMENT_DECISION.md §4.1 — Investment Decision shapes (Page 5 / SPRINT-06)

import type {
  WilayahId,
  Sektor,
  UrgencyBadge,
  LandBankingKlasifikasi,
  Timestamp,
} from "./common";

export interface WilayahLandBankingScore {
  wilayah_id: WilayahId;
  land_banking_score: number; // C.7 — 0-100
  klasifikasi: LandBankingKlasifikasi;
  estimasi_return_1yr_pct?: number;
  estimasi_return_3yr_pct?: number;
  estimasi_return_5yr_pct?: number;
  last_refreshed_at: Timestamp;
}

export interface BusinessRecommendation {
  sektor: string;
  suitability_score: number;
  urgency_score: number;
  urgensi: UrgencyBadge;
  alasan_timing: string;
  cost_of_delay_rp_bulan_ha?: number;
  aksi?: string;
}

export interface WilayahBusinessRecommender {
  wilayah_id: WilayahId;
  sektor_aktif: Sektor;
  recommendations: BusinessRecommendation[];
  last_refreshed_at: Timestamp;
}

export interface UserShortlist {
  id: string;
  user_id: string;
  wilayah_id: WilayahId;
  catatan?: string;
  saved_at: Timestamp;
}

export interface ShortlistSnapshot {
  shortlist_id: string;
  wilayah_id: WilayahId;
  snapshot_at: Timestamp;
  scores: unknown; // TODO(SPRINT-06): tighten to score snapshot shape
}

export interface ShortlistDeltaLog {
  shortlist_id: string;
  wilayah_id: WilayahId;
  logged_at: Timestamp;
  deltas: unknown; // TODO(SPRINT-06): tighten to delta map
}

export interface ComparisonSession {
  session_id: string;
  user_id: string;
  kandidat_ids: WilayahId[];
  created_at: Timestamp;
  tujuan?: Sektor;
}
