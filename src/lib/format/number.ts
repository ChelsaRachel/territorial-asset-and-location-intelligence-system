// TALIS number formatting utilities for charts, tables, and metric cards.
// All functions are pure and unit-testable.

const ID_LOCALE = "id-ID";

/** Format as full Indonesian Rupiah: Rp 420.000 */
export function formatRp(value: number): string {
  if (!isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  return `${sign}Rp ${abs.toLocaleString(ID_LOCALE)}`;
}

/** Format Rupiah in short notation: 420rb, 18,5jt, 2,4M */
export function formatRupiahShort(value: number): string {
  if (!isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000_000).toLocaleString(ID_LOCALE, { maximumFractionDigits: 1 })}T`;
  }
  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toLocaleString(ID_LOCALE, { maximumFractionDigits: 1 })}M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toLocaleString(ID_LOCALE, { maximumFractionDigits: 1 })}jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${(abs / 1_000).toLocaleString(ID_LOCALE, { maximumFractionDigits: 0 })}rb`;
  }
  return `${sign}Rp ${abs.toLocaleString(ID_LOCALE)}`;
}

/** Format Rupiah per m2 short: "Rp 420rb/m²" */
export function formatRpPerM2(value: number): string {
  return `${formatRupiahShort(value)}/m²`;
}

/** Format percentage with sign: "+15.4%" / "-8.5%" / "0.0%" */
export function formatPct(value: number, decimals = 1): string {
  if (!isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/** Format tonnage: "560 ton/bln" */
export function formatTon(value: number, unit = "ton/bln"): string {
  if (!isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  const abs = Math.abs(value);
  return `${sign}${abs.toLocaleString(ID_LOCALE)} ${unit}`;
}

/** Format a ratio: "1.4x" */
export function formatRatio(value: number): string {
  if (!isFinite(value)) return "—";
  return `${value.toFixed(1)}x`;
}

/** Format NDVI index: "0.720" (3 decimal places) */
export function formatNdvi(value: number): string {
  if (!isFinite(value)) return "—";
  return value.toFixed(3);
}

/** Format a score 0-100 as integer: "76" */
export function formatScore(value: number): string {
  if (!isFinite(value)) return "—";
  return Math.round(value).toString();
}

/** Format trillions of Rupiah: "15.1T" */
export function formatTrilyun(value: number): string {
  if (!isFinite(value)) return "—";
  return `${value.toFixed(1)}T`;
}
