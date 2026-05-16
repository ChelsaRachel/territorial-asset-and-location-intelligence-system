// Formatting helpers for SPRINT-05 assessment sections
import type { QuadrantTier } from "@/lib/types/assessment";
import type { FeasibilityZone, InvestmentReadinessKlasifikasi } from "@/lib/types/common";

export const SEKTOR_LABELS: Record<string, string> = {
  agribisnis: "Agribisnis",
  hospitality: "Hospitality",
  pariwisata: "Pariwisata",
  properti: "Properti",
};

export const DIMENSION_DISPLAY: Record<string, string> = {
  A1: "Land Suitability",
  A2: "Infrastructure",
  A3: "Zoning Compliance",
  A4: "Market Access",
  A8: "Growth Projection",
};

export function quadrantTierLabel(tier: QuadrantTier): string {
  if (tier === "Perlu_Perhatian") return "Perlu Perhatian";
  return tier;
}

export function quadrantTierColorClasses(tier: QuadrantTier): {
  border: string;
  bg: string;
  text: string;
  badge: string;
} {
  switch (tier) {
    case "Baik":
      return {
        border: "border-talis-green-700/30",
        bg: "bg-talis-green-700/5",
        text: "text-talis-green-700",
        badge: "bg-talis-green-700/15 text-talis-green-700 border-talis-green-700/30",
      };
    case "Cukup":
      return {
        border: "border-talis-amber/40",
        bg: "bg-talis-amber/5",
        text: "text-talis-earth-700",
        badge: "bg-talis-amber/15 text-talis-earth-700 border-talis-amber/40",
      };
    case "Perlu_Perhatian":
      return {
        border: "border-talis-red-700/30",
        bg: "bg-talis-red-700/5",
        text: "text-talis-red-700",
        badge: "bg-talis-red-700/15 text-talis-red-700 border-talis-red-700/30",
      };
  }
}

export function viabilityZoneLabel(zone: FeasibilityZone): string {
  switch (zone) {
    case "VIABLE": return "Viable";
    case "BORDERLINE": return "Borderline";
    case "NOT_VIABLE": return "Tidak Viable";
  }
}

export function viabilityZoneColorClasses(zone: FeasibilityZone): string {
  switch (zone) {
    case "VIABLE":
      return "bg-talis-green-700/15 text-talis-green-700 border-talis-green-700/30";
    case "BORDERLINE":
      return "bg-talis-amber/15 text-talis-earth-700 border-talis-amber/40";
    case "NOT_VIABLE":
      return "bg-talis-red-700/15 text-talis-red-700 border-talis-red-700/30";
  }
}

export function readinessKlasiLabel(klasi: InvestmentReadinessKlasifikasi): string {
  switch (klasi) {
    case "Siap_Investasi": return "Siap Investasi";
    case "Siap_Dengan_Catatan": return "Siap dengan Catatan";
    case "Perlu_Persiapan": return "Perlu Persiapan";
  }
}

export function readinessKlasiColorClasses(klasi: InvestmentReadinessKlasifikasi): string {
  switch (klasi) {
    case "Siap_Investasi":
      return "bg-talis-green-700/15 text-talis-green-700 border-talis-green-700/30";
    case "Siap_Dengan_Catatan":
      return "bg-talis-amber/15 text-talis-earth-700 border-talis-amber/40";
    case "Perlu_Persiapan":
      return "bg-talis-red-700/15 text-talis-red-700 border-talis-red-700/30";
  }
}

export function sektorSiapStatusLabel(status: string): string {
  switch (status) {
    case "siap": return "Siap";
    case "siap_dengan_syarat": return "Siap dengan Syarat";
    case "belum_siap": return "Belum Siap";
    default: return status;
  }
}

export function sektorSiapStatusColorClasses(status: string): string {
  switch (status) {
    case "siap":
      return "bg-talis-green-700/15 text-talis-green-700 border-talis-green-700/30";
    case "siap_dengan_syarat":
      return "bg-talis-amber/15 text-talis-earth-700 border-talis-amber/40";
    case "belum_siap":
      return "bg-talis-red-700/15 text-talis-red-700 border-talis-red-700/30";
    default:
      return "bg-talis-stone-200 text-talis-stone-700 border-talis-stone-700/20";
  }
}

export function formatRupiah(value: number): string {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  }
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function verdictStatusColorClasses(status: string): string {
  switch (status) {
    case "LAYAK":
      return "bg-talis-green-700/15 text-talis-green-700 border-talis-green-700/30";
    case "LAYAK_BERSYARAT":
      return "bg-talis-amber/15 text-talis-earth-700 border-talis-amber/40";
    case "TIDAK_LAYAK":
      return "bg-talis-red-700/15 text-talis-red-700 border-talis-red-700/30";
    default:
      return "bg-talis-stone-200 text-talis-stone-700 border-talis-stone-700/20";
  }
}

export function isNotFoundError(error: unknown): boolean {
  return (
    error != null &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code: string }).code === "NOT_FOUND"
  );
}

export function errorDescription(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan saat membaca data assessment.";
}
