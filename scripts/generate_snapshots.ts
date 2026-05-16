/**
 * generate_snapshots.ts
 *
 * Derives the 84-row monthly snapshot fixture (Jan 2024 – Apr 2026, 28 months × 3 profiles)
 * by linearly interpolating between documented canonical anchor values.
 *
 * Canonical anchors (per SPRINT-07 TASK-001 and SPRINT.md §"Canonical Berastagi B.5 deltas"):
 *   Berastagi (1206090):  Jan 2024 → LS=67, Infra=64, MA=52, LV=180000
 *                          Apr 2026 → LS=78, Infra=76, MA=64, LV=420000
 *   Ciwidey  (3204170):   Jan 2024 → LS=70, Infra=68, MA=56, LV=120000
 *                          Apr 2026 → LS=78, Infra=78, MA=64, LV=185000
 *   Seminyak (5103060):   Jan 2024 → LS=71, Infra=95, MA=78, LV=24200000
 *                          Apr 2026 → LS=74, Infra=98, MA=82, LV=28500000
 *
 * Interpolation strategy: linear (LERP) over 27 intervals (index 0–27).
 *   value(i) = round(start + (end - start) * (i / 27))
 *
 * Land value harga_lahan_median uses a conservative NJOP-based valuation distinct from
 * the market listing price in wilayah_land_value_quarterly.json. See _assumptions.md §LV.
 *
 * Usage: npx tsx scripts/generate_snapshots.ts
 */

import fs from "fs";
import path from "path";

// ─── Month index → ISO date ────────────────────────────────────────────────────

function indexToDate(i: number): string {
  const startYear = 2024;
  const startMonth = 1; // January
  const totalMonths = startMonth - 1 + i;
  const year = startYear + Math.floor(totalMonths / 12);
  const month = (totalMonths % 12) + 1;
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

// ─── Linear interpolation ──────────────────────────────────────────────────────

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

function lerpRounded(start: number, end: number, i: number, n: number): number {
  return Math.round(lerp(start, end, i / n));
}

// ─── NDVI score (0–1 range, 3 dp) ──────────────────────────────────────────────

function lerpNdvi(start: number, end: number, i: number, n: number): number {
  return Math.round(lerp(start, end, i / n) * 1000) / 1000;
}

// ─── Profile anchors ───────────────────────────────────────────────────────────

interface ProfileAnchor {
  wilayah_id: number;
  start: {
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
  };
  end: {
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
  };
}

const PROFILES: ProfileAnchor[] = [
  {
    wilayah_id: 1206090, // Berastagi
    start: {
      location_score: 67,
      infrastructure_index: 64,
      market_access: 52,
      harga_lahan_median: 180000,
      ndvi_score: 0.62,
      demand_score: 78,
      growth_score: 75,
      zoning_compliance: 82,
      skor_potensi_per_sektor: 74,
      regulatory_flag: "BEBAS_INVESTASI",
      tren_wilayah_label: "Membaik",
    },
    end: {
      location_score: 78,
      infrastructure_index: 76,
      market_access: 64,
      harga_lahan_median: 420000,
      ndvi_score: 0.69,
      demand_score: 88,
      growth_score: 81,
      zoning_compliance: 84,
      skor_potensi_per_sektor: 82,
      regulatory_flag: "BEBAS_INVESTASI",
      tren_wilayah_label: "Membaik",
    },
  },
  {
    wilayah_id: 3204170, // Ciwidey
    start: {
      location_score: 70,
      infrastructure_index: 68,
      market_access: 56,
      harga_lahan_median: 120000,
      ndvi_score: 0.58,
      demand_score: 82,
      growth_score: 64,
      zoning_compliance: 89,
      skor_potensi_per_sektor: 72,
      regulatory_flag: "BEBAS_INVESTASI",
      tren_wilayah_label: "Stabil",
    },
    end: {
      location_score: 78,
      infrastructure_index: 78,
      market_access: 64,
      harga_lahan_median: 185000,
      ndvi_score: 0.64,
      demand_score: 88,
      growth_score: 71,
      zoning_compliance: 91,
      skor_potensi_per_sektor: 80,
      regulatory_flag: "BEBAS_INVESTASI",
      tren_wilayah_label: "Stabil",
    },
  },
  {
    wilayah_id: 5103060, // Seminyak
    start: {
      location_score: 71,
      infrastructure_index: 95,
      market_access: 78,
      harga_lahan_median: 24200000,
      ndvi_score: 0.38,
      demand_score: 70,
      growth_score: 60,
      zoning_compliance: 58,
      skor_potensi_per_sektor: 72,
      regulatory_flag: "BEBAS_INVESTASI",
      tren_wilayah_label: "Stabil",
    },
    end: {
      location_score: 74,
      infrastructure_index: 98,
      market_access: 82,
      harga_lahan_median: 28500000,
      ndvi_score: 0.42,
      demand_score: 74,
      growth_score: 62,
      zoning_compliance: 60,
      skor_potensi_per_sektor: 76,
      regulatory_flag: "BEBAS_INVESTASI",
      tren_wilayah_label: "Stabil",
    },
  },
];

// ─── Generator ─────────────────────────────────────────────────────────────────

const N_INTERVALS = 27; // 0..27 = 28 months
const rows: object[] = [];

for (const profile of PROFILES) {
  const { start, end } = profile;
  for (let i = 0; i <= N_INTERVALS; i++) {
    const snapshotDate = indexToDate(i);
    const t = i / N_INTERVALS;

    rows.push({
      wilayah_id: profile.wilayah_id,
      snapshot_date: snapshotDate,
      location_score: lerpRounded(start.location_score, end.location_score, i, N_INTERVALS),
      infrastructure_index: lerpRounded(
        start.infrastructure_index,
        end.infrastructure_index,
        i,
        N_INTERVALS,
      ),
      market_access: lerpRounded(start.market_access, end.market_access, i, N_INTERVALS),
      harga_lahan_median: lerpRounded(
        start.harga_lahan_median,
        end.harga_lahan_median,
        i,
        N_INTERVALS,
      ),
      ndvi_score: lerpNdvi(start.ndvi_score, end.ndvi_score, i, N_INTERVALS),
      demand_score: lerpRounded(start.demand_score, end.demand_score, i, N_INTERVALS),
      growth_score: lerpRounded(start.growth_score, end.growth_score, i, N_INTERVALS),
      zoning_compliance: lerpRounded(start.zoning_compliance, end.zoning_compliance, i, N_INTERVALS),
      skor_potensi_per_sektor: lerpRounded(
        start.skor_potensi_per_sektor,
        end.skor_potensi_per_sektor,
        i,
        N_INTERVALS,
      ),
      regulatory_flag: lerp(0, 1, t) < 0.5 ? start.regulatory_flag : end.regulatory_flag,
      tren_wilayah_label: end.tren_wilayah_label,
    });
  }
}

const outPath = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../src/mocks/monitoring/monthly_snapshot.json",
);

fs.writeFileSync(outPath, JSON.stringify(rows, null, 2));
console.log(`✓ Generated ${rows.length} snapshot rows → ${outPath}`);
