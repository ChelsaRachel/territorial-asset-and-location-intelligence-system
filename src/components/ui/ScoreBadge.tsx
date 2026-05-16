import { scoreColor } from "@/lib/ui/scoreColor";

interface ScoreBadgeProps {
  value: number;
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  capped?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-score",
};

const COLOR_MAP = {
  "verdict-success": "bg-talis-green-700 text-talis-stone-50",
  "verdict-warning": "bg-talis-amber text-talis-stone-900",
  "verdict-danger": "bg-talis-red-700 text-talis-stone-50",
};

export function ScoreBadge({ value, size = "md", label, capped = false, className }: ScoreBadgeProps) {
  const verdict = scoreColor(value);
  const colorClasses = COLOR_MAP[verdict];
  const sizeClasses = SIZE_MAP[size];

  return (
    <div data-testid="score-badge" className={`flex flex-col items-center gap-1 ${className ?? ""}`}>
      <div
        className={`relative flex items-center justify-center rounded-full font-mono font-semibold ${sizeClasses} ${colorClasses}`}
      >
        {value}
        {capped && (
          <span className="absolute -top-1 -right-1 text-[8px] leading-none bg-talis-stone-700 text-talis-stone-50 rounded px-0.5">
            CAP
          </span>
        )}
      </div>
      {label && <span className="font-sans text-xs text-talis-stone-700">{label}</span>}
    </div>
  );
}

export default ScoreBadge;
