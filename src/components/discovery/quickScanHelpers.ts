import type { ProfilKode } from "@/lib/types/common";

const SAMPLE_PROFIL_KODES = new Set<string>([
  "AGRO_DOMINANT",
  "HOSPITALITY_DOMINANT",
  "AGRO_HOSP",
] satisfies ProfilKode[]);

export function isSampleProfile(profilKode: string | null | undefined): boolean {
  return !!profilKode && SAMPLE_PROFIL_KODES.has(profilKode);
}

const TAB_LABELS: Record<string, string> = {
  AGRO_DOMINANT: "Agro",
  HOSPITALITY_DOMINANT: "Hospitality",
  AGRO_HOSP: "Agro+Hosp",
};

export function profilKodeToTabLabel(kode: string): string {
  return TAB_LABELS[kode] ?? kode;
}

// Tab display order — always show all three in the same order
export const PROFIL_TAB_ORDER: ProfilKode[] = [
  "AGRO_DOMINANT",
  "HOSPITALITY_DOMINANT",
  "AGRO_HOSP",
];

// Formats lat/lng as "3.1968°N · 98.5095°E" (negative lat → °S, negative lng → °W)
export function formatCoordinate(lat: number, lng: number): string {
  const latAbs = Math.abs(lat).toFixed(4);
  const lngAbs = Math.abs(lng).toFixed(4);
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${latAbs}°${latDir} · ${lngAbs}°${lngDir}`;
}
