// GET /territory/{id}/trend — docs/03_TERRITORY_INTELLIGENCE.md §5.1
import { delay } from "../common/delay";
import type { TrendResponse } from "@/lib/types/intelligence";
import {
  loadNdviMonthly,
  loadPdrbYearly,
  loadIklimAnomali,
  loadTrenSummary,
} from "./intelligenceFixtures";

export async function getTrend(wilayahId: number): Promise<TrendResponse> {
  await delay(150);

  const ndvi_series = loadNdviMonthly(wilayahId);
  const pdrb_series = loadPdrbYearly(wilayahId);
  const iklim_anomali_series = loadIklimAnomali(wilayahId);
  const tren = loadTrenSummary(wilayahId);

  const normal = tren.skenario_proyeksi.find((s) => s.skenario === "normal");
  const elnino_lemah = tren.skenario_proyeksi.find((s) => s.skenario === "elnino_lemah");
  const elnino_kuat = tren.skenario_proyeksi.find((s) => s.skenario === "elnino_kuat");

  return {
    wilayah_id: wilayahId,
    ndvi_series,
    pdrb_series,
    iklim_anomali_series,
    tren_summary: {
      label: tren.tren_label,
      score: tren.tren_score,
      proyeksi: {
        normal: {
          pct: normal?.proyeksi_growth_pct ?? 0,
          probabilitas: (normal?.probabilitas_pct ?? 0) / 100,
        },
        elnino_lemah: {
          pct: elnino_lemah?.proyeksi_growth_pct ?? 0,
          probabilitas: (elnino_lemah?.probabilitas_pct ?? 0) / 100,
        },
        elnino_kuat: {
          pct: elnino_kuat?.proyeksi_growth_pct ?? 0,
          probabilitas: (elnino_kuat?.probabilitas_pct ?? 0) / 100,
        },
      },
    },
    last_updated: tren.last_refreshed_at,
  };
}
