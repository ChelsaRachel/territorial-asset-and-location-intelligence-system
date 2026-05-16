// Shared enums and value types referenced by multiple TALIS modules

// Note: snake_case is used throughout to match SQL column names verbatim (per README.md convention)

export type WilayahId = number;

export type ProfilKode = "AGRO_DOMINANT" | "HOSPITALITY_DOMINANT" | "AGRO_HOSP";

// Canonical sektor — uses 'agribisnis' as primary (SPRINT-05 preset) with 'agro' as alias surface
// SPRINT-02 search filters use 'agro'; SPRINT-05 sektor presets use 'agribisnis'. Using 'agribisnis'
// canonical throughout; a separate SektorAlias captures 'agro' for SPRINT-02 compatibility.
export type Sektor =
  | "agribisnis"
  | "hospitality"
  | "pariwisata"
  | "properti";

export type SektorAlias = Sektor | "agro"; // 'agro' maps to 'agribisnis'

export type RegulatoryFlag =
  | "BEBAS_INVESTASI"
  | "KONFLIK_REGULASI"
  | "KAWASAN_LINDUNG"
  | "MORATORIUM";

export type VerdictStatus = "LAYAK" | "LAYAK_BERSYARAT" | "TIDAK_LAYAK";

export type UrgencyBadge = "SEGERA" | "TERBUKA" | "JANGKA_PANJANG";

export type InfrastructureCategory = "Terbatas" | "Sedang" | "Lengkap";

export type TipeTujuan =
  | "pelabuhan_export"
  | "bandara_internasional"
  | "pasar_induk"
  | "ibukota_provinsi"
  | "jalan_nasional";

export type KondisiJalan =
  | "tol"
  | "tol_parsial"
  | "aspal_baik"
  | "aspal_berbukit"
  | "aspal_perkotaan"
  | "aspal_kabupaten"
  | "aspal_rusak"
  | "tanah";

export type SpeculationStatus = "sehat" | "waspada" | "spekulatif";

export type KomoditasStatus =
  | "peluang_besar"
  | "peluang_tinggi"
  | "mendekati_jenuh"
  | "oversupply";

export type TrenLabel = "Membaik" | "Stabil" | "Memburuk";

export type SkenarioIklim = "normal" | "elnino_lemah" | "elnino_kuat";

export type FeasibilityZone = "VIABLE" | "BORDERLINE" | "NOT_VIABLE";

export type InvestmentReadinessKlasifikasi =
  | "Siap_Investasi"
  | "Siap_Dengan_Catatan"
  | "Perlu_Persiapan";

export type SektorSiapStatus =
  | "siap"
  | "siap_dengan_syarat"
  | "belum_siap";

export type LandBankingKlasifikasi =
  | "Peluang_Tinggi"
  | "Sedang"
  | "Rendah";

export type AlertSeverity = "KRITIS" | "TINGGI" | "SEDANG";

// ASSIGNED is a transient state added for PoC — TODO(SPRINT-07): confirm finalization
export type AlertStatus =
  | "OPEN"
  | "ASSIGNED"
  | "INVESTIGATED"
  | "RESOLVED"
  | "FALSE_POSITIVE";

export type AlertTipe =
  | "penurunan_produktivitas"
  | "kekeringan_parah"
  | "potensi_banjir"
  | "waspadai_kekeringan"
  | "konversi_lahan_ilegal";

export type PipelineStatus =
  | "operasional"
  | "izin_diterbitkan"
  | "dalam_proses"
  | "tertahan";

export type GapConfirmation =
  | "terkonfirmasi"
  | "koreksi_oversupply"
  | "hambatan_non_data"
  | "belum_relevan";

export type AttributionConfidence = "tinggi" | "sedang" | "rendah";

export interface Coordinate {
  lat: number;
  lng: number;
}

/** ISO 8601 string */
export type Timestamp = string;

export interface ApiError {
  message: string;
  code: "NOT_YET_AVAILABLE" | "NOT_FOUND" | "FIXTURE_INVALID" | "NETWORK";
  endpoint: string;
}
