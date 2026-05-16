// Mirrors docs/02_TERRITORY_PROFILE.md §4.1-5.2 — Territory Profile shapes (Page 2 / SPRINT-03)

import type {
  WilayahId,
  RegulatoryFlag,
  InfrastructureCategory,
  TipeTujuan,
  KondisiJalan,
  Timestamp,
} from "./common";

export type LandCompositionCategory =
  | "sawah"
  | "kebun"
  | "hutan"
  | "permukiman"
  | "lahan_terbuka"
  | "badan_air"
  | "lain";

export interface WilayahDemografi {
  luas_km2: number;
  jumlah_penduduk: number;
  kepadatan_per_km2: number;
  pdrb_per_kapita_juta: number;
  jumlah_desa_kelurahan: number;
  tahun_data: number;
  sumber: string;
  last_synced_at: Timestamp;
}

export interface InfraBreakdown {
  jalan_aspal: number;
  listrik_pln: number;
  air_bersih: number;
  sinyal_4g: number;
}

export interface WilayahInfrastruktur {
  infrastructure_index: number;
  kategori: InfrastructureCategory;
  breakdown: InfraBreakdown;
  tahun_data: number;
  last_synced_at: Timestamp;
}

export interface LandCompositionRow {
  kategori: LandCompositionCategory;
  label: string;
  luas_ha: number;
  persen: number;
  sumber: string;
  snapshot_date: string;
}

export interface AutomaticAnalysis {
  gap_kritis: string;
  prioritas_intervensi: [string, string, string];
}

export interface TerritoryProfile {
  wilayah_id: WilayahId;
  demografi: WilayahDemografi;
  infrastruktur: WilayahInfrastruktur;
  komposisi_lahan: LandCompositionRow[];
  analisis_otomatis: AutomaticAnalysis;
  last_updated: Timestamp;
}

export type RegulatoryFlagColor = "green" | "amber" | "red";

export interface ZoningAreaBreakdown {
  sesuai_ha: number;
  konflik_ha: number;
  kawasan_lindung_ha: number;
}

export interface ZoningImplications {
  investor: string[];
  pejabat: string[];
}

export interface MapLegendItem {
  value: string;
  label: string;
  color: string;
}

export interface MapLayerMetadata {
  id: "rtrw" | "actual_landcover" | "kawasan_lindung";
  label: string;
  type: "polygon" | "raster_proxy";
  geojson_path: string;
  style_property: string;
  legend: MapLegendItem[];
  initially_visible: boolean;
}

export interface SimpleGeoJsonFeature {
  type: "Feature";
  properties: Record<string, string | number | boolean | null>;
  geometry: {
    type: "Polygon" | "LineString" | "Point";
    coordinates: unknown;
  };
}

export interface SimpleFeatureCollection {
  type: "FeatureCollection";
  features: SimpleGeoJsonFeature[];
}

export interface TerritoryZoning {
  wilayah_id: WilayahId;
  zoning_compliance_score: number;
  regulatory_flag: RegulatoryFlag;
  flag_color: RegulatoryFlagColor;
  flag_detail: string;
  luas_sesuai_ha: number;
  luas_konflik_ha: number;
  luas_kawasan_lindung_ha: number;
  luas_breakdown: ZoningAreaBreakdown;
  rdtr_available: boolean;
  implications: ZoningImplications;
  map_layers: MapLayerMetadata[];
  geojson_overlay_path: string;
  last_computed_at: Timestamp;
}

export interface TerritoryMapLayers {
  wilayah_id: WilayahId;
  layers: MapLayerMetadata[];
  feature_collection: SimpleFeatureCollection;
  geojson_overlay_path: string;
  last_computed_at: Timestamp;
}

export interface MarketAccessScoreBreakdown {
  pelabuhan: number;
  bandara: number;
  pasar_induk: number;
  jalan_nasional: number;
  kondisi_jalan: number;
}

export interface MarketAccessDestination {
  tipe: TipeTujuan;
  nama: string;
  lat: number;
  lng: number;
  jarak_km: number;
  waktu_menit: number;
  kondisi_jalan: KondisiJalan;
  kondisi_jalan_label: string;
  cost_per_ton_rp: number | null;
  route_geojson_path: string;
}

export interface RouteFeatureCollection {
  type: "FeatureCollection";
  features: unknown[];
}

export interface MarketAccessDestinationWithRoute extends MarketAccessDestination {
  rute_geojson?: RouteFeatureCollection;
}

export interface TerritoryMarketAccess {
  wilayah_id: WilayahId;
  market_access_score: number;
  score_breakdown: MarketAccessScoreBreakdown;
  bottleneck_utama: string;
  destinations: MarketAccessDestinationWithRoute[];
  route_geojson_path: string;
  last_computed_at: Timestamp;
}

export interface GetMarketAccessOptions {
  includeRoutes?: boolean;
}
