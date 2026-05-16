export function formatRupiahPerM2(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function formatSignedPercentPerYear(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("id-ID", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function formatWindowMonths(value: number): string {
  return `${value} bulan`;
}
