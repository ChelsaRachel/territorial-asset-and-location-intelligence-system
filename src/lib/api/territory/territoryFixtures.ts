import dimWilayahData from "@/mocks/dim_wilayah.json";
import profileData from "@/mocks/territory/profile.json";
import zoningData from "@/mocks/territory/zoning.json";
import marketAccessData from "@/mocks/territory/market_access.json";
import type { ZodType } from "zod";
import { DimWilayahSchema } from "@/lib/schema/dim_wilayah";
import { loadFixture } from "@/lib/schema/loader";
import { TerritoryProfileSchema } from "@/lib/schema/territory/profile";
import { TerritoryZoningSchema } from "@/lib/schema/territory/zoning";
import { TerritoryMarketAccessSchema } from "@/lib/schema/territory/marketAccess";
import type {
  TerritoryMarketAccess,
  TerritoryProfile,
  TerritoryZoning,
} from "@/lib/types/territory";
import { ApiError } from "../common/ApiError";

type TerritoryRecord = { wilayah_id: number };

export const TERRITORY_ENDPOINTS = {
  profile: "GET /territory/{id}/profile",
  zoning: "GET /territory/{id}/zoning",
  marketAccess: "GET /territory/{id}/market-access",
  mapLayers: "GET /territory/{id}/map-layers",
} as const;

function toFixtureInvalid(endpoint: string, err: unknown): ApiError {
  return new ApiError("FIXTURE_INVALID", endpoint, String(err));
}

function loadDimWilayahIds(endpoint: string): Set<number> {
  try {
    const wilayahs = loadFixture(dimWilayahData, DimWilayahSchema.array());
    return new Set(wilayahs.map((w) => w.wilayah_id));
  } catch (err) {
    throw toFixtureInvalid(endpoint, err);
  }
}

function assertWilayahReferences(records: TerritoryRecord[], endpoint: string, fixtureName: string): void {
  const knownWilayahIds = loadDimWilayahIds(endpoint);
  const missing = records.find((record) => !knownWilayahIds.has(record.wilayah_id));
  if (missing) {
    throw toFixtureInvalid(
      endpoint,
      `${fixtureName} references unknown wilayah_id ${missing.wilayah_id}`,
    );
  }
}

function loadTerritoryFixture<T extends TerritoryRecord>(
  rawData: unknown,
  schema: { array: () => ZodType<T[]> },
  endpoint: string,
  fixtureName: string,
): T[] {
  try {
    const records = loadFixture(rawData, schema.array());
    assertWilayahReferences(records, endpoint, fixtureName);
    return records;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw toFixtureInvalid(endpoint, err);
  }
}

export function loadTerritoryProfiles(endpoint: string = TERRITORY_ENDPOINTS.profile): TerritoryProfile[] {
  return loadTerritoryFixture(profileData, TerritoryProfileSchema, endpoint, "profile.json");
}

export function loadTerritoryZoning(endpoint: string = TERRITORY_ENDPOINTS.zoning): TerritoryZoning[] {
  return loadTerritoryFixture(zoningData, TerritoryZoningSchema, endpoint, "zoning.json");
}

export function loadTerritoryMarketAccess(
  endpoint: string = TERRITORY_ENDPOINTS.marketAccess,
): TerritoryMarketAccess[] {
  return loadTerritoryFixture(
    marketAccessData,
    TerritoryMarketAccessSchema,
    endpoint,
    "market_access.json",
  );
}

export function findTerritoryRecord<T extends TerritoryRecord>(
  records: T[],
  wilayahId: number,
  endpoint: string,
): T {
  const record = records.find((item) => item.wilayah_id === wilayahId);
  if (!record) {
    throw new ApiError("NOT_FOUND", endpoint, `No territory fixture found for wilayah_id ${wilayahId}`);
  }

  return record;
}

export function getWilayahCoordinate(
  wilayahId: number,
  endpoint = TERRITORY_ENDPOINTS.marketAccess,
): { lat: number; lng: number } {
  try {
    const wilayahs = loadFixture(dimWilayahData, DimWilayahSchema.array());
    const wilayah = wilayahs.find((item) => item.wilayah_id === wilayahId);
    if (!wilayah) {
      throw new Error(`Unknown wilayah_id ${wilayahId}`);
    }

    return { lat: wilayah.lat, lng: wilayah.lng };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw toFixtureInvalid(endpoint, err);
  }
}
