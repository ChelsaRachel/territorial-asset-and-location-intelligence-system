"use client";

import { DIMENSION_KEYS, DIMENSION_LABELS } from "@/lib/scoring/weights";
import { rebalanceWeights } from "@/lib/scoring";
import type { Weights, DimensionKey } from "@/lib/types/assessment";

interface CustomWeightsPanelProps {
  weights: Weights;
  isCapped: boolean;
  onChange: (weights: Weights) => void;
}

export function CustomWeightsPanel({ weights, isCapped, onChange }: CustomWeightsPanelProps) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  function handleSlider(key: DimensionKey, raw: number) {
    const newWeights = rebalanceWeights(weights, key, raw);
    onChange(newWeights);
  }

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-talis-stone-200 bg-talis-stone-50 p-4">
      <div className="flex items-center justify-between">
        <p className="font-sans text-xs font-medium uppercase tracking-wide text-talis-stone-700">
          Bobot Kustom
        </p>
        <span
          className={`font-mono text-xs font-semibold ${
            total === 100 ? "text-talis-green-700" : "text-talis-red-700"
          }`}
        >
          Total: {total}%
        </span>
      </div>

      {isCapped && (
        <p className="font-sans text-xs text-talis-earth-700">
          Perubahan bobot tidak berpengaruh — skor sudah dibatasi oleh status regulasi.
        </p>
      )}

      <div className="space-y-4">
        {DIMENSION_KEYS.map((key) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor={`weight-${key}`}
                className="font-sans text-sm text-talis-stone-900"
              >
                {DIMENSION_LABELS[key]}
              </label>
              <span className="font-mono text-xs font-semibold text-talis-stone-900">
                {weights[key]}%
              </span>
            </div>
            <input
              id={`weight-${key}`}
              type="range"
              min={0}
              max={100}
              step={1}
              value={weights[key]}
              onChange={(e) => handleSlider(key, parseInt(e.target.value, 10))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-talis-stone-200 accent-talis-green-700"
              aria-label={`Bobot ${DIMENSION_LABELS[key]}`}
            />
          </div>
        ))}
      </div>

      <p className="font-sans text-xs text-talis-stone-700">
        Geser slider — bobot lain menyesuaikan otomatis agar total tetap 100%.
      </p>
    </div>
  );
}
