export type GapConfirmationValue =
  | "terkonfirmasi"
  | "koreksi_oversupply"
  | "hambatan_non_data"
  | "belum_relevan";

export const GAP_CONFIRMATION_THRESHOLDS = {
  largeGapPct: 30,
  smallGapPct: 10,
  lowPipelineCount: 3,
  highPipelineCount: 5,
} as const;

export function computeGapConfirmation(
  demandSupplyGapPct: number,
  pipelineCount: number,
): GapConfirmationValue {
  const largeGap = demandSupplyGapPct > GAP_CONFIRMATION_THRESHOLDS.largeGapPct;
  const smallGap = demandSupplyGapPct < GAP_CONFIRMATION_THRESHOLDS.smallGapPct;
  const lowPipeline = pipelineCount < GAP_CONFIRMATION_THRESHOLDS.lowPipelineCount;
  const highPipeline = pipelineCount >= GAP_CONFIRMATION_THRESHOLDS.highPipelineCount;

  if (largeGap && lowPipeline) return "terkonfirmasi";
  if (largeGap && highPipeline) return "hambatan_non_data";
  if (smallGap && highPipeline) return "koreksi_oversupply";
  if (smallGap && lowPipeline) return "belum_relevan";

  return pipelineCount >= GAP_CONFIRMATION_THRESHOLDS.lowPipelineCount
    ? "hambatan_non_data"
    : "belum_relevan";
}
