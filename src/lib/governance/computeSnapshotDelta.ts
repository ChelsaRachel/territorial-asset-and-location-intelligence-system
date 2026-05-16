// SPRINT-07 TASK-003 — computeSnapshotDelta
// Pure function: compares two MonthlySnapshot rows and returns per-indicator delta rows.
// No side effects, no Date.now(), no Math.random().

import type { MonthlySnapshot, IndicatorDeltaRow } from "./types";
import { INDICATOR_LABEL_MAP } from "./constants";

const NUMERIC_INDICATORS: Array<keyof MonthlySnapshot> = [
  "location_score",
  "infrastructure_index",
  "market_access",
  "harga_lahan_median",
  "demand_score",
  "ndvi_score",
  "growth_score",
  "zoning_compliance",
  "skor_potensi_per_sektor",
];

function roundOnce(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function computeSnapshotDelta(
  periodA: MonthlySnapshot,
  periodB: MonthlySnapshot,
): IndicatorDeltaRow[] {
  const rows: IndicatorDeltaRow[] = [];

  for (const key of NUMERIC_INDICATORS) {
    const before = periodA[key] as number;
    const after = periodB[key] as number;
    const delta = roundOnce(after - before);
    const deltaPct = before !== 0 ? roundOnce(((after - before) / Math.abs(before)) * 100) : null;
    const direction: IndicatorDeltaRow["direction"] =
      delta > 0 ? "naik" : delta < 0 ? "turun" : "stabil";

    rows.push({
      indicator_id: key,
      indicator_label: INDICATOR_LABEL_MAP[key] ?? key,
      before_value: before,
      after_value: after,
      delta_absolute: delta,
      delta_pct: deltaPct,
      direction,
      is_categorical_change: false,
    });
  }

  // Categorical: regulatory_flag
  const flagBefore = periodA.regulatory_flag;
  const flagAfter = periodB.regulatory_flag;
  const flagChanged = flagBefore !== flagAfter;
  rows.push({
    indicator_id: "regulatory_flag",
    indicator_label: INDICATOR_LABEL_MAP["regulatory_flag"] ?? "Status Regulasi",
    before_value: flagBefore,
    after_value: flagAfter,
    delta_absolute: null,
    delta_pct: null,
    direction: flagChanged ? "turun" : "stabil",
    is_categorical_change: flagChanged,
  });

  return rows;
}
