// Mirrors docs/01_COMMAND_CENTER.md §4.1 — Command Center data shapes

import type {
  WilayahId,
  ProfilKode,
  Sektor,
  RegulatoryFlag,
  VerdictStatus,
  UrgencyBadge,
  Timestamp,
} from "./common";

export interface DimWilayah {
  wilayah_id: WilayahId;
  nama: string;
  kabupaten: string;
  provinsi: string;
  lat: number;
  lng: number;
  geometry?: unknown; // TODO(SPRINT-03): tighten to GeoJSON when map layer lands
}

export interface DimRegion {
  provinsi_id: string;
  provinsi: string;
}

export interface WilayahProfilSample {
  wilayah_id: WilayahId;
  profil_kode: ProfilKode;
  marker_color: string; // hex #RRGGBB
  marker_radius?: number;
  is_default: boolean;
  karakter_singkat: string;
  elevasi_meter: number;
}

export interface WilayahScoreAggregate {
  wilayah_id: WilayahId;
  land_suitability_agro: number; // A.1 — 0-100
  land_suitability_hosp: number;
  land_suitability_pariwisata: number;
  infrastructure_index: number; // A.2
  zoning_compliance: number; // A.3
  market_access: number; // A.4
  demand_absorption: number; // A.6
  growth_projection: number; // A.8
  location_score: number; // C.1
  median_land_price: number; // Rp/m²
  appreciation_rate: number; // %/year
  last_refreshed_at: Timestamp;
}

export interface HargaWindow {
  median_rp_per_m2: number;
  apresiasi_persen_per_tahun: number;
  sisa_window_bulan: number;
  window_reason?: string;
}

export interface PeluangItem {
  sektor: string;
  urgensi: UrgencyBadge;
  detail: string;
}

export interface SinyalKunciItem {
  label: string;
  value: number;
  color: "green" | "amber" | "red";
}

export interface QuickScanSnapshot {
  wilayah_id: WilayahId;
  profil_kode: ProfilKode;
  // Location identity — joined from dim_wilayah + wilayah_profil_sample at fixture time
  nama: string;
  kabupaten: string;
  provinsi: string;
  lat: number;
  lng: number;
  karakter_singkat: string;
  elevasi_meter: number;
  regulatory_flag: RegulatoryFlag;
  marker_color: string; // hex #RRGGBB — used as active tab background in the panel
  active_sektor?: Sektor;
  data_source?: "live_composed" | "snapshot_fallback";
  verdict_status: VerdictStatus;
  verdict_score: number;
  verdict_reason: string;
  verdict_kondisi: string[]; // up to 2 conditions
  peluang_top3: PeluangItem[];
  sinyal_kunci: SinyalKunciItem[];
  harga_window: HargaWindow;
  last_updated: Timestamp;
}

export type SearchMode = "location" | "criteria" | "opportunity";

export interface SearchResult {
  wilayah_id: WilayahId;
  nama: string;
  kabupaten: string;
  provinsi: string;
  matching_score?: number; // only for mode='opportunity'
  skor_potensi: number;
  highlight_reason: string;
  lat: number;
  lng: number;
  profil_kode?: ProfilKode;
  median_land_price?: number;
  appreciation_rate?: number;
  sector_signal?: string;
  sector_signal_score?: number;
  last_refreshed_at?: Timestamp;
}
