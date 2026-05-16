export function formatRelativeTime(iso: string, locale = "id-ID"): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffSeconds = Math.round((then - now) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const abs = Math.abs(diffSeconds);
  if (abs < 60) return rtf.format(diffSeconds, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSeconds / 3600), "hour");
  if (abs < 2592000) return rtf.format(Math.round(diffSeconds / 86400), "day");
  if (abs < 31536000) return rtf.format(Math.round(diffSeconds / 2592000), "month");
  return rtf.format(Math.round(diffSeconds / 31536000), "year");
}
