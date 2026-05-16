import { AlertTriangle } from "lucide-react";
import type { TerritoryMarketAccess } from "@/lib/types/territory";

interface BottleneckAnalysisCardProps {
  data: TerritoryMarketAccess;
}

export function BottleneckAnalysisCard({ data }: BottleneckAnalysisCardProps) {
  return (
    <div
      className="rounded-lg border border-talis-stone-200 bg-white p-4"
      data-testid="bottleneck-analysis-card"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-talis-earth-700" aria-hidden="true" />
        <h3 className="font-sans text-sm font-semibold text-talis-stone-900">
          Bottleneck Analysis
        </h3>
      </div>

      <p className="mt-3 max-w-prose font-sans text-sm leading-6 text-talis-stone-700">
        {data.bottleneck_utama}
      </p>

      <div className="mt-4 rounded-lg border border-talis-stone-200 bg-talis-stone-50 px-3 py-2.5">
        <p className="font-sans text-[11px] uppercase tracking-wide text-talis-stone-700">
          Rekomendasi umum
        </p>
        <ul className="mt-2 space-y-1 font-sans text-xs leading-5 text-talis-stone-700">
          <li>• Survei koridor akses sebelum komitmen tapak untuk memvalidasi kondisi jalan aktual.</li>
          <li>
            • Hitung buffer waktu logistik minimal 20–30% di atas estimasi fixture untuk musim hujan.
          </li>
          <li>
            • Pertimbangkan gudang/cold storage antara di ibukota kabupaten untuk menekan biaya
            angkutan per ton.
          </li>
        </ul>
      </div>
    </div>
  );
}
