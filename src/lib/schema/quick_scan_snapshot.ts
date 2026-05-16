// Validates src/mocks/quick_scan_snapshot.json — mirrors docs/01_COMMAND_CENTER.md §5.1
import { z } from "zod";
import type { QuickScanSnapshot } from "@/lib/types/wilayah";

export const QuickScanSnapshotSchema = z.object({
  wilayah_id: z.number().int().positive(),
  profil_kode: z.enum(["AGRO_DOMINANT", "HOSPITALITY_DOMINANT", "AGRO_HOSP"]),
  // Location identity fields joined from dim_wilayah + wilayah_profil_sample
  nama: z.string().min(1),
  kabupaten: z.string().min(1),
  provinsi: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  karakter_singkat: z.string().min(1),
  elevasi_meter: z.number().int().nonnegative(),
  regulatory_flag: z.enum(["BEBAS_INVESTASI", "KONFLIK_REGULASI", "KAWASAN_LINDUNG", "MORATORIUM"]),
  marker_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  active_sektor: z.enum(["agribisnis", "hospitality", "pariwisata", "properti"]).optional(),
  data_source: z.enum(["live_composed", "snapshot_fallback"]).optional(),
  verdict_status: z.enum(["LAYAK", "LAYAK_BERSYARAT", "TIDAK_LAYAK"]),
  verdict_score: z.number().min(0).max(100),
  verdict_reason: z.string().min(1),
  verdict_kondisi: z.array(z.string()),
  peluang_top3: z.array(
    z.object({
      sektor: z.string().min(1),
      urgensi: z.enum(["SEGERA", "TERBUKA", "JANGKA_PANJANG"]),
      detail: z.string().min(1),
    })
  ),
  sinyal_kunci: z.array(
    z.object({
      label: z.string().min(1),
      value: z.number().min(0).max(100),
      color: z.enum(["green", "amber", "red"]),
    })
  ),
  harga_window: z.object({
    median_rp_per_m2: z.number().int().positive(),
    apresiasi_persen_per_tahun: z.number().nonnegative(),
    sisa_window_bulan: z.number().int().nonnegative(),
    window_reason: z.string().optional(),
  }),
  last_updated: z.string().datetime({ offset: true }),
});

const _check: QuickScanSnapshot = {} as z.infer<typeof QuickScanSnapshotSchema>;
void _check;
