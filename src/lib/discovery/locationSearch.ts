import Fuse from "fuse.js";
import type {
  DimWilayah,
  WilayahProfilSample,
  WilayahScoreAggregate,
  SearchResult,
} from "@/lib/types/wilayah";

export interface LocationSearchEntry extends DimWilayah {
  skor_potensi: number;
  profil_kode: WilayahProfilSample["profil_kode"] | undefined;
  median_land_price: number | undefined;
  appreciation_rate: number | undefined;
  last_refreshed_at: string | undefined;
  label: string;
  normalized_nama: string;
  normalized_kabupaten: string;
  normalized_provinsi: string;
  normalized_label: string;
}

export interface LocationSearchIndex {
  entries: LocationSearchEntry[];
  fuse: Fuse<LocationSearchEntry>;
}

const ADMIN_WORD_PATTERN =
  /\b(kec|kecamatan|kel|kelurahan|kab|kabupaten|kota|prov|provinsi|propinsi)\b\.?/g;

export function normalizeLocationSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(ADMIN_WORD_PATTERN, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatLocationLabel(wilayah: Pick<DimWilayah, "nama" | "kabupaten" | "provinsi">) {
  return `${wilayah.nama} - ${wilayah.kabupaten} - ${wilayah.provinsi}`;
}

export function createLocationSearchIndex(
  wilayahs: DimWilayah[],
  scores: WilayahScoreAggregate[],
  samples: WilayahProfilSample[]
): LocationSearchIndex {
  const scoreByWilayah = new Map(scores.map((score) => [score.wilayah_id, score]));
  const sampleByWilayah = new Map(samples.map((sample) => [sample.wilayah_id, sample]));

  const entries = wilayahs.map((wilayah) => {
    const score = scoreByWilayah.get(wilayah.wilayah_id);
    const sample = sampleByWilayah.get(wilayah.wilayah_id);
    const label = formatLocationLabel(wilayah);

    return {
      ...wilayah,
      skor_potensi: score?.location_score ?? 0,
      profil_kode: sample?.profil_kode,
      median_land_price: score?.median_land_price,
      appreciation_rate: score?.appreciation_rate,
      last_refreshed_at: score?.last_refreshed_at,
      label,
      normalized_nama: normalizeLocationSearchText(wilayah.nama),
      normalized_kabupaten: normalizeLocationSearchText(wilayah.kabupaten),
      normalized_provinsi: normalizeLocationSearchText(wilayah.provinsi),
      normalized_label: normalizeLocationSearchText(label),
    };
  });

  return {
    entries,
    fuse: new Fuse(entries, {
      includeScore: true,
      ignoreLocation: true,
      threshold: 0.38,
      minMatchCharLength: 2,
      keys: [
        { name: "normalized_nama", weight: 0.55 },
        { name: "normalized_label", weight: 0.25 },
        { name: "normalized_kabupaten", weight: 0.12 },
        { name: "normalized_provinsi", weight: 0.08 },
      ],
    }),
  };
}

function toSearchResult(entry: LocationSearchEntry): SearchResult {
  return {
    wilayah_id: entry.wilayah_id,
    nama: entry.nama,
    kabupaten: entry.kabupaten,
    provinsi: entry.provinsi,
    skor_potensi: entry.skor_potensi,
    highlight_reason: entry.label,
    lat: entry.lat,
    lng: entry.lng,
    profil_kode: entry.profil_kode,
    median_land_price: entry.median_land_price,
    appreciation_rate: entry.appreciation_rate,
    last_refreshed_at: entry.last_refreshed_at,
  };
}

export function searchLocationIndex(
  index: LocationSearchIndex,
  query: string,
  limit: number
): SearchResult[] {
  const normalizedQuery = normalizeLocationSearchText(query);
  if (!normalizedQuery) return [];

  return index.fuse.search(normalizedQuery, { limit }).map(({ item }) => toSearchResult(item));
}
