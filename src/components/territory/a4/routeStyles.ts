import type { TipeTujuan } from "@/lib/types/common";

export const ROUTE_TYPE_LABELS: Record<TipeTujuan, string> = {
  pelabuhan_export: "Pelabuhan export",
  bandara_internasional: "Bandara internasional",
  pasar_induk: "Pasar induk",
  ibukota_provinsi: "Ibukota provinsi",
  jalan_nasional: "Jalan nasional",
};

export const ROUTE_TYPE_COLORS: Record<TipeTujuan, string> = {
  pelabuhan_export: "#1E40AF",
  bandara_internasional: "#40916C",
  pasar_induk: "#B45309",
  ibukota_provinsi: "#78716C",
  jalan_nasional: "#52B788",
};
