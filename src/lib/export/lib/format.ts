export function formatScore(value: number): string {
  return Math.round(value).toString();
}

export function formatRp(value: number): string {
  return `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value)}`;
}

export function formatRpPerM2(value: number): string {
  return `${formatRp(value)}/m2`;
}

export function formatPct(value: number, digits = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function truncateText(value: string, max = 120): string {
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}
