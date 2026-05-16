import { z } from "zod";
import type { TerritoryMarketAccess } from "@/lib/types/territory";

const scoreField = z.number().min(0).max(100);
const isoTimestamp = z.string().datetime({ offset: true });

export const TerritoryMarketAccessSchema = z.object({
  wilayah_id: z.number().int().positive(),
  market_access_score: scoreField,
  score_breakdown: z.object({
    pelabuhan: scoreField,
    bandara: scoreField,
    pasar_induk: scoreField,
    jalan_nasional: scoreField,
    kondisi_jalan: scoreField,
  }),
  bottleneck_utama: z.string().min(1),
  destinations: z
    .array(
      z.object({
        tipe: z.enum([
          "pelabuhan_export",
          "bandara_internasional",
          "pasar_induk",
          "ibukota_provinsi",
          "jalan_nasional",
        ]),
        nama: z.string().min(1),
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        jarak_km: z.number().nonnegative(),
        waktu_menit: z.number().int().nonnegative(),
        kondisi_jalan: z.enum([
          "tol",
          "tol_parsial",
          "aspal_baik",
          "aspal_berbukit",
          "aspal_perkotaan",
          "aspal_kabupaten",
          "aspal_rusak",
          "tanah",
        ]),
        kondisi_jalan_label: z.string().min(1),
        cost_per_ton_rp: z.number().int().nonnegative().nullable(),
        route_geojson_path: z.string().min(1),
      }),
    )
    .length(5),
  route_geojson_path: z.string().min(1),
  last_computed_at: isoTimestamp,
});

const _check: TerritoryMarketAccess = {} as z.infer<typeof TerritoryMarketAccessSchema>;
void _check;
