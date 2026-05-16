// Comparison scoring library for SPRINT-06 — docs/05_INVESTMENT_DECISION.md §3.2
// Pure functions only. No React, Zustand, or browser APIs.

// ─── Types ────────────────────────────────────────────────────────────────────

/** Per-candidate row fed into all comparison functions. */
export interface WilayahComparisonRow {
  wilayah_id: number;
  nama: string;
  /** A.1 — land suitability agro (0-100) */
  A1: number;
  /** A.2 — infrastructure index (0-100) */
  A2: number;
  /** A.3 — zoning compliance (0-100) */
  A3: number;
  /** A.4 — market access (0-100) */
  A4: number;
  /** A.6 — demand absorption (0-100) */
  A6: number;
  /** A.7 — land value dynamics score (0-100) */
  A7: number;
  /** A.8 — growth projection (0-100) */
  A8: number;
  /** C.1 — location score (0-100) */
  C1: number;
  /** median land price Rp/m² */
  harga_lahan: number;
  /** appreciation rate %/yr */
  apresiasi_yoy_pct: number;
}

export interface RekomendasiCard {
  tujuan: "Agribisnis" | "Land Banking" | "Risk-Averse";
  winner_wilayah_id: number;
  winner_nama: string;
  winner_score: number;
  rationale: string;
}

export interface HighlightMap {
  /** wilayah_id with best (highest) value per parameter key */
  best: Record<string, number>;
  /** wilayah_id with worst (lowest) value per parameter key */
  worst: Record<string, number>;
}

export interface DeltaRow {
  param: string;
  label: string;
  wilayahA_value: number;
  wilayahB_value: number;
  delta: number;
  delta_pct?: number;
  severity: "LOW" | "HIGH" | "CRITICAL";
}

// ─── Rekomendasi Cards ─────────────────────────────────────────────────────────

/**
 * Agribisnis score: A.1(50%) + A.6(30%) + A.4(20%)
 */
function agribisnisScore(row: WilayahComparisonRow): number {
  return Math.round(row.A1 * 0.5 + row.A6 * 0.3 + row.A4 * 0.2);
}

/**
 * Land Banking score: A.7(40%) + A.8(30%) + A.4(30%)
 */
function landBankingScore(row: WilayahComparisonRow): number {
  return Math.round(row.A7 * 0.4 + row.A8 * 0.3 + row.A4 * 0.3);
}

/**
 * Risk-Averse score: A.2(30%) + A.3(30%) + A.4(20%) + harga_inv(20%)
 * harga_inv normalises median price inversely — lowest price gets score 100.
 * Range is derived from the candidate set.
 */
function riskAverseScore(
  row: WilayahComparisonRow,
  minHarga: number,
  maxHarga: number
): number {
  const range = maxHarga - minHarga;
  const hargaInv =
    range === 0 ? 100 : ((maxHarga - row.harga_lahan) / range) * 100;
  return Math.round(row.A2 * 0.3 + row.A3 * 0.3 + row.A4 * 0.2 + hargaInv * 0.2);
}

/**
 * Compute rekomendasi cards for three tujuan: Agribisnis, Land Banking, Risk-Averse.
 * Requires at least 2 candidates.
 */
export function computeRekomendasiCards(
  kandidat: WilayahComparisonRow[]
): RekomendasiCard[] {
  if (kandidat.length === 0) return [];

  const minHarga = Math.min(...kandidat.map((r) => r.harga_lahan));
  const maxHarga = Math.max(...kandidat.map((r) => r.harga_lahan));

  function winner(
    scoreFn: (row: WilayahComparisonRow) => number,
    tujuan: RekomendasiCard["tujuan"]
  ): RekomendasiCard {
    // kandidat is guaranteed non-empty (checked above)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let best = kandidat[0]!;
    let bestScore = scoreFn(best);
    for (const row of kandidat.slice(1)) {
      const s = scoreFn(row);
      // Tiebreak: lower wilayah_id wins (deterministic)
      if (s > bestScore || (s === bestScore && row.wilayah_id < best.wilayah_id)) {
        best = row;
        bestScore = s;
      }
    }
    const rationale = buildRationale(tujuan, best, bestScore);
    return {
      tujuan,
      winner_wilayah_id: best.wilayah_id,
      winner_nama: best.nama,
      winner_score: bestScore,
      rationale,
    };
  }

  return [
    winner(agribisnisScore, "Agribisnis"),
    winner((r) => landBankingScore(r), "Land Banking"),
    winner((r) => riskAverseScore(r, minHarga, maxHarga), "Risk-Averse"),
  ];
}

function buildRationale(
  tujuan: RekomendasiCard["tujuan"],
  row: WilayahComparisonRow,
  score: number
): string {
  switch (tujuan) {
    case "Agribisnis":
      return `${row.nama} unggul agribisnis (skor ${score}) didorong kesesuaian lahan (A.1=${row.A1}) dan serapan pasar (A.6=${row.A6}).`;
    case "Land Banking":
      return `${row.nama} memimpin land banking (skor ${score}) dengan dinamika harga (A.7=${row.A7}) dan proyeksi pertumbuhan (A.8=${row.A8}).`;
    case "Risk-Averse":
      return `${row.nama} paling aman (skor ${score}) karena harga lahan rendah dan infrastruktur memadai (A.2=${row.A2}).`;
  }
}

// ─── Highlights ───────────────────────────────────────────────────────────────

const PARAM_KEYS = [
  "A1",
  "A2",
  "A3",
  "A4",
  "A6",
  "A7",
  "A8",
  "C1",
  "harga_lahan",
  "apresiasi_yoy_pct",
] as const;
type ParamKey = (typeof PARAM_KEYS)[number];

/**
 * Returns a HighlightMap indicating which wilayah has the best and worst
 * value for each parameter across the candidate set.
 * For harga_lahan: "best" means lowest price (most affordable).
 * For all other params: "best" means highest score.
 */
export function applyHighlights(
  kandidat: WilayahComparisonRow[]
): HighlightMap {
  const best: Record<string, number> = {};
  const worst: Record<string, number> = {};

  if (kandidat.length === 0) return { best, worst };

  // harga_lahan is inverted: best = lowest, worst = highest
  const invertedKeys = new Set<ParamKey>(["harga_lahan"]);

  for (const key of PARAM_KEYS) {
    const invert = invertedKeys.has(key);
    // Non-null assertion safe: we checked length > 0 above
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let bestRow: WilayahComparisonRow = kandidat[0]!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let worstRow: WilayahComparisonRow = kandidat[0]!;
    let bestVal = Number(bestRow[key]);
    let worstVal = Number(worstRow[key]);

    for (const row of kandidat.slice(1)) {
      const val = Number(row[key]);
      if (invert ? val < bestVal : val > bestVal) {
        bestRow = row;
        bestVal = val;
      }
      if (invert ? val > worstVal : val < worstVal) {
        worstRow = row;
        worstVal = val;
      }
    }

    best[key] = bestRow.wilayah_id;
    worst[key] = worstRow.wilayah_id;
  }

  return { best, worst };
}

// ─── Delta Comparison ─────────────────────────────────────────────────────────

const DELTA_PARAM_CONFIG: Array<{
  key: ParamKey;
  label: string;
  usePct: boolean;
  highThreshold: number;
  criticalOnChange?: boolean; // for regulatory flags
}> = [
  { key: "A1", label: "Kesesuaian Lahan (A.1)", usePct: false, highThreshold: 10 },
  { key: "A2", label: "Infrastruktur (A.2)", usePct: false, highThreshold: 10 },
  { key: "A3", label: "Kepatuhan Zonasi (A.3)", usePct: false, highThreshold: 10 },
  { key: "A4", label: "Akses Pasar (A.4)", usePct: false, highThreshold: 10 },
  { key: "A6", label: "Serapan Pasar (A.6)", usePct: false, highThreshold: 10 },
  { key: "A7", label: "Dinamika Harga (A.7)", usePct: false, highThreshold: 10 },
  { key: "A8", label: "Proyeksi Pertumbuhan (A.8)", usePct: false, highThreshold: 10 },
  { key: "C1", label: "Location Score (C.1)", usePct: false, highThreshold: 10 },
  { key: "harga_lahan", label: "Harga Lahan (Rp/m²)", usePct: true, highThreshold: 20 },
  {
    key: "apresiasi_yoy_pct",
    label: "Apresiasi YoY (%)",
    usePct: false,
    highThreshold: 5,
  },
];

/**
 * Computes delta rows between two candidates (A vs B).
 * Severity rules:
 *   - Location Score |Δ| > 10 → HIGH
 *   - Harga Lahan Δ% > 20 → HIGH
 *   - Regulatory flag any change → CRITICAL (not applicable here; flag is on A.3 zoning)
 *   - All others: |Δ| > threshold → HIGH, else LOW
 */
export function computeDeltaRows(
  wilayahA: WilayahComparisonRow,
  wilayahB: WilayahComparisonRow
): DeltaRow[] {
  return DELTA_PARAM_CONFIG.map(({ key, label, usePct, highThreshold }) => {
    const valA = Number(wilayahA[key]);
    const valB = Number(wilayahB[key]);
    const delta = valA - valB;
    const delta_pct = usePct && valB !== 0 ? (delta / valB) * 100 : undefined;

    const magnitude = usePct
      ? Math.abs(delta_pct ?? 0)
      : Math.abs(delta);

    const severity: DeltaRow["severity"] = magnitude > highThreshold ? "HIGH" : "LOW";

    return {
      param: key,
      label,
      wilayahA_value: valA,
      wilayahB_value: valB,
      delta,
      delta_pct: usePct ? delta_pct : undefined,
      severity,
    };
  });
}
