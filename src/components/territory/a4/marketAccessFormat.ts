import { formatCostPerTon, formatMinutes } from "@/lib/format/territory";
import { ROUTE_TYPE_LABELS } from "./routeStyles";
import type { TipeTujuan } from "@/lib/types/common";

export { formatCostPerTon, formatMinutes };

export function formatDistanceKm(value: number): string {
  return `${value} km`;
}

export function tipeTujuanLabel(tipe: TipeTujuan): string {
  return ROUTE_TYPE_LABELS[tipe];
}
