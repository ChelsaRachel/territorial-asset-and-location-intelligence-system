"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { SECTOR_LABEL, type DiscoverySector } from "@/lib/discovery/filterCriteria";
import { useDiscoveryActions, useDiscoveryMode2Filters } from "@/lib/store/useDiscovery";
import type { DimRegion } from "@/lib/types/wilayah";

const SECTORS = Object.keys(SECTOR_LABEL) as DiscoverySector[];

export function CriteriaSearchForm() {
  const filters = useDiscoveryMode2Filters();
  const { setMode2Filters, runSearch } = useDiscoveryActions();
  const [regions, setRegions] = useState<DimRegion[]>([]);

  useEffect(() => {
    let cancelled = false;
    apiClient.discovery
      .getRegions()
      .then(({ regions }) => {
        if (!cancelled) setRegions(regions);
      })
      .catch((err) => console.error("[CriteriaSearchForm] getRegions failed:", err));

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSector = (sector: DiscoverySector) => {
    const next = filters.sektor.includes(sector)
      ? filters.sektor.filter((item) => item !== sector)
      : [...filters.sektor, sector];
    setMode2Filters({ sektor: next });
  };

  const toggleRegion = (provinsiId: string) => {
    const current = filters.provinsiIds ?? [];
    const next = current.includes(provinsiId)
      ? current.filter((item) => item !== provinsiId)
      : [...current, provinsiId];
    setMode2Filters({ provinsiIds: next.length ? next : undefined });
  };

  const setNumberFilter = (
    key: "minSkorPotensi" | "maxSkorPotensi" | "minMarketAccess" | "minGrowthProjection",
    value: string
  ) => {
    const parsed = Number(value);
    setMode2Filters({ [key]: value === "" ? undefined : Math.max(0, Math.min(100, parsed)) });
  };

  const reset = () => {
    setMode2Filters({
      sektor: [],
      minSkorPotensi: undefined,
      maxSkorPotensi: undefined,
      minMarketAccess: undefined,
      minGrowthProjection: undefined,
      provinsiIds: undefined,
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <p className="font-sans text-xs font-semibold uppercase text-talis-stone-700">Sektor</p>
        <div className="grid grid-cols-2 gap-1.5">
          {SECTORS.map((sector) => (
            <label
              key={sector}
              className="flex h-8 items-center gap-2 rounded-md border border-talis-stone-700/15 bg-white px-2 font-sans text-xs text-talis-stone-900"
            >
              <input
                type="checkbox"
                checked={filters.sektor.includes(sector)}
                onChange={() => toggleSector(sector)}
                className="h-3.5 w-3.5 accent-talis-green-700"
              />
              {SECTOR_LABEL[sector]}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="Skor min"
          value={filters.minSkorPotensi}
          onChange={(value) => setNumberFilter("minSkorPotensi", value)}
        />
        <NumberField
          label="Skor max"
          value={filters.maxSkorPotensi}
          onChange={(value) => setNumberFilter("maxSkorPotensi", value)}
        />
        <NumberField
          label="Market Access"
          value={filters.minMarketAccess}
          onChange={(value) => setNumberFilter("minMarketAccess", value)}
        />
        <NumberField
          label="Growth"
          value={filters.minGrowthProjection}
          onChange={(value) => setNumberFilter("minGrowthProjection", value)}
        />
      </div>

      <div className="space-y-1.5">
        <p className="font-sans text-xs font-semibold uppercase text-talis-stone-700">Region</p>
        <div className="max-h-[118px] space-y-1 overflow-y-auto rounded-md border border-talis-stone-700/15 bg-white p-2">
          {regions.map((region) => (
            <label
              key={region.provinsi_id}
              className="flex items-center gap-2 font-sans text-xs text-talis-stone-900"
            >
              <input
                type="checkbox"
                checked={(filters.provinsiIds ?? []).includes(region.provinsi_id)}
                onChange={() => toggleRegion(region.provinsi_id)}
                className="h-3.5 w-3.5 accent-talis-green-700"
              />
              {region.provinsi}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void runSearch()}
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

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange(value: string): void;
}) {
  return (
    <label className="space-y-1">
      <span className="font-sans text-xs text-talis-stone-700">{label}</span>
      <input
        type="number"
        min={0}
        max={100}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-talis-stone-700/15 bg-white px-2 font-mono text-sm text-talis-stone-900 outline-none focus:border-talis-green-700 focus:ring-2 focus:ring-talis-green-700/20"
      />
    </label>
  );
}

export default CriteriaSearchForm;
