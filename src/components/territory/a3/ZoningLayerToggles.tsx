import type { MapLayerMetadata } from "@/lib/types/territory";
import { ZONING_LAYER_LABELS } from "./zoningLayerStyles";

interface ZoningLayerTogglesProps {
  layers: MapLayerMetadata[];
  enabledLayerIds: Set<MapLayerMetadata["id"]>;
  onToggle: (layerId: MapLayerMetadata["id"]) => void;
}

export function ZoningLayerToggles({ layers, enabledLayerIds, onToggle }: ZoningLayerTogglesProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-talis-stone-200 bg-white/95 p-2 shadow-sm">
      {layers.map((layer) => (
        <label
          key={layer.id}
          className="flex h-8 items-center gap-2 rounded border border-talis-stone-200 bg-talis-stone-50 px-2 font-sans text-xs text-talis-stone-900"
        >
          <input
            type="checkbox"
            checked={enabledLayerIds.has(layer.id)}
            onChange={() => onToggle(layer.id)}
            className="h-3.5 w-3.5 accent-talis-green-700"
          />
          <span>{ZONING_LAYER_LABELS[layer.id]}</span>
        </label>
      ))}
    </div>
  );
}
