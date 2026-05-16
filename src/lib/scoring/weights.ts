// Canonical sektor weight presets for C.1 Location Scoring Card (SPRINT-05)
// Source: docs/04_OPPORTUNITY_RISK.md §2.1 "Bobot Preset per Sektor"
// These are immutable constants — UI may apply custom weights but these are the defaults.

import type { Sektor } from "@/lib/types/common";
import type { DimensionKey, Weights } from "@/lib/types/assessment";

export const DIMENSION_KEYS: readonly DimensionKey[] = [
  "A1",
  "A2",
  "A3",
  "A4",
  "A8",
] as const;

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  A1: "Land Suitability",
  A2: "Infrastructure",
  A3: "Zoning Compliance",
  A4: "Market Access",
  A8: "Growth Projection",
};

export const SEKTOR_PRESETS: Record<Sektor, Weights> = {
  agribisnis: { A1: 35, A2: 20, A3: 10, A4: 25, A8: 10 },
  hospitality: { A1: 15, A2: 30, A3: 20, A4: 20, A8: 15 },
  pariwisata: { A1: 15, A2: 25, A3: 15, A4: 25, A8: 20 },
  properti: { A1: 10, A2: 35, A3: 25, A4: 15, A8: 15 },
} as const;

// Verify presets sum to 100 at module load (defensive runtime check)
for (const [sektor, weights] of Object.entries(SEKTOR_PRESETS)) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (total !== 100) {
    throw new Error(`SEKTOR_PRESETS[${sektor}] weights sum to ${total}, expected 100`);
  }
}
