import { scoreColor } from "@/lib/ui/scoreColor";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

const FILL_MAP = {
  "verdict-success": "bg-talis-green-700",
  "verdict-warning": "bg-talis-amber",
  "verdict-danger": "bg-talis-red-700",
};

export function ProgressBar({ value, max = 100, label, showValue = false, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const verdict = scoreColor(value);
  const fillClass = FILL_MAP[verdict];

  return (
    <div data-testid="progress-bar" className={`space-y-1 ${className ?? ""}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="font-sans text-xs text-talis-stone-700">{label}</span>}
          {showValue && (
            <span className="font-mono text-xs text-talis-stone-900">{value}</span>
          )}
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-talis-stone-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${fillClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
