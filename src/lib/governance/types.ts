// SPRINT-07 TASK-003 — Governance library types

export interface MonthlySnapshot {
  wilayah_id: number;
  snapshot_date: string;
  location_score: number;
  infrastructure_index: number;
  market_access: number;
  harga_lahan_median: number;
  ndvi_score: number;
  demand_score: number;
  growth_score: number;
  zoning_compliance: number;
  skor_potensi_per_sektor: number;
  regulatory_flag: string;
  tren_wilayah_label: string;
}

export interface IndicatorDeltaRow {
  indicator_id: string;
  indicator_label: string;
  before_value: number | string;
  after_value: number | string;
  delta_absolute: number | null;
  delta_pct: number | null;
  direction: "naik" | "turun" | "stabil";
  is_categorical_change: boolean;
}

export interface PolicyEntry {
  id: string;
  wilayah_id: number;
  policy_date: string;
  title: string;
  tags: string[];
  created_by?: string;
}

export interface AttributionRow {
  indicator_id: string;
  indicator_label: string;
  delta_value: number;
  estimated_attribution_pct: number;
  confidence: "tinggi" | "sedang" | "rendah";
}
