// GET /monitoring/{id}/pipeline — docs/06_MONITORING_GOVERNANCE.md §5.1
import { ApiError } from "../common/ApiError";
import {
  PipelineFixtureArraySchema,
  PipelineAggregateArraySchema,
} from "@/lib/schema/monitoring";
import type { PipelineResponse } from "@/lib/types/monitoring";
import rawItems from "@/mocks/monitoring/pipeline.json";
import rawAggregates from "@/mocks/monitoring/pipeline_aggregate.json";

export async function getPipeline(wilayahId: number): Promise<PipelineResponse> {
  const itemsResult = PipelineFixtureArraySchema.safeParse(rawItems);
  if (!itemsResult.success) {
    const issue = itemsResult.error.issues[0];
    throw new ApiError(
      "FIXTURE_INVALID",
      `GET /monitoring/${wilayahId}/pipeline`,
      `pipeline.json invalid at ${issue?.path.join(".") ?? "(root)"}: ${issue?.message ?? "unknown"}`,
    );
  }

  const aggResult = PipelineAggregateArraySchema.safeParse(rawAggregates);
  if (!aggResult.success) {
    const issue = aggResult.error.issues[0];
    throw new ApiError(
      "FIXTURE_INVALID",
      `GET /monitoring/${wilayahId}/pipeline`,
      `pipeline_aggregate.json invalid at ${issue?.path.join(".") ?? "(root)"}: ${issue?.message ?? "unknown"}`,
    );
  }

  const items = itemsResult.data.filter((item) => item.wilayah_id === wilayahId);
  const aggregate = aggResult.data.find((agg) => agg.wilayah_id === wilayahId);

  if (!aggregate) {
    throw new ApiError(
      "NOT_FOUND",
      `GET /monitoring/${wilayahId}/pipeline`,
      `No pipeline aggregate found for wilayah_id ${wilayahId}`,
    );
  }

  return { items, aggregate };
}
