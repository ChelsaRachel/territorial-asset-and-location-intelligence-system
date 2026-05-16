// Score-to-color thresholds — docs/00_OVERVIEW.md §5.4 + SPRINT-01 SPRINT.md §"UI / UX Expectations"

/** Minimum score for green (verdict-success) verdict */
export const SCORE_GREEN_MIN = 70;

/** Minimum score for amber (verdict-warning) verdict */
export const SCORE_AMBER_MIN = 40;

/** Tailwind color class names for verdict levels */
export const VERDICT_COLORS = {
  success: "verdict-success",
  warning: "verdict-warning",
  danger: "verdict-danger",
} as const;

export type VerdictColorKey = keyof typeof VERDICT_COLORS;
export type VerdictColorClass = (typeof VERDICT_COLORS)[VerdictColorKey];

/** Regulatory flag → verdict color mapping — docs/02_TERRITORY_PROFILE.md §4.1 */
export const REGULATORY_FLAG_COLORS = {
  BEBAS_INVESTASI: "verdict-success",
  KONFLIK_REGULASI: "verdict-warning",
  KAWASAN_LINDUNG: "verdict-danger",
  MORATORIUM: "verdict-danger",
} as const;

export type RegulatoryFlagKey = keyof typeof REGULATORY_FLAG_COLORS;

/** Global header height in pixels — matches CSS variable --talis-header-height */
export const HEADER_HEIGHT_PX = 64;
