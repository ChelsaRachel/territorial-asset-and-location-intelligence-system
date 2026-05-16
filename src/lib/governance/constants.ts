// SPRINT-07 TASK-003 — Governance attribution constants
// Exported as named constants so SPRINT-08 / post-PoC can tune without forking functions.

/** Minimum absolute |delta_pct| for an indicator to receive attribution (5%). */
export const ATTRIBUTION_THRESHOLD_PCT = 5;

/** Attribution percentage when policy is the SOLE one tagged with the indicator domain. */
export const ATTRIBUTION_PCT_SOLE = 50;

/** Attribution percentage when multiple policies share the indicator domain. */
export const ATTRIBUTION_PCT_MULTI = 30;

/** Indicator ID → domain mapping (infrastruktur / demand / regulasi). */
export const INDICATOR_DOMAIN_MAP: Record<string, "infrastruktur" | "demand" | "regulasi"> = {
  infrastructure_index: "infrastruktur",
  market_access: "infrastruktur",
  location_score: "infrastruktur",
  demand_score: "demand",
  growth_score: "demand",
  skor_potensi_per_sektor: "demand",
  zoning_compliance: "regulasi",
  regulatory_flag: "regulasi",
  ndvi_score: "infrastruktur",
  harga_lahan_median: "demand",
};

/** Indonesian labels for each indicator ID. */
export const INDICATOR_LABEL_MAP: Record<string, string> = {
  location_score: "Location Score",
  infrastructure_index: "Indeks Infrastruktur",
  market_access: "Skor Akses Pasar",
  harga_lahan_median: "Median Harga Lahan",
  demand_score: "Skor Permintaan Pasar",
  ndvi_score: "Skor NDVI (Vegetasi)",
  growth_score: "Skor Proyeksi Pertumbuhan",
  zoning_compliance: "Kepatuhan Zonasi",
  regulatory_flag: "Status Regulasi",
  skor_potensi_per_sektor: "Potensi Sektor",
};

/** Policy tag → indicator domain mapping. */
export const POLICY_TAG_DOMAIN_MAP: Record<string, "infrastruktur" | "demand" | "regulasi"> = {
  infrastruktur: "infrastruktur",
  demand: "demand",
  regulasi: "regulasi",
  alert_response: "regulasi",
};
