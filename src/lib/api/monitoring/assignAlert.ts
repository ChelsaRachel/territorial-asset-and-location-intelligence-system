// POST /monitoring/alerts/{id}/assign — docs/06_MONITORING_GOVERNANCE.md §5.1
import { patchAlertInStore } from "./getAlerts";
import type { Alert, AssignAlertPayload } from "@/lib/types/monitoring";

export async function assignAlert(
  alertId: string,
  payload: AssignAlertPayload,
): Promise<Alert> {
  const updated = patchAlertInStore(alertId, {
    status: "ASSIGNED",
    assignee: payload.assignee,
    tim_penanganan: payload.team,
  });
  console.log("[talis.alert.transition]", {
    alertId,
    from: "OPEN",
    to: "ASSIGNED",
    team: payload.team,
    assignee: payload.assignee,
    notes: payload.notes,
    by: "poc-user",
    at: new Date().toISOString(),
  });
  return updated;
}
