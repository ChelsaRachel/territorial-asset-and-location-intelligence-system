// SPRINT-07 Monitoring & Governance public types
// Mirrors docs/06_MONITORING_GOVERNANCE.md §4.1
// Types are derived from the zod schemas in src/lib/schema/monitoring.ts

import type {
  AlertSeverity,
  AlertStatus,
  AlertTipe,
  PipelineStatus,
  GapConfirmation,
  AttributionConfidence,
} from "./common";

// ─── Rich alert types (SPRINT-07 TASK-001) ────────────────────────────────────

export interface TindakLanjutItem {
  langkah: number;
  aksi: string;
  deadline: string;
}

export interface AlertLokasi {
  deskripsi: string;
  ha: number | null;
  lat: number;
  lng: number;
}

export interface EstimasiDampak {
  pdrb_pct: number | null;
  hilang_pad_rp_per_tahun: number | null;
  keterangan: string;
  dampak_lain: string | null;
}

export interface Alert {
  id: string;
  wilayah_id: number;
  tipe: AlertTipe;
  severity: AlertSeverity;
  status: AlertStatus;
  lokasi: AlertLokasi;
  terdeteksi_at: string;
  detail: string;
  estimasi_dampak: EstimasiDampak;
  tindak_lanjut: TindakLanjutItem[];
  assignee: string | null;
  tim_penanganan: string | null;
  last_refreshed_at: string;
}

// ─── Pipeline types ─────────────────────────────────────────────────────────────

export interface PipelineItem {
  id: string;
  wilayah_id: number;
  nama_investor: string;
  sektor: string;
  nilai_rp_juta: number;
  status: PipelineStatus;
  eta_milestone: string | null;
  sumber: string;
  deskripsi_proyek: string;
  kontak_investor: string;
  reason_if_tertahan: string | null;
  last_update_at: string;
}

export interface StatusDistributionPct {
  operasional: number;
  izin_diterbitkan: number;
  dalam_proses: number;
  tertahan: number;
}

export interface PipelineAggregate {
  wilayah_id: number;
  total_nilai_rp_juta: number;
  jumlah_investor: number;
  sektor_dominan: string;
  gap_confirmation: GapConfirmation;
  analisis_text: string;
  status_distribution_pct: StatusDistributionPct;
  sektor_distribution_pct: Record<string, number>;
  hambatan_utama: string;
  last_refreshed_at: string;
}

export interface PipelineResponse {
  items: PipelineItem[];
  aggregate: PipelineAggregate;
}

// ─── Monthly snapshot ───────────────────────────────────────────────────────────

export interface MonthlySnapshotRow {
  wilayah_id: number;
  snapshot_date: string;
  location_score: number;
  infrastructure_index: number;
  market_access: number;
  harga_lahan_median: number;
  ndvi_score: number;
  demand_score: number;
  growth_score: number;
  zoning_compliance: number;
  skor_potensi_per_sektor: number;
  regulatory_flag: string;
  tren_wilayah_label: string;
}

// ─── Policy log ─────────────────────────────────────────────────────────────────

export interface PolicyAttributionRow {
  indicator_id: string;
  indicator_label: string;
  delta_value: number;
  estimated_attribution_pct: number;
  confidence: AttributionConfidence;
  rationale: string;
}

export interface PolicyLogItem {
  id: string;
  wilayah_id: number;
  policy_date: string;
  title: string;
  deskripsi: string;
  tags: string[];
  created_by: string;
  attribution: PolicyAttributionRow[];
  attribution_status?: "pending_compute_in_12_months";
  status: string;
  sumber_pendanaan: string | null;
  nilai_proyek_rp: number | null;
  last_refreshed_at: string;
}

export interface AddPolicyLogPayload {
  policy_date: string;
  title: string;
  deskripsi: string;
  tags: string[];
  created_by?: string;
  sumber_pendanaan?: string | null;
  nilai_proyek_rp?: number | null;
}

export interface PolicyLogStorage {
  version: 1;
  items: PolicyLogItem[];
}

// ─── Benchmark mapping ──────────────────────────────────────────────────────────

export interface PelajaranKonkret {
  kebijakan_berhasil: string[];
  kesalahan_hindari: string[];
  implikasi_untuk_aktif: string[];
}

export interface BenchmarkReferenceSnapshot {
  year: number;
  location_score: number;
  infrastructure_index: number;
  market_access: number;
  harga_lahan_median: number;
  tren_wilayah_label: string;
}

export interface BenchmarkMapping {
  wilayah_aktif_id: number;
  wilayah_aktif_nama: string;
  wilayah_referensi_id: number;
  wilayah_referensi_nama: string;
  years_offset: number;
  description: string;
  pelajaran_konkret: PelajaranKonkret;
  reference_snapshot: BenchmarkReferenceSnapshot;
  forecast_aktif_n_years: number;
  forecast_aktif_score: number;
  last_refreshed_at: string;
}

// ─── Assign alert payload ─────────────────────────────────────────────────────

export interface AssignAlertPayload {
  team: string;
  assignee: string;
  notes: string;
}

// ─── Legacy aliases kept for adapter backward compat ─────────────────────────

/** @deprecated use Alert */
export type WilayahAlertAktif = Alert;

/** @deprecated use PipelineAggregate */
export type WilayahPipelineAggregate = PipelineAggregate;

/** @deprecated use MonthlySnapshotRow */
export interface WilayahMonthlySnapshot {
  wilayah_id: number;
  snapshot_at: string;
  scores: unknown;
}

/** @deprecated use PolicyLogItem */
export interface PolicyDecisionLog {
  id: string;
  wilayah_id: number;
  tanggal: string;
  judul: string;
  deskripsi: string;
  tag: string[];
  created_by: string;
}

/** @deprecated use PolicyAttributionRow */
export interface PolicyAttribution {
  log_id: string;
  wilayah_id: number;
  indikator: string;
  before_value: number;
  after_value: number;
  delta: number;
  confidence: AttributionConfidence;
  atribusi_text?: string;
}

/** @deprecated use BenchmarkMapping */
export interface WilayahBenchmarkMapping {
  wilayah_id: number;
  benchmark_wilayah_id: number;
  benchmark_nama: string;
  similarity_score: number;
  trajectory_lag_bulan: number;
  pelajaran?: string;
}
