// Shared Recharts theme for all SPRINT-04 Territory Intelligence charts.
// Import these objects as spread props for consistent chart styling.

export const TALIS_COLORS = {
  green700: "#40916C",
  green600: "#52B788",
  green800: "#2D6A4F",
  green900: "#1B4332",
  amber: "#B45309",
  red700: "#B42318",
  blue: "#1E40AF",
  stone700: "#57534E",
  stone200: "#E7E5E4",
  stone50: "#FAFAF9",
  // Series palette for multi-line / grouped charts
  series: ["#40916C", "#52B788", "#B45309", "#1E40AF", "#B42318", "#2D6A4F"],
} as const;

/** NDVI line chart — current series */
export const NDVI_CURRENT_COLOR = TALIS_COLORS.green700;
/** NDVI line chart — baseline series */
export const NDVI_BASELINE_COLOR = TALIS_COLORS.stone700;

/** Supply bar color */
export const SUPPLY_COLOR = TALIS_COLORS.amber;
/** Demand bar color */
export const DEMAND_COLOR = TALIS_COLORS.green700;

/** Land value area chart gradient */
export const LAND_VALUE_AREA_COLOR = TALIS_COLORS.green700;
/** NJOP bar color */
export const NJOP_COLOR = TALIS_COLORS.stone700;
/** Market price bar color */
export const PASAR_COLOR = TALIS_COLORS.green700;

/** SPI positive bar */
export const SPI_POSITIVE_COLOR = TALIS_COLORS.blue;
/** SPI negative bar */
export const SPI_NEGATIVE_COLOR = TALIS_COLORS.red700;

export const FONT_MONO = "var(--font-mono), ui-monospace, monospace";

export const DEFAULT_AXIS = {
  tick: { fontFamily: FONT_MONO, fontSize: 11, fill: TALIS_COLORS.stone700 },
  axisLine: { stroke: TALIS_COLORS.stone200 },
  tickLine: { stroke: TALIS_COLORS.stone200 },
} as const;

export const DEFAULT_GRID = {
  stroke: TALIS_COLORS.stone200,
  strokeDasharray: "3 3",
} as const;

export const DEFAULT_TOOLTIP_STYLE = {
  contentStyle: {
    fontFamily: FONT_MONO,
    fontSize: 12,
    borderColor: TALIS_COLORS.stone200,
    borderRadius: 6,
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  labelStyle: { color: TALIS_COLORS.stone700, fontWeight: 600 },
  itemStyle: { color: TALIS_COLORS.stone700 },
} as const;

/** Maps KomoditasStatus → Tailwind bg/text/border classes */
export const KOMODITAS_STATUS_COLORS: Record<string, string> = {
  peluang_besar: "bg-talis-green-700/15 text-talis-green-700 border-talis-green-700/30",
  peluang_tinggi: "bg-talis-green-600/15 text-talis-green-800 border-talis-green-600/30",
  mendekati_jenuh: "bg-talis-amber/15 text-talis-earth-700 border-talis-amber/40",
  oversupply: "bg-talis-red-700/15 text-talis-red-700 border-talis-red-700/30",
};

export const KOMODITAS_STATUS_LABELS: Record<string, string> = {
  peluang_besar: "Peluang Besar",
  peluang_tinggi: "Peluang Tinggi",
  mendekati_jenuh: "Mendekati Jenuh",
  oversupply: "Oversupply",
};

/** Maps SpeculationStatus → Tailwind pill classes (mirrors StatusPill) */
export const SPECULATION_STATUS_COLORS: Record<string, string> = {
  sehat: "bg-talis-green-700/15 text-talis-green-700 border-talis-green-700/30",
  waspada: "bg-talis-amber/15 text-talis-earth-700 border-talis-amber/40",
  spekulatif: "bg-talis-red-700/15 text-talis-red-700 border-talis-red-700/30",
};
