// POST /monitoring/{id}/policy-log — docs/06_MONITORING_GOVERNANCE.md §5.1
// Writes to localStorage talis.policy_log.v1 + returns the new entry.
// Failures emit a non-blocking warning but do NOT throw (PoC simplification).
import type { PolicyLogItem, AddPolicyLogPayload, PolicyLogStorage } from "@/lib/types/monitoring";

const STORAGE_KEY = "talis.policy_log.v1";

function readStorage(): PolicyLogStorage {
  if (typeof window === "undefined") return { version: 1, items: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PolicyLogStorage;
      if (parsed?.version === 1 && Array.isArray(parsed.items)) return parsed;
    }
  } catch {
    // ignore
  }
  return { version: 1, items: [] };
}

function writeStorage(storage: PolicyLogStorage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      console.warn("[talis.policy_log] localStorage quota exceeded — entry not persisted.");
    }
  }
}

export async function addPolicyLog(
  wilayahId: number,
  payload: AddPolicyLogPayload,
): Promise<PolicyLogItem> {
  const newEntry: PolicyLogItem = {
    id: `pol-user-${Date.now()}`,
    wilayah_id: wilayahId,
    policy_date: payload.policy_date,
    title: payload.title,
    deskripsi: payload.deskripsi,
    tags: payload.tags,
    created_by: payload.created_by ?? "poc-user",
    attribution: [],
    attribution_status: "pending_compute_in_12_months",
    status: "pending_compute_in_12_months",
    sumber_pendanaan: payload.sumber_pendanaan ?? null,
    nilai_proyek_rp: payload.nilai_proyek_rp ?? null,
    last_refreshed_at: new Date().toISOString(),
  };

  const storage = readStorage();
  storage.items.push(newEntry);
  writeStorage(storage);

  console.log("[talis.policy_log] addPolicyLog", { wilayahId, entry: newEntry });
  return newEntry;
}
