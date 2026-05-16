// POST /decision/compare — docs/05_INVESTMENT_DECISION.md §5.1
// Reads from wilayah_score_aggregate fixture + derives A7 from appreciation dynamics.
import { ApiError } from "../common/ApiError";
import { loadFixture } from "@/lib/schema/loader";
import { WilayahScoreAggregateSchema } from "@/lib/schema/wilayah_score_aggregate";
import rawAggregate from "@/mocks/wilayah_score_aggregate.json";
import rawWilayah from "@/mocks/dim_wilayah.json";
import {
  computeRekomendasiCards,
  applyHighlights,
  computeDeltaRows,
  type WilayahComparisonRow,
  type RekomendasiCard,
  type HighlightMap,
  type DeltaRow,
} from "@/lib/decision/compare";

export interface CompareResult {
  kandidat: WilayahComparisonRow[];
  rekomendasi: RekomendasiCard[];
  highlights: HighlightMap;
  /** Delta rows between first two candidates (A vs B). Null if fewer than 2 candidates. */
  delta: DeltaRow[] | null;
}

// Derive A7 score (land value dynamics) from appreciation_rate
// Normalization: 0% appreciation → score 0, 25%+ → score 100 (linear capped)
function deriveA7Score(appreciationRate: number): number {
  return Math.min(100, Math.round((appreciationRate / 25) * 100));
}

// Lookup wilayah nama from dim_wilayah.json
function lookupNama(wilayahId: number, dimWilayah: unknown[]): string {
  const row = dimWilayah.find(
    (r): r is { wilayah_id?: number; kode_wilayah?: number; nama?: string; nama_kecamatan?: string } =>
      typeof r === "object" &&
      r !== null &&
      (((r as { wilayah_id?: unknown }).wilayah_id === wilayahId) ||
        ((r as { kode_wilayah?: unknown }).kode_wilayah === wilayahId))
  );
  if (row) return row.nama ?? row.nama_kecamatan ?? `Wilayah ${wilayahId}`;
  return `Wilayah ${wilayahId}`;
}

export async function compare(kandidatIds: number[]): Promise<CompareResult> {
  if (kandidatIds.length === 0) {
    throw new ApiError(
      "NOT_FOUND",
      "POST /decision/compare",
      "At least one wilayah_id is required"
    );
  }

  const aggregates = (rawAggregate as unknown[]).map((r) =>
    loadFixture(r, WilayahScoreAggregateSchema)
  );

  const rows: WilayahComparisonRow[] = [];
  for (const id of kandidatIds) {
    const agg = aggregates.find((r) => r.wilayah_id === id);
    if (!agg) {
      throw new ApiError(
        "NOT_FOUND",
        "POST /decision/compare",
        `No aggregate data for wilayah_id ${id}`
      );
    }
    const nama = lookupNama(id, rawWilayah as unknown[]);
    rows.push({
      wilayah_id: id,
      nama,
      A1: agg.land_suitability_agro,
      A2: agg.infrastructure_index,
      A3: agg.zoning_compliance,
      A4: agg.market_access,
      A6: agg.demand_absorption,
      A7: deriveA7Score(agg.appreciation_rate),
      A8: agg.growth_projection,
      C1: agg.location_score,
      harga_lahan: agg.median_land_price,
      apresiasi_yoy_pct: agg.appreciation_rate,
    });
  }

  const rekomendasi = computeRekomendasiCards(rows);
  const highlights = applyHighlights(rows);
  // Non-null assertions safe: we check length >= 2 before spread
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const delta = rows.length >= 2 ? computeDeltaRows(rows[0]!, rows[1]!) : null;

  return { kandidat: rows, rekomendasi, highlights, delta };
}
