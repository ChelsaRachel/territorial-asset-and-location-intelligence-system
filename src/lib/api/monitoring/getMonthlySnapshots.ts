// GET /monitoring/{id}/monthly-snapshots — local adapter for Page 6 policy and benchmark sections.
import { ApiError } from "../common/ApiError";
import { MonthlySnapshotArraySchema } from "@/lib/schema/monitoring";
import type { MonthlySnapshotRow } from "@/lib/types/monitoring";
import rawFixture from "@/mocks/monitoring/monthly_snapshot.json";

export async function getMonthlySnapshots(wilayahId: number): Promise<MonthlySnapshotRow[]> {
  const result = MonthlySnapshotArraySchema.safeParse(rawFixture);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new ApiError(
      "FIXTURE_INVALID",
      `GET /monitoring/${wilayahId}/monthly-snapshots`,
      `monthly_snapshot.json invalid at ${issue?.path.join(".") ?? "(root)"}: ${issue?.message ?? "unknown"}`,
    );
  }

  const rows = result.data
    .filter((row) => row.wilayah_id === wilayahId)
    .sort((a, b) => a.snapshot_date.localeCompare(b.snapshot_date));

  if (rows.length === 0) {
    throw new ApiError(
      "NOT_FOUND",
      `GET /monitoring/${wilayahId}/monthly-snapshots`,
      `No monthly snapshots found for wilayah_id ${wilayahId}`,
    );
  }

  return rows;
}
