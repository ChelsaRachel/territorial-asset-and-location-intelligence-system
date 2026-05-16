import type { ProfilKode } from "@/lib/types/common";

const SEKTOR_LABEL: Record<ProfilKode, string> = {
  AGRO_DOMINANT: "Agribisnis",
  HOSPITALITY_DOMINANT: "Hospitality",
  AGRO_HOSP: "Agribisnis + Hospitality",
};

export function sektorLabel(profilKode: string): string {
  return SEKTOR_LABEL[profilKode as ProfilKode] ?? profilKode;
}
