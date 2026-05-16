import type { QuickScanSnapshot } from "@/lib/types/wilayah";
import { DataTimestamp } from "@/components/ui/DataTimestamp";
import { StatusPill } from "@/components/ui/StatusPill";
import { TooltipWrapper } from "@/components/ui/TooltipWrapper";
import { formatCoordinate } from "./quickScanHelpers";

interface QuickScanIdentitasProps {
  data: QuickScanSnapshot;
  timestamp?: string;
}

export function QuickScanIdentitas({ data, timestamp }: QuickScanIdentitasProps) {
  const { nama, kabupaten, provinsi, lat, lng, karakter_singkat, elevasi_meter, regulatory_flag } =
    data;

  // Truncate long karakter_singkat strings for the badge; show full text in tooltip
  const karakterDisplay =
    karakter_singkat.length > 30 ? `${karakter_singkat.slice(0, 27)}…` : karakter_singkat;

  return (
    <div className="space-y-2">
      <div>
        <h2 className="font-display text-[18px] leading-[1.2] text-talis-stone-900">{nama}</h2>
        <p className="mt-0.5 font-sans text-sm text-talis-stone-700">
          {kabupaten} · {provinsi}
        </p>
        <p className="mt-0.5 font-mono text-xs text-talis-stone-700">
          {formatCoordinate(lat, lng)}
        </p>
        {timestamp && <DataTimestamp timestamp={timestamp} className="mt-1 block" />}
      </div>

      <div className="flex flex-wrap gap-1.5 items-center">
        {/* Profil character badge */}
        <TooltipWrapper content={karakter_singkat} side="bottom">
          <span className="inline-flex items-center rounded-full border border-talis-stone-700/20 bg-talis-stone-200 px-2.5 py-0.5 font-sans text-xs font-medium text-talis-stone-700">
            {karakterDisplay}
          </span>
        </TooltipWrapper>

        {/* Regulatory status badge */}
        <TooltipWrapper
          content={REGULATORY_TOOLTIP[regulatory_flag] ?? regulatory_flag}
          side="bottom"
        >
          <StatusPill variant="regulatory" value={regulatory_flag} />
        </TooltipWrapper>

        {/* Elevasi badge */}
        <TooltipWrapper content={`Elevasi ${elevasi_meter} meter di atas permukaan laut`} side="bottom">
          <span className="inline-flex items-center gap-1 rounded-full border border-talis-stone-700/20 bg-talis-stone-200 px-2.5 py-0.5 font-sans text-xs font-medium text-talis-stone-700">
            ▲ {elevasi_meter} mdpl
          </span>
        </TooltipWrapper>
      </div>
    </div>
  );
}

const REGULATORY_TOOLTIP: Record<string, string> = {
  BEBAS_INVESTASI: "Tidak ada restriksi regulasi aktif untuk investasi di wilayah ini",
  KONFLIK_REGULASI: "Terdapat konflik regulasi yang perlu diverifikasi sebelum komitmen",
  KAWASAN_LINDUNG: "Wilayah termasuk kawasan lindung — perlu izin khusus",
  MORATORIUM: "Moratorium investasi aktif di wilayah ini",
};

export default QuickScanIdentitas;
