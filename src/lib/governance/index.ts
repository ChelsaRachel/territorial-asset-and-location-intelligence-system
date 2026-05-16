export { computeSnapshotDelta } from "./computeSnapshotDelta";
export { computeAttribution } from "./computeAttribution";
export { computeGapConfirmation, GAP_CONFIRMATION_THRESHOLDS } from "./computeGapConfirmation";
export type { GapConfirmationValue } from "./computeGapConfirmation";
export { projectFromReference } from "./projectFromReference";
export type { ProjectionInput, ProjectionResult } from "./projectFromReference";
export type { MonthlySnapshot, IndicatorDeltaRow, PolicyEntry, AttributionRow } from "./types";
export {
  ATTRIBUTION_THRESHOLD_PCT,
  ATTRIBUTION_PCT_SOLE,
  ATTRIBUTION_PCT_MULTI,
  INDICATOR_DOMAIN_MAP,
  INDICATOR_LABEL_MAP,
  POLICY_TAG_DOMAIN_MAP,
} from "./constants";
