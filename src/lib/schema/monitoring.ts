// Zod validation schemas for SPRINT-07 monitoring mock fixtures
// Source: docs/06_MONITORING_GOVERNANCE.md §4.1

import { z } from "zod";

const isoTimestamp = z.string().datetime({ offset: true });
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const wilayahId = z.number().int().positive();

// ─── Shared enums ──────────────────────────────────────────────────────────────

export const AlertSeveritySchema = z.enum(["KRITIS", "TINGGI", "SEDANG"]);
export const AlertStatusSchema = z.enum([
  "OPEN",
  "ASSIGNED",
  "INVESTIGATED",
  "RESOLVED",
  "FALSE_POSITIVE",
]);
export const AlertTipeSchema = z.enum([
  "penurunan_produktivitas",
  "kekeringan_parah",
  "potensi_banjir",
  "waspadai_kekeringan",
  "konversi_lahan_ilegal",
]);
export const PipelineStatusSchema = z.enum([
  "operasional",
  "izin_diterbitkan",
  "dalam_proses",
  "tertahan",
]);
export const GapConfirmationSchema = z.enum([
  "terkonfirmasi",
  "koreksi_oversupply",
  "hambatan_non_data",
  "belum_relevan",
]);
export const AttributionConfidenceSchema = z.enum(["tinggi", "sedang", "rendah"]);
export const RegulatoryFlagSchema = z.enum([
  "BEBAS_INVESTASI",
  "KONFLIK_REGULASI",
  "KAWASAN_LINDUNG",
  "MORATORIUM",
]);
export const TrenLabelSchema = z.enum(["Membaik", "Stabil", "Memburuk"]);

// ─── Alert fixture ─────────────────────────────────────────────────────────────

export const TindakLanjutItemSchema = z.object({
  langkah: z.number().int().positive(),
  aksi: z.string().min(1),
  deadline: isoDate,
});

export const AlertLokasiSchema = z.object({
  deskripsi: z.string().min(1),
  ha: z.number().positive().nullable(),
  lat: z.number(),
  lng: z.number(),
});

export const EstimasiDampakSchema = z.object({
  pdrb_pct: z.number().nullable(),
  hilang_pad_rp_per_tahun: z.number().nullable(),
  keterangan: z.string(),
  dampak_lain: z.string().nullable(),
});

export const AlertFixtureSchema = z.object({
  id: z.string().min(1),
  wilayah_id: wilayahId,
  tipe: AlertTipeSchema,
  severity: AlertSeveritySchema,
  status: AlertStatusSchema,
  lokasi: AlertLokasiSchema,
  terdeteksi_at: isoTimestamp,
  detail: z.string().min(1),
  estimasi_dampak: EstimasiDampakSchema,
  tindak_lanjut: z.array(TindakLanjutItemSchema).min(1),
  assignee: z.string().nullable(),
  tim_penanganan: z.string().nullable(),
  last_refreshed_at: isoTimestamp,
});

export const AlertFixtureArraySchema = z.array(AlertFixtureSchema);

// ─── Pipeline fixture ──────────────────────────────────────────────────────────

export const PipelineItemSchema = z.object({
  id: z.string().min(1),
  wilayah_id: wilayahId,
  nama_investor: z.string().min(1),
  sektor: z.string().min(1),
  nilai_rp_juta: z.number().positive(),
  status: PipelineStatusSchema,
  eta_milestone: z.string().nullable(),
  sumber: z.string().min(1),
  deskripsi_proyek: z.string().min(1),
  kontak_investor: z.string().min(1),
  reason_if_tertahan: z.string().nullable(),
  last_update_at: isoTimestamp,
});

export const PipelineFixtureArraySchema = z.array(PipelineItemSchema);

// ─── Pipeline aggregate fixture ────────────────────────────────────────────────

export const StatusDistributionSchema = z.object({
  operasional: z.number().min(0).max(100),
  izin_diterbitkan: z.number().min(0).max(100),
  dalam_proses: z.number().min(0).max(100),
  tertahan: z.number().min(0).max(100),
});

export const SektorDistributionSchema = z.object({
  hospitality: z.number().min(0).max(100),
  properti: z.number().min(0).max(100),
  agribisnis: z.number().min(0).max(100),
  pariwisata: z.number().min(0).max(100),
});

export const PipelineAggregateSchema = z.object({
  wilayah_id: wilayahId,
  total_nilai_rp_juta: z.number().positive(),
  jumlah_investor: z.number().int().positive(),
  sektor_dominan: z.string().min(1),
  gap_confirmation: GapConfirmationSchema,
  analisis_text: z.string().min(1),
  status_distribution_pct: StatusDistributionSchema,
  sektor_distribution_pct: SektorDistributionSchema,
  hambatan_utama: z.string(),
  last_refreshed_at: isoTimestamp,
});

export const PipelineAggregateArraySchema = z.array(PipelineAggregateSchema);

// ─── Monthly snapshot fixture ──────────────────────────────────────────────────

export const MonthlySnapshotRowSchema = z.object({
  wilayah_id: wilayahId,
  snapshot_date: z.string().regex(/^\d{4}-\d{2}-01$/, "Expected YYYY-MM-01"),
  location_score: z.number().int().min(0).max(100),
  infrastructure_index: z.number().int().min(0).max(100),
  market_access: z.number().int().min(0).max(100),
  harga_lahan_median: z.number().positive(),
  ndvi_score: z.number().min(0).max(1),
  demand_score: z.number().int().min(0).max(100),
  growth_score: z.number().int().min(0).max(100),
  zoning_compliance: z.number().int().min(0).max(100),
  skor_potensi_per_sektor: z.number().int().min(0).max(100),
  regulatory_flag: RegulatoryFlagSchema,
  tren_wilayah_label: TrenLabelSchema,
});

export const MonthlySnapshotArraySchema = z.array(MonthlySnapshotRowSchema);

// ─── Policy log fixture ────────────────────────────────────────────────────────

export const PolicyAttributionRowSchema = z.object({
  indicator_id: z.string().min(1),
  indicator_label: z.string().min(1),
  delta_value: z.number(),
  estimated_attribution_pct: z.number().min(0).max(100),
  confidence: AttributionConfidenceSchema,
  rationale: z.string().min(1),
});

export const PolicyLogItemSchema = z.object({
  id: z.string().min(1),
  wilayah_id: wilayahId,
  policy_date: isoDate,
  title: z.string().min(1),
  deskripsi: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  created_by: z.string().min(1),
  attribution: z.array(PolicyAttributionRowSchema),
  attribution_status: z.literal("pending_compute_in_12_months").optional(),
  status: z.string().min(1),
  sumber_pendanaan: z.string().nullable(),
  nilai_proyek_rp: z.number().positive().nullable(),
  last_refreshed_at: isoTimestamp,
});

export const PolicyLogArraySchema = z.array(PolicyLogItemSchema);

// ─── Benchmark mapping fixture ─────────────────────────────────────────────────

export const PelajaranKonkretSchema = z.object({
  kebijakan_berhasil: z
    .array(z.string().max(100))
    .length(3),
  kesalahan_hindari: z
    .array(z.string().max(100))
    .length(2),
  implikasi_untuk_aktif: z
    .array(z.string().max(100))
    .length(3),
});

export const BenchmarkReferenceSnapshotSchema = z.object({
  year: z.number().int(),
  location_score: z.number().int().min(0).max(100),
  infrastructure_index: z.number().int().min(0).max(100),
  market_access: z.number().int().min(0).max(100),
  harga_lahan_median: z.number().positive(),
  tren_wilayah_label: TrenLabelSchema,
});

export const BenchmarkMappingSchema = z.object({
  wilayah_aktif_id: wilayahId,
  wilayah_aktif_nama: z.string().min(1),
  wilayah_referensi_id: wilayahId,
  wilayah_referensi_nama: z.string().min(1),
  years_offset: z.number().int().positive(),
  description: z.string().min(1),
  pelajaran_konkret: PelajaranKonkretSchema,
  reference_snapshot: BenchmarkReferenceSnapshotSchema,
  forecast_aktif_n_years: z.number().int().positive(),
  forecast_aktif_score: z.number().int().min(0).max(100),
  last_refreshed_at: isoTimestamp,
});

export const BenchmarkMappingArraySchema = z.array(BenchmarkMappingSchema);

// ─── Inferred types ────────────────────────────────────────────────────────────

export type AlertFixture = z.infer<typeof AlertFixtureSchema>;
export type PipelineItemFixture = z.infer<typeof PipelineItemSchema>;
export type PipelineAggregateFixture = z.infer<typeof PipelineAggregateSchema>;
export type MonthlySnapshotRow = z.infer<typeof MonthlySnapshotRowSchema>;
export type PolicyLogItemFixture = z.infer<typeof PolicyLogItemSchema>;
export type BenchmarkMappingFixture = z.infer<typeof BenchmarkMappingSchema>;
export type PolicyAttributionRow = z.infer<typeof PolicyAttributionRowSchema>;
export type TindakLanjutItem = z.infer<typeof TindakLanjutItemSchema>;
