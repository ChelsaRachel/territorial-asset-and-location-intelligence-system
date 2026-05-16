import { formatCostPerTon, formatMinutes } from "@/lib/format/territory";
import type { MarketAccessDestinationWithRoute } from "@/lib/types/territory";
import { ROUTE_TYPE_LABELS } from "./routeStyles";

interface RouteDestinationPopupProps {
  destination: MarketAccessDestinationWithRoute;
}

export function RouteDestinationPopup({ destination }: RouteDestinationPopupProps) {
  return (
    <div className="font-sans" style={{ minWidth: 180, maxWidth: 240 }}>
      <p className="font-display text-sm font-semibold text-talis-stone-900">
        {destination.nama}
      </p>
      <p className="mt-1 text-xs text-talis-stone-700">{ROUTE_TYPE_LABELS[destination.tipe]}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[11px] uppercase text-talis-stone-700">Jarak</p>
          <p className="font-mono text-xs font-semibold text-talis-stone-900">
            {destination.jarak_km} km
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase text-talis-stone-700">Waktu</p>
          <p className="font-mono text-xs font-semibold text-talis-stone-900">
            {formatMinutes(destination.waktu_menit)}
          </p>
        </div>
      </div>
      <p className="mt-2 text-xs text-talis-stone-700">{destination.kondisi_jalan_label}</p>
      <p className="mt-1 font-mono text-xs text-talis-stone-900">
        {formatCostPerTon(destination.cost_per_ton_rp)}
      </p>
    </div>
  );
}
