// GET /monitoring/{id}/alerts — docs/06_MONITORING_GOVERNANCE.md §5.1
import { ApiError } from "../common/ApiError";
import { AlertFixtureArraySchema } from "@/lib/schema/monitoring";
import type { Alert } from "@/lib/types/monitoring";
import rawFixture from "@/mocks/monitoring/alerts.json";

// In-memory store so session mutations (assign/status) persist within the tab.
let alertStore: Alert[] | null = null;
const SIMULATED_STORAGE_KEY = "talis.simulated_alerts.v1";

function getStore(): Alert[] {
  if (!alertStore) {
    const result = AlertFixtureArraySchema.safeParse(rawFixture);
    if (!result.success) {
      const issue = result.error.issues[0];
      throw new ApiError(
        "FIXTURE_INVALID",
        "GET /monitoring/{id}/alerts",
        `alerts.json invalid at ${issue?.path.join(".") ?? "(root)"}: ${issue?.message ?? "unknown"}`,
      );
    }
    alertStore = result.data as Alert[];
  }
  return alertStore;
}

export async function getAlerts(wilayahId: number): Promise<Alert[]> {
  consumeSimulatedAlerts();
  return getStore().filter((a) => a.wilayah_id === wilayahId);
}

function consumeSimulatedAlerts(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(SIMULATED_STORAGE_KEY);
    if (!raw) return;
    sessionStorage.removeItem(SIMULATED_STORAGE_KEY);
    const parsed = JSON.parse(raw) as Alert[];
    if (!Array.isArray(parsed)) return;
    const store = getStore();
    for (const alert of parsed.reverse()) {
      if (!store.some((item) => item.id === alert.id)) store.unshift(alert);
    }
  } catch {
    sessionStorage.removeItem(SIMULATED_STORAGE_KEY);
  }
}

/** Mutate a single alert in the in-memory store (used by assignAlert/updateAlertStatus). */
export function patchAlertInStore(alertId: string, patch: Partial<Alert>): Alert {
  const store = getStore();
  const idx = store.findIndex((a) => a.id === alertId);
  if (idx === -1) {
    throw new ApiError("NOT_FOUND", `PATCH /monitoring/alerts/${alertId}`, `Alert ${alertId} not found`);
  }
  store[idx] = { ...store[idx]!, ...patch };
  return store[idx]!;
}

/** Prepend a new alert to the in-memory store (used by realtime push). */
export function prependAlertToStore(alert: Alert): void {
  const store = getStore();
  store.unshift(alert);
}

/** Reset store (test helper). */
export function resetAlertStore(): void {
  alertStore = null;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(SIMULATED_STORAGE_KEY);
    } catch {
      // ignore storage failures in the dev helper
    }
  }
}
