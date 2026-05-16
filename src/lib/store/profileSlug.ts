import type { DimWilayah } from "@/lib/types/wilayah";
import type { WilayahProfilSample } from "@/lib/types/wilayah";

export type WilayahProfile = DimWilayah & WilayahProfilSample;

export function slugify(nama: string): string {
  return nama
    .replace(/^(Kec|Kel)\.\s+/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function buildSlugMap(profiles: WilayahProfile[]): Map<string, WilayahProfile> {
  const map = new Map<string, WilayahProfile>();
  for (const p of profiles) {
    map.set(slugify(p.nama), p);
  }
  return map;
}

export function profileToSlug(profile: WilayahProfile): string {
  return slugify(profile.nama);
}
