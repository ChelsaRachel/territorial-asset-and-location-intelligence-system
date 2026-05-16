import type {
  DimWilayah,
  WilayahProfilSample,
  WilayahScoreAggregate,
  SearchResult,
} from "@/lib/types/wilayah";

export type DiscoverySector = "agro" | "hospitality" | "pariwisata" | "properti";

export interface CriteriaFilters {
  sektor?: DiscoverySector[];
  minSkorPotensi?: number;
  maxSkorPotensi?: number;
  minMarketAccess?: number;
  minGrowthProjection?: number;
  provinsiIds?: string[];
}

export interface CriteriaCandidate {
  wilayah: DimWilayah;
  score: WilayahScoreAggregate;
  sample?: WilayahProfilSample;
}

export const SECTOR_LABEL: Record<DiscoverySector, string> = {
  agro: "Agro",
  hospitality: "Hospitality",
  pariwisata: "Pariwisata",
  properti: "Properti",
};

const SECTOR_MATCH_MIN = 60;

export function getSectorScore(
  score: WilayahScoreAggregate,
  sector: DiscoverySector
): number {
  if (sector === "agro") return score.land_suitability_agro;
  if (sector === "hospitality") return score.land_suitability_hosp;
  if (sector === "pariwisata") return score.land_suitability_pariwisata;

  // Properti does not have a dedicated A.1 field in SPRINT-02; this PoC proxy
  // combines location quality, infrastructure, and zoning compliance.
  return Math.round(
    score.location_score * 0.4 + score.infrastructure_index * 0.35 + score.zoning_compliance * 0.25
  );
}

export function getBestSectorSignal(
  score: WilayahScoreAggregate,
  sectors: DiscoverySector[] | undefined
): { sector: DiscoverySector; label: string; score: number } {
  const scopedSectors =
    sectors && sectors.length > 0 ? sectors : (Object.keys(SECTOR_LABEL) as DiscoverySector[]);

  const best = scopedSectors
    .map((sector) => ({ sector, label: SECTOR_LABEL[sector], score: getSectorScore(score, sector) }))
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, "id"))[0];

  if (!best) {
    return { sector: "agro", label: SECTOR_LABEL.agro, score: getSectorScore(score, "agro") };
  }

  return best;
}

export function filterCriteriaResults(
  candidates: CriteriaCandidate[],
  filters: CriteriaFilters
): SearchResult[] {
  const sectors = filters.sektor?.length ? filters.sektor : undefined;
  const regions = filters.provinsiIds?.length ? new Set(filters.provinsiIds) : undefined;

  return candidates
    .filter(({ wilayah, score }) => {
      const provinsiId = String(wilayah.wilayah_id).slice(0, 2);
      const bestSector = getBestSectorSignal(score, sectors);

      if (regions && !regions.has(provinsiId)) return false;
      if (sectors && bestSector.score < SECTOR_MATCH_MIN) return false;
      if (filters.minSkorPotensi !== undefined && score.location_score < filters.minSkorPotensi) return false;
      if (filters.maxSkorPotensi !== undefined && score.location_score > filters.maxSkorPotensi) return false;
      if (filters.minMarketAccess !== undefined && score.market_access < filters.minMarketAccess) return false;
      if (
        filters.minGrowthProjection !== undefined &&
        score.growth_projection < filters.minGrowthProjection
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const sectorA = getBestSectorSignal(a.score, sectors).score;
      const sectorB = getBestSectorSignal(b.score, sectors).score;

      return (
        b.score.location_score - a.score.location_score ||
        sectorB - sectorA ||
        a.score.median_land_price - b.score.median_land_price ||
        a.wilayah.nama.localeCompare(b.wilayah.nama, "id")
      );
    })
    .map(({ wilayah, score, sample }) => {
      const bestSector = getBestSectorSignal(score, sectors);

      return {
        wilayah_id: wilayah.wilayah_id,
        nama: wilayah.nama,
        kabupaten: wilayah.kabupaten,
        provinsi: wilayah.provinsi,
        lat: wilayah.lat,
        lng: wilayah.lng,
        profil_kode: sample?.profil_kode,
        skor_potensi: score.location_score,
        median_land_price: score.median_land_price,
        appreciation_rate: score.appreciation_rate,
        sector_signal: bestSector.label,
        sector_signal_score: bestSector.score,
        last_refreshed_at: score.last_refreshed_at,
        highlight_reason: `${bestSector.label} ${bestSector.score} dengan akses pasar ${score.market_access} dan proyeksi tumbuh ${score.growth_projection}.`,
      };
    });
}
