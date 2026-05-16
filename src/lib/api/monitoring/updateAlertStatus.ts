// PATCH /monitoring/alerts/{id}/status — docs/06_MONITORING_GOVERNANCE.md §5.1
import { patchAlertInStore } from "./getAlerts";
import type { Alert } from "@/lib/types/monitoring";
import type { AlertStatus } from "@/lib/types/common";

export async function updateAlertStatus(
  alertId: string,
  status: AlertStatus,
  previousStatus?: AlertStatus,
): Promise<Alert> {
  const updated = patchAlertInStore(alertId, { status });
  console.log("[talis.alert.transition]", {
    alertId,
    from: previousStatus ?? "unknown",
    to: status,
    by: "poc-user",
    at: new Date().toISOString(),
  });
  return updated;
}
