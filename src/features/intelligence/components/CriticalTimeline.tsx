import type { TimelineKritisItem } from "@/lib/types/intelligence";

interface Props {
  items: TimelineKritisItem[];
}

export function CriticalTimeline({ items }: Props) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 font-sans text-xs uppercase tracking-wide text-talis-stone-700">
        Timeline Kritis
      </p>
      <div
        className="flex gap-3 overflow-x-auto pb-1"
        role="list"
        aria-label="Timeline kritis investasi"
      >
        {items.map((t) => (
          <div
            key={t.quarter}
            role="listitem"
            className="min-w-[180px] rounded-lg border border-talis-stone-200 bg-talis-stone-50 p-3"
          >
            <p className="font-mono text-xs font-semibold text-talis-green-700">{t.quarter}</p>
            <p className="mt-1 font-sans text-xs font-medium text-talis-stone-900">{t.milestone}</p>
            <p className="mt-1 font-sans text-xs text-talis-stone-700">{t.impact}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
