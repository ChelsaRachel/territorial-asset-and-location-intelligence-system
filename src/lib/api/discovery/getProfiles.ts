// GET /api/v1/discovery/profiles — docs/01_COMMAND_CENTER.md §5.1
import dimWilayahData from "@/mocks/dim_wilayah.json";
import profilSampleData from "@/mocks/wilayah_profil_sample.json";
import { DimWilayahSchema } from "@/lib/schema/dim_wilayah";
import { WilayahProfilSampleSchema } from "@/lib/schema/wilayah_profil_sample";
import { loadFixture } from "@/lib/schema/loader";
import { ApiError } from "../common/ApiError";
import { delay } from "../common/delay";
import type { DimWilayah, WilayahProfilSample } from "@/lib/types/wilayah";

export type ProfileEntry = DimWilayah & WilayahProfilSample;

export interface GetProfilesResponse {
  profiles: ProfileEntry[];
  last_updated: string;
}

export async function getProfiles(): Promise<GetProfilesResponse> {
  await delay(120);
  try {
    const wilayahs = loadFixture(dimWilayahData, DimWilayahSchema.array());
    const profils = loadFixture(profilSampleData, WilayahProfilSampleSchema.array());

    // Only return wilayah that have a full profil_sample entry (the three canonical sample profiles).
    // Non-sample wilayah in dim_wilayah are for search/ranking only; they render partial Quick Scan.
    const profiles: ProfileEntry[] = wilayahs
      .map((w) => {
        const p = profils.find((pr) => pr.wilayah_id === w.wilayah_id);
        return p ? { ...w, ...p } : null;
      })
      .filter((entry): entry is ProfileEntry => entry !== null);

    return {
      profiles,
      last_updated: "2026-05-06T08:00:00Z",
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError("FIXTURE_INVALID", "GET /discovery/profiles", String(err));
  }
}
