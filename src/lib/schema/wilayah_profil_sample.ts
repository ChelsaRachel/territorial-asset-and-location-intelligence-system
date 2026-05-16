// Validates src/mocks/wilayah_profil_sample.json — mirrors docs/01_COMMAND_CENTER.md §4.1
import { z } from "zod";
import type { WilayahProfilSample } from "@/lib/types/wilayah";

export const WilayahProfilSampleSchema = z.object({
  wilayah_id: z.number().int().positive(),
  profil_kode: z.enum(["AGRO_DOMINANT", "HOSPITALITY_DOMINANT", "AGRO_HOSP"]),
  marker_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  marker_radius: z.number().int().positive().optional(),
  is_default: z.boolean(),
  karakter_singkat: z.string().min(1),
  elevasi_meter: z.number().int().nonnegative(),
});

const _check: WilayahProfilSample = {} as z.infer<typeof WilayahProfilSampleSchema>;
void _check;
