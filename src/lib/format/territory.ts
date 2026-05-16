const integerIdFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

const decimalIdFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
});

function trimDecimal(value: number, fractionDigits = 2): string {
  return value.toFixed(fractionDigits).replace(/\.?0+$/, "");
}

export function formatAreaKm2(value: number): string {
  return trimDecimal(value, 2);
}

export function formatPopulation(value: number): string {
  return integerIdFormatter.format(value);
}

export function formatDensity(value: number): string {
  return integerIdFormatter.format(Math.round(value));
}

export function formatPdrbPerKapita(value: number): string {
  return `Rp ${decimalIdFormatter.format(value)}jt`;
}

export function formatCostPerTon(value: number | null): string {
  if (value === null) return "-";
  return `Rp ${integerIdFormatter.format(value / 1000)}rb/ton`;
}

export function formatHectares(value: number): string {
  return `${decimalIdFormatter.format(value)} ha`;
}

export function formatMinutes(value: number): string {
  if (value === 0) return "0m";
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  if (!hours) return `${minutes}m`;
  if (!minutes) return `${hours}j`;
  return `${hours}j ${minutes}m`;
}
