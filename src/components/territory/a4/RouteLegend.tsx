import type { TipeTujuan } from "@/lib/types/common";
import { ROUTE_TYPE_COLORS, ROUTE_TYPE_LABELS } from "./routeStyles";

const ROUTE_ORDER: TipeTujuan[] = [
  "pelabuhan_export",
  "bandara_internasional",
  "pasar_induk",
  "ibukota_provinsi",
  "jalan_nasional",
];

export function RouteLegend() {
  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white/95 p-2 shadow-sm">
      <p className="mb-1 font-sans text-[11px] font-medium text-talis-stone-900">Legenda rute</p>
      <div className="grid gap-1.5">
        {ROUTE_ORDER.map((type) => (
          <div key={type} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-0.5 w-5 rounded-full"
              style={{ backgroundColor: ROUTE_TYPE_COLORS[type] }}
            />
            <span className="font-sans text-[11px] leading-tight text-talis-stone-700">
              {ROUTE_TYPE_LABELS[type]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
