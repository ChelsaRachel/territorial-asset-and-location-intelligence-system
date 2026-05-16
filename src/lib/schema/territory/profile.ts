import { z } from "zod";
import type { TerritoryProfile } from "@/lib/types/territory";

const scoreField = z.number().min(0).max(100);
const isoTimestamp = z.string().datetime({ offset: true });
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const LandCompositionCategorySchema = z.enum([
  "sawah",
  "kebun",
  "hutan",
  "permukiman",
  "lahan_terbuka",
  "badan_air",
  "lain",
]);

export const TerritoryProfileSchema = z.object({
  wilayah_id: z.number().int().positive(),
  demografi: z.object({
    luas_km2: z.number().positive(),
    jumlah_penduduk: z.number().int().positive(),
    kepadatan_per_km2: z.number().positive(),
    pdrb_per_kapita_juta: z.number().positive(),
    jumlah_desa_kelurahan: z.number().int().positive(),
    tahun_data: z.number().int().min(2000),
    sumber: z.string().min(1),
    last_synced_at: isoTimestamp,
  }),
  infrastruktur: z.object({
    infrastructure_index: scoreField,
    kategori: z.enum(["Terbatas", "Sedang", "Lengkap"]),
    breakdown: z.object({
      jalan_aspal: scoreField,
      listrik_pln: scoreField,
      air_bersih: scoreField,
      sinyal_4g: scoreField,
    }),
    tahun_data: z.number().int().min(2000),
    last_synced_at: isoTimestamp,
  }),
  komposisi_lahan: z
    .array(
      z.object({
        kategori: LandCompositionCategorySchema,
        label: z.string().min(1),
        luas_ha: z.number().nonnegative(),
        persen: z.number().min(0).max(100),
        sumber: z.string().min(1),
        snapshot_date: isoDate,
      }),
    )
    .min(5)
    .max(6),
  analisis_otomatis: z.object({
    gap_kritis: z.string().min(1),
    prioritas_intervensi: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]),
  }),
  last_updated: isoTimestamp,
});

const _check: TerritoryProfile = {} as z.infer<typeof TerritoryProfileSchema>;
void _check;
