// GET /monitoring/{id}/benchmark — docs/06_MONITORING_GOVERNANCE.md §5.1
import { ApiError } from "../common/ApiError";
import { BenchmarkMappingArraySchema } from "@/lib/schema/monitoring";
import type { BenchmarkMapping } from "@/lib/types/monitoring";
import rawFixture from "@/mocks/monitoring/benchmark_mapping.json";

export async function getBenchmark(wilayahId: number): Promise<BenchmarkMapping[]> {
  const result = BenchmarkMappingArraySchema.safeParse(rawFixture);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new ApiError(
      "FIXTURE_INVALID",
      `GET /monitoring/${wilayahId}/benchmark`,
      `benchmark_mapping.json invalid at ${issue?.path.join(".") ?? "(root)"}: ${issue?.message ?? "unknown"}`,
    );
  }
  return result.data.filter((b) => b.wilayah_aktif_id === wilayahId);
}
