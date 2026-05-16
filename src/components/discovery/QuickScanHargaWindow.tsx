import type { HargaWindow } from "@/lib/types/wilayah";
import { DataTimestamp } from "@/components/ui/DataTimestamp";
import { KpiCard } from "@/components/ui/KpiCard";
import {
  formatRupiahPerM2,
  formatSignedPercentPerYear,
  formatWindowMonths,
} from "./quickScanFormat";

interface QuickScanHargaWindowProps {
  data?: HargaWindow;
  timestamp?: string;
}

export function QuickScanHargaWindow({ data, timestamp }: QuickScanHargaWindowProps) {
  if (!data) {
    return <PartialNotice />;
  }

  return (
    <section aria-labelledby="quick-scan-harga" className="space-y-3">
      <h3
        id="quick-scan-harga"
        className="font-sans text-xs font-semibold uppercase text-talis-stone-700"
      >
        Harga &amp; Window
      </h3>
      {timestamp && <DataTimestamp timestamp={timestamp} />}

      <div className="grid grid-cols-1 gap-2">
        <KpiCard
          label="Median Harga Lahan"
          value={formatRupiahPerM2(data.median_rp_per_m2)}
          unit="/m2"
          size="compact"
          className="p-3"
        />
        <div className="grid grid-cols-2 gap-2">
          <KpiCard
            label="Apresiasi"
            value={formatSignedPercentPerYear(data.apresiasi_persen_per_tahun)}
            unit="/thn"
            tone="positive"
            size="compact-sm"
            className="p-3"
          />
          <KpiCard
            label="Sisa Window"
            value={formatWindowMonths(data.sisa_window_bulan)}
            tone={data.sisa_window_bulan <= 18 ? "positive" : "default"}
            size="compact-sm"
            className="p-3"
          />
        </div>
      </div>

      {data.window_reason && (
        <p className="font-sans text-xs leading-snug text-talis-stone-700">
          {data.window_reason}
        </p>
      )}
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

export default QuickScanHargaWindow;
