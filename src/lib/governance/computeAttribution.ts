// SPRINT-07 TASK-003 — computeAttribution
// PoC heuristic: correlation-based delta-indicator attribution per policy tag.
// IMPORTANT: This is NOT a causal model. It is a heuristic based on indicator delta
// correlation with policy dates. See _assumptions.md for full disclosure.

import type { MonthlySnapshot, PolicyEntry, AttributionRow } from "./types";
import {
  ATTRIBUTION_THRESHOLD_PCT,
  ATTRIBUTION_PCT_SOLE,
  ATTRIBUTION_PCT_MULTI,
  INDICATOR_DOMAIN_MAP,
  POLICY_TAG_DOMAIN_MAP,
  INDICATOR_LABEL_MAP,
} from "./constants";

const NUMERIC_INDICATORS = [
  "location_score",
  "infrastructure_index",
  "market_access",
  "harga_lahan_median",
  "demand_score",
  "ndvi_score",
  "growth_score",
  "zoning_compliance",
  "skor_potensi_per_sektor",
] as const;

function average(snapshots: MonthlySnapshot[], key: keyof MonthlySnapshot): number {
  if (snapshots.length === 0) return 0;
  const sum = snapshots.reduce((acc, s) => acc + (s[key] as number), 0);
  return sum / snapshots.length;
}

function roundOnce(v: number): number {
  return Math.round(v * 100) / 100;
}

/**
 * computeAttribution
 *
 * @param policy - The policy being evaluated
 * @param snapshotsBefore - Monthly snapshots in the period before the policy
 * @param snapshotsAfter - Monthly snapshots in the period after the policy
 * @param policiesInPeriod - ALL policies active in the combined period (used for sole/multi check)
 * @returns AttributionRow[] — one row per attributed indicator (|delta_pct| > 5%)
 */
export function computeAttribution(
  policy: PolicyEntry,
  snapshotsBefore: MonthlySnapshot[],
  snapshotsAfter: MonthlySnapshot[],
  policiesInPeriod: PolicyEntry[] = [],
): AttributionRow[] {
  if (snapshotsBefore.length === 0 || snapshotsAfter.length === 0) return [];

  const policyDomains = policy.tags.flatMap((tag) =>
    POLICY_TAG_DOMAIN_MAP[tag] ? [POLICY_TAG_DOMAIN_MAP[tag]!] : [],
  );

  const rows: AttributionRow[] = [];

  for (const key of NUMERIC_INDICATORS) {
    const avgBefore = average(snapshotsBefore, key);
    const avgAfter = average(snapshotsAfter, key);

    if (avgBefore === 0) continue;

    const deltaPct = ((avgAfter - avgBefore) / Math.abs(avgBefore)) * 100;

    if (Math.abs(deltaPct) <= ATTRIBUTION_THRESHOLD_PCT) continue;

    const indicatorDomain = INDICATOR_DOMAIN_MAP[key];
    if (!indicatorDomain) continue;

    if (!policyDomains.includes(indicatorDomain)) continue;

    // Determine sole vs multi: count other policies in period with the same domain
    const otherPoliciesInDomain = policiesInPeriod.filter(
      (p) =>
        p.id !== policy.id &&
        p.tags.some((t) => POLICY_TAG_DOMAIN_MAP[t] === indicatorDomain),
    );

    const isSole = otherPoliciesInDomain.length === 0;
    const attributionPct = isSole ? ATTRIBUTION_PCT_SOLE : ATTRIBUTION_PCT_MULTI;
    const confidence: AttributionRow["confidence"] = isSole ? "tinggi" : "sedang";

    rows.push({
      indicator_id: key,
      indicator_label: INDICATOR_LABEL_MAP[key] ?? key,
      delta_value: roundOnce(avgAfter - avgBefore),
      estimated_attribution_pct: attributionPct,
      confidence,
    });
  }

  // Handle regulatory_flag categorical change
  if (policyDomains.includes("regulasi") && snapshotsBefore.length > 0 && snapshotsAfter.length > 0) {
    const flagBefore = snapshotsBefore[snapshotsBefore.length - 1]!.regulatory_flag;
    const flagAfter = snapshotsAfter[0]!.regulatory_flag;
    if (flagBefore !== flagAfter) {
      const isMorePermissive =
        flagBefore === "KAWASAN_LINDUNG" || flagBefore === "MORATORIUM" || flagBefore === "KONFLIK_REGULASI";
      rows.push({
        indicator_id: "regulatory_flag",
        indicator_label: INDICATOR_LABEL_MAP["regulatory_flag"] ?? "Status Regulasi",
        delta_value: 0,
        estimated_attribution_pct: ATTRIBUTION_PCT_SOLE,
        confidence: isMorePermissive ? "tinggi" : "sedang",
      });
    }
  }

  return rows;
}
