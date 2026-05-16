interface KpiCardTrend {
  direction: "up" | "down" | "flat";
  deltaPct: number;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: KpiCardTrend;
  tone?: "default" | "positive" | "negative";
  size?: "default" | "compact" | "compact-sm";
  className?: string;
}

const SIZE_VALUE_CLASS = {
  default: "text-kpi",
  compact: "text-2xl",
  "compact-sm": "text-xl",
};

const TONE_VALUE_CLASS = {
  default: "text-talis-stone-900",
  positive: "text-talis-green-700",
  negative: "text-talis-red-700",
};

const TREND_ICON = { up: "↑", down: "↓", flat: "→" };
const TREND_CLASS = {
  up: "text-talis-green-700",
  down: "text-talis-red-700",
  flat: "text-talis-stone-700",
};

export function KpiCard({ label, value, unit, trend, tone = "default", size = "default", className }: KpiCardProps) {
  return (
    <div
      data-testid="kpi-card"
      className={`rounded-lg border border-talis-stone-200 bg-white p-4 ${className ?? ""}`}
    >
      <p className="font-sans text-xs text-talis-stone-700 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className={`font-mono font-semibold ${SIZE_VALUE_CLASS[size]} ${TONE_VALUE_CLASS[tone]}`}>
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </span>
        {unit && <span className="font-sans text-sm text-talis-stone-700">{unit}</span>}
      </div>
      {trend && (
        <p className={`mt-1 font-sans text-xs ${TREND_CLASS[trend.direction]}`}>
          {TREND_ICON[trend.direction]}{" "}
          {trend.deltaPct > 0 ? "+" : ""}
          {trend.deltaPct.toFixed(1)}%
        </p>
      )}
    </div>
  );
}

export default KpiCard;
