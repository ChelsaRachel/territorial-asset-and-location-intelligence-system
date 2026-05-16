# Governance Library — Attribution Heuristic Assumptions

## Disclaimer

`computeAttribution()` is a **correlation-based estimate**, NOT a causal model.
It estimates how much of an indicator delta can be attributed to a policy based on timing
and tag matching. The UI must surface this disclaimer on every attribution row:

> "Estimasi heuristik berbasis korelasi delta indikator dengan tanggal kebijakan — bukan model kausal."

## Attribution Heuristic

1. Compute the average value of each indicator in the "before" period and "after" period.
2. If `|delta_pct| > 5%` (ATTRIBUTION_THRESHOLD_PCT), the indicator is eligible for attribution.
3. If the policy's tag maps to the indicator's domain:
   - If this is the SOLE policy in the period tagged with that domain: attribute 50% (confidence = "tinggi").
   - If multiple policies share that domain: attribute 30% (confidence = "sedang").
4. Indicators with `|delta_pct| <= 5%` are not attributed (omitted from output).
5. Zero-delta indicators are omitted entirely.

## 5% Threshold Rationale

The 5% threshold is a PoC pick. It filters out noise (e.g., seasonal variation in NDVI)
while capturing policy-sized signals. A real model would use statistical significance testing
(e.g., z-score, Mann-Whitney U) against a counterfactual baseline.

## Multi-Policy Attribution Overlap

When 3 policies all tag "infrastruktur", the heuristic does NOT cap the sum of attributions
per indicator. The sum of attribution_pcts across multiple policies can exceed 100%.
PoC documentation note: this is a known limitation. SPRINT-09+ may apply a cap.

## Regulatory Flag Attribution

When a policy is tagged "regulasi" AND the regulatory_flag changes from before to after period:
- Confidence = "tinggi" if the change was more permissive (KAWASAN_LINDUNG / MORATORIUM / KONFLIK_REGULASI → BEBAS_INVESTASI).
- Confidence = "sedang" otherwise.
- delta_value is set to 0 for categorical changes (no percentage applies).

## Swap to Real Model

Replace `computeAttribution()` with a backend-computed causal attribution:
1. The function signature stays the same (policy + before/after snapshots).
2. Replace the heuristic body with an API call to a causal inference endpoint.
3. The `estimated_attribution_pct` field remains in the return type so UI requires no changes.

## Canonical Cisondari Test Case

Policy: "Pembangunan Jalan Desa Cisondari" (infrastruktur, 2024-Q3)
Snapshots before: Jan-Jun 2024 (Berastagi, LS ≈ 68–69, Infrastructure ≈ 65–67, Market Access ≈ 53–55)
Snapshots after: Jul 2024 - Jan 2025 (LS ≈ 70–72, Infrastructure ≈ 67–70, Market Access ≈ 56–58)

Expected attributions:
- Infrastructure Index: delta ≈ +12 → 50% tinggi (sole infrastruktur policy)
- Market Access: delta ≈ +12 → 30% sedang (multi-factor; infrastructure not sole indicator)
- Location Score: delta ≈ +5 → not attributed (below 5% threshold or just at boundary)

## computeSnapshotDelta Notes

- Rounds once at the boundary using `Math.round(v * 100) / 100`.
- `regulatory_flag` is treated as categorical: no `delta_absolute` or `delta_pct`, but `is_categorical_change = true` if changed.
- All 10 indicators are returned in every call (9 numeric + 1 categorical).

## Gap Confirmation Helper

`computeGapConfirmation()` is a sanity-check helper for the pipeline aggregate fixture. The fixture remains canonical.

- Large demand-supply gap: `> 30%`.
- Small demand-supply gap: `< 10%`.
- Low pipeline count: `< 3` investors.
- High pipeline count: `>= 5` investors.
- Large gap + low pipeline -> `terkonfirmasi`.
- Large gap + high pipeline -> `hambatan_non_data`.
- Small gap + high pipeline -> `koreksi_oversupply`.
- Small gap + low pipeline -> `belum_relevan`.

The helper never throws. UI code logs a console warning only if the derived value does not match the fixture.

## Benchmark Projection Helper

`projectFromReference()` applies the reference wilayah's then-to-now growth rate to the active wilayah's current value.
Growth is capped at +/-50% over the projection horizon to avoid unrealistic PoC output from noisy reference anchors.
For the trajectory chart, the reference series is aligned by subtracting `years_offset` years from the displayed reference dates,
so "Ciwidey 2022" appears at the same maturity origin as "Berastagi 2026".

## Policy Log Schema Extension

Manual user additions may include `attribution_status: "pending_compute_in_12_months"`. This optional field is backward-compatible with existing fixture rows and tells the UI to show the 12-month attribution placeholder instead of an attribution table.
