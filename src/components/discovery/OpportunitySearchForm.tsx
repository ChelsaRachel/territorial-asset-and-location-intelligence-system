"use client";

import { useState } from "react";
import { SECTOR_LABEL, type DiscoverySector } from "@/lib/discovery/filterCriteria";
import {
  useDiscoveryActions,
  useDiscoveryMode3Intent,
  type Mode3Intent,
} from "@/lib/store/useDiscovery";
import type { OpportunityPreference } from "@/lib/discovery/opportunitySearch";

const SECTORS = Object.keys(SECTOR_LABEL) as DiscoverySector[];

const PREFERENCES: Array<{ value: OpportunityPreference; label: string }> = [
  { value: "growth", label: "Growth" },
  { value: "land_banking", label: "Land banking" },
  { value: "risk_averse", label: "Risk-averse" },
  { value: "cashflow", label: "Cashflow" },
];

const DEFAULT_INTENT: Mode3Intent = {
  sektorTarget: "hospitality",
  budgetMaxPerM2: 1_000_000,
  preferensi: "growth",
};

export function OpportunitySearchForm() {
  const storedIntent = useDiscoveryMode3Intent();
  const { setMode3Intent, runSearch } = useDiscoveryActions();
  const [draft, setDraft] = useState<Mode3Intent>(storedIntent ?? DEFAULT_INTENT);
  const [budgetText, setBudgetText] = useState(formatBudget(storedIntent?.budgetMaxPerM2 ?? 1_000_000));

  const updateBudget = (value: string) => {
    setBudgetText(value);
    const parsed = Number(value.replace(/\D/g, ""));
    setDraft((current) => ({ ...current, budgetMaxPerM2: parsed || 0 }));
  };

  const apply = () => {
    setMode3Intent(draft);
    void runSearch();
  };

  const reset = () => {
    setDraft(DEFAULT_INTENT);
    setBudgetText(formatBudget(DEFAULT_INTENT.budgetMaxPerM2));
    setMode3Intent(null);
  };

  return (
    <div className="space-y-3">
      <label className="space-y-1">
        <span className="font-sans text-xs font-semibold uppercase text-talis-stone-700">
          Sektor target
        </span>
        <select
          value={draft.sektorTarget}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              sektorTarget: event.target.value as DiscoverySector,
            }))
          }
          className="h-9 w-full rounded-md border border-talis-stone-700/15 bg-white px-2 font-sans text-sm text-talis-stone-900 outline-none focus:border-talis-green-700 focus:ring-2 focus:ring-talis-green-700/20"
        >
          {SECTORS.map((sector) => (
            <option key={sector} value={sector}>
              {SECTOR_LABEL[sector]}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1">
        <span className="font-sans text-xs font-semibold uppercase text-talis-stone-700">
          Budget maksimum per m2
        </span>
        <div className="flex h-9 items-center rounded-md border border-talis-stone-700/15 bg-white focus-within:border-talis-green-700 focus-within:ring-2 focus-within:ring-talis-green-700/20">
          <span className="px-2 font-sans text-sm text-talis-stone-700">Rp</span>
          <input
            inputMode="numeric"
            value={budgetText}
            onChange={(event) => updateBudget(event.target.value)}
            onBlur={() => setBudgetText(formatBudget(draft.budgetMaxPerM2))}
            className="h-full min-w-0 flex-1 bg-transparent pr-2 font-mono text-sm text-talis-stone-900 outline-none"
          />
        </div>
      </label>

      <div className="space-y-1.5">
        <p className="font-sans text-xs font-semibold uppercase text-talis-stone-700">
          Preferensi
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {PREFERENCES.map((preference) => (
            <button
              key={preference.value}
              type="button"
              onClick={() =>
                setDraft((current) => ({ ...current, preferensi: preference.value }))
              }
              className={[
                "h-8 rounded-md border px-2 font-sans text-xs font-medium transition",
                draft.preferensi === preference.value
                  ? "border-talis-green-700 bg-talis-green-700 text-white"
                  : "border-talis-stone-700/15 bg-white text-talis-stone-700 hover:bg-talis-stone-200",
              ].join(" ")}
            >
              {preference.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={apply}
          className="h-9 flex-1 rounded-md bg-talis-green-700 px-3 font-sans text-sm font-semibold text-white transition hover:bg-talis-green-700/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-talis-green-700"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={reset}
          className="h-9 rounded-md border border-talis-stone-700/20 bg-white px-3 font-sans text-sm font-medium text-talis-stone-700 transition hover:bg-talis-stone-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-talis-green-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function formatBudget(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export default OpportunitySearchForm;
