import type { QuickScanSnapshot } from "@/lib/types/wilayah";
import { DataTimestamp } from "@/components/ui/DataTimestamp";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/EmptyState";

interface QuickScanVerdictProps {
  /** null when the adapter returned NOT_FOUND (non-sample wilayah partial view) */
  data: QuickScanSnapshot | null;
  timestamp?: string;
}

export function QuickScanVerdict({ data, timestamp }: QuickScanVerdictProps) {
  if (!data) {
    // SPRINT-02 design decision: non-sample wilayah don't have a cached quick_scan_snapshot.
    // SPRINT-08 will reconcile content sources to supply full snapshots for all wilayah.
    return (
      <EmptyState
        title="Data lengkap belum tersedia"
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <ScoreBadge value={data.verdict_score} size="xl" />
        <StatusPill variant="verdict" value={data.verdict_status} />
      </div>
      {timestamp && <DataTimestamp timestamp={timestamp} />}

      <p className="font-sans text-sm text-talis-stone-900 line-clamp-2">
        {data.verdict_reason}
      </p>

      {data.verdict_kondisi.length > 0 && (
        <ol className="list-decimal list-outside ml-4 space-y-1.5">
          {data.verdict_kondisi.map((kondisi, i) => (
            <li key={i} className="font-sans text-sm text-talis-stone-700 leading-snug">
              {kondisi}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default QuickScanVerdict;
