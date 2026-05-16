import type { ComparisonParameter } from "../types";

export const COMPARISON_PARAMETERS: ComparisonParameter[] = [
  { key: "A1", label: "Kesesuaian Lahan (A.1)", shortLabel: "A.1", format: "score" },
  { key: "A2", label: "Indeks Infrastruktur (A.2)", shortLabel: "A.2", format: "score" },
  { key: "A3", label: "Kepatuhan Zonasi (A.3)", shortLabel: "A.3", format: "score" },
  { key: "A4", label: "Akses Pasar (A.4)", shortLabel: "A.4", format: "score" },
  { key: "A6", label: "Serapan Permintaan (A.6)", shortLabel: "A.6", format: "score" },
  { key: "A7", label: "Dinamika Harga Lahan (A.7)", shortLabel: "A.7", format: "score" },
  { key: "A8", label: "Proyeksi Pertumbuhan (A.8)", shortLabel: "A.8", format: "score" },
  { key: "C1", label: "Location Score (C.1)", shortLabel: "C.1", format: "score" },
  { key: "harga_lahan", label: "Median Harga Lahan", shortLabel: "Harga", format: "currency", bestIsLowest: true },
  { key: "apresiasi_yoy_pct", label: "Apresiasi YoY", shortLabel: "Apresiasi", format: "percent" },
];
