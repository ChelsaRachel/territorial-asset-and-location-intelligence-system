import type { SinyalKunciItem } from "@/lib/types/wilayah";
import { DataTimestamp } from "@/components/ui/DataTimestamp";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TooltipWrapper } from "@/components/ui/TooltipWrapper";

interface QuickScanSinyalProps {
  items?: SinyalKunciItem[];
  timestamp?: string;
}

const SIGNAL_TOOLTIP: Record<string, string> = {
  "Land Suitability": "Kesesuaian biofisik dan pemanfaatan lahan terhadap profil investasi.",
  "Land Suitability Hosp": "Kesesuaian lahan untuk hospitality, akses layanan, dan daya dukung tapak.",
  "Market Access": "Kedekatan ke pasar, simpul logistik, dan kanal distribusi/offtaker.",
  "Demand Absorpsi": "Kemampuan pasar menyerap produk atau kunjungan baru.",
  "Growth Projection": "Proyeksi kenaikan permintaan, harga, dan aktivitas ekonomi.",
  "Infrastructure Index": "Kelengkapan akses jalan, utilitas, dan fasilitas pendukung.",
};

export function QuickScanSinyal({ items, timestamp }: QuickScanSinyalProps) {
  if (!items?.length) {
    return <PartialNotice />;
  }

  return (
    <section aria-labelledby="quick-scan-sinyal" className="space-y-3">
      <h3
        id="quick-scan-sinyal"
        className="font-sans text-xs font-semibold uppercase text-talis-stone-700"
      >
        Sinyal Kunci
      </h3>
      {timestamp && <DataTimestamp timestamp={timestamp} />}

      <div className="space-y-3 rounded-md border border-talis-stone-200 bg-white p-3">
        {items.slice(0, 4).map((item) => {
          const tooltip = SIGNAL_TOOLTIP[item.label];
          const label = tooltip ? (
            <TooltipWrapper content={tooltip} side="left">
              <span className="cursor-help underline decoration-dotted underline-offset-2">
                {item.label}
              </span>
            </TooltipWrapper>
          ) : (
            item.label
          );

          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 font-sans text-xs text-talis-stone-700">
                  {label}
                </span>
                <span className="shrink-0 font-mono text-xs text-talis-stone-900">
                  {item.value}
                </span>
              </div>
              <ProgressBar value={item.value} />
              <p className="font-sans text-xs leading-snug text-talis-stone-700">
                {signalExplanation(item)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function signalExplanation(item: SinyalKunciItem): string {
  if (item.value >= 70) {
    return "Sinyal kuat dan mendukung investigasi lanjutan.";
  }
  if (item.value >= 40) {
    return "Sinyal menengah; perlu validasi operasional sebelum komitmen.";
  }
  return "Sinyal lemah; perlu mitigasi besar sebelum masuk shortlist.";
}

function PartialNotice() {
  return (
    <p className="rounded-md border border-talis-stone-200 bg-white p-3 font-sans text-xs text-talis-stone-700">
      Data lengkap belum tersedia.
    </p>
  );
}

export default QuickScanSinyal;
