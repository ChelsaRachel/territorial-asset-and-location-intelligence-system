import type { PeluangItem } from "@/lib/types/wilayah";
import { DataTimestamp } from "@/components/ui/DataTimestamp";
import { StatusPill } from "@/components/ui/StatusPill";

interface QuickScanPeluangProps {
  items?: PeluangItem[];
  timestamp?: string;
}

export function QuickScanPeluang({ items, timestamp }: QuickScanPeluangProps) {
  if (!items?.length) {
    return <PartialNotice />;
  }

  return (
    <section aria-labelledby="quick-scan-peluang" className="space-y-3">
      <h3
        id="quick-scan-peluang"
        className="font-sans text-xs font-semibold uppercase text-talis-stone-700"
      >
        Peluang Konkret
      </h3>
      {timestamp && <DataTimestamp timestamp={timestamp} />}

      <ol className="space-y-2.5">
        {items.slice(0, 3).map((item, index) => (
          <li
            key={`${item.sektor}-${index}`}
            className="grid grid-cols-[24px_1fr] gap-2 rounded-md border border-talis-stone-200 bg-white p-3"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-talis-green-700 font-mono text-xs font-semibold text-white">
              {index + 1}
            </span>
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 font-sans text-sm font-semibold leading-snug text-talis-stone-900">
                  {item.sektor}
                </p>
                <StatusPill variant="urgency" value={item.urgensi} className="shrink-0" />
              </div>
              <p className="font-sans text-xs leading-snug text-talis-stone-700">
                {item.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function PartialNotice() {
  return (
    <p className="rounded-md border border-talis-stone-200 bg-white p-3 font-sans text-xs text-talis-stone-700">
      Data lengkap belum tersedia.
    </p>
  );
}

export default QuickScanPeluang;
