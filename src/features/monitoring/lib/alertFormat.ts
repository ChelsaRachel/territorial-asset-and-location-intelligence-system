// SPRINT-07 TASK-005 — Alert formatting helpers
import type { AlertSeverity, AlertStatus, AlertTipe } from "@/lib/types/common";

// ─── Severity ────────────────────────────────────────────────────────────────

export const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  KRITIS: "#dc2626",
  TINGGI: "#d97706",
  SEDANG: "#40916C",
};

export const SEVERITY_BORDER: Record<AlertSeverity, string> = {
  KRITIS: "border border-red-200 border-l-4 border-l-red-500",
  TINGGI: "border border-amber-200 border-l-4 border-l-amber-500",
  SEDANG: "border border-talis-green-700 border-l-4 border-l-talis-green-700",
};

export const SEVERITY_LABEL: Record<AlertSeverity, string> = {
  KRITIS: "Kritis",
  TINGGI: "Tinggi",
  SEDANG: "Sedang",
};

// Pill-style severity badges for the header row
export const SEVERITY_PILL: Record<AlertSeverity, { label: string; className: string }> = {
  KRITIS: {
    label: "KRITIS",
    className: "bg-red-50 text-red-700 border border-red-300 font-bold",
  },
  TINGGI: {
    label: "TINGGI",
    className: "bg-amber-100 text-amber-800 border border-amber-400 font-bold",
  },
  SEDANG: {
    label: "SEDANG",
    className: "bg-green-50 text-green-700 border border-green-300 font-bold",
  },
};

// ─── Status ──────────────────────────────────────────────────────────────────

export const STATUS_PILL: Record<AlertStatus, { label: string; className: string }> = {
  OPEN: { label: "Terbuka", className: "bg-talis-stone-100 text-talis-stone-700" },
  ASSIGNED: { label: "Ditugaskan", className: "bg-blue-100 text-blue-700" },
  INVESTIGATED: { label: "Diselidiki", className: "bg-amber-100 text-amber-700" },
  RESOLVED: { label: "Diselesaikan", className: "bg-green-100 text-green-700" },
  FALSE_POSITIVE: { label: "Salah Deteksi", className: "bg-talis-stone-100 text-talis-stone-400" },
};

// ─── Tipe ────────────────────────────────────────────────────────────────────

export const TIPE_LABEL: Record<AlertTipe, string> = {
  penurunan_produktivitas: "Penurunan Produktivitas",
  kekeringan_parah: "Kekeringan Parah",
  potensi_banjir: "Potensi Banjir",
  waspadai_kekeringan: "Waspadai Kekeringan",
  konversi_lahan_ilegal: "Konversi Lahan Ilegal",
};

// ─── Date ────────────────────────────────────────────────────────────────────

export function formatRelativeDate(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Terdeteksi hari ini";
  if (diffDays === 1) return "Terdeteksi kemarin";
  if (diffDays < 30) return `Terdeteksi ${diffDays} hari lalu`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `Terdeteksi ${diffMonths} bulan lalu`;
  return `Terdeteksi ${Math.floor(diffMonths / 12)} tahun lalu`;
}

// ─── Currency ────────────────────────────────────────────────────────────────

export function formatRupiah(rp: number | null): string {
  if (rp === null) return "—";
  if (rp >= 1_000_000_000) return `Rp ${(rp / 1_000_000_000).toFixed(1)} miliar/thn`;
  if (rp >= 1_000_000) return `Rp ${(rp / 1_000_000).toFixed(0)} juta/thn`;
  return `Rp ${rp.toLocaleString("id-ID")}/thn`;
}
