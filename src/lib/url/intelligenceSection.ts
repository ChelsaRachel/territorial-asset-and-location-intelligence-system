export const VALID_SECTIONS = ["A5", "A6", "A7", "A8"] as const;
export type ValidSection = (typeof VALID_SECTIONS)[number];

/**
 * Parse the `?section=` query param into a typed section id.
 * Case-insensitive; invalid or missing values return null.
 */
export function parseSectionParam(value: string | null | undefined): ValidSection | null {
  if (!value) return null;
  const upper = value.toUpperCase() as ValidSection;
  return (VALID_SECTIONS as readonly string[]).includes(upper) ? upper : null;
}

/** Human-readable label for each section — used for aria-label and future SPRINT-07 navigation. */
export const SECTION_LABELS: Record<ValidSection, string> = {
  A5: "Tren Kondisi Wilayah",
  A6: "Demand dan Serapan Pasar",
  A7: "Dinamika Nilai Lahan",
  A8: "Proyeksi Pertumbuhan",
};
