// GET /territory/{id}/map-layers — docs/02_TERRITORY_PROFILE.md §5.1
import { zoningFeatureCollectionsByWilayah } from "@/mocks/maps/zoning/featureCollections";
import type { TerritoryMapLayers } from "@/lib/types/territory";
import { ApiError } from "../common/ApiError";
import { delay } from "../common/delay";
import {
  findTerritoryRecord,
  loadTerritoryZoning,
  TERRITORY_ENDPOINTS,
} from "./territoryFixtures";

export async function getMapLayers(wilayahId: number): Promise<TerritoryMapLayers> {
  await delay(160);
  const records = loadTerritoryZoning(TERRITORY_ENDPOINTS.mapLayers);
  const zoning = findTerritoryRecord(records, wilayahId, TERRITORY_ENDPOINTS.mapLayers);
  const featureCollection = zoningFeatureCollectionsByWilayah[wilayahId];

  if (!featureCollection) {
    throw new ApiError(
      "FIXTURE_INVALID",
      TERRITORY_ENDPOINTS.mapLayers,
      `Missing zoning FeatureCollection for wilayah_id ${wilayahId}`,
    );
  }

  return {
    wilayah_id: zoning.wilayah_id,
    layers: zoning.map_layers,
    feature_collection: featureCollection,
    geojson_overlay_path: zoning.geojson_overlay_path,
    last_computed_at: zoning.last_computed_at,
  };
}
