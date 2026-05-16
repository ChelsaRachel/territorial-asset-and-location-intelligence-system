import type { MapLayerMetadata } from "@/lib/types/territory";

interface ZoningLegendProps {
  layers: MapLayerMetadata[];
  enabledLayerIds: Set<MapLayerMetadata["id"]>;
}

export function ZoningLegend({ layers, enabledLayerIds }: ZoningLegendProps) {
  const items = layers
    .filter((layer) => enabledLayerIds.has(layer.id))
    .flatMap((layer) =>
      layer.legend.map((item) => ({
        ...item,
        layerId: layer.id,
      })),
    );

  if (items.length === 0) return null;

  return (
    <div className="rounded-lg border border-talis-stone-200 bg-white/95 p-2 shadow-sm">
      <p className="mb-1 font-sans text-[11px] font-medium text-talis-stone-900">Legenda</p>
      <div className="grid gap-1.5">
        {items.map((item) => (
          <div key={`${item.layerId}-${item.value}`} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-sans text-[11px] leading-tight text-talis-stone-700">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
