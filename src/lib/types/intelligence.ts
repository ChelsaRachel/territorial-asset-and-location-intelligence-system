// Mirrors docs/03_TERRITORY_INTELLIGENCE.md §4.1 — Territory Intelligence shapes (Page 3 / SPRINT-04)
// Updated in SPRINT-04 to match full §5.1 API response shapes

import type {
  WilayahId,
  TrenLabel,
  SkenarioIklim,
  KomoditasStatus,
  SpeculationStatus,
  Timestamp,
} from "./common";

// --- A.5 Tren Kondisi Wilayah ---

export interface NdviMonthlyPoint {
  wilayah_id: WilayahId;
  year: number;
  month: number;
  ndvi_value: number;
  baseline_5yr: number;
  delta_from_baseline: number;
}

export interface PdrbYearlyPoint {
  wilayah_id: WilayahId;
  year: number;
  pdrb_total_triliyun: number;
  yoy_growth_pct: number;
  sektor_breakdown: Record<string, number>;
}

export interface IklimAnomaliPoint {
  wilayah_id: WilayahId;
  year: number;
  spi_annual: number;
  curah_hujan_deviasi_pct: number;
  el_nino_flag: boolean;
  kategori: string;
}

export interface SkenarioProyeksi {
  skenario: SkenarioIklim;
  proyeksi_growth_pct: number;
  probabilitas_pct: number;
  saran?: string;
}

export interface TrenSummaryData {
  label: TrenLabel;
  score: number;
  proyeksi: {
    normal: { pct: number; probabilitas: number };
    elnino_lemah: { pct: number; probabilitas: number };
    elnino_kuat: { pct: number; probabilitas: number };
  };
}

/** Full A.5 response from GET /territory/{id}/trend */
export interface TrendResponse {
  wilayah_id: WilayahId;
  ndvi_series: NdviMonthlyPoint[];
  pdrb_series: PdrbYearlyPoint[];
  iklim_anomali_series: IklimAnomaliPoint[];
  tren_summary: TrenSummaryData;
  last_updated: Timestamp;
}

// --- A.6 Demand & Serapan Pasar ---

export interface DemandItem {
  komoditas: string;
  supply_per_bulan: number;
  demand_per_bulan: number;
  gap: number;
  harga_rp_per_unit: number;
  unit: string;
  status: KomoditasStatus;
  sumber: string[];
}

/** Full A.6 response from GET /territory/{id}/demand */
export interface DemandResponse {
  wilayah_id: WilayahId;
  sektor_aktif: string;
  items: DemandItem[];
  peluang_top3: DemandItem[];
  komoditas_hindari: DemandItem[];
  demand_absorption_score: number;
  last_updated: Timestamp;
}

// --- A.7 Dinamika Nilai Lahan ---

export interface LandValueCurrent {
  median_price_rp_per_m2: number;
  appreciation_yoy_pct: number;
  speculation_ratio: number;
  speculation_status: SpeculationStatus;
}

export interface QuarterlyPricePoint {
  wilayah_id: WilayahId;
  year: number;
  quarter: number;
  median_rp_per_m2: number;
  listing_count: number;
  njop_rp_per_m2?: number;
}

export interface HargaVsNjopRow {
  kelurahan: string;
  njop_rp_per_m2: number;
  pasar_rp_per_m2: number;
  selisih_pct: number;
}

export interface LandValueProyeksi {
  "6_bulan": { konservatif: [number, number]; optimistis: [number, number] };
  "12_bulan": { konservatif: [number, number]; optimistis: [number, number] };
  "36_bulan": { konservatif: [number, number]; optimistis: [number, number] };
}

/** Full A.7 response from GET /territory/{id}/land-value */
export interface LandValueResponse {
  wilayah_id: WilayahId;
  current: LandValueCurrent;
  quarterly_series: QuarterlyPricePoint[];
  harga_vs_njop: HargaVsNjopRow[];
  proyeksi: LandValueProyeksi;
  timing_recommendation: string;
  last_updated: Timestamp;
}

// --- A.8 Proyeksi Pertumbuhan ---

export interface GrowthBreakdownComponent {
  score: number;
  weight: number;
}

export interface GrowthBreakdown {
  pipeline_infra: GrowthBreakdownComponent;
  emerging_destination: GrowthBreakdownComponent;
  cagr_penduduk: GrowthBreakdownComponent;
}

export interface PipelineInfraDetail {
  proyek: string;
  nilai_rp_t: number;
  eta_quarter: string;
  status: string;
  dampak: string;
}

export interface EmergingSignalDetail {
  tiktok_geotag_growth_pct_vs_2yr: number;
  instagram_post_growth_pct: number;
  google_trends_search_growth_pct: number;
  airbnb_wish_list_growth_pct?: number;
}

export interface TimelineKritisItem {
  quarter: string;
  milestone: string;
  impact: string;
}

/** Full A.8 response from GET /territory/{id}/growth */
export interface GrowthResponse {
  wilayah_id: WilayahId;
  growth_projection_score: number;
  breakdown: GrowthBreakdown;
  pipeline_infra_detail: PipelineInfraDetail[];
  emerging_signal_detail: EmergingSignalDetail;
  cagr_penduduk_pct: number;
  sinyal_pendukung: string[];
  timeline_kritis: TimelineKritisItem[];
  cost_of_delay_per_bulan_rp: number;
  last_computed_at: Timestamp;
}

// --- Legacy aliases for backward compat (pre-SPRINT-04 stubs) ---
/** @deprecated Use NdviMonthlyPoint */
export type WilayahNdviMonthly = NdviMonthlyPoint;
/** @deprecated Use PdrbYearlyPoint */
export type WilayahPdrbYearly = PdrbYearlyPoint;
/** @deprecated Use IklimAnomaliPoint */
export type WilayahIklimAnomali = IklimAnomaliPoint;
