export const ID_SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function toIsoMonth(date: string): string {
  return date.slice(0, 7);
}

export function monthStart(month: string): string {
  return `${month}-01`;
}

export function formatIsoMonth(month: string): string {
  const [year, monthIndex] = month.split("-").map(Number);
  if (!year || !monthIndex) return month;
  return `${ID_SHORT_MONTHS[monthIndex - 1]} ${year}`;
}

export function isDateWithinMonthWindow(date: string, fromMonth: string, toMonth: string): boolean {
  const month = toIsoMonth(date);
  return month >= fromMonth && month <= toMonth;
}
