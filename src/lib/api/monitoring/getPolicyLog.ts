// GET /monitoring/{id}/policy-log — docs/06_MONITORING_GOVERNANCE.md §5.1
// Merges pre-seeded fixture entries with localStorage-persisted user additions.
import { ApiError } from "../common/ApiError";
import { PolicyLogArraySchema } from "@/lib/schema/monitoring";
import type { PolicyLogItem, PolicyLogStorage } from "@/lib/types/monitoring";
import rawFixture from "@/mocks/monitoring/policy_log.json";

const STORAGE_KEY = "talis.policy_log.v1";

export async function getPolicyLog(wilayahId: number): Promise<PolicyLogItem[]> {
  const result = PolicyLogArraySchema.safeParse(rawFixture);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new ApiError(
      "FIXTURE_INVALID",
      `GET /monitoring/${wilayahId}/policy-log`,
      `policy_log.json invalid at ${issue?.path.join(".") ?? "(root)"}: ${issue?.message ?? "unknown"}`,
    );
  }

  const fixtureItems = result.data.filter((item) => item.wilayah_id === wilayahId);

  // Merge localStorage additions (browser only)
  let storedItems: PolicyLogItem[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PolicyLogStorage;
        if (parsed?.version === 1 && Array.isArray(parsed.items)) {
          storedItems = parsed.items.filter((item) => item.wilayah_id === wilayahId);
        }
      }
    } catch {
      // corrupted localStorage — ignore silently
    }
  }

  return [...fixtureItems, ...storedItems];
}
