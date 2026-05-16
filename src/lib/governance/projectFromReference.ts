export interface ProjectionInput {
  activeNow: number;
  referenceThen: number;
  referenceNow: number;
  capPct?: number;
}

export interface ProjectionResult {
  value: number;
  growthPctApplied: number;
  capped: boolean;
}

export function projectFromReference({
  activeNow,
  referenceThen,
  referenceNow,
  capPct = 50,
}: ProjectionInput): ProjectionResult {
  if (!isFinite(activeNow) || !isFinite(referenceThen) || !isFinite(referenceNow)) {
    return { value: activeNow, growthPctApplied: 0, capped: false };
  }

  if (referenceThen <= 0) {
    return { value: Math.round(activeNow), growthPctApplied: 0, capped: false };
  }

  const rawGrowthPct = ((referenceNow - referenceThen) / referenceThen) * 100;
  const cappedGrowthPct = Math.max(Math.min(rawGrowthPct, capPct), -capPct);

  return {
    value: Math.round(activeNow * (1 + cappedGrowthPct / 100)),
    growthPctApplied: Math.round(cappedGrowthPct * 100) / 100,
    capped: cappedGrowthPct !== rawGrowthPct,
  };
}
