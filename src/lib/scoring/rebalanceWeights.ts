// Proportional slider rebalancing utility for C.1 Custom Weights panel (SPRINT-05)
// All output weights are non-negative integers summing to exactly 100.

import type { DimensionKey, Weights } from "@/lib/types/assessment";
import { DIMENSION_KEYS } from "./weights";

/**
 * Rebalances integer weights so they always sum to 100 after one slider changes.
 *
 * Algorithm:
 * 1. Clamp and round newValue to integer in [0, 100].
 * 2. Remaining = 100 - newValue distributed among the other 4 sliders.
 * 3. Distribute proportionally to their current values (largest-remainder method).
 * 4. If other sliders all have value 0, distribute equally.
 * 5. The dragged slider is set to exactly newValue; any rounding adjustment lands
 *    on the other sliders via the largest-remainder pass.
 *
 * Edge cases:
 * - drag to 100: all others become 0.
 * - drag to 0: others keep their relative proportions summing to 100.
 * - others all at 0: distribute remaining equally among them.
 */
export function rebalanceWeights(
  current: Weights,
  changedKey: DimensionKey,
  newValue: number,
): Weights {
  const dragged = Math.max(0, Math.min(100, Math.round(newValue)));
  const remaining = 100 - dragged;

  const otherKeys = DIMENSION_KEYS.filter((k) => k !== changedKey);
  const otherSum = otherKeys.reduce((sum, k) => sum + current[k], 0);

  const result: Partial<Weights> = {};

  if (remaining === 0) {
    // Drag to 100 — all others go to 0
    result[changedKey] = 100;
    for (const k of otherKeys) result[k] = 0;
    return result as Weights;
  }

  if (otherSum === 0) {
    // All others are 0 — distribute remaining equally with largest-remainder
    const base = Math.floor(remaining / otherKeys.length);
    const extra = remaining - base * otherKeys.length;
    result[changedKey] = dragged;
    for (let i = 0; i < otherKeys.length; i++) {
      result[otherKeys[i]!] = base + (i < extra ? 1 : 0);
    }
    return result as Weights;
  }

  // Proportional distribution using largest-remainder (Hamilton) method
  type Slot = { key: DimensionKey; floor: number; remainder: number };
  const slots: Slot[] = otherKeys.map((k) => {
    const raw = remaining * (current[k] / otherSum);
    const floor = Math.floor(raw);
    return { key: k, floor, remainder: raw - floor };
  });

  const allocated = slots.reduce((s, slot) => s + slot.floor, 0);
  const leftover = remaining - allocated;

  // Award leftover units to highest-remainder slots
  slots.sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < slots.length; i++) {
    result[slots[i]!.key] = slots[i]!.floor + (i < leftover ? 1 : 0);
  }

  result[changedKey] = dragged;
  return result as Weights;
}
