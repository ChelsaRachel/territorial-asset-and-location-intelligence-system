// Validates src/mocks/dim_wilayah.json — mirrors docs/01_COMMAND_CENTER.md §4.1
import { z } from "zod";
import type { DimWilayah } from "@/lib/types/wilayah";

export const DimWilayahSchema = z.object({
  wilayah_id: z.number().int().positive(),
  nama: z.string().min(1),
  kabupaten: z.string().min(1),
  provinsi: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  geometry: z.unknown().optional(),
});

// Static type-compatibility check
const _check: DimWilayah = {} as z.infer<typeof DimWilayahSchema>;
void _check;
