import { z } from "zod";

const isoTimestamp = z.string().datetime({ offset: true });
const scoreField = z.number().min(0).max(100);

// --- Fixture schemas (what lives in JSON files) ---

export const NdviMonthlyFixtureSchema = z.object({
  wilayah_id: z.number().int().positive(),
  year: z.number().int().min(2010).max(2035),
  month: z.number().int().min(1).max(12),
  ndvi_value: z.number().min(0).max(1),
  baseline_5yr: z.number().min(0).max(1),
  delta_from_baseline: z.number(),
});

export const PdrbYearlyFixtureSchema = z.object({
  wilayah_id: z.number().int().positive(),
  year: z.number().int().min(2015).max(2030),
  pdrb_total_triliyun: z.number().positive(),
  yoy_growth_pct: z.number(),
  sektor_breakdown: z.record(z.string(), z.number()),
});

export const IklimAnomaliFixtureSchema = z.object({
  wilayah_id: z.number().int().positive(),
  year: z.number().int().min(2010).max(2030),
  spi_annual: z.number(),
  curah_hujan_deviasi_pct: z.number(),
  el_nino_flag: z.boolean(),
  kategori: z.enum(["normal", "kering_lemah", "kering_parah", "basah_lemah", "basah_parah"]),
});

export const SkenarioProyeksiSchema = z.object({
  skenario: z.enum(["normal", "elnino_lemah", "elnino_kuat"]),
  proyeksi_growth_pct: z.number(),
  probabilitas_pct: z.number().min(0).max(100),
  saran: z.string().optional(),
});

export const TrenSummaryFixtureSchema = z.object({
  wilayah_id: z.number().int().positive(),
  tren_label: z.enum(["Membaik", "Stabil", "Memburuk"]),
  tren_score: scoreField,
  skenario_proyeksi: z
    .array(SkenarioProyeksiSchema)
    .length(3)
    .refine(
      (items) => {
        const total = items.reduce((sum, s) => sum + s.probabilitas_pct, 0);
        return Math.abs(total - 100) < 1;
      },
      { message: "Skenario probabilitas_pct must sum to 100" },
    ),
  last_refreshed_at: isoTimestamp,
});

const DemandItemFixtureSchema = z.object({
  komoditas: z.string().min(1),
  supply_per_bulan: z.number().nonnegative(),
  demand_per_bulan: z.number().nonnegative(),
  gap: z.number(),
  harga_rp_per_unit: z.number().positive(),
  unit: z.string().min(1),
  status: z.enum(["peluang_besar", "peluang_tinggi", "mendekati_jenuh", "oversupply"]),
  sumber: z.array(z.string().min(1)).min(1),
});

export const SupplyDemandFixtureSchema = z.object({
  wilayah_id: z.number().int().positive(),
  sektor: z.enum(["agro", "hospitality", "pariwisata", "properti"]),
  demand_absorption_score: scoreField,
  last_updated: isoTimestamp,
  items: z.array(DemandItemFixtureSchema),
});

export const LandValueQuarterlyFixtureSchema = z.object({
  wilayah_id: z.number().int().positive(),
  year: z.number().int().min(2020).max(2030),
  quarter: z.number().int().min(1).max(4),
  median_rp_per_m2: z.number().positive(),
  listing_count: z.number().int().nonnegative(),
  njop_rp_per_m2: z.number().positive().optional(),
});

const HargaVsNjopRowSchema = z.object({
  kelurahan: z.string().min(1),
  njop_rp_per_m2: z.number().positive(),
  pasar_rp_per_m2: z.number().positive(),
  selisih_pct: z.number().nonnegative(),
});

const ProyeksiHorizonSchema = z.object({
  konservatif: z.tuple([z.number().positive(), z.number().positive()]),
  optimistis: z.tuple([z.number().positive(), z.number().positive()]),
});

export const LandValueSummaryFixtureSchema = z.object({
  wilayah_id: z.number().int().positive(),
  median_rp_per_m2: z.number().positive(),
  appreciation_yoy_pct: z.number(),
  speculation_ratio: z.number().nonnegative(),
  speculation_status: z.enum(["sehat", "waspada", "spekulatif"]),
  harga_vs_njop: z.array(HargaVsNjopRowSchema).min(1),
  proyeksi: z.object({
    "6_bulan": ProyeksiHorizonSchema,
    "12_bulan": ProyeksiHorizonSchema,
    "36_bulan": ProyeksiHorizonSchema,
  }),
  timing_recommendation: z.string().min(1),
  last_updated: isoTimestamp,
});

const GrowthBreakdownComponentSchema = z.object({
  score: scoreField,
  weight: z.number().min(0).max(1),
});

const PipelineDetailSchema = z.object({
  proyek: z.string().min(1),
  nilai_rp_t: z.number().nonnegative(),
  eta_quarter: z.string().regex(/^\d{4}-Q[1-4]$/),
  status: z.string().min(1),
  dampak: z.string().min(1),
});

const EmergingSignalSchema = z.object({
  tiktok_geotag_growth_pct_vs_2yr: z.number(),
  instagram_post_growth_pct: z.number(),
  google_trends_search_growth_pct: z.number(),
  airbnb_wish_list_growth_pct: z.number().optional(),
});

const TimelineKritisItemSchema = z.object({
  quarter: z.string().regex(/^\d{4}-Q[1-4]$/),
  milestone: z.string().min(1),
  impact: z.string().min(1),
});

export const GrowthProjectionFixtureSchema = z.object({
  wilayah_id: z.number().int().positive(),
  growth_projection_score: scoreField,
  breakdown: z.object({
    pipeline_infra: GrowthBreakdownComponentSchema,
    emerging_destination: GrowthBreakdownComponentSchema,
    cagr_penduduk: GrowthBreakdownComponentSchema,
  }),
  pipeline_infra_detail: z.array(PipelineDetailSchema).min(1),
  emerging_signal_detail: EmergingSignalSchema,
  cagr_penduduk_pct: z.number().nonnegative(),
  sinyal_pendukung: z.array(z.string().min(1)).min(1),
  timeline_kritis: z.array(TimelineKritisItemSchema).min(1),
  cost_of_delay_per_bulan_rp: z.number().positive(),
  last_computed_at: isoTimestamp,
});
