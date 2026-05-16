"use client";

import { formatRelativeTime } from "@/lib/ui/relativeTime";

interface DataTimestampProps {
  timestamp: string;
  label?: string;
  format?: "absolute" | "relative";
  className?: string;
}

export function DataTimestamp({
  timestamp,
  label = "Diperbarui",
  format = "relative",
  className,
}: DataTimestampProps) {
  const display =
    format === "relative"
      ? formatRelativeTime(timestamp)
      : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
          new Date(timestamp),
        );

  return (
    <span
      data-testid="data-timestamp"
      className={`font-sans text-xs text-talis-stone-700 ${className ?? ""}`}
    >
      {label} {display}
    </span>
  );
}

export default DataTimestamp;
