export function formatCompactRupiah(value?: number): string {
  if (value === undefined) return "Harga belum tersedia";
  if (value >= 1_000_000) {
    const juta = value / 1_000_000;
    return `Rp ${new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: juta >= 10 ? 0 : 1,
    }).format(juta)} jt/m2`;
  }

  return `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(value / 1000))} rb/m2`;
}

export function formatMatchingScore(value?: number): string {
  if (value === undefined) return "-";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatAppreciation(value?: number): string | null {
  if (value === undefined) return null;
  return `Apresiasi +${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
  }).format(value)}%/thn`;
}
