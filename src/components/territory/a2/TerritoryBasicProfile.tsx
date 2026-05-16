import { KpiCard } from "@/components/ui/KpiCard";
import {
  formatAreaKm2,
  formatDensity,
  formatPdrbPerKapita,
  formatPopulation,
} from "@/lib/format/territory";
import type { TerritoryProfile } from "@/lib/types/territory";

interface TerritoryBasicProfileProps {
  profile: TerritoryProfile;
}

export function TerritoryBasicProfile({ profile }: TerritoryBasicProfileProps) {
  const { demografi } = profile;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Luas" value={formatAreaKm2(demografi.luas_km2)} unit="km²" size="compact" />
      <KpiCard
        label="Penduduk"
        value={formatPopulation(demografi.jumlah_penduduk)}
        unit="jiwa"
        size="compact"
      />
      <KpiCard
        label="Kepadatan"
        value={formatDensity(demografi.kepadatan_per_km2)}
        unit="/km²"
        size="compact"
      />
      <KpiCard
        label="PDRB/kapita"
        value={formatPdrbPerKapita(demografi.pdrb_per_kapita_juta)}
        unit="/thn"
        size="compact"
      />
    </div>
  );
}
