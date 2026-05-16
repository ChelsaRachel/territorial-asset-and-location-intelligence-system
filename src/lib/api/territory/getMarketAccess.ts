// GET /territory/{id}/market-access — docs/02_TERRITORY_PROFILE.md §5.1
import type {
  GetMarketAccessOptions,
  MarketAccessDestinationWithRoute,
  TerritoryMarketAccess,
} from "@/lib/types/territory";
import { delay } from "../common/delay";
import {
  findTerritoryRecord,
  getWilayahCoordinate,
  loadTerritoryMarketAccess,
  TERRITORY_ENDPOINTS,
} from "./territoryFixtures";

function attachRoutes(record: TerritoryMarketAccess): TerritoryMarketAccess {
  const source = getWilayahCoordinate(record.wilayah_id, TERRITORY_ENDPOINTS.marketAccess);

  const destinations: MarketAccessDestinationWithRoute[] = record.destinations.map((destination) => ({
    ...destination,
    rute_geojson: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            tipe: destination.tipe,
            nama: destination.nama,
            jarak_km: destination.jarak_km,
            waktu_menit: destination.waktu_menit,
            static_geojson_path: destination.route_geojson_path,
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [source.lng, source.lat],
              [destination.lng, destination.lat],
            ],
          },
        },
      ],
    },
  }));

  return { ...record, destinations };
}

export async function getMarketAccess(
  wilayahId: number,
  options?: GetMarketAccessOptions,
): Promise<TerritoryMarketAccess> {
  await delay(240);
  const records = loadTerritoryMarketAccess(TERRITORY_ENDPOINTS.marketAccess);
  const record = findTerritoryRecord(records, wilayahId, TERRITORY_ENDPOINTS.marketAccess);

  return options?.includeRoutes ? attachRoutes(record) : record;
}
