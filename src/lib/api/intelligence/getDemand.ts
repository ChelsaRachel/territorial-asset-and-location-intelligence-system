// GET /territory/{id}/demand — docs/03_TERRITORY_INTELLIGENCE.md §5.1
import { delay } from "../common/delay";
import type { DemandResponse, DemandItem } from "@/lib/types/intelligence";
import { loadSupplyDemand } from "./intelligenceFixtures";

export async function getDemand(wilayahId: number, sektor?: string): Promise<DemandResponse> {
  await delay(100);

  const records = loadSupplyDemand(wilayahId, sektor);

  if (records.length === 0) {
    return {
      wilayah_id: wilayahId,
      sektor_aktif: sektor ?? "agro",
      items: [],
      peluang_top3: [],
      komoditas_hindari: [],
      demand_absorption_score: 0,
      last_updated: new Date().toISOString(),
    };
  }

  const record = records[0]!;
  const items: DemandItem[] = record.items;

  const peluang = items
    .filter((i) => i.gap > 0)
    .sort((a, b) => b.gap * b.harga_rp_per_unit - a.gap * a.harga_rp_per_unit)
    .slice(0, 3);

  const komoditas_hindari = items.filter((i) => i.status === "oversupply");

  return {
    wilayah_id: wilayahId,
    sektor_aktif: record.sektor,
    items,
    peluang_top3: peluang,
    komoditas_hindari,
    demand_absorption_score: record.demand_absorption_score,
    last_updated: record.last_updated,
  };
}
