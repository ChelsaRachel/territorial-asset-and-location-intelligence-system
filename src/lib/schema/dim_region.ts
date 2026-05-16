// Validates src/mocks/dim_region.json — provinsi taxonomy for Mode 2 region filter facets
import { z } from "zod";

export const DimRegionSchema = z.object({
  provinsi_id: z.string().regex(/^\d{2}$/),
  provinsi: z.string().min(1),
});
