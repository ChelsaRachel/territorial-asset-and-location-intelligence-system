import ndviData from "@/mocks/intelligence/ndvi_monthly.json";
import pdrbData from "@/mocks/intelligence/pdrb_yearly.json";
import iklimData from "@/mocks/intelligence/iklim_anomali.json";
import trenData from "@/mocks/intelligence/tren_summary.json";
import supplyDemandData from "@/mocks/intelligence/supply_demand.json";
import landValueQuarterlyData from "@/mocks/intelligence/land_value_quarterly.json";
import landValueSummaryData from "@/mocks/intelligence/land_value_summary.json";
import growthData from "@/mocks/intelligence/growth_projection.json";
import { loadFixture } from "@/lib/schema/loader";
import {
  NdviMonthlyFixtureSchema,
  PdrbYearlyFixtureSchema,
  IklimAnomaliFixtureSchema,
  TrenSummaryFixtureSchema,
  SupplyDemandFixtureSchema,
  LandValueQuarterlyFixtureSchema,
  LandValueSummaryFixtureSchema,
  GrowthProjectionFixtureSchema,
} from "@/lib/schema/intelligence";
import { ApiError } from "../common/ApiError";

const INTELLIGENCE_ENDPOINT_BASE = "GET /territory/{id}/";

function toFixtureInvalid(endpoint: string, err: unknown): ApiError {
  return new ApiError("FIXTURE_INVALID", endpoint, String(err));
}

function loadAll<T>(rawData: unknown, schema: { array: () => import("zod").ZodType<T[]> }, endpoint: string): T[] {
  try {
    return loadFixture(rawData, schema.array());
  } catch (err) {
    throw toFixtureInvalid(endpoint, err);
  }
}

export function loadNdviMonthly(wilayahId: number) {
  const endpoint = `${INTELLIGENCE_ENDPOINT_BASE}trend (ndvi)`;
  const all = loadAll(ndviData, NdviMonthlyFixtureSchema, endpoint);
  return all.filter((r) => r.wilayah_id === wilayahId).sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month));
}

export function loadPdrbYearly(wilayahId: number) {
  const endpoint = `${INTELLIGENCE_ENDPOINT_BASE}trend (pdrb)`;
  const all = loadAll(pdrbData, PdrbYearlyFixtureSchema, endpoint);
  return all.filter((r) => r.wilayah_id === wilayahId).sort((a, b) => a.year - b.year);
}

export function loadIklimAnomali(wilayahId: number) {
  const endpoint = `${INTELLIGENCE_ENDPOINT_BASE}trend (iklim)`;
  const all = loadAll(iklimData, IklimAnomaliFixtureSchema, endpoint);
  return all.filter((r) => r.wilayah_id === wilayahId).sort((a, b) => a.year - b.year);
}

export function loadTrenSummary(wilayahId: number) {
  const endpoint = `${INTELLIGENCE_ENDPOINT_BASE}trend (summary)`;
  const all = loadAll(trenData, TrenSummaryFixtureSchema, endpoint);
  const record = all.find((r) => r.wilayah_id === wilayahId);
  if (!record) {
    throw new ApiError("NOT_FOUND", endpoint, `No tren_summary fixture for wilayah_id ${wilayahId}`);
  }
  return record;
}

export function loadSupplyDemand(wilayahId: number, sektor?: string) {
  const endpoint = `${INTELLIGENCE_ENDPOINT_BASE}demand`;
  const all = loadAll(supplyDemandData, SupplyDemandFixtureSchema, endpoint);
  const filtered = all.filter((r) => r.wilayah_id === wilayahId);
  if (sektor) {
    return filtered.filter((r) => r.sektor === sektor);
  }
  return filtered;
}

export function loadLandValueQuarterly(wilayahId: number) {
  const endpoint = `${INTELLIGENCE_ENDPOINT_BASE}land-value (quarterly)`;
  const all = loadAll(landValueQuarterlyData, LandValueQuarterlyFixtureSchema, endpoint);
  return all
    .filter((r) => r.wilayah_id === wilayahId)
    .sort((a, b) => a.year * 4 + a.quarter - (b.year * 4 + b.quarter));
}

export function loadLandValueSummary(wilayahId: number) {
  const endpoint = `${INTELLIGENCE_ENDPOINT_BASE}land-value (summary)`;
  const all = loadAll(landValueSummaryData, LandValueSummaryFixtureSchema, endpoint);
  const record = all.find((r) => r.wilayah_id === wilayahId);
  if (!record) {
    throw new ApiError("NOT_FOUND", endpoint, `No land_value_summary fixture for wilayah_id ${wilayahId}`);
  }
  return record;
}

export function loadGrowthProjection(wilayahId: number) {
  const endpoint = `${INTELLIGENCE_ENDPOINT_BASE}growth`;
  const all = loadAll(growthData, GrowthProjectionFixtureSchema, endpoint);
  const record = all.find((r) => r.wilayah_id === wilayahId);
  if (!record) {
    throw new ApiError("NOT_FOUND", endpoint, `No growth_projection fixture for wilayah_id ${wilayahId}`);
  }
  return record;
}
