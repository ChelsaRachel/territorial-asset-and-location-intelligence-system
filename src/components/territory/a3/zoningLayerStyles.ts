import type { MapLayerMetadata, SimpleGeoJsonFeature } from "@/lib/types/territory";

export type ZoningLayerId = MapLayerMetadata["id"];

export const ZONING_LAYER_LABELS: Record<ZoningLayerId, string> = {
  rtrw: "RTRW",
  actual_landcover: "Aktual",
  kawasan_lindung: "Kawasan Lindung",
};

export function getFeatureColor(feature: SimpleGeoJsonFeature): string {
  const color = feature.properties.color;
  return typeof color === "string" ? color : "#40916C";
}
