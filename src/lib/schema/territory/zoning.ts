import { z } from "zod";
import type { TerritoryZoning } from "@/lib/types/territory";

const scoreField = z.number().min(0).max(100);
const isoTimestamp = z.string().datetime({ offset: true });

export const MapLayerMetadataSchema = z.object({
  id: z.enum(["rtrw", "actual_landcover", "kawasan_lindung"]),
  label: z.string().min(1),
  type: z.enum(["polygon", "raster_proxy"]),
  geojson_path: z.string().min(1),
  style_property: z.string().min(1),
  legend: z
    .array(
      z.object({
        value: z.string().min(1),
        label: z.string().min(1),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      }),
    )
    .min(1),
  initially_visible: z.boolean(),
});

export const TerritoryZoningSchema = z.object({
  wilayah_id: z.number().int().positive(),
  zoning_compliance_score: scoreField,
  regulatory_flag: z.enum(["BEBAS_INVESTASI", "KONFLIK_REGULASI", "KAWASAN_LINDUNG", "MORATORIUM"]),
  flag_color: z.enum(["green", "amber", "red"]),
  flag_detail: z.string().min(1),
  luas_sesuai_ha: z.number().nonnegative(),
  luas_konflik_ha: z.number().nonnegative(),
  luas_kawasan_lindung_ha: z.number().nonnegative(),
  luas_breakdown: z.object({
    sesuai_ha: z.number().nonnegative(),
    konflik_ha: z.number().nonnegative(),
    kawasan_lindung_ha: z.number().nonnegative(),
  }),
  rdtr_available: z.boolean(),
  implications: z.object({
    investor: z.array(z.string().min(1)).min(2).max(4),
    pejabat: z.array(z.string().min(1)).min(2).max(4),
  }),
  map_layers: z.array(MapLayerMetadataSchema).min(2).max(3),
  geojson_overlay_path: z.string().min(1),
  last_computed_at: isoTimestamp,
});

const _check: TerritoryZoning = {} as z.infer<typeof TerritoryZoningSchema>;
void _check;
